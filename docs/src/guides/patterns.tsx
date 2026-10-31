import { useMemo, useState } from "react";
import { IconDownload, IconPlus, IconTrash } from "@tabler/icons-react";
import { Alert, Badge, Button, Card, DataTable, Drawer, Field, FilterBar, InfoRow, Input, Kpi, KpiGrid, Modal, NumberInput, PageHeader, SearchInput, Select, useConfirm, useToast, type Column } from "btui";
import { CITIES, ORDERS, STATUS_LABEL, STATUS_TONE, money, type Order } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { Code, H2, P, Stage } from "../lib/ui";

function ListScreen() {
  const t = useText();
  const lang = useLang();
  const confirm = useConfirm();
  const toast = useToast();
  const [rows, setRows] = useState(ORDERS);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [keys, setKeys] = useState<Array<string | number>>([]);
  const [open, setOpen] = useState<Order | null>(null);
  const [creating, setCreating] = useState(false);
  const shown = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    return rows.filter((o) => (!city || o.city === city) && (!q || `${o.no} ${o.customer}`.toLocaleLowerCase(lang).includes(q)));
  }, [rows, query, city, lang]);
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), cell: (r) => <span className="bt-mono">{r.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "city", header: t({ tr: "İl", en: "City" }) },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", cell: (r) => money(r.amount, lang) },
    { key: "status", header: t({ tr: "Durum", en: "Status" }), cell: (r) => <Badge tone={STATUS_TONE[r.status]}>{t(STATUS_LABEL[r.status])}</Badge> },
  ];
  const removeSelected = async () => {
    const count = keys.length;
    const ok = await confirm({ danger: true, message: t({ tr: `${count} sipariş silinecek.`, en: `${count} orders will be deleted.` }), confirmLabel: t({ tr: "Sil", en: "Delete" }) });
    if (!ok) return;
    setRows((list) => list.filter((o) => !keys.includes(o.id)));
    setKeys([]);
    toast({ title: t({ tr: "Silindi", en: "Deleted" }), tone: "ok" });
  };
  return (
    <div className="d-stack-wide">
      <PageHeader
        title={t({ tr: "Siparişler", en: "Orders" })}
        breadcrumb={[{ label: t({ tr: "Satış", en: "Sales" }) }, { label: t({ tr: "Siparişler", en: "Orders" }) }]}
        actions={<><Button icon={<IconDownload size={15} />}>{t({ tr: "Dışa aktar", en: "Export" })}</Button><Button variant="primary" icon={<IconPlus size={15} />} onClick={() => setCreating(true)}>{t({ tr: "Yeni sipariş", en: "New order" })}</Button></>}
      />
      <FilterBar onClear={() => { setQuery(""); setCity(""); }}>
        <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t({ tr: "No ya da müşteri", en: "Number or customer" })} />
        <Select variant="filter" label={t({ tr: "İl", en: "City" })} value={city} onChange={setCity} options={CITIES} placeholder={t({ tr: "Tümü", en: "All" })} clearable />
      </FilterBar>
      <DataTable
        title={t({ tr: "Sipariş listesi", en: "Order list" })}
        titleNote={String(shown.length)}
        columns={columns}
        rows={shown}
        getRowKey={(r) => r.id}
        pageSize={6}
        onRowClick={setOpen}
        selectedKey={open?.id}
        selectedKeys={keys}
        onSelectionChange={setKeys}
        bulkActions={<Button size="sm" variant="danger" icon={<IconTrash size={14} />} onClick={removeSelected}>{t({ tr: "Sil", en: "Delete" })}</Button>}
      />
      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.no} subtitle={open?.customer}>
        {open ? (
          <>
            <InfoRow label={t({ tr: "Tutar", en: "Amount" })}>{money(open.amount, lang)}</InfoRow>
            <InfoRow label={t({ tr: "İl", en: "City" })}>{open.city}</InfoRow>
            <InfoRow label={t({ tr: "Sorumlu", en: "Owner" })}>{open.owner}</InfoRow>
            <InfoRow label={t({ tr: "Durum", en: "Status" })}><Badge tone={STATUS_TONE[open.status]}>{t(STATUS_LABEL[open.status])}</Badge></InfoRow>
          </>
        ) : null}
      </Drawer>
      <Modal open={creating} onClose={() => setCreating(false)} title={t({ tr: "Yeni sipariş", en: "New order" })} size="sm" footer={<><Button onClick={() => setCreating(false)}>{t({ tr: "Vazgeç", en: "Cancel" })}</Button><Button variant="primary" onClick={() => { setCreating(false); toast({ title: t({ tr: "Sipariş oluşturuldu", en: "Order created" }), tone: "ok" }); }}>{t({ tr: "Kaydet", en: "Save" })}</Button></>}>
        <div className="d-stack-wide">
          <Field label={t({ tr: "Müşteri", en: "Customer" })}><Input /></Field>
          <Field label={t({ tr: "Tutar", en: "Amount" })}><NumberInput aria-label={t({ tr: "Tutar", en: "Amount" })} defaultValue={0} min={0} hideSteppers /></Field>
        </div>
      </Modal>
    </div>
  );
}

function DetailScreen() {
  const t = useText();
  return (
    <div className="d-stack-wide">
      <Alert tone="warn" title={t({ tr: "Fatura kesilmedi", en: "Invoice not issued" })} actions={<Button size="sm">{t({ tr: "Fatura kes", en: "Issue invoice" })}</Button>}>{t({ tr: "Bu sipariş üç gündür onaylı ama faturası yok.", en: "This order has been approved for three days without an invoice." })}</Alert>
      <KpiGrid>
        <Kpi label={t({ tr: "Toplam", en: "Total" })} value="18.450 ₺" />
        <Kpi label={t({ tr: "Ödenen", en: "Paid" })} value="9.000 ₺" tone="ok" />
        <Kpi label={t({ tr: "Kalan", en: "Remaining" })} value="9.450 ₺" tone="warn" />
      </KpiGrid>
      <Card title={t({ tr: "Sipariş bilgisi", en: "Order details" })}>
        <InfoRow label={t({ tr: "Müşteri", en: "Customer" })}>Mavi Yapı</InfoRow>
        <InfoRow label={t({ tr: "Sorumlu", en: "Owner" })}>Ada Yılmaz</InfoRow>
      </Card>
    </div>
  );
}

export default function Patterns() {
  const t = useText();
  return (
    <>
      <p className="d-lead">{t({ tr: "Tek tek bileşenler değil, gerçek ekranlar. Aşağıdaki örnekler çalışır durumda ve iş uygulamalarının büyük bölümünü karşılar.", en: "Real screens rather than single components. The samples below are live and cover most of what a business app needs." })}</p>
      <H2 id="list">{t({ tr: "Liste ekranı", en: "List screen" })}</H2>
      <P>{{ tr: "Başlık, filtre, tablo. Satıra basınca ayrıntı sağdan açılır, kayıtları seçince toplu silme belirir, yeni kayıt pencerede açılır. Hepsini deneyin.", en: "Header, filters, table. Clicking a row opens details on the right, checking rows reveals bulk delete and new records open in a window. Try them all." }}</P>
      <Stage block><ListScreen /></Stage>
      <Code>{`<PageHeader title="Orders" actions={<Button variant="primary">New order</Button>} />
<FilterBar onClear={clear}>…</FilterBar>
<DataTable
  columns={columns}
  rows={rows}
  getRowKey={(r) => r.id}
  onRowClick={setOpen}
  selectedKeys={keys}
  onSelectionChange={setKeys}
  bulkActions={<Button variant="danger">Delete</Button>}
/>
<Drawer open={!!open} onClose={close} title={open?.no}>…</Drawer>`}</Code>
      <H2 id="detail">{t({ tr: "Ayrıntı ekranı", en: "Detail screen" })}</H2>
      <P>{{ tr: "Önce yapılması gereken iş üstte durur, sayılar onu izler, bilgiler en altta kalır.", en: "The task that needs doing comes first, numbers follow and details stay at the bottom." }}</P>
      <Stage block><DetailScreen /></Stage>
    </>
  );
}
