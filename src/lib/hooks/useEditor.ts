import * as React from "react"
import type {Content, Editor, UseEditorOptions} from "@tiptap/react"
import {useEditor} from "@tiptap/react"
import {StarterKit} from "@tiptap/starter-kit"
import {Typography} from "@tiptap/extension-typography"
import {Placeholder} from "@tiptap/extension-placeholder"
import {Underline} from "@tiptap/extension-underline"
import {TextStyle} from "@tiptap/extension-text-style"
import {cn} from "@/lib/utils"
import {CodeBlockLowlight, Color, Link} from "@/components/ui/custom-tiptap/extensions";
import {TextAlign} from "@tiptap/extension-text-align";
import { FontSize } from '@tiptap/extension-font-size';

export interface UseTiptapEditorProps extends UseEditorOptions {
  value?: Content
  type?: "html" | "json" | "text"
  placeholder?: string
  editorClassName?: string
  immediatelyRender?: boolean
  onUpdate?: (content: Content) => void
  onBlur?: (content: Content) => void
}

const createExtensions = (placeholder: string) => [
  StarterKit.configure({
    horizontalRule: false,
    codeBlock: false,
    paragraph: {HTMLAttributes: {class: "text-node"}},
    heading: {HTMLAttributes: {class: "heading-node"}},
    blockquote: {HTMLAttributes: {class: "block-node"}},
    bulletList: {HTMLAttributes: {class: "list-node"}},
    orderedList: {HTMLAttributes: {class: "list-node"}},
    code: {HTMLAttributes: {class: "inline", spellcheck: "false"}},
  }),
  Link,
  Underline,
  Color,
  TextStyle,
  Typography,
  CodeBlockLowlight,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    defaultAlignment: 'left',
  }),
  FontSize.configure({

  }),
  Placeholder.configure({placeholder: () => placeholder}),
]

const getOutput = (
  editor: Editor,
  format: UseTiptapEditorProps["type"]
): object | string => {
  switch (format) {
    case "json":
      return editor.getJSON()
    case "html":
      return editor.isEmpty ? "" : editor.getHTML()
    default:
      return editor.getText()
  }
}

export const useTiptapEditor = (props: UseTiptapEditorProps) => {
  const {
    value,
    type = "html",
    placeholder = "",
    editorClassName,
    onUpdate,
    onBlur
  } = props;

  const handleUpdate = React.useCallback(
    ({ editor }: { editor: Editor }) => {
      onUpdate?.(getOutput(editor, type))
    },
    [type, onUpdate]
  )

  const handleCreate = React.useCallback(
    ({ editor }: { editor: Editor }) => {
      if (value && editor.isEmpty) {
        editor.commands.setContent(value)
      }
    },
    [value]
  )

  const handleBlur = React.useCallback(
    ({ editor }: { editor: Editor }) => {
      onBlur?.(getOutput(editor, type))
    },
    [type, onBlur]
  )

  return useEditor({
    extensions: createExtensions(placeholder),
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: cn("focus:outline-none", editorClassName),
      },
    },
    onUpdate: handleUpdate,
    onCreate: handleCreate,
    onBlur: handleBlur,
    ...props,
  })
}

export default useTiptapEditor
