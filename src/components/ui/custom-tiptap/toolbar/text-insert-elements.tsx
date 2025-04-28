import * as React from "react"
import type { Editor } from "@tiptap/react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover"
import { EditorFormatAction } from "../editor-format-action";
import {ChevronDownIcon, CodeIcon, PlusIcon, QuoteIcon} from "lucide-react";
import ToolbarButton from "@/components/ui/custom-tiptap/toolbar-button";
import {LinkEditPopover} from "@/components/ui/custom-tiptap/link/link-edit-popover";

type InsertElementAction = "codeBlock" | "blockquote" | "horizontalRule"
interface InsertElement extends Omit<EditorFormatAction, 'shortcuts'> {
  value: InsertElementAction
}

const formatActions: InsertElement[] = [
  {
    value: "codeBlock",
    label: "Code block",
    icon: <CodeIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive("codeBlock"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleCodeBlock().run(),
  },
  {
    value: "blockquote",
    label: "Blockquote",
    icon: <QuoteIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleBlockquote().run(),
  },
]

interface TextInsertElementProps {
  editor: Editor
  activeActions?: InsertElementAction[]
  className?: string
  mode?: "fixed" | "inline"
}

const mainActions: InsertElementAction[] = ["codeBlock"]
const dropdownActions: InsertElementAction[] = ["blockquote", "horizontalRule"]

export const TextInsertElement = (props: TextInsertElementProps) => {
  const {editor, className, mode = "fixed", activeActions = formatActions.map((action) => action.value)} = props
  const renderToolbarButton = React.useCallback(
    (actionValue: InsertElementAction) => {
      const action = formatActions.find((a) => a.value === actionValue)
      if (!action) return null

      return (
        <ToolbarButton
          key={action.label}
          onClick={() => action.action(editor)}
          isActive={action.isActive(editor)}
          tooltip={`${action.label}`}
          aria-label={action.label}
          className={className}
        >
          {action.icon}
        </ToolbarButton>
      )
    },
    [editor]
  )

  const renderMenuItem = React.useCallback(
    (actionValue: InsertElementAction) => {
      const action = formatActions.find((a) => a.value === actionValue)
      if (!action) return null

      return (
        <Button
          variant="ghost"
          key={action.label}
          onClick={() => action.action(editor)}
          disabled={!action.canExecute(editor)}
          className={cn(
            'flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-accent w-full',
            action.isActive(editor) ? 'bg-accent' : '',
            !action.canExecute(editor) ? 'opacity-50' : ''
          )}
        >
          {action.icon}
          <span>{action.label}</span>
        </Button>
      )
    },
    [editor]
  )
  const filteredMainActions = activeActions.filter(action => mainActions.includes(action))
  const filteredDropdownActions = activeActions.filter(action => dropdownActions.includes(action))
  const triggerButton = (
    <ToolbarButton
      aria-label="More elements"
      className={cn("w-12", className)}
    >
      <PlusIcon className="size-5" />
      <ChevronDownIcon className="size-5" />
    </ToolbarButton>
  )
  return (
    <>
      <LinkEditPopover editor={editor} className={className}/>
      <div className="hidden md:flex items-center gap-1">
        {activeActions.map(renderToolbarButton)}
      </div>
      <div className="flex md:hidden items-center gap-1">
        {filteredMainActions.map(renderToolbarButton)}
        {filteredDropdownActions.length > 0 && (
          mode === "inline" ? (
            <Popover>
              <PopoverTrigger asChild>
                {triggerButton}
              </PopoverTrigger>
              <PopoverContent align="start" className="w-full px-2 py-2">
                {filteredDropdownActions.map(renderMenuItem)}
              </PopoverContent>
            </Popover>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {triggerButton}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full">
                {filteredDropdownActions.map(renderMenuItem)}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        )}
      </div>

    </>
  )
}
