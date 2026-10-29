"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { mergeProps } from "../../helpers/slot-props"

interface SelectionCheckboxProps extends Omit<
  React.ComponentProps<"button">,
  "onChange" | "type" | "role" | "aria-checked"
> {
  checked?: boolean
  indeterminate?: boolean
  /** Called with the new value and the click (for its modifier keys). */
  onCheckedChange?: (
    checked: boolean,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void
  /** A radio button (single-row selection) instead of a checkbox. */
  variant?: "checkbox" | "radio"
}

/**
 * Selection checkbox that renders a minus glyph for the indeterminate
 * (some-but-not-all) state — the visual MRT uses for partial select-all.
 *
 * Implemented as a styled `role="checkbox"` button (no headless primitive) so
 * the data table carries no direct dependency on a specific primitive library
 * and renders identically whether the consumer's shadcn setup is Radix- or
 * Base-UI-based. Mirrors the shadcn `Checkbox` styling so it blends in.
 *
 * The check / indeterminate glyphs are inline SVG (not the swappable `icons`
 * system, nor an icon-library import) so a selection checkbox never depends on
 * a particular icon package — it renders the same even if a consumer overrides
 * every table icon or doesn't install Lucide.
 */
function SelectionCheckbox({
  className,
  indeterminate = false,
  checked = false,
  onCheckedChange,
  variant = "checkbox",
  ...props
}: SelectionCheckboxProps) {
  const active = checked || indeterminate
  const radio = variant === "radio"
  return (
    <button
      {...mergeProps(
        {
          type: "button",
          role: radio ? "radio" : "checkbox",
          "data-slot": radio ? "radio" : "checkbox",
          "aria-checked": indeterminate ? "mixed" : checked,
          onClick: (event: React.MouseEvent<HTMLButtonElement>) =>
            onCheckedChange?.(!checked, event),
          className: cn(
            "peer relative flex size-4.5 shrink-0 items-center justify-center border bg-transparent transition-shadow outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
            radio ? "rounded-full" : "rounded-none",
            active && !radio
              ? "border-primary bg-primary text-primary-foreground"
              : active
                ? "border-primary text-primary"
                : "border-input"
          ),
        } as React.ComponentProps<"button">,
        { ...props, className }
      )}
    >
      {active && radio && (
        <span aria-hidden="true" className="size-2 rounded-full bg-current" />
      )}
      {active && !radio && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
          aria-hidden="true"
        >
          {indeterminate ? <path d="M5 12h14" /> : <path d="M20 6 9 17l-5-5" />}
        </svg>
      )}
    </button>
  )
}

export { SelectionCheckbox }
