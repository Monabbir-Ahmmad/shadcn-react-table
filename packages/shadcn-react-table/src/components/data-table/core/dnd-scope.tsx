"use client"

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type ScreenReaderInstructions,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import * as React from "react"

import { NON_DATA_COLUMN_IDS } from "./constants"
import { dt } from "./internal"
import type { DataTableRow } from "./table-types"
import type { DataTableInstance } from "./types"

/** What a table registers with a {@link DataTableDndProvider}. */
export interface DndScopeEntry {
  table: DataTableInstance<never>
  collisionDetection: CollisionDetection
  handleDragEnd: (event: DragEndEvent) => void
  announcements: Announcements
  screenReaderInstructions: ScreenReaderInstructions
}

interface DndScope {
  register: (key: string, entry: DndScopeEntry) => () => void
  /** The table key or drop zone a row from another table is over. */
  overTarget: string | null
}

const DndScopeContext = React.createContext<DndScope | null>(null)

/** This table's key inside a provider (null outside one): ids of its
 *  draggables and droppables are prefixed with it, so tables can share ids. */
export const DndKeyContext = React.createContext<string | null>(null)

const SEPARATOR = "::"

/** A drag id unique across the tables of a provider (unchanged outside one). */
export function useDndId() {
  const key = React.useContext(DndKeyContext)
  return React.useCallback(
    (id: string) => (key == null ? id : `${key}${SEPARATOR}${id}`),
    [key]
  )
}

/** The enclosing provider, for a table registering itself. */
export function useDndScope() {
  return React.useContext(DndScopeContext)
}

/** Where a row from one table was dropped, for `onRowDragEnd`. */
export type RowDropTarget =
  | {
      type: "table"
      /** The table it was dropped on. */
      table: DataTableInstance<never>
      /** The row it was dropped on, when it was dropped on one. */
      rowId?: string
    }
  | { type: "zone"; id: string }

const ZONE_PREFIX = `zone${SEPARATOR}`

/**
 * A drop target for rows dragged out of tables in the same
 * {@link DataTableDndProvider}. Attach `setNodeRef` to the element; `isOver`
 * is true while a row is over it. The source table's `onRowDragEnd` receives
 * `{ type: "zone", id }` when a row is dropped there.
 */
export function useDataTableDropZone(id: string) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `${ZONE_PREFIX}${id}`,
    data: { type: "zone", zoneId: id },
  })
  return {
    setNodeRef,
    isOver: isOver && active?.data.current?.type === "row",
  }
}

type DragData = {
  type?: string
  tableKey?: string
  rowId?: string
  zoneId?: string
}
const dataOf = (item: { data: { current?: unknown } } | null | undefined) =>
  (item?.data.current ?? {}) as DragData

/** A short label for the dragged row: its first data cell's value. */
function rowPreview(row: DataTableRow<never> | undefined) {
  const cell = row
    ?.getVisibleCells()
    .find((c) => !NON_DATA_COLUMN_IDS.has(c.column.id))
  return String(cell?.getValue() ?? row?.id ?? "")
}

/**
 * Lets rows be dragged between the tables inside it, and onto drop zones made
 * with {@link useDataTableDropZone}. The tables share one drag-and-drop
 * context; each table's own reordering (rows, columns, the group zone) keeps
 * working as before. A row dropped on another table or a zone calls the
 * source table's `onRowDragEnd({ row, table, over })`. Works with the
 * keyboard as well as the pointer.
 */
export function DataTableDndProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const entries = React.useRef(new Map<string, DndScopeEntry>())
  const [overTarget, setOverTarget] = React.useState<string | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)

  const register = React.useCallback((key: string, entry: DndScopeEntry) => {
    entries.current.set(key, entry)
    return () => {
      entries.current.delete(key)
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const entryOf = (item: { data: { current?: unknown } } | null) => {
    const key = dataOf(item).tableKey
    return key ? entries.current.get(key) : undefined
  }

  // Columns and the group zone stay within their own table. Rows may also go
  // to other tables' rows, other tables themselves, and drop zones: a row hit
  // under the pointer wins, then a zone, then a table; the keyboard (no
  // pointer) moves between rows and zones.
  const collisionDetection: CollisionDetection = (args) => {
    const source = dataOf(args.active)
    const entry = entryOf(args.active)
    if (source.type !== "row") {
      if (!entry) return []
      return entry.collisionDetection({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (c) => dataOf(c).tableKey === source.tableKey
        ),
      })
    }
    const rowTargets = args.droppableContainers.filter((c) => {
      const data = dataOf(c)
      return (
        data.type === "row" || data.type === "zone" || data.type === "table"
      )
    })
    const hits = pointerWithin({ ...args, droppableContainers: rowTargets })
    const rank = (type?: string) =>
      type === "row" ? 0 : type === "zone" ? 1 : 2
    if (hits.length > 0) {
      const byId = new Map(rowTargets.map((c) => [c.id, c]))
      return [...hits].sort(
        (a, b) =>
          rank(dataOf(byId.get(a.id)).type) - rank(dataOf(byId.get(b.id)).type)
      )
    }
    return closestCenter({
      ...args,
      droppableContainers: rowTargets.filter((c) => dataOf(c).type !== "table"),
    })
  }

  const targetOf = (event: DragOverEvent | DragEndEvent): string | null => {
    const source = dataOf(event.active)
    const over = dataOf(event.over)
    if (source.type !== "row" || !event.over) return null
    if (over.type === "zone") return `${ZONE_PREFIX}${over.zoneId}`
    if (over.tableKey && over.tableKey !== source.tableKey) return over.tableKey
    return null
  }

  const onDragStart = (event: DragStartEvent) => {
    const data = dataOf(event.active)
    if (data.type === "row" && data.tableKey && data.rowId) {
      const table = entries.current.get(data.tableKey)?.table
      setPreview(rowPreview(table?.getCoreRowModel().rowsById[data.rowId]))
    }
  }

  const onDragOver = (event: DragOverEvent) => setOverTarget(targetOf(event))

  const onDragEnd = (event: DragEndEvent) => {
    setOverTarget(null)
    setPreview(null)
    const source = dataOf(event.active)
    const entry = entryOf(event.active)
    if (!entry || !event.over) return
    const over = dataOf(event.over)
    if (
      source.type === "row" &&
      (over.type === "zone" ||
        (over.tableKey && over.tableKey !== source.tableKey))
    ) {
      const table = entry.table
      const row = source.rowId
        ? table.getCoreRowModel().rowsById[source.rowId]
        : undefined
      if (!row) return
      const target: RowDropTarget =
        over.type === "zone"
          ? { type: "zone", id: over.zoneId! }
          : {
              type: "table",
              table: entries.current.get(over.tableKey!)!.table,
              rowId: over.type === "row" ? over.rowId : undefined,
            }
      dt(table).onRowDragEnd?.({ row, table, over: target as never })
      return
    }
    if (over.tableKey === source.tableKey) entry.handleDragEnd(event)
  }

  // Screen-reader text from the table the dragged item belongs to.
  const announcements: Announcements = {
    onDragStart: (e) => entryOf(e.active)?.announcements.onDragStart(e),
    onDragMove: (e) => entryOf(e.active)?.announcements.onDragMove?.(e),
    onDragOver: (e) => entryOf(e.active)?.announcements.onDragOver(e),
    onDragEnd: (e) => entryOf(e.active)?.announcements.onDragEnd(e),
    onDragCancel: (e) => entryOf(e.active)?.announcements.onDragCancel(e),
  }
  const firstEntry = () => entries.current.values().next().value
  const screenReaderInstructions: ScreenReaderInstructions = {
    get draggable() {
      return firstEntry()?.screenReaderInstructions.draggable ?? ""
    },
  }

  return (
    <DndScopeContext.Provider value={{ register, overTarget }}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        accessibility={{ announcements, screenReaderInstructions }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setOverTarget(null)
          setPreview(null)
        }}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {preview != null && (
            <div
              data-slot="data-table-drag-preview"
              className="pointer-events-none max-w-64 truncate rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md"
            >
              {preview}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </DndScopeContext.Provider>
  )
}

/** Whether a row from another table is over the table with this key. */
export function useIsDropTarget(key: string | null) {
  const scope = React.useContext(DndScopeContext)
  return !!key && scope?.overTarget === key
}

/** The table's own droppable (inside a provider): a row from another table
 *  can be dropped anywhere on it, also when it is empty. */
export function TableDropTarget({ tableKey }: { tableKey: string }) {
  const { setNodeRef } = useDroppable({
    id: `${tableKey}${SEPARATOR}table`,
    data: { type: "table", tableKey },
  })
  return (
    <div
      ref={setNodeRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    />
  )
}
