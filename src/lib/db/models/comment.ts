import mongoose from 'mongoose';
import {Comment} from '@/lib/types/models/post';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import {Schemas} from "@/lib/db/models/index";

export const CommentSchema = new mongoose.Schema<Comment>({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Post,
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
  },
}, {
  timestamps: true,
});

CommentSchema.plugin(mongooseAggregatePaginate);
CommentSchema.plugin(mongoosePaginate);

CommentSchema.set('toJSON', {virtuals: true});
CommentSchema.set('toObject', {virtuals: true});

