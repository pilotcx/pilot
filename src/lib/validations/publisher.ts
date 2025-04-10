import {z} from 'zod';

export const createPublisherSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  description: z.string().optional(),
});

export const updatePublisherSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  description: z.string().optional(),
});

export type CreatePublisherSchema = z.infer<typeof createPublisherSchema>;
export type UpdatePublisherSchema = z.infer<typeof updatePublisherSchema>;
