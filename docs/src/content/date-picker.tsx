import { useState, type FormEvent } from "react";
import { Button, DatePicker, Field, formatDate, type IsoDate } from "btui";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const isWeekend = (date: IsoDate) => [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());

function Due() {
  const t = useText();
  const [due, setDue] = useState<IsoDate | null>("2026-11-16");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Vade tarihi", en: "Due date" })} hint={t({ tr: "Yazın ya da takvimden seçin", en: "Type it or pick from the calendar" })}>
        <DatePicker value={due} onChange={setDue} />
      </Field>
    </div>
  );
}

function Typed() {
  const t = useText();
  const lang = useLang();
  const [date, setDate] = useState<IsoDate | null>(null);
  return (
    <div className="d-stack">
      <Field label={t({ tr: "İrsaliye tarihi", en: "Waybill date" })} hint={lang === "tr" ? "31102026, 311026, 31.10.2026, 31/10/26" : "10312026, 103126, 10/31/2026, 10-31-26"}>
        <DatePicker value={date} onChange={setDate} />
      </Field>
      <code>value: {JSON.stringify(date)}</code>
    </div>
  );
}

function IsoValue() {
  const lang = useLang();
  const [date, setDate] = useState<IsoDate | null>("2026-10-31");
  return (
    <div className="d-stack">
      <DatePicker aria-label={lang === "tr" ? "Fatura tarihi" : "Invoice date"} value={date} onChange={setDate} />
      <code>value: {JSON.stringify(date)}</code>
      <code>formatDate: {date ? formatDate(date, lang, { day: "numeric", month: "long", year: "numeric" }) : "null"}</code>
    </div>
  );
}

function Limits() {
  const t = useText();
  const [date, setDate] = useState<IsoDate | null>("2026-11-10");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Sevkiyat tarihi", en: "Shipping date" })} hint={t({ tr: "Yalnız 2 Kasım ile 30 Kasım 2026 arası", en: "Only between 2 and 30 November 2026" })}>
        <DatePicker value={date} onChange={setDate} min="2026-11-02" max="2026-11-30" />
      </Field>
    </div>
  );
}

function Weekends() {
  const t = useText();
  const [date, setDate] = useState<IsoDate | null>("2026-11-05");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Teslim günü", en: "Delivery day" })} hint={t({ tr: "Hafta sonu teslimat yapılmıyor", en: "No deliveries at weekends" })}>
        <DatePicker value={date} onChange={setDate} isDateDisabled={isWeekend} />
      </Field>
    </div>
  );
}

function Clearable() {
  const t = useText();
  const [date, setDate] = useState<IsoDate | null>("2026-12-15");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Hatırlatma tarihi", en: "Reminder date" })} hint={t({ tr: "İsteğe bağlı", en: "Optional" })}>
        <DatePicker clearable value={date} onChange={setDate} />
      </Field>
    </div>
  );
}

function FilterVariant() {
  const t = useText();
  const [date, setDate] = useState<IsoDate | null>("2026-10-12");
  const [due, setDue] = useState<IsoDate | null>(null);
  return (
    <>
      <DatePicker variant="filter" clearable label={t({ tr: "Sipariş", en: "Ordered" })} value={date} onChange={setDate} />
      <DatePicker variant="filter" clearable label={t({ tr: "Vade", en: "Due" })} placeholder={t({ tr: "Tümü", en: "All" })} value={due} onChange={setDue} />
    </>
  );
}

function InField() {
  const t = useText();
  const [date, setDate] = useState<IsoDate | null>(null);
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Sözleşme bitişi", en: "Contract end" })} hint={t({ tr: "Yenileme için 30 gün önce uyarılır", en: "A reminder goes out 30 days before" })} error={date ? undefined : t({ tr: "Bitiş tarihi zorunludur", en: "An end date is required" })}>
        <DatePicker value={date} onChange={setDate} />
      </Field>
    </div>
  );
}

function InForm() {
  const t = useText();
  const [date, setDate] = useState<IsoDate | null>("2026-11-30");
  const [sent, setSent] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))));
  };
  return (
    <form className="d-stack" onSubmit={submit}>
      <Field label={t({ tr: "Son ödeme tarihi", en: "Payment due" })}>
        <DatePicker name="dueDate" value={date} onChange={setDate} />
      </Field>
      <Button type="submit" variant="primary">{t({ tr: "Kaydet", en: "Save" })}</Button>
      {sent ? <code>{sent}</code> : null}
    </form>
  );
}

function Disabled() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Fatura tarihi", en: "Invoice date" })} hint={t({ tr: "Kesilen faturanın tarihi değişmez", en: "An issued invoice keeps its date" })}>
        <DatePicker disabled value="2026-10-05" onChange={() => {}} />
      </Field>
    </div>
  );
}

export default definePage({
  summary: { tr: "Tek bir günü yazarak ya da takvimden seçtirir. Değer her zaman `YYYY-MM-DD` biçiminde bir metindir, bu yüzden saat dilimi kayması yaşanmaz.", en: "Takes a single day, typed or picked from a calendar. The value is always a `YYYY-MM-DD` string, so time zones can never shift it." },
  imports: 'import { DatePicker } from "btui";',
  hero: {
    Demo: Due,
    code: `const [due, setDue] = useState<IsoDate | null>("2026-11-16");

<Field label="Due date" hint="Type it or pick from the calendar">
  <DatePicker value={due} onChange={setDue} />
</Field>`,
  },
  use: {
    do: [
      { tr: "Form alanlarında tek gün: vade, sevkiyat, sözleşme bitişi", en: "A single day in a form: due date, shipping date, contract end" },
      { tr: "Bilinen tarihlerin hızlı girişi; klavyeden `31102026` yazmak yeterlidir", en: "Fast entry of known dates; typing `31102026` on the keyboard is enough" },
      { tr: "Tablo üstü tek tarih filtresi; `variant=\"filter\"` kullanın", en: "A single date filter above a table; use `variant=\"filter\"`" },
    ],
    dont: [
      { tr: "Başlangıç ve bitiş seçimi; `DateRangePicker` iki ucu birlikte yönetir", en: "Choosing a start and an end; `DateRangePicker` handles both ends together" },
      { tr: "Sayfaya gömülü, her zaman açık takvim; `Calendar` kullanın", en: "An always open calendar placed in the page; use `Calendar`" },
      { tr: "Saat bilgisi gereken alanlar; bileşen yalnız takvim günü tutar", en: "Fields that need a time of day; the component only holds a calendar day" },
    ],
  },
  anatomy: `<Field label="Label" hint="Help text">
  <DatePicker
    value={value}
    onChange={setValue}
    min="2026-01-01"
    max="2026-12-31"
    isDateDisabled={isWeekend}
    clearable
    name="fieldName"
  />
</Field>`,
  examples: [
    {
      id: "typed",
      title: { tr: "Yazarak giriş", en: "Typed entry" },
      body: { tr: "Alan, insanların yazdığı biçimleri okur: `31.10.2026`, `31/10/26`, ayraçsız `31102026` ve `311026`, ayrıca `2026-10-31`. Gün, ay ve yıl sırası `BtuiProvider` dilinden gelir: Türkçede gün önce, İngilizcede ay önce yazılır. İki haneli yıl 20 ile tamamlanır. Metin alandan çıkınca ya da `Enter` ile işlenir ve biçimi düzelir; okunamayan ya da kapalı bir gün kırmızı kalır, değer değişmez. Bir tarih yazıp alandan çıkın.", en: "The field reads what people type: `10/31/2026`, `10-31-26`, the compact `10312026` and `103126`, and also `2026-10-31`. The order of day, month and year follows the `BtuiProvider` language: month first in English, day first in Turkish. Two digit years gain a leading 20. The text is read on blur or `Enter` and then tidied up; text that cannot be read, or a closed day, stays red and the value does not change. Type a date and leave the field." },
      example: {
        Demo: Typed,
        code: `const [date, setDate] = useState<IsoDate | null>(null);

<Field label="Waybill date" hint="10312026, 103126, 10/31/2026, 10-31-26">
  <DatePicker value={date} onChange={setDate} />
</Field>`,
      },
    },
    {
      id: "iso",
      title: { tr: "Değer neden metin", en: "Why the value is a string" },
      body: { tr: "Takvim gününün saat dilimi yoktur. `Date` nesnesi ise bir an tutar: Türkiye'de `new Date(2026, 9, 31)` yerel gece yarısıdır ve `toISOString` ile `2026-10-30` olur. Bu yüzden `value` ve `onChange` yalnız `YYYY-MM-DD` metni taşır; sunucuya aynen gönderilir, `<` ve `>` ile doğrudan karşılaştırılır. Ekranda göstermek için `formatDate`, kullanıcının yazdığını okumak için `parseDate` kullanın.", en: "A calendar day has no time zone, while a `Date` holds an instant: in Turkey `new Date(2026, 9, 31)` is local midnight, and `toISOString` turns it into `2026-10-30`. So `value` and `onChange` only carry `YYYY-MM-DD` strings. They go to the server as they are and compare directly with `<` and `>`. Use `formatDate` to show one on screen and `parseDate` to read what someone typed." },
      example: {
        Demo: IsoValue,
        code: `const [date, setDate] = useState<IsoDate | null>("2026-10-31");

<DatePicker aria-label="Invoice date" value={date} onChange={setDate} />
<code>{formatDate(date, "en", { day: "numeric", month: "long", year: "numeric" })}</code>`,
      },
    },
    {
      id: "limits",
      title: { tr: "En erken ve en geç gün", en: "Earliest and latest day" },
      body: { tr: "`min` ve `max` sınırları da seçilebilir günlerdir. Dışarıda kalan günler takvimde kapanır ve yazılınca kabul edilmez. Bugün sınırın dışındaysa alttaki `Bugün` düğmesi de kapanır. Takvimi açıp ekim ayına geçmeyi deneyin.", en: "`min` and `max` are themselves selectable days. Days outside them close in the calendar and are refused when typed. If today falls outside, the `Today` button at the bottom closes as well. Open the calendar and try moving to October." },
      example: { Demo: Limits, code: `<DatePicker value={date} onChange={setDate} min="2026-11-02" max="2026-11-30" />` },
    },
    {
      id: "weekends",
      title: { tr: "Kapalı günler", en: "Closed days" },
      body: { tr: "`isDateDisabled` tek tek günleri kapatır: hafta sonu, resmî tatil, dolu teslimat günü. İşlev `YYYY-MM-DD` metni alır ve kapatmak için `true` döndürür. Kapalı günler üstü çizili görünür, yazılınca da reddedilir. Aşağıda bir cumartesi yazıp deneyin. Her gün için çalıştığından işlevi hafif tutun.", en: "`isDateDisabled` closes individual days: weekends, public holidays, full delivery days. It takes a `YYYY-MM-DD` string and returns `true` to close the day. Closed days show struck through and are refused when typed too. Type a Saturday below to try. It runs for every day shown, so keep it light." },
      example: {
        Demo: Weekends,
        code: `const isWeekend = (date: IsoDate) => [0, 6].includes(new Date(\`\${date}T00:00:00Z\`).getUTCDay());

<DatePicker value={date} onChange={setDate} isDateDisabled={isWeekend} />`,
      },
    },
    {
      id: "clearable",
      title: { tr: "Temizlenebilir", en: "Clearable" },
      body: { tr: "`clearable` değer varken takvim düğmesinin yanına çarpı koyar ve `onChange` ile `null` bildirir. Bu prop olmadan da alanı boşaltıp çıkmak ya da takvimin altındaki `Temizle` düğmesi değeri siler. İsteğe bağlı alanlarda kullanın.", en: "`clearable` adds a cross beside the calendar button while there is a value, and reports `null` through `onChange`. Even without it, emptying the field and leaving it, or the `Clear` button under the calendar, removes the value. Use it on optional fields." },
      example: { Demo: Clearable, code: `<DatePicker clearable value={date} onChange={setDate} />` },
    },
    {
      id: "filter",
      title: { tr: "Filtre görünümü", en: "Filter variant" },
      body: { tr: "`variant=\"filter\"` metin alanı yerine `Select` filtreleriyle aynı kutuyu çizer: `label` ön ek olur, seçim yapılınca kutu dolar. Bu görünümde yazarak giriş yoktur, takvim açılır. `placeholder` seçim yokken görünür. Filtre çubuğuna `clearable` ile koyun.", en: "`variant=\"filter\"` draws the same box as `Select` filters instead of a text field: `label` becomes a prefix and the box fills once a day is chosen. There is no typing in this variant; the calendar opens instead. `placeholder` shows with no choice. Put it in a filter bar with `clearable`." },
      example: {
        Demo: FilterVariant,
        code: `<DatePicker variant="filter" clearable label="Ordered" value={date} onChange={setDate} />
<DatePicker variant="filter" clearable label="Due" placeholder="All" value={due} onChange={setDue} />`,
      },
    },
    {
      id: "in-field",
      title: { tr: "Field içinde", en: "Inside Field" },
      body: { tr: "`Field` etiketi, açıklaması ve hatası yazı alanına bağlanır, `error` kenarlığı kırmızı yapar. Bir tarih seçince hata kalkar. `Field` yoksa `aria-label` verin.", en: "The label, hint and error of `Field` link to the text field, and `error` turns the border red. Choose a date and the error clears. Without `Field`, pass `aria-label`." },
      example: {
        Demo: InField,
        code: `<Field label="Contract end" hint="A reminder goes out 30 days before" error={date ? undefined : "An end date is required"}>
  <DatePicker value={date} onChange={setDate} />
</Field>`,
      },
    },
    {
      id: "form",
      title: { tr: "Form gönderimi", en: "Form submission" },
      body: { tr: "`name` verildiğinde gizli bir `input` değeri `YYYY-MM-DD` olarak forma ekler; ekranda yazan biçim gönderilmez. Adı `Field` üzerine değil `DatePicker` üzerine yazın. Formu gönderip çıkan veriye bakın.", en: "With `name`, a hidden `input` adds the value to the form as `YYYY-MM-DD`; the format on screen is not sent. Set the name on `DatePicker`, not on `Field`. Submit the form to see the data." },
      example: {
        Demo: InForm,
        code: `<form onSubmit={submit}>
  <Field label="Payment due">
    <DatePicker name="dueDate" value={date} onChange={setDate} />
  </Field>
  <Button type="submit" variant="primary">Save</Button>
</form>`,
      },
    },
    {
      id: "disabled",
      title: { tr: "Kapalı", en: "Disabled" },
      body: { tr: "`disabled` alanı ve takvim düğmesini birlikte kapatır, temizleme düğmesi de görünmez. Nedenini `hint` ile söyleyin.", en: "`disabled` turns off the field and the calendar button together, and the clear button goes away. Give the reason in `hint`." },
      example: { Demo: Disabled, code: `<DatePicker disabled value="2026-10-05" onChange={() => {}} />` },
    },
  ],
  a11y: [
    { tr: "Takvim Base UI `Popover` içinde açılır; açılınca odak seçili güne ya da bugüne gelir, kapanınca açan düğmeye döner.", en: "The calendar opens inside a Base UI `Popover`. Focus lands on the chosen day or today, and returns to the opening button on close." },
    { tr: "Yazı alanı `Field` etiketine bağlanır. `Field` yoksa `aria-label` verin; `field` görünümünde `label` de erişilebilir ad olur.", en: "The text field links to the `Field` label. Without `Field`, pass `aria-label`; in the `field` variant `label` also serves as the accessible name." },
    { tr: "Okunamayan tarih `aria-invalid` taşır ve alanın `title` değeri dil dosyasındaki `invalidDate` metni olur.", en: "Unreadable text carries `aria-invalid`, and the `title` of the field becomes the `invalidDate` text from the locale." },
    { tr: "Takvim `grid` rolü taşır. Her gün tam tarihiyle okunur: \"31 Ekim 2026 Cumartesi\". Bugün `aria-current=\"date\"` ile işaretlenir.", en: "The calendar has the `grid` role. Each day is read in full: \"Saturday, October 31, 2026\". Today is marked with `aria-current=\"date\"`." },
    { tr: "Takvim düğmesi ve temizleme düğmesinin adları dil dosyasından gelir: `openCalendar` ve `clear`.", en: "The calendar and clear buttons take their names from the locale: `openCalendar` and `clear`." },
  ],
  keyboard: [
    ["Tab", { tr: "Yazı alanı, temizleme ve takvim düğmesi arasında gezer", en: "Moves between the text field, the clear button and the calendar button" }],
    ["Enter", { tr: "Yazı alanında metni işler; takvimde odaktaki günü seçer", en: "In the text field, reads the text; in the calendar, picks the focused day" }],
    ["Space", { tr: "Takvim düğmesinde takvimi açar; takvimde odaktaki günü seçer", en: "Opens the calendar on its button; in the calendar, picks the focused day" }],
    ["← / →", { tr: "Önceki ya da sonraki güne geçer", en: "Moves to the previous or next day" }],
    ["↑ / ↓", { tr: "Bir hafta geri ya da ileri gider", en: "Moves a week back or forward" }],
    ["Home", { tr: "Haftanın ilk gününe gider", en: "Goes to the first day of the week" }],
    ["End", { tr: "Haftanın son gününe gider", en: "Goes to the last day of the week" }],
    ["PageUp", { tr: "Bir ay geri gider", en: "Goes back a month" }],
    ["PageDown", { tr: "Bir ay ileri gider", en: "Goes forward a month" }],
    ["Shift + PageUp", { tr: "Bir yıl geri gider", en: "Goes back a year" }],
    ["Shift + PageDown", { tr: "Bir yıl ileri gider", en: "Goes forward a year" }],
    ["Esc", { tr: "Takvimi seçim yapmadan kapatır", en: "Closes the calendar without choosing" }],
  ],
  api: [
    {
      name: "DatePicker",
      description: { tr: "Yalnız denetimli çalışır: `value` ve `onChange` zorunludur. Ref ve yerel öznitelikler iletilmez. `IsoDate`, `YYYY-MM-DD` biçimindeki `string` türüdür.", en: "It only works controlled: `value` and `onChange` are required. The ref and native attributes are not forwarded. `IsoDate` is a `string` in `YYYY-MM-DD` form." },
      props: [
        { name: "value", type: "IsoDate | null", required: true, description: { tr: "Seçili gün; `null` seçim yok demektir", en: "The chosen day; `null` means no choice" } },
        { name: "onChange", type: "(value: IsoDate | null) => void", required: true, description: { tr: "Yeni değeri bildirir; temizleyince `null`", en: "Reports the new value; `null` when cleared" } },
        { name: "variant", type: '"field" | "filter"', default: '"field"', description: { tr: "`field` yazılabilir alan, `filter` filtre çubukları için küçük kutu", en: "`field` is a typed input, `filter` a compact box for filter bars" } },
        { name: "label", type: "string", description: { tr: "`filter` görünümünde ön ek, `field` görünümünde erişilebilir ad", en: "A prefix in the `filter` variant, the accessible name in the `field` variant" } },
        { name: "placeholder", type: "string", default: 'formatDate("2026-12-31") | locale.select', description: { tr: "Boşken görünen metin; `field` görünümünde örnek bir tarih, `filter` görünümünde dil dosyasından gelir", en: "Text shown while empty: a sample date in the `field` variant, the locale text in the `filter` variant" } },
        { name: "min", type: "IsoDate", description: { tr: "Seçilebilen ilk gün", en: "First selectable day" } },
        { name: "max", type: "IsoDate", description: { tr: "Seçilebilen son gün", en: "Last selectable day" } },
        { name: "isDateDisabled", type: "(date: IsoDate) => boolean", description: { tr: "Tek tek günleri kapatır: hafta sonu, tatil", en: "Closes individual days, such as weekends or holidays" } },
        { name: "clearable", type: "boolean", default: "false", description: { tr: "Değer varken temizleme düğmesi gösterir", en: "Shows a clear button while there is a value" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Alanı ve takvimi kapatır", en: "Turns off the field and the calendar" } },
        { name: "required", type: "boolean", default: "false", description: { tr: "Boş değerle form gönderimini tarayıcı engeller, iki görünümde de çalışır", en: "The browser blocks submitting an empty value, in both variants" } },
        { name: "name", type: "string", description: { tr: "Gizli `input` ekler; değer `YYYY-MM-DD` olarak gönderilir", en: "Adds a hidden `input`; the value is sent as `YYYY-MM-DD`" } },
        { name: "block", type: "boolean", default: "false", description: { tr: "Kabın genişliğini doldurur", en: "Fills its container" } },
        { name: "className", type: "string", description: { tr: "Dış kaba eklenen sınıf", en: "Class added to the outer wrapper" } },
        { name: "aria-label", type: "string", description: { tr: "`Field` yoksa erişilebilir ad", en: "Accessible name when there is no `Field`" } },
      ],
    },
    {
      name: "formatDate",
      description: { tr: "`formatDate(iso, lang, options?)` tarihi dile göre metne çevirir. Geçersiz tarihte boş metin döndürür.", en: "`formatDate(iso, lang, options?)` turns a date into text for a language. It returns an empty string for an invalid date." },
      props: [
        { name: "iso", type: "IsoDate", required: true, description: { tr: "Biçimlenecek gün", en: "The day to format" } },
        { name: "lang", type: "string", required: true, description: { tr: "Dil kodu, örneğin `tr`", en: "Language code, such as `en`" } },
        { name: "options", type: "Intl.DateTimeFormatOptions", default: "{ day, month, year }", description: { tr: "`Intl.DateTimeFormat` seçenekleri", en: "`Intl.DateTimeFormat` options" } },
      ],
    },
    {
      name: "parseDate",
      description: { tr: "`parseDate(text, lang)` yazılan metni `IsoDate` değerine çevirir. Gerçek bir tarih değilse `null` döndürür: `31.02.2026` reddedilir.", en: "`parseDate(text, lang)` turns typed text into an `IsoDate`. It returns `null` when it is not a real date, so `02/31/2026` is refused." },
      props: [
        { name: "text", type: "string", required: true, description: { tr: "Okunacak metin", en: "The text to read" } },
        { name: "lang", type: "string", required: true, description: { tr: "Gün, ay, yıl sırasını belirler", en: "Sets the order of day, month and year" } },
      ],
    },
    {
      name: "todayIso",
      description: { tr: "`todayIso(now?)` yerel takvime göre bugünü `IsoDate` olarak döndürür.", en: "`todayIso(now?)` returns today in the local calendar as an `IsoDate`." },
      props: [
        { name: "now", type: "Date", default: "new Date()", description: { tr: "Bugün yerine kullanılacak an", en: "An instant to use in place of now" } },
      ],
    },
  ],
  styling: [
    { name: "data-wrong", kind: "data", description: { tr: "Okunamayan metinde `.bt-date-text` üzerinde bulunur", en: "On `.bt-date-text` while the text cannot be read" } },
    { name: "data-block", kind: "data", description: { tr: "Tam genişlikte dış kapta bulunur", en: "On the wrapper at full width" } },
    { name: "data-popup-open", kind: "data", description: { tr: "Takvim açıkken `.bt-date-btn` üzerinde bulunur", en: "On `.bt-date-btn` while the calendar is open" } },
    { name: "data-today", kind: "data", description: { tr: "Bugünün `.bt-cal-day` düğmesinde bulunur", en: "On the `.bt-cal-day` button of today" } },
    { name: "data-selected", kind: "data", description: { tr: "Seçili günün `.bt-cal-day` düğmesinde bulunur", en: "On the `.bt-cal-day` button of the chosen day" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Odak halkası ve fareyle üzerine gelinen gün", en: "Focus ring and the day under the pointer" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "Seçili gün zemini", en: "Chosen day background" } },
    { name: "--bt-danger", kind: "var", description: { tr: "Okunamayan metnin rengi", en: "Colour of unreadable text" } },
    { name: "--bt-faint", kind: "var", description: { tr: "Kapalı ve ay dışı günlerin rengi", en: "Colour of closed days and days outside the month" } },
  ],
  related: ["date-range-picker", "calendar", "field", "filter-bar"],
});
