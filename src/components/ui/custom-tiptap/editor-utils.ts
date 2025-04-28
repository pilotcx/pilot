type ShortcutKeyResult = {
  symbol: string
  readable: string
}

export const isClient = (): boolean => typeof window !== "undefined"
export const isMacOS = (): boolean =>
  isClient() && window.navigator.platform === "MacIntel"

const shortcutKeyMap: Record<string, ShortcutKeyResult> = {
  mod: isMacOS()
    ? { symbol: "⌘", readable: "Command" }
    : { symbol: "Ctrl", readable: "Control" },
  alt: isMacOS()
    ? { symbol: "⌥", readable: "Option" }
    : { symbol: "Alt", readable: "Alt" },
  shift: { symbol: "⇧", readable: "Shift" },
}

export const getShortcutKey = (key: string): ShortcutKeyResult =>
  shortcutKeyMap[key.toLowerCase()] || { symbol: key, readable: key }