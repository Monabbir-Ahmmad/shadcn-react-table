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

export const dataTableLocalizationDe: DataTableLocalization = {
  language: "de",
  selectAll: "Alle auswählen umschalten",
  selectRow: "Zeile auswählen umschalten",
  clearSelection: "Auswahl zurücksetzen",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("de")} von ${total.toLocaleString("de")} Zeilen ausgewählt`, // needs review
  sortByColumnAsc: (column) => `Nach ${column} aufsteigend sortieren`, // needs review
  sortByColumnDesc: (column) => `Nach ${column} absteigend sortieren`, // needs review
  sortAscending: "Aufsteigend sortieren", // needs review
  sortDescending: "Absteigend sortieren", // needs review
  clearSort: "Sortierung zurücksetzen",
  sortedAscending: "Aufsteigend sortiert", // needs review
  sortedDescending: "Absteigend sortiert", // needs review
  columnActions: "Spalten-Aktionen",
  hideColumn: "Spalte ausblenden", // needs review
  showAllColumns: "Alle Spalten anzeigen",
  pinToLeft: "Links anheften",
  pinToRight: "Rechts anheften",
  unpin: "Loslösen",
  reorderColumn: "Ziehen",
  reorderRow: "Ziehen",
  pinRow: "Zeile anheften", // needs review
  unpinRow: "Zeile lösen", // needs review
  resizeColumn: "Spaltengröße ändern", // needs review
  groupByColumn: (column) => `Nach ${column} gruppieren`, // needs review
  ungroupByColumn: (column) => `Gruppierung nach ${column} aufheben`,
  groupedBy: "Gruppiert nach", // needs review
  dropToGroupBy: "Spalte hierher ziehen, um danach zu gruppieren", // needs review
  expand: "Erweitern",
  collapse: "Einklappen",
  expandAll: "Alle erweitern",
  collapseAll: "Alle einklappen",
  toggleRowExpanded: "Zeile ein-/ausklappen", // needs review
  columnVisibility: "Spalten ein-/ausblenden",
  toggleColumnVisibility: "Sichtbarkeit wechseln",
  filterByColumn: (column) => `Nach ${column} filtern`,
  clearFilter: "Filter zurücksetzen",
  filterMode: "Filtermodus", // needs review
  changeFilterMode: "Filtermodus ändern",
  filterPlaceholder: (column) => `${column} filtern…`, // needs review
  showColumnFilters: "Filter anzeigen", // needs review
  hideColumnFilters: "Filter ausblenden", // needs review
  min: "Min",
  max: "Max",
  pickDate: "Datum auswählen", // needs review
  pickDateRange: "Zeitraum auswählen", // needs review
  true: "Wahr", // needs review
  false: "Falsch", // needs review
  filterModes: {
    fuzzy: "Fuzzy",
    contains: "Enthält",
    startsWith: "Beginnt mit",
    endsWith: "Endet mit",
    equals: "Gleich",
    notEquals: "Nicht gleich",
    empty: "Leer",
    notEmpty: "Nicht leer",
    between: "Zwischen",
    betweenInclusive: "Zwischen (inklusive)",
    greaterThan: "Größer als",
    greaterThanOrEqualTo: "Größer als oder gleich",
    lessThan: "Kleiner als",
    lessThanOrEqualTo: "Kleiner als oder gleich",
    before: "Vor", // needs review
    after: "Nach", // needs review
    betweenDates: "Zwischen", // needs review
    equalsString: "Gleich",
    arrIncludesSome: "Beinhaltet",
    equalsBool: "Gleich",
  },
  advancedFilters: "Erweiterte Filter", // needs review
  advancedFiltersMatch: (logic) => `Erfüllt ${logic} der folgenden Regeln`, // needs review
  advancedFiltersMatchAll: "alle", // needs review
  advancedFiltersMatchAny: "mindestens eine", // needs review
  advancedFiltersAddRule: "Filter hinzufügen", // needs review
  advancedFiltersApply: "Anwenden", // needs review
  advancedFiltersClearAll: "Alle löschen", // needs review
  advancedFiltersColumn: "Spalte", // needs review
  advancedFiltersOperator: "Operator", // needs review
  advancedFiltersValue: "Wert", // needs review
  advancedFiltersEmpty:
    "Noch keine Filter vorhanden. Fügen Sie einen hinzu, um zu beginnen.", // needs review
  removeFilterRule: "Filter entfernen", // needs review
  advancedFilterOperators: {
    contains: "Enthält",
    notContains: "enthält nicht", // needs review
    startsWith: "Beginnt mit",
    endsWith: "Endet mit",
    equals: "Gleich",
    notEquals: "Nicht gleich",
    isEmpty: "Leer",
    isNotEmpty: "Nicht leer",
    greaterThan: "Größer als",
    greaterThanOrEqual: "Größer als oder gleich",
    lessThan: "Kleiner als",
    lessThanOrEqual: "Kleiner als oder gleich",
    between: "Zwischen",
  },
  search: "Suche",
  searchPlaceholder: "Suchen…", // needs review
  clearSearch: "Suche zurücksetzen",
  globalFilterMode: "Suchmodus ändern",
  toggleDensity: "Zeilendichte wechseln",
  densityComfortable: "Komfortabel", // needs review
  densityCompact: "Kompakt", // needs review
  densitySpacious: "Geräumig", // needs review
  enterFullscreen: "Vollbild aktivieren", // needs review
  exitFullscreen: "Vollbild beenden", // needs review
  rowsPerPage: "Zeilen pro Seite",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("de")}–${end.toLocaleString("de")} von ${total.toLocaleString("de")}`, // needs review
  goToFirstPage: "Gehe zur ersten Seite",
  goToPreviousPage: "Gehe zur vorherigen Seite",
  goToNextPage: "Gehe zur nächsten Seite",
  goToLastPage: "Gehe zur letzten Seite",
  goToPage: (page) => `Zu Seite ${page.toLocaleString("de")}`, // needs review
  rowActions: "Zeilen-Aktionen",
  edit: "Editieren",
  save: "Speichern",
  cancel: "Abbrechen",
  delete: "Löschen", // needs review
  create: "Erstellen", // needs review
  createNewRow: "Neue Zeile erstellen", // needs review
  editRow: "Zeile bearbeiten", // needs review
  required: "Erforderlich", // needs review
  copy: "Kopieren",
  copied: "In die Zwischenablage kopiert",
  cellActions: "Zellenaktionen", // needs review
  noRecordsToDisplay: "Keine Ergebnisse zum Anzeigen gefunden",
  loading: "Wird geladen…", // needs review
  loadingMore: "Weitere werden geladen…", // needs review
  dragStart: (label) => `${label} aufgenommen.`, // needs review
  dragOver: (label, over) => `${label} befindet sich über ${over}.`, // needs review
  dragEnd: (label, over) => `${label} wurde auf ${over} abgelegt.`, // needs review
  dragCancel: (label) => `Ziehen wurde abgebrochen. ${label} wurde abgelegt.`, // needs review
  dragInstructions:
    "Zum Aufnehmen eines Elements die Leertaste oder Eingabetaste drücken. Beim Ziehen mit den Pfeiltasten bewegen. Zum Ablegen erneut Leertaste oder Eingabetaste drücken, zum Abbrechen die Escape-Taste.", // needs review
  dragRowLabel: (position) => `Zeile ${position.toLocaleString("de")}`, // needs review
  noResultsFound: "Keine Ergebnisse gefunden",
}
