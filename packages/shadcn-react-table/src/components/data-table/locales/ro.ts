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

export const dataTableLocalizationRo: DataTableLocalization = {
  language: "ro",
  selectAll: "Comutare selectare totală",
  selectRow: "Comutare selectare linie",
  clearSelection: "Curăță selecția",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("ro")} din ${total.toLocaleString("ro")} linii selectate`, // needs review
  sortByColumnAsc: (column) => `Sortează după ${column} ascendent`, // needs review
  sortByColumnDesc: (column) => `Sortează după ${column} descendent`, // needs review
  sortAscending: "Sortează ascendent", // needs review
  sortDescending: "Sortează descendent", // needs review
  clearSort: "Curăță sortarea",
  sortedAscending: "Sortat ascendent", // needs review
  sortedDescending: "Sortat descendent", // needs review
  columnActions: "Acțiuni Coloană",
  hideColumn: "Ascunde coloana", // needs review
  showAllColumns: "Afișează toate coloanele",
  pinToLeft: "Fixează la stanga",
  pinToRight: "Fixează la dreapta",
  unpin: "Deblocare",
  reorderColumn: "Mută",
  reorderRow: "Mută",
  pinRow: "Fixează linia", // needs review
  unpinRow: "Anulează fixarea liniei", // needs review
  resizeColumn: "Redimensionează coloana", // needs review
  groupByColumn: (column) => `Grupează după ${column}`, // needs review
  ungroupByColumn: (column) => `Degrupează după ${column}`,
  groupedBy: "Grupat după", // needs review
  dropToGroupBy: "Trage o coloană aici pentru a grupa după ea", // needs review
  expand: "Extinde",
  collapse: "Restrânge",
  expandAll: "Extinde tot",
  collapseAll: "Restrânge tot",
  toggleRowExpanded: "Extinde/restrânge linia", // needs review
  columnVisibility: "Afișează/Ascunde coloanele",
  toggleColumnVisibility: "Comutare visibilitate",
  filterByColumn: (column) => `Filtrare după ${column}`,
  clearFilter: "Curăță filtrarea",
  filterMode: "Mod filtrare", // needs review
  changeFilterMode: "Schimbă mod filtru",
  filterPlaceholder: (column) => `Filtrează ${column}…`, // needs review
  showColumnFilters: "Afișează filtrele", // needs review
  hideColumnFilters: "Ascunde filtrele", // needs review
  min: "Min",
  max: "Max",
  pickDate: "Alege o dată", // needs review
  pickDateRange: "Alege un interval de date", // needs review
  true: "Adevărat", // needs review
  false: "Fals", // needs review
  filterModes: {
    fuzzy: "Neclar",
    contains: "Conține",
    startsWith: "Începe cu",
    endsWith: "Se termină cu",
    equals: "Egal",
    notEquals: "Nu sunt egale",
    empty: "Gol",
    notEmpty: "Nu este gol",
    between: "Între",
    betweenInclusive: "Între Inclusiv",
    greaterThan: "Mai mare ca",
    greaterThanOrEqualTo: "Mai mare sau egal cu",
    lessThan: "Mai puțin decât",
    lessThanOrEqualTo: "Mai Puțin Sau Egal Cu",
    before: "Înainte de", // needs review
    after: "După", // needs review
    betweenDates: "Între", // needs review
    equalsString: "Egale",
    arrIncludesSome: "Include",
    equalsBool: "Egal",
  },
  advancedFilters: "Filtre avansate", // needs review
  advancedFiltersMatch: (logic) =>
    `Potrivire ${logic} dintre următoarele reguli`, // needs review
  advancedFiltersMatchAll: "Toate", // needs review
  advancedFiltersMatchAny: "Oricare", // needs review
  advancedFiltersAddRule: "Adaugă filtru", // needs review
  advancedFiltersApply: "Aplică", // needs review
  advancedFiltersClearAll: "Curăță tot", // needs review
  advancedFiltersColumn: "Coloană", // needs review
  advancedFiltersOperator: "Operator", // needs review
  advancedFiltersValue: "Valoare", // needs review
  advancedFiltersEmpty: "Niciun filtru încă. Adaugă unul pentru a începe.", // needs review
  removeFilterRule: "Elimină filtrul", // needs review
  advancedFilterOperators: {
    contains: "Conține",
    notContains: "nu conține", // needs review
    startsWith: "Începe cu",
    endsWith: "Se termină cu",
    equals: "Egal",
    notEquals: "Nu sunt egale",
    isEmpty: "Gol",
    isNotEmpty: "Nu este gol",
    greaterThan: "Mai mare ca",
    greaterThanOrEqual: "Mai mare sau egal cu",
    lessThan: "Mai puțin decât",
    lessThanOrEqual: "Mai Puțin Sau Egal Cu",
    between: "Între",
  },
  search: "Căutare",
  searchPlaceholder: "Căutare…", // needs review
  clearSearch: "Curăță căutarea",
  globalFilterMode: "Schimbă mod căutare",
  toggleDensity: "Schimbă densitatea",
  densityComfortable: "Confortabil", // needs review
  densityCompact: "Compact", // needs review
  densitySpacious: "Spațios", // needs review
  enterFullscreen: "Intră în ecran complet", // needs review
  exitFullscreen: "Ieși din ecran complet", // needs review
  rowsPerPage: "Linii per pagină",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("ro")}–${end.toLocaleString("ro")} din ${total.toLocaleString("ro")}`, // needs review
  goToFirstPage: "Prima pagină",
  goToPreviousPage: "Pagina anterioară",
  goToNextPage: "Următoarea pagină",
  goToLastPage: "Ultima pagină",
  goToPage: (page) => `Mergi la pagina ${page.toLocaleString("ro")}`, // needs review
  rowActions: "Acțiunile liniei",
  edit: "Modifică",
  save: "Salvează",
  cancel: "Anulează",
  delete: "Șterge", // needs review
  create: "Creează", // needs review
  createNewRow: "Creează o linie nouă", // needs review
  editRow: "Modifică linia", // needs review
  required: "Obligatoriu", // needs review
  copy: "Copiază",
  copied: "Copiat pe ecran",
  cellActions: "Acțiuni celulă", // needs review
  noRecordsToDisplay: "Nu sunt înregistrări de afișat",
  loading: "Se încarcă…", // needs review
  loadingMore: "Se încarcă mai multe…", // needs review
  dragStart: (label) => `Ridicat: ${label}.`, // needs review
  dragOver: (label, over) => `${label} este deasupra ${over}.`, // needs review
  dragEnd: (label, over) => `Plasat pe ${over}: ${label}.`, // needs review
  dragCancel: (label) => `Tragerea a fost anulată. Plasat: ${label}.`, // needs review
  dragInstructions:
    "Pentru a ridica un element, apasă Spațiu sau Enter. În timpul tragerii, folosește tastele săgeți pentru a-l muta. Apasă din nou Spațiu sau Enter pentru a-l plasa sau apasă Escape pentru a anula.", // needs review
  dragRowLabel: (position) => `Linia ${position.toLocaleString("ro")}`, // needs review
  noResultsFound: "Niciun rezultat găsit",
}
