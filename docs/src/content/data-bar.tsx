import { useMemo } from "react";
import { Badge, DataBar, DataTable, type Column } from "btui";
import { CUSTOMERS, money, ORDERS, type Order } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const CUSTOMER_ROWS = CUSTOMERS.map((customer, i) => {
  const orders = ORDERS.filter((o) => o.customer === customer);
  return { id: i + 1, customer, count: orders.length, amount: orders.reduce((sum, o) => sum + o.amount, 0) };
});
const LARGEST = Math.max(...CUSTOMER_ROWS.map((c) => c.amount));

type Owner = { id: number; name: string; target: number; actual: number };

const OWNERS: Owner[] = [
  { id: 1, name: "Ada Yılmaz", target: 180, actual: 164 },
  { id: 2, name: "Can Demir", target: 150, actual: 171 },
  { id: 3, name: "Elif Kaya", target: 160, actual: 96 },
  { id: 4, name: "Mert Aydın", target: 140, actual: 118 },
];

function Hero() {
  const lang = useLang();
  return (
    <div style={{ display: "grid", gap: 6, width: "100%", maxWidth: 360 }}>
      {CUSTOMER_ROWS.slice(0, 4).map((c) => <DataBar key={c.id} value={c.amount} max={LARGEST}>{c.customer}: {money(c.amount, lang)}</DataBar>)}
    </div>
  );
}

function InColumn() {
  const t = useText();
  const lang = useLang();
  const columns: Column<(typeof CUSTOMER_ROWS)[number]>[] = [
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "count", header: t({ tr: "Sipariş", en: "Orders" }), align: "right" },
    {
      key: "amount",
      header: t({ tr: "Toplam tutar", en: "Total amount" }),
      align: "right",
      width: 260,
      cell: (c) => <DataBar value={c.amount} max={LARGEST}>{money(c.amount, lang)}</DataBar>,
    },
  ];
  return <DataTable controls={false} columns={columns} rows={CUSTOMER_ROWS} getRowKey={(c) => c.id} defaultSort={{ key: "amount", direction: "desc" }} />;
}

function WithPages() {
  const t = useText();
  const lang = useLang();
  const peak = useMemo(() => Math.max(...ORDERS.map((o) => o.amount)), []);
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), width: 110, cell: (o) => <span className="bt-mono">{o.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", width: 220, cell: (o) => <DataBar value={o.amount} max={peak} slot={3}>{money(o.amount, lang)}</DataBar> },
  ];
  return <DataTable controls={false} columns={columns} rows={ORDERS} getRowKey={(o) => o.id} pageSize={5} defaultSort={{ key: "amount", direction: "desc" }} />;
}

function Target() {
  const t = useText();
  const lang = useLang();
  const columns: Column<Owner>[] = [
    { key: "name", header: t({ tr: "Satış temsilcisi", en: "Sales rep" }) },
    { key: "target", header: t({ tr: "Hedef", en: "Target" }), align: "right" },
    {
      key: "rate",
      header: t({ tr: "Hedefin yüzdesi", en: "Share of target" }),
      align: "right",
      width: 240,
      sortValue: (o) => o.actual / o.target,
      cell: (o) => <DataBar value={o.actual} max={o.target}>{new Intl.NumberFormat(lang, { style: "percent" }).format(o.actual / o.target)}</DataBar>,
    },
    { key: "state", header: t({ tr: "Durum", en: "Status" }), cell: (o) => (o.actual >= o.target ? <Badge tone="ok">{t({ tr: "Hedefte", en: "On target" })}</Badge> : null) },
  ];
  return <DataTable controls={false} columns={columns} rows={OWNERS} getRowKey={(o) => o.id} />;
}

function Plain() {
  return (
    <div style={{ display: "grid", gap: 6, width: "100%", maxWidth: 240 }}>
      <DataBar value={72} max={100} />
      <DataBar value={140} max={100} slot={2} />
      <DataBar value={0} max={100} slot={3} />
    </div>
  );
}

export default definePage({
  summary: { tr: "Bir sayının arkasına değeriyle orantılı bir çubuk çizer. Tablo sütununda satırları karşılaştırmanın en hafif yoludur; sayı okunur kalır, satır boyu değişmez.", en: "Draws a bar behind a number in proportion to its value. It is the lightest way to compare rows in a table column; the number stays readable and the row height does not change." },
  imports: 'import { DataBar } from "btui";',
  hero: {
    Demo: Hero,
    block: true,
    code: `<DataBar value={amount} max={largest}>{customer}: {money(amount, lang)}</DataBar>`,
  },
  use: {
    do: [
      { tr: "Tablo sütununda satırları büyüklükle karşılaştırmak: tutar, adet, oran", en: "Comparing rows by size in a table column: amount, count, rate" },
      { tr: "Sıralı listelerde farkın ne kadar büyük olduğunu göstermek", en: "Showing how large the gaps are in a ranked list" },
      { tr: "Sayıyı `children` ile yazmak; ayrı bir tablo görünümü yoktur, değer hücrenin içinde okunur", en: "Writing the number through `children`; there is no separate table view, the value reads inside the cell" },
      { tr: "Tüm satırlar için aynı `max`; `slot` ile rengi ölçüye bağlayın", en: "One `max` for every row; tie the colour to the measure with `slot`" },
    ],
    dont: [
      { tr: "Sayfadan sayfaya değişen `max`; aynı uzunluk farklı değer anlatır, tüm kayıtların en büyüğünü verin", en: "A `max` that changes per page; the same length then means another value, so pass the largest of all records" },
      { tr: "Zaman içindeki değişim; eğilim için `Sparkline` kullanın", en: "Change over time; use `Sparkline` for a trend" },
      { tr: "Eksi değerler; çubuk sıfırda durur, kâr ve zarar için `BarChart` seçin", en: "Negative values; the bar stops at zero, so pick `BarChart` for profit and loss" },
      { tr: "Bir sütunda iki ölçü; çift eksen gibi yanıltır, her ölçüye kendi sütununu verin", en: "Two measures in one column; it misleads like a dual axis, so give each measure its own column" },
      { tr: "Tek bir işin ilerlemesi; bunun için `Progress` vardır", en: "The progress of a single job; that is what `Progress` is for" },
    ],
  },
  anatomy: `<DataBar value={amount} max={largest} slot={1}>
  {money(amount, lang)}
</DataBar>`,
  examples: [
    {
      id: "in-column",
      title: { tr: "DataTable sütununda", en: "In a DataTable column" },
      body: { tr: "`cell` içinde `DataBar` çizin. Sıralama ve dışa aktarma satırın ham `amount` alanını okumaya devam eder, görsel yalnız hücrededir. `max` için tüm satırların en büyüğünü hesaplayın. Sütuna `width` verin; çubuk için yer kalsın. Başlığa basıp sıralayın.", en: "Draw `DataBar` inside `cell`. Sorting and export keep reading the raw `amount` field, and the visual stays in the cell. Work out `max` as the largest of all rows. Give the column a `width` so the bar has room. Press the header to sort." },
      example: {
        Demo: InColumn,
        block: true,
        code: `const largest = Math.max(...rows.map((c) => c.amount));

const columns: Column<CustomerRow>[] = [
  { key: "customer", header: "Customer" },
  { key: "count", header: "Orders", align: "right" },
  {
    key: "amount",
    header: "Total amount",
    align: "right",
    width: 260,
    cell: (c) => <DataBar value={c.amount} max={largest}>{money(c.amount, lang)}</DataBar>,
  },
];

<DataTable columns={columns} rows={rows} getRowKey={(c) => c.id} defaultSort={{ key: "amount", direction: "desc" }} />`,
      },
    },
    {
      id: "paging",
      title: { tr: "Sayfalı tablo", en: "Paged table" },
      body: { tr: "`max` görünen sayfadan değil, tüm kayıtlardan hesaplanmalıdır. Aksi hâlde her sayfanın en büyüğü tam çubuk olur ve sayfalar karşılaştırılamaz. Sunucu kipinde en büyük değeri yanıtla birlikte isteyin.", en: "`max` must come from all records, not the visible page. Otherwise the largest on each page draws a full bar and pages cannot be compared. In server mode, ask for the largest value along with the response." },
      example: {
        Demo: WithPages,
        block: true,
        code: `const peak = Math.max(...orders.map((o) => o.amount));

{
  key: "amount",
  header: "Amount",
  align: "right",
  width: 220,
  cell: (o) => <DataBar value={o.amount} max={peak} slot={3}>{money(o.amount, lang)}</DataBar>,
}

<DataTable columns={columns} rows={orders} getRowKey={(o) => o.id} pageSize={5} />`,
      },
    },
    {
      id: "target",
      title: { tr: "Hedefe göre", en: "Against a target" },
      body: { tr: "`max` her satırda farklı olabilir: burada her temsilci kendi hedefine göre ölçülür, bu yüzden uzunluk tutarı değil oranı anlatır. `sortValue` oranla sıralar. Hedefi geçen temsilci için çubuk tam dolar, oran metni ve `Badge` farkı söyler; iyi ya da kötüyü renkle anlatmayın.", en: "`max` can differ per row: here each rep is measured against their own target, so the length tells the rate rather than the amount. `sortValue` sorts by that rate. For a rep past the target the bar fills up, and the rate and a `Badge` tell the difference; do not use colour for good or bad." },
      example: {
        Demo: Target,
        block: true,
        code: `{
  key: "rate",
  header: "Share of target",
  align: "right",
  width: 240,
  sortValue: (o) => o.actual / o.target,
  cell: (o) => (
    <DataBar value={o.actual} max={o.target}>
      {new Intl.NumberFormat(lang, { style: "percent" }).format(o.actual / o.target)}
    </DataBar>
  ),
}`,
      },
    },
    {
      id: "bounds",
      title: { tr: "Sınırlar ve varsayılan metin", en: "Bounds and default text" },
      body: { tr: "`children` verilmezse `value` düz sayı olarak yazılır. Çubuk yüzde 0 ile 100 arasında kalır: `max` aşılırsa tam dolar, eksi değerde ya da `max` sıfırken çizilmez. Çubuk yüzde 22 opaklıktadır, sayı her zaman okunur kalır.", en: "Without `children`, `value` is written as a plain number. The bar stays between 0 and 100 percent: past `max` it fills up, and it draws nothing for a negative value or a zero `max`. The bar sits at 22 percent opacity, so the number always reads." },
      example: {
        Demo: Plain,
        block: true,
        code: `<DataBar value={72} max={100} />
<DataBar value={140} max={100} slot={2} />
<DataBar value={0} max={100} slot={3} />`,
      },
    },
  ],
  a11y: [
    { tr: "Çubuk süstür ve yardımcı teknolojiye değer bildirmez; okunan şey içindeki metindir. Bu yüzden sayıyı `children` ile yazın.", en: "The bar is decoration and reports no value to assistive technology; what is read is the text inside. So write the number through `children`." },
    { tr: "Tablo görünümü ve klavye gezintisi yoktur, odak almaz. Tablo hücresindeki metin zaten erişilebilir veridir.", en: "There is no table view or keyboard navigation and it takes no focus. The text in the table cell is already the accessible data." },
    { tr: "Rengi tek başına anlam için kullanmayın; hedefin altında kalanı metinle de söyleyin.", en: "Do not use colour alone for meaning; state in words who is below target as well." },
  ],
  api: [
    {
      name: "DataBar",
      description: { tr: "Ref ve yerel öznitelikler iletilmez; `className` da yoktur.", en: "The ref and native attributes are not forwarded, and there is no `className`." },
      props: [
        { name: "value", type: "number", required: true, description: { tr: "Çizilecek değer", en: "The value to draw" } },
        { name: "max", type: "number", required: true, description: { tr: "Tam çubuğa karşılık gelen değer. Sıfır ya da altıysa çubuk çizilmez", en: "The value of a full bar. At zero or below no bar is drawn" } },
        { name: "children", type: "ReactNode", default: "value", description: { tr: "Çubuğun önündeki metin, genelde biçimli sayı", en: "Text in front of the bar, usually a formatted number" } },
        { name: "slot", type: "number", default: "1", description: { tr: "1 ile 8 arası renk yuvası", en: "Colour slot from 1 to 8" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-chart-1 ... --bt-chart-8", kind: "var", description: { tr: "`slot` ile seçilen çubuk rengi", en: "The bar colour picked with `slot`" } },
  ],
  related: ["data-table", "data-grid", "sparkline", "bar-chart", "progress"],
});
