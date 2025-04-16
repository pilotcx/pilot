import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { systemConfigService } from '@/lib/services/system-config';
import { ApiError } from '@/lib/types/errors/api.error';
import { UserRole } from '@/lib/types/models/user';

// Get system configuration
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded || decoded.role !== UserRole.Admin) {
    throw new ApiError(403, 'Only administrators can access this resource');
  }

  // Get all system configuration
  const systemConfig = await systemConfigService.getAll();
  
  return {
    data: systemConfig,
    message: 'System configuration retrieved successfully',
  };
}, {
  protected: true,
  roles: [UserRole.Admin],
});

// Update system configuration
export const PUT = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded || decoded.role !== UserRole.Admin) {
    throw new ApiError(403, 'Only administrators can update system configuration');
  }

  const body = await request.json();
  
  try {
    // Update multiple settings at once
    await systemConfigService.setMultiple(body);
    
    return {
      data: null,
      message: 'System configuration updated successfully',
    };
  } catch (error: any) {
    throw new ApiError(500, error.message || 'Failed to update system configuration');
  }
}, {
  protected: true,
  roles: [UserRole.Admin],
});
