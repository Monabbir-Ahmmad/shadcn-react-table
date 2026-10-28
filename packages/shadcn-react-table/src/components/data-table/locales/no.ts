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

export const dataTableLocalizationNo: DataTableLocalization = {
  language: "no",
  selectAll: "Velg alle",
  selectRow: "Velg rad",
  clearSelection: "Tøm valg",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("no")} av ${total.toLocaleString("no")} rader valgt`, // needs review
  sortByColumnAsc: (column) => `Sorter etter ${column} stigende`, // needs review
  sortByColumnDesc: (column) => `Sorter etter ${column} synkende`, // needs review
  sortAscending: "Sorter stigende", // needs review
  sortDescending: "Sorter synkende", // needs review
  clearSort: "Tøm sortering",
  sortedAscending: "Sortert stigende", // needs review
  sortedDescending: "Sortert synkende", // needs review
  columnActions: "Kolonnehandlinger",
  hideColumn: "Skjul kolonne", // needs review
  showAllColumns: "Vis alle kolonner",
  pinToLeft: "Fest til venstre",
  pinToRight: "Fest til høyre",
  unpin: "Løsne",
  reorderColumn: "Flytt",
  reorderRow: "Flytt",
  pinRow: "Fest rad", // needs review
  unpinRow: "Løsne rad", // needs review
  resizeColumn: "Endre kolonnestørrelse", // needs review
  groupByColumn: (column) => `Grupper etter ${column}`, // needs review
  ungroupByColumn: (column) => `Oppgrupper etter ${column}`,
  groupedBy: "Gruppert etter", // needs review
  dropToGroupBy: "Dra en kolonne hit for å gruppere etter den", // needs review
  expand: "Utvid",
  collapse: "Kollaps",
  expandAll: "Utvid alle",
  collapseAll: "Kollapse alle",
  toggleRowExpanded: "Utvid/skjul rad", // needs review
  columnVisibility: "Vis/skjul kolonner",
  toggleColumnVisibility: "Synlighet",
  filterByColumn: (column) => `Filter etter kolonne ${column}`,
  clearFilter: "Tøm filter",
  filterMode: "Filtermodus", // needs review
  changeFilterMode: "Endre filtermodus",
  filterPlaceholder: (column) => `Filtrer ${column}…`, // needs review
  showColumnFilters: "Vis filter", // needs review
  hideColumnFilters: "Skjul filter", // needs review
  min: "Min",
  max: "Maks",
  pickDate: "Velg en dato", // needs review
  pickDateRange: "Velg et datoområde", // needs review
  true: "Sann", // needs review
  false: "Usann", // needs review
  filterModes: {
    fuzzy: "Fuzzy",
    contains: "Inneholder",
    startsWith: "Starter med",
    endsWith: "Slutter med",
    equals: "Er lik",
    notEquals: "Er ikke lik",
    empty: "Er tom",
    notEmpty: "Er ikke tom",
    between: "Mellom",
    betweenInclusive: "Mellom (inkluderende)",
    greaterThan: "Større enn",
    greaterThanOrEqualTo: "Større eller lik",
    lessThan: "Mindre enn",
    lessThanOrEqualTo: "Mindre eller lik",
    before: "Før", // needs review
    after: "Etter", // needs review
    betweenDates: "Mellom", // needs review
    equalsString: "Er lik",
    arrIncludesSome: "Inkluderer noen",
    equalsBool: "Er lik",
  },
  advancedFilters: "Avanserte filtre", // needs review
  advancedFiltersMatchLabel: "Samsvar med", // needs review
  advancedFiltersMatchAll: "alle", // needs review
  advancedFiltersMatchAny: "minst én", // needs review
  advancedFiltersOf: "av følgende regler", // needs review
  advancedFiltersAddRule: "Legg til filter", // needs review
  advancedFiltersApply: "Bruk", // needs review
  advancedFiltersClearAll: "Fjern alle", // needs review
  advancedFiltersColumn: "Kolonne", // needs review
  advancedFiltersOperator: "Operator", // needs review
  advancedFiltersValue: "Verdi", // needs review
  advancedFiltersEmpty: "Ingen filtre ennå. Legg til ett for å komme i gang.", // needs review
  removeFilterRule: "Fjern filter", // needs review
  advancedFilterOperators: {
    contains: "Inneholder",
    notContains: "inneholder ikke", // needs review
    startsWith: "Starter med",
    endsWith: "Slutter med",
    equals: "Er lik",
    notEquals: "Er ikke lik",
    isEmpty: "Er tom",
    isNotEmpty: "Er ikke tom",
    greaterThan: "Større enn",
    greaterThanOrEqual: "Større eller lik",
    lessThan: "Mindre enn",
    lessThanOrEqual: "Mindre eller lik",
    between: "Mellom",
  },
  search: "Søk",
  searchPlaceholder: "Søk…", // needs review
  clearSearch: "Tøm søk",
  globalFilterMode: "Endre søkemodus",
  toggleDensity: "Endre tetthet",
  densityComfortable: "Komfortabel", // needs review
  densityCompact: "Kompakt", // needs review
  densitySpacious: "Romslig", // needs review
  enterFullscreen: "Gå til fullskjerm", // needs review
  exitFullscreen: "Avslutt fullskjerm", // needs review
  rowsPerPage: "Rader per side",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("no")}–${end.toLocaleString("no")} av ${total.toLocaleString("no")}`, // needs review
  goToFirstPage: "Gå til første side",
  goToPreviousPage: "Gå til forrige side",
  goToNextPage: "Gå til neste side",
  goToLastPage: "Gå til siste side",
  goToPage: (page) => `Gå til side ${page.toLocaleString("no")}`, // needs review
  rowActions: "Radhandlinger",
  edit: "Rediger",
  save: "Lagre",
  cancel: "Avbryt",
  delete: "Slett", // needs review
  create: "Opprett", // needs review
  createNewRow: "Opprett ny rad", // needs review
  editRow: "Rediger rad", // needs review
  required: "Påkrevd", // needs review
  copy: "Kopier",
  copied: "Kopiert til utklippstavlen",
  cellActions: "Cellehandlinger", // needs review
  noRecordsToDisplay: "Ingen poster å vise",
  loading: "Laster…", // needs review
  loadingMore: "Laster mer…", // needs review
  dragStart: (label) => `Plukket opp ${label}.`, // needs review
  dragOver: (label, over) => `${label} er over ${over}.`, // needs review
  dragEnd: (label, over) => `${label} ble sluppet på ${over}.`, // needs review
  dragCancel: (label) => `Dra-operasjonen ble avbrutt. ${label} ble sluppet.`, // needs review
  dragInstructions:
    "For å plukke opp et element, trykk mellomrom eller enter. Mens du drar, bruker du piltastene for å flytte det. Trykk mellomrom eller enter igjen for å slippe det, eller trykk escape for å avbryte.", // needs review
  dragRowLabel: (position) => `Rad ${position.toLocaleString("no")}`, // needs review
}
