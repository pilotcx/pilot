import {BaseEntity} from "@/lib/types/models/base";

export enum TeamRole {
  Owner = 'owner',
  Manager = 'manager',
  Member = 'member'
}

export interface Team extends BaseEntity {
  name: string;
  description: string;
  avatar: string;
  membersCount: number;
  tasksCount: number;
}

export interface TeamMember extends BaseEntity {
  displayName: string;
  role: TeamRole;
}
