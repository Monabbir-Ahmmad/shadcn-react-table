import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "../core/data-table"
import type { DataTableColumnDef } from "../core/table-types"
import type { UseDataTableOptions } from "../core/types"
import { useDataTable } from "../core/use-data-table"

afterEach(cleanup)

type Row = { id: string; name: string; value: string }

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "value", header: "Value" },
]

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `row-${i + 1}`,
    value: `value-${i + 1}`,
  }))

function Table({
  rows,
  surfaceClassName,
  ...options
}: Partial<UseDataTableOptions<Row>> & {
  rows: Row[]
  surfaceClassName: string
}) {
  const table = useDataTable<Row>({
    columns,
    data: rows,
    getRowId: (row) => row.id,
    enablePagination: false,
    ...options,
  })
  return <DataTable table={table} surfaceClassName={surfaceClassName} />
}

const surface = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-surface"]')!

/** Rendered data rows (virtualization spacer rows are aria-hidden). */
const dataRows = () =>
  Array.from(document.querySelectorAll("tbody tr")).filter(
    (tr) => tr.getAttribute("aria-hidden") === null
  )

describe("row virtualization", () => {
  it("renders only a window of rows and follows the scroll", async () => {
    render(
      <Table
        rows={makeRows(1000)}
        enableRowVirtualization
        surfaceClassName="max-h-[400px]"
      />
    )
    await nextFrame()
    expect(dataRows().length).toBeGreaterThan(0)
    expect(dataRows().length).toBeLessThan(60)
    expect(screen.queryByText("row-1000")).toBeNull()

    surface().scrollTop = surface().scrollHeight
    await expect.poll(() => screen.queryByText("row-1000")).not.toBeNull()
    expect(dataRows().length).toBeLessThan(60)
  })

  it("renders rows at a fixed height", async () => {
    render(
      <Table
        rows={makeRows(200)}
        enableRowVirtualization
        rowHeight={48}
        surfaceClassName="max-h-[400px]"
      />
    )
    await nextFrame()
    const row = screen.getByText("row-1").closest("tr")!
    expect(row.getBoundingClientRect().height).toBeCloseTo(48, 0)
  })
})

describe("infinite scroll", () => {
  it("asks for more rows once when the bottom comes into view", async () => {
    const onLoadMore = vi.fn()
    render(
      <Table
        rows={makeRows(50)}
        enableInfiniteScroll
        hasNextPage
        onLoadMore={onLoadMore}
        surfaceClassName="max-h-[300px]"
      />
    )
    await nextFrame()
    expect(onLoadMore).not.toHaveBeenCalled()

    surface().scrollTop = surface().scrollHeight
    // IntersectionObserver checks run in the browser's rendering step; each
    // poll requests a frame so headless Chromium performs one.
    await expect
      .poll(async () => {
        await nextFrame()
        return onLoadMore.mock.calls.length
      })
      .toBe(1)
    await nextFrame()
    await nextFrame()
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })
})
