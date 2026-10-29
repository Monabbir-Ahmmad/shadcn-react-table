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

export const dataTableLocalizationDa: DataTableLocalization = {
  language: "da",
  selectAll: "Vælg alle rækker",
  selectRow: "Vælg række",
  clearSelection: "Ryd valg",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("da")} af ${total.toLocaleString("da")} rækker valgt`, // needs review
  sortByColumnAsc: (column) => `Sortér efter ${column} stigende`, // needs review
  sortByColumnDesc: (column) => `Sortér efter ${column} faldende`, // needs review
  sortAscending: "Sortér stigende", // needs review
  sortDescending: "Sortér faldende", // needs review
  clearSort: "Ryd sortering",
  sortedAscending: "Sorteret stigende", // needs review
  sortedDescending: "Sorteret faldende", // needs review
  columnActions: "Kolonnehandlinger",
  hideColumn: "Skjul kolonne", // needs review
  showAllColumns: "Vis alle kolonner",
  pinToLeft: "Fastgør til venstre",
  pinToRight: "Fastgør til højre",
  unpin: "Frigør",
  reorderColumn: "Flyt",
  reorderRow: "Flyt",
  pinRow: "Fastgør række", // needs review
  unpinRow: "Frigør række", // needs review
  resizeColumn: "Tilpas kolonnebredde", // needs review
  groupByColumn: (column) => `Gruppér efter ${column}`, // needs review
  ungroupByColumn: (column) => `Fjern gruppering efter ${column}`,
  groupedBy: "Grupperet efter", // needs review
  dropToGroupBy: "Træk en kolonne hertil for at gruppere efter den", // needs review
  expand: "Udvid",
  collapse: "Luk",
  expandAll: "Udvid alle",
  collapseAll: "Luk alle",
  toggleRowExpanded: "Udvid/skjul række", // needs review
  columnVisibility: "Vis/Skjul kolonner",
  toggleColumnVisibility: "Skift synlighed",
  filterByColumn: (column) => `Filtrér efter ${column}`,
  clearFilter: "Ryd filter",
  filterMode: "Filtertilstand", // needs review
  changeFilterMode: "Skift filtertilstand",
  filterPlaceholder: (column) => `Filtrér ${column}…`, // needs review
  showColumnFilters: "Vis filtre", // needs review
  hideColumnFilters: "Skjul filtre", // needs review
  min: "Min",
  max: "Maks",
  pickDate: "Vælg en dato", // needs review
  pickDateRange: "Vælg et datointerval", // needs review
  true: "Sand", // needs review
  false: "Falsk", // needs review
  filterModes: {
    fuzzy: "Fuzzy",
    contains: "Indeholder",
    startsWith: "Begynder Med",
    endsWith: "Ender Med",
    equals: "Lig Med",
    notEquals: "Forskellig Fra",
    empty: "Tom",
    notEmpty: "Ikke Tom",
    between: "Mellem",
    betweenInclusive: "Mellem Inklusive",
    greaterThan: "Større End",
    greaterThanOrEqualTo: "Større End Eller Lig Med",
    lessThan: "Mindre End",
    lessThanOrEqualTo: "Mindre End Eller Lig Med",
    before: "Før", // needs review
    after: "Efter", // needs review
    betweenDates: "Mellem", // needs review
    equalsString: "Lig Med",
    arrIncludesSome: "Indeholder",
    equalsBool: "Lig Med",
  },
  advancedFilters: "Avancerede filtre", // needs review
  advancedFiltersMatch: (logic) => `Match ${logic} af følgende regler`, // needs review
  advancedFiltersMatchAll: "Alle", // needs review
  advancedFiltersMatchAny: "Nogen", // needs review
  advancedFiltersAddRule: "Tilføj filter", // needs review
  advancedFiltersApply: "Anvend", // needs review
  advancedFiltersClearAll: "Ryd alle", // needs review
  advancedFiltersColumn: "Kolonne", // needs review
  advancedFiltersOperator: "Operator", // needs review
  advancedFiltersValue: "Værdi", // needs review
  advancedFiltersEmpty: "Ingen filtre endnu. Tilføj et for at komme i gang.", // needs review
  removeFilterRule: "Fjern filter", // needs review
  advancedFilterOperators: {
    contains: "Indeholder",
    notContains: "indeholder ikke", // needs review
    startsWith: "Begynder Med",
    endsWith: "Ender Med",
    equals: "Lig Med",
    notEquals: "Forskellig Fra",
    isEmpty: "Tom",
    isNotEmpty: "Ikke Tom",
    greaterThan: "Større End",
    greaterThanOrEqual: "Større End Eller Lig Med",
    lessThan: "Mindre End",
    lessThanOrEqual: "Mindre End Eller Lig Med",
    between: "Mellem",
  },
  search: "Søg",
  searchPlaceholder: "Søg…", // needs review
  clearSearch: "Ryd søgning",
  globalFilterMode: "Skift søgetilstand",
  toggleDensity: "Skift tæthed",
  densityComfortable: "Komfortabel", // needs review
  densityCompact: "Kompakt", // needs review
  densitySpacious: "Rummelig", // needs review
  enterFullscreen: "Gå til fuldskærm", // needs review
  exitFullscreen: "Afslut fuldskærm", // needs review
  rowsPerPage: "Rækker per side",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("da")}–${end.toLocaleString("da")} af ${total.toLocaleString("da")}`, // needs review
  goToFirstPage: "Gå til første side",
  goToPreviousPage: "Gå til forrige side",
  goToNextPage: "Gå til næste side",
  goToLastPage: "Gå til sidste side",
  goToPage: (page) => `Gå til side ${page.toLocaleString("da")}`, // needs review
  rowActions: "Rækkehandlinger",
  edit: "Rediger",
  save: "Gem",
  cancel: "Annuller",
  delete: "Slet", // needs review
  create: "Opret", // needs review
  createNewRow: "Opret ny række", // needs review
  editRow: "Rediger række", // needs review
  required: "Påkrævet", // needs review
  copy: "Kopier",
  copied: "Gemt i udklipsholder",
  cellActions: "Cellehandlinger", // needs review
  noRecordsToDisplay: "Ingen rækker at vise",
  loading: "Indlæser…", // needs review
  loadingMore: "Indlæser mere…", // needs review
  dragStart: (label) => `${label} blev samlet op.`, // needs review
  dragOver: (label, over) => `${label} er over ${over}.`, // needs review
  dragEnd: (label, over) => `${label} blev sluppet på ${over}.`, // needs review
  dragCancel: (label) => `Træk blev annulleret. ${label} blev sluppet.`, // needs review
  dragInstructions:
    "Tryk på mellemrum eller Enter for at samle et element op. Brug piletasterne til at flytte det under træk. Tryk på mellemrum eller Enter igen for at slippe det, eller tryk på Escape for at annullere.", // needs review
  dragRowLabel: (position) => `Række ${position.toLocaleString("da")}`, // needs review
}
