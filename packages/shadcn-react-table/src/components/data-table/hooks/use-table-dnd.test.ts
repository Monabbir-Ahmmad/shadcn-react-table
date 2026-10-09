import type {
  ClientRect,
  CollisionDetection,
  DroppableContainer,
} from "@dnd-kit/core"
import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { GROUP_DROPZONE_ID } from "../components/toolbar/data-table-grouping"
import type { DataTableInstance } from "../core/types"
import { useTableDnd } from "./use-table-dnd"

const rect = (left: number, top: number, size = 10): ClientRect => ({
  left,
  top,
  width: size,
  height: size,
  right: left + size,
  bottom: top + size,
})

const container = (
  id: string,
  type: string | undefined,
  r: ClientRect
): DroppableContainer =>
  ({
    id,
    key: id,
    data: { current: type ? { type } : undefined },
    disabled: false,
    node: { current: null },
    rect: { current: r },
  }) as unknown as DroppableContainer

// Group zone sits at the origin; one header and one row elsewhere.
const targets = [
  container(GROUP_DROPZONE_ID, undefined, rect(0, 0, 100)),
  container("name", "column", rect(200, 0)),
  container("row-1", "row", rect(200, 200)),
]

const detect = (
  collisionDetection: CollisionDetection,
  activeType: "row" | "column",
  at: ClientRect,
  pointer: { x: number; y: number } | null = null
) =>
  collisionDetection({
    active: {
      id: "dragged",
      data: { current: { type: activeType } },
      rect: { current: { initial: at, translated: at } },
    },
    collisionRect: at,
    droppableRects: new Map(targets.map((c) => [c.id, c.rect.current!])),
    droppableContainers: targets,
    pointerCoordinates: pointer,
  } as Parameters<CollisionDetection>[0]).map((c) => c.id)

const setup = () =>
  renderHook(() =>
    useTableDnd({ tableInstance: {} } as DataTableInstance<unknown>)
  ).result.current.collisionDetection

describe("useTableDnd collisionDetection", () => {
  it("keyboard row drag never resolves to the group zone or a header", () => {
    // Positioned right on top of the group zone: without type filtering,
    // closestCenter would pick the zone.
    const ids = detect(setup(), "row", rect(45, 45))
    expect(ids[0]).toBe("row-1")
    expect(ids).not.toContain(GROUP_DROPZONE_ID)
    expect(ids).not.toContain("name")
  })

  it("pointer row drag over the group zone is not captured by it", () => {
    const ids = detect(setup(), "row", rect(45, 45), { x: 50, y: 50 })
    expect(ids[0]).toBe("row-1")
  })

  it("keyboard column drag can reach the group zone", () => {
    const ids = detect(setup(), "column", rect(45, 45))
    expect(ids[0]).toBe(GROUP_DROPZONE_ID)
    expect(ids).not.toContain("row-1")
  })

  it("pointer column drag inside the group zone hits only the zone", () => {
    const ids = detect(setup(), "column", rect(195, 0), { x: 50, y: 50 })
    expect(ids).toEqual([GROUP_DROPZONE_ID])
  })

  it("column drag elsewhere resolves to the nearest header, never a row", () => {
    const ids = detect(setup(), "column", rect(200, 150))
    expect(ids[0]).toBe("name")
    expect(ids).not.toContain("row-1")
  })
})
