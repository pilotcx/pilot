import * as React from "react"
import type { Editor } from "@tiptap/react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import ToolbarButton from "@/components/ui/custom-tiptap/toolbar-button";
import {CheckIcon, PaletteIcon} from "lucide-react";
import {ToggleGroup, ToggleGroupItem } from "../../toggle-group";

interface ColorItem {
  cssVar: string
}

interface ColorPalette {
  colors: ColorItem[]
  inverse: string
}

const COLORS: ColorPalette[] = [
  {
    inverse: "hsl(var(--background))",
    colors: [
      { cssVar: "hsl(var(--foreground))" },
      { cssVar: "var(--mt-accent-bold-blue)" },
      { cssVar: "var(--mt-accent-bold-teal)" },
      { cssVar: "var(--mt-accent-bold-green)" },
      { cssVar: "var(--mt-accent-bold-orange)" },
      { cssVar: "var(--mt-accent-bold-red)" },
      { cssVar: "var(--mt-accent-bold-purple)" },
    ],
  },
  {
    inverse: "hsl(var(--background))",
    colors: [
      { cssVar: "var(--mt-accent-gray)" },
      { cssVar: "var(--mt-accent-blue)" },
      { cssVar: "var(--mt-accent-teal)" },
      { cssVar: "var(--mt-accent-green)" },
      { cssVar: "var(--mt-accent-orange)" },
      { cssVar: "var(--mt-accent-red)" },
      { cssVar: "var(--mt-accent-purple)" },
    ],
  },
  {
    inverse: "hsl(var(--foreground))",
    colors: [
      { cssVar: "hsl(var(--background))" },
      { cssVar: "var(--mt-accent-blue-subtler)" },
      { cssVar: "var(--mt-accent-teal-subtler)" },
      { cssVar: "var(--mt-accent-green-subtler)" },
      { cssVar: "var(--mt-accent-yellow-subtler)" },
      { cssVar: "var(--mt-accent-red-subtler)" },
      { cssVar: "var(--mt-accent-purple-subtler)" },
    ],
  },
];

const MemoizedColorButton = React.memo<{
  color: ColorItem
  isSelected: boolean
  inverse: string
  onClick: (value: string) => void
}>(({ color, isSelected, inverse, onClick }) => {

  return (
    <ToggleGroupItem
      tabIndex={0}
      className="relative size-7 rounded-md p-0"
      value={color.cssVar}
      style={{ backgroundColor: color.cssVar }}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        onClick(color.cssVar)
      }}
    >
      {isSelected && (
        <CheckIcon
          className="absolute inset-0 m-auto size-6"
          style={{ color: inverse }}
        />
      )}
    </ToggleGroupItem>
  )
})

const MemoizedColorPicker = React.memo<{
  palette: ColorPalette
  selectedColor: string
  inverse: string
  onColorChange: (value: string) => void
}>(({ palette, selectedColor, inverse, onColorChange }) => (
  <ToggleGroup
    type="single"
    value={selectedColor}
    onValueChange={(value: string) => {
      if (value) onColorChange(value)
    }}
    className="gap-1.5"
  >
    {palette.colors.map((color, index) => (
      <MemoizedColorButton
        key={index}
        inverse={inverse}
        color={color}
        isSelected={selectedColor === color.cssVar}
        onClick={onColorChange}
      />
    ))}
  </ToggleGroup>
))

interface TextColorProps {
  editor: Editor
  className?: string
}

export const TextColor = ({editor, className}: TextColorProps) => {
  const color = editor.getAttributes("textStyle")?.color || "hsl(var(--foreground))"
  const [selectedColor, setSelectedColor] = React.useState(color)

  const handleColorChange = React.useCallback(
    (value: string) => {
      setSelectedColor(value)
      editor.chain().setColor(value).run()
    },
    [editor]
  )

  React.useEffect(() => {
    setSelectedColor(color)
  }, [color])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ToolbarButton
          tooltip="Text color"
          aria-label="Text color"
          className={className}
        >
          <PaletteIcon className='size-5'/>
        </ToolbarButton>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-full">
        <div className="space-y-1.5">
          {COLORS.map((palette, index) => (
            <MemoizedColorPicker
              key={index}
              palette={palette}
              inverse={palette.inverse}
              selectedColor={selectedColor}
              onColorChange={handleColorChange}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
