import { useState, type ReactNode } from "react";
import { IconFileInvoice, IconInfoCircle, IconPackage, IconPaperclip } from "@tabler/icons-react";
import { Button, DataTable, InfoRow, Status, Tabs, type Column, type TabItem } from "btui";
import { money, ORDERS, STATUS_LABEL, type Order, type OrderStatus } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";


function Box({ children }: { children: ReactNode }) {
  return (
    <div className="d-stack-wide">
      {children}
    </div>
  );
}

function useCustomerTabs(): TabItem[] {
  const t = useText();
  return [
    {
      value: "general",
      label: t({ tr: "Genel", en: "General" }),
      content: (
        <>
          <InfoRow label={t({ tr: "Müşteri", en: "Customer" })}>Mavi Yapı</InfoRow>
          <InfoRow label={t({ tr: "Şehir", en: "City" })}>İzmir</InfoRow>
          <InfoRow label={t({ tr: "Vade", en: "Payment term" })}>{t({ tr: "30 gün", en: "30 days" })}</InfoRow>
        </>
      ),
    },
    {
      value: "orders",
      label: t({ tr: "Siparişler", en: "Orders" }),
      content: <Status tone="ok">{t({ tr: "Geçen ay 12 sipariş tamamlandı.", en: "12 orders completed last month." })}</Status>,
    },
    {
      value: "invoices",
      label: t({ tr: "Faturalar", en: "Invoices" }),
      content: <Status tone="warn">{t({ tr: "3 fatura ödeme bekliyor.", en: "3 invoices awaiting payment." })}</Status>,
    },
  ];
}

function Hero() {
  const items = useCustomerTabs();
  return <Box><Tabs items={items} /></Box>;
}

function Chips() {
  const t = useText();
  const lang = useLang();
  const [period, setPeriod] = useState("month");
  const totals: Record<string, number> = { week: 48300, month: 212750, year: 2640000 };
  return (
    <Box>
      <Tabs
        variant="chip"
        value={period}
        onChange={setPeriod}
        items={[
          { value: "week", label: t({ tr: "Hafta", en: "Week" }) },
          { value: "month", label: t({ tr: "Ay", en: "Month" }) },
          { value: "year", label: t({ tr: "Yıl", en: "Year" }) },
        ]}
      />
      <InfoRow label={t({ tr: "Tahsilat", en: "Collections" })}>{money(totals[period], lang)}</InfoRow>
    </Box>
  );
}

function Controlled() {
  const t = useText();
  const items = useCustomerTabs();
  const [tab, setTab] = useState("general");
  return (
    <Box>
      <div>
        <Button size="sm" variant="soft" disabled={tab === "invoices"} onClick={() => setTab("invoices")}>{t({ tr: "Bekleyen faturaları aç", en: "Open pending invoices" })}</Button>
      </div>
      <Tabs items={items} value={tab} onChange={setTab} />
    </Box>
  );
}

function Badges() {
  const t = useText();
  return (
    <Box>
      <Tabs
        items={[
          { value: "general", label: t({ tr: "Genel", en: "General" }), icon: <IconInfoCircle size={15} />, content: <p style={{ margin: 0 }}>{t({ tr: "Fatura FT-2026-0418, Mavi Yapı adına kesildi.", en: "Invoice FT-2026-0418 was issued to Mavi Yapı." })}</p> },
          { value: "lines", label: t({ tr: "Kalemler", en: "Line items" }), icon: <IconPackage size={15} />, badge: 8, content: <p style={{ margin: 0 }}>{t({ tr: "Faturada 8 kalem var.", en: "The invoice has 8 line items." })}</p> },
          { value: "payments", label: t({ tr: "Ödemeler", en: "Payments" }), icon: <IconFileInvoice size={15} />, badge: 2, content: <p style={{ margin: 0 }}>{t({ tr: "2 kısmi ödeme alındı.", en: "2 partial payments were received." })}</p> },
          { value: "files", label: t({ tr: "Ekler", en: "Attachments" }), icon: <IconPaperclip size={15} />, badge: 0, content: <p style={{ margin: 0 }}>{t({ tr: "Henüz ek yok.", en: "No attachments yet." })}</p> },
        ]}
      />
    </Box>
  );
}

function Disabled() {
  const t = useText();
  return (
    <Box>
      <Tabs
        defaultValue="details"
        items={[
          { value: "details", label: t({ tr: "Ayrıntılar", en: "Details" }), content: <p style={{ margin: 0 }}>{t({ tr: "Sipariş taslak durumunda.", en: "The order is a draft." })}</p> },
          { value: "shipping", label: t({ tr: "Sevkiyat", en: "Shipping" }), disabled: true, content: <p style={{ margin: 0 }}>{t({ tr: "Sevkiyat bilgileri", en: "Shipping details" })}</p> },
          { value: "history", label: t({ tr: "Geçmiş", en: "History" }), content: <p style={{ margin: 0 }}>{t({ tr: "Sipariş bugün Ada Yılmaz tarafından açıldı.", en: "Ada Yılmaz opened the order today." })}</p> },
        ]}
      />
      <small>{t({ tr: "Sevkiyat, sipariş onaylandıktan sonra açılır.", en: "Shipping opens once the order is approved." })}</small>
    </Box>
  );
}

function ListSwitch() {
  const t = useText();
  const lang = useLang();
  const [tab, setTab] = useState<string>("pending");
  const statuses: OrderStatus[] = ["open", "pending", "done"];
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), sortable: false },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }), sortable: false },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", sortable: false, cell: (r) => money(r.amount, lang) },
  ];
  return (
    <Box>
      <Tabs
        value={tab}
        onChange={setTab}
        items={statuses.map((status) => ({ value: status, label: t(STATUS_LABEL[status]), badge: ORDERS.filter((o) => o.status === status).length }))}
      />
      <DataTable columns={columns} rows={ORDERS.filter((o) => o.status === tab)} getRowKey={(r) => r.id} pageSize={4} controls={false} />
    </Box>
  );
}

export default definePage({
  summary: { tr: "Aynı kayda ya da aynı listeye ait görünümler arasında sayfa değiştirmeden geçiş sağlar. `line` sayfa düzeyinde, `chip` kart içi ve dar alanlarda kullanılır.", en: "Switches between views of the same record or list without leaving the page. `line` works at page level, `chip` inside cards and tight spaces." },
  imports: 'import { Tabs, type TabItem } from "btui";',
  base: "tabs",
  hero: {
    Demo: Hero,
    block: true,
    code: `<Tabs
  items={[
    {
      value: "general",
      label: "General",
      content: (
        <>
          <InfoRow label="Customer">Mavi Yapı</InfoRow>
          <InfoRow label="City">İzmir</InfoRow>
          <InfoRow label="Payment term">30 days</InfoRow>
        </>
      ),
    },
    { value: "orders", label: "Orders", content: <Status tone="ok">12 orders completed last month.</Status> },
    { value: "invoices", label: "Invoices", content: <Status tone="warn">3 invoices awaiting payment.</Status> },
  ]}
/>`,
  },
  use: {
    do: [
      { tr: "Bir müşteri ya da sipariş kaydının farklı yönleri; genel bilgi, faturalar, ekler", en: "Different sides of one customer or order record; general details, invoices, attachments" },
      { tr: "Aynı anda yalnız birine bakılan görünümler", en: "Views that are read one at a time" },
      { tr: "Durum bazında liste görünümleri; `badge` ile kayıt sayısını gösterin", en: "List views by status; show the record count with `badge`" },
    ],
    dont: [
      { tr: "Sırayla tamamlanması gereken adımlar; sekmeler serbest gezinme içindir", en: "Steps that must be done in order; tabs are for moving freely" },
      { tr: "Yan yana karşılaştırılacak içerik; biri açılınca öteki kaybolur", en: "Content to compare side by side; opening one hides the other" },
      { tr: "Yediden fazla sekme; satır sarar, gruplama ya da `Select` daha iyidir", en: "More than seven tabs; the row wraps, so grouping or a `Select` works better" },
    ],
  },
  anatomy: `<Tabs
  variant="line"
  items={[
    { value: "a", label: "Label", icon: <Icon />, badge: 3, content: <Panel /> },
    { value: "b", label: "Label", disabled: true, content: <Panel /> },
  ]}
/>`,
  examples: [
    {
      id: "chip",
      title: { tr: "Chip görünümü", en: "Chip variant" },
      body: { tr: "`variant=\"chip\"` daha sıkı durur, kart başlığı ya da rapor filtresi gibi dar alanlara uyar. `content` vermediğiniz için panel çizilmez, seçim yalnız yanındaki veriyi değiştirir.", en: "`variant=\"chip\"` is tighter and suits narrow spots such as a card header or report filter. With no `content`, no panel is drawn and the choice only changes the data beside it." },
      example: { Demo: Chips, block: true, code: `const [period, setPeriod] = useState("month");

<Tabs
  variant="chip"
  value={period}
  onChange={setPeriod}
  items={[
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ]}
/>
<InfoRow label="Collections">{money(totals[period], lang)}</InfoRow>` },
    },
    {
      id: "controlled",
      title: { tr: "Dışarıdan denetim", en: "Controlled" },
      body: { tr: "`value` ve `onChange` birlikte verildiğinde seçili sekmeyi siz tutarsınız. Bir uyarıdaki bağlantıdan doğrudan ilgili sekmeye geçmek ya da seçimi adrese yazmak için kullanın. Düğmeye basıp deneyin.", en: "With `value` and `onChange` together, you hold the selected tab. Use this to jump from an alert straight to the right tab or to keep the choice in the URL. Press the button to try." },
      example: { Demo: Controlled, block: true, code: `const [tab, setTab] = useState("general");

<Button size="sm" variant="soft" disabled={tab === "invoices"} onClick={() => setTab("invoices")}>
  Open pending invoices
</Button>
<Tabs items={items} value={tab} onChange={setTab} />` },
    },
    {
      id: "badges",
      title: { tr: "İkon ve rozetler", en: "Icons and badges" },
      body: { tr: "`badge` verildiğinde etiketin yanında bir `Badge` çizilir. Değer `undefined` değilse gösterilir, bu yüzden `0` da görünür. Sekmenin boş olduğunu önceden söylemek işe yarar; istemiyorsanız değeri vermeyin.", en: "`badge` draws a `Badge` beside the label. Anything other than `undefined` shows, so `0` is visible too. Saying a tab is empty ahead of time is useful; leave the value out if you do not want it." },
      example: { Demo: Badges, block: true, code: `<Tabs
  items={[
    { value: "general", label: "General", icon: <IconInfoCircle size={15} />, content: <General /> },
    { value: "lines", label: "Line items", icon: <IconPackage size={15} />, badge: 8, content: <Lines /> },
    { value: "payments", label: "Payments", icon: <IconFileInvoice size={15} />, badge: 2, content: <Payments /> },
    { value: "files", label: "Attachments", icon: <IconPaperclip size={15} />, badge: 0, content: <Files /> },
  ]}
/>` },
    },
    {
      id: "disabled",
      title: { tr: "Kapalı sekme", en: "Disabled tabs" },
      body: { tr: "Sekme şu an kullanılamıyorsa `disabled` verin ve nedenini yakınında yazın. Klavye ile odak alır ama seçilemez. İlk öğe kapalıysa ilk açık sekme seçilir.", en: "When a tab cannot be used yet, set `disabled` and say why nearby. It takes keyboard focus but cannot be selected. When the first item is disabled, the first enabled tab is selected." },
      example: { Demo: Disabled, block: true, code: `<Tabs
  defaultValue="details"
  items={[
    { value: "details", label: "Details", content: <Details /> },
    { value: "shipping", label: "Shipping", disabled: true, content: <Shipping /> },
    { value: "history", label: "History", content: <History /> },
  ]}
/>
<small>Shipping opens once the order is approved.</small>` },
    },
    {
      id: "list-switch",
      title: { tr: "Liste görünümleri", en: "List views" },
      body: { tr: "`content` vermezseniz sekmeler yalnız seçim yapar, tablo altta sabit kalır. Tek tablo ile çalıştığınız için sıralama ve sayfa yapısı korunur. Ekran okuyucu kullanıcıları için tablonun sekmeyle değiştiğini metinle de belirtin.", en: "Without `content`, tabs only make the choice and the table stays in place below. Working with one table keeps its sorting and paging. Tell screen reader users in text that the table follows the tab." },
      example: { Demo: ListSwitch, block: true, code: `const [tab, setTab] = useState("pending");

<Tabs
  value={tab}
  onChange={setTab}
  items={statuses.map((status) => ({ value: status, label: labels[status], badge: countOf(status) }))}
/>
<DataTable columns={columns} rows={orders.filter((o) => o.status === tab)} getRowKey={(r) => r.id} pageSize={4} controls={false} />` },
    },
    {
      id: "panel-state",
      title: { tr: "Panel durumu", en: "Panel state" },
      body: { tr: "Yalnız seçili sekmenin paneli sayfada bulunur; diğerleri kaldırılır. Bir panelin içindeki yazılmamış form verisi sekme değişince kaybolur. Bu tür veriyi `Tabs` dışındaki bir durumda tutun.", en: "Only the selected tab's panel is on the page; the others are removed. Unsaved form data inside a panel is lost when the tab changes. Keep such data in state outside `Tabs`." },
    },
  ],
  a11y: [
    { tr: "`tablist`, `tab` ve `tabpanel` rolleri ile `aria-selected` hazır gelir.", en: "The `tablist`, `tab` and `tabpanel` roles and `aria-selected` come ready." },
    { tr: "Ok tuşları yalnız odağı taşır; sekme `Enter` ya da `Space` ile seçilir. Odak dolaşırken panel değişmez.", en: "Arrow keys only move focus; a tab is selected with `Enter` or `Space`. The panel does not change while focus moves." },
    { tr: "Kapalı sekme `aria-disabled` taşır ve ok tuşlarıyla odaklanabilir; böylece kullanıcı varlığından haberdar olur.", en: "A disabled tab carries `aria-disabled` and stays focusable with the arrow keys, so people still learn it exists." },
    { tr: "`TabsProps` içinde `aria-label` yoktur, sekme listesi adsız çizilir. Hemen üstüne görünür bir başlık koyun.", en: "`TabsProps` has no `aria-label`, so the tab list is drawn without a name. Put a visible heading right above it." },
  ],
  keyboard: [
    ["Tab", { tr: "Seçili sekmeye, oradan panele geçer", en: "Moves to the selected tab, then into the panel" }],
    ["ArrowRight", { tr: "Odağı sonraki sekmeye taşır, sondan başa döner", en: "Moves focus to the next tab and wraps to the first" }],
    ["ArrowLeft", { tr: "Odağı önceki sekmeye taşır, baştan sona döner", en: "Moves focus to the previous tab and wraps to the last" }],
    ["Home", { tr: "Odağı ilk sekmeye taşır", en: "Moves focus to the first tab" }],
    ["End", { tr: "Odağı son sekmeye taşır", en: "Moves focus to the last tab" }],
    ["Enter", { tr: "Odaktaki sekmeyi seçer", en: "Selects the focused tab" }],
    ["Space", { tr: "Odaktaki sekmeyi seçer", en: "Selects the focused tab" }],
  ],
  api: [
    {
      name: "Tabs",
      props: [
        { name: "items", type: "TabItem[]", required: true, description: { tr: "Sekmeler", en: "The tabs" } },
        { name: "value", type: "string", description: { tr: "Seçili sekme; verilirse denetim sizdedir", en: "Selected tab; passing it puts you in control" } },
        { name: "defaultValue", type: "string", default: "first enabled item", description: { tr: "Denetimsiz kullanımda başlangıç sekmesi", en: "Initial tab when uncontrolled" } },
        { name: "onChange", type: "(value: string) => void", description: { tr: "Seçim değişince çalışır", en: "Called when the selection changes" } },
        { name: "variant", type: '"line" | "chip"', default: '"line"', description: { tr: "Görünüm", en: "Visual style" } },
        { name: "aria-label", type: "string", description: { tr: "Sekme listesinin erişilebilir adı", en: "Accessible name of the tab list" } },
        { name: "className", type: "string", description: { tr: "Kök öğeye eklenir", en: "Added to the root element" } },
      ],
    },
    {
      name: "TabItem",
      props: [
        { name: "value", type: "string", required: true, description: { tr: "Sekmenin kimliği", en: "Identifier of the tab" } },
        { name: "label", type: "ReactNode", required: true, description: { tr: "Sekme etiketi", en: "Tab label" } },
        { name: "icon", type: "ReactNode", description: { tr: "Etiketten önce gösterilir", en: "Shown before the label" } },
        { name: "badge", type: "ReactNode", description: { tr: "Etiketten sonra `Badge` içinde gösterilir", en: "Shown after the label inside a `Badge`" } },
        { name: "disabled", type: "boolean", description: { tr: "Sekmenin seçilmesini engeller", en: "Prevents the tab from being selected" } },
        { name: "content", type: "ReactNode", description: { tr: "Panel içeriği; verilmezse panel çizilmez", en: "Panel content; left out, no panel is drawn" } },
      ],
    },
  ],
  styling: [
    { name: "data-variant", kind: "data", description: { tr: "Sekme listesindeki görünüm", en: "The variant on the tab list" } },
    { name: "data-active", kind: "data", description: { tr: "Seçili sekmede bulunur", en: "Present on the selected tab" } },
    { name: "data-disabled", kind: "data", description: { tr: "Kapalı sekmede bulunur", en: "Present on a disabled tab" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "`line` görünümünde seçili sekmenin alt çizgisi", en: "Underline of the selected tab in `line`" } },
    { name: "--bt-muted", kind: "var", description: { tr: "Seçili olmayan sekme metni", en: "Text of unselected tabs" } },
    { name: "--bt-neutral-soft", kind: "var", description: { tr: "`chip` görünümünde liste zemini", en: "List background in `chip`" } },
  ],
  related: ["accordion", "card", "data-table", "filter-bar"],
});
