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

export const dataTableLocalizationCs: DataTableLocalization = {
  language: "cs",
  selectAll: "Vybrat vše",
  selectRow: "Vybrat řádku",
  clearSelection: "Vyčistit výběr",
  rowsSelected: (selected, total) =>
    `Vybráno ${selected.toLocaleString("cs")} z ${total.toLocaleString("cs")} řádků`, // needs review
  sortByColumnAsc: (column) => `Seřadit podle sloupce ${column} vzestupně`, // needs review
  sortByColumnDesc: (column) => `Seřadit podle sloupce ${column} sestupně`, // needs review
  sortAscending: "Seřadit vzestupně", // needs review
  sortDescending: "Seřadit sestupně", // needs review
  clearSort: "vyčistit řazení",
  sortedAscending: "Seřazeno vzestupně", // needs review
  sortedDescending: "Seřazeno sestupně", // needs review
  columnActions: "Akce sloupce",
  hideColumn: "Skrýt sloupec", // needs review
  showAllColumns: "Zobrazit všechny sloupce",
  pinToLeft: "Připnout doleva",
  pinToRight: "Připnout doprava",
  unpin: "Odepnout",
  reorderColumn: "Přesunout",
  reorderRow: "Přesunout",
  pinRow: "Připnout řádek", // needs review
  unpinRow: "Odepnout řádek", // needs review
  resizeColumn: "Změnit šířku sloupce", // needs review
  groupByColumn: (column) => `Seskupit podle sloupce ${column}`, // needs review
  ungroupByColumn: (column) => `Neseskupovat podle sloupce ${column}`,
  groupedBy: "Seskupeno podle", // needs review
  dropToGroupBy: "Přetáhněte sem sloupec pro seskupení podle něj", // needs review
  expand: "Otevřít",
  collapse: "Sbalit",
  expandAll: "Otevřít vše",
  collapseAll: "Sbalit vše",
  toggleRowExpanded: "Rozbalit/sbalit řádek", // needs review
  columnVisibility: "Zobrazit/Skrýt sloupce",
  toggleColumnVisibility: "Zobrazení",
  filterByColumn: (column) => `Filtrovat podle sloupce ${column}`,
  clearFilter: "Vyčistit filtr",
  filterMode: "Režim filtru", // needs review
  changeFilterMode: "Změnit režim filtru",
  filterPlaceholder: (column) => `Filtrovat sloupec ${column}…`, // needs review
  showColumnFilters: "Zobrazit filtry", // needs review
  hideColumnFilters: "Skrýt filtry", // needs review
  min: "Min.",
  max: "Max.",
  pickDate: "Vybrat datum", // needs review
  pickDateRange: "Vybrat období", // needs review
  true: "Pravda", // needs review
  false: "Nepravda", // needs review
  filterModes: {
    fuzzy: "Podobné",
    contains: "Obsahuje",
    startsWith: "Začíná na",
    endsWith: "Končí na",
    equals: "Rovná se",
    notEquals: "Nerovná se",
    empty: "Prázdné",
    notEmpty: "Není prázdné",
    between: "Mezi",
    betweenInclusive: "Mezi",
    greaterThan: "Větší než",
    greaterThanOrEqualTo: "Větší nebo rovno",
    lessThan: "Menší než",
    lessThanOrEqualTo: "Menší nebo rovno",
    before: "Před", // needs review
    after: "Po", // needs review
    betweenDates: "Mezi", // needs review
    equalsString: "Rovná se",
    arrIncludesSome: "Obsahuje některé",
    equalsBool: "Rovná se",
  },
  advancedFilters: "Pokročilé filtry", // needs review
  advancedFiltersMatch: (logic) =>
    `Shoduje se ${logic} z následujících pravidel`, // needs review
  advancedFiltersMatchAll: "Všechna", // needs review
  advancedFiltersMatchAny: "Libovolné", // needs review
  advancedFiltersAddRule: "Přidat filtr", // needs review
  advancedFiltersApply: "Použít", // needs review
  advancedFiltersClearAll: "Vymazat vše", // needs review
  advancedFiltersColumn: "Sloupec", // needs review
  advancedFiltersOperator: "Operátor", // needs review
  advancedFiltersValue: "Hodnota", // needs review
  advancedFiltersEmpty: "Zatím žádné filtry. Začněte přidáním jednoho.", // needs review
  removeFilterRule: "Odebrat filtr", // needs review
  advancedFilterOperators: {
    contains: "Obsahuje",
    notContains: "neobsahuje", // needs review
    startsWith: "Začíná na",
    endsWith: "Končí na",
    equals: "Rovná se",
    notEquals: "Nerovná se",
    isEmpty: "Prázdné",
    isNotEmpty: "Není prázdné",
    greaterThan: "Větší než",
    greaterThanOrEqual: "Větší nebo rovno",
    lessThan: "Menší než",
    lessThanOrEqual: "Menší nebo rovno",
    between: "Mezi",
  },
  search: "Hledat",
  searchPlaceholder: "Hledat…", // needs review
  clearSearch: "Vyčistit hledání",
  globalFilterMode: "Změnit režim hledání",
  toggleDensity: "Změnit hustotu řádek",
  densityComfortable: "Pohodlné", // needs review
  densityCompact: "Kompaktní", // needs review
  densitySpacious: "Prostorné", // needs review
  enterFullscreen: "Zobrazit na celou obrazovku", // needs review
  exitFullscreen: "Ukončit zobrazení na celou obrazovku", // needs review
  rowsPerPage: "Řádek na stránce",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("cs")}–${end.toLocaleString("cs")} z ${total.toLocaleString("cs")}`, // needs review
  goToFirstPage: "První strana",
  goToPreviousPage: "Předchozí strana",
  goToNextPage: "Další strana",
  goToLastPage: "Poslední strana",
  goToPage: (page) => `Přejít na stranu ${page.toLocaleString("cs")}`, // needs review
  rowActions: "Akce řádky",
  edit: "Upravit",
  save: "Uložit",
  cancel: "Zrušit",
  delete: "Smazat", // needs review
  create: "Vytvořit", // needs review
  createNewRow: "Vytvořit nový řádek", // needs review
  editRow: "Upravit řádek", // needs review
  required: "Povinné", // needs review
  copy: "Kopírovat",
  copied: "Zkopírovat do schránky",
  cellActions: "Akce buňky", // needs review
  noRecordsToDisplay: "Žádné záznamy k zobrazení",
  loading: "Načítání…", // needs review
  loadingMore: "Načítání dalších…", // needs review
  dragStart: (label) => `Zvednuta položka ${label}.`, // needs review
  dragOver: (label, over) => `Položka ${label} je nad položkou ${over}.`, // needs review
  dragEnd: (label, over) =>
    `Položka ${label} byla upuštěna na položku ${over}.`, // needs review
  dragCancel: (label) =>
    `Přetahování bylo zrušeno. Položka ${label} byla upuštěna.`, // needs review
  dragInstructions:
    "Chcete-li položku zvednout, stiskněte mezerník nebo Enter. Při přetahování ji přesouvejte šipkami. Dalším stisknutím mezerníku nebo Enter ji upustíte, klávesou Escape akci zrušíte.", // needs review
  dragRowLabel: (position) => `Řádek ${position.toLocaleString("cs")}`, // needs review
  noResultsFound: "Nenalezeny žádné výsledky",
}
