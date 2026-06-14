"use client"

import * as React from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monabbir/tablecn/components/tooltip"
import { cn } from "@monabbir/tablecn/lib/utils"

/**
 * Wraps cell content in a click-to-copy affordance with a transient "Copied"
 * tooltip. Uses `navigator.clipboard` (secure-context only) with a
 * `document.execCommand` fallback, both guarded for SSR.
 */
export function ClickToCopy({
  value,
  copyLabel,
  copiedLabel,
  children,
}: {
  value: string
  copyLabel: string
  copiedLabel: string
  children: React.ReactNode
}) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    const ok = await copyText(value)
    if (!ok) return
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1200)
  }

  return (
    <Tooltip open={copied || undefined}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={copy}
          aria-label={copyLabel}
          className={cn(
            "-mx-1 rounded-sm px-1 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40"
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{copied ? copiedLabel : copyLabel}</TooltipContent>
    </Tooltip>
  )
}

async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to legacy path
    }
  }
  if (typeof document === "undefined") return false
  try {
    const el = document.createElement("textarea")
    el.value = text
    el.style.position = "fixed"
    el.style.opacity = "0"
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}
