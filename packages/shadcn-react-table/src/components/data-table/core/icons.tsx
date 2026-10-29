import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Columns3,
  EyeOff,
  Filter,
  FilterX,
  GripVertical,
  Group,
  ListFilter,
  Maximize2,
  Minimize2,
  MoreVertical,
  Pencil,
  Pin,
  PinOff,
  RotateCcw,
  Rows3,
  Search,
  X,
} from "lucide-react"

/** Any component that renders an icon and accepts a `className`. */
export type IconComponent = React.ComponentType<{ className?: string }>

/**
 * Every icon the data table renders, by semantic name. Defaults are Lucide
 * (shadcn's default icon library). Override any subset via
 * `useDataTable({ icons: { … } })` to swap icon libraries or individual glyphs
 * (MRT's `icons` prop equivalent). Selection checkboxes and calendar internals
 * come from the shadcn primitives and are out of scope here.
 */
export interface DataTableIcons {
  /** Header sort indicator: sorted ascending. */
  sortAscending: IconComponent
  /** Header sort indicator: sorted descending. */
  sortDescending: IconComponent
  /** Header sort indicator: sortable but not sorted. */
  sortUnsorted: IconComponent
  /** Column-actions menu trigger in each header. */
  columnActions: IconComponent
  /** Filter toggle and filter menu items. */
  filter: IconComponent
  /** Hide-filters state of the filter toggle and clear-filter items. */
  filterOff: IconComponent
  /** Advanced filter panel toggle. */
  advancedFilter: IconComponent
  /** Clear-sort / show-all reset action. */
  clearAll: IconComponent
  /** Hide-column menu item. */
  hide: IconComponent
  /** Pin column and pin row actions. */
  pin: IconComponent
  /** Shown on a pinned row's pin button. */
  pinnedRow: IconComponent
  /** Unpin column and unpin row actions. */
  unpin: IconComponent
  /** Group-by menu item and grouping chips. */
  group: IconComponent
  /** Column-visibility (show/hide columns) toolbar button. */
  columnVisibility: IconComponent
  /** Density toggle toolbar button. */
  density: IconComponent
  /** Full-screen toggle while not full screen. */
  fullscreenEnter: IconComponent
  /** Full-screen toggle while full screen. */
  fullscreenExit: IconComponent
  /** Global search button and search-mode menu. */
  search: IconComponent
  /** Clear buttons (search box, filter inputs, grouping chips). */
  clear: IconComponent
  /** Pagination: first page. Mirrored in right-to-left tables. */
  pageFirst: IconComponent
  /** Pagination: previous page. Mirrored in right-to-left tables. */
  pagePrev: IconComponent
  /** Pagination: next page. Mirrored in right-to-left tables. */
  pageNext: IconComponent
  /** Pagination: last page. Mirrored in right-to-left tables. */
  pageLast: IconComponent
  /** Expand control of an expanded row or group. */
  expanded: IconComponent
  /** Expand control of a collapsed row or group. Mirrored in right-to-left tables. */
  collapsed: IconComponent
  /** Drag grip for column and row reordering. */
  dragHandle: IconComponent
  /** Edit row / edit cell action. */
  edit: IconComponent
  /** Save action while editing a row. */
  save: IconComponent
  /** Cancel action while editing a row. */
  cancel: IconComponent
  /** Date filter field trigger. */
  calendar: IconComponent
}

export const defaultIcons: DataTableIcons = {
  sortAscending: ArrowUp,
  sortDescending: ArrowDown,
  sortUnsorted: ChevronsUpDown,
  columnActions: MoreVertical,
  filter: Filter,
  filterOff: FilterX,
  advancedFilter: ListFilter,
  clearAll: RotateCcw,
  hide: EyeOff,
  pin: Pin,
  pinnedRow: Pin,
  unpin: PinOff,
  group: Group,
  columnVisibility: Columns3,
  density: Rows3,
  fullscreenEnter: Maximize2,
  fullscreenExit: Minimize2,
  search: Search,
  clear: X,
  pageFirst: ChevronsLeft,
  pagePrev: ChevronLeft,
  pageNext: ChevronRight,
  pageLast: ChevronsRight,
  expanded: ChevronDown,
  collapsed: ChevronRight,
  dragHandle: GripVertical,
  edit: Pencil,
  save: Check,
  cancel: X,
  calendar: Calendar,
}
