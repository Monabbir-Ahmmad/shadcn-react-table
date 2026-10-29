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

export const dataTableLocalizationRu: DataTableLocalization = {
  language: "ru",
  selectAll: "Выбрать всё",
  selectRow: "Переключить выбор строки",
  clearSelection: "Очистить выбор",
  rowsSelected: (selected, total) =>
    `Выбрано строк: ${selected.toLocaleString("ru")} из ${total.toLocaleString("ru")}`, // needs review
  sortByColumnAsc: (column) => `Сортировать по ${column} по возрастанию`, // needs review
  sortByColumnDesc: (column) => `Сортировать по ${column} по убыванию`, // needs review
  sortAscending: "Сортировать по возрастанию", // needs review
  sortDescending: "Сортировать по убыванию", // needs review
  clearSort: "Очистить сортировку",
  sortedAscending: "Отсортировано по возрастанию", // needs review
  sortedDescending: "Отсортировано по убыванию", // needs review
  columnActions: "Действие колонки",
  hideColumn: "Скрыть колонку", // needs review
  showAllColumns: "Показать все колонки",
  pinToLeft: "Прикрепить слева",
  pinToRight: "Прикрепить справа",
  unpin: "Открепить",
  reorderColumn: "Двигать",
  reorderRow: "Двигать",
  pinRow: "Прикрепить строку", // needs review
  unpinRow: "Открепить строку", // needs review
  resizeColumn: "Изменить размер колонки", // needs review
  groupByColumn: (column) => `Сгруппировать по ${column}`, // needs review
  ungroupByColumn: (column) => `Разгруппировать по ${column}`,
  groupedBy: "Сгруппировано по", // needs review
  dropToGroupBy: "Перетащите колонку сюда, чтобы сгруппировать по ней", // needs review
  expand: "Раскрыть",
  collapse: "Свернуть",
  expandAll: "Раскрыть все",
  collapseAll: "Свернуть все",
  toggleRowExpanded: "Развернуть/свернуть строку", // needs review
  columnVisibility: "Показать/скрыть колонки",
  toggleColumnVisibility: "Изменить видимость",
  filterByColumn: (column) => `Отфильтровать по ${column}`,
  clearFilter: "Очистить фильтр",
  filterMode: "Режим фильтра", // needs review
  changeFilterMode: "Изменить режим фильтра",
  filterPlaceholder: (column) => `Фильтр: ${column}…`, // needs review
  showColumnFilters: "Показать фильтры", // needs review
  hideColumnFilters: "Скрыть фильтры", // needs review
  min: "Мин",
  max: "Макс",
  pickDate: "Выберите дату", // needs review
  pickDateRange: "Выберите диапазон дат", // needs review
  true: "Истина", // needs review
  false: "Ложь", // needs review
  filterModes: {
    fuzzy: "Физзи",
    contains: "Содержит",
    startsWith: "Начинается с",
    endsWith: "Оканчивается",
    equals: "Равны",
    notEquals: "Не равны",
    empty: "Пустой",
    notEmpty: "Не пустое",
    between: "Между",
    betweenInclusive: "Между включительно",
    greaterThan: "Больше чем",
    greaterThanOrEqualTo: "Больше или равно",
    lessThan: "Меньше чем",
    lessThanOrEqualTo: "Меньше или равно",
    before: "До", // needs review
    after: "После", // needs review
    betweenDates: "Между", // needs review
    equalsString: "Равны",
    arrIncludesSome: "Включить",
    equalsBool: "Равны",
  },
  advancedFilters: "Расширенные фильтры", // needs review
  advancedFiltersMatch: (logic) => `Применять ${logic} из следующих правил`, // needs review
  advancedFiltersMatchAll: "все", // needs review
  advancedFiltersMatchAny: "любое", // needs review
  advancedFiltersAddRule: "Добавить фильтр", // needs review
  advancedFiltersApply: "Применить", // needs review
  advancedFiltersClearAll: "Очистить всё", // needs review
  advancedFiltersColumn: "Колонка", // needs review
  advancedFiltersOperator: "Оператор", // needs review
  advancedFiltersValue: "Значение", // needs review
  advancedFiltersEmpty: "Фильтров пока нет. Добавьте первый, чтобы начать.", // needs review
  removeFilterRule: "Удалить фильтр", // needs review
  advancedFilterOperators: {
    contains: "Содержит",
    notContains: "не содержит", // needs review
    startsWith: "Начинается с",
    endsWith: "Оканчивается",
    equals: "Равны",
    notEquals: "Не равны",
    isEmpty: "Пустой",
    isNotEmpty: "Не пустое",
    greaterThan: "Больше чем",
    greaterThanOrEqual: "Больше или равно",
    lessThan: "Меньше чем",
    lessThanOrEqual: "Меньше или равно",
    between: "Между",
  },
  search: "Найти",
  searchPlaceholder: "Поиск…", // needs review
  clearSearch: "Очистить поиск",
  globalFilterMode: "Изменить режим поиска",
  toggleDensity: "Изменить плотность",
  densityComfortable: "Комфортная", // needs review
  densityCompact: "Компактная", // needs review
  densitySpacious: "Просторная", // needs review
  enterFullscreen: "Войти в полноэкранный режим", // needs review
  exitFullscreen: "Выйти из полноэкранного режима", // needs review
  rowsPerPage: "Строк на странице",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("ru")}–${end.toLocaleString("ru")} из ${total.toLocaleString("ru")}`, // needs review
  goToFirstPage: "Перейти на первую страницу",
  goToPreviousPage: "Перейти на предыдущую страницу",
  goToNextPage: "Перейти на следующую страницу",
  goToLastPage: "Перейти на последнюю страницу",
  goToPage: (page) => `Перейти на страницу ${page.toLocaleString("ru")}`, // needs review
  rowActions: "Действия строки",
  edit: "Редактировать",
  save: "Сохранить",
  cancel: "Отменить",
  delete: "Удалить", // needs review
  create: "Создать", // needs review
  createNewRow: "Создать новую строку", // needs review
  editRow: "Редактировать строку", // needs review
  required: "Обязательно", // needs review
  copy: "Копировать",
  copied: "Скопировано в буфер обмена",
  cellActions: "Действия с ячейкой", // needs review
  noRecordsToDisplay: "Нет записей для показа",
  loading: "Загрузка…", // needs review
  loadingMore: "Загрузка ещё…", // needs review
  dragStart: (label) => `Взято: ${label}.`, // needs review
  dragOver: (label, over) => `${label} находится над ${over}.`, // needs review
  dragEnd: (label, over) => `Отпущено на ${over}: ${label}.`, // needs review
  dragCancel: (label) => `Перетаскивание отменено. Отпущено: ${label}.`, // needs review
  dragInstructions:
    "Чтобы взять элемент, нажмите пробел или Enter. Во время перетаскивания перемещайте его клавишами со стрелками. Нажмите пробел или Enter ещё раз, чтобы отпустить элемент, или Escape, чтобы отменить.", // needs review
  dragRowLabel: (position) => `Строка ${position.toLocaleString("ru")}`, // needs review
  noResultsFound: "Результатов не найдено",
}
