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
import {
  ACCENTS,
  BASE_COLORS,
  FONTS,
  ICON_LIBS,
  RADII,
  themeVars,
} from "@/lib/theme-presets"
import { readPrefs, writePrefs } from "@/lib/theme-store"

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
    setVars(themeVars({ accent, base, font, radius }, isDark))
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
