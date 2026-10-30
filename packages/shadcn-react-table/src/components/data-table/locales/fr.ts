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

export const dataTableLocalizationFr: DataTableLocalization = {
  language: "fr",
  selectAll: "Basculer tout sélectionner",
  selectRow: "Basculer la sélection de ligne",
  clearSelection: "Effacer la sélection",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("fr")} sur ${total.toLocaleString("fr")} lignes sélectionnées`, // needs review
  sortByColumnAsc: (column) => `Trier par ${column} croissant`, // needs review
  sortByColumnDesc: (column) => `Trier par ${column} décroissant`, // needs review
  sortAscending: "Tri croissant", // needs review
  sortDescending: "Tri décroissant", // needs review
  clearSort: "Effacer le tri",
  sortedAscending: "Trié croissant", // needs review
  sortedDescending: "Trié décroissant", // needs review
  columnActions: "Actions de colonne",
  hideColumn: "Masquer la colonne", // needs review
  showAllColumns: "Afficher toutes les colonnes",
  pinToLeft: "Épingler à gauche",
  pinToRight: "Épingler à droite",
  unpin: "Détacher",
  reorderColumn: "Déplacer",
  reorderRow: "Déplacer",
  pinRow: "Épingler la ligne", // needs review
  unpinRow: "Désépingler la ligne", // needs review
  resizeColumn: "Redimensionner la colonne", // needs review
  groupByColumn: (column) => `Grouper par ${column}`, // needs review
  ungroupByColumn: (column) => `Dissocier par ${column}`,
  groupedBy: "Groupé par", // needs review
  dropToGroupBy: "Faites glisser une colonne ici pour grouper selon celle-ci", // needs review
  expand: "Développer",
  collapse: "Réduire",
  expandAll: "Tout développer",
  collapseAll: "Réduire tout",
  toggleRowExpanded: "Développer/réduire la ligne", // needs review
  columnVisibility: "Afficher/Masquer les colonnes",
  toggleColumnVisibility: "Basculer la visibilité",
  filterByColumn: (column) => `Filtrer par ${column}`,
  clearFilter: "Effacer le filtre",
  filterMode: "Mode de filtre", // needs review
  changeFilterMode: "Changer le mode de filtre",
  filterPlaceholder: (column) => `Filtrer ${column}…`, // needs review
  showColumnFilters: "Afficher les filtres", // needs review
  hideColumnFilters: "Masquer les filtres", // needs review
  min: "Min",
  max: "Max",
  pickDate: "Choisir une date", // needs review
  pickDateRange: "Choisir une période", // needs review
  true: "Vrai", // needs review
  false: "Faux", // needs review
  filterModes: {
    fuzzy: "Flou",
    contains: "Contient",
    startsWith: "Commence avec",
    endsWith: "Se termine par",
    equals: "Egale",
    notEquals: "Pas égal",
    empty: "Vide",
    notEmpty: "Pas vide",
    between: "Entre",
    betweenInclusive: "Entre inclus",
    greaterThan: "Plus grand que",
    greaterThanOrEqualTo: "Plus grand que ou égale à",
    lessThan: "Plus petit que",
    lessThanOrEqualTo: "Plus petit que ou égale à",
    before: "Avant", // needs review
    after: "Après", // needs review
    betweenDates: "Entre", // needs review
    equalsString: "Egale",
    arrIncludesSome: "Inclure",
    equalsBool: "Egale",
  },
  advancedFilters: "Filtres avancés", // needs review
  advancedFiltersMatch: (logic) =>
    `Correspondre à ${logic} parmi les règles suivantes`, // needs review
  advancedFiltersMatchAll: "Toutes", // needs review
  advancedFiltersMatchAny: "Au moins une", // needs review
  advancedFiltersAddRule: "Ajouter un filtre", // needs review
  advancedFiltersApply: "Appliquer", // needs review
  advancedFiltersClearAll: "Tout effacer", // needs review
  advancedFiltersColumn: "Colonne", // needs review
  advancedFiltersOperator: "Opérateur", // needs review
  advancedFiltersValue: "Valeur", // needs review
  advancedFiltersEmpty:
    "Aucun filtre pour le moment. Ajoutez-en un pour commencer.", // needs review
  removeFilterRule: "Supprimer le filtre", // needs review
  advancedFilterOperators: {
    contains: "Contient",
    notContains: "ne contient pas", // needs review
    startsWith: "Commence avec",
    endsWith: "Se termine par",
    equals: "Egale",
    notEquals: "Pas égal",
    isEmpty: "Vide",
    isNotEmpty: "Pas vide",
    greaterThan: "Plus grand que",
    greaterThanOrEqual: "Plus grand que ou égale à",
    lessThan: "Plus petit que",
    lessThanOrEqual: "Plus petit que ou égale à",
    between: "Entre",
  },
  search: "Rechercher",
  searchPlaceholder: "Rechercher…", // needs review
  clearSearch: "Effacer la recherche",
  globalFilterMode: "Changer le mode de recherche",
  toggleDensity: "Changer la densité",
  densityComfortable: "Confortable", // needs review
  densityCompact: "Compact", // needs review
  densitySpacious: "Spacieux", // needs review
  enterFullscreen: "Passer en plein écran", // needs review
  exitFullscreen: "Quitter le plein écran", // needs review
  rowsPerPage: "Lignes par page",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("fr")}–${end.toLocaleString("fr")} sur ${total.toLocaleString("fr")}`, // needs review
  goToFirstPage: "Aller à la première page",
  goToPreviousPage: "Aller à la page précédente",
  goToNextPage: "Aller à la page suivante",
  goToLastPage: "Aller à la dernière page",
  goToPage: (page) => `Aller à la page ${page.toLocaleString("fr")}`, // needs review
  rowActions: "Actions de ligne",
  edit: "Editer",
  save: "Sauvegarder",
  cancel: "Annuler",
  delete: "Supprimer", // needs review
  create: "Créer", // needs review
  createNewRow: "Créer une nouvelle ligne", // needs review
  editRow: "Modifier la ligne", // needs review
  required: "Obligatoire", // needs review
  copy: "Copier",
  copied: "Copié dans le presse-papier",
  cellActions: "Actions de la cellule", // needs review
  noRecordsToDisplay: "Aucun enregistrement à afficher",
  loading: "Chargement…", // needs review
  loadingMore: "Chargement supplémentaire…", // needs review
  dragStart: (label) => `Vous avez saisi ${label}.`, // needs review
  dragOver: (label, over) => `${label} est au-dessus de ${over}.`, // needs review
  dragEnd: (label, over) => `Vous avez déposé ${label} sur ${over}.`, // needs review
  dragCancel: (label) =>
    `Le glissement a été annulé. Vous avez déposé ${label}.`, // needs review
  dragInstructions:
    "Pour saisir un élément, appuyez sur la barre d'espace ou sur Entrée. Pendant le glissement, utilisez les touches fléchées pour le déplacer. Appuyez à nouveau sur la barre d'espace ou sur Entrée pour le déposer, ou sur Échap pour annuler.", // needs review
  dragRowLabel: (position) => `Ligne ${position.toLocaleString("fr")}`, // needs review
  noResultsFound: "Aucun résultat trouvé",
}
