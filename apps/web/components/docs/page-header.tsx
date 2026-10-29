"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { RiArrowRightSLine } from "@remixicon/react"

import { breadcrumbFor, pageLinks, pageMarkdownUrl } from "@/lib/docs-meta"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const ACTION =
  "rounded-md border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"

/** Breadcrumb and page actions above every docs page. */
export function DocsPageHeader() {
  const pathname = usePathname()
  const crumbs = breadcrumbFor(pathname)
  const links = pageLinks(pathname)
  const [copied, setCopied] = React.useState<"idle" | "copied" | "failed">(
    "idle"
  )

  const copy = async () => {
    try {
      const response = await fetch(pageMarkdownUrl(pathname, BASE_PATH))
      if (!response.ok) throw new Error(String(response.status))
      await navigator.clipboard.writeText(await response.text())
      setCopied("copied")
    } catch {
      setCopied("failed")
    }
    setTimeout(() => setCopied("idle"), 1500)
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
        <button type="button" onClick={copy} className={ACTION}>
          {copied === "copied"
            ? "Copied"
            : copied === "failed"
              ? "Couldn't copy"
              : "Copy page"}
        </button>
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
