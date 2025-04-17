import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';

// Send a draft email
export const POST = withApi(async (request: NextRequest, { params }: { params: { emailId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const emailId = params.emailId;
  
  const email = await emailService.sendEmail(emailId, decoded.id);

  return {
    data: email,
    message: 'Email sent successfully',
  };
}, {
  protected: true,
});
