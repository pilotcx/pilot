import mongoose from 'mongoose';
import { Integration, IntegrationStatus, IntegrationType } from '@/lib/types/models/integration';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from "@/lib/db/models/index";

export const IntegrationSchema = new mongoose.Schema<Integration>({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Team,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(IntegrationType),
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(IntegrationStatus),
    default: IntegrationStatus.Pending,
    index: true,
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    // Use a getter/setter to encrypt/decrypt sensitive data
    get: function(data: any) {
      // In a real implementation, you might decrypt sensitive fields here
      return data;
    },
    set: function(data: any) {
      // In a real implementation, you might encrypt sensitive fields here
      return data;
    }
  },
  lastSyncAt: {
    type: Date,
  },
  errorMessage: {
    type: String,
  },
  webhookUrl: {
    type: String,
  },
  enabled: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Add plugins for pagination
IntegrationSchema.plugin(mongooseAggregatePaginate);
IntegrationSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
IntegrationSchema.set('toJSON', { virtuals: true });
IntegrationSchema.set('toObject', { virtuals: true });

// Create a compound index for team and type to ensure uniqueness per team per integration type
IntegrationSchema.index({ team: 1, type: 1 }, { unique: true });
