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

describe("filter input groups", () => {
  const group = (element: Element) =>
    element.closest('[data-slot="input-group"]')

  it("puts the text filter's mode menu and clear button inside the input", () => {
    mount({ initialState: { showColumnFilters: true } })
    const input = screen.getByLabelText("Filter by Name")
    const field = group(input)
    expect(field).not.toBeNull()
    // No clear button while the field is empty.
    expect(screen.queryByRole("button", { name: "Clear filter" })).toBeNull()
    expect(
      field!.contains(
        screen.getByRole("button", { name: "Change filter mode" })
      )
    ).toBe(true)

    fireEvent.change(input, { target: { value: "ea" } })
    const clear = screen.getByRole("button", { name: "Clear filter" })
    expect(field!.contains(clear)).toBe(true)
    fireEvent.click(clear)
    expect((input as HTMLInputElement).value).toBe("")
    expect(names()).toEqual(["Early", "Day", "Late", "Next"])
  })

  it("puts the number filter's mode menu and clear button inside the input", () => {
    mount({
      columns: column("opens", {
        filterVariant: "range",
        filterMode: "greaterThan",
      }),
      initialState: {
        showColumnFilters: true,
        columnFilters: [{ id: "opens", value: "5" }],
      },
    })
    const field = group(screen.getByLabelText("Filter by When"))
    expect(field).not.toBeNull()
    expect(
      field!.contains(
        screen.getAllByRole("button", { name: "Change filter mode" })[1]!
      )
    ).toBe(true)
    expect(
      field!.contains(screen.getByRole("button", { name: "Clear filter" }))
    ).toBe(true)
  })

  it("gives each side of a number range its own group", () => {
    mount({
      columns: column("opens", { filterVariant: "range" }),
      initialState: {
        showColumnFilters: true,
        columnFilters: [{ id: "opens", value: ["", "9"] }],
      },
    })
    const min = group(screen.getByLabelText("Min"))
    const max = group(screen.getByLabelText("Max"))
    expect(min).not.toBeNull()
    expect(max).not.toBeNull()
    expect(min).not.toBe(max)
    // The mode menu leads the first side; only the filled side clears.
    expect(
      min!.contains(
        screen.getAllByRole("button", { name: "Change filter mode" })[1]!
      )
    ).toBe(true)
    const clear = screen.getByRole("button", { name: "Clear filter (Max)" })
    expect(max!.contains(clear)).toBe(true)
    fireEvent.click(clear)
    expect((screen.getByLabelText("Max") as HTMLInputElement).value).toBe("")
  })

  it("keeps a select filter's mode menu beside the field", () => {
    mount({
      columns: [
        {
          accessorKey: "name",
          header: "Name",
          meta: {
            filterVariant: "select",
            columnFilterModeOptions: ["firstLetter"],
          },
        },
      ],
      filterFns: { firstLetter: () => true },
      initialState: { showColumnFilters: true },
    })
    const trigger = screen.getByRole("button", { name: "Change filter mode" })
    expect(group(trigger)).toBeNull()
  })
})
