// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.

import type { DataTableLocalization } from "../core/localization"

export const dataTableLocalizationFa: DataTableLocalization = {
  language: "fa",
  selectAll: "انتخاب همه",
  selectRow: "انتخاب ردیف",
  clearSelection: "پاک کردن انتخاب",
  rowsSelected: (selected, total) =>
    `${selected.toLocaleString("fa")} از ${total.toLocaleString("fa")} ردیف انتخاب شد`, // needs review
  sortByColumnAsc: (column) => `مرتب کردن ${column} صعودی`, // needs review
  sortByColumnDesc: (column) => `مرتب کردن ${column} نزولی`, // needs review
  sortAscending: "مرتب کردن صعودی", // needs review
  sortDescending: "مرتب کردن نزولی", // needs review
  clearSort: "پاک کردن مرتب سازی",
  sortedAscending: "مرتب شده صعودی", // needs review
  sortedDescending: "مرتب شده نزولی", // needs review
  columnActions: "اقدامات ستون",
  hideColumn: "پنهان کردن ستون", // needs review
  showAllColumns: "نمایش تمام ستون ها",
  pinToLeft: "پین به چپ",
  pinToRight: "پین به راست",
  unpin: "پین کردن",
  reorderColumn: "حرکت",
  reorderRow: "حرکت",
  pinRow: "پین کردن ردیف", // needs review
  unpinRow: "برداشتن پین ردیف", // needs review
  resizeColumn: "تغییر اندازه ستون", // needs review
  groupByColumn: (column) => `گروه بندی بر اساس ${column}`, // needs review
  ungroupByColumn: (column) => `لغو گروه بندی توسط ${column}`,
  groupedBy: "گروه بندی بر اساس", // needs review
  dropToGroupBy: "ستونی را برای گروه بندی به اینجا بکشید", // needs review
  expand: "باز کردن",
  collapse: "بستن",
  expandAll: "باز کردن همه",
  collapseAll: "بستن همه",
  toggleRowExpanded: "باز/بسته کردن ردیف", // needs review
  columnVisibility: "نمایش/مخفی کردن ستون ها",
  toggleColumnVisibility: "نمایش",
  filterByColumn: (column) => `فیلتر توسط ${column}`,
  clearFilter: "پاک کردن فیلتر",
  filterMode: "حالت فیلتر", // needs review
  changeFilterMode: "تغییر حالت فیلتر",
  filterPlaceholder: (column) => `فیلتر ${column}…`, // needs review
  showColumnFilters: "نمایش فیلتر ها", // needs review
  hideColumnFilters: "مخفی کردن فیلتر ها", // needs review
  min: "حداقل",
  max: "حداکثر",
  pickDate: "انتخاب تاریخ", // needs review
  pickDateRange: "انتخاب بازه تاریخ", // needs review
  true: "درست", // needs review
  false: "نادرست", // needs review
  filterModes: {
    fuzzy: "درهم",
    contains: "شامل",
    startsWith: "شروع با ",
    endsWith: "به پایان می رسد با",
    equals: "مساوی",
    notEquals: "مساوی نبودن با  ",
    empty: "خالی",
    notEmpty: "خالی نبودن  ",
    between: "بین",
    betweenInclusive: "شامل بین",
    greaterThan: "بزرگتر از",
    greaterThanOrEqualTo: "بزرگتر مساوی با",
    lessThan: "کمتر از",
    lessThanOrEqualTo: "کمتر مساوی با",
    before: "قبل از", // needs review
    after: "بعد از", // needs review
    betweenDates: "بین", // needs review
    equalsString: "مساوی",
    arrIncludesSome: "شامل برخی",
    equalsBool: "مساوی",
  },
  advancedFilters: "فیلتر های پیشرفته", // needs review
  advancedFiltersMatchLabel: "تطابق", // needs review
  advancedFiltersMatchAll: "همه", // needs review
  advancedFiltersMatchAny: "هر یک", // needs review
  advancedFiltersOf: "از قوانین زیر", // needs review
  advancedFiltersAddRule: "افزودن فیلتر", // needs review
  advancedFiltersApply: "اعمال", // needs review
  advancedFiltersClearAll: "پاک کردن همه", // needs review
  advancedFiltersColumn: "ستون", // needs review
  advancedFiltersOperator: "عملگر", // needs review
  advancedFiltersValue: "مقدار", // needs review
  advancedFiltersEmpty: "هنوز فیلتری وجود ندارد. برای شروع یکی اضافه کنید.", // needs review
  removeFilterRule: "حذف فیلتر", // needs review
  advancedFilterOperators: {
    contains: "شامل",
    notContains: "شامل نمی شود", // needs review
    startsWith: "شروع با ",
    endsWith: "به پایان می رسد با",
    equals: "مساوی",
    notEquals: "مساوی نبودن با  ",
    isEmpty: "خالی",
    isNotEmpty: "خالی نبودن  ",
    greaterThan: "بزرگتر از",
    greaterThanOrEqual: "بزرگتر مساوی با",
    lessThan: "کمتر از",
    lessThanOrEqual: "کمتر مساوی با",
    between: "بین",
  },
  search: "جستجو",
  searchPlaceholder: "جستجو…", // needs review
  clearSearch: "پاک کردن جستجو",
  globalFilterMode: "تغییر حالت جستجو",
  toggleDensity: "حجم ردیف ها",
  densityComfortable: "راحت", // needs review
  densityCompact: "فشرده", // needs review
  densitySpacious: "وسیع", // needs review
  enterFullscreen: "ورود به حالت تمام صفحه", // needs review
  exitFullscreen: "خروج از حالت تمام صفحه", // needs review
  rowsPerPage: "تعداد ردیف در هر صفحه",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("fa")}–${end.toLocaleString("fa")} از ${total.toLocaleString("fa")}`, // needs review
  goToFirstPage: "صفحه اول",
  goToPreviousPage: "صفحه قبل",
  goToNextPage: "صفحه بعد",
  goToLastPage: "صفحه آخر",
  goToPage: (page) => `رفتن به صفحه ${page.toLocaleString("fa")}`, // needs review
  rowActions: "اقدامات ردیف",
  edit: "ویرایش",
  save: "ذخیره کردن",
  cancel: "انصراف",
  delete: "حذف", // needs review
  create: "ایجاد", // needs review
  createNewRow: "ایجاد ردیف جدید", // needs review
  editRow: "ویرایش ردیف", // needs review
  required: "الزامی", // needs review
  copy: "کپی",
  copied: "کپی به کلیپ بورد",
  cellActions: "عملیات سلول", // needs review
  noRecordsToDisplay: "موردی برای نمایش نمی باشد.",
  loading: "در حال بارگذاری…", // needs review
  loadingMore: "در حال بارگذاری بیشتر…", // needs review
  dragStart: (label) => `${label} برداشته شد.`, // needs review
  dragOver: (label, over) => `${label} روی ${over} قرار دارد.`, // needs review
  dragEnd: (label, over) => `${label} روی ${over} رها شد.`, // needs review
  dragCancel: (label) => `کشیدن لغو شد. ${label} رها شد.`, // needs review
  dragInstructions:
    "برای برداشتن یک مورد، کلید فاصله یا Enter را فشار دهید. هنگام کشیدن، با کلیدهای جهتی آن را جابجا کنید. برای رها کردن دوباره کلید فاصله یا Enter را فشار دهید یا برای لغو Escape را بزنید.", // needs review
  dragRowLabel: (position) => `ردیف ${position.toLocaleString("fa")}`, // needs review
}
