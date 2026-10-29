import { cleanup, render, screen } from "@testing-library/react"
import * as React from "react"
import { userEvent } from "vitest/browser"
import { afterEach, describe, expect, it } from "vitest"

import { nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "../core/data-table"
import type { DataTableColumnDef } from "../core/table-types"
import type { UseDataTableOptions } from "../core/types"
import { useDataTable } from "../core/use-data-table"

afterEach(cleanup)

type Row = { id: string } & Record<string, string>

const makeColumns = (count: number): DataTableColumnDef<Row>[] =>
  Array.from({ length: count }, (_, i) => ({
    accessorKey: `c${i}`,
    header: `H${i}`,
    size: 120,
  }))

/** Rows `1..rowCount`; each cell reads `r{row}c{col}`. */
const makeRows = (rowCount: number, colCount: number): Row[] =>
  Array.from({ length: rowCount }, (_, r) => {
    const row: Row = { id: String(r + 1) }
    for (let c = 0; c < colCount; c++) row[`c${c}`] = `r${r + 1}c${c}`
    return row
  })

function Table({
  rowCount,
  colCount,
  ...options
}: Partial<UseDataTableOptions<Row>> & { rowCount: number; colCount: number }) {
  // Stable references: new data on every render would reset expansion.
  const [columns] = React.useState(() => makeColumns(colCount))
  const [data] = React.useState(() => makeRows(rowCount, colCount))
  const table = useDataTable<Row>({
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    ...options,
  })
  return (
    <div style={{ width: 600 }}>
      <DataTable table={table} surfaceClassName="max-h-[400px]" />
    </div>
  )
}

const surface = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-surface"]')!

const tabStops = () =>
  document.querySelectorAll('[data-cell-row][tabindex="0"]').length

const activeText = () => document.activeElement?.textContent ?? ""

function focusCell(text: string) {
  const cell = screen.getAllByText(text)[0]!.closest("td")!
  cell.focus()
  expect(document.activeElement).toBe(cell)
}

/** Polls once per frame; headless Chromium only renders when asked. */
const poll = <T,>(read: () => T) =>
  expect.poll(async () => {
    await nextFrame()
    return read()
  })

async function settle() {
  await nextFrame()
  await nextFrame()
}

describe("keyboard navigation", () => {
  it("moves between cells with arrows, Home and End", async () => {
    render(<Table rowCount={5} colCount={4} />)
    await settle()
    expect(tabStops()).toBe(1)

    focusCell("r1c0")
    await userEvent.keyboard("[ArrowRight]")
    expect(activeText()).toBe("r1c1")
    await userEvent.keyboard("[ArrowDown]")
    expect(activeText()).toBe("r2c1")
    await userEvent.keyboard("[End]")
    expect(activeText()).toBe("r2c3")
    await userEvent.keyboard("[Home]")
    expect(activeText()).toBe("r2c0")
    await userEvent.keyboard("{Control>}[End]{/Control}")
    expect(activeText()).toBe("r5c3")
    await userEvent.keyboard("{Control>}[Home]{/Control}")
    expect(activeText()).toBe("r1c0")
    expect(tabStops()).toBe(1)
  })

  it("steps over an open detail panel", async () => {
    render(
      <Table
        rowCount={5}
        colCount={3}
        renderDetailPanel={({ row }) => `detail-${row.id}`}
      />
    )
    await settle()
    const toggles = screen.getAllByRole("button", {
      name: /toggle row expanded/i,
    })
    await userEvent.click(toggles[1]!)
    await poll(() => screen.queryByText("detail-2")).not.toBeNull()

    focusCell("r2c0")
    await userEvent.keyboard("[ArrowDown]")
    expect(activeText()).toBe("r3c0")
  })

  it("reaches the last row under row virtualization", async () => {
    render(<Table rowCount={1000} colCount={2} enableRowVirtualization />)
    await settle()
    expect(screen.queryByText("r1000c1")).toBeNull()

    focusCell("r1c0")
    await userEvent.keyboard("{Control>}[End]{/Control}")
    await poll(activeText).toBe("r1000c1")

    surface().scrollTop = 0
    await poll(() => screen.queryByText("r1c0")).not.toBeNull()
    await settle()
    expect(tabStops()).toBe(1)
  })

  it("reaches the last column under column virtualization", async () => {
    render(<Table rowCount={5} colCount={40} enableColumnVirtualization />)
    await settle()
    expect(screen.queryByText("r1c39")).toBeNull()

    focusCell("r1c0")
    await userEvent.keyboard("[End]")
    await poll(activeText).toBe("r1c39")
  })

  it("moves from a pinned top row into the virtualized rows", async () => {
    render(
      <Table
        rowCount={200}
        colCount={2}
        enableRowPinning
        enableRowVirtualization
        initialState={{ rowPinning: { top: ["5"], bottom: [] } }}
      />
    )
    await settle()
    expect(tabStops()).toBe(1)

    focusCell("r5c0")
    await userEvent.keyboard("[ArrowDown]")
    expect(activeText()).toBe("r1c0")
  })
})
