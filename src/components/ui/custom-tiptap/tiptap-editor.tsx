"use client";

import * as React from "react"
import { EditorContent } from "@tiptap/react"
import useTiptapEditor from "@/lib/hooks/useEditor";
import { FormatBubbleMenu } from "./bubble-menu/format-bubble-menu";
import { LinkBubbleMenu } from "./bubble-menu/link-bubble-menu";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  height?: string;
  className?: string;
}

export const TiptapEditor = ({
  value,
  onChange,
  placeholder = "Write something...",
  minHeight = "150px",
  height = "auto",
  className,
}: TiptapEditorProps) => {
  const editor = useTiptapEditor({
    value,
    onUpdate: (content) => {
      if (typeof content === "string") {
        onChange(content);
      }
    },
    placeholder,
    editable: true,
  });
  
  // Reset the editor when value is cleared
  React.useEffect(() => {
    if (editor && value === "" && !editor.isEmpty) {
      editor.commands.clearContent();
    }
  }, [editor, value]);

  // Return early if editor isn't initialized
  if (!editor) {
    return null;
  }

  return (
    <div className={cn("relative", className)} style={{ minHeight, height }}>
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none focus:outline-none w-full p-2 rounded-md border border-input bg-transparent"
      />
      <div className="z-50">
        <FormatBubbleMenu editor={editor} />
        <LinkBubbleMenu editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor; 