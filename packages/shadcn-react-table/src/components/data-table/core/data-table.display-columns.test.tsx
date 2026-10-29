import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string }

const people: Person[] = [
  { id: "1", name: "Mason" },
  { id: "2", name: "Lily" },
]

const columns = [{ accessorKey: "name", header: "Name" }]

type Options = Partial<UseDataTableOptions<Person>>

function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns,
    data: people,
    getRowId: (row) => row.id,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

function mount(options: Options = {}) {
  let instance: DataTableInstance<Person> | undefined
  const view = render(<Harness {...options} onTable={(t) => (instance = t)} />)
  return {
    table: () => instance!,
    rerender: (next: Options) =>
      view.rerender(<Harness {...next} onTable={(t) => (instance = t)} />),
  }
}

describe("displayColumnDefOptions", () => {
  it("overrides one injected column by id", () => {
    const { table } = mount({
      enableRowNumbers: true,
      displayColumnDefOptions: {
        "cn-row-number": {
          header: "No.",
          size: 64,
          cell: ({ row }) => `#${row.index + 1}`,
        },
      },
    })
    expect(screen.getByText("No.")).toBeTruthy()
    expect(screen.getByText("#2")).toBeTruthy()
    expect(table().getColumn("cn-row-number")!.getSize()).toBe(64)
  })

  it("applies defaultDisplayColumn to every injected column, under the per-id options", () => {
    const { table } = mount({
      enableRowNumbers: true,
      enableRowSelection: true,
      defaultDisplayColumn: { size: 70, meta: { align: "center" } },
      displayColumnDefOptions: { "cn-select": { size: 50 } },
    })
    expect(table().getColumn("cn-row-number")!.getSize()).toBe(70)
    expect(table().getColumn("cn-select")!.getSize()).toBe(50)
    // Meta merges with the column's own, keeping what it doesn't override.
    const meta = table().getColumn("cn-row-number")!.columnDef.meta
    expect(meta?.align).toBe("center")
    expect(meta?.enableColumnActions).toBe(false)
  })

  it("keeps the columns stable when the options are passed inline", () => {
    const options = (label: string): Options => ({
      enableRowNumbers: true,
      displayColumnDefOptions: {
        "cn-row-number": { size: 64, cell: () => label },
      },
    })
    const { table, rerender } = mount(options("a"))
    const before = table().options.columns
    rerender(options("b"))
    expect(table().options.columns).toBe(before)
    // The latest function still renders.
    expect(screen.getAllByText("b")).toHaveLength(2)
  })
})
