# Part props (slotProps)

Every part of the table — the scroll surface, rows, cells, toolbars, the search box, edit fields and more — accepts extra props through the `slotProps` option. Use it to add classes, styles, `data-*` attributes, ARIA attributes or event handlers without copying the component.

```tsx
const table = useDataTable({
  data,
  columns,
  slotProps: {
    surface: { className: "max-h-[600px]" },
    bodyRow: ({ row }) => ({
      className: row.original.overdue ? "bg-destructive/10" : undefined,
    }),
    bodyCell: { className: "tabular-nums" },
    searchInput: { placeholder: "Search people…" },
  },
})
```

Each part takes either an object of props, or a function that receives the part's context (always including `table`) and returns props.

## How props combine

Your props are merged with the table's own, so you add to the built-in behavior rather than replacing it:

- `className` — combined with the table's classes (conflicting Tailwind classes resolve in your favor).
- `style` — merged; your keys win.
- Event handlers (`onClick`, `onKeyDown`, …) — both run, the table's first.
- `ref` — both refs receive the element.
- Anything else — yours replaces the table's.

## Column-level parts

A column can target its own cells through `meta.slotProps`. It supports `headCell`, `filterCell`, `bodyCell`, `footerCell` and `editField`, and is applied after the table-level props:

```tsx
const columns: DataTableColumnDef<Person>[] = [
  {
    accessorKey: "salary",
    header: "Salary",
    meta: {
      slotProps: {
        bodyCell: ({ row }) => ({
          className:
            row.original.salary > 100_000 ? "font-semibold" : undefined,
        }),
        editField: { inputMode: "numeric", min: 0 },
      },
    },
  },
]
```

## Parts

| Part | Type | Default | Description |
| --- | --- | --- | --- |
| `root` | `<div> props · { table }` |  | The outer wrapper (`<DataTable>`'s own props also land here). |
| `surface` | `<div> props · { table }` |  | The scroll container around the table. Bound its height here. |
| `table` | `<table> props · { table }` |  | The `<table>` element. |
| `head` | `<thead> props · { table }` |  | `<thead>`. |
| `headRow` | `<tr> props · { headerGroup, table }` |  | Each header row. |
| `headCell` | `<th> props · { header, column, table }` |  | Each header cell. |
| `filterCell` | `<th> props · { header, column, table }` |  | Each cell of the column filter row. |
| `body` | `<tbody> props · { table }` |  | `<tbody>`. |
| `bodyRow` | `<tr> props · { row, rowIndex, table }` |  | Each body row. |
| `bodyCell` | `<td> props · { cell, row, column, table }` |  | Each body cell. |
| `detailPanel` | `<td> props · { row, table }` |  | The cell holding an expanded row's detail panel. |
| `footer` | `<tfoot> props · { table }` |  | `<tfoot>`. |
| `footerRow` | `<tr> props · { footerGroup, table }` |  | Each footer row. |
| `footerCell` | `<td> props · { header, column, table }` |  | Each footer cell. |
| `topToolbar` | `<div> props · { table }` |  | The toolbar above the table. |
| `bottomToolbar` | `<div> props · { table }` |  | The toolbar below the table. |
| `pagination` | `<div> props · { table }` |  | The pagination controls. |
| `alertBanner` | `<div> props · { table }` |  | The selection banner. |
| `searchInput` | `<input> props · { table }` |  | The global search input. |
| `editField` | `<input> props · { column, row?, table }` |  | Each inline / dialog edit field (the input, or the select's trigger). |
| `editDialog` | `<div> props · { row?, isCreating, table }` |  | The edit / create dialog's content. |
| `selectCheckbox` | `<button> props · { row?, table }` |  | Each row selection checkbox (and the select-all one, without `row`). |

> **The root:** `<DataTable />`'s own props also land on the root, after `slotProps.root` — so `<DataTable table={table} className="…" />` works too.

## Related

- [Theming](/docs/guides/theming)
- [Sticky header & footer](/docs/guides/sticky)
- [DataTable props](/docs/api/data-table-props)
