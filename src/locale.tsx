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
};

export const LocaleContext = createContext<BtuiLocale>(tr);

export function useLocale() {
  return useContext(LocaleContext);
}
