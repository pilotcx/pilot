"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTeam } from "@/components/providers/team-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CreateAnnouncementFormProps {
  onSuccess?: () => void;
}

export function CreateAnnouncementForm({ onSuccess }: CreateAnnouncementFormProps) {
  const { membership } = useTeam();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAnnouncement = async () => {
    // This is a placeholder for future implementation
    toast.info("Announcement creation is not implemented yet");

    // Reset form
    setTitle("");
    setContent("");
    setPriority("normal");

    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPriority("normal");
  };

  return (
    <div>
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
            placeholder="Announcement title"
            className="w-full px-4 py-2 rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4">
        <Textarea
          placeholder="Announcement content"
          className="w-full resize-none min-h-[100px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger id="priority">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={resetForm}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmitAnnouncement}
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? "Creating..." : "Create Announcement"}
        </Button>
      </div>
    </div>
  );
}
