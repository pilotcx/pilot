import mongoose from 'mongoose';
import {Post, Reaction, ReactionType} from '@/lib/types/models/post';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import {Schemas} from "@/lib/db/models/index";

const ReactionSchema = new mongoose.Schema<Reaction>({
  type: {
    type: String,
    enum: Object.values(ReactionType),
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.TeamMember,
    required: true,
  },
}, {timestamps: true});

export const PostSchema = new mongoose.Schema<Post>({
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
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.TeamMember,
    required: true,
  },
  reactions: {
    type: Map,
    of: [ReactionSchema],
    default: {},
  },
  commentCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

PostSchema.plugin(mongooseAggregatePaginate);
PostSchema.plugin(mongoosePaginate);

PostSchema.set('toJSON', {virtuals: true});
PostSchema.set('toObject', {virtuals: true});
