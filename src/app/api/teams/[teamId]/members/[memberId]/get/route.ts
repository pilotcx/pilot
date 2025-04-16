import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { ApiError } from '@/lib/types/errors/api.error';
import { teamService } from '@/lib/services/team';
import { dbService } from '@/lib/db/service';

// Get a specific team member
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const params = await context.params;
  const teamId = params.teamId;
  const memberId = params.memberId;

  // Check if user has access to the team
  const { membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Get the team member
  await dbService.connect();
  const member = await dbService.teamMember.findById(memberId).populate('user');
  
  if (!member) {
    throw new ApiError(404, 'Team member not found');
  }
  
  // Check if the member belongs to the team
  if (member.team.toString() !== teamId) {
    throw new ApiError(404, 'Team member not found in this team');
  }

  return {
    data: member,
    message: 'Team member retrieved successfully',
  };
}, {
  protected: true,
});
