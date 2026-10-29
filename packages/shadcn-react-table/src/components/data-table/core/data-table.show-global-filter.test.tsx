import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string }

const people: Person[] = [
  { id: "1", name: "Mason" },
  { id: "2", name: "Lily" },
]

type Options = Partial<UseDataTableOptions<Person>>

function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns: [{ accessorKey: "name", header: "Name" }],
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

const searchInput = () => screen.queryByRole("textbox", { name: "Search" })

describe("showGlobalFilter", () => {
  it("starts closed and opens from the search button", () => {
    const onShowGlobalFilterChange = vi.fn()
    const { table } = mount({ onShowGlobalFilterChange })
    expect(searchInput()).toBeNull()
    expect(table().getState().showGlobalFilter).toBe(false)
    fireEvent.click(screen.getByRole("button", { name: "Search" }))
    expect(searchInput()).not.toBeNull()
    expect(table().getState().showGlobalFilter).toBe(true)
    expect(onShowGlobalFilterChange).toHaveBeenLastCalledWith(true)
  })

  it("starts open from initialState and closes from the method", () => {
    const { table } = mount({ initialState: { showGlobalFilter: true } })
    expect(searchInput()).not.toBeNull()
    act(() => table().setShowGlobalFilter(false))
    expect(searchInput()).toBeNull()
  })

  it("follows controlled state", () => {
    function Controlled() {
      const [show, setShow] = React.useState(true)
      return (
        <>
          <button type="button" onClick={() => setShow(false)}>
            close
          </button>
          <Harness
            state={{ showGlobalFilter: show }}
            onShowGlobalFilterChange={setShow}
          />
        </>
      )
    }
    render(<Controlled />)
    expect(searchInput()).not.toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "close" }))
    expect(searchInput()).toBeNull()
  })

  it("opens when a search value is set from outside", () => {
    const { table } = mount()
    act(() => table().setGlobalFilter("li"))
    expect(searchInput()).not.toBeNull()
    expect(table().getState().showGlobalFilter).toBe(true)
  })

  it("renders a controlled UI state change (density) right away", () => {
    function Controlled() {
      const [compact, setCompact] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setCompact(true)}>
            compact
          </button>
          <Harness state={{ density: compact ? "compact" : "comfortable" }} />
        </>
      )
    }
    render(<Controlled />)
    fireEvent.click(screen.getByRole("button", { name: "compact" }))
    expect(
      document
        .querySelector('[data-slot="data-table"]')!
        .getAttribute("data-density")
    ).toBe("compact")
  })
})
