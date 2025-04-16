import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';

// Mark an email as read
export const POST = withApi(async (request: NextRequest, { params }: { params: { emailId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const emailId = params.emailId;
  
  await emailService.markEmailAsRead(emailId, decoded.id);

  return {
    data: null,
    message: 'Email marked as read',
  };
}, {
  protected: true,
});
