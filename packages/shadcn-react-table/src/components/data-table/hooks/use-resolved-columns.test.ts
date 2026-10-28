import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { DataTableColumnDef } from "../core/table-types"
import { useDataTable } from "../core/use-data-table"

type Person = { id: string; name: string }
const data: Person[] = [{ id: "1", name: "Ann" }]
const columns: DataTableColumnDef<Person>[] = [{ accessorKey: "name" }]

const leafIds = (options: object) =>
  renderHook(() =>
    useDataTable<Person>({ columns, data, getRowId: (r) => r.id, ...options })
  )
    .result.current.getAllLeafColumns()
    .map((c) => c.id)

describe("row pinning column", () => {
  it("injects a pin column when pinning is on and row numbers are off", () => {
    expect(leafIds({ enableRowPinning: true })).toEqual(["cn-row-pin", "name"])
  })

  it("keeps the pin control inside the row-number column when both are on", () => {
    expect(leafIds({ enableRowPinning: true, enableRowNumbers: true })).toEqual(
      ["cn-row-number", "name"]
    )
  })

  it("injects nothing when pinning is off", () => {
    expect(leafIds({})).toEqual(["name"])
  })
})
