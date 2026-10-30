import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string; city: string }

const people: Person[] = [
  { id: "1", name: "Mason", city: "Oslo" },
  { id: "2", name: "Lily", city: "Rome" },
]

type Options = Partial<UseDataTableOptions<Person>>

function Harness(options: Options) {
  const table = useDataTable<Person>({
    columns: [
      { accessorKey: "name", header: "Name", size: 240 },
      { accessorKey: "city", header: "City", size: 120 },
    ],
    data: people,
    getRowId: (row) => row.id,
    ...options,
  })
  return <DataTable table={table} />
}

const mount = (options: Options = {}) => render(<Harness {...options} />)

const bodyRows = () => Array.from(document.querySelectorAll("tbody tr"))
const bars = (row: Element) =>
  Array.from(row.querySelectorAll<HTMLElement>('[data-slot="skeleton"]'))

describe("skeletons", () => {
  it("fill each column of placeholder rows while loading with no data", () => {
    mount({
      data: [],
      isLoading: true,
      enableRowSelection: true,
      initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
    })
    const rows = bodyRows()
    expect(rows).toHaveLength(5)
    // One cell per column (selection + name + city), sized like the column.
    const cells = rows[0]!.querySelectorAll("td")
    expect(cells).toHaveLength(3)
    expect(cells[1]!.style.width).not.toBe("")
    // The selection column gets a small square; data columns a bar.
    expect(bars(rows[0]!)[0]!.className).toContain("size-4")
    expect(bars(rows[0]!)[1]!.style.width).toMatch(/%$/)
  })

  it("vary bar widths but render the same widths every time", () => {
    const first = mount({ data: [], isLoading: true })
    const widths = () =>
      bodyRows().flatMap((row) => bars(row).map((bar) => bar.style.width))
    const before = widths()
    expect(new Set(before).size).toBeGreaterThan(1)
    first.unmount()
    mount({ data: [], isLoading: true })
    expect(widths()).toEqual(before)
  })

  it("keep pinned columns pinned", () => {
    mount({
      data: [],
      isLoading: true,
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ["city"] } },
    })
    // Same cell order and pinning as the real rows (city is the second cell).
    const cells = bodyRows()[0]!.querySelectorAll("td")
    expect(cells[1]!.getAttribute("data-pinned")).toBe("left")
    expect(cells[0]!.getAttribute("data-pinned")).toBeNull()
  })

  it("leave existing rows visible while refetching by default", () => {
    mount({ isLoading: true })
    expect(screen.getByText("Mason")).toBeTruthy()
    expect(bars(bodyRows()[0]!)).toHaveLength(0)
  })

  it("cover existing rows when showSkeletons is set", () => {
    mount({ showSkeletons: true })
    expect(screen.queryByText("Mason")).toBeNull()
    expect(bars(bodyRows()[0]!)).toHaveLength(2)
  })

  it("take slotProps.skeleton", () => {
    mount({
      data: [],
      isLoading: true,
      slotProps: {
        skeleton: ({ column }) => ({ "data-col": column.id }),
      },
    })
    expect(bodyRows()[0]!.querySelector('[data-col="city"]')).not.toBeNull()
  })
})
