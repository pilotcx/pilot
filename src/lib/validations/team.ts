import { z } from 'zod';
import { TeamRole } from '@/lib/types/models/team';

export const createTeamSchema = z.object({
  name: z.string().min(1, { message: "Team name is required" }).max(100),
  slug: z.string().min(1, { message: "Team slug is required" })
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen"
    })
    .optional(), // Optional because we'll generate it from the name if not provided
  description: z.string().optional(),
  avatar: z.string().optional(),
}).strict();

export const updateTeamSchema = z.object({
  name: z.string().min(1, { message: "Team name is required" }).max(100).optional(),
  slug: z.string().min(1, { message: "Team slug is required" })
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen"
    })
    .optional(),
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
