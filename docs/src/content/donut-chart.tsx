import { useState } from "react";
import { DonutChart, Select } from "btui";
import { CITY_NAMES, money, ORDERS, STATUS_LABEL, type OrderStatus } from "../lib/data";
import { useLang, useText, type Text } from "../lib/i18n";
import { definePage } from "../lib/schema";

type Share = { key: string; name: Text; amount: number };

const SPENDING: Share[] = [
  { key: "staff", name: { tr: "Personel", en: "Staff" }, amount: 228000 },
  { key: "logistics", name: { tr: "Lojistik", en: "Logistics" }, amount: 64000 },
  { key: "rent", name: { tr: "Kira", en: "Rent" }, amount: 68000 },
  { key: "energy", name: { tr: "Enerji", en: "Energy" }, amount: 23000 },
];

const CITY_SALES = CITY_NAMES.map((city) => ({ city, amount: ORDERS.filter((o) => o.city === city).reduce((sum, o) => sum + o.amount, 0) }));

const STATUSES: OrderStatus[] = ["open", "pending", "done", "cancelled"];

function Hero() {
  const t = useText();
  const lang = useLang();
  return (
    <DonutChart
      label={t({ tr: "Ekim gider dağılımı", en: "October cost breakdown" })}
      data={SPENDING}
      x={(d) => t(d.name)}
      value={(d) => d.amount}
      format={(v) => money(v, lang)}
    />
  );
}

function Other() {
  const t = useText();
  const lang = useLang();
  const [slices, setSlices] = useState("6");
  return (
    <div className="d-stack-wide">
      <div>
        <Select
          variant="filter"
          label={t({ tr: "En çok dilim", en: "Most slices" })}
          value={slices}
          onChange={setSlices}
          options={[{ value: "4", label: "4" }, { value: "5", label: "5" }, { value: "6", label: "6" }]}
        />
      </div>
      <DonutChart
        maxSlices={Number(slices)}
        label={t({ tr: "İllere göre sipariş tutarı", en: "Order amount by city" })}
        data={CITY_SALES}
        x={(d) => d.city}
        value={(d) => d.amount}
        format={(v) => money(v, lang)}
      />
    </div>
  );
}

function Centre() {
  const t = useText();
  const lang = useLang();
  const done = ORDERS.filter((o) => o.status === "done").length;
  const rate = new Intl.NumberFormat(lang, { style: "percent" }).format(done / ORDERS.length);
  return (
    <DonutChart
      height={200}
      label={t({ tr: "Sipariş durumları", en: "Order statuses" })}
      data={STATUSES}
      x={(s) => t(STATUS_LABEL[s])}
      value={(s) => ORDERS.filter((o) => o.status === s).length}
      centre={<><b>{rate}</b><span>{t({ tr: "tamamlandı", en: "done" })}</span></>}
    />
  );
}

function TwoSlices() {
  const t = useText();
  const lang = useLang();
  return (
    <DonutChart
      height={180}
      label={t({ tr: "Kredi limiti kullanımı", en: "Credit limit usage" })}
      data={[{ name: t({ tr: "Kullanılan", en: "Used" }), amount: 84250 }, { name: t({ tr: "Kalan", en: "Remaining" }), amount: 165750 }]}
      x={(d) => d.name}
      value={(d) => d.amount}
      format={(v) => money(v, lang)}
    />
  );
}

export default definePage({
  summary: { tr: "Bir bütünün az sayıda parçaya nasıl bölündüğünü gösterir. Dilimler büyükten küçüğe dizilir, küçük olanlar \"Diğer\" altında toplanır, payın yüzdesi yandaki listede yazar.", en: "Shows how a whole splits into a few parts. Slices sort from large to small, small ones fold into \"Other\" and each share is written in the list beside it." },
  imports: 'import { DonutChart, type DonutChartProps } from "btui";',
  hero: {
    Demo: Hero,
    block: true,
    code: `<DonutChart
  label="October cost breakdown"
  data={costs}
  x={(d) => d.name}
  value={(d) => d.amount}
  format={(v) => money(v, lang)}
/>`,
  },
  use: {
    do: [
      { tr: "Toplamı yüzde yüz eden birkaç parça: gider dağılımı, durum oranları", en: "A few parts of a 100 percent whole: cost breakdown, status shares" },
      { tr: "En çok beş altı dilim; gerisi `maxSlices` ile \"Diğer\" olur", en: "Five or six slices at most; `maxSlices` turns the rest into \"Other\"" },
      { tr: "Ortada tek bir özet sayı; `centre` toplamın yerine anlamlı bir oran yazar", en: "One summary number in the middle; `centre` writes a meaningful rate in place of the total" },
      { tr: "Kesin değer için tablo görünümü; \"Tablo\" düğmesi dilimleri satır olarak açar", en: "The table view for exact values; the Table button opens the slices as rows" },
    ],
    dont: [
      { tr: "Çok dilim; altıdan fazlası okunmaz, sıralı karşılaştırma için `BarChart` kullanın", en: "Many slices; past six it stops reading, so use `BarChart` for a ranked comparison" },
      { tr: "Toplamı bütün oluşturmayan değerler; birbirini kesen kategoriler pay değildir", en: "Values that do not form a whole; overlapping categories are not shares" },
      { tr: "Zaman içindeki değişim; iki halkayı yan yana okumak zordur, `LineChart` seçin", en: "Change over time; two rings side by side are hard to read, so pick `LineChart`" },
      { tr: "Dilimlerin rengini sabit sanmak; renk yuvası sıraya göre atanır, `slot` yoktur ve dilim büyüklüğü değişince renk de kayar", en: "Assuming slice colours are fixed; the colour slot follows the rank, there is no `slot`, and a slice changes colour when its size changes rank" },
      { tr: "Çift eksen ya da ikinci ölçü aramak; halka tek bir ölçü içindir", en: "Looking for a second axis or measure; a ring carries one measure only" },
    ],
  },
  anatomy: `<DonutChart
  label="Accessible description"
  data={rows}
  x={(d) => d.name}
  value={(d) => d.amount}
  centre={<><b>Value</b><span>Note</span></>}
  maxSlices={6}
  height={240}
  format={(v) => money(v, lang)}
/>`,
  examples: [
    {
      id: "other",
      title: { tr: "Diğer dilimi", en: "The Other slice" },
      body: { tr: "`maxSlices` halkadaki en fazla dilim sayısıdır ve \"Diğer\" de buna dahildir. Veri bu sayıyı aşarsa en büyük dilimler kalır, gerisi tek dilimde toplanır. Varsayılan 6'dır. Metin dil dosyasındaki `chart.other` değerinden gelir. Sıfır ya da eksi değerler çizilmez. Tablo görünümü de katlanmış dilimleri gösterir; ilin tek tek tutarı için kendi tablonuzu sunun.", en: "`maxSlices` is the most slices the ring can hold, and \"Other\" counts as one. When the data goes past it, the largest stay and the rest fold into one slice. The default is 6. The text comes from `chart.other` in the locale. Zero or negative values are not drawn. The table view shows the folded slices too, so offer a table of your own for each city's amount." },
      example: {
        Demo: Other,
        block: true,
        code: `<DonutChart
  maxSlices={4}
  label="Order amount by city"
  data={cities}
  x={(d) => d.city}
  value={(d) => d.amount}
  format={(v) => money(v, lang)}
/>`,
      },
    },
    {
      id: "centre",
      title: { tr: "Özel orta alan", en: "Custom centre" },
      body: { tr: "Orta alan varsayılan olarak toplamı ve dildeki \"Toplam\" sözcüğünü yazar. `centre` bunun yerine geçer. Üst satır için `<b>`, alt satır için `<span>` kullanın. Bir dilimin üzerine gelince orta alan o dilimin değerini gösterir, çıkınca sizin içeriğinize döner.", en: "By default the centre writes the total and the word \"Total\" in the language. `centre` takes its place. Use `<b>` for the top line and `<span>` for the bottom line. Hovering a slice shows its value there, and leaving brings your content back." },
      example: {
        Demo: Centre,
        block: true,
        code: `<DonutChart
  height={200}
  label="Order statuses"
  data={statuses}
  x={(s) => labels[s]}
  value={(s) => countOf(s)}
  centre={<><b>26%</b><span>done</span></>}
/>`,
      },
    },
    {
      id: "two-slices",
      title: { tr: "İki dilim", en: "Two slices" },
      body: { tr: "Kullanılan ve kalan gibi iki dilimde halka en sade hâlindedir. Ancak bir sınırın dolma oranı için `Progress` çoğu zaman daha az yer kaplar. `height` halkanın çapıdır; yandaki liste kalan genişliğe yerleşir, sığmazsa alta iner.", en: "With two slices such as used and remaining, the ring is at its simplest. For how full a limit is, though, `Progress` usually takes less room. `height` is the ring's diameter; the list sits in the remaining width and drops below when it does not fit." },
      example: {
        Demo: TwoSlices,
        block: true,
        code: `<DonutChart
  height={180}
  label="Credit limit usage"
  data={[{ name: "Used", amount: 84250 }, { name: "Remaining", amount: 165750 }]}
  x={(d) => d.name}
  value={(d) => d.amount}
  format={(v) => money(v, lang)}
/>`,
      },
    },
  ],
  a11y: [
    { tr: "Halka `role=\"img\"` taşır ve adını zorunlu `label` değerinden alır.", en: "The ring carries `role=\"img\"` and takes its name from the required `label`." },
    { tr: "Tablo görünümü: \"Tablo\" düğmesi dilimleri `caption` ve başlıkları olan gerçek bir `<table>` olarak açar. Düğme `aria-pressed` taşır.", en: "Table view: the Table button opens the slices as a real `<table>` with a `caption` and headers. The button carries `aria-pressed`." },
    { tr: "Yandaki liste her dilimin adını ve yüzdesini metinle yazar; renk tek başına kalmaz.", en: "The list beside the ring writes each slice's name and percentage in text, so colour does not stand alone." },
    { tr: "Halka odak alır; ok tuşları dilimler arasında gezer, değer orta alanda okunur.", en: "The ring takes focus; the arrow keys step through the slices and the value reads in the centre." },
  ],
  keyboard: [
    ["Tab", { tr: "Tablo düğmesine, ardından halkaya odaklanır", en: "Moves focus to the Table button, then the ring" }],
    ["→ / ↓", { tr: "Sonraki dilime geçer; ilk basışta en büyüğüne gider", en: "Moves to the next slice; the first press goes to the largest" }],
    ["← / ↑", { tr: "Önceki dilime geçer; ilk basışta en küçüğüne gider", en: "Moves to the previous slice; the first press goes to the smallest" }],
    ["Home", { tr: "İlk dilime gider", en: "Goes to the first slice" }],
    ["End", { tr: "Son dilime gider", en: "Goes to the last slice" }],
    ["Esc", { tr: "Vurguyu kaldırır, orta alan özete döner", en: "Clears the highlight and the centre returns to the summary" }],
  ],
  api: [
    {
      name: "DonutChart",
      description: { tr: "`DonutChart<D>` veri tipini `data` üzerinden çıkarır. Ref ve yerel öznitelikler iletilmez.", en: "`DonutChart<D>` infers the data type from `data`. The ref and native attributes are not forwarded." },
      props: [
        { name: "data", type: "D[]", required: true, description: { tr: "Her öğe bir dilimdir; sıfırdan büyük olanlar çizilir", en: "Each item is a slice; those above zero are drawn" } },
        { name: "x", type: "(datum: D) => string", required: true, description: { tr: "Dilim adı. Benzersiz olmalıdır", en: "Slice name. It must be unique" } },
        { name: "value", type: "(datum: D) => number", required: true, description: { tr: "Dilimin değeri", en: "The value of the slice" } },
        { name: "label", type: "string", required: true, description: { tr: "Yardımcı teknoloji için kısa açıklama; tablo başlığı da olur", en: "Short description for assistive technology; also the table caption" } },
        { name: "height", type: "number", default: "240", description: { tr: "Halkanın çapı, piksel", en: "Diameter of the ring in pixels" } },
        { name: "format", type: "(value: number) => string", description: { tr: "Orta alan ve tablo sayıları", en: "Numbers in the centre and the table" } },
        { name: "slot", type: "(datum: D) => number", description: { tr: "Dilimin renk yuvası; sıralama değişse de renk dilimde kalır. Varsayılan sıradır", en: "Colour slot of a slice, so its colour survives rank changes. Defaults to rank" } },
        { name: "animated", type: "boolean", default: "true", description: { tr: "Giriş ve güncelleme hareketi. Hareketi azaltan kullanıcıda hep kapalıdır", en: "Entrance and update motion. Always off for people who ask for reduced motion" } },
        { name: "centre", type: "ReactNode", default: "total", description: { tr: "Orta alan. Dilim etkinken onun değeri gösterilir", en: "The middle. While a slice is active its value shows instead" } },
        { name: "maxSlices", type: "number", default: "6", description: { tr: "\"Diğer\" dahil en fazla dilim sayısı", en: "Most slices, counting \"Other\"" } },
        { name: "className", type: "string", description: { tr: "Dış `figure` öğesine eklenir", en: "Added to the outer `figure`" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-chart-1 ... --bt-chart-8", kind: "var", description: { tr: "Sekiz renk yuvası. Dilimler büyüklük sırasıyla yuvaları kullanır", en: "The eight colour slots. Slices use them in order of size" } },
    { name: "--bt-hover", kind: "var", description: { tr: "Listedeki etkin satırın zemini", en: "Background of the active row in the list" } },
    { name: "--bt-text", kind: "var", description: { tr: "Orta alan ve yüzde rengi", en: "Centre and percentage colour" } },
    { name: "--bt-muted", kind: "var", description: { tr: "Orta alandaki alt satır", en: "Lower line in the centre" } },
    { name: "data-active", kind: "data", description: { tr: "`.bt-donut-legend li` üzerinde, etkin dilimde bulunur", en: "On `.bt-donut-legend li`, present on the active slice" } },
    { name: "data-shape", kind: "data", description: { tr: "Liste işaretinin biçimi: burada `box`", en: "Shape of the list mark: `box` here" } },
  ],
  related: ["bar-chart", "progress", "kpi", "card"],
});
