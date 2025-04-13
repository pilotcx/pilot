import {z} from 'zod';

export enum ReactionType {
  Like = 'like',
  Love = 'love',
  Laugh = 'laugh',
  Angry = 'angry',
  Sad = 'sad',
  Celebrate = 'celebrate'
}

export interface Reaction {
  _id: string;
  postId: string;
  userId: string;
  type: ReactionType;
  createdAt: Date;
  updatedAt?: Date;
}

// Schema for adding a reaction
export const addReactionSchema = z.object({
  type: z.nativeEnum(ReactionType),
});

export type AddReactionInput = z.infer<typeof addReactionSchema>;

