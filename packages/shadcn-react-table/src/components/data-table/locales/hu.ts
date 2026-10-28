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

export const dataTableLocalizationHu: DataTableLocalization = {
  language: "hu",
  selectAll: "Összes kiválasztás váltása",
  selectRow: "Sor kiválasztás váltása",
  clearSelection: "Kiválasztás törlése",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("hu")} kiválasztva ${total.toLocaleString("hu")} sorból`, // needs review
  sortByColumnAsc: (column) => `${column} szerinti növekvő rendezés`, // needs review
  sortByColumnDesc: (column) => `${column} szerinti csökkenő rendezés`, // needs review
  sortAscending: "Növekvő rendezés", // needs review
  sortDescending: "Csökkenő rendezés", // needs review
  clearSort: "Rendezés törlése",
  sortedAscending: "Növekvően rendezve", // needs review
  sortedDescending: "Csökkenően rendezve", // needs review
  columnActions: "Oszlop műveletek",
  hideColumn: "Oszlop elrejtése", // needs review
  showAllColumns: "Összes oszlop mutatása",
  pinToLeft: "Rögzítés balra",
  pinToRight: "Rögzítés jobbra",
  unpin: "Feloldás",
  reorderColumn: "Mozgatás",
  reorderRow: "Mozgatás",
  pinRow: "Sor rögzítése", // needs review
  unpinRow: "Sor rögzítésének feloldása", // needs review
  resizeColumn: "Oszlop átméretezése", // needs review
  groupByColumn: (column) => `Csoportosítás ${column} szerint`, // needs review
  ungroupByColumn: (column) => `Csoportosítás megszüntetése: ${column}`,
  groupedBy: "Csoportosítva", // needs review
  dropToGroupBy: "Húzzon ide egy oszlopot a csoportosításhoz", // needs review
  expand: "Kibontás",
  collapse: "Összecsukás",
  expandAll: "Mindet kibont",
  collapseAll: "Mindet összecsuk",
  toggleRowExpanded: "Sor kibontása/összecsukása", // needs review
  columnVisibility: "Oszlopok mutatása/elrejtése",
  toggleColumnVisibility: "Láthatóság váltása",
  filterByColumn: (column) => `Szűrés: ${column} alapján`,
  clearFilter: "Szűrő törlése",
  filterMode: "Szűrő mód", // needs review
  changeFilterMode: "Szűrő módjának megváltoztatása",
  filterPlaceholder: (column) => `${column} szűrése…`, // needs review
  showColumnFilters: "Szűrők mutatása", // needs review
  hideColumnFilters: "Szűrők elrejtése", // needs review
  min: "Min",
  max: "Max",
  pickDate: "Dátum kiválasztása", // needs review
  pickDateRange: "Dátumtartomány kiválasztása", // needs review
  true: "Igaz", // needs review
  false: "Hamis", // needs review
  filterModes: {
    fuzzy: "Pontatlan",
    contains: "Tartalmazza",
    startsWith: "Kezdődik",
    endsWith: "Végződik",
    equals: "Egyenlő",
    notEquals: "Nem egyenlő",
    empty: "Üres",
    notEmpty: "Nem üres",
    between: "Között",
    betweenInclusive: "Között (beleértve)",
    greaterThan: "Nagyobb, mint",
    greaterThanOrEqualTo: "Nagyobb vagy egyenlő, mint",
    lessThan: "Kisebb, mint",
    lessThanOrEqualTo: "Kisebb vagy egyenlő, mint",
    before: "Előtt", // needs review
    after: "Után", // needs review
    betweenDates: "Között", // needs review
    equalsString: "Egyenlő",
    arrIncludesSome: "Tartalmazza",
    equalsBool: "Egyenlő",
  },
  advancedFilters: "Speciális szűrők", // needs review
  advancedFiltersMatchLabel: "Teljesüljön", // needs review
  advancedFiltersMatchAll: "mindegyik", // needs review
  advancedFiltersMatchAny: "bármelyik", // needs review
  advancedFiltersOf: "az alábbi szabályok közül", // needs review
  advancedFiltersAddRule: "Szűrő hozzáadása", // needs review
  advancedFiltersApply: "Alkalmaz", // needs review
  advancedFiltersClearAll: "Összes törlése", // needs review
  advancedFiltersColumn: "Oszlop", // needs review
  advancedFiltersOperator: "Operátor", // needs review
  advancedFiltersValue: "Érték", // needs review
  advancedFiltersEmpty: "Még nincsenek szűrők. Adjon hozzá egyet a kezdéshez.", // needs review
  removeFilterRule: "Szűrő eltávolítása", // needs review
  advancedFilterOperators: {
    contains: "Tartalmazza",
    notContains: "nem tartalmazza", // needs review
    startsWith: "Kezdődik",
    endsWith: "Végződik",
    equals: "Egyenlő",
    notEquals: "Nem egyenlő",
    isEmpty: "Üres",
    isNotEmpty: "Nem üres",
    greaterThan: "Nagyobb, mint",
    greaterThanOrEqual: "Nagyobb vagy egyenlő, mint",
    lessThan: "Kisebb, mint",
    lessThanOrEqual: "Kisebb vagy egyenlő, mint",
    between: "Között",
  },
  search: "Keresés",
  searchPlaceholder: "Keresés…", // needs review
  clearSearch: "Keresés törlése",
  globalFilterMode: "Keresés módjának megváltoztatása",
  toggleDensity: "Sűrűség váltása",
  densityComfortable: "Kényelmes", // needs review
  densityCompact: "Kompakt", // needs review
  densitySpacious: "Tágas", // needs review
  enterFullscreen: "Belépés a teljes képernyős módba", // needs review
  exitFullscreen: "Kilépés a teljes képernyős módból", // needs review
  rowsPerPage: "Sorok oldalanként",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("hu")}–${end.toLocaleString("hu")} / ${total.toLocaleString("hu")}`, // needs review
  goToFirstPage: "Ugrás az első oldalra",
  goToPreviousPage: "Ugrás az előző oldalra",
  goToNextPage: "Ugrás a következő oldalra",
  goToLastPage: "Ugrás az utolsó oldalra",
  goToPage: (page) => `Ugrás ide: ${page.toLocaleString("hu")}. oldal`, // needs review
  rowActions: "Sor műveletek",
  edit: "Szerkesztés",
  save: "Mentés",
  cancel: "Mégse",
  delete: "Törlés", // needs review
  create: "Létrehozás", // needs review
  createNewRow: "Új sor létrehozása", // needs review
  editRow: "Sor szerkesztése", // needs review
  required: "Kötelező", // needs review
  copy: "Másolás",
  copied: "Vágólapra másolva",
  cellActions: "Cellaműveletek", // needs review
  noRecordsToDisplay: "Nincsenek megjeleníthető rekordok",
  loading: "Betöltés…", // needs review
  loadingMore: "További elemek betöltése…", // needs review
  dragStart: (label) => `${label} felvéve.`, // needs review
  dragOver: (label, over) => `${label} a következő felett van: ${over}.`, // needs review
  dragEnd: (label, over) => `${label} elengedve ide: ${over}.`, // needs review
  dragCancel: (label) => `A húzás megszakítva. ${label} elengedve.`, // needs review
  dragInstructions:
    "Elem felvételéhez nyomja meg a szóközt vagy az Entert. Húzás közben a nyílbillentyűkkel mozgathatja. A leejtéshez nyomja meg újra a szóközt vagy az Entert, a megszakításhoz pedig az Escape billentyűt.", // needs review
  dragRowLabel: (position) => `${position.toLocaleString("hu")}. sor`, // needs review
}
