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
  sortAscending: IconComponent
  sortDescending: IconComponent
  sortUnsorted: IconComponent
  columnActions: IconComponent
  filter: IconComponent
  filterOff: IconComponent
  /** Advanced filter panel toggle. */
  advancedFilter: IconComponent
  /** Clear-sort / show-all reset action. */
  clearAll: IconComponent
  hide: IconComponent
  pin: IconComponent
  pinnedRow: IconComponent
  unpin: IconComponent
  group: IconComponent
  columnVisibility: IconComponent
  density: IconComponent
  fullscreenEnter: IconComponent
  fullscreenExit: IconComponent
  search: IconComponent
  clear: IconComponent
  pageFirst: IconComponent
  pagePrev: IconComponent
  pageNext: IconComponent
  pageLast: IconComponent
  expanded: IconComponent
  collapsed: IconComponent
  dragHandle: IconComponent
  edit: IconComponent
  save: IconComponent
  cancel: IconComponent
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
