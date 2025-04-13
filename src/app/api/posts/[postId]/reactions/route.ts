import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {addReactionSchema} from '@/lib/types/models/post';
import {ApiError} from '@/lib/types/errors/api.error';
import {teamService} from '@/lib/services/team';
import {postService} from '@/lib/services/post';
import {Team} from "@/lib/types/models/team";

export const POST = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ postId: string }>
}, decoded) => {
  const {postId} = await params;
  const body = await request.json();

  const result = addReactionSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  const post = await postService.getPostById(postId).populate('team');
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }
  const team = post.team as Team;

  const {membership} = await teamService.getTeamWithMembership(team.slug, decoded!.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  return await postService.toggleReaction(
    postId,
    membership._id.toString(),
    result.data.type
  );
});
