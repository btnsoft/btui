import { useState, type FormEvent } from "react";
import { Badge, Button, DateRangePicker, datePresets, useLocale, type DateRange, type DateRangePreset } from "btui";
import { ORDERS, money } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const OCTOBER: DateRange = { start: "2026-10-01", end: "2026-10-31" };
const EMPTY: DateRange = { start: null, end: null };

function Report() {
  const t = useText();
  const [range, setRange] = useState<DateRange>(OCTOBER);
  return (
    <div className="d-stack">
      <DateRangePicker block label={t({ tr: "Rapor dönemi", en: "Report period" })} value={range} onChange={setRange} />
    </div>
  );
}

function Typed() {
  const t = useText();
  const [range, setRange] = useState<DateRange>(EMPTY);
  return (
    <div className="d-stack">
      <DateRangePicker block label={t({ tr: "Kampanya süresi", en: "Campaign period" })} value={range} onChange={setRange} />
      <code>{JSON.stringify(range)}</code>
    </div>
  );
}

function CustomPresets() {
  const t = useText();
  const { presets: labels } = useLocale();
  const [range, setRange] = useState<DateRange>({ start: "2026-10-01", end: "2026-10-28" });
  const standard = datePresets(labels, "2026-10-28");
  const presets: DateRangePreset[] = [
    ...standard.filter((preset) => preset.label === labels.last7 || preset.label === labels.last30),
    { label: t({ tr: "Üçüncü çeyrek", en: "Third quarter" }), range: () => ({ start: "2026-07-01", end: "2026-09-30" }) },
    { label: t({ tr: "Dördüncü çeyrek", en: "Fourth quarter" }), range: () => ({ start: "2026-10-01", end: "2026-12-31" }) },
  ];
  return (
    <div className="d-stack">
      <DateRangePicker block label={t({ tr: "Muhasebe dönemi", en: "Accounting period" })} value={range} onChange={setRange} presets={presets} />
    </div>
  );
}

function NoPresets() {
  const t = useText();
  const [range, setRange] = useState<DateRange>({ start: "2026-11-02", end: "2026-11-06" });
  return (
    <div className="d-stack">
      <DateRangePicker block label={t({ tr: "Yıllık izin", en: "Annual leave" })} value={range} onChange={setRange} presets={false} />
    </div>
  );
}

function MaxDays() {
  const t = useText();
  const [range, setRange] = useState<DateRange>(EMPTY);
  return (
    <div className="d-stack">
      <DateRangePicker block label={t({ tr: "Dışa aktarım aralığı", en: "Export period" })} value={range} onChange={setRange} presets={false} maxDays={14} />
    </div>
  );
}

function OrderFilter() {
  const t = useText();
  const lang = useLang();
  const [range, setRange] = useState<DateRange>({ start: "2026-10-05", end: "2026-10-14" });
  const rows = ORDERS.filter((o) => (!range.start || o.date >= range.start) && (!range.end || o.date <= range.end));
  const total = rows.reduce((sum, o) => sum + o.amount, 0);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <DateRangePicker variant="filter" clearable label={t({ tr: "Sipariş tarihi", en: "Order date" })} placeholder={t({ tr: "Tümü", en: "All" })} value={range} onChange={setRange} />
      <span role="status"><Badge tone="info">{t({ tr: `${rows.length} sipariş`, en: `${rows.length} orders` })}</Badge></span>
      <small style={{ color: "var(--bt-muted)" }}>{money(total, lang)}</small>
    </div>
  );
}

function InForm() {
  const t = useText();
  const [range, setRange] = useState<DateRange>({ start: "2026-10-01", end: "2026-10-15" });
  const [sent, setSent] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))));
  };
  return (
    <form className="d-stack" onSubmit={submit}>
      <DateRangePicker block label={t({ tr: "Hesap özeti dönemi", en: "Statement period" })} name="period" value={range} onChange={setRange} />
      <Button type="submit" variant="primary">{t({ tr: "Özeti oluştur", en: "Create statement" })}</Button>
      {sent ? <code>{sent}</code> : null}
    </form>
  );
}

function Limits() {
  const t = useText();
  const [range, setRange] = useState<DateRange>({ start: "2026-10-05", end: "2026-10-16" });
  return (
    <div className="d-stack">
      <DateRangePicker block clearable label={t({ tr: "Geçmiş hareketler", en: "Past activity" })} value={range} onChange={setRange} presets={false} min="2026-01-01" max="2026-12-31" />
    </div>
  );
}

export default definePage({
  summary: { tr: "Bir başlangıç ve bir bitiş günü seçtirir. İki ucu da yazılabilir, takvim yan yana iki ay gösterir, hazır aralıklar rapor ekranlarının sık kullandığı dönemleri tek tıkla verir.", en: "Takes a start day and an end day. Both ends can be typed, the calendar shows two months side by side, and shortcuts give the usual reporting periods in one click." },
  imports: 'import { DateRangePicker, datePresets } from "btui";',
  hero: {
    Demo: Report,
    code: `const [range, setRange] = useState<DateRange>({ start: "2026-10-01", end: "2026-10-31" });

<DateRangePicker block label="Report period" value={range} onChange={setRange} />`,
  },
  use: {
    do: [
      { tr: "Rapor ve dışa aktarım dönemleri", en: "Report and export periods" },
      { tr: "Tablo üstünde tarih aralığı filtresi; `variant=\"filter\"` kullanın", en: "A date range filter above a table; use `variant=\"filter\"`" },
      { tr: "İki ucu olan kayıtlar: kampanya süresi, izin, sözleşme dönemi", en: "Records with two ends: a campaign, a leave, a contract term" },
    ],
    dont: [
      { tr: "Tek gün; `DatePicker` daha az yer kaplar", en: "A single day; `DatePicker` takes less room" },
      { tr: "Sabit birkaç dönem; `ButtonGroup` ya da `Select` tek tıkla biter", en: "A few fixed periods; `ButtonGroup` or `Select` takes one click" },
      { tr: "Dar sütunlar; `field` görünümü en az 280px ister, filtre çubuğunda `filter` görünümünü seçin", en: "Tight columns; the `field` variant wants 280px, so choose `filter` in a filter bar" },
    ],
  },
  anatomy: `<DateRangePicker
  label="Group name"
  value={{ start: "2026-10-01", end: "2026-10-31" }}
  onChange={setRange}
  presets={datePresets(labels)}
  maxDays={31}
  clearable
  name="period"
/>`,
  examples: [
    {
      id: "typed",
      title: { tr: "Yazarak giriş", en: "Typed entry" },
      body: { tr: "Başlangıç ve bitiş ayrı alanlardır ve `DatePicker` ile aynı biçimleri okur; ayraçsız `15112026` de geçerlidir. Her alan kendi başına işlenir, bu yüzden yalnız bir uç dolu olabilir. Bitiş başlangıçtan önceyse iki uç yer değiştirir. Önce bitişi yazmayı deneyin.", en: "The start and end are separate fields and read the same forms as `DatePicker`, including the compact `11152026`. Each field is read on its own, so only one end may be filled. If the end falls before the start, the two swap. Try typing the end first." },
      example: {
        Demo: Typed,
        code: `const [range, setRange] = useState<DateRange>({ start: null, end: null });

<DateRangePicker block label="Campaign period" value={range} onChange={setRange} />`,
      },
    },
    {
      id: "presets",
      title: { tr: "Hazır aralıklar", en: "Shortcuts" },
      body: { tr: "`presets` verilmezse takvimin solunda yedi hazır aralık görünür: bugün, dün, son 7 gün, son 30 gün, bu ay, geçen ay, bu yıl. Adları dil dosyasından gelir. Bir hazır aralığa basmak değeri hemen uygular ve takvimi kapatır.", en: "Without `presets`, seven shortcuts sit to the left of the calendar: today, yesterday, last 7 days, last 30 days, this month, last month and this year. Their names come from the locale. Pressing one applies it at once and closes the calendar." },
      code: `<DateRangePicker value={range} onChange={setRange} />`,
    },
    {
      id: "custom-presets",
      title: { tr: "Kendi hazır aralıklarınız", en: "Your own shortcuts" },
      body: { tr: "`presets` bir `DateRangePreset` dizisi alır. `datePresets(labels, today)` standart listeyi kurar; süzerek ya da kendi dönemlerinizi ekleyerek değiştirin. `today` verilmezse bugünden hesaplar. `range` bir işlevdir ve basıldığında çalışır. Hazır aralıklar `min`, `max` ve `maxDays` sınırlarına tabi değildir, bu yüzden uygun dönemler yazın.", en: "`presets` takes a `DateRangePreset` array. `datePresets(labels, today)` builds the standard list; filter it or add your own periods. Without `today` it counts from the current day. `range` is a function that runs on press. Shortcuts are not bound by `min`, `max` or `maxDays`, so write periods that fit." },
      example: {
        Demo: CustomPresets,
        code: `const { presets: labels } = useLocale();

const presets: DateRangePreset[] = [
  ...datePresets(labels).filter((preset) => preset.label === labels.last7 || preset.label === labels.last30),
  { label: "Third quarter", range: () => ({ start: "2026-07-01", end: "2026-09-30" }) },
  { label: "Fourth quarter", range: () => ({ start: "2026-10-01", end: "2026-12-31" }) },
];

<DateRangePicker value={range} onChange={setRange} presets={presets} />`,
      },
    },
    {
      id: "no-presets",
      title: { tr: "Hazır aralıksız", en: "Without shortcuts" },
      body: { tr: "`presets={false}` listeyi kaldırır. Dönemin kişiye özel olduğu alanlarda kullanın: izin, randevu, kampanya.", en: "`presets={false}` removes the list. Use it where the period is personal: a leave, an appointment, a campaign." },
      example: { Demo: NoPresets, code: `<DateRangePicker value={range} onChange={setRange} presets={false} />` },
    },
    {
      id: "max-days",
      title: { tr: "En uzun süre", en: "Longest span" },
      body: { tr: "`maxDays` başlangıç seçildikten sonra süreyi aşan günleri takvimde kapatır; iki yön için de geçerlidir. 14 gün, başlangıç dahil sayılır. Elle yazılan tarih reddedilir, sınırı aşan hazır aralık kapanır. Kural yine de sunucuda da denetlenmelidir. Takvimi açıp bir gün seçin ve kapanan günlere bakın.", en: "Once a start is chosen, `maxDays` closes the days beyond the span in the calendar, in both directions. The 14 days include the start. Typed dates are rejected and shortcuts past the limit are disabled. Enforce the rule on the server too. Open the calendar, pick a day and look at what closes." },
      example: { Demo: MaxDays, code: `<DateRangePicker value={range} onChange={setRange} presets={false} maxDays={14} />` },
    },
    {
      id: "filter",
      title: { tr: "Filtre görünümü", en: "Filter variant" },
      body: { tr: "`variant=\"filter\"` iki alan yerine tek bir kutu çizer: `label` ön ek olur, iki uç seçilince kutu dolar. Yazarak giriş yoktur. Aşağıda 42 siparişlik liste seçili aralığa göre süzülür ve sayı canlı güncellenir. `IsoDate` metin olduğu için karşılaştırma doğrudan `>=` ve `<=` ile yapılır. Temizleyince tüm siparişler döner.", en: "`variant=\"filter\"` draws one box instead of two fields: `label` becomes a prefix and the box fills once both ends are chosen. There is no typing. Below, a list of 42 orders follows the chosen range and the count updates live. `IsoDate` values are strings, so comparing takes a plain `>=` and `<=`. Clear it to get all the orders back." },
      example: {
        Demo: OrderFilter,
        code: `const [range, setRange] = useState<DateRange>({ start: "2026-10-05", end: "2026-10-14" });
const rows = orders.filter((o) => (!range.start || o.date >= range.start) && (!range.end || o.date <= range.end));

<DateRangePicker variant="filter" clearable label="Order date" placeholder="All" value={range} onChange={setRange} />
<Badge tone="info">{rows.length} orders</Badge>`,
      },
    },
    {
      id: "form",
      title: { tr: "Form gönderimi", en: "Form submission" },
      body: { tr: "`name` iki gizli `input` ekler: `${name}Start` ve `${name}End`. `period` adı `periodStart` ve `periodEnd` olarak gönderilir, ikisi de `YYYY-MM-DD` biçimindedir. Boş uç boş metin olarak gider. Formu gönderip çıkan veriye bakın.", en: "`name` adds two hidden `input` elements: `${name}Start` and `${name}End`. The name `period` is sent as `periodStart` and `periodEnd`, both in `YYYY-MM-DD` form. An empty end goes as an empty string. Submit the form to see the data." },
      example: {
        Demo: InForm,
        code: `<form onSubmit={submit}>
  <DateRangePicker block label="Statement period" name="period" value={range} onChange={setRange} />
  <Button type="submit" variant="primary">Create statement</Button>
</form>`,
      },
    },
    {
      id: "limits",
      title: { tr: "Sınırlar ve temizleme", en: "Limits and clearing" },
      body: { tr: "`min`, `max` ve `isDateDisabled` `DatePicker` ile aynı çalışır, hem takvimde hem yazarken geçerlidir. Kapalı bir gün yalnız aralığın ucu olamaz; aralığın içinde kalabilir. `clearable` iki ucu birlikte temizler ve `{ start: null, end: null }` bildirir.", en: "`min`, `max` and `isDateDisabled` work as in `DatePicker`, both in the calendar and while typing. A closed day only cannot be an end of the range; it can still fall inside it. `clearable` empties both ends and reports `{ start: null, end: null }`." },
      example: { Demo: Limits, code: `<DateRangePicker clearable value={range} onChange={setRange} presets={false} min="2026-01-01" max="2026-12-31" />` },
    },
  ],
  a11y: [
    { tr: "Kök öğe `group` rolü taşır, adını `aria-label` ya da `label` verir; bu yüzden birini mutlaka yazın. İki alanın adı dil dosyasından gelir: `startDate` ve `endDate`.", en: "The root has the `group` role and is named by `aria-label` or `label`, so always set one. The two fields are named by the locale: `startDate` and `endDate`." },
    { tr: "Takvim Base UI `Popover` içinde açılır; açılınca odak aralığın başına ya da bugüne gelir, kapanınca açan düğmeye döner.", en: "The calendar opens inside a Base UI `Popover`. Focus lands on the start of the range or today, and returns to the opening button on close." },
    { tr: "Aralıktaki her gün `aria-selected` taşır, seçim yalnız renkle anlatılmaz. Her gün tam tarihiyle okunur.", en: "Each day in the range carries `aria-selected`, so the selection is not told by colour alone. Each day is read in full." },
    { tr: "Hazır aralıklar gerçek düğmelerdir ve takvimden önce sekme sırasına girer.", en: "Shortcuts are real buttons and come before the calendar in the tab order." },
  ],
  keyboard: [
    ["Tab", { tr: "Başlangıç, bitiş, temizleme ve takvim düğmesi arasında gezer; takvimde önce hazır aralıklara geçer", en: "Moves between the start, the end, the clear button and the calendar button; in the popup it goes through the shortcuts first" }],
    ["Enter", { tr: "Yazı alanında metni işler; takvimde odaktaki günü seçer", en: "In a text field, reads the text; in the calendar, picks the focused day" }],
    ["Space", { tr: "Takvim düğmesinde takvimi açar; takvimde odaktaki günü seçer", en: "Opens the calendar on its button; in the calendar, picks the focused day" }],
    ["← / →", { tr: "Önceki ya da sonraki güne geçer", en: "Moves to the previous or next day" }],
    ["↑ / ↓", { tr: "Bir hafta geri ya da ileri gider", en: "Moves a week back or forward" }],
    ["Home", { tr: "Haftanın ilk gününe gider", en: "Goes to the first day of the week" }],
    ["End", { tr: "Haftanın son gününe gider", en: "Goes to the last day of the week" }],
    ["PageUp", { tr: "Bir ay geri gider", en: "Goes back a month" }],
    ["PageDown", { tr: "Bir ay ileri gider", en: "Goes forward a month" }],
    ["Shift + PageUp", { tr: "Bir yıl geri gider", en: "Goes back a year" }],
    ["Shift + PageDown", { tr: "Bir yıl ileri gider", en: "Goes forward a year" }],
    ["Esc", { tr: "Takvimi kapatır; yarım kalan seçim silinir, değer değişmez", en: "Closes the calendar; a half made choice is dropped and the value stays" }],
  ],
  api: [
    {
      name: "DateRangePicker",
      description: { tr: "Yalnız denetimli çalışır: `value` ve `onChange` zorunludur. Ref ve yerel öznitelikler iletilmez.", en: "It only works controlled: `value` and `onChange` are required. The ref and native attributes are not forwarded." },
      props: [
        { name: "value", type: "DateRange", required: true, description: { tr: "Seçili aralık; uçlar `null` olabilir", en: "The chosen range; either end may be `null`" } },
        { name: "onChange", type: "(value: DateRange) => void", required: true, description: { tr: "Yeni aralığı bildirir; temizleyince iki uç da `null`", en: "Reports the new range; both ends are `null` when cleared" } },
        { name: "presets", type: "DateRangePreset[] | false", default: "datePresets(locale.presets)", description: { tr: "Hazır aralık listesi; `false` listeyi gizler", en: "Shortcut list; `false` hides it" } },
        { name: "maxDays", type: "number", description: { tr: "İzin verilen en uzun süre, gün. Takvim, yazılan tarih ve hazır aralıklar için geçerlidir", en: "Longest span allowed, in days. Applies to the calendar, typed dates and shortcuts" } },
        { name: "variant", type: '"field" | "filter"', default: '"field"', description: { tr: "`field` iki yazılabilir alan, `filter` filtre çubukları için tek kutu", en: "`field` is two typed inputs, `filter` one compact box for filter bars" } },
        { name: "label", type: "string", description: { tr: "`filter` görünümünde ön ek; iki görünümde de grubun adı", en: "A prefix in the `filter` variant; the group name in both variants" } },
        { name: "placeholder", type: "string", default: "locale.select", description: { tr: "Yalnız `filter` görünümünde, iki uç dolu değilken görünür", en: "Only in the `filter` variant, shown until both ends are filled" } },
        { name: "min", type: "IsoDate", description: { tr: "Seçilebilen ilk gün", en: "First selectable day" } },
        { name: "max", type: "IsoDate", description: { tr: "Seçilebilen son gün", en: "Last selectable day" } },
        { name: "isDateDisabled", type: "(date: IsoDate) => boolean", description: { tr: "Tek tek günleri kapatır", en: "Closes individual days" } },
        { name: "clearable", type: "boolean", default: "false", description: { tr: "Bir uç doluyken temizleme düğmesi gösterir", en: "Shows a clear button while either end is filled" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Alanları ve takvimi kapatır", en: "Turns off the fields and the calendar" } },
        { name: "required", type: "boolean", default: "false", description: { tr: "Boş uçla form gönderimini tarayıcı engeller", en: "The browser blocks submitting with an empty end" } },
        { name: "aria-labelledby", type: "string", description: { tr: "Grubun adını veren öğe. `Field` içinde kendiliğinden gelir", en: "Element that names the group. Set for you inside `Field`" } },
        { name: "name", type: "string", description: { tr: "`${name}Start` ve `${name}End` adlı iki gizli `input` ekler", en: "Adds two hidden `input` elements named `${name}Start` and `${name}End`" } },
        { name: "block", type: "boolean", default: "false", description: { tr: "Kabın genişliğini doldurur; `field` görünümü aksi halde 280px'tir", en: "Fills its container; otherwise the `field` variant is 280px wide" } },
        { name: "className", type: "string", description: { tr: "Dış kaba eklenen sınıf", en: "Class added to the outer wrapper" } },
        { name: "aria-label", type: "string", description: { tr: "Grubun erişilebilir adı; `label` değerinin önüne geçer", en: "Accessible name of the group; takes precedence over `label`" } },
      ],
    },
    {
      name: "DateRange",
      props: [
        { name: "start", type: "IsoDate | null", required: true, description: { tr: "İlk gün", en: "First day" } },
        { name: "end", type: "IsoDate | null", required: true, description: { tr: "Son gün", en: "Last day" } },
      ],
    },
    {
      name: "DateRangePreset",
      props: [
        { name: "label", type: "string", required: true, description: { tr: "Düğme metni; listede benzersiz olmalıdır", en: "Button text; it must be unique in the list" } },
        { name: "range", type: "() => { start: IsoDate; end: IsoDate }", required: true, description: { tr: "Basıldığında çalışır ve aralığı verir", en: "Runs on press and gives the range" } },
      ],
    },
    {
      name: "datePresets",
      description: { tr: "`datePresets(labels, today?)` rapor ekranlarının standart yedi aralığını `DateRangePreset[]` olarak döndürür.", en: "`datePresets(labels, today?)` returns the seven standard reporting ranges as `DateRangePreset[]`." },
      props: [
        { name: "labels", type: "BtuiLocale[\"presets\"]", required: true, description: { tr: "Yedi aralığın adı: `today`, `yesterday`, `last7`, `last30`, `thisMonth`, `lastMonth`, `thisYear`", en: "Names of the seven ranges: `today`, `yesterday`, `last7`, `last30`, `thisMonth`, `lastMonth`, `thisYear`" } },
        { name: "today", type: "IsoDate", default: "todayIso()", description: { tr: "Aralıkların hesaplandığı gün", en: "The day the ranges count from" } },
      ],
    },
  ],
  styling: [
    { name: "data-range", kind: "data", description: { tr: "`.bt-date-pop` üzerinde panelin aralık düzeni; `.bt-cal-day` üzerinde aralığın içindeki gün", en: "On `.bt-date-pop`, the range layout of the panel; on `.bt-cal-day`, a day inside the range" } },
    { name: "data-selected", kind: "data", description: { tr: "Aralığın iki ucundaki `.bt-cal-day` düğmelerinde bulunur", en: "On the `.bt-cal-day` buttons at both ends of the range" } },
    { name: "data-wrong", kind: "data", description: { tr: "Okunamayan metinde `.bt-date-text` üzerinde bulunur", en: "On `.bt-date-text` while the text cannot be read" } },
    { name: "data-block", kind: "data", description: { tr: "Tam genişlikte dış kapta bulunur", en: "On the wrapper at full width" } },
    { name: "data-filled", kind: "data", description: { tr: "`filter` görünümünde iki uç doluyken bulunur", en: "Present in the `filter` variant while both ends are filled" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Aralık zemini", en: "Range background" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "Aralık uçlarının zemini", en: "Background of the range ends" } },
    { name: "--bt-line", kind: "var", description: { tr: "Hazır aralık sütununun ayracı", en: "Divider of the shortcut column" } },
  ],
  related: ["date-picker", "calendar", "filter-bar", "data-table"],
});
