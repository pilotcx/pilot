import { z } from 'zod';
import { TaskStatus, TaskPriority } from '@/lib/types/models/task';

export const createTaskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(200, { message: 'Title cannot exceed 200 characters' }),
  description: z.string().optional(),
  assignee: z.string().min(1, { message: 'Assignee is required' }),
  dueDate: z.string().min(1, { message: 'Due date is required' }),
  priority: z.nativeEnum(TaskPriority).optional(),
  project: z.string().min(1, { message: 'Project is required' }),
}).strict();

export const updateTaskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(200, { message: 'Title cannot exceed 200 characters' }).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignee: z.string().min(1, { message: 'Assignee is required' }).optional(),
  dueDate: z.string().min(1, { message: 'Due date is required' }).optional(),
  priority: z.union([
    z.nativeEnum(TaskPriority),
    z.string().transform(val => Number(val))
  ]).optional(),
  project: z.string().min(1, { message: 'Project is required' }).optional(),
}).strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
