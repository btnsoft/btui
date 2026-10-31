import { createContext, useContext } from "react";

export type BtuiLocale = {
  lang: string;
  select: string;
  search: string;
  noResults: string;
  clear: string;
  close: string;
  confirm: string;
  cancel: string;
  areYouSure: string;
  loading: string;
  empty: string;
  columns: string;
  resetColumns: string;
  density: string;
  compact: string;
  comfortable: string;
  moreFilters: string;
  clearFilters: string;
  menu: string;
  previous: string;
  next: string;
  showDetail: string;
  selected: (count: number) => string;
  records: (from: number, to: number, total: number) => string;
  dropTitle: string;
  dropHint: string;
  fileRejected: (name: string) => string;
  fileTooLarge: (name: string) => string;
  remove: string;
  increase: string;
  decrease: string;
  selectAll: string;
  selectRow: string;
  notifications: string;
  breadcrumb: string;
  tooManyFiles: (max: number) => string;
  today: string;
  openCalendar: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  chooseMonth: string;
  startDate: string;
  endDate: string;
  invalidDate: string;
  pagination: string;
  chart: { showTable: string; showChart: string; empty: string; other: string; type: string; trend: (first: string, last: string, high: string) => string; kinds: Record<"bar" | "stacked" | "line" | "area" | "donut", string> };
  grid: {
    filter: string; clearFilter: string; clearFilters: (count: number) => string; condition: string; value: string; valueTo: string; blank: string; selectAllValues: string;
    ops: Record<"contains" | "notContains" | "equals" | "startsWith" | "empty" | "notEmpty" | "=" | "!=" | ">" | ">=" | "<" | "<=" | "between", string>;
    sortAsc: string; sortDesc: string; sortHint: string; columnMenu: string; pin: string; pinLeft: string; pinRight: string; unpin: string; hide: string; autoSize: string; moveLeft: string; moveRight: string; resize: string;
    groupBy: string; ungroup: string; expandAll: string; collapseAll: string; total: string;
    export: string; exportExcel: string; exportCsv: string; exportSelected: (count: number) => string; copy: string; copyWithHeaders: string;
    count: string; sum: string; average: string; min: string; max: string; invalidNumber: string; rowsPerPage: string; perPage: (count: number) => string; selectAllRows: (count: number) => string; fillHint: string; makeChart: string; chartTitle: string; chartNeedsNumbers: string;
  };
  presets: { today: string; yesterday: string; last7: string; last30: string; thisMonth: string; lastMonth: string; thisYear: string };
};

export const tr: BtuiLocale = {
  lang: "tr",
  select: "Seçin",
  search: "Ara…",
  noResults: "Sonuç yok",
  clear: "Temizle",
  close: "Kapat",
  confirm: "Onayla",
  cancel: "İptal",
  areYouSure: "Emin misiniz?",
  loading: "Yükleniyor…",
  empty: "Kayıt yok.",
  columns: "Kolonlar",
  resetColumns: "Varsayılana dön",
  density: "Satır yoğunluğu",
  compact: "Sık",
  comfortable: "Ferah",
  moreFilters: "Daha fazla filtre",
  clearFilters: "Filtreleri temizle",
  menu: "Menü",
  previous: "Önceki sayfa",
  next: "Sonraki sayfa",
  showDetail: "Ayrıntıyı göster",
  selected: (count) => `${count} seçili`,
  records: (from, to, total) => `${from}-${to} / ${total} kayıt`,
  dropTitle: "Dosya seçin",
  dropHint: "ya da buraya sürükleyin",
  fileRejected: (name) => `${name}: bu dosya türü kabul edilmiyor`,
  fileTooLarge: (name) => `${name}: dosya çok büyük`,
  remove: "Kaldır",
  increase: "Artır",
  decrease: "Azalt",
  selectAll: "Tümünü seç",
  selectRow: "Satırı seç",
  notifications: "Bildirimler",
  breadcrumb: "Sayfa yolu",
  tooManyFiles: (max) => `En çok ${max} dosya eklenebilir`,
  today: "Bugün",
  openCalendar: "Takvimi aç",
  previousMonth: "Önceki ay",
  nextMonth: "Sonraki ay",
  previousYear: "Önceki yıl",
  nextYear: "Sonraki yıl",
  chooseMonth: "Ay seç",
  startDate: "Başlangıç tarihi",
  endDate: "Bitiş tarihi",
  invalidDate: "Geçersiz tarih",
  pagination: "Sayfalama",
  chart: { showTable: "Tablo", showChart: "Grafik", empty: "Gösterilecek veri yok", other: "Diğer", type: "Grafik türü", trend: (first, last, high) => `Eğilim: ${first} değerinden ${last} değerine, en yüksek ${high}`, kinds: { bar: "Çubuk", stacked: "Yığılmış", line: "Çizgi", area: "Alan", donut: "Halka" } },
  grid: {
    filter: "Filtre", clearFilter: "Filtreyi kaldır", clearFilters: (count) => `Filtreleri temizle (${count})`, condition: "Koşul", value: "Değer", valueTo: "Üst değer", blank: "(Boş)", selectAllValues: "Tümünü seç",
    ops: { contains: "İçerir", notContains: "İçermez", equals: "Eşittir", startsWith: "İle başlar", empty: "Boş", notEmpty: "Boş değil", "=": "Eşittir", "!=": "Eşit değil", ">": "Büyüktür", ">=": "Büyük eşit", "<": "Küçüktür", "<=": "Küçük eşit", between: "Arasında" },
    sortAsc: "Artan", sortDesc: "Azalan", sortHint: "Shift ile basarak ikinci sıralama ekleyin", columnMenu: "kolon menüsü", pin: "Sabitle", pinLeft: "Sola", pinRight: "Sağa", unpin: "Kaldır", hide: "Gizle", autoSize: "Sığdır", moveLeft: "Sola taşı", moveRight: "Sağa taşı", resize: "genişliği ayarla",
    groupBy: "Grupla", ungroup: "Grubu kaldır", expandAll: "Tümünü aç", collapseAll: "Tümünü kapat", total: "Toplam",
    export: "Dışa aktar", exportExcel: "Excel (.xlsx)", exportCsv: "CSV", exportSelected: (count) => `Seçili ${count} satır (.xlsx)`, copy: "Kopyala", copyWithHeaders: "Başlıklarla kopyala",
    count: "Adet", sum: "Toplam", average: "Ortalama", min: "En az", max: "En çok", invalidNumber: "Geçersiz sayı", rowsPerPage: "Sayfa başına satır", perPage: (count) => `${count} satır`, selectAllRows: (count) => `${count} kaydın tümünü seç`, fillHint: "Sürükleyerek doldurun", makeChart: "Grafik oluştur", chartTitle: "Seçimden grafik", chartNeedsNumbers: "Grafik için sayısal hücreler seçin",
  },
  presets: { today: "Bugün", yesterday: "Dün", last7: "Son 7 gün", last30: "Son 30 gün", thisMonth: "Bu ay", lastMonth: "Geçen ay", thisYear: "Bu yıl" },
};

export const en: BtuiLocale = {
  lang: "en",
  select: "Select",
  search: "Search…",
  noResults: "No results",
  clear: "Clear",
  close: "Close",
  confirm: "Confirm",
  cancel: "Cancel",
  areYouSure: "Are you sure?",
  loading: "Loading…",
  empty: "No records.",
  columns: "Columns",
  resetColumns: "Reset to default",
  density: "Row density",
  compact: "Compact",
  comfortable: "Comfortable",
  moreFilters: "More filters",
  clearFilters: "Clear filters",
  menu: "Menu",
  previous: "Previous page",
  next: "Next page",
  showDetail: "Show details",
  selected: (count) => `${count} selected`,
  records: (from, to, total) => `${from}-${to} of ${total}`,
  dropTitle: "Choose a file",
  dropHint: "or drag it here",
  fileRejected: (name) => `${name}: file type not accepted`,
  fileTooLarge: (name) => `${name}: file is too large`,
  remove: "Remove",
  increase: "Increase",
  decrease: "Decrease",
  selectAll: "Select all",
  selectRow: "Select row",
  notifications: "Notifications",
  breadcrumb: "Breadcrumb",
  tooManyFiles: (max) => `You can add up to ${max} files`,
  today: "Today",
  openCalendar: "Open calendar",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  previousYear: "Previous year",
  nextYear: "Next year",
  chooseMonth: "Choose month",
  startDate: "Start date",
  endDate: "End date",
  invalidDate: "Invalid date",
  pagination: "Pagination",
  chart: { showTable: "Table", showChart: "Chart", empty: "No data to show", other: "Other", type: "Chart type", trend: (first, last, high) => `Trend: from ${first} to ${last}, highest ${high}`, kinds: { bar: "Bar", stacked: "Stacked", line: "Line", area: "Area", donut: "Donut" } },
  grid: {
    filter: "Filter", clearFilter: "Remove filter", clearFilters: (count) => `Clear filters (${count})`, condition: "Condition", value: "Value", valueTo: "Upper value", blank: "(Blank)", selectAllValues: "Select all",
    ops: { contains: "Contains", notContains: "Does not contain", equals: "Equals", startsWith: "Starts with", empty: "Blank", notEmpty: "Not blank", "=": "Equals", "!=": "Not equal", ">": "Greater than", ">=": "At least", "<": "Less than", "<=": "At most", between: "Between" },
    sortAsc: "Ascending", sortDesc: "Descending", sortHint: "Hold Shift to add a sort level", columnMenu: "column menu", pin: "Pin", pinLeft: "Left", pinRight: "Right", unpin: "Unpin", hide: "Hide", autoSize: "Fit", moveLeft: "Move left", moveRight: "Move right", resize: "adjust width",
    groupBy: "Group", ungroup: "Remove group", expandAll: "Expand all", collapseAll: "Collapse all", total: "Total",
    export: "Export", exportExcel: "Excel (.xlsx)", exportCsv: "CSV", exportSelected: (count) => `${count} selected rows (.xlsx)`, copy: "Copy", copyWithHeaders: "Copy with headers",
    count: "Count", sum: "Sum", average: "Average", min: "Min", max: "Max", invalidNumber: "Invalid number", rowsPerPage: "Rows per page", perPage: (count) => `${count} rows`, selectAllRows: (count) => `Select all ${count} records`, fillHint: "Drag to fill", makeChart: "Create chart", chartTitle: "Chart from selection", chartNeedsNumbers: "Select numeric cells to chart",
  },
  presets: { today: "Today", yesterday: "Yesterday", last7: "Last 7 days", last30: "Last 30 days", thisMonth: "This month", lastMonth: "Last month", thisYear: "This year" },
};

export const LocaleContext = createContext<BtuiLocale>(tr);

export function useLocale() {
  return useContext(LocaleContext);
}
