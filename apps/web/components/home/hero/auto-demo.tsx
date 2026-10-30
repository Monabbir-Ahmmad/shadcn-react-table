"use client"

import * as React from "react"
import {
  RiArrowDownLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowUpDownLine,
  RiCheckLine,
  RiCloseLine,
  RiFilter3Line,
  RiLayoutColumnLine,
  RiSearchLine,
} from "@remixicon/react"

import { cn } from "@workspace/ui/lib/utils"

import {
  DEMO_ROWS,
  DEMO_SCENES,
  SCENE_MS,
  STILL_FRAME,
  demoFrame,
  demoPosition,
  formatSalary,
  type DemoEdit,
  type DemoFrame,
  type DemoRow,
} from "@/lib/auto-demo"

/** Row, header and selection-bar heights, in px. */
const ROW_H = 44
const HEAD_H = 36
const BAR_H = 36
/** How often the clock ticks (the typing is the fastest change, ~190 ms). */
const TICK_MS = 50
const LOOP_MS = SCENE_MS * DEMO_SCENES.length

const COLS =
  "grid grid-cols-[2.25rem_minmax(0,1fr)_5.25rem_5.75rem] sm:grid-cols-[2.75rem_minmax(0,1fr)_6.5rem_7rem]"
/** The slide every moving part shares: unhurried, settles softly. */
const EASE =
  "duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"

const REDUCED = "(prefers-reduced-motion: reduce)"
function subscribe(onChange: () => void) {
  const media = window.matchMedia(REDUCED)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}
/** False on the server and during hydration. */
function useReducedMotion() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED).matches,
    () => false
  )
}

const sameFrame = (a: DemoFrame, b: DemoFrame) =>
  JSON.stringify(a) === JSON.stringify(b)

/**
 * The hero's table: a lookalike drawn with theme tokens that sorts, filters,
 * selects and edits on a loop. It pauses while hovered, focused or off
 * screen, and holds one still frame for people who asked for less motion.
 */
export function AutoDemo({ className }: { className?: string }) {
  const ref = React.useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
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
  const count = shown.selected.length

  return (
    <figure
      ref={ref}
      tabIndex={0}
      aria-label="A data table that sorts, filters, selects and edits on its own. Hover or focus it to pause."
      data-auto-demo=""
      data-scene={scene.id}
      className={cn("group/demo outline-none", className)}
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
      <div
        aria-hidden
        className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow group-focus-visible/demo:ring-3 group-focus-visible/demo:ring-ring/50"
      >
        <Toolbar filtered={shown.filtered} />
        <div
          className="relative overflow-hidden"
          style={{ height: HEAD_H + ROW_H * DEMO_ROWS.length }}
        >
          {/* The selection bar pushes the table down; the filter has made
              room for it by then. */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 flex items-center justify-between border-b bg-muted/60 px-3 text-xs transition-[opacity,translate]",
              EASE,
              count
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            )}
            style={{ height: BAR_H }}
          >
            <span className="font-medium text-foreground">
              {/* Keeps its last count while it slides away. */}
              {count || STILL_FRAME.selected.length} selected
            </span>
            <span className="text-muted-foreground">Clear selection</span>
          </div>
          <div
            className={cn("transition-transform", EASE)}
            style={{ transform: `translateY(${count ? BAR_H : 0}px)` }}
          >
            <Header sorted={shown.sorted} />
            <div
              className="relative"
              style={{ height: ROW_H * DEMO_ROWS.length }}
            >
              {DEMO_ROWS.map((row) => (
                <Row
                  key={row.id}
                  row={row}
                  frame={shown}
                  edit={shown.edit?.id === row.id ? shown.edit : null}
                />
              ))}
            </div>
          </div>
        </div>
        <Footer count={shown.rows.length} />
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

function Toolbar({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex h-12 items-center gap-2 border-b px-3">
      <span className="flex h-7 max-w-36 min-w-0 flex-1 items-center gap-1.5 rounded-md border bg-background px-2 text-xs text-muted-foreground">
        <RiSearchLine className="size-3.5 shrink-0" />
        <span className="truncate">Search…</span>
      </span>
      <span
        className={cn(
          "flex h-7 shrink-0 items-center gap-1.5 rounded-md border bg-muted/60 ps-2 pe-1.5 text-xs transition-[opacity,translate]",
          EASE,
          filtered ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
        )}
      >
        <span className="text-muted-foreground">Status</span>
        <span className="font-medium">active</span>
        <RiCloseLine className="size-3.5 text-muted-foreground" />
      </span>
      <span className="ms-auto flex shrink-0 items-center gap-1">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-md transition-colors",
            filtered ? "bg-muted text-foreground" : "text-muted-foreground"
          )}
        >
          <RiFilter3Line className="size-4" />
        </span>
        <span className="flex size-7 items-center justify-center rounded-md text-muted-foreground">
          <RiLayoutColumnLine className="size-4" />
        </span>
      </span>
    </div>
  )
}

function Header({ sorted }: { sorted: boolean }) {
  return (
    <div
      className={cn(COLS, "items-center border-b bg-muted/40 text-xs")}
      style={{ height: HEAD_H }}
    >
      <span className="flex justify-center">
        <Checkbox checked={false} />
      </span>
      <span className="font-medium">Name</span>
      <span className="font-medium">Status</span>
      <span className="flex items-center justify-end gap-1 pe-3 font-medium sm:pe-4">
        Salary
        {sorted ? (
          <RiArrowDownLine className="size-3.5 text-foreground" />
        ) : (
          <RiArrowUpDownLine className="size-3.5 text-muted-foreground/60" />
        )}
      </span>
    </div>
  )
}

function Row({
  row,
  frame,
  edit,
}: {
  row: DemoRow
  frame: DemoFrame
  edit: DemoEdit | null
}) {
  const visible = frame.rows.includes(row.id)
  // Visible rows stack in order; a filtered-out row fades where it stood.
  const index = visible
    ? frame.rows.indexOf(row.id)
    : frame.order.indexOf(row.id)
  const selected = frame.selected.includes(row.id)
  return (
    <div
      className={cn(
        COLS,
        "absolute inset-x-0 top-0 items-center border-b text-[13px] transition-[translate,opacity,background-color]",
        EASE,
        selected && "bg-muted/70",
        !visible && "opacity-0"
      )}
      style={{
        height: ROW_H,
        translate: `0 ${index * ROW_H}px`,
        // translate, opacity, background: a filtered-out row fades quickly so
        // the rows sliding up into its place never read through it.
        transitionDuration: visible
          ? "500ms, 400ms, 300ms"
          : "500ms, 160ms, 300ms",
      }}
    >
      <span className="flex justify-center">
        <Checkbox checked={selected} />
      </span>
      <span className="truncate pe-3 font-medium">{row.name}</span>
      <span>
        <Status status={row.status} />
      </span>
      <span className="flex justify-end pe-1.5 font-mono text-xs tabular-nums sm:pe-2.5">
        {edit?.editing ? (
          <span className="flex h-7 w-full items-center justify-end rounded-md border border-primary bg-background px-1.5 ring-3 ring-primary/15">
            <span className={cn(edit.selectAll && "bg-primary/20")}>
              {edit.text}
            </span>
            {edit.selectAll ? null : (
              <span className="ms-px h-3.5 w-px bg-foreground" />
            )}
          </span>
        ) : (
          <span className="px-1.5">
            {edit?.text ?? formatSalary(row.salary)}
          </span>
        )}
      </span>
    </div>
  )
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex size-3.5 items-center justify-center rounded-[4px] border transition-colors duration-200",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-background"
      )}
    >
      <RiCheckLine
        className={cn(
          "size-3 transition-opacity duration-200",
          checked ? "opacity-100" : "opacity-0"
        )}
      />
    </span>
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

function Footer({ count }: { count: number }) {
  return (
    <div className="flex h-11 items-center justify-between border-t px-3 font-mono text-[11px] text-muted-foreground">
      <span>
        1–{count} of {count}
      </span>
      <span className="flex items-center gap-1">
        <span className="me-2">Rows 10</span>
        <span className="flex size-6 items-center justify-center rounded-md border opacity-50">
          <RiArrowLeftSLine className="size-3.5" />
        </span>
        <span className="flex size-6 items-center justify-center rounded-md border opacity-50">
          <RiArrowRightSLine className="size-3.5" />
        </span>
      </span>
    </div>
  )
}
