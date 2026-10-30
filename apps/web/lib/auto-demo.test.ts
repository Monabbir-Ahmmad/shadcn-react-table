import { describe, expect, it } from "vitest"

import {
  DEMO_ROWS,
  DEMO_SCENES,
  SCENE_MS,
  STILL_FRAME,
  demoFrame,
  demoPosition,
  formatSalary,
} from "./auto-demo"

const ORIGINAL = DEMO_ROWS.map((row) => row.id)
const BY_SALARY = [...DEMO_ROWS]
  .sort((a, b) => b.salary - a.salary)
  .map((row) => row.id)
const ACTIVE = BY_SALARY.filter(
  (id) => DEMO_ROWS.find((row) => row.id === id)?.status === "active"
)

describe("DEMO_SCENES", () => {
  it("walks sort, filter, select and edit, each with its option", () => {
    expect(DEMO_SCENES.map((s) => [s.label, s.option])).toEqual([
      ["Sort", "enableSorting"],
      ["Filter", "columnFilters"],
      ["Select", "enableRowSelection"],
      ["Edit", "enableEditing"],
    ])
  })

  it("has six rows, some of them not active", () => {
    expect(DEMO_ROWS).toHaveLength(6)
    expect(ACTIVE.length).toBeGreaterThanOrEqual(3)
    expect(ACTIVE.length).toBeLessThan(6)
  })
})

describe("demoFrame", () => {
  it("starts as the plain table: original order, nothing applied", () => {
    expect(demoFrame(0, 0)).toEqual({
      scene: 0,
      order: ORIGINAL,
      rows: ORIGINAL,
      sorted: false,
      filtered: false,
      selected: [],
      edit: null,
    })
  })

  it("sorts by salary, highest first, partway through the sort scene", () => {
    const frame = demoFrame(0, 0.6)
    expect(frame.sorted).toBe(true)
    expect(frame.rows).toEqual(BY_SALARY)
    expect(frame.order).toEqual(BY_SALARY)
    expect(frame.filtered).toBe(false)
  })

  it("keeps the sort and then filters to active rows", () => {
    expect(demoFrame(1, 0).rows).toEqual(BY_SALARY)
    expect(demoFrame(1, 0).filtered).toBe(false)
    const frame = demoFrame(1, 0.6)
    expect(frame.filtered).toBe(true)
    expect(frame.rows).toEqual(ACTIVE)
    // Hidden rows keep their place in the sorted order to fade out from.
    expect(frame.order).toEqual(BY_SALARY)
  })

  it("ticks two visible rows one after the other", () => {
    expect(demoFrame(2, 0).selected).toEqual([])
    expect(demoFrame(2, 0.35).selected).toHaveLength(1)
    const both = demoFrame(2, 0.9).selected
    expect(both).toHaveLength(2)
    expect(both[0]).toBe(demoFrame(2, 0.35).selected[0])
    for (const id of both) expect(ACTIVE).toContain(id)
  })

  it("opens a salary cell, types a new value and commits it", () => {
    const before = demoFrame(3, 0)
    expect(before.edit).toBeNull()
    expect(before.selected).toHaveLength(2)

    const opened = demoFrame(3, 0.2)
    expect(opened.edit).toMatchObject({ editing: true, selectAll: true })
    const id = opened.edit!.id
    expect(ACTIVE).toContain(id)
    expect(before.selected).not.toContain(id)
    const current = DEMO_ROWS.find((row) => row.id === id)!.salary
    expect(opened.edit!.text).toBe(String(current))

    // Typing replaces the value one character at a time.
    const typed: string[] = []
    for (let t = 0.2; t < 0.8; t += 0.01) {
      const edit = demoFrame(3, t).edit!
      if (edit.selectAll) continue
      expect(edit.editing).toBe(true)
      if (typed.at(-1) !== edit.text) typed.push(edit.text)
    }
    expect(typed.length).toBeGreaterThanOrEqual(4)
    for (let i = 1; i < typed.length; i++) {
      expect(typed[i]!.startsWith(typed[i - 1]!)).toBe(true)
      expect(typed[i]!.length).toBe(typed[i - 1]!.length + 1)
    }

    const done = demoFrame(3, 0.95).edit!
    expect(done.editing).toBe(false)
    expect(done.text).toBe(formatSalary(Number(typed.at(-1))))
    // The edit keeps the row where the sort put it.
    expect(demoFrame(3, 0.95).rows).toEqual(ACTIVE)
    expect(Number(typed.at(-1))).toBeGreaterThan(current)
  })

  it("is pure: the same input gives the same frame", () => {
    expect(demoFrame(3, 0.5)).toEqual(demoFrame(3, 0.5))
  })

  it("clamps out-of-range input", () => {
    expect(demoFrame(-1, -1)).toEqual(demoFrame(0, 0))
    expect(demoFrame(9, 2)).toEqual(demoFrame(3, 1))
  })
})

describe("demoPosition", () => {
  it("maps elapsed time to a scene and the progress through it", () => {
    expect(demoPosition(0)).toEqual({ scene: 0, t: 0 })
    expect(demoPosition(SCENE_MS * 1.5)).toEqual({ scene: 1, t: 0.5 })
    expect(demoPosition(SCENE_MS * 3.25)).toEqual({ scene: 3, t: 0.25 })
  })

  it("loops back to the start after the last scene", () => {
    expect(demoPosition(SCENE_MS * 4)).toEqual({ scene: 0, t: 0 })
    expect(demoPosition(SCENE_MS * 9.5)).toEqual({ scene: 1, t: 0.5 })
  })
})

describe("STILL_FRAME", () => {
  it("shows the table sorted, filtered and with rows selected", () => {
    expect(STILL_FRAME.sorted).toBe(true)
    expect(STILL_FRAME.filtered).toBe(true)
    expect(STILL_FRAME.rows).toEqual(ACTIVE)
    expect(STILL_FRAME.selected).toHaveLength(2)
    expect(STILL_FRAME.edit).toBeNull()
  })
})

describe("formatSalary", () => {
  it("formats whole dollars with thousands separators", () => {
    expect(formatSalary(162500)).toBe("$162,500")
    expect(formatSalary(96500)).toBe("$96,500")
  })
})
