"use client"

import * as React from "react"

import { Checkbox } from "@workspace/ui/components/checkbox"

import { mergeProps } from "../../helpers/slot-props"

/** A click, as either library's checkbox hands it over. */
type CheckboxClick = React.MouseEvent<HTMLElement>

interface SelectionCheckboxProps extends Omit<
  React.ComponentProps<typeof Checkbox>,
  "checked" | "onCheckedChange" | "onClick"
> {
  checked?: boolean
  indeterminate?: boolean
  /** Called with the new value and the click (for its modifier keys). */
  onCheckedChange?: (checked: boolean, event: CheckboxClick) => void
  /** Single-row selection: a click only ever selects (another row's click
   *  moves the selection), like a radio button. */
  variant?: "checkbox" | "radio"
}

/**
 * Which library the installed shadcn `Checkbox` is built on, once one has
 * rendered: Radix draws a `<button>`, Base UI a `<span>`. Shared by every
 * table on the page; until known, Radix is assumed.
 */
let library: "radix" | "base" | null = null

/**
 * The selection checkbox: the installed shadcn `Checkbox`, so it looks like
 * every other checkbox in the app. The change goes through the click, not
 * `onCheckedChange`, so the caller gets the event's modifier keys (shift-click
 * range selection).
 *
 * "Partly checked" (the select-all box when some rows are selected) is spelled
 * differently by the two libraries shadcn builds on: Radix takes
 * `checked="indeterminate"`, Base UI a separate `indeterminate` prop (an
 * unknown prop would reach Radix's `<button>` as a stray attribute). So the
 * checkbox learns which one rendered it and passes the state its way.
 */
function SelectionCheckbox({
  indeterminate = false,
  checked = false,
  onCheckedChange,
  variant = "checkbox",
  ...props
}: SelectionCheckboxProps) {
  const [seen, setSeen] = React.useState(library)
  const detect = React.useCallback((el: HTMLElement | null) => {
    if (!el || library) return
    library = el.tagName === "SPAN" ? "base" : "radix"
    setSeen(library)
  }, [])

  // Each library types only its own spelling: assert, as for TooltipProvider.
  const state = (
    seen === "base"
      ? { checked: checked && !indeterminate, indeterminate }
      : { checked: indeterminate ? "indeterminate" : checked }
  ) as Partial<React.ComponentProps<typeof Checkbox>>

  return (
    <Checkbox
      {...mergeProps(
        props as React.ComponentProps<typeof Checkbox>,
        {
          ...state,
          ref: detect,
          onClick: (event: CheckboxClick) => {
            // The table owns the state: skip the checkbox's own toggle.
            event.preventDefault()
            onCheckedChange?.(variant === "radio" ? true : !checked, event)
          },
        } as React.ComponentProps<typeof Checkbox>
      )}
    />
  )
}

export { SelectionCheckbox }
