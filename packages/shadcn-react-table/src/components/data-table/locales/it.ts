// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.

import type { DataTableLocalization } from "../core/localization"

export const dataTableLocalizationIt: DataTableLocalization = {
  language: "it",
  selectAll: "Cambia selezione totale",
  selectRow: "Cambia selezione riga",
  clearSelection: "Cancella selezione",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("it")} di ${total.toLocaleString("it")} righe selezionate`, // needs review
  sortByColumnAsc: (column) => `Ordina per ${column} crescente`, // needs review
  sortByColumnDesc: (column) => `Ordina per ${column} decrescente`, // needs review
  sortAscending: "Ordina in modo crescente", // needs review
  sortDescending: "Ordina in modo decrescente", // needs review
  clearSort: "Cancella ordinamento",
  sortedAscending: "Ordinato in modo crescente", // needs review
  sortedDescending: "Ordinato in modo decrescente", // needs review
  columnActions: "Azioni colonna",
  hideColumn: "Nascondi colonna", // needs review
  showAllColumns: "Mostra tutte le colonne",
  pinToLeft: "Blocca a sinistra",
  pinToRight: "Blocca a destra",
  unpin: "Sblocca",
  reorderColumn: "Sposta",
  reorderRow: "Sposta",
  pinRow: "Blocca riga", // needs review
  unpinRow: "Sblocca riga", // needs review
  resizeColumn: "Ridimensiona colonna", // needs review
  groupByColumn: (column) => `Raggruppa per ${column}`, // needs review
  ungroupByColumn: (column) => `Rimuovi gruppo ${column}`,
  groupedBy: "Raggruppato per", // needs review
  dropToGroupBy: "Trascina qui una colonna per raggruppare", // needs review
  expand: "Espandi",
  collapse: "Chiudi",
  expandAll: "Espandi tutto",
  collapseAll: "Chiudi tutto",
  toggleRowExpanded: "Espandi/comprimi riga", // needs review
  columnVisibility: "Mostra/Nascondi colonne",
  toggleColumnVisibility: "Cambia visibilità",
  filterByColumn: (column) => `Filtra da ${column}`,
  clearFilter: "Cancella filtro",
  filterMode: "Modalità filtro", // needs review
  changeFilterMode: "Cambia modalità filtro",
  filterPlaceholder: (column) => `Filtra ${column}…`, // needs review
  showColumnFilters: "Mostra filtri", // needs review
  hideColumnFilters: "Nascondi filtri", // needs review
  min: "Minimo",
  max: "Massimo",
  pickDate: "Scegli una data", // needs review
  pickDateRange: "Scegli un intervallo di date", // needs review
  true: "Vero", // needs review
  false: "Falso", // needs review
  filterModes: {
    fuzzy: "Sfocato",
    contains: "Contiene",
    startsWith: "Inizia con",
    endsWith: "Finisce con",
    equals: "Uguale",
    notEquals: "Non uguale",
    empty: "Vuoto",
    notEmpty: "Non vuoto",
    between: "Tra",
    betweenInclusive: "Tra inclusioni",
    greaterThan: "Maggiore di",
    greaterThanOrEqualTo: "Maggiore o uguale a",
    lessThan: "Minore di",
    lessThanOrEqualTo: "Minore o uguale a",
    before: "Prima", // needs review
    after: "Dopo", // needs review
    betweenDates: "Tra", // needs review
    equalsString: "Uguale",
    arrIncludesSome: "Inclusioni",
    equalsBool: "Uguale",
  },
  advancedFilters: "Filtri avanzati", // needs review
  advancedFiltersMatchLabel: "Soddisfa", // needs review
  advancedFiltersMatchAll: "tutte le", // needs review
  advancedFiltersMatchAny: "almeno una delle", // needs review
  advancedFiltersOf: "regole seguenti", // needs review
  advancedFiltersAddRule: "Aggiungi filtro", // needs review
  advancedFiltersApply: "Applica", // needs review
  advancedFiltersClearAll: "Cancella tutto", // needs review
  advancedFiltersColumn: "Colonna", // needs review
  advancedFiltersOperator: "Operatore", // needs review
  advancedFiltersValue: "Valore", // needs review
  advancedFiltersEmpty: "Nessun filtro. Aggiungine uno per iniziare.", // needs review
  removeFilterRule: "Rimuovi filtro", // needs review
  advancedFilterOperators: {
    contains: "Contiene",
    notContains: "non contiene", // needs review
    startsWith: "Inizia con",
    endsWith: "Finisce con",
    equals: "Uguale",
    notEquals: "Non uguale",
    isEmpty: "Vuoto",
    isNotEmpty: "Non vuoto",
    greaterThan: "Maggiore di",
    greaterThanOrEqual: "Maggiore o uguale a",
    lessThan: "Minore di",
    lessThanOrEqual: "Minore o uguale a",
    between: "Tra",
  },
  search: "Cerca",
  searchPlaceholder: "Cerca…", // needs review
  clearSearch: "Cancella ricerca",
  globalFilterMode: "Cambia modalità ricerca",
  toggleDensity: "Cambia densità",
  densityComfortable: "Comoda", // needs review
  densityCompact: "Compatta", // needs review
  densitySpacious: "Ampia", // needs review
  enterFullscreen: "Attiva schermo intero", // needs review
  exitFullscreen: "Esci da schermo intero", // needs review
  rowsPerPage: "Righe per pagina",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("it")}–${end.toLocaleString("it")} di ${total.toLocaleString("it")}`, // needs review
  goToFirstPage: "Vai alla prima pagina",
  goToPreviousPage: "Vai alla pagina precedente",
  goToNextPage: "Vai alla pagina successiva",
  goToLastPage: "Vai all'ultima pagina",
  goToPage: (page) => `Vai alla pagina ${page.toLocaleString("it")}`, // needs review
  rowActions: "Azioni riga",
  edit: "Modifica",
  save: "Salva",
  cancel: "Cancella",
  delete: "Elimina", // needs review
  create: "Crea", // needs review
  createNewRow: "Crea nuova riga", // needs review
  editRow: "Modifica riga", // needs review
  required: "Obbligatorio", // needs review
  copy: "Copia",
  copied: "Copia negli appunti",
  cellActions: "Azioni cella", // needs review
  noRecordsToDisplay: "Nessun record da mostrare",
  loading: "Caricamento…", // needs review
  loadingMore: "Caricamento di altri elementi…", // needs review
  dragStart: (label) => `Hai preso ${label}.`, // needs review
  dragOver: (label, over) => `${label} è sopra ${over}.`, // needs review
  dragEnd: (label, over) => `Hai rilasciato ${label} su ${over}.`, // needs review
  dragCancel: (label) => `Trascinamento annullato. Hai rilasciato ${label}.`, // needs review
  dragInstructions:
    "Per prelevare un elemento, premi spazio o invio. Durante il trascinamento, usa i tasti freccia per spostarlo. Premi di nuovo spazio o invio per rilasciarlo, oppure premi esc per annullare.", // needs review
  dragRowLabel: (position) => `Riga ${position.toLocaleString("it")}`, // needs review
}
