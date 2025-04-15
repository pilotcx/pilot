import mongoose from 'mongoose';
import { Project } from '@/lib/types/models/project';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from '@/lib/db/models/index';

export const ProjectSchema = new mongoose.Schema<Project>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Team,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Add plugins for pagination
ProjectSchema.plugin(mongooseAggregatePaginate);
ProjectSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });
