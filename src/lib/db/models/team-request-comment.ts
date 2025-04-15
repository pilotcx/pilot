import mongoose from 'mongoose';
import { TeamRequestComment } from '@/lib/types/models/team-request';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from '@/lib/db/models/index';

export const TeamRequestCommentSchema = new mongoose.Schema<TeamRequestComment>({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.TeamRequest,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.TeamMember,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

TeamRequestCommentSchema.plugin(mongooseAggregatePaginate);
TeamRequestCommentSchema.plugin(mongoosePaginate);

TeamRequestCommentSchema.set('toJSON', { virtuals: true });
TeamRequestCommentSchema.set('toObject', { virtuals: true });
