import { renderToStaticMarkup } from "react-dom/server"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it } from "vitest"

import { DataTable } from "./data-table"
import { defaultIcons, type DataTableIcons } from "./icons"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.releasePointerCapture = () => {}
})

// Vitest globals are off, so Testing Library does not auto-unmount.
afterEach(cleanup)

type Person = { id: string; name: string }

const people: Person[] = [
  { id: "1", name: "Mason" },
  { id: "2", name: "Lily" },
]

function Harness(options: Partial<UseDataTableOptions<Person>>) {
  const table = useDataTable<Person>({
    columns: [{ accessorKey: "name", header: "Name" }],
    data: people,
    getRowId: (row) => row.id,
    enableColumnPinning: true,
    ...options,
  })
  return <DataTable table={table} />
}

function Marker(name: string) {
  function MarkerIcon({ className }: { className?: string }) {
    return <svg data-icon={name} className={className} />
  }
  return MarkerIcon
}

function openColumnMenu() {
  const trigger = screen.getByRole("button", { name: "Column actions" })
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
  fireEvent.click(trigger)
}

const iconOf = (label: string) =>
  screen
    .getByRole("menuitem", { name: label })
    .querySelector("svg")!
    .cloneNode(true) as SVGElement

describe("directional pin icons", () => {
  it("gives pin left and pin right different icons", () => {
    render(<Harness />)
    openColumnMenu()
    expect(iconOf("Pin to left").outerHTML).not.toBe(
      iconOf("Pin to right").outerHTML
    )
  })

  it("gives every column menu action its own icon", () => {
    render(
      <Harness
        enableGrouping
        enableColumnFilters
        columnFilterDisplayMode="subheader"
      />
    )
    openColumnMenu()
    const svgs = screen
      .getAllByRole("menuitem")
      .map((item) => item.querySelector("svg")?.outerHTML)
    expect(svgs.every(Boolean)).toBe(true)
    expect(new Set(svgs).size).toBe(svgs.length)
  })

  it("falls back to an overridden pin for the new pin slots", () => {
    const icons: Partial<DataTableIcons> = { pin: Marker("custom-pin") }
    render(<Harness icons={icons} />)
    openColumnMenu()
    for (const label of ["Pin to left", "Pin to right"]) {
      const svg = screen
        .getByRole("menuitem", { name: label })
        .querySelector("svg")!
      expect(svg.getAttribute("data-icon")).toBe("custom-pin")
      expect(svg.getAttribute("class") ?? "").not.toContain("rotate")
    }
  })

  it("lets the new keys override the pin fallback", () => {
    const icons: Partial<DataTableIcons> = {
      pin: Marker("custom-pin"),
      pinLeft: Marker("custom-left"),
    }
    render(<Harness icons={icons} />)
    openColumnMenu()
    expect(iconOf("Pin to left").getAttribute("data-icon")).toBe("custom-left")
    expect(iconOf("Pin to right").getAttribute("data-icon")).toBe("custom-pin")
  })

  it("uses the clear sort and clear filter slots", () => {
    const icons: Partial<DataTableIcons> = {
      clearSort: Marker("clear-sort"),
      clearFilter: Marker("clear-filter"),
    }
    render(<Harness icons={icons} columnFilterDisplayMode="subheader" />)
    openColumnMenu()
    expect(iconOf("Clear sort").getAttribute("data-icon")).toBe("clear-sort")
    expect(iconOf("Clear filter").getAttribute("data-icon")).toBe(
      "clear-filter"
    )
  })
})

describe("clear icon fallbacks", () => {
  const openMenu = (icons: Partial<DataTableIcons>) => {
    render(<Harness icons={icons} columnFilterDisplayMode="subheader" />)
    openColumnMenu()
  }

  it("uses an overridden clearAll for clear sort", () => {
    openMenu({ clearAll: Marker("my-clear-all") })
    expect(iconOf("Clear sort").getAttribute("data-icon")).toBe("my-clear-all")
    expect(iconOf("Show all columns").getAttribute("data-icon")).toBe(
      "my-clear-all"
    )
  })

  it("uses an overridden filterOff for clear filter", () => {
    openMenu({ filterOff: Marker("my-filter-off") })
    expect(iconOf("Clear filter").getAttribute("data-icon")).toBe(
      "my-filter-off"
    )
  })

  it("prefers clearSort and clearFilter when both are set", () => {
    openMenu({
      clearAll: Marker("all"),
      clearSort: Marker("sort"),
      filterOff: Marker("off"),
      clearFilter: Marker("filter"),
    })
    expect(iconOf("Clear sort").getAttribute("data-icon")).toBe("sort")
    expect(iconOf("Clear filter").getAttribute("data-icon")).toBe("filter")
  })
})

describe("default pin directions", () => {
  const slots = (names: (keyof DataTableIcons)[]) =>
    names.map((name) => {
      const Icon = defaultIcons[name]
      return renderToStaticMarkup(<Icon />)
    })

  it("points left and right pins into their edges, mirrored", () => {
    const [left, right] = slots(["pinLeft", "pinRight"])
    expect(left).toContain("rotate-90")
    expect(left).not.toContain("-rotate-90")
    expect(right).toContain("-rotate-90")
  })

  it("uses the plain pin for the top and bottom row pins", () => {
    const [top, bottom, pinned, plain] = slots([
      "pinTop",
      "pinBottom",
      "pinnedRow",
      "pin",
    ])
    expect(top).not.toContain("rotate")
    expect(top).toBe(plain)
    expect(bottom).not.toContain("rotate")
    expect(bottom).toBe(plain)
    expect(pinned).toBe(plain)
  })
})

describe("row pin button icon", () => {
  const pinButton = (pinned: boolean) =>
    screen
      .getAllByRole("button", { name: pinned ? "Unpin row" : "Pin row" })[0]!
      .querySelector("svg")!

  it("uses pinTop and pinBottom while unpinned, pinnedRow once pinned", () => {
    const icons: Partial<DataTableIcons> = {
      pinTop: Marker("top"),
      pinBottom: Marker("bottom"),
      pinnedRow: Marker("pinned"),
    }
    const { unmount } = render(
      <Harness icons={icons} enableRowPinning rowPinningDisplayMode="top" />
    )
    expect(pinButton(false).getAttribute("data-icon")).toBe("top")
    unmount()
    render(
      <Harness icons={icons} enableRowPinning rowPinningDisplayMode="bottom" />
    )
    expect(pinButton(false).getAttribute("data-icon")).toBe("bottom")
    fireEvent.click(screen.getAllByRole("button", { name: "Pin row" })[0]!)
    expect(pinButton(true).getAttribute("data-icon")).toBe("pinned")
  })
})
