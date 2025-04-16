import { BaseEntity } from "@/lib/types/models/base";
import { User } from "@/lib/types/models/user";
import mongoose from "mongoose";

/**
 * Email status enum
 */
export enum EmailStatus {
  Draft = 'draft',
  Sent = 'sent',
  Scheduled = 'scheduled',
  Failed = 'failed'
}

/**
 * Email priority enum
 */
export enum EmailPriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high'
}

/**
 * Email label interface
 */
export interface EmailLabel extends BaseEntity {
  name: string;
  color: string;
  description?: string;
  user: string | mongoose.Types.ObjectId | User;
  isSystem: boolean; // System labels like Inbox, Sent, Drafts, etc.
}

/**
 * Email recipient interface
 */
export interface EmailRecipient {
  email: string;
  name?: string;
  type: 'to' | 'cc' | 'bcc';
}

/**
 * Email attachment interface
 */
export interface EmailAttachment {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

/**
 * Email interface
 */
export interface Email extends BaseEntity {
  subject: string;
  body: string;
  bodyType: 'text' | 'html';
  sender: string | mongoose.Types.ObjectId | User;
  recipients: EmailRecipient[];
  attachments?: EmailAttachment[];
  status: EmailStatus;
  priority: EmailPriority;
  labels?: (string | mongoose.Types.ObjectId | EmailLabel)[];
  
  // For email threading/conversation
  conversationId?: string | mongoose.Types.ObjectId; // Group related emails
  parentEmail?: string | mongoose.Types.ObjectId | Email; // Reference to the email being replied to
  
  // Metadata
  readBy?: (string | mongoose.Types.ObjectId | User)[]; // Track who has read the email
  isStarred?: boolean;
  isRead?: boolean;
  sentAt?: Date;
  scheduledFor?: Date;
}

/**
 * Email conversation interface
 */
export interface EmailConversation extends BaseEntity {
  subject: string;
  participants: (string | mongoose.Types.ObjectId | User)[];
  lastEmailAt: Date;
  emailCount: number;
  labels?: (string | mongoose.Types.ObjectId | EmailLabel)[];
}
