import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Separator } from "@/components/ui/separator"
import TextStyle from "@/components/ui/custom-tiptap/toolbar/text-style";
import { TextAlignment } from "./text-alignment";
import { TextHeading } from "./text-heading";
import {TextList} from "@/components/ui/custom-tiptap/toolbar/text-list";
import { TextColor } from "./text-color";
import { TextInsertElement } from "./text-insert-elements";
import {ClassValue} from "clsx";
import {cn} from "@/lib/utils";

export const EditorToolbar = ({ editor, className }: { editor: Editor, className?: ClassValue }) => (
  <div className={cn("p-2 flex gap-1 items-center overflow-x-auto", className)}>
    <TextStyle
      editor={editor}
      activeActions={[
        "bold",
        "italic",
        "underline",
        "strikethrough",
      ]}
    />

    <Separator orientation="vertical" className="mx-2 h-7" />
    <TextAlignment editor={editor} />
    <TextHeading editor={editor} activeLevels={[1, 2, 3, 4]}/>
    <TextList editor={editor} />
    <TextColor editor={editor} />

    <Separator orientation="vertical" className="mx-2 h-7" />

    <TextInsertElement editor={editor} />
  </div>
)
