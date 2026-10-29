import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import type { DataTableColumnDef } from "./table-types"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Shift = { id: string; name: string; start: Date; opens: string }

const shifts: Shift[] = [
  {
    id: "1",
    name: "Early",
    start: new Date(2025, 0, 10, 6, 15),
    opens: "06:15",
  },
  { id: "2", name: "Day", start: new Date(2025, 0, 10, 9, 30), opens: "09:30" },
  {
    id: "3",
    name: "Late",
    start: new Date(2025, 0, 10, 18, 0),
    opens: "18:00",
  },
  {
    id: "4",
    name: "Next",
    start: new Date(2025, 0, 11, 9, 30),
    opens: "09:30",
  },
]

type Options = Partial<UseDataTableOptions<Shift>>

function Harness(options: Options) {
  const table = useDataTable<Shift>({
    columns: [{ accessorKey: "name", header: "Name" }],
    data: shifts,
    getRowId: (row) => row.id,
    ...options,
  })
  return <DataTable table={table} />
}

const mount = (options: Options) => render(<Harness {...options} />)

const names = () =>
  Array.from(document.querySelectorAll("tbody tr")).map(
    (tr) => tr.querySelector("td")?.textContent ?? ""
  )

function column(
  accessorKey: "start" | "opens",
  meta: NonNullable<DataTableColumnDef<Shift>["meta"]>
): DataTableColumnDef<Shift>[] {
  return [
    { accessorKey: "name", header: "Name" },
    { accessorKey, header: "When", meta },
  ]
}

describe("datetime filters", () => {
  it("compares to the minute", () => {
    mount({
      columns: column("start", {
        filterVariant: "datetime",
        filterMode: "after",
      }),
      initialState: {
        columnFilters: [{ id: "start", value: new Date(2025, 0, 10, 9, 30) }],
      },
    })
    expect(names()).toEqual(["Late", "Next"])
  })

  it("filters a datetime range, inclusive", () => {
    mount({
      columns: column("start", { filterVariant: "datetime-range" }),
      initialState: {
        columnFilters: [
          {
            id: "start",
            value: [new Date(2025, 0, 10, 9, 30), new Date(2025, 0, 10, 18, 0)],
          },
        ],
      },
    })
    expect(names()).toEqual(["Day", "Late"])
  })

  it("renders a datetime input that sets the filter", () => {
    mount({
      columns: column("start", {
        filterVariant: "datetime",
        filterMode: "before",
      }),
      initialState: { showColumnFilters: true },
    })
    const input = screen.getByLabelText("Filter by When") as HTMLInputElement
    expect(input.type).toBe("datetime-local")
    fireEvent.change(input, { target: { value: "2025-01-10T09:00" } })
    expect(names()).toEqual(["Early"])
  })
})

describe("time filters", () => {
  it("matches times of day, from strings or dates", () => {
    mount({
      columns: [
        { accessorKey: "name", header: "Name" },
        {
          accessorKey: "opens",
          header: "Opens",
          meta: { filterVariant: "time" },
        },
        {
          accessorKey: "start",
          header: "Start",
          meta: { filterVariant: "time", filterMode: "before" },
        },
      ],
      initialState: {
        columnFilters: [
          { id: "opens", value: "09:30" },
          { id: "start", value: "12:00" },
        ],
      },
    })
    expect(names()).toEqual(["Day", "Next"])
  })

  it("filters a time range from its two inputs", () => {
    mount({
      columns: column("opens", { filterVariant: "time-range" }),
      initialState: { showColumnFilters: true },
    })
    const [from, to] = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[type="time"]')
    )
    fireEvent.change(from!, { target: { value: "06:00" } })
    fireEvent.change(to!, { target: { value: "09:30" } })
    expect(names()).toEqual(["Early", "Day", "Next"])
  })
})

describe("autocomplete filter", () => {
  it("suggests the column's values and filters as you type", () => {
    mount({
      columns: [
        {
          accessorKey: "name",
          header: "Name",
          meta: { filterVariant: "autocomplete" },
        },
      ],
      initialState: { showColumnFilters: true },
    })
    const input = screen.getByLabelText("Filter by Name") as HTMLInputElement
    const list = document.getElementById(input.getAttribute("list")!)!
    expect(
      Array.from(list.querySelectorAll("option")).map((o) => o.value)
    ).toEqual(["Day", "Early", "Late", "Next"])
    fireEvent.change(input, { target: { value: "ea" } })
    expect(names()).toEqual(["Early"])
  })
})
