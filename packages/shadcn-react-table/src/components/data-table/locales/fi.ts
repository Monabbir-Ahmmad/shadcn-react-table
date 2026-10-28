// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.

import type { DataTableLocalization } from "../core/localization"

export const dataTableLocalizationFi: DataTableLocalization = {
  language: "fi",
  selectAll: "Vaihda valitse kaikki",
  selectRow: "Vaihda valitse rivi",
  clearSelection: "Tyhjennä valinta",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("fi")} / ${total.toLocaleString("fi")} riviä valittu`, // needs review
  sortByColumnAsc: (column) => `Järjestä sarakkeen ${column} mukaan nousevasti`, // needs review
  sortByColumnDesc: (column) =>
    `Järjestä sarakkeen ${column} mukaan laskevasti`, // needs review
  sortAscending: "Järjestä nousevasti", // needs review
  sortDescending: "Järjestä laskevasti", // needs review
  clearSort: "Tyhjennä lajittelu",
  sortedAscending: "Järjestetty nousevasti", // needs review
  sortedDescending: "Järjestetty laskevasti", // needs review
  columnActions: "Saraketoiminnot",
  hideColumn: "Piilota sarake", // needs review
  showAllColumns: "Näytä kaikki sarakkeet",
  pinToLeft: "Kiinnitä vasemmalle",
  pinToRight: "Kiinnitä oikealle",
  unpin: "Poista kiinnitys",
  reorderColumn: "Siirrä",
  reorderRow: "Siirrä",
  pinRow: "Kiinnitä rivi", // needs review
  unpinRow: "Poista rivin kiinnitys", // needs review
  resizeColumn: "Muuta sarakkeen kokoa", // needs review
  groupByColumn: (column) => `Ryhmittele sarakkeen ${column} mukaan`, // needs review
  ungroupByColumn: (column) => `Poista ryhmittely sarakkeen ${column} mukaan`,
  groupedBy: "Ryhmitelty sarakkeella", // needs review
  dropToGroupBy: "Vedä sarake tähän ryhmitelläksesi sen mukaan", // needs review
  expand: "Laajenna",
  collapse: "Supista",
  expandAll: "Laajenna kaikki",
  collapseAll: "Supista kaikki",
  toggleRowExpanded: "Laajenna tai tiivistä rivi", // needs review
  columnVisibility: "Näytä/piilota sarakkeita",
  toggleColumnVisibility: "Vaihda näkyvyys",
  filterByColumn: (column) => `Suodata sarakkeen ${column} mukaan`,
  clearFilter: "Tyhjennä suodatin",
  filterMode: "Suodattimen tila", // needs review
  changeFilterMode: "Muuta suodattimen tilaa",
  filterPlaceholder: (column) => `Suodata ${column}…`, // needs review
  showColumnFilters: "Näytä suodattimet", // needs review
  hideColumnFilters: "Piilota suodattimet", // needs review
  min: "Minimi",
  max: "Maksimi",
  pickDate: "Valitse päivämäärä", // needs review
  pickDateRange: "Valitse päivämääräväli", // needs review
  true: "Tosi", // needs review
  false: "Epätosi", // needs review
  filterModes: {
    fuzzy: "Sumea",
    contains: "Sisältää",
    startsWith: "Alkaa",
    endsWith: "Loppuu",
    equals: "On yhtä kuin",
    notEquals: "Ei ole yhtä kuin",
    empty: "Tyhjä",
    notEmpty: "Ei tyhjä",
    between: "Välillä",
    betweenInclusive: "Välillä mukaan lukien",
    greaterThan: "Enemmän kuin",
    greaterThanOrEqualTo: "Enemmän tai yhtä paljon kuin",
    lessThan: "Vähemmän kuin",
    lessThanOrEqualTo: "Vähemmän tai yhtä paljon kuin",
    before: "Ennen", // needs review
    after: "Jälkeen", // needs review
    betweenDates: "Välillä", // needs review
    equalsString: "On yhtä kuin",
    arrIncludesSome: "Sisältää",
    equalsBool: "On yhtä kuin",
  },
  advancedFilters: "Tarkennetut suodattimet", // needs review
  advancedFiltersMatchLabel: "Täsmää", // needs review
  advancedFiltersMatchAll: "Kaikkiin", // needs review
  advancedFiltersMatchAny: "Mihin tahansa", // needs review
  advancedFiltersOf: "seuraavista säännöistä", // needs review
  advancedFiltersAddRule: "Lisää suodatin", // needs review
  advancedFiltersApply: "Käytä", // needs review
  advancedFiltersClearAll: "Tyhjennä kaikki", // needs review
  advancedFiltersColumn: "Sarake", // needs review
  advancedFiltersOperator: "Operaattori", // needs review
  advancedFiltersValue: "Arvo", // needs review
  advancedFiltersEmpty: "Ei vielä suodattimia. Aloita lisäämällä yksi.", // needs review
  removeFilterRule: "Poista suodatin", // needs review
  advancedFilterOperators: {
    contains: "Sisältää",
    notContains: "ei sisällä", // needs review
    startsWith: "Alkaa",
    endsWith: "Loppuu",
    equals: "On yhtä kuin",
    notEquals: "Ei ole yhtä kuin",
    isEmpty: "Tyhjä",
    isNotEmpty: "Ei tyhjä",
    greaterThan: "Enemmän kuin",
    greaterThanOrEqual: "Enemmän tai yhtä paljon kuin",
    lessThan: "Vähemmän kuin",
    lessThanOrEqual: "Vähemmän tai yhtä paljon kuin",
    between: "Välillä",
  },
  search: "Etsi",
  searchPlaceholder: "Etsi…", // needs review
  clearSearch: "Tyhjennä haku",
  globalFilterMode: "Muuta hakutapaa",
  toggleDensity: "Vaihda tiheyttä",
  densityComfortable: "Mukava", // needs review
  densityCompact: "Tiivis", // needs review
  densitySpacious: "Tilava", // needs review
  enterFullscreen: "Siirry kokoruututilaan", // needs review
  exitFullscreen: "Poistu kokoruututilasta", // needs review
  rowsPerPage: "Rivejä per sivu",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("fi")}–${end.toLocaleString("fi")} / ${total.toLocaleString("fi")}`, // needs review
  goToFirstPage: "Siirry ensimmäiselle sivulle",
  goToPreviousPage: "Siirry edelliselle sivulle",
  goToNextPage: "Siirry seuraavalle sivulle",
  goToLastPage: "Siirry viimeiselle sivulle",
  goToPage: (page) => `Siirry sivulle ${page.toLocaleString("fi")}`, // needs review
  rowActions: "Rivitoiminnot",
  edit: "Muokkaa",
  save: "Tallenna",
  cancel: "Peruuta",
  delete: "Poista", // needs review
  create: "Luo", // needs review
  createNewRow: "Luo uusi rivi", // needs review
  editRow: "Muokkaa riviä", // needs review
  required: "Pakollinen", // needs review
  copy: "Kopioi",
  copied: "Kopioitu leikepöydälle",
  cellActions: "Solun toiminnot", // needs review
  noRecordsToDisplay: "Ei näytettäviä tietueita",
  loading: "Ladataan…", // needs review
  loadingMore: "Ladataan lisää…", // needs review
  dragStart: (label) => `${label} poimittu.`, // needs review
  dragOver: (label, over) => `${label} on kohteen ${over} päällä.`, // needs review
  dragEnd: (label, over) => `${label} pudotettiin kohteen ${over} päälle.`, // needs review
  dragCancel: (label) => `Vetäminen peruttiin. ${label} pudotettiin.`, // needs review
  dragInstructions:
    "Poimi kohde painamalla välilyöntiä tai Enteriä. Siirrä sitä vetäessäsi nuolinäppäimillä. Pudota se painamalla uudelleen välilyöntiä tai Enteriä tai peruuta painamalla Esc-näppäintä.", // needs review
  dragRowLabel: (position) => `Rivi ${position.toLocaleString("fi")}`, // needs review
}
