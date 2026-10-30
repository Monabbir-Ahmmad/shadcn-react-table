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

export const dataTableLocalizationEl: DataTableLocalization = {
  language: "el",
  selectAll: "Εναλλαγή επιλογής όλων",
  selectRow: "Εναλλαγή επιλογής γραμμής",
  clearSelection: "Καθαρισμός επιλογής",
  rowsSelected: (selected, total) =>
    `Επιλέχθηκαν ${selected.toLocaleString("el")} από ${total.toLocaleString("el")} γραμμές`, // needs review
  sortByColumnAsc: (column) => `Ταξινόμηση κατά ${column} αύξουσα`, // needs review
  sortByColumnDesc: (column) => `Ταξινόμηση κατά ${column} φθίνουσα`, // needs review
  sortAscending: "Αύξουσα ταξινόμηση", // needs review
  sortDescending: "Φθίνουσα ταξινόμηση", // needs review
  clearSort: "Καθαρισμός ταξινόμησης",
  sortedAscending: "Ταξινομημένο αύξουσα", // needs review
  sortedDescending: "Ταξινομημένο φθίνουσα", // needs review
  columnActions: "Ενέργειες στη στήλη",
  hideColumn: "Απόκρυψη στήλης", // needs review
  showAllColumns: "Εμφάνιση όλων των στηλών",
  pinToLeft: "Καρφίτσωμα αριστερά",
  pinToRight: "Καρφίτσωμα δεξιά",
  unpin: "Αποκαρφίτσωση",
  reorderColumn: "Μετακίνηση",
  reorderRow: "Μετακίνηση",
  pinRow: "Καρφίτσωμα γραμμής", // needs review
  unpinRow: "Αποκαρφίτσωση γραμμής", // needs review
  resizeColumn: "Αλλαγή μεγέθους στήλης", // needs review
  groupByColumn: (column) => `Ομαδοποίηση ανά ${column}`, // needs review
  ungroupByColumn: (column) => `Αναίρεση ομαδοποίησης κατά ${column}`,
  groupedBy: "Ομαδοποιημένο ανά", // needs review
  dropToGroupBy: "Σύρετε μια στήλη εδώ για ομαδοποίηση ανά αυτήν", // needs review
  expand: "Επέκταση",
  collapse: "Σύμπτυξη",
  expandAll: "Επέκταση όλων",
  collapseAll: "Σύμπτυξη όλων",
  toggleRowExpanded: "Εναλλαγή ανάπτυξης γραμμής", // needs review
  columnVisibility: "Εμφάνιση/απόκρυψη στηλών",
  toggleColumnVisibility: "Εναλλαγή ορατότητας",
  filterByColumn: (column) => `Φιλτράρισμα ανά ${column}`,
  clearFilter: "Καθαρισμός φίλτρου",
  filterMode: "Λειτουργία φίλτρου", // needs review
  changeFilterMode: "Αλλαγή λειτουργίας φίλτρου",
  filterPlaceholder: (column) => `Φιλτράρισμα ${column}…`, // needs review
  showColumnFilters: "Εμφάνιση φίλτρων", // needs review
  hideColumnFilters: "Απόκρυψη φίλτρων", // needs review
  min: "Ελάχιστο",
  max: "Μέγιστο",
  pickDate: "Επιλογή ημερομηνίας", // needs review
  pickDateRange: "Επιλογή εύρους ημερομηνιών", // needs review
  true: "Αληθές", // needs review
  false: "Ψευδές", // needs review
  filterModes: {
    fuzzy: "Ασαφές",
    contains: "Περιέχει",
    startsWith: "Ξεκινάει με",
    endsWith: "Τελειώνει με",
    equals: "Ίσο",
    notEquals: "Όχι ίσο",
    empty: "Κενό",
    notEmpty: "Όχι κενό",
    between: "Μεταξύ",
    betweenInclusive: "Μεταξύ συμπεριλαμβανομένων",
    greaterThan: "Μεγαλύτερο από",
    greaterThanOrEqualTo: "Μεγαλύτερο ή ίσο με",
    lessThan: "Μικρότερο από",
    lessThanOrEqualTo: "Μικρότερο ή ίσο με",
    before: "Πριν", // needs review
    after: "Μετά", // needs review
    betweenDates: "Μεταξύ", // needs review
    equalsString: "Ίσο (συμβολοσειρά)",
    arrIncludesSome: "Περιλαμβάνει",
    equalsBool: "Ίσο",
  },
  advancedFilters: "Σύνθετα φίλτρα", // needs review
  advancedFiltersMatch: (logic) => `Ταίριασμα ${logic} των ακόλουθων κανόνων`, // needs review
  advancedFiltersMatchAll: "Όλων", // needs review
  advancedFiltersMatchAny: "Οποιουδήποτε", // needs review
  advancedFiltersAddRule: "Προσθήκη φίλτρου", // needs review
  advancedFiltersApply: "Εφαρμογή", // needs review
  advancedFiltersClearAll: "Εκκαθάριση όλων", // needs review
  advancedFiltersColumn: "Στήλη", // needs review
  advancedFiltersOperator: "Τελεστής", // needs review
  advancedFiltersValue: "Τιμή", // needs review
  advancedFiltersEmpty:
    "Δεν υπάρχουν ακόμα φίλτρα. Προσθέστε ένα για να ξεκινήσετε.", // needs review
  removeFilterRule: "Αφαίρεση φίλτρου", // needs review
  advancedFilterOperators: {
    contains: "Περιέχει",
    notContains: "δεν περιέχει", // needs review
    startsWith: "Ξεκινάει με",
    endsWith: "Τελειώνει με",
    equals: "Ίσο",
    notEquals: "Όχι ίσο",
    isEmpty: "Κενό",
    isNotEmpty: "Όχι κενό",
    greaterThan: "Μεγαλύτερο από",
    greaterThanOrEqual: "Μεγαλύτερο ή ίσο με",
    lessThan: "Μικρότερο από",
    lessThanOrEqual: "Μικρότερο ή ίσο με",
    between: "Μεταξύ",
  },
  search: "Αναζήτηση",
  searchPlaceholder: "Αναζήτηση…", // needs review
  clearSearch: "Καθαρισμός αναζήτησης",
  globalFilterMode: "Αλλαγή λειτουργίας αναζήτησης",
  toggleDensity: "Εναλλαγή πυκνότητας",
  densityComfortable: "Άνετη", // needs review
  densityCompact: "Συμπαγής", // needs review
  densitySpacious: "Ευρύχωρη", // needs review
  enterFullscreen: "Είσοδος σε πλήρη οθόνη", // needs review
  exitFullscreen: "Έξοδος από πλήρη οθόνη", // needs review
  rowsPerPage: "Γραμμές ανά σελίδα",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("el")}–${end.toLocaleString("el")} από ${total.toLocaleString("el")}`, // needs review
  goToFirstPage: "Πήγαινε στην πρώτη σελίδα",
  goToPreviousPage: "Πήγαινε στην προηγούμενη σελίδα",
  goToNextPage: "Πήγαινε στην επόμενη σελίδα",
  goToLastPage: "Πήγαινε στην τελευταία σελίδα",
  goToPage: (page) => `Μετάβαση στη σελίδα ${page.toLocaleString("el")}`, // needs review
  rowActions: "Ενέργειες γραμμής",
  edit: "Επεξεργασία",
  save: "Αποθήκευση",
  cancel: "Ακύρωση",
  delete: "Διαγραφή", // needs review
  create: "Δημιουργία", // needs review
  createNewRow: "Δημιουργία νέας γραμμής", // needs review
  editRow: "Επεξεργασία γραμμής", // needs review
  required: "Απαιτείται", // needs review
  copy: "Αντιγραφή",
  copied: "Αντιγράφηκε στο πρόχειρο",
  cellActions: "Ενέργειες κελιού", // needs review
  noRecordsToDisplay: "Δεν υπάρχουν εγγραφές για εμφάνιση",
  loading: "Φόρτωση…", // needs review
  loadingMore: "Φόρτωση περισσότερων…", // needs review
  dragStart: (label) => `Το στοιχείο ${label} σηκώθηκε.`, // needs review
  dragOver: (label, over) =>
    `Το στοιχείο ${label} βρίσκεται πάνω από το ${over}.`, // needs review
  dragEnd: (label, over) => `Το στοιχείο ${label} αφέθηκε πάνω στο ${over}.`, // needs review
  dragCancel: (label) => `Η μεταφορά ακυρώθηκε. Το στοιχείο ${label} αφέθηκε.`, // needs review
  dragInstructions:
    "Για να σηκώσετε ένα στοιχείο, πατήστε το πλήκτρο διαστήματος ή Enter. Κατά τη μεταφορά, χρησιμοποιήστε τα βέλη για να το μετακινήσετε. Πατήστε ξανά διάστημα ή Enter για να το αφήσετε ή Escape για ακύρωση.", // needs review
  dragRowLabel: (position) => `Γραμμή ${position.toLocaleString("el")}`, // needs review
  noResultsFound: "Δεν βρέθηκαν αποτελέσματα",
}
