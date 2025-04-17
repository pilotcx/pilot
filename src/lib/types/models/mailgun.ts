import { BaseEntity } from "@/lib/types/models/base";
import { Team } from "@/lib/types/models/team";
import mongoose from "mongoose";

/**
 * Mailgun integration status
 */
export enum MailgunIntegrationStatus {
  Active = 'active',
  Inactive = 'inactive',
  Failed = 'failed',
  Pending = 'pending'
}

/**
 * Mailgun integration interface
 */
export interface MailgunIntegration extends BaseEntity {
  team: string | mongoose.Types.ObjectId | Team;
  apiKey: string;
  domain: string;
  webhookSigningKey: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  status: MailgunIntegrationStatus;
  lastSyncAt?: Date;
  errorMessage?: string;
  inboundRoute?: string;
  inboundEnabled: boolean;
  outboundEnabled: boolean;
}

/**
 * Mailgun webhook event types
 */
export enum MailgunEventType {
  Delivered = 'delivered',
  Opened = 'opened',
  Clicked = 'clicked',
  Unsubscribed = 'unsubscribed',
  Complained = 'complained',
  Bounced = 'bounced',
  Dropped = 'dropped',
  Stored = 'stored'
}

/**
 * Mailgun webhook event interface
 */
export interface MailgunEvent extends BaseEntity {
  integration: string | mongoose.Types.ObjectId | MailgunIntegration;
  eventType: MailgunEventType;
  messageId: string;
  recipient: string;
  timestamp: Date;
  eventData: any;
  processed: boolean;
}
