import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { systemConfigService } from '@/lib/services/system-config';
import { ApiError } from '@/lib/types/errors/api.error';
import { UserRole } from '@/lib/types/models/user';

// Get organization settings
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded || decoded.role !== UserRole.Admin) {
    throw new ApiError(403, 'Only administrators can access this resource');
  }

  // Get all organization settings
  const orgSettings = await systemConfigService.getAll();
  
  return {
    data: orgSettings,
    message: 'Organization settings retrieved successfully',
  };
}, {
  protected: true,
  roles: [UserRole.Admin],
});

// Update organization settings
export const PUT = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded || decoded.role !== UserRole.Admin) {
    throw new ApiError(403, 'Only administrators can update organization settings');
  }

  const body = await request.json();
  
  try {
    // Update multiple settings at once
    await systemConfigService.setMultiple(body);
    
    return {
      data: null,
      message: 'Organization settings updated successfully',
    };
  } catch (error: any) {
    throw new ApiError(500, error.message || 'Failed to update organization settings');
  }
}, {
  protected: true,
  roles: [UserRole.Admin],
});
