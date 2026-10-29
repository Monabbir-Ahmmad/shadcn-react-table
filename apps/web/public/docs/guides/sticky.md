# Sticky header & footer

The header row (`enableStickyHeader`, default `true`) sticks to the top of the scroll surface. Enable `enableStickyFooter` (default `false`) to also pin the aggregation/footer row to the bottom. As you scroll through rows, both stay pinned in view.

Example (`sticky`):

```tsx
function StickyExample() {
  const data = React.useMemo(() => makeUsers(40), [])
  const columns = useUserColumns()
  const table = useDataTable({
    slotProps: { surface: { className: "max-h-[460px]" } },
    data,
    columns,
    getRowId: (row) => row.id,
    enablePagination: false,
    enableStickyFooter: true,
  })
  return <DataTable table={table} />
}
```

## Bounded surface height

Sticky behavior requires a **bounded** scroll surface — there is nothing to stick to if the table grows to fit all its rows. While `enableStickyHeader` is on (the default), the surface is automatically capped near the viewport height (`clamp(350px, 100dvh - 200px, 9999px)`), so tall tables scroll internally out of the box. The `- 200px` is a heuristic that reserves room for the toolbar and pagination — if the table sits below a lot of other page content, the surface can still extend past the viewport; pick your own bound in that case. To do so, set a max height with `slotProps.surface` — it overrides the default:

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableStickyHeader: true,
  enableStickyFooter: true,
  slotProps: { surface: { className: "max-h-[460px]" } },
})

return <DataTable table={table} />
```

Once the content overflows the bound, the header pins to the top and the footer pins to the bottom while the rows scroll between them. Setting `enableStickyHeader: false` removes both the pinning and the default bound, letting the table grow to its full height.

> **MRT parity note:** Material React Table defaults `enableStickyHeader` and `enableStickyFooter` to `false`. This table deliberately defaults `enableStickyHeader` to `true` so headers stay useful out of the box, but leaves `enableStickyFooter` at `false` (opt in when you have an aggregation/footer row). The sticky-implies-bounded-surface behavior itself matches MRT.

## Footer cells

Footer cells are populated from each column's `footer` definition or from aggregation values. See [Grouping](/docs/guides/grouping) for how aggregation rows are produced.

> **Nothing to stick to?:** If the header or footer is not sticking, the surface is probably not bounded — check that `slotProps.surface` isn't removing the default max-height (e.g. `max-h-none`) and that the data actually overflows the bound.

## Related

- [Grouping](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/grouping): Set enableGrouping: true to let users group rows by a column.
- [DataTable props](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/api/data-table-props): <DataTable /> is mostly driven by the instance from useDataTable.
