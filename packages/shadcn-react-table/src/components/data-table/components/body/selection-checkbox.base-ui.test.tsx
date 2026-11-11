import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "../../core/data-table"
import { useDataTable } from "../../core/use-data-table"

// A checkbox shaped like shadcn's Base UI one: a <span role="checkbox">, a
// boolean `checked` and a separate `indeterminate` prop.
vi.mock("@workspace/ui/components/checkbox", () => ({
  Checkbox: ({
    checked,
    indeterminate,
    ...props
  }: React.ComponentProps<"span"> & {
    checked?: unknown
    indeterminate?: unknown
  }) => (
    <span
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked === true}
      data-checked-prop={String(checked)}
      data-indeterminate-prop={String(indeterminate)}
      {...props}
    />
  ),
}))

afterEach(cleanup)

type Person = { id: string; name: string }

function Harness() {
  const table = useDataTable<Person>({
    columns: [{ accessorKey: "name", header: "Name" }],
    data: ["A", "B", "C"].map((name, i) => ({ id: String(i), name })),
    getRowId: (row) => row.id,
    enableRowSelection: true,
  })
  return <DataTable table={table} />
}

describe("selection checkbox on a Base UI shadcn setup", () => {
  it("passes partly checked as `indeterminate`, with a boolean `checked`", () => {
    render(<Harness />)
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]!)
    const selectAll = screen.getByRole("checkbox", { name: "Select all" })
    expect(selectAll.dataset.indeterminateProp).toBe("true")
    expect(selectAll.dataset.checkedProp).toBe("false")
    expect(selectAll.getAttribute("aria-checked")).toBe("mixed")
  })

  it("still selects with a click and reports it as checked", () => {
    render(<Harness />)
    const box = screen.getAllByRole("checkbox", { name: "Select row" })[1]!
    fireEvent.click(box)
    expect(box.dataset.checkedProp).toBe("true")
    expect(box.dataset.indeterminateProp).toBe("false")
  })
})
