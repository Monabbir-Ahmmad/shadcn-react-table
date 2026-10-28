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

export const dataTableLocalizationSk: DataTableLocalization = {
  language: "sk",
  selectAll: "Vybrať všetko",
  selectRow: "Vybrať riadok",
  clearSelection: "Vyčistiť výber",
  rowsSelected: (selected, total) =>
    `Vybrané ${selected.toLocaleString("sk")} z ${total.toLocaleString("sk")} riadkov`, // needs review
  sortByColumnAsc: (column) => `Zoradiť podľa stĺpca ${column} vzostupne`, // needs review
  sortByColumnDesc: (column) => `Zoradiť podľa stĺpca ${column} zostupne`, // needs review
  sortAscending: "Zoradiť vzostupne", // needs review
  sortDescending: "Zoradiť zostupne", // needs review
  clearSort: "Vyčistiť zoradenie",
  sortedAscending: "Zoradené vzostupne", // needs review
  sortedDescending: "Zoradené zostupne", // needs review
  columnActions: "Akcie stĺpca",
  hideColumn: "Skryť stĺpec", // needs review
  showAllColumns: "Zobraziť všetky stĺpce",
  pinToLeft: "Pripnúť doľava",
  pinToRight: "Pripnúť doprava",
  unpin: "Odopnúť",
  reorderColumn: "Presunúť",
  reorderRow: "Presunúť",
  pinRow: "Pripnúť riadok", // needs review
  unpinRow: "Odopnúť riadok", // needs review
  resizeColumn: "Zmeniť šírku stĺpca", // needs review
  groupByColumn: (column) => `Zoskupiť podľa stĺpca ${column}`, // needs review
  ungroupByColumn: (column) => `Nezoskupovať podľa stĺpca ${column}`,
  groupedBy: "Zoskupené podľa", // needs review
  dropToGroupBy: "Presuňte sem stĺpec a zoskupte podľa neho", // needs review
  expand: "Otvoriť",
  collapse: "Zbaliť",
  expandAll: "Otvoriť všetko",
  collapseAll: "Zbaliť všetko",
  toggleRowExpanded: "Rozbaliť/zbaliť riadok", // needs review
  columnVisibility: "Zobraziť/Skryť stĺpce",
  toggleColumnVisibility: "Zobrazenie",
  filterByColumn: (column) => `Filtrovať podľa stĺpca ${column}`,
  clearFilter: "Vyčistiť filter",
  filterMode: "Režim filtra", // needs review
  changeFilterMode: "Zmeniť režim filtra",
  filterPlaceholder: (column) => `Filtrovať ${column}…`, // needs review
  showColumnFilters: "Zobraziť filtre", // needs review
  hideColumnFilters: "Skryť filtre", // needs review
  min: "Min.",
  max: "Max.",
  pickDate: "Vybrať dátum", // needs review
  pickDateRange: "Vybrať rozsah dátumov", // needs review
  true: "Pravda", // needs review
  false: "Nepravda", // needs review
  filterModes: {
    fuzzy: "Podobné",
    contains: "Obsahuje",
    startsWith: "Začína na",
    endsWith: "Končí na",
    equals: "Rovná sa",
    notEquals: "Nerovná sa",
    empty: "Prázdne",
    notEmpty: "Nie je prázdne",
    between: "Medzi",
    betweenInclusive: "Medzi",
    greaterThan: "Väčšie ako",
    greaterThanOrEqualTo: "Väčšie alebo rovné",
    lessThan: "Menšie ako",
    lessThanOrEqualTo: "Menšie alebo rovné",
    before: "Pred", // needs review
    after: "Po", // needs review
    betweenDates: "Medzi", // needs review
    equalsString: "Rovná sa",
    arrIncludesSome: "Obsahuje niektoré",
    equalsBool: "Rovná sa",
  },
  advancedFilters: "Rozšírené filtre", // needs review
  advancedFiltersMatchLabel: "Zhoda", // needs review
  advancedFiltersMatchAll: "Všetky", // needs review
  advancedFiltersMatchAny: "Ľubovoľné", // needs review
  advancedFiltersOf: "z nasledujúcich pravidiel", // needs review
  advancedFiltersAddRule: "Pridať filter", // needs review
  advancedFiltersApply: "Použiť", // needs review
  advancedFiltersClearAll: "Vyčistiť všetko", // needs review
  advancedFiltersColumn: "Stĺpec", // needs review
  advancedFiltersOperator: "Operátor", // needs review
  advancedFiltersValue: "Hodnota", // needs review
  advancedFiltersEmpty: "Zatiaľ žiadne filtre. Pridajte jeden a začnite.", // needs review
  removeFilterRule: "Odstrániť filter", // needs review
  advancedFilterOperators: {
    contains: "Obsahuje",
    notContains: "neobsahuje", // needs review
    startsWith: "Začína na",
    endsWith: "Končí na",
    equals: "Rovná sa",
    notEquals: "Nerovná sa",
    isEmpty: "Prázdne",
    isNotEmpty: "Nie je prázdne",
    greaterThan: "Väčšie ako",
    greaterThanOrEqual: "Väčšie alebo rovné",
    lessThan: "Menšie ako",
    lessThanOrEqual: "Menšie alebo rovné",
    between: "Medzi",
  },
  search: "Hľadať",
  searchPlaceholder: "Hľadať…", // needs review
  clearSearch: "Vyčistiť hľadanie",
  globalFilterMode: "Zmeniť režim hľadania",
  toggleDensity: "Zmeniť hustotu riadkov",
  densityComfortable: "Pohodlné", // needs review
  densityCompact: "Kompaktné", // needs review
  densitySpacious: "Priestranné", // needs review
  enterFullscreen: "Prejsť na celú obrazovku", // needs review
  exitFullscreen: "Ukončiť celú obrazovku", // needs review
  rowsPerPage: "Počet riadkov na stránke",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("sk")}–${end.toLocaleString("sk")} z ${total.toLocaleString("sk")}`, // needs review
  goToFirstPage: "Prvá strana",
  goToPreviousPage: "Predchádzajúca strana",
  goToNextPage: "Ďalšia strana",
  goToLastPage: "Posledná strana",
  goToPage: (page) => `Prejsť na stranu ${page.toLocaleString("sk")}`, // needs review
  rowActions: "Akcie riadku",
  edit: "Upraviť",
  save: "Uložiť",
  cancel: "Zrušiť",
  delete: "Odstrániť", // needs review
  create: "Vytvoriť", // needs review
  createNewRow: "Vytvoriť nový riadok", // needs review
  editRow: "Upraviť riadok", // needs review
  required: "Povinné", // needs review
  copy: "Kopírovať",
  copied: "Skopírovať do schránky",
  cellActions: "Akcie bunky", // needs review
  noRecordsToDisplay: "Žiadne záznamy na zobrazenie",
  loading: "Načítava sa…", // needs review
  loadingMore: "Načítava sa viac…", // needs review
  dragStart: (label) => `Zdvihnuté: ${label}.`, // needs review
  dragOver: (label, over) => `${label} je nad ${over}.`, // needs review
  dragEnd: (label, over) => `Pustené na ${over}: ${label}.`, // needs review
  dragCancel: (label) => `Presúvanie bolo zrušené. Pustené: ${label}.`, // needs review
  dragInstructions:
    "Ak chcete zdvihnúť položku, stlačte medzerník alebo Enter. Počas presúvania ju premiestňujte šípkami. Opätovným stlačením medzerníka alebo Enter ju pustíte, alebo stlačením Escape presúvanie zrušíte.", // needs review
  dragRowLabel: (position) => `Riadok ${position.toLocaleString("sk")}`, // needs review
}
