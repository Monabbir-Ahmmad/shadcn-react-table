import { describe, expect, it } from "vitest"

import { isFromFrame, isToFrame } from "./style-frame-protocol"

const theme = {
  accent: "lime",
  base: "neutral",
  font: "geist",
  radius: "0rem",
  icons: "lucide",
  dark: false,
}

describe("frame messages", () => {
  it("accepts well-formed messages", () => {
    expect(isToFrame({ type: "srt:theme", theme })).toBe(true)
    expect(isFromFrame({ type: "srt:height", height: 420 })).toBe(true)
  })

  it("rejects anything else", () => {
    expect(isToFrame({ type: "srt:theme" })).toBe(false)
    expect(
      isToFrame({ type: "srt:theme", theme: { ...theme, dark: "yes" } })
    ).toBe(false)
    expect(isToFrame("srt:theme")).toBe(false)
    expect(isFromFrame({ type: "srt:height", height: -1 })).toBe(false)
    expect(isFromFrame({ type: "other", height: 1 })).toBe(false)
  })
})
