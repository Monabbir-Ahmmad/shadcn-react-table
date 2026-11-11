import { cleanup, render } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import { useDataTable } from "./use-data-table"

// A card like stock shadcn new-york's: rounded and bordered, but it does not
// clip what is inside it.
vi.mock("@workspace/ui/components/card", async () => {
  const { cn } = await import("@workspace/ui/lib/utils")
  return {
    Card: ({ className, ...props }: React.ComponentProps<"div">) => (
      <div
        data-slot="card"
        className={cn(
          "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
          className
        )}
        {...props}
      />
    ),
  }
})

afterEach(cleanup)

type Row = { id: string; name: string }

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
]

function Table() {
  const table = useDataTable<Row>({
    columns,
    data: [{ id: "1", name: "Ava" }],
    getRowId: (row) => row.id,
  })
  return <DataTable table={table} />
}

describe("card", () => {
  it("clips its contents to its corners even when the app's card does not", () => {
    render(<Table />)
    const root = document.querySelector('[data-slot="data-table"]')!
    const classes = root.className.split(" ")
    expect(classes).toContain("overflow-hidden")
    // Its own spacing replaces the card's.
    expect(classes).toContain("gap-0")
    expect(classes).toContain("py-0")
    expect(classes).not.toContain("gap-6")
  })
})
