"use client"

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { type RowData } from "@tanstack/react-table"
import type { Virtualizer } from "@tanstack/react-virtual"
import * as React from "react"

import { TableBody, TableCell, TableRow } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import {
  ALIGN_CELL,
  BODY_CELL_CLASS,
  BODY_ROW_CLASS,
  CELL_PADDING_Y,
  NON_DATA_COLUMN_IDS,
} from "../../core/constants"
import type { DataTableInstance } from "../../core/types"
import { getPinSide } from "../../helpers/column-pinning"
import { getHeaderRowCount } from "../../helpers/grid-rows"
import { resolveRowHeight } from "../../helpers/resolve-row-height"
import type {
  VirtualRowItem,
  WithColumnSpacers,
} from "../../hooks/use-table-virtualizers"
import {
  getColumnDragStyle,
  getColumnPinningClass,
  getColumnPinningStyle,
  getRowPinningClass,
  getWidthStyle,
} from "../../utils/column-styles"
import { DataTableCreateRow } from "../editing/data-table-create-row"
import { DataTableBodyRow } from "./dnd"
import { MemoRow } from "./memo-row"
import { getSlotProps, mergeProps } from "../../helpers/slot-props"
import { RowStateHubContext, useRowStateHub } from "./row-state-hub"
import { getUiState } from "../../core/ui-state"
import { getCellRenderState, renderBodyCell } from "./render-body-cell"
import { SkeletonBar, SkeletonRows } from "./skeleton-rows"
import type { DataTableCell, DataTableRow } from "../../core/table-types"
import { dt } from "../../core/internal"
import { useDndId } from "../../core/dnd-scope"

// Table-instance members scoped to single rows (handled by `rowDeps`), event
// handlers (read through a ref), and the refs object (new every render).
const ROW_SCOPED_KEYS = new Set([
  "editingCell",
  "editingRowId",
  "rowDraft",
  "isCreating",
  "onRowClick",
  "onRowDoubleClick",
  "onCellClick",
  "onCellDoubleClick",
  "refs",
  // Rows take their padding from a CSS variable on the table root.
  "density",
  "setDensity",
])

// State scoped to single rows (selection) or not rendered by rows at all
// (the in-progress resize, during which the body is frozen anyway).
const ROW_SCOPED_STATE = new Set([
  "density",
  "rowSelection",
  "columnSizingInfo",
  "editingCell",
  "editingRowId",
  "rowDraft",
  "isCreating",
])

interface DataTableBodyProps<TData extends RowData> {
  table: DataTableInstance<TData>
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
  virtualItems: VirtualRowItem<TData>[]
  virtualColumns: { index: number }[]
  withColumnSpacers: WithColumnSpacers
}

/**
 * The table `<tbody>`: the optional inline create-row, then either skeleton
 * rows (initial load), the virtualized window, the normal (sortable) rows, or
 * the empty-state row. Owns per-row / per-cell rendering, tree indentation, and
 * expanded detail panels.
 */
/** Whether a column filter, the search or the advanced filter is active
 *  (then an empty body means "no results", not "no records"). */
function isFiltered<TData extends RowData>(table: DataTableInstance<TData>) {
  const state = table.getState()
  return (
    state.columnFilters.length > 0 ||
    !!state.globalFilter ||
    state.advancedFilter.rules.length > 0
  )
}

export function DataTableBody<TData extends RowData>({
  table,
  rowVirtualizer,
  virtualItems,
  virtualColumns,
  withColumnSpacers,
}: DataTableBodyProps<TData>) {
  const {
    enableKeyboardNavigation,
    enableFilterMatchHighlighting,
    columnsWithCustomCell,
    enableColumnResizing,
    enableColumnOrdering,
    enableColumnVirtualization,
    enableRowVirtualization,
    enableRowOrdering,
    enableRowDragging,
    renderDetailPanel,
    onRowClick,
    onRowDoubleClick,
    onCellClick,
    onCellDoubleClick,
    renderEmpty,
    enablePagination,
    showSkeletons,
    showSkeletonsOverRows,
    localization,
    rowHeight,
    getRowHeight,
    enableRowSelection,
  } = dt(table)
  const isGrid = enableKeyboardNavigation
  const rowStateHub = useRowStateHub(table.store, () => {
    const { rowSelection, rowDraft, editingCell, editingRowId } =
      table.getState()
    return [rowSelection, rowDraft, editingCell, editingRowId]
  })
  const headerRowCount = getHeaderRowCount(table)

  // Event handlers read the latest options, so a row that skipped re-rendering
  // still calls the consumer's current (often inline) callback.
  const latest = React.useRef(dt(table))
  React.useLayoutEffect(() => {
    latest.current = dt(table)
  })

  // What every row reads: table options and state, except the parts scoped to
  // single rows (selection, editing) and the click handlers read through
  // `latest`. A change here re-renders every row (see MemoRow).
  const tableDeps = [
    ...Object.entries(dt(table))
      .filter(([key]) => !ROW_SCOPED_KEYS.has(key))
      .map(([, value]) => value),
    ...Object.entries(table.getState())
      .filter(([key]) => !ROW_SCOPED_STATE.has(key))
      .map(([, value]) => value),
    !!onRowClick,
    !!onRowDoubleClick,
    !!onCellClick,
    !!onCellDoubleClick,
    table.options.data,
    table.options.columns,
    headerRowCount,
    virtualColumns.map((vc) => vc.index).join(),
  ]
  /** What only this row reads. */
  // The state rows subscribe to themselves (the body does not re-render for
  // it): selection and inline editing. Read live, since it runs on store
  // changes; kept cheap, since it runs for every row on each change.
  const rowState = (row: DataTableRow<TData>) => {
    const { editingCell, editingRowId, rowDraft } = getUiState(table)
    const hasSubRows = row.subRows.length > 0
    return [
      row.getIsSelected(),
      hasSubRows && row.getIsSomeSelected(),
      hasSubRows && row.getIsAllSubRowsSelected(),
      editingCell?.rowId === row.id ? editingCell.columnId : null,
      editingRowId === row.id ? rowDraft : null,
    ]
  }

  const padding = CELL_PADDING_Y
  // Changes to it re-render the body, so rows always see the current value.
  const cellRenderState = getCellRenderState(table)
  const visibleColumnCount = table.getVisibleLeafColumns().length
  const topRows = table.getTopRows()
  const bottomRows = table.getBottomRows()
  const centerRows = table.getCenterRows()
  const hasRows = topRows.length + centerRows.length + bottomRows.length > 0

  // Tree data (getSubRows) indents the first real data column by row depth so
  // the hierarchy is visible (grouped rows self-indent via the group cell).
  const isTreeData = table.options.getSubRows != null
  const firstDataColumnId = table
    .getVisibleLeafColumns()
    .find((c) => !NON_DATA_COLUMN_IDS.has(c.id))?.id

  // Width, pinning and the column-drag offset (see `getColumnDragStyle`);
  // the drag style only applies while column ordering is on.
  const dragStyle = (column: DataTableCell<TData, unknown>["column"]) => {
    const pinning = getColumnPinningStyle(column)
    return {
      ...getWidthStyle(column, table),
      ...pinning,
      ...(enableColumnOrdering &&
        getColumnDragStyle(column.id, pinning.zIndex as number | undefined)),
    }
  }

  const dndId = useDndId()

  const renderCell = (
    cell: DataTableCell<TData, unknown>,
    row: DataTableRow<TData>,
    rowIndex: number,
    colIndex: number,
    rowHeightValue: number | "auto" | undefined
  ) => {
    const align = cell.column.columnDef.meta?.align ?? "left"
    const isAutoHeight = rowHeightValue === "auto"
    const isFixedHeight = typeof rowHeightValue === "number"
    const treeIndent =
      isTreeData &&
      cell.column.id === firstDataColumnId &&
      !cell.getIsGrouped() &&
      row.depth > 0
        ? row.depth
        : 0
    // `showSkeletons: true` covers existing rows too (e.g. while refetching).
    const content =
      showSkeletons && showSkeletonsOverRows ? (
        <SkeletonBar table={table} column={cell.column} rowIndex={rowIndex} />
      ) : (
        renderBodyCell(
          cell,
          table,
          enableFilterMatchHighlighting,
          columnsWithCustomCell,
          localization,
          cellRenderState
        )
      )
    const indented =
      treeIndent > 0 ? (
        <span
          className="flex items-center"
          style={{ paddingInlineStart: `${treeIndent}rem` }}
        >
          {content}
        </span>
      ) : (
        content
      )
    return (
      <TableCell
        key={cell.id}
        {...mergeProps(
          {
            "data-cell-row": rowIndex,
            "data-cell-col": colIndex,
            "data-column-id": cell.column.id,
            "aria-colindex": isGrid ? colIndex + 1 : undefined,
            "data-pinned": getPinSide(cell.column) || undefined,
            // The grid navigation hook makes one rendered cell the tab stop.
            tabIndex: enableKeyboardNavigation ? -1 : undefined,
            style: dragStyle(cell.column),
            onClick: onCellClick
              ? (event: React.MouseEvent<HTMLTableCellElement>) =>
                  latest.current.onCellClick?.({ cell, row, table, event })
              : undefined,
            onDoubleClick: onCellDoubleClick
              ? (event: React.MouseEvent<HTMLTableCellElement>) =>
                  latest.current.onCellDoubleClick?.({
                    cell,
                    row,
                    table,
                    event,
                  })
              : undefined,
            className: cn(
              "relative",
              BODY_CELL_CLASS,
              // A fixed height is the whole row's height, so the cell drops its
              // vertical padding and the content box below fills the row.
              isFixedHeight ? "py-0" : padding,
              ALIGN_CELL[align],
              // Fixed layout (resizing on) clips overflowing content with an
              // ellipsis instead of letting it bleed into the next column. An
              // "auto" row opts out so its content wraps and the row grows.
              enableColumnResizing &&
                !isAutoHeight &&
                "overflow-hidden text-ellipsis",
              isAutoHeight && "align-top wrap-break-word whitespace-normal",
              getColumnPinningClass(cell.column),
              enableKeyboardNavigation &&
                "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:-outline-offset-2 focus-visible:outline-none"
            ),
          } as React.ComponentProps<"td">,
          getSlotProps(
            table,
            "bodyCell",
            { cell, row, column: cell.column },
            cell.column.columnDef.meta?.slotProps?.bodyCell
          )
        )}
      >
        {isFixedHeight ? (
          // Pin the row to the requested height (the row's 1px bottom border,
          // from shadcn's TableRow, counts towards it), centre the content as
          // the density padding would, and clip overflow.
          <div
            className="flex items-center overflow-hidden"
            style={{ height: rowHeightValue - 1 }}
          >
            {indented}
          </div>
        ) : (
          indented
        )}
      </TableCell>
    )
  }

  const renderCells = (
    row: DataTableRow<TData>,
    rowIndex: number
  ): React.ReactNode => {
    const rowHeightValue = resolveRowHeight(row, { rowHeight, getRowHeight })
    const cells = row.getVisibleCells()
    if (!enableColumnVirtualization) {
      return cells.map((cell, colIndex) =>
        renderCell(cell, row, rowIndex, colIndex, rowHeightValue)
      )
    }
    return withColumnSpacers(
      virtualColumns.map((vc) => {
        const cell = cells[vc.index]
        return cell
          ? renderCell(cell, row, rowIndex, vc.index, rowHeightValue)
          : null
      }),
      `row-${row.id}`
    )
  }

  const detailCellProps = (row: DataTableRow<TData>) =>
    mergeProps(
      {
        colSpan: visibleColumnCount,
        className: "bg-muted/20 p-0",
      } as React.ComponentProps<"td">,
      getSlotProps(table, "detailPanel", { row })
    )

  /** Row props from the table (grid semantics, clicks) and `slotProps`. */
  const bodyRowProps = (row: DataTableRow<TData>, rowIndex: number) =>
    mergeProps(
      {
        // The row's key for the row animations (see useRowAnimations).
        "data-row-id": row.id,
        // No tint fade (selection, hover) for people who prefer less motion.
        className: "motion-reduce:transition-none",
        ...gridRowProps(row, rowIndex),
        onClick: onRowClick
          ? (event: React.MouseEvent<HTMLTableRowElement>) =>
              latest.current.onRowClick?.({ row, table, event })
          : undefined,
        onDoubleClick: onRowDoubleClick
          ? (event: React.MouseEvent<HTMLTableRowElement>) =>
              latest.current.onRowDoubleClick?.({ row, table, event })
          : undefined,
      } as React.ComponentProps<"tr"> & { "data-row-id": string },
      getSlotProps(table, "bodyRow", { row, rowIndex })
    )

  /** Keys a detail panel's row for the row animations. */
  const detailRowProps = (row: DataTableRow<TData>) => ({
    "data-row-id": `${row.id}:detail`,
    "data-row-kind": "detail",
  })

  const detailRow = (row: DataTableRow<TData>) => (
    <TableRow {...detailRowProps(row)} className="hover:bg-transparent">
      <TableCell {...detailCellProps(row)}>
        <div className="p-3">{renderDetailPanel?.({ row, table })}</div>
      </TableCell>
    </TableRow>
  )

  // Rows are numbered in display order (top, center, bottom) for keyboard
  // navigation; detail panels get no number.
  const centerOffset = topRows.length
  const bottomOffset = centerOffset + centerRows.length

  /** Grid semantics for a data row (keyboard navigation makes it a grid). */
  const gridRowProps = (row: DataTableRow<TData>, rowIndex: number) =>
    isGrid
      ? {
          "aria-rowindex": headerRowCount + rowIndex + 1,
          "aria-selected": enableRowSelection ? row.getIsSelected() : undefined,
        }
      : {}

  const renderRow = (row: DataTableRow<TData>, rowIndex: number) => (
    <MemoRow
      key={row.id}
      stateKey={`${row.id}@${rowIndex}`}
      rowKey={[row, rowIndex]}
      selectRowState={() => rowState(row)}
      tableDeps={tableDeps}
      render={() => renderRowContent(row, rowIndex)}
    />
  )

  const renderRowContent = (row: DataTableRow<TData>, rowIndex: number) => {
    const isGrouped = row.getIsGrouped()
    const showDetail = !!renderDetailPanel && row.getIsExpanded() && !isGrouped

    return (
      <React.Fragment>
        <DataTableBodyRow
          {...bodyRowProps(row, rowIndex)}
          row={row}
          draggable={
            (enableRowOrdering || enableRowDragging) &&
            !enableRowVirtualization &&
            !row.getIsPinned() &&
            !isGrouped
          }
        >
          {renderCells(row, rowIndex)}
        </DataTableBodyRow>
        {showDetail && detailRow(row)}
      </React.Fragment>
    )
  }

  const showCreateRow =
    dt(table).enableEditing &&
    dt(table).isCreating &&
    dt(table).createDisplayMode === "row"
  // Where the create row goes: before everything, after everything, or
  // before the center row at a page index (a number past the end means the
  // bottom; virtualized bodies use the top).
  const createPosition = dt(table).positionCreatingRow
  const createIndex =
    typeof createPosition === "number"
      ? enableRowVirtualization || !hasRows
        ? 0
        : Math.max(0, Math.floor(createPosition))
      : null
  const createAtTop =
    showCreateRow && (createPosition === "top" || createIndex === 0)
  const createAtBottom =
    showCreateRow &&
    (createPosition === "bottom" ||
      (createIndex != null &&
        createIndex >= centerRows.length &&
        createIndex > 0))
  const createBefore =
    showCreateRow && createIndex != null && createIndex > 0 ? createIndex : -1
  // Every center row, for the non-virtualized body. A virtualized body
  // renders only its window and must not walk all rows on each scroll frame.
  const renderCenterRows = () => {
    const nodes = centerRows.map((row, i) => renderRow(row, centerOffset + i))
    if (createBefore > 0 && createBefore < centerRows.length) {
      nodes.splice(
        createBefore,
        0,
        <DataTableCreateRow key="cn-create-row" table={table} />
      )
    }
    return nodes
  }

  // Pinned rows in their own sticky groups (just under the header / above
  // the footer, whose heights the table publishes as CSS variables), so they
  // stay in view while the rest scroll. `"static"` lists them in the body.
  const stickyPins = dt(table).rowPinningDisplayMode !== "static" && hasRows

  return (
    <RowStateHubContext.Provider value={rowStateHub}>
      {stickyPins && topRows.length > 0 && (
        <TableBody
          data-pinned-rows="top"
          className={cn("sticky z-10", getRowPinningClass("top"))}
          style={{ top: "var(--dt-head-h, 0px)" }}
        >
          {topRows.map((row, i) => renderRow(row, i))}
        </TableBody>
      )}
      <TableBody {...getSlotProps(table, "body", {})}>
        {createAtTop && <DataTableCreateRow table={table} />}
        {showSkeletons && !hasRows ? (
          <SkeletonRows
            table={table}
            // A page's worth, at most 10, so a big page doesn't flood the body.
            rowCount={
              enablePagination
                ? Math.min(10, table.getState().pagination.pageSize)
                : 8
            }
            padding={padding}
            virtualColumns={!!enableColumnVirtualization}
          />
        ) : hasRows && enableRowVirtualization ? (
          <>
            {!stickyPins && topRows.map((row, i) => renderRow(row, i))}
            {(() => {
              const vRows = rowVirtualizer.getVirtualItems()
              const padTop = vRows.length ? (vRows[0]?.start ?? 0) : 0
              const padBottom = vRows.length
                ? rowVirtualizer.getTotalSize() -
                  (vRows[vRows.length - 1]?.end ?? 0)
                : 0
              return (
                <>
                  {padTop > 0 && (
                    <tr aria-hidden>
                      <td
                        colSpan={visibleColumnCount}
                        style={{ height: padTop, padding: 0, border: 0 }}
                      />
                    </tr>
                  )}
                  {vRows.map((vRow) => {
                    const item = virtualItems[vRow.index]
                    if (!item) return null
                    if (item.detail) {
                      return (
                        <TableRow
                          key={`${item.row.id}-detail`}
                          {...detailRowProps(item.row)}
                          data-index={vRow.index}
                          ref={rowVirtualizer.measureElement}
                          className="hover:bg-transparent"
                        >
                          <TableCell {...detailCellProps(item.row)}>
                            <div className="p-3">
                              {renderDetailPanel?.({ row: item.row, table })}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    }
                    const rowIndex = centerOffset + item.index
                    return (
                      <MemoRow
                        key={item.row.id}
                        stateKey={`${item.row.id}@${rowIndex}`}
                        rowKey={[item.row, rowIndex, vRow.index]}
                        selectRowState={() => rowState(item.row)}
                        tableDeps={tableDeps}
                        render={() => (
                          <TableRow
                            {...mergeProps(
                              {
                                "data-index": vRow.index,
                                ref: rowVirtualizer.measureElement,
                                "data-state": item.row.getIsSelected()
                                  ? "selected"
                                  : undefined,
                                className: cn(
                                  BODY_ROW_CLASS,
                                  (onRowClick || onRowDoubleClick) &&
                                    "cursor-pointer"
                                ),
                              } as React.ComponentProps<"tr">,
                              bodyRowProps(item.row, rowIndex)
                            )}
                          >
                            {renderCells(item.row, rowIndex)}
                          </TableRow>
                        )}
                      />
                    )
                  })}
                  {padBottom > 0 && (
                    <tr aria-hidden>
                      <td
                        colSpan={visibleColumnCount}
                        style={{ height: padBottom, padding: 0, border: 0 }}
                      />
                    </tr>
                  )}
                </>
              )
            })()}
            {!stickyPins &&
              bottomRows.map((row, i) => renderRow(row, bottomOffset + i))}
          </>
        ) : hasRows ? (
          <>
            {!stickyPins && topRows.map((row, i) => renderRow(row, i))}
            <SortableContext
              items={centerRows.map((row) => dndId(row.id))}
              strategy={verticalListSortingStrategy}
            >
              {renderCenterRows()}
            </SortableContext>
            {!stickyPins &&
              bottomRows.map((row, i) => renderRow(row, bottomOffset + i))}
          </>
        ) : (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={visibleColumnCount}
              className="h-32 text-center text-sm text-muted-foreground"
            >
              {renderEmpty?.({ table }) ??
                (isFiltered(table)
                  ? localization.noResultsFound
                  : localization.noRecordsToDisplay)}
            </TableCell>
          </TableRow>
        )}
        {createAtBottom && <DataTableCreateRow table={table} />}
      </TableBody>
      {stickyPins && bottomRows.length > 0 && (
        <TableBody
          data-pinned-rows="bottom"
          className={cn("sticky z-10", getRowPinningClass("bottom"))}
          style={{ bottom: "var(--dt-foot-h, 0px)" }}
        >
          {bottomRows.map((row, i) => renderRow(row, bottomOffset + i))}
        </TableBody>
      )}
    </RowStateHubContext.Provider>
  )
}
