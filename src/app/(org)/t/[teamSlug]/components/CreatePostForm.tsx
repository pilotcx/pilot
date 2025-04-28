"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import { useTeam } from "@/components/providers/team-provider";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { cn } from "@/lib/utils";
import { PenLine } from "lucide-react";

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const { team, membership } = useTeam();
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [createPost, { loading: isSubmitting }] = useApi(api.createPost);

  const handleSubmitPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !team?._id) return;

    try {
      const response = await createPost(team._id.toString(), {
        title: newPostTitle,
        content: newPostContent
      });

      if (response) {
        // Emit an event that the post was created so the newsfeed can refresh
        const event = new CustomEvent("post-created");
        window.dispatchEvent(event);

        setNewPostTitle("");
        setNewPostContent("");
        toast.success("Post created successfully");

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    }
  };

  const resetForm = () => {
    setNewPostTitle("");
    setNewPostContent("");
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={membership?.avatar} alt={membership?.displayName || ''} />
            <AvatarFallback>
              {membership?.displayName?.substring(0, 2)?.toUpperCase() || ''}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">{membership?.displayName}</div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Post title"
            className={cn(
              "w-full px-0 py-2 text-xl font-medium outline-none border-0 border-b border-border/50 bg-transparent",
              "focus:border-primary/30 transition-colors"
            )}
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
          />
          
          <MarkdownEditor
            value={newPostContent}
            onChange={setNewPostContent}
            placeholder="Write your post content here..."
            minHeight="200px"
            className="border-none shadow-sm"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPost}
            disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim()}
          >
            {isSubmitting ? "Posting..." : "Publish Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
