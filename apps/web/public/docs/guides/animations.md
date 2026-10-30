# Animations

The table animates rows, columns, detail panels, the toolbar and a few controls so changes are easy to follow. It is on by default and turns itself off for people who prefer reduced motion.

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
- **New and removed rows:** new rows fade in with a small rise. Removed rows fade out. With [virtualization](/docs/guides/virtualization), rows that a sort or filter brings into the drawn window fade in too.
- **Filter row and density:** rows glide when the filter row opens or closes and when the density changes, so the new spacing does not jump.
- **Columns:** hiding, showing, pinning or reordering a column glides the columns that move. A shown column fades in, and a hidden column's header fades out where it was.
- **Search box:** the search button opens into the box and the box shrinks back into the button. The toolbar buttons around it glide to their new place.
- **Selection banner and grouping drop zone:** the "N selected" banner and the drop zone slide and fade in and out, and the table below glides to make room.
- **Detail panels:** a panel opens from the top down while the rows below glide. It closes from the bottom up.
- **Sort arrow:** the sort icon fades and scales between states. The default arrow also turns around for descending order, and when the sort is cleared it fades out without turning back. A custom sort icon never turns.
- **Selection checkbox:** the tick draws itself in.
- **Selected count:** the old "N selected" text fades out as the new one fades in, in the same place.

A row that glides past others is drawn above them, and the row that moves farthest is on top. Motion pauses while a row is being dragged, while a cell or row is being edited and while a new row is being created. Starting an edit stops any row or column motion still running.

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

| Variable                    | Default                          | Used for                                          |
| --------------------------- | -------------------------------- | ------------------------------------------------- |
| `--dt-motion-duration`      | `280ms`                          | Row and column glide, search box, toolbar, detail panels, sort arrow, checkbox |
| `--dt-motion-duration-fast` | `160ms`                          | Rows and columns fading in and out, banner, selected count |
| `--dt-motion-ease`          | `cubic-bezier(0.22, 1, 0.36, 1)` | Every animation                                   |

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

Each table times its own controls. A table with animations off, nested in an animated table's detail panel, keeps its controls still.

## Performance

- Only rows that are drawn animate. With [virtualization](/docs/guides/virtualization), rows outside the window are not touched.
- Scrolling never animates.
- A change that would animate more than 300 rows just updates, with no motion. Above 100 gliding rows, row separators are hidden for the length of the glide.
- Columns follow the same rule: only drawn columns glide. A change that would animate more than 3,000 cells (the table's rows times the columns that move or enter) just updates, with no motion.
- Removed rows never make the table scroll further than its content. In a scrolled table, a removed row that sat below the table's new bottom disappears at once instead of fading, so the scroll position does not jump when the fade ends.

## Limits

- Group header widths snap. A group header glides to its new position, but its width changes at once, for example when you hide one of its columns.
- With [virtualization](/docs/guides/virtualization), a window change in the middle of a glide can shift the cells that are still gliding.
- An edit that starts in the middle of a toolbar motion lets that toolbar motion finish. Row and column motion stops at once.
- Toolbar groups are `position: relative`, so absolutely positioned content in a custom toolbar is placed against its group, not the toolbar.

## Related

- [Sorting](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/sorting): Sorting is on by default.
- [Virtualization](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/virtualization): Virtualization renders only the cells currently in view, keeping large tables fast.
- [Detail panel](https://monabbir-ahmmad.github.io/shadcn-react-table/docs/guides/detail-panel): Provide renderDetailPanel to render an expandable panel beneath each row.
