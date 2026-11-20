const instanceKey = Symbol("data-table.instance")
const latestHandleKey = Symbol("data-table.latest-handle")

type Linked<T> = T & { [instanceKey]?: T; [latestHandleKey]?: T }

/**
 * A new object over the hook's long-lived table instance, for the component
 * that calls `useDataTable`. Fields and methods resolve through the prototype,
 * so it reads like the instance; its new identity on every render is what
 * tells React Compiler (which caches `<DataTable table={table} />` on `table`)
 * that the table's data or options may have changed.
 */
export function toCallerHandle<T extends object>(instance: T): T {
  const handle = Object.create(instance) as T
  Object.defineProperty(handle, instanceKey, { value: instance })
  // The instance is refreshed in place on every render (options, config), so
  // its newest handle is the one the caller's latest render holds.
  Object.defineProperty(instance, latestHandleKey, {
    value: handle,
    configurable: true,
    writable: true,
  })
  return handle
}

/**
 * The long-lived instance behind a handle from `toCallerHandle` (any other
 * object comes back as it is). The table's parts use it for subscriptions and
 * memos, which must not start over on every render of the caller.
 */
export function toStableInstance<T extends object>(table: T): T {
  return (table as Linked<T>)[instanceKey] ?? table
}

/**
 * The handle the caller's latest render got for this table, for values handed
 * back to the caller (a drop event's `over.table`), so they compare equal
 * (`===`) to the `table` the caller holds.
 */
export function toCallerTable<T extends object>(table: T): T {
  const instance = toStableInstance(table)
  return (instance as Linked<T>)[latestHandleKey] ?? instance
}
