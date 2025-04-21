import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { domainService } from '@/lib/services/domain';
import { ApiError } from '@/lib/types/errors/api.error';
import { z } from 'zod';
import { DomainType } from '@/lib/types/models/domain';

// Validation schema for domain creation
const createDomainSchema = z.object({
  name: z.string().min(1, 'Domain name is required'),
  type: z.enum([DomainType.Manual, DomainType.Primary, DomainType.Secondary, DomainType.Integration]),
  isDefault: z.boolean().optional(),
});

// Get all domains for a team
export const GET = withApi(async (request: NextRequest, { params }: { params: { teamId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = params.teamId;
  
  const domains = await domainService.getTeamDomains(teamId, decoded.id);

  return {
    data: domains,
    message: 'Domains retrieved successfully',
  };
}, {
  protected: true,
});

// Create a new domain for a team
export const POST = withApi(async (request: NextRequest, { params }: { params: { teamId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = params.teamId;
  
  // Parse and validate request body
  const body = await request.json();
  const result = createDomainSchema.safeParse(body);
  
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }
  
  const domain = await domainService.createDomain(teamId, result.data, decoded.id);

  return {
    data: domain,
    message: 'Domain created successfully',
  };
}, {
  protected: true,
});
