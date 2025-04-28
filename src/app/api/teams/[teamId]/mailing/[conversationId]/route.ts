import {withApi} from "@/lib/utils/withApi";
import {NextRequest} from "next/server";
import {emailService} from "@/lib/services/email";
import {teamService} from "@/lib/services/team";
import {ApiError} from "@/lib/types/errors/api.error";
import {dbService} from "@/lib/db/service";

export const GET = withApi<any, {
  conversationId: string,
  teamId: string
}>(async (req: NextRequest, {params}, decoded) => {
  const {conversationId, teamId} = params;
  const {membership, team} = await teamService.getTeamWithMembership(teamId, decoded!.id);
  if (!membership) throw new ApiError(404, 'NOT_FOUND');

  // Get the conversation
  const conversation = await emailService.getConversationById(conversationId);
  if (!conversation) throw new ApiError(404, 'CONVERSATION_NOT_FOUND');

  // Check if the user has access to this conversation
  const accessible = await emailService.checkMemberConversationAccessible(teamId, membership._id.toString(), conversationId);
  if (!accessible) throw new ApiError(403, 'FORBIDDEN');

  // Get the emails in this conversation
  const emails = await dbService.email.find({
    conversation: conversationId
  }).sort({createdAt: 1});

  // Get the participants (email addresses) in this conversation
  const participants = await emailService.getConversationParticipants(conversationId);

  return {
    data: {
      conversation,
      emails,
      participants,
    },
    message: 'Conversation retrieved successfully'
  };
});
