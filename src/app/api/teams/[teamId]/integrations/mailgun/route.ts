import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { mailgunService } from '@/lib/services/mailgun';
import { ApiError } from '@/lib/types/errors/api.error';
import { teamService } from '@/lib/services/team';
import { TeamRole } from '@/lib/types/models/team';
import { z } from 'zod';

// Validation schema for Mailgun integration
const mailgunConfigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  apiKey: z.string().min(1, 'API key is required'),
  webhookSigningKey: z.string().min(1, 'Webhook signing key is required'),
  inboundEnabled: z.boolean().default(false),
  outboundEnabled: z.boolean().default(true),
});

// Get Mailgun integration for a team
export const GET = withApi(async (request: NextRequest, { params }: { params: { teamId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = params.teamId;

  // Check if user is a member of the team
  const { membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Get the Mailgun integration
  const integration = await mailgunService.getIntegrationByTeam(teamId);

  if (!integration) {
    return {
      data: null,
      message: 'No Mailgun integration found for this team',
    };
  }

  return {
    data: integration,
    message: 'Mailgun integration retrieved successfully',
  };
}, {
  protected: true,
});

// Create or update Mailgun integration for a team
export const POST = withApi(async (request: NextRequest, { params }: { params: { teamId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = params.teamId;

  // Check if user is a member of the team with appropriate permissions
  const { membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership || ![TeamRole.Owner, TeamRole.Manager].includes(membership.role as TeamRole)) {
    throw new ApiError(403, 'You do not have permission to manage integrations for this team');
  }

  // Parse and validate request body
  const body = await request.json();
  const result = mailgunConfigSchema.safeParse(body);

  if (!result.success) {
    throw new ApiError(400, result.error.message);
  }

  // Check if integration already exists
  const existingIntegration = await mailgunService.getIntegrationByTeam(teamId);

  let integration;
  if (existingIntegration) {
    // Update existing integration
    integration = await mailgunService.updateIntegration(
      existingIntegration._id.toString(),
      result.data
    );
  } else {
    // Create new integration
    integration = await mailgunService.createIntegration(
      teamId,
      result.data,
      result.data.name
    );
  }

  return {
    data: integration,
    message: existingIntegration ? 'Mailgun integration updated successfully' : 'Mailgun integration created successfully',
  };
}, {
  protected: true,
});

// Delete Mailgun integration for a team
export const DELETE = withApi(async (request: NextRequest, { params }: { params: { teamId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const teamId = params.teamId;

  // Check if user is a member of the team with appropriate permissions
  const { membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership || ![TeamRole.Owner, TeamRole.Manager].includes(membership.role as TeamRole)) {
    throw new ApiError(403, 'You do not have permission to manage integrations for this team');
  }

  // Get the Mailgun integration
  const integration = await mailgunService.getIntegrationByTeam(teamId);

  if (!integration) {
    throw new ApiError(404, 'No Mailgun integration found for this team');
  }

  // Delete the integration
  await mailgunService.deleteIntegration(integration._id.toString());

  return {
    data: null,
    message: 'Mailgun integration deleted successfully',
  };
}, {
  protected: true,
});
