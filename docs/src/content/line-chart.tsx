import { LineChart, type ChartSeries } from "btui";
import { money } from "../lib/data";
import { useLang, useText, type Text } from "../lib/i18n";
import { definePage } from "../lib/schema";

const MONTHS: Text[] = [
  { tr: "Oca", en: "Jan" }, { tr: "Şub", en: "Feb" }, { tr: "Mar", en: "Mar" }, { tr: "Nis", en: "Apr" },
  { tr: "May", en: "May" }, { tr: "Haz", en: "Jun" }, { tr: "Tem", en: "Jul" }, { tr: "Ağu", en: "Aug" },
  { tr: "Eyl", en: "Sep" }, { tr: "Eki", en: "Oct" }, { tr: "Kas", en: "Nov" }, { tr: "Ara", en: "Dec" },
];

const CHANNELS = [
  { web: 412, dealer: 318, phone: 164, marketplace: 96 },
  { web: 438, dealer: 305, phone: 158, marketplace: 112 },
  { web: 471, dealer: 322, phone: 149, marketplace: 131 },
  { web: 506, dealer: 341, phone: 152, marketplace: 148 },
  { web: 534, dealer: 336, phone: 141, marketplace: 172 },
  { web: 561, dealer: 352, phone: 137, marketplace: 186 },
  { web: 548, dealer: 347, phone: 129, marketplace: 203 },
  { web: 592, dealer: 361, phone: 133, marketplace: 228 },
  { web: 627, dealer: 374, phone: 126, marketplace: 241 },
  { web: 655, dealer: 368, phone: 118, marketplace: 264 },
  { web: 698, dealer: 382, phone: 121, marketplace: 289 },
  { web: 741, dealer: 395, phone: 114, marketplace: 317 },
];

type Reading = { day: string; line1: number | null; line2: number | null };

const READINGS: Reading[] = [
  { day: "01.10", line1: 94, line2: 88 },
  { day: "02.10", line1: 96, line2: 90 },
  { day: "03.10", line1: 95, line2: 87 },
  { day: "04.10", line1: null, line2: 91 },
  { day: "05.10", line1: null, line2: 92 },
  { day: "06.10", line1: 92, line2: 89 },
  { day: "07.10", line1: 97, line2: null },
  { day: "08.10", line1: 98, line2: 93 },
  { day: "09.10", line1: 96, line2: 94 },
  { day: "10.10", line1: 99, line2: 92 },
];

const CASH = [1840000, 1912000, 1786000, 2054000, 2211000, 2178000, 2346000, 2502000, 2439000, 2687000, 2794000, 2951000];

const PRICES = [
  { week: "H36", steel: 41.2, copper: 318 },
  { week: "H37", steel: 42.1, copper: 322 },
  { week: "H38", steel: 41.8, copper: 335 },
  { week: "H39", steel: 43.4, copper: 329 },
  { week: "H40", steel: 44.6, copper: 341 },
];

function useChannelData() {
  const t = useText();
  return CHANNELS.map((row, i) => ({ month: t(MONTHS[i]), ...row }));
}

function useChannels(): ChartSeries<(typeof CHANNELS)[number]>[] {
  const t = useText();
  return [
    { key: "web", label: "Web", slot: 1 },
    { key: "dealer", label: t({ tr: "Bayi", en: "Dealer" }), slot: 2 },
    { key: "marketplace", label: t({ tr: "Pazaryeri", en: "Marketplace" }), slot: 3 },
    { key: "phone", label: t({ tr: "Telefon", en: "Phone" }), slot: 4 },
  ];
}

function Hero() {
  const t = useText();
  return (
    <LineChart
      label={t({ tr: "Satış kanallarına göre aylık sipariş adedi", en: "Monthly orders by sales channel" })}
      data={useChannelData()}
      x={(d) => d.month}
      series={useChannels()}
    />
  );
}

function Multi() {
  const t = useText();
  return (
    <LineChart
      height={240}
      label={t({ tr: "Web ve bayi kanalında aylık sipariş adedi", en: "Monthly orders through web and dealers" })}
      data={useChannelData()}
      x={(d) => d.month}
      series={useChannels().slice(0, 2)}
    />
  );
}

function Gaps() {
  const t = useText();
  const lang = useLang();
  return (
    <LineChart
      height={240}
      label={t({ tr: "Üretim hatlarının günlük verimi, yüzde", en: "Daily efficiency of the production lines, percent" })}
      data={READINGS}
      x={(d) => d.day}
      series={[
        { key: "line1", label: t({ tr: "1. hat", en: "Line 1" }), slot: 1 },
        { key: "line2", label: t({ tr: "2. hat", en: "Line 2" }), slot: 2 },
      ]}
      format={(v) => (lang === "tr" ? `%${v}` : `${v}%`)}
    />
  );
}

function Money() {
  const t = useText();
  const lang = useLang();
  const data = CASH.map((balance, i) => ({ month: t(MONTHS[i]), balance }));
  return (
    <LineChart
      height={220}
      label={t({ tr: "Ay sonu kasa ve banka bakiyesi", en: "Month end cash and bank balance" })}
      data={data}
      x={(d) => d.month}
      series={[{ key: "balance", label: t({ tr: "Bakiye", en: "Balance" }), slot: 1 }]}
      format={(v) => money(v, lang)}
    />
  );
}

function Keyboard() {
  const t = useText();
  const data = useChannelData();
  return (
    <LineChart
      height={220}
      label={t({ tr: "Web kanalında aylık sipariş adedi; ok tuşlarıyla gezin", en: "Monthly web orders; step through them with the arrow keys" })}
      data={data}
      x={(d) => d.month}
      series={[{ key: "web", label: "Web", slot: 1 }]}
    />
  );
}

function TwoCharts() {
  const t = useText();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
      <LineChart height={180} label={t({ tr: "Çelik, kilogram fiyatı", en: "Steel, price per kilogram" })} data={PRICES} x={(d) => d.week} series={[{ key: "steel", label: t({ tr: "Çelik", en: "Steel" }), slot: 1 }]} format={(v) => `${v} ₺`} />
      <LineChart height={180} label={t({ tr: "Bakır, kilogram fiyatı", en: "Copper, price per kilogram" })} data={PRICES} x={(d) => d.week} series={[{ key: "copper", label: t({ tr: "Bakır", en: "Copper" }), slot: 2 }]} format={(v) => `${v} ₺`} />
    </div>
  );
}

export default definePage({
  summary: { tr: "Bir ölçünün zaman içindeki değişimini gösterir. İki ile dört seri arasında çizgilerin adı uçlarına yazılır, boş değerde çizgi kesilir ve aynı veri tablo olarak da açılır.", en: "Shows how a measure changes over time. With two to four series, lines are named at their ends, an empty value breaks the line and the same data opens as a table too." },
  imports: 'import { LineChart, type LineChartProps, type ChartSeries } from "btui";',
  hero: {
    Demo: Hero,
    block: true,
    code: `<LineChart
  label="Monthly orders by sales channel"
  data={rows}
  x={(d) => d.month}
  series={[
    { key: "web", label: "Web", slot: 1 },
    { key: "dealer", label: "Dealer", slot: 2 },
    { key: "marketplace", label: "Marketplace", slot: 3 },
    { key: "phone", label: "Phone", slot: 4 },
  ]}
/>`,
  },
  use: {
    do: [
      { tr: "Zamana bağlı eğilimler: aylık sipariş, günlük verim, haftalık fiyat", en: "Trends over time: monthly orders, daily efficiency, weekly prices" },
      { tr: "Aynı birimdeki en çok dört seriyi karşılaştırmak; adlar çizgi uçlarında okunur", en: "Comparing up to four series in one unit; the names read at the line ends" },
      { tr: "Eksik ölçümler; değeri `null` bırakın, çizgi kesilir ve boşluk görünür kalır", en: "Missing readings; leave the value `null`, the line breaks and the gap stays visible" },
      { tr: "Tablo görünümüne güvenmek; \"Tablo\" düğmesi her noktanın tam değerini verir", en: "Relying on the table view; the Table button gives the exact value of every point" },
      { tr: "Renk yuvasını seriye bağlamak; `slot` verilen seri süzülünce rengini korur", en: "Tying the colour slot to the series; a series with `slot` keeps its colour when filtered" },
    ],
    dont: [
      { tr: "Çift eksen; ölçek seçimi korelasyon uydurur, ayrı ölçekteki ölçüleri iki grafiğe bölün", en: "A dual axis; the choice of scales invents correlations, so split measures of different scale into two charts" },
      { tr: "Ayrık kategoriler; bölgeler arasında çizgi çekilmez, `BarChart` kullanın", en: "Discrete categories; no line runs between regions, so use `BarChart`" },
      { tr: "Beşten çok çizgi; okunmaz hâle gelir, önemlileri seçin ya da grafiği bölün", en: "More than five lines; it stops being readable, so pick the ones that matter or split the chart" },
      { tr: "Boş değeri `0` yazmak; ölçüm yokken sıfıra düşen çizgi yanlış bir çöküş anlatır", en: "Writing a missing value as `0`; a line falling to zero tells of a collapse that never happened" },
      { tr: "Bütünün payını göstermek; toplam anlamlıysa `stacked` ile `AreaChart` seçin", en: "Showing shares of a whole; when the total means something, pick `AreaChart` with `stacked`" },
    ],
  },
  anatomy: `<LineChart
  label="Accessible description"
  data={rows}
  x={(d) => d.month}
  series={[{ key: "web", label: "Web", slot: 1 }]}
  height={260}
  format={(v) => money(v, lang)}
/>`,
  examples: [
    {
      id: "multi-series",
      title: { tr: "Çok seri ve uç etiketleri", en: "Multiple series and end labels" },
      body: { tr: "İki ile dört seri arasında, çizim genişliği 460 pikseli geçtiğinde seri adları çizgi uçlarına yazılır; göz göstergeye gidip gelmez. Yakın uçlar birbirine binmesin diye en az 14 piksel aralıkla dizilir. Dar alanda ya da beş ve üzeri seride yalnız gösterge kalır. Ad için en çok 120 piksel ayrılır, bu yüzden seri adlarını kısa tutun.", en: "With two to four series and a plot wider than 460 pixels, series names are written at the line ends, so the eye does not travel to the legend. Close ends step at least 14 pixels apart so they do not overlap. In a narrow space, or from five series up, only the legend remains. At most 120 pixels are set aside for a name, so keep series names short." },
      example: {
        Demo: Multi,
        block: true,
        code: `<LineChart
  height={240}
  label="Monthly orders through web and dealers"
  data={rows}
  x={(d) => d.month}
  series={[
    { key: "web", label: "Web", slot: 1 },
    { key: "dealer", label: "Dealer", slot: 2 },
  ]}
/>`,
      },
    },
    {
      id: "gaps",
      title: { tr: "Boş değerlerde kesinti", en: "Gaps from null" },
      body: { tr: "`null`, `undefined` ya da sayı olmayan değer boş sayılır ve çizgi orada kesilir. 1. hatta sensör 4 ve 5 Ekim günleri veri göndermemiş, 2. hatta 7 Ekim eksik. İpucu boş seriyi atlar, tablo görünümünde hücre boş kalır. Noktalar arasında çizgi uydurulmaz.", en: "`null`, `undefined` or anything that is not a number counts as empty, and the line breaks there. On line 1 the sensor sent nothing on 4 and 5 October, and line 2 misses 7 October. The hint skips the empty series and the table view leaves the cell blank. No line is invented between the points." },
      example: {
        Demo: Gaps,
        block: true,
        code: `const rows = [
  { day: "03.10", line1: 95, line2: 87 },
  { day: "04.10", line1: null, line2: 91 },
  { day: "05.10", line1: null, line2: 92 },
  { day: "06.10", line1: 92, line2: 89 },
];

<LineChart
  label="Daily efficiency of the production lines, percent"
  data={rows}
  x={(d) => d.day}
  series={[
    { key: "line1", label: "Line 1", slot: 1 },
    { key: "line2", label: "Line 2", slot: 2 },
  ]}
  format={(v) => \`\${v}%\`}
/>`,
      },
    },
    {
      id: "money",
      title: { tr: "Para biçimi", en: "Money format" },
      body: { tr: "`format` ipucu ile tablo görünümündeki sayıları biçimlendirir. Eksen dilin kısa biçimiyle kalır: Türkçede `2 Mn`, İngilizcede `2M`. Tek seride gösterge ve uç etiketi çizilmez; dikey eksen varsayılan olarak sıfırı içerir, birbirine yakın değerlerde `zero={false}` verin. Uzun seri adları uçta kısalır, tam ad göstergede kalır.", en: "`format` shapes the numbers in the hint and table view. The axis keeps the short form of the language: `2 Mn` in Turkish, `2M` in English. A single series has no legend or end label, and the vertical axis includes zero by default, so pass `zero={false}` for values that sit close together. Long series names shorten at the line end and stay whole in the legend." },
      example: {
        Demo: Money,
        block: true,
        code: `<LineChart
  height={220}
  label="Month end cash and bank balance"
  data={rows}
  x={(d) => d.month}
  series={[{ key: "balance", label: "Balance", slot: 1 }]}
  format={(v) => money(v, lang)}
/>`,
      },
    },
    {
      id: "keyboard",
      title: { tr: "Klavye ile okuma", en: "Reading by keyboard" },
      body: { tr: "Çizim alanına `Tab` ile gelin, ardından ok tuşlarıyla aylar arasında gezin. Dikey çizgi ve ipucu fareyle aynı biçimde açılır; `Home` ilk, `End` son noktaya gider, `Esc` ipucunu kapatır. Odak alandan çıkınca ipucu da kapanır.", en: "Reach the plot with `Tab`, then step through the months with the arrow keys. The vertical line and the hint open just as with the mouse; `Home` goes to the first point, `End` to the last, and `Esc` closes the hint. The hint also closes when focus leaves the plot." },
      example: {
        Demo: Keyboard,
        block: true,
        code: `<LineChart
  height={220}
  label="Monthly web orders"
  data={rows}
  x={(d) => d.month}
  series={[{ key: "web", label: "Web", slot: 1 }]}
/>`,
      },
    },
    {
      id: "two-charts",
      title: { tr: "Çift eksen yerine iki grafik", en: "Two charts instead of a dual axis" },
      body: { tr: "Çelik kilogram başına 40 lira, bakır 300 lira civarındadır. Tek eksende çelik düz görünür, iki eksende ise ölçek seçimi sahte bir ilişki kurar. Yan yana iki küçük grafik her ölçüyü kendi ölçeğinde gösterir. Renkler yine seriye bağlıdır.", en: "Steel costs about 40 lira per kilogram and copper about 300. On one axis steel looks flat, and on two axes the choice of scales builds a false relationship. Two small charts side by side show each measure on its own scale. The colours stay tied to the series." },
      example: {
        Demo: TwoCharts,
        block: true,
        code: `<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
  <LineChart height={180} label="Steel, price per kilogram" data={rows} x={(d) => d.week} series={[{ key: "steel", label: "Steel", slot: 1 }]} />
  <LineChart height={180} label="Copper, price per kilogram" data={rows} x={(d) => d.week} series={[{ key: "copper", label: "Copper", slot: 2 }]} />
</div>`,
      },
    },
  ],
  a11y: [
    { tr: "Çizim alanı `role=\"img\"` taşır ve adını zorunlu `label` değerinden alır. Eğilimi de söyleyin: \"Web siparişleri yıl boyunca arttı\".", en: "The plot carries `role=\"img\"` and takes its name from the required `label`. Say the trend too: \"Web orders grew through the year\"." },
    { tr: "Tablo görünümü: \"Tablo\" düğmesi veriyi `caption`, sütun ve satır başlıkları olan gerçek bir `<table>` olarak açar. Düğme `aria-pressed` taşır. Boş değerler boş hücre olur.", en: "Table view: the Table button opens the data as a real `<table>` with a `caption` and column and row headers. The button carries `aria-pressed`. Empty values become empty cells." },
    { tr: "Seriler renkle birlikte adla da ayrılır: iki ve daha çok seride gösterge her zaman vardır, dörde kadar seride ad çizgi ucunda yazılır.", en: "Series differ by name as well as colour: a legend is always there from two series up, and up to four series are also named at the line ends." },
    { tr: "Çizim alanı odak alır, ok tuşları noktalar arasında gezer ve ipucu fareyle aynı içeriği gösterir.", en: "The plot takes focus, the arrow keys step through the points and the hint shows the same content as with the mouse." },
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
      name: "LineChart",
      description: { tr: "`LineChart<D>` veri tipini `data` üzerinden çıkarır. Ref ve yerel öznitelikler iletilmez.", en: "`LineChart<D>` infers the data type from `data`. The ref and native attributes are not forwarded." },
      props: [
        { name: "data", type: "D[]", required: true, description: { tr: "Her öğe yatay eksende bir noktadır", en: "Each item is one point on the horizontal axis" } },
        { name: "x", type: "(datum: D) => string", required: true, description: { tr: "Yatay eksendeki etiket; sığmayanlar seyreltilir", en: "Label on the horizontal axis; those that do not fit are thinned out" } },
        { name: "series", type: "ChartSeries<D>[]", required: true, description: { tr: "Çizilecek seriler", en: "The series to draw" } },
        { name: "label", type: "string", required: true, description: { tr: "Yardımcı teknoloji için kısa açıklama; tablo başlığı da olur", en: "Short description for assistive technology; also the table caption" } },
        { name: "height", type: "number", default: "260", description: { tr: "Çizim alanı yüksekliği, piksel. Genişlik kabı doldurur", en: "Plot height in pixels. The width fills the container" } },
        { name: "zero", type: "boolean", default: "true", description: { tr: "`false` ekseni veriye yaklaştırır; `area` ile yok sayılır", en: "`false` moves the axis close to the data; ignored with `area`" } },
        { name: "animated", type: "boolean", default: "true", description: { tr: "Giriş ve güncelleme hareketi. Hareketi azaltan kullanıcıda hep kapalıdır", en: "Entrance and update motion. Always off for people who ask for reduced motion" } },
        { name: "format", type: "(value: number) => string", description: { tr: "İpucu ve tablo sayıları. Eksen kısa biçimde kalır", en: "Numbers in the hint and table. The axis keeps the short form" } },
        { name: "area", type: "boolean", description: { tr: "Çizginin altını hafifçe doldurur. Bunun için `AreaChart` hazırdır", en: "Fills under each line with a light wash. `AreaChart` does this for you" } },
        { name: "stacked", type: "boolean", description: { tr: "Serileri birbirinin üstüne ekler. Yalnız toplam anlamlıysa kullanın", en: "Adds each series on top of the last. Use it only when the total means something" } },
        { name: "className", type: "string", description: { tr: "Dış `figure` öğesine eklenir", en: "Added to the outer `figure`" } },
      ],
    },
    {
      name: "ChartSeries",
      props: [
        { name: "key", type: "string", required: true, description: { tr: "Seri kimliği. `value` yoksa veriden bu ad okunur", en: "Series id. Without `value`, the field of this name is read" } },
        { name: "label", type: "string", required: true, description: { tr: "Gösterge, uç etiketi, ipucu ve tablo başlığındaki ad", en: "Name in the legend, end label, hint and table header" } },
        { name: "value", type: "(datum: D) => number | null | undefined", description: { tr: "Sayıyı okur. Sayı olmayan değer çizgiyi keser", en: "Reads the number. Anything else breaks the line" } },
        { name: "slot", type: "number", default: "index % 8 + 1", description: { tr: "1 ile 8 arası renk yuvası. Rengi seriye bağlar", en: "Colour slot from 1 to 8. Ties the colour to the series" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-chart-1 ... --bt-chart-8", kind: "var", description: { tr: "Sekiz renk yuvası. Koyu temada ayrı değerleri vardır", en: "The eight colour slots. The dark theme has its own values" } },
    { name: "--bt-line", kind: "var", description: { tr: "Yatay kılavuz çizgileri", en: "Horizontal grid lines" } },
    { name: "--bt-border", kind: "var", description: { tr: "Sıfır çizgisi", en: "Zero line" } },
    { name: "--bt-faint", kind: "var", description: { tr: "Etkin noktanın dikey çizgisi", en: "Vertical line at the active point" } },
    { name: "--bt-muted", kind: "var", description: { tr: "Eksen yazıları", en: "Axis text" } },
    { name: "--bt-text-2", kind: "var", description: { tr: "Uç etiketleri ve gösterge yazısı", en: "End labels and legend text" } },
    { name: "--bt-surface", kind: "var", description: { tr: "Noktaların çevresindeki halka", en: "Ring around the dots" } },
    { name: "data-shape", kind: "data", description: { tr: "Gösterge işaretinin biçimi: burada `line`", en: "Shape of the legend mark: `line` here" } },
  ],
  related: ["area-chart", "bar-chart", "sparkline", "kpi"],
});
