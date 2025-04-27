import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { systemConfigService } from '@/lib/services/system-config';
import { SystemConfigKey } from '@/lib/types/models/system-config';
import { ApiError } from '@/lib/types/errors/api.error';

export const POST = withApi(async (request: NextRequest) => {
  // Check if system is already configured
  const isConfigured = await systemConfigService.get<boolean>(SystemConfigKey.SystemConfigured, false);
  if (isConfigured) {
    throw new ApiError(403, 'System is already configured');
  }

  // Check if previous steps are completed
  const adminCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepAdminCompleted, false);
  if (!adminCompleted) {
    throw new ApiError(400, 'Admin account must be created first');
  }

  const orgCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepOrgCompleted, false);
  if (!orgCompleted) {
    throw new ApiError(400, 'Organization information must be saved first');
  }

  // Check if features step is already completed
  const featuresCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepFeaturesCompleted, false);
  if (featuresCompleted) {
    throw new ApiError(400, 'Features step already completed');
  }

  try {
    // Mark the features step as completed
    await systemConfigService.set(SystemConfigKey.ConfigStepFeaturesCompleted, true);
    
    // Mark the system as configured
    await systemConfigService.set(SystemConfigKey.SystemConfigured, true);
    
    systemConfigService.clearCache();

    return {
      message: 'Configuration completed successfully',
    };
  } catch (error: any) {
    throw new ApiError(500, error.message || 'Failed to complete configuration');
  }
}, {
  preventDb: false,
  protected: false,
});
