import { cleanup, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { userEvent } from "vitest/browser"

import { nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

afterEach(cleanup)

type Row = { id: string; name: string; city: string }

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "city", header: "City" },
]

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `name-${i + 1}`,
    city: `city-${i + 1}`,
  }))

function Table({
  rowCount = 5,
  ...options
}: Partial<UseDataTableOptions<Row>> & { rowCount?: number }) {
  const [data, setData] = React.useState(() => makeRows(rowCount))
  const table = useDataTable<Row>({
    slotProps: { surface: { className: "max-h-[300px]" } },
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    onEditingCellSave: ({ row, column, value }) =>
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, [column.id]: String(value) } : r
        )
      ),
    renderRowActionMenuItems: undefined,
    ...options,
  })
  return (
    <>
      <button type="button">before</button>
      <DataTable table={table} />
      <button type="button" onClick={() => setData((d) => d.slice(1))}>
        delete first
      </button>
    </>
  )
}

const active = () => document.activeElement as HTMLElement | null
const activeCellText = () =>
  active()?.closest("td")?.textContent ?? active()?.textContent ?? ""

function focusCell(text: string) {
  const cell = screen.getByText(text).closest("td")!
  cell.focus()
  return cell
}

async function settle() {
  await nextFrame()
  await nextFrame()
}

describe("grid semantics", () => {
  it("exposes a grid with row and column positions", async () => {
    render(<Table enableRowSelection />)
    await settle()
    const grid = screen.getByRole("grid")
    // 1 header row + 5 rows.
    expect(grid.getAttribute("aria-rowcount")).toBe("6")
    expect(grid.getAttribute("aria-colcount")).toBe("3")
    const row = screen.getByText("name-2").closest("tr")!
    expect(row.getAttribute("aria-rowindex")).toBe("3")
    expect(row.getAttribute("aria-selected")).toBe("false")
    const cell = screen.getByText("city-2").closest("td")!
    expect(cell.getAttribute("aria-colindex")).toBe("3")
  })

  it("marks the grid busy and announces loading", async () => {
    render(<Table isLoading />)
    await settle()
    expect(screen.getByRole("grid").getAttribute("aria-busy")).toBe("true")
    expect(
      screen
        .getAllByRole("status")
        .some((el) => el.textContent?.includes("Loading"))
    ).toBe(true)
  })
})

describe("keyboard commands", () => {
  it("edits the focused cell with Enter and F2, and returns focus after", async () => {
    render(<Table enableEditing editDisplayMode="cell" />)
    await settle()
    focusCell("name-1")
    await userEvent.keyboard("[Enter]")
    await settle()
    expect(active()?.tagName).toBe("INPUT")
    await userEvent.keyboard("[Escape]")
    await settle()
    // Focus is back in the same cell, not lost to the page.
    expect(activeCellText()).toBe("name-1")

    focusCell("city-2")
    await userEvent.keyboard("{F2}")
    await settle()
    expect(active()?.tagName).toBe("INPUT")
    await userEvent.keyboard("{Control>}a{/Control}x[Enter]")
    await settle()
    expect(activeCellText()).toBe("x")
  })

  it("moves a page of rows with PageDown / PageUp", async () => {
    render(<Table rowCount={60} />)
    await settle()
    focusCell("name-1")
    await userEvent.keyboard("[PageDown]")
    const down = Number(active()!.getAttribute("data-cell-row"))
    expect(down).toBeGreaterThan(2)
    await userEvent.keyboard("[PageUp]")
    expect(activeCellText()).toBe("name-1")
  })

  it("copies the focused cell with Ctrl+C", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined)
    render(<Table />)
    await settle()
    focusCell("city-3")
    await userEvent.keyboard("{Control>}c{/Control}")
    expect(writeText).toHaveBeenCalledWith("city-3")
    writeText.mockRestore()
  })

  it("keeps focus in the grid when the focused row is deleted", async () => {
    render(<Table />)
    await settle()
    focusCell("name-1")
    screen.getByRole("button", { name: "delete first" }).click()
    await settle()
    expect(activeCellText()).toBe("name-2")
  })
})

describe("full screen", () => {
  it("acts as a modal: Escape exits, Tab stays inside, page scroll is locked", async () => {
    render(<Table />)
    await settle()
    const toggle = screen.getByRole("button", { name: /full screen/i })
    toggle.focus()
    await userEvent.keyboard("[Enter]")
    await settle()
    const paper = document.querySelector<HTMLElement>(
      '[data-slot="data-table"]'
    )!
    expect(paper.getAttribute("role")).toBe("dialog")
    expect(paper.getAttribute("aria-modal")).toBe("true")
    expect(document.body.style.overflow).toBe("hidden")

    // Tab never leaves the table.
    for (let i = 0; i < 25; i++) {
      await userEvent.keyboard("[Tab]")
      expect(paper.contains(active())).toBe(true)
    }
    await userEvent.keyboard("{Shift>}[Tab]{/Shift}")
    expect(paper.contains(active())).toBe(true)

    // Escape leaves even while a toolbar button's tooltip is showing.
    await userEvent.keyboard("[Escape]")
    await settle()
    expect(paper.getAttribute("role")).toBeNull()
    expect(document.body.style.overflow).toBe("")
    expect(paper.contains(active())).toBe(true)
  })
})
