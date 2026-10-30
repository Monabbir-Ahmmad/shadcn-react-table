"use client"

import * as React from "react"

import type { DataTableState } from "../helpers/table-state"

/** The table, as far as store subscriptions need it. */
interface StoreTable {
  store: { subscribe: (listener: () => void) => { unsubscribe: () => void } }
  getState: () => DataTableState
}

/** Equal when both are the same value, or arrays / plain objects whose items
 *  are the same values (one level deep). */
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null ||
    Array.isArray(a) !== Array.isArray(b)
  ) {
    return false
  }
  const aKeys = Object.keys(a)
  if (aKeys.length !== Object.keys(b).length) return false
  return aKeys.every((key) =>
    Object.is(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key]
    )
  )
}

/**
 * Subscribes a component to part of the table state: it re-renders only when
 * the selected value changes (compared shallowly), however often the rest of
 * the state changes.
 */
export function useTableState<T>(
  table: StoreTable,
  selector: (state: DataTableState) => T
): T {
  const selectorRef = React.useRef(selector)
  const cacheRef = React.useRef<{ value: T } | null>(null)
  // eslint-disable-next-line react-hooks/refs
  selectorRef.current = selector

  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const subscription = table.store.subscribe(onChange)
      return () => subscription.unsubscribe()
    },
    [table]
  )
  // Hands React the previous value while the selection is shallowly equal,
  // so an unrelated state change does not re-render.
  const getSnapshot = () => {
    const next = selectorRef.current(table.getState())
    const cached = cacheRef.current
    if (cached && shallowEqual(cached.value, next)) return cached.value
    cacheRef.current = { value: next }
    return next
  }
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/**
 * Calls `listener` after every table state change, outside React renders.
 * For effects that react to state (resetting the page when filters change),
 * which must not depend on the component re-rendering.
 */
export function useTableStateListener(
  table: StoreTable,
  listener: () => void
): void {
  const listenerRef = React.useRef(listener)
  React.useLayoutEffect(() => {
    listenerRef.current = listener
  })
  React.useEffect(() => {
    const subscription = table.store.subscribe(() => listenerRef.current())
    return () => subscription.unsubscribe()
  }, [table])
}
