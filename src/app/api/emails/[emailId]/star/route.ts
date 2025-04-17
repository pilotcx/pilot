import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';

// Toggle star status of an email
export const POST = withApi(async (request: NextRequest, { params }: { params: { emailId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const emailId = params.emailId;
  
  const result = await emailService.toggleStarEmail(emailId, decoded.id);

  return {
    data: result,
    message: result.isStarred ? 'Email starred' : 'Email unstarred',
  };
}, {
  protected: true,
});
