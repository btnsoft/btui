import type { Text } from "./i18n";

export type OrderStatus = "open" | "pending" | "done" | "cancelled";
export type Order = { id: number; no: string; customer: string; city: string; amount: number; status: OrderStatus; date: string; owner: string };

export const CITY_NAMES = ["Ankara", "Antalya", "Bursa", "Çanakkale", "Eskişehir", "İstanbul", "İzmir", "Konya", "Muğla", "Şırnak", "Trabzon", "Van"];
export const CITIES = CITY_NAMES.map((city) => ({ value: city, label: city }));
export const CUSTOMERS = ["Mavi Yapı", "Kuzey Lojistik", "Çınar Gıda", "Ege Tekstil", "Şafak Enerji", "Atlas Makine", "Deniz Otomotiv", "Işık Medikal"];
const OWNERS = ["Ada Yılmaz", "Can Demir", "Elif Kaya", "Mert Aydın"];
const STATUSES: OrderStatus[] = ["open", "pending", "done", "cancelled"];

export const STATUS_LABEL: Record<OrderStatus, Text> = {
  open: { tr: "Açık", en: "Open" },
  pending: { tr: "Bekliyor", en: "Pending" },
  done: { tr: "Tamam", en: "Done" },
  cancelled: { tr: "İptal", en: "Cancelled" },
};
export const STATUS_TONE = { open: "info", pending: "warn", done: "ok", cancelled: "danger" } as const;

export const ORDERS: Order[] = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  no: `SP-${1040 + i * 7}`,
  customer: CUSTOMERS[i % CUSTOMERS.length],
  city: CITY_NAMES[(i * 5) % CITY_NAMES.length],
  amount: 1250 + ((i * 7919) % 48000),
  status: STATUSES[(i * 7 + (i >> 1)) % 4],
  date: `2026-10-${String((i % 28) + 1).padStart(2, "0")}`,
  owner: OWNERS[i % OWNERS.length],
}));

export function money(amount: number, lang: string) {
  return amount.toLocaleString(lang, { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
}
