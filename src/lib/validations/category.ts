import {z} from 'zod';

export const createCategorySchema = z.object({
  name: z.string(),
  slug: z.string(),
});
export const updateCategorySchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof createCategorySchema>;
