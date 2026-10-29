import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import { dataTableLocalizationDe } from "../locales/de"
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
    meta: { filterVariant: "checkbox" },
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
  it("formats a date filter value in the localization language", () => {
    const born = new Date(2026, 3, 29)
    mount({
      columns: [
        { accessorKey: "name", header: "Name" },
        {
          id: "born",
          header: "Born",
          accessorFn: () => born,
          meta: { filterVariant: "date" },
        },
      ],
      initialState: {
        showColumnFilters: true,
        columnFilters: [{ id: "born", value: born }],
      },
      localization: { ...defaultLocalization, language: "de" },
    })
    const german = new Intl.DateTimeFormat("de", {
      dateStyle: "medium",
    }).format(born)
    const english = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
    }).format(born)
    expect(german).not.toBe(english)
    expect(screen.getAllByText(german).length).toBeGreaterThan(0)
    expect(screen.queryByText(english)).toBeNull()
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
      initialState: {
        advancedFilter: {
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
      },
    })
    act(() => table().setShowAdvancedFilterPanel(true))
    const triggers = await screen.findAllByRole("combobox")
    const valueTrigger = triggers[triggers.length - 1]!
    fireEvent.pointerDown(valueTrigger, { button: 0, ctrlKey: false })
    fireEvent.click(valueTrigger)
    expect(await screen.findByRole("option", { name: "Wahr" })).toBeTruthy()
    expect(screen.getByRole("option", { name: "Falsch" })).toBeTruthy()
  })

  it("places the All/Any picker where the language puts it", async () => {
    const { table } = mount({
      enableAdvancedFilter: true,
      localization: {
        ...defaultLocalization,
        // Picker first, as in a verb-final language.
        advancedFiltersMatch: (logic) => `${logic} rules must match`,
      },
    })
    act(() => table().setShowAdvancedFilterPanel(true))
    const after = await screen.findByText("rules must match")
    const picker = screen
      .getAllByRole("combobox")
      .find((c) => c.parentElement?.contains(after))!
    expect(picker.textContent).toBe("All")
    // The picker comes before the text in the sentence row.
    expect(
      picker.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(picker.previousElementSibling).toBeNull()
  })

  it("localizes the calendar popup month and weekday names", async () => {
    const born = new Date(2026, 2, 18)
    mount({
      columns: [
        { accessorKey: "name", header: "Name" },
        {
          id: "born",
          header: "Born",
          accessorFn: () => born,
          meta: { filterVariant: "date" },
        },
      ],
      initialState: {
        showColumnFilters: true,
        columnFilters: [{ id: "born", value: born }],
      },
      localization: { ...defaultLocalization, language: "de" },
    })
    const trigger = screen.getByRole("button", { name: "Filter by Born" })
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    fireEvent.click(trigger)
    // The popup opens on the selected date's month.
    const caption = new Intl.DateTimeFormat("de", {
      month: "long",
      year: "numeric",
      calendar: "gregory",
    }).format(born)
    const wednesday = new Intl.DateTimeFormat("de", {
      weekday: "short",
      calendar: "gregory",
    }).format(born)
    expect(wednesday).not.toBe("We")
    expect((await screen.findAllByText(caption)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(wednesday).length).toBeGreaterThan(0)
  })

  it("renders a real locale: German pagination and boolean options", async () => {
    const { table } = mount({
      enableAdvancedFilter: true,
      localization: dataTableLocalizationDe,
      initialState: {
        advancedFilter: {
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
      },
    })
    expect(
      screen.getAllByText(dataTableLocalizationDe.rowsPerPage).length
    ).toBeGreaterThan(0)
    act(() => table().setShowAdvancedFilterPanel(true))
    const triggers = await screen.findAllByRole("combobox")
    const valueTrigger = triggers[triggers.length - 1]!
    fireEvent.pointerDown(valueTrigger, { button: 0, ctrlKey: false })
    fireEvent.click(valueTrigger)
    expect(await screen.findByRole("option", { name: "Wahr" })).toBeTruthy()
    expect(screen.getByRole("option", { name: "Falsch" })).toBeTruthy()
  })
})
