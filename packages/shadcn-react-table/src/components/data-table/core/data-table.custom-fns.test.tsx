import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// jsdom lacks these; Radix Select / Base UI call them when opening.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
})

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Product = { id: string; name: string; stock: number; priority: string }

const products: Product[] = [
  { id: "1", name: "Apple", stock: 0, priority: "low" },
  { id: "2", name: "Banana", stock: 12, priority: "high" },
  { id: "3", name: "Cherry", stock: 3, priority: "medium" },
]

const filterFns = {
  // Ignores the typed value: keeps only rows with stock.
  inStock: (row: { getValue: (id: string) => unknown }, columnId: string) =>
    Number(row.getValue(columnId)) > 0,
  // Matches the first letter only.
  firstLetter: (
    row: { getValue: (id: string) => unknown },
    columnId: string,
    value: unknown
  ) =>
    String(row.getValue(columnId))
      .toLowerCase()
      .startsWith(String(value).toLowerCase().slice(0, 1)),
}

const PRIORITY = ["low", "medium", "high"]

type Options = Partial<UseDataTableOptions<Product>>

function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Product>) => void }) {
  const table = useDataTable<Product>({
    columns: [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "stock",
        header: "Stock",
        meta: { filterVariant: "range" },
      },
    ],
    data: products,
    getRowId: (row) => row.id,
    filterFns,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

function mount(options: Options = {}) {
  let instance: DataTableInstance<Product> | undefined
  render(<Harness {...options} onTable={(t) => (instance = t)} />)
  return { table: () => instance! }
}

const names = () =>
  Array.from(document.querySelectorAll("tbody tr")).map(
    (tr) => tr.querySelector("td")?.textContent ?? ""
  )

function openMenu(label: string, index = 0) {
  const trigger = screen.getAllByRole("button", { name: label })[index]!
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
  fireEvent.click(trigger)
}

const menuItems = () =>
  screen.getAllByRole("menuitemradio").map((item) => item.textContent)

describe("custom filter functions", () => {
  it("offers a listed custom function in the column's mode menu and filters with it", () => {
    const { table } = mount({
      columns: [
        {
          accessorKey: "name",
          header: "Name",
          enableColumnFilter: false,
        },
        {
          accessorKey: "stock",
          header: "Stock",
          meta: {
            filterVariant: "range",
            columnFilterModeOptions: ["betweenInclusive", "inStock"],
          },
        },
      ],
      localization: { filterModes: { inStock: "In stock" } } as never,
      initialState: { showColumnFilters: true },
    })
    openMenu("Change filter mode")
    expect(menuItems()).toEqual(["Between (inclusive)", "In stock"])
    fireEvent.click(screen.getByRole("menuitemradio", { name: "In stock" }))
    expect(table().getState().columnFilterModes.stock).toBe("inStock")
    // The custom function ignores the value; any value activates it.
    act(() => table().getColumn("stock")!.setFilterValue("any"))
    expect(names()).toEqual(["Banana", "Cherry"])
  })

  it("uses a custom function as a column's default mode", () => {
    mount({
      columns: [
        {
          accessorKey: "name",
          header: "Name",
          meta: { filterMode: "firstLetter" },
        },
      ],
      initialState: { columnFilters: [{ id: "name", value: "bx" }] },
    })
    expect(names()).toEqual(["Banana"])
  })

  it("restricts every column's menu with the table-wide options", () => {
    mount({
      columns: [{ accessorKey: "name", header: "Name" }],
      columnFilterModeOptions: ["contains", "equals", "firstLetter"],
      initialState: { showColumnFilters: true },
    })
    openMenu("Change filter mode")
    // A custom function without a label shows its name.
    expect(menuItems()).toEqual(["Contains", "Equals", "firstLetter"])
  })

  it("runs a custom function named on the column's filterFn", () => {
    mount({
      columns: [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "stock", header: "Stock", filterFn: "inStock" },
      ],
      initialState: { columnFilters: [{ id: "stock", value: true }] },
    })
    expect(names()).toEqual(["Banana", "Cherry"])
  })

  it("lets the global search use a custom function, limited by globalFilterModeOptions", () => {
    const { table } = mount({
      columns: [{ accessorKey: "name", header: "Name" }],
      globalFilterModeOptions: ["contains", "firstLetter"],
      initialState: { globalFilter: "ch" },
    })
    expect(names()).toEqual(["Cherry"])
    act(() => table().setGlobalFilterMode("firstLetter"))
    act(() => table().setGlobalFilter("cz"))
    expect(names()).toEqual(["Cherry"])
    act(() => table().setGlobalFilterMode("contains"))
    expect(table().getRowModel().rows).toHaveLength(0)

    openMenu("Search mode")
    expect(menuItems()).toEqual(["Contains", "firstLetter"])
  })
})

describe("custom sort and aggregation functions", () => {
  it("sorts by a custom function named on the column", () => {
    mount({
      columns: [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "priority", header: "Priority", sortFn: "byPriority" },
      ],
      sortFns: {
        byPriority: (a, b, columnId) =>
          PRIORITY.indexOf(a.getValue(columnId)) -
          PRIORITY.indexOf(b.getValue(columnId)),
      },
      initialState: { sorting: [{ id: "priority", desc: true }] },
    })
    expect(names()).toEqual(["Banana", "Cherry", "Apple"])
  })

  it("aggregates with a custom function named on the column", () => {
    const { table } = mount({
      columns: [
        { accessorKey: "priority", header: "Priority" },
        {
          accessorKey: "stock",
          header: "Stock",
          aggregationFn: "spread",
        },
      ],
      aggregationFns: {
        spread: {
          aggregate: ({ rows, getValue }) => {
            const values = rows.map((row) => Number(getValue(row)))
            return Math.max(...values) - Math.min(...values)
          },
        },
      },
      data: [
        ...products,
        { id: "4", name: "Date", stock: 10, priority: "low" },
      ],
      enableGrouping: true,
      initialState: { grouping: ["priority"] },
    })
    const low = table()
      .getRowModel()
      .rows.find((row) => row.getValue("priority") === "low")!
    expect(low.getValue("stock")).toBe(10)
  })
})
