import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { teamService } from '@/lib/services/team';
import { ApiError } from '@/lib/types/errors/api.error';

// Get user's teams
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const teams = await teamService.getUserTeams(decoded.id, {
    page,
    limit,
    sort: { createdAt: -1 },
  });

  return {
    data: teams,
    message: 'User teams retrieved successfully',
  };
}, {
  protected: true,
});
