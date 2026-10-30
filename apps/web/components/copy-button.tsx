"use client"

import { RiCheckLine, RiCloseLine, RiFileCopyLine } from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { CopyStatus } from "@/components/copy-status"
import { copyLabel, useCopy } from "@/hooks/use-copy"

/**
 * An outline "Copy" button with an icon: "Copied" or "Couldn't copy" for a
 * moment after a click, announced to screen readers. `what` names the text
 * for screen readers ("the install command").
 */
export function CopyButton({
  text,
  what,
  variant = "outline",
  className,
}: {
  text: string
  what: string
  variant?: "outline" | "ghost"
  className?: string
}) {
  const { state, copy } = useCopy()
  const Icon =
    state === "copied"
      ? RiCheckLine
      : state === "failed"
        ? RiCloseLine
        : RiFileCopyLine
  return (
    <>
      <Button
        variant={variant}
        size="xs"
        onClick={() => void copy(text)}
        className={cn("shrink-0", className)}
      >
        <Icon
          aria-hidden
          data-icon="inline-start"
          className={cn(
            state === "copied" && "text-primary",
            state === "failed" && "text-destructive"
          )}
        />
        {copyLabel(state)}
        {state === "idle" && <span className="sr-only"> {what}</span>}
      </Button>
      <CopyStatus state={state} />
    </>
  )
}
