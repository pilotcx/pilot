import mongoose from 'mongoose';
import { MailgunEvent, MailgunEventType } from '@/lib/types/models/mailgun';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from "@/lib/db/models/index";

export const MailgunEventSchema = new mongoose.Schema<MailgunEvent>({
  integration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MailgunIntegration',
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    enum: Object.values(MailgunEventType),
    required: true,
    index: true,
  },
  messageId: {
    type: String,
    required: true,
    index: true,
  },
  recipient: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  processed: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

// Add plugins for pagination
MailgunEventSchema.plugin(mongooseAggregatePaginate);
MailgunEventSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
MailgunEventSchema.set('toJSON', { virtuals: true });
MailgunEventSchema.set('toObject', { virtuals: true });

// Create indexes for common queries
MailgunEventSchema.index({ integration: 1, eventType: 1 });
MailgunEventSchema.index({ integration: 1, timestamp: -1 });
