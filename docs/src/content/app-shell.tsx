import { useState, type ReactNode } from "react";
import { IconBuildingWarehouse, IconChecklist, IconFileInvoice, IconLayoutDashboard, IconPackage, IconPlus, IconSettings, IconUsers } from "@tabler/icons-react";
import { AppShell, Avatar, Badge, Button, DataTable, Kpi, KpiGrid, Page, PageHeader, Sidebar, Switch, Topbar, TopbarSearch, TopbarSpacer, type Column, type NavGroup, type NavItem, type SidebarProps } from "btui";
import { money, ORDERS, STATUS_LABEL, STATUS_TONE, type Order } from "../lib/data";
import { useLang, useText, type Text } from "../lib/i18n";
import { definePage } from "../lib/schema";

const MINI = ".d-mini.bt-app { height: 100%; }";

const LABELS = {
  overview: { tr: "Özet", en: "Overview" },
  orders: { tr: "Siparişler", en: "Orders" },
  invoices: { tr: "Faturalar", en: "Invoices" },
  customers: { tr: "Müşteriler", en: "Customers" },
  approvals: { tr: "Onaylar", en: "Approvals" },
  settings: { tr: "Ayarlar", en: "Settings" },
};

type Section = keyof typeof LABELS;

const ICONS: Record<Section, typeof IconPackage> = {
  overview: IconLayoutDashboard,
  orders: IconPackage,
  invoices: IconFileInvoice,
  customers: IconUsers,
  approvals: IconChecklist,
  settings: IconSettings,
};

const renderLink: SidebarProps["renderLink"] = (props) => <a {...props} className="bt-nav-item d-card" />;

function Frame({ height = 420, children }: { height?: number; children: ReactNode }) {
  return (
    <div style={{ height, overflow: "hidden", border: "1px solid var(--bt-border)" }}>
      <style>{MINI}</style>
      {children}
    </div>
  );
}

function useNav() {
  const t = useText();
  const [current, setCurrent] = useState<Section>("orders");
  const item = (id: Section, count?: number): NavItem => {
    const Icon = ICONS[id];
    return {
      label: t(LABELS[id]),
      icon: <Icon size={16} />,
      href: "#",
      active: current === id,
      count,
      onClick: (e) => {
        e.preventDefault();
        setCurrent(id);
      },
    };
  };
  const groups: NavGroup[] = [
    { items: [item("overview")] },
    { label: t({ tr: "Satış", en: "Sales" }), items: [item("orders", 12), item("invoices", 3), item("customers")] },
    { label: t({ tr: "Yönetim", en: "Administration" }), items: [item("approvals", 4), item("settings")] },
  ];
  return { groups, title: t(LABELS[current]) };
}

function Nav({ groups }: { groups: NavGroup[] }) {
  return <Sidebar logo={<IconBuildingWarehouse size={22} />} logoText="Atlas ERP" groups={groups} renderLink={renderLink} />;
}

function Bar() {
  const t = useText();
  return (
    <Topbar>
      <TopbarSearch placeholder={t({ tr: "Sipariş, müşteri ara…", en: "Search orders, customers…" })} />
      <TopbarSpacer />
      <Avatar name="Ada Yılmaz" />
    </Topbar>
  );
}

function Title({ children }: { children: Text }) {
  const t = useText();
  return <Page><PageHeader title={t(children)} /></Page>;
}

function Hero() {
  const t = useText();
  const lang = useLang();
  const nav = useNav();
  const waiting = ORDERS.filter((o) => o.status === "pending");
  const open = ORDERS.filter((o) => o.status === "open");
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), sortable: false },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }), sortable: false },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", sortable: false, cell: (r) => money(r.amount, lang) },
    { key: "status", header: t({ tr: "Durum", en: "Status" }), sortable: false, cell: (r) => <Badge tone={STATUS_TONE[r.status]}>{t(STATUS_LABEL[r.status])}</Badge> },
  ];
  return (
    <Frame>
      <AppShell className="d-mini" sidebar={<Nav groups={nav.groups} />} topbar={<Bar />}>
        <Page>
          <PageHeader title={nav.title} actions={<Button variant="primary" icon={<IconPlus size={15} />}>{t({ tr: "Yeni sipariş", en: "New order" })}</Button>} />
          <KpiGrid>
            <Kpi label={t({ tr: "Açık sipariş", en: "Open orders" })} value={open.length} />
            <Kpi label={t({ tr: "Onay bekleyen", en: "Awaiting approval" })} value={waiting.length} tone="warn" />
          </KpiGrid>
          <DataTable columns={columns} rows={ORDERS.slice(0, 5)} getRowKey={(r) => r.id} controls={false} />
        </Page>
      </AppShell>
    </Frame>
  );
}

function Collapse() {
  const nav = useNav();
  return (
    <Frame height={320}>
      <AppShell className="d-mini" defaultCollapsed sidebar={<Nav groups={nav.groups} />} topbar={<Bar />}>
        <Title>{nav.title}</Title>
      </AppShell>
    </Frame>
  );
}

function Controlled() {
  const t = useText();
  const nav = useNav();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="d-stack-wide">
      <Switch checked={collapsed} onChange={setCollapsed} label={t({ tr: "Onay ekranında menüyü daralt", en: "Collapse the menu on the approval screen" })} />
      <Frame height={320}>
        <AppShell className="d-mini" collapsed={collapsed} onCollapsedChange={setCollapsed} sidebar={<Nav groups={nav.groups} />} topbar={<Bar />}>
          <Title>{nav.title}</Title>
        </AppShell>
      </Frame>
    </div>
  );
}

function Remembered() {
  const nav = useNav();
  return (
    <Frame height={320}>
      <AppShell className="d-mini" storageKey="btui-docs-demo-shell" sidebar={<Nav groups={nav.groups} />} topbar={<Bar />}>
        <Title>{nav.title}</Title>
      </AppShell>
    </Frame>
  );
}

function NoTopbar() {
  const t = useText();
  const nav = useNav();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Frame height={320}>
      <AppShell className="d-mini" collapsed={collapsed} sidebar={<Nav groups={nav.groups} />}>
        <Page>
          <PageHeader
            title={nav.title}
            actions={<Button onClick={() => setCollapsed(!collapsed)}>{collapsed ? t({ tr: "Menüyü genişlet", en: "Expand the menu" }) : t({ tr: "Menüyü daralt", en: "Collapse the menu" })}</Button>}
          />
        </Page>
      </AppShell>
    </Frame>
  );
}

export default definePage({
  summary: { tr: "Uygulamanın iskeletidir: solda kenar menüsü, üstte çubuk, ortada kayan içerik. Menünün daralmasını ve dar ekranda çekmeceye dönüşmesini kendisi yönetir.", en: "The frame of an application: a sidebar on the left, a bar on top and scrolling content in the middle. It manages the collapsed menu and turns it into a drawer on narrow screens." },
  imports: 'import { AppShell, Page, Sidebar, Topbar } from "btui";',
  hero: {
    Demo: Hero,
    block: true,
    code: `<AppShell
  sidebar={<Sidebar logo={<IconBuildingWarehouse size={22} />} logoText="Atlas ERP" groups={groups} />}
  topbar={
    <Topbar>
      <TopbarSearch placeholder="Search orders, customers…" />
      <TopbarSpacer />
      <Avatar name="Ada Yılmaz" />
    </Topbar>
  }
>
  <Page>
    <PageHeader title="Orders" actions={<Button variant="primary">New order</Button>} />
    <KpiGrid>
      <Kpi label="Open orders" value={open.length} />
      <Kpi label="Awaiting approval" value={waiting.length} tone="warn" />
    </KpiGrid>
    <DataTable columns={columns} rows={orders} getRowKey={(r) => r.id} controls={false} />
  </Page>
</AppShell>`,
  },
  use: {
    do: [
      { tr: "Oturum açılmış iş ekranları; siparişler, faturalar ve onaylar arasında sürekli gezilen modüller", en: "Signed-in work screens; modules people move between all day, such as orders, invoices and approvals" },
      { tr: "Menü tercihi oturumlar arasında kalması gereken uygulamalar; `storageKey` verin", en: "Apps where the menu preference should outlive the session; set `storageKey`" },
      { tr: "Kök düzende tek bir kabuk; menünün durumu sayfa değişse de bozulmaz", en: "One shell in the root layout, so the menu keeps its state across pages" },
    ],
    dont: [
      { tr: "Giriş ya da şifre sıfırlama gibi tek adımlık ekranlar; bunlarda menünün işlevi yoktur", en: "Single-step screens such as sign-in or password reset; a menu has no job there" },
      { tr: "Bir `Card` ya da `Modal` içine yerleştirmek; `.bt-app` yüksekliği `100dvh` olduğu için kabından taşar", en: "Nesting it inside a `Card` or `Modal`; `.bt-app` is `100dvh` tall and overflows its container" },
      { tr: "Sayfanın kendisini kaydırmak; kayma `.bt-content` içinde olur, menü ve çubuk yerinde kalır", en: "Scrolling the document itself; scrolling happens inside `.bt-content`, so the menu and bar stay put" },
    ],
  },
  anatomy: `<AppShell sidebar={<Sidebar groups={groups} />} topbar={<Topbar>…</Topbar>}>
  <Page>
    <PageHeader title="Orders" />
    …
  </Page>
</AppShell>`,
  examples: [
    {
      id: "collapse",
      title: { tr: "Daraltma", en: "Collapsing" },
      body: { tr: "Kabuk durumu kendisi tutar. `defaultCollapsed` başlangıcı belirler, `Topbar` içindeki menü düğmesi de durumu değiştirir. Düğmeye basıp deneyin. Daralmış menüde yalnız ikonlar kalır, bu yüzden her öğeye ikon verin.", en: "The shell keeps the state itself. `defaultCollapsed` sets the start and the menu button inside `Topbar` flips it. Press the button to try. A collapsed menu shows icons only, so give every item one." },
      example: { Demo: Collapse, block: true, code: `<AppShell defaultCollapsed sidebar={<Sidebar groups={groups} />} topbar={<Topbar />}>
  <Page>
    <PageHeader title="Orders" />
  </Page>
</AppShell>` },
    },
    {
      id: "controlled",
      title: { tr: "Dışarıdan denetim", en: "Controlled" },
      body: { tr: "Geniş tablo ya da onay ekranı gibi yer isteyen sayfalarda menüyü siz yönetmek isterseniz `collapsed` verin. Menü düğmesine basıldığında `onCollapsedChange` çalışır, değeri siz yazmazsanız görünüm değişmez.", en: "When a wide table or an approval screen needs the room, drive the menu with `collapsed`. The menu button calls `onCollapsedChange`, and nothing changes unless you store the value." },
      example: { Demo: Controlled, block: true, code: `const [collapsed, setCollapsed] = useState(false);

<Switch checked={collapsed} onChange={setCollapsed} label="Collapse the menu on the approval screen" />
<AppShell collapsed={collapsed} onCollapsedChange={setCollapsed} sidebar={sidebar} topbar={topbar}>
  <Page>
    <PageHeader title="Approvals" />
  </Page>
</AppShell>` },
    },
    {
      id: "storage",
      title: { tr: "Tercihi hatırlama", en: "Remembering the choice" },
      body: { tr: "`storageKey` verdiğinizde daraltma tercihi `localStorage` içine yazılır ve açılışta geri okunur. Okuma ilk çizimden sonra yapıldığından sunucu ve tarayıcı aynı ilk kareyi üretir. Menüyü daraltıp sayfayı yenileyin; tercih duracaktır.", en: "With `storageKey` the choice is written to `localStorage` and read back on load. The read happens after mount, so server and client draw the same first frame. Collapse the menu and reload; the choice stays." },
      example: { Demo: Remembered, block: true, code: `<AppShell storageKey="erp-nav" sidebar={sidebar} topbar={topbar}>
  <Page>
    <PageHeader title="Orders" />
  </Page>
</AppShell>` },
    },
    {
      id: "no-topbar",
      title: { tr: "Üst çubuksuz", en: "Without a top bar" },
      body: { tr: "`topbar` isteğe bağlıdır, ama menü düğmesi `Topbar` ile gelir. Çubuk yoksa daraltmayı `collapsed` ile kendiniz sağlamalısınız. Dar ekranda çekmeceyi açacak bir düğme de kalmaz, bu yüzden telefonda kullanılacak uygulamalarda `Topbar` bırakın.", en: "`topbar` is optional, but the menu button comes with `Topbar`. Without it, collapsing is yours to wire with `collapsed`. Nothing can open the drawer on narrow screens either, so keep a `Topbar` in apps used on phones." },
      example: { Demo: NoTopbar, block: true, code: `const [collapsed, setCollapsed] = useState(false);

<AppShell collapsed={collapsed} sidebar={sidebar}>
  <Page>
    <PageHeader
      title="Orders"
      actions={<Button onClick={() => setCollapsed(!collapsed)}>Collapse the menu</Button>}
    />
  </Page>
</AppShell>` },
    },
    {
      id: "narrow",
      title: { tr: "Dar ekran", en: "Narrow screens" },
      body: { tr: "800 piksel ve altında menü sayfadan çıkar, çekmece olarak açılır. Menü düğmesi bu genişlikte `collapsed` değerine dokunmaz, yalnız çekmeceyi açıp kapatır. Bir menü öğesine ya da arkadaki perdeye basmak çekmeceyi kapatır.", en: "At 800 pixels and below the menu leaves the page and opens as a drawer. At this width the menu button leaves `collapsed` alone and only opens or closes the drawer. Pressing a menu item or the scrim behind it closes the drawer." },
    },
  ],
  a11y: [
    { tr: "`aside`, `header` ve `main` öğeleriyle sayfa işaret noktaları hazır gelir; ekran okuyucu kullananlar bölgeler arasında atlayabilir.", en: "`aside`, `header` and `main` provide the page landmarks, so screen reader users can jump between regions." },
    { tr: "Menü düğmesinin adı yerelleştirme dosyasındaki `menu` metninden gelir; perde düğmesi de `close` metniyle adlandırılır.", en: "The menu button takes its name from the locale's `menu` string, and the scrim button uses `close`." },
    { tr: "Dar ekrandaki çekmece odağı içine almaz ve `Escape` ile kapanmaz; kapatmak için bir menü öğesi ya da perde kullanılır.", en: "The drawer on narrow screens does not trap focus and does not close on `Escape`; a menu item or the scrim closes it." },
    { tr: "`storageKey` depolama engelliyse sessizce devre dışı kalır; tercih yalnız o sayfa için geçerli olur.", en: "If storage is blocked, `storageKey` falls back silently and the choice lasts for that page only." },
  ],
  keyboard: [
    ["Tab", { tr: "Menü bağlantılarından çubuğa, oradan içeriğe ilerler", en: "Moves from the menu links to the bar, then into the content" }],
    ["Shift + Tab", { tr: "Odağı geri alır", en: "Moves focus back" }],
    ["Enter", { tr: "Odaktaki bağlantıya gider ya da menü düğmesini çalıştırır", en: "Follows the focused link or presses the menu button" }],
    ["Space", { tr: "Odaktaki menü düğmesini çalıştırır", en: "Presses the focused menu button" }],
  ],
  api: [
    {
      name: "AppShell",
      props: [
        { name: "sidebar", type: "ReactNode", required: true, description: { tr: "Sol sütun, genelde `Sidebar`", en: "Left column, usually a `Sidebar`" } },
        { name: "topbar", type: "ReactNode", description: { tr: "İçeriğin üstündeki çubuk, genelde `Topbar`", en: "Bar above the content, usually a `Topbar`" } },
        { name: "collapsed", type: "boolean", description: { tr: "Daralmış durumu dışarıdan belirler", en: "Sets the collapsed state from outside" } },
        { name: "defaultCollapsed", type: "boolean", default: "false", description: { tr: "Denetimsiz kullanımda başlangıç durumu", en: "Initial state when uncontrolled" } },
        { name: "onCollapsedChange", type: "(collapsed: boolean) => void", description: { tr: "Geniş ekranda menü düğmesine basılınca çalışır", en: "Called when the menu button is pressed on wide screens" } },
        { name: "storageKey", type: "string", description: { tr: "Daraltma tercihini tutan `localStorage` anahtarı", en: "`localStorage` key that remembers the collapsed menu" } },
        { name: "className", type: "string", description: { tr: "Kök öğeye eklenir", en: "Added to the root element" } },
        { name: "children", type: "ReactNode", required: true, description: { tr: "Kayan içerik alanı, genelde `Page`", en: "The scrolling content area, usually a `Page`" } },
      ],
    },
  ],
  styling: [
    { name: "data-collapsed", kind: "data", description: { tr: "Menü daralmışken kökte bulunur", en: "On the root while the menu is collapsed" } },
    { name: "data-nav-open", kind: "data", description: { tr: "Dar ekranda çekmece açıkken kökte bulunur", en: "On the root while the drawer is open on narrow screens" } },
    { name: "--bt-bg", kind: "var", description: { tr: "Kabuğun zemini", en: "Shell background" } },
    { name: "--bt-nav", kind: "var", description: { tr: "Kenar menüsünün zemini", en: "Sidebar background" } },
    { name: "--bt-scrim", kind: "var", description: { tr: "Çekmecenin arkasındaki perde", en: "Scrim behind the drawer" } },
  ],
  related: ["sidebar", "topbar", "page-header", "theming", "patterns"],
});
