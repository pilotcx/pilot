import mongoose from 'mongoose';
import {SystemConfig, SystemConfigKey} from '@/lib/types/models/system-config';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';

export const SystemConfigSchema = new mongoose.Schema<SystemConfig>({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
    enum: Object.values(SystemConfigKey),
  },
  value: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Add virtual getter for parsedValue
SystemConfigSchema.virtual('parsedValue').get(function() {
  try {
    return JSON.parse(this.value);
  } catch (error) {
    // If parsing fails, return the raw value
    return this.value;
  }
});

// Add plugins for pagination
SystemConfigSchema.plugin(mongooseAggregatePaginate);
SystemConfigSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
SystemConfigSchema.set('toJSON', { virtuals: true });
SystemConfigSchema.set('toObject', { virtuals: true });
