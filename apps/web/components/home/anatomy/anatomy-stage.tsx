"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

import { AnatomyLayers } from "@/components/home/anatomy/anatomy-layers"
import {
  AnatomyHeroCopy,
  AnatomyOutro,
  AnatomyPart,
} from "@/components/home/anatomy/anatomy-parts"
import {
  anatomyFrame,
  anatomyLayerProgress,
  type AnatomyFrame,
} from "@/lib/anatomy"
import { ANATOMY } from "@/lib/anatomy-content"
import { SITE_HEADER_HEIGHT } from "@/lib/site"

/** Height of the sticky site header the stage pins under. */
const HEADER = SITE_HEADER_HEIGHT

const NO_SCRIPT_CSS = [
  "[data-anatomy-stage]{height:auto}",
  "[data-anatomy-sticky]{position:static;height:auto;align-items:start;padding-block:4rem}",
  "[data-anatomy-panel]{opacity:1;position:static;translate:none;margin-top:3.5rem}",
  "[data-anatomy-outro]{display:none}",
].join("")

/**
 * The hero and table anatomy (desktop, motion allowed): a tall section whose
 * sticky stage explodes the table into its five parts as you scroll, walks
 * through them one at a time, then closes the stack and lays it flat.
 */
export function AnatomyStage() {
  const sectionRef = React.useRef<HTMLElement>(null)
  const [frame, setFrame] = React.useState<AnatomyFrame>(() => anatomyFrame(0))
  // Pending tilt frame and the latest pointer position.
  const tilt = React.useRef({ raf: 0, x: 0, y: 0 })

  React.useEffect(() => {
    const section = sectionRef.current
    const pending = tilt.current
    if (!section) return
    let raf = 0
    const update = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      // Hidden (phones, reduced motion): the static fallback shows instead.
      if (rect.height === 0) return
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
      cancelAnimationFrame(pending.raf)
    }
  }, [])

  /** Scroll so the stage sits at `progress` (keyboard focus follows along). */
  const scrollToProgress = (progress: number) => {
    const section = sectionRef.current
    if (!section) return
    const rect = section.getBoundingClientRect()
    const top = rect.top + window.scrollY - HEADER
    const distance = rect.height - window.innerHeight + HEADER
    window.scrollTo({
      top: Math.max(0, top + progress * distance),
      behavior: "instant",
    })
  }

  // Pointer tilt: CSS variables on the section, rAF-throttled, no re-render.
  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return
    const t = tilt.current
    t.x = event.clientX
    t.y = event.clientY
    if (t.raf) return
    t.raf = requestAnimationFrame(() => {
      t.raf = 0
      const el = sectionRef.current
      if (!el) return
      el.style.setProperty(
        "--tilt-x",
        ((t.x / window.innerWidth) * 2 - 1).toFixed(3)
      )
      el.style.setProperty(
        "--tilt-y",
        ((t.y / window.innerHeight) * 2 - 1).toFixed(3)
      )
    })
  }
  const onPointerLeave = () => {
    cancelAnimationFrame(tilt.current.raf)
    tilt.current.raf = 0
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
        className="sticky top-(--site-header-h) grid h-[calc(100vh-var(--site-header-h))] grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-8 px-6 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)] lg:gap-12 lg:px-12"
      >
        {/* Everything stays in the accessibility tree, in reading order
            (hero, parts 01-05, outro); only what the scroll shows is visible.
            Focusing into a part scrolls the stage to it, so Tab walks the
            anatomy visibly. */}
        <div className="relative">
          <div
            className={cn(frame.intro < 0.05 && "pointer-events-none")}
            style={{ opacity: frame.intro }}
            onFocus={() => {
              if (frame.intro < 1) scrollToProgress(0)
            }}
          >
            <AnatomyHeroCopy />
          </div>
          {ANATOMY.map((layer, i) => {
            const shown = frame.active === i
            return (
              <div
                key={layer.id}
                data-anatomy-panel=""
                onFocus={() => {
                  if (!shown) scrollToProgress(anatomyLayerProgress(i))
                }}
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
            className="w-[54%] max-w-[580px] -translate-x-[24%] lg:w-[64%] lg:-translate-x-[16%] xl:w-[70%]"
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
