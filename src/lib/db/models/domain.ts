import mongoose from 'mongoose';
import { Domain, DomainType, DomainVerificationStatus } from '@/lib/types/models/domain';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from "@/lib/db/models/index";

export const DomainSchema = new mongoose.Schema<Domain>({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Team,
    required: true,
    index: true
  },
  integration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Integration,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(DomainType),
    required: true,
    default: DomainType.Manual,
    index: true
  },
  verificationStatus: {
    type: String,
    enum: Object.values(DomainVerificationStatus),
    default: DomainVerificationStatus.Verified,
    index: true
  },
  // Default domain functionality removed
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Add plugins for pagination
DomainSchema.plugin(mongooseAggregatePaginate);
DomainSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
DomainSchema.set('toJSON', { virtuals: true });
DomainSchema.set('toObject', { virtuals: true });

// Create a compound index for team and domain name to ensure uniqueness
DomainSchema.index({ team: 1, name: 1 }, { unique: true });
