import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { teamService } from '@/lib/services/team';
import { createTeamSchema } from '@/lib/validations/team';
import { ApiError } from '@/lib/types/errors/api.error';

// Get all teams
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const teams = await teamService.getTeams({
    page,
    limit,
    sort: { createdAt: -1 },
  });

  return {
    data: teams.docs,
    pagination: teams,
    message: 'Teams retrieved successfully',
  };
}, {
  protected: true,
});

// Create a new team
export const POST = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const body = await request.json();

  // Validate the request body against the schema
  const result = createTeamSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  // Create the team
  const team = await teamService.createTeam(result.data, decoded.id);

  return {
    data: team,
    message: 'Team created successfully',
  };
}, {
  protected: true,
});
