import type { IconLibrary } from "@/components/examples/icon-sets"

// --- Accent presets (the --primary token) ----------------------------------
export type Accent = {
  primary: string
  primaryForeground: string
  ring: string
}
export type ColorPreset = {
  name: string
  label: string
  light: Accent
  dark: Accent
}
export const WHITE = "oklch(0.985 0 0)"

export const ACCENTS: ColorPreset[] = [
  {
    name: "lime",
    label: "Lime",
    light: {
      primary: "oklch(0.841 0.238 128.85)",
      primaryForeground: "oklch(0.405 0.101 131.063)",
      ring: "oklch(0.711 0.019 323.02)",
    },
    dark: {
      primary: "oklch(0.768 0.233 130.85)",
      primaryForeground: "oklch(0.405 0.101 131.063)",
      ring: "oklch(0.542 0.034 322.5)",
    },
  },
  {
    name: "blue",
    label: "Blue",
    light: {
      primary: "oklch(0.55 0.22 258)",
      primaryForeground: WHITE,
      ring: "oklch(0.55 0.22 258)",
    },
    dark: {
      primary: "oklch(0.62 0.19 258)",
      primaryForeground: WHITE,
      ring: "oklch(0.62 0.19 258)",
    },
  },
  {
    name: "violet",
    label: "Violet",
    light: {
      primary: "oklch(0.55 0.25 293)",
      primaryForeground: WHITE,
      ring: "oklch(0.55 0.25 293)",
    },
    dark: {
      primary: "oklch(0.61 0.22 293)",
      primaryForeground: WHITE,
      ring: "oklch(0.61 0.22 293)",
    },
  },
  {
    name: "rose",
    label: "Rose",
    light: {
      primary: "oklch(0.59 0.24 14)",
      primaryForeground: WHITE,
      ring: "oklch(0.59 0.24 14)",
    },
    dark: {
      primary: "oklch(0.64 0.22 14)",
      primaryForeground: WHITE,
      ring: "oklch(0.64 0.22 14)",
    },
  },
  {
    name: "orange",
    label: "Orange",
    light: {
      primary: "oklch(0.67 0.19 47)",
      primaryForeground: WHITE,
      ring: "oklch(0.67 0.19 47)",
    },
    dark: {
      primary: "oklch(0.71 0.18 47)",
      primaryForeground: "oklch(0.21 0.02 47)",
      ring: "oklch(0.71 0.18 47)",
    },
  },
  {
    name: "emerald",
    label: "Emerald",
    light: {
      primary: "oklch(0.60 0.16 150)",
      primaryForeground: WHITE,
      ring: "oklch(0.60 0.16 150)",
    },
    dark: {
      primary: "oklch(0.70 0.17 150)",
      primaryForeground: "oklch(0.20 0.03 150)",
      ring: "oklch(0.70 0.17 150)",
    },
  },
  {
    name: "teal",
    label: "Teal",
    light: {
      primary: "oklch(0.60 0.12 185)",
      primaryForeground: WHITE,
      ring: "oklch(0.60 0.12 185)",
    },
    dark: {
      primary: "oklch(0.70 0.14 183)",
      primaryForeground: "oklch(0.20 0.03 185)",
      ring: "oklch(0.70 0.14 183)",
    },
  },
  {
    name: "amber",
    label: "Amber",
    light: {
      primary: "oklch(0.67 0.18 58)",
      primaryForeground: WHITE,
      ring: "oklch(0.67 0.18 58)",
    },
    dark: {
      primary: "oklch(0.77 0.17 70)",
      primaryForeground: "oklch(0.22 0.05 60)",
      ring: "oklch(0.77 0.17 70)",
    },
  },
  {
    name: "red",
    label: "Red",
    light: {
      primary: "oklch(0.58 0.22 27)",
      primaryForeground: WHITE,
      ring: "oklch(0.58 0.22 27)",
    },
    dark: {
      primary: "oklch(0.64 0.21 25)",
      primaryForeground: WHITE,
      ring: "oklch(0.64 0.21 25)",
    },
  },
  {
    name: "zinc",
    label: "Zinc",
    light: {
      primary: "oklch(0.32 0.01 280)",
      primaryForeground: WHITE,
      ring: "oklch(0.55 0.01 280)",
    },
    dark: {
      primary: "oklch(0.92 0 0)",
      primaryForeground: "oklch(0.21 0 0)",
      ring: "oklch(0.55 0 0)",
    },
  },
]

// --- Base color presets (the neutral ramp), generated from hue + chroma -----
export const BASE_COLORS = [
  { name: "neutral", label: "Neutral", hue: 0, chroma: 0 },
  { name: "stone", label: "Stone", hue: 60, chroma: 0.006 },
  { name: "zinc", label: "Zinc", hue: 286, chroma: 0.006 },
  { name: "slate", label: "Slate", hue: 256, chroma: 0.013 },
  { name: "gray", label: "Gray", hue: 264, chroma: 0.004 },
] as const

export function ramp(hue: number, c: number) {
  const o = (l: number, cc: number) => `oklch(${l} ${cc.toFixed(4)} ${hue})`
  return {
    light: {
      "--background": o(0.995, c * 0.2),
      "--foreground": o(0.16, c),
      "--card": "oklch(1 0 0)",
      "--card-foreground": o(0.16, c),
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": o(0.16, c),
      "--secondary": o(0.965, c * 0.5),
      "--secondary-foreground": o(0.21, c),
      "--muted": o(0.965, c * 0.5),
      "--muted-foreground": o(0.52, c * 0.8),
      "--accent": o(0.965, c * 0.5),
      "--accent-foreground": o(0.21, c),
      "--border": o(0.922, c * 0.6),
      "--input": o(0.922, c * 0.6),
    },
    dark: {
      "--background": o(0.16, c * 0.7),
      "--foreground": o(0.985, c * 0.1),
      "--card": o(0.21, c * 0.7),
      "--card-foreground": o(0.985, c * 0.1),
      "--popover": o(0.21, c * 0.7),
      "--popover-foreground": o(0.985, c * 0.1),
      "--secondary": o(0.274, c * 0.7),
      "--secondary-foreground": o(0.985, c * 0.1),
      "--muted": o(0.274, c * 0.7),
      "--muted-foreground": o(0.71, c * 0.5),
      "--accent": o(0.274, c * 0.7),
      "--accent-foreground": o(0.985, c * 0.1),
      "--border": "oklch(1 0 0 / 10%)",
      "--input": "oklch(1 0 0 / 15%)",
    },
  }
}

// --- Font presets -----------------------------------------------------------
export const FONTS = [
  { name: "raleway", label: "Raleway", value: "var(--font-raleway)" },
  { name: "geist", label: "Geist", value: "var(--font-geist)" },
  {
    name: "system",
    label: "System",
    value: "ui-sans-serif, system-ui, sans-serif",
  },
  { name: "inter", label: "Inter", value: "var(--font-inter)" },
  { name: "dm-sans", label: "DM Sans", value: "var(--font-dm-sans)" },
  { name: "serif", label: "Serif", value: "var(--font-noto-serif)" },
  { name: "mono", label: "Geist Mono", value: "var(--font-mono)" },
] as const

/** How menus and hovers highlight: the base color's quiet tint, or the accent. */
export const MENU_ACCENTS = [
  { name: "subtle", label: "Subtle" },
  { name: "bold", label: "Bold" },
] as const

export const RADII = ["0rem", "0.3rem", "0.45rem", "0.625rem", "1rem"]

export const ICON_LIBS: { name: IconLibrary; label: string }[] = [
  { name: "lucide", label: "Lucide" },
  { name: "remix", label: "Remix" },
]

/** The CSS variables for a set of theme choices (what the customizer applies). */
export function themeVars(
  prefs: {
    accent: string
    base: string
    font: string
    radius: string
    /** Unset: headings keep the site's default heading font. */
    heading?: string
    menuAccent?: string
  },
  dark: boolean
): Record<string, string> {
  const mode = dark ? "dark" : "light"
  const a = (ACCENTS.find((x) => x.name === prefs.accent) ?? ACCENTS[0]!)[mode]
  const b = BASE_COLORS.find((x) => x.name === prefs.base) ?? BASE_COLORS[0]!
  const f = FONTS.find((x) => x.name === prefs.font) ?? FONTS[0]!
  const h = FONTS.find((x) => x.name === prefs.heading)
  return {
    ...ramp(b.hue, b.chroma)[mode],
    "--primary": a.primary,
    "--primary-foreground": a.primaryForeground,
    "--ring": a.ring,
    "--sidebar-primary": a.primary,
    "--radius": prefs.radius,
    "--font-sans": f.value,
    ...(h && { "--font-heading": h.value }),
    ...(prefs.menuAccent === "bold" && {
      "--accent": a.primary,
      "--accent-foreground": a.primaryForeground,
    }),
  }
}
