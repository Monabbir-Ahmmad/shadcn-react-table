"use client"

import * as React from "react"
import {
  DataTable,
  useDataTable,
  type DataTableColumnDef,
} from "@monabbir/shadcn-react-table/components/data-table"

import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import {
  DEMO_ROWS,
  DEMO_SCENES,
  SCENE_MS,
  STILL_FRAME,
  demoFrame,
  demoPosition,
  formatSalary,
  type DemoFrame,
  type DemoRow,
} from "@/lib/auto-demo"

/** How often the clock ticks (the typing is the fastest change, ~190 ms). */
const TICK_MS = 50
const LOOP_MS = SCENE_MS * DEMO_SCENES.length

/** Whether `query` matches; `server` on the server and during hydration. */
function useMedia(query: string, server: boolean) {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    [query]
  )
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => server
  )
}

const sameFrame = (a: DemoFrame, b: DemoFrame) =>
  JSON.stringify(a) === JSON.stringify(b)

/**
 * The hero's table: the real data table, driven through its state by a
 * script that sorts, filters, selects and edits on a loop. It pauses while
 * hovered, focused or off screen, and holds one still frame for people who
 * asked for less motion.
 */
export function AutoDemo({ className }: { className?: string }) {
  const ref = React.useRef<HTMLElement>(null)
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false)
  const [frame, setFrame] = React.useState(() => demoFrame(0, 0))
  const [visible, setVisible] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const elapsed = React.useRef(0)
  const running = visible && !hovered && !focused && !reduced

  React.useEffect(() => {
    const figure = ref.current
    if (!figure) return
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? false)
    )
    observer.observe(figure)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!running) return
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      // A throttled background tab resumes where it was, not scenes later.
      elapsed.current = (elapsed.current + Math.min(now - last, 250)) % LOOP_MS
      last = now
      const { scene, t } = demoPosition(elapsed.current)
      const next = demoFrame(scene, t)
      setFrame((prev) => (sameFrame(prev, next) ? prev : next))
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [running])

  const shown = reduced ? STILL_FRAME : frame
  const scene = DEMO_SCENES[shown.scene]!

  return (
    <figure
      ref={ref}
      tabIndex={0}
      aria-label="A data table that sorts, filters, selects and edits on its own. Hover or focus it to pause."
      data-auto-demo=""
      data-scene={scene.id}
      className={cn("group/demo min-w-0 outline-none", className)}
      // Mouse only: a tap fires enter without a matching leave.
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovered(false)
      }}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false)
        }
      }}
    >
      {/* Played, not used: the live table further down takes input. Room for
          its tallest scene (banner, filter row), so the hero never shifts. */}
      <div
        inert
        className="min-h-90 rounded-md transition-shadow group-focus-visible/demo:ring-3 group-focus-visible/demo:ring-ring/50"
      >
        <HeroTable frame={shown} />
      </div>

      <figcaption
        data-demo-caption=""
        className="mt-4 flex items-center justify-between gap-4 font-mono text-xs text-muted-foreground"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="text-foreground">
            {String(shown.scene + 1).padStart(2, "0")}
          </span>
          <span className="text-foreground">{scene.label}</span>
          <span aria-hidden className="h-px w-4 shrink-0 bg-border" />
          <span className="truncate">{scene.option}</span>
        </span>
        <ol aria-hidden className="flex shrink-0 items-center gap-1.5">
          {DEMO_SCENES.map((step, i) => (
            <li
              key={step.id}
              className={cn(
                "h-0.5 w-5 transition-colors duration-300",
                i === shown.scene
                  ? "bg-primary"
                  : i < shown.scene
                    ? "bg-foreground/35"
                    : "bg-border"
              )}
            />
          ))}
        </ol>
      </figcaption>
    </figure>
  )
}

const STATUS_OPTIONS = [
  { label: "active", value: "active" },
  { label: "invited", value: "invited" },
  { label: "paused", value: "paused" },
]

/** The draft the script is typing, for the salary cell's editor. */
const DraftContext = React.createContext<DemoFrame["edit"]>(null)

function SalaryDraft() {
  const edit = React.useContext(DraftContext)
  return (
    <Input
      readOnly
      tabIndex={-1}
      value={edit?.text ?? ""}
      className={cn(
        // Fits the row's height, so the row does not grow while editing.
        "-my-1 h-7 text-end font-mono text-xs tabular-nums",
        edit?.selectAll && "text-primary"
      )}
    />
  )
}

const columns: DataTableColumnDef<DemoRow>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <Status status={getValue<DemoRow["status"]>()} />,
    meta: { filterVariant: "select", filterSelectOptions: STATUS_OPTIONS },
  },
  {
    accessorKey: "salary",
    header: "Salary",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs tabular-nums">
        {formatSalary(getValue<number>())}
      </span>
    ),
    meta: { align: "right", renderEditCell: () => <SalaryDraft /> },
  },
]

/** The real table, its state set from the script's frame. */
function HeroTable({ frame }: { frame: DemoFrame }) {
  // Phones: no room for Status; its filter still applies.
  const wide = useMedia("(min-width: 640px)", true)
  const edit = frame.edit
  // Saved: the new salary is in the data, as an editing save would put it.
  const savedId = edit && !edit.editing ? edit.id : null
  const savedText = edit && !edit.editing ? edit.text : null
  const data = React.useMemo(
    () =>
      DEMO_ROWS.map((row) =>
        row.id === savedId && savedText
          ? { ...row, salary: Number(savedText.replace(/\D/g, "")) }
          : row
      ),
    [savedId, savedText]
  )

  const table = useDataTable<DemoRow>({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableEditing: true,
    editDisplayMode: "cell",
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullscreenToggle: false,
    enablePagination: false,
    state: {
      columnVisibility: { status: wide },
      sorting: frame.sorted ? [{ id: "salary", desc: true }] : [],
      columnFilters: frame.filtered ? [{ id: "status", value: "active" }] : [],
      showColumnFilters: frame.filtered,
      rowSelection: Object.fromEntries(frame.selected.map((id) => [id, true])),
      editingCell: edit?.editing
        ? { rowId: edit.id, columnId: "salary" }
        : null,
    },
  })

  return (
    <DraftContext value={edit}>
      <DataTable table={table} />
    </DraftContext>
  )
}

function Status({ status }: { status: DemoRow["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] leading-none",
        status === "active" ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "active" ? "bg-primary" : "bg-muted-foreground/50"
        )}
      />
      {status}
    </span>
  )
}
