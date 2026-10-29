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
  DENSITY_CELL_PADDING,
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
  getColumnPinningClass,
  getColumnPinningStyle,
  getWidthStyle,
} from "../../utils/column-styles"
import { DataTableCreateRow } from "../editing/data-table-create-row"
import { DataTableBodyRow } from "./dnd"
import { MemoRow } from "./memo-row"
import { RowStateHubContext, useRowStateHub } from "./row-state-hub"
import { getUiState } from "../../core/ui-state"
import { getCellRenderState, renderBodyCell } from "./render-body-cell"
import { SkeletonRows } from "./skeleton-rows"
import type { DataTableCell, DataTableRow } from "../../core/table-types"
import { dt } from "../../core/internal"

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
])

// State scoped to single rows (selection) or not rendered by rows at all
// (the in-progress resize, during which the body is frozen anyway).
const ROW_SCOPED_STATE = new Set([
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
export function DataTableBody<TData extends RowData>({
  table,
  rowVirtualizer,
  virtualItems,
  virtualColumns,
  withColumnSpacers,
}: DataTableBodyProps<TData>) {
  const {
    density,
    enableKeyboardNavigation,
    enableFilterMatchHighlighting,
    columnsWithCustomCell,
    enableColumnResizing,
    enableColumnVirtualization,
    enableRowVirtualization,
    enableRowOrdering,
    renderDetailPanel,
    onRowClick,
    onRowDoubleClick,
    onCellClick,
    onCellDoubleClick,
    renderEmpty,
    enablePagination,
    showSkeletons,
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

  const padding = DENSITY_CELL_PADDING[density]
  // Changes to it re-render the body, so rows always see the current value.
  const cellRenderState = getCellRenderState(table)
  const visibleColumnCount = table.getVisibleLeafColumns().length
  const topRows = table.getTopRows()
  const bottomRows = table.getBottomRows()
  const centerRows = table.getCenterRows()
  const hasRows = topRows.length + centerRows.length + bottomRows.length > 0
  const centerRowIds = centerRows.map((r) => r.id)

  // Tree data (getSubRows) indents the first real data column by row depth so
  // the hierarchy is visible (grouped rows self-indent via the group cell).
  const isTreeData = table.options.getSubRows != null
  const firstDataColumnId = table
    .getVisibleLeafColumns()
    .find((c) => !NON_DATA_COLUMN_IDS.has(c.id))?.id

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
    const content = renderBodyCell(
      cell,
      table,
      enableFilterMatchHighlighting,
      columnsWithCustomCell,
      localization,
      cellRenderState
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
        data-cell-row={rowIndex}
        data-cell-col={colIndex}
        aria-colindex={isGrid ? colIndex + 1 : undefined}
        data-pinned={getPinSide(cell.column) || undefined}
        // The grid navigation hook makes one rendered cell the tab stop.
        tabIndex={enableKeyboardNavigation ? -1 : undefined}
        style={{
          ...getWidthStyle(cell.column, table),
          ...getColumnPinningStyle(cell.column),
        }}
        onClick={
          onCellClick
            ? (event) =>
                latest.current.onCellClick?.({ cell, row, table, event })
            : undefined
        }
        onDoubleClick={
          onCellDoubleClick
            ? (event) =>
                latest.current.onCellDoubleClick?.({ cell, row, table, event })
            : undefined
        }
        className={cn(
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

  const detailRow = (row: DataTableRow<TData>) => (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={visibleColumnCount} className="bg-muted/20 p-0">
        <div className="p-3">{renderDetailPanel?.({ row, table })}</div>
      </TableCell>
    </TableRow>
  )

  // Rows are numbered in display order (top, center, bottom) for keyboard
  // navigation; detail panels get no number.
  const centerOffset = topRows.length
  const bottomOffset = centerOffset + centerRows.length
  const centerIndexById = new Map(centerRows.map((r, i) => [r.id, i]))

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
          {...gridRowProps(row, rowIndex)}
          row={row}
          draggable={
            enableRowOrdering &&
            !enableRowVirtualization &&
            !row.getIsPinned() &&
            !isGrouped
          }
          onClick={
            onRowClick
              ? (event) => latest.current.onRowClick?.({ row, table, event })
              : undefined
          }
          onDoubleClick={
            onRowDoubleClick
              ? (event) =>
                  latest.current.onRowDoubleClick?.({ row, table, event })
              : undefined
          }
        >
          {renderCells(row, rowIndex)}
        </DataTableBodyRow>
        {showDetail && detailRow(row)}
      </React.Fragment>
    )
  }

  return (
    <RowStateHubContext.Provider value={rowStateHub}>
      <TableBody>
        {dt(table).enableEditing &&
          dt(table).isCreating &&
          dt(table).createDisplayMode === "row" && (
            <DataTableCreateRow table={table} />
          )}
        {showSkeletons && !hasRows ? (
          <SkeletonRows
            rowCount={
              enablePagination ? table.getState().pagination.pageSize : 8
            }
            columnCount={visibleColumnCount}
            padding={padding}
          />
        ) : hasRows && enableRowVirtualization ? (
          <>
            {topRows.map((row, i) => renderRow(row, i))}
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
                          data-index={vRow.index}
                          ref={rowVirtualizer.measureElement}
                          className="hover:bg-transparent"
                        >
                          <TableCell
                            colSpan={visibleColumnCount}
                            className="bg-muted/20 p-0"
                          >
                            <div className="p-3">
                              {renderDetailPanel?.({ row: item.row, table })}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    }
                    const rowIndex =
                      centerOffset + (centerIndexById.get(item.row.id) ?? 0)
                    return (
                      <MemoRow
                        key={item.row.id}
                        stateKey={`${item.row.id}@${rowIndex}`}
                        rowKey={[item.row, rowIndex, vRow.index]}
                        selectRowState={() => rowState(item.row)}
                        tableDeps={tableDeps}
                        render={() => (
                          <TableRow
                            {...gridRowProps(item.row, rowIndex)}
                            data-index={vRow.index}
                            ref={rowVirtualizer.measureElement}
                            data-state={
                              item.row.getIsSelected() ? "selected" : undefined
                            }
                            onClick={
                              onRowClick
                                ? (event) =>
                                    latest.current.onRowClick?.({
                                      row: item.row,
                                      table,
                                      event,
                                    })
                                : undefined
                            }
                            onDoubleClick={
                              onRowDoubleClick
                                ? (event) =>
                                    latest.current.onRowDoubleClick?.({
                                      row: item.row,
                                      table,
                                      event,
                                    })
                                : undefined
                            }
                            className={cn(
                              BODY_ROW_CLASS,
                              (onRowClick || onRowDoubleClick) &&
                                "cursor-pointer"
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
            {bottomRows.map((row, i) => renderRow(row, bottomOffset + i))}
          </>
        ) : hasRows ? (
          <>
            {topRows.map((row, i) => renderRow(row, i))}
            <SortableContext
              items={centerRowIds}
              strategy={verticalListSortingStrategy}
            >
              {centerRows.map((row, i) => renderRow(row, centerOffset + i))}
            </SortableContext>
            {bottomRows.map((row, i) => renderRow(row, bottomOffset + i))}
          </>
        ) : (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={visibleColumnCount}
              className="h-32 text-center text-sm text-muted-foreground"
            >
              {renderEmpty?.({ table }) ?? localization.noRecordsToDisplay}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </RowStateHubContext.Provider>
  )
}
