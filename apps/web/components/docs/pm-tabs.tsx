"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

import { CopyStatus } from "@/components/copy-status"
import { copyLabel, useCopy } from "@/hooks/use-copy"

const RUNNERS = {
  pnpm: "pnpm dlx",
  npm: "npx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
} as const
type Manager = keyof typeof RUNNERS

/** One command for each package manager, with tabs and a copy button. */
export function PmTabs({ command }: { command: string }) {
  const [manager, setManager] = React.useState<Manager>("pnpm")
  const { state, copy } = useCopy()
  const line = `${RUNNERS[manager]} ${command}`
  return (
    <div className="my-6 overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b bg-muted/40 px-2">
        <div role="group" aria-label="Package manager" className="flex">
          {(Object.keys(RUNNERS) as Manager[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={m === manager}
              onClick={() => setManager(m)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 font-mono text-xs transition-colors",
                m === manager
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void copy(line)}
          className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {copyLabel(state)}
        </button>
        <CopyStatus state={state} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm">{line}</pre>
    </div>
  )
}
