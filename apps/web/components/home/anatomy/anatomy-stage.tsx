"use client"

import * as React from "react"
import Link from "next/link"
import { RiArrowRightLine } from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { EXAMPLES } from "@/components/examples/registry"
import { CopyInstall } from "@/components/home/copy-install"
import { AnatomyLayers } from "@/components/home/anatomy/anatomy-layers"
import { SectionLabel } from "@/components/home/section-label"
import { anatomyFrame, type AnatomyFrame } from "@/lib/anatomy"
import { ANATOMY, type AnatomyLayer } from "@/lib/anatomy-content"

/** Height of the sticky site header the stage pins under. */
const HEADER = 57

const noopSubscribe = () => () => {}

const NO_SCRIPT_CSS = [
  "[data-anatomy-stage]{height:auto}",
  "[data-anatomy-sticky]{position:static;height:auto;align-items:start;padding-block:4rem}",
  "[data-anatomy-panel]{opacity:1;position:static;translate:none;margin-top:3.5rem}",
  "[data-anatomy-outro]{display:none}",
].join("")

/** The hero copy: headline, pitch, install and the proof line. */
export function AnatomyHeroCopy({
  headingId = "hero-title",
  className,
  style,
  inert,
}: {
  headingId?: string
  className?: string
  style?: React.CSSProperties
  inert?: boolean
}) {
  return (
    <div className={className} style={style} inert={inert}>
      <h1
        id={headingId}
        className="font-heading text-4xl leading-[1.04] font-semibold tracking-tight text-balance lg:text-5xl xl:text-[3.5rem]"
      >
        Every data-table feature, in your shadcn style
      </h1>
      <p className="mt-5 max-w-md text-base text-pretty text-muted-foreground lg:text-lg">
        Sorting, filtering, editing, grouping and virtualization, installed as
        source you own. One hook in, one component out.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link href="/docs/installation">
            Get started
            <RiArrowRightLine data-icon="inline-end" />
          </Link>
        </Button>
        <CopyInstall />
      </div>
      <p className="mt-7 font-mono text-xs text-muted-foreground">
        {`${EXAMPLES.length} examples · 38 languages · 600+ tests · Radix & Base UI`}
      </p>
    </div>
  )
}

/** One part's feature list: label, title, slot and a ruled list of features
 *  with their options and a guide link. */
export function AnatomyPart({
  layer,
  index,
  className,
}: {
  layer: AnatomyLayer
  index: number
  className?: string
}) {
  return (
    <div className={className}>
      <SectionLabel index={String(index + 1).padStart(2, "0")}>
        Table anatomy
      </SectionLabel>
      <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight lg:text-4xl">
        {layer.title}
      </h2>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        {layer.slot}
      </p>
      <ul className="mt-6 border-b">
        {layer.features.map((feature) => (
          <li
            key={feature.name}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-t py-3"
          >
            <span className="text-sm font-medium">{feature.name}</span>
            <Link
              href={feature.href}
              className="row-span-2 font-mono text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Guide →
            </Link>
            <span className="font-mono text-[11px] break-words text-muted-foreground">
              {feature.options.join(" · ")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const OUTRO_CODE = [
  "const table = useDataTable({ data, columns })",
  "return <DataTable table={table} />",
]

/** The closing note once the stack lies flat: the parts are one component. */
export function AnatomyOutro() {
  return (
    <div>
      <SectionLabel index="06">Assembled</SectionLabel>
      <p className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance lg:text-4xl">
        Five parts, one hook in, one component out.
      </p>
      <pre className="mt-6 overflow-x-auto border-y py-4 font-mono text-xs leading-relaxed text-muted-foreground">
        <code>
          {OUTRO_CODE.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}

/**
 * The hero and table anatomy (desktop, motion allowed): a tall section whose
 * sticky stage explodes the table into its five parts as you scroll, walks
 * through them one at a time, then closes the stack and lays it flat.
 */
export function AnatomyStage() {
  const sectionRef = React.useRef<HTMLElement>(null)
  const [frame, setFrame] = React.useState<AnatomyFrame>(() => anatomyFrame(0))
  // False in the server render and hydration, true after: inactive panels
  // are hidden from assistive tech only once scripts run.
  const mounted = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )

  React.useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let raf = 0
    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      // Pinned from when the section reaches the header until its bottom
      // meets the viewport's.
      const distance = rect.height - window.innerHeight + HEADER
      const progress = distance > 0 ? (HEADER - rect.top) / distance : 0
      const next = anatomyFrame(progress)
      setFrame((prev) =>
        prev.spread === next.spread &&
        prev.flat === next.flat &&
        prev.active === next.active &&
        prev.intro === next.intro
          ? prev
          : next
      )
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Pointer tilt: CSS variables on the section, rAF-throttled, no re-render.
  const tiltRaf = React.useRef(0)
  const pointer = React.useRef({ x: 0, y: 0 })
  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return
    pointer.current = { x: event.clientX, y: event.clientY }
    if (tiltRaf.current) return
    tiltRaf.current = requestAnimationFrame(() => {
      tiltRaf.current = 0
      const el = sectionRef.current
      if (!el) return
      const x = (pointer.current.x / window.innerWidth) * 2 - 1
      const y = (pointer.current.y / window.innerHeight) * 2 - 1
      el.style.setProperty("--tilt-x", x.toFixed(3))
      el.style.setProperty("--tilt-y", y.toFixed(3))
    })
  }
  const onPointerLeave = () => {
    cancelAnimationFrame(tiltRaf.current)
    tiltRaf.current = 0
    sectionRef.current?.style.setProperty("--tilt-x", "0")
    sectionRef.current?.style.setProperty("--tilt-y", "0")
  }

  return (
    <section
      ref={sectionRef}
      data-anatomy-stage=""
      aria-labelledby="hero-title"
      className="relative hidden h-[560vh] overflow-x-clip border-b md:block md:motion-reduce:hidden"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* Without scripts nothing scrolls the stage: unpin it and list the
          parts under the hero copy. */}
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <div
        data-anatomy-sticky=""
        className="sticky top-[57px] grid h-[calc(100vh-57px)] grid-cols-[minmax(0,9fr)_minmax(0,11fr)] items-center gap-12 px-6 lg:px-12"
      >
        <div className="relative">
          <AnatomyHeroCopy
            className={cn(
              "transition-opacity duration-200 motion-reduce:transition-none",
              frame.intro < 0.05 && "pointer-events-none"
            )}
            style={{ opacity: frame.intro }}
            inert={mounted && frame.intro === 0 ? true : undefined}
          />
          {ANATOMY.map((layer, i) => {
            const shown = frame.active === i
            return (
              <div
                key={layer.id}
                data-anatomy-panel=""
                aria-hidden={mounted && !shown ? true : undefined}
                inert={mounted && !shown ? true : undefined}
                className={cn(
                  "absolute inset-x-0 top-1/2 -translate-y-1/2 transition-opacity duration-200 motion-reduce:transition-none",
                  shown ? "opacity-100" : "pointer-events-none opacity-0"
                )}
              >
                <AnatomyPart layer={layer} index={i} className="max-w-md" />
              </div>
            )
          })}

          <div
            data-anatomy-outro=""
            aria-hidden={mounted && frame.flat === 0 ? true : undefined}
            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
            style={{ opacity: frame.flat }}
          >
            <AnatomyOutro />
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <AnatomyLayers
            spread={frame.spread}
            flat={frame.flat}
            active={frame.active}
            className="w-[68%] max-w-[580px] -translate-x-[15%] xl:w-[74%]"
          />
        </div>

        {/* Part index: where you are in the walk-through. */}
        <ol
          aria-hidden
          className="absolute bottom-6 left-6 flex gap-5 font-mono text-[11px] text-muted-foreground lg:left-12"
          style={{ opacity: 1 - frame.intro }}
        >
          {ANATOMY.map((layer, i) => (
            <li
              key={layer.id}
              className={cn(
                "flex items-center gap-1.5 transition-colors",
                frame.active === i && "text-foreground",
                (frame.active === null ? frame.flat > 0 : frame.active > i) &&
                  "text-foreground/70"
              )}
            >
              <span
                className={cn(
                  "h-px w-4 bg-border transition-colors",
                  frame.active === i && "w-8 bg-primary"
                )}
              />
              {String(i + 1).padStart(2, "0")} {layer.title}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
