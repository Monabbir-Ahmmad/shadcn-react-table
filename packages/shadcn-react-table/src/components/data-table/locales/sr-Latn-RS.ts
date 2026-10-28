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

export const dataTableLocalizationSrLatnRS: DataTableLocalization = {
  language: "sr-Latn-RS",
  selectAll: "Označi/odznači sve redove",
  selectRow: "Označi/odznači red",
  clearSelection: "Poništi izbor",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("sr-Latn-RS")} od ${total.toLocaleString("sr-Latn-RS")} redova označeno`, // needs review
  sortByColumnAsc: (column) => `Sortiraj po ${column} rastuće`, // needs review
  sortByColumnDesc: (column) => `Sortiraj po ${column} opadajuće`, // needs review
  sortAscending: "Sortiraj rastuće", // needs review
  sortDescending: "Sortiraj opadajuće", // needs review
  clearSort: "Poništi sortiranje",
  sortedAscending: "Sortirano rastuće", // needs review
  sortedDescending: "Sortirano opadajuće", // needs review
  columnActions: "Akcije nad kolonama",
  hideColumn: "Sakrij kolonu", // needs review
  showAllColumns: "Prikaži sve kolone",
  pinToLeft: "Zakači levo",
  pinToRight: "Zakači desno",
  unpin: "Otkači",
  reorderColumn: "Pomeri",
  reorderRow: "Pomeri",
  pinRow: "Zakači red", // needs review
  unpinRow: "Otkači red", // needs review
  resizeColumn: "Promeni širinu kolone", // needs review
  groupByColumn: (column) => `Grupiši po ${column}`, // needs review
  ungroupByColumn: (column) => `Odgrupiši po ${column}`,
  groupedBy: "Grupisano po", // needs review
  dropToGroupBy: "Prevuci kolonu ovde da grupišeš po njoj", // needs review
  expand: "Proširi",
  collapse: "Raširi",
  expandAll: "Proširi sve",
  collapseAll: "Raširi sve",
  toggleRowExpanded: "Proširi/skupi red", // needs review
  columnVisibility: "Prikaži/sakrij kolone",
  toggleColumnVisibility: "Uključi/isključi vidljivost",
  filterByColumn: (column) => `Filtriraj po ${column}`,
  clearFilter: "Poništi filter",
  filterMode: "Režim filtriranja", // needs review
  changeFilterMode: "Promeni režim filtriranja",
  filterPlaceholder: (column) => `Filtriraj ${column}…`, // needs review
  showColumnFilters: "Prikaži filtere", // needs review
  hideColumnFilters: "Sakrij filtere", // needs review
  min: "Min",
  max: "Max",
  pickDate: "Izaberi datum", // needs review
  pickDateRange: "Izaberi opseg datuma", // needs review
  true: "Tačno", // needs review
  false: "Netačno", // needs review
  filterModes: {
    fuzzy: "Fazi",
    contains: "Sadrži",
    startsWith: "Počinje sa",
    endsWith: "Završava se na",
    equals: "Jednako",
    notEquals: "Nije jednako",
    empty: "Prazno",
    notEmpty: "Nije prazno",
    between: "Između",
    betweenInclusive: "Inkluzivno između",
    greaterThan: "Veće",
    greaterThanOrEqualTo: "Veće ili jednako",
    lessThan: "Manje",
    lessThanOrEqualTo: "Manje ili jednako",
    before: "Pre", // needs review
    after: "Posle", // needs review
    betweenDates: "Između", // needs review
    equalsString: "Jednako",
    arrIncludesSome: "Uključuje",
    equalsBool: "Jednako",
  },
  advancedFilters: "Napredni filteri", // needs review
  advancedFiltersMatchLabel: "Poklapanje", // needs review
  advancedFiltersMatchAll: "Sva", // needs review
  advancedFiltersMatchAny: "Bilo koje", // needs review
  advancedFiltersOf: "od sledećih pravila", // needs review
  advancedFiltersAddRule: "Dodaj filter", // needs review
  advancedFiltersApply: "Primeni", // needs review
  advancedFiltersClearAll: "Poništi sve", // needs review
  advancedFiltersColumn: "Kolona", // needs review
  advancedFiltersOperator: "Operator", // needs review
  advancedFiltersValue: "Vrednost", // needs review
  advancedFiltersEmpty: "Još nema filtera. Dodaj jedan da počneš.", // needs review
  removeFilterRule: "Ukloni filter", // needs review
  advancedFilterOperators: {
    contains: "Sadrži",
    notContains: "ne sadrži", // needs review
    startsWith: "Počinje sa",
    endsWith: "Završava se na",
    equals: "Jednako",
    notEquals: "Nije jednako",
    isEmpty: "Prazno",
    isNotEmpty: "Nije prazno",
    greaterThan: "Veće",
    greaterThanOrEqual: "Veće ili jednako",
    lessThan: "Manje",
    lessThanOrEqual: "Manje ili jednako",
    between: "Između",
  },
  search: "Pretraži",
  searchPlaceholder: "Pretraži…", // needs review
  clearSearch: "Poništi pretragu",
  globalFilterMode: "Promeni režim pretrage",
  toggleDensity: "Podesi gustinu",
  densityComfortable: "Udobno", // needs review
  densityCompact: "Kompaktno", // needs review
  densitySpacious: "Prostrano", // needs review
  enterFullscreen: "Uključi ceo ekran", // needs review
  exitFullscreen: "Isključi ceo ekran", // needs review
  rowsPerPage: "Redova po stranici",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("sr-Latn-RS")}–${end.toLocaleString("sr-Latn-RS")} od ${total.toLocaleString("sr-Latn-RS")}`, // needs review
  goToFirstPage: "Idi na prvu stranicu",
  goToPreviousPage: "Idi na prošlu stranicu",
  goToNextPage: "Idi na sledeću stranicu",
  goToLastPage: "Idi na poslednju stranicu",
  goToPage: (page) => `Idi na stranicu ${page.toLocaleString("sr-Latn-RS")}`, // needs review
  rowActions: "Akcije nad redovima",
  edit: "Izmeni",
  save: "Snimi",
  cancel: "Otkaži",
  delete: "Obriši", // needs review
  create: "Napravi", // needs review
  createNewRow: "Napravi novi red", // needs review
  editRow: "Izmeni red", // needs review
  required: "Obavezno", // needs review
  copy: "Kopiraj",
  copied: "Kopirani u clipboard",
  cellActions: "Akcije ćelije", // needs review
  noRecordsToDisplay: "Nema redova za prikaz",
  loading: "Učitavanje…", // needs review
  loadingMore: "Učitavanje još…", // needs review
  dragStart: (label) => `Podignuto: ${label}.`, // needs review
  dragOver: (label, over) => `${label} je iznad ${over}.`, // needs review
  dragEnd: (label, over) => `Pušteno na ${over}: ${label}.`, // needs review
  dragCancel: (label) => `Prevlačenje je otkazano. Pušteno: ${label}.`, // needs review
  dragInstructions:
    "Da podigneš stavku, pritisni razmaknicu ili Enter. Tokom prevlačenja koristi tastere sa strelicama da je pomeriš. Ponovo pritisni razmaknicu ili Enter da je pustiš, ili pritisni Escape da otkažeš.", // needs review
  dragRowLabel: (position) => `Red ${position.toLocaleString("sr-Latn-RS")}`, // needs review
}
