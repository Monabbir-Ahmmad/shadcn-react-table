import type { CSSProperties } from "react"
import Link from "next/link"
import { RiArrowRightLine } from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"

import { CopyInstall } from "@/components/home/copy-install"
import { DemoShowcase } from "@/components/home/demo-showcase"
import { WindowFrame } from "@/components/home/window-frame"

const META = ["MRT V3 parity", "TanStack Table v9", "shadcn registry"]

/**
 * Landing hero: a serif headline and CTAs over a faint grid, anchored by a
 * live, tabbed table so the product sells itself on first paint.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Faint grid backdrop, faded out toward the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={
          {
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
          } as CSSProperties
        }
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="/docs/guides/updating"
            className="inline-flex items-center gap-2 border bg-card px-3 py-1 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <span className="size-1.5 shrink-0 bg-primary" />
            New in 1.0 · TanStack Table v9, slotProps, row dragging
          </Link>

          <h1 className="mt-6 font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-6xl">
            Every data-table feature, in your shadcn style
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-pretty text-muted-foreground md:text-lg">
            A feature-complete React data table — sorting, filtering, grouping,
            inline editing, virtualization and more — installed as source you
            own. One hook in, one component out.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/docs">
                Get started
                <RiArrowRightLine data-icon="inline-end" />
              </Link>
            </Button>
            <CopyInstall />
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium tracking-wide text-muted-foreground">
            {META.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-muted-foreground/50" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <WindowFrame className="mx-auto mt-14 max-w-5xl md:mt-16">
          <DemoShowcase />
        </WindowFrame>
      </div>
    </section>
  )
}
