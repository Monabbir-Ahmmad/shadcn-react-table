import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string; city: string }

const people: Person[] = [{ id: "1", name: "Mason", city: "Oslo" }]

type Options = Partial<UseDataTableOptions<Person>>

function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns: [
      { accessorKey: "name", header: "Name", size: 200, minSize: 100 },
      { accessorKey: "city", header: "City", size: 150 },
    ],
    data: people,
    getRowId: (row) => row.id,
    enableColumnResizing: true,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

function mount(options: Options = {}, dir?: "rtl") {
  let instance: DataTableInstance<Person> | undefined
  render(
    <div dir={dir}>
      <Harness {...options} onTable={(t) => (instance = t)} />
    </div>
  )
  return { table: () => instance! }
}

const handle = () =>
  screen.getAllByRole("separator", { name: "Resize column" })[0]!
const width = (table: DataTableInstance<Person>) =>
  table.getColumn("name")!.getSize()

describe("keyboard column resize", () => {
  it("is a focusable separator that reports the width", () => {
    const { table } = mount()
    const el = handle()
    expect(el.tabIndex).toBe(0)
    expect(el.getAttribute("aria-orientation")).toBe("vertical")
    expect(el.getAttribute("aria-valuenow")).toBe("200")
    // At least the column's minSize, raised to fit its header controls.
    const min = table().getColumn("name")!.columnDef.minSize!
    expect(min).toBeGreaterThanOrEqual(100)
    expect(el.getAttribute("aria-valuemin")).toBe(String(min))
  })

  it("widens and narrows with the arrow keys", () => {
    const { table } = mount()
    fireEvent.keyDown(handle(), { key: "ArrowRight" })
    expect(width(table())).toBe(210)
    fireEvent.keyDown(handle(), { key: "ArrowLeft", shiftKey: true })
    expect(width(table())).toBe(160)
    expect(handle().getAttribute("aria-valuenow")).toBe("160")
  })

  it("jumps to the minimum with Home and clamps there", () => {
    const { table } = mount()
    const min = table().getColumn("name")!.columnDef.minSize!
    fireEvent.keyDown(handle(), { key: "Home" })
    expect(width(table())).toBe(min)
    fireEvent.keyDown(handle(), { key: "ArrowLeft" })
    expect(width(table())).toBe(min)
  })

  it("mirrors the arrows right to left", () => {
    const { table } = mount({}, "rtl")
    fireEvent.keyDown(handle(), { key: "ArrowLeft" })
    expect(width(table())).toBe(210)
  })
})
