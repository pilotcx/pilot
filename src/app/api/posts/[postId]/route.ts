import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { ApiError } from '@/lib/types/errors/api.error';
import { postService } from '@/lib/services/post';
import { teamService } from '@/lib/services/team';
import { TeamRole } from '@/lib/types/models/team';

// Get a specific post
export const GET = withApi(async (request: NextRequest, { params }: { params: { postId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const postId = params.postId;
  const post = await postService.getPostById(postId);

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  // Check if user has access to the team
  const { membership } = await teamService.getTeamWithMembership(
    typeof post.team === 'string' ? post.team : post.team._id.toString(), 
    decoded.id
  );
  
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  return {
    data: post,
    message: 'Post retrieved successfully',
  };
}, {
  protected: true,
});

// Delete a post
export const DELETE = withApi(async (request: NextRequest, { params }: { params: { postId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const postId = params.postId;

  // Get the post
  const post = await postService.getPostById(postId);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  // Extract team ID properly
  const teamId = typeof post.team === 'string' 
    ? post.team 
    : post.team._id.toString();

  // Check if user has access to the team
  const { membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Check if the user is the author or has proper permissions
  const authorId = typeof post.author === 'string' 
    ? post.author 
    : post.author._id.toString();
    
  const isAuthor = authorId === membership._id.toString();
  const isOwnerOrManager = [TeamRole.Owner, TeamRole.Manager].includes(membership.role as TeamRole);

  if (!isAuthor && !isOwnerOrManager) {
    throw new ApiError(403, 'You do not have permission to delete this post');
  }

  // Delete the post
  await postService.deletePost(postId);

  return {
    deleted: true,
    message: 'Post deleted successfully',
  };
}, {
  protected: true,
}); 