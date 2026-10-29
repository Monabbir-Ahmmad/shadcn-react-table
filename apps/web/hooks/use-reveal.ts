"use client"

import * as React from "react"

/** Classes for an element that fades and rises in once it is revealed. */
export const REVEAL_CLASS =
  "opacity-0 data-[revealed]:animate-in data-[revealed]:fade-in data-[revealed]:slide-in-from-bottom-4 data-[revealed]:opacity-100 data-[revealed]:duration-700 motion-reduce:opacity-100 motion-reduce:data-[revealed]:animate-none [@media(scripting:none)]:opacity-100 print:opacity-100"

/** Marks the element with `data-revealed` the first time it scrolls into view. */
export function useReveal<T extends HTMLElement>(): React.RefCallback<T> {
  return React.useCallback((node: T | null) => {
    if (!node) return
    if (typeof IntersectionObserver === "undefined") {
      node.dataset.revealed = ""
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          node.dataset.revealed = ""
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
}
