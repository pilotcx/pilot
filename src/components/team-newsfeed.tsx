"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import { useTeam } from "@/components/providers/team-provider";
import { TeamPost } from "@/components/team-post";
import { TeamPostSkeleton } from "@/components/team-post-skeleton";
import { ArrowUp, ArrowDown, MessageSquare, Share2, MoreHorizontal, Link2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for posts until we have a real API
const MOCK_POSTS = [
  {
    id: "1",
    title: "Just shipped a new feature!",
    content: "Check out the new dashboard analytics. Let me know what you think about the new visualizations and filtering options.",
    author: {
      id: "user1",
      name: "Alex Johnson",
      avatar: "/avatars/alex.jpg",
      role: "Product Manager"
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    reactions: {
      like: { type: 'like', count: 8, reacted: false },
      love: { type: 'love', count: 4, reacted: false },
      laugh: { type: 'laugh', count: 2, reacted: false },
      angry: { type: 'angry', count: 0, reacted: false },
      sad: { type: 'sad', count: 0, reacted: false },
      celebrate: { type: 'celebrate', count: 1, reacted: false },
    },
    comments: 4,
  },
  {
    id: "2",
    title: "Team meeting notes from yesterday",
    content: "- Discussed Q3 roadmap\n- Assigned new tasks\n- Reviewed customer feedback\n\nLet me know if you have any questions!",
    author: {
      id: "user2",
      name: "Sarah Miller",
      avatar: "/avatars/sarah.jpg",
      role: "Team Lead"
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    reactions: {
      like: { type: 'like', count: 6, reacted: false },
      love: { type: 'love', count: 2, reacted: false },
      laugh: { type: 'laugh', count: 4, reacted: false },
      angry: { type: 'angry', count: 4, reacted: false },
      sad: { type: 'sad', count: 4, reacted: false },
      celebrate: { type: 'celebrate', count: 4, reacted: false },
    },
    comments: 7,
  },
  {
    id: "3",
    title: "Looking for feedback on the new design prototype",
    content: "I've shared it in Figma. Please check your email for the invitation link.",
    author: {
      id: "user3",
      name: "Michael Chen",
      avatar: "/avatars/michael.jpg",
      role: "UI Designer"
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    reactions: {
      like: { type: 'like', count: 10, reacted: false },
      love: { type: 'love', count: 5, reacted: false },
      laugh: { type: 'laugh', count: 12, reacted: false },
      angry: { type: 'angry', count: 24, reacted: false },
      sad: { type: 'sad', count: 32, reacted: false },
      celebrate: { type: 'celebrate', count: 19, reacted: false },
    },
    comments: 10,
  }
];

export function TeamNewsfeed() {
  const { team, membership } = useTeam();
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Load posts (mock data for now)
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        // In a real implementation, we would fetch posts from the API
        // const response = await api.getTeamPosts(team._id);
        // setPosts(response.data);

        // Using mock data for now
        setTimeout(() => {
          setPosts(MOCK_POSTS);
          setLoadingPosts(false);
        }, 1000);
      } catch (error: any) {
        toast.error(error.message || "Failed to load posts");
        setLoadingPosts(false);
      }
    };

    loadPosts();
  }, [team]);

  const handleSubmitPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      setIsSubmitting(true);

      // In a real implementation, we would send the post to the API
      // await api.createTeamPost(team._id, { title: newPostTitle, content: newPostContent });

      // Mock implementation
      const newPostObj = {
        id: `temp-${Date.now()}`,
        title: newPostTitle,
        content: newPostContent,
        author: {
          id: membership.user?._id || "current-user",
          name: membership.displayName || "You",
          avatar: membership.user?.avatar || "",
          role: membership.role
        },
        createdAt: new Date(),
        reactions: {
          like: { type: 'like', count: 0, reacted: false },
          love: { type: 'love', count: 0, reacted: false },
          laugh: { type: 'laugh', count: 0, reacted: false },
          angry: { type: 'angry', count: 0, reacted: false },
          sad: { type: 'sad', count: 0, reacted: false },
          celebrate: { type: 'celebrate', count: 0, reacted: false },
        },
        comments: 0,
      };

      setPosts([newPostObj, ...posts]);
      setNewPostTitle("");
      setNewPostContent("");
      toast.success("Post created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactToPost = (postId: string, reactionType: string) => {
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          // Create a copy of the reactions
          const updatedReactions = { ...post.reactions };

          // Toggle the reaction
          const currentReaction = updatedReactions[reactionType];
          const wasReacted = currentReaction.reacted;

          // Update the reaction count and status
          updatedReactions[reactionType] = {
            ...currentReaction,
            count: wasReacted ? currentReaction.count - 1 : currentReaction.count + 1,
            reacted: !wasReacted
          };

          return { ...post, reactions: updatedReactions };
        }
        return post;
      })
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
    toast.success("Post deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border shadow-xs p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={membership.user?.avatar} alt={membership.displayName} />
            <AvatarFallback>
              {membership.displayName?.substring(0, 2).toUpperCase() || "ME"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Create a post"
              className="w-full px-4 py-2 rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <Textarea
            placeholder="Text (optional)"
            className="w-full resize-none min-h-[100px]"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setNewPostTitle("");
              setNewPostContent("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPost}
            disabled={isSubmitting || !newPostTitle.trim()}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loadingPosts ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <TeamPostSkeleton key={i} />
          ))
        ) : posts.length === 0 ? (
          <div className="bg-card rounded-lg border shadow-xs p-6 text-center">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          posts.map((post) => (
            <TeamPost
              key={post.id}
              id={post.id}
              title={post.title}
              content={post.content}
              author={post.author}
              createdAt={post.createdAt}
              reactions={post.reactions}
              comments={post.comments}
              currentUserId={membership.user?._id || "current-user"}
              onReact={handleReactToPost}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>
    </div>
  );
}
