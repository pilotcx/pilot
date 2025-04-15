import mongoose from 'mongoose';
import { TeamMember, TeamRole } from '@/lib/types/models/team';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import {Schemas} from "@/lib/db/models/index";

export const TeamMemberSchema = new mongoose.Schema<TeamMember>({
  displayName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(TeamRole),
    default: TeamRole.Member,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.User,
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Team,
    required: true,
  },
}, {
  timestamps: true,
});

// Add plugins for pagination
TeamMemberSchema.plugin(mongooseAggregatePaginate);
TeamMemberSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
TeamMemberSchema.set('toJSON', { virtuals: true });
TeamMemberSchema.set('toObject', { virtuals: true });
