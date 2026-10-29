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

export const dataTableLocalizationTr: DataTableLocalization = {
  language: "tr",
  selectAll: "Tümünü Seç",
  selectRow: "Satır Seç",
  clearSelection: "Seçimi Temizle",
  rowsSelected: (selected, total) =>
    `${total.toLocaleString("tr")} satırdan ${selected.toLocaleString("tr")} tanesi seçildi`, // needs review
  sortByColumnAsc: (column) => `${column} Sütununa Göre Artan Sırala`, // needs review
  sortByColumnDesc: (column) => `${column} Sütununa Göre Azalan Sırala`, // needs review
  sortAscending: "Artan Sırala", // needs review
  sortDescending: "Azalan Sırala", // needs review
  clearSort: "Sıralamayı Sıfırla",
  sortedAscending: "Artan Sıralandı", // needs review
  sortedDescending: "Azalan Sıralandı", // needs review
  columnActions: "Sütun İşlemleri",
  hideColumn: "Sütunu Gizle", // needs review
  showAllColumns: "Bütün Sütunları Göster",
  pinToLeft: "Sola Sabitle",
  pinToRight: "Sağa Sabitle",
  unpin: "Çöz",
  reorderColumn: "Taşı",
  reorderRow: "Taşı",
  pinRow: "Satırı Sabitle", // needs review
  unpinRow: "Satırı Çöz", // needs review
  resizeColumn: "Sütunu Yeniden Boyutlandır", // needs review
  groupByColumn: (column) => `${column} Sütununa Göre Gruplandır`, // needs review
  ungroupByColumn: (column) => `${column} Sütununu Çöz`,
  groupedBy: "Gruplandırma Ölçütü", // needs review
  dropToGroupBy: "Gruplamak için bir sütunu buraya sürükleyin", // needs review
  expand: "Genişlet",
  collapse: "Daralt",
  expandAll: "Tümünü Genişlet",
  collapseAll: "Tümünü Daralt",
  toggleRowExpanded: "Satırı Genişlet/Daralt", // needs review
  columnVisibility: "Sütunları Göster/Gizle",
  toggleColumnVisibility: "Görünürlüğü Değiştir",
  filterByColumn: (column) => `${column} Filtresi`,
  clearFilter: "Filtreyi Temizle",
  filterMode: "Filtre Modu", // needs review
  changeFilterMode: "Filtre Modunu Değiştir",
  filterPlaceholder: (column) => `${column} Filtrele…`, // needs review
  showColumnFilters: "Filtreleri Göster", // needs review
  hideColumnFilters: "Filtreleri Gizle", // needs review
  min: "Asgari",
  max: "Azami",
  pickDate: "Tarih Seç", // needs review
  pickDateRange: "Tarih Aralığı Seç", // needs review
  true: "Doğru", // needs review
  false: "Yanlış", // needs review
  filterModes: {
    fuzzy: "Yaklaşık",
    contains: "İçerir",
    startsWith: "Başı",
    endsWith: "Sonu",
    equals: "Eşit",
    notEquals: "Eşit Değil",
    empty: "Boş",
    notEmpty: "Boş Değil",
    between: "Arasında",
    betweenInclusive: "Dahil Arasında",
    greaterThan: "Büyüktür",
    greaterThanOrEqualTo: "Büyük Eşittir",
    lessThan: "Küçüktür",
    lessThanOrEqualTo: "Küçük Eşittir",
    before: "Önce", // needs review
    after: "Sonra", // needs review
    betweenDates: "Arasında", // needs review
    equalsString: "Eşit",
    arrIncludesSome: "İçerir",
    equalsBool: "Eşit",
  },
  advancedFilters: "Gelişmiş Filtreler", // needs review
  advancedFiltersMatch: (logic) => `Aşağıdaki kuralların ${logic} eşleşsin`, // needs review
  advancedFiltersMatchAll: "tümü", // needs review
  advancedFiltersMatchAny: "herhangi biri", // needs review
  advancedFiltersAddRule: "Filtre Ekle", // needs review
  advancedFiltersApply: "Uygula", // needs review
  advancedFiltersClearAll: "Tümünü Temizle", // needs review
  advancedFiltersColumn: "Sütun", // needs review
  advancedFiltersOperator: "Operatör", // needs review
  advancedFiltersValue: "Değer", // needs review
  advancedFiltersEmpty: "Henüz filtre yok. Başlamak için bir tane ekleyin.", // needs review
  removeFilterRule: "Filtreyi Kaldır", // needs review
  advancedFilterOperators: {
    contains: "İçerir",
    notContains: "içermez", // needs review
    startsWith: "Başı",
    endsWith: "Sonu",
    equals: "Eşit",
    notEquals: "Eşit Değil",
    isEmpty: "Boş",
    isNotEmpty: "Boş Değil",
    greaterThan: "Büyüktür",
    greaterThanOrEqual: "Büyük Eşittir",
    lessThan: "Küçüktür",
    lessThanOrEqual: "Küçük Eşittir",
    between: "Arasında",
  },
  search: "Ara",
  searchPlaceholder: "Ara…", // needs review
  clearSearch: "Aramayı Temizle",
  globalFilterMode: "Arama Modunu Değiştir",
  toggleDensity: "Sıklığı Değiştir",
  densityComfortable: "Rahat", // needs review
  densityCompact: "Sık", // needs review
  densitySpacious: "Geniş", // needs review
  enterFullscreen: "Tam Ekrana Geç", // needs review
  exitFullscreen: "Tam Ekrandan Çık", // needs review
  rowsPerPage: "Sayfa Başına Satır",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("tr")}–${end.toLocaleString("tr")} / ${total.toLocaleString("tr")}`, // needs review
  goToFirstPage: "İlk Sayfaya Git",
  goToPreviousPage: "Önceki Sayfaya Git",
  goToNextPage: "Sonraki Sayfaya Git",
  goToLastPage: "Son Sayfaya Git",
  goToPage: (page) => `${page.toLocaleString("tr")}. Sayfaya Git`, // needs review
  rowActions: "Satır İşlemleri",
  edit: "Düzenle",
  save: "Kaydet",
  cancel: "İptal",
  delete: "Sil", // needs review
  create: "Oluştur", // needs review
  createNewRow: "Yeni Satır Oluştur", // needs review
  editRow: "Satırı Düzenle", // needs review
  required: "Zorunlu", // needs review
  copy: "Kopyala",
  copied: "Panoya Kopyalandı",
  cellActions: "Hücre İşlemleri", // needs review
  noRecordsToDisplay: "Gösterilecek Kayıt Yok",
  loading: "Yükleniyor…", // needs review
  loadingMore: "Daha fazlası yükleniyor…", // needs review
  dragStart: (label) => `${label} sürüklemek için tutuldu.`, // needs review
  dragOver: (label, over) => `${label}, ${over} üzerinde.`, // needs review
  dragEnd: (label, over) => `${label}, ${over} üzerine bırakıldı.`, // needs review
  dragCancel: (label) => `Sürükleme iptal edildi. ${label} bırakıldı.`, // needs review
  dragInstructions:
    "Bir öğeyi almak için boşluk veya Enter tuşuna basın. Sürüklerken öğeyi taşımak için ok tuşlarını kullanın. Bırakmak için tekrar boşluk veya Enter tuşuna basın ya da iptal etmek için Escape tuşuna basın.", // needs review
  dragRowLabel: (position) => `${position.toLocaleString("tr")}. Satır`, // needs review
}
