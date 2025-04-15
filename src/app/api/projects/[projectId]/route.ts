import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { ApiError } from '@/lib/types/errors/api.error';
import { projectService } from '@/lib/services/project';
import { updateProjectSchema } from '@/lib/validations/project';
import { teamService } from '@/lib/services/team';
import { dbService } from '@/lib/db/service';
import { TeamRole } from '@/lib/types/models/team';

// Get a specific project
export const GET = withApi(async (request: NextRequest, { params }: { params: { projectId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const projectId = params.projectId;
  const project = await projectService.getProjectById(projectId);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Check if user has access to the team
  const { membership } = await teamService.getTeamWithMembership(project.team.toString(), decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  return {
    data: project,
    message: 'Project retrieved successfully',
  };
}, {
  protected: true,
});

// Update a project
export const PUT = withApi(async (request: NextRequest, { params }: { params: { projectId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const projectId = params.projectId;
  const body = await request.json();

  // Validate the request body against the schema
  const result = updateProjectSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  // Get the project
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Check if user is a member of the team with appropriate permissions
  const membership = await dbService.teamMember.findOne({
    team: project.team,
    user: decoded.id,
    role: { $in: [TeamRole.Owner, TeamRole.Manager] },
  });

  if (!membership) {
    throw new ApiError(403, 'You do not have permission to update this project');
  }

  // Update the project
  const updatedProject = await projectService.updateProject(projectId, result.data);

  return {
    data: updatedProject,
    message: 'Project updated successfully',
  };
}, {
  protected: true,
});

// Delete a project
export const DELETE = withApi(async (request: NextRequest, { params }: { params: { projectId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const projectId = params.projectId;

  // Get the project
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Check if user is a member of the team with appropriate permissions
  const membership = await dbService.teamMember.findOne({
    team: project.team,
    user: decoded.id,
    role: { $in: [TeamRole.Owner, TeamRole.Manager] },
  });

  if (!membership) {
    throw new ApiError(403, 'You do not have permission to delete this project');
  }

  // Check if there are any tasks associated with this project
  const tasksCount = await dbService.task.count({ project: projectId });
  if (tasksCount > 0) {
    throw new ApiError(400, `Cannot delete project with ${tasksCount} associated tasks. Please delete or reassign the tasks first.`);
  }

  // Delete the project
  await projectService.deleteProject(projectId);

  return {
    data: null,
    message: 'Project deleted successfully',
  };
}, {
  protected: true,
});
