import {BaseEntity} from "@/lib/types/models/base";

export enum SystemConfigKey {
  SystemConfigured = 'system_configured',
  OrgName = 'org_name',
  OrgDesc = 'org_desc',
  OrgAvatar = 'org_avatar',
  OrgAllowMultiTeam = 'org_allow_multi_team',
  OrgAllowTeamCreationEveryone = 'org_allow_team_creation_everyone',
}

export interface SystemConfig extends BaseEntity {
  key: SystemConfigKey;
  value: string;
  parsedValue?: any;
}

export type SystemMappedConfig = {
  [key in SystemConfigKey]?: any;
}
