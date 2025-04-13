import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {ApiError} from '@/lib/types/errors/api.error';
import {teamService} from '@/lib/services/team';
import {postService} from '@/lib/services/post';
import {TeamMember, TeamRole} from "@/lib/types/models/team";

// GET endpoint to fetch a single post
export const GET = withApi(async (request: NextRequest, {params}: { params: { postId: string } }) => {
  const post = await postService.getPostById(params.postId);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  return {
    data: post.toJSON(),
  };
});

// DELETE endpoint to delete a post
export const DELETE = withApi(async (request: NextRequest, {params, user}: {
  params: { postId: string },
  user: any
}, decoded) => {
  // Get the post to check ownership and team access
  const post = await postService.getPostById(params.postId);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }
  const team = await teamService.getTeam(post.team as string);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Validate team access
  const {membership} = await teamService.getTeamWithMembership(team.slug, decoded!.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }
  const author = post.author as TeamMember;
  const isAuthor = author._id?.toString() === membership._id.toString();
  const isAdminOrManager = [TeamRole.Owner, TeamRole.Manager].includes(membership.role);

  if (!isAuthor && !isAdminOrManager) {
    throw new ApiError(403, 'You do not have permission to delete this post');
  }

  // Delete the post
  await postService.deletePost(params.postId);

  return {deleted: true};
});
