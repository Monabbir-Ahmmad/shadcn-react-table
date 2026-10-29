import type { ComponentType } from "react"
import Link from "next/link"
import {
  RiArrowUpDownLine,
  RiDownloadLine,
  RiEdit2Line,
  RiFilter3Line,
  RiFlashlightLine,
  RiLayoutColumnLine,
  RiListCheck2,
  RiStackLine,
  RiTranslate2,
} from "@remixicon/react"

import { cn } from "@workspace/ui/lib/utils"

import { Reveal } from "./reveal"

interface Feature {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  /** Small chips shown under the text, for the wide tiles. */
  chips?: string[]
  wide?: boolean
}

const FEATURES: Feature[] = [
  {
    icon: RiArrowUpDownLine,
    title: "Sorting",
    description:
      "Single and multi-column sorting with shift-click and order badges.",
    href: "/docs/guides/sorting",
  },
  {
    icon: RiFilter3Line,
    title: "Filtering & search",
    description:
      "Per-column filter row, switchable match modes, and fuzzy global search.",
    href: "/docs/guides/column-filtering",
    chips: ["Contains", "Fuzzy", "Between", "Before", "Custom fn"],
    wide: true,
  },
  {
    icon: RiLayoutColumnLine,
    title: "Column management",
    description: "Reorder, pin, resize, and toggle visibility of any column.",
    href: "/docs/guides/column-ordering",
  },
  {
    icon: RiStackLine,
    title: "Grouping & trees",
    description:
      "Group with aggregation footers, detail panels, and hierarchical sub-rows.",
    href: "/docs/guides/grouping",
  },
  {
    icon: RiEdit2Line,
    title: "Inline editing",
    description:
      "Edit by cell, row, table, or modal with create and save hooks.",
    href: "/docs/guides/editing",
    chips: ["Cell", "Row", "Table", "Modal"],
    wide: true,
  },
  {
    icon: RiListCheck2,
    title: "Rows & selection",
    description:
      "Selection, row numbers, pinning, drag-to-reorder, and row actions.",
    href: "/docs/guides/row-selection",
  },
  {
    icon: RiFlashlightLine,
    title: "Virtualization",
    description: "Row and column virtualization keep thousands of rows smooth.",
    href: "/docs/guides/virtualization",
  },
  {
    icon: RiDownloadLine,
    title: "Export",
    description: "Export selected or filtered rows to CSV and Excel.",
    href: "/docs/guides/export",
  },
  {
    icon: RiTranslate2,
    title: "Localization & icons",
    description: "Override every string and swap in your own icon set.",
    href: "/docs/guides/localization",
  },
]

/**
 * The breadth pitch: a bento grid of headline capabilities that maps
 * one-to-one onto the docs guides.
 */
export function FeatureGrid() {
  return (
    <Reveal className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Everything Material React Table does
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          The full breadth of MRT, rebuilt on TanStack Table v9 and driven by a
          single hook — nothing bolted on.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className={cn(
              "group flex flex-col rounded-xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              feature.wide && "lg:col-span-2"
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <feature.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold tracking-wide uppercase">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {feature.description}
            </p>
            {feature.chips && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {feature.chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </Reveal>
  )
}
