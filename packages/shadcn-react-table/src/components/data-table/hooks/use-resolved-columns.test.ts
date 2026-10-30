import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { DataTableColumnDef } from "../core/table-types"
import { useDataTable } from "../core/use-data-table"
import {
  headerControlsOptionsFromTable,
  shouldShowColumnDragGrip,
} from "../helpers/header-controls"

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

  it("keeps the pin column out of header reordering", () => {
    const table = renderHook(() =>
      useDataTable<Person>({
        columns,
        data,
        getRowId: (r) => r.id,
        enableRowPinning: true,
        enableColumnOrdering: true,
      })
    ).result.current
    const opts = headerControlsOptionsFromTable(table)
    const grip = (id: string) =>
      shouldShowColumnDragGrip(table.getColumn(id)!, opts)

    expect(grip("name")).toBe(true)
    expect(grip("cn-row-pin")).toBe(false)
  })
})

describe("injected display columns", () => {
  it("keeps the expand and row-actions columns out of header reordering", () => {
    const table = renderHook(() =>
      useDataTable<Person>({
        columns,
        data,
        getRowId: (r) => r.id,
        enableColumnOrdering: true,
        renderRowActions: () => null,
        renderDetailPanel: () => null,
      })
    ).result.current
    const opts = headerControlsOptionsFromTable(table)
    const grip = (id: string) =>
      shouldShowColumnDragGrip(table.getColumn(id)!, opts)

    expect(grip("name")).toBe(true)
    expect(grip("cn-expand")).toBe(false)
    expect(grip("cn-row-actions")).toBe(false)
  })
})
