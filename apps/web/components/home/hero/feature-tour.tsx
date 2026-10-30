"use client"

import * as React from "react"
import {
  DataTable,
  useDataTable,
  type DataTableColumnDef,
} from "@monabbir/shadcn-react-table/components/data-table"

import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"

import {
  HERO_ROWS,
  formatJoined,
  formatSalary,
  initials,
  type HeroRow,
  type HeroStatus,
} from "@/lib/hero-rows"
import {
  APPLY_AT,
  SCENE_MS,
  STILL_FRAME,
  TOUR_SCENES,
  tourFrame,
  tourPosition,
  type TourFrame,
} from "@/lib/hero-tour"

/** How often the clock ticks (the typing is the fastest change). */
const TICK_MS = 50
const LOOP_MS = SCENE_MS * TOUR_SCENES.length

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

const sameFrame = (a: TourFrame, b: TourFrame) =>
  JSON.stringify(a) === JSON.stringify(b)

/**
 * The hero's feature tour: the real table plays one feature after another
 * (the list beside it says which, and jumps to one when clicked). It pauses
 * while the pointer is on the table or the tour is off screen, and holds one
 * still frame for people who asked for less motion.
 */
export function FeatureTour() {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false)
  const [elapsed, setElapsed] = React.useState(0)
  const [visible, setVisible] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const running = visible && !hovered && !reduced

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? false)
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!running) return
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      // A throttled background tab resumes where it was, not scenes later.
      const step = Math.min(now - last, 250)
      last = now
      setElapsed((e) => (e + step) % LOOP_MS)
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [running])

  const { scene, t } = tourPosition(elapsed)
  const next = tourFrame(scene, t)
  const [frame, setFrame] = React.useState(next)
  if (!sameFrame(frame, next)) setFrame(next)
  const shown = reduced ? STILL_FRAME : frame
  const active = TOUR_SCENES[shown.scene]!
  const listRef = React.useRef<HTMLDivElement>(null)

  // Phones show the tabs as a strip that scrolls sideways: keep the playing
  // feature in it.
  React.useEffect(() => {
    const list = listRef.current
    const tab = list?.children[shown.scene] as HTMLElement | undefined
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return
    list.scrollTo({
      left: tab.offsetLeft - list.offsetLeft,
      behavior: "smooth",
    })
  }, [shown.scene])

  return (
    <Tabs
      ref={ref}
      data-feature-tour=""
      data-scene={active.id}
      value={active.id}
      onValueChange={(id) => {
        const i = TOUR_SCENES.findIndex((s) => s.id === id)
        // Just past the switch, so the feature shows at once.
        if (i !== -1) setElapsed(i * SCENE_MS + APPLY_AT * SCENE_MS)
      }}
      className="relative gap-0"
    >
      {/* A soft glow in the accent behind the card. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -top-10 -bottom-6 -z-10 rounded-[3rem] bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_70%)] blur-2xl"
      />
      <div className="overflow-hidden rounded-xl border bg-card/80 shadow-2xl ring-1 shadow-black/5 ring-foreground/5 backdrop-blur-sm dark:shadow-black/40">
        <TabsList
          ref={listRef}
          aria-label="Features"
          variant="line"
          className="h-auto w-full justify-start gap-0 overflow-x-auto border-b bg-muted/40 px-2 py-0"
        >
          {TOUR_SCENES.map((s, i) => (
            <TabsTrigger
              key={s.id}
              value={s.id}
              className="h-11 flex-none overflow-hidden lg:flex-1"
            >
              {s.label}
              {i === shown.scene && !reduced && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
                  style={{ transform: `scaleX(${t})` }}
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* One panel for every tab: the same table plays each feature. */}
        <TabsContent value={active.id} forceMount className="p-3 sm:p-4">
          <figure
            className="min-w-0"
            aria-label="The data table showing each feature in turn. Point at it to pause."
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setHovered(true)
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") setHovered(false)
            }}
          >
            {/* Played, not used. */}
            <div inert>
              <TourTable frame={shown} />
            </div>
            <figcaption data-tour-caption="" className="sr-only">
              {String(shown.scene + 1).padStart(2, "0")} {active.label}:{" "}
              {active.option}
            </figcaption>
          </figure>
        </TabsContent>
      </div>
    </Tabs>
  )
}

/** The draft the script is typing, for the salary cell's editor. */
const DraftContext = React.createContext<TourFrame["edit"]>(null)

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

/** One hue per person, for the avatar. */
const AVATAR_HUES = [145, 250, 25, 300, 200, 60, 330, 175, 280, 95]

const columns: DataTableColumnDef<HeroRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    // A group row stands for several people: no one name.
    cell: ({ row }) =>
      row.getIsGrouped() ? null : <Person row={row.original} />,
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ getValue }) => (
      <Badge variant="outline">{getValue<string>()}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <Status status={getValue<HeroStatus>()} />,
    meta: {
      filterVariant: "select",
      filterSelectOptions: [
        { label: "active", value: "active" },
        { label: "invited", value: "invited" },
        { label: "paused", value: "paused" },
      ],
    },
  },
  {
    accessorKey: "joined",
    header: "Joined",
    cell: ({ getValue }) => {
      const joined = getValue<unknown>()
      // A group row has no single date.
      return typeof joined === "string" && !Number.isNaN(Date.parse(joined)) ? (
        <span className="text-muted-foreground tabular-nums">
          {formatJoined(joined)}
        </span>
      ) : null
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    aggregationFn: "mean",
    cell: ({ getValue }) => <Rating value={getValue<number>()} />,
    meta: {
      renderAggregatedCell: ({ cell }) => (
        <Rating value={cell.getValue<number>()} />
      ),
    },
  },
  {
    accessorKey: "salary",
    header: "Salary",
    size: 120,
    cell: ({ getValue }) => (
      <span className="font-mono text-xs tabular-nums">
        {formatSalary(getValue<number>())}
      </span>
    ),
    meta: {
      align: "right",
      renderEditCell: () => <SalaryDraft />,
      renderAggregatedCell: ({ cell }) => (
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {formatSalary(cell.getValue<number>())}
        </span>
      ),
    },
  },
]

/** The real table, its state set from the tour's frame. */
function TourTable({ frame }: { frame: TourFrame }) {
  // Phones: Name and Salary only, so the table fits without scrolling.
  const wide = useMedia("(min-width: 640px)", true)
  // Joined and Rating from large screens up.
  const large = useMedia("(min-width: 1024px)", true)
  const edit = frame.edit
  // Saved: the new salary is in the data, as an editing save would put it.
  const savedId = edit && !edit.editing ? edit.id : null
  const savedText = edit && !edit.editing ? edit.text : null
  const data = React.useMemo(
    () =>
      HERO_ROWS.map((row) =>
        row.id === savedId && savedText
          ? { ...row, salary: Number(savedText) }
          : row
      ),
    [savedId, savedText]
  )

  const hidden = new Set(frame.hidden)
  const sceneId = TOUR_SCENES[frame.scene]?.id
  const table = useDataTable<HeroRow>({
    data,
    columns,
    getRowId: (row) => row.id,
    // Phones have room for one extra column: the checkboxes only while
    // selecting.
    enableRowSelection: wide || sceneId === "select",
    enableGrouping: true,
    // The pin buttons only while that scene plays.
    enableRowPinning: sceneId === "pin",
    enableEditing: true,
    editDisplayMode: "cell",
    enablePagination: false,
    enableColumnActions: false,
    enableFullscreenToggle: false,
    positionToolbarDropZone: "none",
    // A fixed height, like an app's window: the page never shifts as the
    // scenes change, and the tallest (grouped) scrolls inside.
    enableStickyHeader: true,
    slotProps: {
      surface: {
        // Makes room for the selection banner above it.
        className: cn(
          "max-h-none",
          frame.selected.length > 0 ? "h-[calc(34rem-42px)]" : "h-[34rem]"
        ),
      },
    },
    state: {
      sorting: frame.sorted ? [{ id: "salary", desc: true }] : [],
      columnFilters: frame.filtered ? [{ id: "status", value: "active" }] : [],
      showColumnFilters: frame.filtered,
      globalFilter: frame.search,
      showGlobalFilter: frame.search !== "",
      rowSelection: Object.fromEntries(frame.selected.map((id) => [id, true])),
      editingCell: edit?.editing
        ? { rowId: edit.id, columnId: "salary" }
        : null,
      grouping: frame.grouped ? ["team"] : [],
      expanded: true,
      rowPinning: { top: frame.pinned, bottom: [] },
      density: frame.compact ? "compact" : "comfortable",
      columnVisibility: {
        team: wide && !hidden.has("team"),
        status: wide && !hidden.has("status"),
        joined: large && !hidden.has("joined"),
        rating: large,
      },
    },
  })

  return (
    <DraftContext value={edit}>
      <DataTable table={table} />
    </DraftContext>
  )
}

function Person({ row }: { row: HeroRow }) {
  const hue = AVATAR_HUES[Number(row.id.slice(1)) % AVATAR_HUES.length]
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
        style={{
          backgroundColor: `oklch(0.9 0.06 ${hue})`,
          color: `oklch(0.35 0.1 ${hue})`,
        }}
      >
        {initials(row.name)}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{row.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {row.email}
        </span>
      </span>
    </span>
  )
}

function Rating({ value }: { value?: number }) {
  if (value === undefined) return null
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {Math.round(value)}
      </span>
    </span>
  )
}

function Status({ status }: { status?: HeroStatus }) {
  // A group row has no single status.
  if (!status) return null
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
