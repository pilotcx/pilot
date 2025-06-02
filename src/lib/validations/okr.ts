import dayjs from 'dayjs';
import * as z from 'zod';
import { KeyResultStatus, ObjectiveStatus } from '../types/models/okr';

export const createObjectiveSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  startDate: z.string({
    required_error: "Start date is required",
  }),
  endDate: z.string({
    required_error: "End date is required",
  }),
  teamId: z.string().min(1, 'Team ID is required'),
}).refine((data) => {
  return dayjs(data.startDate).isBefore(dayjs(data.endDate));
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const updateObjectiveSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.nativeEnum(ObjectiveStatus).optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  ownerId: z.string().min(1, 'Owner ID is required').optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate < data.endDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
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
  startDate: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Start date must be a valid date",
  }),
  endDate: z.date({
    required_error: "End date is required",
    invalid_type_error: "End date must be a valid date",
  }),
  objectiveId: z.string().min(1, 'Objective ID is required'),
  ownerId: z.string().min(1, 'Owner ID is required'),
}).refine((data) => {
  return data.startDate < data.endDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const updateKeyResultSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.nativeEnum(KeyResultStatus).optional(),
  progress: z.number().min(0).max(100).optional(),
  target: z.number().optional(),
  current: z.number().optional(),
  unit: z.string().min(1, 'Unit is required').optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  ownerId: z.string().min(1, 'Owner ID is required').optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate < data.endDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
}); 