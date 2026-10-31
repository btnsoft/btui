import { useState } from "react";
import { Badge, Card, InfoRow, Pagination, pageRange } from "btui";
import { money, ORDERS } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const PAGE_SIZE = 4;

function Archive() {
  const t = useText();
  const [page, setPage] = useState(3);
  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
      <Pagination page={page} pageCount={12} onChange={setPage} />
      <small style={{ color: "var(--bt-muted)" }}>{t({ tr: `Fatura arşivi, sayfa ${page} / 12`, en: `Invoice archive, page ${page} of 12` })}</small>
    </div>
  );
}

function FewPages() {
  const [page, setPage] = useState(2);
  return <Pagination page={page} pageCount={5} onChange={setPage} />;
}

function ManyPages() {
  const [page, setPage] = useState(24);
  return <Pagination page={page} pageCount={48} onChange={setPage} />;
}

function ClientList() {
  const t = useText();
  const lang = useLang();
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(ORDERS.length / PAGE_SIZE);
  const rows = ORDERS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <div style={{ maxWidth: 460, margin: "0 auto" }}>
      <Card title={t({ tr: "Son siparişler", en: "Latest orders" })} subtitle={t({ tr: `${ORDERS.length} kayıt`, en: `${ORDERS.length} records` })}>
        {rows.map((o) => <InfoRow key={o.id} label={`${o.no} · ${o.customer}`}>{money(o.amount, lang)}</InfoRow>)}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
}

function Range() {
  const t = useText();
  const [page, setPage] = useState(6);
  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
      <Pagination page={page} pageCount={12} onChange={setPage} />
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4 }}>
        <small style={{ color: "var(--bt-muted)" }}>{t({ tr: "İki komşuyla:", en: "With two siblings:" })}</small>
        {pageRange(page, 12, 2).map((p, i) => <Badge key={i} tone={p === page ? "info" : "neutral"}>{p === "gap" ? "…" : p}</Badge>)}
      </div>
    </div>
  );
}

export default definePage({
  summary: { tr: "Uzun listeleri sayfalara böler. İlk ve son sayfayı, geçerli sayfanın çevresini gösterir, arasını üç noktayla kısaltır.", en: "Splits long lists into pages. Shows the first and last page and the pages around the current one, shortening the rest with an ellipsis." },
  imports: 'import { Pagination, pageRange } from "btui";',
  hero: {
    Demo: Archive,
    code: `const [page, setPage] = useState(3);

<Pagination page={page} pageCount={12} onChange={setPage} />`,
  },
  use: {
    do: [
      { tr: "`DataTable` dışında kalan listeler: kart, arşiv, arama sonucu", en: "Lists outside `DataTable`: cards, archives, search results" },
      { tr: "Kullanıcının belli bir sayfaya dönmesi gereken kayıt arşivleri", en: "Record archives where people return to a known page" },
      { tr: "Toplam sayısı bilinen sonuçlar", en: "Results with a known total" },
    ],
    dont: [
      { tr: "`DataTable` içinde; `pageSize` verince sayfalama hazır gelir", en: "Inside `DataTable`; `pageSize` brings paging with it" },
      { tr: "Toplamı bilinmeyen akışlar; \"Daha fazla yükle\" düğmesi daha dürüsttür", en: "Feeds with an unknown total; a Load more button is more honest" },
      { tr: "Tek sayfalık sonuçlar; bu durumda bileşeni hiç göstermeyin", en: "Single page results; do not show the component at all" },
    ],
  },
  anatomy: `<Pagination page={3} pageCount={12} onChange={setPage} />

‹  1  2  [3]  4  …  12  ›`,
  examples: [
    {
      id: "few-pages",
      title: { tr: "Az sayfa", en: "Few pages" },
      body: { tr: "Sayfa sayısı azsa aralık boşluğu oluşmaz. İlk sayfada önceki, son sayfada sonraki düğmesi kapanır.", en: "With few pages no gap appears. Previous turns off on the first page and next on the last." },
      example: { Demo: FewPages, code: `<Pagination page={page} pageCount={5} onChange={setPage} />` },
    },
    {
      id: "many-pages",
      title: { tr: "Çok sayfa", en: "Many pages" },
      body: { tr: "Genişlik sayfa sayısından bağımsızdır: 48 sayfada da en çok yedi öğe görünür, bu yüzden dar alanlara da sığar.", en: "The width does not grow with the page count: 48 pages still show seven items at most, so it fits tight spaces too." },
      example: { Demo: ManyPages, code: `<Pagination page={page} pageCount={48} onChange={setPage} />` },
    },
    {
      id: "client-list",
      title: { tr: "Listeyle birlikte", en: "With a list" },
      body: { tr: "Bileşen veriyi dilimlemez, yalnız sayfa numarasını yönetir. Satırları `slice` ile siz ayırırsınız ve sayfa sayısını `Math.ceil` ile hesaplarsınız.", en: "The component does not slice data; it only handles the page number. Cut the rows with `slice` yourself and work out the page count with `Math.ceil`." },
      example: {
        Demo: ClientList,
        block: true,
        code: `const pageCount = Math.ceil(orders.length / PAGE_SIZE);
const rows = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

<Card title="Latest orders">
  {rows.map((o) => <InfoRow key={o.id} label={o.no}>{money(o.amount, lang)}</InfoRow>)}
  <Pagination page={page} pageCount={pageCount} onChange={setPage} />
</Card>`,
      },
    },
    {
      id: "page-range",
      title: { tr: "pageRange ile kendi sayfalayıcınız", en: "Your own pager with pageRange" },
      body: { tr: "`Pagination` komşu sayısını dışarı açmaz, hep bir komşu gösterir. Daha geniş bir dizilim gerekiyorsa `pageRange(page, pageCount, siblings)` işlevi aynı hesabı yapar: sayfa numaralarını ve boşluklar için `\"gap\"` değerini döndürür. Örneğin `pageRange(6, 12, 2)` sonucu `[1, \"gap\", 4, 5, 6, 7, 8, \"gap\", 12]` olur.", en: "`Pagination` does not expose its sibling count and always shows one. For a wider layout, `pageRange(page, pageCount, siblings)` does the same work: it returns the page numbers, with `\"gap\"` for each gap. For example, `pageRange(6, 12, 2)` gives `[1, \"gap\", 4, 5, 6, 7, 8, \"gap\", 12]`." },
      example: {
        Demo: Range,
        code: `{pageRange(page, pageCount, 2).map((p, i) => (
  <Badge key={i}>{p === "gap" ? "…" : p}</Badge>
))}`,
      },
    },
  ],
  a11y: [
    { tr: "Her sayfa gerçek bir `<button>` öğesidir; geçerli sayfa `aria-current=\"page\"` taşır.", en: "Each page is a real `<button>`, and the current page carries `aria-current=\"page\"`." },
    { tr: "Önceki ve sonraki düğmelerinin etiketi `BtuiProvider` dilinden gelir.", en: "The labels of previous and next come from the `BtuiProvider` language." },
    { tr: "Bileşen `nav` öğesi çizmez. Sayfada birden çok liste varsa `<nav aria-label=\"Fatura sayfaları\">` ile sarın.", en: "The component renders no `nav` element. With several lists on a page, wrap it in `<nav aria-label=\"Invoice pages\">`." },
    { tr: "Sayfa değişince odağı liste başlığına taşıyın; klavye kullanıcısı yeni içeriği böyle bulur.", en: "Move focus to the list heading after a page change, so keyboard users find the new content." },
  ],
  keyboard: [
    ["Tab", { tr: "Düğmeler arasında gezer, kapalı düğmeleri atlar", en: "Moves between buttons, skipping disabled ones" }],
    ["Enter", { tr: "Sayfaya gider", en: "Goes to the page" }],
    ["Space", { tr: "Sayfaya gider", en: "Goes to the page" }],
  ],
  api: [
    {
      name: "Pagination",
      description: { tr: "Denetimli bileşendir; sayfa durumunu siz tutarsınız. Yerel öznitelik ve `className` almaz.", en: "A controlled component: you keep the page state. It takes no native attributes or `className`." },
      props: [
        { name: "page", type: "number", required: true, description: { tr: "Geçerli sayfa, 1'den başlar", en: "Current page, starting at 1" } },
        { name: "pageCount", type: "number", required: true, description: { tr: "Toplam sayfa sayısı", en: "Total number of pages" } },
        { name: "onChange", type: "(page: number) => void", required: true, description: { tr: "Yeni sayfa numarasıyla çağrılır", en: "Called with the new page number" } },
      ],
    },
    {
      name: "pageRange",
      description: { tr: "`pageRange(page, pageCount, siblings)` gösterilecek öğeleri `Array<number | \"gap\">` olarak döndürür.", en: "`pageRange(page, pageCount, siblings)` returns the items to show as `Array<number | \"gap\">`." },
      props: [
        { name: "page", type: "number", required: true, description: { tr: "Geçerli sayfa", en: "Current page" } },
        { name: "pageCount", type: "number", required: true, description: { tr: "Toplam sayfa sayısı", en: "Total number of pages" } },
        { name: "siblings", type: "number", default: "1", description: { tr: "Geçerli sayfanın iki yanında gösterilecek sayfa sayısı", en: "Pages to show on each side of the current one" } },
      ],
    },
  ],
  styling: [
    { name: "data-active", kind: "data", description: { tr: "Geçerli sayfanın `.bt-page` düğmesinde bulunur", en: "On the `.bt-page` button of the current page" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "Geçerli sayfa zemini", en: "Current page background" } },
    { name: "--bt-on-accent", kind: "var", description: { tr: "Geçerli sayfa metni", en: "Current page text" } },
    { name: "--bt-faint", kind: "var", description: { tr: "Üç nokta rengi", en: "Ellipsis colour" } },
  ],
  related: ["data-table", "card", "button-group"],
});
