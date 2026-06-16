import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

const MAX_HIGHLIGHT_LENGTH = 2000

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Wraps occurrences of `query` within `text` in a themeable `<mark>`. Work is
 * skipped when there's no query, the query is escaped, and very long strings
 * are left unhighlighted to avoid regex blowups on huge cells.
 */
export const Highlight = React.memo(function Highlight({
  text,
  query,
  className,
}: {
  text: string
  query?: string | null
  className?: string
}) {
  const trimmed = query?.trim()
  if (
    !trimmed ||
    text.length === 0 ||
    text.length > MAX_HIGHLIGHT_LENGTH
  ) {
    return <>{text}</>
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmed)})`, "gi"))
  if (parts.length === 1) return <>{text}</>

  const needle = trimmed.toLowerCase()
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === needle ? (
          <mark
            key={index}
            className={cn(
              "rounded-[2px] bg-highlight px-0.5 text-highlight-foreground",
              className
            )}
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  )
})
