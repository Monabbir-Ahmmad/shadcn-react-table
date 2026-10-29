import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"

import { dragPointer, nextFrame } from "../../../../../../test/browser/pointer"
import { DataTable } from "../../../core/data-table"
import type { DataTableColumnDef } from "../../../core/table-types"
import type { UseDataTableOptions } from "../../../core/types"
import { useDataTable } from "../../../core/use-data-table"

afterEach(cleanup)

type Row = { id: string; a: string; b: string; c: string }

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "a", header: "Alpha", size: 160 },
  { accessorKey: "b", header: "Bravo", size: 160 },
  { accessorKey: "c", header: "Charlie", size: 160 },
]

const data: Row[] = Array.from({ length: 5 }, (_, i) => ({
  id: `row-${i + 1}`,
  a: `a${i + 1}`,
  b: `b${i + 1}`,
  c: `c${i + 1}`,
}))

function Table(options: Partial<UseDataTableOptions<Row>>) {
  const table = useDataTable<Row>({
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    ...options,
  })
  return <DataTable table={table} />
}

/** Header labels of the data columns, in rendered order. */
const headerOrder = () =>
  ["Alpha", "Bravo", "Charlie"]
    .map((label) => ({
      label,
      left: screen.getByText(label).getBoundingClientRect().left,
    }))
    .sort((x, y) => x.left - y.left)
    .map((h) => h.label)

describe("column reordering", () => {
  it("moves a column with a pointer drag", async () => {
    render(<Table enableColumnOrdering />)
    expect(headerOrder()).toEqual(["Alpha", "Bravo", "Charlie"])

    const grip = screen.getAllByRole("button", { name: /reorder column/i })[0]!
    const width = screen.getByText("Alpha").closest("th")!.offsetWidth
    await dragPointer(grip, { dx: width * 1.5 })
    await nextFrame()

    expect(headerOrder()).toEqual(["Bravo", "Alpha", "Charlie"])
  })

  it("moves a column with the keyboard", async () => {
    render(<Table enableColumnOrdering />)
    const grip = screen.getAllByRole("button", { name: /reorder column/i })[0]!
    grip.focus()
    await userEvent.keyboard("[Space]")
    await userEvent.keyboard("[ArrowRight]")
    await userEvent.keyboard("[Space]")
    await nextFrame()

    expect(headerOrder()).toEqual(["Bravo", "Alpha", "Charlie"])
  })
})

describe("row reordering", () => {
  it("reports the moved row after a pointer drag", async () => {
    const onRowOrderChange = vi.fn()
    render(<Table enableRowOrdering onRowOrderChange={onRowOrderChange} />)
    const handle = screen.getAllByRole("button", { name: /reorder row/i })[0]!
    const height = handle.closest("tr")!.offsetHeight
    await dragPointer(handle, { dx: 0, dy: height * 2.5 })

    expect(onRowOrderChange).toHaveBeenCalledTimes(1)
    expect(onRowOrderChange.mock.calls[0]![0]).toBe("row-1")
    expect(onRowOrderChange.mock.calls[0]![1]).toBe("row-3")
  })

  it("reports the moved row after a keyboard move", async () => {
    const onRowOrderChange = vi.fn()
    render(<Table enableRowOrdering onRowOrderChange={onRowOrderChange} />)
    const handle = screen.getAllByRole("button", { name: /reorder row/i })[0]!
    handle.focus()
    await userEvent.keyboard("[Space]")
    await userEvent.keyboard("[ArrowDown]")
    await userEvent.keyboard("[Space]")
    await nextFrame()

    expect(onRowOrderChange).toHaveBeenCalledTimes(1)
    expect(onRowOrderChange.mock.calls[0]![0]).toBe("row-1")
    expect(onRowOrderChange.mock.calls[0]![1]).toBe("row-2")
  })
})
