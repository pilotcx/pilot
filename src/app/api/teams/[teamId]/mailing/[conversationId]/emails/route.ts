import {withApi} from "@/lib/utils/withApi";
import {NextRequest} from "next/server";
import {emailService} from "@/lib/services/email";
import {teamService} from "@/lib/services/team";
import {ApiError} from "@/lib/types/errors/api.error";

export const GET = withApi<any, {
  conversationId: string, // This is now chainId
  teamId: string
}>(async (req: NextRequest, {params, searchParams}, decoded) => {
  const emailAddress = searchParams.get('emailAddress');
  if (!emailAddress) throw new ApiError(400, 'BAD_REQUEST');
  const {conversationId: chainId, teamId} = params; // Rename for clarity but keep param name for backward compatibility
  const {membership, team} = await teamService.getTeamWithMembership(teamId, decoded!.id);
  if (!membership) throw new ApiError(404, 'NOT_FOUND')
  const accessible = await emailService.checkMemberChainAccessible(teamId, membership._id.toString(), chainId);
  if (!accessible) throw new ApiError(403, 'FORBIDDEN');
  return {
    data: await emailService.getChainEmails(chainId, emailAddress),
  }
})
