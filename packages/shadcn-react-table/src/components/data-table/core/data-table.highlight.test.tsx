import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string }

const people: Person[] = [
  { id: "1", name: "Mason" },
  { id: "2", name: "Lily" },
]

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
]

function Table(options: Partial<UseDataTableOptions<Person>>) {
  const table = useDataTable<Person>({
    columns,
    data: people,
    getRowId: (row) => row.id,
    ...options,
  })
  return <DataTable table={table} />
}

const marks = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("tbody mark")).map((m) => m.textContent)

describe("filter match highlighting", () => {
  it("marks global search matches", () => {
    const { container } = render(
      <Table initialState={{ globalFilter: "ma" }} />
    )
    expect(marks(container)).toEqual(["Ma"])
  })

  it("marks column filter matches", () => {
    const { container } = render(
      <Table initialState={{ columnFilters: [{ id: "name", value: "il" }] }} />
    )
    expect(marks(container)).toEqual(["il"])
  })

  it("marks nothing when filtering is switched off", () => {
    const { container } = render(
      <Table
        enableFilters={false}
        initialState={{
          globalFilter: "ma",
          columnFilters: [{ id: "name", value: "il" }],
        }}
      />
    )
    expect(marks(container)).toEqual([])
  })
})

describe("renderedCellValue", () => {
  it("hands a custom cell its value with the matches marked", () => {
    const custom: DataTableColumnDef<Person>[] = [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ renderedCellValue }) => <b>{renderedCellValue}</b>,
      },
    ]
    const { container } = render(
      <Table columns={custom} initialState={{ globalFilter: "ma" }} />
    )
    expect(marks(container)).toEqual(["Ma"])
    expect(container.querySelector("tbody b mark")).not.toBeNull()
  })

  it("hands it the plain value when nothing matches", () => {
    const custom: DataTableColumnDef<Person>[] = [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ renderedCellValue }) => <b>{renderedCellValue}</b>,
      },
    ]
    const { container } = render(<Table columns={custom} />)
    expect(
      Array.from(container.querySelectorAll("tbody b")).map(
        (b) => b.textContent
      )
    ).toEqual(["Mason", "Lily"])
  })
})
