import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { systemConfigService } from '@/lib/services/system-config';
import { SystemConfigKey } from '@/lib/types/models/system-config';
import { ApiError } from '@/lib/types/errors/api.error';
import { organizationCompleteSchema } from '@/lib/validations/organization';

export const POST = withApi(async (request: NextRequest) => {
  // Check if system is already configured
  const isConfigured = await systemConfigService.get<boolean>(SystemConfigKey.SystemConfigured, false);
  if (isConfigured) {
    throw new ApiError(403, 'System is already configured');
  }

  // Check if admin step is completed
  const adminCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepAdminCompleted, false);
  if (!adminCompleted) {
    throw new ApiError(400, 'Admin account must be created first');
  }

  // Check if organization step is already completed
  const orgCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepOrgCompleted, false);
  if (orgCompleted) {
    throw new ApiError(400, 'Organization information already saved');
  }

  const body = await request.json();

  // Validate the request body against the schema
  const result = organizationCompleteSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.errors[0].message);
  }

  const organization = result.data;

  try {
    // Save the organization information
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

    // Mark the organization step as completed
    await systemConfigService.set(SystemConfigKey.ConfigStepOrgCompleted, true);

    return {
      message: 'Organization information saved successfully',
    };
  } catch (error: any) {
    throw new ApiError(500, error.message || 'Failed to save organization information');
  }
}, {
  preventDb: false,
  protected: false,
});
