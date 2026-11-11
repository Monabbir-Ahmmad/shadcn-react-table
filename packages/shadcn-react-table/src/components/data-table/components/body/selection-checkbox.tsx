"use client"

import * as React from "react"

import { Checkbox } from "@workspace/ui/components/checkbox"

interface SelectionCheckboxProps extends Omit<
  React.ComponentProps<typeof Checkbox>,
  "checked" | "onCheckedChange" | "onClick"
> {
  checked?: boolean
  indeterminate?: boolean
  /** Called with the new value and the click (for its modifier keys). */
  onCheckedChange?: (
    checked: boolean,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void
  /** Single-row selection: a click only ever selects (another row's click
   *  moves the selection), like a radio button. */
  variant?: "checkbox" | "radio"
}

/**
 * The selection checkbox: the installed shadcn `Checkbox`, so it looks like
 * every other checkbox in the app. Indeterminate (some-but-not-all, on the
 * select-all box) is the checkbox's own `"indeterminate"` state. The change
 * goes through the click, not `onCheckedChange`, so the caller gets the
 * event's modifier keys (shift-click range selection).
 */
function SelectionCheckbox({
  indeterminate = false,
  checked = false,
  onCheckedChange,
  variant = "checkbox",
  ...props
}: SelectionCheckboxProps) {
  return (
    <Checkbox
      {...props}
      checked={indeterminate ? "indeterminate" : checked}
      onClick={(event) => {
        // The table owns the state: skip the checkbox's own toggle.
        event.preventDefault()
        onCheckedChange?.(variant === "radio" ? true : !checked, event)
      }}
    />
  )
}

export { SelectionCheckbox }
