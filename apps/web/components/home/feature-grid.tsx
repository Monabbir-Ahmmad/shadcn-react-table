import Link from "next/link"
import {
  RiDragMove2Line,
  RiEdit2Line,
  RiFilter3Line,
  RiKeyboardLine,
  RiPushpinLine,
  RiSparkling2Line,
  RiSpeedUpLine,
  RiStackLine,
  RiTranslate2,
  type RemixiconComponentType,
} from "@remixicon/react"

import { SectionLabel } from "@/components/home/section-label"

type Feature = {
  icon: RemixiconComponentType
  title: string
  body: string
  href: string
}

const FEATURES: Feature[] = [
  {
    icon: RiFilter3Line,
    title: "Filtering & search",
    body: "Filters per column with switchable modes, a fuzzy global search and an advanced filter builder.",
    href: "/docs/guides/column-filtering",
  },
  {
    icon: RiEdit2Line,
    title: "Editing",
    body: "Edit a cell, a row, a whole table or a modal form, with validation per column.",
    href: "/docs/guides/editing",
  },
  {
    icon: RiStackLine,
    title: "Grouping & aggregation",
    body: "Drag a header to group rows, then sum, count or average each group.",
    href: "/docs/guides/grouping",
  },
  {
    icon: RiSpeedUpLine,
    title: "Virtualization",
    body: "Scroll through 100,000 rows smoothly. Only the rows and columns in view are rendered.",
    href: "/docs/guides/virtualization",
  },
  {
    icon: RiPushpinLine,
    title: "Column & row pinning",
    body: "Keep key columns at the edges and important rows at the top or bottom while the rest scrolls.",
    href: "/docs/guides/column-pinning",
  },
  {
    icon: RiDragMove2Line,
    title: "Drag & drop",
    body: "Reorder rows and columns, or drag rows into another table, with the pointer, touch or keyboard.",
    href: "/docs/guides/row-dragging",
  },
  {
    icon: RiSparkling2Line,
    title: "Animations",
    body: "Rows glide into place when you sort, filter or group, and hold still for reduced motion.",
    href: "/docs/guides/animations",
  },
  {
    icon: RiTranslate2,
    title: "38 languages",
    body: "Install only the languages you need, right-to-left included, or override any string.",
    href: "/docs/guides/localization",
  },
  {
    icon: RiKeyboardLine,
    title: "Accessibility & keyboard",
    body: "An ARIA grid you can use with arrow keys and a screen reader, checked with axe in CI.",
    href: "/docs/guides/accessibility",
  },
]

/** Nine features in a grid of cards, each linking to its guide. */
export function FeatureGrid() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="-mt-px scroll-mt-14 border-t"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid gap-x-12 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
          <div>
            <SectionLabel index="02">Features</SectionLabel>
            <h2
              id="features-title"
              className="mt-4 font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl"
            >
              Everything a data table needs.
            </h2>
          </div>
          <p className="text-base text-pretty text-muted-foreground lg:pb-1.5">
            Each feature turns on with an option or two. Every one has a guide
            with a live example.
          </p>
        </div>
        <ul className="mt-10 grid border-t border-l sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.href} className="border-r border-b">
              <FeatureCard feature={feature} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon
  return (
    <Link
      href={feature.href}
      className="group flex h-full flex-col bg-background p-6 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      <Icon aria-hidden className="size-5 text-primary" />
      <h3 className="mt-5 font-heading text-lg font-semibold tracking-tight">
        {feature.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-pretty text-muted-foreground">
        {feature.body}
      </p>
      <span className="mt-5 font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
        Guide →
      </span>
    </Link>
  )
}
