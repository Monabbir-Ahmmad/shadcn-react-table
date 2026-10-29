import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "../../../core/data-table"
import type { DataTableColumnDef } from "../../../core/table-types"
import type { FilterVariant } from "../../../core/types"
import { useDataTable } from "../../../core/use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; born: Date }

function Table({ variant, value }: { variant: FilterVariant; value: unknown }) {
  const columns: DataTableColumnDef<Person>[] = [
    { accessorKey: "born", header: "Born", meta: { variant } },
  ]
  const table = useDataTable<Person>({
    columns,
    data: [{ id: "1", born: new Date(2020, 2, 15) }],
    getRowId: (row) => row.id,
    showColumnFilters: true,
    initialState: { columnFilters: [{ id: "born", value }] },
  })
  return <DataTable table={table} />
}

const openPicker = () =>
  fireEvent.click(screen.getByRole("button", { name: /filter by born/i }))

describe("date filter picker", () => {
  it("opens on the selected date's month", () => {
    render(<Table variant="date" value={new Date(2020, 2, 15)} />)
    openPicker()
    expect(screen.getByRole("grid", { name: "March 2020" })).toBeTruthy()
  })

  it("opens a range on its start month", () => {
    render(
      <Table
        variant="date-range"
        value={[new Date(2019, 10, 2), new Date(2020, 0, 4)]}
      />
    )
    openPicker()
    expect(screen.getByRole("grid", { name: "November 2019" })).toBeTruthy()
  })
})
