# Icons

Every glyph the table renders is a named slot. Override any subset via `useDataTable({ icons })` (or app-wide via [`DataTableConfigProvider`](/docs/guides/custom-icons)) to swap icon libraries or individual icons. Each value is an `IconComponent` — any component accepting a `className`.

```tsx
import { ArrowUp, ArrowDown, MoreVertical } from "lucide-react"

const table = useDataTable({
  data,
  columns,
  icons: {
    sortAscending: ArrowUp,
    sortDescending: ArrowDown,
    columnActions: MoreVertical,
  },
})
```

See the [Custom icons guide](/docs/guides/custom-icons) for swapping the whole set. The complete slot list and Remix Icon defaults:

| Slot | Type | Default | Description |
| --- | --- | --- | --- |
| `sortAscending` | `IconComponent` | `ArrowUp` | Header sort indicator: sorted ascending. |
| `sortDescending` | `IconComponent` | `ArrowDown` | Header sort indicator: sorted descending. |
| `sortUnsorted` | `IconComponent` | `ChevronsUpDown` | Header sort indicator: sortable but not sorted. |
| `columnActions` | `IconComponent` | `MoreVertical` | Column-actions menu trigger in each header. |
| `filter` | `IconComponent` | `Filter` | Filter toggle and filter menu items. |
| `filterOff` | `IconComponent` | `FilterX` | Hide-filters state of the filter toggle and clear-filter items. |
| `advancedFilter` | `IconComponent` | `ListFilter` | Advanced filter panel toggle. |
| `clearAll` | `IconComponent` | `RotateCcw` | Clear-sort / show-all reset action. |
| `hide` | `IconComponent` | `EyeOff` | Hide-column menu item. |
| `pin` | `IconComponent` | `Pin` | Pin column and pin row actions. |
| `pinnedRow` | `IconComponent` | `Pin` | Shown on a pinned row's pin button. |
| `unpin` | `IconComponent` | `PinOff` | Unpin column and unpin row actions. |
| `group` | `IconComponent` | `Group` | Group-by menu item and grouping chips. |
| `columnVisibility` | `IconComponent` | `Columns3` | Column-visibility (show/hide columns) toolbar button. |
| `density` | `IconComponent` | `Rows3` | Density toggle toolbar button. |
| `fullscreenEnter` | `IconComponent` | `Maximize2` | Full-screen toggle while not full screen. |
| `fullscreenExit` | `IconComponent` | `Minimize2` | Full-screen toggle while full screen. |
| `search` | `IconComponent` | `Search` | Global search button and search-mode menu. |
| `clear` | `IconComponent` | `X` | Clear buttons (search box, filter inputs, grouping chips). |
| `pageFirst` | `IconComponent` | `ChevronsLeft` | Pagination: first page. Mirrored in right-to-left tables. |
| `pagePrev` | `IconComponent` | `ChevronLeft` | Pagination: previous page. Mirrored in right-to-left tables. |
| `pageNext` | `IconComponent` | `ChevronRight` | Pagination: next page. Mirrored in right-to-left tables. |
| `pageLast` | `IconComponent` | `ChevronsRight` | Pagination: last page. Mirrored in right-to-left tables. |
| `expanded` | `IconComponent` | `ChevronDown` | Expand control of an expanded row or group. |
| `collapsed` | `IconComponent` | `ChevronRight` | Expand control of a collapsed row or group. Mirrored in right-to-left tables. |
| `dragHandle` | `IconComponent` | `GripVertical` | Drag grip for column and row reordering. |
| `edit` | `IconComponent` | `Pencil` | Edit row / edit cell action. |
| `copy` | `IconComponent` | `Copy` | Copy action in the cell menu. |
| `save` | `IconComponent` | `Check` | Save action while editing a row. |
| `cancel` | `IconComponent` | `X` | Cancel action while editing a row. |
| `calendar` | `IconComponent` | `Calendar` | Date filter field trigger. |
