import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "../core/data-table"
import type { DataTableColumnDef } from "../core/table-types"
import { useDataTable } from "../core/use-data-table"

afterEach(cleanup)

type Row = { id: string } & Record<string, string>

const COLUMN_COUNT = 40

const columns: DataTableColumnDef<Row>[] = Array.from(
  { length: COLUMN_COUNT },
  (_, i) => ({
    accessorKey: `c${i}`,
    header: `H${i}`,
    footer: `F${i}`,
    size: 120,
  })
)

const data: Row[] = Array.from({ length: 30 }, (_, r) => {
  const row: Row = { id: String(r) }
  for (let c = 0; c < COLUMN_COUNT; c++) row[`c${c}`] = `r${r}c${c}`
  return row
})

function Table() {
  const table = useDataTable<Row>({
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableColumnVirtualization: true,
    enableColumnPinning: true,
    initialState: { columnPinning: { left: ["c0"], right: ["c39"] } },
  })
  return (
    <div style={{ width: 600 }}>
      <DataTable table={table} surfaceClassName="max-h-[400px]" />
    </div>
  )
}

const surface = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-surface"]')!

async function settle() {
  await nextFrame()
  await nextFrame()
}

/** Asserts both pinned columns are rendered in header, body and footer. */
function expectPinnedRendered() {
  expect(screen.queryByText("H0")).not.toBeNull()
  expect(screen.queryByText("H39")).not.toBeNull()
  expect(screen.queryByText("F0")).not.toBeNull()
  expect(screen.queryByText("F39")).not.toBeNull()
  expect(screen.queryByText("r0c0")).not.toBeNull()
  expect(screen.queryByText("r0c39")).not.toBeNull()
}

describe("column virtualization with pinned columns", () => {
  it("keeps pinned columns rendered and stuck to their edges", async () => {
    render(<Table />)
    await settle()
    expectPinnedRendered()

    const s = surface()
    s.scrollLeft = s.scrollWidth
    await settle()
    expectPinnedRendered()

    const box = s.getBoundingClientRect()
    const left = screen.getByText("H0").closest("th")!.getBoundingClientRect()
    const right = screen.getByText("H39").closest("th")!.getBoundingClientRect()
    expect(Math.abs(left.left - box.left)).toBeLessThanOrEqual(2)
    expect(Math.abs(right.right - box.right)).toBeLessThanOrEqual(2)

    // Middle columns follow the scroll; the far end is rendered.
    expect(screen.queryByText("H38")).not.toBeNull()
    expect(screen.queryByText("H5")).toBeNull()

    s.scrollLeft = 0
    await settle()
    expectPinnedRendered()
    expect(screen.queryByText("H1")).not.toBeNull()
  })

  it("keeps the table as wide as all its columns", async () => {
    render(<Table />)
    await settle()
    const s = surface()
    expect(s.scrollWidth).toBeGreaterThanOrEqual(COLUMN_COUNT * 120 - 2)
    s.scrollLeft = 2000
    await settle()
    expect(s.scrollWidth).toBeGreaterThanOrEqual(COLUMN_COUNT * 120 - 2)
  })
})
