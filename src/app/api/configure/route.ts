import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {systemConfigService} from '@/lib/services/system-config';
import {SystemConfigKey} from '@/lib/types/models/system-config';
import {ApiError} from '@/lib/types/errors/api.error';
import {authService} from '@/lib/services/auth';
import {organizationSetupSchema} from '@/lib/validations/organization';
import {UserRole} from '@/lib/types/models/user';

export const POST = withApi(async (request: NextRequest) => {
  const isConfigured = await systemConfigService.get<boolean>(SystemConfigKey.SystemConfigured, false);

  if (isConfigured) {
    throw new ApiError(403, 'System is already configured');
  }

  const body = await request.json();

  // Validate the request body against the schema
  const result = organizationSetupSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.errors[0].message);
  }

  const {adminAccount, organization} = result.data;

  try {
    const adminUser = await authService.register({
      ...adminAccount,
      role: UserRole.Admin,
    });

    await systemConfigService.setMultiple({
      [SystemConfigKey.SystemConfigured]: true,
      [SystemConfigKey.OrgName]: organization.name,
      [SystemConfigKey.OrgDesc]: organization.description || '',
      [SystemConfigKey.OrgIndustry]: organization.industry,
      [SystemConfigKey.OrgSize]: organization.size,
      [SystemConfigKey.OrgStructure]: organization.organizationStructure,
      [SystemConfigKey.OrgAllowRegistration]: organization.allowRegistration,
      [SystemConfigKey.OrgTeamCreationPermission]: organization.teamCreationPermission,
      [SystemConfigKey.OrgEmail]: organization.email,
      [SystemConfigKey.OrgPhone]: organization.phone || '',
      [SystemConfigKey.OrgWebsite]: organization.website || '',
      [SystemConfigKey.OrgAddress]: organization.address || '',
      [SystemConfigKey.OrgState]: organization.state || '',
      [SystemConfigKey.OrgPostalCode]: organization.postalCode || '',
    });

    return await authService.login(adminUser, 'web');
  } catch (error: any) {
    await systemConfigService.set(SystemConfigKey.SystemConfigured, false);
    throw new ApiError(500, error.message || 'Failed to configure system');
  }
}, {
  preventDb: false,
  protected: false,
});
