import { z } from 'zod';
import { Team, TeamMember } from "@/lib/types/models/team";
import { BaseEntity } from "@/lib/types/models/base";

export enum TeamRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
  IN_REVIEW = 'in_review'
}

export interface TeamRequest extends BaseEntity {
  _id: string;
  team: string | Team;
  title: string;
  description: string;
  requester: string | TeamMember;
  reviewer?: string | TeamMember;
  status: TeamRequestStatus;
  responder?: string | TeamMember;
  responseNote?: string;
  commentCount: number;
}

export interface TeamRequestComment extends BaseEntity {
  _id: string;
  request: string | TeamRequest;
  content: string;
  author: string | TeamMember;
}

export const createTeamRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description cannot exceed 5000 characters'),
  reviewer: z.string().optional(),
});

export type CreateTeamRequestInput = z.infer<typeof createTeamRequestSchema>;

export const updateTeamRequestSchema = z.object({
  status: z.nativeEnum(TeamRequestStatus),
  responseNote: z.string().max(5000, 'Response note cannot exceed 5000 characters').optional(),
});

export type UpdateTeamRequestInput = z.infer<typeof updateTeamRequestSchema>;

export const createTeamRequestCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(1000, 'Comment cannot exceed 1000 characters'),
});

export type CreateTeamRequestCommentInput = z.infer<typeof createTeamRequestCommentSchema>;
