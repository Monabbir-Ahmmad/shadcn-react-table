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

type Person = { id: string; name: string; city: string }

const people: Person[] = [
  { id: "1", name: "Mason", city: "Oslo" },
  { id: "2", name: "Lily", city: "Rome" },
]

type Options = Partial<UseDataTableOptions<Person>>

function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "city", header: "City" },
    ],
    data: people,
    getRowId: (row) => row.id,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

function mount(options: Options = {}) {
  let instance: DataTableInstance<Person> | undefined
  render(<Harness {...options} onTable={(t) => (instance = t)} />)
  return { table: () => instance! }
}

const button = (name: string | RegExp) => screen.getByRole("button", { name })

describe("toolbar controls", () => {
  it("cycles the density", () => {
    const { table } = mount()
    fireEvent.click(button(/^Toggle density/))
    expect(table().getState().density).toBe("compact")
    fireEvent.click(button(/^Toggle density/))
    expect(table().getState().density).toBe("spacious")
  })

  it("toggles full screen, as a modal dialog", () => {
    const { table } = mount()
    fireEvent.click(button("Enter full screen"))
    expect(table().getState().isFullscreen).toBe(true)
    expect(
      document.querySelector('[data-slot="data-table"]')!.getAttribute("role")
    ).toBe("dialog")
    fireEvent.click(button("Exit full screen"))
    expect(table().getState().isFullscreen).toBe(false)
  })

  it("shows and hides the filter row", () => {
    mount()
    expect(screen.queryByLabelText("Filter by Name")).toBeNull()
    fireEvent.click(button("Show filters"))
    expect(screen.getByLabelText("Filter by Name")).toBeTruthy()
    fireEvent.click(button("Hide filters"))
    expect(screen.queryByLabelText("Filter by Name")).toBeNull()
  })

  it("hides a column from the column visibility menu", () => {
    const { table } = mount()
    const trigger = button("Column visibility")
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /City/ }))
    expect(table().getColumn("city")!.getIsVisible()).toBe(false)
  })

  it("leaves out the controls that are turned off", () => {
    // On by default.
    mount()
    expect(button("Search")).toBeTruthy()
    cleanup()
    mount({
      enableDensityToggle: false,
      enableFullscreenToggle: false,
      enableGlobalFilter: false,
    })
    expect(screen.queryByRole("button", { name: /^Toggle density/ })).toBeNull()
    expect(
      screen.queryByRole("button", { name: "Enter full screen" })
    ).toBeNull()
    expect(screen.queryByRole("button", { name: "Search" })).toBeNull()
    expect(button("Show filters")).toBeTruthy()
  })
})

describe("empty state", () => {
  it("says no records when there is no data", () => {
    mount({ data: [] })
    expect(screen.getByText("No records to display")).toBeTruthy()
  })

  it("says no results when the search or filters hide every row", () => {
    const { table } = mount()
    act(() => table().setGlobalFilter("zzz"))
    expect(screen.getByText("No results found")).toBeTruthy()
    act(() => table().setGlobalFilter(undefined))
    act(() => table().setColumnFilters([{ id: "city", value: "nowhere" }]))
    expect(screen.getByText("No results found")).toBeTruthy()
  })

  it("says no results for an empty server response to a filter", () => {
    mount({
      data: [],
      manualFiltering: true,
      initialState: { globalFilter: "zzz" },
    })
    expect(screen.getByText("No results found")).toBeTruthy()
  })
})
