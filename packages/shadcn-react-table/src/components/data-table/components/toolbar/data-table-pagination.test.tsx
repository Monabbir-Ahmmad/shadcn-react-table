import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "../../core/data-table"
import type { DataTableInstance } from "../../core/types"
import { useDataTable } from "../../core/use-data-table"

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

type Row = { id: string; n: number }
const data: Row[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i),
  n: i,
}))

/** A screen as narrow (or wide) as a phone, for `matchMedia`. */
function screenWidth(phone: boolean) {
  const listeners = new Set<() => void>()
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: phone && query.includes("max-width"),
      media: query,
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    }))
  )
}

function Table({ onTable }: { onTable: (t: DataTableInstance<Row>) => void }) {
  const table = useDataTable<Row>({
    data,
    columns: [{ accessorKey: "n", header: "N" }],
    getRowId: (row) => row.id,
  })
  onTable(table)
  return <DataTable table={table} />
}

const sizePicker = () => screen.getByRole("combobox", { name: "Rows per page" })

describe("rows per page", () => {
  it("is the native picker on a phone", () => {
    screenWidth(true)
    let table!: DataTableInstance<Row>
    render(<Table onTable={(t) => (table = t)} />)
    const picker = sizePicker()
    expect(picker.tagName).toBe("SELECT")
    expect((picker as HTMLSelectElement).value).toBe("10")
    act(() => {
      fireEvent.change(picker, { target: { value: "25" } })
    })
    expect(table.getState().pagination.pageSize).toBe(25)
  })

  it("is the styled select on wider screens", () => {
    screenWidth(false)
    render(<Table onTable={() => {}} />)
    expect(sizePicker().tagName).toBe("BUTTON")
  })
})
