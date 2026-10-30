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
const searchBox = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-search"]')
const rowCheckboxes = () => [
  ...document.querySelectorAll<HTMLElement>('tbody [role="checkbox"]'),
]
const searchButton = () => screen.getByRole("button", { name: "Search" })

describe("search box motion", () => {
  it("keeps the search button while the box is open", () => {
    render(<Harness />)
    fireEvent.click(searchButton())
    expect(screen.getByRole("textbox", { name: "Search" })).toBeDefined()
    expect(searchButton().getAttribute("aria-expanded")).toBe("true")
  })

  it("slides the box out of the button", () => {
    render(<Harness />)
    fireEvent.click(searchButton())
    const slide = fakes.find(
      (f) => f.el === searchBox() && "width" in f.keyframes
    )
    expect(slide).toBeDefined()
  })

  it("slides the box back into the button, then unmounts it", async () => {
    render(<Harness />)
    fireEvent.click(searchButton())
    await finishAll()
    fireEvent.click(searchButton())
    // Still there while it slides, out of reach.
    const box = searchBox()!
    expect(box.hasAttribute("inert")).toBe(true)
    expect(searchButton().getAttribute("aria-expanded")).toBe("false")
    await finishAll()
    expect(searchBox()).toBeNull()
  })

  it("comes back if the button is clicked while it slides in", async () => {
    render(<Harness />)
    fireEvent.click(searchButton())
    await finishAll()
    fireEvent.click(searchButton())
    const box = searchBox()!
    fireEvent.click(searchButton())
    await finishAll()
    expect(searchBox()).toBe(box)
    expect(box.hasAttribute("inert")).toBe(false)
  })

  it("drops the search when the button hides the box", () => {
    let table!: DataTableInstance<Row>
    render(<Harness onTable={(t) => (table = t)} />)
    act(() => table.setGlobalFilter("Ada"))
    // A search opens the box.
    expect(searchButton().getAttribute("aria-expanded")).toBe("true")
    fireEvent.click(searchButton())
    expect(table.getState().globalFilter).toBeFalsy()
  })

  it("opens and closes at once with animations off", () => {
    render(<Harness enableAnimations={false} />)
    fireEvent.click(searchButton())
    expect(searchBox()).not.toBeNull()
    fireEvent.click(searchButton())
    expect(searchBox()).toBeNull()
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
  it("never offers the leaving search box to Tab", () => {
    render(<Harness />)
    fireEvent.click(searchButton())
    fireEvent.click(searchButton())
    const box = searchBox()!
    const tabbable = [...document.querySelectorAll(TABBABLE)]
    expect(tabbable.some((el) => box.contains(el))).toBe(false)
    // The button is still offered.
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

  it("opens the search box without motion while a new row is created", () => {
    let table!: DataTableInstance<Row>
    render(<Harness {...editableOptions} onTable={(t) => (table = t)} />)
    act(() => dt(table).beginCreate())
    // The create dialog hides the page from the accessibility tree.
    fireEvent.click(
      document.querySelector<HTMLElement>('button[aria-label="Search"]')!
    )
    expect(searchBox()).not.toBeNull()
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
