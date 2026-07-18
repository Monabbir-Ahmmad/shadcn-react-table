"use client"

import * as React from "react"

export interface UseInfiniteScrollOptions {
  /** Master switch. When false, no observer is created. */
  enabled: boolean
  /** Whether more rows exist to load. */
  hasNextPage: boolean
  /** Whether a load is currently in flight (blocks re-triggering). */
  isFetchingNextPage: boolean
  /** Called (once per satisfied condition) to request the next chunk. Should be
   *  stable across renders (e.g. `useCallback`) to avoid extra calls. */
  onLoadMore?: () => void
  /** Distance in px from the bottom at which to prefetch. Default 200. */
  threshold?: number
  /** The scroll container the sentinel lives in (IntersectionObserver root). */
  scrollRef: React.RefObject<HTMLElement | null>
  /** The sentinel element rendered after the last row. */
  sentinelRef: React.RefObject<HTMLElement | null>
}

/**
 * Fires `onLoadMore` when a bottom sentinel scrolls near the viewport, gated by
 * the controlled `hasNextPage` / `isFetchingNextPage` flags. Works whether or
 * not row virtualization is on, since the sentinel sits after the rendered
 * window. Re-checks on flag changes so a finished fetch that leaves the sentinel
 * still in view loads the following chunk.
 */
export function useInfiniteScroll({
  enabled,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  threshold = 200,
  scrollRef,
  sentinelRef,
}: UseInfiniteScrollOptions): void {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!enabled || !sentinel) {
      setIsIntersecting(false)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) setIsIntersecting(entry.isIntersecting)
      },
      {
        root: scrollRef.current ?? null,
        rootMargin: `0px 0px ${threshold}px 0px`,
      }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [enabled, threshold, scrollRef, sentinelRef])

  React.useEffect(() => {
    if (enabled && isIntersecting && hasNextPage && !isFetchingNextPage) {
      onLoadMore?.()
    }
  }, [enabled, isIntersecting, hasNextPage, isFetchingNextPage, onLoadMore])
}
