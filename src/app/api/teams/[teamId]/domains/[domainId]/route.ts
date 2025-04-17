import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { domainService } from '@/lib/services/domain';
import { ApiError } from '@/lib/types/errors/api.error';
import { z } from 'zod';

// Validation schema for domain updates
const updateDomainSchema = z.object({
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Get a specific domain
export const GET = withApi(async (request: NextRequest, { params }: { params: { teamId: string, domainId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { domainId } = params;
  
  const domain = await domainService.getDomainById(domainId, decoded.id);

  return {
    data: domain,
    message: 'Domain retrieved successfully',
  };
}, {
  protected: true,
});

// Update a domain
export const PATCH = withApi(async (request: NextRequest, { params }: { params: { teamId: string, domainId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { domainId } = params;
  
  // Parse and validate request body
  const body = await request.json();
  const result = updateDomainSchema.safeParse(body);
  
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }
  
  const domain = await domainService.updateDomain(domainId, decoded.id, result.data);

  return {
    data: domain,
    message: 'Domain updated successfully',
  };
}, {
  protected: true,
});

// Delete a domain
export const DELETE = withApi(async (request: NextRequest, { params }: { params: { teamId: string, domainId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { domainId } = params;
  
  await domainService.deleteDomain(domainId, decoded.id);

  return {
    data: null,
    message: 'Domain deleted successfully',
  };
}, {
  protected: true,
});
