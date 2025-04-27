"use client";

import { CommentItem } from "@/components/comment-item";
import { useTeam } from "@/components/providers/team-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import { Comment } from "@/lib/types/models/post";
import { LoaderCircle, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: string;
  initialCommentsCount: number;
}

export function CommentSection({
  postId,
  initialCommentsCount,
}: CommentSectionProps) {
  const { team } = useTeam();
  const teamId = team?._id?.toString() || "";

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(initialCommentsCount);
  const [showComments, setShowComments] = useState(false);
  const [expandedForm, setExpandedForm] = useState(false);

  const [getPostComments] = useApi(api.getPostComments);
  const [commentOnPost] = useApi(api.commentOnPost);

  const commentsLoadedRef = useRef(false);

  useEffect(() => {
    // Only load comments when the section is shown and not already loaded
    if (teamId && showComments && !commentsLoadedRef.current) {
      commentsLoadedRef.current = true;
      loadComments();
    }
  }, [teamId, showComments]);

  const loadComments = async () => {
    if (!teamId) return;

    setLoading(true);
    try {
      console.log("Fetching comments for post:", postId, "in team:", teamId);
      const response = await getPostComments(teamId, postId, {
        limit: 10,
        skip: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response && response.data && Array.isArray(response.data)) {
        console.log("Setting comments:", response.data.length);
        setComments(response.data);
        setHasMore(response.pagination?.hasNextPage || false);
        setTotalComments(
          response.pagination?.totalDocs || initialCommentsCount
        );
        setPage(1);
      } else {
        console.error("Invalid response format:", JSON.stringify(response));
        toast.error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreComments = async () => {
    if (loadingMore || !teamId) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await getPostComments(teamId, postId, {
        limit: 10,
        skip: page * 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response && response.data && Array.isArray(response.data)) {
        setComments([...comments, ...response.data]);
        setHasMore(response.pagination?.hasNextPage || false);
        setPage(nextPage);
      }
    } catch (error) {
      toast.error("Failed to load more comments");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !teamId) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const response = await commentOnPost(teamId, postId, newComment);

      if (response.data) {
        setComments([response.data as Comment, ...comments]);
        setNewComment("");
        setTotalComments(totalComments + 1);
        toast.success("Comment added successfully");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    if (!teamId) return;

    try {
      const response = await commentOnPost(teamId, postId, content, commentId);

      if (response.data) {
        const updatedComments = comments.map((comment) => {
          if (comment._id === commentId) {
            // Add reply to parent comment
            const updatedReplies = [
              ...(comment.replies || []),
              response.data as Comment,
            ];
            return {
              ...comment,
              replies: updatedReplies,
              replyCount: (comment.replyCount || 0) + 1,
            };
          }
          return comment;
        });

        setComments(updatedComments);
        setTotalComments(totalComments + 1);
        toast.success("Reply added successfully");
      }
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!teamId) return;

    // First check if it's a top-level comment
    const topLevelIndex = comments.findIndex((c) => c._id === commentId);

    if (topLevelIndex >= 0) {
      // It's a top-level comment, remove it and decrement total
      const deletedComment = comments[topLevelIndex];
      const decrementCount = 1 + (deletedComment.replyCount || 0);

      const updatedComments = [...comments];
      updatedComments.splice(topLevelIndex, 1);

      setComments(updatedComments);
      setTotalComments(Math.max(0, totalComments - decrementCount));
      return;
    }

    // Check if it's a reply by iterating through all comments and their replies
    let foundReply = false;
    const updatedComments = comments.map((comment) => {
      if (comment.replies && comment.replies.some((reply) => reply._id === commentId)) {
        foundReply = true;
        // Filter out the deleted reply
        const updatedReplies = comment.replies.filter(
          (reply) => reply._id !== commentId
        );
        return {
          ...comment,
          replies: updatedReplies,
          replyCount: Math.max(0, (comment.replyCount || 0) - 1),
        };
      }
      return comment;
    });

    if (foundReply) {
      setComments(updatedComments);
      setTotalComments(Math.max(0, totalComments - 1));
    } else {
      // If we couldn't find the reply in the current comments, refresh the comments
      console.log("Reply not found in current state, refreshing comments");
      loadComments();
    }
  };
  console.log("comments", comments);

  // Add a null check before rendering comments
  const renderComments = () => {
    if (!comments || comments.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      );
    }

    return (
      <div
        className="space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent pr-4"
        style={{ maxHeight: "400px" }}
      >
        {comments.map((comment) =>
          comment && comment._id ? (
            <CommentItem
              key={comment._id}
              teamId={teamId}
              comment={comment}
              postId={postId}
              onDelete={handleDeleteComment}
              onReply={handleReply}
            />
          ) : null
        )}

        {hasMore && (
          <div className="flex justify-center pt-2 pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMoreComments}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load More Comments"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div className="flex -mx-3 -mb-2 gap-2 items-center">
          <Button
            onClick={toggleComments}
            variant="ghost"
            size="sm"
            className="h-8 gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{totalComments} Comments</span>
          </Button>
        </div>
      </div>

      {showComments && (
        <>
          <div className="py-4 mt-4 border-t">
            {expandedForm ? (
              <>
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[50px]"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddComment}>
                    Add Comment
                  </Button>
                </div>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full text-muted-foreground justify-start"
                onClick={() => setExpandedForm(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Write a comment...
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <LoaderCircle className="animate-spin w-4 h-4" />
            </div>
          ) : (
            renderComments()
          )}
        </>
      )}
    </div>
  );
}
