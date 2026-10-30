import { cn } from "@workspace/ui/lib/utils"
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
  Copy,
  EyeOff,
  Filter,
  FilterX,
  GripVertical,
  Group,
  ListFilter,
  ListX,
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
 * Wraps an icon so it renders rotated. Lucide's `Pin` is upright with the
 * needle pointing down, so turning it makes the needle point at the edge a
 * pin goes into.
 */
function rotated(
  Icon: IconComponent,
  rotation: string,
  displayName: string
): IconComponent {
  const Rotated: IconComponent = ({ className }) => (
    <Icon className={cn(rotation, className)} />
  )
  Rotated.displayName = displayName
  return Rotated
}

/** Needle points left (turned a quarter clockwise). */
const PinLeft = rotated(Pin, "rotate-90", "PinLeft")
/** Needle points right, the mirror of `PinLeft`. */
const PinRight = rotated(Pin, "-rotate-90", "PinRight")

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
  /** Show-all-columns reset action in the column menu. */
  clearAll: IconComponent
  /**
   * Clear-sort item in the column menu. When not overridden but `clearAll`
   * is, it uses your `clearAll`.
   */
  clearSort: IconComponent
  /**
   * Clear-filter item in the column menu. When not overridden but `filterOff`
   * is, it uses your `filterOff`.
   */
  clearFilter: IconComponent
  /** Hide-column menu item. */
  hide: IconComponent
  /**
   * Generic pin glyph. Any of `pinLeft`, `pinRight`, `pinTop` and `pinBottom`
   * you don't override falls back to this one, unrotated.
   */
  pin: IconComponent
  /** Pin-column-to-the-left menu item. The default needle points left. */
  pinLeft: IconComponent
  /** Pin-column-to-the-right menu item. The default needle points right. */
  pinRight: IconComponent
  /** Pin-row-to-the-top button while the row is unpinned. The default is the
   *  plain pin. */
  pinTop: IconComponent
  /**
   * Pin-row-to-the-bottom button while the row is unpinned (used when
   * `rowPinningDisplayMode` is `"bottom"`). The default is the plain pin.
   */
  pinBottom: IconComponent
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
  /** Copy action in the cell menu. */
  copy: IconComponent
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
  clearSort: ListX,
  clearFilter: FilterX,
  hide: EyeOff,
  pin: Pin,
  pinLeft: PinLeft,
  pinRight: PinRight,
  pinTop: Pin,
  pinBottom: Pin,
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
  copy: Copy,
  save: Check,
  cancel: X,
  calendar: Calendar,
}

/** Slots that fall back to the consumer's `pin` when not overridden. */
const PIN_SLOTS = ["pinLeft", "pinRight", "pinTop", "pinBottom"] as const

/**
 * Merges the icon layers over the defaults (later layers win). A consumer who
 * overrides `pin` but none of the directional pin slots gets their `pin` on
 * all of them, so the library never mixes their set with its own rotated pins.
 * Likewise `clearSort` falls back to an overridden `clearAll` and
 * `clearFilter` to an overridden `filterOff`.
 */
export function resolveIcons(
  ...layers: (Partial<DataTableIcons> | undefined)[]
): DataTableIcons {
  const overrides: Partial<DataTableIcons> = Object.assign({}, ...layers)
  const resolved = { ...defaultIcons, ...overrides }
  if (overrides.pin) {
    for (const slot of PIN_SLOTS) {
      if (!overrides[slot]) resolved[slot] = overrides.pin
    }
  }
  if (overrides.clearAll && !overrides.clearSort) {
    resolved.clearSort = overrides.clearAll
  }
  if (overrides.filterOff && !overrides.clearFilter) {
    resolved.clearFilter = overrides.filterOff
  }
  return resolved
}
