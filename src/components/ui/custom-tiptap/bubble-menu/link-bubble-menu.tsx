import * as React from "react"
import type { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { ExternalLinkIcon, PencilIcon, XIcon } from "lucide-react"

interface LinkBubbleMenuProps {
  editor: Editor
}

interface LinkAttributes {
  href: string
  target: string
}

interface ShouldShowProps {
  editor: Editor
  from: number
  to: number
}

export const LinkBubbleMenu = ({ editor } : LinkBubbleMenuProps) => {
  const [linkAttrs, setLinkAttrs] = React.useState<LinkAttributes>({
    href: "",
    target: "",
  })

  const updateLinkState = React.useCallback(() => {
    const { from, to } = editor.state.selection
    const { href, target } = editor.getAttributes("link")
    setLinkAttrs({ href, target })
  }, [editor])

  const shouldShow = React.useCallback(
    ({ editor, from, to }: ShouldShowProps) => {
      if (from === to) {
        return false
      }
      const { href } = editor.getAttributes("link")

      if (!editor.isActive("link") || !editor.isEditable) {
        return false
      }

      if (href) {
        updateLinkState()
        return true
      }
      return false
    },
    [updateLinkState]
  )

  const handleEdit = React.useCallback(() => {
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, " ")
    const url = window.prompt('URL', linkAttrs.href)
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run()
    }
  }, [editor, linkAttrs.href])

  const onUnsetLink = React.useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
  }, [editor])

  const openLink = React.useCallback(() => {
    window.open(linkAttrs.href, '_blank')
  }, [linkAttrs.href])

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        placement: "bottom-start",
        appendTo: () => document.body,
        zIndex: 50
      }}
    >
      <div className="flex items-center gap-2 rounded-md border bg-popover p-2 shadow-md">
        <span className="text-xs truncate max-w-40 text-muted-foreground">
          {linkAttrs.href}
        </span>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={openLink}
            title="Open link"
          >
            <ExternalLinkIcon className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleEdit}
            title="Edit link"
          >
            <PencilIcon className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onUnsetLink}
            title="Remove link"
          >
            <XIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </BubbleMenu>
  )
}
