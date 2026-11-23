import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "../../core/data-table"
import type { DataTableInstance } from "../../core/types"
import { useDataTable } from "../../core/use-data-table"
import { pageRange } from "./data-table-pagination"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

type Row = { id: string; n: number }
const data: Row[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i),
  n: i,
}))

/** A screen as narrow (or wide) as a phone, for `matchMedia`. */
function screenWidth(phone: boolean) {
  const listeners = new Set<() => void>()
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: phone && query.includes("max-width"),
      media: query,
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    }))
  )
}

function Table({ onTable }: { onTable: (t: DataTableInstance<Row>) => void }) {
  const table = useDataTable<Row>({
    data,
    columns: [{ accessorKey: "n", header: "N" }],
    getRowId: (row) => row.id,
  })
  onTable(table)
  return <DataTable table={table} />
}

const sizePicker = () => screen.getByRole("combobox", { name: "Rows per page" })

describe("rows per page", () => {
  it("is the native picker on a phone", () => {
    screenWidth(true)
    let table!: DataTableInstance<Row>
    render(<Table onTable={(t) => (table = t)} />)
    const picker = sizePicker()
    expect(picker.tagName).toBe("SELECT")
    expect((picker as HTMLSelectElement).value).toBe("10")
    act(() => {
      fireEvent.change(picker, { target: { value: "25" } })
    })
    expect(table.getState().pagination.pageSize).toBe(25)
  })

  it("is the styled select on wider screens", () => {
    screenWidth(false)
    render(<Table onTable={() => {}} />)
    expect(sizePicker().tagName).toBe("BUTTON")
  })
})

type GroupedRow = { id: string; g: string; n: number }
const grouped: GroupedRow[] = ["a", "b", "c"].flatMap((g) =>
  Array.from({ length: 10 }, (_, i) => ({ id: `${g}${i}`, g, n: i }))
)

function GroupedTable({
  grouping,
  onTable,
}: {
  grouping: string[]
  onTable: (t: DataTableInstance<GroupedRow>) => void
}) {
  const table = useDataTable<GroupedRow>({
    data: grouped,
    columns: [
      { accessorKey: "g", header: "G" },
      { accessorKey: "n", header: "N" },
    ],
    getRowId: (row) => row.id,
    enableGrouping: true,
    initialState: { grouping, expanded: true },
  })
  onTable(table)
  return <DataTable table={table} />
}

describe("page range", () => {
  it("counts every row when nothing is grouped", () => {
    screenWidth(false)
    let table!: DataTableInstance<GroupedRow>
    render(<GroupedTable grouping={[]} onTable={(t) => (table = t)} />)
    expect(pageRange(table)).toEqual({ start: 1, end: 10, totalRows: 30 })
  })

  it("counts records only when grouped: a group's heading row is none", () => {
    screenWidth(false)
    let table!: DataTableInstance<GroupedRow>
    render(<GroupedTable grouping={["g"]} onTable={(t) => (table = t)} />)
    // Page 1: heading a, then a0–a8.
    expect(pageRange(table)).toEqual({ start: 1, end: 9, totalRows: 30 })
    act(() => table.setPageIndex(1))
    // Page 2: a9, heading b, then b0–b7.
    expect(pageRange(table)).toEqual({ start: 10, end: 18, totalRows: 30 })
  })
})
