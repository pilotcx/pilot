"use client";

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Code, 
  Heading1, 
  Heading2, 
  Underline as UnderlineIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface InlineMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  height?: string;
}

export function InlineMarkdownEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
  minHeight = '80px',
  height = 'auto',
}: InlineMarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      onChange(markdown);
    },
  });

  // Prevent layout shifts by stabilizing height
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: 'prose-container',
            style: `min-height: ${minHeight}; height: ${height};`,
          },
        },
      });
    }
  }, [editor, minHeight, height]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md", className)} style={{ contain: 'content' }}>
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 150 }}
          className="bg-background border rounded-md shadow-md p-1 flex gap-1 z-50"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            data-active={editor.isActive('underline')}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-sm"
            onClick={() => {
              const url = window.prompt('URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            data-active={editor.isActive('link')}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-active={editor.isActive('bulletList')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-active={editor.isActive('orderedList')}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            data-active={editor.isActive('codeBlock')}
          >
            <Code className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}
      <EditorContent
        editor={editor}
        className="px-3 py-2 w-full focus-within:outline-none prose prose-sm dark:prose-invert"
        style={{ minHeight, height }}
      />
      <style jsx global>{`
        [data-active="true"] {
          background-color: hsl(var(--muted));
          color: hsl(var(--foreground));
        }
        .ProseMirror {
          outline: none;
          min-height: ${minHeight};
          box-sizing: border-box;
          height: 100%;
          width: 100%;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        .prose-container {
          min-height: ${minHeight};
          height: ${height};
        }
      `}</style>
    </div>
  );
} 