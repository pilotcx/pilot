import * as React from "react"
import type {Editor} from "@tiptap/react"
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover"
import ToolbarButton from "@/components/ui/custom-tiptap/toolbar-button";
import {Link2Icon} from "lucide-react";
import LinkEditBlock from "@/components/ui/custom-tiptap/link/link-edit-block";

interface LinkEditPopoverProps {
  editor: Editor
  className?: string
}

const LinkEditPopover = ({editor, className}: LinkEditPopoverProps) => {
  const [open, setOpen] = React.useState(false)

  const {from, to} = editor.state.selection
  const text = editor.state.doc.textBetween(from, to, " ")

  const onSetLink = React.useCallback(
    (url: string, text?: string, openInNewTab?: boolean) => {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .insertContent({
          type: "text",
          text: text || url,
          marks: [
            {
              type: "link",
              attrs: {
                href: url,
                target: openInNewTab ? "_blank" : "",
              },
            },
          ],
        })
        .setLink({href: url})
        .run()

      editor.commands.enter()
    },
    [editor]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ToolbarButton
          isActive={editor.isActive("link")}
          tooltip="Link"
          aria-label="Insert link"
          disabled={editor.isActive("codeBlock")}
          className={className}
        >
          <Link2Icon className="size-5"/>
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-80" align="end" side="bottom">
        <LinkEditBlock onSave={onSetLink} defaultText={text}/>
      </PopoverContent>
    </Popover>
  )
}

export {LinkEditPopover}
