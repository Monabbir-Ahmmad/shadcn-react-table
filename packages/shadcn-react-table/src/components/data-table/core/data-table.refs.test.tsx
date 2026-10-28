import { cleanup, render } from "@testing-library/react"
import * as React from "react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

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

  it("supports a callback ref", () => {
    const seen: (HTMLDivElement | null)[] = []
    function Consumer() {
      const table = useDataTable<Person>({
        columns,
        data: people,
        getRowId: (row) => row.id,
      })
      return <DataTable table={table} ref={(el) => void seen.push(el)} />
    }
    render(<Consumer />)
    expect(seen[0]).toBeInstanceOf(HTMLDivElement)
  })
})
