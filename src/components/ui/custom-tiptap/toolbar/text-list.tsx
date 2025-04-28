import * as React from "react"
import type { Editor } from "@tiptap/react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {ChevronDownIcon, ListIcon} from "lucide-react";
import {EditorFormatAction} from "@/components/ui/custom-tiptap/editor-format-action";
import ToolbarButton from "@/components/ui/custom-tiptap/toolbar-button";

type ListItemAction = "orderedList" | "bulletList"
interface ListItem extends Omit<EditorFormatAction, 'shortcuts'> {
  value: ListItemAction
}

const formatActions: ListItem[] = [
  {
    value: "orderedList",
    label: "Numbered list",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="20px"
        viewBox="0 -960 960 960"
        width="15px"
        fill="currentColor"
      >
        <path d="M144-144v-48h96v-24h-48v-48h48v-24h-96v-48h120q10.2 0 17.1 6.9 6.9 6.9 6.9 17.1v48q0 10.2-6.9 17.1-6.9 6.9-17.1 6.9 10.2 0 17.1 6.9 6.9 6.9 6.9 17.1v48q0 10.2-6.9 17.1-6.9 6.9-17.1 6.9H144Zm0-240v-96q0-10.2 6.9-17.1 6.9-6.9 17.1-6.9h72v-24h-96v-48h120q10.2 0 17.1 6.9 6.9 6.9 6.9 17.1v72q0 10.2-6.9 17.1-6.9 6.9-17.1 6.9h-72v24h96v48H144Zm48-240v-144h-48v-48h96v192h-48Zm168 384v-72h456v72H360Zm0-204v-72h456v72H360Zm0-204v-72h456v72H360Z" />
      </svg>
    ),
    isActive: (editor) => editor.isActive("orderedList"),
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleOrderedList().run(),
  },
  {
    value: "bulletList",
    label: "Bullet list",
    icon: <ListIcon className="size-5" />,
    isActive: (editor) => editor.isActive("bulletList"),
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
    canExecute: (editor) => editor.can().chain().focus().toggleBulletList().run(),
  },
]

interface TextListProps {
  editor: Editor
  activeActions?: ListItemAction[]
  className?: string
  mode?: "fixed" | "inline"
}

export const TextList = (props: TextListProps) => {
  const {editor, className, mode = "fixed", activeActions = formatActions.map((action) => action.value)} = props

  const renderMenuItem = React.useCallback(
    (actionValue: ListItemAction) => {
      const action = formatActions.find((a) => a.value === actionValue)
      if (!action) return null

      return (
        <div
          key={action.label}
          onClick={() => action.action(editor)}
          className={cn("flex items-center gap-3 hover:bg-accent p-1 rounded cursor-default text-sm font-base", {
            "bg-accent": action.isActive(editor)
          })}
        >
          {action.icon}
          <span>{action.label}</span>
        </div>
      )
    },
    [editor]
  )

  const currentList = formatActions.find(action => action.isActive(editor))
  const triggerButton = (
    <ToolbarButton
      isActive={editor.isActive("bulletList") || editor.isActive("orderedList")}
      tooltip="List"
      aria-label="List options"
      pressed={editor.isActive("bulletList") || editor.isActive("orderedList")}
      className={cn("w-12", className)}
    >
      {currentList?.icon || <ListIcon className="size-5" />}
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
