"use client"

import dynamic from "next/dynamic"
import * as React from "react"

import { themeVars } from "@/lib/theme-presets"
import {
  isToFrame,
  type FrameTheme,
  type FromFrame,
} from "@/lib/style-frame-protocol"

const LOADING = () => <div className="h-[420px]" />

// One dynamic import per style, so a frame downloads only its own style.
const TABLES: Record<
  string,
  React.ComponentType<{ icons: "lucide" | "remix" }>
> = {
  vega: dynamic(() => import("@/generated/style-tables/vega/frame-table"), {
    ssr: false,
    loading: LOADING,
  }),
  nova: dynamic(() => import("@/generated/style-tables/nova/frame-table"), {
    ssr: false,
    loading: LOADING,
  }),
  maia: dynamic(() => import("@/generated/style-tables/maia/frame-table"), {
    ssr: false,
    loading: LOADING,
  }),
  lyra: dynamic(() => import("@/generated/style-tables/lyra/frame-table"), {
    ssr: false,
    loading: LOADING,
  }),
  mira: dynamic(() => import("@/generated/style-tables/mira/frame-table"), {
    ssr: false,
    loading: LOADING,
  }),
  sera: dynamic(() => import("@/generated/style-tables/sera/frame-table"), {
    ssr: false,
    loading: LOADING,
  }),
}

/** Renders one style's table and follows the theme the home page sends. */
export function StyleFrameClient({ style }: { style: string }) {
  const Table = TABLES[style]
  const [icons, setIcons] = React.useState<FrameTheme["icons"]>("lucide")
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.source !== window.parent ||
        event.origin !== window.location.origin ||
        !isToFrame(event.data)
      )
        return
      const { theme } = event.data
      const root = document.documentElement
      root.classList.toggle("dark", theme.dark)
      for (const [k, v] of Object.entries(themeVars(theme, theme.dark)))
        root.style.setProperty(k, v)
      setIcons(theme.icons)
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  React.useEffect(() => {
    const node = rootRef.current
    if (!node || window.parent === window) return
    const observer = new ResizeObserver(() => {
      const message: FromFrame = {
        type: "srt:height",
        height: Math.ceil(node.scrollHeight),
      }
      window.parent.postMessage(message, window.location.origin)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  if (!Table) return null
  return (
    <div
      ref={rootRef}
      data-pagefind-ignore
      className="bg-background p-3 font-sans text-foreground"
    >
      <Table icons={icons === "remix" ? "remix" : "lucide"} />
    </div>
  )
}
