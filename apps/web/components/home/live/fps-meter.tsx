"use client"

import * as React from "react"

/**
 * Frames per second, averaged over the last second of animation frames, next
 * to the row count. Measures only while `active`; the loop stops when it is
 * switched off or unmounted.
 */
export function FpsMeter({ active, rows }: { active: boolean; rows: number }) {
  const [fps, setFps] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!active) return
    const frames: number[] = []
    let shownAt = 0
    let raf = 0
    const tick = (now: number) => {
      frames.push(now)
      while (frames.length > 2 && now - frames[0]! > 1000) frames.shift()
      // Repaint the number four times a second, from a full window only.
      if (now - shownAt >= 250 && frames.length > 1) {
        shownAt = now
        const span = now - frames[0]!
        if (span >= 500) setFps(Math.round(((frames.length - 1) * 1000) / span))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  if (!active) return null
  return (
    <p className="flex items-baseline gap-2 font-mono text-xs text-muted-foreground tabular-nums">
      <span aria-hidden className="text-foreground">
        <span className="inline-block min-w-[3ch] text-end font-medium">
          {fps ?? "--"}
        </span>{" "}
        fps
      </span>
      <span aria-hidden className="h-3 w-px bg-border" />
      <span>{rows.toLocaleString("en-US")} rows</span>
    </p>
  )
}
