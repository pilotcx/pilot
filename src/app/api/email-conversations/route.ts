import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';
import withUrl from '@/lib/utils/withUrl';

// Get all conversations for the authenticated user
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const url = withUrl(request);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const labelId = url.searchParams.get('labelId') || undefined;
  const search = url.searchParams.get('search') || undefined;

  const conversations = await emailService.getUserConversations(decoded.id, {
    page,
    limit,
    labelId,
    search
  });

  return {
    data: conversations,
    message: 'Conversations retrieved successfully',
  };
}, {
  protected: true,
});
