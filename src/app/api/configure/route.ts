import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {systemConfigService} from '@/lib/services/system-config';
import {SystemConfigKey} from '@/lib/types/models/system-config';
import {ApiError} from '@/lib/types/errors/api.error';
import {authService} from '@/lib/services/auth';
import {organizationSetupSchema} from '@/lib/validations/organization';
import {UserRole} from '@/lib/types/models/user';

/**
 * Legacy endpoint for the old configuration flow.
 * This is kept for backward compatibility but new code should use the step-by-step endpoints.
 */
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
    // Create admin user
    const adminUser = await authService.register({
      ...adminAccount,
      role: UserRole.Admin,
    });

    // Save organization info
    await systemConfigService.setMultiple({
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

    // Mark all steps as completed
    await systemConfigService.setMultiple({
      [SystemConfigKey.ConfigStepAdminCompleted]: true,
      [SystemConfigKey.ConfigStepOrgCompleted]: true,
      [SystemConfigKey.ConfigStepFeaturesCompleted]: true,
      [SystemConfigKey.SystemConfigured]: true,
    });

    return await authService.login(adminUser, 'web');
  } catch (error: any) {
    // Reset configuration state
    await systemConfigService.setMultiple({
      [SystemConfigKey.ConfigStepAdminCompleted]: false,
      [SystemConfigKey.ConfigStepOrgCompleted]: false,
      [SystemConfigKey.ConfigStepFeaturesCompleted]: false,
      [SystemConfigKey.SystemConfigured]: false,
    });

    throw new ApiError(500, error.message || 'Failed to configure system');
  }
}, {
  preventDb: false,
  protected: false,
});
