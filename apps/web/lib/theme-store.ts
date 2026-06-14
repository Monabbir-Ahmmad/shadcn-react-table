import type { IconLibrary } from "@/components/examples/icon-sets"

export interface ThemePrefs {
  accent: string
  base: string
  font: string
  radius: string
  icons: IconLibrary
}

const KEY = "tablecn-theme"

export const DEFAULT_PREFS: ThemePrefs = {
  accent: "lime",
  base: "neutral",
  font: "raleway",
  radius: "0.45rem",
  icons: "remix",
}

export function readPrefs(): ThemePrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }
  } catch {
    return DEFAULT_PREFS
  }
}

export function writePrefs(prefs: ThemePrefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}
