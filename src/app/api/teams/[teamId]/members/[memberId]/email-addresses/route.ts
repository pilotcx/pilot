import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailAddressService } from '@/lib/services/email-address';
import { ApiError } from '@/lib/types/errors/api.error';
import { z } from 'zod';
import { EmailAddressType } from '@/lib/types/models/email-address';
import { teamService } from '@/lib/services/team';
import { TeamRole } from '@/lib/types/models/team';

// Validation schema for creating an email address
const createEmailAddressSchema = z.object({
  localPart: z.string().min(1, 'Local part is required'),
  domainId: z.string().min(1, 'Domain ID is required'),
  displayName: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// Get all email addresses for a team member
export const GET = withApi(async (request: NextRequest, { params }: { params: { teamId: string, memberId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { teamId, memberId } = params;
  
  // Check if user has access to the team
  const { membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }
  
  // Get the email addresses
  const emailAddresses = await emailAddressService.getTeamMemberEmailAddresses(teamId, memberId);

  return {
    data: emailAddresses,
    message: 'Email addresses retrieved successfully',
  };
}, {
  protected: true,
});

// Create a new email address for a team member
export const POST = withApi(async (request: NextRequest, { params }: { params: { teamId: string, memberId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { teamId, memberId } = params;
  
  // Check if user has permission to manage team members
  const { membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership || ![TeamRole.Owner, TeamRole.Manager].includes(membership.role as TeamRole)) {
    throw new ApiError(403, 'You do not have permission to manage email addresses for this team member');
  }
  
  // Parse and validate request body
  const body = await request.json();
  const result = createEmailAddressSchema.safeParse(body);
  
  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }
  
  const { localPart, domainId, displayName, isDefault } = result.data;
  
  // Check if the domain belongs to the team
  const domain = await emailAddressService.getDomainById(domainId);
  if (!domain || domain.team.toString() !== teamId) {
    throw new ApiError(400, 'Invalid domain. The domain must belong to the team.');
  }
  
  const emailAddress = await emailAddressService.createEmailAddress(
    teamId,
    memberId,
    localPart,
    domainId,
    displayName,
    EmailAddressType.Alias,
    isDefault
  );

  return {
    data: emailAddress,
    message: 'Email address created successfully',
  };
}, {
  protected: true,
});
