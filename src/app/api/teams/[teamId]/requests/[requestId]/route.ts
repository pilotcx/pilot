import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {ApiError} from '@/lib/types/errors/api.error';
import {teamService} from '@/lib/services/team';
import {teamRequestService} from '@/lib/services/team-request';
import {updateTeamRequestSchema} from '@/lib/types/models/team-request';
import {TeamMember} from "@/lib/types/models/team";


export const GET = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ teamId: string, requestId: string }>
}, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const {teamId, requestId} = await params;


  const {membership} = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }


  const teamRequest = await teamRequestService.getTeamRequestById(requestId);
  if (!teamRequest) {
    throw new ApiError(404, 'Team request not found');
  }

  // Check if the request belongs to the team
  if (teamRequest.team.toString() !== teamId) {
    throw new ApiError(404, 'Team request not found in this team');
  }

  // Check if the user can access this request (is a reviewer or the requester)
  const canAccess = await teamRequestService.canAccessRequest(requestId, membership._id.toString());
  if (!canAccess) {
    throw new ApiError(403, 'You do not have permission to view this request');
  }

  return {
    data: teamRequest,
    message: 'Team request retrieved successfully',
  };
}, {
  protected: true,
});

// Update a team request
export const PUT = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ teamId: string, requestId: string }>
}, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const {teamId, requestId} = await params;
  const body = await request.json();

  // Validate the request body against the schema
  const result = updateTeamRequestSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  // Check if user has access to the team
  const {membership} = await teamService.getTeamWithMembership(teamId, decoded.id);
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

  // Check if the user can access this request (is a reviewer or the requester)
  const canAccess = await teamRequestService.canAccessRequest(requestId, membership._id.toString());
  if (!canAccess) {
    throw new ApiError(403, 'You do not have permission to update this request');
  }

  // Only reviewers can update the status
  const isReviewer = membership.role === 'owner' || membership.role === 'manager';
  if (!isReviewer) {
    throw new ApiError(403, 'Only reviewers (owners or managers) can update request status');
  }

  // Update the team request
  const updatedRequest = await teamRequestService.updateTeamRequest(
    requestId,
    result.data,
    decoded.id
  );

  return {
    data: await updatedRequest!.populate(['requester', 'responder']),
    message: 'Team request updated successfully',
  };
}, {
  protected: true,
});

// Delete a team request
export const DELETE = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ teamId: string, requestId: string }>
}, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const {teamId, requestId} = await params;

  // Check if user has access to the team
  const {membership} = await teamService.getTeamWithMembership(teamId, decoded.id);
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

  // Check if the user can access this request (is a reviewer or the requester)
  const canAccess = await teamRequestService.canAccessRequest(requestId, membership._id.toString());
  if (!canAccess) {
    throw new ApiError(403, 'You do not have permission to delete this request');
  }

  // Only reviewers or the requester can delete the request
  const isReviewer = membership.role === 'owner' || membership.role === 'manager';
  const isRequester = (teamRequest.requester as TeamMember)._id!.toString() === membership._id.toString();
  if (!isReviewer && !isRequester) {
    throw new ApiError(403, 'Only reviewers (owners or managers) or the requester can delete this request');
  }

  // Delete the team request
  const result = await teamRequestService.deleteTeamRequest(requestId, decoded.id);

  return {
    data: result,
    message: 'Team request deleted successfully',
  };
}, {
  protected: true,
});
