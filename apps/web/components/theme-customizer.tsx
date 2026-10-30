"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  RiArrowUpDownLine,
  RiComputerLine,
  RiMoonLine,
  RiPaletteLine,
  RiResetLeftLine,
  RiShuffleLine,
  RiSunLine,
} from "@remixicon/react"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

import type { IconLibrary } from "@/components/examples/icon-sets"
import {
  ACCENTS,
  BASE_COLORS,
  FONTS,
  ICON_LIBS,
  MENU_ACCENTS,
  RADII,
  themeVars,
} from "@/lib/theme-presets"
import { DEFAULT_PREFS, readPrefs, writePrefs } from "@/lib/theme-store"

function setVars(vars: Record<string, string>) {
  const root = document.documentElement
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
}

/** The picks that restyle the site through CSS variables. */
type Picks = {
  accent: string
  base: string
  font: string
  heading: string
  radius: string
  menuAccent: string
}

const pickOf = (prefs: typeof DEFAULT_PREFS): Picks => ({
  accent: prefs.accent,
  base: prefs.base,
  font: prefs.font,
  heading: prefs.heading,
  radius: prefs.radius,
  menuAccent: prefs.menuAccent,
})

const random = <T,>(list: readonly T[]) =>
  list[Math.floor(Math.random() * list.length)]!

const baseSwatch = (b: (typeof BASE_COLORS)[number]) =>
  `oklch(0.55 ${(b.chroma * 4).toFixed(3)} ${b.hue})`

const MODES = [
  { value: "light", icon: RiSunLine, label: "Light" },
  { value: "dark", icon: RiMoonLine, label: "Dark" },
  { value: "system", icon: RiComputerLine, label: "System" },
] as const

const ICON_SAMPLES: Record<IconLibrary, React.ReactNode> = {
  lucide: <ArrowUpDown />,
  remix: <RiArrowUpDownLine />,
}

/**
 * The header's theme panel: the site behind it is the live preview. Every
 * pick restyles the whole site at once and is remembered in this browser.
 */
export function ThemeCustomizer({
  iconLibrary,
  onIconLibraryChange,
}: {
  iconLibrary: IconLibrary
  onIconLibraryChange: (lib: IconLibrary) => void
}) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [picks, setPicks] = React.useState(() => pickOf(readPrefs()))
  const dark = resolvedTheme === "dark"

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    setVars(themeVars(picks, dark))
    writePrefs({ ...picks, icons: iconLibrary })
  }, [mounted, picks, dark, iconLibrary])

  const pick = (key: keyof Picks) => (value: string) =>
    setPicks((prev) => ({ ...prev, [key]: value }))

  return (
    <Sheet modal={false}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Customize theme"
        >
          <RiPaletteLine />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-80"
        // Non-modal: the page stays visible and usable as the preview.
        onInteractOutside={(event) => event.preventDefault()}
      >
        <SheetHeader className="border-b">
          <SheetTitle>Customize</SheetTitle>
          <SheetDescription>
            Restyles the whole site as you pick. Saved in this browser.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <Row label="Mode">
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((m) => (
                <Button
                  key={m.value}
                  type="button"
                  variant={mounted && theme === m.value ? "default" : "outline"}
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  aria-pressed={mounted && theme === m.value}
                  onClick={() => setTheme(m.value)}
                >
                  <m.icon className="size-3.5" />
                  {m.label}
                </Button>
              ))}
            </div>
          </Row>

          <Picker
            label="Accent"
            value={picks.accent}
            onChange={pick("accent")}
            options={ACCENTS.map((a) => ({
              value: a.name,
              label: a.label,
              preview: <Dot color={a[dark ? "dark" : "light"].primary} />,
            }))}
          />
          <Picker
            label="Base color"
            value={picks.base}
            onChange={pick("base")}
            options={BASE_COLORS.map((b) => ({
              value: b.name,
              label: b.label,
              preview: <Dot color={baseSwatch(b)} />,
            }))}
          />
          <Picker
            label="Font"
            value={picks.font}
            onChange={pick("font")}
            options={FONTS.map((f) => ({
              value: f.name,
              label: f.label,
              preview: <Aa font={f.value} />,
            }))}
          />
          <Picker
            label="Heading font"
            value={picks.heading}
            onChange={pick("heading")}
            options={FONTS.map((f) => ({
              value: f.name,
              label: f.label,
              preview: <Aa font={f.value} />,
            }))}
          />
          <Picker
            label="Radius"
            value={picks.radius}
            onChange={pick("radius")}
            options={RADII.map((r) => ({
              value: r,
              label: `${parseFloat(r)} rem`,
              preview: <Corner radius={r} />,
            }))}
          />
          <Picker
            label="Menu accent"
            value={picks.menuAccent}
            onChange={pick("menuAccent")}
            options={MENU_ACCENTS.map((m) => ({
              value: m.name,
              label: m.label,
              preview: (
                <span
                  className={cn(
                    "h-3 w-5 rounded-[3px]",
                    m.name === "bold" ? "bg-primary" : "bg-muted"
                  )}
                />
              ),
            }))}
          />
          <Picker
            label="Icons"
            value={iconLibrary}
            onChange={(lib) => onIconLibraryChange(lib as IconLibrary)}
            options={ICON_LIBS.map((l) => ({
              value: l.name,
              label: l.label,
              preview: (
                <span className="flex [&_svg]:size-3.5">
                  {ICON_SAMPLES[l.name]}
                </span>
              ),
            }))}
          />
        </div>

        <SheetFooter className="grid grid-cols-2 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPicks({
                accent: random(ACCENTS).name,
                base: random(BASE_COLORS).name,
                font: random(FONTS).name,
                heading: random(FONTS).name,
                radius: random(RADII),
                menuAccent: random(MENU_ACCENTS).name,
              })
              onIconLibraryChange(random(ICON_LIBS).name)
            }}
          >
            <RiShuffleLine />
            Randomize
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPicks(pickOf(DEFAULT_PREFS))
              onIconLibraryChange(DEFAULT_PREFS.icons)
            }}
          >
            <RiResetLeftLine />
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Row({
  label,
  id,
  children,
}: {
  label: string
  id?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

/** One option row: the current pick with its preview, opening the list. */
function Picker({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; preview: React.ReactNode }[]
}) {
  const id = React.useId()
  return (
    <Row label={label} id={id}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              <span className="flex w-5 shrink-0 justify-center">
                {o.preview}
              </span>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Row>
  )
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="size-3.5 rounded-full border border-foreground/10"
      style={{ backgroundColor: color }}
    />
  )
}

function Aa({ font }: { font: string }) {
  return (
    <span className="text-sm leading-none" style={{ fontFamily: font }}>
      Aa
    </span>
  )
}

function Corner({ radius }: { radius: string }) {
  return (
    <span
      className="size-3.5 border-s-2 border-t-2 border-foreground/70"
      style={{ borderTopLeftRadius: `calc(${radius} * 1.2)` }}
    />
  )
}
