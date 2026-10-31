import { useState } from "react";
import { Chip, ChipGroup, DataTable, type Column } from "btui";
import { money, ORDERS, STATUS_LABEL, type Order, type OrderStatus } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const CITIES = ["Ankara", "İstanbul", "İzmir", "Bursa", "Konya"];
const STATUSES: OrderStatus[] = ["open", "pending", "done", "cancelled"];

function SingleFilter() {
  const t = useText();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  return (
    <ChipGroup aria-label={t({ tr: "Sipariş durumu", en: "Order status" })}>
      <Chip active={status === "all"} onClick={() => setStatus("all")}>{t({ tr: "Tümü", en: "All" })}</Chip>
      {STATUSES.map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{t(STATUS_LABEL[s])}</Chip>)}
    </ChipGroup>
  );
}

function Counts() {
  const t = useText();
  const [status, setStatus] = useState<OrderStatus>("open");
  return (
    <ChipGroup aria-label={t({ tr: "Sipariş durumu", en: "Order status" })}>
      {STATUSES.map((s) => <Chip key={s} active={status === s} count={ORDERS.filter((o) => o.status === s).length} onClick={() => setStatus(s)}>{t(STATUS_LABEL[s])}</Chip>)}
    </ChipGroup>
  );
}

function Multi() {
  const t = useText();
  const [cities, setCities] = useState<string[]>(["İstanbul", "İzmir"]);
  const toggle = (city: string) => setCities((all) => (all.includes(city) ? all.filter((c) => c !== city) : [...all, city]));
  return (
    <ChipGroup aria-label={t({ tr: "Şehirler", en: "Cities" })}>
      {CITIES.map((city) => <Chip key={city} active={cities.includes(city)} onClick={() => toggle(city)}>{city}</Chip>)}
    </ChipGroup>
  );
}

function Tones() {
  const t = useText();
  const [tone, setTone] = useState("late");
  return (
    <ChipGroup aria-label={t({ tr: "Fatura durumu", en: "Invoice status" })}>
      <Chip tone="ok" active={tone === "paid"} onClick={() => setTone("paid")}>{t({ tr: "Ödendi", en: "Paid" })}</Chip>
      <Chip tone="warn" active={tone === "due"} onClick={() => setTone("due")}>{t({ tr: "Vadesi yakın", en: "Due soon" })}</Chip>
      <Chip tone="danger" active={tone === "late"} onClick={() => setTone("late")}>{t({ tr: "Gecikti", en: "Overdue" })}</Chip>
      <Chip tone="info" active={tone === "new"} onClick={() => setTone("new")}>{t({ tr: "Yeni", en: "New" })}</Chip>
      <Chip tone="neutral" active={tone === "draft"} onClick={() => setTone("draft")}>{t({ tr: "Taslak", en: "Draft" })}</Chip>
    </ChipGroup>
  );
}

function useBandTable() {
  const t = useText();
  const lang = useLang();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const rows = (status === "all" ? ORDERS : ORDERS.filter((o) => o.status === status)).slice(0, 4);
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), cell: (o) => <span className="bt-mono">{o.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", cell: (o) => money(o.amount, lang) },
  ];
  const chips = (
    <ChipGroup aria-label={t({ tr: "Sipariş durumu", en: "Order status" })}>
      <Chip active={status === "all"} onClick={() => setStatus("all")}>{t({ tr: "Tümü", en: "All" })}</Chip>
      <Chip tone="info" active={status === "open"} onClick={() => setStatus("open")}>{t(STATUS_LABEL.open)}</Chip>
      <Chip tone="warn" active={status === "pending"} onClick={() => setStatus("pending")}>{t(STATUS_LABEL.pending)}</Chip>
      <Chip tone="ok" active={status === "done"} onClick={() => setStatus("done")}>{t(STATUS_LABEL.done)}</Chip>
    </ChipGroup>
  );
  return { columns, rows, chips, title: t({ tr: "Siparişler", en: "Orders" }) };
}

function PlainBand() {
  const { columns, rows, chips, title } = useBandTable();
  return <DataTable title={title} chips={chips} controls={false} columns={columns} rows={rows} getRowKey={(o) => o.id} />;
}

function AccentBand() {
  const { columns, rows, chips, title } = useBandTable();
  return <DataTable bandTone="accent" title={title} chips={chips} controls={false} columns={columns} rows={rows} getRowKey={(o) => o.id} />;
}

export default definePage({
  summary: { tr: "Listeyi tek dokunuşla filtreleyen, açılıp kapanan düğme. Basılı durumu `aria-pressed` ile duyurulur, yanında kayıt sayısını gösterebilir.", en: "A toggle button that filters a list with one press. Its pressed state is announced through `aria-pressed`, and it can show a record count beside the label." },
  imports: 'import { Chip, ChipGroup } from "btui";',
  hero: {
    Demo: SingleFilter,
    code: `const [status, setStatus] = useState("all");

<ChipGroup aria-label="Order status">
  <Chip active={status === "all"} onClick={() => setStatus("all")}>All</Chip>
  <Chip active={status === "open"} onClick={() => setStatus("open")}>Open</Chip>
  <Chip active={status === "pending"} onClick={() => setStatus("pending")}>Pending</Chip>
  <Chip active={status === "done"} onClick={() => setStatus("done")}>Done</Chip>
</ChipGroup>`,
  },
  use: {
    do: [
      { tr: "Az seçenekli, sık değişen filtreler: durum, dönem, atanan kişi", en: "Frequent filters with few options: status, period, assignee" },
      { tr: "`DataTable` bandında hızlı filtre", en: "Quick filters in a `DataTable` band" },
      { tr: "Her seçeneğin kaç kayıt getireceğini baştan göstermek", en: "Showing how many records each option returns" },
    ],
    dont: [
      { tr: "Sekizden çok seçenek; `MultiSelect` daha az yer kaplar", en: "More than eight options; `MultiSelect` takes less room" },
      { tr: "Yalnız bilgi vermek; tıklanmayan etiket için `Badge` kullanın", en: "Information only; use `Badge` for a label that is not pressed" },
      { tr: "Sayfa geçişi; sekme davranışı için `Tabs` kullanın", en: "Page switching; use `Tabs` for that behaviour" },
    ],
  },
  anatomy: `<ChipGroup aria-label="Group name">
  <Chip active count={12} tone="ok">Label</Chip>
</ChipGroup>`,
  examples: [
    {
      id: "count",
      title: { tr: "Kayıt sayısı", en: "Count" },
      body: { tr: "`count` etiketin yanına bir sayı ekler. `0` da gösterilir: kullanıcı filtreye basmadan sonucun boş olacağını anlar.", en: "`count` adds a number beside the label. `0` shows too, so people know a filter is empty before pressing it." },
      example: {
        Demo: Counts,
        code: `<Chip active={status === "open"} count={15} onClick={() => setStatus("open")}>Open</Chip>
<Chip active={status === "pending"} count={8} onClick={() => setStatus("pending")}>Pending</Chip>`,
      },
    },
    {
      id: "multiple",
      title: { tr: "Çoklu seçim", en: "Multiple selection" },
      body: { tr: "Bileşen tek ya da çoklu seçimi dayatmaz; `active` değerini nasıl hesapladığınız belirler. Dizi tutarak birden çok şehri aynı anda seçebilirsiniz.", en: "The component does not enforce single or multiple selection; how you compute `active` decides. Keep an array to select several cities at once." },
      example: {
        Demo: Multi,
        code: `const [cities, setCities] = useState(["İstanbul", "İzmir"]);
const toggle = (city: string) =>
  setCities((all) => (all.includes(city) ? all.filter((c) => c !== city) : [...all, city]));

<ChipGroup aria-label="Cities">
  {CITIES.map((city) => (
    <Chip key={city} active={cities.includes(city)} onClick={() => toggle(city)}>{city}</Chip>
  ))}
</ChipGroup>`,
      },
    },
    {
      id: "tones",
      title: { tr: "Tonlar", en: "Tones" },
      body: { tr: "`tone` normal yüzeyde etiketin önüne küçük bir renk noktası ekler. Ton, seçili durumun yerine geçmez; ikisi birlikte çalışır.", en: "On a normal surface, `tone` adds a small colour dot before the label. A tone does not replace the active state; the two work together." },
      example: {
        Demo: Tones,
        code: `<Chip tone="ok">Paid</Chip>
<Chip tone="warn">Due soon</Chip>
<Chip tone="danger" active>Overdue</Chip>
<Chip tone="info">New</Chip>
<Chip tone="neutral">Draft</Chip>`,
      },
    },
    {
      id: "in-band",
      title: { tr: "Tablo bandında", en: "In a table band" },
      body: { tr: "`DataTable` için `chips` prop'una verin. Filtreler başlığın yanında durur, satır işaretlenince yerini `bulkActions` içeriğine bırakır.", en: "Pass them to the `chips` prop of `DataTable`. Filters sit beside the title and give way to `bulkActions` once rows are checked." },
      example: {
        Demo: PlainBand,
        block: true,
        code: `<DataTable
  title="Orders"
  chips={
    <ChipGroup aria-label="Order status">
      <Chip active={status === "all"} onClick={() => setStatus("all")}>All</Chip>
      <Chip tone="info" active={status === "open"} onClick={() => setStatus("open")}>Open</Chip>
      <Chip tone="warn" active={status === "pending"} onClick={() => setStatus("pending")}>Pending</Chip>
    </ChipGroup>
  }
  columns={columns}
  rows={rows}
  getRowKey={(o) => o.id}
/>`,
      },
    },
    {
      id: "in-accent-band",
      title: { tr: "Vurgulu bantta", en: "In an accent band" },
      body: { tr: "`bandTone=\"accent\"` içinde `tone` taşıyan çipler nokta yerine düz renkli küçük etikete dönüşür ve seçili olan beyaz bir kenarla belirtilir. Tonsuz çipler saydam kalır.", en: "Inside `bandTone=\"accent\"`, chips with a `tone` swap the dot for a small solid label, and the active one gets a white outline. Chips without a tone stay transparent." },
      example: {
        Demo: AccentBand,
        block: true,
        code: `<DataTable
  bandTone="accent"
  title="Orders"
  chips={
    <ChipGroup aria-label="Order status">
      <Chip active={status === "all"} onClick={() => setStatus("all")}>All</Chip>
      <Chip tone="ok" active={status === "done"} onClick={() => setStatus("done")}>Done</Chip>
    </ChipGroup>
  }
  columns={columns}
  rows={rows}
  getRowKey={(o) => o.id}
/>`,
      },
    },
  ],
  a11y: [
    { tr: "Gerçek bir `<button>` çizer ve seçili durumu `aria-pressed` ile duyurur.", en: "Renders a real `<button>` and announces its state through `aria-pressed`." },
    { tr: "`ChipGroup` `role=\"group\"` taşır. `aria-label` ile grubu adlandırın, yoksa ekran okuyucu neyin filtrelendiğini söyleyemez.", en: "`ChipGroup` carries `role=\"group\"`. Name it with `aria-label`, otherwise screen readers cannot say what is being filtered." },
    { tr: "Seçili durum yalnız renkle değil, kalın yazı ve kenarla da gösterilir.", en: "The active state shows through bold text and the border as well as colour." },
    { tr: "Liste değişimini duyurmak için sonuç sayısını `role=\"status\"` taşıyan bir öğede yazın.", en: "To announce the list change, write the result count in an element with `role=\"status\"`." },
  ],
  keyboard: [
    ["Tab", { tr: "Gruptaki çipler arasında gezer", en: "Moves between chips in the group" }],
    ["Enter", { tr: "Çipi açar ya da kapatır", en: "Toggles the chip" }],
    ["Space", { tr: "Çipi açar ya da kapatır", en: "Toggles the chip" }],
  ],
  api: [
    {
      name: "Chip",
      description: { tr: "`type` dışındaki yerel `button` öznitelikleri iletilir; `type` her zaman `button` olur.", en: "Native `button` attributes other than `type` are forwarded; `type` is always `button`." },
      props: [
        { name: "active", type: "boolean", default: "false", description: { tr: "Seçili durum, `aria-pressed` değerini de belirler", en: "Active state; also sets `aria-pressed`" } },
        { name: "count", type: "ReactNode", description: { tr: "Etiketin yanındaki sayı. `0` da gösterilir", en: "Number beside the label. `0` is shown too" } },
        { name: "tone", type: '"neutral" | "ok" | "warn" | "danger" | "info"', description: { tr: "Normal yüzeyde renk noktası, vurgulu bantta düz renk", en: "A colour dot on normal surfaces, solid colour in an accent band" } },
        { name: "onClick", type: "MouseEventHandler<HTMLButtonElement>", description: { tr: "Basıldığında çağrılır", en: "Called on press" } },
        { name: "className", type: "string", description: { tr: "`.bt-chip` öğesine eklenir", en: "Added to `.bt-chip`" } },
        { name: "children", type: "ReactNode", description: { tr: "Etiket", en: "Label" } },
      ],
    },
    {
      name: "ChipGroup",
      description: { tr: "`role=\"group\"` taşıyan sarmalayıcı. Yerel `div` öznitelikleri iletilir.", en: "A wrapper with `role=\"group\"`. Native `div` attributes are forwarded." },
      props: [
        { name: "aria-label", type: "string", description: { tr: "Grubun adı", en: "Name of the group" } },
        { name: "className", type: "string", description: { tr: "`.bt-chips` öğesine eklenir", en: "Added to `.bt-chips`" } },
        { name: "children", type: "ReactNode", description: { tr: "`Chip` öğeleri", en: "`Chip` elements" } },
      ],
    },
  ],
  styling: [
    { name: "data-active", kind: "data", description: { tr: "Seçili çipte bulunur", en: "Present on an active chip" } },
    { name: "data-tone", kind: "data", description: { tr: "Seçili ton", en: "The current tone" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Seçili çip zemini", en: "Active chip background" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Seçili çip ve üzerine gelme kenarı", en: "Active and hover border" } },
    { name: "--bt-chip", kind: "var", description: { tr: "Vurgulu bantta tonlu çip zemini", en: "Toned chip background in an accent band" } },
    { name: "--bt-chip-text", kind: "var", description: { tr: "Vurgulu bantta tonlu çip metni", en: "Toned chip text in an accent band" } },
  ],
  related: ["badge", "data-table", "filter-bar", "multi-select"],
});
