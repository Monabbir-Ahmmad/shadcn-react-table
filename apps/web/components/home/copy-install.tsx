"use client"

import * as React from "react"
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"

import { INSTALL_COMMAND } from "@/lib/site"

/** The install command with a copy button. */
export function CopyInstall() {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      onClick={() =>
        void navigator.clipboard.writeText(INSTALL_COMMAND).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }
      className="flex max-w-full items-center gap-3 rounded-lg border bg-card px-4 py-2.5 font-mono text-xs shadow-sm transition-colors hover:border-primary/50"
      aria-label="Copy the install command"
    >
      <span className="text-primary">$</span>
      <span className="truncate">npx shadcn add …/data-table.json</span>
      {copied ? (
        <RiCheckLine className="size-4 text-primary" />
      ) : (
        <RiFileCopyLine className="size-4 text-muted-foreground" />
      )}
    </button>
  )
}
