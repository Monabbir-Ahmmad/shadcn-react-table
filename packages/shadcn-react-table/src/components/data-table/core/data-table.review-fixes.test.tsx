import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

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

type Person = { id: string; name: string; rank: number; country: string }

const people: Person[] = [
  { id: "1", name: "Ava", rank: 2, country: "us" },
  { id: "2", name: "Ben", rank: 3, country: "no" },
  { id: "3", name: "Cal", rank: 1, country: "us" },
  { id: "4", name: "Dan", rank: 4, country: "no" },
]

type Options = Partial<UseDataTableOptions<Person>>

function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns: [{ accessorKey: "name", header: "Name" }],
    data: people,
    getRowId: (row) => row.id,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

function mount(options: Options = {}) {
  let instance: DataTableInstance<Person> | undefined
  const view = render(<Harness {...options} onTable={(t) => (instance = t)} />)
  return {
    table: () => instance!,
    rerender: (next: Options) =>
      view.rerender(<Harness {...next} onTable={(t) => (instance = t)} />),
  }
}

describe("review fixes", () => {
  it("keeps rows memoized when the holder re-renders with the same options", () => {
    const renders = { count: 0 }
    const columns: DataTableColumnDef<Person>[] = [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => {
          renders.count++
          return String(getValue())
        },
      },
    ]
    const options: Options = {
      columns,
      enableEditing: (row) => row.original.rank > 1,
    }
    const { rerender } = mount(options)
    renders.count = 0
    rerender(options)
    expect(renders.count).toBe(0)
  })

  it("accepts React elements in displayColumnDefOptions", () => {
    // Elements created during a render carry their owner, which is circular.
    function WithIcon() {
      return (
        <Harness
          enableRowSelection
          displayColumnDefOptions={{
            "cn-select": { meta: { icon: <span>x</span> } as never },
          }}
        />
      )
    }
    expect(() => render(<WithIcon />)).not.toThrow()
  })

  it("uses the latest custom sort function", () => {
    let table!: DataTableInstance<Person>
    function Sorted({
      dir,
      onTable,
    }: {
      dir: 1 | -1
      onTable: (t: DataTableInstance<Person>) => void
    }) {
      const instance = useDataTable<Person>({
        columns: [
          { accessorKey: "name", header: "Name" },
          { accessorKey: "rank", header: "Rank", sortFn: "byRank" },
        ],
        data: people,
        getRowId: (row) => row.id,
        sortFns: {
          byRank: (a, b, id) =>
            dir * ((a.getValue(id) as number) - (b.getValue(id) as number)),
        },
        initialState: { sorting: [{ id: "rank", desc: false }] },
      })
      onTable(instance)
      return <DataTable table={instance} />
    }
    const view = render(<Sorted dir={1} onTable={(t) => (table = t)} />)
    const first = () => document.querySelector("tbody tr td")?.textContent ?? ""
    expect(first()).toBe("Cal")
    view.rerender(<Sorted dir={-1} onTable={(t) => (table = t)} />)
    // A sort change re-runs the sort, now with the new closure.
    act(() => table.setSorting([{ id: "rank", desc: true }]))
    act(() => table.setSorting([{ id: "rank", desc: false }]))
    expect(first()).toBe("Dan")
  })

  it("suggests option values in the autocomplete filter", () => {
    mount({
      columns: [
        {
          accessorKey: "country",
          header: "Country",
          meta: {
            filterVariant: "autocomplete",
            filterSelectOptions: [{ label: "United States", value: "us" }],
          },
        },
      ],
      initialState: { showColumnFilters: true },
    })
    const input = screen.getByLabelText("Filter by Country")
    const option = document
      .getElementById(input.getAttribute("list")!)!
      .querySelector("option")!
    expect(option.value).toBe("us")
    expect(option.label).toBe("United States")
  })

  it("opens no editable fields in the dialog for a row enableEditing rejects", () => {
    const { table } = mount({
      editDisplayMode: "modal",
      enableEditing: (row) => row.original.rank !== 1,
    })
    act(() => table().beginRowEdit(table().getRow("3")))
    expect(screen.queryByRole("dialog")).toBeNull()
    act(() => table().beginRowEdit(table().getRow("1")))
    expect(screen.getByRole("dialog")).toBeTruthy()
  })

  it("selects a shift-click range in display order with pinned rows", () => {
    const { table } = mount({
      enableRowSelection: true,
      enableRowPinning: true,
      initialState: { rowPinning: { top: ["4"], bottom: [] } },
    })
    // Displayed: Dan (pinned), Ava, Ben, Cal.
    const boxes = screen.getAllByRole("checkbox", { name: "Select row" })
    fireEvent.click(boxes[0]!)
    fireEvent.click(boxes[1]!, { shiftKey: true })
    expect(Object.keys(table().getState().rowSelection).sort()).toEqual([
      "1",
      "4",
    ])
  })

  it("keeps a radio selected when it is clicked again", () => {
    const { table } = mount({
      enableRowSelection: true,
      enableMultiRowSelection: false,
    })
    const radio = screen.getAllByRole("radio")[1]!
    fireEvent.click(radio)
    fireEvent.click(radio)
    expect(table().getState().rowSelection).toEqual({ "2": true })
  })
})
