import {z} from 'zod';
import {BorrowTicketRecordStatus, BorrowTicketStatus, BorrowType} from '@/lib/types/models/borrow';

export const borrowBookSchema = z.object({
  userId: z.string().optional(),
  books: z.array(z.object({
    bookId: z.string(),
    quantity: z.number().min(1),
  })),
  library: z.string().optional(),
  expectedReturnDate: z.string().optional(),
  // returnDate: z.string().optional(),
  borrowDate: z.string().optional(),
  borrowType: z.nativeEnum(BorrowType),
  note: z.string().optional(),
  deliveryMethod: z.string().optional(),
  recipientAddress: z.string().optional(),
});

export const updateBorrowTicketSchema = z.object({
  status: z.nativeEnum(BorrowTicketStatus),
  books: z.array(z.object({
    bookId: z.string(),
    status: z.nativeEnum(BorrowTicketRecordStatus),
    library: z.string().optional(),
  })).optional(),
})

export type BorrowBookSchema = z.infer<typeof borrowBookSchema>;
export type UpdateBorrowTicketSchema = z.infer<typeof updateBorrowTicketSchema>;
