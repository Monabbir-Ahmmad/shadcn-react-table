"use client"

import * as React from "react"

/**
 * Frames per second, averaged over the last second of animation frames, next
 * to the row count. Measures only while `active`, not `paused` (say, the Code
 * view is shown) and its section is on screen; the loop stops otherwise and
 * when unmounted.
 */
export function FpsMeter({
  active,
  paused = false,
  rows,
}: {
  active: boolean
  paused?: boolean
  rows: number
}) {
  const ref = React.useRef<HTMLParagraphElement>(null)
  const [fps, setFps] = React.useState<number | null>(null)
  const [onScreen, setOnScreen] = React.useState(true)
  const running = active && !paused && onScreen

  // Watch the whole section (the table below the meter), not just the meter.
  React.useEffect(() => {
    const node = ref.current
    if (!active || !node) return
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry?.isIntersecting ?? true)
    )
    observer.observe(node.closest("section") ?? node)
    return () => observer.disconnect()
  }, [active])

  React.useEffect(() => {
    if (!running) return
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
    return () => {
      cancelAnimationFrame(raf)
      // A stale number would read as live when the meter shows again.
      setFps(null)
    }
  }, [running])

  if (!active) return null
  return (
    <p
      ref={ref}
      className="flex items-baseline gap-2 font-mono text-xs text-muted-foreground tabular-nums"
    >
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
