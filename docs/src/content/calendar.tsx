import { useState } from "react";
import { Calendar, Card, formatDate, type DateRange, type IsoDate } from "btui";
import { ORDERS } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const isWeekend = (date: IsoDate) => [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());
const FRAME = { width: "fit-content", maxWidth: "100%" } as const;

function Standalone() {
  const [date, setDate] = useState<IsoDate>("2026-10-14");
  return <Card flush style={FRAME}><Calendar value={date} onSelect={setDate} /></Card>;
}

function Value() {
  const t = useText();
  const lang = useLang();
  const [date, setDate] = useState<IsoDate>("2026-10-14");
  const orders = ORDERS.filter((o) => o.date === date);
  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
      <Card flush style={FRAME}><Calendar value={date} onSelect={setDate} defaultMonth="2026-10-01" /></Card>
      <span role="status">{t({ tr: `${formatDate(date, lang, { day: "numeric", month: "long" })} siparişleri: ${orders.length}`, en: `Orders on ${formatDate(date, lang, { day: "numeric", month: "long" })}: ${orders.length}` })}</span>
    </div>
  );
}

function Range() {
  const lang = useLang();
  const t = useText();
  const [range, setRange] = useState<DateRange>({ start: "2026-10-12", end: "2026-10-16" });
  const pick = (date: IsoDate) => {
    if (!range.start || range.end) setRange({ start: date, end: null });
    else setRange(date < range.start ? { start: date, end: range.start } : { start: range.start, end: date });
  };
  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
      <Card flush style={FRAME}><Calendar range={range} onSelect={pick} /></Card>
      <span role="status">{range.start && range.end ? `${formatDate(range.start, lang)} - ${formatDate(range.end, lang)}` : t({ tr: "Bitiş gününü seçin", en: "Choose the end day" })}</span>
    </div>
  );
}

function TwoMonths() {
  const [range, setRange] = useState<DateRange>({ start: "2026-10-26", end: "2026-11-06" });
  const pick = (date: IsoDate) => {
    if (!range.start || range.end) setRange({ start: date, end: null });
    else setRange(date < range.start ? { start: date, end: range.start } : { start: range.start, end: date });
  };
  return <Card flush style={FRAME}><Calendar months={2} range={range} onSelect={pick} /></Card>;
}

function Limits() {
  const [date, setDate] = useState<IsoDate>("2026-11-12");
  return <Card flush style={FRAME}><Calendar value={date} onSelect={setDate} min="2026-11-04" max="2026-11-27" isDateDisabled={isWeekend} /></Card>;
}

function MonthPicker() {
  const [date, setDate] = useState<IsoDate>("2026-03-18");
  return <Card flush style={FRAME}><Calendar value={date} onSelect={setDate} /></Card>;
}

export default definePage({
  summary: { tr: "Sayfaya gömülü, her zaman açık takvim. Bir gün ya da bir aralık gösterir, tıklamayı size bildirir. `DatePicker` ve `DateRangePicker` de bu bileşeni kullanır.", en: "A calendar placed in the page and always open. It shows a day or a range and tells you about each click. `DatePicker` and `DateRangePicker` are built on it too." },
  imports: 'import { Calendar } from "btui";',
  hero: {
    Demo: Standalone,
    code: `const [date, setDate] = useState<IsoDate>("2026-10-14");

<Calendar value={date} onSelect={setDate} />`,
  },
  use: {
    do: [
      { tr: "Günün sürekli görünmesi gereken ekranlar: sevkiyat planı, randevu, vardiya", en: "Screens where the days stay in view: shipping plans, appointments, shifts" },
      { tr: "Seçimin yanındaki listeyi güncellediği ana ayrıntı düzenleri", en: "Master and detail layouts where the choice updates a list beside it" },
      { tr: "Yan panel gibi takvime yer ayrılmış alanlar", en: "Places with room for a calendar, such as a side panel" },
    ],
    dont: [
      { tr: "Form alanları; `DatePicker` yazarak girişi ve gizli alanı da getirir", en: "Form fields; `DatePicker` also brings typed entry and the hidden input" },
      { tr: "Aralık seçimi formu; `DateRangePicker` iki tıklamayı sizin yerinize yönetir", en: "A range field in a form; `DateRangePicker` manages the two clicks for you" },
      { tr: "Ajanda gibi gün içeriği göstermek; hücreye içerik eklenemez", en: "Showing day contents like an agenda; cells cannot hold content" },
    ],
  },
  anatomy: `<Calendar
  value="2026-10-14"
  onSelect={setDate}
  months={1}
  defaultMonth="2026-10-01"
  min="2026-01-01"
  max="2026-12-31"
  isDateDisabled={isWeekend}
/>`,
  examples: [
    {
      id: "value",
      title: { tr: "Seçili gün", en: "Selected day" },
      body: { tr: "Seçim durumunu siz tutarsınız: `value` günü gösterir, `onSelect` tıklanan günü `YYYY-MM-DD` olarak bildirir. İlk görünen ay `defaultMonth`, sonra `value`, sonra bugündür. Bu yalnız ilk açılışta geçerlidir; `value` sonradan değişirse görünen ay yerinde kalır. Bir gün seçip alttaki sayının değiştiğini görün.", en: "You keep the selection: `value` shows the day and `onSelect` reports the clicked day as `YYYY-MM-DD`. The first month shown is `defaultMonth`, then `value`, then today. This only holds on first render; if `value` changes later, the month shown stays put. Pick a day and watch the count below change." },
      example: {
        Demo: Value,
        code: `const [date, setDate] = useState<IsoDate>("2026-10-14");
const orders = allOrders.filter((o) => o.date === date);

<Calendar value={date} onSelect={setDate} defaultMonth="2026-10-01" />
<span role="status">Orders: {orders.length}</span>`,
      },
    },
    {
      id: "range",
      title: { tr: "Aralık", en: "Range" },
      body: { tr: "`range` verildiğinde `value` kullanılmaz. Bileşen iki ucu ve aradaki günleri boyar, seçimin mantığı size aittir: ilk tıklama başlangıcı, ikincisi bitişi yazar. Yalnız başlangıç varken fare, olası bitişi önceden gösterir. İki uç doluyken yeniden tıklayıp deneyin.", en: "With `range`, `value` is not used. The component paints both ends and the days between, and the selection logic is yours: the first click sets the start and the second the end. While only a start exists, the pointer previews the likely end. Click again once both ends are set to try it." },
      example: {
        Demo: Range,
        code: `const [range, setRange] = useState<DateRange>({ start: "2026-10-12", end: "2026-10-16" });

const pick = (date: IsoDate) => {
  if (!range.start || range.end) setRange({ start: date, end: null });
  else setRange(date < range.start ? { start: date, end: range.start } : { start: range.start, end: date });
};

<Calendar range={range} onSelect={pick} />`,
      },
    },
    {
      id: "months",
      title: { tr: "İki ay", en: "Two months" },
      body: { tr: "`months={2}` iki ayı yan yana çizer; dar ekranda alt alta geçer. Aylar arası ok düğmeleri dışta kalır. Bir gün iki ayda birden görünmesin diye ay dışı günler boş bırakılır.", en: "`months={2}` draws two months side by side, stacking them on narrow screens. The arrow buttons sit on the outer edges. Days outside each month stay blank, so no day shows twice." },
      example: { Demo: TwoMonths, code: `<Calendar months={2} range={range} onSelect={pick} />` },
    },
    {
      id: "limits",
      title: { tr: "Sınırlar", en: "Limits" },
      body: { tr: "`min` ve `max` dışındaki günler ile `isDateDisabled` işlevinin `true` döndürdüğü günler kapanır: üstü çizili görünür, tıklanamaz. Aşağıda yalnız 4 ile 27 Kasım arasındaki iş günleri açıktır. Ay düğmeleri sınırları aşmaya izin verir, kapalı günleri görebilirsiniz.", en: "Days outside `min` and `max`, and days where `isDateDisabled` returns `true`, close: they show struck through and cannot be clicked. Below, only the working days from 4 to 27 November are open. The month buttons can still go past the limits, so closed days stay visible." },
      example: {
        Demo: Limits,
        code: `const isWeekend = (date: IsoDate) => [0, 6].includes(new Date(\`\${date}T00:00:00Z\`).getUTCDay());

<Calendar value={date} onSelect={setDate} min="2026-11-04" max="2026-11-27" isDateDisabled={isWeekend} />`,
      },
    },
    {
      id: "month-picker",
      title: { tr: "Ay seçimi", en: "Month picker" },
      body: { tr: "Başlıktaki ay adına basmak on iki aylık tabloyu açar; oklar yıl değiştirir, yıla basmak tabloyu kapatır. Bir ay seçince takvime döner. Bu görünüm her zaman tek sütundur ve `onSelect` çağırmaz, yalnız görünen ayı değiştirir. Uzak tarihlere gitmenin en kısa yoludur.", en: "Pressing the month name in the header opens a table of twelve months. The arrows change the year and pressing the year closes the table. Choosing a month goes back to the calendar. This view is always a single column and does not call `onSelect`; it only changes the month shown. It is the shortest way to a distant date." },
      example: { Demo: MonthPicker, code: `<Calendar value={date} onSelect={setDate} />` },
    },
  ],
  a11y: [
    { tr: "Her ay `grid` rolü taşıyan bir tablodur ve adı ay ile yıldan oluşur. Sütun başlıkları günün tam adını `abbr` ile verir.", en: "Each month is a table with the `grid` role, named by the month and year. Column headers give the full weekday name through `abbr`." },
    { tr: "Izgarada tek sekme durağı vardır: odaktaki gün. Günler arasında ok tuşlarıyla gezilir.", en: "The grid has a single tab stop, the focused day. Arrow keys move between days." },
    { tr: "Her gün gerçek bir `button` öğesidir ve tam tarihiyle okunur. Bugün `aria-current=\"date\"`, seçili günler `aria-selected` taşır.", en: "Each day is a real `button` and is read in full. Today carries `aria-current=\"date\"` and chosen days carry `aria-selected`." },
    { tr: "Kapalı günler yerel `disabled` ile kapanır ve üstü çizilir; durum yalnız renkle anlatılmaz.", en: "Closed days use the native `disabled` and are struck through, so colour is not the only signal." },
    { tr: "Haftanın ilk günü ve ay adları `BtuiProvider` dilinden gelir. Ay ve yıl düğmelerinin adları dil dosyasındadır.", en: "The first day of the week and the month names follow the `BtuiProvider` language. The month and year buttons are named in the locale." },
  ],
  keyboard: [
    ["Tab", { tr: "Ay düğmeleri ile odaktaki gün arasında gezer", en: "Moves between the month buttons and the focused day" }],
    ["← / →", { tr: "Önceki ya da sonraki güne geçer; ay sınırında ayı değiştirir", en: "Moves to the previous or next day, changing the month at its edge" }],
    ["↑ / ↓", { tr: "Bir hafta geri ya da ileri gider", en: "Moves a week back or forward" }],
    ["Home", { tr: "Haftanın ilk gününe gider", en: "Goes to the first day of the week" }],
    ["End", { tr: "Haftanın son gününe gider", en: "Goes to the last day of the week" }],
    ["PageUp", { tr: "Bir ay geri gider; günü ayın son gününe kırpar", en: "Goes back a month, clamping to the last day of that month" }],
    ["PageDown", { tr: "Bir ay ileri gider; günü ayın son gününe kırpar", en: "Goes forward a month, clamping to the last day of that month" }],
    ["Shift + PageUp", { tr: "Bir yıl geri gider", en: "Goes back a year" }],
    ["Shift + PageDown", { tr: "Bir yıl ileri gider", en: "Goes forward a year" }],
    ["Enter", { tr: "Odaktaki günü seçer", en: "Picks the focused day" }],
    ["Space", { tr: "Odaktaki günü seçer", en: "Picks the focused day" }],
    ["Esc", { tr: "Sayfada tek başına etkisizdir; `DatePicker` ve `DateRangePicker` içinde takvimi kapatır", en: "Does nothing on its own in a page; closes the calendar inside `DatePicker` and `DateRangePicker`" }],
  ],
  api: [
    {
      name: "Calendar",
      description: { tr: "Ref ve yerel öznitelikler iletilmez. Tarihler `IsoDate`, yani `YYYY-MM-DD` biçiminde metindir.", en: "The ref and native attributes are not forwarded. Dates are `IsoDate`, a string in `YYYY-MM-DD` form." },
      props: [
        { name: "onSelect", type: "(date: IsoDate) => void", required: true, description: { tr: "Tıklanan ya da klavyeyle seçilen günü bildirir", en: "Reports the day clicked or chosen by keyboard" } },
        { name: "value", type: "IsoDate | null", description: { tr: "Seçili gün", en: "The chosen day" } },
        { name: "range", type: "{ start: IsoDate | null; end: IsoDate | null }", description: { tr: "Seçili aralık; `value` yerine geçer", en: "The chosen span; takes the place of `value`" } },
        { name: "months", type: "1 | 2", default: "1", description: { tr: "Yan yana gösterilen ay sayısı", en: "Months shown side by side" } },
        { name: "defaultMonth", type: "IsoDate", description: { tr: "İlk görünen ay; verilmezse seçim, o da yoksa bugün", en: "First month shown; defaults to the selection, then today" } },
        { name: "min", type: "IsoDate", description: { tr: "Seçilebilen ilk gün", en: "First selectable day" } },
        { name: "max", type: "IsoDate", description: { tr: "Seçilebilen son gün", en: "Last selectable day" } },
        { name: "isDateDisabled", type: "(date: IsoDate) => boolean", description: { tr: "Tek tek günleri kapatır: hafta sonu, tatil", en: "Closes individual days, such as weekends or holidays" } },
        { name: "className", type: "string", description: { tr: "Kök öğeye eklenen sınıf", en: "Class added to the root element" } },
      ],
    },
  ],
  styling: [
    { name: "data-months", kind: "data", description: { tr: "`.bt-cal` üzerinde ay sayısı", en: "The month count, on `.bt-cal`" } },
    { name: "data-today", kind: "data", description: { tr: "Bugünün `.bt-cal-day` düğmesinde bulunur", en: "On the `.bt-cal-day` button of today" } },
    { name: "data-selected", kind: "data", description: { tr: "Seçili günde ya da aralık uçlarında bulunur", en: "On the chosen day or the range ends" } },
    { name: "data-range", kind: "data", description: { tr: "Aralığın içindeki günlerde bulunur", en: "On the days inside the range" } },
    { name: "data-outside", kind: "data", description: { tr: "Görünen ayın dışındaki günlerde bulunur", en: "On days outside the month shown" } },
    { name: "data-current", kind: "data", description: { tr: "Ay tablosunda görünen ayın düğmesinde bulunur", en: "On the button of the month shown, in the month table" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Odak halkası ve fareyle üzerine gelinen gün", en: "Focus ring and the day under the pointer" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "Seçili gün zemini", en: "Chosen day background" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Aralık zemini", en: "Range background" } },
    { name: "--bt-on-accent", kind: "var", description: { tr: "Seçili gün metni", en: "Chosen day text" } },
    { name: "--bt-faint", kind: "var", description: { tr: "Kapalı ve ay dışı günlerin rengi", en: "Colour of closed days and days outside the month" } },
  ],
  related: ["date-picker", "date-range-picker", "field", "card"],
});
