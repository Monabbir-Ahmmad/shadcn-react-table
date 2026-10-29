"use client"

import { RiCheckLine, RiCloseLine, RiFileCopyLine } from "@remixicon/react"

import { CopyStatus } from "@/components/copy-status"
import { useCopy } from "@/hooks/use-copy"
import { INSTALL_COMMAND } from "@/lib/site"

/** The install command with a copy button. */
export function CopyInstall() {
  const { state, copy } = useCopy()
  return (
    <>
      <button
        type="button"
        onClick={() => void copy(INSTALL_COMMAND)}
        className="flex max-w-full items-center gap-3 rounded-lg border bg-card px-4 py-2.5 font-mono text-xs shadow-sm transition-colors hover:border-primary/50"
        aria-label="Copy the install command"
      >
        <span className="text-primary">$</span>
        <span className="truncate">npx shadcn add …/data-table.json</span>
        {state === "copied" ? (
          <RiCheckLine aria-hidden className="size-4 text-primary" />
        ) : state === "failed" ? (
          <RiCloseLine aria-hidden className="size-4 text-destructive" />
        ) : (
          <RiFileCopyLine
            aria-hidden
            className="size-4 text-muted-foreground"
          />
        )}
      </button>
      <CopyStatus state={state} />
    </>
  )
}
