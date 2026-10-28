// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.

import type { DataTableLocalization } from "../core/localization"

export const dataTableLocalizationJa: DataTableLocalization = {
  language: "ja",
  selectAll: "すべて選択",
  selectRow: "選択",
  clearSelection: "選択を解除",
  rowsSelected: (selected, total) =>
    `${total.toLocaleString("ja")} 行中 ${selected.toLocaleString("ja")} 行を選択`, // needs review
  sortByColumnAsc: (column) => `${column}を昇順で並べ替え`, // needs review
  sortByColumnDesc: (column) => `${column}を降順で並べ替え`, // needs review
  sortAscending: "昇順で並べ替え", // needs review
  sortDescending: "降順で並べ替え", // needs review
  clearSort: "並べ替えを解除",
  sortedAscending: "昇順で並べ替え済み", // needs review
  sortedDescending: "降順で並べ替え済み", // needs review
  columnActions: "操作",
  hideColumn: "列を隠す", // needs review
  showAllColumns: "すべての列を表示",
  pinToLeft: "左に固定",
  pinToRight: "右に固定",
  unpin: "固定を解除",
  reorderColumn: "移動",
  reorderRow: "移動",
  pinRow: "行を固定", // needs review
  unpinRow: "行の固定を解除", // needs review
  resizeColumn: "列のサイズを変更", // needs review
  groupByColumn: (column) => `${column}でグループ化`, // needs review
  ungroupByColumn: (column) => `${column}のグループ解除`,
  groupedBy: "グループ化の条件", // needs review
  dropToGroupBy: "列をここにドラッグしてグループ化", // needs review
  expand: "展開",
  collapse: "折りたたむ",
  expandAll: "すべて展開",
  collapseAll: "すべて折りたたむ",
  toggleRowExpanded: "行の展開を切り替え", // needs review
  columnVisibility: "列の表示状態",
  toggleColumnVisibility: "表示を切り替え",
  filterByColumn: (column) => `${column}を検索`,
  clearFilter: "リセット",
  filterMode: "検索モード", // needs review
  changeFilterMode: "検索モードを変更",
  filterPlaceholder: (column) => `${column}を検索…`, // needs review
  showColumnFilters: "検索バーを表示", // needs review
  hideColumnFilters: "検索バーを隠す", // needs review
  min: "最小",
  max: "最大",
  pickDate: "日付を選択", // needs review
  pickDateRange: "日付の範囲を選択", // needs review
  true: "はい", // needs review
  false: "いいえ", // needs review
  filterModes: {
    fuzzy: "あいまい検索",
    contains: "含まれる",
    startsWith: "で始まる",
    endsWith: "で終わる",
    equals: "一致",
    notEquals: "不一致",
    empty: "空",
    notEmpty: "空ではない",
    between: "最大最小",
    betweenInclusive: "間を含む",
    greaterThan: "より大きい",
    greaterThanOrEqualTo: "以上",
    lessThan: "より少ない",
    lessThanOrEqualTo: "以下",
    before: "より前", // needs review
    after: "より後", // needs review
    betweenDates: "範囲内", // needs review
    equalsString: "一致",
    arrIncludesSome: "含む",
    equalsBool: "一致",
  },
  advancedFilters: "詳細検索", // needs review
  advancedFiltersMatchLabel: "次の条件の", // needs review
  advancedFiltersMatchAll: "すべて", // needs review
  advancedFiltersMatchAny: "いずれか", // needs review
  advancedFiltersOf: "に一致", // needs review
  advancedFiltersAddRule: "条件を追加", // needs review
  advancedFiltersApply: "適用", // needs review
  advancedFiltersClearAll: "すべてクリア", // needs review
  advancedFiltersColumn: "列", // needs review
  advancedFiltersOperator: "演算子", // needs review
  advancedFiltersValue: "値", // needs review
  advancedFiltersEmpty: "条件がありません。追加して始めましょう。", // needs review
  removeFilterRule: "条件を削除", // needs review
  advancedFilterOperators: {
    contains: "含まれる",
    notContains: "含まない", // needs review
    startsWith: "で始まる",
    endsWith: "で終わる",
    equals: "一致",
    notEquals: "不一致",
    isEmpty: "空",
    isNotEmpty: "空ではない",
    greaterThan: "より大きい",
    greaterThanOrEqual: "以上",
    lessThan: "より少ない",
    lessThanOrEqual: "以下",
    between: "最大最小",
  },
  search: "検索",
  searchPlaceholder: "検索…", // needs review
  clearSearch: "リセット",
  globalFilterMode: "検索モードを変更",
  toggleDensity: "テーブルの高さを変更",
  densityComfortable: "標準", // needs review
  densityCompact: "コンパクト", // needs review
  densitySpacious: "ゆったり", // needs review
  enterFullscreen: "フルスクリーンにする", // needs review
  exitFullscreen: "フルスクリーンを終了", // needs review
  rowsPerPage: "表示件数",
  paginationRange: (start, end, total) =>
    `${total.toLocaleString("ja")} 件中 ${start.toLocaleString("ja")}–${end.toLocaleString("ja")} 件`, // needs review
  goToFirstPage: "最初のページへ移動",
  goToPreviousPage: "前のページに移動",
  goToNextPage: "次のページへ移動",
  goToLastPage: "最後のページへ移動",
  goToPage: (page) => `${page.toLocaleString("ja")} ページへ移動`, // needs review
  rowActions: "行の操作",
  edit: "編集",
  save: "保存",
  cancel: "キャンセル",
  delete: "削除", // needs review
  create: "作成", // needs review
  createNewRow: "新しい行を作成", // needs review
  editRow: "行を編集", // needs review
  required: "必須", // needs review
  copy: "コピー",
  copied: "クリップボードにコピーしました",
  cellActions: "セルの操作", // needs review
  noRecordsToDisplay: "表示するレコードがありません",
  loading: "読み込み中…", // needs review
  loadingMore: "さらに読み込み中…", // needs review
  dragStart: (label) => `${label} を持ち上げました。`, // needs review
  dragOver: (label, over) => `${label} が ${over} の上にあります。`, // needs review
  dragEnd: (label, over) => `${label} を ${over} にドロップしました。`, // needs review
  dragCancel: (label) =>
    `ドラッグをキャンセルしました。${label} をドロップしました。`, // needs review
  dragInstructions:
    "項目を持ち上げるには、スペースキーまたは Enter キーを押します。ドラッグ中は矢印キーで移動できます。もう一度スペースキーまたは Enter キーを押すとドロップし、Esc キーを押すとキャンセルします。", // needs review
  dragRowLabel: (position) => `${position.toLocaleString("ja")} 行目`, // needs review
}
