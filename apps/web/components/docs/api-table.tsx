"use client"

import * as React from "react"

import * as generated from "@/lib/api-reference.generated"
import type { ApiMember } from "@/lib/api-reference.generated"

type SectionKey = keyof typeof generated

const SECTIONS = generated as Record<string, ApiMember[]>

/**
 * Renders an auto-generated API reference table. `of` selects one of the
 * exported arrays in `lib/api-reference.generated.ts` (rebuilt by
 * `pnpm --filter tablecn-web api:build`). `propLabel` sets the first header
 * ("Option" / "Prop" / "Key" / "Slot").
 *
 * - `only`: restrict to the named members, in the given order — use this in a
 *   guide to show just that feature's relevant options inline.
 * - `search`: show a filter box (defaults on for the full table, off when
 *   `only` is set).
 */
export function ApiTable({
  of,
  propLabel = "Prop",
  only,
  search,
}: {
  of: SectionKey
  propLabel?: string
  only?: string[]
  search?: boolean
}) {
  const all = SECTIONS[of] ?? []

  const rows = React.useMemo(() => {
    if (!only) return all
    const byName = new Map(all.map((m) => [m.name, m]))
    return only.map((name) => byName.get(name)).filter(Boolean) as ApiMember[]
  }, [all, only])

  const showSearch = search ?? !only
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const filtered = q
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      )
    : rows

  return (
    <div className="my-6 flex flex-col gap-2">
      {showSearch && (
        <div className="flex items-center justify-between gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${rows.length} ${propLabel.toLowerCase()}s…`}
            aria-label={`Filter ${propLabel} table`}
            className="h-8 w-full max-w-xs rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          {q && (
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {filtered.length} of {rows.length}
            </span>
          )}
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-3 py-2 font-medium">{propLabel}</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Default</th>
              <th className="px-3 py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  No matches.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.name}
                  className="border-b align-top last:border-0"
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {row.name}
                      {!row.required && (
                        <span className="text-muted-foreground">?</span>
                      )}
                    </code>
                  </td>
                  <td className="px-3 py-2">
                    <code className="font-mono text-xs text-muted-foreground">
                      {row.type}
                    </code>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {row.default != null ? (
                      <code className="font-mono text-xs">{row.default}</code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.description || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
