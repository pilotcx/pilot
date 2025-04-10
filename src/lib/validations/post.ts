import {z} from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, {message: "Title is required"}),
  content: z.string().min(1, {message: "Content is required"}),
  pictures: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
});
export const updatePostSchema = z.object({
  title: z.string().min(1, {message: "Title must not be empty"}).optional(),
  content: z.string().min(1, {message: "Content must not be empty"}).optional(),
  pictures: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreatePostSchema = z.infer<typeof createPostSchema>;
export type UpdatePostSchema = z.infer<typeof updatePostSchema>;
