import * as React from "react"
import type { Editor } from "@tiptap/react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import ToolbarButton from "@/components/ui/custom-tiptap/toolbar-button";
import {BoldIcon, EllipsisIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon} from "lucide-react";
import {EditorFormatAction} from "@/components/ui/custom-tiptap/editor-format-action";
import {getShortcutKey} from "@/components/ui/custom-tiptap/editor-utils";

type TextStyleAction =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"

interface TextStyle extends EditorFormatAction {
  value: TextStyleAction
}

const formatActions: TextStyle[] = [
  {
    value: "bold",
    label: "Bold",
    icon: <BoldIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleBold().run() &&
      !editor.isActive("codeBlock"),
    shortcuts: ["mod", "B"],
  },
  {
    value: "italic",
    label: "Italic",
    icon: <ItalicIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleItalic().run() &&
      !editor.isActive("codeBlock"),
    shortcuts: ["mod", "I"],
  },
  {
    value: "underline",
    label: "Underline",
    icon: <UnderlineIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive("underline"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleUnderline().run() &&
      !editor.isActive("codeBlock"),
    shortcuts: ["mod", "U"],
  },
  {
    value: "strikethrough",
    label: "Strikethrough",
    icon: <StrikethroughIcon className="size-5" />,
    action: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive("strike"),
    canExecute: (editor) =>
      editor.can().chain().focus().toggleStrike().run() &&
      !editor.isActive("codeBlock"),
    shortcuts: ["mod", "shift", "S"],
  },
]

interface TextStyleProps {
  editor: Editor
  activeActions?: TextStyleAction[]
  className?: string
  mode?: "fixed" | "inline"
}

const mainActions: TextStyleAction[] = ["bold", "italic"]
const dropdownActions: TextStyleAction[] = ["underline", "strikethrough"]

export default function TextStyle(props: TextStyleProps) {
  const {
    editor,
    className,
    mode = "fixed",
    activeActions = formatActions.map((action) => action.value)
  } = props

  const renderToolbarButton = React.useCallback(
    (actionValue: TextStyleAction) => {
      const action = formatActions.find((a) => a.value === actionValue)
      if (!action) return null

      return (
        <ToolbarButton
          key={action.label}
          onClick={() => action.action(editor)}
          disabled={!action.canExecute(editor)}
          isActive={action.isActive(editor)}
          tooltip={`${action.label} ${action.shortcuts.map((s) => getShortcutKey(s).symbol).join(" ")}`}
          aria-label={action.label}
          className={className}
        >
          {action.icon}
        </ToolbarButton>
      )
    },
    [editor, className]
  )

  const renderMenuItem = React.useCallback(
    (actionValue: TextStyleAction) => {
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
          <span className="ml-auto text-xs text-muted-foreground">
            {action.shortcuts.map((s) => getShortcutKey(s).symbol).join(" ")}
          </span>
        </Button>
      )
    },
    [editor]
  )

  const filteredMainActions = activeActions.filter(action => mainActions.includes(action))
  const filteredDropdownActions = activeActions.filter(action => dropdownActions.includes(action))

  const triggerButton = (
    <ToolbarButton aria-label="More text styles" className={className}>
      <EllipsisIcon className="size-5" />
    </ToolbarButton>
  )

  return (
    <div className="flex items-center gap-1">
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
    </div>
  )
}
