import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string }

const people: Person[] = ["Ava", "Ben", "Cal", "Dan"].map((name, i) => ({
  id: String(i + 1),
  name,
}))

type Options = Partial<UseDataTableOptions<Person>>

function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns: [{ accessorKey: "name", header: "Name" }],
    data: people,
    getRowId: (row) => row.id,
    enableRowPinning: true,
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

const pinnedGroup = (side: "top" | "bottom") =>
  document.querySelector<HTMLElement>(`tbody[data-pinned-rows="${side}"]`)

describe("rowPinningDisplayMode", () => {
  it("keeps pinned rows in a sticky group above the others by default", () => {
    mount({ initialState: { rowPinning: { top: ["3"], bottom: ["4"] } } })
    const top = pinnedGroup("top")!
    expect(top.textContent).toContain("Cal")
    expect(top.className).toContain("sticky")
    expect(pinnedGroup("bottom")!.textContent).toContain("Dan")
  })

  it("leaves pinned rows unstuck in static mode", () => {
    mount({
      rowPinningDisplayMode: "static",
      initialState: { rowPinning: { top: ["3"], bottom: [] } },
    })
    expect(pinnedGroup("top")).toBeNull()
    // Still listed first.
    expect(document.querySelector("tbody tr")!.textContent).toContain("Cal")
  })

  it("pins to the bottom from the pin button in bottom mode", () => {
    const { table } = mount({ rowPinningDisplayMode: "bottom" })
    fireEvent.click(screen.getAllByRole("button", { name: "Pin row" })[0]!)
    expect(table().getState().rowPinning.bottom).toEqual(["1"])
  })

  it("pins selected rows and drops the pin buttons in select modes", () => {
    const { table } = mount({
      rowPinningDisplayMode: "select-top",
      enableRowSelection: true,
    })
    expect(screen.queryAllByRole("button", { name: "Pin row" })).toHaveLength(0)
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[2]!)
    expect(table().getState().rowPinning.top).toEqual(["3"])
    act(() => table().getRow("3").toggleSelected(false))
    expect(table().getState().rowPinning.top).toEqual([])
  })
})
