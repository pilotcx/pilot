import {z} from 'zod';

export const updateUserSchema = z.object({
  fullName: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().optional(),
  avatar: z.string().url({ message: "Please enter a valid URL" }).optional(),
  bio: z.string().optional(),
}).strict();
export const createUserSchema = z.object({
  fullName: z.string().min(3).max(30),
  phoneNumber: z.string().regex(/^\d{10,15}$/),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().optional(),
  address: z.string().optional(),
}).strict();
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
