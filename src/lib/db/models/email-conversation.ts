import mongoose from 'mongoose';
import { EmailConversation } from '@/lib/types/models/email';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from "@/lib/db/models/index";

export const EmailConversationSchema = new mongoose.Schema<EmailConversation>({
  lastMessageAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  participatedEmails: {
    type: [String],
    default: [],
    index: true
  }
}, {
  timestamps: true,
});

// Add plugins for pagination
EmailConversationSchema.plugin(mongooseAggregatePaginate);
EmailConversationSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
EmailConversationSchema.set('toJSON', { virtuals: true });
EmailConversationSchema.set('toObject', { virtuals: true });

// Create indexes for common queries
EmailConversationSchema.index({ lastMessageAt: -1 });
