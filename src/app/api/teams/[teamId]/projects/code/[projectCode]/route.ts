import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { ApiError } from '@/lib/types/errors/api.error';
import { teamService } from '@/lib/services/team';
import { projectService } from '@/lib/services/project';

// Get a project by code
export const GET = withApi(async (request: NextRequest, { params }: { params: Promise<{ teamId: string, projectCode: string }> }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { teamId, projectCode } = await params;

  // Check if user is a member of the team
  const { team, membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Get the project by code
  const project = await projectService.getProjectByCode(projectCode);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Verify the project belongs to the team
  if (project.team.toString() !== teamId) {
    throw new ApiError(403, 'Project does not belong to this team');
  }

  return {
    data: project,
    message: 'Project retrieved successfully',
  };
}, {
  protected: true,
});
