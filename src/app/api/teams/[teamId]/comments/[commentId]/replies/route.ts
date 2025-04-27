import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {ApiError} from '@/lib/types/errors/api.error';
import {teamService} from '@/lib/services/team';
import {postService} from '@/lib/services/post';
import {dbService} from '@/lib/db/service';

export const GET = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ teamId: string, commentId: string }>
}, decoded) => {
  const {teamId, commentId} = await params;
  const searchParams = new URL(request.url).searchParams;
  
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  
  // Verify team access
  const {membership} = await teamService.getTeamWithMembership(teamId, decoded!.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }
  
  // Fetch the comment to verify it belongs to the team
  const comment = await dbService.comment.findById(commentId).populate('post');
  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }
  
  // Extract post ID correctly, handling both string and object references
  const postId = typeof comment.post === 'string' 
    ? comment.post 
    : comment.post._id.toString();
  
  const post = await postService.getPostById(postId);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }
  
  // Handle both string ID and populated team object
  const postTeamId = typeof post.team === 'string' 
    ? post.team 
    : (post.team && post.team._id) 
      ? post.team._id.toString() 
      : '';
      
  if (postTeamId !== teamId) {
    throw new ApiError(404, 'Comment not found in this team');
  }
  
  return await postService.getReplies(commentId, {limit, skip});
}); 