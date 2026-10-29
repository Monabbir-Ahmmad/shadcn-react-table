"use client"

import { cn } from "@workspace/ui/lib/utils"

import { REVEAL_CLASS, useReveal } from "@/hooks/use-reveal"

/** A section that fades in once it scrolls into view. */
export function Reveal({
  className,
  ...props
}: React.ComponentProps<"section">) {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} className={cn(REVEAL_CLASS, className)} {...props} />
  )
}
