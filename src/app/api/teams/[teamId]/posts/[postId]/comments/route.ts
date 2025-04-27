import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {ApiError} from '@/lib/types/errors/api.error';
import {teamService} from '@/lib/services/team';
import {postService} from '@/lib/services/post';
import {createCommentSchema} from "@/lib/types/models/post";

export const POST = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ teamId: string, postId: string }>
}, decoded) => {
  const {teamId, postId} = await params;
  const body = await request.json();

  const result = createCommentSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  const {membership} = await teamService.getTeamWithMembership(teamId, decoded!.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  const post = await postService.getPostById(postId);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }
  
  const postTeamId = typeof post.team === 'string' 
    ? post.team 
    : (post.team && post.team._id) 
      ? post.team._id.toString() 
      : '';
  if (postTeamId !== teamId) {
    throw new ApiError(404, 'Post not found in this team');
  }

  return await postService.addComment(
    postId,
    {
      content: result.data.content,
      teamMemberId: membership._id.toString(),
      parentId: result.data.parentId
    }
  );
});

export const GET = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ teamId: string, postId: string }>
}, decoded) => {
  const {teamId, postId} = await params;
  const searchParams = new URL(request.url).searchParams;
  
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  
  // Verify team access
  const {membership} = await teamService.getTeamWithMembership(teamId, decoded!.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Verify post belongs to team
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
    throw new ApiError(404, 'Post not found in this team');
  }
  
  return await postService.getComments(postId, {limit, skip, sortBy, sortOrder});
}); 