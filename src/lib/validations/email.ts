import { z } from 'zod';
import { EmailPriority } from '@/lib/types/models/email';

// Helper function to parse comma-separated email addresses
const parseEmailList = (value: string | undefined): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
};

// Schema for form data validation
export const sendEmailFormSchema = z.object({
  // Email addresses
  from: z.string().email({ message: 'Valid sender email is required' }),
  to: z.string()
    .transform(parseEmailList)
    .pipe(z.array(z.string().email()).min(1, { message: 'At least one valid recipient email is required' })),
  cc: z.string().optional()
    .transform(parseEmailList)
    .pipe(z.array(z.string().email()).optional()),
  bcc: z.string().optional()
    .transform(parseEmailList)
    .pipe(z.array(z.string().email()).optional()),

  // Content
  subject: z.string().min(1, { message: 'Subject is required' }),
  html: z.string().min(1, { message: 'Email content is required' }),

  // Optional fields
  inReplyTo: z.string().optional(),
});

// Schema for JSON validation (when not using form data)
export const sendEmailSchema = z.object({
  // Recipient information
  recipient: z.string().email({ message: 'Valid recipient email is required' }),

  // Email addresses
  from: z.string().email({ message: 'Valid sender email is required' }),
  to: z.array(z.string().email({ message: 'Valid recipient email is required' }))
    .min(1, { message: 'At least one recipient is required' }),
  cc: z.array(z.string().email({ message: 'Valid CC email is required' })).optional(),
  bcc: z.array(z.string().email({ message: 'Valid BCC email is required' })).optional(),

  // Content
  subject: z.string().min(1, { message: 'Subject is required' }),
  html: z.string().min(1, { message: 'Email content is required' }),

  // Optional fields
  inReplyTo: z.string().optional(),
  attachments: z.array(
    z.object({
      filename: z.string().min(1, { message: 'Filename is required' }),
      url: z.string().url({ message: 'Valid URL is required' }),
      mimetype: z.string().min(1, { message: 'Mimetype is required' }),
      size: z.number().positive({ message: 'Size must be a positive number' })
    })
  ).optional(),
}).strict();

// Schema for email attachment
export const emailAttachmentSchema = z.object({
  filename: z.string().min(1, { message: 'Filename is required' }),
  url: z.string().url({ message: 'Valid URL is required' }),
  mimetype: z.string().min(1, { message: 'Mimetype is required' }),
  size: z.number().positive({ message: 'Size must be a positive number' })
});

// Schema for creating an email draft
export const createEmailDraftSchema = sendEmailSchema.partial({
  to: true,
  subject: true,
  html: true,
}).extend({
  status: z.literal('draft')
});

// Form data version of the draft schema
export const createEmailDraftFormSchema = sendEmailFormSchema.partial({
  to: true,
  subject: true,
  html: true,
}).extend({
  status: z.literal('draft')
});

// Types
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type SendEmailFormInput = z.infer<typeof sendEmailFormSchema>;
export type EmailAttachmentInput = z.infer<typeof emailAttachmentSchema>;
export type CreateEmailDraftInput = z.infer<typeof createEmailDraftSchema>;
export type CreateEmailDraftFormInput = z.infer<typeof createEmailDraftFormSchema>;
