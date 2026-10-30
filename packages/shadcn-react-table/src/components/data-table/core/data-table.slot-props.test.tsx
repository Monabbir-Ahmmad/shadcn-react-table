import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
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

type Person = { id: string; name: string; age: number }

const people: Person[] = [
  { id: "1", name: "Mason", age: 30 },
  { id: "2", name: "Lily", age: 25 },
]

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "age", header: "Age" },
]

type Options = Partial<UseDataTableOptions<Person>>

function Harness(options: Options) {
  const table = useDataTable<Person>({
    columns,
    data: people,
    getRowId: (row) => row.id,
    ...options,
  })
  return <DataTable table={table} />
}

const mount = (options: Options = {}) => render(<Harness {...options} />)

const slot = (name: string) =>
  document.querySelector<HTMLElement>(`[data-slot="${name}"]`)!

describe("slotProps", () => {
  it("adds classes and styles to the container parts", () => {
    mount({
      slotProps: {
        root: { className: "root-x" },
        surface: { className: "max-h-[300px]", style: { height: 200 } },
        table: { "aria-describedby": "caption" },
      },
    })
    expect(slot("data-table").className).toContain("root-x")
    // Combined with the surface's own classes, not replacing them.
    expect(slot("data-table-surface").className).toContain("max-h-[300px]")
    expect(slot("data-table-surface").className).toContain("overflow-auto")
    expect(slot("data-table-surface").style.height).toBe("200px")
    expect(screen.getByRole("grid").getAttribute("aria-describedby")).toBe(
      "caption"
    )
  })

  it("resolves function slots against the part's context", () => {
    mount({
      slotProps: {
        bodyRow: ({ row, rowIndex }) => ({
          "data-testid": `row-${row.id}-${rowIndex}`,
        }),
        bodyCell: ({ cell }) => ({
          "data-testid": `cell-${cell.id}`,
        }),
        headCell: ({ column }) => ({ "data-testid": `head-${column.id}` }),
      },
    })
    expect(screen.getByTestId("row-2-1").textContent).toContain("Lily")
    expect(screen.getByTestId("cell-1_age").textContent).toContain("30")
    expect(screen.getByTestId("head-name").textContent).toContain("Name")
  })

  it("runs a consumer handler alongside the table's own", () => {
    const onRowClick = vi.fn()
    const onClick = vi.fn()
    mount({ onRowClick, slotProps: { bodyRow: { onClick } } })
    fireEvent.click(screen.getByText("Lily"))
    expect(onRowClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("applies column-level slots after the table-level ones", () => {
    render(
      <Harness
        columns={[
          {
            accessorKey: "name",
            header: "Name",
            meta: {
              slotProps: {
                bodyCell: ({ row }) => ({
                  className: "col-x",
                  title: `name of ${row.id}`,
                }),
              },
            },
          },
          { accessorKey: "age", header: "Age" },
        ]}
        slotProps={{ bodyCell: { className: "table-x", title: "table" } }}
      />
    )
    const name = screen.getByText("Mason").closest("td")!
    expect(name.className).toContain("table-x")
    expect(name.className).toContain("col-x")
    expect(name.getAttribute("title")).toBe("name of 1")
    expect(screen.getByText("30").closest("td")!.getAttribute("title")).toBe(
      "table"
    )
  })

  it("reaches the selection checkboxes and the edit field", () => {
    mount({
      enableRowSelection: true,
      enableEditing: true,
      editDisplayMode: "cell",
      slotProps: {
        selectCheckbox: ({ row }) => ({
          "data-testid": row ? `select-${row.id}` : "select-all",
        }),
        editField: ({ column }) => ({ placeholder: `edit ${column.id}` }),
      },
    })
    expect(screen.getByTestId("select-all").getAttribute("role")).toBe(
      "checkbox"
    )
    fireEvent.click(screen.getByTestId("select-1"))
    expect(screen.getByTestId("select-1").getAttribute("aria-checked")).toBe(
      "true"
    )
    fireEvent.click(screen.getByText("Mason"))
    expect(
      (screen.getByPlaceholderText("edit name") as HTMLInputElement).value
    ).toBe("Mason")
  })
})
