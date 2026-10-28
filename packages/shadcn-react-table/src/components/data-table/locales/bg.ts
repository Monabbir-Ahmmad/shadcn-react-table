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

export const dataTableLocalizationBg: DataTableLocalization = {
  language: "bg",
  selectAll: "Превключване на избора на всички",
  selectRow: "Превключване на избора на ред",
  clearSelection: "Изчисти избора",
  rowsSelected: (selected, total) =>
    `Избрани ${selected.toLocaleString("bg")} от ${total.toLocaleString("bg")} реда`, // needs review
  sortByColumnAsc: (column) => `Сортиране по ${column} във възходящ ред`, // needs review
  sortByColumnDesc: (column) => `Сортиране по ${column} в низходящ ред`, // needs review
  sortAscending: "Сортиране във възходящ ред", // needs review
  sortDescending: "Сортиране в низходящ ред", // needs review
  clearSort: "Изчисти сортирането",
  sortedAscending: "Сортирано във възходящ ред", // needs review
  sortedDescending: "Сортирано в низходящ ред", // needs review
  columnActions: "Действия за колони",
  hideColumn: "Скрий колоната", // needs review
  showAllColumns: "Покажи всички колони",
  pinToLeft: "Закачи отляво",
  pinToRight: "Закачи отдясно",
  unpin: "Откачи",
  reorderColumn: "Премести",
  reorderRow: "Премести",
  pinRow: "Закачи реда", // needs review
  unpinRow: "Откачи реда", // needs review
  resizeColumn: "Промени размера на колоната", // needs review
  groupByColumn: (column) => `Групиране по ${column}`, // needs review
  ungroupByColumn: (column) => `Разгрупиране по ${column}`,
  groupedBy: "Групирано по", // needs review
  dropToGroupBy: "Плъзнете колона тук, за да групирате по нея", // needs review
  expand: "Разшири",
  collapse: "Свий",
  expandAll: "Разшири всички",
  collapseAll: "Свий всички",
  toggleRowExpanded: "Разгъни/свий реда", // needs review
  columnVisibility: "Покажи/Скрий колони",
  toggleColumnVisibility: "Превключване на видимостта",
  filterByColumn: (column) => `Филтриране по ${column}`,
  clearFilter: "Изчисти филтъра",
  filterMode: "Режим на филтъра", // needs review
  changeFilterMode: "Промяна на режима на филтъра",
  filterPlaceholder: (column) => `Филтриране по ${column}…`, // needs review
  showColumnFilters: "Покажи филтрите", // needs review
  hideColumnFilters: "Скрий филтрите", // needs review
  min: "Мин.",
  max: "Макс.",
  pickDate: "Изберете дата", // needs review
  pickDateRange: "Изберете период", // needs review
  true: "Вярно", // needs review
  false: "Невярно", // needs review
  filterModes: {
    fuzzy: "Размито",
    contains: "Съдържа",
    startsWith: "Започва с",
    endsWith: "Завършва с",
    equals: "Равно",
    notEquals: "Различно",
    empty: "Празно",
    notEmpty: "Не е празно",
    between: "Между",
    betweenInclusive: "Между включително",
    greaterThan: "По-голямо от",
    greaterThanOrEqualTo: "По-голямо или равно на",
    lessThan: "По-малко от",
    lessThanOrEqualTo: "По-малко или равно на",
    before: "Преди", // needs review
    after: "След", // needs review
    betweenDates: "Между", // needs review
    equalsString: "Равно",
    arrIncludesSome: "Съдържа",
    equalsBool: "Равно",
  },
  advancedFilters: "Разширени филтри", // needs review
  advancedFiltersMatchLabel: "Съвпадение", // needs review
  advancedFiltersMatchAll: "Всички", // needs review
  advancedFiltersMatchAny: "Някое", // needs review
  advancedFiltersOf: "от следните правила", // needs review
  advancedFiltersAddRule: "Добави филтър", // needs review
  advancedFiltersApply: "Приложи", // needs review
  advancedFiltersClearAll: "Изчисти всички", // needs review
  advancedFiltersColumn: "Колона", // needs review
  advancedFiltersOperator: "Оператор", // needs review
  advancedFiltersValue: "Стойност", // needs review
  advancedFiltersEmpty: "Все още няма филтри. Добавете един, за да започнете.", // needs review
  removeFilterRule: "Премахни филтъра", // needs review
  advancedFilterOperators: {
    contains: "Съдържа",
    notContains: "не съдържа", // needs review
    startsWith: "Започва с",
    endsWith: "Завършва с",
    equals: "Равно",
    notEquals: "Различно",
    isEmpty: "Празно",
    isNotEmpty: "Не е празно",
    greaterThan: "По-голямо от",
    greaterThanOrEqual: "По-голямо или равно на",
    lessThan: "По-малко от",
    lessThanOrEqual: "По-малко или равно на",
    between: "Между",
  },
  search: "Търси",
  searchPlaceholder: "Търсене…", // needs review
  clearSearch: "Изчисти търсенето",
  globalFilterMode: "Промяна на режима на търсене",
  toggleDensity: "Превключване на плътността",
  densityComfortable: "Удобно", // needs review
  densityCompact: "Компактно", // needs review
  densitySpacious: "Просторно", // needs review
  enterFullscreen: "Включи цял екран", // needs review
  exitFullscreen: "Изключи цял екран", // needs review
  rowsPerPage: "Редове на страница",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("bg")}–${end.toLocaleString("bg")} от ${total.toLocaleString("bg")}`, // needs review
  goToFirstPage: "Към първа страница",
  goToPreviousPage: "Към предишна страница",
  goToNextPage: "Към следваща страница",
  goToLastPage: "Към последна страница",
  goToPage: (page) => `Към страница ${page.toLocaleString("bg")}`, // needs review
  rowActions: "Действия за редове",
  edit: "Редактирай",
  save: "Запази",
  cancel: "Отказ",
  delete: "Изтрий", // needs review
  create: "Създай", // needs review
  createNewRow: "Създай нов ред", // needs review
  editRow: "Редактирай реда", // needs review
  required: "Задължително", // needs review
  copy: "Копирай",
  copied: "Копирано в клипборда",
  cellActions: "Действия за клетката", // needs review
  noRecordsToDisplay: "Няма записи за показване",
  loading: "Зареждане…", // needs review
  loadingMore: "Зареждане на още…", // needs review
  dragStart: (label) => `Вдигнахте ${label}.`, // needs review
  dragOver: (label, over) => `${label} е над ${over}.`, // needs review
  dragEnd: (label, over) => `Пуснахте ${label} върху ${over}.`, // needs review
  dragCancel: (label) => `Плъзгането беше отказано. Пуснахте ${label}.`, // needs review
  dragInstructions:
    "За да вдигнете елемент, натиснете интервал или Enter. Докато го влачите, използвайте клавишите със стрелки, за да го преместите. Натиснете отново интервал или Enter, за да го пуснете, или Escape за отказ.", // needs review
  dragRowLabel: (position) => `Ред ${position.toLocaleString("bg")}`, // needs review
}
