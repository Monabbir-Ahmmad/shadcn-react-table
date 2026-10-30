import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { DataTableInstance } from "./types"
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

describe("density", () => {
  it("sets the cells' vertical padding from the table root", async () => {
    let table!: DataTableInstance<Row>
    function Dense({
      onTable,
    }: {
      onTable: (t: DataTableInstance<Row>) => void
    }) {
      const instance = useDataTable<Row>({
        columns: columns.slice(0, 2),
        data: data.slice(0, 3),
        getRowId: (row) => row.id,
        enablePagination: false,
      })
      onTable(instance)
      return <DataTable table={instance} />
    }
    render(<Dense onTable={(t) => (table = t)} />)
    const cell = screen.getByText("name-0").closest("td")!
    const paddingTop = () => getComputedStyle(cell).paddingTop
    // comfortable → compact → spacious: 2.5, 1 and 4 spacing units.
    expect(paddingTop()).toBe("10px")
    act(() => table.setDensity("compact"))
    await nextFrame()
    expect(paddingTop()).toBe("4px")
    act(() => table.setDensity("spacious"))
    await nextFrame()
    expect(paddingTop()).toBe("16px")
  })
})

describe("loading skeletons", () => {
  it("line up with the header cells", async () => {
    function Loading() {
      const table = useDataTable<Row>({
        columns: columns.slice(0, 4),
        data: [],
        getRowId: (row) => row.id,
        isLoading: true,
        enableColumnResizing: true,
      })
      return <DataTable table={table} />
    }
    render(<Loading />)
    await nextFrame()
    const heads = Array.from(
      document.querySelectorAll("thead tr:first-child th")
    )
    const cells = Array.from(
      document.querySelectorAll("tbody tr:first-child td")
    )
    expect(cells).toHaveLength(heads.length)
    cells.forEach((cell, i) => {
      const head = heads[i]!.getBoundingClientRect()
      const box = cell.getBoundingClientRect()
      expect(Math.abs(box.left - head.left)).toBeLessThan(1)
      expect(Math.abs(box.width - head.width)).toBeLessThan(1)
    })
  })
})

describe("pinned rows", () => {
  it("stay in view under the sticky header while the body scrolls", async () => {
    function Pinned() {
      const table = useDataTable<Row>({
        slotProps: { surface: { className: "max-h-[300px]" } },
        columns: columns.slice(0, 3),
        data,
        getRowId: (row) => row.id,
        enablePagination: false,
        enableRowPinning: true,
        initialState: { rowPinning: { top: ["150"], bottom: [] } },
      })
      return <DataTable table={table} />
    }
    render(<Pinned />)
    await nextFrame()
    const pinned = screen.getByText("name-150").closest("tr")!
    const surface = surfaceOf(pinned)
    surface.scrollTop = 2000
    await nextFrame()
    const head = surface.querySelector("thead")!.getBoundingClientRect()
    const row = pinned.getBoundingClientRect()
    // Right under the header, inside the visible surface.
    expect(Math.abs(row.top - head.bottom)).toBeLessThan(2)
    expect(row.bottom).toBeLessThanOrEqual(
      surface.getBoundingClientRect().bottom
    )
  })
})

/** The table's `border` colour, as the row borders draw it. */
const borderColor = () =>
  getComputedStyle(document.querySelector("thead tr")!).borderBottomColor

/**
 * Checks the divider a pinned edge cell draws in its pseudo-element: a 1px
 * solid `border`-coloured line at the cell's edge that faces the scrolling
 * columns (a left group's right edge, a right group's left edge).
 */
function expectDivider(cell: Element, side: "left" | "right") {
  const s = getComputedStyle(cell, side === "left" ? "::after" : "::before")
  const Edge = side === "left" ? "Left" : "Right"
  expect(s.content).not.toBe("none")
  expect(s.position).toBe("absolute")
  expect(s[`border${Edge}Width`]).toBe("1px")
  expect(s[`border${Edge}Style`]).toBe("solid")
  expect(s[`border${Edge}Color`]).toBe(borderColor())
  // Where the 1px line starts, relative to the cell's left edge.
  const left = parseFloat(s.left)
  const lineLeft = side === "left" ? left : left + parseFloat(s.width) - 1
  const width = cell.getBoundingClientRect().width
  expect(lineLeft).toBeCloseTo(side === "left" ? width - 1 : 0, 0)
}

describe("pinned column dividers", () => {
  const withFooters: DataTableColumnDef<Row>[] = columns.map((c) => ({
    ...c,
    footer: `F ${String(c.header)}`,
  }))

  it("line the inner edge of each pinned group in every section", async () => {
    function Pinned() {
      const table = useDataTable<Row>({
        slotProps: { surface: { className: "max-h-[300px]" } },
        columns: withFooters,
        data,
        getRowId: (row) => row.id,
        enablePagination: false,
        enableColumnPinning: true,
        enableColumnResizing: true,
        initialState: {
          showColumnFilters: true,
          columnPinning: { left: ["name"], right: ["c11"] },
        },
      })
      return (
        <div style={{ width: 600 }}>
          <DataTable table={table} />
        </div>
      )
    }
    render(<Pinned />)
    await nextFrame()
    const surface = surfaceOf(screen.getByText("Name"))
    surface.scrollLeft = 300
    await nextFrame()
    await nextFrame()

    const last = COLUMN_COUNT - 1
    const sections = [
      surface.querySelector("thead tr:first-child")!,
      surface.querySelector("thead tr:nth-child(2)")!, // the filter row
      surface.querySelector("tbody tr:first-child")!,
      surface.querySelector("tfoot tr:first-child")!,
    ]
    const leftBefore = sections.map(
      (tr) => tr.children[0]!.getBoundingClientRect().left
    )
    for (const tr of sections) {
      expectDivider(tr.children[0]!, "left")
      expectDivider(tr.children[last]!, "right")
      // Only the edge cells draw one.
      expect(getComputedStyle(tr.children[1]!, "::after").content).toBe("none")
    }

    // Still at the pinned column's edge after scrolling further.
    surface.scrollLeft = 600
    await nextFrame()
    await nextFrame()
    sections.forEach((tr, i) => {
      const left = tr.children[0]!.getBoundingClientRect().left
      expect(left).toBeCloseTo(leftBefore[i]!, 0)
      expectDivider(tr.children[0]!, "left")
    })
  })

  it("lines the skeleton rows' pinned edge", async () => {
    function Loading() {
      const table = useDataTable<Row>({
        columns: columns.slice(0, 4),
        data: [],
        getRowId: (row) => row.id,
        isLoading: true,
        enableColumnPinning: true,
        initialState: { columnPinning: { left: ["name"] } },
      })
      return <DataTable table={table} />
    }
    render(<Loading />)
    await nextFrame()
    expectDivider(
      document.querySelector("tbody tr:first-child td:first-child")!,
      "left"
    )
  })

  it("lines a grouped header cell over the pinned edge column", async () => {
    function Grouped() {
      const table = useDataTable<Row>({
        columns: [
          { id: "who", header: "Who", columns: [columns[0]!] },
          ...columns.slice(1, 4),
        ],
        data: data.slice(0, 3),
        getRowId: (row) => row.id,
        enableColumnPinning: true,
        initialState: { columnPinning: { left: ["name"] } },
      })
      return <DataTable table={table} />
    }
    render(<Grouped />)
    await nextFrame()
    expectDivider(screen.getByText("Who").closest("th")!, "left")
    expectDivider(screen.getByText("Name").closest("th")!, "left")
  })
})

describe("pinned row dividers", () => {
  function PinnedRows({ mode }: { mode?: "static" }) {
    const table = useDataTable<Row>({
      slotProps: { surface: { className: "max-h-[300px]" } },
      columns: columns.slice(0, 3),
      data,
      getRowId: (row) => row.id,
      enablePagination: false,
      enableRowPinning: true,
      enableRowSelection: true,
      enableColumnPinning: true,
      rowPinningDisplayMode: mode,
      initialState: {
        rowPinning: { top: ["150"], bottom: ["160"] },
        rowSelection: { "150": true },
        columnPinning: { left: ["name"] },
      },
    })
    return <DataTable table={table} />
  }

  /** Checks a sticky pinned group's divider: a 1px solid `border`-coloured
   *  line along the group's edge that faces the scrolling body. */
  function expectRowDivider(group: Element, edge: "bottom" | "top") {
    const s = getComputedStyle(group, "::after")
    const Edge = edge === "bottom" ? "Top" : "Bottom"
    expect(s.content).not.toBe("none")
    expect(s.position).toBe("absolute")
    expect(s[`border${Edge}Width`]).toBe("1px")
    expect(s[`border${Edge}Style`]).toBe("solid")
    expect(s[`border${Edge}Color`]).toBe(borderColor())
    // Where the 1px line starts, relative to the group's top edge.
    const top = parseFloat(s.top)
    const lineTop = edge === "bottom" ? top : top + parseFloat(s.height) - 1
    const height = group.getBoundingClientRect().height
    expect(lineTop).toBeCloseTo(edge === "bottom" ? height - 1 : 0, 0)
    // It spans the full width.
    expect(parseFloat(s.width)).toBeCloseTo(
      group.getBoundingClientRect().width,
      0
    )
    // Above the rows gliding inside the group (their layers top out at 9).
    expect(Number(s.zIndex)).toBeGreaterThanOrEqual(10)
  }

  it("line the sticky groups' inner edges while the body scrolls", async () => {
    render(<PinnedRows />)
    await nextFrame()
    const top = document.querySelector('tbody[data-pinned-rows="top"]')!
    const bottom = document.querySelector('tbody[data-pinned-rows="bottom"]')!
    const surface = surfaceOf(top)
    expectRowDivider(top, "bottom")
    expectRowDivider(bottom, "top")
    const topEdge = top.getBoundingClientRect().bottom
    const bottomEdge = bottom.getBoundingClientRect().top

    surface.scrollTop = 2000
    await nextFrame()
    await nextFrame()
    expect(top.getBoundingClientRect().bottom).toBeCloseTo(topEdge, 0)
    expect(bottom.getBoundingClientRect().top).toBeCloseTo(bottomEdge, 0)
    expectRowDivider(top, "bottom")
    expectRowDivider(bottom, "top")

    // The selected pinned row keeps its accent bar, and its corner cell
    // (the pinned column's edge) keeps the column divider.
    const selected = screen.getByText("name-150").closest("tr")!
    expect(selected.dataset.state).toBe("selected")
    expect(getComputedStyle(selected.cells[0]!).boxShadow).toMatch(
      /2px 0px 0px 0px inset/
    )
    expectDivider(screen.getByText("name-150").closest("td")!, "left")
  })

  it("draw nothing in static mode", async () => {
    render(<PinnedRows mode="static" />)
    await nextFrame()
    expect(document.querySelector("tbody[data-pinned-rows]")).toBeNull()
    for (const tbody of document.querySelectorAll("tbody")) {
      expect(getComputedStyle(tbody, "::after").content).toBe("none")
    }
  })
})
