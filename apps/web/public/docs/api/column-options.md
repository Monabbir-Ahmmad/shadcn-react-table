# Column options

Per-column configuration lives on the standard TanStack `columnDef.meta` object, which the table augments with the fields below (fully typed wherever `meta` is read).

```tsx
const columns: DataTableColumnDef<Person>[] = [
  {
    accessorKey: "role",
    header: "Role",
    meta: {
      filterVariant: "select",
      filterSelectOptions: ROLE_OPTIONS,
      editVariant: "select",
    },
  },
]
```

| meta key | Type | Default | Description |
| --- | --- | --- | --- |
| `filterVariant` | `FilterVariant` |  | Filter UI variant rendered in the filter row. Defaults to "text". |
| `filterSelectOptions` | `DataTableFilterOption[]` |  | Options for `select` / `multi-select` filter variants. If omitted for a select-style variant, options are derived from faceted unique values. |
| `filterMode` | `FilterMode` |  | Default filter mode for this column (overrides the per-variant default). |
| `enableColumnFilterModes` | `boolean` |  | Per-column override for the filter-mode menu (defaults to the table). |
| `renderColumnFilter` | `(props: { column: Column<TFeatures, TData, TValue> table: DataTableInstance<TData> }) => React.ReactNode` |  | Custom filter UI for this column (escape hatch). Replaces the variant. |
| `columnFilterModeOptions` | `FilterMode[]` |  | Restrict (and order) the filter-mode menu for this column to this subset of modes (built-in ones and custom `filterFns` names). Include the column's default mode. |
| `enableEditing` | `boolean \| ((row: DataTableRow<TData>) => boolean)` |  | Allow editing this column (defaults to true when table editing is on), or decide per row with a function. |
| `editVariant` | `EditVariant` |  | Inline editor variant. Defaults to "text". |
| `editSelectOptions` | `\| DataTableFilterOption[] \| ((props: { row?: DataTableRow<TData> column: DataTableColumn<TData, unknown> table: DataTableInstance<TData> }) => DataTableFilterOption[])` |  | Options for the "select" edit variant, or a function returning them for the row being edited (`row` is undefined in the create form). |
| `renderEditCell` | `(props: CellRenderProps<TData, TValue>) => React.ReactNode` |  | Custom inline editor for this column (escape hatch). Replaces the built-in editor while the cell/row is editing; read the draft from `table.getState().rowDraft` and write it with `table.setRowDraftValue` (row editing), or save with `onEditingCellSave` (cell editing). |
| `renderGroupedCell` | `( props: CellRenderProps<TData, TValue> ) => React.ReactNode` |  | Custom render for this column's group header cell (when grouped). |
| `renderAggregatedCell` | `( props: CellRenderProps<TData, TValue> ) => React.ReactNode` |  | Custom render for this column's aggregated cell (when grouped). Overrides the TanStack `columnDef.aggregatedCell`. |
| `renderPlaceholderCell` | `( props: CellRenderProps<TData, TValue> ) => React.ReactNode` |  | Custom render for this column's placeholder cells in grouped rows (cells with no value because another column owns the group). Default: empty. |
| `validate` | `(value: unknown) => string \| undefined` |  | Validate an edited value; return an error message or undefined if valid. |
| `enableClickToCopy` | `ClickToCopyOption<TData>` |  | Copy this column's cells on click (`true`), from the cell menu (`"context-menu"`), or decide per cell with a function. |
| `align` | `"left" \| "center" \| "right"` |  | Horizontal alignment applied to the header label and body cells. |
| `grow` | `boolean \| number` |  | In `layoutMode: "grid"`, whether this column takes a share of the spare width (`true`, the default for data columns), keeps its size (`false` or 0), or how large its share is (a number: 2 takes twice the share of a column with 1). A column the user has resized (one with a size in `columnSizing`) keeps that size. |
| `enableFilterMatchHighlighting` | `boolean` |  | `false` opts this column out of match highlighting (the table option of the same name turns it on or off for every column). |
| `visibleInShowHideMenu` | `boolean` |  | `false` leaves this column out of the show / hide columns menu. |
| `enableColumnActions` | `boolean` |  | `false` hides the column-actions menu for this column. |
| `label` | `string` |  | Human-readable label for menus when the header is not a plain string. |
| `slotProps` | `Pick< DataTableSlots<TData>, "headCell" \| "filterCell" \| "bodyCell" \| "footerCell" \| "editField" >` |  | Props for this column's cells, applied after the table's `slotProps` for the same part. |

> **Standard column options still apply:** `accessorKey`, `header`, `cell`, `footer`, `size`, `enableSorting`,
>   `enableColumnFilter`, `aggregationFn`, `aggregatedCell`, `sortDescFirst`, and
>   the rest are standard TanStack [column
>   defs](https://tanstack.com/table/latest).
