import { act, cleanup, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it } from "vitest"

import { dragMouse, nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

afterEach(cleanup)

type Row = { id: string; a: string; b: string; c: string; d: string }

const data: Row[] = [
  { id: "1", a: "a1", b: "b1", c: "c1", d: "d1" },
  { id: "2", a: "a2", b: "b2", c: "c2", d: "d2" },
]

// Sizes stay above the floor the header controls reserve (`minSize`).
const defaultColumns: DataTableColumnDef<Row>[] = [
  { accessorKey: "a", header: "Alpha", size: 150 },
  { accessorKey: "b", header: "Bravo", size: 150, meta: { grow: 2 } },
  { accessorKey: "c", header: "Charlie", size: 170, meta: { grow: false } },
  { accessorKey: "d", header: "Delta", size: 130, meta: { grow: 0 } },
]
const TOTAL = 150 + 150 + 170 + 130

let instance: DataTableInstance<Row>

function Table({
  width = 900,
  columns = defaultColumns,
  ...options
}: Partial<UseDataTableOptions<Row>> & {
  width?: number
  columns?: DataTableColumnDef<Row>[]
}) {
  const table = useDataTable<Row>({
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    ...options,
  })
  React.useEffect(() => {
    instance = table
  })
  return (
    <div style={{ width }}>
      <DataTable table={table} />
    </div>
  )
}

const settle = async () => {
  await nextFrame()
  await nextFrame()
  // Header cells ease their width (0.15s) on programmatic changes.
  await new Promise((resolve) => setTimeout(resolve, 250))
}

const th = (label: string) => screen.getByText(label).closest("th")!
const widthOf = (el: Element) => el.getBoundingClientRect().width
const tableEl = () => document.querySelector("table")!
const surfaceEl = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-surface"]')!

describe("layoutMode: grid", () => {
  it("keeps non-growing columns at their size and splits the rest by weight", async () => {
    render(<Table layoutMode="grid" />)
    await settle()

    const available = surfaceEl().clientWidth
    const spare = available - TOTAL
    expect(spare).toBeGreaterThan(100)

    expect(widthOf(th("Charlie"))).toBeCloseTo(170, 0)
    expect(widthOf(th("Delta"))).toBeCloseTo(130, 0)
    expect(Math.abs(widthOf(th("Alpha")) - (150 + spare / 3))).toBeLessThan(1.5)
    expect(
      Math.abs(widthOf(th("Bravo")) - (150 + (2 * spare) / 3))
    ).toBeLessThan(1.5)
    // The table fills the surface exactly: no gap, no horizontal scroll.
    expect(widthOf(tableEl())).toBeCloseTo(available, 0)
    expect(surfaceEl().scrollWidth).toBeLessThanOrEqual(available)
    // Body cells line up with their headers.
    expect(widthOf(screen.getByText("b1").closest("td")!)).toBeCloseTo(
      widthOf(th("Bravo")),
      0
    )
  })

  it("never grows the table's own columns", async () => {
    render(
      <Table
        layoutMode="grid"
        enableRowSelection
        enableRowNumbers
        renderRowActions={() => null}
      />
    )
    await settle()

    for (const id of ["cn-select", "cn-row-number", "cn-row-actions"]) {
      const size = instance.getColumn(id)!.getSize()
      const cell = document.querySelector<HTMLElement>(
        `thead th[data-column-id="${id}"]`
      )!
      expect(widthOf(cell)).toBeCloseTo(size, 0)
      expect(surfaceEl().style.getPropertyValue(`--col-${id}-grow`)).toBe("")
    }
    expect(widthOf(tableEl())).toBeCloseTo(surfaceEl().clientWidth, 0)
  })

  it("follows the container's width", async () => {
    const { rerender } = render(<Table layoutMode="grid" width={900} />)
    await settle()
    const before = widthOf(th("Alpha"))

    rerender(<Table layoutMode="grid" width={1200} />)
    await settle()

    expect(widthOf(th("Alpha"))).toBeCloseTo(before + 100, 0)
    expect(widthOf(th("Charlie"))).toBeCloseTo(170, 0)
    expect(widthOf(tableEl())).toBeCloseTo(surfaceEl().clientWidth, 0)
  })

  it("does not grow when the columns are wider than the surface", async () => {
    render(<Table layoutMode="grid" width={450} />)
    await settle()
    expect(widthOf(th("Alpha"))).toBeCloseTo(150, 0)
    expect(widthOf(th("Bravo"))).toBeCloseTo(150, 0)
    expect(widthOf(tableEl())).toBeCloseTo(TOTAL, 0)
    expect(surfaceEl().scrollWidth).toBeGreaterThan(surfaceEl().clientWidth)
  })

  it("resizes a growing column from its shown width; it then keeps its size", async () => {
    const { rerender } = render(
      <Table layoutMode="grid" enableColumnResizing width={900} />
    )
    await settle()
    const start = widthOf(th("Alpha"))
    expect(start).toBeGreaterThan(200)

    const handle = th("Alpha").querySelector('[role="separator"]')!
    await dragMouse(handle, { dx: 40 })
    await settle()

    const resized = widthOf(th("Alpha"))
    expect(Math.abs(resized - (start + 40))).toBeLessThan(4)
    expect(instance.getState().columnSizing.a).toBeCloseTo(resized, 0)
    // The other growing column absorbs the change; the table still fills.
    expect(widthOf(tableEl())).toBeCloseTo(surfaceEl().clientWidth, 0)

    rerender(<Table layoutMode="grid" enableColumnResizing width={1200} />)
    await settle()
    expect(widthOf(th("Alpha"))).toBeCloseTo(resized, 0)
    expect(widthOf(tableEl())).toBeCloseTo(surfaceEl().clientWidth, 0)
  })

  it("steps a growing column from its shown width with the keyboard", async () => {
    render(<Table layoutMode="grid" enableColumnResizing />)
    await settle()
    const start = widthOf(th("Alpha"))
    const handle = th("Alpha").querySelector<HTMLElement>('[role="separator"]')!
    handle.focus()
    await act(async () => {
      handle.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })
      )
    })
    await settle()
    expect(instance.getState().columnSizing.a).toBeCloseTo(start + 10, 0)
    expect(widthOf(th("Alpha"))).toBeCloseTo(start + 10, 0)
  })

  it("lines pinned columns' sticky offsets up with their grown widths", async () => {
    render(
      <Table
        layoutMode="grid"
        enableColumnPinning
        columns={[
          defaultColumns[0]!,
          defaultColumns[1]!,
          { ...defaultColumns[2]!, meta: { grow: 1 } },
          { ...defaultColumns[3]!, meta: { grow: 1 } },
        ]}
        initialState={{
          columnPinning: { left: ["a", "b"], right: ["c", "d"] },
        }}
      />
    )
    await settle()

    const left = (label: string) => parseFloat(getComputedStyle(th(label)).left)
    const right = (label: string) =>
      parseFloat(getComputedStyle(th(label)).right)
    expect(widthOf(th("Alpha"))).toBeGreaterThan(160)
    expect(widthOf(th("Delta"))).toBeGreaterThan(140)
    expect(left("Alpha")).toBe(0)
    expect(left("Bravo")).toBeCloseTo(widthOf(th("Alpha")), 0)
    expect(right("Delta")).toBe(0)
    expect(right("Charlie")).toBeCloseTo(widthOf(th("Delta")), 0)
    // Body cells use the same offsets.
    const cellLeft = parseFloat(
      getComputedStyle(screen.getByText("b1").closest("td")!).left
    )
    expect(cellLeft).toBeCloseTo(widthOf(th("Alpha")), 0)
  })

  it("grows group headers by their leaves' shares", async () => {
    const columns: DataTableColumnDef<Row>[] = [
      {
        id: "group",
        header: "Group",
        columns: [
          { accessorKey: "a", header: "Alpha", size: 150 },
          { accessorKey: "b", header: "Bravo", size: 150 },
        ],
      },
      { accessorKey: "c", header: "Charlie", size: 150, meta: { grow: false } },
    ]
    render(<Table layoutMode="grid" columns={columns} />)
    await settle()
    expect(widthOf(th("Alpha"))).toBeGreaterThan(200)
    expect(widthOf(th("Group"))).toBeCloseTo(
      widthOf(th("Alpha")) + widthOf(th("Bravo")),
      0
    )
    expect(widthOf(th("Charlie"))).toBeCloseTo(150, 0)
    expect(widthOf(tableEl())).toBeCloseTo(surfaceEl().clientWidth, 0)
  })

  it("works with column virtualization", async () => {
    render(<Table layoutMode="grid" enableColumnVirtualization />)
    await settle()
    const available = surfaceEl().clientWidth
    const spare = available - TOTAL
    expect(widthOf(th("Charlie"))).toBeCloseTo(170, 0)
    expect(Math.abs(widthOf(th("Alpha")) - (150 + spare / 3))).toBeLessThan(1.5)
    expect(widthOf(tableEl())).toBeCloseTo(available, 0)
  })

  it("grows the same way right to left", async () => {
    render(
      <div dir="rtl">
        <Table layoutMode="grid" />
      </div>
    )
    await settle()
    const available = surfaceEl().clientWidth
    const spare = available - TOTAL
    expect(widthOf(th("Charlie"))).toBeCloseTo(170, 0)
    expect(Math.abs(widthOf(th("Alpha")) - (150 + spare / 3))).toBeLessThan(1.5)
    expect(widthOf(tableEl())).toBeCloseTo(available, 0)
    // The first column sits at the right edge.
    expect(th("Alpha").getBoundingClientRect().right).toBeCloseTo(
      tableEl().getBoundingClientRect().right,
      0
    )
  })
})

describe("layoutMode: grid-no-grow", () => {
  it("keeps every column at its size and the table as wide as them", async () => {
    render(<Table layoutMode="grid-no-grow" />)
    await settle()
    expect(widthOf(th("Alpha"))).toBeCloseTo(150, 0)
    expect(widthOf(th("Bravo"))).toBeCloseTo(150, 0)
    expect(widthOf(th("Charlie"))).toBeCloseTo(170, 0)
    expect(widthOf(th("Delta"))).toBeCloseTo(130, 0)
    expect(widthOf(tableEl())).toBeCloseTo(TOTAL, 0)
    expect(surfaceEl().style.getPropertyValue("--table-grow")).toBe("")
  })
})

describe("layoutMode: semantic", () => {
  it("is the default and leaves the browser's layout alone", async () => {
    render(<Table />)
    await settle()
    expect(instance.dataTable.layoutMode).toBe("semantic")
    expect(tableEl().classList.contains("table-fixed")).toBe(false)
    expect(tableEl().style.width).toBe("")
    expect(surfaceEl().style.getPropertyValue("--table-grow")).toBe("")
    // The table fills its container.
    expect(widthOf(tableEl())).toBeCloseTo(surfaceEl().clientWidth, 0)
  })

  it("switching away from grid clears the grow variables", async () => {
    const { rerender } = render(<Table layoutMode="grid" />)
    await settle()
    expect(surfaceEl().style.getPropertyValue("--table-grow")).not.toBe("")
    await act(async () => {
      rerender(<Table layoutMode="semantic" />)
    })
    await settle()
    expect(surfaceEl().style.getPropertyValue("--table-grow")).toBe("")
    expect(surfaceEl().style.getPropertyValue("--col-a-grow")).toBe("")
  })
})
