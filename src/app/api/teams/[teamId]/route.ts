import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { teamService } from '@/lib/services/team';
import { updateTeamSchema } from '@/lib/validations/team';
import { ApiError } from '@/lib/types/errors/api.error';

// Get a specific team
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = context.params.teamId;
  const team = await teamService.getTeam(teamId);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  return {
    data: team,
    message: 'Team retrieved successfully',
  };
}, {
  protected: true,
});

// Update a team
export const PUT = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = context.params.teamId;
  const body = await request.json();
  
  // Validate the request body against the schema
  const result = updateTeamSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }
  
  // Update the team
  const team = await teamService.updateTeam(teamId, result.data, decoded.id);
  
  return {
    data: team,
    message: 'Team updated successfully',
  };
}, {
  protected: true,
});

// Delete a team
export const DELETE = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = context.params.teamId;
  
  // Delete the team
  await teamService.deleteTeam(teamId, decoded.id);
  
  return {
    data: null,
    message: 'Team deleted successfully',
  };
}, {
  protected: true,
});
