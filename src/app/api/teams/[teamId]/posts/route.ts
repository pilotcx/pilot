import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {createPostSchema, Post} from '@/lib/types/models/post';
import {ApiError} from '@/lib/types/errors/api.error';
import {teamService} from '@/lib/services/team';
import {postService} from '@/lib/services/post';
import {dbService} from "@/lib/db/service";

export const GET = withApi(async (request: NextRequest, {params}: { params: Promise<{ teamId: string }> }, decoded) => {
  const {searchParams} = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = parseInt(searchParams.get('skip') || '0');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';

  const {teamId} = await params;

  const {team, membership} = await teamService.getTeamWithMembership(teamId, decoded!.id);
  if (!team) throw new ApiError(404, 'Team not found');
  if (!membership) throw new ApiError(404, 'You are not permitted');

  // Get posts for the team
  const result = await postService.getPostsByTeam(teamId, {
    limit,
    skip,
    sortBy,
    sortOrder,
  });
  let posts: Post[] = [];
  for await (let post of result.docs) {
    const reactions = await dbService.reaction.find({
      post: post._id
    }).populate('member');

    // Add user reaction information
    posts.push({
      ...post.toJSON(),
      reactions: reactions.map(reaction => ({
        member: (reaction as any).member,
        type: reaction.type
      }))
    });
  }
  return {
    data: posts,
    pagination: result,
  }
});

export const POST = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ teamId: string }>
}, decoded) => {
  const {teamId} = await params;
  const body = await request.json();
  const result = createPostSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }
  const {membership} = await teamService.getTeamWithMembership(teamId, decoded?.id!);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Create the post
  return await postService.createPost({
    team: teamId,
    title: result.data.title,
    content: result.data.content,
    author: membership._id as string,
  });
});
