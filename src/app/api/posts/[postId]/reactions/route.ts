import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {addReactionSchema} from '@/lib/types/models/post';
import {ApiError} from '@/lib/types/errors/api.error';
import {teamService} from '@/lib/services/team';
import {postService} from '@/lib/services/post';
import {Team} from "@/lib/types/models/team";

// POST endpoint to add a reaction to a post
export const POST = withApi(async (request: NextRequest, {params, user}: { params: { postId: string }, user: any }) => {
  const body = await request.json();

  // Validate request body
  const result = addReactionSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  // Get the post to check team access
  const post = await postService.getPostById(params.postId).populate('team');
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }
  const team = post.team as Team;

  // Validate team access
  const {membership} = await teamService.getTeamWithMembership(team.slug, user._id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Add the reaction
  return await postService.toggleReaction(
    params.postId,
    user._id,
    result.data.type
  );
});
