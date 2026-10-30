import type { RowData } from "@tanstack/react-table"
import type * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

import type { DataTableInstance, DataTableSlots } from "../core/types"

type AnyProps = Record<string, unknown>

// Composed refs, cached per pair so the same two refs give the same callback
// on every render (a new callback makes React detach and re-attach the
// element on each commit).
const composedRefs = new WeakMap<object, WeakMap<object, unknown>>()

/** Points both refs at the element (callback or object refs). */
function composeRefs<T>(a: React.Ref<T>, b: React.Ref<T>) {
  const byFirst = composedRefs.get(a as object) ?? new WeakMap()
  composedRefs.set(a as object, byFirst)
  const cached = byFirst.get(b as object)
  if (cached) return cached as (el: T | null) => void
  const composed = (el: T | null) => {
    for (const ref of [a, b]) {
      if (typeof ref === "function") ref(el)
      else if (ref) (ref as React.RefObject<T | null>).current = el
    }
  }
  byFirst.set(b as object, composed)
  return composed
}

/**
 * Merges consumer props over the table's own: `className` values are
 * combined, `style` objects merged (consumer wins), event handlers both run
 * (ours first), refs both receive the element, anything else is replaced.
 * Undefined values are ignored.
 */
export function mergeProps<P extends object>(
  ours: P,
  ...theirs: Array<Partial<P> | undefined | null>
): P {
  let out = ours as AnyProps
  for (const next of theirs) {
    if (!next) continue
    // An undefined value means "not set", so it never wipes one of ours.
    const add = Object.fromEntries(
      Object.entries(next).filter(([, value]) => value !== undefined)
    )
    const merged: AnyProps = { ...out, ...add }
    if (out.className || add.className) {
      merged.className = cn(out.className as string, add.className as string)
    }
    if (out.style || add.style) {
      merged.style = {
        ...(out.style as React.CSSProperties),
        ...(add.style as React.CSSProperties),
      }
    }
    for (const key of Object.keys(add)) {
      const a = out[key]
      const b = add[key]
      if (
        /^on[A-Z]/.test(key) &&
        typeof a === "function" &&
        typeof b === "function"
      ) {
        merged[key] = (...args: unknown[]) => {
          ;(a as (...args: unknown[]) => void)(...args)
          ;(b as (...args: unknown[]) => void)(...args)
        }
      }
    }
    if (out.ref && add.ref) {
      merged.ref = composeRefs(
        out.ref as React.Ref<unknown>,
        add.ref as React.Ref<unknown>
      )
    }
    out = merged
  }
  return out as P
}

/** A slot value: props, or a function of the slot's context. */
type SlotValue<Ctx, Props> = Props | ((context: Ctx) => Props) | undefined

function resolve<Ctx, Props>(value: SlotValue<Ctx, Props>, context: Ctx) {
  return typeof value === "function"
    ? (value as (context: Ctx) => Props)(context)
    : value
}

type SlotContext<TData extends RowData, K extends keyof DataTableSlots<TData>> =
  Extract<
    NonNullable<DataTableSlots<TData>[K]>,
    (context: never) => unknown
  > extends (context: infer Ctx) => unknown
    ? Ctx
    : never

/**
 * The consumer's props for one part of the table: the table-level
 * `slotProps[key]`, then a column-level `meta.slotProps[key]` when given,
 * each resolved against the part's context.
 */
export function getSlotProps<
  TData extends RowData,
  K extends keyof DataTableSlots<TData>,
>(
  table: DataTableInstance<TData>,
  key: K,
  context: Omit<SlotContext<TData, K>, "table">,
  columnSlot?: unknown
): AnyProps | undefined {
  const ctx = { ...context, table } as never
  const tableLevel = resolve(
    table.dataTable.slotProps?.[key] as SlotValue<never, AnyProps>,
    ctx
  )
  const columnLevel = resolve(columnSlot as SlotValue<never, AnyProps>, ctx)
  if (!tableLevel) return columnLevel
  if (!columnLevel) return tableLevel
  return mergeProps(tableLevel, columnLevel)
}
