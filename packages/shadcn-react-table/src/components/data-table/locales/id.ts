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

export const dataTableLocalizationId: DataTableLocalization = {
  language: "id",
  selectAll: "Beralih pilih semua",
  selectRow: "Beralih pilih baris",
  clearSelection: "Hapus pilihan",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("id")} dari ${total.toLocaleString("id")} baris dipilih`, // needs review
  sortByColumnAsc: (column) => `Urutkan berdasarkan ${column} menaik`, // needs review
  sortByColumnDesc: (column) => `Urutkan berdasarkan ${column} menurun`, // needs review
  sortAscending: "Urutkan menaik", // needs review
  sortDescending: "Urutkan menurun", // needs review
  clearSort: "Hapus urutan",
  sortedAscending: "Diurutkan menaik", // needs review
  sortedDescending: "Diurutkan menurun", // needs review
  columnActions: "Aksi Kolom",
  hideColumn: "Sembunyikan kolom", // needs review
  showAllColumns: "Tampilkan semua kolom",
  pinToLeft: "Sematkan ke kiri",
  pinToRight: "Sematkan ke kanan",
  unpin: "Lepaskan sematan",
  reorderColumn: "Pindah",
  reorderRow: "Pindah",
  pinRow: "Sematkan baris", // needs review
  unpinRow: "Lepaskan sematan baris", // needs review
  resizeColumn: "Ubah ukuran kolom", // needs review
  groupByColumn: (column) => `Kelompokkan berdasarkan ${column}`, // needs review
  ungroupByColumn: (column) => `Batalkan pengelompokan berdasarkan ${column}`,
  groupedBy: "Dikelompokkan berdasarkan", // needs review
  dropToGroupBy:
    "Seret kolom ke sini untuk mengelompokkan berdasarkan kolom tersebut", // needs review
  expand: "Bentangkan",
  collapse: "Ciutkan",
  expandAll: "Bentangkan semua",
  collapseAll: "Ciutkan semua",
  toggleRowExpanded: "Bentangkan/ciutkan baris", // needs review
  columnVisibility: "Tampilkan/Sembunyikan kolom",
  toggleColumnVisibility: "Beralih visibilitas",
  filterByColumn: (column) => `Filter berdasarkan ${column}`,
  clearFilter: "Hapus filter",
  filterMode: "Mode filter", // needs review
  changeFilterMode: "Ubah mode filter",
  filterPlaceholder: (column) => `Filter ${column}…`, // needs review
  showColumnFilters: "Tampilkan filter", // needs review
  hideColumnFilters: "Sembunyikan filter", // needs review
  min: "Min",
  max: "Maks",
  pickDate: "Pilih tanggal", // needs review
  pickDateRange: "Pilih rentang tanggal", // needs review
  true: "Benar", // needs review
  false: "Salah", // needs review
  filterModes: {
    fuzzy: "Fuzzy",
    contains: "Berisi",
    startsWith: "Dimulai Dengan",
    endsWith: "Berakhir Dengan",
    equals: "Sama dengan",
    notEquals: "Tidak Sama Dengan",
    empty: "Kosong",
    notEmpty: "Tidak Kosong",
    between: "Antara",
    betweenInclusive: "Antara Inklusif",
    greaterThan: "Lebih Dari",
    greaterThanOrEqualTo: "Lebih Dari Atau Sama Dengan",
    lessThan: "Kurang Dari",
    lessThanOrEqualTo: "Kurang Dari Atau Sama Dengan",
    before: "Sebelum", // needs review
    after: "Sesudah", // needs review
    betweenDates: "Antara", // needs review
    equalsString: "Sama dengan",
    arrIncludesSome: "Termasuk",
    equalsBool: "Sama dengan",
  },
  advancedFilters: "Filter lanjutan", // needs review
  advancedFiltersMatchLabel: "Cocokkan", // needs review
  advancedFiltersMatchAll: "semua", // needs review
  advancedFiltersMatchAny: "salah satu", // needs review
  advancedFiltersOf: "aturan berikut", // needs review
  advancedFiltersAddRule: "Tambah filter", // needs review
  advancedFiltersApply: "Terapkan", // needs review
  advancedFiltersClearAll: "Hapus semua", // needs review
  advancedFiltersColumn: "Kolom", // needs review
  advancedFiltersOperator: "Operator", // needs review
  advancedFiltersValue: "Nilai", // needs review
  advancedFiltersEmpty: "Belum ada filter. Tambahkan satu untuk memulai.", // needs review
  removeFilterRule: "Hapus filter", // needs review
  advancedFilterOperators: {
    contains: "Berisi",
    notContains: "tidak mengandung", // needs review
    startsWith: "Dimulai Dengan",
    endsWith: "Berakhir Dengan",
    equals: "Sama dengan",
    notEquals: "Tidak Sama Dengan",
    isEmpty: "Kosong",
    isNotEmpty: "Tidak Kosong",
    greaterThan: "Lebih Dari",
    greaterThanOrEqual: "Lebih Dari Atau Sama Dengan",
    lessThan: "Kurang Dari",
    lessThanOrEqual: "Kurang Dari Atau Sama Dengan",
    between: "Antara",
  },
  search: "Cari",
  searchPlaceholder: "Cari…", // needs review
  clearSearch: "Hapus pencarian",
  globalFilterMode: "Ubah mode pencarian",
  toggleDensity: "Beralih kepadatan",
  densityComfortable: "Nyaman", // needs review
  densityCompact: "Ringkas", // needs review
  densitySpacious: "Lega", // needs review
  enterFullscreen: "Masuk layar penuh", // needs review
  exitFullscreen: "Keluar dari layar penuh", // needs review
  rowsPerPage: "Baris per halaman",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("id")}–${end.toLocaleString("id")} dari ${total.toLocaleString("id")}`, // needs review
  goToFirstPage: "Pergi ke halaman pertama",
  goToPreviousPage: "Pergi ke halaman sebelumnya",
  goToNextPage: "Pergi ke halaman berikutnya",
  goToLastPage: "Pergi ke halaman terakhir",
  goToPage: (page) => `Pergi ke halaman ${page.toLocaleString("id")}`, // needs review
  rowActions: "Aksi Baris",
  edit: "Ubah",
  save: "Simpan",
  cancel: "Batal",
  delete: "Hapus", // needs review
  create: "Buat", // needs review
  createNewRow: "Buat baris baru", // needs review
  editRow: "Ubah baris", // needs review
  required: "Wajib diisi", // needs review
  copy: "Salin",
  copied: "Disalin ke papan klip",
  cellActions: "Aksi sel", // needs review
  noRecordsToDisplay: "Tidak ada data untuk ditampilkan",
  loading: "Memuat…", // needs review
  loadingMore: "Memuat lebih banyak…", // needs review
  dragStart: (label) => `${label} diangkat.`, // needs review
  dragOver: (label, over) => `${label} berada di atas ${over}.`, // needs review
  dragEnd: (label, over) => `${label} dijatuhkan di ${over}.`, // needs review
  dragCancel: (label) => `Penyeretan dibatalkan. ${label} dijatuhkan.`, // needs review
  dragInstructions:
    "Untuk mengangkat item, tekan spasi atau enter. Saat menyeret, gunakan tombol panah untuk memindahkannya. Tekan spasi atau enter lagi untuk menjatuhkannya, atau tekan escape untuk membatalkan.", // needs review
  dragRowLabel: (position) => `Baris ${position.toLocaleString("id")}`, // needs review
}
