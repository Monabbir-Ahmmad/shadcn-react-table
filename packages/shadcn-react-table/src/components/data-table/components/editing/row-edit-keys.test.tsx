import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "../../core/data-table"
import type { UseDataTableOptions } from "../../core/types"
import { useDataTable } from "../../core/use-data-table"

afterEach(cleanup)

type Person = { id: string; name: string; city: string }

const people: Person[] = [{ id: "1", name: "Mason", city: "Oslo" }]

type Options = Partial<UseDataTableOptions<Person>>

function Harness(options: Options) {
  const table = useDataTable<Person>({
    columns: [
      {
        accessorKey: "name",
        header: "Name",
        meta: {
          validate: (value) => (value === "" ? "Required" : undefined),
        },
      },
      { accessorKey: "city", header: "City" },
    ],
    data: people,
    getRowId: (row) => row.id,
    enableEditing: true,
    ...options,
  })
  return <DataTable table={table} />
}

function editRow(options: Options) {
  render(<Harness {...options} />)
  fireEvent.click(screen.getByRole("button", { name: "Edit" }))
}

const field = (value: string) => screen.getByDisplayValue(value)

describe("row edit mode keys", () => {
  it("saves the row on Enter", () => {
    const onEditingRowSave = vi.fn()
    editRow({ editDisplayMode: "row", onEditingRowSave })
    fireEvent.change(field("Mason"), { target: { value: "Max" } })
    fireEvent.keyDown(field("Max"), { key: "Enter" })
    expect(onEditingRowSave).toHaveBeenCalledTimes(1)
    expect(onEditingRowSave.mock.calls[0]![0].values).toEqual({
      name: "Max",
      city: "Oslo",
    })
  })

  it("does not save when focus moves between the row's fields", () => {
    const onEditingRowSave = vi.fn()
    editRow({ editDisplayMode: "row", onEditingRowSave })
    fireEvent.change(field("Mason"), { target: { value: "Max" } })
    fireEvent.blur(field("Max"))
    expect(onEditingRowSave).not.toHaveBeenCalled()
    expect(field("Max")).toBeTruthy()
  })

  it("cancels the row edit on Escape", () => {
    const onEditingRowSave = vi.fn()
    editRow({ editDisplayMode: "row", onEditingRowSave })
    fireEvent.change(field("Mason"), { target: { value: "Max" } })
    fireEvent.keyDown(field("Max"), { key: "Escape" })
    expect(onEditingRowSave).not.toHaveBeenCalled()
    expect(screen.queryByDisplayValue("Max")).toBeNull()
    expect(screen.getByText("Mason")).toBeTruthy()
  })

  it("blocks saving while a field fails validation", () => {
    const onEditingRowSave = vi.fn()
    editRow({ editDisplayMode: "row", onEditingRowSave })
    fireEvent.change(field("Mason"), { target: { value: "" } })
    const save = screen.getByRole("button", { name: "Save" })
    expect(save).toHaveProperty("disabled", true)
    fireEvent.click(save)
    fireEvent.keyDown(field(""), { key: "Enter" })
    expect(onEditingRowSave).not.toHaveBeenCalled()
  })
})

describe("edit dialog keys", () => {
  it("saves on Enter", () => {
    const onEditingRowSave = vi.fn()
    editRow({ editDisplayMode: "modal", onEditingRowSave })
    fireEvent.change(field("Oslo"), { target: { value: "Bergen" } })
    fireEvent.keyDown(field("Bergen"), { key: "Enter" })
    expect(onEditingRowSave).toHaveBeenCalledTimes(1)
    expect(onEditingRowSave.mock.calls[0]![0].values).toEqual({
      name: "Mason",
      city: "Bergen",
    })
  })

  it("does not save on Enter while a field fails validation", () => {
    const onEditingRowSave = vi.fn()
    editRow({ editDisplayMode: "modal", onEditingRowSave })
    fireEvent.change(field("Mason"), { target: { value: "" } })
    fireEvent.keyDown(field(""), { key: "Enter" })
    expect(onEditingRowSave).not.toHaveBeenCalled()
  })
})

describe("edit dialog", () => {
  it("ties each label to its field", () => {
    editRow({ editDisplayMode: "modal" })
    const dialog = screen.getByRole("dialog")
    for (const [text, value] of [
      ["Name", "Mason"],
      ["City", "Oslo"],
    ] as const) {
      const label = within(dialog).getByText(text, { selector: "label" })
      expect(label.getAttribute("for")).toBe(field(value).id)
      expect(field(value).id).not.toBe("")
    }
  })
})
