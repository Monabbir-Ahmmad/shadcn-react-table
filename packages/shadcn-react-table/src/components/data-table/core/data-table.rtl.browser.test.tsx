import { cleanup, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it } from "vitest"
import { userEvent } from "vitest/browser"

import { dragMouse, nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

afterEach(cleanup)

type Row = { id: string } & Record<string, string>

const makeColumns = (count: number): DataTableColumnDef<Row>[] =>
  Array.from({ length: count }, (_, i) => ({
    accessorKey: `c${i}`,
    header: `H${i}`,
    size: 120,
  }))

const makeRows = (rowCount: number, colCount: number): Row[] =>
  Array.from({ length: rowCount }, (_, r) => {
    const row: Row = { id: String(r + 1) }
    for (let c = 0; c < colCount; c++) row[`c${c}`] = `r${r + 1}c${c}`
    return row
  })

/** A table inside a right-to-left container, as under `<html dir="rtl">`. */
function RtlTable({
  colCount,
  ...options
}: Partial<UseDataTableOptions<Row>> & { colCount: number }) {
  const [columns] = React.useState(() => makeColumns(colCount))
  const [data] = React.useState(() => makeRows(5, colCount))
  const table = useDataTable<Row>({
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    ...options,
  })
  return (
    <div dir="rtl" style={{ width: 600 }}>
      <DataTable table={table} surfaceClassName="max-h-[400px]" />
    </div>
  )
}

const surface = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-surface"]')!

const rect = (text: string, tag: string) =>
  screen.getByText(text).closest(tag)!.getBoundingClientRect()

async function settle() {
  await nextFrame()
  await nextFrame()
}

describe("right-to-left tables", () => {
  it("lays columns out from the right and aligns text to the start", async () => {
    render(<RtlTable colCount={3} />)
    await settle()
    expect(rect("H0", "th").left).toBeGreaterThan(rect("H1", "th").left)
    const cell = screen.getByText("r1c0").closest("td")!
    expect(getComputedStyle(cell).textAlign).toMatch(/^(start|right)$/)
  })

  it("keeps a start-pinned column at the right edge while scrolling", async () => {
    render(
      <RtlTable
        colCount={12}
        enableColumnPinning
        initialState={{ columnPinning: { left: ["c0"] } }}
      />
    )
    await settle()
    const s = surface()
    expect(s.scrollWidth).toBeGreaterThan(s.clientWidth)
    s.scrollLeft = -s.scrollWidth
    await settle()
    const box = s.getBoundingClientRect()
    expect(Math.abs(rect("H0", "th").right - box.right)).toBeLessThanOrEqual(2)
  })

  it("widens a column when its edge is dragged outwards (to the left)", async () => {
    render(<RtlTable colCount={3} enableColumnResizing />)
    await settle()
    const size = () =>
      Number(screen.getByRole("grid").style.getPropertyValue("--col-c0-size"))
    expect(size()).toBe(120)
    const handle = screen.getAllByRole("separator", {
      name: /resize column/i,
    })[0]!
    // The handle sits on the column's left (end) edge.
    expect(
      Math.abs(handle.getBoundingClientRect().left - rect("H0", "th").left)
    ).toBeLessThanOrEqual(4)
    await dragMouse(handle, { dx: -60 })
    await settle()
    expect(size()).toBeGreaterThan(170)
  })

  it("moves keyboard focus left to the next column with ArrowLeft", async () => {
    render(<RtlTable colCount={3} />)
    await settle()
    const cell = screen.getByText("r1c0").closest("td")!
    cell.focus()
    await userEvent.keyboard("[ArrowLeft]")
    expect(document.activeElement?.textContent).toBe("r1c1")
    await userEvent.keyboard("[ArrowRight]")
    expect(document.activeElement?.textContent).toBe("r1c0")
  })

  it("renders the far columns under column virtualization", async () => {
    render(<RtlTable colCount={40} enableColumnVirtualization />)
    await settle()
    expect(screen.queryByText("H39")).toBeNull()
    const s = surface()
    s.scrollLeft = -(s.scrollWidth - s.clientWidth)
    await expect
      .poll(async () => {
        await nextFrame()
        return screen.queryByText("H39")
      })
      .not.toBeNull()
    const box = s.getBoundingClientRect()
    expect(Math.abs(rect("H39", "th").left - box.left)).toBeLessThanOrEqual(2)
  })
})
