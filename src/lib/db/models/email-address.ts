import mongoose from 'mongoose';
import { EmailAddress, EmailAddressStatus, EmailAddressType } from '@/lib/types/models/email-address';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from "@/lib/db/models/index";

export const EmailAddressSchema = new mongoose.Schema<EmailAddress>({
  localPart: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Domain,
    required: true,
    index: true
  },
  teamMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.TeamMember,
    required: true,
    index: true
  },
  displayName: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(EmailAddressStatus),
    default: EmailAddressStatus.Active,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(EmailAddressType),
    default: EmailAddressType.Alias,
    index: true
  },
  isDefault: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add plugins for pagination
EmailAddressSchema.plugin(mongooseAggregatePaginate);
EmailAddressSchema.plugin(mongoosePaginate);

// Add virtual for full email address
EmailAddressSchema.virtual('fullAddress').get(function(this: any) {
  if (this.domain && typeof this.domain === 'object' && this.domain.name) {
    return `${this.localPart}@${this.domain.name}`;
  }
  return null;
});

// Create a compound index for team member and local part + domain to ensure uniqueness
EmailAddressSchema.index({ teamMember: 1, localPart: 1, domain: 1 }, { unique: true });

// Create an index for domain to ensure uniqueness of local part within a domain
EmailAddressSchema.index({ localPart: 1, domain: 1 }, { unique: true });
