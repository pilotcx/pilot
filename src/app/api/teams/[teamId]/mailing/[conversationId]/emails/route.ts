import {withApi} from "@/lib/utils/withApi";
import {NextRequest} from "next/server";
import {emailService} from "@/lib/services/email";
import {teamService} from "@/lib/services/team";
import {ApiError} from "@/lib/types/errors/api.error";

export const GET = withApi<any, {
  conversationId: string,
  teamId: string
}>(async (req: NextRequest, {params, searchParams}, decoded) => {
  const emailAddress = searchParams.get('emailAddress');
  if (!emailAddress) throw new ApiError(400, 'BAD_REQUEST');
  const {conversationId, teamId} = params;
  const {membership, team} = await teamService.getTeamWithMembership(teamId, decoded!.id);
  if (!membership) throw new ApiError(404, 'NOT_FOUND')
  const accessible = await emailService.checkMemberConversationAccessible(teamId, membership._id.toString(), conversationId);
  if (!accessible) throw new ApiError(403, 'FORBIDDEN');
  return {
    data: await emailService.getConversationEmails(conversationId, emailAddress),
  }
})
