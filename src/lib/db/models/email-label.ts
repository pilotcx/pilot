import mongoose from 'mongoose';
import { EmailLabel } from '@/lib/types/models/email';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from "@/lib/db/models/index";

export const EmailLabelSchema = new mongoose.Schema<EmailLabel>({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
    default: '#3B82F6', // Default blue color
  },
  description: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.User,
    required: true,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Add plugins for pagination
EmailLabelSchema.plugin(mongooseAggregatePaginate);
EmailLabelSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
EmailLabelSchema.set('toJSON', { virtuals: true });
EmailLabelSchema.set('toObject', { virtuals: true });

// Create a compound index to ensure a user can't have duplicate label names
EmailLabelSchema.index({ user: 1, name: 1 }, { unique: true });
