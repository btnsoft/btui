import { useState, type FormEvent } from "react";
import { Badge, Button, Field, MultiSelect, type SelectOption } from "btui";
import { CITIES, CUSTOMERS, ORDERS, STATUS_LABEL, money, type OrderStatus } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const STATUS_KEYS: OrderStatus[] = ["open", "pending", "done", "cancelled"];
const CUSTOMER_OPTIONS = CUSTOMERS.map((customer) => ({ value: customer, label: customer }));

function FilterHero() {
  const t = useText();
  const [cities, setCities] = useState<string[]>(["İzmir", "Bursa"]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const options = STATUS_KEYS.map((status) => ({ value: status, label: t(STATUS_LABEL[status]) }));
  return (
    <>
      <MultiSelect label={t({ tr: "Şehir", en: "City" })} value={cities} onChange={setCities} options={CITIES} placeholder={t({ tr: "Tümü", en: "All" })} />
      <MultiSelect label={t({ tr: "Durum", en: "Status" })} value={statuses} onChange={setStatuses} options={options} placeholder={t({ tr: "Tümü", en: "All" })} />
    </>
  );
}

function FormField() {
  const t = useText();
  const [regions, setRegions] = useState<string[]>(["Ankara"]);
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Sevkiyat bölgeleri", en: "Delivery regions" })} hint={t({ tr: "Depomuzun hizmet verdiği şehirler", en: "The cities our warehouse serves" })}>
        <MultiSelect variant="field" value={regions} onChange={setRegions} options={CITIES} />
      </Field>
    </div>
  );
}

function Summary() {
  const t = useText();
  const [customers, setCustomers] = useState<string[]>(["Mavi Yapı", "Ege Tekstil", "Atlas Makine"]);
  return (
    <div className="d-stack">
      <MultiSelect block label={t({ tr: "Müşteri", en: "Customer" })} value={customers} onChange={setCustomers} options={CUSTOMER_OPTIONS} />
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {customers.map((customer) => <Badge key={customer} tone="info">{customer}</Badge>)}
      </div>
    </div>
  );
}

function Filtering() {
  const t = useText();
  const lang = useLang();
  const [cities, setCities] = useState<string[]>(["İstanbul"]);
  const rows = cities.length ? ORDERS.filter((o) => cities.includes(o.city)) : ORDERS;
  const total = rows.reduce((sum, o) => sum + o.amount, 0);
  return (
    <>
      <MultiSelect label={t({ tr: "Şehir", en: "City" })} value={cities} onChange={setCities} options={CITIES} placeholder={t({ tr: "Tümü", en: "All" })} />
      <Badge tone="info">{t({ tr: `${rows.length} sipariş`, en: `${rows.length} orders` })}</Badge>
      <Badge>{money(total, lang)}</Badge>
    </>
  );
}

function Hints() {
  const t = useText();
  const [approvers, setApprovers] = useState<string[]>(["ada"]);
  const options: SelectOption[] = [
    { value: "ada", label: "Ada Yılmaz", hint: t({ tr: "Satış", en: "Sales" }) },
    { value: "can", label: "Can Demir", hint: t({ tr: "Finans", en: "Finance" }) },
    { value: "elif", label: "Elif Kaya", hint: t({ tr: "Finans", en: "Finance" }) },
    { value: "mert", label: "Mert Aydın", hint: t({ tr: "İzinde", en: "On leave" }), disabled: true },
  ];
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Onaylayanlar", en: "Approvers" })} error={approvers.length >= 2 ? undefined : t({ tr: "En az iki onaylayan seçin", en: "Choose at least two approvers" })}>
        <MultiSelect variant="field" value={approvers} onChange={setApprovers} options={options} />
      </Field>
    </div>
  );
}

function SelectAll() {
  const t = useText();
  const [customers, setCustomers] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>(["open"]);
  const [cities, setCities] = useState<string[]>([]);
  const options = STATUS_KEYS.map((status) => ({ value: status, label: t(STATUS_LABEL[status]) }));
  return (
    <>
      <MultiSelect label={t({ tr: "Müşteri", en: "Customer" })} value={customers} onChange={setCustomers} options={CUSTOMER_OPTIONS} placeholder={t({ tr: "Yok", en: "None" })} />
      <MultiSelect bulk label={t({ tr: "Durum", en: "Status" })} value={statuses} onChange={setStatuses} options={options} placeholder={t({ tr: "Yok", en: "None" })} />
      <MultiSelect bulk={false} label={t({ tr: "Şehir", en: "City" })} value={cities} onChange={setCities} options={CITIES} placeholder={t({ tr: "Yok", en: "None" })} />
    </>
  );
}

function InForm() {
  const t = useText();
  const [cities, setCities] = useState<string[]>(["Konya", "Van"]);
  const [sent, setSent] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(JSON.stringify(new FormData(e.currentTarget).getAll("cities")));
  };
  return (
    <form className="d-stack" onSubmit={submit}>
      <Field label={t({ tr: "Bayi şehirleri", en: "Dealer cities" })}>
        <MultiSelect variant="field" name="cities" value={cities} onChange={setCities} options={CITIES} />
      </Field>
      <Button type="submit" variant="primary">{t({ tr: "Kaydet", en: "Save" })}</Button>
      {sent ? <code>{sent}</code> : null}
    </form>
  );
}

export default definePage({
  summary: { tr: "Bir listeden birden çok değer seçtirir. Liste seçim sırasında açık kalır, arama kutusu her zaman hazırdır ve kutu seçimi tek satırda özetler.", en: "Picks several values from a list. The list stays open while choosing, the search box is always there and the box sums up the choice on one line." },
  imports: 'import { MultiSelect } from "btui";',
  base: "combobox",
  hero: {
    Demo: FilterHero,
    code: `const [cities, setCities] = useState(["İzmir", "Bursa"]);
const [statuses, setStatuses] = useState<string[]>([]);

<MultiSelect label="City" value={cities} onChange={setCities} options={CITIES} placeholder="All" />
<MultiSelect label="Status" value={statuses} onChange={setStatuses} options={STATUSES} placeholder="All" />`,
  },
  use: {
    do: [
      { tr: "Tablo filtreleri: birden çok şehir, durum ya da müşteri", en: "Table filters: several cities, statuses or customers" },
      { tr: "Uzun listelerden birkaç kayıt seçmek; arama işi hızlandırır", en: "Choosing a few records from a long list; search speeds this up" },
      { tr: "Ekranda az yer varken çoklu seçim; seçim tek satıra sığar", en: "Multiple choice with little room; the choice fits on one line" },
    ],
    dont: [
      { tr: "En fazla bir seçim gerektiğinde; `Select` kullanın", en: "When at most one value is allowed; use `Select`" },
      { tr: "Dört ya da daha az seçenek; hepsini görünür tutan `Checkbox` listesi daha nettir", en: "Four options or fewer; a `Checkbox` list keeps them all in view" },
      { tr: "Seçilenlerin hepsinin görünmesi gereken yerler; iki ve daha fazlası \"3 seçili\" gibi özetlenir", en: "Places where every choice must stay visible; two or more collapse to \"3 selected\"" },
    ],
  },
  anatomy: `<Field label="Label">
  <MultiSelect
    variant="field"
    value={value}
    onChange={setValue}
    options={[{ value: "a", label: "Option", hint: "12", disabled: false }]}
    placeholder="Choose"
  />
</Field>`,
  examples: [
    {
      id: "field",
      title: { tr: "Form alanı", en: "Form field" },
      body: { tr: "Varsayılan görünüm `Select` tersine `filter`'dır. Formda `variant=\"field\"` verin; kutu tam genişliğe yayılır ve `Field` etiketiyle uyumlu görünür.", en: "Unlike `Select`, the default variant is `filter`. In forms pass `variant=\"field\"`; the box goes full width and sits well with a `Field` label." },
      example: {
        Demo: FormField,
        code: `<Field label="Delivery regions" hint="The cities our warehouse serves">
  <MultiSelect variant="field" value={regions} onChange={setRegions} options={CITIES} />
</Field>`,
      },
    },
    {
      id: "summary",
      title: { tr: "Seçim özeti", en: "Selection summary" },
      body: { tr: "Kutu boşken `placeholder`, tek seçimde seçeneğin adını, daha fazlasında dil dosyasındaki `selected` metnini gösterir. Her seçimin görünmesi gerekiyorsa yanına `Badge` listesi koyun.", en: "The box shows `placeholder` when empty, the option name for one choice, and the locale's `selected` text beyond that. If every choice must show, put a `Badge` list beside it." },
      example: {
        Demo: Summary,
        code: `<MultiSelect block label="Customer" value={customers} onChange={setCustomers} options={CUSTOMERS} />
{customers.map((customer) => <Badge key={customer} tone="info">{customer}</Badge>)}`,
      },
    },
    {
      id: "filtering",
      title: { tr: "Veriyi süzmek", en: "Filtering data" },
      body: { tr: "Boş dizi \"filtre yok\" demektir; tüm kayıtları döndürün. Seçim değiştikçe sayı ve toplam anında güncellenir. Listeyi açık bırakıp birkaç şehir seçin.", en: "An empty array means no filter, so return every record. The count and total update as the choice changes. Keep the list open and pick a few cities." },
      example: {
        Demo: Filtering,
        code: `const [cities, setCities] = useState(["İstanbul"]);
const rows = cities.length ? orders.filter((o) => cities.includes(o.city)) : orders;

<MultiSelect label="City" value={cities} onChange={setCities} options={CITIES} placeholder="All" />
<Badge tone="info">{rows.length} orders</Badge>`,
      },
    },
    {
      id: "hints",
      title: { tr: "İpucu, kapalı seçenek ve hata", en: "Hints, disabled options and errors" },
      body: { tr: "`hint` ve `disabled` `Select` ile aynı çalışır. Seçim sayısına bağlı kuralları kendiniz denetleyip `error` ile bildirin; bileşenin en az ya da en çok sınırı yoktur.", en: "`hint` and `disabled` work as they do in `Select`. Check rules on the number of choices yourself and report them through `error`; the component has no minimum or maximum." },
      example: {
        Demo: Hints,
        code: `<Field label="Approvers" error={approvers.length >= 2 ? undefined : "Choose at least two approvers"}>
  <MultiSelect variant="field" value={approvers} onChange={setApprovers} options={[
    { value: "ada", label: "Ada Yılmaz", hint: "Sales" },
    { value: "can", label: "Can Demir", hint: "Finance" },
    { value: "mert", label: "Mert Aydın", hint: "On leave", disabled: true },
  ]} />
</Field>`,
      },
    },
    {
      id: "select-all",
      title: { tr: "Tümünü seçmek", en: "Selecting all" },
      body: { tr: "`bulk` listenin üstüne \"Tümünü seç\" ve \"Temizle\" düğmelerini koyar. Verilmezse altı ve daha fazla seçenekte kendiliğinden açılır: müşteri listesinde vardır. Dört durumlu listede `bulk` ile açıldı, şehir listesinde `bulk={false}` ile kapatıldı. \"Tümünü seç\" arama süzmesini dikkate almaz, kapalı seçenekleri atlar.", en: "`bulk` puts \"Select all\" and \"Clear\" above the list. When left out, it turns on by itself from six options, as in the customer list. The four-status list turns it on with `bulk` and the city list turns it off with `bulk={false}`. \"Select all\" ignores the search filter and skips disabled options." },
      example: {
        Demo: SelectAll,
        code: `<MultiSelect label="Customer" value={customers} onChange={setCustomers} options={CUSTOMERS} placeholder="None" />
<MultiSelect bulk label="Status" value={statuses} onChange={setStatuses} options={STATUSES} placeholder="None" />
<MultiSelect bulk={false} label="City" value={cities} onChange={setCities} options={CITIES} placeholder="None" />`,
      },
    },
    {
      id: "form",
      title: { tr: "Form gönderimi", en: "Form submission" },
      body: { tr: "`name` verildiğinde her seçim için ayrı bir gizli alan oluşur. Sunucuda ya da `FormData` üzerinde `getAll` ile okuyun. Formu gönderip sonucu görün.", en: "With `name`, each choice gets its own hidden field. Read them on the server or with `getAll` on `FormData`. Submit the form to see the result." },
      example: {
        Demo: InForm,
        code: `const submit = (e) => {
  e.preventDefault();
  new FormData(e.currentTarget).getAll("cities");
};

<form onSubmit={submit}>
  <MultiSelect variant="field" name="cities" value={cities} onChange={setCities} options={CITIES} />
</form>`,
      },
    },
  ],
  a11y: [
    { tr: "`Field` içinde etikete ve hataya otomatik bağlanır. Dışında `aria-label` verin. `field` görünümünde `label` de erişilebilir ad olur.", en: "Inside `Field` it links to the label and error automatically. Outside, pass `aria-label`. In the `field` variant `label` also becomes the accessible name." },
    { tr: "`filter` görünümünde `aria-label` verilmezse ad kutudaki metinden gelir: \"Şehir: 2 seçili\".", en: "In the `filter` variant, without `aria-label`, the name comes from the box text: \"City: 2 selected\"." },
    { tr: "Liste açıldığında odak arama kutusuna geçer, kapanınca kutuya döner.", en: "Opening the list moves focus to the search box, and closing returns it to the box." },
  ],
  keyboard: [
    ["Tab", { tr: "Kutuya odaklanır", en: "Moves focus to the box" }],
    ["Enter", { tr: "Listeyi açar; açıkken vurgulanan seçeneği ekler ya da çıkarır", en: "Opens the list; when open, adds or removes the highlighted option" }],
    ["Space", { tr: "Kapalı listeyi açar", en: "Opens the closed list" }],
    ["↑ / ↓", { tr: "Listeyi açar, açıkken seçenekler arasında gezer", en: "Opens the list; when open, moves between options" }],
    ["A-Z", { tr: "Listeyi süzer", en: "Filters the list" }],
    ["Escape", { tr: "Listeyi kapatır", en: "Closes the list" }],
  ],
  api: [
    {
      name: "MultiSelect",
      description: { tr: "Yalnız denetimli çalışır: `value` ve `onChange` zorunludur. `searchable` ve `clearable` yoktur; arama kutusu her zaman görünür. `options` içinde bulunmayan değerler sessizce düşer. `SelectOption` tipi için `Select` sayfasına bakın.", en: "It only works controlled: `value` and `onChange` are required. There is no `searchable` or `clearable`; the search box always shows. Values missing from `options` are silently dropped. See the `Select` page for the `SelectOption` type." },
      props: [
        { name: "value", type: "string[]", required: true, description: { tr: "Seçili değerler", en: "The chosen values" } },
        { name: "onChange", type: "(value: string[]) => void", required: true, description: { tr: "Yeni diziyi bildirir", en: "Reports the new array" } },
        { name: "options", type: "SelectOption[]", required: true, description: { tr: "Seçenekler", en: "The options" } },
        { name: "placeholder", type: "string", default: "locale.select", description: { tr: "Seçim yokken görünen metin", en: "Text shown with no choice" } },
        { name: "label", type: "string", description: { tr: "`filter` görünümünde ön ek, `field` görünümünde erişilebilir ad", en: "A prefix in the `filter` variant, the accessible name in the `field` variant" } },
        { name: "variant", type: '"field" | "filter"', default: '"filter"', description: { tr: "`field` formlar, `filter` filtre çubukları içindir", en: "`field` for forms, `filter` for filter bars" } },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: { tr: "Yükseklik: 26, 32px", en: "Height: 26, 32px" } },
        { name: "bulk", type: "boolean", default: "options.length >= 6", description: { tr: "Listenin üstünde \"Tümünü seç\" ve \"Temizle\" düğmeleri", en: "\"Select all\" and \"Clear\" buttons above the list" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Seçimi kapatır", en: "Blocks the choice" } },
        { name: "block", type: "boolean", default: "false", description: { tr: "Kabın genişliğini doldurur; `field` görünümü zaten tam genişliktir", en: "Fills its container; the `field` variant is always full width" } },
        { name: "name", type: "string", description: { tr: "Her seçim için aynı adla bir gizli alan oluşturur", en: "Creates one hidden field per choice under this name" } },
        { name: "className", type: "string", description: { tr: "Dış kaba eklenen sınıf", en: "Class added to the outer wrapper" } },
        { name: "aria-label", type: "string", description: { tr: "`Field` yoksa erişilebilir ad", en: "Accessible name when there is no `Field`" } },
      ],
    },
  ],
  styling: [
    { name: "data-variant", kind: "data", description: { tr: "Kutu üzerinde seçili görünüm", en: "The current variant, on the box" } },
    { name: "data-size", kind: "data", description: { tr: "Kutu üzerinde seçili boyut", en: "The current size, on the box" } },
    { name: "data-filled", kind: "data", description: { tr: "`filter` görünümünde en az bir değer seçiliyken bulunur", en: "Present in the `filter` variant while at least one value is chosen" } },
    { name: "data-popup-open", kind: "data", description: { tr: "Liste açıkken kutu üzerinde bulunur", en: "Present on the box while the list is open" } },
    { name: "data-empty", kind: "data", description: { tr: "Seçim yokken değer metninde bulunur", en: "Present on the value text with no choice" } },
    { name: "data-block", kind: "data", description: { tr: "Tam genişlikte dış kapta bulunur", en: "Present on the wrapper at full width" } },
    { name: "data-highlighted", kind: "data", description: { tr: "Klavye ya da fareyle vurgulanan seçenek", en: "The option highlighted by keyboard or mouse" } },
    { name: "data-selected", kind: "data", description: { tr: "Seçili olan seçenekler", en: "The chosen options" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Odaktaki kenarlık, `filter` dolu kenarlığı", en: "Focused border, filled `filter` border" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Odak halkası, vurgulanan seçenek, `filter` dolu zemini", en: "Focus ring, highlighted option, filled `filter` background" } },
  ],
  related: ["select", "checkbox", "filter-bar", "data-table"],
});
