import { describe, expect, it } from "vitest"

import {
  MAX_ANIMATED_ROWS,
  planRowAnimations,
  type RowSnapshot,
} from "./plan-row-animations"

const snap = (members: string[], tops: [string, number][]): RowSnapshot => ({
  members: new Set(members),
  tops: new Map(tops),
})

describe("planRowAnimations", () => {
  it("does nothing on the first snapshot", () => {
    expect(planRowAnimations(null, snap(["a"], [["a", 0]]))).toEqual({
      moves: [],
      enters: [],
      leaves: [],
      skipped: false,
    })
  })

  it("moves rows whose position changed", () => {
    const prev = snap(
      ["a", "b"],
      [
        ["a", 0],
        ["b", 40],
      ]
    )
    const next = snap(
      ["a", "b"],
      [
        ["b", 0],
        ["a", 40],
      ]
    )
    expect(planRowAnimations(prev, next).moves).toEqual([
      { key: "b", dy: 40 },
      { key: "a", dy: -40 },
    ])
  })

  it("enters new members and leaves removed ones", () => {
    const prev = snap(
      ["a", "b"],
      [
        ["a", 0],
        ["b", 40],
      ]
    )
    const next = snap(
      ["a", "c"],
      [
        ["a", 0],
        ["c", 40],
      ]
    )
    const plan = planRowAnimations(prev, next)
    expect(plan.enters).toEqual(["c"])
    expect(plan.leaves).toEqual(["b"])
    expect(plan.moves).toEqual([])
  })

  it("ignores rows that only came into view (virtual scrolling)", () => {
    const prev = snap(
      ["a", "b", "c"],
      [
        ["a", 0],
        ["b", 40],
      ]
    )
    const next = snap(
      ["a", "b", "c"],
      [
        ["b", 0],
        ["c", 40],
      ]
    )
    const plan = planRowAnimations(prev, next)
    expect(plan.enters).toEqual([])
    expect(plan.leaves).toEqual([])
  })

  it("does nothing when nothing moved", () => {
    const s = snap(
      ["a", "b"],
      [
        ["a", 0],
        ["b", 40],
      ]
    )
    expect(
      planRowAnimations(
        s,
        snap(
          ["a", "b"],
          [
            ["a", 0],
            ["b", 40],
          ]
        )
      )
    ).toEqual({
      moves: [],
      enters: [],
      leaves: [],
      skipped: false,
    })
  })

  it("skips when too many rows would animate", () => {
    const ids = Array.from({ length: MAX_ANIMATED_ROWS + 2 }, (_, i) => `r${i}`)
    const prev = snap(
      ids,
      ids.map((id, i): [string, number] => [id, i * 40])
    )
    const next = snap(
      ids,
      ids.map((id, i): [string, number] => [id, (ids.length - 1 - i) * 40])
    )
    expect(planRowAnimations(prev, next)).toEqual({
      moves: [],
      enters: [],
      leaves: [],
      skipped: true,
    })
  })
})
