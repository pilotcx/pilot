import mongoose from 'mongoose';
import { EmailConversation } from '@/lib/types/models/email';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from "@/lib/db/models/index";

export const EmailConversationSchema = new mongoose.Schema<EmailConversation>({
  subject: {
    type: String,
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.User,
    required: true,
  }],
  lastEmailAt: {
    type: Date,
    default: Date.now,
  },
  emailCount: {
    type: Number,
    default: 1,
  },
  labels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailLabel',
  }],
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
EmailConversationSchema.index({ participants: 1 });
EmailConversationSchema.index({ lastEmailAt: -1 });
EmailConversationSchema.index({ labels: 1 });
