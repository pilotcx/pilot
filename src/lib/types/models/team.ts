import {BaseEntity} from "@/lib/types/models/base";
import mongoose from "mongoose";
import {User} from "@/lib/types/models/user";

export enum TeamRole {
  Owner = 'owner',
  Manager = 'manager',
  Member = 'member'
}

export interface Team extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  avatar: string;
  membersCount: number;
  tasksCount: number;
}

export interface TeamMember extends BaseEntity {
  displayName: string;
  role: TeamRole;
  avatar?: string;
  email?: string;
  user: string | mongoose.Types.ObjectId | User;
  team: string | mongoose.Types.ObjectId | Team;
}
