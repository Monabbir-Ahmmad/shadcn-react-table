"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { RiArrowUpDownLine } from "@remixicon/react"
import { ArrowUpDown } from "lucide-react"

import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"

import styles from "@/style-kits/styles.json"
import type { IconLibrary } from "@/components/examples/icon-sets"
import { SectionLabel } from "@/components/home/section-label"
import { frameTheme, STYLE_DEFAULT, type FrameChoice } from "@/lib/frame-theme"
import {
  ACCENTS,
  BASE_COLORS,
  FONTS,
  ICON_LIBS,
  RADII,
} from "@/lib/theme-presets"
import { DEFAULT_PREFS, readPrefs } from "@/lib/theme-store"
import { isFromFrame, type ToFrame } from "@/lib/style-frame-protocol"

const STYLES: { name: string; label: string }[] = styles
const FIRST_STYLE = STYLES[0]?.name ?? "vega"
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
/** A new style's frame must sit still this long before it replaces the old. */
const SETTLE_DELAY = 150
/** Swap to a new style's frame after this long even if it never draws. */
const SWAP_TIMEOUT = 6000

/**
 * False on the server and during hydration, true after: next-themes only
 * knows the resolved theme on the client.
 */
const noSubscribe = () => () => {}
function useHydrated() {
  return React.useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false
  )
}

const labelOf = (name: string) =>
  STYLES.find((s) => s.name === name)?.label ?? name

const radiusLabel = (r: string) => `${parseFloat(r)} rem`

const fontOf = (name: string) => FONTS.find((f) => f.name === name)

const baseSwatch = (b: (typeof BASE_COLORS)[number]) =>
  `oklch(0.55 ${(b.chroma * 4).toFixed(3)} ${b.hue})`

const ICON_SAMPLES: Record<IconLibrary, React.ReactNode> = {
  lucide: <ArrowUpDown />,
  remix: <RiArrowUpDownLine />,
}

/** Whether a same-origin frame has drawn its table (true if we can't tell). */
function hasDrawn(frame: HTMLIFrameElement) {
  try {
    const doc = frame.contentDocument
    return !doc || doc.querySelector("table") !== null
  } catch {
    return true
  }
}

/**
 * "Make it yours.": pickers on one side, the real table on the other, in the
 * chosen shadcn style. Each style is its own frame; switching styles keeps
 * the old frame on screen until the new one has drawn its table.
 */
export function MakeItYours() {
  const { resolvedTheme } = useTheme()
  const hydrated = useHydrated()
  const [choice, setChoice] = React.useState<FrameChoice>({
    accent: DEFAULT_PREFS.accent,
    base: DEFAULT_PREFS.base,
    icons: DEFAULT_PREFS.icons,
    font: STYLE_DEFAULT,
    radius: STYLE_DEFAULT,
  })
  // The picked style, and the one whose frame is on screen: they differ
  // while the picked style's frame loads underneath.
  const [style, setStyle] = React.useState(FIRST_STYLE)
  const [shown, setShown] = React.useState(FIRST_STYLE)
  const [heights, setHeights] = React.useState<Record<string, number>>({})
  const [width, setWidth] = React.useState(0)
  const [near, setNear] = React.useState(false)

  const sectionRef = React.useRef<HTMLElement>(null)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const frames = React.useRef(new Map<string, HTMLIFrameElement>())
  // Frames that have got their theme since they last loaded.
  const greeted = React.useRef(new Set<string>())
  // Mounted frames that have reported in at least once.
  const live = React.useRef(new Set<string>())
  const picked = React.useRef(FIRST_STYLE)
  const settle = React.useRef<number | undefined>(undefined)

  // Light until hydrated, so the server HTML and the first client render
  // agree; the swatches switch to the dark accents right after.
  const dark = hydrated && resolvedTheme === "dark"
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
  // start as the style's own.
  React.useEffect(() => {
    const { accent, base, icons } = readPrefs()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice((c) => ({ ...c, accent, base, icons }))
  }, [])

  // Restyle the frames whenever a picker or the site's light/dark changes.
  React.useEffect(() => {
    latest.current = { choice, dark }
    for (const [name, frame] of frames.current) send(name, frame)
  }, [choice, dark, send])

  // Frames report their height; the first report means a frame is listening,
  // so that is when it gets the theme. Once the picked style's frame has
  // drawn its table and settled, it takes over from the old one.
  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isFromFrame(event.data))
        return
      for (const [name, frame] of frames.current) {
        if (event.source !== frame.contentWindow) continue
        const height = event.data.height
        setHeights((h) => (h[name] === height ? h : { ...h, [name]: height }))
        live.current.add(name)
        if (!greeted.current.has(name)) {
          greeted.current.add(name)
          send(name, frame)
        }
        if (name === picked.current) {
          window.clearTimeout(settle.current)
          settle.current = window.setTimeout(() => {
            if (picked.current === name && hasDrawn(frame)) setShown(name)
          }, SETTLE_DELAY)
        }
        return
      }
    }
    window.addEventListener("message", onMessage)
    return () => {
      window.removeEventListener("message", onMessage)
      window.clearTimeout(settle.current)
    }
  }, [send])

  // Load the first frame only once the section is within a screen of view.
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

  // The preview is sized by CSS; the frame inside scales to fit it.
  React.useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    const observer = new ResizeObserver(() => setWidth(body.clientWidth))
    observer.observe(body)
    return () => observer.disconnect()
  }, [])

  const pending = near && style !== shown ? style : null
  const mounted = near ? (pending ? [shown, pending] : [shown]) : []
  const mountedKey = mounted.join(" ")

  // Forget what we knew about frames that have gone.
  React.useEffect(() => {
    const keep = new Set(mountedKey.split(" "))
    for (const names of [greeted.current, live.current])
      for (const name of names) if (!keep.has(name)) names.delete(name)
  }, [mountedKey])

  // Never leave the old style on screen if the new frame fails to draw.
  React.useEffect(() => {
    if (!pending) return
    const timer = window.setTimeout(() => setShown(pending), SWAP_TIMEOUT)
    return () => window.clearTimeout(timer)
  }, [pending])

  const pickStyle = (name: string) => {
    picked.current = name
    setStyle(name)
    // Nothing worth keeping on screen yet: swap straight away.
    if (!live.current.has(shown)) setShown(name)
  }

  const set = (key: "accent" | "base" | "font" | "radius") => (v: string) =>
    setChoice((c) => ({ ...c, [key]: v }))

  const scale = width
    ? Math.max(MIN_SCALE, Math.min(1, width / FRAME_WIDTH))
    : 1
  const frameWidth = width ? width / scale : FRAME_WIDTH
  const bodyHeight = Math.ceil((heights[shown] ?? FALLBACK_HEIGHT) * scale)

  // The style's own font and radius, and what the frame actually gets.
  const own = frameTheme(
    { ...choice, font: STYLE_DEFAULT, radius: STYLE_DEFAULT },
    style,
    dark
  )
  const effective = frameTheme(choice, style, dark)
  const ownFont = fontOf(own.font)

  return (
    <section
      ref={sectionRef}
      id="customize"
      aria-labelledby="customize-title"
      className="-mt-px scroll-mt-14 border-t bg-background"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid gap-x-12 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
          <div>
            <SectionLabel index="01">Customize</SectionLabel>
            <h2
              id="customize-title"
              className="mt-4 font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl"
            >
              Make it yours.
            </h2>
          </div>
          <p className="text-base text-pretty text-muted-foreground lg:pb-1.5">
            Pick a shadcn style, colors, font and radius — the table restyles
            live. It installs in your project&apos;s own style.
            <noscript> The live table needs JavaScript.</noscript>
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:mt-12 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-10">
          <div className="grid min-w-0 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-1">
            <Picker
              label="Style"
              value={style}
              onChange={pickStyle}
              options={STYLES.map((s) => ({
                value: s.name,
                label: s.label,
                description: NOTES[s.name],
              }))}
            />
            <Picker
              label="Accent"
              value={choice.accent}
              onChange={set("accent")}
              options={ACCENTS.map((a) => ({
                value: a.name,
                label: a.label,
                preview: <Dot color={(dark ? a.dark : a.light).primary} />,
              }))}
            />
            <Picker
              label="Base color"
              value={choice.base}
              onChange={set("base")}
              options={BASE_COLORS.map((b) => ({
                value: b.name,
                label: b.label,
                preview: <Dot color={baseSwatch(b)} />,
              }))}
            />
            <Picker
              label="Font"
              value={choice.font}
              onChange={set("font")}
              options={[
                {
                  value: STYLE_DEFAULT,
                  label: `Style default (${ownFont?.label ?? own.font})`,
                  preview: <Aa font={ownFont?.value} />,
                },
                ...FONTS.map((f) => ({
                  value: f.name,
                  label: f.label,
                  preview: <Aa font={f.value} />,
                })),
              ]}
            />
            <Picker
              label="Radius"
              value={choice.radius}
              onChange={set("radius")}
              options={[
                {
                  value: STYLE_DEFAULT,
                  label: `Style default (${radiusLabel(own.radius)})`,
                  preview: <Corner radius={own.radius} />,
                },
                ...RADII.map((r) => ({
                  value: r,
                  label: radiusLabel(r),
                  preview: <Corner radius={r} />,
                })),
              ]}
            />
            <Picker
              label="Icons"
              value={choice.icons}
              onChange={(v) =>
                setChoice((c) => ({ ...c, icons: v as IconLibrary }))
              }
              options={ICON_LIBS.map((l) => ({
                value: l.name,
                label: l.label,
                preview: (
                  <span className="flex [&_svg]:size-3.5">
                    {ICON_SAMPLES[l.name]}
                  </span>
                ),
              }))}
            />
          </div>

          <figure className="m-0 flex min-w-0 flex-col border bg-background">
            <figcaption className="flex h-9 shrink-0 items-center gap-3 border-b px-3 font-mono text-xs">
              <span className="flex shrink-0 items-center gap-2 tracking-wide uppercase">
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 bg-primary",
                    pending && "animate-pulse motion-reduce:animate-none"
                  )}
                />
                {labelOf(style)}
              </span>
              <span className="truncate text-muted-foreground">
                {pending ? "Loading…" : NOTES[style]}
              </span>
              <span
                aria-hidden
                className="ms-auto hidden shrink-0 text-muted-foreground sm:inline"
              >
                {fontOf(effective.font)?.label ?? effective.font} ·{" "}
                {radiusLabel(effective.radius)}
              </span>
            </figcaption>
            <div
              ref={bodyRef}
              className="relative overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
              style={{ height: bodyHeight }}
            >
              <p
                aria-hidden
                className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground"
              >
                {near ? `Loading ${labelOf(shown)}…` : labelOf(shown)}
              </p>
              {mounted.map((name) => {
                const waiting = name === pending
                return (
                  <iframe
                    key={name}
                    ref={(node) => {
                      if (node) frames.current.set(name, node)
                      else frames.current.delete(name)
                    }}
                    src={`${BASE_PATH}/style-frame/${name}/`}
                    title={`Data table in the ${labelOf(name)} style`}
                    aria-hidden={waiting || undefined}
                    inert={waiting}
                    onLoad={(event) => {
                      greeted.current.delete(name)
                      send(name, event.currentTarget)
                    }}
                    className={cn(
                      "absolute top-0 left-0 block origin-top-left border-0",
                      waiting && "pointer-events-none opacity-0"
                    )}
                    style={{
                      width: frameWidth,
                      height: heights[name] ?? FALLBACK_HEIGHT,
                      transform: scale === 1 ? undefined : `scale(${scale})`,
                    }}
                  />
                )
              })}
            </div>
            <p aria-live="polite" className="sr-only">
              {near ? `${labelOf(shown)} style: ${NOTES[shown] ?? ""}` : ""}
            </p>
          </figure>
        </div>
      </div>
    </section>
  )
}

type Option = {
  value: string
  label: string
  preview?: React.ReactNode
  description?: string
}

/** One labelled select: the current pick with its preview, opening the list. */
function Picker({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
}) {
  const id = React.useId()
  const selected = options.find((o) => o.value === value)
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} size="sm" className="w-full">
          <SelectValue>
            {selected?.preview && <Preview>{selected.preview}</Preview>}
            {selected?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.preview && <Preview>{o.preview}</Preview>}
              {o.description ? (
                <span className="flex flex-col items-start">
                  <span>{o.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {o.description}
                  </span>
                </span>
              ) : (
                o.label
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function Preview({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden className="flex w-5 shrink-0 justify-center">
      {children}
    </span>
  )
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="size-3.5 rounded-full border border-foreground/10"
      style={{ backgroundColor: color }}
    />
  )
}

function Aa({ font }: { font?: string }) {
  return (
    <span className="text-sm leading-none" style={{ fontFamily: font }}>
      Aa
    </span>
  )
}

function Corner({ radius }: { radius: string }) {
  return (
    <span
      className="size-3.5 border-s-2 border-t-2 border-foreground/70"
      style={{ borderTopLeftRadius: `calc(${radius} * 1.2)` }}
    />
  )
}
