import { cleanup, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { dragPointer, nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "./data-table"
import {
  DataTableDndProvider,
  useDataTableDropZone,
  type RowDropTarget,
} from "./dnd-scope"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

afterEach(cleanup)

type Row = { id: string; name: string }

const rows = (prefix: string): Row[] =>
  Array.from({ length: 4 }, (_, i) => ({
    id: String(i + 1),
    name: `${prefix}-${i + 1}`,
  }))

function Table({
  label,
  data,
  onTable,
  ...options
}: Partial<UseDataTableOptions<Row>> & {
  label: string
  data: Row[]
  onTable?: (table: DataTableInstance<Row>) => void
}) {
  const table = useDataTable<Row>({
    columns: [{ accessorKey: "name", header: label }],
    data,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableTopToolbar: false,
    enableRowDragging: true,
    ...options,
  })
  onTable?.(table)
  return (
    <section aria-label={label}>
      <DataTable table={table} />
    </section>
  )
}

function Zone() {
  const { setNodeRef, isOver } = useDataTableDropZone("trash")
  return (
    <div ref={setNodeRef} data-over={isOver || undefined} className="h-24">
      Trash
    </div>
  )
}

const grips = (label: string) =>
  within(screen.getByRole("region", { name: label })).getAllByRole("button", {
    name: /reorder row/i,
  })

describe("dragging rows between tables", () => {
  it("drops a row from one table onto another", async () => {
    const onRowDragEnd = vi.fn()
    let right: DataTableInstance<Row> | undefined
    render(
      <DataTableDndProvider>
        <div style={{ display: "flex", gap: 40 }}>
          <Table label="Left" data={rows("left")} onRowDragEnd={onRowDragEnd} />
          <Table
            label="Right"
            data={rows("right")}
            onTable={(t) => (right = t)}
          />
        </div>
      </DataTableDndProvider>
    )
    await nextFrame()
    const grip = grips("Left")[0]!
    const target = screen
      .getByText("right-2")
      .closest("tr")!
      .getBoundingClientRect()
    const from = grip.getBoundingClientRect()
    await dragPointer(grip, {
      dx: target.left + target.width / 2 - (from.left + from.width / 2),
      dy: target.top + target.height / 2 - (from.top + from.height / 2),
    })
    await nextFrame()
    expect(onRowDragEnd).toHaveBeenCalledTimes(1)
    const { row, over } = onRowDragEnd.mock.calls[0]![0] as {
      row: { id: string }
      over: RowDropTarget
    }
    expect(row.id).toBe("1")
    expect(over.type).toBe("table")
    expect(over.type === "table" && over.table).toBe(right)
  })

  it("drops a row on a drop zone", async () => {
    const onRowDragEnd = vi.fn()
    render(
      <DataTableDndProvider>
        <Table label="Left" data={rows("left")} onRowDragEnd={onRowDragEnd} />
        <Zone />
      </DataTableDndProvider>
    )
    await nextFrame()
    const grip = grips("Left")[1]!
    const zone = screen.getByText("Trash").getBoundingClientRect()
    const from = grip.getBoundingClientRect()
    await dragPointer(grip, {
      dx: zone.left + 20 - (from.left + from.width / 2),
      dy: zone.top + zone.height / 2 - (from.top + from.height / 2),
    })
    await nextFrame()
    expect(onRowDragEnd.mock.calls[0]![0].over).toEqual({
      type: "zone",
      id: "trash",
    })
  })

  it("still reorders inside a table that shares the provider", async () => {
    const onRowOrderChange = vi.fn()
    render(
      <DataTableDndProvider>
        <Table
          label="Left"
          data={rows("left")}
          enableRowOrdering
          onRowOrderChange={onRowOrderChange}
        />
        <Table label="Right" data={rows("right")} />
      </DataTableDndProvider>
    )
    await nextFrame()
    const grip = grips("Left")[0]!
    const height = grip.closest("tr")!.getBoundingClientRect().height
    await dragPointer(grip, { dx: 0, dy: height * 2 })
    await nextFrame()
    expect(onRowOrderChange).toHaveBeenCalledWith("1", "3")
  })

  it("drags rows of virtualized tables to another table and a zone", async () => {
    const onRowDragEnd = vi.fn()
    let right: DataTableInstance<Row> | undefined
    render(
      <DataTableDndProvider>
        <div style={{ display: "flex", gap: 40 }}>
          <Table
            label="Left"
            data={rows("left")}
            enableRowVirtualization
            onRowDragEnd={onRowDragEnd}
          />
          <Table
            label="Right"
            data={rows("right")}
            enableRowVirtualization
            onTable={(t) => (right = t)}
          />
        </div>
        <Zone />
      </DataTableDndProvider>
    )
    await nextFrame()
    const drag = async (grip: Element, to: DOMRect) => {
      const from = grip.getBoundingClientRect()
      await dragPointer(grip, {
        dx: to.left + 20 - (from.left + from.width / 2),
        dy: to.top + to.height / 2 - (from.top + from.height / 2),
      })
      await nextFrame()
    }

    await drag(
      grips("Left")[0]!,
      screen.getByText("right-2").closest("tr")!.getBoundingClientRect()
    )
    const first = onRowDragEnd.mock.calls[0]![0] as {
      row: { id: string }
      over: RowDropTarget
    }
    expect(first.row.id).toBe("1")
    expect(first.over.type === "table" && first.over.table).toBe(right)

    await drag(
      grips("Left")[1]!,
      screen.getByText("Trash").getBoundingClientRect()
    )
    expect(onRowDragEnd.mock.calls[1]![0].over).toEqual({
      type: "zone",
      id: "trash",
    })
  })
})
