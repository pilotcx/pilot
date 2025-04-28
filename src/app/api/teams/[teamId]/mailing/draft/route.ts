import { NextRequest } from 'next/server';
import { withApi } from "@/lib/utils/withApi";
import { ApiError } from '@/lib/types/errors/api.error';
import { emailService } from '@/lib/services/email';
import { teamService } from '@/lib/services/team';
import { createEmailDraftSchema, createEmailDraftFormSchema } from '@/lib/validations/email';

export const POST = withApi(async (req: NextRequest, { params }: { params: { teamId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { teamId } = params;

  // Check if user has access to the team
  const { team, membership } = await teamService.getTeamWithMembership(teamId, decoded.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }
  if (!membership) {
    throw new ApiError(403, 'You do not have access to this team');
  }

  // Determine content type and process accordingly
  const contentType = req.headers.get('content-type') || '';
  let validatedData;
  let attachments = [];

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
    const result = createEmailDraftFormSchema.safeParse(formValues);
    if (!result.success) {
      throw new ApiError(400, result.error.message);
    }

    validatedData = result.data;

    // Process file attachments
    const files = formData.getAll('attachments') as File[];
    if (files && files.length > 0) {
      // Process each file
      for (const file of files) {
        if (file instanceof File) {
          // Upload the file to storage (implementation depends on your storage solution)
          const uploadedFile = await emailService.uploadAttachment(file, teamId);

          attachments.push({
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            url: uploadedFile.url
          });
        }
      }
    }
  } else {
    // Handle JSON data
    const body = await req.json();
    const result = createEmailDraftSchema.safeParse(body);
    if (!result.success) {
      throw new ApiError(400, result.error.message);
    }

    validatedData = result.data;
    attachments = validatedData.attachments || [];
  }

  // Create the email draft
  const emailData = {
    ...validatedData,
    attachments,
    team: teamId,
    direction: 'outgoing',
    isRead: true,
    messageId: `draft-${Date.now()}.${Math.random().toString(36).substring(2)}@${validatedData.from.split('@')[1]}`,
  };

  const email = await emailService.createEmail(teamId, emailData);

  return {
    data: email,
    message: 'Email draft saved successfully',
  };
});
