import * as React from "react"
import type { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react"
import TextStyle from "@/components/ui/custom-tiptap/toolbar/text-style";
import { TextList } from "../toolbar/text-list";
import {AlignCenterIcon, AlignLeftIcon, AlignRightIcon} from "lucide-react";
import ToolbarButton from "@/components/ui/custom-tiptap/toolbar-button";

interface FormatBubbleMenuProps {
  editor: Editor
}

export const FormatBubbleMenu = ({ editor }: FormatBubbleMenuProps) => {
  const shouldShow = React.useCallback(
    ({ editor }: { editor: Editor }) => {
      const { from, to } = editor.state.selection
      if (from === to) {
        return false
      }
      return !editor.isActive('link');
    },
    []
  )
  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        duration: 100,
        placement: "top"
      }}
    >
      <div className="flex items-center gap-1 rounded-md bg-muted p-1 shadow-md">
        <TextStyle
          editor={editor}
          activeActions={[
            "bold",
            "italic",
          ]}
          className="text-secondary-foreground"
        />
        <TextList editor={editor} className="text-secondary-foreground"/>
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({textAlign: 'left'})}
            tooltip="Align Left"
          >
            <AlignLeftIcon className="size-4 text-secondary-foreground" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({textAlign: 'center'})}
            tooltip="Align Center"
          >
            <AlignCenterIcon className="size-4 text-secondary-foreground" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({textAlign: 'right'})}
            tooltip="Align Right"
          >
            <AlignRightIcon className="size-4 text-secondary-foreground" />
          </ToolbarButton>
        </div>
      </div>
    </BubbleMenu>
  )
}
