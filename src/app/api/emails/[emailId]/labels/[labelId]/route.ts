import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';

// Toggle a label on an email
export const POST = withApi(async (request: NextRequest, { params }: { params: { emailId: string, labelId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { emailId, labelId } = params;
  
  const result = await emailService.toggleEmailLabel(emailId, labelId, decoded.id);

  return {
    data: result,
    message: result.hasLabel ? 'Label added to email' : 'Label removed from email',
  };
}, {
  protected: true,
});
