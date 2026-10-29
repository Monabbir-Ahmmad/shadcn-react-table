import { memo, type CSSProperties, type ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { ANATOMY } from "@/lib/anatomy-content"

/*
 * The exploded table: five planes drawn with theme tokens, stacked in 3D.
 * Everything moves from three CSS variables on the container — `--spread`
 * (layers apart), `--flat` (tilt removed) and the stage's `--tilt-x/-y`
 * (pointer) — so the server render already shows the separated stack.
 */

/** The stack's resting tilt, undone by `flat`. */
const TILT_X = 55
const TILT_Z = -32
/** Height between two exploded levels, in px at spread 1. */
const STEP = 62
/** Depth of the blueprint mat under the stack. */
const GROUND = 40
/** How far the active plane lifts out of the stack. Registered so it can
 *  transition on its own: the scroll-driven `--spread` / `--flat` must not
 *  (a transition would make them trail the scroll). */
const LIFT_PROPERTY =
  "@property --lift{syntax:'<length>';inherits:true;initial-value:0px}"

/** Rotation of the stack (shared with the upright callouts, which undo it). */
const STACK_TRANSFORM = `translateY(calc(var(--spread) * 13%)) rotateX(calc((1 - var(--flat)) * ${TILT_X}deg)) rotateZ(calc((1 - var(--flat)) * ${TILT_Z}deg)) rotateY(calc(var(--tilt-x, 0) * 6deg)) rotateX(calc(var(--tilt-y, 0) * -6deg))`
const BILLBOARD_TRANSFORM = `rotateX(calc(var(--tilt-y, 0) * 6deg)) rotateY(calc(var(--tilt-x, 0) * -6deg)) rotateZ(calc((1 - var(--flat)) * ${-TILT_Z}deg)) rotateX(calc((1 - var(--flat)) * ${-TILT_X}deg))`

/** Where each layer sits in the flat table (percent of the frame) and how
 *  high it floats when exploded. Cells float just above the rows they sit in. */
const GEOMETRY: Record<
  (typeof ANATOMY)[number]["id"],
  { top: number; height: number; level: number; shift: number; callout: number }
> = {
  toolbar: { top: 0, height: 11, level: 4, shift: -2, callout: 50 },
  header: { top: 13, height: 9, level: 3, shift: -1, callout: 50 },
  rows: { top: 22, height: 64, level: 1, shift: 0, callout: 72 },
  cells: { top: 22, height: 64, level: 2, shift: 0, callout: 28 },
  footer: { top: 86, height: 11, level: 0, shift: 1.5, callout: 50 },
}

/** The shared column template of the header, rows and cells. */
const COLS = "grid grid-cols-[8%_23%_27%_14%_12%_16%]"
const HEADERS = ["", "Name", "Email", "Status", "Plan", "MRR"]
const ROW_COUNT = 8
/** Skeleton text widths (percent of the cell) per row, per column. */
const WIDTHS = [
  [72, 64, 46, 54, 0],
  [58, 78, 52, 40, 62],
  [80, 56, 46, 58, 44],
  [64, 70, 52, 48, 58],
  [52, 60, 46, 54, 66],
  [0, 74, 52, 40, 50],
  [70, 58, 46, 58, 60],
  [60, 66, 52, 48, 46],
]
const SELECTED = new Set([3, 4])
const PINNED = 0
const EDITING = { row: 5, col: 1 }

const FONT = "font-mono text-[clamp(6px,1.55cqw,10px)] leading-none"

export function AnatomyLayers({
  spread = 0.25,
  flat = 0,
  active = null,
  className,
}: {
  spread?: number
  flat?: number
  active?: number | null
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn("@container w-full select-none", className)}
      data-anatomy-layers=""
    >
      <style href="anatomy-lift" precedence="default">
        {LIFT_PROPERTY}
      </style>
      <div className="relative aspect-[4/3] w-full [perspective:2000px]">
        <div
          className="absolute inset-0 [transform-style:preserve-3d]"
          style={
            {
              "--spread": spread,
              "--flat": flat,
              transform: STACK_TRANSFORM,
            } as CSSProperties
          }
        >
          <Ground />
          {ANATOMY.map((layer, i) => (
            <Plane
              key={layer.id}
              index={i}
              id={layer.id}
              slot={layer.slot}
              active={active === i}
              dim={active !== null && active !== i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/** The blueprint mat the stack stands on; fades as the table lies flat. */
const Ground = memo(function Ground() {
  return (
    <div
      className="absolute -inset-x-[4%] -top-[6%] -bottom-[3%] border border-dashed border-muted-foreground/30"
      style={{
        transform: `translateZ(-${GROUND}px)`,
        opacity: "calc(1 - var(--flat))",
        backgroundImage:
          "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
        backgroundSize: "4cqw 4cqw",
      }}
    >
      {/* The assembled table's footprint, drawn on the mat. */}
      <div className="absolute inset-x-[3.70%] inset-y-[5.5%] border border-muted-foreground/30 bg-foreground/[0.02]" />
    </div>
  )
})

/** One layer. Memoized: scroll only moves the CSS variables above it. */
const Plane = memo(function Plane({
  index,
  id,
  slot,
  active,
  dim,
}: {
  index: number
  id: (typeof ANATOMY)[number]["id"]
  slot: string
  active: boolean
  dim: boolean
}) {
  const g = GEOMETRY[id]
  const z = g.level * STEP
  const glass = id === "cells"
  return (
    <div
      data-layer={index}
      data-active={active ? "" : undefined}
      className="group/plane absolute inset-x-0 [--lift:0px] [transform-style:preserve-3d] data-[active]:[--lift:34px]"
      style={{
        transitionProperty: "--lift",
        transitionDuration: "300ms",
        top: `${g.top}%`,
        height: `${g.height}%`,
        transform: `translateZ(calc(var(--spread) * ${z}px + var(--lift))) translateY(calc(var(--spread) * ${g.shift * 14}px))`,
      }}
    >
      {/* Projection lines from the plane's corners down to the mat. */}
      {(["top-0", "bottom-0"] as const).map((edge) => (
        <span
          key={edge}
          className={cn(
            "absolute -left-px w-px origin-top",
            edge === "top-0" ? "-top-px" : "top-full"
          )}
          style={{
            height: `calc(var(--spread) * ${z}px + var(--lift) + ${GROUND}px)`,
            transform: "rotateX(-90deg)",
            opacity: "calc((1 - var(--flat)) * 0.55)",
            backgroundImage:
              "linear-gradient(to bottom, var(--muted-foreground) 50%, transparent 0)",
            backgroundSize: "1px 5px",
          }}
        />
      ))}

      <div
        className={cn(
          "absolute inset-0 overflow-hidden border transition-[opacity,border-color,background-color] duration-300 motion-reduce:transition-none",
          glass
            ? "border-dashed border-foreground/40 bg-card/55"
            : "border-foreground/20 bg-card",
          active && "border-2 border-solid border-primary",
          dim && "opacity-60"
        )}
      >
        {SKETCHES[id]}
      </div>

      {id === "header" ? <FilterPopover active={active} dim={dim} /> : null}

      <Callout index={index} slot={slot} at={g.callout} />
    </div>
  )
})

/** An upright mono callout with a leader line, pinned to the plane's right
 *  edge, naming the part's `slotProps` key. It undoes the stack's rotation so
 *  it always faces the reader. */
function Callout({
  index,
  slot,
  at,
}: {
  index: number
  slot: string
  at: number
}) {
  return (
    // Laid out in positive coordinates only: Chrome clips a 3D layer's
    // overflow above or left of its box.
    <div
      className="absolute left-[calc(100%-3px)] flex h-4 items-center whitespace-nowrap text-foreground/65 group-data-[active]/plane:text-foreground"
      style={{
        top: `calc(${at}% - 0.5rem)`,
        transform: BILLBOARD_TRANSFORM,
        transformOrigin: "3px 50%",
      }}
    >
      <span className="size-[6px] shrink-0 rounded-full border border-current bg-background group-data-[active]/plane:border-primary group-data-[active]/plane:bg-primary" />
      <span className="h-px w-[clamp(14px,5cqw,40px)] bg-current opacity-50 group-data-[active]/plane:bg-primary group-data-[active]/plane:opacity-100" />
      <span className="ml-1.5 font-mono text-[clamp(9px,2cqw,12px)] leading-none group-data-[active]/plane:font-medium">
        <span className="text-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>{" "}
        {slot.replace(/^slotProps\./, "")}
      </span>
    </div>
  )
}

/** Small bordered glyph square (toolbar and footer buttons). */
function Square({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative flex aspect-square h-[58%] items-center justify-center border bg-background",
        className
      )}
    >
      {children}
    </span>
  )
}

/** A text stand-in: a thin rounded bar. */
function Bar({ w, className }: { w: number; className?: string }) {
  return (
    <span
      className={cn(
        "block h-[clamp(2px,0.75cqw,5px)] rounded-full bg-muted-foreground/35",
        className
      )}
      style={{ width: `${w}%` }}
    />
  )
}

function ToolbarSketch() {
  return (
    <div className="flex h-full items-center gap-[2%] px-[2.5%]">
      {/* Search field */}
      <span className="flex h-[58%] w-[34%] items-center gap-[6%] border bg-background px-[2.5%]">
        <span className="aspect-square h-[42%] rounded-full border-[1.5px] border-muted-foreground/60" />
        <span className={cn(FONT, "text-muted-foreground")}>
          Search 1M rows…
        </span>
      </span>
      {/* Filter chip */}
      <span
        className={cn(
          FONT,
          "flex h-[58%] items-center gap-[0.6em] border border-dashed border-muted-foreground/50 px-[1.5%] text-muted-foreground"
        )}
      >
        <span className="size-[0.6em] bg-primary" />
        Status: active
      </span>
      <span className="flex-1" />
      <Square>
        <span className="flex w-[50%] flex-col gap-[2px]">
          <Bar w={100} className="h-px rounded-none bg-muted-foreground" />
          <Bar w={100} className="h-px rounded-none bg-muted-foreground" />
          <Bar w={100} className="h-px rounded-none bg-muted-foreground" />
        </span>
      </Square>
      <Square>
        <span className="flex h-[48%] w-[50%] gap-[2px]">
          <span className="flex-1 border border-muted-foreground" />
          <span className="flex-1 border border-muted-foreground" />
        </span>
      </Square>
      <Square>
        <span className="size-[46%] border-x-[1.5px] border-b-[1.5px] border-muted-foreground" />
        <span className="absolute top-[22%] h-[38%] w-[1.5px] bg-muted-foreground" />
      </Square>
      <Square>
        <span className="size-[48%] border-[1.5px] border-dashed border-muted-foreground" />
      </Square>
    </div>
  )
}

function HeaderSketch() {
  return (
    <div className={cn(COLS, "h-full bg-muted/60")}>
      {HEADERS.map((label, c) => (
        <span
          key={c}
          className={cn(
            FONT,
            "flex items-center gap-[0.5em] border-r px-[6%] font-semibold text-foreground last:border-r-0",
            c === 5 && "justify-end",
            c === 3 && "bg-background"
          )}
        >
          {c === 0 ? (
            <span className="aspect-square h-[34%] border border-muted-foreground/70 bg-background" />
          ) : (
            <>
              {label}
              {c === 1 ? <span className="text-primary">↑1</span> : null}
              {c === 5 ? <span className="text-primary">↓2</span> : null}
              {c === 2 || c === 4 ? (
                <span className="text-muted-foreground/60">↕</span>
              ) : null}
              {c === 3 ? <span className="text-primary">▾</span> : null}
            </>
          )}
        </span>
      ))}
    </div>
  )
}

/** The filter-mode menu floating above the Status header. */
function FilterPopover({ active, dim }: { active: boolean; dim: boolean }) {
  return (
    <div
      className={cn(
        "absolute bottom-[78%] left-[58%] w-[19%] border bg-popover p-[0.6%] shadow-sm transition-[opacity,border-color] duration-300 motion-reduce:transition-none",
        active && "border-primary",
        dim && "opacity-60"
      )}
      style={{ transform: "translateZ(calc(var(--spread) * 26px))" }}
    >
      {["Contains", "Fuzzy", "Equals"].map((mode) => (
        <span
          key={mode}
          className={cn(
            FONT,
            "flex items-center justify-between px-[6%] py-[5%] text-muted-foreground",
            mode === "Fuzzy" && "bg-muted text-foreground"
          )}
        >
          {mode}
          {mode === "Fuzzy" ? <span className="text-primary">✓</span> : null}
        </span>
      ))}
    </div>
  )
}

function RowsSketch() {
  return (
    <div className="flex h-full flex-col">
      {Array.from({ length: ROW_COUNT }, (_, r) => {
        const selected = SELECTED.has(r)
        return (
          <div
            key={r}
            className={cn(
              COLS,
              "relative flex-1 border-b last:border-b-0",
              r === PINNED && "border-b-muted-foreground/40 bg-muted",
              selected && "bg-primary/15"
            )}
          >
            {selected ? (
              <span className="absolute inset-y-0 left-0 w-[3px] bg-primary" />
            ) : null}
            <span className="flex items-center gap-[12%] pl-[14%]">
              {/* Drag handle */}
              <span className="grid aspect-[2/3] h-[34%] grid-cols-2 gap-px">
                {Array.from({ length: 6 }, (_, d) => (
                  <span
                    key={d}
                    className="rounded-full bg-muted-foreground/50"
                  />
                ))}
              </span>
              {/* Selection box */}
              <span
                className={cn(
                  "aspect-square h-[34%] border",
                  selected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/60 bg-background"
                )}
              />
            </span>
            {r === PINNED ? (
              <span
                className={cn(
                  FONT,
                  "absolute inset-y-0 right-[2%] flex items-center gap-[0.4em] text-muted-foreground"
                )}
              >
                <span className="size-[0.7em] rotate-45 border-[1.5px] border-foreground" />
                pinned
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function CellsSketch() {
  return (
    <div className="flex h-full flex-col">
      {WIDTHS.map((row, r) => (
        <div
          key={r}
          className={cn(
            COLS,
            "flex-1 border-b border-dashed border-muted-foreground/25 last:border-b-0"
          )}
        >
          <span className="border-r border-dashed border-muted-foreground/25" />
          {row.map((w, c) => {
            const col = c + 1
            if (r === EDITING.row && col === EDITING.col) {
              return (
                <span key={c} className="relative">
                  <span
                    className={cn(
                      FONT,
                      "absolute inset-[10%] flex items-center border-2 border-primary bg-background px-[6%] text-foreground"
                    )}
                  >
                    Ada Lovelace
                    <span className="ml-px h-[1.1em] w-px bg-foreground" />
                  </span>
                </span>
              )
            }
            return (
              <span
                key={c}
                className={cn(
                  "flex items-center border-r border-dashed border-muted-foreground/25 px-[6%] last:border-r-0",
                  col === 5 && "justify-end"
                )}
              >
                {col === 3 ? (
                  <span className="flex h-[38%] w-[78%] items-center gap-[10%] rounded-full border border-muted-foreground/40 px-[8%]">
                    <span
                      className={cn(
                        "aspect-square h-[42%] rounded-full",
                        r % 3 === 1 ? "bg-muted-foreground/50" : "bg-primary"
                      )}
                    />
                    <Bar w={w} />
                  </span>
                ) : (
                  <Bar
                    w={w}
                    className={col === 1 ? "bg-foreground/55" : undefined}
                  />
                )}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function FooterSketch() {
  return (
    <div className="flex h-full items-center gap-[1.5%] bg-muted/40 px-[2.5%]">
      <span className={cn(FONT, "text-muted-foreground")}>
        1–10 of 1,000,000
      </span>
      <span className="flex-1" />
      <span className={cn(FONT, "mr-[1.5%] text-muted-foreground")}>
        Rows <span className="text-foreground">10 ▾</span>
      </span>
      <Square>
        <span className={cn(FONT, "text-muted-foreground")}>‹</span>
      </Square>
      {["1", "2", "3"].map((page) => (
        <Square
          key={page}
          className={page === "1" ? "border-primary" : undefined}
        >
          <span
            className={cn(
              FONT,
              page === "1" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {page}
          </span>
        </Square>
      ))}
      <Square>
        <span className={cn(FONT, "text-muted-foreground")}>›</span>
      </Square>
    </div>
  )
}

const SKETCHES: Record<(typeof ANATOMY)[number]["id"], ReactNode> = {
  toolbar: <ToolbarSketch />,
  header: <HeaderSketch />,
  rows: <RowsSketch />,
  cells: <CellsSketch />,
  footer: <FooterSketch />,
}
