import { readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for LAC-4442 / LAC-3811 / LAC-3944.
 *
 * A `"use server"` directive at the top of a module publishes every export in
 * that module as a POST endpoint keyed by an action id. Nothing else gates it:
 * there is no `middleware.ts` in this repo, and a route group like `(admin)`
 * only gates the page that renders the button, never the action the button
 * posts to. So an export in one of these files with no session check is an
 * unauthenticated endpoint, no matter which folder it sits in.
 *
 * This class of hole shipped in three ShipKit forks before anyone caught it,
 * and the worst instance here was `configureSetup`, which created an admin
 * role and inserted a pre-verified admin user from caller-supplied input. A
 * sweep found it once; only a test keeps finding it. Hence this file.
 *
 * Two rules, both deliberately annoying to silence:
 *
 *   1. Every export of a `"use server"` module resolves the caller from the
 *      session, or is listed in `PUBLIC_BY_DESIGN` with a reason.
 *   2. No export of a `"use server"` module takes a caller identity (`userId`,
 *      `email`) as a parameter, unless listed in `IDENTITY_PARAM_ALLOWLIST`
 *      with a reason. A caller-supplied identity in a public endpoint is the
 *      confused deputy that made `verifyEmail(userId)` and
 *      `getAdminEmails(requestingEmail)` exploitable.
 *
 * Adding an entry to either list is the escape hatch. Write a real reason: the
 * next person reads it instead of re-deriving the threat model.
 */

const SRC = join(__dirname, "..", "..", "..", "..", "src");

/** Dead `"use server"` modules deleted in this fork; filled in per repo below. */
const DELETED_MODULES: string[] = [];

/** Service modules that must not carry a `"use server"` directive. */
const SERVICE_MODULES: string[] = [];

/**
 * Markers that prove the body resolves the caller server-side.
 *
 * This fork wraps Auth.js in `@/server/lib/auth`, so the marker list is wider
 * than the one in the ai-profile-pic copy of this test:
 *
 *   - `auth(` matches both `auth()` and `auth({ protect })`.
 *   - `getSession(` defaults to `protect = true` and throws "Unauthorized"
 *     when there is no user, so a bare call is itself the gate. Passing
 *     `false` opts out, which is why `getSession(false)` is rejected
 *     separately below rather than counted as a guard here.
 *   - `requireAdmin(` is `getSession()` plus an `isAdmin` check.
 */
const AUTH_MARKERS = [
	/\bauth\s*\(/,
	/\bgetSession\s*\(/,
	/\brequireAdmin\s*\(/,
	/\bgetServerSession\s*\(/,
	/\bisAdmin\s*\(/,
	/\bErrorService\.throwUnauthorized\s*\(/,
];

/** `getSession(false)` returns null instead of throwing, so it gates nothing. */
const UNPROTECTED_SESSION = /\bgetSession\s*\(\s*false\s*\)/;

/** Parameter names that carry a caller identity and must never be trusted from the wire. */
const IDENTITY_PARAM_NAMES = new Set(["userid", "useremail", "email", "requestingemail"]);

/**
 * Exports that are reachable without a session on purpose. Key is
 * `<repo-relative path>::<export name>`.
 */
const PUBLIC_BY_DESIGN: Record<string, string> = {
	// Authentication entry points. These are what you call to *get* a session,
	// so requiring one is circular. Credential handling and rate limiting live
	// in the auth service behind them.
	"src/server/actions/auth.ts::signInWithOAuthAction":
		"starts an OAuth redirect; no session exists yet",
	"src/server/actions/auth.ts::signInAction": "sign-in entry point; no session exists yet",
	"src/server/actions/auth.ts::signInWithCredentialsAction":
		"sign-in entry point; no session exists yet",
	"src/server/actions/auth.ts::signUpWithCredentialsAction":
		"sign-up entry point; no session exists yet",
	"src/server/actions/auth.ts::signOutAction":
		"clears the session cookie; safe with or without one",
	"src/server/actions/auth.ts::forgotPasswordAction":
		"password reset request; no session exists yet",
	"src/server/actions/auth.ts::resetPasswordAction":
		"password reset redemption; authorized by the emailed token",

	// Public forms on marketing pages. Anonymous visitors are the intended
	// callers. Each writes to one place and returns nothing readable, so the
	// exposure is spam volume, not data.
	"src/server/actions/contact.ts::submitContactForm":
		"public contact form; emails support and returns no data",
	"src/server/actions/feedback-actions.ts::submitFeedback":
		"public feedback widget; write-only into the feedback table",
	"src/server/actions/subscribe.ts::addContactToAudience":
		"public newsletter opt-in; write-only into the Resend audience",
};

/**
 * Exports allowed to take a caller identity as a parameter. Key is
 * `<repo-relative path>::<export name>::<param name>`.
 */
const IDENTITY_PARAM_ALLOWLIST: Record<string, string> = {
	"src/app/(app)/(admin)/admin/github/actions.ts::revokeGitHubAccessAction::userId":
		"admin acting on another user; the action checks isAdmin() on the session first",
	"src/server/actions/subscribe.ts::addContactToAudience::email":
		"the subscriber's own address is the payload of a public opt-in form, not an identity claim",
	"src/server/actions/contact.ts::submitContactForm::formData":
		"FormData from a public form; no identity is read out of it",
};

function walk(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			out.push(...walk(full));
		} else if (/\.tsx?$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)) {
			out.push(full);
		}
	}
	return out;
}

/**
 * True only when `"use server"` is the module's first statement, which is the
 * one position where Next.js treats it as a directive. An occurrence inside a
 * comment or a string further down does not publish anything, and must not be
 * read as if it did.
 */
function isServerActionModule(source: ts.SourceFile): boolean {
	const first = source.statements[0];
	if (!first || !ts.isExpressionStatement(first)) return false;
	const expr = first.expression;
	return ts.isStringLiteral(expr) && expr.text === "use server";
}

interface ActionExport {
	name: string;
	body: string;
	params: string[];
}

function collectExports(source: ts.SourceFile): ActionExport[] {
	const found: ActionExport[] = [];

	const paramNames = (params: readonly ts.ParameterDeclaration[]): string[] => {
		const names: string[] = [];
		for (const param of params) {
			if (ts.isIdentifier(param.name)) {
				names.push(param.name.text);
			} else if (ts.isObjectBindingPattern(param.name)) {
				for (const element of param.name.elements) {
					const key = element.propertyName ?? element.name;
					if (ts.isIdentifier(key)) names.push(key.text);
				}
			}
		}
		return names;
	};

	for (const statement of source.statements) {
		const exported = ts
			.getModifiers(statement as ts.HasModifiers)
			?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
		if (!exported) continue;

		if (ts.isFunctionDeclaration(statement) && statement.name) {
			found.push({
				name: statement.name.text,
				body: statement.getText(source),
				params: paramNames(statement.parameters),
			});
			continue;
		}

		if (ts.isVariableStatement(statement)) {
			for (const declaration of statement.declarationList.declarations) {
				if (!ts.isIdentifier(declaration.name)) continue;
				const initializer = declaration.initializer;
				const params =
					initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
						? paramNames(initializer.parameters)
						: [];
				found.push({
					name: declaration.name.text,
					body: declaration.getText(source),
					params,
				});
			}
		}
	}

	return found;
}

const serverActionModules = walk(SRC)
	.map((file) => {
		const text = readFileSync(file, "utf8");
		const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
		return {
			path: relative(join(__dirname, "..", "..", "..", ".."), file)
				.split(sep)
				.join("/"),
			source,
		};
	})
	.filter(({ source }) => isServerActionModule(source))
	.sort((a, b) => a.path.localeCompare(b.path));

describe("server action auth coverage", () => {
	it("finds the server action modules it is supposed to be guarding", () => {
		// A broken walk or a broken directive check would silently pass every
		// assertion below by finding nothing. Fail loudly instead.
		expect(serverActionModules.length).toBeGreaterThan(5);
	});

	it.each(serverActionModules.map(({ path }) => path))(
		"%s: every export resolves the caller from the session or is documented as public",
		(path) => {
			const entry = serverActionModules.find((candidate) => candidate.path === path);
			if (!entry) throw new Error(`lost module ${path}`);

			const offenders = collectExports(entry.source)
				.filter((actionExport) => !AUTH_MARKERS.some((marker) => marker.test(actionExport.body)))
				.filter((actionExport) => !PUBLIC_BY_DESIGN[`${path}::${actionExport.name}`])
				.map((actionExport) => actionExport.name);

			expect(
				offenders,
				`${path} exports ${offenders.join(", ")} as unauthenticated POST endpoint(s). Resolve the caller with auth(), or add the export to PUBLIC_BY_DESIGN with a reason.`
			).toEqual([]);
		}
	);

	it.each(serverActionModules.map(({ path }) => path))(
		"%s: no export takes a caller identity from the wire",
		(path) => {
			const entry = serverActionModules.find((candidate) => candidate.path === path);
			if (!entry) throw new Error(`lost module ${path}`);

			const offenders: string[] = [];
			for (const actionExport of collectExports(entry.source)) {
				for (const param of actionExport.params) {
					if (!IDENTITY_PARAM_NAMES.has(param.toLowerCase())) continue;
					if (IDENTITY_PARAM_ALLOWLIST[`${path}::${actionExport.name}::${param}`]) continue;
					offenders.push(`${actionExport.name}(${param})`);
				}
			}

			expect(
				offenders,
				`${path} takes a caller identity as a parameter in ${offenders.join(", ")}. Read the id off the session instead, or add it to IDENTITY_PARAM_ALLOWLIST with a reason.`
			).toEqual([]);
		}
	);
});

describe("unprotected session lookups", () => {
	it.each(serverActionModules.map(({ path }) => path))(
		"%s: no export gates itself on getSession(false)",
		(path) => {
			const entry = serverActionModules.find((candidate) => candidate.path === path);
			if (!entry) throw new Error(`lost module ${path}`);

			const offenders = collectExports(entry.source)
				.filter((actionExport) => UNPROTECTED_SESSION.test(actionExport.body))
				.map((actionExport) => actionExport.name);

			expect(
				offenders,
				`${path} calls getSession(false) in ${offenders.join(", ")}, which returns null instead of throwing. Call getSession() so the request is rejected.`
			).toEqual([]);
		}
	);
});

describe("deleted ShipKit action modules stay deleted", () => {
	// Each of these was an unauthenticated action module with no live caller in
	// this fork, so it was deleted rather than guarded: dead code cannot be
	// audited, and the upstream template keeps reintroducing it. Re-adding one,
	// rather than syncing the upstream fix, is how this class recurred across
	// three forks (LAC-3811, LAC-3944, LAC-4442).
	const deleted = DELETED_MODULES;

	it.each(deleted)("%s does not exist", (path) => {
		const present = serverActionModules.some((entry) => entry.path === path);
		expect(present, `${path} is back as a "use server" module`).toBe(false);
	});
});

describe("service modules are not server actions", () => {
	// A `"use server"` directive on a service module publishes every export in
	// it, including the plain data readers a service is made of. These two had
	// it, which put a full waitlist dump and arbitrary temporary-link creation
	// on the wire. Services are called from server code; they need no directive.
	const services = SERVICE_MODULES;

	it.each(services)("%s has no \"use server\" directive", (path) => {
		const present = serverActionModules.some((entry) => entry.path === path);
		expect(present, `${path} declares "use server" and publishes every export`).toBe(false);
	});
});

describe("admin configuration", () => {
	it("ships no default admin emails or domains", () => {
		// Hardcoded defaults meant an unset ADMIN_EMAIL/ADMIN_DOMAIN granted
		// standing admin on production to the template author, inherited by
		// every fork. Read the values, not the prose: the file explains the
		// old defaults by name, so a bare substring match on the whole text
		// reports its own documentation.
		const text = readFileSync(join(SRC, "config", "admin-config.ts"), "utf8");
		const code = text
			.replace(/\/\*[\s\S]*?\*\//g, "")
			.replace(/\/\/[^\n]*/g, "");
		expect(code).not.toMatch(/@gmail\.com/);
		expect(code).not.toMatch(/lacymorrow\.com/);
		expect(code).not.toMatch(/me@/);
	});

	it("compares the admin domain exactly, not by suffix", () => {
		// endsWith("@" + domain) accepted attacker@evil-lacymorrow.com.
		const text = readFileSync(join(SRC, "config", "admin-config.ts"), "utf8");
		expect(text).not.toMatch(/endsWith\s*\(/);
	});
});

describe("oauth account linking", () => {
	const authConfig = readFileSync(
		join(SRC, "server", "auth-js", "auth.config.ts"),
		"utf8"
	);

	it("gates account linking on a provider-verified email", () => {
		// This fork keeps allowDangerousEmailAccountLinking: true on purpose,
		// so one person with one email gets one account across providers. That
		// is only safe because the signIn callback refuses to attach a new
		// provider to an existing account unless the provider asserts it
		// verified the address. The flag is harmless; losing the gate is not,
		// so the gate is what this asserts.
		expect(authConfig).toMatch(/providerAssertsVerifiedEmail\s*\(/);
	});

	it("refuses the link when the provider has not verified the email", () => {
		expect(authConfig).toMatch(/!providerAssertsVerifiedEmail\s*\([\s\S]{0,400}?return false/);
	});
});
