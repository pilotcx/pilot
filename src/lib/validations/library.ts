import {z} from 'zod';

export const createLibrarySchema = z.object({
  name: z.string(),
  address: z.string(),
  openingTime: z.string(),
  closingTime: z.string(),
  phoneNumber: z.string(),
  estDate: z.string(),
  description: z.string(),
});

export const updateLibrarySchema = z.object({
  name: z.string(),
  address: z.string(),
  openingTime: z.string(),
  closingTime: z.string(),
  phoneNumber: z.string(),
  estDate: z.string(),
  description: z.string(),
});

export type CreateLibrarySchema = z.infer<typeof createLibrarySchema>;
export type UpdateLibrarySchema = z.infer<typeof updateLibrarySchema>;
