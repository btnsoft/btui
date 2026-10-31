/**
 * Dates travel as "YYYY-MM-DD" strings. A calendar day has no time zone, so keeping
 * it out of `Date` local time rules out the classic off-by-one around midnight.
 */
export type IsoDate = string;

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function toUtc(iso: IsoDate) {
  const match = ISO.exec(iso);
  if (!match) return null;
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  // Rejects dates that roll over, such as 2026-02-31.
  return date.getUTCMonth() === +match[2] - 1 ? date : null;
}

export function toIso(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export function todayIso(now = new Date()): IsoDate {
  return toIso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function addDays(iso: IsoDate, days: number) {
  const date = toUtc(iso)!;
  date.setUTCDate(date.getUTCDate() + days);
  return toIso(date);
}

/** Moves by months and clamps the day: January 31 plus one month is February 28. */
export function addMonths(iso: IsoDate, months: number) {
  const date = toUtc(iso)!;
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return toIso(date);
}

export const startOfMonth = (iso: IsoDate) => `${iso.slice(0, 7)}-01`;
export const endOfMonth = (iso: IsoDate) => addDays(addMonths(startOfMonth(iso), 1), -1);

type WeekInfoLocale = Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };

/** 0 is Sunday. */
export function firstDayOfWeek(lang: string) {
  const locale = new Intl.Locale(lang) as WeekInfoLocale;
  const first = (locale.getWeekInfo?.() ?? locale.weekInfo)?.firstDay;
  return first === undefined ? (lang.startsWith("en") ? 0 : 1) : first % 7;
}

/** Six weeks, so the panel never changes height from month to month. */
export function monthGrid(month: IsoDate, firstDay: number) {
  const first = startOfMonth(month);
  const offset = (toUtc(first)!.getUTCDay() - firstDay + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => addDays(first, i - offset));
}

export function weekdayNames(lang: string, firstDay: number) {
  const format = new Intl.DateTimeFormat(lang, { weekday: "short", timeZone: "UTC" });
  const long = new Intl.DateTimeFormat(lang, { weekday: "long", timeZone: "UTC" });
  // 2023-01-01 was a Sunday.
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.UTC(2023, 0, 1 + ((firstDay + i) % 7)));
    return { short: format.format(date), long: long.format(date) };
  });
}

export function formatDate(iso: IsoDate, lang: string, options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }) {
  const date = toUtc(iso);
  return date ? new Intl.DateTimeFormat(lang, { ...options, timeZone: "UTC" }).format(date) : "";
}

/** The order of day, month and year in the given language, such as ["day", "month", "year"]. */
export function dateOrder(lang: string) {
  return new Intl.DateTimeFormat(lang, { day: "2-digit", month: "2-digit", year: "numeric" })
    .formatToParts(new Date(Date.UTC(2026, 10, 25)))
    .filter((part) => part.type === "day" || part.type === "month" || part.type === "year")
    .map((part) => part.type);
}

/** Reads what people type: "31.10.2026", "31/10/26", "31102026". Null when it is not a real date. */
export function parseDate(text: string, lang: string): IsoDate | null {
  const value = text.trim();
  if (!value) return null;
  if (ISO.test(value)) return toUtc(value) ? value : null;
  const order = dateOrder(lang);
  let parts = value.split(/\D+/).filter(Boolean);
  if (parts.length === 1 && /^\d{6}$|^\d{8}$/.test(value)) {
    const yearLength = value.length - 4;
    const widths = order.map((part) => (part === "year" ? yearLength : 2));
    let at = 0;
    parts = widths.map((width) => { const piece = value.slice(at, at + width); at += width; return piece; });
  }
  if (parts.length !== 3) return null;
  const read = (name: string) => parts[order.indexOf(name as never)];
  const year = read("year").length === 2 ? `20${read("year")}` : read("year");
  if (year.length !== 4) return null;
  const iso = `${year}-${read("month").padStart(2, "0")}-${read("day").padStart(2, "0")}`;
  return toUtc(iso) ? iso : null;
}
