import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {ApiError} from '@/lib/types/errors/api.error';
import {teamService} from '@/lib/services/team';
import {teamRequestService} from '@/lib/services/team-request';
import {createTeamRequestSchema, TeamRequestStatus} from '@/lib/types/models/team-request';


export const GET = withApi(async (request: NextRequest, {params}: { params: Promise<{ teamId: string }> }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const {teamId} = await params;
  const {searchParams} = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status') as TeamRequestStatus;
  const requesterId = searchParams.get('requesterId');


  const {membership} = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  const requests = await teamRequestService.getTeamRequests(
    membership._id.toString(),
    status,
    {
      page,
      limit,
      sort: {createdAt: -1},
      populate: ['requester', 'responder', 'reviewer'],
      ...(status && {status}),
      ...(requesterId && {requester: requesterId}),
    }
  );

  return {
    data: requests.docs,
    pagination: requests,
    message: 'Team requests retrieved successfully',
  };
}, {
  protected: true,
});


export const POST = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ teamId: string }>
}, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const {teamId} = await params;
  const body = await request.json();


  const result = createTeamRequestSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }


  const {membership} = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }


  const teamRequest = await teamRequestService.createTeamRequest(
    teamId,
    result.data,
    membership._id.toString()
  );

  return {
    data: await teamRequest.populate('requester reviewer'),
    message: 'Team request created successfully',
  };
}, {
  protected: true,
});
