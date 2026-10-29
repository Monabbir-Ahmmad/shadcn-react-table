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

export const dataTableLocalizationNl: DataTableLocalization = {
  language: "nl",
  selectAll: "Toggle selecteer alles",
  selectRow: "Toggle selecteer rij",
  clearSelection: "Selectie wissen",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("nl")} van ${total.toLocaleString("nl")} rijen geselecteerd`, // needs review
  sortByColumnAsc: (column) => `Sorteer op ${column} oplopend`, // needs review
  sortByColumnDesc: (column) => `Sorteer op ${column} aflopend`, // needs review
  sortAscending: "Sorteer oplopend", // needs review
  sortDescending: "Sorteer aflopend", // needs review
  clearSort: "Annuleer sortering",
  sortedAscending: "Oplopend gesorteerd", // needs review
  sortedDescending: "Aflopend gesorteerd", // needs review
  columnActions: "Kolom acties",
  hideColumn: "Verberg kolom", // needs review
  showAllColumns: "Toon alle kolommen",
  pinToLeft: "Links vastzetten",
  pinToRight: "Rechts vastzetten",
  unpin: "Losmaken",
  reorderColumn: "Verplaatsen",
  reorderRow: "Verplaatsen",
  pinRow: "Rij vastzetten", // needs review
  unpinRow: "Rij losmaken", // needs review
  resizeColumn: "Kolomgrootte aanpassen", // needs review
  groupByColumn: (column) => `Groepeer op ${column}`, // needs review
  ungroupByColumn: (column) => `Stop groeperen op ${column}`,
  groupedBy: "Gegroepeerd op", // needs review
  dropToGroupBy: "Sleep een kolom hierheen om erop te groeperen", // needs review
  expand: "Breidt uit",
  collapse: "Samenvouwen",
  expandAll: "Alles uitbreiden",
  collapseAll: "Alles samenvouwen",
  toggleRowExpanded: "Rij uit-/inklappen", // needs review
  columnVisibility: "Toon/Verberg kolommen",
  toggleColumnVisibility: "Toggle zichtbaarheid",
  filterByColumn: (column) => `Filteren op ${column}`,
  clearFilter: "Filter wissen",
  filterMode: "Filtermodus", // needs review
  changeFilterMode: "Filtermodus wijzigen",
  filterPlaceholder: (column) => `Filter ${column}…`, // needs review
  showColumnFilters: "Toon filters", // needs review
  hideColumnFilters: "Verberg filters", // needs review
  min: "Min",
  max: "Max",
  pickDate: "Kies een datum", // needs review
  pickDateRange: "Kies een datumbereik", // needs review
  true: "Waar", // needs review
  false: "Onwaar", // needs review
  filterModes: {
    fuzzy: "Wazig",
    contains: "Omvat",
    startsWith: "Start met",
    endsWith: "Eindigd met",
    equals: "Is gelijk aan",
    notEquals: "Niet gelijk aan",
    empty: "leeg",
    notEmpty: "Niet leeg",
    between: "Tussen",
    betweenInclusive: "Tussen inclusief",
    greaterThan: "Groter dan",
    greaterThanOrEqualTo: "Groter dan of gelijk aan",
    lessThan: "Kleiner dan",
    lessThanOrEqualTo: "Kleiner dan of gelijk aan",
    before: "Voor", // needs review
    after: "Na", // needs review
    betweenDates: "Tussen", // needs review
    equalsString: "Is gelijk aan",
    arrIncludesSome: "Omvat",
    equalsBool: "Is gelijk aan",
  },
  advancedFilters: "Geavanceerde filters", // needs review
  advancedFiltersMatch: (logic) => `Voldoe aan ${logic} volgende regels`, // needs review
  advancedFiltersMatchAll: "alle", // needs review
  advancedFiltersMatchAny: "een van de", // needs review
  advancedFiltersAddRule: "Filter toevoegen", // needs review
  advancedFiltersApply: "Toepassen", // needs review
  advancedFiltersClearAll: "Alles wissen", // needs review
  advancedFiltersColumn: "Kolom", // needs review
  advancedFiltersOperator: "Operator", // needs review
  advancedFiltersValue: "Waarde", // needs review
  advancedFiltersEmpty: "Nog geen filters. Voeg er een toe om te beginnen.", // needs review
  removeFilterRule: "Filter verwijderen", // needs review
  advancedFilterOperators: {
    contains: "Omvat",
    notContains: "bevat niet", // needs review
    startsWith: "Start met",
    endsWith: "Eindigd met",
    equals: "Is gelijk aan",
    notEquals: "Niet gelijk aan",
    isEmpty: "leeg",
    isNotEmpty: "Niet leeg",
    greaterThan: "Groter dan",
    greaterThanOrEqual: "Groter dan of gelijk aan",
    lessThan: "Kleiner dan",
    lessThanOrEqual: "Kleiner dan of gelijk aan",
    between: "Tussen",
  },
  search: "Zoeken",
  searchPlaceholder: "Zoeken…", // needs review
  clearSearch: "Zoekbalk wissen",
  globalFilterMode: "Zoekmodus wijzigen",
  toggleDensity: "Toggle compactheid",
  densityComfortable: "Comfortabel", // needs review
  densityCompact: "Compact", // needs review
  densitySpacious: "Ruim", // needs review
  enterFullscreen: "Volledig scherm openen", // needs review
  exitFullscreen: "Volledig scherm sluiten", // needs review
  rowsPerPage: "Rijen per pagina",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("nl")}–${end.toLocaleString("nl")} van ${total.toLocaleString("nl")}`, // needs review
  goToFirstPage: "Ga naar de eerste pagina",
  goToPreviousPage: "Ga naar de vorige pagina",
  goToNextPage: "Ga naar de volgende pagina",
  goToLastPage: "Ga naar de laatste pagina",
  goToPage: (page) => `Ga naar pagina ${page.toLocaleString("nl")}`, // needs review
  rowActions: "Rij acties",
  edit: "Bewerk",
  save: "Opslaan",
  cancel: "Annuleren",
  delete: "Verwijderen", // needs review
  create: "Aanmaken", // needs review
  createNewRow: "Nieuwe rij aanmaken", // needs review
  editRow: "Rij bewerken", // needs review
  required: "Verplicht", // needs review
  copy: "Kopiëren",
  copied: "Gekopieerd naar klembord",
  cellActions: "Celacties", // needs review
  noRecordsToDisplay: "Geen rijen om te tonen",
  loading: "Laden…", // needs review
  loadingMore: "Meer laden…", // needs review
  dragStart: (label) => `${label} opgepakt.`, // needs review
  dragOver: (label, over) => `${label} bevindt zich boven ${over}.`, // needs review
  dragEnd: (label, over) => `${label} is neergezet op ${over}.`, // needs review
  dragCancel: (label) => `Slepen geannuleerd. ${label} is neergezet.`, // needs review
  dragInstructions:
    "Druk op spatie of enter om een item op te pakken. Gebruik tijdens het slepen de pijltjestoetsen om het te verplaatsen. Druk nogmaals op spatie of enter om het neer te zetten, of druk op escape om te annuleren.", // needs review
  dragRowLabel: (position) => `Rij ${position.toLocaleString("nl")}`, // needs review
  noResultsFound: "Geen resultaten gevonden",
}
