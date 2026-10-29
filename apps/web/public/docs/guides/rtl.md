# Right-to-left

The table supports right-to-left languages such as Arabic, Hebrew and Persian. It follows the direction it renders in, so there is no option to set: put `dir="rtl"` on the table or on any ancestor, usually `<html>`.

Example (`rtl`):

```tsx
function RtlExample() {
  const data = React.useMemo(() => baseUsers, [])
  const columns = useUserColumns()
  const table = useDataTable({
    data,
    columns,
    getRowId: (row) => row.id,
    localization: dataTableLocalizationAr,
    enableColumnPinning: true,
    enableColumnResizing: true,
    initialState: {
      pagination: { pageSize: 10 },
      columnPinning: { left: ["firstName"] },
    },
  })
  // The table follows the direction it renders in; set `dir="rtl"` on it or
  // any ancestor (usually <html>).
  return (
    <div dir="rtl">
      <DataTable table={table} />
    </div>
  )
}
```

```tsx
import { DataTable, useDataTable } from "@/components/ui/data-table"
import { dataTableLocalizationAr } from "@/components/ui/data-table/locales/ar"

const table = useDataTable({
  data,
  columns,
  getRowId: (row) => row.id,
  localization: dataTableLocalizationAr,
})

return (
  <div dir="rtl">
    <DataTable table={table} />
  </div>
)
```

## What changes

- **Layout.** Columns run from right to left, cell text aligns to the start (the right), and the pagination and expand chevrons point the other way.
- **Pinned columns.** `left` pins to the start of the table and `right` to its end. In a right-to-left table, `left`-pinned columns sit on the right edge.
- **Column alignment.** A column's `meta.align` of `"left"` means the start of the cell and `"right"` means its end, so a numeric column aligned `"right"` lines up on the left in a right-to-left table.
- **Resizing.** The resize handle sits on each column's end (left) edge, and dragging it outwards (to the left) widens the column.
- **Keyboard navigation.** ArrowLeft moves to the next column and ArrowRight to the previous one, matching what you see.
- **Column virtualization.** Scrolling works with the browser's right-to-left scroll offsets.

## Menus and popovers

Menus, selects and date pickers render in a portal outside the table, so they take their direction from the page. If only part of the page is right-to-left, give the shadcn primitives the direction too, with Radix's `DirectionProvider` (from `radix-ui`) or Base UI's `DirectionProvider`:

```tsx
import { Direction } from "radix-ui"

function ArabicTable() {
  // …useDataTable as above
  return (
    <Direction.Provider dir="rtl">
      <div dir="rtl">
        <DataTable table={table} />
      </div>
    </Direction.Provider>
  )
}
```

Setting `dir="rtl"` on `<html>` covers both the table and its portals.
