import {BaseEntity} from "@/lib/types/models/base";

export enum SystemConfigKey {
  SystemConfigured = 'system_configured',
  // Configuration step tracking
  ConfigStepAdminCompleted = 'config_step_admin_completed',
  ConfigStepOrgCompleted = 'config_step_org_completed',
  ConfigStepFeaturesCompleted = 'config_step_features_completed',
  // Organization info
  OrgName = 'org_name',
  OrgDesc = 'org_desc',
  OrgAvatar = 'org_avatar',
  OrgIndustry = 'org_industry',
  OrgSize = 'org_size',
  OrgStructure = 'org_organization_structure',
  OrgAllowRegistration = 'org_allow_registration',
  OrgTeamCreationPermission = 'org_team_creation_permission',
  OrgEmail = 'org_email',
  OrgPhone = 'org_phone',
  OrgWebsite = 'org_website',
  OrgAddress = 'org_address',
  OrgState = 'org_state',
  OrgPostalCode = 'org_postal_code',
}

export interface SystemConfig extends BaseEntity {
  key: SystemConfigKey;
  value: string;
  parsedValue?: any;
}

export type SystemMappedConfig = {
  [key in SystemConfigKey]?: any;
}
