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

type Node = { id: string; name: string; age: number; children?: Node[] }

const nodes: Node[] = [
  {
    id: "1",
    name: "Root",
    age: 50,
    children: [{ id: "2", name: "Leaf", age: 20 }],
  },
]

type Options = Partial<UseDataTableOptions<Node>>

function Harness(options: Options) {
  const table = useDataTable<Node>({
    columns: [
      { accessorKey: "name", header: "Name", footer: "Total" },
      { accessorKey: "age", header: "Age" },
    ],
    data: nodes,
    getRowId: (row) => row.id,
    ...options,
  })
  return <DataTable table={table} />
}

const mount = (options: Options = {}) => render(<Harness {...options} />)

describe("table head and footer", () => {
  it("renders both by default", () => {
    mount()
    expect(document.querySelector("thead")).not.toBeNull()
    expect(document.querySelector("tfoot")).not.toBeNull()
  })

  it("hides them with enableTableHead / enableTableFooter: false", () => {
    mount({ enableTableHead: false, enableTableFooter: false })
    expect(document.querySelector("thead")).toBeNull()
    expect(document.querySelector("tfoot")).toBeNull()
    // Body rows start at 1 without header rows.
    expect(
      document.querySelector("tbody tr")!.getAttribute("aria-rowindex")
    ).toBe("1")
  })
})

describe("enableExpandAll", () => {
  it("hides the expand-all toggle", () => {
    mount({ getSubRows: (row) => row.children, enableExpandAll: false })
    expect(screen.queryByRole("button", { name: "Expand all" })).toBeNull()
    expect(
      screen.getAllByRole("button", { name: /expand/i }).length
    ).toBeGreaterThan(0)
  })
})

describe("visibleInShowHideMenu", () => {
  it("leaves a column out of the show / hide menu", () => {
    mount({
      columns: [
        { accessorKey: "name", header: "Name" },
        {
          accessorKey: "age",
          header: "Age",
          meta: { visibleInShowHideMenu: false },
        },
      ],
    })
    const trigger = screen.getByRole("button", { name: "Column visibility" })
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    fireEvent.click(trigger)
    const menu = screen.getByRole("menu")
    expect(menu.textContent).toContain("Name")
    expect(menu.textContent).not.toContain("Age")
  })
})
