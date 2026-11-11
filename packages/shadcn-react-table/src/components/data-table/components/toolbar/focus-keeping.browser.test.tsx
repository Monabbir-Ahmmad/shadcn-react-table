import { cleanup, render, screen } from "@testing-library/react"
import { userEvent } from "vitest/browser"
import { afterEach, describe, expect, it } from "vitest"

import { nextFrame } from "../../../../../test/browser/pointer"
import { DataTable } from "../../core/data-table"
import type { UseDataTableOptions } from "../../core/types"
import { useDataTable } from "../../core/use-data-table"

afterEach(cleanup)

type Person = { id: string; name: string; city: string }

const people: Person[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: `Person ${i + 1}`,
  city: i % 2 ? "Oslo" : "Rome",
}))

function Harness(options: Partial<UseDataTableOptions<Person>>) {
  const table = useDataTable<Person>({
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "city", header: "City" },
    ],
    data: people,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageSize: 5 } },
    ...options,
  })
  return <DataTable table={table} />
}

const focused = () => document.activeElement as HTMLElement | null

describe("focus stays in the table", () => {
  it("moves to Previous when Next reaches the last page", async () => {
    render(<Harness />)
    const next = screen.getByRole("button", { name: "Go to next page" })
    next.focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.keyboard("{Enter}")
    await nextFrame()
    expect(next).toHaveProperty("disabled", true)
    expect(focused()?.getAttribute("aria-label")).toBe("Go to previous page")
  })

  it("moves to Next when First reaches the first page", async () => {
    render(
      <Harness initialState={{ pagination: { pageSize: 5, pageIndex: 2 } }} />
    )
    const first = screen.getByRole("button", { name: "Go to first page" })
    first.focus()
    await userEvent.keyboard("{Enter}")
    await nextFrame()
    expect(focused()?.getAttribute("aria-label")).toBe("Go to next page")
  })

  it.each([["top"], ["head-overlay"]] as const)(
    "moves to select-all after Clear selection (%s banner)",
    async (position) => {
      render(
        <Harness enableRowSelection positionToolbarAlertBanner={position} />
      )
      screen.getAllByRole("checkbox", { name: "Select row" })[0]!.click()
      await nextFrame()
      const clear = screen.getByRole("button", { name: "Clear selection" })
      clear.focus()
      await userEvent.keyboard("{Enter}")
      await nextFrame()
      expect(focused()?.getAttribute("aria-label")).toBe("Select all")
    }
  )

  it("moves to the next column's menu after Hide column", async () => {
    render(<Harness />)
    const nameMenu = screen
      .getByText("Name", { selector: "th *" })
      .closest("th")!
      .querySelector<HTMLElement>('button[aria-label="Column actions"]')!
    nameMenu.focus()
    await userEvent.keyboard("{Enter}")
    await nextFrame()
    await userEvent.click(screen.getByRole("menuitem", { name: "Hide column" }))
    await expect
      .poll(() => focused()?.closest("th")?.textContent ?? "")
      .toContain("City")
    expect(focused()?.getAttribute("aria-label")).toBe("Column actions")
  })

  it("moves back to a column filter's input after clearing it", async () => {
    render(<Harness initialState={{ showColumnFilters: true }} />)
    const input = screen.getByRole("textbox", { name: /filter by name/i })
    await userEvent.type(input, "Person 1")
    const clear = await screen.findByRole("button", { name: "Clear filter" })
    clear.focus()
    await userEvent.keyboard("{Enter}")
    await nextFrame()
    expect(focused()).toBe(input)
    expect((input as HTMLInputElement).value).toBe("")
  })

  it("moves back to a select filter after clearing it", async () => {
    render(
      <Harness
        initialState={{
          showColumnFilters: true,
          columnFilters: [{ id: "city", value: "Oslo" }],
        }}
        columns={[
          { accessorKey: "name", header: "Name" },
          {
            accessorKey: "city",
            header: "City",
            meta: { filterVariant: "select" },
          },
        ]}
      />
    )
    const clear = screen.getByRole("button", { name: "Clear filter" })
    clear.focus()
    await userEvent.keyboard("{Enter}")
    await nextFrame()
    expect(focused()?.getAttribute("role")).toBe("combobox")
  })
})
