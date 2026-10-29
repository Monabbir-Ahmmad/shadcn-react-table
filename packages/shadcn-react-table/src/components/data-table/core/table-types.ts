import type {
  AggregationFnDef,
  Cell,
  CellData,
  Column,
  ColumnDef,
  FilterFn,
  Header,
  HeaderGroup,
  Row,
  RowData,
  RowModel,
  SortFn,
  Table,
} from "@tanstack/react-table"

import type { DataTableFeatures } from "./features"

// Our names for TanStack's generic types. This file is the only place that
// knows TanStack's generic arity (v9 adds the feature-set parameter), so
// consumers type columns with `DataTableColumnDef<TData>` and never see it.

export type { DataTableFeatures } from "./features"

export type DataTableColumnDef<
  TData extends RowData,
  TValue extends CellData = CellData,
> = ColumnDef<DataTableFeatures, TData, TValue>

export type DataTableRow<TData extends RowData> = Row<DataTableFeatures, TData>

export type DataTableColumn<
  TData extends RowData,
  TValue extends CellData = CellData,
> = Column<DataTableFeatures, TData, TValue>

export type DataTableCell<
  TData extends RowData,
  TValue extends CellData = CellData,
> = Cell<DataTableFeatures, TData, TValue>

export type DataTableHeader<
  TData extends RowData,
  TValue extends CellData = CellData,
> = Header<DataTableFeatures, TData, TValue>

export type DataTableHeaderGroup<TData extends RowData> = HeaderGroup<
  DataTableFeatures,
  TData
>

/** The raw TanStack table (no `dataTable` config attached). */
export type DataTableCoreTable<TData extends RowData> = Table<
  DataTableFeatures,
  TData
>

export type DataTableRowModel<TData extends RowData> = RowModel<
  DataTableFeatures,
  TData
>

export type DataTableFilterFn<TData extends RowData> = FilterFn<
  DataTableFeatures,
  TData
>

export type DataTableSortFn<TData extends RowData> = SortFn<
  DataTableFeatures,
  TData
>

/** An aggregation function: `aggregate` the rows (and optionally `merge`
 *  sub-group results). The result type is up to you. */
export type DataTableAggregationFn<TData extends RowData> = AggregationFnDef<
  DataTableFeatures,
  TData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>

/** A row-model factory: called once per table, returns the memoized getter. */
export type DataTableRowModelFactory<TData extends RowData> = (
  table: DataTableCoreTable<TData>
) => () => DataTableRowModel<TData>
