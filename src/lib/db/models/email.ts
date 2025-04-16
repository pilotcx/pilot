import mongoose from 'mongoose';
import { Email, EmailPriority, EmailStatus } from '@/lib/types/models/email';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from "@/lib/db/models/index";

// Email recipient schema
const EmailRecipientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  type: {
    type: String,
    enum: ['to', 'cc', 'bcc'],
    required: true,
  },
}, { _id: false });

// Email attachment schema
const EmailAttachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  path: {
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
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  bodyType: {
    type: String,
    enum: ['text', 'html'],
    default: 'html',
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.User,
    required: true,
  },
  recipients: {
    type: [EmailRecipientSchema],
    required: true,
    validate: {
      validator: function(recipients: any[]) {
        return recipients.length > 0;
      },
      message: 'At least one recipient is required',
    },
  },
  attachments: {
    type: [EmailAttachmentSchema],
    default: [],
  },
  status: {
    type: String,
    enum: Object.values(EmailStatus),
    default: EmailStatus.Draft,
  },
  priority: {
    type: String,
    enum: Object.values(EmailPriority),
    default: EmailPriority.Normal,
  },
  labels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailLabel',
  }],
  
  // For email threading/conversation
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailConversation',
  },
  parentEmail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
  },
  
  // Metadata
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.User,
  }],
  isStarred: {
    type: Boolean,
    default: false,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  sentAt: {
    type: Date,
  },
  scheduledFor: {
    type: Date,
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
EmailSchema.index({ sender: 1 });
EmailSchema.index({ conversationId: 1 });
EmailSchema.index({ 'recipients.email': 1 });
EmailSchema.index({ status: 1 });
EmailSchema.index({ labels: 1 });
