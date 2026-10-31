import { DataTable, Kpi, KpiGrid, Sparkline, type Column } from "btui";
import { money } from "../lib/data";
import { useLang, useText, type Text } from "../lib/i18n";
import { definePage } from "../lib/schema";

const REVENUE = [182, 204, 168, 243, 221, 276, 251, 298];
const ORDERS_WEEK = [64, 71, 69, 58, 62, 55, 49, 47];
const COLLECTED = [91, 93, 92, 94, 96, 95, 97, 98];

type Product = { id: number; sku: string; name: Text; stock: number; weekly: number[] };

const PRODUCTS: Product[] = [
  { id: 1, sku: "UR-1042", name: { tr: "Termal rulo", en: "Thermal roll" }, stock: 1840, weekly: [120, 132, 128, 141, 150, 147, 163, 171] },
  { id: 2, sku: "UR-1187", name: { tr: "Etiket yazıcı", en: "Label printer" }, stock: 212, weekly: [34, 31, 36, 29, 27, 25, 22, 19] },
  { id: 3, sku: "UR-1203", name: { tr: "Koli bandı", en: "Packing tape" }, stock: 6420, weekly: [510, 498, 523, 515, 507, 519, 526, 512] },
  { id: 4, sku: "UR-1311", name: { tr: "Palet örtüsü", en: "Pallet cover" }, stock: 388, weekly: [44, 52, 41, 63, 38, 71, 47, 82] },
];

function Inline() {
  const t = useText();
  return (
    <p style={{ margin: 0 }}>
      {t({ tr: "Haftalık ciro", en: "Weekly revenue" })} <Sparkline values={REVENUE} label={t({ tr: "Haftalık ciro son sekiz haftada arttı", en: "Weekly revenue rose over the last eight weeks" })} /> {t({ tr: "yükselişte, sipariş adedi", en: "is rising, while order count" })} <Sparkline values={ORDERS_WEEK} slot={2} label={t({ tr: "Sipariş adedi son sekiz haftada azaldı", en: "Order count fell over the last eight weeks" })} /> {t({ tr: "geriliyor.", en: "is falling." })}
    </p>
  );
}

function InKpi() {
  const t = useText();
  const lang = useLang();
  return (
    <KpiGrid>
      <Kpi
        label={t({ tr: "Haftalık ciro", en: "Weekly revenue" })}
        value={money(298000, lang)}
        trend={{ value: t({ tr: "%19", en: "19%" }), direction: "up" }}
        note={<Sparkline values={REVENUE} area width={84} height={18} label={t({ tr: "Son sekiz haftada 182 binden 298 bine çıktı", en: "Rose from 182k to 298k over eight weeks" })} />}
      />
      <Kpi
        label={t({ tr: "Yeni sipariş", en: "New orders" })}
        value={47}
        trend={{ value: t({ tr: "%4", en: "4%" }), direction: "down" }}
        note={<Sparkline values={ORDERS_WEEK} slot={2} area width={84} height={18} label={t({ tr: "Son sekiz haftada 64 adetten 47 adede indi", en: "Fell from 64 to 47 over eight weeks" })} />}
      />
      <Kpi
        label={t({ tr: "Tahsilat oranı", en: "Collection rate" })}
        value={t({ tr: "%98", en: "98%" })}
        note={<Sparkline values={COLLECTED} slot={3} area width={84} height={18} label={t({ tr: "Son sekiz haftada yüzde 91'den 98'e çıktı", en: "Rose from 91 to 98 percent over eight weeks" })} />}
      />
    </KpiGrid>
  );
}

function InTable() {
  const t = useText();
  const lang = useLang();
  const columns: Column<Product>[] = [
    { key: "sku", header: t({ tr: "Stok kodu", en: "SKU" }), cell: (p) => <span className="bt-mono">{p.sku}</span> },
    { key: "name", header: t({ tr: "Ürün", en: "Product" }), value: (p) => t(p.name) },
    { key: "stock", header: t({ tr: "Stok", en: "Stock" }), align: "right", cell: (p) => p.stock.toLocaleString(lang) },
    {
      key: "weekly",
      header: t({ tr: "Son 8 hafta", en: "Last 8 weeks" }),
      align: "right",
      sortValue: (p) => p.weekly[p.weekly.length - 1] - p.weekly[0],
      cell: (p) => <Sparkline values={p.weekly} width={110} height={22} label={t({ tr: `${t(p.name)}: son sekiz haftada ${p.weekly[0]} adetten ${p.weekly[p.weekly.length - 1]} adede`, en: `${t(p.name)}: from ${p.weekly[0]} to ${p.weekly[p.weekly.length - 1]} units over eight weeks` })} />,
    },
  ];
  return <DataTable controls={false} columns={columns} rows={PRODUCTS} getRowKey={(p) => p.id} />;
}

function Sizes() {
  return (
    <>
      <Sparkline values={REVENUE} width={64} height={16} />
      <Sparkline values={REVENUE} />
      <Sparkline values={REVENUE} width={160} height={36} area />
    </>
  );
}

function Slots() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => <Sparkline key={slot} values={COLLECTED} slot={slot} width={72} />)}
    </>
  );
}

export default definePage({
  summary: { tr: "Sözcük büyüklüğünde bir eğilim çizgisi. Eksensiz ve ipucusuz çizilir; tablo hücresine, Kpi kartına ya da cümle içine sığar. Son nokta bir işaretle vurgulanır.", en: "A word-sized trend line. It draws with no axis and no hint, so it fits a table cell, a Kpi card or a sentence. The last point carries a mark." },
  imports: 'import { Sparkline, type SparklineProps } from "btui";',
  hero: {
    Demo: Inline,
    block: true,
    code: `<p>
  Weekly revenue <Sparkline values={[182, 204, 168, 243, 221, 276, 251, 298]} label="Weekly revenue rose over the last eight weeks" /> is rising,
  while order count <Sparkline values={[64, 71, 69, 58, 62, 55, 49, 47]} slot={2} label="Order count fell over the last eight weeks" /> is falling.
</p>`,
  },
  use: {
    do: [
      { tr: "Bir sayının yanında yön: Kpi kartı, tablo satırı", en: "Direction beside a number: a Kpi card, a table row" },
      { tr: "Çok satırda eğilimi taramak; göz yükselen ve düşen satırları hızla bulur", en: "Scanning trends across many rows; the eye quickly finds what rises and falls" },
      { tr: "`label` ile eğilimi sözle söylemek; ayrıca tablo görünümü yoktur, kesin değer yanındaki sayıda durur", en: "Saying the trend in words with `label`; there is no table view here, so the exact value sits in the number beside it" },
      { tr: "Rengi `slot` ile ölçüye bağlamak; aynı ölçü her yerde aynı yuvayı taşısın", en: "Tying the colour to the measure with `slot`; one measure wears one slot everywhere" },
    ],
    dont: [
      { tr: "Kesin değer okunacak yerler; eksen yoktur, `LineChart` ile tablo görünümü alın", en: "Where exact values are read; there is no axis, so take `LineChart` and its table view" },
      { tr: "Satırlar arasında büyüklük karşılaştırmak; her çizgi kendi aralığına ölçeklenir, bunun için `DataBar` kullanın", en: "Comparing size between rows; each line scales to its own range, so use `DataBar` for that" },
      { tr: "Çift eksen benzeri kullanım; iki çizgiyi üst üste bindirmeyin, her ölçüye ayrı bir çizgi verin", en: "Anything like a dual axis; do not lay two lines over each other, give each measure its own" },
      { tr: "Tek başına anlam taşımak; yanında ölçünün adı ve son değer bulunmalıdır", en: "Standing alone; the measure's name and latest value must be beside it" },
    ],
  },
  anatomy: `<Sparkline values={values} width={96} height={24} area slot={1} label="Spoken summary" />`,
  examples: [
    {
      id: "in-kpi",
      title: { tr: "Kpi kartında", en: "In a Kpi card" },
      body: { tr: "`Kpi` üzerindeki `note` her içeriği alır, bu yüzden çizgiyi eğilimin yanına koyabilirsiniz. `area` altını hafifçe doldurur ve dar kartta çizgiyi güçlendirir. Kart sayıyı, çizgi yönü verir. Oku ve rengi `trend` belirler; `Sparkline` iyi ya da kötü demez.", en: "`note` on `Kpi` takes any content, so the line can sit beside the trend. `area` adds a light wash and gives the line weight in a narrow card. The card gives the number and the line gives the direction. `trend` sets the arrow and colour; `Sparkline` does not say good or bad." },
      example: {
        Demo: InKpi,
        block: true,
        code: `<Kpi
  label="Weekly revenue"
  value={money(298000, lang)}
  trend={{ value: "19%", direction: "up" }}
  note={<Sparkline values={weeks} area width={84} height={18} label="Rose from 182k to 298k over eight weeks" />}
/>`,
      },
    },
    {
      id: "in-table",
      title: { tr: "DataTable hücresinde", en: "In a DataTable cell" },
      body: { tr: "`cell` içinde çizin ve dizi olduğu için kolona `sortValue` verin; burada sıralama sekiz haftadaki değişimi kullanır. `label` içine ürün adını yazın, ekran okuyucu her satırda aynı cümleyi duymasın. Verilmezse dildeki eğilim metni kullanılır: ilk değer, son değer ve en yüksek değer okunur. Her satır kendi en düşük ve en yüksek değerine ölçeklenir.", en: "Draw it inside `cell`, and give the column a `sortValue` since the value is an array; here sorting uses the change over eight weeks. Pass `label` with the product name, so a screen reader does not hear the same sentence on every row. Without it the language's trend text is used, reading the first, last and highest values. Each row scales to its own lowest and highest value." },
      example: {
        Demo: InTable,
        block: true,
        code: `const columns: Column<Product>[] = [
  { key: "name", header: "Product" },
  { key: "stock", header: "Stock", align: "right" },
  {
    key: "weekly",
    header: "Last 8 weeks",
    align: "right",
    sortValue: (p) => p.weekly[p.weekly.length - 1] - p.weekly[0],
    cell: (p) => <Sparkline values={p.weekly} width={110} height={22} label={\`\${p.name}: from \${p.weekly[0]} to \${p.weekly.at(-1)} units\`} />,
  },
];`,
      },
    },
    {
      id: "size",
      title: { tr: "Boyut ve dolgu", en: "Size and wash" },
      body: { tr: "`width` ve `height` piksel olarak sabittir, kabı doldurmaz. Varsayılan 96 x 24'tür. `area` altını yüzde 12 opaklıkla doldurur.", en: "`width` and `height` are fixed in pixels and do not fill the container. The default is 96 by 24. `area` fills under the line at 12 percent opacity." },
      example: {
        Demo: Sizes,
        code: `<Sparkline values={values} width={64} height={16} />
<Sparkline values={values} />
<Sparkline values={values} width={160} height={36} area />`,
      },
    },
    {
      id: "slots",
      title: { tr: "Renk yuvaları", en: "Colour slots" },
      body: { tr: "`slot` 1 ile 8 arasındadır ve grafiklerle aynı `--bt-chart-1` ile `--bt-chart-8` yuvalarını kullanır. Aynı ölçü bir grafikte de görünüyorsa aynı yuvayı verin, renk ölçüyü izlesin.", en: "`slot` runs from 1 to 8 and uses the same `--bt-chart-1` to `--bt-chart-8` slots as the charts. When the same measure also appears on a chart, give it the same slot so the colour follows the measure." },
      example: { Demo: Slots, code: `<Sparkline values={values} slot={1} />\n<Sparkline values={values} slot={2} />\n<Sparkline values={values} slot={3} />` },
    },
  ],
  a11y: [
    { tr: "`role=\"img\"` taşır. `label` verilmezse ad dildeki eğilim metninden gelir: \"Eğilim: 182 değerinden 298 değerine, en yüksek 298\".", en: "It carries `role=\"img\"`. Without `label`, the name comes from the language's trend text: \"Trend: from 182 to 298, highest 298\"." },
    { tr: "Değer birimi varsa `label` yazın; varsayılan metin yalnız sayıları okur, tutar olduğunu bilmez.", en: "Write `label` when the value has a unit; the default text reads plain numbers and does not know they are amounts." },
    { tr: "Tablo görünümü ve klavye gezintisi yoktur, odak almaz. Kesin değerleri yanındaki metinde verin.", en: "There is no table view or keyboard navigation and it takes no focus. Give exact values in the text beside it." },
    { tr: "Renk iyi ya da kötü anlamına gelmesin; yönü metinle de söyleyin.", en: "Do not let colour stand for good or bad; state the direction in words too." },
  ],
  api: [
    {
      name: "Sparkline",
      description: { tr: "Boş `values` hiçbir şey çizmez. Ref ve yerel öznitelikler iletilmez.", en: "Empty `values` draws nothing. The ref and native attributes are not forwarded." },
      props: [
        { name: "values", type: "number[]", required: true, description: { tr: "Çizilecek sayılar, eskiden yeniye", en: "The numbers to draw, oldest first" } },
        { name: "label", type: "string", default: "locale.chart.trend", description: { tr: "Sözlü özet. Varsayılan metin ilk, son ve en yüksek değeri okur", en: "Spoken summary. The default reads the first, last and highest values" } },
        { name: "width", type: "number", default: "96", description: { tr: "Genişlik, piksel", en: "Width in pixels" } },
        { name: "height", type: "number", default: "24", description: { tr: "Yükseklik, piksel", en: "Height in pixels" } },
        { name: "area", type: "boolean", description: { tr: "Çizginin altını doldurur", en: "Fills under the line" } },
        { name: "slot", type: "number", default: "1", description: { tr: "1 ile 8 arası renk yuvası", en: "Colour slot from 1 to 8" } },
        { name: "className", type: "string", description: { tr: "`svg` öğesine eklenir", en: "Added to the `svg`" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-chart-1 ... --bt-chart-8", kind: "var", description: { tr: "`slot` ile seçilen renk", en: "The colour picked with `slot`" } },
  ],
  related: ["kpi", "data-table", "line-chart", "data-bar"],
});
