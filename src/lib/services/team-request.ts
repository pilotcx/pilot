import {dbService} from '@/lib/db/service';
import {ApiError} from '@/lib/types/errors/api.error';
import {PaginateOptions} from 'mongoose';
import {CreateTeamRequestInput, TeamRequestStatus, UpdateTeamRequestInput} from '@/lib/types/models/team-request';
import {TeamMember, TeamRole} from '@/lib/types/models/team';
import {UserRole} from '@/lib/types/models/user';

class TeamRequestService {

  async getTeamRequests(teamMemberId: string, status: TeamRequestStatus, pagination: PaginateOptions) {
    const teamMember = await dbService.teamMember.findById(teamMemberId);
    if (!teamMember) {
      throw new ApiError(404, 'Team member not found');
    }

    return dbService.teamRequest.paginate({
      $or: [{
        requester: teamMemberId,
      }, {
        reviewer: teamMemberId,
      }],
      status,
    }, pagination);
  }


  getTeamRequestById(requestId: string) {
    return dbService.teamRequest.findById(requestId).populate(['requester', 'responder', 'reviewer']);
  }


  async canAccessRequest(requestId: string, teamMemberId: string) {
    const request = await this.getTeamRequestById(requestId);
    if (!request) {
      return false;
    }

    const teamMember = await dbService.teamMember.findById(teamMemberId);
    if (!teamMember) {
      return false;
    }

    const sourceId = (request.requester as TeamMember)._id!.toString();
    const isReviewer = teamMember.role === TeamRole.Owner || teamMember.role === TeamRole.Manager;
    const isRequester = sourceId.toString() === teamMemberId;
    const isAssignedReviewer = request.reviewer && (request.reviewer as TeamMember)._id && (request.reviewer as TeamMember)._id!.toString() === teamMemberId;

    return isReviewer || isRequester || isAssignedReviewer;
  }


  getTeamRequestsByRequester(teamId: string, requesterId: string, pagination: PaginateOptions) {
    return dbService.teamRequest.paginate(
      {team: teamId, requester: requesterId},
      pagination
    );
  }


  async createTeamRequest(teamId: string, data: CreateTeamRequestInput, teamMemberId: string) {
    const team = await dbService.team.findById(teamId);
    if (!team) {
      throw new ApiError(404, 'Team not found');
    }

    const teamMember = await dbService.teamMember.findById(teamMemberId);
    if (!teamMember) {
      throw new ApiError(404, 'Team member not found');
    }

    if (data.reviewer) {
      const reviewer = await dbService.teamMember.findById(data.reviewer);
      if (!reviewer) {
        throw new ApiError(404, 'Reviewer not found');
      }

      if (reviewer.team.toString() !== teamId) {
        throw new ApiError(400, 'Reviewer must be from the same team');
      }

      if (reviewer.role !== TeamRole.Manager && reviewer.role !== TeamRole.Owner) {
        throw new ApiError(400, 'Reviewer must be a manager or owner');
      }
    }
    return await dbService.teamRequest.create({
      team: teamId,
      title: data.title,
      description: data.description,
      requester: teamMemberId,
      reviewer: data.reviewer,
      status: TeamRequestStatus.PENDING,
      commentCount: 0,
    });
  }


  async updateTeamRequest(requestId: string, data: UpdateTeamRequestInput, userId: string) {
    const request = await dbService.teamRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Team request not found');
    }

    const team = await dbService.team.findById(request.team as string);
    if (!team) {
      throw new ApiError(404, 'Team not found');
    }

    const user = await dbService.user.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const teamMember = await dbService.teamMember.findOne({
      team: request.team,
      user: userId,
    });
    if (!teamMember) {
      throw new ApiError(403, 'You are not a member of this team');
    }

    // Check if user is an admin, owner, or manager of the team
    const isAdmin = user.role === UserRole.Admin;
    const isOwnerOrManager = teamMember.role === TeamRole.Owner || teamMember.role === TeamRole.Manager;

    if (!isAdmin && !isOwnerOrManager) {
      throw new ApiError(403, 'Only admins, team owners, or managers can update a team request');
    }


    const updatedRequest = await dbService.teamRequest.findOneAndUpdate(
      {_id: requestId},
      {
        status: data.status,
        responseNote: data.responseNote,
        responder: teamMember._id,
      },
      {new: true}
    );

    return updatedRequest;
  }


  async deleteTeamRequest(requestId: string, userId: string) {
    const request = await dbService.teamRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Team request not found');
    }

    const team = await dbService.team.findById(request.team as string);
    if (!team) {
      throw new ApiError(404, 'Team not found');
    }

    const user = await dbService.user.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const teamMember = await dbService.teamMember.findOne({
      team: request.team,
      user: userId,
    });
    if (!teamMember) {
      throw new ApiError(403, 'You are not a member of this team');
    }


    const isAdmin = user.role === UserRole.Admin;
    const isOwner = teamMember.role === TeamRole.Owner;
    const isRequester = request.requester.toString() === teamMember._id.toString();

    if (!isAdmin && !isOwner && !isRequester) {
      throw new ApiError(403, 'Only admins, team owners, or the requester can delete a team request');
    }

    await dbService.teamRequest.delete({_id: requestId});
    await dbService.teamRequestComment.delete({request: requestId});

    return {deleted: true};
  }


  async addComment(requestId: string, content: string, teamMemberId: string) {
    const request = await dbService.teamRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Team request not found');
    }

    const teamMember = await dbService.teamMember.findById(teamMemberId);
    if (!teamMember) {
      throw new ApiError(404, 'Team member not found');
    }

    const isReviewer = teamMember.role === TeamRole.Owner || teamMember.role === TeamRole.Manager;
    const isRequester = request.requester.toString() === teamMemberId;

    if (!isReviewer && !isRequester) {
      throw new ApiError(403, 'Only reviewers (owners or managers) and the requester can comment on this request');
    }
    const comment = await dbService.teamRequestComment.create({
      request: requestId,
      content,
      author: teamMemberId,
    });


    await dbService.teamRequest.findOneAndUpdate(
      {_id: requestId},
      {$inc: {commentCount: 1}}
    );

    return comment.populate('author');
  }


  async getComments(requestId: string, teamMemberId: string, pagination: PaginateOptions) {
    const request = await dbService.teamRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, 'Team request not found');
    }

    const teamMember = await dbService.teamMember.findById(teamMemberId);
    if (!teamMember) {
      throw new ApiError(404, 'Team member not found');
    }

    const isReviewer = teamMember.role === TeamRole.Owner || teamMember.role === TeamRole.Manager;
    const isRequester = request.requester.toString() === teamMemberId;

    if (!isReviewer && !isRequester) {
      throw new ApiError(403, 'Only reviewers (owners or managers) and the requester can view comments on this request');
    }

    return dbService.teamRequestComment.paginate(
      {request: requestId},
      {
        ...pagination,
        populate: 'author',
        sort: {createdAt: 1}, // Sort by creation date ascending (oldest first)
      }
    );
  }
}

export const teamRequestService = new TeamRequestService();
