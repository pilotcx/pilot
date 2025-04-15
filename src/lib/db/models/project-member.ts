import mongoose from 'mongoose';
import { ProjectMember, ProjectRole } from '@/lib/types/models/project';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Schemas } from '@/lib/db/models/index';

export const ProjectMemberSchema = new mongoose.Schema<ProjectMember>({
  role: {
    type: String,
    enum: Object.values(ProjectRole),
    default: ProjectRole.Member,
  },
  teamMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.TeamMember,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Schemas.Project,
    required: true,
  },
  displayName: {
    type: String,
  },
}, {
  timestamps: true,
});

// Create a compound index to ensure a team member can only be added once to a project
ProjectMemberSchema.index({ teamMember: 1, project: 1 }, { unique: true });

// Add plugins for pagination
ProjectMemberSchema.plugin(mongooseAggregatePaginate);
ProjectMemberSchema.plugin(mongoosePaginate);

// Set toJSON and toObject options to include virtuals
ProjectMemberSchema.set('toJSON', { virtuals: true });
ProjectMemberSchema.set('toObject', { virtuals: true });
