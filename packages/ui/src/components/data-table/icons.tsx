import {
  RiArrowDownLine,
  RiArrowDownSLine,
  RiArrowLeftDoubleLine,
  RiArrowLeftSLine,
  RiArrowRightDoubleLine,
  RiArrowRightSLine,
  RiArrowUpLine,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiDownloadLine,
  RiDraggable,
  RiExpandUpDownLine,
  RiEyeOffLine,
  RiFileExcel2Line,
  RiFileTextLine,
  RiFilterLine,
  RiFilterOffLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiGroup2Line,
  RiLayoutColumnLine,
  RiLineHeight,
  RiListCheck,
  RiMore2Line,
  RiPencilLine,
  RiPushpinFill,
  RiPushpinLine,
  RiSearchLine,
  RiUnpinLine,
} from "@remixicon/react"

/** Any component that renders an icon and accepts a `className`. */
export type IconComponent = React.ComponentType<{ className?: string }>

/**
 * Every icon the data table renders, by semantic name. Override any subset via
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
  export: IconComponent
  fileCsv: IconComponent
  fileExcel: IconComponent
  calendar: IconComponent
}

export const defaultIcons: DataTableIcons = {
  sortAscending: RiArrowUpLine,
  sortDescending: RiArrowDownLine,
  sortUnsorted: RiExpandUpDownLine,
  columnActions: RiMore2Line,
  filter: RiFilterLine,
  filterOff: RiFilterOffLine,
  clearAll: RiListCheck,
  hide: RiEyeOffLine,
  pin: RiPushpinLine,
  pinnedRow: RiPushpinFill,
  unpin: RiUnpinLine,
  group: RiGroup2Line,
  columnVisibility: RiLayoutColumnLine,
  density: RiLineHeight,
  fullscreenEnter: RiFullscreenLine,
  fullscreenExit: RiFullscreenExitLine,
  search: RiSearchLine,
  clear: RiCloseLine,
  pageFirst: RiArrowLeftDoubleLine,
  pagePrev: RiArrowLeftSLine,
  pageNext: RiArrowRightSLine,
  pageLast: RiArrowRightDoubleLine,
  expanded: RiArrowDownSLine,
  collapsed: RiArrowRightSLine,
  dragHandle: RiDraggable,
  edit: RiPencilLine,
  save: RiCheckLine,
  cancel: RiCloseLine,
  export: RiDownloadLine,
  fileCsv: RiFileTextLine,
  fileExcel: RiFileExcel2Line,
  calendar: RiCalendarLine,
}
