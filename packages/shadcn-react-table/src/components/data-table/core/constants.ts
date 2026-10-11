import {
  EXPAND_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
} from "../injected-columns/injected-columns"
import { ROW_ACTIONS_COLUMN_ID } from "../injected-columns/data-table-row-actions"
import { SELECTION_COLUMN_ID } from "../injected-columns/selection-column"
import type { Density } from "./types"

export const DENSITY_ORDER: Density[] = ["comfortable", "compact", "spacious"]

/** Vertical padding utility per density level, applied to header + body cells. */
export const DENSITY_CELL_PADDING: Record<Density, string> = {
  compact: "py-1",
  comfortable: "py-2.5",
  spacious: "py-4",
}

/** Horizontal alignment → text-align utility, applied to body cells. */
export const ALIGN_CELL = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

/** Injected columns that should never be draggable in the header. */
export const DISPLAY_COLUMN_IDS = new Set([
  SELECTION_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
])

// All injected (non-user) columns, used to find the first real data column so
// tree (sub-row) rows can be indented by depth there.
export const NON_DATA_COLUMN_IDS = new Set([
  SELECTION_COLUMN_ID,
  ROW_NUMBER_COLUMN_ID,
  ROW_DRAG_COLUMN_ID,
  EXPAND_COLUMN_ID,
  ROW_ACTIONS_COLUMN_ID,
])

/**
 * Body-row state tint, shared by the virtualized row and the DnD/normal row so
 * both paths stay in sync. Cells are opaque (pinned columns must cover
 * scrolled content), so the row's own background would be hidden; instead the
 * row publishes its tint as `--row-tint` and {@link BODY_CELL_CLASS} layers it
 * over the card. Mirrors shadcn's row states: hover / open menu → muted/50,
 * selected → primary/20 (kept under hover), dragging → muted.
 */
export const BODY_ROW_CLASS =
  "group [--row-tint:transparent] hover:[--row-tint:color-mix(in_oklab,var(--muted)_50%,transparent)] has-aria-expanded:[--row-tint:color-mix(in_oklab,var(--muted)_50%,transparent)] data-[state=selected]:[--row-tint:color-mix(in_oklab,var(--primary)_20%,transparent)] data-[state=selected]:hover:[--row-tint:color-mix(in_oklab,var(--primary)_20%,transparent)] data-[dragging=true]:[--row-tint:var(--muted)]!"

/**
 * Body-cell background: the row's `--row-tint` painted over an opaque card
 * fill, plus the selected row's 2px accent bar on its first cell.
 */
export const BODY_CELL_CLASS =
  "bg-card bg-[linear-gradient(var(--row-tint),var(--row-tint))] group-data-[state=selected]:first:shadow-[inset_2px_0_0_0_var(--primary)]"
