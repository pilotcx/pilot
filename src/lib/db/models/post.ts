import mongoose from 'mongoose';
import {Post} from '@/lib/types/models/post';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import {Schemas} from "@/lib/db/models/index";

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
  reactionCounts: {
    type: Map,
    of: Number,
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
