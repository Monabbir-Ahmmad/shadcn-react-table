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
}

/**
 * Fires `onLoadMore` when a bottom sentinel scrolls near the viewport, gated by
 * the controlled `hasNextPage` / `isFetchingNextPage` flags. Works whether or
 * not row virtualization is on, since the sentinel sits after the rendered
 * window. Re-checks on flag changes so a finished fetch that leaves the sentinel
 * still in view loads the following chunk.
 *
 * Returns a ref callback for the sentinel. The sentinel is held in state, so
 * each time it mounts (rows arriving after an empty render, or coming back
 * after a filter hid them all) the observer is set up again on the new node.
 * The observer itself stays in an effect: a child's ref attaches before its
 * parent's, so a ref callback would run before `scrollRef` is set.
 */
export function useInfiniteScroll({
  enabled,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  threshold = 200,
  scrollRef,
}: UseInfiniteScrollOptions): React.RefCallback<HTMLElement> {
  const [sentinel, setSentinel] = React.useState<HTMLElement | null>(null)
  // The sentinel the observer last saw in view. Keyed by node so a replaced
  // or detached sentinel never counts as visible.
  const [visible, setVisible] = React.useState<HTMLElement | null>(null)
  const isIntersecting = enabled && sentinel !== null && visible === sentinel

  React.useEffect(() => {
    if (!enabled || !sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        // The browser may batch several records (e.g. the initial "not
        // visible" plus a quick scroll's "visible"); the last is current.
        const entry = entries[entries.length - 1]
        if (entry) setVisible(entry.isIntersecting ? sentinel : null)
      },
      {
        root: scrollRef.current ?? null,
        rootMargin: `0px 0px ${threshold}px 0px`,
      }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [enabled, threshold, scrollRef, sentinel])

  React.useEffect(() => {
    if (enabled && isIntersecting && hasNextPage && !isFetchingNextPage) {
      onLoadMore?.()
    }
  }, [enabled, isIntersecting, hasNextPage, isFetchingNextPage, onLoadMore])

  return setSentinel
}
