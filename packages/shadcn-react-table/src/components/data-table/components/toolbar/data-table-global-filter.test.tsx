import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { DataTable } from "../../core/data-table"
import type { DataTableColumnDef } from "../../core/table-types"
import type { DataTableInstance, UseDataTableOptions } from "../../core/types"
import { useDataTable } from "../../core/use-data-table"

// jsdom lacks these; Radix Select / Base UI call them when opening.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
})

// Vitest globals are off in this package, so Testing Library does not
// auto-cleanup; without this the DOM leaks between tests.
afterEach(cleanup)

type Person = { id: string; name: string; status: string }

const people: Person[] = [
  { id: "1", name: "Mason", status: "a" },
  { id: "2", name: "Lily", status: "b" },
  { id: "3", name: "Jack", status: "a" },
]

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      editVariant: "select",
      options: [
        { label: "a", value: "a" },
        { label: "b", value: "b" },
      ],
    },
  },
]

type Options = Partial<UseDataTableOptions<Person>>

/** Mounts a table and hands the instance back through `onTable`. */
function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns,
    data: people,
    getRowId: (row) => row.id,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

function mount(options: Options = {}) {
  let instance!: DataTableInstance<Person>
  const view = render(<Harness {...options} onTable={(t) => (instance = t)} />)
  return { view, table: () => instance }
}

describe("global filter input", () => {
  it("expands and shows a value set from outside, then clears with it", () => {
    const { table } = mount()
    act(() => table().setGlobalFilter("abc"))
    const input = screen.getByRole("textbox") as HTMLInputElement
    expect(input.value).toBe("abc")

    act(() => table().resetGlobalFilter())
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("")
  })

  it("keeps typing when controlled state catches up late", () => {
    vi.useFakeTimers()
    try {
      // The consumer stores the search a moment later (router / async state).
      function Lagging() {
        const [globalFilter, setGlobalFilter] = React.useState("")
        const table = useDataTable<Person>({
          columns,
          data: people,
          getRowId: (row) => row.id,
          state: { globalFilter },
          onGlobalFilterChange: (updater) => {
            const next =
              typeof updater === "function" ? updater(globalFilter) : updater
            setTimeout(() => setGlobalFilter(next ?? ""), 50)
          },
        })
        return <DataTable table={table} />
      }
      render(<Lagging />)
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Search" }))
      })
      const input = () => screen.getByRole("textbox") as HTMLInputElement

      fireEvent.change(input(), { target: { value: "M" } })
      act(() => vi.advanceTimersByTime(10)) // "M" is committed
      fireEvent.change(input(), { target: { value: "Ma" } })
      act(() => vi.advanceTimersByTime(45)) // "M" lands before "Ma" does
      expect(input().value).toBe("Ma")

      act(() => vi.advanceTimersByTime(200)) // "Ma" is committed and lands
      expect(input().value).toBe("Ma")
    } finally {
      vi.useRealTimers()
    }
  })
})
