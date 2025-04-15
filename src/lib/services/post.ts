import {dbService} from '@/lib/db/service';
import {ReactionType} from '@/lib/types/models/post';
import {ObjectId} from 'mongodb';

class PostService {
  createPost(data: {
    team: string;
    title: string;
    content: string;
    author: string;
  }) {
    return dbService.post.create({
      team: data.team,
      title: data.title,
      content: data.content,
      author: data.author,
      reactionCounts: {},
      commentCount: 0,
    });
  }

  async getPostsByTeam(teamId: string, options: {
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      limit = 10,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const query = {team: teamId};
    return dbService.post.paginate(query, {
      sort,
      offset: skip,
      limit,
      populate: 'author',
    });
  }

  async getPostById(postId: string) {
    await dbService.connect();
    const post = await dbService.post.findById(postId).populate('team');

    if (post) {
      // Get user reactions for this post
      const reactions = await dbService.reaction.find({
        post: postId
      }).populate('member');

      // Add user reaction information
      post.reactions = reactions.map(reaction => ({
        member: reaction.member,
        type: reaction.type
      }));
    }

    return post;
  }

  async toggleReaction(postId: string, memberId: string, type: ReactionType): Promise<{ added: boolean }> {
    await dbService.connect();

    const post = await dbService.post.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    // Check if the user already has this reaction
    const existingReaction = await dbService.reaction.findOne({
      post: postId,
      member: memberId,
      type
    });

    let added: boolean;

    if (existingReaction) {
      // User already reacted, so remove the reaction
      await dbService.reaction.deleteOne({_id: existingReaction._id});
      added = false;
    } else {
      // Add the reaction
      await dbService.reaction.create({
        post: postId,
        member: memberId,
        type,
      });
      added = true;
    }

    // Update the reaction counts on the post
    const reactionCounts: { [key in ReactionType]?: number } = {};
    const reactionTypes = Object.values(ReactionType);

    // Get counts for each reaction type
    for (const reactionType of reactionTypes) {
      const count = await dbService.reaction.count({
        post: postId,
        type: reactionType
      });

      if (count > 0) {
        reactionCounts[reactionType] = count;
      }
    }

    // Update the post with the new reaction counts
    await dbService.post.findOneAndUpdate({_id: postId}, {reactionCounts});

    return {added};
  }

  async addComment(postId: string, data: {
    content: string;
    teamMemberId: string;
  }): Promise<any> {
    await dbService.connect();

    // Create the comment
    const comment = await dbService.comment.create({
      post: postId,
      content: data.content,
      author: data.teamMemberId,
    });

    await dbService.post.findOneAndUpdate({_id: postId}, {
      $inc: {commentCount: 1},
    });

    return comment;
  }

  async deletePost(postId: string): Promise<{ deleted: boolean }> {
    await dbService.connect();
    await dbService.post.deleteOne({_id: postId});
    await dbService.comment.delete({postId: new ObjectId(postId)});
    await dbService.reaction.delete({post: postId});

    return {deleted: true};
  }
}

export const postService = new PostService();
