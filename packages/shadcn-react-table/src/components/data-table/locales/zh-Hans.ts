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

export const dataTableLocalizationZhHans: DataTableLocalization = {
  language: "zh-Hans",
  selectAll: "切换选择全部",
  selectRow: "切换选择行",
  clearSelection: "清除选择",
  rowsSelected: (selected, total) =>
    `已选择 ${selected.toLocaleString("zh-Hans")} / ${total.toLocaleString("zh-Hans")} 行`, // needs review
  sortByColumnAsc: (column) => `按 ${column} 升序排序`, // needs review
  sortByColumnDesc: (column) => `按 ${column} 降序排序`, // needs review
  sortAscending: "升序排序", // needs review
  sortDescending: "降序排序", // needs review
  clearSort: "清除排序",
  sortedAscending: "已升序排序", // needs review
  sortedDescending: "已降序排序", // needs review
  columnActions: "列操作",
  hideColumn: "隐藏列", // needs review
  showAllColumns: "显示全部列",
  pinToLeft: "固定至左边",
  pinToRight: "固定至右边",
  unpin: "取消固定",
  reorderColumn: "移动",
  reorderRow: "移动",
  pinRow: "固定行", // needs review
  unpinRow: "取消固定行", // needs review
  resizeColumn: "调整列宽", // needs review
  groupByColumn: (column) => `按 ${column} 分组`, // needs review
  ungroupByColumn: (column) => `取消按 ${column} 分组`,
  groupedBy: "分组依据", // needs review
  dropToGroupBy: "将列拖到此处以按其分组", // needs review
  expand: "展开",
  collapse: "折叠",
  expandAll: "全部展开",
  collapseAll: "全部折叠",
  toggleRowExpanded: "展开/折叠行", // needs review
  columnVisibility: "显示/隐藏 列",
  toggleColumnVisibility: "切换可见度",
  filterByColumn: (column) => `以 ${column} 过滤`,
  clearFilter: "清除过滤",
  filterMode: "过滤模式", // needs review
  changeFilterMode: "更改过滤模式",
  filterPlaceholder: (column) => `过滤 ${column}…`, // needs review
  showColumnFilters: "显示过滤条件", // needs review
  hideColumnFilters: "隐藏过滤条件", // needs review
  min: "最小",
  max: "最大",
  pickDate: "选择日期", // needs review
  pickDateRange: "选择日期范围", // needs review
  true: "是", // needs review
  false: "否", // needs review
  filterModes: {
    fuzzy: "模糊搜索",
    contains: "包含",
    startsWith: "开首为",
    endsWith: "结尾为",
    equals: "等于",
    notEquals: "不等于",
    empty: "是空字串",
    notEmpty: "非空字串",
    between: "介于首尾",
    betweenInclusive: "介于首尾之间",
    greaterThan: "大于",
    greaterThanOrEqualTo: "大于等于",
    lessThan: "小于",
    lessThanOrEqualTo: "小于等于",
    before: "早于", // needs review
    after: "晚于", // needs review
    betweenDates: "介于", // needs review
    equalsString: "等于",
    arrIncludesSome: "包括",
    equalsBool: "等于",
  },
  advancedFilters: "高级过滤", // needs review
  advancedFiltersMatch: (logic) => `匹配 ${logic} 以下规则`, // needs review
  advancedFiltersMatchAll: "全部", // needs review
  advancedFiltersMatchAny: "任意", // needs review
  advancedFiltersAddRule: "添加过滤条件", // needs review
  advancedFiltersApply: "应用", // needs review
  advancedFiltersClearAll: "全部清除", // needs review
  advancedFiltersColumn: "列", // needs review
  advancedFiltersOperator: "运算符", // needs review
  advancedFiltersValue: "值", // needs review
  advancedFiltersEmpty: "暂无过滤条件。添加一个以开始。", // needs review
  removeFilterRule: "移除过滤条件", // needs review
  advancedFilterOperators: {
    contains: "包含",
    notContains: "不包含", // needs review
    startsWith: "开首为",
    endsWith: "结尾为",
    equals: "等于",
    notEquals: "不等于",
    isEmpty: "是空字串",
    isNotEmpty: "非空字串",
    greaterThan: "大于",
    greaterThanOrEqual: "大于等于",
    lessThan: "小于",
    lessThanOrEqual: "小于等于",
    between: "介于首尾",
  },
  search: "搜索",
  searchPlaceholder: "搜索…", // needs review
  clearSearch: "清除搜索",
  globalFilterMode: "更改搜索模式",
  toggleDensity: "切换间距",
  densityComfortable: "舒适", // needs review
  densityCompact: "紧凑", // needs review
  densitySpacious: "宽松", // needs review
  enterFullscreen: "进入全屏", // needs review
  exitFullscreen: "退出全屏", // needs review
  rowsPerPage: "每页行数",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("zh-Hans")}–${end.toLocaleString("zh-Hans")} / ${total.toLocaleString("zh-Hans")}`, // needs review
  goToFirstPage: "到第一页",
  goToPreviousPage: "上一页",
  goToNextPage: "下一页",
  goToLastPage: "到最后一页",
  goToPage: (page) => `转到第 ${page.toLocaleString("zh-Hans")} 页`, // needs review
  rowActions: "行操作",
  edit: "编辑",
  save: "保存",
  cancel: "取消",
  delete: "删除", // needs review
  create: "创建", // needs review
  createNewRow: "创建新行", // needs review
  editRow: "编辑行", // needs review
  required: "必填", // needs review
  copy: "复制",
  copied: "已复制至剪贴板",
  cellActions: "单元格操作", // needs review
  noRecordsToDisplay: "无记录可显示",
  loading: "加载中…", // needs review
  loadingMore: "正在加载更多…", // needs review
  dragStart: (label) => `已拾起 ${label}。`, // needs review
  dragOver: (label, over) => `${label} 位于 ${over} 上方。`, // needs review
  dragEnd: (label, over) => `${label} 已放置到 ${over}。`, // needs review
  dragCancel: (label) => `已取消拖动。${label} 已放下。`, // needs review
  dragInstructions:
    "要拾起项目，请按空格键或回车键。拖动时，使用方向键移动它。再次按空格键或回车键放下，或按 Esc 键取消。", // needs review
  dragRowLabel: (position) => `第 ${position.toLocaleString("zh-Hans")} 行`, // needs review
  noResultsFound: "未找到结果",
}
