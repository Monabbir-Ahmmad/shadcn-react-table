"use client"

import { usePathname } from "next/navigation"
import * as React from "react"

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/** The Markdown copy of a docs page (built by `scripts/build-llms.mjs`). */
export function pageMarkdownUrl(pathname: string) {
  return `${BASE_PATH}${pathname.replace(/\/$/, "")}.md`
}

/** Copies the current docs page as Markdown, for pasting into an AI chat. */
export function CopyPage() {
  const pathname = usePathname()
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle")

  const copy = async () => {
    try {
      const response = await fetch(pageMarkdownUrl(pathname))
      if (!response.ok) throw new Error(String(response.status))
      await navigator.clipboard.writeText(await response.text())
      setState("copied")
    } catch {
      setState("failed")
    }
    setTimeout(() => setState("idle"), 1500)
  }

  return (
    <div className="mb-2 flex justify-end gap-1">
      <button
        type="button"
        onClick={copy}
        className="rounded-md border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"
      >
        {state === "copied"
          ? "Copied"
          : state === "failed"
            ? "Couldn't copy"
            : "Copy page"}
      </button>
      <a
        href={pageMarkdownUrl(pathname)}
        className="rounded-md border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-muted"
      >
        Markdown
      </a>
    </div>
  )
}
