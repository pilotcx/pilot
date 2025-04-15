import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { ApiError } from '@/lib/types/errors/api.error';
import { teamService } from '@/lib/services/team';
import { teamRequestService } from '@/lib/services/team-request';
import { createTeamRequestCommentSchema } from '@/lib/types/models/team-request';

// Get comments for a team request
export const GET = withApi(async (request: NextRequest, { params }: { params: Promise<{ teamId: string, requestId: string }> }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { teamId, requestId } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Check if user has access to the team
  const { membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Get the team request
  const teamRequest = await teamRequestService.getTeamRequestById(requestId);
  if (!teamRequest) {
    throw new ApiError(404, 'Team request not found');
  }

  // Check if the request belongs to the team
  if (teamRequest.team.toString() !== teamId) {
    throw new ApiError(404, 'Team request not found in this team');
  }

  // Get comments for the team request - only if user is a reviewer or the requester
  const comments = await teamRequestService.getComments(
    requestId,
    membership._id.toString(),
    {
      page,
      limit,
      sort: { createdAt: 1 }, // Sort by creation date ascending (oldest first)
    }
  );

  return {
    data: comments.docs,
    pagination: comments,
    message: 'Team request comments retrieved successfully',
  };
}, {
  protected: true,
});

// Add a comment to a team request
export const POST = withApi(async (request: NextRequest, { params }: { params: Promise<{ teamId: string, requestId: string }> }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { teamId, requestId } = await params;
  const body = await request.json();

  // Validate the request body against the schema
  const result = createTeamRequestCommentSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  // Check if user has access to the team
  const { membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Get the team request
  const teamRequest = await teamRequestService.getTeamRequestById(requestId);
  if (!teamRequest) {
    throw new ApiError(404, 'Team request not found');
  }

  // Check if the request belongs to the team
  if (teamRequest.team.toString() !== teamId) {
    throw new ApiError(404, 'Team request not found in this team');
  }

  // Add the comment
  const comment = await teamRequestService.addComment(
    requestId,
    result.data.content,
    membership._id.toString()
  );

  return {
    data: comment,
    message: 'Comment added successfully',
  };
}, {
  protected: true,
});
