import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';

/**
 * Get all emails in a conversation
 * This endpoint is used when a user clicks on a conversation to view all emails in the thread
 */
export const GET = withApi(async (request: NextRequest, { params }: { params: { conversationId: string } }, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const conversationId = params.conversationId;
  
  const conversationEmails = await emailService.getConversationEmails(conversationId, decoded.id);

  return {
    data: conversationEmails,
    message: 'Conversation emails retrieved successfully',
  };
}, {
  protected: true,
});
