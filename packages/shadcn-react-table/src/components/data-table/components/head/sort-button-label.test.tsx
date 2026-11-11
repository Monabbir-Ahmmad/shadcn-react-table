import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "../../core/data-table"
import { useDataTable } from "../../core/use-data-table"

afterEach(cleanup)

type Person = { id: string; name: string }

function Harness() {
  const table = useDataTable<Person>({
    columns: [{ accessorKey: "name", header: "Name" }],
    data: [
      { id: "1", name: "Mason" },
      { id: "2", name: "Ava" },
    ],
    getRowId: (row) => row.id,
  })
  return <DataTable table={table} />
}

/** The text of the element(s) an element's `aria-describedby` points at. */
const descriptionOf = (el: Element) =>
  (el.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ")

describe("sort button", () => {
  it("is named by its column, with the sort action as its description", () => {
    render(<Harness />)
    // Screen readers read this name as every body cell's column header.
    const button = screen.getByRole("button", { name: "Name" })
    expect(descriptionOf(button)).toBe("Sort by Name ascending")

    fireEvent.click(button)
    expect(descriptionOf(button)).toBe("Sort by Name descending")

    fireEvent.click(button)
    expect(screen.getByRole("button", { name: "Name" })).toBe(button)
    expect(descriptionOf(button)).toBe("Clear sort")
  })
})
