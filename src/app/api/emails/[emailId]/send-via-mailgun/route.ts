import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { mailgunService } from '@/lib/services/mailgun';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';
import { dbService } from '@/lib/db/service';
import { IntegrationType } from '@/lib/types/models/integration';

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

  // Get the team's Mailgun integration
  const integration = await dbService.integration.findOne({
    team: teamId,
    type: IntegrationType.Mailgun,
    enabled: true,
    status: 'active'
  });
  
  if (!integration) {
    throw new ApiError(404, 'No active Mailgun integration found for this team');
  }

  // Send the email using Mailgun
  await mailgunService.sendEmail(emailId, integration._id.toString());

  return {
    data: null,
    message: 'Email sent successfully via Mailgun',
  };
}, {
  protected: true,
});
