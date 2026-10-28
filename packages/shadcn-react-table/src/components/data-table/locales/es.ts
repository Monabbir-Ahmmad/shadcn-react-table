// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.

import type { DataTableLocalization } from "../core/localization"

export const dataTableLocalizationEs: DataTableLocalization = {
  language: "es",
  selectAll: "Alternar seleccionar todo",
  selectRow: "Alternar seleccionar fila",
  clearSelection: "Borrar selección",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("es")} de ${total.toLocaleString("es")} filas seleccionadas`, // needs review
  sortByColumnAsc: (column) => `Ordenar por ${column} ascendente`, // needs review
  sortByColumnDesc: (column) => `Ordenar por ${column} descendente`, // needs review
  sortAscending: "Ordenar ascendente", // needs review
  sortDescending: "Ordenar descendente", // needs review
  clearSort: "Borrar ordenamiento",
  sortedAscending: "Ordenado ascendente", // needs review
  sortedDescending: "Ordenado descendente", // needs review
  columnActions: "Columna de acciones",
  hideColumn: "Ocultar columna", // needs review
  showAllColumns: "Mostrar todas las columnas",
  pinToLeft: "Anclar a la izquierda",
  pinToRight: "Anclar a la derecha",
  unpin: "Desanclar",
  reorderColumn: "Mover",
  reorderRow: "Mover",
  pinRow: "Anclar fila", // needs review
  unpinRow: "Desanclar fila", // needs review
  resizeColumn: "Cambiar tamaño de columna", // needs review
  groupByColumn: (column) => `Agrupar por ${column}`, // needs review
  ungroupByColumn: (column) => `Desagrupar por ${column}`,
  groupedBy: "Agrupado por", // needs review
  dropToGroupBy: "Arrastra una columna aquí para agrupar por ella", // needs review
  expand: "Expandir",
  collapse: "Colapsar",
  expandAll: "Expandir todo",
  collapseAll: "Colapsar todo",
  toggleRowExpanded: "Expandir/contraer fila", // needs review
  columnVisibility: "Mostrar/ocultar columnas",
  toggleColumnVisibility: "Alternar visibilidad",
  filterByColumn: (column) => `Filtrar por ${column}`,
  clearFilter: "Borrar filtro",
  filterMode: "Modo de filtro", // needs review
  changeFilterMode: "Cambiar modo de filtro",
  filterPlaceholder: (column) => `Filtrar ${column}…`, // needs review
  showColumnFilters: "Mostrar filtros", // needs review
  hideColumnFilters: "Ocultar filtros", // needs review
  min: "Mínimo",
  max: "Máximo",
  pickDate: "Elegir una fecha", // needs review
  pickDateRange: "Elegir un rango de fechas", // needs review
  true: "Verdadero", // needs review
  false: "Falso", // needs review
  filterModes: {
    fuzzy: "Difuso",
    contains: "Contiene",
    startsWith: "Empieza con",
    endsWith: "Termina con",
    equals: "Iguales",
    notEquals: "No iguales",
    empty: "Vacio",
    notEmpty: "No vacio",
    between: "Entre",
    betweenInclusive: "Entre (inclusivo)",
    greaterThan: "Mas grande que",
    greaterThanOrEqualTo: "Mas grande que o igual a",
    lessThan: "Menos que",
    lessThanOrEqualTo: "Menos que o igual a",
    before: "Antes", // needs review
    after: "Después", // needs review
    betweenDates: "Entre", // needs review
    equalsString: "Iguales",
    arrIncludesSome: "Incluye algunos",
    equalsBool: "Iguales",
  },
  advancedFilters: "Filtros avanzados", // needs review
  advancedFiltersMatchLabel: "Coincidir con", // needs review
  advancedFiltersMatchAll: "todas las", // needs review
  advancedFiltersMatchAny: "cualquiera de las", // needs review
  advancedFiltersOf: "siguientes reglas", // needs review
  advancedFiltersAddRule: "Añadir filtro", // needs review
  advancedFiltersApply: "Aplicar", // needs review
  advancedFiltersClearAll: "Borrar todo", // needs review
  advancedFiltersColumn: "Columna", // needs review
  advancedFiltersOperator: "Operador", // needs review
  advancedFiltersValue: "Valor", // needs review
  advancedFiltersEmpty: "Aún no hay filtros. Añade uno para empezar.", // needs review
  removeFilterRule: "Quitar filtro", // needs review
  advancedFilterOperators: {
    contains: "Contiene",
    notContains: "no contiene", // needs review
    startsWith: "Empieza con",
    endsWith: "Termina con",
    equals: "Iguales",
    notEquals: "No iguales",
    isEmpty: "Vacio",
    isNotEmpty: "No vacio",
    greaterThan: "Mas grande que",
    greaterThanOrEqual: "Mas grande que o igual a",
    lessThan: "Menos que",
    lessThanOrEqual: "Menos que o igual a",
    between: "Entre",
  },
  search: "Buscar",
  searchPlaceholder: "Buscar…", // needs review
  clearSearch: "Borrar búsqueda",
  globalFilterMode: "Cambiar modo de búsqueda",
  toggleDensity: "Alternar densidad",
  densityComfortable: "Cómoda", // needs review
  densityCompact: "Compacta", // needs review
  densitySpacious: "Espaciosa", // needs review
  enterFullscreen: "Entrar en pantalla completa", // needs review
  exitFullscreen: "Salir de pantalla completa", // needs review
  rowsPerPage: "Filas por página",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("es")}–${end.toLocaleString("es")} de ${total.toLocaleString("es")}`, // needs review
  goToFirstPage: "Ir a la primera página",
  goToPreviousPage: "Regresar a la pagina anterior",
  goToNextPage: "Ir a la página siguiente",
  goToLastPage: "Ir a la última página",
  goToPage: (page) => `Ir a la página ${page.toLocaleString("es")}`, // needs review
  rowActions: "Acciones de fila",
  edit: "Editar",
  save: "Guardar",
  cancel: "Cancelar",
  delete: "Eliminar", // needs review
  create: "Crear", // needs review
  createNewRow: "Crear nueva fila", // needs review
  editRow: "Editar fila", // needs review
  required: "Obligatorio", // needs review
  copy: "Copiar",
  copied: "Copiado al portapapeles",
  cellActions: "Acciones de celda", // needs review
  noRecordsToDisplay: "No hay registros para mostrar",
  loading: "Cargando…", // needs review
  loadingMore: "Cargando más…", // needs review
  dragStart: (label) => `Se recogió ${label}.`, // needs review
  dragOver: (label, over) => `${label} está sobre ${over}.`, // needs review
  dragEnd: (label, over) => `${label} se soltó sobre ${over}.`, // needs review
  dragCancel: (label) => `Se canceló el arrastre. Se soltó ${label}.`, // needs review
  dragInstructions:
    "Para recoger un elemento, pulsa la barra espaciadora o Intro. Mientras arrastras, usa las teclas de flecha para moverlo. Pulsa de nuevo la barra espaciadora o Intro para soltarlo, o pulsa Escape para cancelar.", // needs review
  dragRowLabel: (position) => `Fila ${position.toLocaleString("es")}`, // needs review
}
