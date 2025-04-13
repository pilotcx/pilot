import {z} from 'zod';
import {Team, TeamMember} from "@/lib/types/models/team";
import {BaseEntity} from "@/lib/types/models/base";
import {User} from "@/lib/types/models/user";

export enum ReactionType {
  Like = 'like',
  Love = 'love',
  Laugh = 'laugh',
  Angry = 'angry',
  Sad = 'sad',
  Celebrate = 'celebrate'
}

export interface Reaction extends BaseEntity {
  type: ReactionType;
  user: User | string;
}

export interface Comment extends BaseEntity {
  _id: string;
  post: string | Post;
  content: string;
  author: string | TeamMember;
}

export interface Post extends BaseEntity {
  _id: string;
  team: string | Team;
  title: string;
  content: string;
  author: TeamMember | string;
  reactions: {
    [key in ReactionType]?: Reaction[];
  };
  commentCount: number;
}

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content cannot exceed 5000 characters'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(1000, 'Comment cannot exceed 1000 characters'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const addReactionSchema = z.object({
  type: z.nativeEnum(ReactionType),
});

export type AddReactionInput = z.infer<typeof addReactionSchema>;

export function formatReactionsForClient(post: Post) {
  const reactionCounts: Record<ReactionType, { count: number, reacted: boolean }> = {
    [ReactionType.Like]: {count: 0, reacted: false},
    [ReactionType.Love]: {count: 0, reacted: false},
    [ReactionType.Laugh]: {count: 0, reacted: false},
    [ReactionType.Angry]: {count: 0, reacted: false},
    [ReactionType.Sad]: {count: 0, reacted: false},
    [ReactionType.Celebrate]: {count: 0, reacted: false},
  };

  // Count reactions and check if current user has reacted
  Object.entries(post.reactions || {}).forEach(([type, reactions]) => {
    if (reactions && Array.isArray(reactions)) {
      reactionCounts[type as ReactionType].count = reactions.length;
      // Note: We'll set the 'reacted' flag when we have the current user ID
    }
  });

  return reactionCounts;
}
