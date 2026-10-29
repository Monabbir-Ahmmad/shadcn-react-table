"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

import { STYLE_DEFAULT, type FrameChoice } from "@/lib/deck"
import {
  ACCENTS,
  BASE_COLORS,
  FONTS,
  ICON_LIBS,
  RADII,
} from "@/lib/theme-presets"

/** The deck's picks; font and radius may be STYLE_DEFAULT. */
export type DeckChoice = FrameChoice

// The site's radius steps, with the one nearest shadcn's default (0.625rem)
// swapped for the default itself, so "every style at shadcn's default" is one
// click away.
const DECK_RADII = RADII.map((r) => (r === "0.65rem" ? "0.625rem" : r))

const OWN: Option = {
  value: STYLE_DEFAULT,
  label: "Style default",
  content: "Default",
}

type Option = { value: string; label: string; content?: React.ReactNode }

/** A compact row of mutually exclusive buttons with a mono caption. */
function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Option[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <div
        role="group"
        aria-label={label}
        className="flex h-8 w-fit max-w-full overflow-x-auto border bg-background"
      >
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              aria-label={o.content ? o.label : undefined}
              title={o.content ? o.label : undefined}
              onClick={() => onChange(o.value)}
              className={cn(
                "flex shrink-0 items-center justify-center border-s px-2 text-xs whitespace-nowrap transition-colors first:border-s-0 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {o.content ?? o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Base color, accent, font, radius and icon pickers for the style deck. */
export function DeckPickers({
  value,
  onChange,
  dark,
}: {
  value: DeckChoice
  onChange: (next: DeckChoice) => void
  dark: boolean
}) {
  const set =
    <K extends keyof DeckChoice>(key: K) =>
    (v: string) =>
      onChange({ ...value, [key]: v as DeckChoice[K] })

  return (
    <div className="flex flex-wrap items-end gap-x-5 gap-y-5 lg:grid lg:grid-cols-[repeat(3,auto)] lg:justify-start lg:gap-x-10">
      <Segmented
        label="Font"
        value={value.font}
        onChange={set("font")}
        options={[
          OWN,
          ...FONTS.map((f) => ({
            value: f.name,
            label: f.label,
            content: <span style={{ fontFamily: f.value }}>{f.label}</span>,
          })),
        ]}
      />
      <Segmented
        label="Radius · rem"
        value={value.radius}
        onChange={set("radius")}
        options={[
          OWN,
          ...DECK_RADII.map((r) => {
            const n = r.replace("rem", "")
            return {
              value: r,
              label: `${n} rem`,
              content: (
                <span className="font-mono">{n.replace(/^0(?=\.)/, "")}</span>
              ),
            }
          }),
        ]}
      />
      <Segmented
        label="Icons"
        value={value.icons}
        onChange={set("icons")}
        options={ICON_LIBS.map((i) => ({ value: i.name, label: i.label }))}
      />
      <Segmented
        label="Base color"
        value={value.base}
        onChange={set("base")}
        options={BASE_COLORS.map((b) => ({ value: b.name, label: b.label }))}
      />
      <Segmented
        label="Accent"
        value={value.accent}
        onChange={set("accent")}
        options={ACCENTS.map((a) => ({
          value: a.name,
          label: a.label,
          content: (
            <span
              aria-hidden
              className="size-3.5 border border-foreground/15"
              style={{ backgroundColor: (dark ? a.dark : a.light).primary }}
            />
          ),
        }))}
      />
    </div>
  )
}
