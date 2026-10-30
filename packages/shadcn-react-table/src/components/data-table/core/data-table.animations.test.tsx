import type * as React from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "./data-table"
import type { UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

type Row = { id: string; name: string }
const data: Row[] = [
  { id: "1", name: "Ada" },
  { id: "2", name: "Alan" },
]

function Harness({
  enableAnimations,
  style,
}: {
  enableAnimations?: boolean
  style?: React.CSSProperties
}) {
  const table = useDataTable<Row>({
    data,
    columns: [{ accessorKey: "name", header: "Name" }],
    getRowId: (r) => r.id,
    enableAnimations,
  })
  return <DataTable table={table} style={style} />
}

const root = () => document.querySelector('[data-slot="data-table"]')!
const layer = () =>
  document.querySelector('[data-slot="data-table-motion-layer"]')

describe("enableAnimations", () => {
  it("is on by default", () => {
    render(<Harness />)
    expect(root().hasAttribute("data-animations")).toBe(true)
    expect(layer()).not.toBeNull()
    const surface = document.querySelector('[data-slot="data-table-surface"]')!
    expect(surface.contains(layer())).toBe(true)
  })

  it("lets the consumer retime the motion", () => {
    render(
      <Harness
        style={{ "--dt-motion-duration": "500ms" } as React.CSSProperties}
      />
    )
    expect(
      (root() as HTMLElement).style.getPropertyValue("--dt-motion-duration")
    ).toBe("500ms")
  })

  it("can be turned off", () => {
    render(<Harness enableAnimations={false} />)
    expect(root().hasAttribute("data-animations")).toBe(false)
    expect(layer()).toBeNull()
  })

  it("is off when the user prefers reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    }))
    render(<Harness />)
    expect(root().hasAttribute("data-animations")).toBe(false)
    expect(layer()).toBeNull()
  })
})

function ControlsHarness({
  enableAnimations,
  icons,
}: {
  enableAnimations?: boolean
  icons?: UseDataTableOptions<Row>["icons"]
}) {
  const table = useDataTable<Row>({
    data: [...data, { id: "3", name: "Grace" }],
    columns: [{ accessorKey: "name", header: "Name" }],
    getRowId: (r) => r.id,
    enableRowSelection: true,
    enableAnimations,
    icons,
  })
  return <DataTable table={table} />
}

const sortButton = () =>
  document.querySelector<HTMLElement>("th button[data-sorted]")!
const indicator = () =>
  document.querySelector<HTMLElement>(
    '[data-slot="data-table-sort-indicator"]'
  )!
const rowCheckboxes = () => [
  ...document.querySelectorAll<HTMLElement>('tbody [role="checkbox"]'),
]
/** Calls of a stubbed `animate` made on the selected count. */
const countCalls = (animate: ReturnType<typeof vi.fn>) =>
  animate.mock.contexts.filter(
    (el) => (el as HTMLElement).dataset?.slot === "data-table-selected-count"
  )
const selectedCount = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-selected-count"]')

describe("sort indicator", () => {
  it("rotates the default arrow for a descending sort", () => {
    render(<ControlsHarness />)
    expect(indicator().dataset.direction).toBe("none")
    fireEvent.click(sortButton())
    expect(indicator().dataset.direction).toBe("asc")
    expect(indicator().querySelector("svg.rotate-180")).toBeNull()
    fireEvent.click(sortButton())
    expect(indicator().dataset.direction).toBe("desc")
    expect(indicator().querySelector("svg.rotate-180")).not.toBeNull()
  })

  it("scales the hidden layers down as they fade", () => {
    render(<ControlsHarness />)
    fireEvent.click(sortButton())
    const layers = [...indicator().children] as HTMLElement[]
    const hidden = layers.filter((el) => !("shown" in el.dataset))
    const shown = layers.filter((el) => "shown" in el.dataset)
    expect(hidden.length).toBeGreaterThan(0)
    for (const el of hidden) expect(el.classList).toContain("scale-75")
    for (const el of shown) expect(el.classList).toContain("scale-100")
    expect(shown[0]!.className).toMatch(/transition-\[[^\]]*scale/)
  })

  it("keeps the arrow turned while it fades out, then shows it unturned", () => {
    render(<ControlsHarness />)
    // The default arrow: the layer after the unsorted icon.
    const arrow = () => indicator().children[1]!.querySelector("svg")!
    fireEvent.click(sortButton()) // asc
    fireEvent.click(sortButton()) // desc
    expect(arrow().classList).toContain("rotate-180")
    fireEvent.click(sortButton()) // none: only fades, no turn back
    expect(indicator().dataset.direction).toBe("none")
    expect(arrow().classList).toContain("rotate-180")
    fireEvent.click(sortButton()) // asc again: hidden until now, so it takes
    // its new turn at once rather than turning while it fades in.
    expect(indicator().dataset.direction).toBe("asc")
    expect(arrow().classList).not.toContain("rotate-180")
    expect(arrow().getAttribute("class")).not.toMatch(/transition-\[rotate\]/)
    fireEvent.click(sortButton()) // desc: shown, so it turns
    expect(arrow().getAttribute("class")).toMatch(/transition-\[rotate\]/)
  })

  it("never rotates custom sort icons", () => {
    const Up = ({ className }: { className?: string }) => (
      <svg data-testid="up" className={className} />
    )
    const Down = ({ className }: { className?: string }) => (
      <svg data-testid="down" className={className} />
    )
    render(
      <ControlsHarness icons={{ sortAscending: Up, sortDescending: Down }} />
    )
    fireEvent.click(sortButton())
    fireEvent.click(sortButton())
    expect(indicator().dataset.direction).toBe("desc")
    expect(indicator().querySelector(".rotate-180")).toBeNull()
    expect(screen.getByTestId("down").closest("[data-shown]")).not.toBeNull()
    expect(screen.getByTestId("up").closest("[data-shown]")).toBeNull()
  })

  it("is static with animations off", () => {
    render(<ControlsHarness enableAnimations={false} />)
    expect(root().hasAttribute("data-animations")).toBe(false)
    expect(indicator().dataset.direction).toBe("none")
    expect(indicator().querySelector(".lucide-chevrons-up-down")).not.toBeNull()
  })
})

describe("selected count", () => {
  it("keeps one count element and updates its text", () => {
    render(<ControlsHarness />)
    expect(selectedCount()).toBeNull()
    fireEvent.click(rowCheckboxes()[0]!)
    const first = selectedCount()
    const was = first!.textContent
    fireEvent.click(rowCheckboxes()[1]!)
    expect(selectedCount()).toBe(first)
    expect(first!.textContent).not.toBe(was)
  })

  it("animates only a change, never the banner appearing", () => {
    const animate = vi.fn(() => ({ finished: new Promise(() => {}) }))
    HTMLElement.prototype.animate = animate as never
    try {
      render(<ControlsHarness />)
      fireEvent.click(rowCheckboxes()[0]!)
      expect(countCalls(animate)).toHaveLength(0)
      fireEvent.click(rowCheckboxes()[1]!)
      expect(countCalls(animate)).toEqual([selectedCount()])
    } finally {
      delete (HTMLElement.prototype as Partial<HTMLElement>).animate
    }
  })

  it("never animates with animations off", () => {
    const animate = vi.fn(() => ({ finished: new Promise(() => {}) }))
    HTMLElement.prototype.animate = animate as never
    try {
      render(<ControlsHarness enableAnimations={false} />)
      fireEvent.click(rowCheckboxes()[0]!)
      fireEvent.click(rowCheckboxes()[1]!)
      expect(selectedCount()).not.toBeNull()
      expect(countCalls(animate)).toHaveLength(0)
    } finally {
      delete (HTMLElement.prototype as Partial<HTMLElement>).animate
    }
  })
})
