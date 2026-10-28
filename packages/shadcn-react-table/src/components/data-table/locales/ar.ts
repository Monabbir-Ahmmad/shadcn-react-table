// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.

import type { DataTableLocalization } from "../core/localization"

export const dataTableLocalizationAr: DataTableLocalization = {
  language: "ar",
  selectAll: "تبديل تحديد الكل",
  selectRow: "تبديل تحديد الصف",
  clearSelection: "إعادة تعيين التحديد",
  rowsSelected: (selected, total) =>
    `تم تحديد ${selected.toLocaleString("ar")} من ${total.toLocaleString("ar")} صف`, // needs review
  sortByColumnAsc: (column) => `فرز ${column} تصاعدي`, // needs review
  sortByColumnDesc: (column) => `فرز ${column} تنازلي`, // needs review
  sortAscending: "فرز تصاعدي", // needs review
  sortDescending: "فرز تنازلي", // needs review
  clearSort: "إعادة تعيين الفرز",
  sortedAscending: "مرتب تصاعديًا", // needs review
  sortedDescending: "مرتب تنازليًا", // needs review
  columnActions: "إجراءات العمود",
  hideColumn: "إخفاء العمود", // needs review
  showAllColumns: "إظهار كافة الأعمدة",
  pinToLeft: "تثبيت جهة اليسار",
  pinToRight: "تثبيت على اليمين",
  unpin: "عدم التثبيت",
  reorderColumn: "حرك",
  reorderRow: "حرك",
  pinRow: "تثبيت الصف", // needs review
  unpinRow: "إلغاء تثبيت الصف", // needs review
  resizeColumn: "تغيير حجم العمود", // needs review
  groupByColumn: (column) => `تجميع حسب ${column}`, // needs review
  ungroupByColumn: (column) => `فك التجميع حسب ${column}`,
  groupedBy: "مجمّع حسب", // needs review
  dropToGroupBy: "اسحب عمودًا إلى هنا للتجميع حسبه", // needs review
  expand: "إظهار",
  collapse: "إخفاء",
  expandAll: "إظهار الكل",
  collapseAll: "إخفاء الكل",
  toggleRowExpanded: "توسيع/طي الصف", // needs review
  columnVisibility: "إظهار / إخفاء الأعمدة",
  toggleColumnVisibility: "تبديل الرؤية",
  filterByColumn: (column) => `مصنف بواسطة ${column}`,
  clearFilter: "إعادة تعين المرشح",
  filterMode: "وضع التصفية", // needs review
  changeFilterMode: "تغيير وضع المرشح",
  filterPlaceholder: (column) => `تصفية ${column}…`, // needs review
  showColumnFilters: "إظهار المرشحات", // needs review
  hideColumnFilters: "إخفاء المرشحات", // needs review
  min: "الأقل",
  max: "الأعلى",
  pickDate: "اختر تاريخًا", // needs review
  pickDateRange: "اختر نطاق تواريخ", // needs review
  true: "صحيح", // needs review
  false: "خطأ", // needs review
  filterModes: {
    fuzzy: "غامض",
    contains: "يتضمن",
    startsWith: " يبدا ب",
    endsWith: "ينتهي بـ",
    equals: "يساوي",
    notEquals: "لا يساوي",
    empty: "فارغ",
    notEmpty: "ليس فارغًا",
    between: "بين",
    betweenInclusive: "بين الشمول",
    greaterThan: "أكثر من",
    greaterThanOrEqualTo: "أكبر من أو يساوي",
    lessThan: "أقل من",
    lessThanOrEqualTo: "أقل من أو يساوي",
    before: "قبل", // needs review
    after: "بعد", // needs review
    betweenDates: "بين", // needs review
    equalsString: "يساوي",
    arrIncludesSome: "يشمل",
    equalsBool: "يساوي",
  },
  advancedFilters: "مرشحات متقدمة", // needs review
  advancedFiltersMatchLabel: "مطابقة", // needs review
  advancedFiltersMatchAll: "جميع", // needs review
  advancedFiltersMatchAny: "أيٍّ من", // needs review
  advancedFiltersOf: "القواعد التالية", // needs review
  advancedFiltersAddRule: "إضافة مرشح", // needs review
  advancedFiltersApply: "تطبيق", // needs review
  advancedFiltersClearAll: "مسح الكل", // needs review
  advancedFiltersColumn: "العمود", // needs review
  advancedFiltersOperator: "المعامل", // needs review
  advancedFiltersValue: "القيمة", // needs review
  advancedFiltersEmpty: "لا توجد مرشحات بعد. أضف واحدًا للبدء.", // needs review
  removeFilterRule: "إزالة المرشح", // needs review
  advancedFilterOperators: {
    contains: "يتضمن",
    notContains: "لا يتضمن", // needs review
    startsWith: " يبدا ب",
    endsWith: "ينتهي بـ",
    equals: "يساوي",
    notEquals: "لا يساوي",
    isEmpty: "فارغ",
    isNotEmpty: "ليس فارغًا",
    greaterThan: "أكثر من",
    greaterThanOrEqual: "أكبر من أو يساوي",
    lessThan: "أقل من",
    lessThanOrEqual: "أقل من أو يساوي",
    between: "بين",
  },
  search: "بحث",
  searchPlaceholder: "بحث…", // needs review
  clearSearch: "إعادة تعيين البحث",
  globalFilterMode: "تغيير وضع البحث",
  toggleDensity: "تبديل الكثافة",
  densityComfortable: "مريح", // needs review
  densityCompact: "مضغوط", // needs review
  densitySpacious: "واسع", // needs review
  enterFullscreen: "ملء الشاشة", // needs review
  exitFullscreen: "الخروج من ملء الشاشة", // needs review
  rowsPerPage: "عدد الصفوف في الصفحة",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("ar")}–${end.toLocaleString("ar")} من ${total.toLocaleString("ar")}`, // needs review
  goToFirstPage: "الصفحة الأولى",
  goToPreviousPage: "الصفحة السابقة",
  goToNextPage: "الصفحة التالية",
  goToLastPage: "الصفحة الأخيرة",
  goToPage: (page) => `الانتقال إلى الصفحة ${page.toLocaleString("ar")}`, // needs review
  rowActions: "إجراءات الصف",
  edit: "تعديل",
  save: "حفظ",
  cancel: "إلغاء",
  delete: "حذف", // needs review
  create: "إنشاء", // needs review
  createNewRow: "إنشاء صف جديد", // needs review
  editRow: "تعديل الصف", // needs review
  required: "مطلوب", // needs review
  copy: "نسخ",
  copied: "نسخ إلى الحافظة",
  cellActions: "إجراءات الخلية", // needs review
  noRecordsToDisplay: "لا سجلات لعرضها",
  loading: "جارٍ التحميل…", // needs review
  loadingMore: "جارٍ تحميل المزيد…", // needs review
  dragStart: (label) => `تم التقاط ${label}.`, // needs review
  dragOver: (label, over) => `${label} فوق ${over}.`, // needs review
  dragEnd: (label, over) => `تم إفلات ${label} على ${over}.`, // needs review
  dragCancel: (label) => `تم إلغاء السحب. تم إفلات ${label}.`, // needs review
  dragInstructions:
    "لالتقاط عنصر، اضغط على المسافة أو Enter. أثناء السحب، استخدم مفاتيح الأسهم لتحريكه. اضغط على المسافة أو Enter مرة أخرى لإفلاته، أو اضغط على Escape للإلغاء.", // needs review
  dragRowLabel: (position) => `الصف ${position.toLocaleString("ar")}`, // needs review
}
