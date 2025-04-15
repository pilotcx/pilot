"use client";

import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {useTeam} from "@/components/providers/team-provider";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import api from "@/lib/services/api";
import useApi from "@/hooks/use-api";
import {TeamRequestComment} from "@/lib/types/models/team-request";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {formatDistanceToNow} from "date-fns";
import {Skeleton} from "@/components/ui/skeleton";
import {TeamMember} from "@/lib/types/models/team";

interface TeamRequestCommentListProps {
  teamId: string;
  requestId: string;
}

export function TeamRequestCommentList({teamId, requestId}: TeamRequestCommentListProps) {
  const {membership} = useTeam();
  const [comments, setComments] = useState<TeamRequestComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [request, setRequest] = useState<any>(null);
  const [canComment, setCanComment] = useState(false);

  // Use API hooks
  const [getComments, {data: commentsData, loading: loadingComments}] = useApi(api.getTeamRequestComments);
  const [addComment, {loading: addingComment}] = useApi(api.addTeamRequestComment);
  const [getRequest, {loading: loadingRequest}] = useApi(api.getTeamRequest);

  // Fetch request and determine if user can comment
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await getRequest(teamId, requestId);
        if (response.data) {
          setRequest(response.data);

          // Check if user is a reviewer (owner or manager) or the requester
          const isReviewer = membership.role === 'owner' || membership.role === 'manager';
          const isRequester = (response.data.requester as TeamMember)._id === membership._id;

          setCanComment(isReviewer || isRequester);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load request");
      }
    };

    fetchRequest();
  }, [getRequest, requestId, teamId, membership._id, membership.role]);

  // Fetch comments on component mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        await getComments(teamId, requestId);
      } catch (error: any) {
        toast.error(error.message || "Failed to load comments");
      }
    };

    fetchComments();
  }, [getComments, requestId, teamId]);

  // Update comments when data changes
  useEffect(() => {
    if (commentsData) {
      setComments(commentsData);
    }
  }, [commentsData]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await addComment(teamId, requestId, newComment);
      if (response.data) {
        setComments((prev) => [...prev, response.data]);
        setNewComment("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add comment");
    }
  };

  return (
    <div className="space-y-6">
      {loadingComments ? (
        <CommentsLoadingSkeleton/>
      ) : comments.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={(comment.author as TeamMember).avatar}/>
                <AvatarFallback>
                  {(comment.author as TeamMember).displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {(comment.author as TeamMember).displayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt as string), {addSuffix: true})}
                  </span>
                </div>
                <p className="mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {canComment ? (
        <div className="flex gap-2 pt-4">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            className="self-end"
            disabled={!newComment.trim() || addingComment}
            onClick={handleAddComment}
          >
            {addingComment ? "Posting..." : "Post"}
          </Button>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <p>Only reviewers (owners or managers) and the requester can comment on this request.</p>
        </div>
      )}
    </div>
  );
}

function CommentsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full"/>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24"/>
              <Skeleton className="h-3 w-16"/>
            </div>
            <Skeleton className="h-4 w-full mt-2"/>
            <Skeleton className="h-4 w-2/3 mt-1"/>
          </div>
        </div>
      ))}
    </div>
  );
}
