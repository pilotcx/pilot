"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Reply, Trash2 } from "lucide-react";
import { Comment } from "@/lib/types/models/post";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useTeam } from "@/components/providers/team-provider";
import { TeamMember } from "@/lib/types/models/team";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import { cn } from "@/lib/utils";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import { InlineMarkdownEditor } from "@/components/ui/inline-markdown-editor";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  teamId: string;
  onDelete: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  isReply?: boolean;
}

export function CommentItem({ comment, postId, teamId, onDelete, onReply, isReply = false }: CommentItemProps) {
  const [replyMode, setReplyMode] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [allReplies, setAllReplies] = useState<Comment[]>(comment.replies || []);
  
  const [repliesLoaded, setRepliesLoaded] = useState(allReplies.length > 0);
  
  const { membership } = useTeam();
  const author = comment.author as TeamMember;
  const [deleteComment] = useApi(api.deleteComment);
  const [getCommentReplies] = useApi(api.getCommentReplies);
  
  const authorName = author?.displayName || 'Unknown';
  const authorInitials = authorName.substring(0, 2).toUpperCase();
  
  const isCurrentUserAuthor = author?._id === membership?._id;
  const isManagerOrOwner = ['owner', 'manager'].includes(membership?.role || '');
  const canDelete = isCurrentUserAuthor || isManagerOrOwner;
  
  const handleDelete = async () => {
    try {
      await deleteComment(teamId, comment._id);
      toast.success("Comment deleted successfully");
      
      // Call parent component's onDelete to update the UI
      onDelete(comment._id);
      
      // If this is a reply being deleted, also update the local allReplies state
      if (isReply) {
        setAllReplies(prev => prev.filter(reply => reply._id !== comment._id));
      }
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };
  
  const handleReply = () => {
    setReplyMode(!replyMode);
    setReplyContent("");
  };
  
  const submitReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    
    try {
      if (onReply) {
        await onReply(comment._id, replyContent);
        setReplyMode(false);
        setReplyContent("");
      }
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };
  
  const loadMoreReplies = async () => {
    if (showAllReplies) {
      // Hide replies
      setShowAllReplies(false);
      return;
    }
    
    if (repliesLoaded) {
      // Show already loaded replies
      setShowAllReplies(true);
      return;
    }
    
    try {
      setLoadingReplies(true);
      const response = await getCommentReplies(teamId, comment._id, {
        limit: 50, // Get more replies at once to avoid pagination issues
        skip: 0
      });
      
      if (response && response.data) {
        setAllReplies(response.data as Comment[]);
        setShowAllReplies(true);
        setRepliesLoaded(true);
      }
    } catch (error) {
      toast.error("Failed to load replies");
    } finally {
      setLoadingReplies(false);
    }
  };
  
  const visibleReplies = showAllReplies 
    ? allReplies 
    : (allReplies?.slice(0, 2) || []);
  
  const renderReplies = () => {
    if (!showAllReplies || !visibleReplies || visibleReplies.length === 0) {
      return null;
    }
    
    return (
      <div className="pl-4 mt-2.5 pt-1 space-y-2.5 border-l border-border/30">
        {visibleReplies.map((reply) => (
          reply && reply._id ? (
            <CommentItem
              key={reply._id}
              teamId={teamId}
              comment={reply}
              postId={postId}
              onDelete={(replyId) => {
                // When a reply is deleted, update the local replies state
                setAllReplies(prev => prev.filter(r => r._id !== replyId));
                
                // Update the replyCount
                if (comment.replyCount > 0) {
                  comment.replyCount -= 1;
                }
                
                // Also call parent onDelete to update parent component state
                onDelete(replyId);
              }}
              isReply={true}
            />
          ) : null
        ))}
      </div>
    );
  };
  
  const timestamp = formatDistanceToNow(new Date(comment.createdAt as string), { addSuffix: true });
  
  return (
    <div className={cn("flex gap-2.5", isReply ? "mb-2.5" : "mb-3.5")}>
      <Avatar className={cn("h-6 w-6 mt-0.5", isReply ? "h-5 w-5" : "")}>
        <AvatarImage src={author?.avatar} alt={authorName} />
        <AvatarFallback className="text-xs">
          {authorInitials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className={cn(
          "bg-muted/50 rounded-lg p-2.5", 
          isReply ? "p-2" : "", 
          isCurrentUserAuthor ? "bg-muted/50" : ""
        )}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-medium text-xs truncate">{authorName}</span>
              <span className="text-[10px] text-muted-foreground">{timestamp}</span>
            </div>
            
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 -mt-1 -mr-1 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-3 w-3" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[120px]">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive text-xs py-1.5 cursor-pointer"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <MarkdownDisplay content={comment.content} className="text-sm" />
        </div>
        
        {!isReply && (
          <div className="flex gap-2 mt-0.5">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={handleReply}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            
            {comment.replyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                onClick={loadMoreReplies}
                disabled={loadingReplies}
              >
                {loadingReplies 
                  ? "Loading..." 
                  : repliesLoaded && showAllReplies
                    ? `Hide ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}` 
                    : `Show ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
              </Button>
            )}
          </div>
        )}
        
        {replyMode && !isReply && (
          <div className="mt-2" style={{ contain: "content" }}>
            <InlineMarkdownEditor
              value={replyContent}
              onChange={setReplyContent}
              placeholder="Write a reply..."
              minHeight="60px"
              height="60px"
              className="mb-2"
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 text-xs px-3"
                onClick={() => setReplyMode(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                className="h-7 text-xs px-3"
                onClick={submitReply}
                disabled={!replyContent.trim()}
              >
                Reply
              </Button>
            </div>
          </div>
        )}
        
        {!isReply && renderReplies()}
      </div>
    </div>
  );
} 