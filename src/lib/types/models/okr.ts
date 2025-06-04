import { BaseEntity } from './base';
import { Team } from './team';
import { User } from './user';
import { Task } from './task';

export enum ObjectiveStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  AT_RISK = 'AT_RISK',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
export enum KeyResultStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  AT_RISK = 'AT_RISK',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Objective extends BaseEntity {
  _id: string;
  title: string;
  description?: string;
  status: ObjectiveStatus;
  progress: number; // 0-100
  dueDate: Date;
  owner: string | User;
  team: any;
  keyResults: string[] | KeyResult[];
}

export interface KeyResult extends BaseEntity {
  _id: string;
  title: string;
  description?: string;
  status: KeyResultStatus;
  progress: number; // 0-100
  target: number;
  current: number;
  unit: string;
  dueDate: Date;
  objective: string | Objective;
  owner: string | User;
  task?: string | Task;
}

export interface CreateObjectiveInput {
  title: string;
  description?: string;
  dueDate: Date;
  teamId: string;
  ownerId: string;
}

export interface UpdateObjectiveInput {
  title?: string;
  description?: string;
  status?: ObjectiveStatus;
  progress?: number;
  dueDate?: Date;
  ownerId?: string;
}

export interface CreateKeyResultInput {
  title: string;
  description?: string;
  target: number;
  current: number;
  unit: string;
  dueDate: Date;
  objectiveId: string;
  ownerId: string;
  taskId?: string;
}

export interface UpdateKeyResultInput {
  title?: string;
  description?: string;
  status?: KeyResultStatus;
  progress?: number;
  target?: number;
  current?: number;
  unit?: string;
  dueDate?: Date;
  ownerId?: string;
} 