import { useState, type ReactNode } from "react";
import { IconBuildingWarehouse, IconChecklist, IconFileInvoice, IconLayoutDashboard, IconLogout, IconPackage, IconRefresh, IconSettings, IconUsers } from "@tabler/icons-react";
import { AppShell, Button, EmptyState, Page, PageHeader, Sidebar, Topbar, useToast, type NavGroup, type NavItem, type SidebarProps } from "btui";
import { useText } from "../lib/i18n";
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

function useNav(approvals = 4, start: Section = "orders") {
  const t = useText();
  const [current, setCurrent] = useState<Section>(start);
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
    { label: t({ tr: "Yönetim", en: "Administration" }), items: [item("approvals", approvals), item("settings")] },
  ];
  return { groups, title: t(LABELS[current]) };
}

function Hero() {
  const nav = useNav();
  return (
    <Frame>
      <AppShell className="d-mini" sidebar={<Sidebar logo={<IconBuildingWarehouse size={22} />} logoText="Atlas ERP" groups={nav.groups} renderLink={renderLink} />} topbar={<Topbar />}>
        <Page><PageHeader title={nav.title} /></Page>
      </AppShell>
    </Frame>
  );
}

function Tones() {
  const t = useText();
  const dark = useNav();
  const light = useNav();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
      <Frame>
        <AppShell className="d-mini" sidebar={<Sidebar tone="dark" logo={<IconBuildingWarehouse size={22} />} logoText={t({ tr: "Koyu", en: "Dark" })} groups={dark.groups} renderLink={renderLink} />} topbar={<Topbar />}>
          <span />
        </AppShell>
      </Frame>
      <Frame>
        <AppShell className="d-mini" sidebar={<Sidebar tone="light" logo={<IconBuildingWarehouse size={22} />} logoText={t({ tr: "Açık", en: "Light" })} groups={light.groups} renderLink={renderLink} />} topbar={<Topbar />}>
          <span />
        </AppShell>
      </Frame>
    </div>
  );
}

function Collapsed() {
  const nav = useNav();
  return (
    <Frame>
      <AppShell className="d-mini" defaultCollapsed sidebar={<Sidebar logo={<IconBuildingWarehouse size={22} />} logoText="Atlas ERP" groups={nav.groups} renderLink={renderLink} />} topbar={<Topbar />}>
        <Page><PageHeader title={nav.title} /></Page>
      </AppShell>
    </Frame>
  );
}

function Counts() {
  const t = useText();
  const [waiting, setWaiting] = useState(3);
  const nav = useNav(waiting, "approvals");
  return (
    <Frame>
      <AppShell className="d-mini" sidebar={<Sidebar logo={<IconBuildingWarehouse size={22} />} logoText="Atlas ERP" groups={nav.groups} renderLink={renderLink} />} topbar={<Topbar />}>
        <Page>
          <PageHeader
            title={nav.title}
            actions={<Button variant="success" disabled={waiting === 0} onClick={() => setWaiting(waiting - 1)}>{t({ tr: "Sıradakini onayla", en: "Approve the next one" })}</Button>}
          />
          <EmptyState>{waiting > 0 ? t({ tr: `Onay bekleyen fatura: ${waiting}`, en: `Invoices awaiting approval: ${waiting}` }) : t({ tr: "Bekleyen onay kalmadı.", en: "No approvals left." })}</EmptyState>
        </Page>
      </AppShell>
    </Frame>
  );
}

function Links() {
  const t = useText();
  const [path, setPath] = useState("/orders");
  const entry = (id: Section, href: string): NavItem => {
    const Icon = ICONS[id];
    return { label: t(LABELS[id]), icon: <Icon size={16} />, href, active: path.startsWith(href) };
  };
  const groups: NavGroup[] = [{ items: [entry("orders", "/orders"), entry("invoices", "/invoices"), entry("customers", "/customers")] }];
  return (
    <Frame height={300}>
      <AppShell
        className="d-mini"
        topbar={<Topbar />}
        sidebar={
          <Sidebar
            logo={<IconBuildingWarehouse size={22} />}
            logoText="Atlas ERP"
            groups={groups}
            renderLink={(props, item) => (
              <a
                {...props}
                className="bt-nav-item d-card"
                onClick={(e) => {
                  e.preventDefault();
                  props.onClick?.(e);
                  setPath(item.href ?? "/");
                }}
              />
            )}
          />
        }
      >
        <Page><PageHeader title={path} /></Page>
      </AppShell>
    </Frame>
  );
}

function ButtonItems() {
  const t = useText();
  const toast = useToast();
  const nav = useNav();
  const groups: NavGroup[] = [
    ...nav.groups.slice(0, 2),
    {
      label: t({ tr: "Oturum", en: "Session" }),
      items: [
        { label: t({ tr: "Verileri yenile", en: "Refresh data" }), icon: <IconRefresh size={16} />, onClick: () => toast({ title: t({ tr: "Veriler yenilendi", en: "Data refreshed" }), tone: "ok" }) },
        { label: t({ tr: "Oturumu kapat", en: "Sign out" }), icon: <IconLogout size={16} />, onClick: () => toast({ title: t({ tr: "Oturum kapatıldı", en: "Signed out" }) }) },
      ],
    },
  ];
  return (
    <Frame>
      <AppShell className="d-mini" sidebar={<Sidebar aria-label={t({ tr: "Ana menü", en: "Main menu" })} className="erp-nav" logo={<IconBuildingWarehouse size={22} />} logoText="Atlas ERP" groups={groups} />} topbar={<Topbar />}>
        <Page><PageHeader title={nav.title} /></Page>
      </AppShell>
    </Frame>
  );
}

export default definePage({
  summary: { tr: "Uygulamanın ana gezinme menüsüdür. Modülleri gruplar, açık sayfayı işaretler ve bekleyen işlerin sayısını gösterir.", en: "The main navigation of an application. It groups modules, marks the current page and shows how much work is waiting." },
  imports: 'import { Sidebar, type NavGroup, type NavItem } from "btui";',
  hero: {
    Demo: Hero,
    block: true,
    code: `const groups: NavGroup[] = [
  { items: [{ label: "Overview", href: "/", icon: <IconLayoutDashboard size={16} /> }] },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/orders", icon: <IconPackage size={16} />, active: true, count: 12 },
      { label: "Invoices", href: "/invoices", icon: <IconFileInvoice size={16} />, count: 3 },
      { label: "Customers", href: "/customers", icon: <IconUsers size={16} /> },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Approvals", href: "/approvals", icon: <IconChecklist size={16} />, count: 4 },
      { label: "Settings", href: "/settings", icon: <IconSettings size={16} /> },
    ],
  },
];

<AppShell sidebar={<Sidebar logo={<IconBuildingWarehouse size={22} />} logoText="Atlas ERP" groups={groups} />} topbar={<Topbar />}>
  <Page>
    <PageHeader title="Orders" />
  </Page>
</AppShell>`,
  },
  use: {
    do: [
      { tr: "Sipariş, fatura, müşteri gibi ana modüller arasında geçiş; gruplarla konuya göre ayırın", en: "Moving between main modules such as orders, invoices and customers; split them by topic with groups" },
      { tr: "Bekleyen iş sayıları; `count` ile onay ya da ödeme kuyruğunu görünür kılın", en: "Waiting work; use `count` to surface the approval or payment queue" },
      { tr: "İstemci tarafı yönlendirme; `renderLink` ile kendi bağlantınızı takın", en: "Client-side routing; plug in your own link with `renderLink`" },
    ],
    dont: [
      { tr: "Veri değiştiren eylemler; menü gezinme içindir, işlemler sayfada `Button` ile durur", en: "Actions that change data; the menu is for moving around, actions belong on the page as a `Button`" },
      { tr: "İkonsuz öğeler; menü daraldığında öğenin yerinde boşluk kalır", en: "Items without icons; a collapsed menu leaves an empty slot in their place" },
      { tr: "Sayfa açmayan kalabalık eylemler; `href` olmadan öğe düğme olarak çizilir ama çok sayıda eylem menüye yakışmaz", en: "Crowds of actions that open no page; an item without `href` renders as a button, but many of them do not belong in navigation" },
    ],
  },
  anatomy: `<Sidebar
  logo={<Logo />}
  logoText="Atlas ERP"
  tone="dark"
  aria-label="Main menu"
  groups={[{ label: "Sales", items: [{ label: "Orders", href: "/orders", icon: <Icon />, active: true, count: 12 }] }]}
  renderLink={(props, item) => <Link {...props} href={item.href ?? "#"} />}
/>`,
  examples: [
    {
      id: "tones",
      title: { tr: "Koyu ve açık ton", en: "Dark and light tones" },
      body: { tr: "Varsayılan `dark` ton uzun çalışma ekranlarında menüyü içerikten ayırır. Beyaz bir kenar isteyen uygulamalar `light` seçer. İki ton da tema değişkenlerinden beslenir, koyu temada kendiliğinden uyum sağlar.", en: "The default `dark` tone separates the menu from the content on long working screens. Apps that prefer a white rail choose `light`. Both read from theme variables and follow the dark theme on their own." },
      example: { Demo: Tones, block: true, code: `<Sidebar tone="dark" logoText="Dark" groups={groups} />
<Sidebar tone="light" logoText="Light" groups={groups} />` },
    },
    {
      id: "collapsed",
      title: { tr: "Daralmış menü", en: "Collapsed menu" },
      body: { tr: "Daralma durumu `AppShell` tarafından yönetilir, `Sidebar` için ayrı bir seçenek yoktur. Logo metni, öğe adları, grup başlıkları ve sayaçlar gizlenir; öğe adı `title` özniteliği olarak kalır. Üstteki menü düğmesiyle deneyin. Sayaçlar bu hâlde görünmediği için kritik kuyrukları başka yerde de gösterin.", en: "`AppShell` owns the collapsed state, so `Sidebar` has no option for it. The logo text, item names, group titles and counts are hidden, and the item name stays as a `title` attribute. Try it with the menu button above. Counts are not visible in this state, so show critical queues elsewhere too." },
      example: { Demo: Collapsed, block: true, code: `<AppShell defaultCollapsed sidebar={<Sidebar logoText="Atlas ERP" logo={<Logo />} groups={groups} />} topbar={<Topbar />}>
  <Page>
    <PageHeader title="Orders" />
  </Page>
</AppShell>` },
    },
    {
      id: "counts",
      title: { tr: "Sayaçlar", en: "Count badges" },
      body: { tr: "`count` sıfırdan büyükse sayaç görünür, sıfır olduğunda kendiliğinden kaybolur. Boş bir kuyruk için sayı göstermeyin; kullanıcı sayacı iş bekliyor diye okur. Düğmeye basıp sayacın inişini izleyin.", en: "A count above zero shows a badge, and at zero it disappears on its own. Do not show a number for an empty queue, because people read the badge as work waiting. Press the button and watch it drop." },
      example: { Demo: Counts, block: true, code: `const [waiting, setWaiting] = useState(3);

const groups: NavGroup[] = [
  { label: "Administration", items: [{ label: "Approvals", href: "/approvals", count: waiting }] },
];

<Button variant="success" disabled={waiting === 0} onClick={() => setWaiting(waiting - 1)}>
  Approve the next one
</Button>` },
    },
    {
      id: "button-items",
      title: { tr: "Bağlantısız öğeler", en: "Items without a link" },
      body: { tr: "`href` verilmeyen öğe `button` olarak çizilir ve `onClick` çalıştırır; görünümü bağlantılarla aynıdır. Oturumu kapatmak gibi sayfa açmayan birkaç eylem için uygundur. `renderLink` verilmişse her öğe ondan geçer, `href` olmasa bile düğme çizilmez. `aria-label` menünün `nav` öğesini adlandırır, `className` kök `aside` öğesine eklenir.", en: "An item without `href` renders as a `button` and runs `onClick`, looking the same as a link. It suits a few actions that open no page, such as signing out. With `renderLink`, every item goes through it, so no button is drawn even without `href`. `aria-label` names the menu's `nav` and `className` is added to the root `aside`." },
      example: { Demo: ButtonItems, block: true, code: `const groups: NavGroup[] = [
  { label: "Sales", items: [{ label: "Orders", href: "/orders", icon: <IconPackage size={16} /> }] },
  {
    label: "Session",
    items: [
      { label: "Refresh data", icon: <IconRefresh size={16} />, onClick: refresh },
      { label: "Sign out", icon: <IconLogout size={16} />, onClick: signOut },
    ],
  },
];

<Sidebar aria-label="Main menu" className="erp-nav" logoText="Atlas ERP" groups={groups} />` },
    },
    {
      id: "render-link",
      title: { tr: "Next.js ile bağlantı", en: "Links with Next.js" },
      body: { tr: "`renderLink` her öğe için hazır bağlantı özelliklerini ve öğenin kendisini alır. Özellikleri yönlendiricinizin bağlantısına aktarın; `onClick` dar ekrandaki çekmeceyi kapattığı için bu aktarım atlanmamalıdır. Açık sayfayı `active` ile siz belirlersiniz. Aşağıdaki canlı örnek yönlendiriciyi taklit eder.", en: "`renderLink` receives the ready-made anchor props and the item itself. Spread the props onto your router's link; `onClick` closes the drawer on narrow screens, so do not drop it. You decide the current page through `active`. The live example below stands in for a router." },
      example: { Demo: Links, block: true, code: `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, type NavGroup } from "btui";

export function AppNav() {
  const pathname = usePathname();
  const groups: NavGroup[] = [
    {
      items: [
        { label: "Orders", href: "/orders", active: pathname.startsWith("/orders") },
        { label: "Invoices", href: "/invoices", active: pathname.startsWith("/invoices") },
      ],
    },
  ];
  return <Sidebar groups={groups} renderLink={(props, item) => <Link {...props} href={item.href ?? "#"} />} />;
}` },
    },
    {
      id: "react-router",
      title: { tr: "React Router ile bağlantı", en: "Links with React Router" },
      body: { tr: "React Router aynı biçimde çalışır, tek fark bağlantının `to` özelliğini beklemesidir.", en: "React Router works the same way; the only difference is that its link expects `to`." },
      code: `import { Link, useLocation } from "react-router";
import { Sidebar, type NavGroup } from "btui";

export function AppNav() {
  const { pathname } = useLocation();
  const groups: NavGroup[] = [
    {
      items: [
        { label: "Orders", href: "/orders", active: pathname.startsWith("/orders") },
        { label: "Invoices", href: "/invoices", active: pathname.startsWith("/invoices") },
      ],
    },
  ];
  return <Sidebar groups={groups} renderLink={(props, item) => <Link {...props} to={item.href ?? "/"} />} />;
}`,
    },
  ],
  a11y: [
    { tr: "Öğeler `aside` içindeki `nav` öğesinde gerçek bağlantılar olarak çizilir; bağlantılar arasında `Tab` ile dolaşılır. Sayfada birden çok `nav` varsa `aria-label` ile adlandırın.", en: "Items are real links inside a `nav` within an `aside`, so `Tab` moves between them. With several `nav` elements on a page, name this one with `aria-label`." },
    { tr: "Açık sayfa `active` ile işaretlenince `aria-current=\"page\"` eklenir; renk tek başına kalmaz.", en: "Marking the current page with `active` adds `aria-current=\"page\"`, so colour does not stand alone." },
    { tr: "Her öğe `title` taşır; daralmış menüde görünür ad gizlense de öğenin adı okunur.", en: "Every item carries a `title`, so its name is still announced when the collapsed menu hides the visible label." },
    { tr: "`href` verilmeyen öğe gerçek bir `button` olarak çizilir, bu yüzden klavye ile ulaşılır ve çalıştırılır.", en: "An item without `href` renders as a real `button`, so it stays reachable and usable from the keyboard." },
  ],
  keyboard: [
    ["Tab", { tr: "Sonraki menü bağlantısına geçer", en: "Moves to the next menu link" }],
    ["Shift + Tab", { tr: "Önceki menü bağlantısına döner", en: "Moves to the previous menu link" }],
    ["Enter", { tr: "Odaktaki bağlantıya gider ya da düğmeyi çalıştırır", en: "Follows the focused link or presses the button" }],
    ["Space", { tr: "`href` olmayan öğede düğmeyi çalıştırır", en: "Presses the button on an item without `href`" }],
  ],
  api: [
    {
      name: "Sidebar",
      props: [
        { name: "groups", type: "NavGroup[]", required: true, description: { tr: "Menü grupları", en: "Menu groups" } },
        { name: "logo", type: "ReactNode", description: { tr: "Üst alandaki işaret; daralmış menüde de görünür", en: "Mark at the top; stays visible in a collapsed menu" } },
        { name: "logoText", type: "ReactNode", description: { tr: "İşaretin yanındaki ad; daralınca gizlenir", en: "Name beside the mark; hidden when collapsed" } },
        { name: "tone", type: '"dark" | "light"', default: '"dark"', description: { tr: "Menü tonu", en: "Menu tone" } },
        { name: "renderLink", type: '(props: ComponentPropsWithoutRef<"a"> & { "data-active"?: string }, item: NavItem) => ReactElement', description: { tr: "Yönlendiricinizin bağlantısını takar; özellikleri bağlantıya aktarın", en: "Plugs in your router's link; spread the props onto it" } },
        { name: "aria-label", type: "string", description: { tr: "`nav` işaret noktasının adı", en: "Name of the `nav` landmark" } },
        { name: "className", type: "string", description: { tr: "Kök `aside` öğesine eklenir", en: "Added to the root `aside`" } },
      ],
    },
    {
      name: "NavGroup",
      props: [
        { name: "label", type: "string", description: { tr: "Grup başlığı; verilmezse başlık çizilmez", en: "Group title; left out, no title is drawn" } },
        { name: "items", type: "NavItem[]", required: true, description: { tr: "Gruptaki öğeler", en: "Items in the group" } },
      ],
    },
    {
      name: "NavItem",
      description: { tr: "`label` aynı grupta tekrar etmemelidir; öğe anahtarı olarak kullanılır.", en: "`label` must be unique within a group, because it is the item key." },
      props: [
        { name: "label", type: "string", required: true, description: { tr: "Öğe adı", en: "Item name" } },
        { name: "icon", type: "ReactNode", description: { tr: "Addan önce gösterilir", en: "Shown before the name" } },
        { name: "href", type: "string", description: { tr: "Bağlantı adresi. Verilmezse öğe `button` olur; `renderLink` varsa ondan geçer", en: "Link target. Without it the item is a `button`, unless `renderLink` is set" } },
        { name: "active", type: "boolean", description: { tr: "Açık sayfayı işaretler", en: "Marks the current page" } },
        { name: "count", type: "number", description: { tr: "Sayaç; sıfır ya da boşsa gösterilmez", en: "Badge number; hidden when zero or left out" } },
        { name: "onClick", type: "MouseEventHandler", description: { tr: "Tıklamada çalışır, ardından dar ekrandaki çekmece kapanır", en: "Runs on click, then the drawer closes on narrow screens" } },
      ],
    },
  ],
  styling: [
    { name: "data-tone", kind: "data", description: { tr: "`aside` üzerindeki ton", en: "The tone on the `aside`" } },
    { name: "data-active", kind: "data", description: { tr: "Açık sayfanın bağlantısında bulunur", en: "Present on the current page's link" } },
    { name: "--bt-nav", kind: "var", description: { tr: "Koyu ton zemini", en: "Background of the dark tone" } },
    { name: "--bt-nav-line", kind: "var", description: { tr: "Logo altı ve grup ayırıcı çizgisi", en: "Line under the logo and between groups" } },
    { name: "--bt-nav-group", kind: "var", description: { tr: "Grup başlığı ve ikon rengi", en: "Group title and icon colour" } },
    { name: "--bt-nav-item", kind: "var", description: { tr: "Öğe metni rengi", en: "Item text colour" } },
    { name: "--bt-danger", kind: "var", description: { tr: "Sayaç zemini", en: "Count badge background" } },
  ],
  related: ["app-shell", "topbar", "breadcrumb", "badge"],
});
