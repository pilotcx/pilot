import {z} from 'zod';
import {BookStatus} from '@/lib/types/models/book';

export const createBookSchema = z.object({
  shelf: z.string().optional(),
  authors: z.array(z.string()).optional(),
  description: z.string().optional(),
  slug: z.string().optional(),
  pages: z.number().int().optional(),
  id: z.string().optional(),
  category: z.string().optional(),
  name: z.string().optional(),
  publisher: z.string().optional(),
  publishYear: z.string().optional(),
  cover: z.string().optional(),
  language: z.string().optional(),
  borrowedCount: z.number().int().optional(),
  status: z.nativeEnum(BookStatus).optional(),
});

export const updateBookSchema = createBookSchema;

export type CreateBookSchema = z.infer<typeof createBookSchema>;
export type UpdateBookSchema = z.infer<typeof updateBookSchema>;
