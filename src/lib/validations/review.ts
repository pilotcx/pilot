import {z} from "zod";

export const createReviewSchema = z.object({
  userId: z.string().nonempty(),
  bookId: z.string().nonempty(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export type CreateReviewSchema = z.infer<typeof createReviewSchema>