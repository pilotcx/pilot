import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { ApiError } from '@/lib/types/errors/api.error';
import { teamService } from '@/lib/services/team';
import { projectService } from '@/lib/services/project';

// Get projects for a team member
export const GET = withApi(async (request: NextRequest, { params }: { params: Promise<{ teamId: string, memberId: string }> }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { teamId, memberId } = await params;

  // Check if user is a member of the team
  const { team, membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Get joined projects for the member
  const projects = await projectService.getJoinedProjects(memberId);

  return {
    data: projects,
    message: 'Member projects retrieved successfully',
  };
}, {
  protected: true,
}); 