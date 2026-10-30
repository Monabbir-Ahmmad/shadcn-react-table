import {
  createColumnHelper,
  type ColumnHelper,
  type RowData,
} from "@tanstack/react-table"

import type { DataTableFeatures } from "../core/features"

/** TanStack's column helper with the table's feature set filled in. */
export type DataTableColumnHelper<TData extends RowData> = ColumnHelper<
  DataTableFeatures,
  TData
>

/**
 * A typed helper for writing columns (TanStack's `createColumnHelper`, with
 * the table's features filled in). `accessor` infers each column's value
 * type from a key or an accessor function, and every column's `meta` takes
 * the table's column options (`filterVariant`, `align`, …).
 *
 * ```ts
 * const helper = createDataTableColumnHelper<Person>()
 * const columns = helper.columns([
 *   helper.accessor("name", { header: "Name" }),
 *   helper.accessor((row) => row.age, { id: "age", header: "Age" }),
 *   helper.display({ id: "actions", cell: () => <RowMenu /> }),
 * ])
 * ```
 */
export function createDataTableColumnHelper<
  TData extends RowData,
>(): DataTableColumnHelper<TData> {
  return createColumnHelper<DataTableFeatures, TData>()
}
