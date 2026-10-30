import type { IconLibrary } from "@/components/examples/icon-sets"

/** Theme choices the home page sends to each style frame. */
export type FrameTheme = {
  accent: string
  base: string
  font: string
  radius: string
  icons: IconLibrary
  dark: boolean
}
export type ToFrame = { type: "srt:theme"; theme: FrameTheme }
export type FromFrame = { type: "srt:height"; height: number }

const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null

export function isToFrame(x: unknown): x is ToFrame {
  if (!isObject(x) || x.type !== "srt:theme" || !isObject(x.theme)) return false
  const t = x.theme
  return (
    ["accent", "base", "font", "radius", "icons"].every(
      (k) => typeof t[k] === "string"
    ) && typeof t.dark === "boolean"
  )
}

export function isFromFrame(x: unknown): x is FromFrame {
  return (
    isObject(x) &&
    x.type === "srt:height" &&
    typeof x.height === "number" &&
    Number.isFinite(x.height) &&
    x.height >= 0
  )
}
