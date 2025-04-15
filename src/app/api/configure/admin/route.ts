import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { systemConfigService } from '@/lib/services/system-config';
import { SystemConfigKey } from '@/lib/types/models/system-config';
import { ApiError } from '@/lib/types/errors/api.error';
import { authService } from '@/lib/services/auth';
import { adminAccountSchema } from '@/lib/validations/organization';
import { UserRole } from '@/lib/types/models/user';

export const POST = withApi(async (request: NextRequest) => {
  // Check if system is already configured
  const isConfigured = await systemConfigService.get<boolean>(SystemConfigKey.SystemConfigured, false);
  if (isConfigured) {
    throw new ApiError(403, 'System is already configured');
  }

  // Check if admin step is already completed
  const adminCompleted = await systemConfigService.get<boolean>(SystemConfigKey.ConfigStepAdminCompleted, false);
  if (adminCompleted) {
    throw new ApiError(400, 'Admin account already created');
  }

  const body = await request.json();

  // Validate the request body against the schema
  const result = adminAccountSchema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.errors[0].message);
  }

  const adminAccount = result.data;

  try {
    // Create the admin user
    await authService.register({
      ...adminAccount,
      role: UserRole.Admin,
    });

    // Mark the admin step as completed
    await systemConfigService.set(SystemConfigKey.ConfigStepAdminCompleted, true);

    return {
      message: 'Admin account created successfully',
    };
  } catch (error: any) {
    throw new ApiError(500, error.message || 'Failed to create admin account');
  }
}, {
  preventDb: false,
  protected: false,
});
