import { dbService } from '@/lib/db/service';
import { ReactionType } from '@/lib/types/models/post';
import { ObjectId } from 'mongodb';

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

    const query = { team: teamId };
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
        member: (reaction as any).member,
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
      await dbService.reaction.deleteOne({ _id: existingReaction._id });
      added = false;
    } else {
      // Add the reaction
      await dbService.reaction.create({
        postId: postId,
        userId: memberId,
        type,
        createdAt: new Date()
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
    await dbService.post.findOneAndUpdate({ _id: postId }, { reactionCounts });

    return { added };
  }

  async addComment(postId: string, data: {
    content: string;
    teamMemberId: string;
    parentId?: string;
  }): Promise<any> {
    await dbService.connect();

    // Ensure postId is a string
    const postIdStr = typeof postId === 'string'
      ? postId
      : (postId as any).toString();

    // Check if this is a reply to another comment
    if (data.parentId) {
      // Ensure parentId is a string
      const parentIdStr = typeof data.parentId === 'string'
        ? data.parentId
        : (data.parentId as any).toString();

      const parentComment = await dbService.comment.findById(parentIdStr);

      if (!parentComment) {
        throw new Error('Parent comment not found');
      }

      // Ensure we're only allowing 2 levels of nesting max
      if (parentComment.parentId) {
        throw new Error('Cannot reply to a reply (max 2 levels allowed)');
      }

      // Create the reply comment
      const comment = await dbService.comment.create({
        post: postIdStr,
        content: data.content,
        author: data.teamMemberId,
        parentId: parentIdStr,
        replyCount: 0
      });

      const populatedComment = await dbService.comment.findById(comment._id).populate('author');

      // Increment parent comment reply count
      await dbService.comment.findOneAndUpdate(
        { _id: parentIdStr },
        { $inc: { replyCount: 1 } }
      );

      // Increment post comment count
      await dbService.post.findOneAndUpdate({ _id: postId }, {
        $inc: { commentCount: 1 },
      });

      return populatedComment;
    }

    // Create a top-level comment
    const comment = await dbService.comment.create({
      post: postIdStr,
      content: data.content,
      author: data.teamMemberId,
      replyCount: 0,
    });

    const populatedComment = await dbService.comment.findById(comment._id).populate('author');

    // Increment post comment count
    await dbService.post.findOneAndUpdate({ _id: postId }, {
      $inc: { commentCount: 1 },
    });

    return populatedComment;
  }

  async getComments(postId: string, options: {
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    await dbService.connect();

    const { limit = 10, skip = 0, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    // Ensure postId is a string
    const postIdStr = typeof postId === 'string'
      ? postId
      : (postId as any).toString();

    // Get top-level comments only (no parentId)
    const comments = await dbService.comment.paginate(
      {
        post: postIdStr,
        parentId: null
      },
      {
        limit,
        offset: skip,
        sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
        populate: [
          { path: 'author' },
          {
            path: 'replies',
            populate: {
              path: 'author'
            },
            options: {
              limit: 10, // Limit replies to 10 per comment
              sort: { createdAt: 1 } // Sort replies by creation date (oldest first)
            }
          }
        ]
      }
    );

    // Clean up the response to ensure proper JSON serialization
    const cleanedDocs = comments.docs.map(doc => {
      const docObj = (doc as any).toObject ? (doc as any).toObject() : doc;

      // Clean up replies if they exist
      if (docObj.replies && Array.isArray(docObj.replies)) {
        docObj.replies = docObj.replies.map((reply: any) =>
          reply.toObject ? reply.toObject() : reply
        );
      }

      return docObj;
    });

    return {
      data: cleanedDocs,
      pagination: {
        totalDocs: comments.totalDocs,
        totalPages: comments.totalPages,
        page: comments.page,
        limit: comments.limit,
        hasNextPage: comments.hasNextPage,
        hasPrevPage: comments.hasPrevPage
      },
      message: 'Comments retrieved successfully'
    };
  }

  async getReplies(commentId: string, options: {
    limit?: number;
    skip?: number;
  } = {}) {
    await dbService.connect();

    const { limit = 10, skip = 0 } = options;

    // Ensure we have a string ID
    const commentIdStr = typeof commentId === 'string'
      ? commentId
      : (commentId as any).toString();

    const replies = await dbService.comment.paginate(
      { parentId: commentIdStr },
      {
        limit,
        offset: skip,
        sort: { createdAt: 1 },
        populate: 'author'
      }
    );

    // Clean up the response to ensure proper JSON serialization
    const cleanedDocs = replies.docs.map(doc =>
      (doc as any).toObject ? (doc as any).toObject() : doc
    );

    return {
      data: cleanedDocs,
      pagination: {
        totalDocs: replies.totalDocs,
        totalPages: replies.totalPages,
        page: replies.page,
        limit: replies.limit,
        hasNextPage: replies.hasNextPage,
        hasPrevPage: replies.hasPrevPage
      },
      message: 'Replies retrieved successfully'
    };
  }

  async deleteComment(commentId: string): Promise<{ deleted: boolean }> {
    await dbService.connect();

    const comment = await dbService.comment.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    try {
      // If it's a parent comment, delete all replies first
      if (!comment.parentId) {
        // Find and count all replies to properly update counts
        const replies = await dbService.comment.find({ parentId: commentId });
        const replyCount = replies.length;
        
        // Delete all replies
        if (replyCount > 0) {
          await dbService.comment.deleteMany({ parentId: commentId });
        }

        // Get current post to check commentCount before decrementing
        const post = await dbService.post.findById(comment.post as string);
        if (!post) {
          throw new Error('Post not found');
        }

        // Calculate how much to decrement (ensure it doesn't go negative)
        // Count parent + all replies
        const decrementAmount = Math.min(post.commentCount, 1 + replyCount);

        // Decrement post comment count by 1 + replyCount (with safeguard)
        await dbService.post.findOneAndUpdate(
          { _id: comment.post },
          { $inc: { commentCount: -decrementAmount } }
        );
      } else {
        // It's a reply, decrement parent comment reply count
        const parentComment = await dbService.comment.findById(comment.parentId as string);
        if (parentComment) {
          // Ensure replyCount doesn't go negative
          const newReplyCount = Math.max(0, parentComment.replyCount - 1);
          await dbService.comment.findOneAndUpdate(
            { _id: comment.parentId },
            { $set: { replyCount: newReplyCount } }
          );
        }

        // Get current post to check commentCount before decrementing
        const post = await dbService.post.findById(comment.post as string);
        if (post && post.commentCount > 0) {
          // Decrement post comment count (safely)
          await dbService.post.findOneAndUpdate(
            { _id: comment.post },
            { $inc: { commentCount: -1 } }
          );
        }
      }

      // Finally delete the comment itself
      await dbService.comment.deleteOne({ _id: commentId });
      
      return { deleted: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<{ deleted: boolean }> {
    await dbService.connect();
    await dbService.post.deleteOne({ _id: postId });
    await dbService.comment.delete({ post: new ObjectId(postId) });
    await dbService.reaction.delete({ post: postId });

    return { deleted: true };
  }
}

export const postService = new PostService();
