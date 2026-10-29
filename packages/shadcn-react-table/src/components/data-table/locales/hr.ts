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

export const dataTableLocalizationHr: DataTableLocalization = {
  language: "hr",
  selectAll: "Prebaci odabir svih",
  selectRow: "Prebaci odabir retka",
  clearSelection: "Očisti odabir",
  rowsSelected: (selected, total) =>
    `Odabrano ${selected.toLocaleString("hr")} od ${total.toLocaleString("hr")} redaka`, // needs review
  sortByColumnAsc: (column) => `Sortiraj po ${column} uzlazno`, // needs review
  sortByColumnDesc: (column) => `Sortiraj po ${column} silazno`, // needs review
  sortAscending: "Sortiraj uzlazno", // needs review
  sortDescending: "Sortiraj silazno", // needs review
  clearSort: "Očisti sortiranje",
  sortedAscending: "Sortirano uzlazno", // needs review
  sortedDescending: "Sortirano silazno", // needs review
  columnActions: "Radnje s stupcima",
  hideColumn: "Sakrij stupac", // needs review
  showAllColumns: "Prikaži sve stupce",
  pinToLeft: "Prikači na lijevo",
  pinToRight: "Prikači na desno",
  unpin: "Odkači",
  reorderColumn: "Premjesti",
  reorderRow: "Premjesti",
  pinRow: "Prikači redak", // needs review
  unpinRow: "Odkači redak", // needs review
  resizeColumn: "Promijeni veličinu stupca", // needs review
  groupByColumn: (column) => `Grupiraj po ${column}`, // needs review
  ungroupByColumn: (column) => `Razgrupiraj po ${column}`,
  groupedBy: "Grupirano po", // needs review
  dropToGroupBy: "Povucite stupac ovamo za grupiranje po njemu", // needs review
  expand: "Proširi",
  collapse: "Sažmi",
  expandAll: "Proširi sve",
  collapseAll: "Sažmi sve",
  toggleRowExpanded: "Proširi/sažmi redak", // needs review
  columnVisibility: "Prikaži/sakrij stupce",
  toggleColumnVisibility: "Prebaci vidljivost",
  filterByColumn: (column) => `Filtriraj po ${column}`,
  clearFilter: "Očisti filtriranje",
  filterMode: "Način filtriranja", // needs review
  changeFilterMode: "Promijeni način filtriranja",
  filterPlaceholder: (column) => `Filtriraj ${column}…`, // needs review
  showColumnFilters: "Prikaži filtere", // needs review
  hideColumnFilters: "Sakrij filtere", // needs review
  min: "Min.",
  max: "Maks.",
  pickDate: "Odaberi datum", // needs review
  pickDateRange: "Odaberi raspon datuma", // needs review
  true: "Točno", // needs review
  false: "Netočno", // needs review
  filterModes: {
    fuzzy: "Maglovito",
    contains: "Sadrži",
    startsWith: "Počinje s",
    endsWith: "Završava s",
    equals: "Jednako",
    notEquals: "Nije jednako",
    empty: "Prazno",
    notEmpty: "Nije prazno",
    between: "Između",
    betweenInclusive: "Između uključivo",
    greaterThan: "Veće od",
    greaterThanOrEqualTo: "Veće od ili jednako",
    lessThan: "Manje od",
    lessThanOrEqualTo: "Manje od ili jednako",
    before: "Prije", // needs review
    after: "Poslije", // needs review
    betweenDates: "Između", // needs review
    equalsString: "Jednako",
    arrIncludesSome: "Uključuje",
    equalsBool: "Jednako",
  },
  advancedFilters: "Napredni filtri", // needs review
  advancedFiltersMatch: (logic) => `Podudaraj ${logic} od sljedećih pravila`, // needs review
  advancedFiltersMatchAll: "sva", // needs review
  advancedFiltersMatchAny: "bilo koje", // needs review
  advancedFiltersAddRule: "Dodaj filtar", // needs review
  advancedFiltersApply: "Primijeni", // needs review
  advancedFiltersClearAll: "Očisti sve", // needs review
  advancedFiltersColumn: "Stupac", // needs review
  advancedFiltersOperator: "Operator", // needs review
  advancedFiltersValue: "Vrijednost", // needs review
  advancedFiltersEmpty: "Još nema filtara. Dodajte jedan za početak.", // needs review
  removeFilterRule: "Ukloni filtar", // needs review
  advancedFilterOperators: {
    contains: "Sadrži",
    notContains: "ne sadrži", // needs review
    startsWith: "Počinje s",
    endsWith: "Završava s",
    equals: "Jednako",
    notEquals: "Nije jednako",
    isEmpty: "Prazno",
    isNotEmpty: "Nije prazno",
    greaterThan: "Veće od",
    greaterThanOrEqual: "Veće od ili jednako",
    lessThan: "Manje od",
    lessThanOrEqual: "Manje od ili jednako",
    between: "Između",
  },
  search: "Pretraži",
  searchPlaceholder: "Pretraži…", // needs review
  clearSearch: "Očisti pretragu",
  globalFilterMode: "Promijeni način pretraživanja",
  toggleDensity: "Promijeni gustoću",
  densityComfortable: "Udobno", // needs review
  densityCompact: "Kompaktno", // needs review
  densitySpacious: "Prostrano", // needs review
  enterFullscreen: "Uđi u puni zaslon", // needs review
  exitFullscreen: "Izađi iz punog zaslona", // needs review
  rowsPerPage: "Redaka po stranici",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("hr")}–${end.toLocaleString("hr")} od ${total.toLocaleString("hr")}`, // needs review
  goToFirstPage: "Idi na prvu stranicu",
  goToPreviousPage: "Idi na prethodnu stranicu",
  goToNextPage: "Idi na sljedeću stranicu",
  goToLastPage: "Idi na zadnju stranicu",
  goToPage: (page) => `Idi na stranicu ${page.toLocaleString("hr")}`, // needs review
  rowActions: "Radnje retka",
  edit: "Uredi",
  save: "Spremi",
  cancel: "Odustani",
  delete: "Izbriši", // needs review
  create: "Stvori", // needs review
  createNewRow: "Stvori novi redak", // needs review
  editRow: "Uredi redak", // needs review
  required: "Obavezno", // needs review
  copy: "Kopiraj",
  copied: "Kopirano u međuspremnik",
  cellActions: "Radnje ćelije", // needs review
  noRecordsToDisplay: "Nema zapisa za prikaz",
  loading: "Učitavanje…", // needs review
  loadingMore: "Učitavanje dodatnih stavki…", // needs review
  dragStart: (label) => `Podignuto: ${label}.`, // needs review
  dragOver: (label, over) => `${label} je iznad: ${over}.`, // needs review
  dragEnd: (label, over) => `${label} je ispušten na: ${over}.`, // needs review
  dragCancel: (label) => `Povlačenje je otkazano. ${label} je ispušten.`, // needs review
  dragInstructions:
    "Za podizanje stavke pritisnite razmaknicu ili Enter. Tijekom povlačenja koristite tipke sa strelicama za pomicanje. Ponovno pritisnite razmaknicu ili Enter za ispuštanje ili Escape za otkazivanje.", // needs review
  dragRowLabel: (position) => `Redak ${position.toLocaleString("hr")}`, // needs review
}
