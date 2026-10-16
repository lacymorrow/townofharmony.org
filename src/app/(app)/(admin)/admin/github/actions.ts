"use server";

import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { requireAdmin } from "@/server/lib/auth";
import {
  grantGitHubAccess,
  pendingCollaboratorEmail,
  revokeGitHubAccess,
} from "@/server/services/github/github-service";

/*
 * SECURITY (LAC-3944): both exports below had no authorization check at all.
 *
 * Sitting in the `(admin)` route group is not a gate. That group's layout
 * guards the rendering of `page.tsx`; a `"use server"` export is a POST
 * endpoint addressed by action id, and the layout never runs for it. So
 * `addCollaboratorAction` let any anonymous caller spend the server's
 * `GITHUB_ACCESS_TOKEN` to add themselves as a collaborator on the
 * repository, and `revokeGitHubAccessAction` let them strip anyone else's
 * access. `requireAdmin()` throws unless the session belongs to an admin.
 */

export async function revokeGitHubAccessAction(userId: string) {
  try {
    await requireAdmin();
    await revokeGitHubAccess(userId);
    return { success: true };
  } catch (error) {
    console.error("Failed to revoke GitHub access:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function addCollaboratorAction(githubUsername: string) {
  try {
    await requireAdmin();

    if (!githubUsername?.trim()) {
      return { success: false, error: "GitHub username is required" };
    }
    const trimmed = githubUsername.trim();
    await grantGitHubAccess({ githubUsername: trimmed });

    // Insert a stub user so the invite can be revoked before acceptance
    await db
      ?.insert(users)
      .values({
        email: pendingCollaboratorEmail(trimmed),
        name: trimmed,
        githubUsername: trimmed,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { githubUsername: trimmed, updatedAt: new Date() },
      });

    return { success: true };
  } catch (error) {
    console.error("Failed to add collaborator:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    const isBadCredentials =
      message.toLowerCase().includes("bad credentials") || message.includes("401");
    return {
      success: false,
      error: isBadCredentials
        ? "Bad credentials — check that GITHUB_ACCESS_TOKEN is set and has the 'repo' scope."
        : message,
    };
  }
}
