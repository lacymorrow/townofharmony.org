"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/server/lib/auth";
import { projectService } from "@/server/services/project-service";
import { teamService } from "@/server/services/team-service";

/**
 * Every export below is a POST endpoint that anyone on the internet can call
 * by action id. None of them checked a session, and the mutating ones took the
 * acting user's id as an argument, so the caller both authenticated and
 * authorized themselves. See LAC-3944.
 *
 * The caller is resolved from the session here and never read off the wire. A
 * `memberUserId` argument still appears where the action acts on *another*
 * member, but it is only reachable after the caller proves membership of the
 * project or team being changed.
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

/** Membership of the project is the authorization check for changing it. */
const requireProjectMember = async (projectId: string): Promise<string> => {
	const callerId = await requireCallerId();
	if (!(await projectService.userHasAccessToProject(callerId, projectId))) {
		throw new Error("Unauthorized: not a member of this project");
	}
	return callerId;
};

/** Membership of the team is what lets the caller create a project inside it. */
const requireTeamMember = async (teamId: string): Promise<string> => {
	const callerId = await requireCallerId();
	const members = await teamService.getTeamMembers(teamId);
	if (!members?.some((member) => member.userId === callerId)) {
		throw new Error("Unauthorized: not a member of this team");
	}
	return callerId;
};

/**
 * Creates a new project and adds the current user as the owner.
 * @returns The created project with its members
 */
export async function createProject(name: string, teamId: string) {
	const callerId = await requireTeamMember(teamId);
	const project = await projectService.createProject(teamId, name, callerId);
	revalidatePath("/");
	return project;
}

/**
 * Updates a project's information.
 * @returns The updated project with its members
 */
export async function updateProject(projectId: string, name: string) {
	await requireProjectMember(projectId);
	const project = await projectService.updateProject(projectId, name);
	revalidatePath("/");
	return project;
}

/**
 * Deletes a project and all associated data.
 * @returns True if deleted successfully
 */
export async function deleteProject(projectId: string) {
	await requireProjectMember(projectId);
	const success = await projectService.deleteProject(projectId);
	revalidatePath("/");
	return success;
}

/**
 * Adds a member to a project.
 * @returns The created project member
 */
export async function addProjectMember(projectId: string, memberUserId: string, role: string) {
	await requireProjectMember(projectId);
	const member = await projectService.addProjectMember(projectId, memberUserId, role);
	revalidatePath("/");
	return member;
}

/**
 * Removes a member from a project.
 * @returns True if removed successfully
 */
export async function removeProjectMember(projectId: string, memberUserId: string) {
	await requireProjectMember(projectId);
	const success = await projectService.removeProjectMember(projectId, memberUserId);
	revalidatePath("/");
	return success;
}

/**
 * Updates a project member's role.
 * @returns The updated project member
 */
export async function updateProjectMemberRole(
	projectId: string,
	memberUserId: string,
	role: string
) {
	await requireProjectMember(projectId);
	const member = await projectService.updateProjectMemberRole(projectId, memberUserId, role);
	revalidatePath("/");
	return member;
}
