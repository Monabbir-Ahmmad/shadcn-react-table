import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { DataTableColumnDef } from "./table-types"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

type Person = { id: string; name: string }
const data: Person[] = [{ id: "1", name: "Ann" }]
const columns: DataTableColumnDef<Person>[] = [{ accessorKey: "name" }]

const setup = (options: Partial<UseDataTableOptions<Person>> = {}) =>
  renderHook(
    (props: Partial<UseDataTableOptions<Person>>) =>
      useDataTable<Person>({
        columns,
        data,
        getRowId: (r) => r.id,
        ...props,
      }),
    { initialProps: options }
  )

describe("UI state as table state", () => {
  it("lives in the store with initial values", () => {
    const { result } = setup({
      initialState: { density: "compact", showColumnFilters: true },
    })
    const state = result.current.getState()
    expect(state.density).toBe("compact")
    expect(state.showColumnFilters).toBe(true)
    expect(state.editingCell).toBeNull()
    expect(result.current.tableInstance.density).toBe("compact")
  })

  it("keeps the default* options as starting values", () => {
    const { result } = setup({ defaultDensity: "spacious" })
    expect(result.current.getState().density).toBe("spacious")
  })

  it("updates uncontrolled slices and reports them", () => {
    const onDensityChange = vi.fn()
    const onEditingCellChange = vi.fn()
    const { result } = setup({ onDensityChange, onEditingCellChange })
    act(() => result.current.tableInstance.setDensity("compact"))
    expect(result.current.getState().density).toBe("compact")
    expect(onDensityChange).toHaveBeenCalledWith("compact")

    const cell = { rowId: "1", columnId: "name" }
    act(() => result.current.tableInstance.setEditingCell(cell))
    expect(result.current.getState().editingCell).toEqual(cell)
    expect(onEditingCellChange).toHaveBeenCalledWith(cell)
  })

  it("follows controlled slices and only reports changes", () => {
    const onEditingCellChange = vi.fn()
    const { result, rerender } = setup({
      state: { editingCell: null },
      onEditingCellChange,
    })
    const cell = { rowId: "1", columnId: "name" }
    act(() => result.current.tableInstance.setEditingCell(cell))
    expect(onEditingCellChange).toHaveBeenCalledWith(cell)
    // The owner has not applied it yet.
    expect(result.current.getState().editingCell).toBeNull()

    rerender({ state: { editingCell: cell }, onEditingCellChange })
    expect(result.current.getState().editingCell).toEqual(cell)
    expect(result.current.tableInstance.editingCell).toEqual(cell)
  })

  it("treats the dedicated props as controlled state", () => {
    const { result, rerender } = setup({ density: "compact" })
    act(() => result.current.tableInstance.setDensity("spacious"))
    expect(result.current.getState().density).toBe("compact")
    rerender({ density: "spacious" })
    expect(result.current.getState().density).toBe("spacious")
  })

  it("resets with the rest of the table", () => {
    const { result } = setup()
    act(() => result.current.tableInstance.setIsFullscreen(true))
    expect(result.current.getState().isFullscreen).toBe(true)
    act(() => result.current.reset())
    expect(result.current.getState().isFullscreen).toBe(false)
  })
})
