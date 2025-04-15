import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, { message: 'Project name is required' }).max(100, { message: 'Project name cannot exceed 100 characters' }),
  description: z.string().optional(),
  avatar: z.string().optional(),
  code: z.string().min(2, { message: 'Project code is required' })
    .max(10, { message: 'Project code cannot exceed 10 characters' })
    .regex(/^[A-Z0-9]+$/, { message: 'Project code must contain only uppercase letters and numbers' }),
  team: z.string().min(1, { message: 'Team is required' }),
}).strict();

export const updateProjectSchema = z.object({
  name: z.string().min(1, { message: 'Project name is required' }).max(100, { message: 'Project name cannot exceed 100 characters' }).optional(),
  description: z.string().optional(),
  avatar: z.string().optional(),
  code: z.string().min(2, { message: 'Project code is required' })
    .max(10, { message: 'Project code cannot exceed 10 characters' })
    .regex(/^[A-Z0-9]+$/, { message: 'Project code must contain only uppercase letters and numbers' })
    .optional(),
}).strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
