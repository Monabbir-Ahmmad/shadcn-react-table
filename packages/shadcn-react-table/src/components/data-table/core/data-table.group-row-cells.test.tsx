import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Item = { id: string; group: string; label: string }

const items: Item[] = [
  { id: "1", group: "Fruit", label: "Apple" },
  { id: "2", group: "Fruit", label: "Banana" },
]

function Harness({ extra }: { extra: DataTableColumnDef<Item> }) {
  const table = useDataTable<Item>({
    columns: [{ accessorKey: "group", header: "Group" }, extra],
    data: items,
    getRowId: (row) => row.id,
    enableGrouping: true,
    initialState: { grouping: ["group"], expanded: true },
  })
  return <DataTable table={table} />
}

const groupRow = () => document.querySelector("tbody tr")!

describe("a group row's other cells", () => {
  it("stay empty for a display column with no aggregation", () => {
    render(
      <Harness
        extra={{
          id: "badge",
          header: "Badge",
          cell: ({ row }) => `badge:${row.original.label}`,
        }}
      />
    )
    // The group row is synthetic; drawing the cell would repeat its first leaf.
    expect(groupRow().textContent).not.toContain("badge:Apple")
    expect(document.body.textContent).toContain("badge:Apple")
    expect(document.body.textContent).toContain("badge:Banana")
  })

  it("use the column's renderAggregatedCell when it has one", () => {
    render(
      <Harness
        extra={{
          id: "badge",
          header: "Badge",
          cell: ({ row }) => `badge:${row.original.label}`,
          meta: {
            renderAggregatedCell: ({ row }) => `${row.subRows.length} items`,
          },
        }}
      />
    )
    expect(groupRow().textContent).toContain("2 items")
  })
})

describe("a group row's grouped cell", () => {
  function Grouped() {
    const table = useDataTable<Item>({
      columns: [
        {
          accessorKey: "group",
          header: "Group",
          // A custom cell that places the value it is handed.
          cell: ({ renderedCellValue }) => <b>{renderedCellValue}</b>,
        },
        { accessorKey: "label", header: "Label" },
      ],
      data: items,
      getRowId: (row) => row.id,
      enableGrouping: true,
      initialState: { grouping: ["group"], expanded: true },
    })
    return <DataTable table={table} />
  }

  it("hands a custom cell the group's value as renderedCellValue", () => {
    render(<Grouped />)
    expect(groupRow().querySelector("b")?.textContent).toBe("Fruit")
  })
})
