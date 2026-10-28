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

export const dataTableLocalizationPt: DataTableLocalization = {
  language: "pt",
  selectAll: "Alternar selecionar tudo",
  selectRow: "Alternar seleção da linha",
  clearSelection: "Limpar seleção",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("pt")} de ${total.toLocaleString("pt")} linhas selecionadas`, // needs review
  sortByColumnAsc: (column) => `Ordenar por ${column} por ordem ascendente`, // needs review
  sortByColumnDesc: (column) => `Ordenar por ${column} por ordem descendente`, // needs review
  sortAscending: "Ordenar por ordem ascendente", // needs review
  sortDescending: "Ordenar por ordem descendente", // needs review
  clearSort: "Limpar classificações",
  sortedAscending: "Ordenado por ordem ascendente", // needs review
  sortedDescending: "Ordenado por ordem descendente", // needs review
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
  dropToGroupBy: "Arraste uma coluna para aqui para agrupar por ela", // needs review
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
  pickDateRange: "Escolher um intervalo de datas", // needs review
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
    before: "Antes", // needs review
    after: "Depois", // needs review
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
  advancedFiltersEmpty: "Ainda não há filtros. Adicione um para começar.", // needs review
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
  enterFullscreen: "Entrar em ecrã inteiro", // needs review
  exitFullscreen: "Sair do ecrã inteiro", // needs review
  rowsPerPage: "Linhas por página",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("pt")}–${end.toLocaleString("pt")} de ${total.toLocaleString("pt")}`, // needs review
  goToFirstPage: "Ir para a primeira página",
  goToPreviousPage: "Ir para a página anterior",
  goToNextPage: "Ir para a próxima página",
  goToLastPage: "Ir para a última página",
  goToPage: (page) => `Ir para a página ${page.toLocaleString("pt")}`, // needs review
  rowActions: "Ações da linha",
  edit: "Editar",
  save: "Salvar",
  cancel: "Cancelar",
  delete: "Eliminar", // needs review
  create: "Criar", // needs review
  createNewRow: "Criar nova linha", // needs review
  editRow: "Editar linha", // needs review
  required: "Obrigatório", // needs review
  copy: "Copiar",
  copied: "Copiado para área de transferência",
  cellActions: "Ações da célula", // needs review
  noRecordsToDisplay: "Não há registros a serem exibidos",
  loading: "A carregar…", // needs review
  loadingMore: "A carregar mais…", // needs review
  dragStart: (label) => `Selecionado para arrastar: ${label}.`, // needs review
  dragOver: (label, over) => `${label} está sobre ${over}.`, // needs review
  dragEnd: (label, over) => `Largado em ${over}: ${label}.`, // needs review
  dragCancel: (label) => `Arrasto cancelado. Largado: ${label}.`, // needs review
  dragInstructions:
    "Para pegar num item, prima Espaço ou Enter. Ao arrastar, use as teclas de seta para o mover. Prima Espaço ou Enter novamente para o largar, ou prima Escape para cancelar.", // needs review
  dragRowLabel: (position) => `Linha ${position.toLocaleString("pt")}`, // needs review
}
