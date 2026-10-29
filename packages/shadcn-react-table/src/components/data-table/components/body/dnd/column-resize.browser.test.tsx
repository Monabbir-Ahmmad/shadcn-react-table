import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { dragMouse, nextFrame } from "../../../../../../test/browser/pointer"
import { DataTable } from "../../../core/data-table"
import type { DataTableColumnDef } from "../../../core/table-types"
import { useDataTable } from "../../../core/use-data-table"

afterEach(cleanup)

type Row = { id: string; a: string; b: string }

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "a", header: "Alpha", size: 200 },
  { accessorKey: "b", header: "Bravo", size: 200 },
]

const data: Row[] = [
  { id: "1", a: "x", b: "y" },
  { id: "2", a: "xx", b: "yy" },
]

function Table() {
  const table = useDataTable<Row>({
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableColumnResizing: true,
  })
  return <DataTable table={table} />
}

// The table fills its container, so a column's rendered width also absorbs
// spare space. Its size (what a resize changes) is the CSS variable the
// header and cells read their width from.
const sizeOf = (columnId: string) =>
  Number(
    screen.getByRole("grid").style.getPropertyValue(`--col-${columnId}-size`)
  )

const resizeHandle = () =>
  screen.getAllByRole("separator", { name: /resize column/i })[0]!

describe("column resizing", () => {
  it("grows a column's size by the dragged distance", async () => {
    render(<Table />)
    expect(sizeOf("a")).toBe(200)

    await dragMouse(resizeHandle(), { dx: 80 })
    await nextFrame()

    expect(sizeOf("a")).toBeGreaterThan(276)
    expect(sizeOf("a")).toBeLessThan(284)
  })

  it("autosizes a column on double-click", async () => {
    render(<Table />)
    await dragMouse(resizeHandle(), { dx: 120 })
    await nextFrame()
    const dragged = sizeOf("a")

    // A dispatched event: the handle is only visible on hover, and React
    // listens for the bubbling dblclick either way.
    resizeHandle().dispatchEvent(
      new MouseEvent("dblclick", { bubbles: true, cancelable: true })
    )
    await nextFrame()

    expect(sizeOf("a")).toBeLessThan(dragged - 20)
    const cell = screen.getByText("xx").closest("td")!
    expect(cell.scrollWidth).toBeLessThanOrEqual(cell.clientWidth + 1)
  })
})
