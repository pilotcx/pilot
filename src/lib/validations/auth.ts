import {z} from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(3).max(30),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^\d{10,15}$/),
  password: z.string().min(6),
}).strict();


export const oAuthSignInSchema = z.object({
  issuer: z.enum(['web', 'mobile']).default('web'),
  code: z.string().optional(),
  idToken: z.string().optional(),
}).strict();

export const loginSchema = z.object({
  identifier: z.string(),
  password: z.string().min(6),
  issuer: z.enum(['web', 'mobile']).default('web'),
}).strict();

export const resetPasswordSchema = z.object({
  email: z.string().email(),
}).strict();

export const resetPasswordSubmissionSchema = z.object({
  newPassword: z.string().min(6),
  code: z.string(),
}).strict();

export const changePasswordSchema = z.object({
  newPassword: z.string().min(6),
  oldPassword: z.string().min(6),
}).strict();

export interface QuerySsoUser {
  googleId?: string;
  appleId?: string;
}

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type OAuthSignInSchema = z.infer<typeof oAuthSignInSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordSubmissionSchema = z.infer<typeof resetPasswordSubmissionSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
