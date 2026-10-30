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
    // new to the window (they were in the data before) do not fade in.
    expect(running()).toBeGreaterThan(0)
    expect(running()).toBeLessThanOrEqual(drawn)
    const r1 = bodyRows().find((tr) => tr.dataset.rowId === "r1")!
    expect(r1.getAnimations().length).toBe(1)
  })

  it("glides a row into the top pinned group and back", async () => {
    let table!: DataTableInstance<Row>
    render(<Harness onTable={(t) => (table = t)} enableRowPinning />)
    await nextFrame()
    const row = () => bodyRows().find((tr) => tr.dataset.rowId === "r5")!
    act(() => table.getRow("r5").pin("top"))
    expect(row().closest("tbody")!.dataset.pinnedRows).toBe("top")
    expect(row().getAnimations().length).toBe(1)
    // The rows above it make room by gliding down (the rows below may
    // shift by the pinned group's border too).
    expect(running()).toBeGreaterThanOrEqual(6)
    await settle()
    expect(running()).toBe(0)

    act(() => table.getRow("r5").pin(false))
    expect(row().closest("tbody")!.dataset.pinnedRows).toBeUndefined()
    expect(row().getAnimations().length).toBe(1)
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
    await nextFrame()
    await settle()
    expect(Math.abs(next.getBoundingClientRect().top - was)).toBeGreaterThan(50)
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
    await nextFrame()
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
