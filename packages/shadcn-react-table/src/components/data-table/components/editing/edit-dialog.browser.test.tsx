import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { userEvent } from "vitest/browser"
import { afterEach, describe, expect, it } from "vitest"

import { nextFrame } from "../../../../../test/browser/pointer"
import { DataTable } from "../../core/data-table"
import { useDataTable } from "../../core/use-data-table"

afterEach(cleanup)

type Person = { id: string; name: string; city: string }

function Harness() {
  const table = useDataTable<Person>({
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "city", header: "City" },
    ],
    data: [{ id: "1", name: "Mason", city: "Oslo" }],
    getRowId: (row) => row.id,
    enableEditing: true,
    editDisplayMode: "modal",
  })
  return <DataTable table={table} />
}

/** Opens the edit dialog and waits for it to settle. */
async function openDialog() {
  render(<Harness />)
  fireEvent.click(screen.getByRole("button", { name: "Edit" }))
  await nextFrame()
  await nextFrame()
}

/** A press on the backdrop, well away from the dialog. */
const pressOutside = () =>
  userEvent.click(document.querySelector('[data-slot="dialog-overlay"]')!, {
    position: { x: 5, y: 5 },
  })

describe("edit dialog outside press", () => {
  it("closes the dialog while nothing has changed", async () => {
    await openDialog()
    await pressOutside()
    await expect.poll(() => screen.queryByRole("dialog")).toBeNull()
  })

  it("keeps the dialog and its changes once something has changed", async () => {
    await openDialog()
    fireEvent.change(screen.getByDisplayValue("Oslo"), {
      target: { value: "Bergen" },
    })
    await pressOutside()
    await nextFrame()
    expect(screen.getByRole("dialog")).toBeTruthy()
    expect(screen.getByDisplayValue("Bergen")).toBeTruthy()
  })
})
