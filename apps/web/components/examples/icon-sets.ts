import { createElement } from "react"
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
  RiDraggable,
  RiExpandUpDownLine,
  RiEyeOffLine,
  RiFilter3Line,
  RiFilterLine,
  RiFilterOffLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiGroup2Line,
  RiLayoutColumnLine,
  RiLineHeight,
  RiListCheck,
  RiRestartLine,
  RiMore2Line,
  RiPencilLine,
  RiPushpinFill,
  RiPushpinLine,
  RiSearchLine,
  RiUnpinLine,
  RiFileCopyLine,
} from "@remixicon/react"

import { cn } from "@workspace/ui/lib/utils"
import type { DataTableIcons } from "@monabbir/shadcn-react-table/components/data-table"

/** Remix has no directional pins, so turn the pushpin like the defaults do. */
const turnedPin =
  (rotation: string): DataTableIcons["pin"] =>
  ({ className }) =>
    createElement(RiPushpinLine, { className: cn(rotation, className) })

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
  clearSort: RiRestartLine,
  clearFilter: RiFilterOffLine,
  hide: RiEyeOffLine,
  pin: RiPushpinLine,
  pinLeft: turnedPin("rotate-90"),
  pinRight: turnedPin("-rotate-90"),
  pinTop: RiPushpinLine,
  pinBottom: turnedPin("rotate-180"),
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
  copy: RiFileCopyLine,
  save: RiCheckLine,
  cancel: RiCloseLine,
  calendar: RiCalendarLine,
}

export type IconLibrary = "lucide" | "remix"
