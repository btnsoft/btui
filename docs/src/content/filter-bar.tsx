import { useState } from "react";
import { Chip, ChipGroup, DataTable, FilterBar, MultiSelect, NumberInput, SearchInput, Select, type Column, type SelectOption } from "btui";
import { CITIES, money, ORDERS, STATUS_LABEL, type Order, type OrderStatus } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const OWNERS: SelectOption[] = [...new Set(ORDERS.map((o) => o.owner))].map((owner) => ({ value: owner, label: owner }));
const STATUSES = Object.keys(STATUS_LABEL) as OrderStatus[];

function useColumns() {
  const t = useText();
  const lang = useLang();
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), sortable: false },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }), sortable: false },
    { key: "city", header: t({ tr: "Şehir", en: "City" }), sortable: false },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", sortable: false, cell: (r) => money(r.amount, lang) },
    { key: "status", header: t({ tr: "Durum", en: "Status" }), sortable: false, cell: (r) => t(STATUS_LABEL[r.status]) },
  ];
  return columns;
}

function useMatch() {
  const lang = useLang();
  return (order: Order, query: string) => `${order.no} ${order.customer}`.toLocaleLowerCase(lang).includes(query.trim().toLocaleLowerCase(lang));
}

function useStatusOptions(): SelectOption[] {
  const t = useText();
  return STATUSES.map((status) => ({ value: status, label: t(STATUS_LABEL[status]) }));
}

function Hero() {
  const t = useText();
  const columns = useColumns();
  const match = useMatch();
  const statusOptions = useStatusOptions();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [owner, setOwner] = useState("");
  const [minimum, setMinimum] = useState<number | null>(null);

  const active = query !== "" || city !== "" || statuses.length > 0 || owner !== "" || minimum !== null;
  const clear = () => {
    setQuery("");
    setCity("");
    setStatuses([]);
    setOwner("");
    setMinimum(null);
  };
  const rows = ORDERS.filter((o) =>
    match(o, query)
    && (!city || o.city === city)
    && (statuses.length === 0 || statuses.includes(o.status))
    && (!owner || o.owner === owner)
    && (minimum === null || o.amount >= minimum),
  );

  return (
    <div className="d-stack-wide">
      <FilterBar
        onClear={active ? clear : undefined}
        more={
          <>
            <Select variant="filter" label={t({ tr: "Sorumlu", en: "Owner" })} placeholder={t({ tr: "Tümü", en: "All" })} options={OWNERS} value={owner} onChange={setOwner} clearable />
            <div style={{ width: 180 }}>
              <NumberInput aria-label={t({ tr: "En düşük tutar", en: "Minimum amount" })} value={minimum} onChange={setMinimum} min={0} step={5000} hideSteppers format={{ style: "currency", currency: "TRY", maximumFractionDigits: 0 }} />
            </div>
          </>
        }
      >
        <SearchInput placeholder={t({ tr: "Sipariş no ya da müşteri…", en: "Order number or customer…" })} value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select variant="filter" label={t({ tr: "Şehir", en: "City" })} placeholder={t({ tr: "Tümü", en: "All" })} options={CITIES} value={city} onChange={setCity} clearable />
        <MultiSelect label={t({ tr: "Durum", en: "Status" })} placeholder={t({ tr: "Tümü", en: "All" })} options={statusOptions} value={statuses} onChange={setStatuses} />
      </FilterBar>
      <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} pageSize={5} controls={false} />
    </div>
  );
}

function Basic() {
  const t = useText();
  const match = useMatch();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const found = ORDERS.filter((o) => match(o, query) && (!city || o.city === city)).length;
  return (
    <div className="d-stack-wide">
      <FilterBar>
        <SearchInput placeholder={t({ tr: "Sipariş ara…", en: "Search orders…" })} value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select variant="filter" label={t({ tr: "Şehir", en: "City" })} placeholder={t({ tr: "Tümü", en: "All" })} options={CITIES} value={city} onChange={setCity} clearable />
      </FilterBar>
      <p aria-live="polite" style={{ margin: 0, fontSize: 13 }}>{t({ tr: `Listelenen sipariş: ${found}`, en: `Orders listed: ${found}` })}</p>
    </div>
  );
}

function ClearOnDemand() {
  const t = useText();
  const statusOptions = useStatusOptions();
  const [statuses, setStatuses] = useState<string[]>(["pending"]);
  const found = ORDERS.filter((o) => statuses.length === 0 || statuses.includes(o.status)).length;
  return (
    <div className="d-stack-wide">
      <FilterBar onClear={statuses.length > 0 ? () => setStatuses([]) : undefined}>
        <MultiSelect label={t({ tr: "Durum", en: "Status" })} placeholder={t({ tr: "Tümü", en: "All" })} options={statusOptions} value={statuses} onChange={setStatuses} />
      </FilterBar>
      <p aria-live="polite" style={{ margin: 0, fontSize: 13 }}>{t({ tr: `Listelenen sipariş: ${found}`, en: `Orders listed: ${found}` })}</p>
    </div>
  );
}

function MoreOpen() {
  const t = useText();
  const [owner, setOwner] = useState("Elif Kaya");
  const found = ORDERS.filter((o) => !owner || o.owner === owner).length;
  return (
    <div className="d-stack-wide">
      <FilterBar
        moreOpen
        more={<Select variant="filter" label={t({ tr: "Sorumlu", en: "Owner" })} placeholder={t({ tr: "Tümü", en: "All" })} options={OWNERS} value={owner} onChange={setOwner} clearable />}
      >
        <SearchInput placeholder={t({ tr: "Sipariş ara…", en: "Search orders…" })} />
      </FilterBar>
      <p aria-live="polite" style={{ margin: 0, fontSize: 13 }}>{t({ tr: `Listelenen sipariş: ${found}`, en: `Orders listed: ${found}` })}</p>
    </div>
  );
}

function Quick() {
  const t = useText();
  const lang = useLang();
  const [status, setStatus] = useState<OrderStatus | null>("open");
  const rows = status ? ORDERS.filter((o) => o.status === status) : ORDERS;
  const total = rows.reduce((sum, o) => sum + o.amount, 0);
  return (
    <div className="d-stack-wide">
      <FilterBar onClear={status ? () => setStatus(null) : undefined}>
        <ChipGroup aria-label={t({ tr: "Sipariş durumu", en: "Order status" })}>
          {STATUSES.map((value) => (
            <Chip key={value} active={status === value} count={ORDERS.filter((o) => o.status === value).length} onClick={() => setStatus(status === value ? null : value)}>
              {t(STATUS_LABEL[value])}
            </Chip>
          ))}
        </ChipGroup>
      </FilterBar>
      <p aria-live="polite" style={{ margin: 0, fontSize: 13 }}>{t({ tr: `Sipariş: ${rows.length}, toplam ${money(total, lang)}`, en: `Orders: ${rows.length}, total ${money(total, lang)}` })}</p>
    </div>
  );
}

export default definePage({
  summary: { tr: "Bir listeyi daraltan filtreleri tek kutuda toplar. Sık kullanılanlar görünür kalır, seyrek olanlar katlanır ve hepsi tek düğmeyle temizlenir.", en: "Gathers the filters that narrow a list into one box. Common ones stay visible, rare ones fold away and a single button clears them all." },
  imports: 'import { FilterBar } from "btui";',
  hero: {
    Demo: Hero,
    block: true,
    code: `const [query, setQuery] = useState("");
const [city, setCity] = useState("");
const [statuses, setStatuses] = useState<string[]>([]);
const [owner, setOwner] = useState("");
const [minimum, setMinimum] = useState<number | null>(null);

const active = query !== "" || city !== "" || statuses.length > 0 || owner !== "" || minimum !== null;
const clear = () => {
  setQuery("");
  setCity("");
  setStatuses([]);
  setOwner("");
  setMinimum(null);
};

<FilterBar
  onClear={active ? clear : undefined}
  more={
    <>
      <Select variant="filter" label="Owner" placeholder="All" options={owners} value={owner} onChange={setOwner} clearable />
      <div style={{ width: 180 }}>
        <NumberInput aria-label="Minimum amount" value={minimum} onChange={setMinimum} min={0} step={5000} hideSteppers format={{ style: "currency", currency: "TRY", maximumFractionDigits: 0 }} />
      </div>
    </>
  }
>
  <SearchInput placeholder="Order number or customer…" value={query} onChange={(e) => setQuery(e.target.value)} />
  <Select variant="filter" label="City" placeholder="All" options={cities} value={city} onChange={setCity} clearable />
  <MultiSelect label="Status" placeholder="All" options={statusOptions} value={statuses} onChange={setStatuses} />
</FilterBar>
<DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} pageSize={5} controls={false} />`,
  },
  use: {
    do: [
      { tr: "Sipariş, fatura ya da müşteri listelerinin üstünde birkaç ölçütle filtreleme", en: "Filtering order, invoice or customer lists by a few criteria" },
      { tr: "Seyrek kullanılan ölçütleri `more` altına alıp ilk görünümü sade tutma", en: "Keeping the first view simple by moving rare criteria into `more`" },
      { tr: "Filtre etkinken `onClear` ile tek hamlede başlangıca dönme", en: "Returning to the start in one step with `onClear` while a filter is on" },
    ],
    dont: [
      { tr: "Kayıt oluşturma ya da düzenleme formları; `Field` ile kurulan formlar bu iş içindir", en: "Forms that create or edit records; forms built with `Field` do that job" },
      { tr: "Tek bir arama kutusu; yalnız `SearchInput` yeterlidir", en: "A single search box; `SearchInput` alone is enough" },
      { tr: "Her zaman görünen temizleme düğmesi; `onClear` verince düğme çizilir, filtre yoksa vermeyin", en: "A clear button that is always there; passing `onClear` draws it, so leave it out when no filter is on" },
    ],
  },
  anatomy: `<FilterBar more={<Select variant="filter" … />} onClear={clear}>
  <SearchInput … />
  <Select variant="filter" … />
  <MultiSelect … />
</FilterBar>`,
  examples: [
    {
      id: "basic",
      title: { tr: "Temel kullanım", en: "Basic use" },
      body: { tr: "`FilterBar` yalnız yerleşimi verir, filtreleme mantığı sizindir. Çocuklar sarmalanan bir satıra dizilir. `Select` için `variant=\"filter\"` kullanın: seçilen değer kutuyu doldurur ve `label` önek olur. Listeyi kendiniz filtrelersiniz; sunucuya istek göndermek de aynı şekilde çalışır.", en: "`FilterBar` only provides the layout; the filtering logic is yours. Children sit in a wrapping row. Use `variant=\"filter\"` on `Select`: a chosen value fills the box and `label` becomes a prefix. You filter the list yourself, and sending a request to the server works the same way." },
      example: { Demo: Basic, block: true, code: `const [query, setQuery] = useState("");
const [city, setCity] = useState("");
const found = orders.filter((o) => o.no.includes(query) && (!city || o.city === city)).length;

<FilterBar>
  <SearchInput placeholder="Search orders…" value={query} onChange={(e) => setQuery(e.target.value)} />
  <Select variant="filter" label="City" placeholder="All" options={cities} value={city} onChange={setCity} clearable />
</FilterBar>
<p aria-live="polite">Orders listed: {found}</p>` },
    },
    {
      id: "clear",
      title: { tr: "Temizleme", en: "Clearing" },
      body: { tr: "`onClear` verildiğinde düğme çizilir, verilmediğinde çizilmez. Düğmenin yalnız gerekli olduğunda görünmesi için değeri koşula bağlayın. Metin yerelleştirme dosyasındaki `clearFilters` değerinden gelir.", en: "With `onClear` the button is drawn, without it the button is not. Tie the value to a condition so it appears only when needed. The text comes from `clearFilters` in the locale." },
      example: { Demo: ClearOnDemand, block: true, code: `const [statuses, setStatuses] = useState<string[]>(["pending"]);

<FilterBar onClear={statuses.length > 0 ? () => setStatuses([]) : undefined}>
  <MultiSelect label="Status" placeholder="All" options={statusOptions} value={statuses} onChange={setStatuses} />
</FilterBar>` },
    },
    {
      id: "more-open",
      title: { tr: "Açık gelen ek filtreler", en: "Extra filters shown open" },
      body: { tr: "`moreOpen` katlanan alanın `open` özniteliğini belirler. Adresten gelen bir filtre katlı alandaysa sayfayı açık başlatmak için kullanın; yoksa kullanıcı etkin filtreyi göremez. Kullanıcı alanı yine açıp kapatabilir, ancak bu değişiklik size bildirilmez.", en: "`moreOpen` sets the `open` attribute of the folded area. Use it to start open when a filter from the URL lives there; otherwise people cannot see the active filter. Users can still fold the area, but that change is not reported back to you." },
      example: { Demo: MoreOpen, block: true, code: `const [owner, setOwner] = useState("Elif Kaya");

<FilterBar
  moreOpen
  more={<Select variant="filter" label="Owner" placeholder="All" options={owners} value={owner} onChange={setOwner} clearable />}
>
  <SearchInput placeholder="Search orders…" />
</FilterBar>` },
    },
    {
      id: "quick",
      title: { tr: "Hızlı filtreler", en: "Quick filters" },
      body: { tr: "Az sayıda sabit değer için açılır liste yerine `Chip` daha hızlıdır, çünkü seçenekler ve kayıt sayıları tek bakışta görünür. Etkin olana yeniden basmak filtreyi kaldırır.", en: "For a few fixed values, a `Chip` is quicker than a dropdown, because the options and their record counts are visible at once. Pressing the active one again removes the filter." },
      example: { Demo: Quick, block: true, code: `const [status, setStatus] = useState<OrderStatus | null>("open");

<FilterBar onClear={status ? () => setStatus(null) : undefined}>
  <ChipGroup aria-label="Order status">
    {statuses.map((value) => (
      <Chip key={value} active={status === value} count={countOf(value)} onClick={() => setStatus(status === value ? null : value)}>
        {labels[value]}
      </Chip>
    ))}
  </ChipGroup>
</FilterBar>` },
    },
  ],
  a11y: [
    { tr: "Ek filtreler yerel `details` ve `summary` ile çizilir; aç kapat davranışı klavye ve ekran okuyucu ile hazır çalışır.", en: "Extra filters use native `details` and `summary`, so folding works with keyboards and screen readers out of the box." },
    { tr: "Temizleme gerçek bir `button` öğesidir, metni yerelleştirme dosyasından gelir.", en: "Clearing is a real `button`, and its text comes from the locale." },
    { tr: "Sonuç sayısı değiştiğinde ekran okuyucu fark etmez; sayıyı `aria-live=\"polite\"` taşıyan bir öğede gösterin.", en: "Screen readers do not notice a changed result count on their own, so show it in an element with `aria-live=\"polite\"`." },
    { tr: "Her denetime ad verin. `NumberInput` gibi görünür etiketi olmayanlarda `aria-label` gerekir.", en: "Name every control. Those without a visible label, such as `NumberInput`, need an `aria-label`." },
  ],
  keyboard: [
    ["Tab", { tr: "Filtreler, ek filtre başlığı ve temizleme düğmesi arasında ilerler", en: "Moves through the filters, the extra filters summary and the clear button" }],
    ["Enter", { tr: "Ek filtreleri açıp kapatır ya da temizleme düğmesini çalıştırır", en: "Folds the extra filters or presses the clear button" }],
    ["Space", { tr: "Ek filtreleri açıp kapatır ya da temizleme düğmesini çalıştırır", en: "Folds the extra filters or presses the clear button" }],
  ],
  api: [
    {
      name: "FilterBar",
      props: [
        { name: "children", type: "ReactNode", required: true, description: { tr: "Her zaman görünen filtreler", en: "Filters that are always visible" } },
        { name: "more", type: "ReactNode", description: { tr: "\"Daha fazla filtre\" altında katlanan filtreler", en: "Filters folded under \"More filters\"" } },
        { name: "moreOpen", type: "boolean", description: { tr: "Katlanan alanın `open` özniteliği", en: "The `open` attribute of the folded area" } },
        { name: "onClear", type: "() => void", description: { tr: "Verildiğinde \"Filtreleri temizle\" düğmesi çizilir", en: "When passed, the \"Clear filters\" button is drawn" } },
        { name: "className", type: "string", description: { tr: "Kök öğeye eklenir", en: "Added to the root element" } },
      ],
    },
  ],
  styling: [
    { name: "data-filled", kind: "data", description: { tr: "`filter` görünümlü `Select` değer taşırken bulunur", en: "Present on a `filter` `Select` that holds a value" } },
    { name: "--bt-surface", kind: "var", description: { tr: "Kutunun zemini", en: "Box background" } },
    { name: "--bt-border", kind: "var", description: { tr: "Kutunun kenarı", en: "Box border" } },
    { name: "--bt-muted", kind: "var", description: { tr: "Ek filtre başlığı ve temizleme metni", en: "Extra filters summary and clear text" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Dolu `Select` zemini", en: "Background of a filled `Select`" } },
  ],
  related: ["data-table", "select", "multi-select", "search-input", "chip"],
});
