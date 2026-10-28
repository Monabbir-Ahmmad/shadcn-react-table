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

export const dataTableLocalizationVi: DataTableLocalization = {
  language: "vi",
  selectAll: "Chọn tất cả",
  selectRow: "Chọn hàng này",
  clearSelection: "Xoá lựa chọn",
  rowsSelected: (selected, total) =>
    `Đã chọn ${selected.toLocaleString("vi")}/${total.toLocaleString("vi")} hàng`, // needs review
  sortByColumnAsc: (column) => `Sắp xếp theo ${column} (tăng dần)`, // needs review
  sortByColumnDesc: (column) => `Sắp xếp theo ${column} (giảm dần)`, // needs review
  sortAscending: "Sắp xếp tăng dần", // needs review
  sortDescending: "Sắp xếp giảm dần", // needs review
  clearSort: "Huỷ sắp xếp",
  sortedAscending: "Đã sắp xếp tăng dần", // needs review
  sortedDescending: "Đã sắp xếp giảm dần", // needs review
  columnActions: "Lựa chọn",
  hideColumn: "Ẩn cột", // needs review
  showAllColumns: "Hiện tất cả các cột",
  pinToLeft: "Ghim sang trái",
  pinToRight: "Ghim sang phải",
  unpin: "Bỏ ghim",
  reorderColumn: "Di chuyển",
  reorderRow: "Di chuyển",
  pinRow: "Ghim hàng", // needs review
  unpinRow: "Bỏ ghim hàng", // needs review
  resizeColumn: "Đổi kích thước cột", // needs review
  groupByColumn: (column) => `Nhóm theo ${column}`, // needs review
  ungroupByColumn: (column) => `Bỏ nhóm dữ liệu theo ${column}`,
  groupedBy: "Đã nhóm theo", // needs review
  dropToGroupBy: "Kéo một cột vào đây để nhóm theo cột đó", // needs review
  expand: "Mở rộng",
  collapse: "Thu gọn",
  expandAll: "Mở rộng tất cả",
  collapseAll: "Thu gọn tất cả",
  toggleRowExpanded: "Mở rộng/thu gọn hàng", // needs review
  columnVisibility: "Ẩn/hiện cột",
  toggleColumnVisibility: "Ẩn/hiện cột này",
  filterByColumn: (column) => `Lọc kết quả theo ${column}`,
  clearFilter: "Xoá bộ lọc",
  filterMode: "Chế độ lọc", // needs review
  changeFilterMode: "Thay đổi chế độ lọc",
  filterPlaceholder: (column) => `Lọc ${column}…`, // needs review
  showColumnFilters: "Hiện bộ lọc", // needs review
  hideColumnFilters: "Ẩn bộ lọc", // needs review
  min: "Từ",
  max: "Đến",
  pickDate: "Chọn ngày", // needs review
  pickDateRange: "Chọn khoảng ngày", // needs review
  true: "Đúng", // needs review
  false: "Sai", // needs review
  filterModes: {
    fuzzy: "Xấp xỉ",
    contains: "Bao gồm",
    startsWith: "Bắt đầu bằng",
    endsWith: "Kết thúc với",
    equals: "Bằng",
    notEquals: "Khác",
    empty: "Trống",
    notEmpty: "Có giá trị",
    between: "Trong khoảng",
    betweenInclusive: "Trong khoảng và bao gồm",
    greaterThan: "Lớn hơn",
    greaterThanOrEqualTo: "Lớn hơn hoặc bằng",
    lessThan: "Bé hớn",
    lessThanOrEqualTo: "Bé hơn hoặc bằng",
    before: "Trước", // needs review
    after: "Sau", // needs review
    betweenDates: "Trong khoảng", // needs review
    equalsString: "Bẳng",
    arrIncludesSome: "Bao gồm",
    equalsBool: "Bằng",
  },
  advancedFilters: "Bộ lọc nâng cao", // needs review
  advancedFiltersMatchLabel: "Khớp", // needs review
  advancedFiltersMatchAll: "tất cả", // needs review
  advancedFiltersMatchAny: "bất kỳ", // needs review
  advancedFiltersOf: "quy tắc sau", // needs review
  advancedFiltersAddRule: "Thêm bộ lọc", // needs review
  advancedFiltersApply: "Áp dụng", // needs review
  advancedFiltersClearAll: "Xoá tất cả", // needs review
  advancedFiltersColumn: "Cột", // needs review
  advancedFiltersOperator: "Toán tử", // needs review
  advancedFiltersValue: "Giá trị", // needs review
  advancedFiltersEmpty: "Chưa có bộ lọc nào. Hãy thêm một bộ lọc để bắt đầu.", // needs review
  removeFilterRule: "Xoá bộ lọc", // needs review
  advancedFilterOperators: {
    contains: "Bao gồm",
    notContains: "không chứa", // needs review
    startsWith: "Bắt đầu bằng",
    endsWith: "Kết thúc với",
    equals: "Bằng",
    notEquals: "Khác",
    isEmpty: "Trống",
    isNotEmpty: "Có giá trị",
    greaterThan: "Lớn hơn",
    greaterThanOrEqual: "Lớn hơn hoặc bằng",
    lessThan: "Bé hớn",
    lessThanOrEqual: "Bé hơn hoặc bằng",
    between: "Trong khoảng",
  },
  search: "Tìm kiếm",
  searchPlaceholder: "Tìm kiếm…", // needs review
  clearSearch: "Xoá ô tìm kiếm",
  globalFilterMode: "Thay đổi chế độ tìm kiếm",
  toggleDensity: "Thay đổi độ cao mỗi hàng",
  densityComfortable: "Thoải mái", // needs review
  densityCompact: "Gọn", // needs review
  densitySpacious: "Rộng rãi", // needs review
  enterFullscreen: "Vào chế độ toàn màn hình", // needs review
  exitFullscreen: "Thoát chế độ toàn màn hình", // needs review
  rowsPerPage: "Số hàng/trang",
  paginationRange: (start, end, total) =>
    `${start.toLocaleString("vi")}–${end.toLocaleString("vi")} trên ${total.toLocaleString("vi")}`, // needs review
  goToFirstPage: "Tới trang đầu",
  goToPreviousPage: "Tới trang trước",
  goToNextPage: "Tới trang tiếp theo",
  goToLastPage: "Tới trang cuối",
  goToPage: (page) => `Đến trang ${page.toLocaleString("vi")}`, // needs review
  rowActions: "Thao tác",
  edit: "Chỉnh sửa",
  save: "Lưu",
  cancel: "Huỷ bỏ",
  delete: "Xoá", // needs review
  create: "Tạo", // needs review
  createNewRow: "Tạo hàng mới", // needs review
  editRow: "Chỉnh sửa hàng", // needs review
  required: "Bắt buộc", // needs review
  copy: "Sao chép",
  copied: "Sao chép vào bảng tạm",
  cellActions: "Thao tác ô", // needs review
  noRecordsToDisplay: "Không có dữ liệu",
  loading: "Đang tải…", // needs review
  loadingMore: "Đang tải thêm…", // needs review
  dragStart: (label) => `Đã nhấc ${label}.`, // needs review
  dragOver: (label, over) => `${label} đang ở trên ${over}.`, // needs review
  dragEnd: (label, over) => `${label} đã được thả vào ${over}.`, // needs review
  dragCancel: (label) => `Đã huỷ kéo. ${label} đã được thả.`, // needs review
  dragInstructions:
    "Để nhấc một mục, nhấn phím cách hoặc Enter. Khi đang kéo, dùng các phím mũi tên để di chuyển mục đó. Nhấn phím cách hoặc Enter lần nữa để thả, hoặc nhấn Escape để huỷ.", // needs review
  dragRowLabel: (position) => `Hàng ${position.toLocaleString("vi")}`, // needs review
}
