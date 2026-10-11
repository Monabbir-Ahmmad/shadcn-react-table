import { describe, expect, it, vi } from "vitest"

import {
  fromCorePinning,
  mapPinningUpdater,
  toCorePinning,
} from "./column-pinning"

describe("column pinning state mappers", () => {
  it("maps left/right to start/end, defaulting missing sides to []", () => {
    expect(toCorePinning({ left: ["a"] })).toEqual({ start: ["a"], end: [] })
    expect(toCorePinning({ left: ["a"], right: ["b"] })).toEqual({
      start: ["a"],
      end: ["b"],
    })
  })

  it("maps start/end back to left/right", () => {
    expect(fromCorePinning({ start: ["a"], end: ["b"] })).toEqual({
      left: ["a"],
      right: ["b"],
    })
    expect(fromCorePinning({})).toEqual({ left: [], right: [] })
  })

  it("translates a value updater", () => {
    const onChange = vi.fn()
    mapPinningUpdater(onChange)({ start: ["x"], end: [] })
    const updater = onChange.mock.calls[0]![0]
    expect(updater({ left: [], right: [] })).toEqual({ left: ["x"], right: [] })
  })

  it("translates a functional updater through the consumer's prev state", () => {
    const onChange = vi.fn()
    mapPinningUpdater(onChange)((prev) => ({
      start: [...prev.start, "y"],
      end: prev.end,
    }))
    const updater = onChange.mock.calls[0]![0]
    expect(updater({ left: ["x"], right: ["z"] })).toEqual({
      left: ["x", "y"],
      right: ["z"],
    })
  })
})
