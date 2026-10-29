// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.
//
// The original notice follows.
/*
 * MIT License
 *
 * Copyright (c) 2022 Kevin Vandy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { DataTableLocalization } from "../core/localization"

export const dataTableLocalizationZhHant: DataTableLocalization = {
  language: "zh-Hant",
  selectAll: "切換選擇全部",
  selectRow: "切換選擇橫列",
  clearSelection: "清除選擇",
  rowsSelected: (selected, total) =>
    `已選擇 ${selected.toLocaleString("zh-Hant")} / ${total.toLocaleString("zh-Hant")} 橫列`, // needs review
  sortByColumnAsc: (column) => `按 ${column} 遞增排序`, // needs review
  sortByColumnDesc: (column) => `按 ${column} 遞減排序`, // needs review
  sortAscending: "遞增排序", // needs review
  sortDescending: "遞減排序", // needs review
  clearSort: "清除排序",
  sortedAscending: "已遞增排序", // needs review
  sortedDescending: "已遞減排序", // needs review
  columnActions: "欄位動作",
  hideColumn: "隱藏欄位", // needs review
  showAllColumns: "顯示全部欄位",
  pinToLeft: "固定至左邊",
  pinToRight: "固定至右邊",
  unpin: "取消固定",
  reorderColumn: "移動",
  reorderRow: "移動",
  pinRow: "固定橫列", // needs review
  unpinRow: "取消固定橫列", // needs review
  resizeColumn: "調整欄位寬度", // needs review
  groupByColumn: (column) => `按 ${column} 分組`, // needs review
  ungroupByColumn: (column) => `取消按 ${column} 分組`,
  groupedBy: "分組依據", // needs review
  dropToGroupBy: "將欄位拖曳到此處以按其分組", // needs review
  expand: "展開",
  collapse: "折疊",
  expandAll: "全部展開",
  collapseAll: "全部折疊",
  toggleRowExpanded: "展開/折疊橫列", // needs review
  columnVisibility: "顯示/隱藏 欄位",
  toggleColumnVisibility: "切換可見度",
  filterByColumn: (column) => `以 ${column} 過濾`,
  clearFilter: "清除過濾",
  filterMode: "過濾模式", // needs review
  changeFilterMode: "更改過濾模式",
  filterPlaceholder: (column) => `過濾 ${column}…`, // needs review
  showColumnFilters: "顯示過濾條件", // needs review
  hideColumnFilters: "隱藏過濾條件", // needs review
  min: "最小",
  max: "最大",
  pickDate: "選擇日期", // needs review
  pickDateRange: "選擇日期範圍", // needs review
  true: "是", // needs review
  false: "否", // needs review
  filterModes: {
    fuzzy: "模糊搜索",
    contains: "包含",
    startsWith: "開首為",
    endsWith: "結尾為",
    equals: "等於",
    notEquals: "不等於",
    empty: "是空字串",
    notEmpty: "非空字串",
    between: "介於首尾",
    betweenInclusive: "介於首尾之間",
    greaterThan: "大於",
    greaterThanOrEqualTo: "大於等於",
    lessThan: "小於",
    lessThanOrEqualTo: "小於等於",
    before: "早於", // needs review
    after: "晚於", // needs review
    betweenDates: "介於", // needs review
    equalsString: "等於",
    arrIncludesSome: "包括",
    equalsBool: "等於",
  },
  advancedFilters: "進階過濾", // needs review
  advancedFiltersMatch: (logic) => `符合 ${logic} 以下規則`, // needs review
  advancedFiltersMatchAll: "全部", // needs review
  advancedFiltersMatchAny: "任一", // needs review
  advancedFiltersAddRule: "新增過濾條件", // needs review
  advancedFiltersApply: "套用", // needs review
  advancedFiltersClearAll: "全部清除", // needs review
  advancedFiltersColumn: "欄位", // needs review
  advancedFiltersOperator: "運算子", // needs review
  advancedFiltersValue: "值", // needs review
  advancedFiltersEmpty: "尚無過濾條件。新增一個以開始。", // needs review
  removeFilterRule: "移除過濾條件", // needs review
  advancedFilterOperators: {
    contains: "包含",
    notContains: "不包含", // needs review
    startsWith: "開首為",
    endsWith: "結尾為",
    equals: "等於",
    notEquals: "不等於",
    isEmpty: "是空字串",
    isNotEmpty: "非空字串",
    greaterThan: "大於",
    greaterThanOrEqual: "大於等於",
    lessThan: "小於",
    lessThanOrEqual: "小於等於",
    between: "介於首尾",
  },
  search: "搜尋",
  searchPlaceholder: "搜尋…", // needs review
  clearSearch: "清除搜尋",
  globalFilterMode: "更改搜尋模式",
  toggleDensity: "切換密度",
  densityComfortable: "舒適", // needs review
  densityCompact: "緊湊", // needs review
  densitySpacious: "寬鬆", // needs review
  enterFullscreen: "進入全螢幕", // needs review
  exitFullscreen: "離開全螢幕", // needs review
  rowsPerPage: "每頁數量",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("zh-Hant")}–${end.toLocaleString("zh-Hant")} / ${total.toLocaleString("zh-Hant")}`, // needs review
  goToFirstPage: "到第一頁",
  goToPreviousPage: "上一頁",
  goToNextPage: "下一頁",
  goToLastPage: "到最後一頁",
  goToPage: (page) => `前往第 ${page.toLocaleString("zh-Hant")} 頁`, // needs review
  rowActions: "橫列動作",
  edit: "編輯",
  save: "儲存",
  cancel: "取消",
  delete: "刪除", // needs review
  create: "建立", // needs review
  createNewRow: "建立新橫列", // needs review
  editRow: "編輯橫列", // needs review
  required: "必填", // needs review
  copy: "複製",
  copied: "已複製至剪貼簿",
  cellActions: "儲存格動作", // needs review
  noRecordsToDisplay: "無紀錄可顯示",
  loading: "載入中…", // needs review
  loadingMore: "正在載入更多…", // needs review
  dragStart: (label) => `已拾起 ${label}。`, // needs review
  dragOver: (label, over) => `${label} 位於 ${over} 上方。`, // needs review
  dragEnd: (label, over) => `${label} 已放置到 ${over}。`, // needs review
  dragCancel: (label) => `已取消拖曳。${label} 已放下。`, // needs review
  dragInstructions:
    "若要拾起項目，請按空白鍵或 Enter 鍵。拖曳時，使用方向鍵移動項目。再按一次空白鍵或 Enter 鍵即可放下，或按 Esc 鍵取消。", // needs review
  dragRowLabel: (position) => `第 ${position.toLocaleString("zh-Hant")} 橫列`, // needs review
}
