import type {
  Cell,
  Column,
  ColumnDef,
  FilterFn,
  Header,
  Row,
  RowData,
  RowModel,
  Table,
} from "@tanstack/react-table"

// Our names for TanStack's generic types. This file is the only place that
// knows TanStack's generic arity, so a TanStack major bump changes these
// definitions instead of every call site. Consumers type their columns with
// `DataTableColumnDef<TData>`.

export type DataTableColumnDef<
  TData extends RowData,
  TValue = unknown,
> = ColumnDef<TData, TValue>

export type DataTableRow<TData extends RowData> = Row<TData>

export type DataTableColumn<TData extends RowData, TValue = unknown> = Column<
  TData,
  TValue
>

export type DataTableCell<TData extends RowData, TValue = unknown> = Cell<
  TData,
  TValue
>

export type DataTableHeader<TData extends RowData, TValue = unknown> = Header<
  TData,
  TValue
>

/** The raw TanStack table (no `tableInstance` config attached). */
export type DataTableCoreTable<TData extends RowData> = Table<TData>

export type DataTableRowModel<TData extends RowData> = RowModel<TData>

export type DataTableFilterFn<TData extends RowData> = FilterFn<TData>

/** A row-model factory: called once per table, returns the memoized getter. */
export type DataTableRowModelFactory<TData extends RowData> = (
  table: DataTableCoreTable<TData>
) => () => DataTableRowModel<TData>
