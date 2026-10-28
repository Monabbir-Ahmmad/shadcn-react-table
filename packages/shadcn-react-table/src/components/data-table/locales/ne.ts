// Translations adapted from Material React Table (MIT License,
// Copyright (c) 2022 Kevin Vandy). Lines marked "needs review" were added
// here and have not yet been checked by a native speaker.

import type { DataTableLocalization } from "../core/localization"

export const dataTableLocalizationNe: DataTableLocalization = {
  language: "ne",
  selectAll: "सबै चयन गर्नुहोस्/हटाउनुहोस्",
  selectRow: "पंक्ति चयन गर्नुहोस्/हटाउनुहोस्",
  clearSelection: "चयन हटाउनुहोस्",
  rowsSelected: (selected, total) =>
    `${total.toLocaleString("ne")} पंक्तिमध्ये ${selected.toLocaleString("ne")} चयनित`, // needs review
  sortByColumnAsc: (column) =>
    `${column} का आधारमा बढ्दो क्रममा क्रमबद्ध गर्नुहोस्`, // needs review
  sortByColumnDesc: (column) =>
    `${column} का आधारमा घट्दो क्रममा क्रमबद्ध गर्नुहोस्`, // needs review
  sortAscending: "बढ्दो क्रममा क्रमबद्ध गर्नुहोस्", // needs review
  sortDescending: "घट्दो क्रममा क्रमबद्ध गर्नुहोस्", // needs review
  clearSort: "क्रम हटाउनुहोस्",
  sortedAscending: "बढ्दो क्रममा क्रमबद्ध गरिएको", // needs review
  sortedDescending: "घट्दो क्रममा क्रमबद्ध गरिएको", // needs review
  columnActions: "यस स्तम्भका कार्यहरू",
  hideColumn: "स्तम्भ लुकाउनुहोस्", // needs review
  showAllColumns: "सबै स्तम्भ देखाउनुहोस्",
  pinToLeft: "बायाँतर्फ पिन गर्नुहोस्",
  pinToRight: "दायाँतर्फ पिन गर्नुहोस्",
  unpin: "अनपिन गर्नुहोस्",
  reorderColumn: "सार्नुहोस्",
  reorderRow: "सार्नुहोस्",
  pinRow: "पंक्ति पिन गर्नुहोस्", // needs review
  unpinRow: "पंक्ति अनपिन गर्नुहोस्", // needs review
  resizeColumn: "स्तम्भको आकार बदल्नुहोस्", // needs review
  groupByColumn: (column) => `${column} का आधारमा समूह बनाउनुहोस्`, // needs review
  ungroupByColumn: (column) => `${column} का आधारमा समूह हटाउनुहोस्`,
  groupedBy: "समूह बनाइएको आधार", // needs review
  dropToGroupBy: "समूह बनाउन स्तम्भ यहाँ तान्नुहोस्", // needs review
  expand: "विस्तार गर्नुहोस्",
  collapse: "संकुचित गर्नुहोस्",
  expandAll: "सबै विस्तार गर्नुहोस्",
  collapseAll: "सबै संकुचित गर्नुहोस्",
  toggleRowExpanded: "पंक्ति विस्तार/संकुचन गर्नुहोस्", // needs review
  columnVisibility: "स्तम्भ देखाउनुहोस्/लुकाउनुहोस्",
  toggleColumnVisibility: "दृश्यता परिवर्तन गर्नुहोस्",
  filterByColumn: (column) => `${column} का आधारमा फिल्टर गर्नुहोस्`,
  clearFilter: "फिल्टर हटाउनुहोस्",
  filterMode: "फिल्टर प्रणाली", // needs review
  changeFilterMode: "फिल्टर प्रणाली परिवर्तन गर्नुहोस्",
  filterPlaceholder: (column) => `${column} फिल्टर गर्नुहोस्…`, // needs review
  showColumnFilters: "फिल्टर देखाउनुहोस्", // needs review
  hideColumnFilters: "फिल्टर लुकाउनुहोस्", // needs review
  min: "न्यूनतम",
  max: "अधिकतम",
  pickDate: "मिति छान्नुहोस्", // needs review
  pickDateRange: "मितिको दायरा छान्नुहोस्", // needs review
  true: "सत्य", // needs review
  false: "असत्य", // needs review
  filterModes: {
    fuzzy: "अस्पष्ट",
    contains: "समावेश गरिएको",
    startsWith: "सुरुमा समावेश गरिएको",
    endsWith: "अन्तमा समावेश गरिएको",
    equals: "समान",
    notEquals: "असमान",
    empty: "खाली भएको",
    notEmpty: "खाली नभएको",
    between: "बीचको",
    betweenInclusive: "बीचमा समावेश गरिएको",
    greaterThan: "ठुलो भएको",
    greaterThanOrEqualTo: "ठुलो वा समान",
    lessThan: "सानो भएको",
    lessThanOrEqualTo: "सानो वा समान",
    before: "अघि", // needs review
    after: "पछि", // needs review
    betweenDates: "बीच", // needs review
    equalsString: "समान",
    arrIncludesSome: "केही समावेश भएको",
    equalsBool: "समान",
  },
  advancedFilters: "उन्नत फिल्टरहरू", // needs review
  advancedFiltersMatchLabel: "तलका नियमहरूमध्ये", // needs review
  advancedFiltersMatchAll: "सबै", // needs review
  advancedFiltersMatchAny: "कुनै एक", // needs review
  advancedFiltersOf: "मिल्नुपर्छ", // needs review
  advancedFiltersAddRule: "फिल्टर थप्नुहोस्", // needs review
  advancedFiltersApply: "लागू गर्नुहोस्", // needs review
  advancedFiltersClearAll: "सबै हटाउनुहोस्", // needs review
  advancedFiltersColumn: "स्तम्भ", // needs review
  advancedFiltersOperator: "अपरेटर", // needs review
  advancedFiltersValue: "मान", // needs review
  advancedFiltersEmpty: "अहिलेसम्म कुनै फिल्टर छैन। सुरु गर्न एउटा थप्नुहोस्।", // needs review
  removeFilterRule: "फिल्टर हटाउनुहोस्", // needs review
  advancedFilterOperators: {
    contains: "समावेश गरिएको",
    notContains: "समावेश गर्दैन", // needs review
    startsWith: "सुरुमा समावेश गरिएको",
    endsWith: "अन्तमा समावेश गरिएको",
    equals: "समान",
    notEquals: "असमान",
    isEmpty: "खाली भएको",
    isNotEmpty: "खाली नभएको",
    greaterThan: "ठुलो भएको",
    greaterThanOrEqual: "ठुलो वा समान",
    lessThan: "सानो भएको",
    lessThanOrEqual: "सानो वा समान",
    between: "बीचको",
  },
  search: "खोज्नुहोस्",
  searchPlaceholder: "खोज्नुहोस्…", // needs review
  clearSearch: "खोजिएको शब्द मेट्नुहोस्",
  globalFilterMode: "खोज प्रणाली परिवर्तन गर्नुहोस्",
  toggleDensity: "घनत्व परिवर्तन गर्नुहोस्",
  densityComfortable: "आरामदायक", // needs review
  densityCompact: "सघन", // needs review
  densitySpacious: "फराकिलो", // needs review
  enterFullscreen: "पूर्ण स्क्रिन खोल्नुहोस्", // needs review
  exitFullscreen: "पूर्ण स्क्रिनबाट बाहिर निस्कनुहोस्", // needs review
  rowsPerPage: "प्रति पृष्ठ",
  paginationRange: (start, end, total) =>
    `कुल ${total.toLocaleString("ne")} मध्ये ${start.toLocaleString("ne")}–${end.toLocaleString("ne")}`, // needs review
  goToFirstPage: "पहिलो पृष्ठमा जानुहोस्",
  goToPreviousPage: "अघिल्लो पृष्ठमा जानुहोस्",
  goToNextPage: "अर्को पृष्ठमा जानुहोस्",
  goToLastPage: "अन्तिम पृष्ठमा जानुहोस्",
  goToPage: (page) => `पृष्ठ ${page.toLocaleString("ne")} मा जानुहोस्`, // needs review
  rowActions: "पंक्तिका कार्यहरू",
  edit: "सम्पादन गर्नुहोस्",
  save: "सुरक्षित गर्नुहोस्",
  cancel: "रद्द गर्नुहोस्",
  delete: "मेट्नुहोस्", // needs review
  create: "सिर्जना गर्नुहोस्", // needs review
  createNewRow: "नयाँ पंक्ति सिर्जना गर्नुहोस्", // needs review
  editRow: "पंक्ति सम्पादन गर्नुहोस्", // needs review
  required: "आवश्यक", // needs review
  copy: "प्रतिलिपि बनाउनुहोस्",
  copied: "क्लिपबोर्डमा प्रतिलिपि गरियो",
  cellActions: "सेलका कार्यहरू", // needs review
  noRecordsToDisplay: "केही रेकर्ड छैन",
  loading: "लोड हुँदैछ…", // needs review
  loadingMore: "थप लोड हुँदैछ…", // needs review
  dragStart: (label) => `${label} उठाइयो।`, // needs review
  dragOver: (label, over) => `${label} ${over} माथि छ।`, // needs review
  dragEnd: (label, over) => `${label} ${over} मा छोडियो।`, // needs review
  dragCancel: (label) => `तान्ने कार्य रद्द गरियो। ${label} छोडियो।`, // needs review
  dragInstructions:
    "कुनै वस्तु उठाउन स्पेस वा इन्टर थिच्नुहोस्। तान्दै गर्दा सार्न एरो कुञ्जीहरू प्रयोग गर्नुहोस्। छोड्न फेरि स्पेस वा इन्टर थिच्नुहोस्, वा रद्द गर्न एस्केप थिच्नुहोस्।", // needs review
  dragRowLabel: (position) => `पंक्ति ${position.toLocaleString("ne")}`, // needs review
}
