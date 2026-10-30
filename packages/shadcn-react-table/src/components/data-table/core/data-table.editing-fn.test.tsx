import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// jsdom lacks these; Radix Select / Base UI call them when opening.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
})

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string; city: string; locked: boolean }

const people: Person[] = [
  { id: "1", name: "Mason", city: "Oslo", locked: false },
  { id: "2", name: "Lily", city: "Rome", locked: true },
]

type Options = Partial<UseDataTableOptions<Person>>

function Harness(options: Options) {
  const table = useDataTable<Person>({
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "city", header: "City" },
    ],
    data: people,
    getRowId: (row) => row.id,
    enableEditing: true,
    ...options,
  })
  return <DataTable table={table} />
}

const mount = (options: Options = {}) => render(<Harness {...options} />)

/** Clicks a cell's value and reports whether an editor opened for it. */
function opensEditor(text: string) {
  fireEvent.click(screen.getByText(text))
  return screen.queryByDisplayValue(text) != null
}

describe("enableEditing as a function", () => {
  it("decides per row at the table level", () => {
    mount({ enableEditing: (row) => !row.original.locked })
    expect(opensEditor("Lily")).toBe(false)
    expect(opensEditor("Mason")).toBe(true)
  })

  it("decides per row at the column level", () => {
    mount({
      columns: [
        {
          accessorKey: "name",
          header: "Name",
          meta: { enableEditing: (row) => !row.original.locked },
        },
        { accessorKey: "city", header: "City" },
      ],
    })
    expect(opensEditor("Lily")).toBe(false)
    expect(opensEditor("Rome")).toBe(true)
  })

  it("hides the row edit button on rows that can't be edited", () => {
    mount({
      editDisplayMode: "row",
      enableEditing: (row) => !row.original.locked,
    })
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(1)
  })

  it("leaves a column's per-row-locked field out of the edit dialog", () => {
    mount({
      editDisplayMode: "modal",
      columns: [
        {
          accessorKey: "name",
          header: "Name",
          meta: { enableEditing: (row) => !row.original.locked },
        },
        { accessorKey: "city", header: "City" },
      ],
    })
    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[1]!)
    const dialog = screen.getByRole("dialog")
    expect(dialog.querySelector('input[value="Lily"]')).toBeNull()
    expect(dialog.querySelector('input[value="Rome"]')).not.toBeNull()
  })

  it("still allows creating rows when the table-level function is set", () => {
    mount({
      createDisplayMode: "row",
      enableEditing: () => false,
      initialState: { isCreating: true },
    })
    expect(
      document.querySelectorAll('[data-slot="data-table-create-row"] input')
        .length
    ).toBe(2)
  })
})
