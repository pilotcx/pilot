"use client";

import useTiptapEditor, {UseTiptapEditorProps} from "@/lib/hooks/useEditor";
import {Content, EditorContent} from "@tiptap/react"
import {forwardRef, Ref} from "react";
import {EditorToolbar} from "@/components/ui/custom-tiptap/toolbar";
import {LinkBubbleMenu} from "@/components/ui/custom-tiptap/bubble-menu/link-bubble-menu";
import {FormatBubbleMenu} from "@/components/ui/custom-tiptap/bubble-menu/format-bubble-menu";
import {InlineToolbar} from "@/components/ui/custom-tiptap/toolbar/inline-toolbar";
import {cn} from "@/lib/utils";

export interface TiptapProps extends Omit<UseTiptapEditorProps, "onUpdate"> {
  value?: Content;
  onChange?: (value: Content) => void;
  className?: string;
  editorContentClassName?: string;
  mode: "fixed" | "inline";
}

export const RichTextEditor = forwardRef((props: TiptapProps, ref: Ref<any>) => {
  const {value, onChange, className, editorContentClassName, mode} = props

  const editor = useTiptapEditor({
    value,
    onUpdate: onChange,
    editable: true,
    immediatelyRender: false,
    ...props,
  })

  if (!editor) {
    return null
  }

  return (
    <div className={cn("w-full border rounded-lg overflow-hidden", className)}>
      {mode === "fixed" && <EditorToolbar editor={editor}/>}
      <EditorContent editor={editor} className="tiptap-editor min-h-[300px] p-4"/>
      <LinkBubbleMenu editor={editor}/>
      {mode === "fixed" && <FormatBubbleMenu editor={editor}/>}
      {mode === "inline" && <InlineToolbar editor={editor}/>}
    </div>
  )
})
