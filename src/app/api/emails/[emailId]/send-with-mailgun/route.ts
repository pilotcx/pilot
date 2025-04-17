import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';
import { teamService } from '@/lib/services/team';

// Send an email using Mailgun
export const POST = withApi(async (request: NextRequest, { params }: { params: { emailId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const emailId = params.emailId;

  // Get the email
  const email = await emailService.getEmailById(emailId);
  if (!email) {
    throw new ApiError(404, 'Email not found');
  }

  // Check if user is the sender
  if (email.sender.toString() !== decoded.id) {
    throw new ApiError(403, 'You do not have permission to send this email');
  }

  // Get the team ID from the request body
  const body = await request.json();
  const { teamId } = body;

  if (!teamId) {
    throw new ApiError(400, 'Team ID is required');
  }

  // Check if user is a member of the team
  const { membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Send the email using Mailgun
  const sentEmail = await emailService.sendEmailWithMailgun(emailId, teamId);

  return {
    data: sentEmail,
    message: 'Email sent successfully via Mailgun',
  };
}, {
  protected: true,
});
