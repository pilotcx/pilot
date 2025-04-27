import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {teamService} from '@/lib/services/team';
import {createTeamSchema} from '@/lib/validations/team';
import {ApiError} from '@/lib/types/errors/api.error';
import {TeamRole} from "@/lib/types/models/team";

// Get all teams
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const {searchParams} = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const teams = await teamService.getJoinedTeamMemberships(decoded.id, {
    page,
    limit,
    sort: {createdAt: -1},
  });

  return {
    data: teams.docs.map(doc => doc.team),
    pagination: teams,
    message: 'Teams retrieved successfully',
  };
}, {
  protected: true,
});

export const POST = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const body = await request.json();

  const result = createTeamSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  const team = await teamService.createTeam(result.data);
  await teamService.addTeamMember(team._id.toString(), decoded.id, TeamRole.Owner);

  return {
    data: team,
    message: 'Team created successfully',
  };
}, {
  protected: true,
});
