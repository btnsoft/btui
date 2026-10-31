import { IconAlertTriangle, IconCheck, IconClock, IconStar } from "@tabler/icons-react";
import { Badge, Card, DataTable, InfoRow, type Column } from "btui";
import { money, ORDERS, STATUS_LABEL, STATUS_TONE, type Order, type OrderStatus } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const STATUSES: OrderStatus[] = ["open", "pending", "done", "cancelled"];

function Tones() {
  const t = useText();
  return (
    <>
      <Badge>{t({ tr: "Taslak", en: "Draft" })}</Badge>
      <Badge tone="info">{t({ tr: "Yeni", en: "New" })}</Badge>
      <Badge tone="ok">{t({ tr: "Ödendi", en: "Paid" })}</Badge>
      <Badge tone="warn">{t({ tr: "Vadesi yakın", en: "Due soon" })}</Badge>
      <Badge tone="danger">{t({ tr: "Gecikti", en: "Overdue" })}</Badge>
    </>
  );
}

function FromData() {
  const t = useText();
  return <>{STATUSES.map((s) => <Badge key={s} tone={STATUS_TONE[s]}>{t(STATUS_LABEL[s])}</Badge>)}</>;
}

function Icons() {
  const t = useText();
  return (
    <>
      <Badge tone="ok"><IconCheck size={12} />{t({ tr: "Onaylandı", en: "Approved" })}</Badge>
      <Badge tone="warn"><IconClock size={12} />{t({ tr: "Onay bekliyor", en: "Awaiting approval" })}</Badge>
      <Badge tone="danger"><IconAlertTriangle size={12} />{t({ tr: "Limit aşıldı", en: "Limit exceeded" })}</Badge>
      <Badge tone="info"><IconStar size={12} />{t({ tr: "Öncelikli müşteri", en: "Priority customer" })}</Badge>
    </>
  );
}

function InTable() {
  const t = useText();
  const lang = useLang();
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), cell: (o) => <span className="bt-mono">{o.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", cell: (o) => money(o.amount, lang) },
    { key: "status", header: t({ tr: "Durum", en: "Status" }), cell: (o) => <Badge tone={STATUS_TONE[o.status]}>{t(STATUS_LABEL[o.status])}</Badge> },
  ];
  return <DataTable columns={columns} rows={ORDERS.slice(0, 4)} getRowKey={(o) => o.id} />;
}

function InCard() {
  const t = useText();
  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <Card title="Şafak Enerji" actions={<Badge tone="danger">{t({ tr: "Riskli", en: "At risk" })}</Badge>}>
        <InfoRow label={t({ tr: "Geciken fatura", en: "Overdue invoices" })}>2</InfoRow>
        <InfoRow label={t({ tr: "Sözleşme", en: "Contract" })}><Badge tone="ok">{t({ tr: "Geçerli", en: "Valid" })}</Badge></InfoRow>
      </Card>
    </div>
  );
}

export default definePage({
  summary: { tr: "Bir kaydın durumunu ya da sınıfını kısa bir etiketle gösterir. Yalnız bilgi verir, tıklanmaz.", en: "Shows the status or class of a record in a short label. It informs only and cannot be pressed." },
  imports: 'import { Badge } from "btui";',
  hero: {
    Demo: Tones,
    code: `<Badge>Draft</Badge>
<Badge tone="info">New</Badge>
<Badge tone="ok">Paid</Badge>
<Badge tone="warn">Due soon</Badge>
<Badge tone="danger">Overdue</Badge>`,
  },
  use: {
    do: [
      { tr: "Tablo satırlarında sipariş ve fatura durumu", en: "Order and invoice status in table rows" },
      { tr: "Kart başlığında öne çıkması gereken tek bir sınıf: Riskli, Öncelikli", en: "A single class to surface in a card header: At risk, Priority" },
    ],
    dont: [
      { tr: "Tıklanacak öğeler; filtreleme için `Chip` kullanın", en: "Anything clickable; use `Chip` for filtering" },
      { tr: "Sakin durum listeleri; çok satırda `Status` daha hafif durur", en: "Calm status lists; `Status` weighs less across many rows" },
      { tr: "Cümle uzunluğunda metin; bir ya da iki kelimeyi geçmesin", en: "Sentence length text; keep it to one or two words" },
    ],
  },
  examples: [
    {
      id: "from-data",
      title: { tr: "Veriden ton seçmek", en: "Choosing a tone from data" },
      body: { tr: "Tonu her yerde elle yazmak yerine durumdan tona bir eşleme tutun. Bir durumun rengi değişirse tek satır düzeltirsiniz, ekranlar da tutarlı kalır.", en: "Keep a map from status to tone instead of writing the tone by hand everywhere. If a status changes colour you edit one line, and screens stay consistent." },
      example: {
        Demo: FromData,
        code: `const STATUS_TONE = { open: "info", pending: "warn", done: "ok", cancelled: "danger" } as const;

<Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>`,
      },
    },
    {
      id: "icons",
      title: { tr: "İkonlu", en: "With an icon" },
      body: { tr: "İkonu metinden önce çocuk olarak verin, aradaki boşluk hazırdır. Küçük yüzey için 12px yeterlidir. İkon, rengi görmeyen kullanıcıya da ipucu verir.", en: "Pass the icon as a child before the text; the gap is built in. 12px is enough for this size. An icon also helps people who cannot rely on colour." },
      example: {
        Demo: Icons,
        code: `<Badge tone="ok"><IconCheck size={12} />Approved</Badge>
<Badge tone="warn"><IconClock size={12} />Awaiting approval</Badge>
<Badge tone="danger"><IconAlertTriangle size={12} />Limit exceeded</Badge>`,
      },
    },
    {
      id: "in-table",
      title: { tr: "Tabloda", en: "In a table" },
      body: { tr: "En yaygın kullanım budur. Durum sütununda rozet, satırı tarayan gözün aradığını hızla bulmasını sağlar. Metin kırılmaz, sütun daralınca da tek satırda kalır.", en: "This is the most common use. A badge in the status column lets the eye find what it needs while scanning. The text never wraps, even in a narrow column." },
      example: {
        Demo: InTable,
        block: true,
        code: `{
  key: "status",
  header: "Status",
  cell: (o) => <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>,
}`,
      },
    },
    {
      id: "in-card",
      title: { tr: "Kart ve bilgi satırında", en: "In cards and info rows" },
      body: { tr: "Bir kaydın öne çıkan niteliğini `Card` eylem bölgesine koyun. `InfoRow` değerinde de düzgün hizalanır.", en: "Put the defining trait of a record in the `Card` action region. It also lines up well as an `InfoRow` value." },
      example: {
        Demo: InCard,
        block: true,
        code: `<Card title="Şafak Enerji" actions={<Badge tone="danger">At risk</Badge>}>
  <InfoRow label="Contract"><Badge tone="ok">Valid</Badge></InfoRow>
</Card>`,
      },
    },
  ],
  a11y: [
    { tr: "Sade bir `<span>` çizer ve metni ekran okuyucuya olduğu gibi aktarır.", en: "Renders a plain `<span>` and hands its text to screen readers as is." },
    { tr: "Anlam metinde olmalıdır. Renk tek başına durumu anlatmaz.", en: "Meaning must live in the text. Colour alone does not convey a status." },
    { tr: "Yalnız ikonlu rozet yapacaksanız `aria-label` verin; ikon kendiliğinden okunmaz.", en: "If a badge shows only an icon, add `aria-label`; the icon is not read on its own." },
  ],
  api: [
    {
      name: "Badge",
      description: { tr: "Tüm yerel `span` öznitelikleri iletilir.", en: "All native `span` attributes are forwarded." },
      props: [
        { name: "tone", type: '"neutral" | "ok" | "warn" | "danger" | "info"', default: '"neutral"', description: { tr: "Renk tonu", en: "Colour tone" } },
        { name: "className", type: "string", description: { tr: "`.bt-badge` öğesine eklenir", en: "Added to `.bt-badge`" } },
        { name: "children", type: "ReactNode", description: { tr: "Etiket ve isteğe bağlı ikon", en: "Label and optional icon" } },
      ],
    },
  ],
  styling: [
    { name: "data-tone", kind: "data", description: { tr: "Seçili ton", en: "The current tone" } },
    { name: "--bt-neutral-soft", kind: "var", description: { tr: "`neutral` zemini", en: "`neutral` background" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "`info` zemini", en: "`info` background" } },
    { name: "--bt-ok-soft", kind: "var", description: { tr: "`ok` zemini", en: "`ok` background" } },
    { name: "--bt-warn-soft", kind: "var", description: { tr: "`warn` zemini", en: "`warn` background" } },
    { name: "--bt-danger-soft", kind: "var", description: { tr: "`danger` zemini", en: "`danger` background" } },
  ],
  related: ["status", "chip", "data-table", "kpi"],
});
