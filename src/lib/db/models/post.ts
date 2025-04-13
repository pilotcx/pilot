import mongoose from 'mongoose';
import {Post, ReactionType} from '@/lib/types/models/post';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import {Schemas} from "@/lib/db/models/index";

const ReactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(ReactionType),
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

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
