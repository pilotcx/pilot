import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { teamService } from '@/lib/services/team';
import { addTeamMemberSchema } from '@/lib/validations/team';
import { ApiError } from '@/lib/types/errors/api.error';

// Get team members
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = context.params.teamId;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const members = await teamService.getTeamMembers(teamId, {
    page,
    limit,
    sort: { createdAt: -1 },
  });

  return {
    data: members.docs,
    pagination: members,
    message: 'Team members retrieved successfully',
  };
}, {
  protected: true,
});

// Add a team member
export const POST = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = context.params.teamId;
  const body = await request.json();

  // Validate the request body against the schema
  const result = addTeamMemberSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  // Add the team member
  const member = await teamService.addTeamMember(teamId, result.data, decoded.id);

  return {
    data: member,
    message: 'Team member added successfully',
  };
}, {
  protected: true,
});
