import { cleanup, render } from "@testing-library/react"
import axe from "axe-core"
import { afterEach, describe, expect, it } from "vitest"

import { nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

afterEach(cleanup)

type Row = {
  id: string
  name: string
  role: string
  age: number
  joined: Date
  children?: Row[]
}

const rows: Row[] = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  name: `Person ${i + 1}`,
  role: ["Admin", "Editor", "Viewer"][i % 3]!,
  age: 20 + i * 3,
  joined: new Date(2024, i, 1 + i),
}))

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name", footer: "Total" },
  {
    accessorKey: "role",
    header: "Role",
    meta: { filterVariant: "select", editVariant: "select" },
  },
  { accessorKey: "age", header: "Age", meta: { filterVariant: "range" } },
  { accessorKey: "joined", header: "Joined", meta: { filterVariant: "date" } },
]

function Table(options: Partial<UseDataTableOptions<Row>>) {
  const table = useDataTable<Row>({
    columns,
    data: rows,
    getRowId: (row) => row.id,
    ...options,
  })
  return (
    <main>
      <DataTable table={table} />
    </main>
  )
}

/** axe's violations in the rendered page, as "rule: target" lines. */
async function violations() {
  await nextFrame()
  const result = await axe.run(document.body, {
    // Colors come from the consumer's theme, not from the table.
    rules: { "color-contrast": { enabled: false } },
  })
  return result.violations.flatMap((v) =>
    v.nodes.map(
      (node) => `${v.id}: ${node.target.join(" ")} ${node.html.slice(0, 160)}`
    )
  )
}

describe("accessibility (axe)", () => {
  it("has no violations in a full-featured table", async () => {
    render(
      <Table
        enableRowSelection
        enableColumnOrdering
        enableColumnPinning
        enableColumnResizing
        enableGrouping
        enableRowNumbers
        enableEditing
        editDisplayMode="row"
        initialState={{ showColumnFilters: true }}
      />
    )
    expect(await violations()).toEqual([])
  })

  it("has no violations with cell editing, single selection and pagination", async () => {
    render(
      <Table
        enableRowSelection
        enableMultiRowSelection={false}
        enableEditing
        editDisplayMode="cell"
        paginationDisplayMode="pages"
        initialState={{ pagination: { pageIndex: 0, pageSize: 5 } }}
      />
    )
    expect(await violations()).toEqual([])
  })

  it("has no violations without keyboard navigation (a plain table)", async () => {
    render(
      <Table
        enableKeyboardNavigation={false}
        enableTableFooter={false}
        renderDetailPanel={({ row }) => <p>Details for {row.original.name}</p>}
        initialState={{ expanded: { "1": true } }}
      />
    )
    expect(await violations()).toEqual([])
  })
})
