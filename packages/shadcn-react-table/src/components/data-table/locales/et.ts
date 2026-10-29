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

export const dataTableLocalizationEt: DataTableLocalization = {
  language: "et",
  selectAll: "Vaheta vali kõik",
  selectRow: "Vaheta vali rida",
  clearSelection: "Tühjenda valik",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("et")} / ${total.toLocaleString("et")} rida valitud`, // needs review
  sortByColumnAsc: (column) => `Sorteeri veeru ${column} järgi tõusvalt`, // needs review
  sortByColumnDesc: (column) => `Sorteeri veeru ${column} järgi langevalt`, // needs review
  sortAscending: "Sorteeri tõusvalt", // needs review
  sortDescending: "Sorteeri langevalt", // needs review
  clearSort: "Tühjenda sorteerimine",
  sortedAscending: "Sorteeritud tõusvalt", // needs review
  sortedDescending: "Sorteeritud langevalt", // needs review
  columnActions: "Veeru toimingud",
  hideColumn: "Peida veerg", // needs review
  showAllColumns: "Näita kõiki veerge",
  pinToLeft: "Kinnita vasakule",
  pinToRight: "Kinnita paremale",
  unpin: "Eemalda kinnitamine",
  reorderColumn: "Liiguta",
  reorderRow: "Liiguta",
  pinRow: "Kinnista rida", // needs review
  unpinRow: "Vabasta rida", // needs review
  resizeColumn: "Muuda veeru suurust", // needs review
  groupByColumn: (column) => `Rühmita veeru ${column} järgi`, // needs review
  ungroupByColumn: (column) => `Eemalda rühmitamine veeru ${column} järgi`,
  groupedBy: "Rühmitatud veeru järgi", // needs review
  dropToGroupBy: "Lohista veerg siia, et selle järgi rühmitada", // needs review
  expand: "Laienda",
  collapse: "Ahenda",
  expandAll: "Laienda kõik",
  collapseAll: "Ahenda kõik",
  toggleRowExpanded: "Laienda/ahenda rida", // needs review
  columnVisibility: "Näita/peida veerge",
  toggleColumnVisibility: "Vaheta nähtavust",
  filterByColumn: (column) => `Filtreeri veeru ${column} järgi`,
  clearFilter: "Tühista filter",
  filterMode: "Filtri režiim", // needs review
  changeFilterMode: "Muuda filtri režiimi",
  filterPlaceholder: (column) => `Filtreeri ${column}…`, // needs review
  showColumnFilters: "Näita filtreid", // needs review
  hideColumnFilters: "Peida filtrid", // needs review
  min: "Minimaalne",
  max: "Maksimaalne",
  pickDate: "Vali kuupäev", // needs review
  pickDateRange: "Vali kuupäevavahemik", // needs review
  true: "Tõene", // needs review
  false: "Väär", // needs review
  filterModes: {
    fuzzy: "Hägune",
    contains: "Sisaldab",
    startsWith: "Algab",
    endsWith: "Lõpeb",
    equals: "On võrdne",
    notEquals: "Ei ole võrdne",
    empty: "Tühi",
    notEmpty: "Ei ole tühi",
    between: "Vahemikus",
    betweenInclusive: "Vahemikus kaasa arvatud",
    greaterThan: "Suurem kui",
    greaterThanOrEqualTo: "Suurem või võrdne",
    lessThan: "Väiksem kui",
    lessThanOrEqualTo: "Väiksem või võrdne",
    before: "Enne", // needs review
    after: "Pärast", // needs review
    betweenDates: "Vahemikus", // needs review
    equalsString: "On võrdne",
    arrIncludesSome: "Sisaldab",
    equalsBool: "On võrdne",
  },
  advancedFilters: "Täpsemad filtrid", // needs review
  advancedFiltersMatch: (logic) => `Vasta ${logic} järgmistele reeglitele`, // needs review
  advancedFiltersMatchAll: "Kõigile", // needs review
  advancedFiltersMatchAny: "Mis tahes", // needs review
  advancedFiltersAddRule: "Lisa filter", // needs review
  advancedFiltersApply: "Rakenda", // needs review
  advancedFiltersClearAll: "Tühjenda kõik", // needs review
  advancedFiltersColumn: "Veerg", // needs review
  advancedFiltersOperator: "Operaator", // needs review
  advancedFiltersValue: "Väärtus", // needs review
  advancedFiltersEmpty: "Filtreid veel pole. Alustamiseks lisa üks.", // needs review
  removeFilterRule: "Eemalda filter", // needs review
  advancedFilterOperators: {
    contains: "Sisaldab",
    notContains: "ei sisalda", // needs review
    startsWith: "Algab",
    endsWith: "Lõpeb",
    equals: "On võrdne",
    notEquals: "Ei ole võrdne",
    isEmpty: "Tühi",
    isNotEmpty: "Ei ole tühi",
    greaterThan: "Suurem kui",
    greaterThanOrEqual: "Suurem või võrdne",
    lessThan: "Väiksem kui",
    lessThanOrEqual: "Väiksem või võrdne",
    between: "Vahemikus",
  },
  search: "Otsi",
  searchPlaceholder: "Otsi…", // needs review
  clearSearch: "Tühjenda otsing",
  globalFilterMode: "Muuda otsingu režiimi",
  toggleDensity: "Vaheta tihedust",
  densityComfortable: "Mugav", // needs review
  densityCompact: "Kompaktne", // needs review
  densitySpacious: "Avar", // needs review
  enterFullscreen: "Lülita täisekraanile", // needs review
  exitFullscreen: "Välju täisekraanilt", // needs review
  rowsPerPage: "Ridu leheküljel",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("et")}–${end.toLocaleString("et")} / ${total.toLocaleString("et")}`, // needs review
  goToFirstPage: "Mine esimesele lehele",
  goToPreviousPage: "Mine eelnevale lehele",
  goToNextPage: "Mine järgmisele lehele",
  goToLastPage: "Mine viimasele lehele",
  goToPage: (page) => `Mine lehele ${page.toLocaleString("et")}`, // needs review
  rowActions: "Rea toimingud",
  edit: "Muuda",
  save: "Salvesta",
  cancel: "Tühista",
  delete: "Kustuta", // needs review
  create: "Loo", // needs review
  createNewRow: "Loo uus rida", // needs review
  editRow: "Muuda rida", // needs review
  required: "Kohustuslik", // needs review
  copy: "Kopeeri",
  copied: "Kopeeritud lõikelauale",
  cellActions: "Lahtri toimingud", // needs review
  noRecordsToDisplay: "Kuvamiseks pole kirjeid",
  loading: "Laadimine…", // needs review
  loadingMore: "Laaditakse veel…", // needs review
  dragStart: (label) => `${label} võeti üles.`, // needs review
  dragOver: (label, over) => `${label} on objekti ${over} kohal.`, // needs review
  dragEnd: (label, over) => `${label} lasti maha objekti ${over} peale.`, // needs review
  dragCancel: (label) => `Lohistamine tühistati. ${label} lasti maha.`, // needs review
  dragInstructions:
    "Elemendi üleskorjamiseks vajuta tühikuklahvi või sisestusklahvi. Lohistamise ajal liiguta seda nooleklahvidega. Selle mahalaskmiseks vajuta uuesti tühikuklahvi või sisestusklahvi, tühistamiseks vajuta Esc.", // needs review
  dragRowLabel: (position) => `Rida ${position.toLocaleString("et")}`, // needs review
}
