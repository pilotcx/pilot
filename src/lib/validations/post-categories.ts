import {z} from 'zod';

export const createPostCategorySchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export const updatePostCategorySchema =  z.object({
  name: z.string(),
  slug: z.string().optional(),
});

export type CreatePostCategorySchema = z.infer<typeof createPostCategorySchema>;
export type UpdatePostCategorySchema = z.infer<typeof updatePostCategorySchema>;
