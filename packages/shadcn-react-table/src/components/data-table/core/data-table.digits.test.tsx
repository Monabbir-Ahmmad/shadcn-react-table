import { cleanup, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { dataTableLocalizationFa } from "../locales/fa"
import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Row = { id: string; name: string }

const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  name: `n${i + 1}`,
}))

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
]

function Table() {
  const table = useDataTable<Row>({
    columns,
    data: rows,
    getRowId: (row) => row.id,
    enableRowNumbers: true,
    paginationDisplayMode: "pages",
    localization: dataTableLocalizationFa,
  })
  return <DataTable table={table} />
}

describe("native digits", () => {
  it("shows page buttons, page size and row numbers in the language's digits", () => {
    render(<Table />)
    // Persian digits: ۱ ۲ ۳ …
    const pages = screen.getByRole("button", {
      name: dataTableLocalizationFa.goToPage(2),
    })
    expect(pages.textContent).toBe("۲")
    const size = screen.getByRole("combobox", {
      name: dataTableLocalizationFa.rowsPerPage,
    })
    expect(size.textContent).toBe("۱۰")
    const firstRow = screen.getAllByRole("row")[1]!
    expect(within(firstRow).getByText("۱")).toBeTruthy()
  })
})
