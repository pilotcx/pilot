import mongoose from 'mongoose';
import { ObjectiveStatus, KeyResultStatus } from '@/lib/types/models/okr';
import { Schemas } from '@/lib/db/models/index';

export const ObjectiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: Object.values(ObjectiveStatus),
    default: ObjectiveStatus.NOT_STARTED,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
}, {
  timestamps: true,
});

export const KeyResultSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: Object.values(KeyResultStatus),
    default: KeyResultStatus.NOT_STARTED,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  target: {
    type: Number,
    required: true,
  },
  current: {
    type: Number,
    required: true,
    default: 0,
  },
  unit: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  objective: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Objective',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: false,
  },
}, {
  timestamps: true,
});

// Add virtual field for keyResults in Objective model
ObjectiveSchema.virtual('keyResults', {
  ref: 'KeyResult',
  localField: '_id',
  foreignField: 'objective',
});

// Ensure virtuals are included in JSON output
ObjectiveSchema.set('toJSON', { virtuals: true });
ObjectiveSchema.set('toObject', { virtuals: true });

// Update objective progress when key result progress changes
KeyResultSchema.post('save', async function(this: any, doc: any) {
  const objective = await mongoose.model('Objective').findById(doc.objective);
  if (objective) {
    const keyResults = await mongoose.model('KeyResult').find({ objective: objective._id });
    const totalProgress = keyResults.reduce((sum, kr) => sum + kr.progress, 0);
    const averageProgress = Math.round(totalProgress / keyResults.length);
    
    objective.progress = averageProgress;
    if (averageProgress === 100) {
      objective.status = ObjectiveStatus.COMPLETED;
    } else if (averageProgress > 0) {
      objective.status = ObjectiveStatus.IN_PROGRESS;
    }
    await objective.save();
  }
});

// Update objective progress when key result is deleted
KeyResultSchema.pre('deleteOne', { document: true, query: false }, async function(this: any) {
  const objective = await mongoose.model('Objective').findById(this.objective);
  if (objective) {
    const keyResults = await mongoose.model('KeyResult').find({ objective: objective._id });
    if (keyResults.length === 0) {
      objective.progress = 0;
      objective.status = ObjectiveStatus.NOT_STARTED;
    } else {
      const totalProgress = keyResults.reduce((sum, kr) => sum + kr.progress, 0);
      objective.progress = Math.round(totalProgress / keyResults.length);
    }
    await objective.save();
  }
});
