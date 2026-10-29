import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "../core/data-table"
import type { DataTableColumnDef } from "../core/table-types"
import { useDataTable } from "../core/use-data-table"

afterEach(cleanup)

type Row = { id: string } & Record<string, string>

const GROUPS = 5
const PER_GROUP = 8
const COLUMN_COUNT = GROUPS * PER_GROUP

const columns: DataTableColumnDef<Row>[] = Array.from(
  { length: GROUPS },
  (_, g) => ({
    id: `g${g}`,
    header: `G${g}`,
    columns: Array.from({ length: PER_GROUP }, (_, j) => {
      const i = g * PER_GROUP + j
      return {
        accessorKey: `c${i}`,
        header: `H${i}`,
        footer: `F${i}`,
        size: 120,
      }
    }),
  })
)

const data: Row[] = Array.from({ length: 5 }, (_, r) => {
  const row: Row = { id: String(r) }
  for (let c = 0; c < COLUMN_COUNT; c++) row[`c${c}`] = `r${r}c${c}`
  return row
})

function Table() {
  const table = useDataTable<Row>({
    slotProps: { surface: { className: "max-h-[400px]" } },
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableColumnVirtualization: true,
  })
  return (
    <div style={{ width: 600 }}>
      <DataTable table={table} />
    </div>
  )
}

const surface = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-surface"]')!

async function settle() {
  await nextFrame()
  await nextFrame()
}

const box = (text: string, tag: string) =>
  screen.getByText(text).closest(tag)!.getBoundingClientRect()

/** Every rendered leaf header and footer lines up with its body column. */
function expectColumnsAligned() {
  let checked = 0
  for (let i = 0; i < COLUMN_COUNT; i++) {
    if (!screen.queryByText(`r0c${i}`)) continue
    const body = box(`r0c${i}`, "td")
    expect(Math.abs(box(`H${i}`, "th").left - body.left)).toBeLessThanOrEqual(1)
    expect(Math.abs(box(`F${i}`, "td").left - body.left)).toBeLessThanOrEqual(1)
    checked++
  }
  expect(checked).toBeGreaterThan(0)
}

describe("column virtualization with grouped headers", () => {
  it("keeps group and leaf headers aligned with the body", async () => {
    render(<Table />)
    await settle()
    expectColumnsAligned()
    expect(
      Math.abs(box("G0", "th").left - box("r0c0", "td").left)
    ).toBeLessThanOrEqual(1)

    const s = surface()
    s.scrollLeft = 20 * 120
    await settle()
    expectColumnsAligned()

    // The group covering the visible columns is rendered over them.
    expect(screen.queryByText("G2")).not.toBeNull()
    const group = box("G2", "th")
    expect(group.right).toBeGreaterThan(box("r0c20", "td").left)
    expect(group.left).toBeLessThanOrEqual(box("r0c20", "td").left + 1)
    expect(s.scrollWidth).toBeGreaterThanOrEqual(COLUMN_COUNT * 120 - 2)
  })
})
