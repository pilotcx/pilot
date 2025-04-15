import mongoose from 'mongoose';
import { TeamRequest, TeamRequestStatus } from '@/lib/types/models/team-request';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from '@/lib/db/models/index';

export const TeamRequestSchema = new mongoose.Schema<TeamRequest>({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Team,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.TeamMember,
    required: true,
    index: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.TeamMember,
    index: true,
  },
  status: {
    type: String,
    enum: Object.values(TeamRequestStatus),
    default: TeamRequestStatus.PENDING,
    index: true,
  },
  responder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.TeamMember,
    index: true,
  },
  responseNote: {
    type: String,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

TeamRequestSchema.plugin(mongooseAggregatePaginate);
TeamRequestSchema.plugin(mongoosePaginate);

TeamRequestSchema.set('toJSON', { virtuals: true });
TeamRequestSchema.set('toObject', { virtuals: true });
