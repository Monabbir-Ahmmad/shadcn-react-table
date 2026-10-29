"use client"

import * as React from "react"
import {
  RiArrowDownDoubleLine,
  RiArrowGoBackLine,
  RiStackLine,
} from "@remixicon/react"

import {
  DataTable,
  useDataTable,
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
import { BIG_ROW_COUNT, makeBigUsers } from "@/lib/big-data"
import { users, type User } from "@/lib/example-data"
import { stateToCode } from "@/lib/state-to-code"
import {
  applyCommand,
  EXAMPLE_COMMANDS,
  parseCommand,
  type Command,
  type CommandColumn,
  type CommandTarget,
  type ParseResult,
} from "@/lib/table-commands"

const BIG_LABEL = `${BIG_ROW_COUNT.toLocaleString("en-US")} rows`

// Shown as the large-dataset example: the real row count, never a million.
const EXAMPLES = EXAMPLE_COMMANDS.map((command) =>
  /million/.test(command) ? BIG_LABEL : command
)

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

/** "100,000 rows", "100000", "100k rows" all load the large dataset. */
function isBigDataAlias(text: string) {
  const m = text
    .toLowerCase()
    .replace(/[\s,._]/g, "")
    .match(/^(?:load)?(\d+)(k?)(?:rows?)?$/)
  return !!m && Number(m[1]) * (m[2] ? 1000 : 1) === BIG_ROW_COUNT
}

const DENSITY_LABEL = {
  compact: "Compact",
  comfortable: "Comfortable",
  spacious: "Spacious",
} as const

/** The one-line confirmation for a command. */
function describe(command: Command, label: (id: string) => string): string {
  switch (command.kind) {
    case "group":
      return `Grouped by ${label(command.column)}`
    case "ungroup":
      return "Grouping cleared"
    case "sort":
      return `Sorted by ${label(command.column)}, ${
        command.desc ? "highest first" : "lowest first"
      }`
    case "pin":
      return `Pinned ${label(command.column)} to the ${command.side}`
    case "unpin":
      return "All columns unpinned"
    case "filter":
      return `Showing only ${command.value} (${label(command.column)})`
    case "clearFilters":
      return "Filters cleared"
    case "visibility":
      return `${command.visible ? "Showing" : "Hid"} ${label(command.column)}`
    case "density":
      return `${DENSITY_LABEL[command.density]} rows`
    case "selectAll":
      return "Selected every row"
    case "clearSelection":
      return "Selection cleared"
    case "locale":
      return command.locale === "ar"
        ? "Arabic, right to left"
        : "English, left to right"
    case "bigData":
      return `Loaded ${BIG_LABEL}`
    case "reset":
      return "Back to the starting view"
  }
}

/**
 * The live users table: a command bar drives it, Preview/Code switches to the
 * `useDataTable` call for what is on screen, and a large-dataset mode loads
 * {@link BIG_ROW_COUNT} virtualized rows with an FPS meter.
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
  const fling = React.useRef(0)
  const viewId = React.useId()

  const announce = (next: CommandStatus) => {
    setStatus(next)
    setStatusId((id) => id + 1)
  }

  const showBig = () => {
    if (big) return announce({ kind: "done", text: `Loaded ${BIG_LABEL}` })
    announce({ kind: "busy", text: `Generating ${BIG_LABEL}…` })
    afterPaint(() =>
      startTransition(() => {
        bigUsers ??= makeBigUsers()
        setData(bigUsers)
        setBig(true)
        announce({ kind: "done", text: `Loaded ${BIG_LABEL}` })
      })
    )
  }

  const showSmall = () => {
    cancelAnimationFrame(fling.current)
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
            <span className="max-sm:hidden">Load</span> {BIG_LABEL}
          </Button>
        )}
      </div>
    ),
  })

  /** Scroll the table to its last row: eased, a frame at a time (instant
   *  with reduced motion); any wheel, touch or key stops it. */
  function flingToBottom() {
    const surface = rootRef.current?.querySelector<HTMLElement>(
      '[data-slot="data-table-surface"]'
    )
    if (!surface) return
    cancelAnimationFrame(fling.current)
    const end = () => surface.scrollHeight - surface.clientHeight
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      surface.scrollTop = end()
      return
    }
    const from = surface.scrollTop
    const start = performance.now()
    const duration = 1800
    const stop = () => {
      cancelAnimationFrame(fling.current)
      surface.removeEventListener("wheel", stop)
      surface.removeEventListener("touchstart", stop)
      surface.removeEventListener("keydown", stop)
    }
    surface.addEventListener("wheel", stop, { passive: true })
    surface.addEventListener("touchstart", stop, { passive: true })
    surface.addEventListener("keydown", stop)
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
      // Re-read the end each frame: measured rows can change the height.
      surface.scrollTop = from + (end() - from) * eased
      if (t < 1) fling.current = requestAnimationFrame(step)
      else stop()
    }
    fling.current = requestAnimationFrame(step)
  }

  React.useEffect(() => () => cancelAnimationFrame(fling.current), [])

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
        cancelAnimationFrame(fling.current)
        table.reset()
        table.setDensity("comfortable")
        setLocale("en")
        setBig(false)
        setData(users)
      },
    }),
    [table]
  )

  const run = (text: string): boolean => {
    const parsed: ParseResult = isBigDataAlias(text)
      ? { ok: true, command: { kind: "bigData" } }
      : parseCommand(text, commandColumns)
    if (!parsed.ok) {
      announce({
        kind: "miss",
        input: text,
        suggestions: parsed.suggestions
          .slice(0, 3)
          .map((s) => (/million/.test(s) ? BIG_LABEL : s)),
      })
      return false
    }
    const { command } = parsed
    const label = (id: string) =>
      commandColumns.find((column) => column.id === id)?.label ?? id
    const message = describe(command, label)
    if (command.kind === "bigData") {
      showBig()
    } else if (command.kind === "locale") {
      setLocale(command.locale)
      announce({ kind: "done", text: message })
    } else if (big && HEAVY.has(command.kind)) {
      announce({ kind: "busy", text: "Working…" })
      afterPaint(() => {
        applyCommand(command, target, commandColumns)
        afterPaint(() => announce({ kind: "done", text: message }))
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
        examples={EXAMPLES}
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
              onClick={() => setView(option)}
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
        <div
          id={`${viewId}-preview`}
          hidden={view !== "preview"}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <DataTable table={table} />
        </div>
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
