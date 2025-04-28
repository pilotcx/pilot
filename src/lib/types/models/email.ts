import {BaseEntity} from "@/lib/types/models/base";
import {User} from "@/lib/types/models/user";
import mongoose from "mongoose";
import {Team, TeamMember} from "@/lib/types/models/team";

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
  recipient?: string;

  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];

  subject: string;
  summary: string;
  html: string;

  attachments?: EmailAttachment[];
  team: Team | string | mongoose.Schema.Types.ObjectId;

  // Message IDs for threading
  messageId: string;
  inReplyTo?: string;
  references?: string[];

  // Chain tracking
  chainId: string;
  isLatestInChain: boolean;

  isRead: boolean;
  direction: 'incoming' | 'outgoing';
}
