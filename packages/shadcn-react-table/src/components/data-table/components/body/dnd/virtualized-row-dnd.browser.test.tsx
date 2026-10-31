import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { nextFrame } from "../../../../../../test/browser/pointer"
import { DataTable } from "../../../core/data-table"
import type { DataTableColumnDef } from "../../../core/table-types"
import type { UseDataTableOptions } from "../../../core/types"
import { useDataTable } from "../../../core/use-data-table"

afterEach(cleanup)

type Row = { id: string; name: string }

const columns: DataTableColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name", size: 200 },
]

const data: Row[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `row-${i + 1}`,
  name: `Name ${i + 1}`,
}))

function Table(options: Partial<UseDataTableOptions<Row>>) {
  const table = useDataTable<Row>({
    columns,
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowVirtualization: true,
    enableRowOrdering: true,
    slotProps: { surface: { style: { maxHeight: 320 } } },
    ...options,
  })
  return <DataTable table={table} />
}

const base = {
  bubbles: true,
  cancelable: true,
  pointerId: 1,
  isPrimary: true,
  pointerType: "mouse",
  button: 0,
}
const pointer = (type: string, target: EventTarget, x: number, y: number) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      ...base,
      buttons: type === "pointerup" ? 0 : 1,
      clientX: x,
      clientY: y,
    })
  )

const rowEl = (id: string) =>
  document.querySelector<HTMLTableRowElement>(`tr[data-row-id="${id}"]`)

describe("row ordering with row virtualization", () => {
  it("keeps the dragged row rendered while the drag scrolls the table", async () => {
    const onRowOrderChange = vi.fn()
    render(<Table onRowOrderChange={onRowOrderChange} />)
    await nextFrame()
    const surface = document.querySelector<HTMLElement>(
      '[data-slot="data-table-surface"]'
    )!
    // Only a window of the rows is rendered.
    const rendered = () => document.querySelectorAll("tbody tr[data-row-id]")
    expect(rendered().length).toBeLessThan(60)
    expect(rowEl("row-100")).toBeNull()

    const handle = screen.getAllByRole("button", { name: /reorder row/i })[0]!
    expect(handle.closest("tr")!.dataset.rowId).toBe("row-1")
    const start = handle.getBoundingClientRect()
    const x = start.left + start.width / 2
    const y = start.top + start.height / 2
    pointer("pointerdown", handle, x, y)
    await nextFrame()

    // Move to the surface's bottom edge, where dnd-kit scrolls it.
    const bottom = surface.getBoundingClientRect().bottom - 4
    for (let i = 1; i <= 10; i++) {
      pointer("pointermove", document, x, y + ((bottom - y) * i) / 10)
      await nextFrame()
    }

    // Hold there until the table has scrolled about 70 rows, far past the
    // first window; the dragged row stays in the DOM all along. The scroll
    // moves a step per timer tick, so its speed follows the machine's load:
    // wait on the distance, with a deadline a busy CI runner still meets.
    const far = rowEl("row-1")!.offsetHeight * 70
    let alwaysRendered = true
    const deadline = performance.now() + 20_000
    while (surface.scrollTop < far && performance.now() < deadline) {
      await nextFrame()
      if (!rowEl("row-1")?.hasAttribute("data-dragging")) alwaysRendered = false
    }
    expect(surface.scrollTop).toBeGreaterThanOrEqual(far)
    expect(alwaysRendered).toBe(true)
    // It follows the pointer through the scroll.
    const dragged = rowEl("row-1")!.getBoundingClientRect()
    expect(Math.abs(dragged.top + dragged.height / 2 - bottom)).toBeLessThan(
      dragged.height
    )

    // Back to the middle (no more scrolling), over a row that was far out of
    // the first window. Rows shift aside during the drag, so aim at the
    // target's place in the layout (offsetTop ignores the shift).
    const mid = surface.getBoundingClientRect()
    pointer("pointermove", document, x, mid.top + mid.height / 2)
    for (let i = 0; i < 5; i++) await nextFrame()
    const scrolled = surface.scrollTop
    const tableTop = surface.querySelector("table")!.getBoundingClientRect().top
    const target = [
      ...document.querySelectorAll<HTMLTableRowElement>(
        "tbody tr[data-row-id]:not([data-dragging])"
      ),
    ].find((tr) => {
      const top = tableTop + tr.offsetTop
      return top > mid.top + mid.height / 3 && top < mid.bottom - mid.height / 3
    })!
    const targetId = target.dataset.rowId!
    expect(Number(targetId.slice(4))).toBeGreaterThan(60)
    const targetY = tableTop + target.offsetTop + target.offsetHeight / 2
    for (let i = 1; i <= 3; i++) {
      pointer("pointermove", document, x, targetY + i * 0.5)
      await nextFrame()
    }
    // Still mid-way: the surface stopped scrolling.
    expect(Math.abs(surface.scrollTop - scrolled)).toBeLessThan(2)

    pointer("pointerup", document, x, targetY + 1.5)
    await nextFrame()

    expect(onRowOrderChange).toHaveBeenCalledTimes(1)
    expect(onRowOrderChange).toHaveBeenCalledWith("row-1", targetId)
    // The drag is over: no row is kept outside the window any more.
    await nextFrame()
    await nextFrame()
    expect(document.querySelector("tr[data-dragging]")).toBeNull()
    expect(rowEl("row-1")).toBeNull()
  }, 30_000)
})
