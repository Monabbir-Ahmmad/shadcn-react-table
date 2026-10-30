import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu"
import { ContextMenuItem } from "@workspace/ui/components/context-menu"

import { DataTable } from "./data-table"
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

type Person = { id: string; name: string; city: string }

const people: Person[] = [
  { id: "1", name: "Mason", city: "Oslo" },
  { id: "2", name: "Lily", city: "Rome" },
]

type Options = Partial<UseDataTableOptions<Person>>

function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "city", header: "City" },
    ],
    data: people,
    getRowId: (row) => row.id,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

function mount(options: Options = {}) {
  let instance: DataTableInstance<Person> | undefined
  render(<Harness {...options} onTable={(t) => (instance = t)} />)
  return { table: () => instance! }
}

function openDropdown(label: string, index = 0) {
  const trigger = screen.getAllByRole("button", { name: label })[index]!
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
  fireEvent.click(trigger)
}

const itemTexts = () =>
  screen.getAllByRole("menuitem").map((item) => item.textContent)

describe("column actions menu", () => {
  it("hands over the built-in items to place around your own", () => {
    mount({
      renderColumnActionsMenuItems: ({ internalMenuItems }) => (
        <>
          <DropdownMenuItem>Mine</DropdownMenuItem>
          {internalMenuItems}
        </>
      ),
    })
    openDropdown("Column actions")
    const items = itemTexts()
    expect(items[0]).toBe("Mine")
    expect(items).toContain("Sort ascending")
  })

  it("lets your items replace the built-in ones", () => {
    mount({
      renderColumnActionsMenuItems: () => (
        <DropdownMenuItem>Only mine</DropdownMenuItem>
      ),
    })
    openDropdown("Column actions")
    expect(itemTexts()).toEqual(["Only mine"])
  })

  it("closes from closeMenu", () => {
    mount({
      renderColumnActionsMenuItems: ({ closeMenu }) => (
        <button type="button" onClick={closeMenu}>
          Done
        </button>
      ),
    })
    openDropdown("Column actions")
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    expect(screen.queryByRole("menu")).toBeNull()
  })
})

describe("row actions menu", () => {
  it("moves the edit action into the menu as a built-in item", () => {
    const { table } = mount({
      enableEditing: true,
      editDisplayMode: "modal",
      renderRowActionMenuItems: ({ internalMenuItems }) => (
        <>
          {internalMenuItems}
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </>
      ),
    })
    // No separate edit button: it is in the menu.
    expect(screen.queryAllByRole("button", { name: "Edit" })).toHaveLength(0)
    openDropdown("Row actions", 1)
    expect(itemTexts()).toEqual(["Edit", "Delete"])
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }))
    expect(table().getState().editingRowId).toBe("2")
  })
})

describe("cell actions menu", () => {
  const openCellMenu = (text: string) =>
    fireEvent.contextMenu(screen.getByText(text))

  it("offers built-in Copy and Edit with enableCellActions", () => {
    const { table } = mount({
      enableCellActions: true,
      enableClickToCopy: "context-menu",
      enableEditing: true,
    })
    openCellMenu("Lily")
    expect(itemTexts()).toEqual(["Copy", "Edit"])
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }))
    expect(table().getState().editingCell).toEqual({
      rowId: "2",
      columnId: "name",
    })
  })

  it('moves copying into the cell menu with enableClickToCopy: "context-menu"', () => {
    mount({ enableClickToCopy: "context-menu" })
    // No click-to-copy button on the cell.
    expect(screen.queryAllByRole("button", { name: "Copy" })).toHaveLength(0)
    openCellMenu("Mason")
    expect(itemTexts()).toEqual(["Copy"])
  })

  it("decides click-to-copy per cell with a function", () => {
    mount({
      enableClickToCopy: (cell) => cell.column.id === "city",
    })
    expect(screen.getAllByRole("button", { name: "Copy" })).toHaveLength(2)
  })

  it("hands the built-in items and closeMenu to renderCellActionMenuItems", () => {
    mount({
      enableCellActions: true,
      enableEditing: true,
      renderCellActionMenuItems: ({ internalMenuItems, closeMenu }) => (
        <>
          {internalMenuItems}
          <ContextMenuItem onSelect={(event) => event.preventDefault()}>
            Stay
          </ContextMenuItem>
          <button type="button" onClick={closeMenu}>
            Done
          </button>
        </>
      ),
    })
    openCellMenu("Oslo")
    expect(itemTexts()).toEqual(["Edit", "Stay"])
    fireEvent.click(screen.getByRole("button", { name: "Done" }))
    expect(screen.queryByRole("menu")).toBeNull()
  })
})
