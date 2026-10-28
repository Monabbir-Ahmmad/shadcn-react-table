import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// jsdom lacks these; Radix Select / Base UI call them when opening.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
})

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string; status: string }

const people: Person[] = [
  { id: "1", name: "Mason", status: "a" },
  { id: "2", name: "Lily", status: "b" },
  { id: "3", name: "Jack", status: "a" },
]

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      editVariant: "select",
      options: [
        { label: "a", value: "a" },
        { label: "b", value: "b" },
      ],
    },
  },
]

type Options = Partial<UseDataTableOptions<Person>>

/** Mounts a table and hands the instance back through `onTable`. */
function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns,
    data: people,
    getRowId: (row) => row.id,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

function mount(options: Options = {}) {
  let instance!: DataTableInstance<Person>
  const view = render(<Harness {...options} onTable={(t) => (instance = t)} />)
  return { view, table: () => instance }
}

describe("in-row controls do not bubble to row/cell click handlers", () => {
  it("still fires onRowClick and onCellClick for a plain cell click", () => {
    const onRowClick = vi.fn()
    const onCellClick = vi.fn()
    mount({ onRowClick, onCellClick })
    fireEvent.click(screen.getByText("Mason"))
    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(onCellClick).toHaveBeenCalledTimes(1)
  })

  it("row-actions edit button", () => {
    const onRowClick = vi.fn()
    const onCellClick = vi.fn()
    mount({
      enableEditing: true,
      editDisplayMode: "row",
      onRowClick,
      onCellClick,
    })
    fireEvent.click(screen.getAllByRole("button", { name: /^edit$/i })[0]!)
    expect(onRowClick).not.toHaveBeenCalled()
    expect(onCellClick).not.toHaveBeenCalled()
  })

  it("row-edit text input and save/cancel buttons", () => {
    const onRowClick = vi.fn()
    mount({ enableEditing: true, editDisplayMode: "row", onRowClick })
    fireEvent.click(screen.getAllByRole("button", { name: /^edit$/i })[0]!)
    fireEvent.click(screen.getAllByRole("textbox")[0]!)
    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }))
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it("row-actions menu trigger and menu items", async () => {
    const onRowClick = vi.fn()
    const onItem = vi.fn()
    mount({
      onRowClick,
      renderRowActionMenuItems: () => (
        <button type="button" role="menuitem" onClick={onItem}>
          Archive
        </button>
      ),
    })
    const trigger = screen.getAllByRole("button", { name: /row actions/i })[0]!
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    fireEvent.click(trigger)
    const item = await screen.findByRole("menuitem", { name: "Archive" })
    fireEvent.click(item)
    expect(onItem).toHaveBeenCalledTimes(1)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it("expand chevron", () => {
    const onRowClick = vi.fn()
    mount({ renderDetailPanel: () => <div>detail</div>, onRowClick })
    const buttons = screen.getAllByRole("button", { name: /expand/i })
    fireEvent.click(buttons[buttons.length - 1]!)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it("row pin button", () => {
    const onRowClick = vi.fn()
    mount({ enableRowNumbers: true, enableRowPinning: true, onRowClick })
    fireEvent.click(screen.getAllByRole("button", { name: /pin row/i })[0]!)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it("click-to-copy button", () => {
    const onRowClick = vi.fn()
    mount({ enableClickToCopy: true, onRowClick })
    fireEvent.click(screen.getAllByRole("button", { name: /copy/i })[0]!)
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it("click-to-edit cell button", () => {
    const onRowClick = vi.fn()
    mount({ enableEditing: true, editDisplayMode: "cell", onRowClick })
    fireEvent.click(screen.getByText("Mason"))
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it("row drag handle", () => {
    const onRowClick = vi.fn()
    mount({ enableRowOrdering: true, onRowClick })
    fireEvent.click(screen.getAllByRole("button", { name: /reorder row/i })[0]!)
    expect(onRowClick).not.toHaveBeenCalled()
  })
})
