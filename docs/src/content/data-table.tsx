import { useEffect, useState } from "react";
import { IconCheck, IconChecklist, IconDots, IconDownload, IconFileInvoice, IconPencil, IconPlus, IconReceipt, IconTrash } from "@tabler/icons-react";
import { Avatar, Badge, Button, Chip, ChipGroup, DataTable, Drawer, IconButton, InfoRow, Menu, MenuItem, MenuSeparator, sortRows, Status, useConfirm, useToast, type Column, type SortState } from "btui";
import { money, ORDERS, STATUS_LABEL, STATUS_TONE, type Order, type OrderStatus } from "../lib/data";
import { useLang, useText, type Text } from "../lib/i18n";
import { definePage } from "../lib/schema";

type InvoiceState = "paid" | "due" | "late";
type Invoice = { id: number; no: string; customer: string; due: string; net: number; vat: number; total: number; state: InvoiceState };

const INVOICE_LABEL: Record<InvoiceState, Text> = {
  paid: { tr: "Ödendi", en: "Paid" },
  due: { tr: "Vadesi yakın", en: "Due soon" },
  late: { tr: "Gecikti", en: "Overdue" },
};
const INVOICE_TONE = { paid: "ok", due: "warn", late: "danger" } as const;

const INVOICES: Invoice[] = ([
  ["FT-2026-0412", "Mavi Yapı", "2026-11-04", 48200, "due"],
  ["FT-2026-0413", "Kuzey Lojistik", "2026-10-12", 16750, "late"],
  ["FT-2026-0414", "Çınar Gıda", "2026-10-20", 9300, "paid"],
  ["FT-2026-0415", "Ege Tekstil", "2026-11-09", 27400, "due"],
  ["FT-2026-0416", "Şafak Enerji", "2026-10-02", 73150, "late"],
  ["FT-2026-0417", "Atlas Makine", "2026-10-18", 12600, "paid"],
] as const).map(([no, customer, due, net, state], i) => ({ id: i + 1, no, customer, due, net, vat: net * 0.2, total: net * 1.2, state }));

type Approval = { id: number; no: string; subject: Text; owner: string; amount: number; days: number };

const APPROVALS: Approval[] = [
  { id: 1, no: "ON-2187", subject: { tr: "Çınar Gıda kredi limiti artışı", en: "Credit limit increase for Çınar Gıda" }, owner: "Ada Yılmaz", amount: 250000, days: 1 },
  { id: 2, no: "ON-2188", subject: { tr: "Kuzey Lojistik fiyat listesi", en: "Price list for Kuzey Lojistik" }, owner: "Can Demir", amount: 84000, days: 5 },
  { id: 3, no: "ON-2190", subject: { tr: "Mavi Yapı iade talebi", en: "Return request from Mavi Yapı" }, owner: "Ada Yılmaz", amount: 12300, days: 2 },
  { id: 4, no: "ON-2193", subject: { tr: "Atlas Makine vade uzatımı", en: "Payment extension for Atlas Makine" }, owner: "Elif Kaya", amount: 61500, days: 7 },
  { id: 5, no: "ON-2196", subject: { tr: "Ege Tekstil özel iskonto", en: "Special discount for Ege Tekstil" }, owner: "Mert Aydın", amount: 18900, days: 4 },
];

const CONTACTS = ["Can Arslan", "Çetin Öz", "Cem Tuna", "Şahin Ak", "Selin Koç", "Işıl Şen", "İpek Bal", "Ömer Ulu", "Oya Gül", "Ümit Er", "Uğur Taş", "Ilgın Ay"].map((name, i) => ({ id: i + 1, name, company: ["Mavi Yapı", "Çınar Gıda", "Atlas Makine"][i % 3] }));

const STATUS_ORDER: Record<OrderStatus, number> = { open: 0, pending: 1, done: 2, cancelled: 3 };
const STATUS_DOT = { open: "neutral", pending: "warn", done: "ok", cancelled: "muted" } as const;

function day(iso: string, lang: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(lang, { day: "2-digit", month: "short", year: "numeric" });
}

function useOrderColumns(): Column<Order>[] {
  const t = useText();
  const lang = useLang();
  return [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), width: 104, cell: (o) => <span className="bt-mono">{o.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "city", header: t({ tr: "Şehir", en: "City" }) },
    { key: "date", header: t({ tr: "Tarih", en: "Date" }), cell: (o) => day(o.date, lang) },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", cell: (o) => money(o.amount, lang) },
    { key: "status", header: t({ tr: "Durum", en: "Status" }), cell: (o) => <Badge tone={STATUS_TONE[o.status]}>{t(STATUS_LABEL[o.status])}</Badge> },
  ];
}

function useInvoiceColumns(): Column<Invoice>[] {
  const t = useText();
  const lang = useLang();
  return [
    { key: "no", header: t({ tr: "Fatura", en: "Invoice" }), cell: (i) => <span className="bt-mono">{i.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "due", header: t({ tr: "Vade", en: "Due date" }), cell: (i) => day(i.due, lang) },
    { key: "total", header: t({ tr: "Toplam", en: "Total" }), align: "right", cell: (i) => money(i.total, lang) },
    { key: "state", header: t({ tr: "Durum", en: "Status" }), cell: (i) => <Badge tone={INVOICE_TONE[i.state]}>{t(INVOICE_LABEL[i.state])}</Badge> },
  ];
}

function Hero() {
  const t = useText();
  const columns = useOrderColumns();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const rows = status === "all" ? ORDERS : ORDERS.filter((o) => o.status === status);
  const count = (s: OrderStatus) => ORDERS.filter((o) => o.status === s).length;
  return (
    <DataTable
      title={t({ tr: "Siparişler", en: "Orders" })}
      titleNote={rows.length}
      icon={<IconReceipt size={16} />}
      chips={
        <ChipGroup aria-label={t({ tr: "Duruma göre filtrele", en: "Filter by status" })}>
          <Chip active={status === "all"} count={ORDERS.length} onClick={() => setStatus("all")}>{t({ tr: "Tümü", en: "All" })}</Chip>
          {(["open", "pending", "done"] as const).map((s) => (
            <Chip key={s} active={status === s} count={count(s)} onClick={() => setStatus(s)}>{t(STATUS_LABEL[s])}</Chip>
          ))}
        </ChipGroup>
      }
      actions={<Button variant="primary" icon={<IconPlus size={15} />}>{t({ tr: "Yeni sipariş", en: "New order" })}</Button>}
      columns={columns}
      rows={rows}
      getRowKey={(o) => o.id}
      pageSize={6}
      defaultSort={{ key: "date", direction: "desc" }}
    />
  );
}

function Basic() {
  return <DataTable columns={useOrderColumns()} rows={ORDERS.slice(0, 5)} getRowKey={(o) => o.id} />;
}

function Sorting() {
  const t = useText();
  const lang = useLang();
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), cell: (o) => <span className="bt-mono">{o.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "date", header: t({ tr: "Tarih", en: "Date" }), sortValue: (o) => new Date(o.date), cell: (o) => day(o.date, lang) },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", cell: (o) => money(o.amount, lang) },
    { key: "status", header: t({ tr: "Durum", en: "Status" }), sortValue: (o) => STATUS_ORDER[o.status], cell: (o) => <Badge tone={STATUS_TONE[o.status]}>{t(STATUS_LABEL[o.status])}</Badge> },
    { key: "owner", header: t({ tr: "Sorumlu", en: "Owner" }), sortable: false },
  ];
  return <DataTable columns={columns} rows={ORDERS.slice(0, 8)} getRowKey={(o) => o.id} defaultSort={{ key: "status", direction: "asc" }} />;
}

function Collation() {
  const t = useText();
  const lang = useLang();
  const columns: Column<(typeof CONTACTS)[number]>[] = [
    { key: "name", header: t({ tr: "Yetkili", en: "Contact" }) },
    { key: "company", header: t({ tr: "Firma", en: "Company" }) },
  ];
  return (
    <DataTable
      title={t({ tr: "Müşteri yetkilileri", en: "Customer contacts" })}
      chips={<Badge tone="info">Intl.Collator("{lang}")</Badge>}
      controls={false}
      columns={columns}
      rows={CONTACTS}
      getRowKey={(c) => c.id}
      defaultSort={{ key: "name", direction: "asc" }}
    />
  );
}

function Band() {
  const t = useText();
  const lang = useLang();
  const [filter, setFilter] = useState<"all" | "mine" | "late">("all");
  const rows = APPROVALS.filter((a) => (filter === "mine" ? a.owner === "Ada Yılmaz" : filter === "late" ? a.days > 3 : true));
  const columns: Column<Approval>[] = [
    { key: "no", header: t({ tr: "Talep", en: "Request" }), cell: (a) => <span className="bt-mono">{a.no}</span> },
    { key: "subject", header: t({ tr: "Konu", en: "Subject" }), sortValue: (a) => t(a.subject), cell: (a) => t(a.subject) },
    { key: "owner", header: t({ tr: "Onaylayan", en: "Approver" }) },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", cell: (a) => money(a.amount, lang) },
    { key: "days", header: t({ tr: "Bekleme", en: "Waiting" }), align: "right", cell: (a) => t({ tr: `${a.days} gün`, en: `${a.days} d` }) },
  ];
  return (
    <DataTable
      title={t({ tr: "Onay bekleyenler", en: "Pending approvals" })}
      titleNote={rows.length}
      icon={<IconChecklist size={16} />}
      chips={
        <ChipGroup aria-label={t({ tr: "Onayları filtrele", en: "Filter approvals" })}>
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>{t({ tr: "Tümü", en: "All" })}</Chip>
          <Chip active={filter === "mine"} onClick={() => setFilter("mine")}>{t({ tr: "Bana atanan", en: "Assigned to me" })}</Chip>
          <Chip tone="danger" active={filter === "late"} count={APPROVALS.filter((a) => a.days > 3).length} onClick={() => setFilter("late")}>{t({ tr: "Geciken", en: "Overdue" })}</Chip>
        </ChipGroup>
      }
      actions={<Button icon={<IconDownload size={15} />}>{t({ tr: "Dışa aktar", en: "Export" })}</Button>}
      columns={columns}
      rows={rows}
      getRowKey={(a) => a.id}
    />
  );
}

function AccentBand() {
  const t = useText();
  const columns = useInvoiceColumns();
  const [state, setState] = useState<InvoiceState | "all">("all");
  const rows = state === "all" ? INVOICES : INVOICES.filter((i) => i.state === state);
  return (
    <DataTable
      bandTone="accent"
      title={t({ tr: "Faturalar", en: "Invoices" })}
      titleNote={rows.length}
      icon={<IconFileInvoice size={16} />}
      chips={
        <ChipGroup aria-label={t({ tr: "Fatura durumu", en: "Invoice status" })}>
          <Chip active={state === "all"} onClick={() => setState("all")}>{t({ tr: "Tümü", en: "All" })}</Chip>
          {(["paid", "due", "late"] as const).map((s) => (
            <Chip key={s} tone={INVOICE_TONE[s]} active={state === s} count={INVOICES.filter((i) => i.state === s).length} onClick={() => setState(s)}>{t(INVOICE_LABEL[s])}</Chip>
          ))}
        </ChipGroup>
      }
      actions={<Button variant="primary" icon={<IconPlus size={15} />}>{t({ tr: "Yeni fatura", en: "New invoice" })}</Button>}
      columns={columns}
      rows={rows}
      getRowKey={(i) => i.id}
    />
  );
}

function CustomCells() {
  const t = useText();
  const lang = useLang();
  const toast = useToast();
  const columns: Column<Order>[] = [
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }), hideable: false },
    {
      key: "owner",
      header: t({ tr: "Sorumlu", en: "Owner" }),
      cell: (o) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Avatar name={o.owner} size={24} />
          {o.owner}
        </span>
      ),
    },
    { key: "status", header: t({ tr: "Durum", en: "Status" }), sortValue: (o) => STATUS_ORDER[o.status], cell: (o) => <Status tone={STATUS_DOT[o.status]}>{t(STATUS_LABEL[o.status])}</Status> },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", cell: (o) => money(o.amount, lang) },
    {
      key: "actions",
      header: <span className="bt-sr">{t({ tr: "İşlemler", en: "Actions" })}</span>,
      sortable: false,
      hideable: false,
      align: "right",
      width: 48,
      cell: (o) => (
        <Menu trigger={<IconButton size="sm" label={t({ tr: `${o.no} işlemleri`, en: `Actions for ${o.no}` })}><IconDots size={15} /></IconButton>}>
          <MenuItem icon={<IconPencil size={15} />} onClick={() => toast({ title: t({ tr: `${o.no} düzenleniyor`, en: `Editing ${o.no}` }) })}>{t({ tr: "Düzenle", en: "Edit" })}</MenuItem>
          <MenuSeparator />
          <MenuItem icon={<IconTrash size={15} />} danger onClick={() => toast({ title: t({ tr: `${o.no} silindi`, en: `${o.no} deleted` }), tone: "danger" })}>{t({ tr: "Sil", en: "Delete" })}</MenuItem>
        </Menu>
      ),
    },
  ];
  return <DataTable columns={columns} rows={ORDERS.slice(0, 5)} getRowKey={(o) => o.id} />;
}

function ColumnMenu() {
  const t = useText();
  const lang = useLang();
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), hideable: false, cell: (o) => <span className="bt-mono">{o.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "city", header: t({ tr: "Şehir", en: "City" }) },
    { key: "owner", header: t({ tr: "Sorumlu", en: "Owner" }), hidden: true },
    { key: "date", header: t({ tr: "Tarih", en: "Date" }), hidden: true, cell: (o) => day(o.date, lang) },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", cell: (o) => money(o.amount, lang) },
  ];
  return <DataTable title={t({ tr: "Sipariş raporu", en: "Order report" })} storageKey="btui-docs-order-report" columns={columns} rows={ORDERS.slice(0, 5)} getRowKey={(o) => o.id} />;
}

function Compact() {
  return <DataTable controls defaultDensity="compact" columns={useOrderColumns()} rows={ORDERS.slice(0, 16)} getRowKey={(o) => o.id} maxHeight={320} />;
}

function RowClick() {
  const t = useText();
  const lang = useLang();
  const [current, setCurrent] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <DataTable
        columns={useOrderColumns()}
        rows={ORDERS.slice(0, 6)}
        getRowKey={(o) => o.id}
        selectedKey={current?.id ?? null}
        onRowClick={(o) => { setCurrent(o); setOpen(true); }}
      />
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={current?.no ?? ""}
        subtitle={current?.customer}
        footer={<Button variant="primary" onClick={() => setOpen(false)}>{t({ tr: "Kapat", en: "Close" })}</Button>}
      >
        {current ? (
          <>
            <InfoRow label={t({ tr: "Şehir", en: "City" })}>{current.city}</InfoRow>
            <InfoRow label={t({ tr: "Tarih", en: "Date" })}>{day(current.date, lang)}</InfoRow>
            <InfoRow label={t({ tr: "Sorumlu", en: "Owner" })}>{current.owner}</InfoRow>
            <InfoRow label={t({ tr: "Tutar", en: "Amount" })}>{money(current.amount, lang)}</InfoRow>
          </>
        ) : null}
      </Drawer>
    </>
  );
}

function Detail() {
  const t = useText();
  const lang = useLang();
  return (
    <DataTable
      columns={useOrderColumns()}
      rows={ORDERS.slice(0, 5)}
      getRowKey={(o) => o.id}
      renderDetail={(o) => (
        <div style={{ maxWidth: 420 }}>
          <InfoRow label={t({ tr: "Sorumlu", en: "Owner" })}>{o.owner}</InfoRow>
          <InfoRow label={t({ tr: "Ara toplam", en: "Subtotal" })}>{money(o.amount / 1.2, lang)}</InfoRow>
          <InfoRow label={t({ tr: "KDV (%20)", en: "VAT (20%)" })}>{money(o.amount - o.amount / 1.2, lang)}</InfoRow>
          <InfoRow label={t({ tr: "Genel toplam", en: "Grand total" })}>{money(o.amount, lang)}</InfoRow>
        </div>
      )}
    />
  );
}

function Bulk() {
  const t = useText();
  const toast = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(() => ORDERS.slice(0, 12));
  const [keys, setKeys] = useState<Array<string | number>>([]);

  const approve = () => {
    setRows(rows.map((o) => (keys.includes(o.id) ? { ...o, status: "done" as const } : o)));
    toast({ title: t({ tr: `${keys.length} sipariş onaylandı`, en: `${keys.length} orders approved` }), tone: "ok" });
    setKeys([]);
  };

  const remove = async () => {
    const ok = await confirm({
      danger: true,
      message: t({ tr: `${keys.length} sipariş silinecek. Bu işlem geri alınamaz.`, en: `${keys.length} orders will be deleted. This cannot be undone.` }),
      confirmLabel: t({ tr: `${keys.length} kaydı sil`, en: `Delete ${keys.length} records` }),
    });
    if (!ok) return;
    setRows(rows.filter((o) => !keys.includes(o.id)));
    setKeys([]);
  };

  return (
    <DataTable
      title={t({ tr: "Açık siparişler", en: "Open orders" })}
      titleNote={rows.length}
      controls={false}
      columns={useOrderColumns()}
      rows={rows}
      getRowKey={(o) => o.id}
      pageSize={5}
      selectedKeys={keys}
      onSelectionChange={setKeys}
      bulkActions={
        <>
          <Button size="sm" variant="success" icon={<IconCheck size={14} />} onClick={approve}>{t({ tr: "Onayla", en: "Approve" })}</Button>
          <Button size="sm" variant="danger" icon={<IconTrash size={14} />} onClick={remove}>{t({ tr: "Sil", en: "Delete" })}</Button>
        </>
      }
    />
  );
}

function Totals() {
  const t = useText();
  const lang = useLang();
  const sum = (key: "net" | "vat" | "total") => INVOICES.reduce((all, i) => all + i[key], 0);
  const late = INVOICES.filter((i) => i.state === "late").length;
  const columns: Column<Invoice>[] = [
    { key: "no", header: t({ tr: "Fatura", en: "Invoice" }), footer: t({ tr: "Toplam", en: "Total" }), cell: (i) => <span className="bt-mono">{i.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "net", header: t({ tr: "Matrah", en: "Net" }), align: "right", footer: money(sum("net"), lang), cell: (i) => money(i.net, lang) },
    { key: "vat", header: t({ tr: "KDV", en: "VAT" }), align: "right", footer: money(sum("vat"), lang), cell: (i) => money(i.vat, lang) },
    { key: "total", header: t({ tr: "Toplam", en: "Total" }), align: "right", footer: money(sum("total"), lang), cell: (i) => money(i.total, lang) },
  ];
  return (
    <DataTable
      columns={columns}
      rows={INVOICES}
      getRowKey={(i) => i.id}
      footerNote={t({ tr: `${INVOICES.length} fatura, ${late} tanesi gecikmede`, en: `${INVOICES.length} invoices, ${late} overdue` })}
    />
  );
}

function States() {
  const t = useText();
  const columns = useOrderColumns();
  const [view, setView] = useState<"data" | "first" | "refresh" | "empty">("first");
  const views = [
    { id: "first", label: t({ tr: "İlk yükleme", en: "First load" }) },
    { id: "refresh", label: t({ tr: "Yenileme", en: "Refresh" }) },
    { id: "empty", label: t({ tr: "Boş", en: "Empty" }) },
    { id: "data", label: t({ tr: "Dolu", en: "Filled" }) },
  ] as const;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ChipGroup aria-label={t({ tr: "Tablo durumu", en: "Table state" })}>
        {views.map((v) => <Chip key={v.id} active={view === v.id} onClick={() => setView(v.id)}>{v.label}</Chip>)}
      </ChipGroup>
      <DataTable
        columns={columns}
        rows={view === "data" || view === "refresh" ? ORDERS.slice(0, 4) : []}
        getRowKey={(o) => o.id}
        loading={view === "first" || view === "refresh"}
        empty={
          <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
            {t({ tr: "Bu filtreye uyan sipariş yok.", en: "No orders match this filter." })}
            <Button size="sm" onClick={() => setView("data")}>{t({ tr: "Filtreleri temizle", en: "Clear filters" })}</Button>
          </div>
        }
      />
    </div>
  );
}

const SERVER_PAGE_SIZE = 6;

function fetchOrders(page: number, sort: SortState | null, lang: string) {
  const sorted = sortRows(ORDERS, sort ? { key: sort.key, header: sort.key } : undefined, sort?.direction ?? "asc", lang);
  const start = (page - 1) * SERVER_PAGE_SIZE;
  return new Promise<{ rows: Order[]; total: number }>((resolve) => {
    setTimeout(() => resolve({ rows: sorted.slice(start, start + SERVER_PAGE_SIZE), total: sorted.length }), 600);
  });
}

function Server() {
  const t = useText();
  const lang = useLang();
  const columns = useOrderColumns();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState | null>({ key: "date", direction: "desc" });
  const [data, setData] = useState<{ rows: Order[]; total: number }>({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stale = false;
    setLoading(true);
    fetchOrders(page, sort, lang).then((next) => {
      if (stale) return;
      setData(next);
      setLoading(false);
    });
    return () => { stale = true; };
  }, [page, sort, lang]);

  const query = `GET /orders?page=${page}&size=${SERVER_PAGE_SIZE}${sort ? `&sort=${sort.key}:${sort.direction}` : ""}`;

  return (
    <DataTable
      title={t({ tr: "Tüm siparişler", en: "All orders" })}
      titleNote={data.total}
      chips={<Badge><span className="bt-mono">{query}</span></Badge>}
      controls={false}
      columns={columns}
      rows={data.rows}
      getRowKey={(o) => o.id}
      loading={loading}
      pageSize={SERVER_PAGE_SIZE}
      server={{ total: data.total, page, onPageChange: setPage }}
      sort={sort}
      onSortChange={(next) => { setSort(next); setPage(1); }}
    />
  );
}

export default definePage({
  summary: { tr: "Sıralama, sayfalama, seçim, ayrıntı satırı ve sunucu verisini tek bileşende toplar. İş uygulamalarındaki liste ekranlarının çoğu bununla kurulur. Filtre, gruplama, Excel, düzenleme ve 100 bin satır için Gelişmiş ızgara sayfasına bakın.", en: "Sorting, paging, selection, detail rows and server data in a single component. Most list screens in a business app are built on it. See Advanced grid for filters, grouping, Excel, editing and 100k rows." },
  imports: 'import { DataTable, type Column } from "btui";',
  hero: {
    Demo: Hero,
    block: true,
    code: `const columns: Column<Order>[] = [
  { key: "no", header: "Order", width: 104, cell: (o) => <span className="bt-mono">{o.no}</span> },
  { key: "customer", header: "Customer" },
  { key: "city", header: "City" },
  { key: "date", header: "Date", cell: (o) => formatDate(o.date) },
  { key: "amount", header: "Amount", align: "right", cell: (o) => money(o.amount, lang) },
  { key: "status", header: "Status", cell: (o) => <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge> },
];

<DataTable
  title="Orders"
  titleNote={rows.length}
  icon={<IconReceipt size={16} />}
  chips={
    <ChipGroup aria-label="Filter by status">
      <Chip active={status === "all"} count={ORDERS.length} onClick={() => setStatus("all")}>All</Chip>
      <Chip active={status === "open"} count={openCount} onClick={() => setStatus("open")}>Open</Chip>
    </ChipGroup>
  }
  actions={<Button variant="primary" icon={<IconPlus size={15} />}>New order</Button>}
  columns={columns}
  rows={rows}
  getRowKey={(o) => o.id}
  pageSize={6}
  defaultSort={{ key: "date", direction: "desc" }}
/>`,
  },
  use: {
    do: [
      { tr: "Sipariş, fatura, müşteri gibi aynı yapıda çok kayıt listelemek", en: "Listing many records of one shape: orders, invoices, customers" },
      { tr: "Kayıtları karşılaştırmak, sıralamak ve toplu işlem yapmak", en: "Comparing, sorting and acting on records in bulk" },
      { tr: "Satırdan ayrıntıya geçilen ana liste ekranları", en: "Master lists that lead from a row to its details" },
    ],
    dont: [
      { tr: "Tek bir kaydın alanlarını göstermek; bunun için `InfoRow` daha okunaklıdır", en: "Showing the fields of one record; `InfoRow` reads better" },
      { tr: "Beş satırlık özetler; sade bir `Card` listesi yeterlidir", en: "Five line summaries; a plain `Card` list is enough" },
      { tr: "Sayfalamasız binlerce satır; `pageSize` ya da `server` kullanın", en: "Thousands of rows without paging; use `pageSize` or `server`" },
    ],
  },
  anatomy: `<DataTable
  title icon titleNote chips actions bulkActions
  columns rows getRowKey
  renderDetail
  pageSize footerNote
/>`,
  examples: [
    {
      id: "basic",
      title: { tr: "Temel kullanım", en: "Basic" },
      body: { tr: "Üç zorunlu prop yeter: `columns`, `rows`, `getRowKey`. `cell` verilmezse hücre, satırın `key` adlı alanını gösterir. Bant içeriği yoksa bant hiç çizilmez.", en: "Three required props are enough: `columns`, `rows` and `getRowKey`. Without `cell`, a column shows the row field named by `key`. With no band content the band is not drawn at all." },
      example: {
        Demo: Basic,
        block: true,
        code: `const columns: Column<Order>[] = [
  { key: "customer", header: "Customer" },
  { key: "city", header: "City" },
  { key: "amount", header: "Amount", align: "right", cell: (o) => money(o.amount, lang) },
];

<DataTable columns={columns} rows={orders} getRowKey={(o) => o.id} />`,
      },
    },
    {
      id: "sorting",
      title: { tr: "Sıralama", en: "Sorting" },
      body: { tr: "Her sütun varsayılan olarak sıralanır; kapatmak için `sortable: false` verin. Başlığa basmak artan, azalan ve sırasız durumlar arasında geçer. `sortValue` ekrandaki metinden farklı bir değerle sıralamayı sağlar: burada durumlar alfabeye göre değil, iş akışı sırasına göre dizilir. Boş değerler her iki yönde de en altta kalır.", en: "Every column sorts by default; turn it off with `sortable: false`. Pressing a header cycles through ascending, descending and unsorted. `sortValue` sorts by something other than the displayed text: here statuses follow the workflow rather than the alphabet. Blank values stay at the bottom in both directions." },
      example: {
        Demo: Sorting,
        block: true,
        code: `const STATUS_ORDER = { open: 0, pending: 1, done: 2, cancelled: 3 };

const columns: Column<Order>[] = [
  { key: "date", header: "Date", sortValue: (o) => new Date(o.date), cell: (o) => formatDate(o.date) },
  { key: "status", header: "Status", sortValue: (o) => STATUS_ORDER[o.status], cell: (o) => <Badge>{o.status}</Badge> },
  { key: "owner", header: "Owner", sortable: false },
];

<DataTable columns={columns} rows={orders} getRowKey={(o) => o.id} defaultSort={{ key: "status", direction: "asc" }} />`,
      },
    },
    {
      id: "collation",
      title: { tr: "Türkçe sıralama", en: "Turkish collation" },
      body: { tr: "Metinler `BtuiProvider` diliyle `Intl.Collator` üzerinden karşılaştırılır, kod noktasına göre değil. Türkçede Ç, C'den; Ş, S'den; İ, I'dan sonra gelir ve `SP-1100`, `SP-990`'ın ardından sıralanır. Sayfanın dilini değiştirip Işıl ile İpek'in, Oya ile Ömer'in yer değiştirdiğine bakın.", en: "Text is compared with `Intl.Collator` in the `BtuiProvider` language, not by code point. In Turkish, Ç follows C, Ş follows S, İ follows I, and `SP-1100` sorts after `SP-990`. Switch the page language and watch Işıl and İpek, or Oya and Ömer, trade places." },
      example: {
        Demo: Collation,
        block: true,
        code: `<BtuiProvider locale="tr">
  <DataTable
    columns={[{ key: "name", header: "Contact" }, { key: "company", header: "Company" }]}
    rows={contacts}
    getRowKey={(c) => c.id}
    defaultSort={{ key: "name", direction: "asc" }}
  />
</BtuiProvider>`,
      },
    },
    {
      id: "band",
      title: { tr: "Bant, hızlı filtre ve eylemler", en: "Band, chips and actions" },
      body: { tr: "`title`, `icon`, `titleNote`, `chips` ve `actions` tablonun üst bandını oluşturur. Filtrelemeyi `DataTable` yapmaz; `chips` içinde durumu siz tutar, filtrelenmiş diziyi `rows` ile verirsiniz. Bant varsa sütun ve yoğunluk düğmeleri kendiliğinden gelir.", en: "`title`, `icon`, `titleNote`, `chips` and `actions` make up the band above the table. `DataTable` does not filter for you: keep the state yourself and pass the filtered array as `rows`. Column and density controls appear on their own once there is a band." },
      example: {
        Demo: Band,
        block: true,
        code: `<DataTable
  title="Pending approvals"
  titleNote={rows.length}
  icon={<IconChecklist size={16} />}
  chips={
    <ChipGroup aria-label="Filter approvals">
      <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
      <Chip active={filter === "mine"} onClick={() => setFilter("mine")}>Assigned to me</Chip>
      <Chip tone="danger" active={filter === "late"} count={2} onClick={() => setFilter("late")}>Overdue</Chip>
    </ChipGroup>
  }
  actions={<Button icon={<IconDownload size={15} />}>Export</Button>}
  columns={columns}
  rows={rows}
  getRowKey={(a) => a.id}
/>`,
      },
    },
    {
      id: "accent-band",
      title: { tr: "Vurgulu bant", en: "Accent band" },
      body: { tr: "`bandTone=\"accent\"` bandı marka rengiyle doldurur. Ana liste ekranında bir kez kullanın; bir sayfadaki her tablo vurguluysa hiçbiri öne çıkmaz. Bu bantta `tone` taşıyan `Chip` düz renkli bir etikete dönüşür, `primary` düğme de beyaz zemine geçer.", en: "`bandTone=\"accent\"` fills the band with the brand colour. Use it once, on the main list of a screen: when every table is accented, none stands out. In this band a `Chip` with a `tone` becomes a solid label and a `primary` button turns white." },
      example: {
        Demo: AccentBand,
        block: true,
        code: `<DataTable
  bandTone="accent"
  title="Invoices"
  titleNote={rows.length}
  icon={<IconFileInvoice size={16} />}
  chips={
    <ChipGroup aria-label="Invoice status">
      <Chip active={state === "all"} onClick={() => setState("all")}>All</Chip>
      <Chip tone="ok" count={2} active={state === "paid"} onClick={() => setState("paid")}>Paid</Chip>
      <Chip tone="warn" count={2} active={state === "due"} onClick={() => setState("due")}>Due soon</Chip>
      <Chip tone="danger" count={2} active={state === "late"} onClick={() => setState("late")}>Overdue</Chip>
    </ChipGroup>
  }
  actions={<Button variant="primary" icon={<IconPlus size={15} />}>New invoice</Button>}
  columns={columns}
  rows={rows}
  getRowKey={(i) => i.id}
/>`,
      },
    },
    {
      id: "custom-cells",
      title: { tr: "Özel hücreler", en: "Custom cells" },
      body: { tr: "`cell` her türlü içeriği döndürebilir: kişi görseli, durum, satır menüsü. Eylem sütununda `sortable: false` ve `hideable: false` verin, başlığı da `bt-sr` sınıfıyla yalnız ekran okuyucuya bırakın. `IconButton` etiketi her satırda hangi kaydın işleneceğini söylemelidir.", en: "`cell` can return anything: a person's avatar, a status, a row menu. On an action column set `sortable: false` and `hideable: false`, and keep the header for screen readers with the `bt-sr` class. The `IconButton` label should name the record on each row." },
      example: {
        Demo: CustomCells,
        block: true,
        code: `const columns: Column<Order>[] = [
  { key: "customer", header: "Customer", hideable: false },
  {
    key: "owner",
    header: "Owner",
    cell: (o) => (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Avatar name={o.owner} size={24} />
        {o.owner}
      </span>
    ),
  },
  { key: "status", header: "Status", cell: (o) => <Status tone="ok">{o.status}</Status> },
  {
    key: "actions",
    header: <span className="bt-sr">Actions</span>,
    sortable: false,
    hideable: false,
    align: "right",
    width: 48,
    cell: (o) => (
      <Menu trigger={<IconButton size="sm" label={\`Actions for \${o.no}\`}><IconDots size={15} /></IconButton>}>
        <MenuItem icon={<IconPencil size={15} />}>Edit</MenuItem>
        <MenuSeparator />
        <MenuItem icon={<IconTrash size={15} />} danger>Delete</MenuItem>
      </Menu>
    ),
  },
];`,
      },
    },
    {
      id: "column-menu",
      title: { tr: "Sütun menüsü ve kalıcı tercih", en: "Column menu and saved preferences" },
      body: { tr: "Bantlı tablolarda \"Kolonlar\" düğmesi sütun menüsünü açar. `hidden: true` sütunu baştan gizler, `hideable: false` menüden çıkarır. `storageKey` verildiğinde gizli sütunlar ve yoğunluk `localStorage` üzerinde saklanır: burada bir sütun açıp sayfayı yenileyin, tercih yerinde kalır. \"Varsayılana dön\" yalnız sütunları sıfırlar, yoğunluğa dokunmaz. Son görünür sütun kapatılamaz.", en: "With a band, the Columns button opens the column menu. `hidden: true` starts a column hidden and `hideable: false` keeps it out of the menu. With `storageKey`, hidden columns and density are kept in `localStorage`: turn a column on here, reload, and it stays. Reset to default restores columns only and leaves density alone. The last visible column cannot be turned off." },
      example: {
        Demo: ColumnMenu,
        block: true,
        code: `const columns: Column<Order>[] = [
  { key: "no", header: "Order", hideable: false },
  { key: "customer", header: "Customer" },
  { key: "city", header: "City" },
  { key: "owner", header: "Owner", hidden: true },
  { key: "date", header: "Date", hidden: true },
  { key: "amount", header: "Amount", align: "right" },
];

<DataTable title="Order report" storageKey="orders-report" columns={columns} rows={rows} getRowKey={(o) => o.id} />`,
      },
    },
    {
      id: "density",
      title: { tr: "Sık görünüm", en: "Compact density" },
      body: { tr: "`defaultDensity=\"compact\"` tabloyu sık başlatır, ekrana daha çok kayıt sığar. Kullanıcı bandın sağındaki düğmeyle değiştirebilir; `storageKey` verirseniz tercihi hatırlanır.", en: "`defaultDensity=\"compact\"` starts the table compact so more records fit on screen. People can switch with the button in the band, and `storageKey` remembers their choice." },
      example: {
        Demo: Compact,
        block: true,
        code: `<DataTable controls defaultDensity="compact" storageKey="orders-density" maxHeight={320} columns={columns} rows={rows} getRowKey={(o) => o.id} />`,
      },
    },
    {
      id: "row-click",
      title: { tr: "Satır tıklama ve seçili satır", en: "Row click and selected row" },
      body: { tr: "`onRowClick` satırı tıklanabilir ve odaklanabilir yapar. `selectedKey` açık kaydın satırını vurgular, çekmece kapandıktan sonra da kullanıcı nerede kaldığını görür. Satır içindeki düğme ya da menü için sarmalayan öğede `stopPropagation` çağırın, yoksa tıklama satıra da ulaşır.", en: "`onRowClick` makes a row clickable and focusable. `selectedKey` highlights the open record, so people can still see where they were after the drawer closes. For a button or menu inside a row, call `stopPropagation` on a wrapping element, otherwise the click reaches the row too." },
      example: {
        Demo: RowClick,
        block: true,
        code: `const [current, setCurrent] = useState<Order | null>(null);
const [open, setOpen] = useState(false);

<DataTable
  columns={columns}
  rows={rows}
  getRowKey={(o) => o.id}
  selectedKey={current?.id ?? null}
  onRowClick={(o) => { setCurrent(o); setOpen(true); }}
/>

<Drawer open={open} onClose={() => setOpen(false)} title={current?.no ?? ""} subtitle={current?.customer}>
  <InfoRow label="City">{current?.city}</InfoRow>
</Drawer>`,
      },
    },
    {
      id: "detail",
      title: { tr: "Açılır ayrıntı", en: "Expandable detail" },
      body: { tr: "`renderDetail` satırın başına bir ok düğmesi ekler ve içeriği tam genişlikte bir alt satırda açar. Birden çok satır aynı anda açık kalabilir. Sayfa değiştirmeden bakılacak kısa bilgiler için uygundur; uzun içerik `Drawer` ister.", en: "`renderDetail` adds an arrow button at the start of each row and opens the content in a full width row underneath. Several rows can stay open at once. It suits short facts read without leaving the list; longer content belongs in a `Drawer`." },
      example: {
        Demo: Detail,
        block: true,
        code: `<DataTable
  columns={columns}
  rows={rows}
  getRowKey={(o) => o.id}
  renderDetail={(o) => (
    <div style={{ maxWidth: 420 }}>
      <InfoRow label="Owner">{o.owner}</InfoRow>
      <InfoRow label="Subtotal">{money(o.amount / 1.2, lang)}</InfoRow>
      <InfoRow label="Grand total">{money(o.amount, lang)}</InfoRow>
    </div>
  )}
/>`,
      },
    },
    {
      id: "bulk",
      title: { tr: "Çoklu seçim ve toplu işlem", en: "Multi-select and bulk actions" },
      body: { tr: "`selectedKeys` ile `onSelectionChange` kutu sütununu açar. Satır seçilince bant, hızlı filtrelerin yerine seçim sayısını ve `bulkActions` içeriğini gösterir. Başlıktaki kutu yalnız görünen sayfayı seçer; seçim sayfalar arasında korunur, sayaç da tüm sayfaları sayar. Silmeyi `useConfirm` ile doğrulatın.", en: "`selectedKeys` with `onSelectionChange` turns on the checkbox column. Once rows are checked, the band swaps its chips for the selection count and `bulkActions`. The header checkbox covers the visible page only; selection survives paging and the counter includes every page. Confirm deletion with `useConfirm`." },
      example: {
        Demo: Bulk,
        block: true,
        code: `const [keys, setKeys] = useState<Array<string | number>>([]);

<DataTable
  title="Open orders"
  columns={columns}
  rows={rows}
  getRowKey={(o) => o.id}
  pageSize={5}
  selectedKeys={keys}
  onSelectionChange={setKeys}
  bulkActions={
    <>
      <Button size="sm" variant="success" icon={<IconCheck size={14} />} onClick={approve}>Approve</Button>
      <Button size="sm" variant="danger" icon={<IconTrash size={14} />} onClick={remove}>Delete</Button>
    </>
  }
/>`,
      },
    },
    {
      id: "totals",
      title: { tr: "Dip toplam", en: "Footer totals" },
      body: { tr: "Sütundaki `footer` tablonun altına sabit bir satır ekler. Tablo toplamı kendisi hesaplamaz; değeri siz verirsiniz, böylece tüm kayıtların mı yoksa görünen sayfanın mı toplandığına siz karar verirsiniz. `footerNote` alt şeridin solundaki metindir ve doluysa \"1-6 / 42 kayıt\" sayacının yerini alır.", en: "`footer` on a column adds a fixed row at the bottom of the table. The table does not add anything up: you supply the value, so you decide whether it covers all records or the visible page. `footerNote` is the text on the left of the bottom strip and, when set, replaces the \"1-6 of 42\" counter." },
      example: {
        Demo: Totals,
        block: true,
        code: `const columns: Column<Invoice>[] = [
  { key: "no", header: "Invoice", footer: "Total" },
  { key: "customer", header: "Customer" },
  { key: "net", header: "Net", align: "right", footer: money(net, lang), cell: (i) => money(i.net, lang) },
  { key: "vat", header: "VAT", align: "right", footer: money(vat, lang), cell: (i) => money(i.vat, lang) },
  { key: "total", header: "Total", align: "right", footer: money(total, lang), cell: (i) => money(i.total, lang) },
];

<DataTable columns={columns} rows={invoices} getRowKey={(i) => i.id} footerNote="6 invoices, 2 overdue" />`,
      },
    },
    {
      id: "states",
      title: { tr: "Yükleniyor ve boş", en: "Loading and empty" },
      body: { tr: "`loading` iki biçimde görünür. Satır yoksa gövdede gösterge çizilir; satır varsa veriler soluklaşır ve yerinde kalır, böylece yenileme sırasında sayfa zıplamaz. `empty` boş durum metnini değiştirir ve `.bt-empty` içine yerleşir, bu yüzden buraya `EmptyState` değil düz içerik verin. Yukarıdaki düğmelerle durumlar arasında gezin.", en: "`loading` has two faces. With no rows the body shows a spinner; with rows the data fades and stays in place, so a refresh does not make the page jump. `empty` replaces the empty message and sits inside `.bt-empty`, so give it plain content rather than an `EmptyState`. Use the buttons above to walk through the states." },
      example: {
        Demo: States,
        block: true,
        code: `<DataTable
  columns={columns}
  rows={rows}
  getRowKey={(o) => o.id}
  loading={loading}
  empty={
    <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
      No orders match this filter.
      <Button size="sm" onClick={clearFilters}>Clear filters</Button>
    </div>
  }
/>`,
      },
    },
    {
      id: "server",
      title: { tr: "Sunucu kipi", en: "Server mode" },
      body: { tr: "`server` verildiğinde `rows` yalnız geçerli sayfadır ve tablo hiçbir şeyi kendisi dilimlemez ya da sıralamaz. Sayfa değişimini `onPageChange`, sıralamayı `onSortChange` bildirir; `onSortChange` yoksa başlıklar sıralanmaz. Yeni sıralamada sayfayı 1'e siz döndürün. `pageSize` değerini mutlaka verin: verilmezse sayfa boyu `rows.length` sayılır ve kısa son sayfada toplam sayfa sayısı bozulur. Bu örnek 600 ms geciken gerçek bir istek gibi çalışır; banttaki adres her seferinde güncellenir, geç gelen yanıtlar da `stale` bayrağıyla atılır.", en: "With `server`, `rows` is only the current page and the table neither slices nor sorts anything. `onPageChange` reports paging and `onSortChange` reports sorting; without `onSortChange` the headers do not sort. Go back to page 1 yourself on a new sort. Always pass `pageSize`: otherwise the page size is taken from `rows.length` and a short last page breaks the page count. This example behaves like a real request delayed by 600 ms; the address in the band updates each time and late responses are dropped through the `stale` flag." },
      example: {
        Demo: Server,
        block: true,
        code: `const PAGE_SIZE = 6;

function fetchOrders(page: number, sort: SortState | null, lang: string) {
  const sorted = sortRows(ORDERS, sort ? { key: sort.key, header: sort.key } : undefined, sort?.direction ?? "asc", lang);
  const start = (page - 1) * PAGE_SIZE;
  return new Promise<{ rows: Order[]; total: number }>((resolve) => {
    setTimeout(() => resolve({ rows: sorted.slice(start, start + PAGE_SIZE), total: sorted.length }), 600);
  });
}

function OrdersTable() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState | null>({ key: "date", direction: "desc" });
  const [data, setData] = useState<{ rows: Order[]; total: number }>({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stale = false;
    setLoading(true);
    fetchOrders(page, sort, "tr").then((next) => {
      if (stale) return;
      setData(next);
      setLoading(false);
    });
    return () => { stale = true; };
  }, [page, sort]);

  return (
    <DataTable
      columns={columns}
      rows={data.rows}
      getRowKey={(o) => o.id}
      loading={loading}
      pageSize={PAGE_SIZE}
      server={{ total: data.total, page, onPageChange: setPage }}
      sort={sort}
      onSortChange={(next) => { setSort(next); setPage(1); }}
    />
  );
}`,
      },
    },
  ],
  a11y: [
    { tr: "Gerçek `<table>`, `<thead>`, `<tbody>` ve `<tfoot>` çizer; ekran okuyucular satır ve sütun konumunu kendiliğinden bildirir.", en: "Renders a real `<table>` with `<thead>`, `<tbody>` and `<tfoot>`, so screen readers announce row and column positions on their own." },
    { tr: "Sıralanabilir başlıklar `<button>` olur ve sıralı sütunda `aria-sort` bulunur; `loading` sırasında tabloya `aria-busy` eklenir.", en: "Sortable headers are `<button>` elements and the sorted column carries `aria-sort`; `loading` adds `aria-busy` to the table." },
    { tr: "Seçim kutularının ve ayrıntı düğmelerinin etiketleri `BtuiProvider` dilinden gelir; ayrıntı düğmesi `aria-expanded` taşır.", en: "Labels on checkboxes and detail buttons come from the `BtuiProvider` language, and the detail button carries `aria-expanded`." },
    { tr: "`onRowClick` satıra klavye odağı verir ama satırı düğme olarak duyurmaz. Asıl eylemi bir hücrede bağlantı ya da düğme olarak da sunun.", en: "`onRowClick` gives a row keyboard focus but does not announce it as a button. Offer the main action as a link or button in a cell too." },
    { tr: "`selectedKey` yalnız görsel bir vurgudur. Seçili kaydı başlık ya da çekmece gibi metinle de belirtin.", en: "`selectedKey` is a visual highlight only. State the selected record in text too, such as a heading or a drawer title." },
  ],
  keyboard: [
    ["Tab", { tr: "Sıralama başlıkları, kutular, ayrıntı düğmeleri, tıklanabilir satırlar ve sayfa düğmeleri arasında gezer", en: "Moves through sort headers, checkboxes, detail buttons, clickable rows and page buttons" }],
    ["Enter", { tr: "Başlıkta sıralar, ayrıntı düğmesinde açıp kapatır, odaktaki satırda `onRowClick` çalıştırır", en: "Sorts on a header, toggles on a detail button, runs `onRowClick` on a focused row" }],
    ["Space", { tr: "Başlıkta sıralar, kutuyu işaretler, ayrıntıyı açıp kapatır, odaktaki satırda `onRowClick` çalıştırır", en: "Sorts on a header, ticks a checkbox, toggles a detail row, runs `onRowClick` on a focused row" }],
    ["Esc", { tr: "Sütun menüsünü kapatır", en: "Closes the column menu" }],
  ],
  api: [
    {
      name: "DataTable",
      description: { tr: "`DataTable<T>` satır tipini `rows` üzerinden çıkarır. Yerel tablo öznitelikleri ve ref iletilmez.", en: "`DataTable<T>` infers the row type from `rows`. Native table attributes and the ref are not forwarded." },
      props: [
        { name: "columns", type: "Column<T>[]", required: true, description: { tr: "Sütun tanımları", en: "Column definitions" } },
        { name: "rows", type: "T[]", required: true, description: { tr: "Satırlar. Sunucu kipinde yalnız geçerli sayfa", en: "The rows. In server mode, the current page only" } },
        { name: "getRowKey", type: "(row: T) => string | number", required: true, description: { tr: "Satırın kalıcı anahtarını verir", en: "Returns a stable key for the row" } },
        { name: "title", type: "ReactNode", description: { tr: "Bant başlığı", en: "Band title" } },
        { name: "titleNote", type: "ReactNode", description: { tr: "Başlığın yanında parantez içinde gösterilir; `title` yoksa görünmez", en: "Shown in brackets next to the title; hidden without `title`" } },
        { name: "icon", type: "ReactNode", description: { tr: "Başlıktan önce gösterilir; `title` yoksa görünmez", en: "Shown before the title; hidden without `title`" } },
        { name: "chips", type: "ReactNode", description: { tr: "Bantta başlığın yanındaki içerik", en: "Band content beside the title" } },
        { name: "actions", type: "ReactNode", description: { tr: "Bandın sağındaki eylemler", en: "Actions on the right of the band" } },
        { name: "bandTone", type: '"plain" | "accent"', default: '"plain"', description: { tr: "`accent` bandı marka rengiyle doldurur", en: "`accent` fills the band with the brand colour" } },
        { name: "controls", type: "boolean", description: { tr: "Sütun ve yoğunluk düğmeleri. Verilmezse bant içeriği varken açılır", en: "Column and density buttons. When omitted, on whenever the band has content" } },
        { name: "storageKey", type: "string", description: { tr: "Sütunları, genişlikleri, sıralamayı, filtreleri ve yoğunluğu saklayan `localStorage` anahtarı", en: "`localStorage` key that keeps columns, widths, sort, filters and density" } },
        { name: "pageSize", type: "number", description: { tr: "Sayfa başına satır. Verilmezse tablo sayfalanmaz; sunucu kipinde `rows.length` sayılır", en: "Rows per page. When omitted there is no paging; in server mode `rows.length` is used" } },
        { name: "defaultDensity", type: '"comfortable" | "compact"', default: '"comfortable"', description: { tr: "Başlangıç yoğunluğu. `storageKey` altındaki kayıt önceliklidir", en: "Starting density. A value saved under `storageKey` wins" } },
        { name: "server", type: "{ total: number; page: number; onPageChange: (page: number) => void }", description: { tr: "Sunucu kipi. `rows` geçerli sayfa olur, sıralama uygulanmaz", en: "Server mode. `rows` becomes the current page and sorting is not applied" } },
        { name: "sort", type: "SortState | null", description: { tr: "Denetimli sıralama. `null` sırasız demektir", en: "Controlled sort. `null` means unsorted" } },
        { name: "defaultSort", type: "SortState | null", default: "null", description: { tr: "Başlangıç sıralaması", en: "Initial sort" } },
        { name: "onSortChange", type: "(sort: SortState | null, all: SortState[]) => void", description: { tr: "Sıralama değişince çağrılır. İkinci değer Shift ile eklenen tüm seviyeleri tutar. Sunucu kipinde başlıkların sıralanması için gereklidir", en: "Called when the sort changes. The second value holds every level added with Shift. Required for sortable headers in server mode" } },
        { name: "loading", type: "boolean", default: "false", description: { tr: "Satır yoksa gösterge çizer, varsa satırları soluklaştırır", en: "Shows a spinner with no rows, fades existing rows otherwise" } },
        { name: "empty", type: "ReactNode", default: "locale.empty", description: { tr: "Boş durum içeriği", en: "Empty state content" } },
        { name: "onRowClick", type: "(row: T) => void", description: { tr: "Satırı tıklanabilir ve odaklanabilir yapar", en: "Makes rows clickable and focusable" } },
        { name: "selectedKey", type: "string | number | null", description: { tr: "Vurgulanan tek satırın anahtarı", en: "Key of the single highlighted row" } },
        { name: "selectedKeys", type: "Array<string | number>", default: "[]", description: { tr: "İşaretli satırların anahtarları", en: "Keys of the checked rows" } },
        { name: "onSelectionChange", type: "(keys: Array<string | number>) => void", description: { tr: "Kutu sütununu açar", en: "Turns on the checkbox column" } },
        { name: "bulkActions", type: "ReactNode", description: { tr: "Satır işaretliyken `chips` yerine bantta gösterilir", en: "Replaces `chips` in the band while rows are checked" } },
        { name: "renderDetail", type: "(row: T) => ReactNode", description: { tr: "Açılır ayrıntı satırının içeriği", en: "Content of the expandable detail row" } },
        { name: "rowClassName", type: "(row: T) => string | undefined", description: { tr: "Satıra koşullu sınıf ekler", en: "Adds a conditional class to a row" } },
        { name: "footerNote", type: "ReactNode", description: { tr: "Alt şeridin solu. Doluysa kayıt sayacının yerini alır", en: "Left side of the bottom strip. Replaces the record counter when set" } },
        { name: "maxHeight", type: "number | string", description: { tr: "Gövdeyi kaydırılabilir yapar, başlık sabit kalır", en: "Makes the body scroll with a fixed header" } },
        { name: "className", type: "string", description: { tr: "Dış `section` öğesine eklenir", en: "Added to the outer `section`" } },
      ],
    },
    {
      name: "Column",
      description: { tr: "`Column<T>` tek bir sütunu tanımlar. Dil değişiminde başlıkların güncellenmesi için diziyi bileşen içinde kurun.", en: "`Column<T>` describes one column. Build the array inside a component so headers follow language changes." },
      props: [
        { name: "key", type: "string", required: true, description: { tr: "Sütun kimliği. `cell` ya da `sortValue` yoksa satırdan okunan alanın adı", en: "Column id. Also the row field read when `cell` or `sortValue` is missing" } },
        { name: "header", type: "ReactNode", required: true, description: { tr: "Başlık içeriği. Sütun menüsünde de bu görünür", en: "Header content. The column menu shows it too" } },
        { name: "cell", type: "(row: T) => ReactNode", description: { tr: "Hücre içeriği. Varsayılan: satırın `key` alanı", en: "Cell content. Defaults to the row field named `key`" } },
        { name: "sortValue", type: "(row: T) => string | number | Date | null | undefined", description: { tr: "Sıralamada kullanılan değer. Varsayılan: satırın `key` alanı", en: "Value used for sorting. Defaults to the row field named `key`" } },
        { name: "sortable", type: "boolean", default: "true", description: { tr: "`false` başlığı düz metne çevirir", en: "`false` turns the header into plain text" } },
        { name: "align", type: '"left" | "right" | "center"', description: { tr: "Başlık, hücre ve dip toplam hizası. Tutarlar için `right`", en: "Alignment of header, cells and footer. Use `right` for amounts" } },
        { name: "width", type: "number | string", description: { tr: "Başlık hücresine uygulanan genişlik", en: "Width applied to the header cell" } },
        { name: "hidden", type: "boolean", default: "false", description: { tr: "Sütun menüsünden açılana kadar gizli kalır", en: "Hidden until turned on from the column menu" } },
        { name: "hideable", type: "boolean", default: "true", description: { tr: "`false` sütunu menünün dışında tutar", en: "`false` keeps the column out of the menu" } },
        { name: "footer", type: "ReactNode", description: { tr: "Dip satır hücresi. Bir sütunda bile verilirse satır görünür", en: "Footer row cell. Setting it on any column shows the row" } },
      ],
    },
    {
      name: "SortState",
      description: { tr: "`sort`, `defaultSort` ve `onSortChange` bu şekli kullanır.", en: "The shape used by `sort`, `defaultSort` and `onSortChange`." },
      props: [
        { name: "key", type: "string", required: true, description: { tr: "Sıralanan sütunun `key` değeri", en: "The `key` of the sorted column" } },
        { name: "direction", type: '"asc" | "desc"', required: true, description: { tr: "Sıralama yönü", en: "Sort direction" } },
      ],
    },
    {
      name: "sortRows",
      description: { tr: "Tablonun kullandığı sıralama işlevi: `sortRows(rows, column, direction, lang)`. Yeni dizi döndürür, sütun yoksa diziyi olduğu gibi bırakır.", en: "The sort function the table uses: `sortRows(rows, column, direction, lang)`. Returns a new array, or the same array when there is no column." },
      props: [
        { name: "rows", type: "T[]", required: true, description: { tr: "Sıralanacak satırlar", en: "Rows to sort" } },
        { name: "column", type: "Column<T> | undefined", required: true, description: { tr: "`sortValue` ve `key` buradan okunur", en: "`sortValue` and `key` are read from it" } },
        { name: "direction", type: '"asc" | "desc"', required: true, description: { tr: "Sıralama yönü", en: "Sort direction" } },
        { name: "lang", type: "string", required: true, description: { tr: "`Intl.Collator` dili", en: "`Intl.Collator` language" } },
      ],
    },
  ],
  styling: [
    { name: "data-tone", kind: "data", description: { tr: "`.bt-band` üzerinde `plain` ya da `accent`", en: "`plain` or `accent` on `.bt-band`" } },
    { name: "data-density", kind: "data", description: { tr: "`.bt-table-card` üzerinde `comfortable` ya da `compact`", en: "`comfortable` or `compact` on `.bt-table-card`" } },
    { name: "data-row", kind: "data", description: { tr: "Veri satırlarında bulunur, ayrıntı satırında bulunmaz", en: "On data rows, not on detail rows" } },
    { name: "data-clickable", kind: "data", description: { tr: "`onRowClick` verilmiş satırlarda bulunur", en: "On rows when `onRowClick` is set" } },
    { name: "data-selected", kind: "data", description: { tr: "`selectedKey` ile eşleşen satırda bulunur", en: "On the row matching `selectedKey`" } },
    { name: "data-select", kind: "data", description: { tr: "Kutu sütununun hücrelerinde bulunur", en: "On checkbox column cells" } },
    { name: "data-align", kind: "data", description: { tr: "Başlık ve hücrelerde sütun hizası", en: "Column alignment on header and body cells" } },
    { name: "--bt-selected", kind: "var", description: { tr: "Seçili satır zemini", en: "Selected row background" } },
    { name: "--bt-hover", kind: "var", description: { tr: "Üzerine gelinen satır zemini", en: "Hovered row background" } },
    { name: "--bt-head", kind: "var", description: { tr: "Başlık ve dip satır zemini", en: "Header and footer row background" } },
    { name: "--bt-head-border", kind: "var", description: { tr: "Başlık alt çizgisi", en: "Rule under the header" } },
    { name: "--bt-line", kind: "var", description: { tr: "Satır ayırıcı çizgi", en: "Row separator" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Vurgulu bant zemini ve sıralama işareti", en: "Accent band background and sort mark" } },
  ],
  related: ["data-grid", "pagination", "chip", "filter-bar", "empty-state", "drawer", "confirm"],
});
