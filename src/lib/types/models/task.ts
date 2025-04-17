import {BaseEntity} from "@/lib/types/models/base";
import {Team, TeamMember} from "@/lib/types/models/team";
import {Project} from "@/lib/types/models/project";

export enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Completed = 'completed',
  Overdue = 'overdue',
}

export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Urgent = 4,
}

export interface Task extends BaseEntity {
  title: string;
  description: string;
  status: TaskStatus;
  assignee: TeamMember | string;
  dueDate: Date | string;
  priority: TaskPriority;
  team: Team | string;
  project: Project | string;
}


export enum ColStatus {
  TODO = 'todo',
  OVERDUE = 'overdue',
  IN_PROGRESS = 'in-progress',
  COMPLETE = 'complete',
}
