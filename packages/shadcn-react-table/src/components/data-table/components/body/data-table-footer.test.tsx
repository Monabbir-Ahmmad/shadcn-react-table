import { cleanup, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { DataTable } from "../../core/data-table"
import type { DataTableColumnDef } from "../../core/table-types"
import type { DataTableInstance, UseDataTableOptions } from "../../core/types"
import { useDataTable } from "../../core/use-data-table"

// jsdom lacks these; Radix Select / Base UI call them when opening.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
})

// Vitest globals are off in this package, so Testing Library does not
// auto-cleanup; without this the DOM leaks between tests.
afterEach(cleanup)

type Person = { id: string; name: string; status: string }

const people: Person[] = [
  { id: "1", name: "Mason", status: "a" },
  { id: "2", name: "Lily", status: "b" },
  { id: "3", name: "Jack", status: "a" },
]

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name", footer: "Total" },
  {
    accessorKey: "status",
    header: "Status",
    footer: "3",
    meta: { align: "right" },
  },
]

type Options = Partial<UseDataTableOptions<Person>>

/** Mounts a table and hands the instance back through `onTable`. */
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
  let instance!: DataTableInstance<Person>
  const view = render(<Harness {...options} onTable={(t) => (instance = t)} />)
  return { view, table: () => instance }
}

describe("footer cells", () => {
  it("paint an opaque background so pinned/sticky cells cover body text", () => {
    mount({ enableStickyFooter: true, enableColumnPinning: true })
    const cell = screen.getByText("Total").closest("td")!
    expect(cell.className).toContain("bg-card")
  })

  it("follow the column's meta.align", () => {
    mount()
    const cell = screen.getByText("3").closest("td")!
    expect(cell.className).toContain("text-end")
  })
})
