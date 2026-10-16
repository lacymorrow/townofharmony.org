"use server";

/**
 * @fileoverview Server actions for team operations (mutations only)
 * NOTE: For read operations, use teamService directly:
 * import { teamService } from "@/server/services/team-service"
 */

import { revalidatePath, revalidateTag } from "next/cache";
import { getSession } from "@/server/lib/auth";
import {
  auditAction,
  recordAudit,
  resolveSessionActor,
  userActor,
} from "@/server/services/audit-service";
import { cacheService } from "@/server/services/cache-service";
import { ErrorService } from "@/server/services/error-service";
import { metrics, metricsService } from "@/server/services/metrics-service";
import { rateLimitService, rateLimits } from "@/server/services/rate-limit-service";
import { teamService } from "@/server/services/team-service";
import { ValidationService } from "@/server/services/validation-service";
import { createTeamSchema, teamIdSchema, teamMemberSchema, updateTeamSchema } from "./schemas";

/**
 * Every export below is a POST endpoint reachable by action id. They had rate
 * limiting, schema validation and audit logging but no authentication, and
 * `createTeam` took the owner's id as its first argument, so the caller named
 * themselves. The rate limit keyed on `teamId`, which an attacker simply
 * rotates, and the audit trail recorded the actor the request claimed to be.
 * See LAC-3944.
 *
 * The caller now comes from the session, and every team-scoped action requires
 * the caller to be a member of the team it mutates.
 */

/** The caller's own id, or throw. `getSession()` rejects anonymous requests. */
const requireCallerId = async (): Promise<string> => {
  const session = await getSession();
  const callerId = session?.user?.id;
  if (!callerId) {
    throw new Error("Unauthorized");
  }
  return callerId;
};

/** Membership of the team is the authorization check for changing it. */
const requireTeamMember = async (teamId: string): Promise<string> => {
  const callerId = await requireCallerId();
  const members = await teamService.getTeamMembers(teamId);
  if (!members?.some((member) => member.userId === callerId)) {
    throw new Error("Unauthorized: not a member of this team");
  }
  return callerId;
};

/**
 * Creates a new team and assigns the user as the owner.
 * @returns The created team with its members
 */
export async function createTeam(name: string) {
  try {
    // The owner is whoever is signed in, not whoever the request claims.
    const userId = await requireCallerId();

    // Rate limiting
    await rateLimitService.checkLimit(userId, "createTeam", rateLimits.web.forms);

    // Validation
    await ValidationService.validateOrThrow(createTeamSchema, { userId, name });

    // Metrics start
    const startTime = Date.now();

    // Create team
    const team = await teamService.createTeam(userId, name);
    if (!team) {
      throw new Error("Failed to create team");
    }

    recordAudit(auditAction.teamCreate({ actor: userActor(userId), target: { id: team.id } }));

    // Metrics end
    await metricsService.recordTiming(metrics.api.latency, startTime);
    await metricsService.incrementCounter(metrics.api.requests);

    // Invalidate cache
    await cacheService.delete(`team:${team.id}`);
    await cacheService.delete(`user:${userId}:teams`);

    // Revalidate Next.js cache using tags
    revalidateTag(`user-teams-${userId}`, "max");
    revalidateTag("teams", "max");
    revalidatePath("/");

    return team;
  } catch (error) {
    await metricsService.incrementCounter(metrics.api.errors);
    throw ErrorService.handleError(error);
  }
}

/**
 * Updates a team's information.
 * @returns The updated team with its details
 */
export async function updateTeam(teamId: string, data: { name?: string }) {
  try {
    await requireTeamMember(teamId);

    // Rate limiting
    await rateLimitService.checkLimit(teamId, "updateTeam", rateLimits.web.forms);

    // Validation
    await ValidationService.validateOrThrow(updateTeamSchema, { teamId, ...data });

    // Metrics start
    const startTime = Date.now();

    // Update team
    const team = await teamService.updateTeam(teamId, data);

    recordAudit(
      auditAction.teamUpdate({
        actor: await resolveSessionActor(),
        target: { id: teamId },
        changes:
          data.name === undefined
            ? undefined
            : { patch: [{ op: "replace", path: "/name", value: data.name }] },
      })
    );

    // Metrics end
    await metricsService.recordTiming(metrics.api.latency, startTime);
    await metricsService.incrementCounter(metrics.api.requests);

    // Invalidate cache
    await cacheService.delete(`team:${teamId}`);

    // Revalidate Next.js cache using tags
    revalidateTag("teams", "max");
    // Revalidate for all users who are members of this team
    const teamMembers = await teamService.getTeamMembers(teamId);
    for (const member of teamMembers || []) {
      revalidateTag(`user-teams-${member.userId}`, "max");
    }
    revalidatePath("/");

    return team;
  } catch (error) {
    await metricsService.incrementCounter(metrics.api.errors);
    throw ErrorService.handleError(error);
  }
}

/**
 * Deletes a team and all associated data.
 * @returns True if deleted successfully
 */
export async function deleteTeam(teamId: string) {
  try {
    await requireTeamMember(teamId);

    // Rate limiting
    await rateLimitService.checkLimit(teamId, "deleteTeam", rateLimits.web.forms);

    // Validation
    await ValidationService.validateOrThrow(teamIdSchema, { teamId });

    // Get team members before deletion for cache invalidation
    const teamMembers = await teamService.getTeamMembers(teamId);

    // Metrics start
    const startTime = Date.now();

    // Delete team
    const success = await teamService.deleteTeam(teamId);

    if (success) {
      recordAudit(
        auditAction.teamDelete({ actor: await resolveSessionActor(), target: { id: teamId } })
      );
    }

    // Metrics end
    await metricsService.recordTiming(metrics.api.latency, startTime);
    await metricsService.incrementCounter(metrics.api.requests);

    // Invalidate cache
    await cacheService.delete(`team:${teamId}`);

    // Revalidate Next.js cache using tags
    revalidateTag("teams", "max");
    // Revalidate for all users who were members of this team
    for (const member of teamMembers || []) {
      revalidateTag(`user-teams-${member.userId}`, "max");
    }
    revalidatePath("/");

    return success;
  } catch (error) {
    await metricsService.incrementCounter(metrics.api.errors);
    throw ErrorService.handleError(error);
  }
}

/**
 * Adds a member to a team.
 * @returns The created team member
 */
export async function addTeamMember(teamId: string, memberUserId: string, role: string) {
  try {
    await requireTeamMember(teamId);

    // Rate limiting
    await rateLimitService.checkLimit(teamId, "addTeamMember", rateLimits.web.forms);

    // Validation
    await ValidationService.validateOrThrow(teamMemberSchema, {
      teamId,
      userId: memberUserId,
      role,
    });

    // Metrics start
    const startTime = Date.now();

    // Add member
    const member = await teamService.addTeamMember(teamId, memberUserId, role);

    recordAudit(
      auditAction.teamMemberAdd({
        actor: await resolveSessionActor(),
        target: { id: teamId },
        changes: { patch: [{ op: "add", path: `/members/${memberUserId}`, value: { role } }] },
      })
    );

    // Metrics end
    await metricsService.recordTiming(metrics.api.latency, startTime);
    await metricsService.incrementCounter(metrics.api.requests);

    // Invalidate cache
    await cacheService.delete(`team:${teamId}:members`);
    await cacheService.delete(`user:${memberUserId}:teams`);

    revalidatePath("/");
    return member;
  } catch (error) {
    await metricsService.incrementCounter(metrics.api.errors);
    throw ErrorService.handleError(error);
  }
}

/**
 * Removes a member from a team.
 * @returns True if removed successfully
 */
export async function removeTeamMember(teamId: string, memberUserId: string) {
  try {
    await requireTeamMember(teamId);

    // Rate limiting
    await rateLimitService.checkLimit(teamId, "removeTeamMember", rateLimits.web.forms);

    // Validation
    await ValidationService.validateOrThrow(teamMemberSchema, {
      teamId,
      userId: memberUserId,
      role: "member", // Role is required by schema but not needed for removal
    });

    // Metrics start
    const startTime = Date.now();

    // Remove member
    const success = await teamService.removeTeamMember(teamId, memberUserId);

    if (success) {
      recordAudit(
        auditAction.teamMemberRemove({
          actor: await resolveSessionActor(),
          target: { id: teamId },
          changes: { patch: [{ op: "remove", path: `/members/${memberUserId}` }] },
        })
      );
    }

    // Metrics end
    await metricsService.recordTiming(metrics.api.latency, startTime);
    await metricsService.incrementCounter(metrics.api.requests);

    // Invalidate cache
    await cacheService.delete(`team:${teamId}:members`);
    await cacheService.delete(`user:${memberUserId}:teams`);

    // Revalidate Next.js cache using tags
    revalidateTag(`user-teams-${memberUserId}`, "max");
    revalidateTag("teams", "max");
    revalidatePath("/");

    return success;
  } catch (error) {
    await metricsService.incrementCounter(metrics.api.errors);
    throw ErrorService.handleError(error);
  }
}

/**
 * Updates a team member's role.
 * @returns The updated team member
 */
export async function updateTeamMemberRole(teamId: string, memberUserId: string, role: string) {
  try {
    await requireTeamMember(teamId);

    // Rate limiting
    await rateLimitService.checkLimit(teamId, "updateTeamMemberRole", rateLimits.web.forms);

    // Validation
    await ValidationService.validateOrThrow(teamMemberSchema, {
      teamId,
      userId: memberUserId,
      role,
    });

    // Metrics start
    const startTime = Date.now();

    // Update member role
    const member = await teamService.updateTeamMemberRole(teamId, memberUserId, role);

    recordAudit(
      auditAction.teamMemberRoleUpdate({
        actor: await resolveSessionActor(),
        target: { id: teamId },
        changes: { patch: [{ op: "replace", path: `/members/${memberUserId}/role`, value: role }] },
      })
    );

    // Metrics end
    await metricsService.recordTiming(metrics.api.latency, startTime);
    await metricsService.incrementCounter(metrics.api.requests);

    // Invalidate cache
    await cacheService.delete(`team:${teamId}:members`);

    revalidatePath("/");
    return member;
  } catch (error) {
    await metricsService.incrementCounter(metrics.api.errors);
    throw ErrorService.handleError(error);
  }
}
