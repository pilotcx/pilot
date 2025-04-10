import {BaseEntity} from "@/lib/types/models/base";
import {TeamMember} from "@/lib/types/models/team";

export enum TaskStatus {
  Pending = 'pending',
  Completed = 'completed',
}

export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
}

export interface Task extends BaseEntity {
  title: string;
  description: string;
  status: TaskStatus;
  assignee: TeamMember | string;
  dueDate: Date | string;
  priority: TaskPriority;
}
