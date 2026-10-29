import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import { useDataTable } from "./use-data-table"

afterEach(cleanup)

type Row = { id: string } & Record<string, string>

const COLUMN_COUNT = 12
const ROW_COUNT = 200

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name", size: 120 },
  ...Array.from({ length: COLUMN_COUNT - 1 }, (_, i) => ({
    accessorKey: `c${i + 1}`,
    header: `Col ${i + 1}`,
    size: 120,
  })),
]

const data: Row[] = Array.from({ length: ROW_COUNT }, (_, r) => {
  const row: Row = { id: String(r), name: `name-${r}` }
  for (let c = 1; c < COLUMN_COUNT; c++) row[`c${c}`] = `r${r}c${c}`
  return row
})

function Table() {
  const table = useDataTable<Row>({
    slotProps: { surface: { className: "max-h-[300px]" } },
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableColumnPinning: true,
    initialState: { columnPinning: { left: ["name"] } },
  })
  return (
    <div style={{ width: 600 }}>
      <DataTable table={table} />
    </div>
  )
}

const surfaceOf = (el: Element) =>
  el.closest<HTMLElement>('[data-slot="data-table-surface"]')!

describe("sticky header and pinned column", () => {
  it("stay in place while the surface scrolls both ways", async () => {
    render(<Table />)
    const header = screen.getByText("Name").closest("th")!
    const pinned = screen.getByText("name-0").closest("td")!
    const unpinned = screen.getByText("r0c5").closest("td")!
    const surface = surfaceOf(header)

    // The fixture must actually overflow, or the test proves nothing.
    expect(surface.scrollHeight).toBeGreaterThan(surface.clientHeight)
    expect(surface.scrollWidth).toBeGreaterThan(surface.clientWidth)

    const headerTop = header.getBoundingClientRect().top
    const pinnedLeft = pinned.getBoundingClientRect().left
    const unpinnedLeft = unpinned.getBoundingClientRect().left

    surface.scrollTop = 400
    surface.scrollLeft = 300
    await nextFrame()
    await nextFrame()

    expect(header.getBoundingClientRect().top).toBeCloseTo(headerTop, 0)
    expect(pinned.getBoundingClientRect().left).toBeCloseTo(pinnedLeft, 0)
    expect(unpinned.getBoundingClientRect().left).toBeLessThan(
      unpinnedLeft - 200
    )
  })
})
