import type { TableState } from "@tanstack/react-table"
import { describe, expect, it } from "vitest"

import type { DataTableFeatures } from "../core/features"
import { toDataTableState } from "./table-state"

type CoreState = TableState<DataTableFeatures>

function makeState(pinning: { start: string[]; end: string[] }): CoreState {
  return {
    columnPinning: pinning,
    columnResizing: { isResizingColumn: false },
    sorting: [],
  } as unknown as CoreState
}

describe("toDataTableState", () => {
  it("returns the same object for the same input", () => {
    const input = makeState({ start: ["a"], end: [] })
    const first = toDataTableState(input)
    const second = toDataTableState(input)
    expect(second).toBe(first)
    expect(second.columnPinning).toBe(first.columnPinning)
  })

  it("maps a different input to its own left/right state", () => {
    const a = makeState({ start: ["a"], end: [] })
    const b = makeState({ start: [], end: ["b"] })
    const outA = toDataTableState(a)
    const outB = toDataTableState(b)
    expect(outB).not.toBe(outA)
    expect(outA.columnPinning).toEqual({ left: ["a"], right: [] })
    expect(outB.columnPinning).toEqual({ left: [], right: ["b"] })
    expect(outB.columnSizingInfo).toBe(b.columnResizing)
    expect(outB.sorting).toBe(b.sorting)
  })
})
