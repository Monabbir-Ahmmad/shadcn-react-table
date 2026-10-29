"use client"

import * as React from "react"
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

// Strings, numbers and literals read as values; keywords recede.
const TOKEN =
  /("(?:[^"\\]|\\.)*")|\b(import|from|const|new)\b|\b(true|false|\d[\d_.]*)\b/g

/** One line of code, monochrome: values in the foreground, syntax muted. */
function highlight(line: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let last = 0
  for (const match of line.matchAll(TOKEN)) {
    const index = match.index
    if (index > last) out.push(line.slice(last, index))
    out.push(
      <span
        key={index}
        className={
          match[2] ? "text-muted-foreground" : "font-medium text-foreground"
        }
      >
        {match[0]}
      </span>
    )
    last = index + match[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

/**
 * The code for the table's current view: line-numbered, with the lines the
 * last command changed marked in the gutter, and a Copy button.
 */
export function CodePanel({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  // The code before the last change, to mark what the command touched.
  const [history, setHistory] = React.useState({ prev: code, current: code })
  if (history.current !== code)
    setHistory({ prev: history.current, current: code })

  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const copy = () => {
    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        setCopied(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), 1600)
      })
      .catch(() => {})
  }

  const lines = code.split("\n")
  const before = new Set(history.prev.split("\n"))
  const changed = (line: string) =>
    history.prev !== history.current && line.trim() !== "" && !before.has(line)

  return (
    <div className={cn("border bg-card text-card-foreground", className)}>
      <div className="flex items-center justify-between gap-4 border-b py-1.5 ps-4 pe-1.5">
        <p className="font-mono text-xs text-muted-foreground">
          users-table.tsx
          <span className="ms-3 text-muted-foreground/70">
            {"// the call behind the preview"}
          </span>
        </p>
        <Button variant="ghost" size="xs" onClick={copy}>
          {copied ? (
            <RiCheckLine data-icon="inline-start" />
          ) : (
            <RiFileCopyLine data-icon="inline-start" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre
        dir="ltr"
        className="overflow-x-auto py-4 font-mono text-[13px] leading-6 text-muted-foreground"
      >
        <code className="block min-w-max">
          {lines.map((line, i) => (
            <span
              key={i}
              data-changed={changed(line) || undefined}
              className="grid grid-cols-[3.25rem_minmax(0,1fr)] pe-6 data-changed:bg-muted/60"
            >
              <span
                aria-hidden
                className="relative pe-4 text-end text-muted-foreground/50 select-none"
              >
                {changed(line) && (
                  <span className="absolute inset-y-0 start-0 w-0.5 bg-primary" />
                )}
                {i + 1}
              </span>
              <span className="whitespace-pre">{highlight(line)}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
