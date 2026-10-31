import { useMemo, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { Badge, IconButton, SearchInput, Select } from "btui";
import { CITIES, CUSTOMERS, ORDERS, STATUS_LABEL, STATUS_TONE } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Live() {
  const t = useText();
  const lang = useLang();
  const [query, setQuery] = useState("");
  const q = query.trim().toLocaleLowerCase(lang);
  const rows = ORDERS.filter((o) => o.no.toLocaleLowerCase(lang).includes(q) || o.customer.toLocaleLowerCase(lang).includes(q)).slice(0, 4);
  return (
    <div className="d-stack">
      <SearchInput block value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t({ tr: "Sipariş no ya da müşteri ara", en: "Search order no or customer" })} />
      {rows.length === 0 ? <span>{t({ tr: "Eşleşen sipariş yok", en: "No matching orders" })}</span> : rows.map((o) => (
        <div key={o.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span>{o.no} · {o.customer}</span>
          <Badge tone={STATUS_TONE[o.status]}>{t(STATUS_LABEL[o.status])}</Badge>
        </div>
      ))}
    </div>
  );
}

function DefaultText() {
  return <SearchInput />;
}

function Block() {
  const t = useText();
  return <SearchInput block placeholder={t({ tr: "Fatura, müşteri ya da vergi numarası ara", en: "Search invoices, customers or tax numbers" })} />;
}

function Toolbar() {
  const t = useText();
  const lang = useLang();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const count = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    return ORDERS.filter((o) => (!city || o.city === city) && o.customer.toLocaleLowerCase(lang).includes(q)).length;
  }, [query, city, lang]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t({ tr: "Müşteri ara", en: "Search customers" })} />
      <Select variant="filter" label={t({ tr: "Şehir", en: "City" })} value={city} onChange={setCity} options={CITIES} clearable placeholder={t({ tr: "Tümü", en: "All" })} />
      <Badge tone="info">{t({ tr: `${count} sipariş`, en: `${count} orders` })}</Badge>
    </div>
  );
}

function Clearable() {
  const t = useText();
  const [query, setQuery] = useState(CUSTOMERS[0]);
  return (
    <>
      <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t({ tr: "Müşteri ara", en: "Search customers" })} />
      {query ? <IconButton size="sm" label={t({ tr: "Aramayı temizle", en: "Clear the search" })} onClick={() => setQuery("")}><IconX size={14} /></IconButton> : null}
    </>
  );
}

function Label() {
  const t = useText();
  return <SearchInput aria-label={t({ tr: "Fatura listesinde ara", en: "Search the invoice list" })} placeholder={t({ tr: "Örn. FT-2026", en: "e.g. FT-2026" })} />;
}

export default definePage({
  summary: { tr: "Bir listeyi ya da tabloyu daraltmak için arama kutusu. Sonucu sizin filtrelemeniz gerekir; bileşen yalnız metni toplar.", en: "A search box for narrowing a list or a table. It only collects the text; the filtering is yours to do." },
  imports: 'import { SearchInput } from "btui";',
  hero: {
    Demo: Live,
    code: `const [query, setQuery] = useState("");
const q = query.trim().toLocaleLowerCase("tr");
const rows = orders.filter((o) => o.customer.toLocaleLowerCase("tr").includes(q));

<SearchInput block value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order no or customer" />`,
  },
  use: {
    do: [
      { tr: "Tablo ve liste üstünde hızlı daraltma", en: "Quick narrowing above tables and lists" },
      { tr: "Filtre çubuğunda serbest metin alanı", en: "The free text slot in a filter bar" },
      { tr: "Sonuçların yazdıkça güncellendiği ekranlar", en: "Screens where results update while typing" },
    ],
    dont: [
      { tr: "Form alanları; değer forma ait bir bilgiyse `Input` kullanın", en: "Form fields; if the value belongs to a form, use `Input`" },
      { tr: "`Field` içinde; etiket kutuya bağlanmaz, `aria-label` kullanın", en: "Inside `Field`; the label does not reach the box, use `aria-label`" },
      { tr: "Listeden tek bir değer seçmek; `Select` zaten arama kutusu getirir", en: "Picking one value from a list; `Select` already brings a search box" },
    ],
  },
  examples: [
    {
      id: "default-text",
      title: { tr: "Varsayılan metin", en: "Default text" },
      body: { tr: "`placeholder` vermezseniz dil dosyasındaki `search` metni görünür ve erişilebilir ad da odur. Ancak neyin arandığını söylemek daha iyidir.", en: "Without `placeholder`, the `search` text from the locale shows and also serves as the accessible name. Saying what is being searched is still better." },
      example: { Demo: DefaultText, code: `<SearchInput />` },
    },
    {
      id: "block",
      title: { tr: "Tam genişlik", en: "Full width" },
      body: { tr: "Varsayılan genişlik 220px'tir. `block` kutuyu kabın tamamına yayar; yan panel ve kart başlıklarında işe yarar.", en: "The default width is 220px. `block` stretches the box across its container, which helps in side panels and card headers." },
      example: { Demo: Block, block: true, code: `<SearchInput block placeholder="Search invoices, customers or tax numbers" />` },
    },
    {
      id: "toolbar",
      title: { tr: "Filtrelerle birlikte", en: "With filters" },
      body: { tr: "`Select` ile aynı 32px yüksekliği paylaşır, aynı sıraya rahatça oturur. Sonuç sayısını yanında gösterin ki kullanıcı neyi daralttığını görsün.", en: "It shares the 32px height of `Select`, so they sit together on one row. Show the result count beside them so people see what they narrowed." },
      example: {
        Demo: Toolbar,
        code: `<SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers" />
<Select variant="filter" label="City" value={city} onChange={setCity} options={CITIES} clearable placeholder="All" />
<Badge tone="info">{count} orders</Badge>`,
      },
    },
    {
      id: "clear",
      title: { tr: "Temizleme düğmesi", en: "Clear button" },
      body: { tr: "Bileşenin kendi temizleme düğmesi yoktur. Gerektiğinde yanına `IconButton` koyun. Bazı tarayıcılar `type=\"search\"` alanına kendi çarpı işaretini ekler.", en: "The component has no clear button of its own. Put an `IconButton` beside it when needed. Some browsers add their own cross to `type=\"search\"` fields." },
      example: {
        Demo: Clearable,
        code: `<SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers" />
{query ? <IconButton size="sm" label="Clear the search" onClick={() => setQuery("")}><IconX size={14} /></IconButton> : null}`,
      },
    },
    {
      id: "label",
      title: { tr: "Erişilebilir ad", en: "Accessible name" },
      body: { tr: "`aria-label` verilirse o kullanılır, verilmezse `placeholder` ad olur. Yer tutucu bir örnekse ayrıca `aria-label` yazın.", en: "`aria-label` is used when given, otherwise `placeholder` becomes the name. If the placeholder is only an example, add an `aria-label`." },
      example: { Demo: Label, code: `<SearchInput aria-label="Search the invoice list" placeholder="e.g. FT-2026" />` },
    },
  ],
  a11y: [
    { tr: "Gerçek bir `input type=\"search\"` çizer ve bir `label` öğesi içinde durur; kutunun herhangi bir yerine tıklamak odaklar.", en: "It renders a real `input type=\"search\"` inside a `label`, so a click anywhere on the box focuses it." },
    { tr: "Erişilebilir ad sırasıyla `aria-label`, `placeholder` ve dil dosyasındaki `search` metninden gelir.", en: "The accessible name comes from `aria-label`, then `placeholder`, then the `search` text in the locale." },
    { tr: "Sonuç sayısı yazdıkça değişiyorsa bunu `aria-live` bölgesinde duyurun; bileşen bunu yapmaz.", en: "If the result count changes while typing, announce it in an `aria-live` region; the component does not do this." },
  ],
  keyboard: [
    ["Tab", { tr: "Kutuya odaklanır", en: "Moves focus to the box" }],
    ["Escape", { tr: "Tarayıcı destekliyorsa metni temizler", en: "Clears the text, where the browser supports it" }],
    ["Enter", { tr: "Form içindeyse formu gönderir", en: "Submits the form, when inside one" }],
  ],
  api: [
    {
      name: "SearchInput",
      description: { tr: "`type` ve `size` dışındaki tüm yerel `input` öznitelikleri ve ref `input` öğesine iletilir; `value`, `onChange` ve `disabled` bunlara dahildir. `className` dıştaki `label` öğesine gider.", en: "All native `input` attributes except `type` and `size`, plus the ref, go to the `input` element, including `value`, `onChange` and `disabled`. `className` goes to the outer `label`." },
      props: [
        { name: "block", type: "boolean", default: "false", description: { tr: "Kabın genişliğini doldurur", en: "Fills its container" } },
        { name: "placeholder", type: "string", default: "locale.search", description: { tr: "Boşken görünen metin; verilmezse dil dosyasından gelir", en: "Text shown while empty; falls back to the locale" } },
        { name: "aria-label", type: "string", default: "placeholder", description: { tr: "Erişilebilir ad; verilmezse `placeholder` kullanılır", en: "Accessible name; falls back to `placeholder`" } },
        { name: "className", type: "string", description: { tr: "Dıştaki `label` öğesine eklenen sınıf", en: "Class added to the outer `label`" } },
      ],
    },
  ],
  styling: [
    { name: "data-block", kind: "data", description: { tr: "`block` açıkken dıştaki `label` üzerinde bulunur", en: "Present on the outer `label` when `block` is on" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Odaktaki kenarlık", en: "Focused border" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Odak halkası", en: "Focus ring" } },
    { name: "--bt-border", kind: "var", description: { tr: "Kenarlık", en: "Border" } },
    { name: "--bt-faint", kind: "var", description: { tr: "Yer tutucu rengi", en: "Placeholder colour" } },
  ],
  related: ["input", "select", "filter-bar", "data-table"],
});
