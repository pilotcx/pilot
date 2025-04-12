import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { teamService } from '@/lib/services/team';
import { updateTeamMemberSchema } from '@/lib/validations/team';
import { ApiError } from '@/lib/types/errors/api.error';

// Update a team member
export const PUT = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = context.params.teamId;
  const memberId = context.params.memberId;
  const body = await request.json();
  
  // Validate the request body against the schema
  const result = updateTeamMemberSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }
  
  // Update the team member
  const member = await teamService.updateTeamMember(teamId, memberId, result.data, decoded.id);
  
  return {
    data: member,
    message: 'Team member updated successfully',
  };
}, {
  protected: true,
});

// Remove a team member
export const DELETE = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = context.params.teamId;
  const memberId = context.params.memberId;
  
  // Remove the team member
  await teamService.removeTeamMember(teamId, memberId, decoded.id);
  
  return {
    data: null,
    message: 'Team member removed successfully',
  };
}, {
  protected: true,
});
