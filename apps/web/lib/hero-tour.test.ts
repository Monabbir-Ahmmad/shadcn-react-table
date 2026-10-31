import { describe, expect, it } from "vitest"

import {
  APPLY_AT,
  EDIT_ID,
  SCENE_MS,
  STILL_FRAME,
  TOUR_SCENES,
  tourFrame,
  tourPosition,
} from "./hero-tour"

const index = (id: string) => TOUR_SCENES.findIndex((s) => s.id === id)

describe("tourFrame", () => {
  it("starts every scene from the plain table", () => {
    TOUR_SCENES.forEach((_, i) => {
      expect(tourFrame(i, 0)).toEqual({
        scene: i,
        sorted: false,
        filterRow: false,
        filtered: false,
        search: "",
        selected: [],
        edit: null,
        grouped: false,
        pinned: [],
        compact: false,
        hidden: [],
      })
    })
  })

  it("switches on only its own feature", () => {
    const after = APPLY_AT + 0.01
    expect(tourFrame(index("sort"), after).sorted).toBe(true)
    // The filter row opens first; the filter follows a beat later.
    expect(tourFrame(index("filter"), after).filterRow).toBe(true)
    expect(tourFrame(index("filter"), after).filtered).toBe(false)
    expect(tourFrame(index("filter"), 0.5).filtered).toBe(true)
    expect(tourFrame(index("group"), after).grouped).toBe(true)
    expect(tourFrame(index("pin"), after).pinned).toHaveLength(1)
    expect(tourFrame(index("density"), after).compact).toBe(true)
    expect(tourFrame(index("columns"), after).hidden).toEqual([
      "team",
      "joined",
    ])
    const sort = tourFrame(index("sort"), after)
    expect(sort.filtered || sort.grouped || sort.compact).toBe(false)
  })

  it("types the search one key at a time", () => {
    const search = index("search")
    expect(tourFrame(search, APPLY_AT).search).toBe("r")
    expect(tourFrame(search, 1).search).toBe("research")
  })

  it("ticks two rows in the select scene", () => {
    const select = index("select")
    expect(tourFrame(select, APPLY_AT).selected).toHaveLength(1)
    expect(tourFrame(select, 1).selected).toHaveLength(2)
  })

  it("opens, types and saves the edit", () => {
    const edit = index("edit")
    expect(tourFrame(edit, APPLY_AT)?.edit).toMatchObject({
      id: EDIT_ID,
      editing: true,
      selectAll: true,
    })
    expect(tourFrame(edit, 0.5).edit?.selectAll).toBe(false)
    expect(tourFrame(edit, 1).edit).toMatchObject({
      text: "162500",
      editing: false,
    })
  })
})

describe("tourPosition", () => {
  it("walks the scenes and loops", () => {
    expect(tourPosition(0)).toEqual({ scene: 0, t: 0 })
    expect(tourPosition(SCENE_MS * 1.5)).toEqual({ scene: 1, t: 0.5 })
    expect(tourPosition(SCENE_MS * TOUR_SCENES.length).scene).toBe(0)
  })
})

it("holds the sorted table as the still frame", () => {
  expect(STILL_FRAME.sorted).toBe(true)
})
