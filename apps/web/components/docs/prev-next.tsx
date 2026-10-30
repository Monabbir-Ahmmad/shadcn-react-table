"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { summaryFor } from "@/lib/docs-meta"
import { docsFlatNav, normalizeDocsPath } from "@/lib/docs-nav"

/** Previous / next page links derived from the flattened nav order. */
export function DocsPrevNext() {
  const pathname = normalizeDocsPath(usePathname())
  const index = docsFlatNav.findIndex(
    (i) => normalizeDocsPath(i.href) === pathname
  )
  if (index === -1) return null

  const prev = index > 0 ? docsFlatNav[index - 1] : null
  const next = index < docsFlatNav.length - 1 ? docsFlatNav[index + 1] : null

  return (
    <div className="mt-12 grid gap-3 border-t pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.href}
          className="flex flex-col gap-1 rounded-lg border bg-card p-4 transition-colors hover:border-primary/50"
        >
          <span className="text-xs text-muted-foreground">← Previous</span>
          <span className="font-medium">{prev.title}</span>
          <span className="line-clamp-2 text-xs text-muted-foreground">
            {summaryFor(prev.href)}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="flex flex-col gap-1 rounded-lg border bg-card p-4 text-end transition-colors hover:border-primary/50"
        >
          <span className="text-xs text-muted-foreground">Next →</span>
          <span className="font-medium">{next.title}</span>
          <span className="line-clamp-2 text-xs text-muted-foreground">
            {summaryFor(next.href)}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </div>
  )
}
