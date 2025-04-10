import {z} from 'zod';

export const pagination = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});
export type PaginationValidation = z.infer<typeof pagination>;
