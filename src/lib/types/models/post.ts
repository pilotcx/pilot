import {z} from 'zod';
import {Team, TeamMember} from "@/lib/types/models/team";
import {BaseEntity} from "@/lib/types/models/base";

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
  member: TeamMember | string;
}

export interface Comment extends BaseEntity {
  _id: string;
  post: string | Post;
  content: string;
  author: string | TeamMember;
  parentId?: string | Comment;
  replies?: Comment[];
  replyCount: number;
}

export interface Post extends BaseEntity {
  _id: string;
  team: string | Team;
  title: string;
  content: string;
  author: TeamMember | string;
  reactionCounts: {
    [key in ReactionType]?: number;
  };
  reactions?: {
    member: TeamMember,
    type: ReactionType,
  }[];
  commentCount: number;
}

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content cannot exceed 5000 characters'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(1000, 'Comment cannot exceed 1000 characters'),
  parentId: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
