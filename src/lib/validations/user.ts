import {z} from 'zod';

export const updateUserSchema = z.object({
  fullName: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
}).strict();

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

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
export type PasswordChangeSchema = z.infer<typeof passwordChangeSchema>;
