import mongoose from 'mongoose';
import { Team } from '@/lib/types/models/team';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';

export const TeamSchema = new mongoose.Schema<Team>({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  membersCount: {
    type: Number,
    default: 0,
  },
  tasksCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Add plugins for pagination
TeamSchema.plugin(mongooseAggregatePaginate);
TeamSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
TeamSchema.set('toJSON', { virtuals: true });
TeamSchema.set('toObject', { virtuals: true });
