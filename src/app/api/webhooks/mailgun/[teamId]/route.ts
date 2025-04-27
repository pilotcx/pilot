import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { mailgunService } from '@/lib/services/mailgun';
import { ApiError } from '@/lib/types/errors/api.error';
import { MailgunInboundMessage } from '@/lib/types/models/integration';

// Handle Mailgun webhook for inbound emails
export const POST = withApi(async (request: NextRequest, { params }: { params: { teamId: string } }) => {
  const teamId = params.teamId;
  console.log('mailgun webhook triggered');

  // Parse the webhook payload
  const formData = await request.formData();

  // Convert formData to MailgunInboundMessage
  const payload: Partial<MailgunInboundMessage> = {
    recipient: formData.get('recipient') as string,
    sender: formData.get('sender') as string,
    from: formData.get('from') as string,
    subject: formData.get('subject') as string,
    bodyPlain: formData.get('body-plain') as string,
    bodyHtml: formData.get('body-html') as string,
    strippedText: formData.get('stripped-text') as string,
    strippedHtml: formData.get('stripped-html') as string,
    messageHeaders: JSON.parse(formData.get('message-headers') as string || '{}'),
    timestamp: parseInt(formData.get('timestamp') as string || '0'),
    token: formData.get('token') as string,
    signature: formData.get('signature') as string,
    messageId: formData.get('Message-Id') as string,
  };

  console.log(payload);

  try {
    // Process the inbound email
    await mailgunService.processInboundEmail(payload as MailgunInboundMessage, teamId);

    return {
      message: 'Inbound email processed successfully',
    };
  } catch (error: any) {
    // Log the error but return a 200 response to acknowledge receipt
    console.error('Error processing Mailgun webhook:', error);

    return {
      data: null,
      message: error.message || 'Error processing inbound email',
      success: false,
    };
  }
}, {
  preventDb: false,
  protected: false, // Webhook endpoints are not protected by authentication
});
