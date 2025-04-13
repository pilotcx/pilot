"use client";

import {useState, useRef} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {formatDistanceToNow} from "date-fns";
import {
  Angry,
  Frown,
  Heart,
  Laugh,
  Link2,
  MessageSquare,
  MoreHorizontal,
  PartyPopper,
  PlusIcon,
  ThumbsUp
} from "lucide-react";
import {ReactionType} from "@/lib/types/models/post";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {TeamMember} from "@/lib/types/models/team";

interface PostProps {
  id: string;
  title: string;
  content: string;
  author: TeamMember;
  createdAt: string;
  reactions: Record<string, number>;
  comments: number;
  currentUserId: string;
  userReactions?: { userId: string; type: string }[];
  onReact: (id: string, type: ReactionType) => void;
  onDelete: (id: string) => void;
}

export function TeamPost({
                           id,
                           title,
                           content,
                           author,
                           createdAt,
                           reactions,
                           comments,
                           currentUserId,
                           userReactions = [],
                           onReact,
                           onDelete,
                         }: PostProps) {
  const [copied, setCopied] = useState(false);
  const [isReactionPopoverOpen, setIsReactionPopoverOpen] = useState(false);
  const popoverTriggerRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = () => {
    // In a real app, this would copy the actual post URL
    navigator.clipboard.writeText(`${window.location.origin}/posts/${id}`);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const isCurrentUserAuthor = author._id === currentUserId;

  // Get total reactions count
  const totalReactions = Object.entries(reactions || {}).reduce((sum, [_, count]) => {
    return sum + (typeof count === 'number' ? count : 0);
  }, 0);

  // Helper function to get reaction icon
  const getReactionIcon = (type: ReactionType) => {
    switch (type) {
      case 'like':
        return <ThumbsUp className="h-4 w-4"/>;
      case 'love':
        return <Heart className="h-4 w-4 text-red-500"/>;
      case 'laugh':
        return <Laugh className="h-4 w-4 text-yellow-500"/>;
      case 'angry':
        return <Angry className="h-4 w-4 text-orange-500"/>;
      case 'sad':
        return <Frown className="h-4 w-4 text-blue-500"/>;
      case 'celebrate':
        return <PartyPopper className="h-4 w-4 text-purple-500"/>;
    }
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm flex flex-row min-h-0">
      <div
        className={"bg-muted/30 w-14 flex flex-col"}
      >
        <div
          className={'flex-1 w-full h-full py-2 flex flex-col items-center overflow-y-auto scrollbar-hidden relative'}>
          <div className={'absolute'}>
            {totalReactions > 0 && (
              // Show received reactions
              Object.entries(reactions || {})
                .filter(([_, count]) => typeof count === 'number' && count > 0)
                .map(([type, count]) => (
                  <div
                    key={type}
                    className="relative group mb-2 cursor-pointer transition-transform hover:scale-110"
                    onClick={() => onReact(id, type as ReactionType)}
                    title={`${count} ${type}${count !== 1 ? 's' : ''}`}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-full bg-background",
                      userReactions?.some(r => r.type === type && r.userId === currentUserId) && "ring-2 ring-primary/10"
                    )}>
                      {getReactionIcon(type as ReactionType)}
                    </div>
                    <span
                      className="absolute -bottom-0 -right-0 text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center">
                  {count}
                </span>
                  </div>
                ))
            )}
          </div>
        </div>
        <Popover open={isReactionPopoverOpen} onOpenChange={setIsReactionPopoverOpen}>
          <PopoverTrigger asChild>
            <div
              ref={popoverTriggerRef}
              className={'flex flex-col items-center py-3 cursor-pointer bg-muted/80 hover:bg-muted/90 transition-colors'}
              onMouseEnter={() => setIsReactionPopoverOpen(true)}
              onMouseLeave={() => setIsReactionPopoverOpen(false)}
            >
              <PlusIcon className={'w-6 h-6 text-muted-foreground/80'}/>
            </div>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            className="p-2 w-auto"
            onMouseEnter={() => setIsReactionPopoverOpen(true)}
            onMouseLeave={() => setIsReactionPopoverOpen(false)}
          >
            <div className="flex gap-1">
              {Object.values(ReactionType).map((type) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full hover:bg-muted"
                  onClick={() => {
                    onReact(id, type);
                    setIsReactionPopoverOpen(false);
                  }}
                  title={type.charAt(0).toUpperCase() + type.slice(1)}
                >
                  {getReactionIcon(type)}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Post content */}
      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>Posted by</span>
          <div className="flex items-center gap-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={author.avatar} alt={author.displayName}/>
              <AvatarFallback>
                {author.displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">{author.displayName}</span>
          </div>
          <span className="text-xs">{formatDistanceToNow(new Date(createdAt), {addSuffix: true})}</span>
        </div>

        <h3 className="text-lg font-medium mb-2">{title}</h3>

        <div className="mb-4 whitespace-pre-line text-sm">{content}</div>

        <div className="flex -mx-3 -mb-2 gap-2 items-center">
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <MessageSquare className="h-4 w-4"/>
            <span>{comments} Comments</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 ml-auto"
            onClick={handleCopyLink}
          >
            <Link2 className="h-4 w-4"/>
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </Button>

          {isCurrentUserAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 ml-auto">
                  <MoreHorizontal className="h-4 w-4"/>
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
