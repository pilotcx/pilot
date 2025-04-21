import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {emailAddressService} from '@/lib/services/email-address';
import {ApiError} from '@/lib/types/errors/api.error';
import {z} from 'zod';
import {teamService} from '@/lib/services/team';
import {TeamRole} from '@/lib/types/models/team';

// Validation schema for updating an email address
const updateEmailAddressSchema = z.object({
  displayName: z.string().optional(),
  isDefault: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// Get a specific email address
export const GET = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ teamId: string, memberId: string, emailAddressId: string }>
}, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const {teamId, memberId, emailAddressId} = await params;

  // Check if user has access to the team
  const {membership} = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  const emailAddress = await emailAddressService.getEmailAddressById(emailAddressId);

  // Check if the email address belongs to the team member
  if (emailAddress.teamMember.toString() !== memberId) {
    throw new ApiError(404, 'Email address not found for this team member');
  }

  return {
    data: emailAddress,
    message: 'Email address retrieved successfully',
  };
}, {
  protected: true,
});

// Update an email address
export const PATCH = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ teamId: string, memberId: string, emailAddressId: string }>
}, decoded) => {
  const {teamId, memberId, emailAddressId} = await params;

  // Check if user has permission to manage team members
  const {membership} = await teamService.getTeamWithMembership(teamId, decoded!.id);
  if (!membership || ![TeamRole.Owner, TeamRole.Manager].includes(membership.role as TeamRole)) {
    throw new ApiError(403, 'You do not have permission to manage email addresses for this team member');
  }

  // Get the email address to check ownership
  const emailAddress = await emailAddressService.getEmailAddressById(emailAddressId);

  // Check if the email address belongs to the team member
  if (emailAddress.teamMember.toString() !== memberId) {
    throw new ApiError(404, 'Email address not found for this team member');
  }

  // Parse and validate request body
  const body = await request.json();
  const result = updateEmailAddressSchema.safeParse(body);

  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  const updatedEmailAddress = await emailAddressService.updateEmailAddress(emailAddressId, result.data as any);

  return {
    data: updatedEmailAddress,
    message: 'Email address updated successfully',
  };
}, {
  protected: true,
});

// Delete an email address
export const DELETE = withApi(async (request: NextRequest, {params}: {
  params: Promise<{ teamId: string, memberId: string, emailAddressId: string }>
}, decoded) => {
  const {teamId, memberId, emailAddressId} = await params;

  // Check if user has permission to manage team members
  const {membership} = await teamService.getTeamWithMembership(teamId, decoded!.id);
  if (!membership || ![TeamRole.Owner, TeamRole.Manager].includes(membership.role as TeamRole)) {
    throw new ApiError(403, 'You do not have permission to manage email addresses for this team member');
  }

  // Get the email address to check ownership
  const emailAddress = await emailAddressService.getEmailAddressById(emailAddressId);
  console.log(emailAddress.teamMember, memberId);

  // Check if the email address belongs to the team member
  if (emailAddress.teamMember.toString() !== memberId) {
    throw new ApiError(404, 'Email address not found for this team member');
  }

  await emailAddressService.deleteEmailAddress(emailAddressId);

  return {
    data: null,
    message: 'Email address deleted successfully',
  };
}, {
  protected: true,
});
