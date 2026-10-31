import type { ReactNode } from "react";
import { IconBuildingStore, IconChartBar, IconDownload, IconFileInvoice, IconPencil, IconUsers } from "@tabler/icons-react";
import { Badge, Button, Card, DataTable, IconButton, InfoRow, type Column } from "btui";
import { money, ORDERS, type Order } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const WEEKS = [182000, 204000, 168000, 243000, 221000, 276000, 251000, 298000];

function Narrow({ children }: { children: ReactNode }) {
  return <div style={{ maxWidth: 440, margin: "0 auto" }}>{children}</div>;
}

function CustomerCard() {
  const t = useText();
  const lang = useLang();
  return (
    <Narrow>
      <Card
        title="Mavi Yapı"
        subtitle={t({ tr: "Müşteri no: 10482", en: "Customer no: 10482" })}
        icon={<IconBuildingStore size={16} />}
        actions={<Button size="sm" icon={<IconPencil size={14} />}>{t({ tr: "Düzenle", en: "Edit" })}</Button>}
      >
        <InfoRow label={t({ tr: "Şehir", en: "City" })}>İzmir</InfoRow>
        <InfoRow label={t({ tr: "Yetkili", en: "Contact" })}>Ada Yılmaz</InfoRow>
        <InfoRow label={t({ tr: "Açık bakiye", en: "Open balance" })}>{money(84250, lang)}</InfoRow>
        <InfoRow label={t({ tr: "Ödeme vadesi", en: "Payment terms" })}>{t({ tr: "30 gün", en: "30 days" })}</InfoRow>
      </Card>
    </Narrow>
  );
}

function Plain() {
  const t = useText();
  return (
    <Narrow>
      <Card>{t({ tr: "Çınar Gıda için hazırlanan teklif, satış müdürünün onayından sonra müşteriye gönderilecek.", en: "The quote for Çınar Gıda goes to the customer once the sales manager has approved it." })}</Card>
    </Narrow>
  );
}

function Titled() {
  const t = useText();
  return (
    <Narrow>
      <Card title={t({ tr: "Ödeme bilgileri", en: "Payment details" })} subtitle={t({ tr: "Fatura kesiminde kullanılır", en: "Used when invoicing" })} icon={<IconFileInvoice size={16} />}>
        <InfoRow label={t({ tr: "Yöntem", en: "Method" })}>{t({ tr: "Havale", en: "Bank transfer" })}</InfoRow>
        <InfoRow label={t({ tr: "Para birimi", en: "Currency" })}>TRY</InfoRow>
      </Card>
    </Narrow>
  );
}

function Actions() {
  const t = useText();
  const lang = useLang();
  const open = ORDERS.filter((o) => o.status === "open");
  const total = open.reduce((sum, o) => sum + o.amount, 0);
  return (
    <Narrow>
      <Card
        title={t({ tr: "Açık siparişler", en: "Open orders" })}
        actions={
          <>
            <Badge tone="info">{open.length}</Badge>
            <IconButton size="sm" label={t({ tr: "Dışa aktar", en: "Export" })}><IconDownload size={15} /></IconButton>
          </>
        }
      >
        <InfoRow label={t({ tr: "Toplam tutar", en: "Total amount" })}>{money(total, lang)}</InfoRow>
      </Card>
    </Narrow>
  );
}

function Flush() {
  const t = useText();
  const lang = useLang();
  const peak = Math.max(...WEEKS);
  return (
    <Narrow>
      <Card title={t({ tr: "Haftalık ciro", en: "Weekly revenue" })} subtitle={t({ tr: "Son sekiz hafta", en: "Last eight weeks" })} icon={<IconChartBar size={16} />} flush>
        <div
          role="img"
          aria-label={t({ tr: `Son sekiz haftada en yüksek ciro ${money(peak, lang)}`, en: `Highest revenue in the last eight weeks: ${money(peak, lang)}` })}
          style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 130 }}
        >
          {WEEKS.map((value, i) => <div key={i} title={money(value, lang)} style={{ flex: 1, height: `${(value / peak) * 100}%`, background: "var(--bt-accent-strong)" }} />)}
        </div>
      </Card>
    </Narrow>
  );
}

function FlushTable() {
  const t = useText();
  const lang = useLang();
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), sortable: false },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }), sortable: false },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", sortable: false, cell: (o) => money(o.amount, lang) },
  ];
  return (
    <Card title={t({ tr: "Son siparişler", en: "Latest orders" })} icon={<IconFileInvoice size={16} />} flush>
      <DataTable controls={false} columns={columns} rows={ORDERS.slice(0, 4)} getRowKey={(o) => o.id} />
    </Card>
  );
}

function Grid() {
  const t = useText();
  const lang = useLang();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      <Card title={t({ tr: "Fatura adresi", en: "Billing address" })}>Alsancak Mah. 1472 Sok. No: 8, Konak, İzmir</Card>
      <Card title={t({ tr: "Teslimat adresi", en: "Delivery address" })}>Kemalpaşa OSB, 3. Cadde No: 14, İzmir</Card>
      <Card title={t({ tr: "Kredi limiti", en: "Credit limit" })} icon={<IconUsers size={16} />}>
        <InfoRow label={t({ tr: "Kullanılan", en: "Used" })}>{money(84250, lang)}</InfoRow>
        <InfoRow label={t({ tr: "Kalan", en: "Remaining" })}>{money(165750, lang)}</InfoRow>
      </Card>
    </div>
  );
}

export default definePage({
  summary: { tr: "İlgili bilgileri çerçeveli tek bir alanda toplar. Başlık, alt başlık, ikon ve eylem bölgelerinin hepsi isteğe bağlıdır.", en: "Groups related information in one framed area. The title, subtitle, icon and action regions are all optional." },
  imports: 'import { Card } from "btui";',
  hero: {
    Demo: CustomerCard,
    block: true,
    code: `<Card
  title="Mavi Yapı"
  subtitle="Customer no: 10482"
  icon={<IconBuildingStore size={16} />}
  actions={<Button size="sm" icon={<IconPencil size={14} />}>Edit</Button>}
>
  <InfoRow label="City">İzmir</InfoRow>
  <InfoRow label="Contact">Ada Yılmaz</InfoRow>
  <InfoRow label="Open balance">{money(84250, lang)}</InfoRow>
</Card>`,
  },
  use: {
    do: [
      { tr: "Müşteri kartı, ödeme bilgisi gibi konu olarak bir arada duran bilgiler", en: "Facts that belong together, such as a customer profile or payment details" },
      { tr: "Pano ekranlarında grafik ve özet alanları", en: "Charts and summaries on dashboards" },
      { tr: "Form bölümlerini görsel olarak ayırmak", en: "Setting form sections apart" },
    ],
    dont: [
      { tr: "`flush` olmadan `DataTable` sarmak; tablonun kendi çerçevesi vardır, iç boşlukla birlikte çift kenar oluşur", en: "Wrapping a `DataTable` without `flush`; it has its own frame, so with the padding the borders double up" },
      { tr: "Kart içinde kart; hiyerarşi okunmaz olur", en: "Nesting cards; the hierarchy stops reading" },
      { tr: "Tek sayı göstermek; bunun için `Kpi` kullanın", en: "Showing a single number; use `Kpi` for that" },
    ],
  },
  anatomy: `<Card title icon subtitle actions flush>
  Content
</Card>`,
  examples: [
    {
      id: "plain",
      title: { tr: "Başlıksız", en: "Without a header" },
      body: { tr: "`title`, `subtitle` ve `actions` yoksa üst bölüm hiç çizilmez, yalnız içerik görünür. `icon` tek başına üst bölümü açmaz.", en: "Without `title`, `subtitle` and `actions` the header is not drawn and only the content shows. `icon` alone does not open the header." },
      example: { Demo: Plain, block: true, code: `<Card>The quote goes to the customer once the sales manager has approved it.</Card>` },
    },
    {
      id: "title",
      title: { tr: "Başlık, alt başlık ve ikon", en: "Title, subtitle and icon" },
      body: { tr: "`title` bir `<h2>` olarak çizilir. `subtitle` kısa bir bağlam verir, ikon başlıktan önce durur.", en: "`title` renders as an `<h2>`. `subtitle` gives short context and the icon sits before the title." },
      example: {
        Demo: Titled,
        block: true,
        code: `<Card title="Payment details" subtitle="Used when invoicing" icon={<IconFileInvoice size={16} />}>
  <InfoRow label="Method">Bank transfer</InfoRow>
  <InfoRow label="Currency">TRY</InfoRow>
</Card>`,
      },
    },
    {
      id: "actions",
      title: { tr: "Eylemler", en: "Actions" },
      body: { tr: "`actions` üst bölümün sağına yerleşir. Düğmeleri `sm` tutun ya da `IconButton` kullanın; kart başlığı sayfanın ana eylemiyle yarışmamalıdır.", en: "`actions` sits on the right of the header. Keep buttons at `sm` or use an `IconButton`, so a card header does not compete with the main action of the page." },
      example: {
        Demo: Actions,
        block: true,
        code: `<Card
  title="Open orders"
  actions={
    <>
      <Badge tone="info">{open.length}</Badge>
      <IconButton size="sm" label="Export"><IconDownload size={15} /></IconButton>
    </>
  }
>
  <InfoRow label="Total amount">{money(total, lang)}</InfoRow>
</Card>`,
      },
    },
    {
      id: "flush",
      title: { tr: "Kenarsız içerik", en: "Flush content" },
      body: { tr: "`flush` gövdenin iç boşluğunu kaldırır. Kartın kenarına kadar uzanması gereken grafik, liste ve görseller için kullanın.", en: "`flush` removes the body padding. Use it for charts, lists and images that should reach the edge of the card." },
      example: {
        Demo: Flush,
        block: true,
        code: `<Card title="Weekly revenue" subtitle="Last eight weeks" flush>
  <RevenueChart />
</Card>`,
      },
    },
    {
      id: "flush-table",
      title: { tr: "Kart içinde tablo", en: "A table in a card" },
      body: { tr: "`flush` verilen kartın doğrudan çocuğu olan `DataTable` kendi çerçevesini, köşesini ve gölgesini bırakır; çift kenar oluşmaz. Tablonun kart gövdesinin doğrudan çocuğu olması gerekir, araya bir `div` girerse çerçeve geri gelir.", en: "A `DataTable` that is a direct child of a `flush` card drops its own frame, corners and shadow, so no double border appears. The table must be a direct child of the card body; a `div` in between brings the frame back." },
      example: {
        Demo: FlushTable,
        block: true,
        code: `<Card title="Latest orders" icon={<IconFileInvoice size={16} />} flush>
  <DataTable controls={false} columns={columns} rows={orders} getRowKey={(o) => o.id} />
</Card>`,
      },
    },
    {
      id: "grid",
      title: { tr: "Izgara içinde", en: "In a grid" },
      body: { tr: "Kart kendi genişliğini belirlemez, kabını doldurur. Yan yana dizmek için CSS Grid yeterlidir; `auto-fit` dar ekranda kartları kendiliğinden alt alta alır.", en: "A card does not set its own width; it fills its container. CSS Grid is all you need to lay them out, and `auto-fit` stacks them on narrow screens." },
      example: {
        Demo: Grid,
        block: true,
        code: `<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
  <Card title="Billing address">Alsancak Mah. 1472 Sok. No: 8</Card>
  <Card title="Delivery address">Kemalpaşa OSB, 3. Cadde No: 14</Card>
  <Card title="Credit limit">...</Card>
</div>`,
      },
    },
  ],
  a11y: [
    { tr: "`<section>` çizer. Başlığa `id`, karta `aria-labelledby` verirseniz yer imi olarak duyurulur.", en: "Renders a `<section>`. Pair `aria-labelledby` with an `id` in the title to announce it as a landmark." },
    { tr: "Başlık her zaman `<h2>` düzeyindedir. Sayfadaki başlık sırasını buna göre kurun.", en: "The title is always an `<h2>`. Plan the heading order of the page around it." },
    { tr: "Eylem bölgesindeki `IconButton` için anlamlı bir `label` verin; görsel başlık onu ekran okuyucuya taşımaz.", en: "Give an `IconButton` in the action region a meaningful `label`; the visible title does not carry over to screen readers." },
  ],
  api: [
    {
      name: "Card",
      description: { tr: "`title` dışındaki yerel `section` öznitelikleri dış öğeye iletilir.", en: "Native `section` attributes other than `title` are passed to the outer element." },
      props: [
        { name: "title", type: "ReactNode", description: { tr: "`<h2>` olarak çizilen başlık", en: "Heading rendered as an `<h2>`" } },
        { name: "subtitle", type: "ReactNode", description: { tr: "Başlığın altında kısa açıklama", en: "Short text under the title" } },
        { name: "icon", type: "ReactNode", description: { tr: "Başlıktan önce gösterilir; `title` yoksa görünmez", en: "Shown before the title; hidden without `title`" } },
        { name: "actions", type: "ReactNode", description: { tr: "Üst bölümün sağındaki eylemler", en: "Actions on the right of the header" } },
        { name: "flush", type: "boolean", default: "false", description: { tr: "Gövdenin iç boşluğunu kaldırır; doğrudan çocuk olan `DataTable` çerçevesini bırakır", en: "Removes the body padding; a direct `DataTable` child drops its frame" } },
        { name: "className", type: "string", description: { tr: "Dış öğeye eklenir", en: "Added to the outer element" } },
        { name: "children", type: "ReactNode", description: { tr: "Kart gövdesi", en: "Card body" } },
      ],
    },
  ],
  styling: [
    { name: "data-flush", kind: "data", description: { tr: "`.bt-card-body` üzerinde, `flush` verildiğinde bulunur", en: "On `.bt-card-body` when `flush` is set" } },
    { name: "--bt-surface", kind: "var", description: { tr: "Kart zemini", en: "Card background" } },
    { name: "--bt-border", kind: "var", description: { tr: "Dış kenar", en: "Outer border" } },
    { name: "--bt-line", kind: "var", description: { tr: "Üst bölümün alt çizgisi", en: "Rule under the header" } },
    { name: "--bt-radius-lg", kind: "var", description: { tr: "Köşe yarıçapı", en: "Corner radius" } },
  ],
  related: ["kpi", "info-row", "data-table", "empty-state"],
});
