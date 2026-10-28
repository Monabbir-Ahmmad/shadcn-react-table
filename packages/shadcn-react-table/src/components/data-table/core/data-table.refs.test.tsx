import { cleanup, render } from "@testing-library/react"
import * as React from "react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { DataTableInstance } from "./types"
import { useDataTable } from "./use-data-table"

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

describe("DataTable ref", () => {
  it("fills both the consumer ref and refs.tablePaperRef", () => {
    const consumerRef = React.createRef<HTMLDivElement>()
    let instance!: DataTableInstance<Person>
    function Consumer() {
      const table = useDataTable<Person>({
        columns,
        data: people,
        getRowId: (row) => row.id,
      })
      React.useEffect(() => {
        instance = table
      })
      return <DataTable table={table} ref={consumerRef} />
    }
    render(<Consumer />)
    expect(consumerRef.current).toBeInstanceOf(HTMLDivElement)
    expect(instance.tableInstance.refs.tablePaperRef.current).toBe(
      consumerRef.current
    )
  })

  it("runs a callback ref's cleanup on unmount instead of calling it with null", () => {
    const cleanup = vi.fn()
    const callbackRef = vi.fn((el: HTMLDivElement | null) => {
      if (el) return cleanup
    })
    function Consumer() {
      const table = useDataTable<Person>({
        columns,
        data: people,
        getRowId: (row) => row.id,
      })
      return <DataTable table={table} ref={callbackRef} />
    }
    const view = render(<Consumer />)
    expect(callbackRef).toHaveBeenCalledTimes(1)
    expect(callbackRef.mock.calls[0]![0]).toBeInstanceOf(HTMLDivElement)
    view.unmount()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(callbackRef).toHaveBeenCalledTimes(1)
  })

  it("calls a plain callback ref with null on unmount", () => {
    const seen: (HTMLDivElement | null)[] = []
    function Consumer() {
      const table = useDataTable<Person>({
        columns,
        data: people,
        getRowId: (row) => row.id,
      })
      return <DataTable table={table} ref={(el) => void seen.push(el)} />
    }
    const view = render(<Consumer />)
    expect(seen[0]).toBeInstanceOf(HTMLDivElement)
    view.unmount()
    expect(seen[seen.length - 1]).toBeNull()
  })
})
