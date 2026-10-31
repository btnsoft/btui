import { useState } from "react";
import { IconAlertTriangle, IconCash, IconClock, IconReceipt, IconReceiptRefund, IconTruckDelivery } from "@tabler/icons-react";
import { Kpi, KpiGrid } from "btui";
import { money, ORDERS, STATUS_LABEL, type OrderStatus } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Dashboard() {
  const t = useText();
  const lang = useLang();
  const revenue = ORDERS.filter((o) => o.status === "done").reduce((sum, o) => sum + o.amount, 0);
  const pending = ORDERS.filter((o) => o.status === "pending").length;
  return (
    <KpiGrid>
      <Kpi label={t({ tr: "Aylık ciro", en: "Monthly revenue" })} value={money(revenue, lang)} icon={<IconCash size={15} />} trend={{ value: t({ tr: "%8", en: "8%" }), direction: "up" }} note={t({ tr: "geçen aya göre", en: "vs last month" })} />
      <Kpi label={t({ tr: "Onay bekleyen", en: "Awaiting approval" })} value={pending} icon={<IconClock size={15} />} tone="warn" note={t({ tr: "En eskisi 5 gün önce", en: "Oldest from 5 days ago" })} />
      <Kpi label={t({ tr: "Geciken fatura", en: "Overdue invoices" })} value={2} icon={<IconAlertTriangle size={15} />} tone="danger" note={money(107880, lang)} />
    </KpiGrid>
  );
}

function Tones() {
  const t = useText();
  return (
    <KpiGrid style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
      <Kpi label={t({ tr: "Bu hafta teslim", en: "Delivered this week" })} value={128} />
      <Kpi tone="ok" label={t({ tr: "Zamanında teslim", en: "On time delivery" })} value={t({ tr: "%97", en: "97%" })} />
      <Kpi tone="warn" label={t({ tr: "Stoku azalan ürün", en: "Low stock items" })} value={14} />
      <Kpi tone="danger" label={t({ tr: "İade oranı", en: "Return rate" })} value={t({ tr: "%6,4", en: "6.4%" })} />
    </KpiGrid>
  );
}

function Trends() {
  const t = useText();
  const lang = useLang();
  return (
    <KpiGrid>
      <Kpi label={t({ tr: "Tahsilat", en: "Collections" })} value={money(642000, lang)} trend={{ value: t({ tr: "%12", en: "12%" }), direction: "up" }} note={t({ tr: "geçen aya göre", en: "vs last month" })} />
      <Kpi label={t({ tr: "Yeni müşteri", en: "New customers" })} value={9} trend={{ value: "4", direction: "down" }} note={t({ tr: "geçen çeyreğe göre", en: "vs last quarter" })} />
    </KpiGrid>
  );
}

function GoodNews() {
  const t = useText();
  const lang = useLang();
  return (
    <KpiGrid>
      <Kpi icon={<IconTruckDelivery size={15} />} label={t({ tr: "Kargo gideri", en: "Shipping costs" })} value={money(38400, lang)} trend={{ value: t({ tr: "%9", en: "9%" }), direction: "down", good: true }} note={t({ tr: "geçen aya göre", en: "vs last month" })} />
      <Kpi icon={<IconReceiptRefund size={15} />} label={t({ tr: "İade edilen tutar", en: "Refunded amount" })} value={money(12750, lang)} trend={{ value: t({ tr: "%4", en: "4%" }), direction: "up", good: false }} note={t({ tr: "geçen aya göre", en: "vs last month" })} />
    </KpiGrid>
  );
}

function Filter() {
  const t = useText();
  const [status, setStatus] = useState<OrderStatus>("open");
  const statuses: OrderStatus[] = ["open", "pending", "done"];
  const rows = ORDERS.filter((o) => o.status === status);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <KpiGrid>
        {statuses.map((s) => <Kpi key={s} label={t(STATUS_LABEL[s])} value={ORDERS.filter((o) => o.status === s).length} active={status === s} onClick={() => setStatus(s)} />)}
      </KpiGrid>
      <p role="status" style={{ margin: 0, color: "var(--bt-text-2)" }}>
        {t({ tr: `${t(STATUS_LABEL[status])} durumunda ${rows.length} sipariş listeleniyor. İlk kayıt: ${rows[0]?.no}`, en: `Listing ${rows.length} orders with status ${t(STATUS_LABEL[status])}. First record: ${rows[0]?.no}` })}
      </p>
    </div>
  );
}

function Icons() {
  const t = useText();
  return (
    <KpiGrid>
      <Kpi icon={<IconTruckDelivery size={15} />} label={t({ tr: "Yoldaki sevkiyat", en: "Shipments on the road" })} value={23} />
      <Kpi icon={<IconReceipt size={15} />} label={t({ tr: "Kesilen fatura", en: "Invoices issued" })} value={186} />
    </KpiGrid>
  );
}

export default definePage({
  summary: { tr: "Bir işin durumunu tek sayıyla özetler. Pano ekranının en üstünde durur, kullanıcıya önce neye bakması gerektiğini söyler.", en: "Sums up the state of a business in one number. It sits at the top of a dashboard and tells people where to look first." },
  imports: 'import { Kpi, KpiGrid } from "btui";',
  hero: {
    Demo: Dashboard,
    block: true,
    code: `<KpiGrid>
  <Kpi label="Monthly revenue" value={money(revenue, lang)} icon={<IconCash size={15} />} trend={{ value: "8%", direction: "up" }} note="vs last month" />
  <Kpi label="Awaiting approval" value={pending} icon={<IconClock size={15} />} tone="warn" note="Oldest from 5 days ago" />
  <Kpi label="Overdue invoices" value={2} icon={<IconAlertTriangle size={15} />} tone="danger" note={money(107880, lang)} />
</KpiGrid>`,
  },
  use: {
    do: [
      { tr: "Ciro, açık sipariş, geciken fatura gibi tek bakışta okunacak sayılar", en: "Numbers read at a glance: revenue, open orders, overdue invoices" },
      { tr: "Geçen döneme göre değişimi göstermek", en: "Showing the change against the previous period" },
      { tr: "Filtrelenmiş bir listeye geçiş sağlamak; `onClick` verin", en: "Leading to a filtered list; pass `onClick`" },
    ],
    dont: [
      { tr: "Bir ekranda altıdan çok gösterge; hepsi önemliyse hiçbiri önemli değildir", en: "More than six on a screen; when everything is important, nothing is" },
      { tr: "Uzun metinler; değer kısa bir sayı ya da tutar olmalıdır", en: "Long text; the value should be a short number or amount" },
      { tr: "Süslemek için renk; `tone` yalnız dikkat isteyen durumlar içindir", en: "Colour as decoration; `tone` is only for states that need attention" },
    ],
  },
  anatomy: `<KpiGrid>
  <Kpi
    icon={<Icon />}
    label="Label"
    value="Value"
    trend={{ value: "8%", direction: "up", good: true }}
    note="Note"
    active={false}
    onClick={open}
  />
</KpiGrid>`,
  examples: [
    {
      id: "tones",
      title: { tr: "Tonlar", en: "Tones" },
      body: { tr: "`tone` yalnız sayıyı boyar, kart nötr kalır. Böylece pano sakin görünür, dikkat isteyen değer yine de öne çıkar.", en: "`tone` colours the number only and the card stays neutral. The dashboard stays calm while the value that needs attention still stands out." },
      example: {
        Demo: Tones,
        block: true,
        code: `<KpiGrid style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
  <Kpi label="Delivered this week" value={128} />
  <Kpi tone="ok" label="On time delivery" value="97%" />
  <Kpi tone="warn" label="Low stock items" value={14} />
  <Kpi tone="danger" label="Return rate" value="6.4%" />
</KpiGrid>`,
      },
    },
    {
      id: "trend",
      title: { tr: "Eğilim", en: "Trend" },
      body: { tr: "`trend` önceki döneme göre değişimi gösterir. `direction` oku belirler. `good` verilmezse `up` yeşil, `down` kırmızı görünür.", en: "`trend` shows the change against the previous period. `direction` sets the arrow. Without `good`, `up` shows green and `down` shows red." },
      example: {
        Demo: Trends,
        block: true,
        code: `<Kpi label="Collections" value={money(642000, lang)} trend={{ value: "12%", direction: "up" }} note="vs last month" />
<Kpi label="New customers" value={9} trend={{ value: "4", direction: "down" }} note="vs last quarter" />`,
      },
    },
    {
      id: "good-news",
      title: { tr: "Düşüşün iyi olduğu ölçümler", en: "When a fall is good news" },
      body: { tr: "Ok yönü ile renk birbirinden bağımsızdır: `trend.good` rengi belirler. Gider ve iade gibi ölçümlerde düşüş iyi haberdir, `good: true` yeşil gösterir; artış kötü haberse `good: false` kırmızı gösterir. Ok yine gerçek yönü söyler.", en: "The arrow and the colour are independent: `trend.good` sets the colour. For measures such as costs and refunds a fall is good news, so `good: true` shows green, and when a rise is bad news `good: false` shows red. The arrow still tells the real direction." },
      example: {
        Demo: GoodNews,
        block: true,
        code: `<Kpi label="Shipping costs" value={money(38400, lang)} trend={{ value: "9%", direction: "down", good: true }} note="vs last month" />
<Kpi label="Refunded amount" value={money(12750, lang)} trend={{ value: "4%", direction: "up", good: false }} note="vs last month" />`,
      },
    },
    {
      id: "clickable",
      title: { tr: "Tıklanabilir gösterge", en: "Clickable KPI" },
      body: { tr: "`onClick` verilince gösterge gerçek bir `<button>` olur. Sayıya basıp ilgili listeye geçmek pano ekranlarının en sık kullanılan yoludur. Filtre gibi çalışan kartta `active` seçili olanı işaretler: kart vurgulu kenarlık alır ve `aria-pressed` taşır. `active` yalnız `onClick` ile birlikte etkilidir.", en: "With `onClick` the KPI becomes a real `<button>`. Pressing a number to reach the matching list is the most common path on a dashboard. On a card that works as a filter, `active` marks the one in use: it gets an accent border and carries `aria-pressed`. `active` only works together with `onClick`." },
      example: {
        Demo: Filter,
        block: true,
        code: `<KpiGrid>
  <Kpi label="Open" value={15} active={status === "open"} onClick={() => setStatus("open")} />
  <Kpi label="Pending" value={8} active={status === "pending"} onClick={() => setStatus("pending")} />
  <Kpi label="Done" value={11} active={status === "done"} onClick={() => setStatus("done")} />
</KpiGrid>`,
      },
    },
    {
      id: "grid",
      title: { tr: "Izgara", en: "Grid" },
      body: { tr: "`KpiGrid` kartları en az 190px genişlikte sütunlara dizer ve sığmayanı alt satıra alır, ek bir kırılım yazmanız gerekmez. Az gösterge olduğunda satırın sonu boş kalır. Sütun sayısını sabitlemek için `style` ile `gridTemplateColumns` verin.", en: "`KpiGrid` lays cards out in columns at least 190px wide and wraps what does not fit, with no breakpoints to write. With few KPIs the end of the row stays empty. To fix the number of columns, set `gridTemplateColumns` through `style`." },
      example: {
        Demo: Icons,
        block: true,
        code: `<KpiGrid>
  <Kpi icon={<IconTruckDelivery size={15} />} label="Shipments on the road" value={23} />
  <Kpi icon={<IconReceipt size={15} />} label="Invoices issued" value={186} />
</KpiGrid>`,
      },
    },
  ],
  a11y: [
    { tr: "`onClick` varsa `<button>`, yoksa `<div>` çizer; salt okunur gösterge klavye sırasına girmez.", en: "Renders a `<button>` with `onClick` and a `<div>` without, so a read-only KPI stays out of the tab order." },
    { tr: "`active` verilen kart `aria-pressed` taşır; ekran okuyucu seçili filtreyi basılı düğme olarak duyurur.", en: "A card with `active` carries `aria-pressed`, so a screen reader announces the filter in use as a pressed button." },
    { tr: "Eğilim yönü hem ok hem renkle gösterilir, renk ayrımı yapamayan kullanıcılar da okuyabilir.", en: "Trend direction shows through both an arrow and colour, so it holds for colour blind users." },
    { tr: "`tone` yalnız renktir. Durum önemliyse `label` ya da `note` içinde de söyleyin.", en: "`tone` is colour alone. If the state matters, say it in `label` or `note` too." },
  ],
  keyboard: [
    ["Tab", { tr: "`onClick` verilmiş göstergeye odaklanır", en: "Moves focus to a KPI with `onClick`" }],
    ["Enter", { tr: "`onClick` çalıştırır", en: "Runs `onClick`" }],
    ["Space", { tr: "`onClick` çalıştırır", en: "Runs `onClick`" }],
  ],
  api: [
    {
      name: "Kpi",
      description: { tr: "Yerel öznitelikler iletilmez; yalnız aşağıdaki özellikler geçerlidir.", en: "Native attributes are not forwarded; only the props below apply." },
      props: [
        { name: "label", type: "ReactNode", required: true, description: { tr: "Ölçümün adı", en: "Name of the measure" } },
        { name: "value", type: "ReactNode", required: true, description: { tr: "Ana değer", en: "Main value" } },
        { name: "note", type: "ReactNode", description: { tr: "Değerin altındaki kısa açıklama", en: "Short text under the value" } },
        { name: "trend", type: '{ value: ReactNode; direction: "up" | "down"; good?: boolean }', description: { tr: "Önceki döneme göre değişim, örneğin `%8`. `good` rengi belirler; verilmezse `up` iyi sayılır", en: "Change against the previous period, such as `8%`. `good` sets the colour; without it, `up` counts as good" } },
        { name: "icon", type: "ReactNode", description: { tr: "Etiketten önce gösterilir", en: "Shown before the label" } },
        { name: "tone", type: '"neutral" | "ok" | "warn" | "danger"', default: '"neutral"', description: { tr: "Yalnız sayıyı boyar", en: "Colours the number only" } },
        { name: "onClick", type: "() => void", description: { tr: "Göstergeyi `<button>` yapar", en: "Turns the KPI into a `<button>`" } },
        { name: "active", type: "boolean", description: { tr: "Tıklanabilir kartı kullanılan filtre olarak işaretler", en: "Marks a clickable card as the filter in use" } },
        { name: "className", type: "string", description: { tr: "Dış öğeye eklenir", en: "Added to the outer element" } },
      ],
    },
    {
      name: "KpiGrid",
      description: { tr: "Yerel `div` öznitelikleri iletilir.", en: "Native `div` attributes are forwarded." },
      props: [
        { name: "className", type: "string", description: { tr: "Izgaraya eklenir", en: "Added to the grid" } },
        { name: "children", type: "ReactNode", description: { tr: "`Kpi` öğeleri", en: "`Kpi` elements" } },
      ],
    },
  ],
  styling: [
    { name: "data-tone", kind: "data", description: { tr: "`.bt-kpi` üzerinde seçili ton", en: "The current tone on `.bt-kpi`" } },
    { name: "data-active", kind: "data", description: { tr: "`active` açık düğme kartta bulunur", en: "On a button card with `active` on" } },
    { name: "data-good", kind: "data", description: { tr: "`.bt-kpi-trend` üzerinde `true` ya da `false`", en: "`true` or `false` on `.bt-kpi-trend`" } },
    { name: "--bt-ok", kind: "var", description: { tr: "`ok` sayısı ve iyi yöndeki eğilim", en: "`ok` number and a trend in the good direction" } },
    { name: "--bt-warn", kind: "var", description: { tr: "`warn` sayısı", en: "`warn` number" } },
    { name: "--bt-danger", kind: "var", description: { tr: "`danger` sayısı ve kötü yöndeki eğilim", en: "`danger` number and a trend in the bad direction" } },
    { name: "--bt-muted", kind: "var", description: { tr: "Etiket ve not rengi", en: "Label and note colour" } },
  ],
  related: ["card", "data-table", "badge", "progress", "sparkline"],
});
