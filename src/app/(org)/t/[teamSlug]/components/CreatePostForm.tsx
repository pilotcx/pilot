"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import { useTeam } from "@/components/providers/team-provider";

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

  return (
    <div>
      <div className={'border rounded-lg overflow-hidden divide-y'}>
        <input
          type="text"
          placeholder="Create a post"
          className="w-full px-4 py-2 text-sm outline-none"
          value={newPostTitle}
          onChange={(e) => setNewPostTitle(e.target.value)}
        />
        <textarea
          placeholder="Text (optional)"
          className="w-full px-4 py-2 text-sm outline-none resize-none border-none min-h-[100px] rounded-none"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 mt-2">
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
  );
}
