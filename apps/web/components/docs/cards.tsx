import Link from "next/link"
import { RiArrowRightUpLine } from "@remixicon/react"

import { groupFor, summaryFor } from "@/lib/docs-meta"

/** A grid of link cards. */
export function Cards({ children }: { children: React.ReactNode }) {
  return <div className="my-6 grid gap-3 sm:grid-cols-2">{children}</div>
}

/** A link card; with no children it shows the page's summary. */
export function Card({
  href,
  title,
  children,
}: {
  href: string
  title: string
  children?: React.ReactNode
}) {
  const Icon = groupFor(href)?.icon
  return (
    <Link
      href={href}
      className="group flex gap-3 rounded-lg border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {Icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-1 text-sm font-medium">
          {title}
          <RiArrowRightUpLine className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="text-xs leading-5 text-muted-foreground">
          {children ?? summaryFor(href)}
        </span>
      </span>
    </Link>
  )
}
