"use client"

import * as React from "react"

const sameItems = (a: readonly unknown[], b: readonly unknown[]) =>
  a.length === b.length && a.every((value, i) => Object.is(value, b[i]))

interface RowEntry {
  select: () => readonly unknown[]
  last: readonly unknown[]
  update: () => void
}

/**
 * One table-store subscription for all body rows. Each mounted row registers
 * what it reads (its selection and editing state); on a state change the hub
 * compares those values and wakes only the rows whose values changed. Cheaper
 * than a subscription per row, which would also run on every full render.
 */
export class RowStateHub {
  private rows = new Map<string, RowEntry>()
  private lastSources: readonly unknown[] = []

  /** @param getSources The state the rows' values come from: a change
   *  anywhere else (sorting, density…) skips the per-row comparison. */
  constructor(private getSources: () => readonly unknown[]) {}

  register(
    key: string,
    select: () => readonly unknown[],
    update: () => void
  ): () => void {
    this.rows.set(key, { select, last: select(), update })
    return () => {
      if (this.rows.get(key)?.update === update) this.rows.delete(key)
    }
  }

  /** The row rendered with new props: its values are current again. */
  refresh(key: string) {
    const entry = this.rows.get(key)
    if (entry) entry.last = entry.select()
  }

  /** Wakes the rows whose values changed. */
  notify() {
    const sources = this.getSources()
    if (sameItems(this.lastSources, sources)) return
    this.lastSources = sources
    for (const entry of this.rows.values()) {
      const next = entry.select()
      if (sameItems(entry.last, next)) continue
      entry.last = next
      entry.update()
    }
  }
}

export const RowStateHubContext = React.createContext<RowStateHub | null>(null)

/** Subscribes the hub to the table store for the body's lifetime. */
export function useRowStateHub(
  store: {
    subscribe: (listener: () => void) => { unsubscribe: () => void }
  },
  getSources: () => readonly unknown[]
): RowStateHub {
  const [hub] = React.useState(() => new RowStateHub(getSources))
  React.useEffect(() => {
    const subscription = store.subscribe(() => hub.notify())
    return () => subscription.unsubscribe()
  }, [store, hub])
  return hub
}

/**
 * Registers a row with the hub: it re-renders when its own values change,
 * even when the body does not.
 */
export function useRowState(key: string, select: () => readonly unknown[]) {
  const hub = React.useContext(RowStateHubContext)
  const [, update] = React.useReducer((n: number) => n + 1, 0)
  const selectRef = React.useRef(select)
  React.useLayoutEffect(() => {
    selectRef.current = select
    hub?.refresh(key)
  })
  React.useLayoutEffect(
    () => hub?.register(key, () => selectRef.current(), update),
    [hub, key]
  )
}
