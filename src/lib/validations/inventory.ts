import {z} from 'zod';

export const updateInventorySchema = z.object({
  quantity: z.number().min(0),
});

export const searchInventorySchema = z.object({
  query: z.string().optional(),
  bookId: z.string().optional(),
});

export type SearchInventorySchema = z.infer<typeof searchInventorySchema>;
export type UpdateInventorySchema = z.infer<typeof updateInventorySchema>;
