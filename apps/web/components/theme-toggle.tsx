"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { RiMoonLine, RiSunLine } from "@remixicon/react"

import { Button } from "@monabbir/tablecn/components/button"

/**
 * Light/dark theme toggle (press `d` also works, via the provider hotkey).
 * Renders a stable placeholder until mounted so SSR and client markup match.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  // Standard next-themes guard: theme is unknown during SSR.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setMounted(true), [])

  // Theme is unknown during SSR, so treat as light until mounted — this keeps
  // the label, icon, and handler identical on the server and the first client
  // render (avoids a hydration mismatch); they update once mounted.
  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle theme (d)"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <RiSunLine /> : <RiMoonLine />}
    </Button>
  )
}
