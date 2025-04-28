"use client";
import useTiptapEditor from "@/lib/hooks/useEditor";
import {EditorToolbar} from "@/components/ui/custom-tiptap/toolbar";
import {EditorContent} from "@tiptap/react";
import {LinkBubbleMenu} from "@/components/ui/custom-tiptap/bubble-menu/link-bubble-menu";
import {FormatBubbleMenu} from "@/components/ui/custom-tiptap/bubble-menu/format-bubble-menu";
import {Button} from "@/components/ui/button";
import {ClassValue} from "clsx";
import {cn} from "@/lib/utils";

interface EmailComposerProps {
  context?: {
    target: string;
  },
  contentClassName?: ClassValue;
  onSend?: (html: string) => void;
}

export default function EmailComposer({context, onSend, contentClassName}: EmailComposerProps) {
  const editor = useTiptapEditor({
    onUpdate: () => {

    },
    editable: true,
    immediatelyRender: false,
  })

  if (!editor) return;

  const doSend = () => {
    onSend?.(editor!.getHTML());
  }
  return <div className={"w-full overflow-hidden"}>
    {context && (
      <div className={'text-xs flex flex-row gap-1 px-4 pt-2'}>
        <div className={'font-semibold'}>To:</div>
        <div className={'text-muted-foreground'}>
          {context.target}
        </div>
      </div>
    )}
    <div onClick={() => editor?.commands.focus()} className={'cursor-text'}>
      <EditorContent editor={editor} className={cn("tiptap-editor min-h-[140px] p-4", contentClassName)}/>
    </div>
    <LinkBubbleMenu editor={editor}/>
    <FormatBubbleMenu editor={editor}/>
    <div className={'flex flex-row items-center px-2'}>
      <Button className={'px-6 rounded-full'} onClick={doSend}>
        Send
      </Button>
      <div className={'flex-1'}>
        <EditorToolbar editor={editor}/>
      </div>
    </div>
  </div>;
}
