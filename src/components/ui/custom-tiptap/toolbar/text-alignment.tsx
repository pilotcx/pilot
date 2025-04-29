import * as React from "react"
import type { Editor } from "@tiptap/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon, ChevronDownIcon} from 'lucide-react';
import {cn} from "@/lib/utils";
import {EditorFormatAction} from "@/components/ui/custom-tiptap/editor-format-action";
import ToolbarButton from "@/components/ui/custom-tiptap/toolbar-button";

type TextAlignmentAction = "left" | "center" | "right" | "justify"

interface TextAlignment extends Omit<EditorFormatAction,  "canExecute" | "shortcuts"> {
  value: TextAlignmentAction
}

const formatActions: TextAlignment[] = [
  {
    label: "Left",
    value: "left",
    icon: <AlignLeftIcon className="size-5" />,
    action: (editor) => editor.chain().focus().setTextAlign("left").run(),
    isActive: (editor) => editor.isActive({textAlign: 'left'}),
  },
  {
    label: "Center",
    value: "center",
    icon: <AlignCenterIcon className="size-5" />,
    action: (editor) => editor.chain().focus().setTextAlign("center").run(),
    isActive: (editor) => editor.isActive({textAlign: 'center'}),
  },
  {
    label: "Right",
    value: "right",
    icon: <AlignRightIcon className="size-5" />,
    action: (editor) => editor.chain().focus().setTextAlign("right").run(),
    isActive: (editor) => editor.isActive({textAlign: 'right'}),
  },
  {
    label: "Justify",
    value: "justify",
    icon: <AlignJustifyIcon className="size-5" />,
    action: (editor) => editor.chain().focus().setTextAlign("justify").run(),
    isActive: (editor) => editor.isActive({textAlign: 'justify'}),
  }
]

interface TextAlignmentProps {
  editor: Editor
  activeActions?: TextAlignmentAction[]
  className?: string
  mode?: "fixed" | "inline"
}

export const TextAlignment = (props: TextAlignmentProps) => {
  const {
    editor,
    className,
    mode = "fixed",
    activeActions = formatActions.map((action) => action.value)
  } = props

  const renderMenuItem = React.useCallback(
    (actionValue: TextAlignmentAction) => {
      const action = formatActions.find((a) => a.value === actionValue)
      if (!action) return null

      return (
        <div
          key={action.value}
          onClick={() => action.action(editor)}
          className={cn("flex items-center gap-3 hover:bg-accent p-1 rounded cursor-default text-sm font-base", {
            "bg-accent": action.isActive(editor)
          })}
        >
          {action.icon}
          {action.label}
        </div>
      )
    },
    [editor]
  )

  const currentAlignment = formatActions.find(action => action.isActive(editor))
  const triggerButton = (
    <ToolbarButton
      isActive={editor.isActive("textAlign")}
      tooltip="Alignment"
      aria-label="Text alignment"
      pressed={editor.isActive("textAlign")}
      className={cn("w-fit px-2", className)}
      disabled={editor.isActive("codeBlock")}
    >
      {currentAlignment?.icon || <AlignLeftIcon className="size-5" />}
      <ChevronDownIcon className="size-5" />
    </ToolbarButton>
  )

  if (mode === "inline") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          {triggerButton}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-full px-2 py-2">
          {activeActions.map(renderMenuItem)}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full">
        {activeActions.map(renderMenuItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
