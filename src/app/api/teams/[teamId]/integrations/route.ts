import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { ApiError } from '@/lib/types/errors/api.error';
import { teamService } from '@/lib/services/team';
import { dbService } from '@/lib/db/service';

// Get all integrations for a team
export const GET = withApi(async (request: NextRequest, { params: _params }: { params: Promise<{ teamId: string }> }, decoded) => {
  const params = await _params;
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = params.teamId;

  // Check if user is a member of the team
  const { membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Get all integrations for the team
  const integrations = await dbService.integration.find({ team: teamId });

  return {
    data: integrations,
    message: 'Team integrations retrieved successfully',
  };
}, {
  protected: true,
});
