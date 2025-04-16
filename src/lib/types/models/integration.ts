import { BaseEntity } from "@/lib/types/models/base";
import { Team } from "@/lib/types/models/team";
import mongoose from "mongoose";

/**
 * Integration types
 */
export enum IntegrationType {
  Mailgun = 'mailgun',
  Sendgrid = 'sendgrid',
  SMTP = 'smtp',
  Slack = 'slack',
  GitHub = 'github',
  GitLab = 'gitlab',
  Jira = 'jira',
  Trello = 'trello',
  // Add more integration types as needed
}

/**
 * Integration status
 */
export enum IntegrationStatus {
  Active = 'active',
  Inactive = 'inactive',
  Failed = 'failed',
  Pending = 'pending'
}

/**
 * Base integration interface
 */
export interface Integration extends BaseEntity {
  team: string | mongoose.Types.ObjectId | Team;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  config: Record<string, any>; // Configuration specific to the integration type
  lastSyncAt?: Date;
  errorMessage?: string;
  webhookUrl?: string;
  enabled: boolean;
}

/**
 * Mailgun specific configuration
 */
export interface MailgunConfig {
  apiKey: string;
  webhookSigningKey: string;
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
 * Mailgun inbound message interface
 */
export interface MailgunInboundMessage {
  recipient: string;
  sender: string;
  from: string;
  subject: string;
  bodyPlain: string;
  bodyHtml?: string;
  strippedText?: string;
  strippedHtml?: string;
  attachments?: {
    name: string;
    contentType: string;
    size: number;
    url: string;
  }[];
  messageHeaders: any;
  contentIdMap?: any;
  timestamp: number;
  token: string;
  signature: string;
  messageId?: string;
}
