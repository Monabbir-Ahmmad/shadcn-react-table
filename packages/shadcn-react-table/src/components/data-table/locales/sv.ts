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

export const dataTableLocalizationSv: DataTableLocalization = {
  language: "sv",
  selectAll: "Växla välja alla",
  selectRow: "Växla välj rad",
  clearSelection: "Rensa val",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("sv")} av ${total.toLocaleString("sv")} rader valda`, // needs review
  sortByColumnAsc: (column) => `Sortera efter ${column} stigande`, // needs review
  sortByColumnDesc: (column) => `Sortera efter ${column} fallande`, // needs review
  sortAscending: "Sortera stigande", // needs review
  sortDescending: "Sortera fallande", // needs review
  clearSort: "Rensa sortering",
  sortedAscending: "Sorterat stigande", // needs review
  sortedDescending: "Sorterat fallande", // needs review
  columnActions: "Kolumnåtgärd",
  hideColumn: "Göm kolumn", // needs review
  showAllColumns: "Visa alla kolumner",
  pinToLeft: "Fäst till vänster",
  pinToRight: "Fäst till höger",
  unpin: "Avfäst",
  reorderColumn: "Flytta",
  reorderRow: "Flytta",
  pinRow: "Fäst rad", // needs review
  unpinRow: "Avfäst rad", // needs review
  resizeColumn: "Ändra kolumnbredd", // needs review
  groupByColumn: (column) => `Gruppera efter ${column}`, // needs review
  ungroupByColumn: (column) => `Avgruppera efter ${column}`,
  groupedBy: "Grupperat efter", // needs review
  dropToGroupBy: "Dra en kolumn hit för att gruppera efter den", // needs review
  expand: "Expandera",
  collapse: "Stäng",
  expandAll: "Expandera alla",
  collapseAll: "Stäng alla",
  toggleRowExpanded: "Expandera/fäll ihop rad", // needs review
  columnVisibility: "Visa/Göm kolumner",
  toggleColumnVisibility: "Växla synlighet",
  filterByColumn: (column) => `Filtrera efter ${column}`,
  clearFilter: "Rensa filter",
  filterMode: "Filterläge", // needs review
  changeFilterMode: "Ändra filterläge",
  filterPlaceholder: (column) => `Filtrera ${column}…`, // needs review
  showColumnFilters: "Visa filter", // needs review
  hideColumnFilters: "Göm filter", // needs review
  min: "Min.",
  max: "Max.",
  pickDate: "Välj ett datum", // needs review
  pickDateRange: "Välj ett datumintervall", // needs review
  true: "Sant", // needs review
  false: "Falskt", // needs review
  filterModes: {
    fuzzy: "Fuzzy",
    contains: "Innehåller",
    startsWith: "Börjar med",
    endsWith: "Slutar med",
    equals: "Lika med",
    notEquals: "Inte lika med",
    empty: "Tom",
    notEmpty: "Inte tom",
    between: "Mellan",
    betweenInclusive: "Mellan inklusive",
    greaterThan: "Större än",
    greaterThanOrEqualTo: "Större än eller lika med",
    lessThan: "Mindre än",
    lessThanOrEqualTo: "Mindre än eller lika med",
    before: "Före", // needs review
    after: "Efter", // needs review
    betweenDates: "Mellan", // needs review
    equalsString: "Lika med",
    arrIncludesSome: "Inkluderar",
    equalsBool: "Lika med",
  },
  advancedFilters: "Avancerade filter", // needs review
  advancedFiltersMatch: (logic) => `Matcha ${logic} av följande regler`, // needs review
  advancedFiltersMatchAll: "Alla", // needs review
  advancedFiltersMatchAny: "Någon", // needs review
  advancedFiltersAddRule: "Lägg till filter", // needs review
  advancedFiltersApply: "Tillämpa", // needs review
  advancedFiltersClearAll: "Rensa alla", // needs review
  advancedFiltersColumn: "Kolumn", // needs review
  advancedFiltersOperator: "Operator", // needs review
  advancedFiltersValue: "Värde", // needs review
  advancedFiltersEmpty: "Inga filter ännu. Lägg till ett för att komma igång.", // needs review
  removeFilterRule: "Ta bort filter", // needs review
  advancedFilterOperators: {
    contains: "Innehåller",
    notContains: "innehåller inte", // needs review
    startsWith: "Börjar med",
    endsWith: "Slutar med",
    equals: "Lika med",
    notEquals: "Inte lika med",
    isEmpty: "Tom",
    isNotEmpty: "Inte tom",
    greaterThan: "Större än",
    greaterThanOrEqual: "Större än eller lika med",
    lessThan: "Mindre än",
    lessThanOrEqual: "Mindre än eller lika med",
    between: "Mellan",
  },
  search: "Sök",
  searchPlaceholder: "Sök…", // needs review
  clearSearch: "Rensa sök",
  globalFilterMode: "Ändra sökläge",
  toggleDensity: "Växla densitet",
  densityComfortable: "Bekväm", // needs review
  densityCompact: "Kompakt", // needs review
  densitySpacious: "Rymlig", // needs review
  enterFullscreen: "Öppna helskärm", // needs review
  exitFullscreen: "Avsluta helskärm", // needs review
  rowsPerPage: "Rader per sida",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("sv")}–${end.toLocaleString("sv")} av ${total.toLocaleString("sv")}`, // needs review
  goToFirstPage: "Gå till första sidan",
  goToPreviousPage: "Gå till föregående sida",
  goToNextPage: "Gå till nästa sida",
  goToLastPage: "Gå till sista sidan",
  goToPage: (page) => `Gå till sida ${page.toLocaleString("sv")}`, // needs review
  rowActions: "Radåtgärder",
  edit: "Redigera",
  save: "Spara",
  cancel: "Avbryt",
  delete: "Ta bort", // needs review
  create: "Skapa", // needs review
  createNewRow: "Skapa ny rad", // needs review
  editRow: "Redigera rad", // needs review
  required: "Obligatoriskt", // needs review
  copy: "Kopiera",
  copied: "Kopierade till urklipp",
  cellActions: "Cellåtgärder", // needs review
  noRecordsToDisplay: "Inget att visa",
  loading: "Läser in…", // needs review
  loadingMore: "Läser in mer…", // needs review
  dragStart: (label) => `${label} har plockats upp.`, // needs review
  dragOver: (label, over) => `${label} är över ${over}.`, // needs review
  dragEnd: (label, over) => `${label} släpptes på ${over}.`, // needs review
  dragCancel: (label) => `Dragningen avbröts. ${label} släpptes.`, // needs review
  dragInstructions:
    "Tryck på mellanslag eller Enter för att plocka upp ett objekt. Använd piltangenterna för att flytta det under dragningen. Tryck på mellanslag eller Enter igen för att släppa det, eller tryck på Escape för att avbryta.", // needs review
  dragRowLabel: (position) => `Rad ${position.toLocaleString("sv")}`, // needs review
}
