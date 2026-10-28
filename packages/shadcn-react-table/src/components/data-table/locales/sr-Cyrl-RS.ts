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

export const dataTableLocalizationSrCyrlRS: DataTableLocalization = {
  language: "sr-Cyrl-RS",
  selectAll: "Означи/одзначи све редове",
  selectRow: "Означи/одзначи ред",
  clearSelection: "Поништи избор",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("sr-Cyrl-RS")} од ${total.toLocaleString("sr-Cyrl-RS")} редова означено`, // needs review
  sortByColumnAsc: (column) => `Сортирај по ${column} растуће`, // needs review
  sortByColumnDesc: (column) => `Сортирај по ${column} опадајуће`, // needs review
  sortAscending: "Сортирај растуће", // needs review
  sortDescending: "Сортирај опадајуће", // needs review
  clearSort: "Поништи сортирање",
  sortedAscending: "Сортирано растуће", // needs review
  sortedDescending: "Сортирано опадајуће", // needs review
  columnActions: "Акције над колонама",
  hideColumn: "Сакриј колону", // needs review
  showAllColumns: "Прикажи све колоне",
  pinToLeft: "Закачи лево",
  pinToRight: "Закачи десно",
  unpin: "Откачи",
  reorderColumn: "Помери",
  reorderRow: "Помери",
  pinRow: "Закачи ред", // needs review
  unpinRow: "Откачи ред", // needs review
  resizeColumn: "Промени ширину колоне", // needs review
  groupByColumn: (column) => `Групиши по ${column}`, // needs review
  ungroupByColumn: (column) => `Одгрупиши по ${column}`,
  groupedBy: "Груписано по", // needs review
  dropToGroupBy: "Превуци колону овде да групишеш по њој", // needs review
  expand: "Прошири",
  collapse: "Рашири",
  expandAll: "Прошири све",
  collapseAll: "Рашири све",
  toggleRowExpanded: "Прошири/скупи ред", // needs review
  columnVisibility: "Прикажи/сакриј колоне",
  toggleColumnVisibility: "Укључи/искључи видљивост",
  filterByColumn: (column) => `Филтрирај по ${column}`,
  clearFilter: "Поништи филтер",
  filterMode: "Режим филтрирања", // needs review
  changeFilterMode: "Промени режим филтрирања",
  filterPlaceholder: (column) => `Филтрирај ${column}…`, // needs review
  showColumnFilters: "Прикажи филтере", // needs review
  hideColumnFilters: "Сакриј филтере", // needs review
  min: "Мин",
  max: "Макс",
  pickDate: "Изабери датум", // needs review
  pickDateRange: "Изабери опсег датума", // needs review
  true: "Тачно", // needs review
  false: "Нетачно", // needs review
  filterModes: {
    fuzzy: "Фази",
    contains: "Садржи",
    startsWith: "Почиње са",
    endsWith: "Завршава се на",
    equals: "Једнако",
    notEquals: "Није једнако",
    empty: "Празно",
    notEmpty: "Није празно",
    between: "Између",
    betweenInclusive: "Инклузивно између",
    greaterThan: "Веће",
    greaterThanOrEqualTo: "Веће или једнако",
    lessThan: "Мање",
    lessThanOrEqualTo: "Мање или једнако",
    before: "Пре", // needs review
    after: "После", // needs review
    betweenDates: "Између", // needs review
    equalsString: "Једнако",
    arrIncludesSome: "Укључује",
    equalsBool: "Једнако",
  },
  advancedFilters: "Напредни филтери", // needs review
  advancedFiltersMatchLabel: "Поклапање", // needs review
  advancedFiltersMatchAll: "Сва", // needs review
  advancedFiltersMatchAny: "Било које", // needs review
  advancedFiltersOf: "од следећих правила", // needs review
  advancedFiltersAddRule: "Додај филтер", // needs review
  advancedFiltersApply: "Примени", // needs review
  advancedFiltersClearAll: "Поништи све", // needs review
  advancedFiltersColumn: "Колона", // needs review
  advancedFiltersOperator: "Оператор", // needs review
  advancedFiltersValue: "Вредност", // needs review
  advancedFiltersEmpty: "Још нема филтера. Додај један да почнеш.", // needs review
  removeFilterRule: "Уклони филтер", // needs review
  advancedFilterOperators: {
    contains: "Садржи",
    notContains: "не садржи", // needs review
    startsWith: "Почиње са",
    endsWith: "Завршава се на",
    equals: "Једнако",
    notEquals: "Није једнако",
    isEmpty: "Празно",
    isNotEmpty: "Није празно",
    greaterThan: "Веће",
    greaterThanOrEqual: "Веће или једнако",
    lessThan: "Мање",
    lessThanOrEqual: "Мање или једнако",
    between: "Између",
  },
  search: "Претражи",
  searchPlaceholder: "Претражи…", // needs review
  clearSearch: "Поништи претрагу",
  globalFilterMode: "Промени режим претраге",
  toggleDensity: "Подеси густину",
  densityComfortable: "Удобно", // needs review
  densityCompact: "Компактно", // needs review
  densitySpacious: "Пространо", // needs review
  enterFullscreen: "Укључи цео екран", // needs review
  exitFullscreen: "Искључи цео екран", // needs review
  rowsPerPage: "Редова по страници",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("sr-Cyrl-RS")}–${end.toLocaleString("sr-Cyrl-RS")} од ${total.toLocaleString("sr-Cyrl-RS")}`, // needs review
  goToFirstPage: "Иди на прву страницу",
  goToPreviousPage: "Иди на прошлу страницу",
  goToNextPage: "Иди на следећу страницу",
  goToLastPage: "Иди на последњу страницу",
  goToPage: (page) => `Иди на страницу ${page.toLocaleString("sr-Cyrl-RS")}`, // needs review
  rowActions: "Акције над редовима",
  edit: "Измени",
  save: "Сними",
  cancel: "Откажи",
  delete: "Обриши", // needs review
  create: "Направи", // needs review
  createNewRow: "Направи нови ред", // needs review
  editRow: "Измени ред", // needs review
  required: "Обавезно", // needs review
  copy: "Копирај",
  copied: "Копирани у clipboard",
  cellActions: "Акције ћелије", // needs review
  noRecordsToDisplay: "Нема редова за приказ",
  loading: "Учитавање…", // needs review
  loadingMore: "Учитавање још…", // needs review
  dragStart: (label) => `Подигнуто: ${label}.`, // needs review
  dragOver: (label, over) => `${label} је изнад ${over}.`, // needs review
  dragEnd: (label, over) => `Пуштено на ${over}: ${label}.`, // needs review
  dragCancel: (label) => `Превлачење је отказано. Пуштено: ${label}.`, // needs review
  dragInstructions:
    "Да подигнеш ставку, притисни размакницу или Enter. Током превлачења користи тастере са стрелицама да је помериш. Поново притисни размакницу или Enter да је пустиш, или притисни Escape да откажеш.", // needs review
  dragRowLabel: (position) => `Ред ${position.toLocaleString("sr-Cyrl-RS")}`, // needs review
}
