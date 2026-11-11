import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "../../core/data-table"
import type { DataTableInstance } from "../../core/types"
import { useDataTable } from "../../core/use-data-table"
import {
  DataTableFacetFilter,
  DataTableResetFilters,
} from "./data-table-facet-filter"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Row = { id: string; status: string }
const data: Row[] = [
  { id: "1", status: "open" },
  { id: "2", status: "closed" },
]
const STATUS = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
]

/** The facet button; the column header carries buttons named after the column too. */
const facet = () => {
  const el = document.querySelector<HTMLElement>(
    '[data-slot="data-table-facet-filter"]'
  )
  if (!el) throw new Error("no facet filter rendered")
  return el
}

function Table({
  initial = [],
  onTable,
  toolbar,
}: {
  initial?: ColumnFiltersState
  onTable?: (table: DataTableInstance<Row>) => void
  toolbar: (table: DataTableInstance<Row>) => React.ReactNode
}) {
  const table = useDataTable<Row>({
    data,
    columns: [
      {
        accessorKey: "status",
        header: "Status",
        meta: { filterSelectOptions: STATUS },
      },
    ],
    getRowId: (row) => row.id,
    manualFiltering: true,
    initialState: { columnFilters: initial },
    renderTopToolbarCustomActions: ({ table }) => toolbar(table),
  })
  onTable?.(table)
  return <DataTable table={table} />
}

describe("DataTableFacetFilter", () => {
  it("names the column's pick, from the column's own options", () => {
    render(
      <Table
        initial={[{ id: "status", value: "open" }]}
        toolbar={(table) => (
          <DataTableFacetFilter table={table} columnId="status" />
        )}
      />
    )
    const button = facet()
    expect(button.textContent).toContain("Open")
    expect(button.className).not.toContain("border-dashed")
  })

  it("shows no badge while nothing is picked", () => {
    render(
      <Table
        toolbar={(table) => (
          <DataTableFacetFilter table={table} columnId="status" />
        )}
      />
    )
    const button = facet()
    expect(button.textContent).not.toContain("Open")
  })

  it("keeps a filter that has no column under its own id", () => {
    render(
      <Table
        initial={[{ id: "raisedBy", value: "me" }]}
        toolbar={(table) => (
          <DataTableFacetFilter
            table={table}
            columnId="raisedBy"
            title="Raised by"
            options={[{ value: "me", label: "Me" }]}
          />
        )}
      />
    )
    expect(facet().textContent).toContain("Me")
  })

  it("names every pick of a multi-choice filter", () => {
    render(
      <Table
        initial={[{ id: "status", value: ["open", "closed"] }]}
        toolbar={(table) => (
          <DataTableFacetFilter table={table} columnId="status" multiple />
        )}
      />
    )
    expect(facet().textContent).toContain("Open, Closed")
  })

  it("reads a controlled value instead of the table's state", () => {
    render(
      <Table
        initial={[{ id: "status", value: "open" }]}
        toolbar={(table) => (
          <DataTableFacetFilter
            table={table}
            columnId="status"
            value="closed"
            onValueChange={() => {}}
          />
        )}
      />
    )
    expect(facet().textContent).toContain("Closed")
  })
})

describe("DataTableResetFilters", () => {
  it("shows while a filter is set and clears every one", () => {
    let instance!: DataTableInstance<Row>
    render(
      <Table
        initial={[
          { id: "status", value: "open" },
          { id: "raisedBy", value: "me" },
        ]}
        onTable={(table) => (instance = table)}
        toolbar={(table) => <DataTableResetFilters table={table} />}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Reset" }))
    expect(instance.getState().columnFilters).toEqual([])
    expect(screen.queryByRole("button", { name: "Reset" })).toBeNull()
  })

  it("renders nothing with no filter set", () => {
    render(
      <Table toolbar={(table) => <DataTableResetFilters table={table} />} />
    )
    expect(screen.queryByRole("button", { name: "Reset" })).toBeNull()
  })

  it("clears filters kept outside the table", () => {
    const onReset = vi.fn()
    render(
      <Table
        toolbar={(table) => (
          <DataTableResetFilters table={table} active onReset={onReset} />
        )}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Reset" }))
    expect(onReset).toHaveBeenCalledOnce()
  })
})
