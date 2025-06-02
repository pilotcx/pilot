import { BaseEntity } from './base';
import { Team } from './team';
import { User } from './user';

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
  startDate: Date;
  endDate: Date;
  owner: User;
  team: Team;
  keyResults: KeyResult[];
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
  startDate: Date;
  endDate: Date;
  objective: Objective;
  owner: User;
}

export interface CreateObjectiveInput {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  teamId: string;
  ownerId: string;
}

export interface UpdateObjectiveInput {
  title?: string;
  description?: string;
  status?: ObjectiveStatus;
  progress?: number;
  startDate?: Date;
  endDate?: Date;
  ownerId?: string;
}

export interface CreateKeyResultInput {
  title: string;
  description?: string;
  target: number;
  current: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  objectiveId: string;
  ownerId: string;
}

export interface UpdateKeyResultInput {
  title?: string;
  description?: string;
  status?: KeyResultStatus;
  progress?: number;
  target?: number;
  current?: number;
  unit?: string;
  startDate?: Date;
  endDate?: Date;
  ownerId?: string;
} 