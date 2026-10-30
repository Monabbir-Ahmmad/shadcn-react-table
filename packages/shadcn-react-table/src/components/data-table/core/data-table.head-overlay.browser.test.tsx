import { act, cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

afterEach(cleanup)

type Row = { id: string } & Record<string, string>

const COLUMN_COUNT = 12
const ROW_COUNT = 100

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

function Table({
  onTable,
  ...options
}: Partial<UseDataTableOptions<Row>> & {
  onTable?: (table: DataTableInstance<Row>) => void
}) {
  const table = useDataTable<Row>({
    slotProps: { surface: { className: "max-h-[300px]" } },
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableRowSelection: true,
    positionToolbarAlertBanner: "head-overlay",
    enableAnimations: false,
    ...options,
  })
  onTable?.(table)
  return (
    <div style={{ width: 600 }}>
      <DataTable table={table} />
    </div>
  )
}

const overlay = () =>
  document.querySelector<HTMLElement>(
    '[data-slot="data-table-alert-banner"][data-position="head-overlay"]'
  )
const surface = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-surface"]')!
const leafHeaderRow = () => {
  const rows = surface().querySelectorAll<HTMLElement>(
    "thead > tr:not([data-filter-row])"
  )
  return rows[rows.length - 1]!
}
const frames = async () => {
  await nextFrame()
  await nextFrame()
}

/** The overlay lies exactly over the leaf header row, across the surface's
 *  visible width. */
function expectOverHeaderRow() {
  const box = overlay()!.getBoundingClientRect()
  const row = leafHeaderRow().getBoundingClientRect()
  const s = surface()
  const inner = s.getBoundingClientRect()
  expect(box.top).toBeCloseTo(row.top, 0)
  expect(box.height).toBeCloseTo(row.height, 0)
  expect(box.left).toBeCloseTo(inner.left + s.clientLeft, 0)
  expect(box.width).toBeCloseTo(s.clientWidth, 0)
}

describe('positionToolbarAlertBanner: "head-overlay"', () => {
  it("covers the header row's box", async () => {
    let table!: DataTableInstance<Row>
    render(<Table onTable={(t) => (table = t)} />)
    act(() => table.setRowSelection({ "0": true }))
    await frames()
    expectOverHeaderRow()
    // Above the header: it takes the clicks there.
    const row = leafHeaderRow().getBoundingClientRect()
    const hit = document.elementFromPoint(
      row.left + 200,
      row.top + row.height / 2
    )
    expect(overlay()!.contains(hit)).toBe(true)
  })

  it("does not move the table when rows are selected", async () => {
    let table!: DataTableInstance<Row>
    render(<Table onTable={(t) => (table = t)} />)
    const cell = screen.getByText("name-3").closest("td")!
    const surfaceTop = surface().getBoundingClientRect().top
    const before = cell.getBoundingClientRect().top
    act(() => table.setRowSelection({ "0": true, "1": true }))
    await frames()
    expect(overlay()).not.toBeNull()
    expect(surface().getBoundingClientRect().top).toBeCloseTo(surfaceTop, 0)
    expect(cell.getBoundingClientRect().top).toBeCloseTo(before, 0)
  })

  it("stays over the sticky header while the surface scrolls both ways", async () => {
    let table!: DataTableInstance<Row>
    render(<Table onTable={(t) => (table = t)} />)
    act(() => table.setRowSelection({ "0": true }))
    await frames()
    const s = surface()
    expect(s.scrollHeight).toBeGreaterThan(s.clientHeight)
    expect(s.scrollWidth).toBeGreaterThan(s.clientWidth)
    const top = overlay()!.getBoundingClientRect().top

    s.scrollTop = 500
    await frames()
    expectOverHeaderRow()
    expect(overlay()!.getBoundingClientRect().top).toBeCloseTo(top, 0)

    s.scrollLeft = 400
    await frames()
    expectOverHeaderRow()
  })

  it("scrolls away with a header that is not sticky", async () => {
    let table!: DataTableInstance<Row>
    render(
      <Table
        onTable={(t) => (table = t)}
        enableStickyHeader={false}
        slotProps={{ surface: { className: "max-h-[300px]" } }}
      />
    )
    act(() => table.setRowSelection({ "0": true }))
    await frames()
    expectOverHeaderRow()
    surface().scrollTop = 100
    await frames()
    expectOverHeaderRow()
  })

  it("covers only the leaf row of grouped headers, not the filter row", async () => {
    let table!: DataTableInstance<Row>
    render(
      <Table
        onTable={(t) => (table = t)}
        enableColumnFilters
        initialState={{ showColumnFilters: true }}
        columns={[
          {
            id: "group",
            header: "Group",
            columns: columns.slice(0, 4),
          },
          ...columns.slice(4),
        ]}
      />
    )
    act(() => table.setRowSelection({ "0": true }))
    await frames()
    const rows = surface().querySelectorAll("thead > tr")
    // Group row, leaf row, filter row.
    expect(rows).toHaveLength(3)
    expect(leafHeaderRow()).toBe(rows[1])
    expectOverHeaderRow()
    const box = overlay()!.getBoundingClientRect()
    expect(box.top).toBeGreaterThan(rows[0]!.getBoundingClientRect().top + 1)
    expect(box.bottom).toBeLessThanOrEqual(
      rows[2]!.getBoundingClientRect().top + 0.5
    )
  })

  it("slides in, fades out and leaves the header clickable", async () => {
    let table!: DataTableInstance<Row>
    render(<Table onTable={(t) => (table = t)} enableAnimations />)
    act(() => table.setRowSelection({ "0": true }))
    await frames()
    expect(overlay()).not.toBeNull()
    await waitFor(() => expect(overlay()!.getAnimations()).toHaveLength(0), {
      timeout: 2000,
    })
    expectOverHeaderRow()

    act(() => table.resetRowSelection())
    // Fading out: still there, but it takes no clicks.
    const leaving = overlay()
    if (leaving) expect(leaving.style.pointerEvents).toBe("none")
    await waitFor(() => expect(overlay()).toBeNull(), { timeout: 2000 })
    expect(
      document.querySelector('[data-slot="data-table-alert-banner-anchor"]')
    ).toBeNull()
    const th = screen.getByText("Col 1").closest("th")!
    const rect = th.getBoundingClientRect()
    const hit = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    )
    expect(th.contains(hit)).toBe(true)
  })

  it("steps aside for a focused header control and is reachable by Tab", async () => {
    let table!: DataTableInstance<Row>
    render(<Table onTable={(t) => (table = t)} />)
    act(() => table.setRowSelection({ "0": true }))
    await frames()
    const el = overlay()!
    const clear = screen.getByRole("button", { name: "Clear selection" })
    expect(el.contains(clear)).toBe(true)
    // Before the header in the Tab order.
    const headerButton = leafHeaderRow().querySelector("button")!
    expect(
      clear.compareDocumentPosition(headerButton) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    act(() => headerButton.focus())
    await frames()
    expect(el.hasAttribute("data-head-focused")).toBe(true)
    expect(getComputedStyle(el).pointerEvents).toBe("none")
    act(() => clear.focus())
    await frames()
    expect(el.hasAttribute("data-head-focused")).toBe(false)
  })
})
