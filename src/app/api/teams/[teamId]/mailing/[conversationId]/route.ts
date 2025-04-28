import {withApi} from "@/lib/utils/withApi";
import {NextRequest} from "next/server";
import {emailService} from "@/lib/services/email";
import {teamService} from "@/lib/services/team";
import {ApiError} from "@/lib/types/errors/api.error";
import {dbService} from "@/lib/db/service";

export const GET = withApi<any, {
  conversationId: string, // This is now chainId
  teamId: string
}>(async (req: NextRequest, {params}, decoded) => {
  const {conversationId: chainId, teamId} = params;
  const {membership, team} = await teamService.getTeamWithMembership(teamId, decoded!.id);
  if (!membership) throw new ApiError(404, 'NOT_FOUND');

  // Check if the user has access to this chain
  const accessible = await emailService.checkMemberChainAccessible(teamId, membership._id.toString(), chainId);
  if (!accessible) throw new ApiError(403, 'FORBIDDEN');

  const firstEmail = await dbService.email.findOne({
    chainId
  }).sort({createdAt: 1}).limit(1);
  if (!firstEmail) throw new ApiError(404, 'Mail conversation not found');

  const emails = await dbService.email.find({
    chainId
  }).sort({createdAt: 1});

  const conversation = {
    _id: chainId,
    subject: firstEmail.subject
  };

  return {
    data: {
      conversation,
      emails,
    },
    message: 'Conversation retrieved successfully'
  };
});
