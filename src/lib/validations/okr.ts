import dayjs from 'dayjs';
import * as z from 'zod';
import { KeyResultStatus, ObjectiveStatus } from '../types/models/okr';

export const createObjectiveSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  dueDate: z.string({
    required_error: "Due date is required",
  }),
  teamId: z.string().min(1, 'Team ID is required'),
}).refine((data) => {
  return dayjs(data.dueDate).isAfter(dayjs());
}, {
  message: "Due date must be in the future",
  path: ["dueDate"],
});

export const updateObjectiveSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.nativeEnum(ObjectiveStatus).optional(),
  progress: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional(),
  ownerId: z.string().min(1, 'Owner ID is required').optional(),
}).refine((data) => {
  if (data.dueDate) {
    return dayjs(data.dueDate).isAfter(dayjs());
  }
  return true;
}, {
  message: "Due date must be in the future",
  path: ["dueDate"],
});

export const createKeyResultSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  target: z.number({
    required_error: "Target value is required",
    invalid_type_error: "Target must be a number",
  }),
  current: z.number({
    required_error: "Current value is required",
    invalid_type_error: "Current must be a number",
  }),
  unit: z.string().min(1, 'Unit is required'),
  dueDate: z.string({
    required_error: "Due date is required",
  }),
  objectiveId: z.string().min(1, 'Objective ID is required'),
  taskId: z.string().optional(),
}).refine((data) => {
  return dayjs(data.dueDate).isAfter(dayjs());
}, {
  message: "Due date must be in the future",
  path: ["dueDate"],
});

export const updateKeyResultSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.nativeEnum(KeyResultStatus).optional(),
  progress: z.number().min(0).max(100).optional(),
  target: z.number().optional(),
  current: z.number().optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  dueDate: z.string().optional(),
  ownerId: z.string().min(1, 'Owner ID is required').optional(),
  taskId: z.string().optional(),
}).refine((data) => {
  if (data.dueDate) {
    return dayjs(data.dueDate).isAfter(dayjs());
  }
  return true;
}, {
  message: "Due date must be in the future",
  path: ["dueDate"],
}); 