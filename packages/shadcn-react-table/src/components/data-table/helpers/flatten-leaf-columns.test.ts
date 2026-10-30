import { describe, expect, it } from "vitest"

import type { DataTableColumnDef } from "../core/table-types"
import { flattenLeafColumns } from "./flatten-leaf-columns"

type Row = { a: number; b: number; c: number }

describe("flattenLeafColumns", () => {
  it("returns leaf defs in document order, descending into groups", () => {
    const columns: DataTableColumnDef<Row>[] = [
      { accessorKey: "a" },
      {
        header: "Group",
        columns: [
          { accessorKey: "b" },
          { header: "Inner", columns: [{ accessorKey: "c" }] },
        ],
      },
    ]
    expect(
      flattenLeafColumns(columns).map(
        (def) => (def as { accessorKey?: string }).accessorKey
      )
    ).toEqual(["a", "b", "c"])
  })

  it("returns the same array contents when there are no groups", () => {
    const columns: DataTableColumnDef<Row>[] = [{ accessorKey: "a" }]
    expect(flattenLeafColumns(columns)).toEqual(columns)
  })
})
