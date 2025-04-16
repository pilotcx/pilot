import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';

// Get a specific conversation
export const GET = withApi(async (request: NextRequest, { params }: { params: { conversationId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const conversationId = params.conversationId;
  
  const conversation = await emailService.getConversationById(conversationId, decoded.id);

  return {
    data: conversation,
    message: 'Conversation retrieved successfully',
  };
}, {
  protected: true,
});
