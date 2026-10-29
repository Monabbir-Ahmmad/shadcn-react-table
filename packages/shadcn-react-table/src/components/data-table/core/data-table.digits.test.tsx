import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { dataTableLocalizationFa } from "../locales/fa"
import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import { useDataTable } from "./use-data-table"

// jsdom lacks these; Radix Select calls them when opening.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
})

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

  it("offers the page sizes given in pageSizeOptions", async () => {
    function Sized() {
      const table = useDataTable<Row>({
        columns,
        data: rows,
        getRowId: (row) => row.id,
        pageSizeOptions: [7, 14],
        initialState: { pagination: { pageIndex: 0, pageSize: 7 } },
      })
      return <DataTable table={table} />
    }
    render(<Sized />)
    const select = screen.getByRole("combobox", { name: /rows per page/i })
    select.focus()
    fireEvent.keyDown(select, { key: "Enter" })
    expect(await screen.findByRole("option", { name: "14" })).toBeTruthy()
    expect(screen.queryByRole("option", { name: "25" })).toBeNull()
  })
})
