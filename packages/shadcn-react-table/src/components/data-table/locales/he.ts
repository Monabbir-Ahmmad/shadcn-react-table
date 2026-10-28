// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.

import type { DataTableLocalization } from "../core/localization"

export const dataTableLocalizationHe: DataTableLocalization = {
  language: "he",
  selectAll: "בחר/בטל בחירת הכל",
  selectRow: "בחר/בטל בחירת שורה",
  clearSelection: "נקה בחירה",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("he")} מתוך ${total.toLocaleString("he")} שורות נבחרו`, // needs review
  sortByColumnAsc: (column) => `מיין לפי ${column} בסדר עולה`, // needs review
  sortByColumnDesc: (column) => `מיין לפי ${column} בסדר יורד`, // needs review
  sortAscending: "מיין בסדר עולה", // needs review
  sortDescending: "מיין בסדר יורד", // needs review
  clearSort: "נקה מיון",
  sortedAscending: "ממוין בסדר עולה", // needs review
  sortedDescending: "ממוין בסדר יורד", // needs review
  columnActions: "פעולות עמודה",
  hideColumn: "הסתר עמודה", // needs review
  showAllColumns: "הצג את כל העמודות",
  pinToLeft: "נעץ לשמאל",
  pinToRight: "נעץ לימין",
  unpin: "בטל נעיצה",
  reorderColumn: "הזז",
  reorderRow: "הזז",
  pinRow: "נעץ שורה", // needs review
  unpinRow: "בטל נעיצת שורה", // needs review
  resizeColumn: "שנה גודל עמודה", // needs review
  groupByColumn: (column) => `קבץ לפי ${column}`, // needs review
  ungroupByColumn: (column) => `בטל קיבוץ לפי ${column}`,
  groupedBy: "מקובץ לפי", // needs review
  dropToGroupBy: "גרור עמודה לכאן כדי לקבץ לפיה", // needs review
  expand: "הרחב",
  collapse: "צמצום",
  expandAll: "הרחב הכל",
  collapseAll: "צמצום הכל",
  toggleRowExpanded: "הרחב/כווץ שורה", // needs review
  columnVisibility: "הצג/הסתר עמודות",
  toggleColumnVisibility: "הצג/הסתר",
  filterByColumn: (column) => `סנן לפי ${column}`,
  clearFilter: "נקה סינון",
  filterMode: "מצב סינון", // needs review
  changeFilterMode: "שינוי מצב סינון",
  filterPlaceholder: (column) => `סנן ${column}…`, // needs review
  showColumnFilters: "הצג סינונים", // needs review
  hideColumnFilters: "הסתר סינונים", // needs review
  min: "מינימום",
  max: "מקסימום",
  pickDate: "בחר תאריך", // needs review
  pickDateRange: "בחר טווח תאריכים", // needs review
  true: "אמת", // needs review
  false: "שקר", // needs review
  filterModes: {
    fuzzy: "פעיל",
    contains: "מכיל",
    startsWith: "מתחיל ב",
    endsWith: "מסתיים ב",
    equals: "שווה",
    notEquals: "לא שווה",
    empty: "ריק",
    notEmpty: "לא ריק",
    between: "בין",
    betweenInclusive: "בין כולל",
    greaterThan: "גדול מ",
    greaterThanOrEqualTo: "גדול או שווה ל",
    lessThan: "קטן מ",
    lessThanOrEqualTo: "קטן או שווה ל",
    before: "לפני", // needs review
    after: "אחרי", // needs review
    betweenDates: "בין", // needs review
    equalsString: "שווה",
    arrIncludesSome: "כולל",
    equalsBool: "שווה",
  },
  advancedFilters: "סינון מתקדם", // needs review
  advancedFiltersMatchLabel: "התאם", // needs review
  advancedFiltersMatchAll: "הכול", // needs review
  advancedFiltersMatchAny: "לפחות אחד", // needs review
  advancedFiltersOf: "מהכללים הבאים", // needs review
  advancedFiltersAddRule: "הוסף סינון", // needs review
  advancedFiltersApply: "החל", // needs review
  advancedFiltersClearAll: "נקה הכול", // needs review
  advancedFiltersColumn: "עמודה", // needs review
  advancedFiltersOperator: "אופרטור", // needs review
  advancedFiltersValue: "ערך", // needs review
  advancedFiltersEmpty: "עדיין אין סינונים. הוסף סינון כדי להתחיל.", // needs review
  removeFilterRule: "הסר סינון", // needs review
  advancedFilterOperators: {
    contains: "מכיל",
    notContains: "אינו מכיל", // needs review
    startsWith: "מתחיל ב",
    endsWith: "מסתיים ב",
    equals: "שווה",
    notEquals: "לא שווה",
    isEmpty: "ריק",
    isNotEmpty: "לא ריק",
    greaterThan: "גדול מ",
    greaterThanOrEqual: "גדול או שווה ל",
    lessThan: "קטן מ",
    lessThanOrEqual: "קטן או שווה ל",
    between: "בין",
  },
  search: "חיפוש",
  searchPlaceholder: "חיפוש…", // needs review
  clearSearch: "נקה חיפוש",
  globalFilterMode: "שינוי מצב חיפוש",
  toggleDensity: "שנה צפיפות",
  densityComfortable: "נוח", // needs review
  densityCompact: "דחוס", // needs review
  densitySpacious: "מרווח", // needs review
  enterFullscreen: "כניסה למסך מלא", // needs review
  exitFullscreen: "יציאה ממסך מלא", // needs review
  rowsPerPage: "שורות לעמוד",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("he")}–${end.toLocaleString("he")} מתוך ${total.toLocaleString("he")}`, // needs review
  goToFirstPage: "לדף הראשון",
  goToPreviousPage: "לדף הקודם",
  goToNextPage: "לדף הבא",
  goToLastPage: "לדף האחרון",
  goToPage: (page) => `עבור לעמוד ${page.toLocaleString("he")}`, // needs review
  rowActions: "פעולות שורה",
  edit: "ערוך",
  save: "שמור",
  cancel: "ביטול",
  delete: "מחק", // needs review
  create: "צור", // needs review
  createNewRow: "צור שורה חדשה", // needs review
  editRow: "ערוך שורה", // needs review
  required: "חובה", // needs review
  copy: "העתק",
  copied: "הועתק ללוח",
  cellActions: "פעולות תא", // needs review
  noRecordsToDisplay: "אין רשומות להצגה",
  loading: "טוען…", // needs review
  loadingMore: "טוען עוד…", // needs review
  dragStart: (label) => `הרמת את ${label}.`, // needs review
  dragOver: (label, over) => `${label} מעל ${over}.`, // needs review
  dragEnd: (label, over) => `שחררת את ${label} על ${over}.`, // needs review
  dragCancel: (label) => `הגרירה בוטלה. שחררת את ${label}.`, // needs review
  dragInstructions:
    "כדי להרים פריט, לחץ על רווח או על Enter. בזמן הגרירה, השתמש במקשי החצים כדי להזיז אותו. לחץ שוב על רווח או על Enter כדי לשחרר, או על Escape כדי לבטל.", // needs review
  dragRowLabel: (position) => `שורה ${position.toLocaleString("he")}`, // needs review
}
