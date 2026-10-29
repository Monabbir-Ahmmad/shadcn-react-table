"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import styles from "@/style-kits/styles.json"
import { SectionLabel } from "@/components/home/section-label"
import {
  DeckPickers,
  type DeckChoice,
} from "@/components/home/deck/deck-pickers"
import { coverflow, deckSlot, frameTheme, STYLE_DEFAULT } from "@/lib/deck"
import { BASE_COLORS, FONTS, ICON_LIBS } from "@/lib/theme-presets"
import { DEFAULT_PREFS, readPrefs } from "@/lib/theme-store"
import { isFromFrame, type ToFrame } from "@/lib/style-frame-protocol"

const STYLES: { name: string; label: string }[] = styles
const COUNT = STYLES.length
const STEP = 360 / COUNT
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** What sets each style apart, read from its components. */
const NOTES: Record<string, string> = {
  vega: "The classic shadcn look",
  nova: "Tighter padding, compact",
  maia: "Soft, rounded, roomy",
  lyra: "Boxy and sharp, small type",
  mira: "Dense, for busy screens",
  sera: "Sharp, editorial, uppercase",
}

/** The width the frame's table needs to fit without scrolling sideways. */
const FRAME_WIDTH = 920
/** Below this the table would be unreadable, so it scrolls inside instead. */
const MIN_SCALE = 0.55
/** A frame's height until it reports its own (the 5-row table, about). */
const FALLBACK_HEIGHT = 384
/** The card's label bar (h-9) plus its top and bottom borders. */
const CHROME = 38

/** 3D rotation only on md+ screens for people who have not asked for less motion. */
const QUERY = "(min-width: 48rem) and (prefers-reduced-motion: no-preference)"
function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}
function use3d() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}

const mod = (n: number) => ((n % COUNT) + COUNT) % COUNT

type Drag = { x: number; start: number; moved: boolean }

/**
 * "One table. Every shadcn style.": the real table in each of the six shadcn
 * styles, each in its own frame, on a carousel you can rotate. The pickers
 * restyle all six frames at once.
 */
export function StyleDeck() {
  const { resolvedTheme } = useTheme()
  const is3d = use3d()
  const [choice, setChoice] = React.useState<DeckChoice>({
    ...DEFAULT_PREFS,
    font: STYLE_DEFAULT,
    radius: STYLE_DEFAULT,
  })
  const [rotation, setRotation] = React.useState(0)
  // The rotation a drag started from, or null when not dragging.
  const [dragFrom, setDragFrom] = React.useState<number | null>(null)
  const dragging = dragFrom !== null
  const [heights, setHeights] = React.useState<Record<string, number>>({})
  const [cardWidth, setCardWidth] = React.useState(0)
  const [near, setNear] = React.useState(false)
  const [flatFront, setFlatFront] = React.useState(0)

  const sectionRef = React.useRef<HTMLElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const cards = React.useRef<(HTMLDivElement | null)[]>([])
  const frames = React.useRef(new Map<string, HTMLIFrameElement>())
  const greeted = React.useRef(new Set<string>())
  const drag = React.useRef<Drag | null>(null)

  const dark = resolvedTheme === "dark"
  // The latest picks, read when a frame asks for its theme (no stale closure).
  const latest = React.useRef({ choice, dark })

  /** Sends one frame its style's theme for the current picks. */
  const send = React.useCallback((name: string, frame: HTMLIFrameElement) => {
    const { choice, dark } = latest.current
    const message: ToFrame = {
      type: "srt:theme",
      theme: frameTheme(choice, name, dark),
    }
    frame.contentWindow?.postMessage(message, window.location.origin)
  }, [])

  // Start from the site's own base color, accent and icons; font and radius
  // start as each style's own.
  React.useEffect(() => {
    const { accent, base, icons } = readPrefs()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice((c) => ({ ...c, accent, base, icons }))
  }, [])

  // Restyle every frame whenever a picker or the site's light/dark changes.
  React.useEffect(() => {
    latest.current = { choice, dark }
    for (const [name, frame] of frames.current) send(name, frame)
  }, [choice, dark, send])

  // Frames report their height; the first report means a frame is listening,
  // so that is when it gets the theme.
  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isFromFrame(event.data))
        return
      for (const [name, frame] of frames.current) {
        if (event.source !== frame.contentWindow) continue
        const height = event.data.height
        setHeights((h) => (h[name] === height ? h : { ...h, [name]: height }))
        if (!greeted.current.has(name)) {
          greeted.current.add(name)
          send(name, frame)
        }
        return
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [send])

  // Load the frames only once the section is within a screen of view.
  React.useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: "100% 0px" }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  // Cards are sized by CSS; the frames inside scale to fit them.
  React.useEffect(() => {
    const card = cards.current[0]
    if (!card) return
    const observer = new ResizeObserver(() => setCardWidth(card.clientWidth))
    observer.observe(card)
    return () => observer.disconnect()
  }, [is3d])

  const scale = cardWidth
    ? Math.max(MIN_SCALE, Math.min(1, cardWidth / FRAME_WIDTH))
    : 1
  const frameWidth = cardWidth ? cardWidth / scale : FRAME_WIDTH
  const bodyHeight = (name: string) =>
    Math.ceil((heights[name] ?? FALLBACK_HEIGHT) * scale)
  const stageHeight =
    CHROME + Math.max(...STYLES.map((s) => bodyHeight(s.name)))

  // Exactly half a step from two cards, neither is in front; the nearer
  // whole step decides.
  const slotFront = STYLES.findIndex(
    (_, i) => deckSlot(i, rotation, COUNT).front
  )
  const front = is3d
    ? slotFront === -1
      ? mod(Math.round(rotation))
      : slotFront
    : flatFront
  // What screen readers hear: the settled front card, not every drag frame.
  const settled = is3d && dragFrom !== null ? mod(dragFrom) : front
  const go = (delta: number) => setRotation((r) => Math.round(r) + delta)

  /** Turn (or, when flat, scroll) to a style by the shortest way. */
  const goTo = (index: number) => {
    if (is3d) {
      setRotation((r) => {
        const at = Math.round(r)
        let delta = mod(index - at)
        if (delta > COUNT / 2) delta -= COUNT
        return at + delta
      })
      return
    }
    const stage = stageRef.current
    const card = cards.current[index]
    if (!stage || !card) return
    const smooth = window.matchMedia("(prefers-reduced-motion: no-preference)")
    stage.scrollTo({
      left: card.offsetLeft - parseFloat(getComputedStyle(stage).paddingLeft),
      behavior: smooth.matches ? "smooth" : "auto",
    })
  }

  // When flat, the style most in view counts as the front one.
  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (is3d || !cardWidth) return
    const index = Math.round(event.currentTarget.scrollLeft / (cardWidth + 18))
    setFlatFront(Math.min(COUNT - 1, Math.max(0, index)))
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!is3d || event.target !== event.currentTarget) return
    if (event.key === "ArrowLeft") go(-1)
    else if (event.key === "ArrowRight") go(1)
    else return
    event.preventDefault()
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!is3d || !event.isPrimary || event.button !== 0) return
    drag.current = {
      x: event.clientX,
      start: Math.round(rotation),
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dx = event.clientX - d.x
    if (!d.moved && Math.abs(dx) < 5) return
    if (!d.moved) {
      d.moved = true
      setDragFrom(d.start)
    }
    // Dragging about two thirds of a card turns the deck by one card.
    setRotation(d.start - dx / Math.max(cardWidth * 0.65, 160))
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (d.moved) {
      setDragFrom(null)
      setRotation((r) => {
        const target = Math.round(r)
        // A short flick still moves one card.
        if (target === d.start && Math.abs(r - d.start) > 0.12)
          return d.start + Math.sign(r - d.start)
        return target
      })
      return
    }
    // A click beside the front card turns to the card on that side.
    const box = event.currentTarget.getBoundingClientRect()
    const offset = event.clientX - (box.left + box.width / 2)
    if (Math.abs(offset) > cardWidth / 2) go(Math.sign(offset))
  }

  // The browser took the pointer (say, a touch that became a page scroll):
  // settle any drag in progress, and never treat it as a click.
  const onPointerCancel = () => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    setDragFrom(null)
    setRotation((r) => Math.round(r))
  }

  const base = BASE_COLORS.find((b) => b.name === choice.base) ?? BASE_COLORS[0]
  const icons = ICON_LIBS.find((i) => i.name === choice.icons) ?? ICON_LIBS[0]
  /** A card's effective values (its own font and radius by default). */
  const captionFor = (index: number) => {
    const shown = frameTheme(choice, STYLES[index]?.name ?? "", dark)
    const font = FONTS.find((f) => f.name === shown.font) ?? FONTS[0]
    return [
      STYLES[index]?.label,
      base?.label,
      icons?.label,
      font?.label,
      shown.radius,
    ].join(" · ")
  }

  return (
    <section
      ref={sectionRef}
      id="styles"
      aria-labelledby="styles-title"
      className="-mt-px scroll-mt-14 overflow-x-clip border-t"
    >
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 md:pt-24 lg:px-8">
        <div className="grid gap-x-12 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
          <div>
            <SectionLabel index="→">Every shadcn style</SectionLabel>
            <h2
              id="styles-title"
              className="mt-4 font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl"
            >
              One table. Every shadcn style.
            </h2>
          </div>
          <p className="text-base text-pretty text-muted-foreground lg:pb-1.5">
            The block installs in your project&apos;s style; here it is in all
            six.
          </p>
        </div>
        <div className="mt-10 border-t pt-6 md:mt-12">
          <DeckPickers value={choice} onChange={setChoice} dark={dark} />
        </div>
      </div>

      <div
        ref={stageRef}
        role="group"
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label="The data table in six shadcn styles"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onScroll={onScroll}
        className={cn(
          "group/deck outline-none",
          !is3d &&
            "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
          is3d
            ? "[container-type:inline-size] relative mx-auto mt-12 max-w-[96rem] touch-pan-y select-none [perspective:1800px]"
            : "relative mt-10 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:scroll-px-6 sm:px-6 lg:scroll-px-[max(2rem,calc((100%_-_72rem)/2_+_2rem))] lg:px-[max(2rem,calc((100%_-_72rem)/2_+_2rem))]"
        )}
        style={
          is3d
            ? ({
                height: stageHeight,
                cursor: dragging ? "grabbing" : "grab",
                "--deck-w": "clamp(28rem, 60cqw, 52rem)",
              } as React.CSSProperties)
            : undefined
        }
      >
        <div
          className={cn(
            is3d && "absolute inset-0 [transform-style:preserve-3d]",
            !is3d && "contents"
          )}
        >
          {STYLES.map((style, i) => {
            const slot = deckSlot(i, rotation, COUNT)
            const isFront = is3d ? slot.front : true
            const hidden = is3d && !slot.front
            const place = coverflow(slot.angle / STEP)
            return (
              <div
                key={style.name}
                ref={(node) => {
                  cards.current[i] = node
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${style.label}, ${i + 1} of ${COUNT}`}
                aria-hidden={hidden || undefined}
                inert={hidden}
                className={cn(
                  "flex flex-col border bg-background",
                  is3d &&
                    isFront &&
                    "group-focus-visible/deck:ring-2 group-focus-visible/deck:ring-ring/50",
                  is3d
                    ? "absolute top-0 left-1/2"
                    : "w-[85vw] shrink-0 snap-start md:w-[40rem]",
                  is3d && !isFront && "pointer-events-none",
                  is3d &&
                    !dragging &&
                    "transition-[transform,opacity,visibility] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                )}
                style={
                  is3d
                    ? {
                        width: "var(--deck-w)",
                        marginLeft: "calc(var(--deck-w) / -2)",
                        transform: `translateX(calc(var(--deck-w) * ${place.x})) translateZ(calc(var(--deck-w) * ${place.z})) rotateY(${place.turn}deg)`,
                        opacity: place.opacity,
                        visibility: place.opacity > 0 ? "visible" : "hidden",
                      }
                    : undefined
                }
              >
                <div className="flex h-9 shrink-0 items-center justify-between gap-3 border-b px-3 font-mono text-xs">
                  <span className="flex shrink-0 items-center gap-2 tracking-wide uppercase">
                    <span
                      aria-hidden
                      className={cn(
                        "size-1.5 transition-colors",
                        i === front ? "bg-primary" : "bg-border"
                      )}
                    />
                    {style.label}
                  </span>
                  <span className="truncate text-muted-foreground">
                    {NOTES[style.name]}
                  </span>
                </div>
                <div
                  className="relative overflow-hidden"
                  style={{ height: bodyHeight(style.name) }}
                >
                  <p
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground"
                  >
                    {near ? `Loading ${style.label}…` : style.label}
                  </p>
                  {near && (
                    <iframe
                      ref={(node) => {
                        if (node) frames.current.set(style.name, node)
                        else frames.current.delete(style.name)
                      }}
                      src={`${BASE_PATH}/style-frame/${style.name}/`}
                      title={`Data table in the ${style.label} style`}
                      loading="lazy"
                      onLoad={(event) => {
                        greeted.current.delete(style.name)
                        send(style.name, event.currentTarget)
                      }}
                      className={cn(
                        "absolute top-0 left-0 block origin-top-left border-0",
                        dragging && "pointer-events-none"
                      )}
                      style={{
                        width: frameWidth,
                        height: heights[style.name] ?? FALLBACK_HEIGHT,
                        transform: scale === 1 ? undefined : `scale(${scale})`,
                      }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-6 md:pt-8 md:pb-24 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t pt-4 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {is3d && (
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                aria-label="Previous style"
                onClick={() => go(-1)}
              >
                <RiArrowLeftLine />
              </Button>
            )}
            <div role="group" aria-label="Styles" className="flex">
              {STYLES.map((style, i) => (
                <button
                  key={style.name}
                  type="button"
                  aria-current={i === front || undefined}
                  onClick={() => goTo(i)}
                  className={cn(
                    "relative px-2 py-2 tracking-wide uppercase transition-colors outline-none after:absolute after:inset-x-2 after:bottom-1 after:h-px focus-visible:ring-2 focus-visible:ring-ring/50",
                    i === front
                      ? "text-foreground after:bg-primary"
                      : "hover:text-foreground"
                  )}
                >
                  {style.label}
                </button>
              ))}
            </div>
            {is3d && (
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                aria-label="Next style"
                onClick={() => go(1)}
              >
                <RiArrowRightLine />
              </Button>
            )}
          </div>
          <p aria-hidden className="text-foreground">
            {captionFor(front)}
          </p>
          <p aria-live="polite" className="sr-only">
            {captionFor(settled)}
          </p>
        </div>
      </div>
    </section>
  )
}
