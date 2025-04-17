import {NextRequest} from 'next/server';
import {withApi} from '@/lib/utils/withApi';
import {emailService} from '@/lib/services/email';
import withUrl from '@/lib/utils/withUrl';

export const GET = withApi<any, {teamId: string, memberId: string}>(async (request: NextRequest, {params}, decoded) => {
  const {teamId, memberId} = params;
  const url = withUrl(request);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const labelId = url.searchParams.get('labelId') || undefined;
  const search = url.searchParams.get('search') || undefined;
  const isStarred = url.searchParams.get('isStarred') === 'true' ? true :
    url.searchParams.get('isStarred') === 'false' ? false : undefined;
  const isRead = url.searchParams.get('isRead') === 'true' ? true :
    url.searchParams.get('isRead') === 'false' ? false : undefined;
  const status = url.searchParams.get('status') as any || undefined;
  const emailAddress = url.searchParams.get('emailAddress') || undefined;

  const conversationsWithLatestEmail = await emailService.getConversationsWithLatestEmail(teamId, memberId, {
    page,
    limit,
    labelId,
    search,
    isStarred,
    isRead,
    status,
    emailAddress
  });

  return {
    data: conversationsWithLatestEmail.docs,
    message: 'Conversations with latest emails retrieved successfully',
    pagination: conversationsWithLatestEmail,
  };
}, {
  protected: true,
});
