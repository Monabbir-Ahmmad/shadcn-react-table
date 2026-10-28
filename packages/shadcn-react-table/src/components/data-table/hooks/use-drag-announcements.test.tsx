import type { Announcements } from "@dnd-kit/core"
import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { defaultLocalization } from "../core/localization"
import type { DataTableColumnDef } from "../core/table-types"
import { useDataTable } from "../core/use-data-table"
import { useDragAnnouncements } from "./use-drag-announcements"

type Person = { id: string; name: string; age: number }

const columns: DataTableColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "age", header: "Age" },
]

const a: Person = { id: "a", name: "Ann", age: 1 }
const b: Person = { id: "b", name: "Bob", age: 2 }

function setup(data: Person[]) {
  return renderHook(
    ({ data }: { data: Person[] }) => {
      const table = useDataTable<Person>({
        columns,
        data,
        getRowId: (row) => row.id,
      })
      return useDragAnnouncements(table)
    },
    { initialProps: { data } }
  )
}

const item = (id: string, type?: string) => ({
  id,
  data: { current: type ? { type } : undefined },
  rect: { current: { initial: null, translated: null } },
})

// Only `id` and `data.current` are read by the announcements.
const args = (
  active: ReturnType<typeof item>,
  over?: ReturnType<typeof item>
) =>
  ({ active, over: over ?? null }) as unknown as Parameters<
    NonNullable<Announcements["onDragOver"]>
  >[0]

describe("useDragAnnouncements", () => {
  it("names columns by their header label", () => {
    const { result } = setup([a, b])
    const { announcements: ann } = result.current
    expect(ann.onDragStart!(args(item("name", "column")))).toBe(
      defaultLocalization.dragStart("Name")
    )
    expect(
      ann.onDragOver!(args(item("name", "column"), item("age", "column")))
    ).toBe(defaultLocalization.dragOver("Name", "Age"))
    expect(
      ann.onDragEnd!(args(item("name", "column"), item("age", "column")))
    ).toBe(defaultLocalization.dragEnd("Name", "Age"))
    expect(ann.onDragCancel!(args(item("age", "column")))).toBe(
      defaultLocalization.dragCancel("Age")
    )
  })

  it("names rows by position and follows the current row order", () => {
    const { result, rerender } = setup([a, b])
    expect(
      result.current.announcements.onDragStart!(args(item("b", "row")))
    ).toBe(defaultLocalization.dragStart("Row 2"))

    rerender({ data: [b, a] })
    expect(
      result.current.announcements.onDragStart!(args(item("b", "row")))
    ).toBe(defaultLocalization.dragStart("Row 1"))
  })

  it("falls back to the raw id for unknown ids or no type", () => {
    const { result } = setup([a, b])
    const { announcements: ann } = result.current
    expect(ann.onDragStart!(args(item("nope", "column")))).toBe(
      defaultLocalization.dragStart("nope")
    )
    expect(ann.onDragStart!(args(item("name")))).toBe(
      defaultLocalization.dragStart("name")
    )
    expect(ann.onDragStart!(args(item("zzz", "row")))).toBe(
      defaultLocalization.dragStart("zzz")
    )
  })

  it("announces a cancel when dropped over nothing", () => {
    const { result } = setup([a, b])
    const { announcements: ann } = result.current
    expect(ann.onDragEnd!(args(item("name", "column")))).toBe(
      defaultLocalization.dragCancel("Name")
    )
    expect(ann.onDragOver!(args(item("name", "column")))).toBeUndefined()
  })

  it("provides the localized screen-reader instructions", () => {
    const { result } = setup([a, b])
    expect(result.current.screenReaderInstructions.draggable).toBe(
      defaultLocalization.dragInstructions
    )
  })
})
