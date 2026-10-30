# Animations

The table animates rows, detail panels and a few controls so changes are easy to follow. It is on by default and turns itself off for people who prefer reduced motion.

Example (`animations`):

```tsx
function AnimationsExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const [animated, setAnimated] = React.useState(true)
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableAnimations: animated,
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
    renderDetailPanel: ({ row }) => (
      <p className="p-4 text-sm text-muted-foreground">
        {row.original.firstName} {row.original.lastName} is {row.original.role}{" "}
        in {row.original.department}, based in {row.original.city}.
      </p>
    ),
    renderTopToolbarCustomActions: () => (
      <Button
        size="sm"
        variant={animated ? "default" : "outline"}
        aria-pressed={animated}
        onClick={() => setAnimated((on) => !on)}
      >
        Animations {animated ? "on" : "off"}
      </Button>
    ),
  })
  return <DataTable table={table} />
}
```

## What animates

- **Row order:** rows glide to their new position when you sort, filter, pin, group or expand.
- **New and removed rows:** new rows fade in with a small rise. Removed rows fade out.
- **Detail panels:** a panel opens from the top down while the rows below glide. It closes from the bottom up.
- **Sort arrow:** the default arrow turns around for descending order. A custom sort icon cross-fades instead.
- **Selection checkbox:** the tick draws itself in.
- **Selected count:** the "N selected" text fades to its new number.

Motion pauses while a row is being dragged and while a cell or row is being edited.

## Turning it off

Set `enableAnimations: false`.

```tsx
const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  enableAnimations: false,
})

return <DataTable table={table} />
```

You do not need to handle reduced motion yourself. When the user's system asks for reduced motion, the table does not animate, whatever `enableAnimations` is. The table root carries a `data-animations` attribute only while animations are active.

## Timing

Three CSS variables set the timing. The table has built-in fallbacks, so you only set the ones you want to change.

| Variable                    | Default                          | Used for                                     |
| --------------------------- | -------------------------------- | -------------------------------------------- |
| `--dt-motion-duration`      | `280ms`                          | Row glide, detail panels, sort arrow, checkbox, count |
| `--dt-motion-duration-fast` | `160ms`                          | Rows fading in and out                       |
| `--dt-motion-ease`          | `cubic-bezier(0.22, 1, 0.36, 1)` | Every animation                              |

Set them with a class on the table. `className` goes on the table's root.

```tsx
<DataTable table={table} className="[--dt-motion-duration:400ms]" />
```

Or in a stylesheet, for every table:

```css
[data-slot="data-table"] {
  --dt-motion-duration: 400ms;
  --dt-motion-ease: ease-out;
}
```

## Performance

- Only rows that are drawn animate. With [virtualization](/docs/guides/virtualization), rows outside the window are not touched.
- Scrolling never animates.
- A change that would animate more than 300 rows just updates, with no motion.

## Related

- [Sorting](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/sorting): Sorting is on by default.
- [Virtualization](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/virtualization): Virtualization renders only the cells currently in view, keeping large tables fast.
- [Detail panel](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/detail-panel): Provide renderDetailPanel to render an expandable panel beneath each row.
