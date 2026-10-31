import { Card, DataTable, InfoRow, Status, type Column } from "btui";
import { money, ORDERS, STATUS_LABEL, type Order, type OrderStatus } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const ORDER_DOT = { open: "neutral", pending: "warn", done: "ok", cancelled: "muted" } as const;
const STATUSES: OrderStatus[] = ["open", "pending", "done", "cancelled"];

function Tones() {
  const t = useText();
  return (
    <>
      <Status>{t({ tr: "Taslak", en: "Draft" })}</Status>
      <Status tone="ok">{t({ tr: "Aktif", en: "Active" })}</Status>
      <Status tone="warn">{t({ tr: "Onay bekliyor", en: "Awaiting approval" })}</Status>
      <Status tone="danger">{t({ tr: "Askıya alındı", en: "Suspended" })}</Status>
      <Status tone="muted">{t({ tr: "Arşivlendi", en: "Archived" })}</Status>
    </>
  );
}

function Orders() {
  const t = useText();
  return <>{STATUSES.map((s) => <Status key={s} tone={ORDER_DOT[s]}>{t(STATUS_LABEL[s])}</Status>)}</>;
}

function InTable() {
  const t = useText();
  const lang = useLang();
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), cell: (o) => <span className="bt-mono">{o.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "status", header: t({ tr: "Durum", en: "Status" }), cell: (o) => <Status tone={ORDER_DOT[o.status]}>{t(STATUS_LABEL[o.status])}</Status> },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", cell: (o) => money(o.amount, lang) },
  ];
  return <DataTable columns={columns} rows={ORDERS.slice(0, 5)} getRowKey={(o) => o.id} />;
}

function Integrations() {
  const t = useText();
  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <Card title={t({ tr: "Entegrasyonlar", en: "Integrations" })}>
        <InfoRow label={t({ tr: "E-fatura", en: "E-invoice" })}><Status tone="ok">{t({ tr: "Bağlı", en: "Connected" })}</Status></InfoRow>
        <InfoRow label={t({ tr: "Banka", en: "Bank" })}><Status tone="warn">{t({ tr: "Yavaş yanıt", en: "Slow response" })}</Status></InfoRow>
        <InfoRow label={t({ tr: "Kargo", en: "Shipping" })}><Status tone="danger">{t({ tr: "Bağlantı yok", en: "Disconnected" })}</Status></InfoRow>
        <InfoRow label={t({ tr: "Eski ERP", en: "Legacy ERP" })}><Status tone="muted">{t({ tr: "Kullanılmıyor", en: "Not in use" })}</Status></InfoRow>
      </Card>
    </div>
  );
}

export default definePage({
  summary: { tr: "Küçük bir nokta ve metinle durum bildirir. `Badge` kadar yer kaplamaz, uzun listelerde sakin kalır.", en: "Reports a state with a small dot and text. It takes less room than a `Badge` and stays calm in long lists." },
  imports: 'import { Status } from "btui";',
  hero: {
    Demo: Tones,
    code: `<Status>Draft</Status>
<Status tone="ok">Active</Status>
<Status tone="warn">Awaiting approval</Status>
<Status tone="danger">Suspended</Status>
<Status tone="muted">Archived</Status>`,
  },
  use: {
    do: [
      { tr: "Çok satırlı listelerde kayıt durumu; sütun boyunca hafif durur", en: "Record status in long lists; it stays light down a column" },
      { tr: "Entegrasyon ve sistem durumu: bağlı, yavaş, kopuk", en: "Integration and system health: connected, slow, down" },
      { tr: "Bilgi satırlarında tek kelimelik durum", en: "One word states in info rows" },
    ],
    dont: [
      { tr: "Öne çıkması gereken uyarılar; `Badge` ya da `Alert` daha güçlüdür", en: "Warnings that must stand out; `Badge` or `Alert` carry more weight" },
      { tr: "Tıklanacak öğeler; `Status` etkileşimli değildir", en: "Anything clickable; `Status` is not interactive" },
    ],
  },
  examples: [
    {
      id: "order-status",
      title: { tr: "Sipariş durumları", en: "Order statuses" },
      body: { tr: "`Status` tonları `Badge` ile aynı değildir: `info` yoktur, onun yerine `muted` vardır. Bu yüzden `Badge` için tuttuğunuz eşleme doğrudan çalışmaz. Açık kayıt için `neutral`, kapanmış kayıt için `muted` kullanan ayrı bir eşleme yazın.", en: "`Status` tones differ from `Badge`: there is no `info`, and there is a `muted`. A map written for `Badge` will not work as is. Write a separate one, with `neutral` for open records and `muted` for closed ones." },
      example: {
        Demo: Orders,
        code: `const ORDER_DOT = { open: "neutral", pending: "warn", done: "ok", cancelled: "muted" } as const;

<Status tone={ORDER_DOT[order.status]}>{STATUS_LABEL[order.status]}</Status>`,
      },
    },
    {
      id: "in-table",
      title: { tr: "Tabloda", en: "In a table" },
      body: { tr: "Yüzlerce satırda zeminli rozetler ekranı kalabalıklaştırır. Nokta rengi yeterli bilgiyi verir, tutar gibi asıl veriler öne çıkar.", en: "Across hundreds of rows, filled badges crowd the screen. The dot gives enough signal and leaves the real data, such as amounts, in front." },
      example: {
        Demo: InTable,
        block: true,
        code: `{
  key: "status",
  header: "Status",
  cell: (o) => <Status tone={ORDER_DOT[o.status]}>{STATUS_LABEL[o.status]}</Status>,
}`,
      },
    },
    {
      id: "system-health",
      title: { tr: "Sistem durumu", en: "System health" },
      body: { tr: "Bağlantı ve servis durumları için idealdir. `muted`, sorun olmayan ama devre dışı kalan kayıtları sakin biçimde ayırır.", en: "A natural fit for connections and services. `muted` quietly sets apart records that are switched off but not in trouble." },
      example: {
        Demo: Integrations,
        block: true,
        code: `<InfoRow label="E-invoice"><Status tone="ok">Connected</Status></InfoRow>
<InfoRow label="Bank"><Status tone="warn">Slow response</Status></InfoRow>
<InfoRow label="Shipping"><Status tone="danger">Disconnected</Status></InfoRow>
<InfoRow label="Legacy ERP"><Status tone="muted">Not in use</Status></InfoRow>`,
      },
    },
  ],
  a11y: [
    { tr: "Sade bir `<span>` çizer; nokta CSS ile eklenir, ekran okuyucu yalnız metni okur.", en: "Renders a plain `<span>`; the dot comes from CSS, so screen readers read only the text." },
    { tr: "Metni her zaman yazın. Etiketsiz nokta, renk görmeyen kullanıcı için hiçbir şey ifade etmez.", en: "Always write the text. A dot without a label means nothing to people who cannot see the colour." },
    { tr: "Durum sayfa açıkken değişiyorsa kabına `role=\"status\"` verin ki değişiklik duyurulsun.", en: "If the state changes while the page is open, set `role=\"status\"` on the container so the change is announced." },
  ],
  api: [
    {
      name: "Status",
      description: { tr: "Tüm yerel `span` öznitelikleri iletilir.", en: "All native `span` attributes are forwarded." },
      props: [
        { name: "tone", type: '"neutral" | "ok" | "warn" | "danger" | "info" | "muted"', default: '"neutral"', description: { tr: "Nokta ve metin rengi", en: "Colour of the dot and text" } },
        { name: "className", type: "string", description: { tr: "`.bt-status` öğesine eklenir", en: "Added to `.bt-status`" } },
        { name: "children", type: "ReactNode", description: { tr: "Durum metni", en: "State text" } },
      ],
    },
  ],
  styling: [
    { name: "data-tone", kind: "data", description: { tr: "Seçili ton", en: "The current tone" } },
    { name: "--bt-text-2", kind: "var", description: { tr: "`neutral` rengi", en: "`neutral` colour" } },
    { name: "--bt-ok", kind: "var", description: { tr: "`ok` rengi", en: "`ok` colour" } },
    { name: "--bt-warn", kind: "var", description: { tr: "`warn` rengi", en: "`warn` colour" } },
    { name: "--bt-danger", kind: "var", description: { tr: "`danger` rengi", en: "`danger` colour" } },
    { name: "--bt-faint", kind: "var", description: { tr: "`muted` rengi", en: "`muted` colour" } },
  ],
  related: ["badge", "data-table", "info-row", "alert"],
});
