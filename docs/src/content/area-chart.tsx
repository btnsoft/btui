import { AreaChart } from "btui";
import { money } from "../lib/data";
import { useLang, useText, type Text } from "../lib/i18n";
import { definePage } from "../lib/schema";

const MONTHS: Text[] = [
  { tr: "Oca", en: "Jan" }, { tr: "Şub", en: "Feb" }, { tr: "Mar", en: "Mar" }, { tr: "Nis", en: "Apr" },
  { tr: "May", en: "May" }, { tr: "Haz", en: "Jun" }, { tr: "Tem", en: "Jul" }, { tr: "Ağu", en: "Aug" },
  { tr: "Eyl", en: "Sep" }, { tr: "Eki", en: "Oct" },
];

const COLLECTIONS = [642000, 688000, 655000, 731000, 794000, 768000, 812000, 873000, 846000, 921000];

const CASHFLOW = [
  { income: 642000, spending: 518000 },
  { income: 688000, spending: 547000 },
  { income: 655000, spending: 603000 },
  { income: 731000, spending: 582000 },
  { income: 794000, spending: 629000 },
  { income: 768000, spending: 691000 },
  { income: 812000, spending: 655000 },
  { income: 873000, spending: 702000 },
  { income: 846000, spending: 724000 },
  { income: 921000, spending: 748000 },
];

const STOCK = [
  { istanbul: 12400, izmir: 8200, ankara: 5100 },
  { istanbul: 12900, izmir: 8450, ankara: 5300 },
  { istanbul: 13600, izmir: 8700, ankara: 5250 },
  { istanbul: 13100, izmir: 9100, ankara: 5600 },
  { istanbul: 14200, izmir: 9350, ankara: 5900 },
  { istanbul: 14800, izmir: 9200, ankara: 6200 },
  { istanbul: 15300, izmir: 9700, ankara: 6100 },
  { istanbul: 15100, izmir: 10100, ankara: 6450 },
  { istanbul: 15900, izmir: 10350, ankara: 6700 },
  { istanbul: 16400, izmir: 10600, ankara: 6900 },
];

function useMonthly<T extends object>(rows: T[]) {
  const t = useText();
  return rows.map((row, i) => ({ month: t(MONTHS[i]), ...row }));
}

function Hero() {
  const t = useText();
  const lang = useLang();
  const data = useMonthly(COLLECTIONS.map((amount) => ({ amount })));
  return (
    <AreaChart
      label={t({ tr: "Aylık tahsilat, ocak ile ekim arası", en: "Monthly collections, January to October" })}
      data={data}
      x={(d) => d.month}
      series={[{ key: "amount", label: t({ tr: "Tahsilat", en: "Collections" }), slot: 1 }]}
      format={(v) => money(v, lang)}
    />
  );
}

function Wash() {
  const t = useText();
  const lang = useLang();
  return (
    <AreaChart
      height={240}
      label={t({ tr: "Aylık gelir ve gider", en: "Monthly income and spending" })}
      data={useMonthly(CASHFLOW)}
      x={(d) => d.month}
      series={[
        { key: "income", label: t({ tr: "Gelir", en: "Income" }), slot: 1 },
        { key: "spending", label: t({ tr: "Gider", en: "Spending" }), slot: 2 },
      ]}
      format={(v) => money(v, lang)}
    />
  );
}

function Stacked() {
  const t = useText();
  const lang = useLang();
  return (
    <AreaChart
      stacked
      height={260}
      label={t({ tr: "Depolara göre stok adedi", en: "Stock units by warehouse" })}
      data={useMonthly(STOCK)}
      x={(d) => d.month}
      series={[
        { key: "istanbul", label: "İstanbul", slot: 1 },
        { key: "izmir", label: "İzmir", slot: 2 },
        { key: "ankara", label: "Ankara", slot: 3 },
      ]}
      format={(v) => v.toLocaleString(lang)}
    />
  );
}

function Small() {
  const t = useText();
  const lang = useLang();
  const data = useMonthly(COLLECTIONS.map((amount) => ({ amount })));
  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <AreaChart
        height={150}
        label={t({ tr: "Aylık tahsilat, dar alanda", en: "Monthly collections in a narrow space" })}
        data={data}
        x={(d) => d.month}
        series={[{ key: "amount", label: t({ tr: "Tahsilat", en: "Collections" }), slot: 3 }]}
        format={(v) => money(v, lang)}
      />
    </div>
  );
}

export default definePage({
  summary: { tr: "Zaman içindeki bir ölçünün altını hafifçe doldurur, böylece hacim hissi verir. `stacked` ile parçaların bütünü nasıl oluşturduğunu gösterir. `LineChart` üzerine kuruludur.", en: "Fills lightly under a measure over time, which adds a sense of volume. With `stacked` it shows how parts build a whole. It is built on `LineChart`." },
  imports: 'import { AreaChart, type LineChartProps, type ChartSeries } from "btui";',
  hero: {
    Demo: Hero,
    block: true,
    code: `<AreaChart
  label="Monthly collections, January to October"
  data={rows}
  x={(d) => d.month}
  series={[{ key: "amount", label: "Collections", slot: 1 }]}
  format={(v) => money(v, lang)}
/>`,
  },
  use: {
    do: [
      { tr: "Tahsilat, ciro, stok gibi hacim anlatan ölçülerin zaman içindeki seyri", en: "The course of measures that speak of volume, such as collections, revenue and stock" },
      { tr: "`stacked` yalnız toplam anlamlıysa: depoların stoğu toplanınca şirketin stoğunu verir", en: "`stacked` only when the total means something: warehouse stock adds up to company stock" },
      { tr: "Pano kartlarında tek serilik sade görünüm", en: "A clean single-series view in dashboard cards" },
      { tr: "Kesin değer gerektiğinde tablo görünümü; \"Tablo\" düğmesi her ayın sayısını verir", en: "The table view when exact values matter; the Table button gives every month's number" },
      { tr: "Renk yuvasını seriye bağlamak; `slot` verilen seri süzülünce rengini korur", en: "Tying the colour slot to the series; a series with `slot` keeps its colour when filtered" },
    ],
    dont: [
      { tr: "Toplamı anlamsız serileri yığmak; oranlar ya da ortalamalar üst üste konmaz", en: "Stacking series whose total means nothing; rates and averages do not pile up" },
      { tr: "Çift eksen; birimi farklı iki alanı ayrı grafiklerde gösterin", en: "A dual axis; show two areas with different units on separate charts" },
      { tr: "Yığmadan çok seri; dolgular üst üste biner, üçten fazlasında `LineChart` daha nettir", en: "Many series without stacking; the washes overlap, so past three `LineChart` is clearer" },
      { tr: "Dönemler arasında kesin karşılaştırma; ayrık dönemler için `BarChart` daha doğrudur", en: "Exact comparison between periods; `BarChart` suits discrete periods better" },
    ],
  },
  anatomy: `<AreaChart
  label="Accessible description"
  data={rows}
  x={(d) => d.month}
  series={[{ key: "amount", label: "Collections", slot: 1 }]}
  stacked
  height={260}
  format={(v) => money(v, lang)}
/>`,
  examples: [
    {
      id: "wash",
      title: { tr: "Hafif dolgu", en: "Light wash" },
      body: { tr: "Her serinin altı yüzde 12 opaklıkla dolar, çizgi önde kalır. Gelir ile gider gibi aynı birimdeki iki seri üst üste binse de ikisi de okunur; aradaki açıklık kârı anlatır. Taban her zaman sıfırdır. Uç etiketleri `LineChart` ile aynı kuralla gelir.", en: "Each series is filled at 12 percent opacity and the line stays in front. Two series in the same unit, such as income and spending, overlap and still read clearly; the opening between them tells the margin. The baseline is always zero. End labels follow the same rule as `LineChart`." },
      example: {
        Demo: Wash,
        block: true,
        code: `<AreaChart
  height={240}
  label="Monthly income and spending"
  data={rows}
  x={(d) => d.month}
  series={[
    { key: "income", label: "Income", slot: 1 },
    { key: "spending", label: "Spending", slot: 2 },
  ]}
  format={(v) => money(v, lang)}
/>`,
      },
    },
    {
      id: "stacked",
      title: { tr: "Yığılmış alan", en: "Stacked area" },
      body: { tr: "`stacked` her seriyi öncekinin üstüne ekler. En üstteki çizgi şirketin toplam stoğudur; bu toplam anlamlı olduğu için yığmak doğrudur. İpucu ve tablo her deponun kendi değerini gösterir, birikimli değeri değil. Yalnız alttaki seri düz bir taban üzerinde durur, diğerlerinin eğilimi kalınlıktan okunur.", en: "`stacked` adds each series on top of the last. The top line is the company's total stock, and since that total means something, stacking is right. The hint and table show each warehouse's own value, not the running total. Only the bottom series sits on a flat baseline; the trend of the others reads from their thickness." },
      example: {
        Demo: Stacked,
        block: true,
        code: `<AreaChart
  stacked
  height={260}
  label="Stock units by warehouse"
  data={rows}
  x={(d) => d.month}
  series={[
    { key: "istanbul", label: "İstanbul", slot: 1 },
    { key: "izmir", label: "İzmir", slot: 2 },
    { key: "ankara", label: "Ankara", slot: 3 },
  ]}
/>`,
      },
    },
    {
      id: "narrow",
      title: { tr: "Dar alan", en: "Narrow space" },
      body: { tr: "Genişlik kabı doldurur; etiketler sığdığı kadar seyreltilir. Yükseklik yalnız `height` ile belirlenir. Kart içinde kullanırken `Card` üzerindeki `flush` ile iç boşluğu kaldırabilirsiniz. Renk için `slot` verin; burada yeşil üçüncü yuvadır.", en: "The width fills the container and labels thin out to fit. Height comes from `height` alone. Inside a card, `flush` on `Card` removes the padding. Pass `slot` for the colour; here green is the third slot." },
      example: {
        Demo: Small,
        block: true,
        code: `<AreaChart
  height={150}
  label="Monthly collections"
  data={rows}
  x={(d) => d.month}
  series={[{ key: "amount", label: "Collections", slot: 3 }]}
  format={(v) => money(v, lang)}
/>`,
      },
    },
  ],
  a11y: [
    { tr: "Çizim alanı `role=\"img\"` taşır ve adını zorunlu `label` değerinden alır.", en: "The plot carries `role=\"img\"` and takes its name from the required `label`." },
    { tr: "Tablo görünümü: \"Tablo\" düğmesi veriyi `caption`, sütun ve satır başlıkları olan gerçek bir `<table>` olarak açar. Yığılmış grafikte tablo her serinin kendi değerini verir.", en: "Table view: the Table button opens the data as a real `<table>` with a `caption` and column and row headers. In a stacked chart the table gives each series its own value." },
    { tr: "İki ve daha çok seride gösterge her zaman çizilir; dörde kadar seride ad çizgi ucunda da yazılır, renk tek başına kalmaz.", en: "A legend is always drawn from two series up, and up to four series are also named at the line ends, so colour does not stand alone." },
    { tr: "Çizim alanı odak alır, ok tuşları noktalar arasında gezer.", en: "The plot takes focus and the arrow keys step through the points." },
  ],
  keyboard: [
    ["Tab", { tr: "Tablo düğmesine, ardından çizim alanına odaklanır", en: "Moves focus to the Table button, then the plot" }],
    ["→ / ↓", { tr: "Sonraki noktaya geçer; ilk basışta birincisine gider", en: "Moves to the next point; the first press goes to the first one" }],
    ["← / ↑", { tr: "Önceki noktaya geçer; ilk basışta sonuncusuna gider", en: "Moves to the previous point; the first press goes to the last one" }],
    ["Home", { tr: "İlk noktaya gider", en: "Goes to the first point" }],
    ["End", { tr: "Son noktaya gider", en: "Goes to the last point" }],
    ["Esc", { tr: "İpucunu kapatır", en: "Closes the hint" }],
  ],
  api: [
    {
      name: "AreaChart",
      description: { tr: "`LineChart` bileşenini `area` açık olarak çizer. `area` dışındaki `LineChartProps` alanlarının hepsini alır. Ref ve yerel öznitelikler iletilmez.", en: "Draws `LineChart` with `area` on. It takes every `LineChartProps` field except `area`. The ref and native attributes are not forwarded." },
      props: [
        { name: "data", type: "D[]", required: true, description: { tr: "Her öğe yatay eksende bir noktadır", en: "Each item is one point on the horizontal axis" } },
        { name: "x", type: "(datum: D) => string", required: true, description: { tr: "Yatay eksendeki etiket; sığmayanlar seyreltilir", en: "Label on the horizontal axis; those that do not fit are thinned out" } },
        { name: "series", type: "ChartSeries<D>[]", required: true, description: { tr: "Çizilecek seriler", en: "The series to draw" } },
        { name: "label", type: "string", required: true, description: { tr: "Yardımcı teknoloji için kısa açıklama; tablo başlığı da olur", en: "Short description for assistive technology; also the table caption" } },
        { name: "stacked", type: "boolean", description: { tr: "Alanları üst üste koyar. Yalnız toplam anlamlıysa kullanın", en: "Piles the areas. Use it only when the total means something" } },
        { name: "height", type: "number", default: "260", description: { tr: "Çizim alanı yüksekliği, piksel. Genişlik kabı doldurur", en: "Plot height in pixels. The width fills the container" } },
        { name: "animated", type: "boolean", default: "true", description: { tr: "Giriş ve güncelleme hareketi. Hareketi azaltan kullanıcıda hep kapalıdır", en: "Entrance and update motion. Always off for people who ask for reduced motion" } },
        { name: "format", type: "(value: number) => string", description: { tr: "İpucu ve tablo sayıları. Eksen kısa biçimde kalır", en: "Numbers in the hint and table. The axis keeps the short form" } },
        { name: "className", type: "string", description: { tr: "Dış `figure` öğesine eklenir", en: "Added to the outer `figure`" } },
      ],
    },
    {
      name: "ChartSeries",
      props: [
        { name: "key", type: "string", required: true, description: { tr: "Seri kimliği. `value` yoksa veriden bu ad okunur", en: "Series id. Without `value`, the field of this name is read" } },
        { name: "label", type: "string", required: true, description: { tr: "Gösterge, uç etiketi, ipucu ve tablo başlığındaki ad", en: "Name in the legend, end label, hint and table header" } },
        { name: "value", type: "(datum: D) => number | null | undefined", description: { tr: "Sayıyı okur", en: "Reads the number" } },
        { name: "slot", type: "number", default: "index % 8 + 1", description: { tr: "1 ile 8 arası renk yuvası. Rengi seriye bağlar", en: "Colour slot from 1 to 8. Ties the colour to the series" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-chart-1 ... --bt-chart-8", kind: "var", description: { tr: "Sekiz renk yuvası. Çizgi ve dolgu aynı yuvadan gelir", en: "The eight colour slots. Line and wash share a slot" } },
    { name: "--bt-line", kind: "var", description: { tr: "Yatay kılavuz çizgileri", en: "Horizontal grid lines" } },
    { name: "--bt-border", kind: "var", description: { tr: "Sıfır çizgisi", en: "Zero line" } },
    { name: "--bt-faint", kind: "var", description: { tr: "Etkin noktanın dikey çizgisi", en: "Vertical line at the active point" } },
    { name: "--bt-muted", kind: "var", description: { tr: "Eksen yazıları", en: "Axis text" } },
    { name: "data-shape", kind: "data", description: { tr: "Gösterge işaretinin biçimi: burada `box`", en: "Shape of the legend mark: `box` here" } },
  ],
  related: ["line-chart", "bar-chart", "donut-chart", "sparkline", "card"],
});
