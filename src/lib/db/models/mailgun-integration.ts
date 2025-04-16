import mongoose from 'mongoose';
import { MailgunIntegration, MailgunIntegrationStatus } from '@/lib/types/models/mailgun';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from "@/lib/db/models/index";

export const MailgunIntegrationSchema = new mongoose.Schema<MailgunIntegration>({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Team,
    required: true,
    index: true,
  },
  apiKey: {
    type: String,
    required: true,
    select: false, // Don't return API key in queries by default
  },
  domain: {
    type: String,
    required: true,
  },
  webhookSigningKey: {
    type: String,
    required: true,
    select: false, // Don't return signing key in queries by default
  },
  fromEmail: {
    type: String,
    required: true,
  },
  fromName: {
    type: String,
    required: true,
  },
  replyToEmail: {
    type: String,
  },
  status: {
    type: String,
    enum: Object.values(MailgunIntegrationStatus),
    default: MailgunIntegrationStatus.Pending,
    index: true,
  },
  lastSyncAt: {
    type: Date,
  },
  errorMessage: {
    type: String,
  },
  inboundRoute: {
    type: String,
  },
  inboundEnabled: {
    type: Boolean,
    default: false,
  },
  outboundEnabled: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Add plugins for pagination
MailgunIntegrationSchema.plugin(mongooseAggregatePaginate);
MailgunIntegrationSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
MailgunIntegrationSchema.set('toJSON', { virtuals: true });
MailgunIntegrationSchema.set('toObject', { virtuals: true });

// Create a unique index for team to ensure one integration per team
MailgunIntegrationSchema.index({ team: 1 }, { unique: true });
