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

export const dataTableLocalizationUk: DataTableLocalization = {
  language: "uk",
  selectAll: "Перемкнути вибір всіх",
  selectRow: "Перемкнути вибір рядка",
  clearSelection: "Скасувати вибір",
  rowsSelected: (selected, total) =>
    `Вибрано рядків: ${selected.toLocaleString("uk")} з ${total.toLocaleString("uk")}`, // needs review
  sortByColumnAsc: (column) => `Сортувати по ${column} за зростанням`, // needs review
  sortByColumnDesc: (column) => `Сортувати по ${column} за спаданням`, // needs review
  sortAscending: "Сортувати за зростанням", // needs review
  sortDescending: "Сортувати за спаданням", // needs review
  clearSort: "Очистити сортування",
  sortedAscending: "Відсортовано за зростанням", // needs review
  sortedDescending: "Відсортовано за спаданням", // needs review
  columnActions: "Дії стовпця",
  hideColumn: "Приховати стовпець", // needs review
  showAllColumns: "Показати всі стовпці",
  pinToLeft: "Закріпити ліворуч",
  pinToRight: "Закріпити праворуч",
  unpin: "Відкріпити",
  reorderColumn: "Перемістити",
  reorderRow: "Перемістити",
  pinRow: "Закріпити рядок", // needs review
  unpinRow: "Відкріпити рядок", // needs review
  resizeColumn: "Змінити розмір стовпця", // needs review
  groupByColumn: (column) => `Групувати по ${column}`, // needs review
  ungroupByColumn: (column) => `Розгрупувати по ${column}`,
  groupedBy: "Згруповано за", // needs review
  dropToGroupBy: "Перетягніть стовпець сюди, щоб групувати за ним", // needs review
  expand: "Розгорнути",
  collapse: "Згорнути",
  expandAll: "Розгорнути все",
  collapseAll: "Згорнути все",
  toggleRowExpanded: "Розгорнути/згорнути рядок", // needs review
  columnVisibility: "Показати/приховати стовпці",
  toggleColumnVisibility: "Перемкнути видимість",
  filterByColumn: (column) => `Фільтрувати по ${column}`,
  clearFilter: "Очистити фільтр",
  filterMode: "Режим фільтрації", // needs review
  changeFilterMode: "Змінити режим фільтрації",
  filterPlaceholder: (column) => `Фільтрувати ${column}…`, // needs review
  showColumnFilters: "Показати фільтри", // needs review
  hideColumnFilters: "Приховати фільтри", // needs review
  min: "Мін",
  max: "Макс",
  pickDate: "Виберіть дату", // needs review
  pickDateRange: "Виберіть діапазон дат", // needs review
  true: "Істина", // needs review
  false: "Хиба", // needs review
  filterModes: {
    fuzzy: "Нечіткий",
    contains: "Містить",
    startsWith: "Починається з",
    endsWith: "Закінчується на",
    equals: "Дорівнює",
    notEquals: "Не дорівнює",
    empty: "Порожній",
    notEmpty: "Не порожній",
    between: "Між",
    betweenInclusive: "Між, включно",
    greaterThan: "Більше ніж",
    greaterThanOrEqualTo: "Більше ніж або дорівнює",
    lessThan: "Менше ніж",
    lessThanOrEqualTo: "Менше ніж або дорівнює",
    before: "До", // needs review
    after: "Після", // needs review
    betweenDates: "Між", // needs review
    equalsString: "Дорівнює",
    arrIncludesSome: "Включає деякі",
    equalsBool: "Дорівнює",
  },
  advancedFilters: "Розширені фільтри", // needs review
  advancedFiltersMatchLabel: "Застосовувати", // needs review
  advancedFiltersMatchAll: "усі", // needs review
  advancedFiltersMatchAny: "будь-яке", // needs review
  advancedFiltersOf: "з наступних правил", // needs review
  advancedFiltersAddRule: "Додати фільтр", // needs review
  advancedFiltersApply: "Застосувати", // needs review
  advancedFiltersClearAll: "Очистити все", // needs review
  advancedFiltersColumn: "Стовпець", // needs review
  advancedFiltersOperator: "Оператор", // needs review
  advancedFiltersValue: "Значення", // needs review
  advancedFiltersEmpty: "Фільтрів ще немає. Додайте перший, щоб почати.", // needs review
  removeFilterRule: "Видалити фільтр", // needs review
  advancedFilterOperators: {
    contains: "Містить",
    notContains: "не містить", // needs review
    startsWith: "Починається з",
    endsWith: "Закінчується на",
    equals: "Дорівнює",
    notEquals: "Не дорівнює",
    isEmpty: "Порожній",
    isNotEmpty: "Не порожній",
    greaterThan: "Більше ніж",
    greaterThanOrEqual: "Більше ніж або дорівнює",
    lessThan: "Менше ніж",
    lessThanOrEqual: "Менше ніж або дорівнює",
    between: "Між",
  },
  search: "Пошук",
  searchPlaceholder: "Пошук…", // needs review
  clearSearch: "Очистити пошук",
  globalFilterMode: "Змінити режим пошуку",
  toggleDensity: "Перемкнути щільність",
  densityComfortable: "Комфортний", // needs review
  densityCompact: "Компактний", // needs review
  densitySpacious: "Просторий", // needs review
  enterFullscreen: "Увійти в повноекранний режим", // needs review
  exitFullscreen: "Вийти з повноекранного режиму", // needs review
  rowsPerPage: "Рядків на сторінці:",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("uk")}–${end.toLocaleString("uk")} з ${total.toLocaleString("uk")}`, // needs review
  goToFirstPage: "Перейти на першу сторінку",
  goToPreviousPage: "Перейти на попередню сторінку",
  goToNextPage: "Перейти на наступну сторінку",
  goToLastPage: "Перейти на останню сторінку",
  goToPage: (page) => `Перейти на сторінку ${page.toLocaleString("uk")}`, // needs review
  rowActions: "Дії рядка",
  edit: "Редагувати",
  save: "Зберегти",
  cancel: "Скасувати",
  delete: "Видалити", // needs review
  create: "Створити", // needs review
  createNewRow: "Створити новий рядок", // needs review
  editRow: "Редагувати рядок", // needs review
  required: "Обов’язково", // needs review
  copy: "Копіювати",
  copied: "Скопійовано до буферу обміну",
  cellActions: "Дії з коміркою", // needs review
  noRecordsToDisplay: "Немає записів для відображення",
  loading: "Завантаження…", // needs review
  loadingMore: "Завантаження ще…", // needs review
  dragStart: (label) => `Піднято: ${label}.`, // needs review
  dragOver: (label, over) => `${label} над ${over}.`, // needs review
  dragEnd: (label, over) => `${label} відпущено на ${over}.`, // needs review
  dragCancel: (label) => `Перетягування скасовано. ${label} відпущено.`, // needs review
  dragInstructions:
    "Щоб підняти елемент, натисніть пробіл або Enter. Під час перетягування переміщуйте його клавішами зі стрілками. Натисніть пробіл або Enter ще раз, щоб відпустити його, або Escape, щоб скасувати.", // needs review
  dragRowLabel: (position) => `Рядок ${position.toLocaleString("uk")}`, // needs review
}
