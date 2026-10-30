import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DataTable } from "../../core/data-table"
import { dt } from "../../core/internal"
import type { DataTableInstance, UseDataTableOptions } from "../../core/types"
import { useDataTable } from "../../core/use-data-table"
import { TABBABLE } from "../../hooks/use-fullscreen-modal"

type Row = { id: string; name: string }
const data: Row[] = [
  { id: "1", name: "Ada" },
  { id: "2", name: "Alan" },
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
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

/** A stubbed `animate` whose animations end only when the test says so. */
type Fake = {
  el: HTMLElement
  keyframes: Keyframe[] | PropertyIndexedKeyframes
  finish: () => void
  cancelled: boolean
}
let fakes: Fake[] = []

beforeEach(() => {
  fakes = []
  HTMLElement.prototype.animate = vi.fn(function (
    this: HTMLElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes
  ) {
    let resolve!: () => void
    let reject!: (e: unknown) => void
    const finished = new Promise<void>((res, rej) => {
      resolve = res
      reject = rej
    })
    const fake: Fake = {
      el: this,
      keyframes,
      finish: () => resolve(),
      cancelled: false,
    }
    fakes.push(fake)
    return {
      finished,
      cancel: () => {
        fake.cancelled = true
        reject(new DOMException("cancelled", "AbortError"))
      },
    }
  }) as never
})

afterEach(() => {
  cleanup()
  delete (HTMLElement.prototype as Partial<HTMLElement>).animate
})

/** Ends every animation started so far, then lets React commit. */
async function finishAll() {
  await act(async () => {
    for (const fake of fakes) fake.finish()
    await Promise.resolve()
  })
}

const banner = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-alert-banner"]')
const zone = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-group-zone"]')
const copies = () =>
  document.querySelectorAll('[data-slot="data-table-glide-copy"]')
const rowCheckboxes = () => [
  ...document.querySelectorAll<HTMLElement>('tbody [role="checkbox"]'),
]
const searchButton = () => screen.getByRole("button", { name: "Search" })

describe("search box motion", () => {
  it("keys the search button and the search box as one item", () => {
    render(<Harness />)
    expect(searchButton().dataset.glideKey).toBe("search")
    fireEvent.click(searchButton())
    const box = screen.getByRole("textbox").closest('[data-slot="input-group"]')
    expect((box as HTMLElement).dataset.glideKey).toBe("search")
  })

  it("grows the box from the button and fades a copy of the button out", async () => {
    render(<Harness />)
    fireEvent.click(searchButton())
    const box = screen
      .getByRole("textbox")
      .closest<HTMLElement>('[data-slot="input-group"]')!
    expect(fakes.some((f) => f.el === box)).toBe(true)
    // The copy is inert and out of the accessibility tree.
    const [copy] = copies()
    expect(copy).toBeDefined()
    expect(copy!.getAttribute("aria-hidden")).toBe("true")
    expect(copy!.hasAttribute("inert")).toBe(true)
    await finishAll()
    expect(copies()).toHaveLength(0)
  })

  it("keeps a copy of the box until it has shrunk into the button", async () => {
    render(<Harness />)
    fireEvent.click(searchButton())
    await finishAll()
    fireEvent.blur(screen.getByRole("textbox"))
    // The button is back at once; the box's copy plays the close.
    expect(searchButton()).toBeDefined()
    expect(copies()).toHaveLength(1)
    expect(copies()[0]!.querySelector("input")).not.toBeNull()
    await finishAll()
    expect(copies()).toHaveLength(0)
  })

  it("opens and closes at once with animations off", () => {
    render(<Harness enableAnimations={false} />)
    fireEvent.click(searchButton())
    fireEvent.blur(screen.getByRole("textbox"))
    expect(copies()).toHaveLength(0)
    expect(HTMLElement.prototype.animate).not.toHaveBeenCalled()
  })
})

describe("selection banner presence", () => {
  it("slides in when the first row is selected", () => {
    render(<Harness enableRowSelection />)
    expect(banner()).toBeNull()
    fireEvent.click(rowCheckboxes()[0]!)
    expect(fakes.some((f) => f.el === banner())).toBe(true)
  })

  it("stays mounted until its exit ends", async () => {
    render(<Harness enableRowSelection />)
    fireEvent.click(rowCheckboxes()[0]!)
    const el = banner()!
    fireEvent.click(rowCheckboxes()[0]!)
    // Still there, fading out, with the count it last showed.
    expect(banner()).toBe(el)
    expect(el.textContent).toMatch(/1/)
    await finishAll()
    expect(banner()).toBeNull()
  })

  it("comes back if a row is selected while it fades out", async () => {
    render(<Harness enableRowSelection />)
    fireEvent.click(rowCheckboxes()[0]!)
    const el = banner()!
    fireEvent.click(rowCheckboxes()[0]!)
    fireEvent.click(rowCheckboxes()[1]!)
    await finishAll()
    expect(banner()).toBe(el)
    expect(el.style.position).toBe("")
  })

  it("unmounts at once with animations off", () => {
    render(<Harness enableRowSelection enableAnimations={false} />)
    fireEvent.click(rowCheckboxes()[0]!)
    expect(banner()).not.toBeNull()
    fireEvent.click(rowCheckboxes()[0]!)
    expect(banner()).toBeNull()
    expect(HTMLElement.prototype.animate).not.toHaveBeenCalled()
  })

  it("does not animate a banner the table starts with", () => {
    render(
      <Harness
        enableRowSelection
        initialState={{ rowSelection: { 1: true } }}
      />
    )
    expect(banner()).not.toBeNull()
    expect(fakes.some((f) => f.el === banner())).toBe(false)
  })
})

describe("group drop zone presence", () => {
  it("slides in and stays mounted until its exit ends", async () => {
    const { rerender } = render(<Harness />)
    expect(zone()).toBeNull()
    rerender(<Harness enableGrouping />)
    const el = zone()!
    expect(el).not.toBeNull()
    expect(fakes.some((f) => f.el === el)).toBe(true)
    rerender(<Harness />)
    expect(zone()).toBe(el)
    await finishAll()
    expect(zone()).toBeNull()
  })

  it("unmounts at once with animations off", () => {
    const { rerender } = render(
      <Harness enableGrouping enableAnimations={false} />
    )
    expect(zone()).not.toBeNull()
    rerender(<Harness enableAnimations={false} />)
    expect(zone()).toBeNull()
    expect(HTMLElement.prototype.animate).not.toHaveBeenCalled()
  })
})

describe("motion copies and focus", () => {
  it("leaves nothing behind when the search box is toggled twice quickly", async () => {
    render(<Harness />)
    fireEvent.click(searchButton())
    const box = screen
      .getByRole("textbox")
      .closest<HTMLElement>('[data-slot="input-group"]')!
    fireEvent.blur(screen.getByRole("textbox"))
    // The first swap's copy (the button) is still there, fading from where
    // it is, beside the box's copy.
    const first = fakes.find(
      (f) => f.el.dataset.slot === "data-table-glide-copy"
    )
    expect(first?.cancelled).toBe(true)
    expect(copies().length).toBeGreaterThan(0)
    fireEvent.click(searchButton())
    await finishAll()
    expect(copies()).toHaveLength(0)
    const live = screen
      .getByRole("textbox")
      .closest<HTMLElement>('[data-slot="input-group"]')!
    expect(live).not.toBe(box)
    expect(live.getAttribute("style")).toBeNull()
    fireEvent.blur(screen.getByRole("textbox"))
    await finishAll()
    expect(searchButton().getAttribute("style")).toBeNull()
    expect(copies()).toHaveLength(0)
  })

  it("never offers a copy's controls to Tab", () => {
    render(<Harness />)
    fireEvent.click(searchButton())
    fireEvent.blur(screen.getByRole("textbox"))
    // The button's copy (from opening) and the box's copy (from closing).
    const held = [...copies()]
    expect(held.some((c) => c.querySelector("input"))).toBe(true)
    const tabbable = [...document.querySelectorAll(TABBABLE)]
    expect(tabbable.length).toBeGreaterThan(0)
    expect(tabbable.some((el) => held.some((c) => c.contains(el)))).toBe(false)
    // The live button is still offered.
    expect(tabbable).toContain(searchButton())
  })

  it("takes the leaving banner out of reach", () => {
    render(<Harness enableRowSelection />)
    fireEvent.click(rowCheckboxes()[0]!)
    fireEvent.click(rowCheckboxes()[0]!)
    const el = banner()!
    expect(el.hasAttribute("inert")).toBe(true)
    expect(el.style.pointerEvents).toBe("none")
    expect(el.style.position).toBe("absolute")
    expect(
      [...document.querySelectorAll(TABBABLE)].some((n) => el.contains(n))
    ).toBe(false)
  })

  it("keeps Tab inside full screen past a leaving banner", () => {
    // jsdom lays nothing out; the trap only counts drawn controls.
    const rects = vi
      .spyOn(Element.prototype, "getClientRects")
      .mockReturnValue([{}] as unknown as DOMRectList)
    // Full screen watches the paper's size.
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    )
    try {
      render(
        <Harness
          enableRowSelection
          positionToolbarAlertBanner="bottom"
          enablePagination={false}
          initialState={{ isFullscreen: true }}
        />
      )
      fireEvent.click(rowCheckboxes()[0]!)
      fireEvent.click(rowCheckboxes()[0]!)
      // The leaving banner's Clear button is last in the DOM…
      const paper = document.querySelector<HTMLElement>(
        '[data-slot="data-table"]'
      )!
      const clear = banner()!.querySelector("button")!
      const all = [
        ...paper.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ),
      ]
      expect(all.at(-1)).toBe(clear)
      // …but Tab wraps from the last control that can take focus.
      const live = [...paper.querySelectorAll<HTMLElement>(TABBABLE)]
      expect(live).not.toContain(clear)
      const last = live.at(-1)!
      last.focus()
      fireEvent.keyDown(last, { key: "Tab" })
      expect(document.activeElement).toBe(live[0])
    } finally {
      rects.mockRestore()
      vi.unstubAllGlobals()
    }
  })

  it("places an item that mounts while a copy is on screen", async () => {
    const { rerender } = render(<Harness enableDensityToggle={false} />)
    fireEvent.click(searchButton())
    expect(copies()).toHaveLength(1)
    rerender(<Harness />)
    const actions = document.querySelector(
      '[data-slot="data-table-toolbar-actions"]'
    )!
    const labels = () =>
      [...actions.children]
        .filter(
          (el) => el.getAttribute("data-slot") !== "data-table-glide-copy"
        )
        .map(
          (el) =>
            el.getAttribute("aria-label") ??
            el.getAttribute("data-slot") ??
            el.tagName
        )
    const order = labels()
    const density = order.findIndex((l) => l.startsWith("Toggle density"))
    const fullscreen = order.indexOf("Enter full screen")
    expect(density).toBeGreaterThan(-1)
    expect(fullscreen).toBe(density + 1)
    expect(fullscreen).toBe(order.length - 1)
    await finishAll()
    expect(copies()).toHaveLength(0)
    expect(labels()).toEqual(order)
  })
})

describe("motion while editing", () => {
  const editableOptions: Options = {
    enableRowSelection: true,
    enableEditing: true,
    editDisplayMode: "cell",
  }

  it("shows and hides the banner at once while a cell is edited", () => {
    let table!: DataTableInstance<Row>
    render(<Harness {...editableOptions} onTable={(t) => (table = t)} />)
    act(() => dt(table).setEditingCell({ rowId: "1", columnId: "name" }))
    fireEvent.click(rowCheckboxes()[1]!)
    expect(banner()).not.toBeNull()
    fireEvent.click(rowCheckboxes()[1]!)
    expect(banner()).toBeNull()
    expect(HTMLElement.prototype.animate).not.toHaveBeenCalled()
  })

  it("swaps the search box without motion while a new row is created", () => {
    let table!: DataTableInstance<Row>
    render(<Harness {...editableOptions} onTable={(t) => (table = t)} />)
    act(() => dt(table).beginCreate())
    // The create dialog hides the page from the accessibility tree.
    fireEvent.click(
      document.querySelector<HTMLElement>('button[aria-label="Search"]')!
    )
    expect(copies()).toHaveLength(0)
    expect(HTMLElement.prototype.animate).not.toHaveBeenCalled()
  })

  it("shows the drop zone at once while a cell is edited", () => {
    let table!: DataTableInstance<Row>
    const { rerender } = render(
      <Harness {...editableOptions} onTable={(t) => (table = t)} />
    )
    act(() => dt(table).setEditingCell({ rowId: "1", columnId: "name" }))
    rerender(<Harness {...editableOptions} enableGrouping />)
    expect(zone()).not.toBeNull()
    rerender(<Harness {...editableOptions} />)
    expect(zone()).toBeNull()
    expect(HTMLElement.prototype.animate).not.toHaveBeenCalled()
  })
})
