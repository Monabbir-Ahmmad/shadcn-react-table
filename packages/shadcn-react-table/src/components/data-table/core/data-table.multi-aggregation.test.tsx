import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Sale = { id: string; region: string; amount: number }

const sales: Sale[] = [
  { id: "1", region: "North", amount: 1000 },
  { id: "2", region: "North", amount: 3000 },
]

function Harness({
  amount,
  ...options
}: Partial<UseDataTableOptions<Sale>> & {
  amount: Partial<DataTableColumnDef<Sale>>
}) {
  const table = useDataTable<Sale>({
    columns: [
      { accessorKey: "region", header: "Region" },
      { accessorKey: "amount", header: "Amount", ...amount } as never,
    ],
    data: sales,
    getRowId: (row) => row.id,
    enableGrouping: true,
    initialState: { grouping: ["region"] },
    ...options,
  })
  return <DataTable table={table} />
}

const groupRow = () => document.querySelector("tbody tr")!

describe("several aggregations per column", () => {
  it("labels and formats each result", () => {
    render(<Harness amount={{ aggregationFn: ["sum", "mean"] }} />)
    expect(groupRow().textContent).toContain("Sum 4,000")
    expect(groupRow().textContent).toContain("Mean 2,000")
  })

  it("takes labels from localization", () => {
    render(
      <Harness
        amount={{ aggregationFn: ["sum", "max"] }}
        localization={{ aggregationFns: { sum: "Total", max: "Highest" } }}
      />
    )
    expect(groupRow().textContent).toContain("Total 4,000")
    expect(groupRow().textContent).toContain("Highest 3,000")
  })

  it("hands every result to a custom aggregated cell", () => {
    render(
      <Harness
        amount={{
          aggregationFn: ["min", "max"],
          aggregatedCell: ({ getValue }) => {
            const { min, max } = getValue() as { min: number; max: number }
            return `${min}–${max}`
          },
        }}
      />
    )
    expect(screen.getByText("1000–3000")).toBeTruthy()
  })
})
