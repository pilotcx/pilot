import * as React from "react"
import type { Editor } from "@tiptap/react"
import type { Level } from "@tiptap/extension-heading"
import { cn } from "@/lib/utils"
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
import {CaseSensitiveIcon, ChevronDownIcon} from "lucide-react";
import ToolbarButton from "../toolbar-button"
import { EditorFormatAction } from "../editor-format-action"

interface TextHeading extends Omit<EditorFormatAction, "value" | "icon" | "action" | "isActive" | "canExecute" | "shortcuts"> {
  element: keyof React.JSX.IntrinsicElements
  level?: Level
  className: string
}

const formatActions: TextHeading[] = [
  {
    label: "Normal Text",
    element: "span",
    className: "grow",
  },
  {
    label: "Heading 1",
    element: "h1",
    level: 1,
    className: "m-0 grow text-3xl font-extrabold",
  },
  {
    label: "Heading 2",
    element: "h2",
    level: 2,
    className: "m-0 grow text-xl font-bold",
  },
  {
    label: "Heading 3",
    element: "h3",
    level: 3,
    className: "m-0 grow text-lg font-semibold",
  },
  {
    label: "Heading 4",
    element: "h4",
    level: 4,
    className: "m-0 grow text-base font-semibold",
  },
  {
    label: "Heading 5",
    element: "h5",
    level: 5,
    className: "m-0 grow text-sm font-normal",
  },
  {
    label: "Heading 6",
    element: "h6",
    level: 6,
    className: "m-0 grow text-sm font-normal",
  },
]

interface TextHeadingProps {
  editor: Editor
  activeLevels?: Level[]
  className?: string
  mode?: "fixed" | "inline"
}

export const TextHeading = React.memo(
  ({ editor, className, mode = "fixed", activeLevels = [1, 2, 3, 4, 5, 6] } : TextHeadingProps) => {
    const filteredActions = React.useMemo(
      () =>
        formatActions.filter(
          (action) => !action.level || activeLevels.includes(action.level)
        ),
      [activeLevels]
    )

    const handleStyleChange = React.useCallback(
      (level?: Level) => {
        if (level) {
          editor.chain().focus().toggleHeading({ level }).run()
        } else {
          editor.chain().focus().setParagraph().run()
        }
      },
      [editor]
    )

    const renderMenuItem = React.useCallback(
      ({ label, element: Element, level, className }: TextHeading) => (
        <div
          key={label}
          onClick={() => handleStyleChange(level)}
          className={cn("flex items-center gap-3 hover:bg-accent p-1 rounded cursor-default", {
            "bg-accent": level
              ? editor.isActive("heading", { level })
              : editor.isActive("paragraph"),
          })}
        >
          <Element className={className}>{label}</Element>
        </div>
      ),
      [editor, handleStyleChange]
    )

    const triggerButton = (
      <ToolbarButton
        isActive={editor.isActive("heading")}
        tooltip="Heading"
        aria-label="Text styles"
        pressed={editor.isActive("heading")}
        className={cn("w-12", className)}
        disabled={editor.isActive("codeBlock")}
      >
        <CaseSensitiveIcon className="size-5" />
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
            {filteredActions.map(renderMenuItem)}
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
          {filteredActions.map(renderMenuItem)}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)
