import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import { defaultLocalization } from "./localization"
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

type Person = { id: string; name: string; active: boolean }

const people: Person[] = [
  { id: "1", name: "Mason", active: true },
  { id: "2", name: "Lily", active: false },
  { id: "3", name: "Jack", active: true },
]

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "active",
    header: "Active",
    meta: { variant: "checkbox" },
  },
]

type Options = Partial<UseDataTableOptions<Person>>

/** Mounts a table and hands the instance back through `onTable`. */
function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Person>) => void }) {
  const table = useDataTable<Person>({
    columns,
    data: people,
    getRowId: (row) => row.id,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

function mount(options: Options = {}) {
  let instance!: DataTableInstance<Person>
  const view = render(<Harness {...options} onTable={(t) => (instance = t)} />)
  return { view, table: () => instance }
}

describe("localization language", () => {
  it("renders a custom pagination range from the localization", () => {
    mount({
      localization: {
        ...defaultLocalization,
        language: "de",
        paginationRange: (s, e, t) => `${s}–${e} von ${t.toLocaleString("de")}`,
      },
    })
    expect(screen.getByText("1–3 von 3")).toBeTruthy()
  })

  it("formats large counts in the default English pagination", () => {
    const many = Array.from({ length: 1200 }, (_, i) => ({
      id: String(i),
      name: `Person ${i}`,
      active: i % 2 === 0,
    }))
    mount({ data: many, initialState: { pagination: { pageSize: 2000 } } })
    expect(screen.getByText(/1,200/)).toBeTruthy()
  })

  it("uses localization.true / .false in the boolean filter options", async () => {
    const { table } = mount({
      enableAdvancedFilter: true,
      localization: { ...defaultLocalization, true: "Wahr", false: "Falsch" },
      defaultAdvancedFilter: {
        logic: "and",
        rules: [
          {
            id: "r1",
            columnId: "active",
            operator: "equals",
            value: undefined,
          },
        ],
      },
    })
    act(() => table().tableInstance.setShowAdvancedFilterPanel(true))
    const triggers = await screen.findAllByRole("combobox")
    const valueTrigger = triggers[triggers.length - 1]!
    fireEvent.pointerDown(valueTrigger, { button: 0, ctrlKey: false })
    fireEvent.click(valueTrigger)
    expect(await screen.findByRole("option", { name: "Wahr" })).toBeTruthy()
    expect(screen.getByRole("option", { name: "Falsch" })).toBeTruthy()
  })
})
