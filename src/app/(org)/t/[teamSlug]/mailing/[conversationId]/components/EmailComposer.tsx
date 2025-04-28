"use client";
import {useTeam} from "@/components/providers/team-provider";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useMailing} from "@/components/providers/mailing-provider";
import gravatar from "gravatar";
import useTiptapEditor from "@/lib/hooks/useEditor";
import {EditorToolbar} from "@/components/ui/custom-tiptap/toolbar";
import {EditorContent} from "@tiptap/react";
import {LinkBubbleMenu} from "@/components/ui/custom-tiptap/bubble-menu/link-bubble-menu";
import {FormatBubbleMenu} from "@/components/ui/custom-tiptap/bubble-menu/format-bubble-menu";
import {Button} from "@/components/ui/button";

interface EmailComposerProps {
  context: {
    target: string;
  },
  onSend?: (html: string) => void;
}

export default function EmailComposer({context, onSend}: EmailComposerProps) {
  const {membership} = useTeam();
  const {activeAddress} = useMailing();

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

  return <div className={'flex flex-row gap-2 p-4'}>
    <Avatar
      className={'w-10 h-10'}
    >
      <AvatarImage
        src={gravatar.url(activeAddress?.fullAddress!)}
      />
      <AvatarFallback>
        {membership.displayName?.substring(0, 2)?.toUpperCase() || ''}
      </AvatarFallback>
    </Avatar>
    <div className={'flex-1 border rounded-lg p-2'}>
      <div className={"w-full overflow-hidden"}>
        <div className={'text-xs flex flex-row gap-1 px-4 pt-2'}>
          <div className={'font-semibold'}>To: </div>
          <div className={'text-muted-foreground'}>
            {context.target}
          </div>
        </div>
        <div onClick={() => editor?.commands.focus()} className={'cursor-text'}>
          <EditorContent editor={editor} className="tiptap-editor min-h-[140px] p-4"/>
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
      </div>
    </div>
  </div>
}
