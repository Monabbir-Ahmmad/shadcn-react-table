"use client"

import { EXAMPLES } from "@/components/examples/registry"

/** The hero's proof line. The example registry is a client module, so the
 *  count is read in this client leaf, which server components can render. */
export function ProofLine() {
  return (
    <>{`${EXAMPLES.length} examples · 38 languages · 600+ tests · Radix & Base UI`}</>
  )
}
