import { useState } from "react";
import { BarChart, Chip, ChipGroup, type ChartSeries } from "btui";
import { money } from "../lib/data";
import { useLang, useText, type Text } from "../lib/i18n";
import { definePage } from "../lib/schema";

const MONTHS: Record<string, Text> = {
  may: { tr: "May", en: "May" },
  jun: { tr: "Haz", en: "Jun" },
  jul: { tr: "Tem", en: "Jul" },
  aug: { tr: "Ağu", en: "Aug" },
  sep: { tr: "Eyl", en: "Sep" },
  oct: { tr: "Eki", en: "Oct" },
};

type RegionMonth = { month: string; marmara: number; ege: number; anadolu: number };

const REGION_SALES: RegionMonth[] = [
  { month: "may", marmara: 412000, ege: 268000, anadolu: 186000 },
  { month: "jun", marmara: 438000, ege: 251000, anadolu: 204000 },
  { month: "jul", marmara: 397000, ege: 289000, anadolu: 192000 },
  { month: "aug", marmara: 461000, ege: 302000, anadolu: 215000 },
  { month: "sep", marmara: 489000, ege: 296000, anadolu: 238000 },
  { month: "oct", marmara: 524000, ege: 318000, anadolu: 247000 },
];

type Target = { month: string; plan: number; actual: number };

const TARGETS: Target[] = [
  { month: "may", plan: 820, actual: 866 },
  { month: "jun", plan: 860, actual: 893 },
  { month: "jul", plan: 900, actual: 878 },
  { month: "aug", plan: 940, actual: 978 },
  { month: "sep", plan: 980, actual: 1023 },
  { month: "oct", plan: 1040, actual: 1089 },
];

type Cost = { month: string; staff: number; rent: number; logistics: number; energy: number };

const COSTS: Cost[] = [
  { month: "may", staff: 214000, rent: 62000, logistics: 48000, energy: 21000 },
  { month: "jun", staff: 214000, rent: 62000, logistics: 53000, energy: 24000 },
  { month: "jul", staff: 221000, rent: 62000, logistics: 57000, energy: 31000 },
  { month: "aug", staff: 221000, rent: 62000, logistics: 61000, energy: 33000 },
  { month: "sep", staff: 228000, rent: 68000, logistics: 55000, energy: 26000 },
  { month: "oct", staff: 228000, rent: 68000, logistics: 64000, energy: 23000 },
];

const BALANCES = [
  { name: "Kuzey Lojistik Taşımacılık ve Dış Ticaret A.Ş.", open: 412500, overdue: 96000 },
  { name: "Mavi Yapı Malzemeleri", open: 298400, overdue: 41500 },
  { name: "Çınar Gıda", open: 241700, overdue: 0 },
  { name: "Atlas Makine", open: 186900, overdue: 72300 },
  { name: "Ege Tekstil", open: 154200, overdue: 18400 },
  { name: "Şafak Enerji", open: 97600, overdue: 0 },
];

const REGION_KEYS = ["marmara", "ege", "anadolu"] as const;

function useMonth() {
  const t = useText();
  return (key: string) => t(MONTHS[key]);
}

function useRegionSeries(): ChartSeries<RegionMonth>[] {
  const t = useText();
  return [
    { key: "marmara", label: "Marmara", slot: 1 },
    { key: "ege", label: t({ tr: "Ege", en: "Aegean" }), slot: 2 },
    { key: "anadolu", label: t({ tr: "İç Anadolu", en: "Central Anatolia" }), slot: 3 },
  ];
}

function Hero() {
  const t = useText();
  const lang = useLang();
  const month = useMonth();
  return (
    <BarChart
      label={t({ tr: "Bölgelere göre aylık ciro, mayıs ile ekim arası", en: "Monthly revenue by region, May to October" })}
      data={REGION_SALES}
      x={(d) => month(d.month)}
      series={useRegionSeries()}
      format={(v) => money(v, lang)}
    />
  );
}

function Grouped() {
  const t = useText();
  const month = useMonth();
  return (
    <BarChart
      label={t({ tr: "Aylık sipariş adedi: plan ve gerçekleşen", en: "Monthly order count: plan and actual" })}
      data={TARGETS}
      x={(d) => month(d.month)}
      series={[
        { key: "plan", label: t({ tr: "Plan", en: "Plan" }), slot: 1 },
        { key: "actual", label: t({ tr: "Gerçekleşen", en: "Actual" }), slot: 2 },
      ]}
    />
  );
}

function Stacked() {
  const t = useText();
  const lang = useLang();
  const month = useMonth();
  return (
    <BarChart
      stacked
      label={t({ tr: "Aylık gider dağılımı", en: "Monthly cost breakdown" })}
      data={COSTS}
      x={(d) => month(d.month)}
      series={[
        { key: "staff", label: t({ tr: "Personel", en: "Staff" }), slot: 1 },
        { key: "rent", label: t({ tr: "Kira", en: "Rent" }), slot: 2 },
        { key: "logistics", label: t({ tr: "Lojistik", en: "Logistics" }), slot: 3 },
        { key: "energy", label: t({ tr: "Enerji", en: "Energy" }), slot: 4 },
      ]}
      format={(v) => money(v, lang)}
    />
  );
}

function Horizontal() {
  const t = useText();
  const lang = useLang();
  return (
    <BarChart
      horizontal
      height={300}
      label={t({ tr: "Müşterilere göre açık bakiye", en: "Open balance by customer" })}
      data={BALANCES}
      x={(d) => d.name}
      series={[
        { key: "open", label: t({ tr: "Açık bakiye", en: "Open balance" }), slot: 1 },
        { key: "overdue", label: t({ tr: "Vadesi geçen", en: "Overdue" }), slot: 2 },
      ]}
      format={(v) => money(v, lang)}
    />
  );
}

function Money() {
  const t = useText();
  const lang = useLang();
  const month = useMonth();
  const series: ChartSeries<RegionMonth>[] = [{ key: "total", label: t({ tr: "Ciro", en: "Revenue" }), value: (d) => d.marmara + d.ege + d.anadolu, slot: 1 }];
  return (
    <BarChart
      height={220}
      label={t({ tr: "Aylık toplam ciro", en: "Total monthly revenue" })}
      data={REGION_SALES}
      x={(d) => month(d.month)}
      series={series}
      format={(v) => money(v, lang)}
    />
  );
}

function Slots() {
  const t = useText();
  const lang = useLang();
  const month = useMonth();
  const all = useRegionSeries();
  const [hidden, setHidden] = useState<string[]>(["marmara"]);
  const shown = all.filter((s) => !hidden.includes(s.key));
  const toggle = (key: string) => setHidden(hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key]);
  return (
    <div className="d-stack-wide">
      <ChipGroup aria-label={t({ tr: "Gösterilen bölgeler", en: "Regions shown" })}>
        {REGION_KEYS.map((key) => (
          <Chip key={key} active={!hidden.includes(key)} disabled={!hidden.includes(key) && shown.length === 1} onClick={() => toggle(key)}>{all.find((s) => s.key === key)?.label}</Chip>
        ))}
      </ChipGroup>
      <BarChart
        height={220}
        label={t({ tr: "Seçili bölgelerin aylık cirosu", en: "Monthly revenue of the chosen regions" })}
        data={REGION_SALES}
        x={(d) => month(d.month)}
        series={shown}
        format={(v) => money(v, lang)}
      />
    </div>
  );
}

function Empty() {
  const t = useText();
  return (
    <BarChart
      height={160}
      label={t({ tr: "Bu çeyreğin iade tutarları", en: "Refunds this quarter" })}
      data={[] as Target[]}
      x={(d) => d.month}
      series={[{ key: "plan", label: "Plan" }]}
    />
  );
}

export default definePage({
  summary: { tr: "Kategorileri uzunlukla karşılaştırır. Bölge, müşteri ya da ay gibi ayrık değerlerde en hızlı okunan grafik budur. SVG olarak çizilir, ek paket istemez ve her zaman bir tablo görünümü taşır.", en: "Compares categories by length. For discrete values such as regions, customers or months it is the quickest chart to read. It draws as SVG, needs no extra package and always comes with a table view." },
  imports: 'import { BarChart, type BarChartProps, type ChartSeries } from "btui";',
  hero: {
    Demo: Hero,
    block: true,
    code: `<BarChart
  label="Monthly revenue by region, May to October"
  data={rows}
  x={(d) => d.month}
  series={[
    { key: "marmara", label: "Marmara", slot: 1 },
    { key: "ege", label: "Aegean", slot: 2 },
    { key: "anadolu", label: "Central Anatolia", slot: 3 },
  ]}
  format={(v) => money(v, lang)}
/>`,
  },
  use: {
    do: [
      { tr: "Kategorileri birbiriyle karşılaştırmak: bölge, ürün grubu, müşteri", en: "Comparing categories: regions, product groups, customers" },
      { tr: "Yığılmış çubuk, yalnız toplamın kendisi anlamlıysa: giderler toplanınca toplam gideri verir", en: "Stacked bars, only when the total means something: costs add up to total cost" },
      { tr: "Uzun adlar ve sıralı listeler; `horizontal` adların tamamına yer açar", en: "Long names and ranked lists; `horizontal` makes room for the names" },
      { tr: "Her zaman `label` ve anlamlı bir `format` verin; \"Tablo\" düğmesi aynı veriyi gerçek bir tablo olarak açar", en: "Always pass `label` and a meaningful `format`; the Table button opens the same data as a real table" },
      { tr: "Renk yuvasını seriye bağlayın: `slot` verilen seri süzme sonrasında da rengini korur", en: "Tie the colour slot to the series: a series with `slot` keeps its colour after filtering" },
    ],
    dont: [
      { tr: "Çift eksen; farklı ölçekteki iki ölçüyü tek grafiğe koymayın, iki grafik çizin", en: "A dual axis; do not put two measures of different scale on one chart, draw two charts" },
      { tr: "Toplamı anlamsız serileri yığmak: ortalama fiyat ya da oranlar toplanmaz", en: "Stacking series whose total means nothing: average prices and rates do not add up" },
      { tr: "Zaman içinde onlarca noktayı izlemek; eğilim için `LineChart` daha rahat okunur", en: "Following dozens of points over time; `LineChart` reads trends more easily" },
      { tr: "Bütünün payları için çok dilimli `DonutChart`; beşten fazla dilimde burada çubuk daha doğrudur", en: "A many-sliced `DonutChart` for shares of a whole; past five slices, bars are the better pick" },
      { tr: "Sekizden fazla seri; 9. seri aynı renge döner, küçük olanları \"Diğer\" altında toplayın", en: "More than eight series; the ninth reuses a colour, so fold small ones into \"Other\"" },
    ],
  },
  anatomy: `<BarChart
  label="Accessible description"
  data={rows}
  x={(d) => d.month}
  series={[{ key: "plan", label: "Plan", slot: 1 }]}
  height={260}
  stacked
  horizontal
  format={(v) => money(v, lang)}
/>`,
  examples: [
    {
      id: "grouped",
      title: { tr: "Gruplu çubuklar", en: "Grouped bars" },
      body: { tr: "Birden çok seri varsayılan olarak yan yana çizilir. Plan ve gerçekleşen gibi aynı ölçekteki ölçüleri kategori içinde karşılaştırmak için uygundur. Birimi farklı ölçüleri burada yan yana koymayın; ikinci bir eksen yoktur ve olmamalıdır.", en: "Several series draw side by side by default. This suits measures on the same scale, such as plan and actual, compared within a category. Do not place measures with different units here; there is no second axis and there should not be." },
      example: {
        Demo: Grouped,
        block: true,
        code: `<BarChart
  label="Monthly order count: plan and actual"
  data={rows}
  x={(d) => d.month}
  series={[
    { key: "plan", label: "Plan", slot: 1 },
    { key: "actual", label: "Actual", slot: 2 },
  ]}
/>`,
      },
    },
    {
      id: "stacked",
      title: { tr: "Yığılmış çubuklar", en: "Stacked bars" },
      body: { tr: "`stacked` serileri üst üste koyar, eksen toplama göre ölçeklenir. Personel, kira ve lojistik toplandığında toplam gideri verir, bu yüzden burada doğru seçimdir. Yalnız en alttaki seri ortak bir taban üzerinde durur; diğerlerini aylar arasında karşılaştırmak zordur.", en: "`stacked` piles the series and the axis scales to the total. Staff, rent and logistics add up to total cost, which makes it the right pick here. Only the bottom series sits on a shared baseline, so the others are hard to compare across months." },
      example: {
        Demo: Stacked,
        block: true,
        code: `<BarChart
  stacked
  label="Monthly cost breakdown"
  data={rows}
  x={(d) => d.month}
  series={[
    { key: "staff", label: "Staff", slot: 1 },
    { key: "rent", label: "Rent", slot: 2 },
    { key: "logistics", label: "Logistics", slot: 3 },
    { key: "energy", label: "Energy", slot: 4 },
  ]}
  format={(v) => money(v, lang)}
/>`,
      },
    },
    {
      id: "horizontal",
      title: { tr: "Yatay çubuklar", en: "Horizontal bars" },
      body: { tr: "`horizontal` çubukları sağa uzatır. Müşteri adı gibi uzun etiketlerde adlar eğik yazılmaz; 22 karakteri geçen ad kısaltılır, tamamı tablo görünümünde ve ipucu başlığında kalır. Satır sayısı arttıkça `height` değerini de artırın; yatay çizimde etiketler seyreltilmez.", en: "`horizontal` runs the bars to the right. Long labels such as customer names stay level; a name past 22 characters is shortened, while the full text stays in the table view and the hint title. Raise `height` as rows grow, because horizontal labels are not thinned out." },
      example: {
        Demo: Horizontal,
        block: true,
        code: `<BarChart
  horizontal
  height={300}
  label="Open balance by customer"
  data={customers}
  x={(d) => d.name}
  series={[
    { key: "open", label: "Open balance", slot: 1 },
    { key: "overdue", label: "Overdue", slot: 2 },
  ]}
  format={(v) => money(v, lang)}
/>`,
      },
    },
    {
      id: "money",
      title: { tr: "Para biçimi", en: "Money format" },
      body: { tr: "`format` ipucundaki ve tablo görünümündeki sayıları biçimlendirir. Eksen yer kazanmak için her zaman dile uygun kısa biçimi kullanır: Türkçede `500 B`, İngilizcede `500K`. Seri tek ise gösterge çizilmez; adı `label` ve sayfa başlığı taşır. `value` hesaplanan bir değer okur.", en: "`format` shapes the numbers in the hint and the table view. To save room the axis always uses the short form of the language: `500 B` in Turkish, `500K` in English. A single series draws no legend, so `label` and the page heading name it. `value` reads a computed number." },
      example: {
        Demo: Money,
        block: true,
        code: `<BarChart
  height={220}
  label="Total monthly revenue"
  data={rows}
  x={(d) => d.month}
  series={[{ key: "total", label: "Revenue", value: (d) => d.marmara + d.ege + d.anadolu, slot: 1 }]}
  format={(v) => v.toLocaleString(lang, { style: "currency", currency: "TRY", maximumFractionDigits: 0 })}
/>`,
      },
    },
    {
      id: "slots",
      title: { tr: "Renk yuvaları", en: "Colour slots" },
      body: { tr: "Sekiz renk yuvası vardır: `--bt-chart-1` ile `--bt-chart-8`. `slot` verilen seri o rengi taşır, bu yüzden renk sıraya değil seriye bağlı kalır. Aşağıda Marmara gizliyken Ege yine turuncu kalır. `slot` verilmezse renk dizideki sıradan gelir ve süzünce kayar; süzülebilen grafiklerde `slot` yazın.", en: "There are eight colour slots: `--bt-chart-1` to `--bt-chart-8`. A series with `slot` wears that colour, so the colour stays with the series rather than its position. Below, the Aegean stays orange while Marmara is hidden. Without `slot` the colour comes from the array position and shifts when filtered, so write `slot` on any chart that can be filtered." },
      example: {
        Demo: Slots,
        block: true,
        code: `const all = [
  { key: "marmara", label: "Marmara", slot: 1 },
  { key: "ege", label: "Aegean", slot: 2 },
  { key: "anadolu", label: "Central Anatolia", slot: 3 },
];

<BarChart series={all.filter((s) => !hidden.includes(s.key))} data={rows} x={(d) => d.month} label="Monthly revenue" />`,
      },
    },
    {
      id: "empty",
      title: { tr: "Boş veri", en: "No data" },
      body: { tr: "`data` boşsa dil dosyasındaki `chart.empty` metni verilen `height` yüksekliğinde gösterilir, böylece yerleşim oynamaz.", en: "With empty `data`, the `chart.empty` text from the locale shows at the given `height`, so the layout stays put." },
      example: { Demo: Empty, block: true, code: `<BarChart height={160} label="Refunds this quarter" data={[]} x={(d) => d.month} series={series} />` },
    },
  ],
  a11y: [
    { tr: "Çizim alanı `role=\"img\"` taşır ve adını zorunlu `label` değerinden alır. `label` neyin gösterildiğini kısaca söylesin: \"Bölgelere göre aylık ciro\".", en: "The plot carries `role=\"img\"` and takes its name from the required `label`. Let `label` say briefly what is shown: \"Monthly revenue by region\"." },
    { tr: "Tablo görünümü: \"Tablo\" düğmesi aynı veriyi `caption`, sütun ve satır başlıkları olan gerçek bir `<table>` olarak açar. Düğme `aria-pressed` taşır. Ekran okuyucu kullananlar için asıl yol budur.", en: "Table view: the Table button opens the same data as a real `<table>` with a `caption` and column and row headers. The button carries `aria-pressed`. This is the main path for screen reader users." },
    { tr: "Çizim alanı odak alır; ok tuşları kategoriler arasında gezer ve ipucunu fareyle aynı biçimde açar.", en: "The plot takes focus; the arrow keys step through the categories and open the same hint as the mouse." },
    { tr: "İki ve daha çok seride gösterge her zaman çizilir, renk tek başına anlam taşımaz. İpucu değerin yanında seri adını da yazar.", en: "With two or more series a legend is always drawn, so colour never stands alone. The hint writes the series name beside each value." },
    { tr: "Dil değişince sayılar ve metinler `BtuiProvider` diline uyar; düğme metinleri dil dosyasından gelir.", en: "Numbers and text follow the `BtuiProvider` language, and the button text comes from the locale." },
  ],
  keyboard: [
    ["Tab", { tr: "Tablo düğmesine, ardından çizim alanına odaklanır", en: "Moves focus to the Table button, then the plot" }],
    ["→ / ↓", { tr: "Sonraki kategoriye geçer; ilk basışta birincisine gider", en: "Moves to the next category; the first press goes to the first one" }],
    ["← / ↑", { tr: "Önceki kategoriye geçer; ilk basışta sonuncusuna gider", en: "Moves to the previous category; the first press goes to the last one" }],
    ["Home", { tr: "İlk kategoriye gider", en: "Goes to the first category" }],
    ["End", { tr: "Son kategoriye gider", en: "Goes to the last category" }],
    ["Esc", { tr: "İpucunu kapatır", en: "Closes the hint" }],
  ],
  api: [
    {
      name: "BarChart",
      description: { tr: "`BarChart<D>` veri tipini `data` üzerinden çıkarır. Ref ve yerel öznitelikler iletilmez.", en: "`BarChart<D>` infers the data type from `data`. The ref and native attributes are not forwarded." },
      props: [
        { name: "data", type: "D[]", required: true, description: { tr: "Her öğe bir kategoridir", en: "Each item is one category" } },
        { name: "x", type: "(datum: D) => string", required: true, description: { tr: "Kategori eksenindeki etiket", en: "Label on the category axis" } },
        { name: "series", type: "ChartSeries<D>[]", required: true, description: { tr: "Çizilecek seriler", en: "The series to draw" } },
        { name: "label", type: "string", required: true, description: { tr: "Yardımcı teknoloji için kısa açıklama; tablo başlığı da olur", en: "Short description for assistive technology; also the table caption" } },
        { name: "height", type: "number", default: "260", description: { tr: "Çizim alanı yüksekliği, piksel. Genişlik kabı doldurur", en: "Plot height in pixels. The width fills the container" } },
        { name: "animated", type: "boolean", default: "true", description: { tr: "Giriş ve güncelleme hareketi. Hareketi azaltan kullanıcıda hep kapalıdır", en: "Entrance and update motion. Always off for people who ask for reduced motion" } },
        { name: "format", type: "(value: number) => string", description: { tr: "İpucu ve tablo sayıları. Eksen kısa biçimde kalır", en: "Numbers in the hint and table. The axis keeps the short form" } },
        { name: "stacked", type: "boolean", description: { tr: "Serileri üst üste koyar", en: "Piles the series on top of each other" } },
        { name: "horizontal", type: "boolean", description: { tr: "Çubukları yatay çizer; uzun adlara uygundur", en: "Runs the bars sideways; suits long names" } },
        { name: "className", type: "string", description: { tr: "Dış `figure` öğesine eklenir", en: "Added to the outer `figure`" } },
      ],
    },
    {
      name: "ChartSeries",
      props: [
        { name: "key", type: "string", required: true, description: { tr: "Seri kimliği. `value` yoksa veriden bu ad okunur", en: "Series id. Without `value`, the field of this name is read" } },
        { name: "label", type: "string", required: true, description: { tr: "Gösterge, ipucu ve tablo başlığındaki ad", en: "Name in the legend, hint and table header" } },
        { name: "value", type: "(datum: D) => number | null | undefined", description: { tr: "Sayıyı okur. Sayı olmayan değer boş sayılır, çubukta sıfır çizilir", en: "Reads the number. Anything else counts as empty and draws as zero on a bar" } },
        { name: "slot", type: "number", default: "index % 8 + 1", description: { tr: "1 ile 8 arası renk yuvası. Rengi seriye bağlar", en: "Colour slot from 1 to 8. Ties the colour to the series" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-chart-1 ... --bt-chart-8", kind: "var", description: { tr: "Sekiz renk yuvası. Koyu temada ayrı değerleri vardır", en: "The eight colour slots. The dark theme has its own values" } },
    { name: "--bt-line", kind: "var", description: { tr: "Yatay kılavuz çizgileri", en: "Horizontal grid lines" } },
    { name: "--bt-border", kind: "var", description: { tr: "Sıfır çizgisi", en: "Zero line" } },
    { name: "--bt-muted", kind: "var", description: { tr: "Eksen yazıları", en: "Axis text" } },
    { name: "--bt-hover", kind: "var", description: { tr: "Etkin kategorinin zemini", en: "Background of the active category" } },
    { name: "--bt-shadow-pop", kind: "var", description: { tr: "İpucu gölgesi", en: "Hint shadow" } },
    { name: "data-active", kind: "data", description: { tr: "`.bt-chart-band` üzerinde, etkin kategoride bulunur", en: "On `.bt-chart-band`, present on the active category" } },
    { name: "data-shape", kind: "data", description: { tr: "Gösterge işaretinin biçimi: `box` ya da `line`", en: "Shape of the legend mark: `box` or `line`" } },
  ],
  related: ["line-chart", "area-chart", "donut-chart", "sparkline", "data-grid"],
});
