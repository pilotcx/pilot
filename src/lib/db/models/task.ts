import mongoose from 'mongoose';
import { Task, TaskStatus, TaskPriority } from '@/lib/types/models/task';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from '@/lib/db/models/index';

export const TaskSchema = new mongoose.Schema<Task>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.Pending,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.TeamMember,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  priority: {
    type: Number,
    default: TaskPriority.Medium,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Team,
    required: true,
    index: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Add plugins for pagination
TaskSchema.plugin(mongooseAggregatePaginate);
TaskSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
TaskSchema.set('toJSON', { virtuals: true });
TaskSchema.set('toObject', { virtuals: true });
