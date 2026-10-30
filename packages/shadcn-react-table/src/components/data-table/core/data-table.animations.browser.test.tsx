import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { cdp } from "vitest/browser"

import { nextFrame } from "../../../../test/browser/pointer"
import { DataTable } from "./data-table"
import { MOTION_DEFAULTS } from "./motion"
import type { DataTableInstance, UseDataTableOptions } from "./types"
import { useDataTable } from "./use-data-table"

afterEach(cleanup)

type Row = { id: string; name: string; n: number }

const rows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `r${i}`,
    name: `Name ${i}`,
    // Out of order either way: 0, 5, 2, 7, 4, 1, 6, 3, …
    n: (i * 5) % count,
  }))

function Harness({
  data = rows(8),
  onTable,
  ...options
}: Partial<UseDataTableOptions<Row>> & {
  data?: Row[]
  onTable?: (table: DataTableInstance<Row>) => void
}) {
  const table = useDataTable<Row>({
    data,
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "n", header: "N" },
    ],
    getRowId: (row) => row.id,
    enablePagination: false,
    ...options,
  })
  onTable?.(table)
  return <DataTable table={table} />
}

/** Data rows of the table (never the leave copies in the motion layer). */
const bodyRows = () => [
  ...document.querySelectorAll<HTMLTableRowElement>(
    '[data-slot="table-container"] > table > tbody > tr[data-row-id]'
  ),
]

const running = () =>
  bodyRows().filter((tr) => tr.getAnimations().length > 0).length

const layer = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-motion-layer"]')

const surface = () =>
  document.querySelector<HTMLElement>('[data-slot="data-table-surface"]')!

/** Lets every running animation on the page finish. */
const settle = () =>
  Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {})))

const findRow = (key: string) =>
  bodyRows().find((tr) => tr.dataset.rowId === key)

const expandButton = (key: string) =>
  findRow(key)!.querySelector<HTMLElement>("button[aria-expanded]")!

/** An 80px tall detail panel. */
const detailPanel = ({ row }: { row: { id: string } }) => (
  <div style={{ height: 80 }}>Detail {row.id}</div>
)

/** The element's animations that animate `prop`. */
const animating = (el: Element, prop: string) =>
  el
    .getAnimations()
    .filter((a) =>
      (a.effect as KeyframeEffect).getKeyframes().some((k) => prop in k)
    )

const timing = (a: Animation) => a.effect!.getTiming()

describe("row animations", () => {
  it("marks rows and detail panels with their keys", () => {
    render(
      <Harness
        renderDetailPanel={({ row }) => <span>detail {row.id}</span>}
        initialState={{ expanded: { r1: true } }}
      />
    )
    expect(bodyRows().map((tr) => tr.dataset.rowId)).toEqual([
      "r0",
      "r1",
      "r1:detail",
      "r2",
      "r3",
      "r4",
      "r5",
      "r6",
      "r7",
    ])
    const detail = bodyRows()[2]!
    expect(detail.dataset.rowKind).toBe("detail")
  })

  it("glides rows when sorting", async () => {
    render(<Harness />)
    await nextFrame()
    const sortN = document.querySelectorAll<HTMLElement>(
      "th button[data-sorted]"
    )[1]!
    const order = () => bodyRows().map((tr) => tr.dataset.rowId)
    const before = order()
    fireEvent.click(sortN)
    expect(order()).not.toEqual(before)
    // Every moved row glides from where it was.
    const moved = bodyRows().filter((tr, i) => tr.dataset.rowId !== before[i])
    expect(moved.length).toBeGreaterThan(0)
    expect(running()).toBe(moved.length)
    const anim = moved[0]!.getAnimations()[0]!
    const first = (anim.effect as KeyframeEffect).getKeyframes()[0]!
    expect(String(first.transform)).toMatch(/translateY\(\d+(\.\d+)?px\)/)
  })

  it("keeps a gliding row's bottom border", async () => {
    render(<Harness />)
    await nextFrame()
    const before = bodyRows().map((tr) => tr.dataset.rowId)
    const color = getComputedStyle(bodyRows()[0]!).borderBottomColor
    fireEvent.click(
      document.querySelectorAll<HTMLElement>("th button[data-sorted]")[1]!
    )
    // The table draws the row borders where the rows are laid out, under the
    // cells, so a moving row draws its own while it glides.
    const moved = bodyRows().filter(
      (tr, i) =>
        tr.dataset.rowId !== before[i] &&
        getComputedStyle(tr).borderBottomWidth !== "0px"
    )
    expect(moved.length).toBeGreaterThan(0)
    for (const tr of moved) {
      for (const cell of tr.cells) {
        const line = animating(cell, "boxShadow")
        expect(line.length).toBe(1)
        const frame = (line[0]!.effect as KeyframeEffect).getKeyframes()[0]!
        expect(String(frame.boxShadow)).toContain(color)
        expect(getComputedStyle(cell).boxShadow).toMatch(
          /0px -1px 0px 0px inset/
        )
      }
      // The table's own border stays where the row is laid out: cleared.
      expect(getComputedStyle(tr).borderBottomColor).toBe("rgba(0, 0, 0, 0)")
    }
    await settle()
    const [tr] = moved
    expect(getComputedStyle(tr!).borderBottomColor).toBe(color)
    for (const cell of tr!.cells) {
      expect(getComputedStyle(cell).boxShadow).toBe("none")
    }
  })

  it("reads every border before it starts any animation", async () => {
    render(<Harness />)
    await nextFrame()
    // A read after a write forces another style pass: all reads of the
    // rows and cells come first. (The root's once-per-commit direction check
    // on the surface is not the hook's.)
    const calls: string[] = []
    const realRead = window.getComputedStyle.bind(window)
    const realAnimate = Element.prototype.animate
    const spyRead = vi
      .spyOn(window, "getComputedStyle")
      .mockImplementation((el, pseudo) => {
        if (el.closest("table")) calls.push("read")
        return realRead(el, pseudo)
      })
    const spyAnimate = vi
      .spyOn(Element.prototype, "animate")
      .mockImplementation(function (this: Element, ...args) {
        calls.push("write")
        return realAnimate.apply(this, args)
      })
    try {
      fireEvent.click(
        document.querySelectorAll<HTMLElement>("th button[data-sorted]")[1]!
      )
    } finally {
      spyRead.mockRestore()
      spyAnimate.mockRestore()
    }
    const firstWrite = calls.indexOf("write")
    expect(firstWrite).toBeGreaterThan(0)
    expect(calls.lastIndexOf("read")).toBeLessThan(firstWrite)
  })

  it("draws no per-cell lines when very many rows glide", async () => {
    const data = Array.from({ length: 150 }, (_, i) => ({
      id: `r${i}`,
      name: `Name ${i}`,
      n: i,
    }))
    let table!: DataTableInstance<Row>
    render(<Harness data={data} onTable={(t) => (table = t)} />)
    await nextFrame()
    act(() => table.setSorting([{ id: "n", desc: true }]))
    const moved = bodyRows().filter((tr) => animating(tr, "transform").length)
    expect(moved.length).toBeGreaterThan(100)
    for (const tr of moved) {
      // The table's border is still cleared, so no stray line crosses rows.
      expect(animating(tr, "borderBottomColor").length).toBe(1)
      for (const cell of tr.cells) {
        expect(animating(cell, "boxShadow").length).toBe(0)
      }
    }
  })

  it("drops the previous change's leave copies when a new change starts", async () => {
    let table!: DataTableInstance<Row>
    render(<Harness onTable={(t) => (table = t)} />)
    await nextFrame()
    act(() => table.setGlobalFilter("Name 1"))
    expect(layer()!.children.length).toBe(7)
    act(() => table.setGlobalFilter(""))
    // The copies would fade over the new layout: gone at once.
    expect(layer()!.children.length).toBe(0)
  })

  it("does nothing when turned off", async () => {
    render(<Harness enableAnimations={false} />)
    await nextFrame()
    expect(layer()).toBeNull()
    fireEvent.click(
      document.querySelectorAll<HTMLElement>("th button[data-sorted]")[1]!
    )
    expect(running()).toBe(0)
  })

  it("does not animate rows that scroll into view", async () => {
    let table!: DataTableInstance<Row>
    render(
      <Harness
        data={rows(2000)}
        enableRowVirtualization
        renderDetailPanel={({ row }) => <span>detail {row.id}</span>}
        onTable={(t) => (table = t)}
      />
    )
    await nextFrame()
    // Per-row work: listing the row keys checks every row's expansion.
    const rowPrototype = Object.getPrototypeOf(table.getRowModel().rows[0])
    const getIsExpanded = vi.spyOn(rowPrototype, "getIsExpanded")
    const before = bodyRows()[0]!.dataset.rowId
    for (const top of [4000, 8000, 12000]) {
      surface().scrollTop = top
      await nextFrame()
      await nextFrame()
    }
    expect(bodyRows()[0]!.dataset.rowId).not.toBe(before)
    expect(running()).toBe(0)
    expect(layer()!.children.length).toBe(0)
    // Scrolling never lists the 2,000 rows.
    expect(getIsExpanded.mock.calls.length).toBeLessThan(500)
    getIsExpanded.mockRestore()
  })

  it("glides only the drawn rows of a virtualized table", async () => {
    let table!: DataTableInstance<Row>
    render(
      <Harness
        data={rows(2000)}
        enableRowVirtualization
        onTable={(t) => (table = t)}
      />
    )
    await nextFrame()
    act(() => table.setSorting([{ id: "n", desc: false }]))
    const drawn = bodyRows().length
    expect(drawn).toBeLessThan(100)
    // Rows drawn before and after glide (r1 moves from index 1 to 5); rows
    // new to the window fade in (see below).
    expect(running()).toBeGreaterThan(0)
    expect(running()).toBeLessThanOrEqual(drawn)
    const r1 = bodyRows().find((tr) => tr.dataset.rowId === "r1")!
    expect(animating(r1, "transform").length).toBe(1)
  })

  it("fades in rows that a sort brings into a virtual window", async () => {
    let table!: DataTableInstance<Row>
    render(
      <Harness
        data={rows(2000)}
        enableRowVirtualization
        onTable={(t) => (table = t)}
      />
    )
    await nextFrame()
    const before = new Set(bodyRows().map((tr) => tr.dataset.rowId))
    act(() => table.setSorting([{ id: "n", desc: false }]))
    const arrived = bodyRows().filter((tr) => !before.has(tr.dataset.rowId))
    expect(arrived.length).toBeGreaterThan(0)
    for (const tr of arrived) {
      const fade = animating(tr, "opacity")
      expect(fade).toHaveLength(1)
      const first = (fade[0]!.effect as KeyframeEffect).getKeyframes()[0]!
      expect(Number(first.opacity)).toBe(0)
      // The rows they replace are gone at once (still in the data, so no
      // copies to wait for): no delay, or the window shows a gap.
      expect(timing(fade[0]!).delay).toBe(0)
    }
    // Nothing left the data, so no copies.
    expect(layer()!.children.length).toBe(0)
  })

  it("glides a row into the top pinned group and back", async () => {
    let table!: DataTableInstance<Row>
    render(<Harness onTable={(t) => (table = t)} enableRowPinning />)
    await nextFrame()
    const row = () => bodyRows().find((tr) => tr.dataset.rowId === "r5")!
    act(() => table.getRow("r5").pin("top"))
    expect(row().closest("tbody")!.dataset.pinnedRows).toBe("top")
    expect(animating(row(), "transform").length).toBe(1)
    // The rows above it make room by gliding down (the rows below may
    // shift by the pinned group's border too).
    expect(running()).toBeGreaterThanOrEqual(6)
    await settle()
    expect(running()).toBe(0)

    act(() => table.getRow("r5").pin(false))
    expect(row().closest("tbody")!.dataset.pinnedRows).toBeUndefined()
    expect(animating(row(), "transform").length).toBe(1)
    await settle()
    expect(running()).toBe(0)
    expect(layer()!.children.length).toBe(0)
  })

  it("just updates when far too many rows are drawn", async () => {
    let table!: DataTableInstance<Row>
    render(<Harness data={rows(1000)} onTable={(t) => (table = t)} />)
    await nextFrame()
    act(() => table.setSorting([{ id: "n", desc: false }]))
    expect(running()).toBe(0)
  })

  it("drops the motion in flight when animations turn off", async () => {
    let table!: DataTableInstance<Row>
    const { rerender } = render(<Harness onTable={(t) => (table = t)} />)
    await nextFrame()
    act(() => table.setGlobalFilter("Name 1"))
    expect(layer()!.children.length).toBeGreaterThan(0)
    act(() => table.setGlobalFilter(""))
    expect(running()).toBeGreaterThan(0)
    rerender(<Harness onTable={(t) => (table = t)} enableAnimations={false} />)
    expect(running()).toBe(0)
    expect(document.querySelector('[data-slot="data-table-leave-copy"]')).toBe(
      null
    )
  })

  it("fades out rows that leave and removes the copies", async () => {
    let table!: DataTableInstance<Row>
    render(<Harness onTable={(t) => (table = t)} />)
    await nextFrame()
    act(() => table.setGlobalFilter("Name 1"))
    expect(bodyRows().map((tr) => tr.dataset.rowId)).toEqual(["r1"])
    const ghosts = layer()!.children
    expect(ghosts.length).toBe(7)
    // The copies are inert, and carry no cell or row keys that grid
    // navigation or the planner could pick up.
    const ghost = ghosts[0] as HTMLElement
    expect(ghost.inert).toBe(true)
    expect(ghost.querySelector("[data-cell-row], [data-row-id]")).toBeNull()
    expect(screen.queryAllByRole("row").length).toBe(2)
    await waitFor(() => expect(layer()!.children.length).toBe(0), {
      timeout: 2000,
    })
  })

  it("draws a leave copy where the row was, in a scrolled surface", async () => {
    const data = rows(60)
    const slotProps = { surface: { style: { maxHeight: 240 } } }
    const { rerender } = render(<Harness data={data} slotProps={slotProps} />)
    await nextFrame()
    surface().scrollTop = 300
    await nextFrame()
    const leaving = bodyRows().find((tr) => tr.dataset.rowId === "r9")!
    const was = leaving.getBoundingClientRect()
    rerender(
      <Harness
        data={data.filter((row) => row.id !== "r9")}
        slotProps={slotProps}
      />
    )
    expect(surface().scrollTop).toBe(300)
    const ghost = [...layer()!.querySelectorAll("tr")].find((tr) =>
      tr.textContent?.startsWith("Name 9")
    )!
    const now = ghost.getBoundingClientRect()
    expect(Math.abs(now.top - was.top)).toBeLessThan(1)
    expect(Math.abs(now.left - was.left)).toBeLessThan(1)
    expect(Math.abs(now.height - was.height)).toBeLessThan(1)
  })

  it("does not jump the scroll when the copies are removed", async () => {
    const data = rows(60)
    const slotProps = { surface: { style: { maxHeight: 240 } } }
    const { rerender } = render(<Harness data={data} slotProps={slotProps} />)
    await nextFrame()
    // Scrolled to the bottom, the last 20 rows leave: the content shrinks.
    surface().scrollTop = surface().scrollHeight
    await nextFrame()
    rerender(<Harness data={data.slice(0, 40)} slotProps={slotProps} />)
    expect(layer()!.children.length).toBeGreaterThan(0)
    // The copies never extend the scroll area, so the browser clamps the
    // scroll with the change, not when the copies go 160 ms later.
    const table = document.querySelector('[data-slot="table-container"]')!
    expect(surface().scrollHeight).toBeLessThanOrEqual(
      Math.ceil(table.getBoundingClientRect().height) + 1
    )
    const after = surface().scrollTop
    await settle()
    await nextFrame()
    expect(layer()!.children.length).toBe(0)
    expect(surface().scrollTop).toBe(after)
  })

  it("fades in rows that enter the data", async () => {
    let table!: DataTableInstance<Row>
    render(
      <Harness
        onTable={(t) => (table = t)}
        initialState={{ globalFilter: "Name 1" }}
      />
    )
    await nextFrame()
    act(() => table.setGlobalFilter(""))
    const entered = bodyRows().find((tr) => tr.dataset.rowId === "r3")!
    const anim = entered.getAnimations()[0]!
    const first = (anim.effect as KeyframeEffect).getKeyframes()[0]!
    expect(Number(first.opacity)).toBe(0)
  })

  it("raises gliding rows over the rows they cross, farthest on top", async () => {
    let table!: DataTableInstance<Row>
    render(<Harness data={rows(12)} onTable={(t) => (table = t)} />)
    await nextFrame()
    act(() => table.setSorting([{ id: "n", desc: false }]))
    const moved = bodyRows().filter((tr) => animating(tr, "transform").length)
    expect(moved.length).toBeGreaterThan(2)
    // How far it glides: the start offset of its glide.
    const distance = (tr: HTMLTableRowElement) => {
      const glide = animating(tr, "transform")[0]!
      const from = (glide.effect as KeyframeEffect).getKeyframes()[0]!
      return Math.abs(parseFloat(String(from.transform).slice(11)))
    }
    const z = (tr: HTMLTableRowElement) => Number(getComputedStyle(tr).zIndex)
    for (const tr of moved) {
      expect(getComputedStyle(tr).position).toBe("relative")
      // Above pinned cells (z 2) of the rows it crosses, under the pinned
      // row groups (z 10) and the sticky header (z 20).
      expect(z(tr)).toBeGreaterThanOrEqual(3)
      expect(z(tr)).toBeLessThan(10)
    }
    const byDistance = [...moved].sort((a, b) => distance(a) - distance(b))
    for (let i = 1; i < byDistance.length; i++) {
      expect(z(byDistance[i]!)).toBeGreaterThanOrEqual(z(byDistance[i - 1]!))
    }
    expect(z(byDistance.at(-1)!)).toBeGreaterThan(z(byDistance[0]!))
    await settle()
    for (const tr of moved) {
      expect(getComputedStyle(tr).position).toBe("static")
      expect(getComputedStyle(tr).zIndex).toBe("auto")
    }
  })

  it("keeps pinned columns and rows in place while rows glide", async () => {
    let table!: DataTableInstance<Row>
    render(
      <div style={{ width: 300 }}>
        <Harness
          data={rows(40)}
          onTable={(t) => (table = t)}
          enableColumnPinning
          enableColumnResizing
          enableRowPinning
          initialState={{
            columnPinning: { left: ["name"] },
            rowPinning: { top: ["r0"], bottom: [] },
          }}
          defaultColumn={{ size: 400 }}
          // Scroll anchoring would follow a reordered row and move the
          // scroll during the sort; keep it still to look at the glide alone.
          slotProps={{
            surface: { style: { maxHeight: 240, overflowAnchor: "none" } },
          }}
        />
      </div>
    )
    await nextFrame()
    surface().scrollLeft = 200
    surface().scrollTop = 300
    await nextFrame()
    // Stuck under the header (scrolled past its place in the table).
    const stuck = findRow("r0")!.getBoundingClientRect().top
    act(() => table.setSorting([{ id: "n", desc: true }]))
    expect(surface().scrollTop).toBe(300)
    // Halfway through the glide.
    for (const a of document.getAnimations()) {
      a.pause()
      a.currentTime = MOTION_DEFAULTS.duration / 2
    }
    expect(running()).toBeGreaterThan(0)
    const nameCell = (tr: HTMLTableRowElement) =>
      [...tr.cells].find((td) => td.textContent?.startsWith("Name"))!
    const pinned = findRow("r0")!
    const pinnedLeft = nameCell(pinned).getBoundingClientRect().left
    // The surface is scrolled sideways, yet the pinned column stays on screen.
    expect(pinnedLeft).toBeLessThan(surface().getBoundingClientRect().left + 80)
    // Pinned column: every gliding row's name cell stays in it.
    const gliding = bodyRows().filter((tr) => animating(tr, "transform").length)
    expect(gliding.length).toBeGreaterThan(0)
    for (const tr of gliding) {
      const left = nameCell(tr).getBoundingClientRect().left
      expect(Math.abs(left - pinnedLeft)).toBeLessThan(2)
    }
    // Pinned row: still stuck in place, and painted over the rows gliding
    // beneath it.
    const rect = pinned.getBoundingClientRect()
    expect(Math.abs(rect.top - stuck)).toBeLessThan(1)
    // Over the unpinned part of the row (the surface is 300px wide).
    const hit = document.elementFromPoint(
      surface().getBoundingClientRect().left + 250,
      rect.top + rect.height / 2
    )
    expect(pinned.contains(hit)).toBe(true)
    for (const a of document.getAnimations()) a.finish()
  })

  it("keeps pinned cells sticky once the glide finishes", async () => {
    let table!: DataTableInstance<Row>
    render(
      <div style={{ width: 300 }}>
        <Harness
          onTable={(t) => (table = t)}
          enableColumnPinning
          enableColumnResizing
          initialState={{ columnPinning: { left: ["name"] } }}
          defaultColumn={{ size: 400 }}
        />
      </div>
    )
    await nextFrame()
    act(() => table.setSorting([{ id: "n", desc: false }]))
    expect(running()).toBeGreaterThan(0)
    await settle()
    expect(running()).toBe(0)
    surface().scrollLeft = 200
    await nextFrame()
    const cell = screen.getByText("Name 7").closest("td")!
    expect(
      Math.abs(
        cell.getBoundingClientRect().left -
          surface().getBoundingClientRect().left
      )
    ).toBeLessThan(2)
  })

  it("animates nothing while a row is being edited", async () => {
    let table!: DataTableInstance<Row>
    render(
      <Harness
        onTable={(t) => (table = t)}
        enableEditing
        editDisplayMode="cell"
      />
    )
    await nextFrame()
    act(() => table.setEditingCell({ rowId: "r0", columnId: "name" }))
    act(() => table.setSorting([{ id: "n", desc: false }]))
    expect(running()).toBe(0)
  })

  it("animates nothing while a new row is being created", async () => {
    let table!: DataTableInstance<Row>
    render(
      <Harness
        onTable={(t) => (table = t)}
        enableEditing
        createDisplayMode="row"
      />
    )
    await nextFrame()
    act(() => table.beginCreate())
    act(() => table.setSorting([{ id: "n", desc: false }]))
    act(() => table.setGlobalFilter("Name 1"))
    expect(running()).toBe(0)
    expect(layer()!.children.length).toBe(0)
  })

  it("stops the motion in flight when an edit starts", async () => {
    let table!: DataTableInstance<Row>
    render(
      <Harness
        onTable={(t) => (table = t)}
        enableEditing
        editDisplayMode="cell"
      />
    )
    await nextFrame()
    act(() => table.setGlobalFilter("Name 1"))
    act(() => table.setGlobalFilter(""))
    expect(running()).toBeGreaterThan(0)
    act(() => table.setEditingCell({ rowId: "r0", columnId: "name" }))
    expect(running()).toBe(0)
    expect(layer()!.children.length).toBe(0)
  })

  it("animates nothing while a row is being dragged", async () => {
    let table!: DataTableInstance<Row>
    render(<Harness onTable={(t) => (table = t)} enableRowOrdering />)
    await nextFrame()
    const grip = screen.getAllByRole("button", { name: /reorder row/i })[0]!
    const { left, top, width, height } = grip.getBoundingClientRect()
    const at = { x: left + width / 2, y: top + height / 2 }
    const base = {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      isPrimary: true,
      pointerType: "mouse",
      button: 0,
    }
    grip.dispatchEvent(
      new PointerEvent("pointerdown", {
        ...base,
        buttons: 1,
        clientX: at.x,
        clientY: at.y,
      })
    )
    await nextFrame()
    for (let i = 1; i <= 5; i++) {
      document.dispatchEvent(
        new PointerEvent("pointermove", {
          ...base,
          buttons: 1,
          clientX: at.x,
          clientY: at.y + i * 8,
        })
      )
      await nextFrame()
    }
    expect(document.querySelector("tr[data-dragging]")).not.toBeNull()
    act(() => table.setGlobalFilter("Name 1"))
    expect(running()).toBe(0)
    expect(layer()!.children.length).toBe(0)
    document.dispatchEvent(
      new PointerEvent("pointerup", { ...base, buttons: 0 })
    )
    // End the drag as a browser does: the click that follows pointerup,
    // which dnd-kit swallows. Its click-swallowing listener stays on the
    // document until 50 ms after the drag ends, so wait that out too, or it
    // eats the next test's first click.
    grip.dispatchEvent(new MouseEvent("click", base))
    await new Promise((resolve) => setTimeout(resolve, 60))
  })

  it("reveals a detail panel as the rows below glide down", async () => {
    render(<Harness renderDetailPanel={detailPanel} />)
    await nextFrame()
    const was = findRow("r2")!.getBoundingClientRect().top
    fireEvent.click(expandButton("r1"))
    const detail = findRow("r1:detail")!
    const reveal = [...detail.cells].flatMap((td) => animating(td, "clipPath"))
    expect(reveal.length).toBeGreaterThan(0)
    // The row below glides down with the panel's bottom edge: same timing,
    // and it starts where it was (no jump).
    const next = findRow("r2")!
    const glide = animating(next, "transform")
    expect(glide.length).toBe(1)
    expect(timing(reveal[0]!).duration).toBe(timing(glide[0]!).duration)
    expect(timing(reveal[0]!).easing).toBe(timing(glide[0]!).easing)
    expect(timing(reveal[0]!).delay).toBe(0)
    expect(Math.abs(next.getBoundingClientRect().top - was)).toBeLessThan(2)
    // The table draws the row's (collapsed) bottom border, which no clip
    // hides: it stays transparent until the panel's bottom edge arrives.
    const border = animating(detail, "borderBottomColor")
    expect(border.length).toBe(1)
    expect(timing(border[0]!).duration).toBe(timing(glide[0]!).duration)
    const transparent = "rgba(0, 0, 0, 0)"
    expect(getComputedStyle(detail).borderBottomColor).toBe(transparent)
    await nextFrame()
    await settle()
    expect(Math.abs(next.getBoundingClientRect().top - was)).toBeGreaterThan(50)
    expect(getComputedStyle(detail).borderBottomColor).not.toBe(transparent)
  })

  it("clips a detail panel while it opens", async () => {
    render(<Harness renderDetailPanel={detailPanel} />)
    await nextFrame()
    // The last row: nothing below covers its panel.
    fireEvent.click(expandButton("r7"))
    const detail = findRow("r7:detail")!
    const { left, top, width, height } = detail.getBoundingClientRect()
    const hit = () =>
      document.elementFromPoint(left + width / 2, top + height / 2)
    // Fully clipped at the start: the panel is not under its own centre.
    expect(detail.contains(hit())).toBe(false)
    await settle()
    expect(detail.contains(hit())).toBe(true)
  })

  it("hides a detail panel as the rows below glide up", async () => {
    render(
      <Harness
        renderDetailPanel={detailPanel}
        initialState={{ expanded: { r1: true } }}
      />
    )
    await nextFrame()
    fireEvent.click(expandButton("r1"))
    expect(findRow("r1:detail")).toBeUndefined()
    const ghost = layer()!
      .querySelector('tr[data-row-kind="detail"]')!
      .closest<HTMLElement>('[data-slot="data-table-leave-copy"]')!
    const hide = animating(ghost, "clipPath")
    expect(hide.length).toBe(1)
    const next = findRow("r2")!
    const glide = animating(next, "transform")
    expect(glide.length).toBe(1)
    // From below: a positive offset.
    const from = (glide[0]!.effect as KeyframeEffect).getKeyframes()[0]!
    expect(String(from.transform)).toMatch(/translateY\(\d+(\.\d+)?px\)/)
    expect(timing(hide[0]!).duration).toBe(timing(glide[0]!).duration)
    expect(timing(hide[0]!).easing).toBe(timing(glide[0]!).easing)
    await waitFor(() => expect(ghost.isConnected).toBe(false), {
      timeout: MOTION_DEFAULTS.duration + 150,
      interval: 20,
    })
  })

  it("expands without motion when animations are off", async () => {
    render(<Harness renderDetailPanel={detailPanel} enableAnimations={false} />)
    await nextFrame()
    fireEvent.click(expandButton("r1"))
    expect(findRow("r1:detail")).toBeDefined()
    expect(running()).toBe(0)
    expect(document.querySelectorAll("td").length).toBeGreaterThan(0)
    expect(
      [...document.querySelectorAll("td")].some(
        (td) => td.getAnimations().length > 0
      )
    ).toBe(false)
  })

  it("expands without motion under reduced motion", async () => {
    const session = cdp()
    await session.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    })
    try {
      render(<Harness renderDetailPanel={detailPanel} />)
      await nextFrame()
      fireEvent.click(expandButton("r1"))
      expect(findRow("r1:detail")).toBeDefined()
      expect(running()).toBe(0)
      expect(
        [...document.querySelectorAll("td")].some(
          (td) => td.getAnimations().length > 0
        )
      ).toBe(false)
      fireEvent.click(expandButton("r1"))
      expect(layer()).toBeNull()
    } finally {
      await session.send("Emulation.setEmulatedMedia", { features: [] })
    }
  })

  it("animates nothing under reduced motion", async () => {
    const session = cdp()
    await session.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    })
    try {
      let table!: DataTableInstance<Row>
      render(<Harness onTable={(t) => (table = t)} />)
      await nextFrame()
      expect(layer()).toBeNull()
      act(() => table.setSorting([{ id: "n", desc: false }]))
      act(() => table.setGlobalFilter("Name 1"))
      expect(running()).toBe(0)
    } finally {
      await session.send("Emulation.setEmulatedMedia", { features: [] })
    }
  })
})

describe("control animations", () => {
  const sortArrow = () =>
    document.querySelector<HTMLElement>(
      '[data-slot="data-table-sort-indicator"] [data-shown] svg'
    )!

  it("turns the sort arrow with the motion timing", async () => {
    render(<Harness />)
    const sortName = document.querySelector<HTMLElement>(
      "th button[data-sorted]"
    )!
    fireEvent.click(sortName)
    fireEvent.click(sortName)
    await settle()
    const style = getComputedStyle(sortArrow())
    expect(style.transitionDuration).toBe(`${MOTION_DEFAULTS.duration / 1000}s`)
    expect(style.transitionTimingFunction).toBe(MOTION_DEFAULTS.ease)
    expect(style.rotate).toBe("180deg")
    // Same 14px box as the single icon it replaces: no header layout shift.
    const box = document
      .querySelector('[data-slot="data-table-sort-indicator"]')!
      .getBoundingClientRect()
    expect([box.width, box.height]).toEqual([14, 14])
    cleanup()

    render(<Harness enableAnimations={false} />)
    const off = document.querySelector<HTMLElement>("th button[data-sorted]")!
    fireEvent.click(off)
    fireEvent.click(off)
    const offStyle = getComputedStyle(sortArrow())
    expect(offStyle.transitionDuration).toBe("0s")
    expect(offStyle.rotate).toBe("180deg")
  })

  it("keeps a nested table's controls on its own timing", async () => {
    render(
      <Harness
        initialState={{ expanded: { r0: true } }}
        renderDetailPanel={() => (
          <div data-testid="inner">
            <Harness enableAnimations={false} />
          </div>
        )}
      />
    )
    await nextFrame()
    const inner = screen.getByTestId("inner")
    const sortIn = (scope: ParentNode) =>
      scope.querySelector<HTMLElement>("th button[data-sorted]")!
    const arrowIn = (scope: ParentNode) =>
      scope.querySelector<HTMLElement>(
        '[data-slot="data-table-sort-indicator"] [data-shown] svg'
      )!
    // The outer table's first header (not one inside the panel).
    const outerHead = document.querySelector("thead")!
    fireEvent.click(sortIn(outerHead))
    fireEvent.click(sortIn(outerHead))
    fireEvent.click(sortIn(inner))
    fireEvent.click(sortIn(inner))
    expect(getComputedStyle(arrowIn(outerHead)).transitionDuration).toBe(
      `${MOTION_DEFAULTS.duration / 1000}s`
    )
    // The nearest table root decides: the inner one does not animate.
    expect(getComputedStyle(arrowIn(inner)).transitionDuration).toBe("0s")
    expect(arrowIn(inner).getAnimations()).toHaveLength(0)
  })

  it("leaves no transition running after a sort under reduced motion", async () => {
    const session = cdp()
    await session.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    })
    try {
      render(<Harness />)
      await nextFrame()
      // The header's colour fade to "sorted" is off too.
      fireEvent.click(
        document.querySelectorAll<HTMLElement>("th button[data-sorted]")[0]!
      )
      expect(document.getAnimations()).toHaveLength(0)
    } finally {
      await session.send("Emulation.setEmulatedMedia", { features: [] })
    }
  })

  it("crossfades the selected count in place", async () => {
    render(<Harness enableRowSelection />)
    const boxes = () => [
      ...document.querySelectorAll<HTMLElement>('tbody [role="checkbox"]'),
    ]
    fireEvent.click(boxes()[0]!)
    const count = document.querySelector<HTMLElement>(
      '[data-slot="data-table-selected-count"]'
    )!
    const was = count.textContent
    const box = count.getBoundingClientRect()
    fireEvent.click(boxes()[1]!)
    // The same element shows the new number, fading in…
    const now = document.querySelector<HTMLElement>(
      '[data-slot="data-table-selected-count"]'
    )!
    expect(now).toBe(count)
    expect(now.textContent).not.toBe(was)
    const fadeIn = animating(now, "opacity")
    expect(fadeIn).toHaveLength(1)
    expect(timing(fadeIn[0]!).duration).toBe(MOTION_DEFAULTS.durationFast)
    // …while a copy of the old one fades out over it, without moving it.
    const old = document.querySelector<HTMLElement>(
      '[data-slot="data-table-selected-count-previous"]'
    )!
    expect(old.textContent).toBe(was)
    expect(old.getAttribute("aria-hidden")).toBe("true")
    const fadeOut = animating(old, "opacity")
    expect(fadeOut).toHaveLength(1)
    const [from, to] = (fadeOut[0]!.effect as KeyframeEffect).getKeyframes()
    expect([Number(from!.opacity), Number(to!.opacity)]).toEqual([1, 0])
    expect(timing(fadeOut[0]!).duration).toBe(MOTION_DEFAULTS.durationFast)
    // The text itself (not the boxes) sits in the same place.
    const glyphs = (el: Element) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      return range.getClientRects()[0]!
    }
    const at = glyphs(old)
    const live = glyphs(now)
    expect(Math.abs(at.left - live.left)).toBeLessThan(0.5)
    expect(Math.abs(at.top - live.top)).toBeLessThan(0.5)
    expect(Math.abs(now.getBoundingClientRect().top - box.top)).toBeLessThan(1)
    await settle()
    expect(old.isConnected).toBe(false)
  })

  it("draws the check in when a row is selected", async () => {
    render(<Harness enableRowSelection />)
    const box = document.querySelector<HTMLElement>('tbody [role="checkbox"]')!
    fireEvent.click(box)
    const glyph = box.querySelector("svg")!
    const path = glyph.querySelector("path")!
    expect(getComputedStyle(glyph).transitionDuration).toBe(
      `${MOTION_DEFAULTS.duration / 1000}s`
    )
    expect(animating(path, "strokeDashoffset")).toHaveLength(1)
    await settle()
    expect(getComputedStyle(path).strokeDashoffset).toBe("0px")
  })
})
