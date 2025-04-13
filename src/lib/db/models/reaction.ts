import mongoose from 'mongoose';
import { ReactionType } from '@/lib/types/models/post';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from '@/lib/db/models/index';

// Define the Reaction schema
export const ReactionSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Post,
    required: true,
    index: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.TeamMember,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(ReactionType),
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Create a compound index for unique reactions per user per post
ReactionSchema.index({ post: 1, member: 1, type: 1 }, { unique: true });

// Add plugins for pagination
ReactionSchema.plugin(mongooseAggregatePaginate);
ReactionSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
ReactionSchema.set('toJSON', { virtuals: true });
ReactionSchema.set('toObject', { virtuals: true });


