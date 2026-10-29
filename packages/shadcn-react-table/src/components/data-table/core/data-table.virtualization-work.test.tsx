import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { MemoRow } from "../components/body/memo-row"
import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { DataTableInstance } from "./types"
import { useDataTable } from "./use-data-table"

// Counts the body row elements the table creates, whatever is mounted: a
// virtualized body must not build an element for every row of the data.
const created = vi.hoisted(() => ({ rows: 0, MemoRow: null as unknown }))
const countRow = (type: unknown) => {
  if (type === created.MemoRow) created.rows++
}
vi.mock("react/jsx-dev-runtime", async (importOriginal) => {
  const runtime = await importOriginal<typeof import("react/jsx-dev-runtime")>()
  return {
    ...runtime,
    jsxDEV: (type: unknown, ...rest: unknown[]) => {
      countRow(type)
      return (runtime.jsxDEV as (...args: unknown[]) => unknown)(type, ...rest)
    },
  }
})
vi.mock("react/jsx-runtime", async (importOriginal) => {
  const runtime = await importOriginal<typeof import("react/jsx-runtime")>()
  const wrap =
    (fn: (...args: unknown[]) => unknown) =>
    (type: unknown, ...rest: unknown[]) => {
      countRow(type)
      return fn(type, ...rest)
    }
  return {
    ...runtime,
    jsx: wrap(runtime.jsx as never),
    jsxs: wrap(runtime.jsxs as never),
  }
})

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Row = { id: string; name: string }

const ROW_COUNT = 5000

const data: Row[] = Array.from({ length: ROW_COUNT }, (_, i) => ({
  id: String(i + 1),
  name: `row-${i + 1}`,
}))
const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
]

// jsdom has no layout: give the scroll surface a size, so the row
// virtualizer computes a real window.
const descriptors = {
  offsetHeight: Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetHeight"
  ),
  offsetWidth: Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth"
  ),
}
const isSurface = (el: HTMLElement) =>
  el.getAttribute("data-slot") === "data-table-surface"

beforeEach(() => {
  created.MemoRow = MemoRow
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get(this: HTMLElement) {
      return isSurface(this) ? 400 : 0
    },
  })
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return isSurface(this) ? 800 : 0
    },
  })
})
afterEach(() => {
  vi.restoreAllMocks()
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (descriptor)
      Object.defineProperty(HTMLElement.prototype, key, descriptor)
  }
})

function Table({ onTable }: { onTable: (t: DataTableInstance<Row>) => void }) {
  const table = useDataTable<Row>({
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableRowVirtualization: true,
    enableKeyboardNavigation: true,
    // Inline, as consumers usually write it.
    renderDetailPanel: ({ row }) => <span>detail {row.id}</span>,
    // jsdom measures every element at 0px; rows report a real height.
    rowVirtualizerOptions: { measureElement: () => 36 },
  })
  onTable(table)
  return <DataTable table={table} />
}

const surface = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-surface"]')!

/** Rendered data rows (virtualization spacer rows are aria-hidden). */
const dataRows = () =>
  Array.from(document.querySelectorAll("tbody tr")).filter(
    (tr) => tr.getAttribute("aria-hidden") === null
  )

describe("row virtualization work", () => {
  it("does work only for the rendered rows while scrolling", () => {
    let table!: DataTableInstance<Row>
    render(<Table onTable={(t) => (table = t)} />)
    expect(dataRows().length).toBeGreaterThan(0)
    expect(dataRows().length).toBeLessThan(60)

    // Per-row work outside rendering: the expanded check of every row.
    const rowPrototype = Object.getPrototypeOf(table.getRowModel().rows[0])
    const getIsExpanded = vi.spyOn(rowPrototype, "getIsExpanded")
    created.rows = 0

    for (const top of [40_000, 40_400]) {
      act(() => {
        surface().scrollTop = top
        fireEvent.scroll(surface())
      })
    }

    // The scroll moved the window.
    expect(screen.queryByText("row-1")).toBeNull()
    expect(dataRows().length).toBeLessThan(60)
    expect(
      Number(dataRows()[0]!.getAttribute("aria-rowindex"))
    ).toBeGreaterThan(500)
    // The probes still see the table's work (else the bounds below pass
    // vacuously)�
    expect(created.rows).toBeGreaterThan(0)
    expect(getIsExpanded).toHaveBeenCalled()
    // �which stays with the rows on screen, not the 5,000 rows of data.
    expect(created.rows).toBeLessThan(200)
    expect(getIsExpanded.mock.calls.length).toBeLessThan(200)
  })

  it("shows and hides a row's detail panel", () => {
    render(<Table onTable={() => {}} />)
    const toggle = () =>
      screen.getAllByRole("button", { name: "Toggle row expanded" })[0]!
    expect(screen.queryByText("detail 1")).toBeNull()

    fireEvent.click(toggle())
    const detail = screen.getByText("detail 1")
    // The panel sits right under its row.
    expect(detail.closest("tr")!.previousElementSibling!.textContent).toContain(
      "row-1"
    )
    expect(toggle().getAttribute("aria-expanded")).toBe("true")

    fireEvent.click(toggle())
    expect(screen.queryByText("detail 1")).toBeNull()
    expect(toggle().getAttribute("aria-expanded")).toBe("false")
    expect(screen.getByText("row-2")).toBeTruthy()
  })
})
