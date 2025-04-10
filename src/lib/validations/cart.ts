import {z} from 'zod';

export const createCartSchema = z.object({
  userId: z.string().nonempty(),
})

export const getCartSchema = z.object({
  userId: z.string().nonempty(),
})

export const updateCartSchema = z.object({
  books: z.array(z.object({
    bookId: z.string().nonempty(),
    quantity: z.number().min(1),
  })).nonempty(),
})

export type CreateCartSchema = z.infer<typeof createCartSchema>
export type GetCartSchema = z.infer<typeof getCartSchema>
export type UpdateCartSchema = z.infer<typeof updateCartSchema>