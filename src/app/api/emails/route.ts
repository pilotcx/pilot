import { NextRequest } from 'next/server';
import { withApi } from '@/lib/utils/withApi';
import { emailService } from '@/lib/services/email';
import { ApiError } from '@/lib/types/errors/api.error';
import withUrl from '@/lib/utils/withUrl';

// Get emails for the authenticated user
export const GET = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const url = withUrl(request);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const labelId = url.searchParams.get('labelId') || undefined;
  const isStarred = url.searchParams.get('isStarred') === 'true' ? true : 
                    url.searchParams.get('isStarred') === 'false' ? false : undefined;
  const isRead = url.searchParams.get('isRead') === 'true' ? true : 
                 url.searchParams.get('isRead') === 'false' ? false : undefined;
  const search = url.searchParams.get('search') || undefined;
  const status = url.searchParams.get('status') as any || undefined;

  const emails = await emailService.getUserEmails(decoded.id, {
    page,
    limit,
    labelId,
    isStarred,
    isRead,
    search,
    status
  });

  return {
    data: emails,
    message: 'Emails retrieved successfully',
  };
}, {
  protected: true,
});

// Create a new email
export const POST = withApi(async (request: NextRequest, context, decoded) => {
  if (!decoded) {
    throw new ApiError(401, 'Unauthorized');
  }

  const body = await request.json();
  
  // Set the sender to the authenticated user
  body.sender = decoded.id;
  
  const email = await emailService.createEmail(body);

  return {
    data: email,
    message: 'Email created successfully',
  };
}, {
  protected: true,
});
