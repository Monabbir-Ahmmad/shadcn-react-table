"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { RiCheckLine, RiSubtractLine } from "@remixicon/react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * Selection checkbox that renders a minus glyph for the indeterminate
 * (some-but-not-all) state — the visual MRT uses for partial select-all.
 * Mirrors the shadcn `Checkbox` styling so it blends with the rest of the UI.
 */
function SelectionCheckbox({
  className,
  indeterminate = false,
  checked,
  ...props
}: Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "checked"> & {
  indeterminate?: boolean
  checked?: boolean
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={indeterminate ? "indeterminate" : checked}
      className={cn(
        "peer relative flex size-4.5 shrink-0 items-center justify-center rounded-none border border-input bg-transparent transition-shadow outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        {indeterminate ? <RiSubtractLine /> : <RiCheckLine />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { SelectionCheckbox }
