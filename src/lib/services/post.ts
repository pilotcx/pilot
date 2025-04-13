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
      reactions: {},
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

  getPostById(postId: string) {
    return dbService.post.findById(postId);
  }

  async toggleReaction(postId: string, userId: string, type: ReactionType): Promise<{ added: boolean }> {
    await dbService.connect();

    const post = await dbService.post.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    if (!post.reactions) {
      post.reactions = {};
    }

    if (!post.reactions[type]) {
      post.reactions[type] = [];
    }

    const existingReactionIndex = post.reactions[type].findIndex(
      (r: any) => r.userId.toString() === userId,
    );

    let added: boolean;

    if (existingReactionIndex >= 0) {
      // User already reacted, so remove the reaction
      post.reactions[type].splice(existingReactionIndex, 1);
      added = false;
    } else {
      // Add the reaction
      post.reactions[type].push({
        type,
        user: userId,
        createdAt: new Date(),
      });
      added = true;
    }

    // Save the updated post
    await dbService.post.findOneAndUpdate({_id: postId}, {reactions: post.reactions});

    return {added};
  }

  async addComment(postId: string, data: {
    content: string;
    authorId: string;
  }): Promise<any> {
    await dbService.connect();

    // Create the comment
    const comment = await dbService.comment.create({
      post: postId,
      content: data.content,
      author: data.authorId,
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

    return {deleted: true};
  }
}

export const postService = new PostService();
