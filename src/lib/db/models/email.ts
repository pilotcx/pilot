import mongoose from 'mongoose';
import { Email, EmailPriority, EmailStatus, EmailType } from '@/lib/types/models/email';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from "@/lib/db/models/index";



// Email attachment schema
const EmailAttachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
}, { _id: false });

export const EmailSchema = new mongoose.Schema<Email>({
  // Conversation reference
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailConversation',
    required: true,
  },

  // Recipient information
  recipient: {
    type: String,
    required: true,
  },

  // Email addresses
  from: {
    type: String,
    required: true,
  },
  to: {
    type: [String],
    required: true,
    validate: {
      validator: function(to: string[]) {
        return to.length > 0;
      },
      message: 'At least one recipient is required',
    },
  },
  cc: {
    type: [String],
    default: [],
  },
  bcc: {
    type: [String],
    default: [],
  },

  // Content
  subject: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  html: {
    type: String,
    required: true,
  },

  // Attachments
  attachments: {
    type: [EmailAttachmentSchema],
    default: [],
  },

  // Message IDs for threading
  messageId: {
    type: String,
    required: true,
    index: true,
  },
  inReplyTo: {
    type: String,
    index: true,
  },

  // Status
  isRead: {
    type: Boolean,
    default: false,
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: true,
  },
}, {
  timestamps: true,
});

// Add plugins for pagination
EmailSchema.plugin(mongooseAggregatePaginate);
EmailSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
EmailSchema.set('toJSON', { virtuals: true });
EmailSchema.set('toObject', { virtuals: true });

// Create indexes for common queries
EmailSchema.index({ conversation: 1 });
EmailSchema.index({ from: 1 });
EmailSchema.index({ to: 1 });
EmailSchema.index({ direction: 1 });
EmailSchema.index({ isRead: 1 });
