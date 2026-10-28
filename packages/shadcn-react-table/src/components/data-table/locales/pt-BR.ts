// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.

import type { DataTableLocalization } from "../core/localization"

export const dataTableLocalizationPtBR: DataTableLocalization = {
  language: "pt-BR",
  selectAll: "Alternar selecionar tudo",
  selectRow: "Alternar seleção da linha",
  clearSelection: "Limpar seleção",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("pt-BR")} de ${total.toLocaleString("pt-BR")} linhas selecionadas`, // needs review
  sortByColumnAsc: (column) => `Ordenar por ${column} em ordem crescente`, // needs review
  sortByColumnDesc: (column) => `Ordenar por ${column} em ordem decrescente`, // needs review
  sortAscending: "Ordenar em ordem crescente", // needs review
  sortDescending: "Ordenar em ordem decrescente", // needs review
  clearSort: "Limpar classificações",
  sortedAscending: "Ordenado em ordem crescente", // needs review
  sortedDescending: "Ordenado em ordem decrescente", // needs review
  columnActions: "Ações das colunas",
  hideColumn: "Ocultar coluna", // needs review
  showAllColumns: "Mostrar todas as colunas",
  pinToLeft: "Fixar à esquerda",
  pinToRight: "Fixar à direita",
  unpin: "Desfixar",
  reorderColumn: "Mover",
  reorderRow: "Mover",
  pinRow: "Fixar linha", // needs review
  unpinRow: "Desafixar linha", // needs review
  resizeColumn: "Redimensionar coluna", // needs review
  groupByColumn: (column) => `Agrupar por ${column}`, // needs review
  ungroupByColumn: (column) => `Desagrupar por ${column}`,
  groupedBy: "Agrupado por", // needs review
  dropToGroupBy: "Arraste uma coluna até aqui para agrupar por ela", // needs review
  expand: "Expandir",
  collapse: "Recolher",
  expandAll: "Expandir tudo",
  collapseAll: "Recolher tudo",
  toggleRowExpanded: "Expandir/recolher linha", // needs review
  columnVisibility: "Mostrar/Ocultar colunas",
  toggleColumnVisibility: "Alternar visibilidade",
  filterByColumn: (column) => `Filtrar por ${column}`,
  clearFilter: "Limpar filtros",
  filterMode: "Modo de filtro", // needs review
  changeFilterMode: "Alterar o modo de filtro",
  filterPlaceholder: (column) => `Filtrar ${column}…`, // needs review
  showColumnFilters: "Mostrar filtros", // needs review
  hideColumnFilters: "Ocultar filtros", // needs review
  min: "Min",
  max: "Max",
  pickDate: "Escolher uma data", // needs review
  pickDateRange: "Escolher um período", // needs review
  true: "Verdadeiro", // needs review
  false: "Falso", // needs review
  filterModes: {
    fuzzy: "Impreciso",
    contains: "Contém",
    startsWith: "Começa com",
    endsWith: "Termina com",
    equals: "Igual",
    notEquals: "Não é igual",
    empty: "vazio",
    notEmpty: "Não é vazio",
    between: "Entre",
    betweenInclusive: "Entre valores incluídos",
    greaterThan: "Maior que",
    greaterThanOrEqualTo: "Maior ou igual que",
    lessThan: "Menor que",
    lessThanOrEqualTo: "Menor ou igual que",
    before: "Antes de", // needs review
    after: "Depois de", // needs review
    betweenDates: "Entre", // needs review
    equalsString: "Igual",
    arrIncludesSome: "Inclui alguns",
    equalsBool: "Igual",
  },
  advancedFilters: "Filtros avançados", // needs review
  advancedFiltersMatchLabel: "Corresponder a", // needs review
  advancedFiltersMatchAll: "todas as", // needs review
  advancedFiltersMatchAny: "qualquer uma das", // needs review
  advancedFiltersOf: "seguintes regras", // needs review
  advancedFiltersAddRule: "Adicionar filtro", // needs review
  advancedFiltersApply: "Aplicar", // needs review
  advancedFiltersClearAll: "Limpar tudo", // needs review
  advancedFiltersColumn: "Coluna", // needs review
  advancedFiltersOperator: "Operador", // needs review
  advancedFiltersValue: "Valor", // needs review
  advancedFiltersEmpty: "Nenhum filtro ainda. Adicione um para começar.", // needs review
  removeFilterRule: "Remover filtro", // needs review
  advancedFilterOperators: {
    contains: "Contém",
    notContains: "não contém", // needs review
    startsWith: "Começa com",
    endsWith: "Termina com",
    equals: "Igual",
    notEquals: "Não é igual",
    isEmpty: "vazio",
    isNotEmpty: "Não é vazio",
    greaterThan: "Maior que",
    greaterThanOrEqual: "Maior ou igual que",
    lessThan: "Menor que",
    lessThanOrEqual: "Menor ou igual que",
    between: "Entre",
  },
  search: "Pesquisar",
  searchPlaceholder: "Pesquisar…", // needs review
  clearSearch: "Limpar pesquisa",
  globalFilterMode: "Alterar o modo de pesquisa",
  toggleDensity: "Alternar densidade",
  densityComfortable: "Confortável", // needs review
  densityCompact: "Compacto", // needs review
  densitySpacious: "Espaçoso", // needs review
  enterFullscreen: "Entrar em tela cheia", // needs review
  exitFullscreen: "Sair da tela cheia", // needs review
  rowsPerPage: "Linhas por página",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("pt-BR")}–${end.toLocaleString("pt-BR")} de ${total.toLocaleString("pt-BR")}`, // needs review
  goToFirstPage: "Ir para a primeira página",
  goToPreviousPage: "Ir para a página anterior",
  goToNextPage: "Ir para a próxima página",
  goToLastPage: "Ir para a última página",
  goToPage: (page) => `Ir para a página ${page.toLocaleString("pt-BR")}`, // needs review
  rowActions: "Ações da linha",
  edit: "Editar",
  save: "Salvar",
  cancel: "Cancelar",
  delete: "Excluir", // needs review
  create: "Criar", // needs review
  createNewRow: "Criar nova linha", // needs review
  editRow: "Editar linha", // needs review
  required: "Obrigatório", // needs review
  copy: "Copiar",
  copied: "Copiado para área de transferência",
  cellActions: "Ações da célula", // needs review
  noRecordsToDisplay: "Não há registros a serem exibidos",
  loading: "Carregando…", // needs review
  loadingMore: "Carregando mais…", // needs review
  dragStart: (label) => `Selecionado para arrastar: ${label}.`, // needs review
  dragOver: (label, over) => `${label} está sobre ${over}.`, // needs review
  dragEnd: (label, over) => `Solto em ${over}: ${label}.`, // needs review
  dragCancel: (label) => `Arraste cancelado. Solto: ${label}.`, // needs review
  dragInstructions:
    "Para pegar um item, pressione Espaço ou Enter. Ao arrastar, use as setas do teclado para movê-lo. Pressione Espaço ou Enter novamente para soltá-lo, ou pressione Escape para cancelar.", // needs review
  dragRowLabel: (position) => `Linha ${position.toLocaleString("pt-BR")}`, // needs review
}
