"use client"

import * as React from "react"

import { NOT_IN_LEAVE_COPY } from "../core/motion"

// Never the controls of a leaving row's copy (row animations), which fades
// out in the motion layer for a moment.
const TABBABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
]
  .map((selector) => selector + NOT_IN_LEAVE_COPY)
  .join(", ")

const EDITABLE = new Set(["INPUT", "TEXTAREA", "SELECT"])

/**
 * Full-screen mode behaves as a modal dialog: the page behind stops
 * scrolling, Tab cycles inside the table, Escape leaves, and focus returns to
 * where it was when leaving would otherwise drop it on the page.
 */
export function useFullscreenModal(
  paperRef: React.RefObject<HTMLElement | null>,
  isFullscreen: boolean,
  exit: () => void
) {
  React.useEffect(() => {
    if (!isFullscreen) return
    const returnTo = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = overflow
      const active = document.activeElement
      if ((!active || active === document.body) && returnTo?.isConnected) {
        returnTo.focus()
      }
    }
  }, [isFullscreen])

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const paper = paperRef.current
    if (!isFullscreen || !paper) return
    // Only keys from the table itself: menus and pickers render in portals
    // (React still bubbles their events here), take focus and close themselves
    // on Escape.
    const target = event.target as HTMLElement
    if (!paper.contains(target)) return

    if (event.key === "Escape") {
      // With focus still in the table, the only layer that may have claimed
      // the key is a tooltip, which closes as the table does. Inline editors
      // keep Escape for cancelling.
      if (EDITABLE.has(target.tagName)) return
      exit()
      return
    }
    if (event.defaultPrevented) return

    if (event.key === "Tab") {
      const tabbable = Array.from(
        paper.querySelectorAll<HTMLElement>(TABBABLE)
      ).filter((el) => el.getClientRects().length > 0)
      const first = tabbable[0]
      const last = tabbable[tabbable.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  return { onKeyDown }
}
