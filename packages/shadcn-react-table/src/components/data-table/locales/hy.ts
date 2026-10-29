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

export const dataTableLocalizationHy: DataTableLocalization = {
  language: "hy",
  selectAll: "Ընտրել բոլորը",
  selectRow: "Փոխել տողի ընտրությունը",
  clearSelection: "Մաքրել ընտրությունը",
  rowsSelected: (selected, total) =>
    `${total.toLocaleString("hy")} տողից ընտրված է ${selected.toLocaleString("hy")}`, // needs review
  sortByColumnAsc: (column) => `Տեսակավորել ${column} ըստ աճման`, // needs review
  sortByColumnDesc: (column) => `Տեսակավորել ${column} ըստ նվազման`, // needs review
  sortAscending: "Տեսակավորել աճման կարգով", // needs review
  sortDescending: "Տեսակավորել նվազման կարգով", // needs review
  clearSort: "Մաքրել տեսակավորումը",
  sortedAscending: "Տեսակավորված է աճման կարգով", // needs review
  sortedDescending: "Տեսակավորված է նվազման կարգով", // needs review
  columnActions: "Սյունակի գործողություն",
  hideColumn: "Թաքցնել սյունակը", // needs review
  showAllColumns: "Ցույց տալ բոլոր սյունակները",
  pinToLeft: "Կցել ձախից",
  pinToRight: "Կցել աջից",
  unpin: "Ապակցել",
  reorderColumn: "Շարժել",
  reorderRow: "Շարժել",
  pinRow: "Կցել տողը", // needs review
  unpinRow: "Ապակցել տողը", // needs review
  resizeColumn: "Փոխել սյունակի չափը", // needs review
  groupByColumn: (column) => `Խմբավորել ըստ ${column}`, // needs review
  ungroupByColumn: (column) => `Խմբավորել ըստ ${column}`,
  groupedBy: "Խմբավորված է ըստ", // needs review
  dropToGroupBy: "Քաշեք սյունակն այստեղ՝ ըստ դրա խմբավորելու համար", // needs review
  expand: "Բացել",
  collapse: "Փոքրացնել",
  expandAll: "Բացել բոլորը",
  collapseAll: "Փոքրացնել բոլորը",
  toggleRowExpanded: "Բացել/փակել տողը", // needs review
  columnVisibility: "Ցույց տալ/թաքցնել սյունակները",
  toggleColumnVisibility: "Փոխել տեսանելիությունը",
  filterByColumn: (column) => `Զտել ըստ ${column}`,
  clearFilter: "Մաքրել զտիչը",
  filterMode: "Զտիչի ռեժիմ", // needs review
  changeFilterMode: "Փոխել զտիչի ռեժիմը",
  filterPlaceholder: (column) => `Զտել ${column}…`, // needs review
  showColumnFilters: "Ցույց տալ զտիչները", // needs review
  hideColumnFilters: "Թաքցնել զտիչները", // needs review
  min: "Նվզ",
  max: "Առվ",
  pickDate: "Ընտրել ամսաթիվ", // needs review
  pickDateRange: "Ընտրել ամսաթվերի միջակայք", // needs review
  true: "Ճշմարիտ", // needs review
  false: "Կեղծ", // needs review
  filterModes: {
    fuzzy: "Ֆազզի",
    contains: "Պարունակում է",
    startsWith: "Սկսվում է ...-ից",
    endsWith: "Ավարտվում է",
    equals: "Հավասար են",
    notEquals: "Հավասար չեն",
    empty: "Դատարկ է",
    notEmpty: "Դատարկ չէ",
    between: "Միջև",
    betweenInclusive: "Միջև ներառյալ",
    greaterThan: "Ավել է քան",
    greaterThanOrEqualTo: "Ավել է կամ հավասար է",
    lessThan: "Փոքր է քան",
    lessThanOrEqualTo: "Զտիչի ռեժիմ",
    before: "Մինչև", // needs review
    after: "Հետո", // needs review
    betweenDates: "Միջև", // needs review
    equalsString: "Հավասար են",
    arrIncludesSome: "Միացնել",
    equalsBool: "Հավասար են",
  },
  advancedFilters: "Ընդլայնված զտիչներ", // needs review
  advancedFiltersMatch: (logic) => `Համապատասխանել ${logic} հետևյալ կանոններին`, // needs review
  advancedFiltersMatchAll: "բոլոր", // needs review
  advancedFiltersMatchAny: "ցանկացած", // needs review
  advancedFiltersAddRule: "Ավելացնել զտիչ", // needs review
  advancedFiltersApply: "Կիրառել", // needs review
  advancedFiltersClearAll: "Մաքրել բոլորը", // needs review
  advancedFiltersColumn: "Սյունակ", // needs review
  advancedFiltersOperator: "Օպերատոր", // needs review
  advancedFiltersValue: "Արժեք", // needs review
  advancedFiltersEmpty: "Զտիչներ դեռ չկան։ Ավելացրեք մեկը՝ սկսելու համար։", // needs review
  removeFilterRule: "Հեռացնել զտիչը", // needs review
  advancedFilterOperators: {
    contains: "Պարունակում է",
    notContains: "չի պարունակում", // needs review
    startsWith: "Սկսվում է ...-ից",
    endsWith: "Ավարտվում է",
    equals: "Հավասար են",
    notEquals: "Հավասար չեն",
    isEmpty: "Դատարկ է",
    isNotEmpty: "Դատարկ չէ",
    greaterThan: "Ավել է քան",
    greaterThanOrEqual: "Ավել է կամ հավասար է",
    lessThan: "Փոքր է քան",
    lessThanOrEqual: "Զտիչի ռեժիմ",
    between: "Միջև",
  },
  search: "Գտնել",
  searchPlaceholder: "Որոնել…", // needs review
  clearSearch: "Մաքրել որոնումը",
  globalFilterMode: "Փոխել որոնման ռեժիմը",
  toggleDensity: "Փոխել խտությունը",
  densityComfortable: "Հարմարավետ", // needs review
  densityCompact: "Կոմպակտ", // needs review
  densitySpacious: "Ընդարձակ", // needs review
  enterFullscreen: "Մտնել ամբողջ էկրանի ռեժիմ", // needs review
  exitFullscreen: "Դուրս գալ ամբողջ էկրանի ռեժիմից", // needs review
  rowsPerPage: "Տողեր էջում",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("hy")}–${end.toLocaleString("hy")}՝ ${total.toLocaleString("hy")}-ից`, // needs review
  goToFirstPage: "Անցնել առաջին էջ",
  goToPreviousPage: "Անցնել նախորդ էջ",
  goToNextPage: "Անցնել հաջորդ էջ",
  goToLastPage: "Անցնել վերջին էջ",
  goToPage: (page) => `Անցնել էջ ${page.toLocaleString("hy")}`, // needs review
  rowActions: "Տողի գործողությունները",
  edit: "Խմբագրել",
  save: "Պահպանել",
  cancel: "Չեղարկել",
  delete: "Ջնջել", // needs review
  create: "Ստեղծել", // needs review
  createNewRow: "Ստեղծել նոր տող", // needs review
  editRow: "Խմբագրել տողը", // needs review
  required: "Պարտադիր", // needs review
  copy: "Պատճենել",
  copied: "Պատճենվել է փոխանակման բուֆերում",
  cellActions: "Բջջի գործողություններ", // needs review
  noRecordsToDisplay: "Ցուցադրման համար գրառումներ չկան",
  loading: "Բեռնվում է…", // needs review
  loadingMore: "Բեռնվում է ավելին…", // needs review
  dragStart: (label) => `Վերցվեց՝ ${label}։`, // needs review
  dragOver: (label, over) => `${label}՝ գտնվում է հետևյալի վրա՝ ${over}։`, // needs review
  dragEnd: (label, over) => `${label}՝ տեղադրվեց հետևյալի վրա՝ ${over}։`, // needs review
  dragCancel: (label) => `Քաշումը չեղարկվեց։ Տեղադրվեց՝ ${label}։`, // needs review
  dragInstructions:
    "Տարրը վերցնելու համար սեղմեք բացատի կամ Enter ստեղնը։ Քաշելիս օգտագործեք սլաքների ստեղները՝ այն տեղափոխելու համար։ Կրկին սեղմեք բացատի կամ Enter ստեղնը՝ այն թողնելու համար, կամ Escape՝ չեղարկելու համար։", // needs review
  dragRowLabel: (position) => `Տող ${position.toLocaleString("hy")}`, // needs review
}
