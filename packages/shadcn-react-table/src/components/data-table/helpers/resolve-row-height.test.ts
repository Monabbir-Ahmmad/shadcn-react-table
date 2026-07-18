import type { Row } from "@tanstack/react-table"
import { describe, expect, it, vi } from "vitest"

import { resolveRowHeight } from "./resolve-row-height"

// The resolver only forwards the row to getRowHeight, so a stub id is enough.
const row = { id: "r1" } as unknown as Row<unknown>

describe("resolveRowHeight", () => {
  it("returns the number from getRowHeight", () => {
    expect(resolveRowHeight(row, { getRowHeight: () => 80 })).toBe(80)
  })

  it("returns 'auto' from getRowHeight", () => {
    expect(resolveRowHeight(row, { getRowHeight: () => "auto" })).toBe("auto")
  })

  it("falls back to rowHeight when getRowHeight returns null", () => {
    expect(
      resolveRowHeight(row, { getRowHeight: () => null, rowHeight: 52 })
    ).toBe(52)
  })

  it("falls back to rowHeight when getRowHeight returns undefined", () => {
    expect(
      resolveRowHeight(row, {
        getRowHeight: () => undefined as unknown as number,
        rowHeight: 60,
      })
    ).toBe(60)
  })

  it("uses rowHeight when no getRowHeight is provided", () => {
    expect(resolveRowHeight(row, { rowHeight: 40 })).toBe(40)
  })

  it("returns undefined when neither is provided (use default)", () => {
    expect(resolveRowHeight(row, {})).toBeUndefined()
  })

  it("passes the row through to getRowHeight", () => {
    const getRowHeight = vi.fn(() => 100)
    resolveRowHeight(row, { getRowHeight })
    expect(getRowHeight).toHaveBeenCalledWith(row)
  })
})
