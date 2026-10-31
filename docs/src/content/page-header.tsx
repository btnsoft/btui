import { useState, type ReactNode } from "react";
import { IconChevronDown, IconDownload, IconPlus, IconPrinter, IconX } from "@tabler/icons-react";
import { Badge, Button, Card, InfoRow, Menu, MenuItem, Page, PageHeader } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Stay({ children }: { children: ReactNode }) {
  return (
    <div onClick={(e) => { if ((e.target as HTMLElement).closest("a")) e.preventDefault(); }}>
      {children}
    </div>
  );
}

function Actions({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", gap: 8 }}>{children}</div>;
}

function Hero() {
  const t = useText();
  return (
    <Stay>
      <PageHeader
        title={t({ tr: "Siparişler", en: "Orders" })}
        breadcrumb={[
          { label: t({ tr: "Ana sayfa", en: "Home" }), href: "/" },
          { label: t({ tr: "Satış", en: "Sales" }), href: "/sales" },
          { label: t({ tr: "Siparişler", en: "Orders" }) },
        ]}
        actions={
          <Actions>
            <Button icon={<IconDownload size={15} />}>{t({ tr: "Dışa aktar", en: "Export" })}</Button>
            <Button variant="primary" icon={<IconPlus size={15} />}>{t({ tr: "Yeni sipariş", en: "New order" })}</Button>
          </Actions>
        }
      />
    </Stay>
  );
}

function TitleOnly() {
  const t = useText();
  return <PageHeader title={t({ tr: "Fatura ayarları", en: "Invoice settings" })} />;
}

function WithStatus() {
  const t = useText();
  const [approved, setApproved] = useState(false);
  return (
    <Stay>
      <PageHeader
        title={
          <>
            SP-1061{" "}
            {approved
              ? <Badge tone="ok">{t({ tr: "Onaylandı", en: "Approved" })}</Badge>
              : <Badge tone="warn">{t({ tr: "Onay bekliyor", en: "Awaiting approval" })}</Badge>}
          </>
        }
        breadcrumb={[
          { label: t({ tr: "Onaylar", en: "Approvals" }), href: "/approvals" },
          { label: "SP-1061" },
        ]}
        actions={
          <Actions>
            <Button icon={<IconX size={15} />} disabled={approved}>{t({ tr: "Reddet", en: "Reject" })}</Button>
            <Button variant="success" disabled={approved} onClick={() => setApproved(true)}>{t({ tr: "Onayla", en: "Approve" })}</Button>
          </Actions>
        }
      />
    </Stay>
  );
}

function Overflow() {
  const t = useText();
  return (
    <PageHeader
      title="FT-2026-0418"
      actions={
        <Actions>
          <Button variant="primary">{t({ tr: "Müşteriye gönder", en: "Send to customer" })}</Button>
          <Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>{t({ tr: "İşlemler", en: "Actions" })}</Button>}>
            <MenuItem icon={<IconPrinter size={15} />}>{t({ tr: "Yazdır", en: "Print" })}</MenuItem>
            <MenuItem icon={<IconDownload size={15} />}>{t({ tr: "PDF indir", en: "Download PDF" })}</MenuItem>
          </Menu>
        </Actions>
      }
    />
  );
}

function InPage() {
  const t = useText();
  return (
    <Stay>
      <Page style={{ padding: 0 }}>
        <PageHeader
          title="Mavi Yapı"
          breadcrumb={[
            { label: t({ tr: "Müşteriler", en: "Customers" }), href: "/customers" },
            { label: "Mavi Yapı" },
          ]}
          actions={<Button>{t({ tr: "Düzenle", en: "Edit" })}</Button>}
        />
        <Card title={t({ tr: "Cari bilgileri", en: "Account details" })}>
          <InfoRow label={t({ tr: "Şehir", en: "City" })}>İzmir</InfoRow>
          <InfoRow label={t({ tr: "Vade", en: "Payment term" })}>{t({ tr: "30 gün", en: "30 days" })}</InfoRow>
          <InfoRow label={t({ tr: "Sorumlu", en: "Account owner" })}>Elif Kaya</InfoRow>
        </Card>
      </Page>
    </Stay>
  );
}

export default definePage({
  summary: { tr: "Sayfanın başlığını, konum yolunu ve o sayfaya ait ana eylemleri tek satırda toplar. Kullanıcı nerede olduğunu ve burada ne yapabileceğini ilk bakışta görür.", en: "Brings the page title, breadcrumb and the page's main actions into one row. People see where they are and what they can do here at a glance." },
  imports: 'import { Page, PageHeader } from "btui";',
  hero: {
    Demo: Hero,
    block: true,
    code: `<PageHeader
  title="Orders"
  breadcrumb={[
    { label: "Home", href: "/" },
    { label: "Sales", href: "/sales" },
    { label: "Orders" },
  ]}
  actions={
    <div style={{ display: "flex", gap: 8 }}>
      <Button icon={<IconDownload size={15} />}>Export</Button>
      <Button variant="primary" icon={<IconPlus size={15} />}>New order</Button>
    </div>
  }
/>`,
  },
  use: {
    do: [
      { tr: "Her sayfanın başında tek kez; başlık `h1` olarak çizilir", en: "Once at the top of every page; the title renders as an `h1`" },
      { tr: "Sayfanın ana eylemi; sipariş açmak, faturayı onaylamak, listeyi dışa aktarmak", en: "The page's main action; creating an order, approving an invoice, exporting a list" },
      { tr: "Kayıt ekranında belge numarası ve durumu birlikte göstermek", en: "Showing a record's document number and status together" },
    ],
    dont: [
      { tr: "`Card` ya da bölüm başlıkları; bunların kendi başlık alanı vardır", en: "`Card` or section headings; those have their own title area" },
      { tr: "Üçten çok düğme; ikincil eylemleri `Menu` altında toplayın", en: "More than three buttons; gather secondary actions under a `Menu`" },
      { tr: "Filtreler ve arama; onların yeri başlığın altındaki `FilterBar`", en: "Filters and search; they belong in a `FilterBar` below the title" },
    ],
  },
  anatomy: `<Page>
  <PageHeader
    breadcrumb={[{ label: "Parent", href: "/parent" }, { label: "Current" }]}
    title="Current"
    actions={<Button variant="primary">Main action</Button>}
  />
  …
</Page>`,
  examples: [
    {
      id: "title-only",
      title: { tr: "Yalnız başlık", en: "Title only" },
      body: { tr: "`title` tek zorunlu özelliktir. Kenar menüsünden doğrudan açılan bir ayar sayfasında konum yolu ve eylem gerekmez.", en: "`title` is the only required prop. A settings page opened straight from the sidebar needs no breadcrumb or action." },
      example: { Demo: TitleOnly, block: true, code: `<PageHeader title="Invoice settings" />` },
    },
    {
      id: "status",
      title: { tr: "Durumlu kayıt başlığı", en: "Record title with status" },
      body: { tr: "`title` `ReactNode` aldığından belge numarasının yanına `Badge` koyabilirsiniz. Onay ekranlarında durum ve eylem aynı satırda olunca karar kolaylaşır. Onayla düğmesine basıp durumun değişmesini izleyin.", en: "`title` takes a `ReactNode`, so a `Badge` can sit beside the document number. On approval screens, having the status and the action in one row makes the decision easier. Press Approve and watch the status change." },
      example: { Demo: WithStatus, block: true, code: `const [approved, setApproved] = useState(false);

<PageHeader
  title={<>SP-1061 <Badge tone={approved ? "ok" : "warn"}>{approved ? "Approved" : "Awaiting approval"}</Badge></>}
  breadcrumb={[{ label: "Approvals", href: "/approvals" }, { label: "SP-1061" }]}
  actions={
    <div style={{ display: "flex", gap: 8 }}>
      <Button icon={<IconX size={15} />} disabled={approved}>Reject</Button>
      <Button variant="success" disabled={approved} onClick={() => setApproved(true)}>Approve</Button>
    </div>
  }
/>` },
    },
    {
      id: "overflow",
      title: { tr: "İkincil eylemler", en: "Secondary actions" },
      body: { tr: "Ana eylem görünür kalsın, seyrek kullanılanlar `Menu` altına geçsin. `actions` başlıkla aynı esnek satıra doğrudan girer; birden çok düğmeyi tek bir kapsayıcıda toplayın ki dar ekranda birlikte alt satıra insinler.", en: "Keep the main action visible and move rarely used ones under a `Menu`. `actions` goes straight into the same flex row as the title, so wrap several buttons in one container and they drop to the next line together on narrow screens." },
      example: { Demo: Overflow, block: true, code: `<PageHeader
  title="FT-2026-0418"
  actions={
    <div style={{ display: "flex", gap: 8 }}>
      <Button variant="primary">Send to customer</Button>
      <Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>Actions</Button>}>
        <MenuItem icon={<IconPrinter size={15} />}>Print</MenuItem>
        <MenuItem icon={<IconDownload size={15} />}>Download PDF</MenuItem>
      </Menu>
    </div>
  }
/>` },
    },
    {
      id: "in-page",
      title: { tr: "Sayfa içinde", en: "Inside a page" },
      body: { tr: "`Page` içeriğin kenar boşluğunu ve bloklar arasındaki düzenli aralığı verir. `AppShell` içinde her ekranı `Page` ile başlatın, ilk çocuk olarak da `PageHeader` koyun. Bu örnekte `Page` boşluğu yalnız önizleme için sıfırlandı.", en: "`Page` provides the content margin and the even spacing between blocks. Inside `AppShell`, start each screen with `Page` and make `PageHeader` its first child. The margin of `Page` is removed here for the preview only." },
      example: { Demo: InPage, block: true, code: `<Page>
  <PageHeader
    title="Mavi Yapı"
    breadcrumb={[{ label: "Customers", href: "/customers" }, { label: "Mavi Yapı" }]}
    actions={<Button>Edit</Button>}
  />
  <Card title="Account details">
    <InfoRow label="City">İzmir</InfoRow>
    <InfoRow label="Payment term">30 days</InfoRow>
    <InfoRow label="Account owner">Elif Kaya</InfoRow>
  </Card>
</Page>` },
    },
  ],
  a11y: [
    { tr: "`title` `h1` içinde çizilir; bir sayfada tek `PageHeader` kullanın ki başlık sırası bozulmasın.", en: "`title` renders inside an `h1`, so use one `PageHeader` per page to keep the heading order intact." },
    { tr: "`breadcrumb` verildiğinde başlığın önünde `Breadcrumb` çizilir; ekran okuyucu önce konumu, sonra başlığı okur.", en: "`breadcrumb` draws a `Breadcrumb` before the title, so screen readers read the location first and the title next." },
    { tr: "Başlıktaki `Badge` metin olarak okunur, bu yüzden durumu rengin yanında sözcükle de yazın.", en: "A `Badge` in the title is read as text, so state the status in words as well as colour." },
  ],
  keyboard: [
    ["Tab", { tr: "Konum yolu bağlantılarından eylem düğmelerine ilerler", en: "Moves from the breadcrumb links to the action buttons" }],
    ["Enter", { tr: "Odaktaki bağlantıyı ya da düğmeyi çalıştırır", en: "Activates the focused link or button" }],
    ["Space", { tr: "Odaktaki düğmeyi çalıştırır", en: "Presses the focused button" }],
  ],
  api: [
    {
      name: "PageHeader",
      props: [
        { name: "title", type: "ReactNode", required: true, description: { tr: "`h1` içinde çizilen başlık", en: "Title drawn inside an `h1`" } },
        { name: "breadcrumb", type: "Crumb[]", description: { tr: "Başlığın üstündeki konum yolu", en: "Breadcrumb above the title" } },
        { name: "actions", type: "ReactNode", description: { tr: "Başlığın karşısındaki eylemler", en: "Actions opposite the title" } },
      ],
    },
    {
      name: "Page",
      description: { tr: "Tüm yerel `div` öznitelikleri iletilir.", en: "All native `div` attributes are forwarded." },
      props: [
        { name: "className", type: "string", description: { tr: "Kök öğeye eklenir", en: "Added to the root element" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-accent-strong", kind: "var", description: { tr: "Konum yolu bağlantıları", en: "Breadcrumb links" } },
    { name: "--bt-text-2", kind: "var", description: { tr: "Konum yolunun son öğesi", en: "Last breadcrumb item" } },
    { name: "--bt-text", kind: "var", description: { tr: "Başlık rengi, kökten gelir", en: "Title colour, inherited from the root" } },
  ],
  related: ["breadcrumb", "app-shell", "filter-bar", "button", "menu"],
});
