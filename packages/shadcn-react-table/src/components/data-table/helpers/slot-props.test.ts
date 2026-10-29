import type * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { mergeProps } from "./slot-props"

describe("mergeProps", () => {
  it("combines class names", () => {
    expect(mergeProps({ className: "a" }, { className: "b" }).className).toBe(
      "a b"
    )
  })

  it("merges style objects, the consumer winning", () => {
    expect(
      mergeProps(
        { style: { width: 10, color: "red" } as React.CSSProperties },
        { style: { color: "blue" } }
      ).style
    ).toEqual({ width: 10, color: "blue" })
  })

  it("runs both event handlers, ours first", () => {
    const calls: string[] = []
    const merged = mergeProps(
      { onClick: () => calls.push("ours") },
      { onClick: () => calls.push("theirs") }
    )
    merged.onClick()
    expect(calls).toEqual(["ours", "theirs"])
  })

  it("points both refs at the element", () => {
    const objectRef = { current: null as unknown }
    const callbackRef = vi.fn()
    const merged = mergeProps({ ref: objectRef } as { ref: unknown }, {
      ref: callbackRef,
    })
    const el = {}
    ;(merged.ref as (el: unknown) => void)(el)
    expect(objectRef.current).toBe(el)
    expect(callbackRef).toHaveBeenCalledWith(el)
  })

  it("ignores undefined values instead of wiping ours", () => {
    const onKeyDown = vi.fn()
    const merged = mergeProps(
      { onKeyDown, title: "a" },
      { onKeyDown: undefined, title: undefined }
    )
    expect(merged.onKeyDown).toBe(onKeyDown)
    expect(merged.title).toBe("a")
  })

  it("replaces anything else and skips empty inputs", () => {
    expect(
      mergeProps({ title: "a", id: "x" }, undefined, null, { title: "b" })
    ).toEqual({ title: "b", id: "x" })
  })
})
