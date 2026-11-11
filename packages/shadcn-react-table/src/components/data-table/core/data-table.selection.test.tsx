import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string }

const people: Person[] = ["A", "B", "C", "D", "E"].map((name, i) => ({
  id: String(i + 1),
  name,
}))

type Options = Partial<UseDataTableOptions<Person>>

function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns: [{ accessorKey: "name", header: "Name" }],
    data: people,
    getRowId: (row) => row.id,
    enableRowSelection: true,
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

const rowBoxes = () => screen.getAllByRole("checkbox", { name: "Select row" })
const selected = (table: DataTableInstance<Person>) =>
  Object.keys(table.getState().rowSelection).sort()

describe("shift-click range selection", () => {
  it("selects every row between the last click and a shift-click", () => {
    const { table } = mount()
    fireEvent.click(rowBoxes()[1]!)
    fireEvent.click(rowBoxes()[3]!, { shiftKey: true })
    expect(selected(table())).toEqual(["2", "3", "4"])
  })

  it("works upwards and clears a range the same way", () => {
    const { table } = mount()
    fireEvent.click(rowBoxes()[4]!)
    fireEvent.click(rowBoxes()[0]!, { shiftKey: true })
    expect(selected(table())).toEqual(["1", "2", "3", "4", "5"])
    fireEvent.click(rowBoxes()[3]!)
    fireEvent.click(rowBoxes()[1]!, { shiftKey: true })
    expect(selected(table())).toEqual(["1", "5"])
  })

  it("selects one row at a time with enableBatchRowSelection: false", () => {
    const { table } = mount({ enableBatchRowSelection: false })
    fireEvent.click(rowBoxes()[1]!)
    fireEvent.click(rowBoxes()[3]!, { shiftKey: true })
    expect(selected(table())).toEqual(["2", "4"])
  })
})

describe("single row selection", () => {
  it("shows a checkbox per row and keeps one row selected", () => {
    const { table } = mount({ enableMultiRowSelection: false })
    // No select-all box: one row at a time.
    expect(
      screen.queryAllByRole("checkbox", { name: /select all/i })
    ).toHaveLength(0)
    const boxes = screen.getAllByRole("checkbox", { name: "Select row" })
    expect(boxes).toHaveLength(5)
    fireEvent.click(boxes[0]!)
    fireEvent.click(boxes[2]!)
    expect(selected(table())).toEqual(["3"])
    expect(boxes[0]!.getAttribute("aria-checked")).toBe("false")
    expect(boxes[2]!.getAttribute("aria-checked")).toBe("true")
  })
})

describe("group row selection", () => {
  type Member = { id: string; team: string; name: string }
  const members: Member[] = [
    { id: "1", team: "A", name: "Ava" },
    { id: "2", team: "A", name: "Liam" },
    { id: "3", team: "B", name: "Noah" },
  ]

  function Grouped() {
    const table = useDataTable<Member>({
      columns: [
        { accessorKey: "team", header: "Team" },
        { accessorKey: "name", header: "Name" },
      ],
      data: members,
      getRowId: (row) => row.id,
      enableRowSelection: true,
      enableGrouping: true,
      initialState: { grouping: ["team"], expanded: true },
    })
    return <DataTable table={table} />
  }

  /** The selection box in the row whose text includes `text`. */
  const boxIn = (text: string) =>
    screen
      .getByText(text)
      .closest("tr")!
      .querySelector<HTMLElement>('[role="checkbox"]')!

  it("shows a group as partly checked, then checked, as its rows are", () => {
    render(<Grouped />)
    const group = () => boxIn("(2)")
    expect(group().getAttribute("aria-checked")).toBe("false")
    fireEvent.click(boxIn("Ava"))
    expect(group().getAttribute("aria-checked")).toBe("mixed")
    fireEvent.click(boxIn("Liam"))
    expect(group().getAttribute("aria-checked")).toBe("true")
  })
})
