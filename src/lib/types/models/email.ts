import {BaseEntity} from "@/lib/types/models/base";
import {User} from "@/lib/types/models/user";
import mongoose from "mongoose";
import {TeamMember} from "@/lib/types/models/team";

export enum EmailType {
  Incoming = 'incoming',
  Outgoing = 'outgoing'
}

export enum EmailStatus {
  Draft = 'draft',
  Sent = 'sent',
  Scheduled = 'scheduled',
  Failed = 'failed'
}

export enum EmailPriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high'
}

export interface EmailLabel extends BaseEntity {
  name: string;
  color: string;
  description?: string;
  user: string | mongoose.Types.ObjectId | User;
  isSystem: boolean;
}

export interface EmailAttachment {
  filename: string;
  url: string;
  mimetype: string;
  size: number;
}

export interface Email extends BaseEntity {
  conversation: mongoose.Types.ObjectId | EmailConversation | string;

  recipient: string;

  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];

  subject: string;
  summary: string;
  html: string;

  attachments?: EmailAttachment[];

  messageId: string;
  inReplyTo?: string;

  isRead: boolean;
  direction: 'incoming' | 'outgoing';
}

export interface EmailConversation extends BaseEntity {
  lastMessageAt: Date | string;
}
