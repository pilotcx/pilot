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

export interface EmailRecipient {
  email: string;
  name?: string;
  type: 'to' | 'cc' | 'bcc';
}

export interface EmailAttachment {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

export interface Email extends BaseEntity {
  owner: mongoose.Schema.Types.ObjectId | string;
  labels?: string[];
  type: EmailType;
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  from: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  headers: string[];
  strippedText: string;
  replyTo?: string;
  seen?: boolean;
  dkimSignature?: string;
  contentType?: string;
  raw: any;
  claimed?: boolean;
  member?: TeamMember | string;
  attachments?: EmailAttachment[] | string[];
  conversationId?: string;
}

export interface EmailConversation extends BaseEntity {
  subject: string;
  lastEmailAt: Date;
  emailCount: number;
  participants: string[];
  lastEmail?: string | mongoose.Types.ObjectId | Email;
  labels?: (string | mongoose.Types.ObjectId | EmailLabel)[];
}
