"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Turnstile } from "@/components/turnstile";
import { submitTownContactForm, type TownContactFormData } from "@/server/actions/town-contact";

const INQUIRY_OPTIONS = [
	{ value: "general", label: "General Inquiry" },
	{ value: "sewer-residential", label: "Sewer Residential Service" },
	{ value: "sewer-nonresidential-intown", label: "Sewer In-Town Nonresidential Service" },
	{ value: "sewer-nonresidential-outtown", label: "Sewer Out-of-Town Nonresidential Service" },
	{ value: "permits", label: "Permits & Zoning" },
	{ value: "taxes", label: "Taxes & Billing" },
	{ value: "parks", label: "Parks & Recreation" },
	{ value: "roads", label: "Roads & Infrastructure" },
	{ value: "suggestion", label: "Suggestion" },
	{ value: "other", label: "Other" },
];

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

async function readFileAsBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			resolve(result.split(",")[1] ?? "");
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

interface FormErrors {
	firstName?: string;
	lastName?: string;
	email?: string;
	inquiryType?: string;
	message?: string;
	attachment?: string;
}

export const TownContactForm = () => {
	const [isPending, startTransition] = useTransition();
	const [submitted, setSubmitted] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [errors, setErrors] = useState<FormErrors>({});
	const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
	const turnstileTokenRef = useRef<string | null>(null);
	const loadedAtRef = useRef(Date.now().toString());
	const successRef = useRef<HTMLOutputElement | null>(null);

	useEffect(() => {
		if (submitted && successRef.current) {
			const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			successRef.current.scrollIntoView({
				behavior: prefersReducedMotion ? "auto" : "smooth",
				block: "nearest",
			});
			successRef.current.focus();
		}
	}, [submitted]);

	const validate = (form: FormData): FormErrors => {
		const errs: FormErrors = {};
		if (!form.get("firstName")) errs.firstName = "First name is required";
		if (!form.get("lastName")) errs.lastName = "Last name is required";
		const email = form.get("email") as string;
		if (!email) errs.email = "Email is required";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email";
		if (!form.get("inquiryType")) errs.inquiryType = "Please select an inquiry type";
		const message = form.get("message") as string;
		if (!message || message.length < 10) errs.message = "Message must be at least 10 characters";
		return errs;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const validationErrors = validate(form);

		const file = form.get("attachment") as File | null;
		const hasFile = file instanceof File && file.size > 0;
		if (hasFile) {
			if (!ALLOWED_FILE_TYPES.includes(file.type)) {
				validationErrors.attachment = "Only PDF, JPG, and PNG files are accepted.";
			} else if (file.size > MAX_FILE_SIZE) {
				validationErrors.attachment = "File must be 3 MB or smaller.";
			}
		}

		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setErrors({});
		setServerError(null);

		let attachment: TownContactFormData["attachment"] | undefined;
		if (hasFile) {
			try {
				const base64 = await readFileAsBase64(file);
				attachment = { filename: file.name, content: base64, contentType: file.type as "application/pdf" | "image/jpeg" | "image/png" };
			} catch {
				setServerError("Failed to read the attachment. Please try again.");
				return;
			}
		}


		startTransition(async () => {
			const result = await submitTownContactForm({
				firstName: form.get("firstName") as string,
				lastName: form.get("lastName") as string,
				email: form.get("email") as string,
				phone: (form.get("phone") as string) || undefined,
				inquiryType: form.get("inquiryType") as TownContactFormData["inquiryType"],
				message: form.get("message") as string,
				attachment,
				turnstileToken: turnstileTokenRef.current ?? undefined,
				website: (form.get("website") as string) || undefined,
				_loadedAt: loadedAtRef.current,
			});

			if (result.success) {
				setSubmitted(true);
			} else {
				setServerError(result.error ?? "Something went wrong.");
			}
		});
	};

	if (submitted) {
		return (
			<output
				ref={successRef}
				tabIndex={-1}
				className="block rounded-lg border-2 border-sage bg-sage/10 p-8 text-center shadow-sm outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2"
				aria-live="polite"
				aria-labelledby="town-contact-success-title"
			>
				<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sage text-white shadow-md">
					<svg
						aria-hidden="true"
						className="h-8 w-8"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
				</div>
				<h2 id="town-contact-success-title" className="mb-3 text-2xl font-semibold text-sage-dark">Message Sent</h2>
				<p className="mx-auto max-w-sm text-base text-[#2D2A24]">
					Thank you for contacting the Town of Harmony. We will respond within 2 business days.
				</p>
			</output>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			noValidate
			className="space-y-4 rounded-xl border border-[#DDD7CC] bg-warm-white p-6"
		>
			<h2 className="mb-2 text-xl font-semibold text-sage-dark">Send a Message</h2>

			<div aria-live="polite" aria-atomic="true">
				{serverError && (
					<p
						className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600"
						role="alert"
					>
						{serverError}
					</p>
				)}
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FieldWrapper label="First Name" id="firstName" error={errors.firstName} required>
					<input
						id="firstName"
						name="firstName"
						type="text"
						autoComplete="given-name"
						required
						aria-required="true"
						aria-invalid={!!errors.firstName}
						aria-describedby={errors.firstName ? "firstName-error" : undefined}
						className={inputClass(!!errors.firstName)}
					/>
				</FieldWrapper>

				<FieldWrapper label="Last Name" id="lastName" error={errors.lastName} required>
					<input
						id="lastName"
						name="lastName"
						type="text"
						autoComplete="family-name"
						required
						aria-required="true"
						aria-invalid={!!errors.lastName}
						aria-describedby={errors.lastName ? "lastName-error" : undefined}
						className={inputClass(!!errors.lastName)}
					/>
				</FieldWrapper>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<FieldWrapper label="Email" id="email" error={errors.email} required>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						aria-required="true"
						aria-invalid={!!errors.email}
						aria-describedby={errors.email ? "email-error" : undefined}
						className={inputClass(!!errors.email)}
					/>
				</FieldWrapper>

				<FieldWrapper label="Phone" id="phone" hint="Optional">
					<input
						id="phone"
						name="phone"
						type="tel"
						autoComplete="tel"
						className={inputClass(false)}
					/>
				</FieldWrapper>
			</div>

			<FieldWrapper label="Inquiry Type" id="inquiryType" error={errors.inquiryType} required>
				<select
					id="inquiryType"
					name="inquiryType"
					required
					aria-required="true"
					aria-invalid={!!errors.inquiryType}
					aria-describedby={errors.inquiryType ? "inquiryType-error" : undefined}
					defaultValue="general"
					className={inputClass(!!errors.inquiryType)}
				>
					<option value="" disabled>
						Select a topic…
					</option>
					{INQUIRY_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</FieldWrapper>

			<FieldWrapper label="Message" id="message" error={errors.message} required>
				<textarea
					id="message"
					name="message"
					rows={5}
					required
					aria-required="true"
					aria-invalid={!!errors.message}
					aria-describedby={errors.message ? "message-error" : undefined}
					className={inputClass(!!errors.message)}
				/>
			</FieldWrapper>

			<FieldWrapper
				label="Attachment"
				id="attachment"
				error={errors.attachment}
				hint="Optional — PDF, JPG, or PNG, max 3 MB"
			>
				<div>
					<input
						id="attachment"
						name="attachment"
						type="file"
						accept=".pdf,.jpg,.jpeg,.png"
						aria-describedby={errors.attachment ? "attachment-error" : undefined}
						className="sr-only"
						onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name ?? null)}
					/>
					<label
						htmlFor="attachment"
						className={`inline-block cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
							errors.attachment
								? "border-red-500 text-red-700 bg-red-50 hover:bg-red-100"
								: "border-[#DDD7CC] text-[#2D2A24] bg-white hover:bg-[#DDD7CC]/20"
						}`}
					>
						<svg
							aria-hidden="true"
							className="inline-block align-middle mr-2"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.42 16.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
						</svg>
						{selectedFileName ? "Change file" : "Choose file"}
					</label>
					{selectedFileName && (
						<span className="ml-3 text-sm text-[#635E56]">{selectedFileName}</span>
					)}
				</div>
			</FieldWrapper>

			{/* honeypot — hidden from real users, filled only by bots */}
			<div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
				<label htmlFor="website">Website</label>
				<input
					id="website"
					name="website"
					type="text"
					autoComplete="off"
					tabIndex={-1}
				/>
			</div>

			<Turnstile
				onVerify={(token) => {
					turnstileTokenRef.current = token;
				}}
				onExpire={() => {
					turnstileTokenRef.current = null;
				}}
			/>

			<button
				type="submit"
				disabled={isPending}
				className="w-full rounded-lg bg-sage-dark px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-sage-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-dark disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isPending ? "Sending…" : "Send Message"}
			</button>
		</form>
	);
};

const inputClass = (hasError: boolean) =>
	`w-full rounded-lg border ${hasError ? "border-red-400" : "border-[#DDD7CC]"} bg-white px-4 py-2.5 text-sm text-[#2D2A24] placeholder:text-[#635E56]/60 focus:outline-none focus:ring-1 focus:ring-sage focus:border-sage`;

const FieldWrapper = ({
	label,
	id,
	error,
	hint,
	required,
	children,
}: {
	label: string;
	id: string;
	error?: string;
	hint?: string;
	required?: boolean;
	children: React.ReactNode;
}) => (
	<div>
		<label htmlFor={id} className="mb-1 block text-sm font-medium text-[#2D2A24]">
			{label}
			{required && (
				<span className="ml-0.5 text-red-500" aria-hidden="true">
					*
				</span>
			)}
			{hint && <span className="ml-1 font-normal text-[#635E56]">({hint})</span>}
		</label>
		{children}
		{error && (
			<p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
				{error}
			</p>
		)}
	</div>
);
