"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { RiArrowRightSLine } from "@remixicon/react"

import { CopyStatus } from "@/components/copy-status"
import { copyLabel, useCopy } from "@/hooks/use-copy"
import { breadcrumbFor, pageLinks, pageMarkdownUrl } from "@/lib/docs-meta"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const ACTION =
  "rounded-md border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"

/** Breadcrumb and page actions above every docs page. */
export function DocsPageHeader() {
  const pathname = usePathname()
  const crumbs = breadcrumbFor(pathname)
  const links = pageLinks(pathname)
  const { state, copy } = useCopy()

  /** The page's Markdown copy (built by `scripts/build-llms.mjs`). */
  const fetchMarkdown = async () => {
    const response = await fetch(pageMarkdownUrl(pathname, BASE_PATH))
    if (!response.ok) throw new Error(String(response.status))
    return response.text()
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-xs text-muted-foreground"
      >
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.title}>
            {i > 0 && <RiArrowRightSLine className="size-3.5" aria-hidden />}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.title}
              </Link>
            ) : (
              <span aria-current={i === crumbs.length - 1 ? "page" : undefined}>
                {crumb.title}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => void copy(fetchMarkdown)}
          className={ACTION}
        >
          {copyLabel(state, "Copy page")}
        </button>
        <CopyStatus state={state} />
        <a href={pageMarkdownUrl(pathname, BASE_PATH)} className={ACTION}>
          Markdown
        </a>
        <a
          href={links.chatgpt}
          target="_blank"
          rel="noreferrer"
          className={ACTION}
        >
          Open in ChatGPT
        </a>
        <a
          href={links.claude}
          target="_blank"
          rel="noreferrer"
          className={ACTION}
        >
          Open in Claude
        </a>
        <a
          href={links.github}
          target="_blank"
          rel="noreferrer"
          className={ACTION}
        >
          Edit on GitHub
        </a>
      </div>
    </div>
  )
}
