import { z } from 'zod';
import { TeamRole } from '@/lib/types/models/team';

export const createTeamSchema = z.object({
  name: z.string().min(1, { message: "Team name is required" }).max(100),
  description: z.string().optional(),
  avatar: z.string().optional(),
}).strict();

export const updateTeamSchema = z.object({
  name: z.string().min(1, { message: "Team name is required" }).max(100).optional(),
  description: z.string().optional(),
  avatar: z.string().optional(),
}).strict();

export const addTeamMemberSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  displayName: z.string().min(1, { message: "Display name is required" }),
  role: z.nativeEnum(TeamRole).default(TeamRole.Member),
}).strict();

export const updateTeamMemberSchema = z.object({
  displayName: z.string().min(1, { message: "Display name is required" }).optional(),
  role: z.nativeEnum(TeamRole).optional(),
}).strict();

// Types
export type CreateTeamSchema = z.infer<typeof createTeamSchema>;
export type UpdateTeamSchema = z.infer<typeof updateTeamSchema>;
export type AddTeamMemberSchema = z.infer<typeof addTeamMemberSchema>;
export type UpdateTeamMemberSchema = z.infer<typeof updateTeamMemberSchema>;
