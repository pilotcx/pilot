import {z} from "zod";

export const createAuthorSchema = z.object({
  name: z.string(),
  introduction: z.string().optional(),
  picture: z.string().optional(),
  category: z.array(z.string()).optional(),
})
export const updateAuthorSchema = z.object({
  name: z.string(),
  introduction: z.string().optional(),
  picture: z.string().optional(),
  category: z.array(z.string()).optional(),
})

export type CreateAuthorSchema = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorSchema = z.infer<typeof updateAuthorSchema>;
