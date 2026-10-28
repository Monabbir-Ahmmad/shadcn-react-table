// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.

import type { DataTableLocalization } from "../core/localization"

export const dataTableLocalizationPl: DataTableLocalization = {
  language: "pl",
  selectAll: "Zaznacz wszystkie",
  selectRow: "Zaznacz rekord",
  clearSelection: "Wyczyść zaznaczenie",
  rowsSelected: (selected, total) =>
    `Wybrano ${selected.toLocaleString("pl")} z ${total.toLocaleString("pl")} wierszy`, // needs review
  sortByColumnAsc: (column) => `Sortuj wg ${column} rosnąco`, // needs review
  sortByColumnDesc: (column) => `Sortuj wg ${column} malejąco`, // needs review
  sortAscending: "Sortuj rosnąco", // needs review
  sortDescending: "Sortuj malejąco", // needs review
  clearSort: "Wyczyść sortowanie",
  sortedAscending: "Posortowano rosnąco", // needs review
  sortedDescending: "Posortowano malejąco", // needs review
  columnActions: "Akcje dla kolumny",
  hideColumn: "Ukryj kolumnę", // needs review
  showAllColumns: "Pokaż wszystkie kolumny",
  pinToLeft: "Przypnij po lewej",
  pinToRight: "Przypnij po prawej",
  unpin: "Odepnij",
  reorderColumn: "Przenieś",
  reorderRow: "Przenieś",
  pinRow: "Przypnij wiersz", // needs review
  unpinRow: "Odepnij wiersz", // needs review
  resizeColumn: "Zmień rozmiar kolumny", // needs review
  groupByColumn: (column) => `Grupuj wg ${column}`, // needs review
  ungroupByColumn: (column) => `Rozgrupuj ${column}`,
  groupedBy: "Grupowane wg", // needs review
  dropToGroupBy: "Przeciągnij kolumnę tutaj, aby grupować wg niej", // needs review
  expand: "Rozwiń",
  collapse: "Zwiń",
  expandAll: "Rozwiń wszystko",
  collapseAll: "Zwiń wszystko",
  toggleRowExpanded: "Rozwiń/zwiń wiersz", // needs review
  columnVisibility: "Pokaż/ukryj kolumny",
  toggleColumnVisibility: "Widoczność",
  filterByColumn: (column) => `Filtruj wg ${column}`,
  clearFilter: "Wyczyść filtr",
  filterMode: "Tryb filtrowania", // needs review
  changeFilterMode: "Zmień tryb filtrowania",
  filterPlaceholder: (column) => `Filtruj ${column}…`, // needs review
  showColumnFilters: "Pokaż filtry", // needs review
  hideColumnFilters: "Ukryj filtry", // needs review
  min: "Min.",
  max: "Maks.",
  pickDate: "Wybierz datę", // needs review
  pickDateRange: "Wybierz zakres dat", // needs review
  true: "Prawda", // needs review
  false: "Fałsz", // needs review
  filterModes: {
    fuzzy: "Rozmyte dopasowanie",
    contains: "Zawiera",
    startsWith: "Zaczyna się od",
    endsWith: "Kończy się na",
    equals: "Równa się",
    notEquals: "Nie równa się",
    empty: "Puste",
    notEmpty: "Nie jest puste",
    between: "Pomiędzy (przedział otwarty)",
    betweenInclusive: "Pomiędzy (przedział domknięty)",
    greaterThan: "Większe niż",
    greaterThanOrEqualTo: "Większe lub równe",
    lessThan: "Mniejsze niż",
    lessThanOrEqualTo: "Mniejsze lub równe",
    before: "Przed", // needs review
    after: "Po", // needs review
    betweenDates: "Pomiędzy", // needs review
    equalsString: "Równa się",
    arrIncludesSome: "Zawiera niektóre",
    equalsBool: "Równa się",
  },
  advancedFilters: "Filtry zaawansowane", // needs review
  advancedFiltersMatchLabel: "Dopasuj", // needs review
  advancedFiltersMatchAll: "wszystkie", // needs review
  advancedFiltersMatchAny: "dowolną", // needs review
  advancedFiltersOf: "z poniższych reguł", // needs review
  advancedFiltersAddRule: "Dodaj filtr", // needs review
  advancedFiltersApply: "Zastosuj", // needs review
  advancedFiltersClearAll: "Wyczyść wszystko", // needs review
  advancedFiltersColumn: "Kolumna", // needs review
  advancedFiltersOperator: "Operator", // needs review
  advancedFiltersValue: "Wartość", // needs review
  advancedFiltersEmpty: "Brak filtrów. Dodaj jeden, aby zacząć.", // needs review
  removeFilterRule: "Usuń filtr", // needs review
  advancedFilterOperators: {
    contains: "Zawiera",
    notContains: "nie zawiera", // needs review
    startsWith: "Zaczyna się od",
    endsWith: "Kończy się na",
    equals: "Równa się",
    notEquals: "Nie równa się",
    isEmpty: "Puste",
    isNotEmpty: "Nie jest puste",
    greaterThan: "Większe niż",
    greaterThanOrEqual: "Większe lub równe",
    lessThan: "Mniejsze niż",
    lessThanOrEqual: "Mniejsze lub równe",
    between: "Pomiędzy (przedział otwarty)",
  },
  search: "Szukaj",
  searchPlaceholder: "Szukaj…", // needs review
  clearSearch: "Wyczyść wyszukiwanie",
  globalFilterMode: "Zmień tryb wyszukiwania",
  toggleDensity: "Przełącz gęstość wyników",
  densityComfortable: "Wygodny", // needs review
  densityCompact: "Kompaktowy", // needs review
  densitySpacious: "Przestronny", // needs review
  enterFullscreen: "Włącz tryb pełnoekranowy", // needs review
  exitFullscreen: "Wyłącz tryb pełnoekranowy", // needs review
  rowsPerPage: "Wyników na stronę",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("pl")}–${end.toLocaleString("pl")} z ${total.toLocaleString("pl")}`, // needs review
  goToFirstPage: "Pierwsza strona",
  goToPreviousPage: "Poprzednia strony",
  goToNextPage: "Następna strona",
  goToLastPage: "Ostatnia strona",
  goToPage: (page) => `Przejdź do strony ${page.toLocaleString("pl")}`, // needs review
  rowActions: "Akcje dla rekordu",
  edit: "Edytuj",
  save: "Zapisz",
  cancel: "Anuluj",
  delete: "Usuń", // needs review
  create: "Utwórz", // needs review
  createNewRow: "Utwórz nowy wiersz", // needs review
  editRow: "Edytuj wiersz", // needs review
  required: "Wymagane", // needs review
  copy: "Kopiuj",
  copied: "Skopiowano do schowka",
  cellActions: "Akcje komórki", // needs review
  noRecordsToDisplay: "Brak wyników do wyświetlenia",
  loading: "Ładowanie…", // needs review
  loadingMore: "Ładowanie kolejnych…", // needs review
  dragStart: (label) => `Podniesiono: ${label}.`, // needs review
  dragOver: (label, over) => `${label} znajduje się nad: ${over}.`, // needs review
  dragEnd: (label, over) => `${label} upuszczono na: ${over}.`, // needs review
  dragCancel: (label) => `Przeciąganie anulowano. ${label} upuszczono.`, // needs review
  dragInstructions:
    "Aby podnieść element, naciśnij spację lub Enter. Podczas przeciągania użyj klawiszy strzałek, aby go przesunąć. Naciśnij ponownie spację lub Enter, aby go upuścić, albo Escape, aby anulować.", // needs review
  dragRowLabel: (position) => `Wiersz ${position.toLocaleString("pl")}`, // needs review
}
