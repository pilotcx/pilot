import {NextRequest} from 'next/server';
import {withApi} from "@/lib/utils/withApi";
import {ApiError} from '@/lib/types/errors/api.error';
import {emailService} from '@/lib/services/email';
import {teamService} from '@/lib/services/team';
import {sendEmailFormSchema} from '@/lib/validations/email';
import {EmailType} from "@/lib/types/models/email";
import {mailgunService} from "@/lib/services/mailgun";
import {emailAddressService} from "@/lib/services/email-address";
import {generateEmailSummary} from "@/lib/utils/generateEmailSummary";

export const POST = withApi(async (req: NextRequest, {params}: { params: { teamId: string } }, decoded) => {
  const {teamId} = params;
  const {team, membership} = await teamService.getTeamWithMembership(teamId, decoded!.id);
  const contentType = req.headers.get('content-type') || '';
  let validatedData;

  if (contentType.includes('multipart/form-data')) {
    // Handle form data with possible file uploads
    const formData = await req.formData();
    const formValues: Record<string, string> = {};

    // Extract form fields
    for (const [key, value] of formData.entries()) {
      // Skip file entries for now
      if (!(value instanceof File)) {
        formValues[key] = value.toString();
      }
    }

    // Validate form fields
    const result = sendEmailFormSchema.safeParse(formValues);
    if (!result.success) throw new ApiError(400, result.error.message);
    validatedData = result.data;

    const fromAddress = validatedData.from;
    const userAddresses = await emailAddressService.getTeamMemberEmailAddresses(teamId, membership._id.toString());
    if (!userAddresses.find(addr => addr.fullAddress === fromAddress)) throw new ApiError(400, 'Invalid sender email address');

    // Process file attachments
    const files = formData.getAll('attachments') as File[];

    const mgClient = await mailgunService.getTeamClient(teamId);
    const sendResult = await mgClient.messages.create(fromAddress.split('@')[1]!, {
      from: validatedData.from,
      to: validatedData.to,
      subject: validatedData.subject,
      html: validatedData.html,
      attachment: files,
    });
    if (!sendResult.id) throw new ApiError(500, 'FAILED_SENDING_EMAIL');
    let conversationId: string | undefined = undefined;
    if (validatedData.inReplyTo) {
      const email = await emailService.getEmailByMessageId(validatedData.inReplyTo);
      if (email?.conversation) {
        conversationId = email.conversation.toString();
      }
    }
    await emailService.createEmail(teamId, {
      ...validatedData,
      summary: generateEmailSummary(validatedData.html),
      conversation: conversationId,
      messageId: sendResult.id,
      direction: EmailType.Outgoing,
      isRead: true,
      attachments: [], // TODO: not yet support storing email attachments
    })
  }
  return {
    message: 'EMAIL_SENT',
  };
});
