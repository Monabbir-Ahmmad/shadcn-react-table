import type { IconLibrary } from "@/components/examples/icon-sets"

export interface ThemePrefs {
  accent: string
  base: string
  font: string
  radius: string
  icons: IconLibrary
}

const KEY = "shadcn-react-table-theme"

export const DEFAULT_PREFS: ThemePrefs = {
  accent: "lime",
  base: "neutral",
  font: "raleway",
  radius: "0rem",
  icons: "lucide",
}

/** Radii saved by earlier versions, mapped to the current presets. */
const RADIUS_RENAMES: Record<string, string> = { "0.65rem": "0.625rem" }

/** Saved prefs over the defaults, with old values moved to current ones. */
export function migratePrefs(saved: Partial<ThemePrefs>): ThemePrefs {
  const prefs = { ...DEFAULT_PREFS, ...saved }
  return { ...prefs, radius: RADIUS_RENAMES[prefs.radius] ?? prefs.radius }
}

export function readPrefs(): ThemePrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS
  try {
    return migratePrefs(JSON.parse(localStorage.getItem(KEY) || "{}"))
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
