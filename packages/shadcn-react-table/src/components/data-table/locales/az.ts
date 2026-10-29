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

export const dataTableLocalizationAz: DataTableLocalization = {
  language: "az",
  selectAll: "Hamısını Seç",
  selectRow: "Sətir Seç",
  clearSelection: "Seçimi təmizlə",
  rowsSelected: (selected, total) =>
    `${total.toLocaleString("az")} sətirdən ${selected.toLocaleString("az")} seçildi`, // needs review
  sortByColumnAsc: (column) => `${column} üzrə artan sırala`, // needs review
  sortByColumnDesc: (column) => `${column} üzrə azalan sırala`, // needs review
  sortAscending: "Artan sırala", // needs review
  sortDescending: "Azalan sırala", // needs review
  clearSort: "Sıralamanı sıfırla",
  sortedAscending: "Artan sıralanıb", // needs review
  sortedDescending: "Azalan sıralanıb", // needs review
  columnActions: "Sütun Əməliyyatları",
  hideColumn: "Sütunu gizlə", // needs review
  showAllColumns: "Bütün Sütunları Göstər",
  pinToLeft: "Sola Sabitlə",
  pinToRight: "Sağa Sabitlə",
  unpin: "Ayır",
  reorderColumn: "Daşı",
  reorderRow: "Daşı",
  pinRow: "Sətri sabitlə", // needs review
  unpinRow: "Sətri ayır", // needs review
  resizeColumn: "Sütunun ölçüsünü dəyiş", // needs review
  groupByColumn: (column) => `${column} üzrə qruplandır`, // needs review
  ungroupByColumn: (column) => `${column} Sütununu Ayır`,
  groupedBy: "Qruplandırılıb", // needs review
  dropToGroupBy: "Qruplandırmaq üçün sütunu bura sürüşdürün", // needs review
  expand: "Genişlət",
  collapse: "Daralt",
  expandAll: "Hamısını Genişlət",
  collapseAll: "Hamısını Daralt",
  toggleRowExpanded: "Sətri genişləndir/yığ", // needs review
  columnVisibility: "Sütunları Göstər/Gizlə",
  toggleColumnVisibility: "Görünməni Dəyiş",
  filterByColumn: (column) => `${column} Filteri`,
  clearFilter: "Filteri təmizlə",
  filterMode: "Filter rejimi", // needs review
  changeFilterMode: "Filter Rejimini Dəyiş",
  filterPlaceholder: (column) => `${column} filtri…`, // needs review
  showColumnFilters: "Filterləri göstər", // needs review
  hideColumnFilters: "Filterləri gizlə", // needs review
  min: "Minimum",
  max: "Maksimum",
  pickDate: "Tarix seçin", // needs review
  pickDateRange: "Tarix aralığı seçin", // needs review
  true: "Doğru", // needs review
  false: "Yanlış", // needs review
  filterModes: {
    fuzzy: "Təxmini",
    contains: "Daxildir",
    startsWith: "Başlanğıcı",
    endsWith: "Sonu",
    equals: "Bərabər",
    notEquals: "Bərabər Deyil",
    empty: "Boş",
    notEmpty: "Boş Deyil",
    between: "Arasında",
    betweenInclusive: "Daxildir Arasında",
    greaterThan: "Böyükdür",
    greaterThanOrEqualTo: "Böyük Bərabərdir",
    lessThan: "Kiçikdir",
    lessThanOrEqualTo: "Kiçik Bərabərdir",
    before: "Əvvəl", // needs review
    after: "Sonra", // needs review
    betweenDates: "Arasında", // needs review
    equalsString: "Bərabər",
    arrIncludesSome: "Daxildir",
    equalsBool: "Bərabər",
  },
  advancedFilters: "Qabaqcıl filterlər", // needs review
  advancedFiltersMatch: (logic) => `Aşağıdakı qaydaların ${logic} uyğun gəlsin`, // needs review
  advancedFiltersMatchAll: "hamısı", // needs review
  advancedFiltersMatchAny: "istənilən biri", // needs review
  advancedFiltersAddRule: "Filter əlavə et", // needs review
  advancedFiltersApply: "Tətbiq et", // needs review
  advancedFiltersClearAll: "Hamısını təmizlə", // needs review
  advancedFiltersColumn: "Sütun", // needs review
  advancedFiltersOperator: "Operator", // needs review
  advancedFiltersValue: "Dəyər", // needs review
  advancedFiltersEmpty: "Hələ filter yoxdur. Başlamaq üçün birini əlavə edin.", // needs review
  removeFilterRule: "Filteri sil", // needs review
  advancedFilterOperators: {
    contains: "Daxildir",
    notContains: "ehtiva etmir", // needs review
    startsWith: "Başlanğıcı",
    endsWith: "Sonu",
    equals: "Bərabər",
    notEquals: "Bərabər Deyil",
    isEmpty: "Boş",
    isNotEmpty: "Boş Deyil",
    greaterThan: "Böyükdür",
    greaterThanOrEqual: "Böyük Bərabərdir",
    lessThan: "Kiçikdir",
    lessThanOrEqual: "Kiçik Bərabərdir",
    between: "Arasında",
  },
  search: "Axtar",
  searchPlaceholder: "Axtar…", // needs review
  clearSearch: "Axtarışı təmizlə",
  globalFilterMode: "Axtarış Rejimini Dəyiş",
  toggleDensity: "Sıxlığı Dəyiş",
  densityComfortable: "Rahat", // needs review
  densityCompact: "Yığcam", // needs review
  densitySpacious: "Geniş", // needs review
  enterFullscreen: "Tam ekrana keç", // needs review
  exitFullscreen: "Tam ekrandan çıx", // needs review
  rowsPerPage: "Səhifə Başına Sətirlər",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("az")}–${end.toLocaleString("az")} / ${total.toLocaleString("az")}`, // needs review
  goToFirstPage: "İlk Səhifəyə Get",
  goToPreviousPage: "Əvvəlki Səhifəyə Get",
  goToNextPage: "Sonrakı Səhifəyə Get",
  goToLastPage: "Son Səhifəyə Get",
  goToPage: (page) => `Səhifəyə get: ${page.toLocaleString("az")}`, // needs review
  rowActions: "Sətir Əməliyyatları",
  edit: "Düzəliş Et",
  save: "Yadda Saxla",
  cancel: "Ləğv Et",
  delete: "Sil", // needs review
  create: "Yarat", // needs review
  createNewRow: "Yeni sətir yarat", // needs review
  editRow: "Sətrə düzəliş et", // needs review
  required: "Tələb olunur", // needs review
  copy: "Köçür",
  copied: "Panelə Köçürüldü",
  cellActions: "Xana əməliyyatları", // needs review
  noRecordsToDisplay: "Göstəriləcək Qeyd Yoxdur",
  loading: "Yüklənir…", // needs review
  loadingMore: "Daha çoxu yüklənir…", // needs review
  dragStart: (label) => `${label} götürüldü.`, // needs review
  dragOver: (label, over) => `${label}, ${over} üzərindədir.`, // needs review
  dragEnd: (label, over) => `${label}, ${over} üzərinə buraxıldı.`, // needs review
  dragCancel: (label) => `Sürüşdürmə ləğv edildi. ${label} buraxıldı.`, // needs review
  dragInstructions:
    "Elementi götürmək üçün Space və ya Enter düyməsini basın. Sürüşdürərkən onu hərəkət etdirmək üçün ox düymələrindən istifadə edin. Buraxmaq üçün yenidən Space və ya Enter, ləğv etmək üçün Escape basın.", // needs review
  dragRowLabel: (position) => `Sətir ${position.toLocaleString("az")}`, // needs review
}
