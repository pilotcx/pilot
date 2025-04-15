import {BaseEntity} from "@/lib/types/models/base";
import {Team, TeamMember} from "@/lib/types/models/team";

export interface Project extends BaseEntity {
  name: string;
  avatar: string;
  description: string;
  code: string;
  team: Team | string;
}

export enum ProjectRole {
  Owner = 'owner',
  Maintainer = 'maintainer',
  Member = 'member'
}

export interface ProjectMember extends BaseEntity {
  role: ProjectRole;
  teamMember: TeamMember | string;
  project: Project | string;
  displayName?: string;
}
