import { useState, type FormEvent } from "react";
import { Button, Field, Select, type SelectOption } from "btui";
import { CITIES, CUSTOMERS, ORDERS, STATUS_LABEL, type OrderStatus } from "../lib/data";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const STATUS_KEYS: OrderStatus[] = ["open", "pending", "done", "cancelled"];
const CUSTOMER_OPTIONS: SelectOption[] = CUSTOMERS.map((customer) => ({
  value: customer,
  label: customer,
  hint: String(ORDERS.filter((o) => o.customer === customer && o.status === "open").length),
}));

function useStatusOptions() {
  const t = useText();
  return STATUS_KEYS.map((status) => ({ value: status, label: t(STATUS_LABEL[status]) }));
}

function Status() {
  const t = useText();
  const options = useStatusOptions();
  const [status, setStatus] = useState("pending");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Sipariş durumu", en: "Order status" })}>
        <Select value={status} onChange={setStatus} options={options} />
      </Field>
    </div>
  );
}

function Uncontrolled() {
  const t = useText();
  const options = useStatusOptions();
  const [sent, setSent] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))));
  };
  return (
    <form className="d-stack" onSubmit={submit}>
      <Field label={t({ tr: "Sipariş durumu", en: "Order status" })}>
        <Select name="status" defaultValue="pending" options={options} />
      </Field>
      <Button type="submit" variant="primary">{t({ tr: "Kaydet", en: "Save" })}</Button>
      {sent ? <code>{sent}</code> : null}
    </form>
  );
}

function Searchable() {
  const t = useText();
  const [city, setCity] = useState("");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Teslimat şehri", en: "Delivery city" })}>
        <Select value={city} onChange={setCity} options={CITIES} placeholder={t({ tr: "Şehir seçin", en: "Choose a city" })} />
      </Field>
    </div>
  );
}

function SearchSwitch() {
  const t = useText();
  const options = useStatusOptions();
  const [status, setStatus] = useState("open");
  const [city, setCity] = useState("Ankara");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Dört seçenek, aramalı", en: "Four options, with search" })}>
        <Select searchable value={status} onChange={setStatus} options={options} />
      </Field>
      <Field label={t({ tr: "On iki seçenek, aramasız", en: "Twelve options, no search" })}>
        <Select searchable={false} value={city} onChange={setCity} options={CITIES} />
      </Field>
    </div>
  );
}

function Hints() {
  const t = useText();
  const [customer, setCustomer] = useState("Çınar Gıda");
  const options = CUSTOMER_OPTIONS.map((option) => (option.value === "Işık Medikal" ? { ...option, disabled: true } : option));
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Müşteri", en: "Customer" })} hint={t({ tr: "Sağdaki sayı açık siparişleri gösterir. Işık Medikal'in kredi limiti doldu.", en: "The number on the right shows open orders. Işık Medikal has reached its credit limit." })}>
        <Select searchable={false} value={customer} onChange={setCustomer} options={options} />
      </Field>
    </div>
  );
}

function Filter() {
  const t = useText();
  const options = useStatusOptions();
  const [status, setStatus] = useState("open");
  const [city, setCity] = useState("");
  return (
    <>
      <Select variant="filter" label={t({ tr: "Durum", en: "Status" })} value={status} onChange={setStatus} options={options} placeholder={t({ tr: "Tümü", en: "All" })} clearable />
      <Select variant="filter" label={t({ tr: "Şehir", en: "City" })} value={city} onChange={setCity} options={CITIES} placeholder={t({ tr: "Tümü", en: "All" })} clearable />
    </>
  );
}

function Clearable() {
  const t = useText();
  const [owner, setOwner] = useState("elif");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Onaylayan kişi", en: "Approver" })} hint={t({ tr: "Boş bırakılırsa bölüm yöneticisine gider", en: "Goes to the department manager when empty" })}>
        <Select clearable value={owner} onChange={setOwner} options={[{ value: "ada", label: "Ada Yılmaz" }, { value: "can", label: "Can Demir" }, { value: "elif", label: "Elif Kaya" }, { value: "mert", label: "Mert Aydın" }]} />
      </Field>
    </div>
  );
}

function Sizes() {
  const t = useText();
  const options = useStatusOptions();
  const [status, setStatus] = useState("open");
  return (
    <div className="d-stack">
      <Select aria-label={t({ tr: "Orta boy", en: "Medium size" })} value={status} onChange={setStatus} options={options} />
      <Select size="sm" aria-label={t({ tr: "Küçük boy", en: "Small size" })} value={status} onChange={setStatus} options={options} />
    </div>
  );
}

function States() {
  const t = useText();
  const [city, setCity] = useState("");
  const options = useStatusOptions();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Fatura şehri", en: "Billing city" })} error={city ? undefined : t({ tr: "Fatura için şehir zorunludur", en: "A city is required for invoicing" })}>
        <Select value={city} onChange={setCity} options={CITIES} />
      </Field>
      <Field label={t({ tr: "Kapanmış sipariş", en: "Closed order" })} hint={t({ tr: "Tamamlanan siparişin durumu değişmez", en: "A completed order keeps its status" })}>
        <Select disabled value="done" onChange={() => {}} options={options} />
      </Field>
    </div>
  );
}

function InForm() {
  const t = useText();
  const options = useStatusOptions();
  const [status, setStatus] = useState("open");
  const [city, setCity] = useState("Bursa");
  const [sent, setSent] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))));
  };
  return (
    <form className="d-stack" onSubmit={submit}>
      <Field label={t({ tr: "Durum", en: "Status" })}>
        <Select name="status" value={status} onChange={setStatus} options={options} />
      </Field>
      <Field label={t({ tr: "Şehir", en: "City" })}>
        <Select name="city" required value={city} onChange={setCity} options={CITIES} clearable />
      </Field>
      <Button type="submit" variant="primary">{t({ tr: "Kaydet", en: "Save" })}</Button>
      {sent ? <code>{sent}</code> : null}
    </form>
  );
}

export default definePage({
  summary: { tr: "Bir listeden tek değer seçtirir. Seçenek sayısı sekizi aşınca kendiliğinden arama kutusu kazanır.", en: "Picks one value from a list. Past eight options it gains a search box on its own." },
  imports: 'import { Select } from "btui";',
  base: "select",
  hero: {
    Demo: Status,
    code: `const [status, setStatus] = useState("pending");

<Field label="Order status">
  <Select value={status} onChange={setStatus} options={[
    { value: "open", label: "Open" },
    { value: "pending", label: "Pending" },
    { value: "done", label: "Done" },
    { value: "cancelled", label: "Cancelled" },
  ]} />
</Field>`,
  },
  use: {
    do: [
      { tr: "Beş ve daha fazla seçenekli alanlar: şehir, müşteri, sorumlu", en: "Fields with five or more options: city, customer, owner" },
      { tr: "Filtre çubuklarında `variant=\"filter\"` ile sütun filtreleri", en: "Column filters in filter bars with `variant=\"filter\"`" },
      { tr: "Seçeneğin yanında sayı ya da kod gerektiğinde `hint`", en: "`hint` when an option needs a count or a code beside it" },
    ],
    dont: [
      { tr: "İki ya da üç seçenek; hepsini gösteren `RadioGroup` tek tıkla biter", en: "Two or three options; `RadioGroup` shows them all and takes one click" },
      { tr: "Birden çok değer seçmek; `MultiSelect` kullanın", en: "Choosing several values; use `MultiSelect`" },
      { tr: "Sayfada gezinme; açılır liste bağlantı değildir, `Menu` ya da `Tabs` kullanın", en: "Page navigation; a list is not a link, use `Menu` or `Tabs`" },
    ],
  },
  anatomy: `<Field label="Label" hint="Help text">
  <Select
    value={value}
    onChange={setValue}
    options={[{ value: "a", label: "Option", hint: "12", disabled: false }]}
    placeholder="Choose"
  />
</Field>`,
  examples: [
    {
      id: "uncontrolled",
      title: { tr: "Denetimsiz kullanım", en: "Uncontrolled" },
      body: { tr: "`value` vermezseniz bileşen değeri kendisi tutar; `defaultValue` başlangıcı belirler, `onChange` isteğe bağlıdır. Yalnız formla gönderilecek alanlarda durum yazmanız gerekmez, `name` yeterlidir. Değeri ekranda başka yerde de kullanacaksanız `value` ve `onChange` verin.", en: "Leave out `value` and the component keeps the value itself; `defaultValue` sets the start and `onChange` is optional. For fields that only go out with a form you need no state, just `name`. Pass `value` and `onChange` when the value is used elsewhere on screen." },
      example: {
        Demo: Uncontrolled,
        code: `<form onSubmit={submit}>
  <Field label="Order status">
    <Select name="status" defaultValue="pending" options={STATUSES} />
  </Field>
  <Button type="submit" variant="primary">Save</Button>
</form>`,
      },
    },
    {
      id: "search",
      title: { tr: "Aramalı liste", en: "Search in the list" },
      body: { tr: "Dokuz ve daha fazla seçenekte listenin başına arama kutusu gelir. Arama yalnız `label` içinde yapılır ve `BtuiProvider` diline göre çalışır: Türkçede \"i\" yazınca \"İzmir\" de bulunur. Listeyi açıp yazmayı deneyin.", en: "From nine options up, a search box sits at the top of the list. Search only looks in `label` and follows the `BtuiProvider` language: in Turkish, typing \"i\" also finds \"İzmir\". Open the list and try typing." },
      example: {
        Demo: Searchable,
        code: `<Field label="Delivery city">
  <Select value={city} onChange={setCity} options={CITIES} placeholder="Choose a city" />
</Field>`,
      },
    },
    {
      id: "searchable",
      title: { tr: "Aramayı siz belirleyin", en: "Decide on search yourself" },
      body: { tr: "`searchable` otomatik eşiği geçersiz kılar. Az seçenekte de kullanıcı aramaya alışkınsa `true`, kısa ve bilinen bir listede `false` verin.", en: "`searchable` overrides the automatic threshold. Pass `true` when people expect search even on a short list, and `false` on a list they know well." },
      example: {
        Demo: SearchSwitch,
        code: `<Select searchable value={status} onChange={setStatus} options={STATUSES} />
<Select searchable={false} value={city} onChange={setCity} options={CITIES} />`,
      },
    },
    {
      id: "hints",
      title: { tr: "İpucu ve kapalı seçenek", en: "Hints and disabled options" },
      body: { tr: "`hint` sağda soluk bir sayı ya da kod gösterir, seçimde kutuya yazılmaz ve aramaya dahil değildir. Seçilemeyen kayıtları listeden silmek yerine `disabled` ile kapatın ve nedenini söyleyin.", en: "`hint` shows a muted count or code on the right. It is not written into the box and is left out of search. Rather than removing records that cannot be chosen, turn them off with `disabled` and say why." },
      example: {
        Demo: Hints,
        code: `<Select value={customer} onChange={setCustomer} options={[
  { value: "cinar", label: "Çınar Gıda", hint: "3" },
  { value: "ege", label: "Ege Tekstil", hint: "4" },
  { value: "isik", label: "Işık Medikal", hint: "2", disabled: true },
]} />`,
      },
    },
    {
      id: "filter",
      title: { tr: "Filtre görünümü", en: "Filter variant" },
      body: { tr: "`variant=\"filter\"` etiketi kutunun içine ön ek olarak yazar, seçim yapılınca kutuyu doldurur; böylece hangi filtrenin etkin olduğu tablo başında bir bakışta görülür. `clearable` ile birlikte kullanın.", en: "`variant=\"filter\"` writes the label inside the box as a prefix and fills the box once a value is chosen, so the active filters show at a glance above a table. Use it with `clearable`." },
      example: {
        Demo: Filter,
        code: `<Select variant="filter" label="Status" value={status} onChange={setStatus} options={STATUSES} placeholder="All" clearable />
<Select variant="filter" label="City" value={city} onChange={setCity} options={CITIES} placeholder="All" clearable />`,
      },
    },
    {
      id: "clearable",
      title: { tr: "Temizlenebilir", en: "Clearable" },
      body: { tr: "`clearable` değer varken ok işaretinin yerine çarpı düğmesi koyar. Temizlemek `onChange` ile boş metin bildirir. İsteğe bağlı alanlarda kullanın.", en: "`clearable` swaps the arrow for a cross while there is a value. Clearing reports an empty string through `onChange`. Use it on optional fields." },
      example: { Demo: Clearable, code: `<Select clearable value={owner} onChange={setOwner} options={OWNERS} />` },
    },
    {
      id: "sizes",
      title: { tr: "Boyutlar", en: "Sizes" },
      body: { tr: "Formlarda `md` (32px), yoğun tablo satırlarında `sm` (26px) kullanın. Boyut iki görünümde de geçerlidir.", en: "Use `md` (32px) in forms and `sm` (26px) in dense table rows. The size applies to both variants." },
      example: {
        Demo: Sizes,
        code: `<Select aria-label="Medium size" value={status} onChange={setStatus} options={STATUSES} />
<Select size="sm" aria-label="Small size" value={status} onChange={setStatus} options={STATUSES} />`,
      },
    },
    {
      id: "states",
      title: { tr: "Hata ve kapalı durum", en: "Error and disabled" },
      body: { tr: "`Field` üzerindeki `error` kutunun kenarlığını kırmızı yapar. Şehir seçince hata kalkar. `disabled` seçimi kapatır; değişmeyecek durumlarda nedenini `hint` ile açıklayın.", en: "`error` on `Field` turns the box border red. Choose a city and the error clears. `disabled` blocks the choice; for values that will not change, give the reason in `hint`." },
      example: {
        Demo: States,
        code: `<Field label="Billing city" error={city ? undefined : "A city is required for invoicing"}>
  <Select value={city} onChange={setCity} options={CITIES} />
</Field>
<Field label="Closed order" hint="A completed order keeps its status">
  <Select disabled value="done" onChange={() => {}} options={STATUSES} />
</Field>`,
      },
    },
    {
      id: "form",
      title: { tr: "Form gönderimi", en: "Form submission" },
      body: { tr: "`name` verildiğinde seçilen `value` gizli bir alanla forma eklenir, `label` gönderilmez. `required` boş seçimle gönderimi durdurur. Formu gönderip çıkan veriye bakın.", en: "With `name`, the chosen `value` joins the form through a hidden field, and `label` is not sent. `required` stops the submission with no choice. Submit the form to see the data." },
      example: {
        Demo: InForm,
        code: `<form onSubmit={submit}>
  <Field label="Status">
    <Select name="status" value={status} onChange={setStatus} options={STATUSES} />
  </Field>
  <Field label="City">
    <Select name="city" required value={city} onChange={setCity} options={CITIES} clearable />
  </Field>
  <Button type="submit" variant="primary">Save</Button>
</form>`,
      },
    },
  ],
  a11y: [
    { tr: "`Field` içinde etikete ve hataya otomatik bağlanır. `Field` yoksa `aria-label` verin; `field` görünümünde `label` de erişilebilir ad olarak kullanılır.", en: "Inside `Field` it links to the label and error automatically. Without `Field`, pass `aria-label`; in the `field` variant `label` also serves as the accessible name." },
    { tr: "Kutu `combobox` rolü taşır, liste açıldığında seçili öğe vurgulanır.", en: "The box has the `combobox` role, and opening the list highlights the chosen item." },
    { tr: "Temizleme düğmesinin adı dil dosyasından gelir: `clear`.", en: "The clear button takes its name from the locale: `clear`." },
    { tr: "Liste sayfanın üst katmanında açılır; taşan kaplar ve kaydırma alanları onu kesmez.", en: "The list opens in a portal, so overflowing containers and scroll areas cannot clip it." },
  ],
  keyboard: [
    ["Tab", { tr: "Kutuya odaklanır", en: "Moves focus to the box" }],
    ["Enter", { tr: "Listeyi açar; açıkken vurgulanan seçeneği seçer", en: "Opens the list; when open, picks the highlighted option" }],
    ["Space", { tr: "Listeyi açar; aramasız listede vurgulanan seçeneği seçer", en: "Opens the list; in a list without search, picks the highlighted option" }],
    ["↑ / ↓", { tr: "Listeyi açar, açıkken seçenekler arasında gezer", en: "Opens the list; when open, moves between options" }],
    ["Home / End", { tr: "Aramasız listede ilk ya da son seçeneğe gider; aramalı listede imleci taşır", en: "Goes to the first or last option without search; moves the caret with search" }],
    ["Escape", { tr: "Listeyi kapatır", en: "Closes the list" }],
    ["A-Z", { tr: "Aramasız listede eşleşen seçeneğe gider, liste kapalıysa onu seçer; aramalı listede süzer", en: "Without search, jumps to the match and picks it if the list is closed; with search, filters" }],
  ],
  api: [
    {
      name: "Select",
      description: { tr: "Denetimli ya da denetimsiz çalışır: `value` verilmezse değeri kendisi tutar. Ref ve yerel öznitelikler iletilmez.", en: "It works controlled or uncontrolled: without `value` it keeps the value itself. The ref and native attributes are not forwarded." },
      props: [
        { name: "value", type: "string", description: { tr: "Denetimli değer; boş metin seçim yok demektir", en: "Controlled value; an empty string means no choice" } },
        { name: "defaultValue", type: "string", default: '""', description: { tr: "Denetimsiz başlangıç değeri", en: "Uncontrolled initial value" } },
        { name: "onChange", type: "(value: string) => void", description: { tr: "Yeni değeri bildirir; temizleyince boş metin", en: "Reports the new value; an empty string when cleared" } },
        { name: "options", type: "SelectOption[]", required: true, description: { tr: "Seçenekler", en: "The options" } },
        { name: "placeholder", type: "string", default: "locale.select", description: { tr: "Seçim yokken görünen metin", en: "Text shown with no choice" } },
        { name: "label", type: "string", description: { tr: "`filter` görünümünde ön ek olur, örn. \"Şehir: İzmir\"; `field` görünümünde erişilebilir ad olur", en: "A prefix in the `filter` variant, as in \"City: Izmir\"; the accessible name in the `field` variant" } },
        { name: "variant", type: '"field" | "filter"', default: '"field"', description: { tr: "`field` formlar, `filter` filtre çubukları içindir; seçili değer kutuyu doldurur", en: "`field` for forms, `filter` for filter bars, where a chosen value fills the box" } },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: { tr: "Yükseklik: 26, 32px", en: "Height: 26, 32px" } },
        { name: "searchable", type: "boolean", default: "options.length > 8", description: { tr: "Listede arama kutusu", en: "Search box in the list" } },
        { name: "clearable", type: "boolean", default: "false", description: { tr: "Temizleme düğmesi; değer varken ve kapalı değilken görünür", en: "Clear button; shows while there is a value and the box is enabled" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Seçimi kapatır", en: "Blocks the choice" } },
        { name: "required", type: "boolean", default: "false", description: { tr: "Seçim yapılmadan formun gönderilmesini engeller", en: "Blocks form submission until a value is chosen" } },
        { name: "block", type: "boolean", default: "false", description: { tr: "Kabın genişliğini doldurur; `field` görünümü zaten tam genişliktir", en: "Fills its container; the `field` variant is always full width" } },
        { name: "name", type: "string", description: { tr: "Form gönderiminde kullanılan ad", en: "Name used on form submission" } },
        { name: "className", type: "string", description: { tr: "Dış kaba eklenen sınıf", en: "Class added to the outer wrapper" } },
        { name: "aria-label", type: "string", description: { tr: "`Field` yoksa erişilebilir ad", en: "Accessible name when there is no `Field`" } },
      ],
    },
    {
      name: "SelectOption",
      props: [
        { name: "value", type: "string", required: true, description: { tr: "Bildirilen ve gönderilen değer", en: "The value reported and submitted" } },
        { name: "label", type: "string", required: true, description: { tr: "Görünen metin; arama burada yapılır", en: "The visible text; search looks here" } },
        { name: "hint", type: "string", description: { tr: "Sağda soluk metin: sayı, kod", en: "Muted text on the right: a count, a code" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Seçeneği kapatır", en: "Turns the option off" } },
      ],
    },
  ],
  styling: [
    { name: "data-variant", kind: "data", description: { tr: "Kutu üzerinde seçili görünüm", en: "The current variant, on the box" } },
    { name: "data-size", kind: "data", description: { tr: "Kutu üzerinde seçili boyut", en: "The current size, on the box" } },
    { name: "data-filled", kind: "data", description: { tr: "`filter` görünümünde değer seçiliyken bulunur", en: "Present in the `filter` variant while a value is chosen" } },
    { name: "data-popup-open", kind: "data", description: { tr: "Liste açıkken kutu üzerinde bulunur", en: "Present on the box while the list is open" } },
    { name: "data-empty", kind: "data", description: { tr: "Seçim yokken değer metninde bulunur", en: "Present on the value text with no choice" } },
    { name: "data-clearable", kind: "data", description: { tr: "Temizleme düğmesi görünürken dış kapta bulunur", en: "Present on the wrapper while the clear button shows" } },
    { name: "data-block", kind: "data", description: { tr: "Tam genişlikte dış kapta bulunur", en: "Present on the wrapper at full width" } },
    { name: "data-highlighted", kind: "data", description: { tr: "Klavye ya da fareyle vurgulanan seçenek", en: "The option highlighted by keyboard or mouse" } },
    { name: "data-selected", kind: "data", description: { tr: "Seçili olan seçenek", en: "The chosen option" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Odaktaki kenarlık, `filter` dolu kenarlığı", en: "Focused border, filled `filter` border" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Odak halkası, vurgulanan seçenek, `filter` dolu zemini", en: "Focus ring, highlighted option, filled `filter` background" } },
    { name: "--bt-shadow-pop", kind: "var", description: { tr: "Liste gölgesi", en: "List shadow" } },
  ],
  related: ["multi-select", "radio-group", "field", "filter-bar"],
});
