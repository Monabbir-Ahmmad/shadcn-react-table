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
  RiFilter3Line,
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

import type { DataTableIcons } from "@monabbir/shadcn-react-table/components/data-table"

/**
 * A full Remix Icon mapping for every `DataTableIcons` slot, so the customizer
 * can swap the table's icon set at runtime (via DataTableConfigProvider).
 * Passing `undefined` instead uses the package default (Lucide, shadcn's
 * default icon library).
 */
export const remixIcons: DataTableIcons = {
  sortAscending: RiArrowUpLine,
  sortDescending: RiArrowDownLine,
  sortUnsorted: RiExpandUpDownLine,
  columnActions: RiMore2Line,
  filter: RiFilterLine,
  filterOff: RiFilterOffLine,
  advancedFilter: RiFilter3Line,
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

export type IconLibrary = "lucide" | "remix"
