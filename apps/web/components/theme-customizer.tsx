"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  RiComputerLine,
  RiMoonLine,
  RiPaletteLine,
  RiSunLine,
} from "@remixicon/react"

import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import type { IconLibrary } from "@/components/examples/icon-sets"
import { readPrefs, writePrefs } from "@/lib/theme-store"

// --- Accent presets (the --primary token) ----------------------------------
type Accent = { primary: string; primaryForeground: string; ring: string }
type ColorPreset = { name: string; label: string; light: Accent; dark: Accent }
const WHITE = "oklch(0.985 0 0)"

const ACCENTS: ColorPreset[] = [
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
const BASE_COLORS = [
  { name: "neutral", label: "Neutral", hue: 0, chroma: 0 },
  { name: "stone", label: "Stone", hue: 60, chroma: 0.006 },
  { name: "zinc", label: "Zinc", hue: 286, chroma: 0.006 },
  { name: "slate", label: "Slate", hue: 256, chroma: 0.013 },
  { name: "gray", label: "Gray", hue: 264, chroma: 0.004 },
] as const

function ramp(hue: number, c: number) {
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
const FONTS = [
  { name: "raleway", label: "Raleway", value: "var(--font-raleway)" },
  { name: "geist", label: "Geist", value: "var(--font-geist)" },
  {
    name: "system",
    label: "System",
    value: "ui-sans-serif, system-ui, sans-serif",
  },
  { name: "serif", label: "Serif", value: "var(--font-noto-serif)" },
] as const

const RADII = ["0rem", "0.3rem", "0.45rem", "0.65rem", "1rem"]

const ICON_LIBS: { name: IconLibrary; label: string }[] = [
  { name: "lucide", label: "Lucide" },
  { name: "remix", label: "Remix" },
]

function setVars(vars: Record<string, string>) {
  const root = document.documentElement
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
}

export function ThemeCustomizer({
  iconLibrary,
  onIconLibraryChange,
}: {
  iconLibrary: IconLibrary
  onIconLibraryChange: (lib: IconLibrary) => void
}) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [accent, setAccent] = React.useState(() => readPrefs().accent)
  const [base, setBase] = React.useState(() => readPrefs().base)
  const [font, setFont] = React.useState(() => readPrefs().font)
  const [radius, setRadius] = React.useState(() => readPrefs().radius)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    const isDark = resolvedTheme === "dark"
    const a = (ACCENTS.find((x) => x.name === accent) ?? ACCENTS[0]!)[
      isDark ? "dark" : "light"
    ]
    const b = BASE_COLORS.find((x) => x.name === base) ?? BASE_COLORS[0]!
    const f = FONTS.find((x) => x.name === font) ?? FONTS[0]!
    setVars({
      ...ramp(b.hue, b.chroma)[isDark ? "dark" : "light"],
      "--primary": a.primary,
      "--primary-foreground": a.primaryForeground,
      "--ring": a.ring,
      "--sidebar-primary": a.primary,
      "--radius": radius,
      "--font-sans": f.value,
    })
    writePrefs({ accent, base, font, radius, icons: iconLibrary })
  }, [mounted, accent, base, font, radius, resolvedTheme, iconLibrary])

  const MODES = [
    { value: "light", icon: RiSunLine, label: "Light" },
    { value: "dark", icon: RiMoonLine, label: "Dark" },
    { value: "system", icon: RiComputerLine, label: "System" },
  ] as const

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Customize theme"
        >
          <RiPaletteLine />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[80vh] w-72 overflow-y-auto p-4"
      >
        <div className="flex flex-col gap-4">
          <Section label="Accent">
            <div className="grid grid-cols-7 gap-2">
              {ACCENTS.map((c) => (
                <Swatch
                  key={c.name}
                  color={c.light.primary}
                  active={mounted && accent === c.name}
                  title={c.label}
                  onClick={() => setAccent(c.name)}
                />
              ))}
            </div>
          </Section>

          <Section label="Base color">
            <div className="grid grid-cols-5 gap-2">
              {BASE_COLORS.map((b) => (
                <Swatch
                  key={b.name}
                  color={`oklch(0.55 ${(b.chroma * 4).toFixed(3)} ${b.hue})`}
                  active={mounted && base === b.name}
                  title={b.label}
                  onClick={() => setBase(b.name)}
                />
              ))}
            </div>
          </Section>

          <Section label="Font">
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map((f) => (
                <Button
                  key={f.name}
                  type="button"
                  variant={mounted && font === f.name ? "default" : "outline"}
                  size="sm"
                  className="h-8 justify-start text-xs"
                  style={{ fontFamily: f.value }}
                  onClick={() => setFont(f.name)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </Section>

          <Section label="Radius">
            <div className="grid grid-cols-5 gap-2">
              {RADII.map((r) => (
                <Button
                  key={r}
                  type="button"
                  variant={mounted && radius === r ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-0 text-xs"
                  onClick={() => setRadius(r)}
                >
                  {parseFloat(r)}
                </Button>
              ))}
            </div>
          </Section>

          <Section label="Icon library">
            <div className="grid grid-cols-2 gap-2">
              {ICON_LIBS.map((l) => (
                <Button
                  key={l.name}
                  type="button"
                  variant={iconLibrary === l.name ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => onIconLibraryChange(l.name)}
                >
                  {l.label}
                </Button>
              ))}
            </div>
          </Section>

          <Section label="Mode">
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((m) => (
                <Button
                  key={m.value}
                  type="button"
                  variant={mounted && theme === m.value ? "default" : "outline"}
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setTheme(m.value)}
                >
                  <m.icon className="size-3.5" />
                  {m.label}
                </Button>
              ))}
            </div>
          </Section>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

function Swatch({
  color,
  active,
  title,
  onClick,
}: {
  color: string
  active: boolean
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={onClick}
      className={cn(
        "size-7 rounded-md border transition-colors",
        active
          ? "border-foreground ring-2 ring-foreground/20"
          : "border-border hover:border-foreground/40"
      )}
      style={{ backgroundColor: color }}
    />
  )
}
