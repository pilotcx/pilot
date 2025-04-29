import * as React from "react"
import type { Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  List,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Code
} from "lucide-react"
import ToolbarButton from "../toolbar-button"

interface InlineToolbarProps {
  editor: Editor
}

export const InlineToolbar = ({ editor }: InlineToolbarProps) => {
  const shouldShow = React.useCallback(({ editor }: { editor: Editor }) => {
    return editor.isFocused
  }, [])

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    
    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        duration: 100,
        placement: "top",
        interactive: true,
        hideOnClick: false,
      }}
    >
      <div className="flex items-center gap-1 rounded-md border bg-muted p-1 shadow-md">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          tooltip="Bold"
        >
          <Bold className="size-4 text-secondary-foreground" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          tooltip="Italic"
        >
          <Italic className="size-4 text-secondary-foreground" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          tooltip="Underline"
        >
          <Underline className="size-4 text-secondary-foreground" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          tooltip="Strikethrough"
        >
          <Strikethrough className="size-4 text-secondary-foreground" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({textAlign: 'left'})}
          tooltip="Align Left"
        >
          <AlignLeft className="size-4 text-secondary-foreground" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({textAlign: 'center'})}
          tooltip="Align Center"
        >
          <AlignCenter className="size-4 text-secondary-foreground" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({textAlign: 'right'})}
          tooltip="Align Right"
        >
          <AlignRight className="size-4 text-secondary-foreground" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
          isActive={editor.isActive('heading', {level: 1})}
          tooltip="Heading 1"
        >
          <Heading1 className="size-4 text-secondary-foreground" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
          isActive={editor.isActive('heading', {level: 2})}
          tooltip="Heading 2"
        >
          <Heading2 className="size-4 text-secondary-foreground" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
          isActive={editor.isActive('heading', {level: 3})}
          tooltip="Heading 3"
        >
          <Heading3 className="size-4 text-secondary-foreground" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          tooltip="Bullet List"
        >
          <List className="size-4 text-secondary-foreground" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          tooltip="Ordered List"
        >
          <ListOrdered className="size-4 text-secondary-foreground" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Additional elements */}
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          tooltip="Link"
        >
          <Link className="size-4 text-secondary-foreground" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          tooltip="Code Block"
        >
          <Code className="size-4 text-secondary-foreground" />
        </ToolbarButton>
      </div>
    </BubbleMenu>
  )
}
