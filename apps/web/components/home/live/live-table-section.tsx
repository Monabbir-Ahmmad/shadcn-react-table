"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import { SectionLabel } from "@/components/home/section-label"

/** Holds the live table's place until it loads (about its first height). */
function Placeholder() {
  return (
    <div className="flex h-[1030px] flex-col md:h-[890px]">
      <div className="flex h-14 items-center border border-dashed ps-4 font-mono text-xl text-muted-foreground/60 md:h-16 md:ps-5">
        <span aria-hidden>›</span>
      </div>
      <div className="mt-6 flex flex-1 items-center justify-center border border-dashed font-mono text-xs text-muted-foreground">
        <p>
          Loading the live table…
          <noscript> It needs JavaScript.</noscript>
        </p>
      </div>
    </div>
  )
}

const LiveTable = dynamic(
  () => import("@/components/home/live/live-table").then((m) => m.LiveTable),
  { ssr: false, loading: () => <Placeholder /> }
)

/**
 * "Tell it what to do": the real table, driven by typed commands. The table
 * and its command bar download only once the section is within a viewport of
 * the screen.
 */
export function LiveTableSection() {
  const ref = React.useRef<HTMLElement>(null)
  const [near, setNear] = React.useState(false)

  React.useEffect(() => {
    const section = ref.current
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

  return (
    <section
      ref={ref}
      id="try"
      aria-labelledby="try-title"
      className="-mt-px scroll-mt-14 border-t"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid gap-x-12 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
          <div>
            <SectionLabel index="→">Try it</SectionLabel>
            <h2
              id="try-title"
              className="mt-4 font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl"
            >
              Tell it what to do.
            </h2>
          </div>
          <p className="text-base text-pretty text-muted-foreground lg:pb-1.5">
            Type what you want in plain words and the real table below does it,
            then shows you the exact code for that view.
          </p>
        </div>
        <div className="mt-10 md:mt-12">
          {near ? <LiveTable /> : <Placeholder />}
        </div>
      </div>
    </section>
  )
}
