import type {
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

/** A row-model factory: called once per table, returns the memoized getter. */
export type DataTableRowModelFactory<TData extends RowData> = (
  table: DataTableCoreTable<TData>
) => () => DataTableRowModel<TData>
