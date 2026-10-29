# DataTable props

`<DataTable />` is mostly driven by the instance from `useDataTable`. It accepts the presentational props below, and spreads any other `div` props onto the root element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `table` | `DataTableInstance<TData>` |  | The instance returned by `useDataTable`. |

```tsx
<DataTable table={table} className="mx-auto max-w-5xl" />
```

> **Styling inner parts:** To reach the scroll surface, rows, cells or any other part, use the [`slotProps`](/docs/guides/slot-props) option on `useDataTable` — for example `slotProps: { surface: { className: "max-h-[600px]" } }` bounds the scroll surface for a [sticky header](/docs/guides/sticky) or a [virtualized](/docs/guides/virtualization) list.
