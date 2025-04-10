import {z} from 'zod';

export const createFineSchema = z.object({
  user: z.string(),
  ticket: z.string(),
  amount: z.number().optional(),
  paidAmount: z.number().optional(),
  note: z.string().optional(),
})

export const updateFineSchema = z.object({
  amount: z.number().optional(),
  paidAmount: z.number().optional(),
  note: z.string().optional(),
  status: z.string().optional(),
})

export type CreateFineSchema = z.infer<typeof createFineSchema>
export type UpdateFineSchema = z.infer<typeof updateFineSchema>
