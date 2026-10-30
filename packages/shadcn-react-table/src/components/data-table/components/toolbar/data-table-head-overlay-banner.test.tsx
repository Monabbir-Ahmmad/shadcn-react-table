import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "../../core/data-table"
import type { DataTableInstance, UseDataTableOptions } from "../../core/types"
import { useDataTable } from "../../core/use-data-table"

type Row = { id: string; name: string }
const data: Row[] = [
  { id: "1", name: "Ada" },
  { id: "2", name: "Alan" },
  { id: "3", name: "Grace" },
]

type Options = Partial<UseDataTableOptions<Row>>

function Harness({
  onTable,
  ...options
}: Options & { onTable?: (table: DataTableInstance<Row>) => void }) {
  const table = useDataTable<Row>({
    data,
    columns: [{ accessorKey: "name", header: "Name" }],
    getRowId: (r) => r.id,
    enableRowSelection: true,
    positionToolbarAlertBanner: "head-overlay",
    enableAnimations: false,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const banners = () =>
  document.querySelectorAll<HTMLElement>(
    '[data-slot="data-table-alert-banner"]'
  )
const overlay = () =>
  document.querySelector<HTMLElement>(
    '[data-slot="data-table-alert-banner"][data-position="head-overlay"]'
  )
const rowCheckboxes = () =>
  screen.getAllByRole("checkbox", { name: "Select row" })

describe('positionToolbarAlertBanner: "head-overlay"', () => {
  it("renders nothing until a row is selected", () => {
    render(<Harness />)
    expect(banners()).toHaveLength(0)
    expect(
      document.querySelector('[data-slot="data-table-alert-banner-anchor"]')
    ).toBeNull()
  })

  it("shows the count over the header, inside the scroll surface", () => {
    render(<Harness />)
    fireEvent.click(rowCheckboxes()[0]!)
    const el = overlay()!
    expect(el).not.toBeNull()
    expect(el.getAttribute("role")).toBe("status")
    expect(el.textContent).toContain("1 of 3 rows selected")
    // In the surface, before the table: nothing in the toolbar's slot.
    const surface = el.closest('[data-slot="data-table-surface"]')!
    expect(surface).not.toBeNull()
    expect(banners()).toHaveLength(1)
    expect(
      el.compareDocumentPosition(surface.querySelector("table")!) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it("updates the count as the selection grows", () => {
    render(<Harness />)
    fireEvent.click(rowCheckboxes()[0]!)
    fireEvent.click(rowCheckboxes()[1]!)
    expect(overlay()!.textContent).toContain("2 of 3 rows selected")
  })

  it("its select-all checkbox toggles every row", () => {
    let table!: DataTableInstance<Row>
    render(<Harness onTable={(t) => (table = t)} />)
    fireEvent.click(rowCheckboxes()[0]!)
    const selectAll =
      overlay()!.querySelector<HTMLElement>('[role="checkbox"]')!
    expect(selectAll.getAttribute("aria-label")).toBe("Select all")
    expect(selectAll.getAttribute("aria-checked")).toBe("mixed")
    fireEvent.click(selectAll)
    expect(Object.keys(table.getState().rowSelection)).toHaveLength(3)
    expect(overlay()!.textContent).toContain("3 of 3 rows selected")
    // Toggling again clears them all, and the banner goes.
    fireEvent.click(overlay()!.querySelector<HTMLElement>('[role="checkbox"]')!)
    expect(Object.keys(table.getState().rowSelection)).toHaveLength(0)
    expect(overlay()).toBeNull()
  })

  it("follows selectAllMode", () => {
    let table!: DataTableInstance<Row>
    render(
      <Harness
        onTable={(t) => (table = t)}
        selectAllMode="all"
        initialState={{ pagination: { pageIndex: 0, pageSize: 2 } }}
      />
    )
    fireEvent.click(rowCheckboxes()[0]!)
    fireEvent.click(overlay()!.querySelector('[role="checkbox"]')!)
    expect(Object.keys(table.getState().rowSelection)).toHaveLength(3)
  })

  it("has no select-all checkbox without select-all", () => {
    render(<Harness enableSelectAll={false} />)
    fireEvent.click(rowCheckboxes()[0]!)
    expect(overlay()!.querySelector('[role="checkbox"]')).toBeNull()
    expect(overlay()!.textContent).toContain("1 of 3 rows selected")
  })

  it("Clear selection clears the selection and removes it", () => {
    let table!: DataTableInstance<Row>
    render(<Harness onTable={(t) => (table = t)} />)
    fireEvent.click(rowCheckboxes()[0]!)
    fireEvent.click(rowCheckboxes()[2]!)
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }))
    expect(table.getState().rowSelection).toEqual({})
    expect(overlay()).toBeNull()
    expect(banners()).toHaveLength(0)
  })

  it("follows a selection set from outside", () => {
    let table!: DataTableInstance<Row>
    render(<Harness onTable={(t) => (table = t)} />)
    act(() => table.setRowSelection({ "2": true }))
    expect(overlay()!.textContent).toContain("1 of 3 rows selected")
  })

  it("is localized", () => {
    render(
      <Harness
        localization={{
          rowsSelected: (n, total) => `${n}/${total} chosen`,
          clearSelection: "Deselect",
          selectAll: "Pick all",
        }}
      />
    )
    fireEvent.click(rowCheckboxes()[0]!)
    expect(overlay()!.textContent).toContain("1/3 chosen")
    expect(
      overlay()!.querySelector('[role="checkbox"]')!.getAttribute("aria-label")
    ).toBe("Pick all")
    expect(screen.getByRole("button", { name: "Deselect" })).toBeTruthy()
  })

  it("renders nothing without a table head", () => {
    render(<Harness enableTableHead={false} />)
    fireEvent.click(rowCheckboxes()[0]!)
    expect(banners()).toHaveLength(0)
  })

  it("steps aside while a header control has focus", () => {
    // The header's tooltips watch their trigger's size.
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    )
    render(<Harness enableSorting />)
    fireEvent.click(rowCheckboxes()[0]!)
    expect(overlay()!.hasAttribute("data-head-focused")).toBe(false)
    const headerButton = screen
      .getByText("Name")
      .closest("th")!
      .querySelector<HTMLElement>("button")!
    act(() => headerButton.focus())
    expect(overlay()!.hasAttribute("data-head-focused")).toBe(true)
    act(() => headerButton.blur())
    expect(overlay()!.hasAttribute("data-head-focused")).toBe(false)
  })

  it("keeps the toolbar banners for the other positions", () => {
    render(<Harness positionToolbarAlertBanner="top" />)
    fireEvent.click(rowCheckboxes()[0]!)
    expect(banners()).toHaveLength(1)
    expect(overlay()).toBeNull()
  })
})
