"use client"

import * as React from "react"
import {
  RiArrowDownDoubleLine,
  RiArrowGoBackLine,
  RiStackLine,
} from "@remixicon/react"
import { Direction } from "radix-ui"

import {
  DataTable,
  useDataTable,
  type DataTableRowVirtualizer,
} from "@monabbir/shadcn-react-table/components/data-table"
import { dataTableLocalizationAr } from "@monabbir/shadcn-react-table/components/data-table/locales/ar"
import { Button } from "@workspace/ui/components/button"

import { userColumns } from "@/components/examples/columns"
import { CodePanel } from "@/components/home/live/code-panel"
import {
  CommandBar,
  type CommandStatus,
} from "@/components/home/live/command-bar"
import { FpsMeter } from "@/components/home/live/fps-meter"
import { makeBigUsers } from "@/lib/big-data"
import { users, type User } from "@/lib/example-data"
import { stateToCode } from "@/lib/state-to-code"
import {
  applyCommand,
  BIG_ROWS_LABEL,
  describeCommand,
  EXAMPLE_COMMANDS,
  parseCommand,
  type Command,
  type CommandColumn,
  type CommandTarget,
} from "@/lib/table-commands"

/** Columns whose values the command bar knows ("only active", "only sales"). */
const VALUE_COLUMNS = ["role", "department", "status"] as const

/** Commands that recompute the row model: on the large dataset they show
 *  "Working…" for a frame first. */
const HEAVY = new Set<Command["kind"]>([
  "group",
  "ungroup",
  "sort",
  "filter",
  "clearFilters",
  "selectAll",
  "clearSelection",
])

// Generated on first use, then kept for the page's lifetime.
let bigUsers: User[] | null = null

/** Runs `fn` once the browser has painted what is on screen now. */
function afterPaint(fn: () => void) {
  requestAnimationFrame(() => setTimeout(fn, 0))
}

/** The table's scroll container inside `root`. */
const surfaceIn = (root: HTMLElement | null) =>
  root?.querySelector<HTMLElement>('[data-slot="data-table-surface"]') ?? null

/**
 * The live users table: a command bar drives it, Preview/Code switches to the
 * `useDataTable` call for what is on screen, and a large-dataset mode loads
 * 100,000 virtualized rows with an FPS meter.
 */
export function LiveTable() {
  const columns = React.useMemo(() => userColumns(), [])
  const [data, setData] = React.useState<User[]>(users)
  const [big, setBig] = React.useState(false)
  const [locale, setLocale] = React.useState<"en" | "ar">("en")
  const [view, setView] = React.useState<"preview" | "code">("preview")
  const [status, setStatus] = React.useState<CommandStatus>({ kind: "idle" })
  const [statusId, setStatusId] = React.useState(0)
  const [, startTransition] = React.useTransition()
  const rootRef = React.useRef<HTMLDivElement>(null)
  // Bumped by anything that changes which data is shown (reset, Back to 48,
  // a large-data load): deferred work from before it bails.
  const epoch = React.useRef(0)
  // The latest deferred command, so only its confirmation is shown.
  const latest = React.useRef(0)
  const loading = React.useRef(false)
  // Ends the running fling (its frame and its listeners).
  const stopFling = React.useRef<() => void>(() => {})
  // The table's scroll offset while the Code view hides it.
  const savedScroll = React.useRef(0)
  const savedRow = React.useRef(-1)
  const rowVirtualizer = React.useRef<DataTableRowVirtualizer | null>(null)
  const viewId = React.useId()

  const announce = (next: CommandStatus) => {
    setStatus(next)
    setStatusId((id) => id + 1)
  }

  // Drops pending work and the fling before the shown data changes. Refs
  // only, so the memoized reset below can call it too.
  const interrupt = React.useCallback(() => {
    epoch.current += 1
    loading.current = false
    savedScroll.current = 0
    savedRow.current = -1
    stopFling.current()
  }, [])

  const showBig = () => {
    if (big) return announce({ kind: "done", text: `Loaded ${BIG_ROWS_LABEL}` })
    // A second request while generating changes nothing.
    if (loading.current) return
    interrupt()
    loading.current = true
    const at = epoch.current
    announce({ kind: "busy", text: `Generating ${BIG_ROWS_LABEL}…` })
    afterPaint(() => {
      if (epoch.current !== at) return
      loading.current = false
      startTransition(() => {
        bigUsers ??= makeBigUsers()
        setData(bigUsers)
        setBig(true)
        announce({ kind: "done", text: `Loaded ${BIG_ROWS_LABEL}` })
      })
    })
  }

  const showSmall = () => {
    interrupt()
    setData(users)
    setBig(false)
    announce({ kind: "done", text: `Back to ${users.length} rows` })
  }

  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableGrouping: true,
    enableColumnPinning: true,
    localization: locale === "ar" ? dataTableLocalizationAr : undefined,
    ...(big
      ? {
          enablePagination: false,
          enableRowVirtualization: true,
          rowVirtualizerInstanceRef: rowVirtualizer,
          slotProps: { surface: { className: "max-h-[520px]" } },
        }
      : {}),
    renderTopToolbarCustomActions: () => (
      <div className="flex flex-wrap items-center gap-2">
        {big ? (
          <>
            <Button variant="outline" size="xs" onClick={showSmall}>
              <RiArrowGoBackLine data-icon="inline-start" />
              Back to {users.length} rows
            </Button>
            <Button variant="outline" size="xs" onClick={flingToBottom}>
              <RiArrowDownDoubleLine data-icon="inline-start" />
              Fling to bottom
            </Button>
          </>
        ) : (
          <Button variant="outline" size="xs" onClick={showBig}>
            <RiStackLine data-icon="inline-start" />
            {/* One flex item, so the words keep their order in RTL. */}
            <span>
              <span className="max-sm:hidden">Load </span>
              {BIG_ROWS_LABEL}
            </span>
          </Button>
        )}
      </div>
    ),
  })

  /** Scroll the table to its last row: eased, a frame at a time (instant
   *  with reduced motion); any wheel, touch or key stops it. */
  function flingToBottom() {
    const surface = surfaceIn(rootRef.current)
    if (!surface) return
    stopFling.current()
    const end = () => surface.scrollHeight - surface.clientHeight
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      surface.scrollTop = end()
      return
    }
    const from = surface.scrollTop
    let start = -1
    const duration = 1800
    let raf = 0
    let settle = 0
    const stop = () => {
      cancelAnimationFrame(raf)
      surface.removeEventListener("wheel", stop)
      surface.removeEventListener("touchstart", stop)
      surface.removeEventListener("keydown", stop)
      stopFling.current = () => {}
    }
    surface.addEventListener("wheel", stop, { passive: true })
    surface.addEventListener("touchstart", stop, { passive: true })
    surface.addEventListener("keydown", stop)
    stopFling.current = stop
    const step = (now: number) => {
      if (start < 0) start = now
      const t = Math.min(1, (now - start) / duration)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
      // Re-read the end each frame: measured rows can change the height.
      surface.scrollTop = from + (end() - from) * eased
      // Then hold the bottom for a few frames while the last rows are
      // measured and the height settles.
      if (t < 1 || ++settle < 8) raf = requestAnimationFrame(step)
      else stop()
    }
    raf = requestAnimationFrame(step)
  }

  React.useEffect(() => () => stopFling.current(), [])

  /** Switch views. `hidden` drops the table's scroll offset, so keep it. */
  const switchView = (next: "preview" | "code") => {
    if (next === view) return
    if (next === "code") {
      stopFling.current()
      const top = surfaceIn(rootRef.current)?.scrollTop ?? 0
      savedScroll.current = top
      // With virtualization, remember the first row in view: row heights are
      // measured again after the table is shown, so the offset alone drifts.
      savedRow.current =
        rowVirtualizer.current?.getVirtualItems().find((item) => item.end > top)
          ?.index ?? -1
    }
    setView(next)
  }

  // Back on Preview, restore the position once the virtualized body has its
  // height again (it collapses while hidden), trying for a few frames.
  React.useLayoutEffect(() => {
    if (view !== "preview") return
    const top = savedScroll.current
    const row = savedRow.current
    savedScroll.current = 0
    savedRow.current = -1
    const surface = surfaceIn(rootRef.current)
    if (!top || !surface) return
    let raf = 0
    let tries = 0
    const restore = () => {
      const virtualizer = rowVirtualizer.current
      if (surface.scrollHeight - surface.clientHeight < top) {
        if (++tries < 30) raf = requestAnimationFrame(restore)
      } else if (row >= 0 && virtualizer) {
        virtualizer.scrollToIndex(row, { align: "start" })
      } else surface.scrollTop = top
    }
    restore()
    return () => cancelAnimationFrame(raf)
  }, [view])

  const commandColumns = React.useMemo<CommandColumn[]>(
    () =>
      table.getAllLeafColumns().flatMap((column) => {
        const header = column.columnDef.header
        if (typeof header !== "string") return []
        const valueColumn = (VALUE_COLUMNS as readonly string[]).includes(
          column.id
        )
        return [
          {
            id: column.id,
            label: header,
            values: valueColumn
              ? [
                  ...new Set(
                    users.map((user) => String(user[column.id as keyof User]))
                  ),
                ]
              : undefined,
            multi: column.columnDef.meta?.filterVariant === "multi-select",
          },
        ]
      }),
    [table]
  )

  const target = React.useMemo<CommandTarget>(
    () => ({
      setGrouping: (grouping) => table.setGrouping(grouping),
      setSorting: (sorting) => table.setSorting(sorting),
      // The instance speaks TanStack's start/end; commands speak left/right.
      setColumnPinning: ({ left, right }) =>
        table.setColumnPinning({ start: left, end: right }),
      setColumnFilters: (updater) =>
        table.setColumnFilters((prev) => updater(prev)),
      setColumnVisibility: (updater) =>
        table.setColumnVisibility((prev) => updater(prev)),
      setDensity: (density) => table.setDensity(density),
      toggleAllRowsSelected: (selected) =>
        table.toggleAllRowsSelected(selected),
      reset: () => {
        interrupt()
        table.reset()
        table.setDensity("comfortable")
        setLocale("en")
        setBig(false)
        setData(users)
      },
    }),
    [table, interrupt]
  )

  const run = (text: string): boolean => {
    const parsed = parseCommand(text, commandColumns)
    if (!parsed.ok) {
      announce({
        kind: "miss",
        input: text,
        suggestions: parsed.suggestions.slice(0, 3),
      })
      return false
    }
    const { command } = parsed
    const message = describeCommand(command, commandColumns)
    if (command.kind === "bigData") {
      showBig()
    } else if (command.kind === "locale") {
      setLocale(command.locale)
      announce({ kind: "done", text: message })
    } else if (big && HEAVY.has(command.kind)) {
      // Paint "Working…" first. Queued commands all apply, in order, unless
      // the data changed meanwhile; only the last one confirms.
      const at = epoch.current
      const id = ++latest.current
      announce({ kind: "busy", text: "Working…" })
      afterPaint(() => {
        if (epoch.current !== at) return
        applyCommand(command, target, commandColumns)
        afterPaint(() => {
          if (epoch.current === at && latest.current === id)
            announce({ kind: "done", text: message })
        })
      })
    } else {
      applyCommand(command, target, commandColumns)
      announce({ kind: "done", text: message })
    }
    return true
  }

  return (
    <div ref={rootRef}>
      <CommandBar
        onRun={run}
        status={status}
        statusId={statusId}
        examples={EXAMPLE_COMMANDS}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t pt-4">
        <div
          role="group"
          aria-label="View"
          className="inline-flex border bg-background p-0.5"
        >
          {(["preview", "code"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              aria-controls={`${viewId}-${option}`}
              onClick={() => switchView(option)}
              className="px-3 py-1 font-mono text-xs text-muted-foreground capitalize transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 aria-pressed:bg-foreground aria-pressed:text-background"
            >
              {option}
            </button>
          ))}
        </div>
        {big ? (
          <FpsMeter active={big} rows={data.length} />
        ) : (
          <p className="font-mono text-xs text-muted-foreground tabular-nums">
            {data.length} rows
          </p>
        )}
      </div>

      <div className="mt-4">
        {/* As in the RTL guide: the provider turns the table's portaled menus
            and popovers, the wrapper turns the table itself. */}
        <Direction.Provider dir={locale === "ar" ? "rtl" : "ltr"}>
          <div
            id={`${viewId}-preview`}
            hidden={view !== "preview"}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <DataTable table={table} />
          </div>
        </Direction.Provider>
        <div id={`${viewId}-code`} hidden={view !== "code"}>
          <table.Subscribe
            selector={(state) => ({
              grouping: state.grouping,
              sorting: state.sorting,
              columnPinning: state.columnPinning,
              columnFilters: state.columnFilters,
              columnVisibility: state.columnVisibility,
              density: state.density,
            })}
          >
            {() => {
              // The selector only says when to re-render; read the slices in
              // the table's own (left/right pinning) shape.
              const state = table.getState()
              return (
                <CodePanel
                  code={stateToCode({
                    grouping: state.grouping,
                    sorting: state.sorting,
                    columnPinning: {
                      left: state.columnPinning.left ?? [],
                      right: state.columnPinning.right ?? [],
                    },
                    columnFilters: state.columnFilters,
                    columnVisibility: state.columnVisibility,
                    density: state.density,
                    locale,
                    big,
                  })}
                />
              )
            }}
          </table.Subscribe>
        </div>
      </div>
    </div>
  )
}
