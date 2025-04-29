import * as React from "react"
import type { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react"
import { cn } from "@/lib/utils"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon
} from "lucide-react"
import ToolbarButton from "@/components/ui/custom-tiptap/toolbar-button"

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
      return !editor.isActive('link')
    },
    []
  )
  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        duration: 100,
        placement: "top",
        appendTo: () => document.body,
        zIndex: 50
      }}
    >
      <div className="flex items-center gap-1 rounded-md bg-muted p-1 shadow-md">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          tooltip="Bold"
        >
          <BoldIcon className="size-4 text-secondary-foreground" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          tooltip="Italic"
        >
          <ItalicIcon className="size-4 text-secondary-foreground" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          tooltip="Bullet List"
        >
          <ListIcon className="size-4 text-secondary-foreground" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          tooltip="Ordered List"
        >
          <ListOrderedIcon className="size-4 text-secondary-foreground" />
        </ToolbarButton>

        <div className={cn("h-4 w-[1px] bg-border mx-1")} />

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
    </BubbleMenu>
  )
}
