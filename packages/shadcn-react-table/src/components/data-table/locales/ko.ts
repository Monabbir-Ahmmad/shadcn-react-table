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

export const dataTableLocalizationKo: DataTableLocalization = {
  language: "ko",
  selectAll: "전체 선택",
  selectRow: "행 선택",
  clearSelection: "선택 초기화",
  rowsSelected: (selected, total) =>
    `${total.toLocaleString("ko")} 행 중 ${selected.toLocaleString("ko")} 행 선택됨`, // needs review
  sortByColumnAsc: (column) => `${column} 오름차순 정렬`, // needs review
  sortByColumnDesc: (column) => `${column} 내림차순 정렬`, // needs review
  sortAscending: "오름차순 정렬", // needs review
  sortDescending: "내림차순 정렬", // needs review
  clearSort: "정렬 초기화",
  sortedAscending: "오름차순 정렬됨", // needs review
  sortedDescending: "내림차순 정렬됨", // needs review
  columnActions: "열 동작",
  hideColumn: "열 숨기기", // needs review
  showAllColumns: "모든 열 보이기",
  pinToLeft: "왼쪽에 고정",
  pinToRight: "오른쪽에 고정",
  unpin: "고정 해제",
  reorderColumn: "이동",
  reorderRow: "이동",
  pinRow: "행 고정", // needs review
  unpinRow: "행 고정 해제", // needs review
  resizeColumn: "열 크기 조정", // needs review
  groupByColumn: (column) => `${column} 그룹화`, // needs review
  ungroupByColumn: (column) => `${column} 그룹 해제`,
  groupedBy: "그룹화 기준", // needs review
  dropToGroupBy: "열을 여기로 끌어 그룹화", // needs review
  expand: "행 확장",
  collapse: "행 접기",
  expandAll: "전체 확장",
  collapseAll: "전체 접기",
  toggleRowExpanded: "행 펼치기/접기", // needs review
  columnVisibility: "열 숨기기/보이기",
  toggleColumnVisibility: "숨기기/보이기",
  filterByColumn: (column) => `${column} 필터링`,
  clearFilter: "필터 초기화",
  filterMode: "필터 모드", // needs review
  changeFilterMode: "필터 모드 변경",
  filterPlaceholder: (column) => `${column} 필터링…`, // needs review
  showColumnFilters: "필터 보이기", // needs review
  hideColumnFilters: "필터 숨기기", // needs review
  min: "최소",
  max: "최대",
  pickDate: "날짜 선택", // needs review
  pickDateRange: "날짜 범위 선택", // needs review
  true: "참", // needs review
  false: "거짓", // needs review
  filterModes: {
    fuzzy: "퍼지",
    contains: "포함",
    startsWith: "시작 단어",
    endsWith: "끝 단어",
    equals: "같음",
    notEquals: "같지 않음",
    empty: "비어있는 셀",
    notEmpty: "비어있지 않은 셀",
    between: "사이(필터 값 제외)",
    betweenInclusive: "사이(필터 값 포함)",
    greaterThan: "보다 큼",
    greaterThanOrEqualTo: "보다 크거나 같음",
    lessThan: "보다 작음",
    lessThanOrEqualTo: "보다 작거나 같음",
    before: "이전", // needs review
    after: "이후", // needs review
    betweenDates: "사이", // needs review
    equalsString: "같음",
    arrIncludesSome: "포함",
    equalsBool: "같음",
  },
  advancedFilters: "고급 필터", // needs review
  advancedFiltersMatch: (logic) => `다음 규칙 중 ${logic} 일치`, // needs review
  advancedFiltersMatchAll: "모두", // needs review
  advancedFiltersMatchAny: "하나라도", // needs review
  advancedFiltersAddRule: "필터 추가", // needs review
  advancedFiltersApply: "적용", // needs review
  advancedFiltersClearAll: "모두 지우기", // needs review
  advancedFiltersColumn: "열", // needs review
  advancedFiltersOperator: "연산자", // needs review
  advancedFiltersValue: "값", // needs review
  advancedFiltersEmpty: "필터가 없습니다. 필터를 추가해 시작하세요.", // needs review
  removeFilterRule: "필터 제거", // needs review
  advancedFilterOperators: {
    contains: "포함",
    notContains: "포함하지 않음", // needs review
    startsWith: "시작 단어",
    endsWith: "끝 단어",
    equals: "같음",
    notEquals: "같지 않음",
    isEmpty: "비어있는 셀",
    isNotEmpty: "비어있지 않은 셀",
    greaterThan: "보다 큼",
    greaterThanOrEqual: "보다 크거나 같음",
    lessThan: "보다 작음",
    lessThanOrEqual: "보다 작거나 같음",
    between: "사이(필터 값 제외)",
  },
  search: "검색",
  searchPlaceholder: "검색…", // needs review
  clearSearch: "검색 초기화",
  globalFilterMode: "검색 모드 변경",
  toggleDensity: "행 높이 조정",
  densityComfortable: "편안하게", // needs review
  densityCompact: "촘촘하게", // needs review
  densitySpacious: "넓게", // needs review
  enterFullscreen: "전체 화면으로 전환", // needs review
  exitFullscreen: "전체 화면 종료", // needs review
  rowsPerPage: "페이지 당 행 수",
  paginationRange: (start, end, total) =>
    `${total.toLocaleString("ko")} 중 ${start.toLocaleString("ko")}–${end.toLocaleString("ko")}`, // needs review
  goToFirstPage: "첫 페이지",
  goToPreviousPage: "이전 페이지",
  goToNextPage: "다음 페이지",
  goToLastPage: "마지막 페이지",
  goToPage: (page) => `${page.toLocaleString("ko")} 페이지로 이동`, // needs review
  rowActions: "행 동작",
  edit: "편집",
  save: "저장",
  cancel: "취소",
  delete: "삭제", // needs review
  create: "생성", // needs review
  createNewRow: "새 행 생성", // needs review
  editRow: "행 편집", // needs review
  required: "필수", // needs review
  copy: "복사",
  copied: "클립보드에 복사됨",
  cellActions: "셀 동작", // needs review
  noRecordsToDisplay: "표시할 데이터가 없습니다.",
  loading: "로딩 중…", // needs review
  loadingMore: "더 불러오는 중…", // needs review
  dragStart: (label) => `${label}을(를) 집었습니다.`, // needs review
  dragOver: (label, over) => `${label}이(가) ${over} 위에 있습니다.`, // needs review
  dragEnd: (label, over) => `${label}을(를) ${over}에 놓았습니다.`, // needs review
  dragCancel: (label) => `드래그가 취소되었습니다. ${label}을(를) 놓았습니다.`, // needs review
  dragInstructions:
    "항목을 집으려면 스페이스바 또는 Enter 키를 누르세요. 드래그하는 동안 화살표 키로 이동할 수 있습니다. 스페이스바 또는 Enter 키를 다시 누르면 놓고, Esc 키를 누르면 취소합니다.", // needs review
  dragRowLabel: (position) => `${position.toLocaleString("ko")}번째 행`, // needs review
}
