import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconBell, IconBuildingWarehouse, IconChevronDown, IconHelp, IconLogout, IconPackage, IconPlus, IconUser } from "@tabler/icons-react";
import { AppShell, Avatar, Button, ButtonGroup, IconButton, Kbd, Menu, MenuItem, MenuSeparator, Page, PageHeader, Sidebar, Topbar, TopbarSearch, TopbarSeparator, TopbarSpacer, type NavGroup, type SidebarProps } from "btui";
import { ORDERS } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const MINI = ".d-mini.bt-app { height: 100%; }";

const renderLink: SidebarProps["renderLink"] = (props) => <a {...props} className="bt-nav-item d-card" />;

function Bordered({ children }: { children: ReactNode }) {
  return <div style={{ border: "1px solid var(--bt-border)" }}>{children}</div>;
}

function Hero() {
  const t = useText();
  return (
    <Bordered>
      <Topbar>
        <TopbarSearch placeholder={t({ tr: "Sipariş, müşteri ara…", en: "Search orders, customers…" })} />
        <TopbarSpacer />
        <Button variant="primary" size="sm" icon={<IconPlus size={14} />}>{t({ tr: "Yeni sipariş", en: "New order" })}</Button>
        <TopbarSeparator />
        <IconButton label={t({ tr: "Bildirimler", en: "Notifications" })}><IconBell size={18} /></IconButton>
        <Avatar name="Ada Yılmaz" />
      </Topbar>
    </Bordered>
  );
}

function InShell() {
  const t = useText();
  const groups: NavGroup[] = [{
    items: [{
      label: t({ tr: "Siparişler", en: "Orders" }),
      icon: <IconPackage size={16} />,
      href: "#",
      active: true,
      onClick: (e) => e.preventDefault(),
    }],
  }];
  return (
    <div style={{ height: 240, overflow: "hidden", border: "1px solid var(--bt-border)" }}>
      <style>{MINI}</style>
      <AppShell
        className="d-mini"
        sidebar={<Sidebar logo={<IconBuildingWarehouse size={22} />} logoText="Atlas ERP" groups={groups} renderLink={renderLink} />}
        topbar={
          <Topbar>
            <TopbarSpacer />
            <Avatar name="Ada Yılmaz" />
          </Topbar>
        }
      >
        <Page><PageHeader title={t({ tr: "Siparişler", en: "Orders" })} /></Page>
      </AppShell>
    </div>
  );
}

function SearchShortcut() {
  const t = useText();
  const lang = useLang();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target as HTMLElement).matches("input, textarea")) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const needle = query.trim().toLocaleLowerCase(lang);
  const found = ORDERS.filter((o) => `${o.no} ${o.customer}`.toLocaleLowerCase(lang).includes(needle)).length;

  return (
    <div className="d-stack-wide">
      <Bordered>
        <Topbar>
          <TopbarSearch
            ref={input}
            placeholder={t({ tr: "Sipariş no ya da müşteri…", en: "Order number or customer…" })}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            shortcut={<Kbd>/</Kbd>}
          />
        </Topbar>
      </Bordered>
      <p aria-live="polite" style={{ margin: 0, fontSize: 13 }}>{t({ tr: `Bulunan sipariş: ${found}`, en: `Orders found: ${found}` })}</p>
    </div>
  );
}

function Grouped() {
  const t = useText();
  const [lang, setLang] = useState("tr");
  return (
    <Bordered>
      <Topbar>
        <TopbarSpacer />
        <ButtonGroup aria-label={t({ tr: "Dil", en: "Language" })}>
          <Button size="sm" variant={lang === "tr" ? "soft" : "default"} aria-pressed={lang === "tr"} onClick={() => setLang("tr")}>TR</Button>
          <Button size="sm" variant={lang === "en" ? "soft" : "default"} aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</Button>
        </ButtonGroup>
        <TopbarSeparator />
        <IconButton label={t({ tr: "Yardım", en: "Help" })}><IconHelp size={18} /></IconButton>
        <IconButton label={t({ tr: "Bildirimler", en: "Notifications" })}><IconBell size={18} /></IconButton>
        <TopbarSeparator />
        <Menu trigger={<Button variant="ghost" size="sm" iconEnd={<IconChevronDown size={14} />}>Ada Yılmaz</Button>}>
          <MenuItem icon={<IconUser size={15} />}>{t({ tr: "Profilim", en: "My profile" })}</MenuItem>
          <MenuSeparator />
          <MenuItem icon={<IconLogout size={15} />} danger>{t({ tr: "Oturumu kapat", en: "Sign out" })}</MenuItem>
        </Menu>
      </Topbar>
    </Bordered>
  );
}

export default definePage({
  summary: { tr: "İçeriğin üstündeki çubuktur. Genel arama, hızlı eylemler ve kullanıcı alanı burada durur; `AppShell` içinde menü düğmesini kendiliğinden ekler.", en: "The bar above the content. Global search, quick actions and the user area live here, and inside `AppShell` it adds the menu button on its own." },
  imports: 'import { Topbar, TopbarSearch, TopbarSeparator, TopbarSpacer } from "btui";',
  hero: {
    Demo: Hero,
    block: true,
    code: `<Topbar>
  <TopbarSearch placeholder="Search orders, customers…" />
  <TopbarSpacer />
  <Button variant="primary" size="sm" icon={<IconPlus size={14} />}>New order</Button>
  <TopbarSeparator />
  <IconButton label="Notifications"><IconBell size={18} /></IconButton>
  <Avatar name="Ada Yılmaz" />
</Topbar>`,
  },
  use: {
    do: [
      { tr: "Her ekrandan ulaşılması gereken genel arama; sipariş ya da müşteri bulmak için", en: "Global search that must be reachable from every screen, such as finding an order or customer" },
      { tr: "Uygulama geneli hızlı eylemler; yeni sipariş, bildirimler, kullanıcı menüsü", en: "App-wide quick actions; a new order, notifications, the user menu" },
      { tr: "Sol ve sağ grupları `TopbarSpacer` ile ayırmak", en: "Splitting left and right groups with `TopbarSpacer`" },
    ],
    dont: [
      { tr: "Tek bir sayfaya özgü eylemler; bunlar `PageHeader` içinde durur", en: "Actions that belong to one page; those go in `PageHeader`" },
      { tr: "Sayfa başlığı ya da konum yolu; onların yeri içeriğin başıdır", en: "The page title or breadcrumb; those belong at the top of the content" },
      { tr: "Tablo filtreleri; bir listeyi daraltmak için `FilterBar` kullanın", en: "Table filters; use `FilterBar` to narrow a list" },
    ],
  },
  anatomy: `<Topbar>
  <TopbarSearch shortcut={<Kbd>/</Kbd>} />
  <TopbarSpacer />
  <Button>…</Button>
  <TopbarSeparator />
  <IconButton label="…">…</IconButton>
</Topbar>`,
  examples: [
    {
      id: "in-shell",
      title: { tr: "Kabuk içinde", en: "Inside the shell" },
      body: { tr: "`AppShell` içinde `Topbar` en başa bir menü düğmesi koyar. Bu düğme geniş ekranda menüyü daraltır, dar ekranda çekmeceyi açar. Kabuk dışında düğme çizilmez, bu yüzden yukarıdaki örnekte görünmez.", en: "Inside `AppShell`, `Topbar` puts a menu button first. It collapses the menu on wide screens and opens the drawer on narrow ones. Outside the shell the button is not drawn, which is why the example above has none." },
      example: { Demo: InShell, block: true, code: `<AppShell
  sidebar={<Sidebar logoText="Atlas ERP" groups={groups} />}
  topbar={
    <Topbar>
      <TopbarSpacer />
      <Avatar name="Ada Yılmaz" />
    </Topbar>
  }
>
  <Page>
    <PageHeader title="Orders" />
  </Page>
</AppShell>` },
    },
    {
      id: "search",
      title: { tr: "Arama ve kısayol", en: "Search and shortcut" },
      body: { tr: "`TopbarSearch` yerel `input` özelliklerini alır ve `ref` iletir. `shortcut` yalnız ipucunu gösterir, tuşu sizin bağlamanız gerekir. Burada `/` tuşuna basınca odak aramaya gider. 800 piksel ve altında arama gizlenir; dar ekranda aramaya ulaşmak için ayrı bir yol bırakın.", en: "`TopbarSearch` takes native `input` props and forwards its `ref`. `shortcut` only shows the hint, so binding the key is up to you. Here `/` moves focus to the search. At 800 pixels and below the search is hidden, so leave another way to reach it on narrow screens." },
      example: { Demo: SearchShortcut, block: true, code: `const input = useRef<HTMLInputElement>(null);
const [query, setQuery] = useState("");

useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "/" && !(e.target as HTMLElement).matches("input, textarea")) {
      e.preventDefault();
      input.current?.focus();
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []);

<Topbar>
  <TopbarSearch
    ref={input}
    placeholder="Order number or customer…"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    shortcut={<Kbd>/</Kbd>}
  />
</Topbar>` },
    },
    {
      id: "groups",
      title: { tr: "Gruplama", en: "Grouping" },
      body: { tr: "`TopbarSpacer` kalan boşluğu doldurarak içeriği sağa iter, `TopbarSeparator` ilişkili öğeler arasına ince bir çizgi koyar. Dil seçimi, yardım ve kullanıcı menüsü gibi farklı konuları böyle ayırın.", en: "`TopbarSpacer` fills the free space and pushes content to the right, while `TopbarSeparator` draws a thin line between groups. Use them to separate topics such as language, help and the user menu." },
      example: { Demo: Grouped, block: true, code: `<Topbar>
  <TopbarSpacer />
  <ButtonGroup aria-label="Language">
    <Button size="sm" variant="soft" aria-pressed>TR</Button>
    <Button size="sm" aria-pressed={false}>EN</Button>
  </ButtonGroup>
  <TopbarSeparator />
  <IconButton label="Help"><IconHelp size={18} /></IconButton>
  <IconButton label="Notifications"><IconBell size={18} /></IconButton>
  <TopbarSeparator />
  <Menu trigger={<Button variant="ghost" size="sm" iconEnd={<IconChevronDown size={14} />}>Ada Yılmaz</Button>}>
    <MenuItem icon={<IconUser size={15} />}>My profile</MenuItem>
    <MenuSeparator />
    <MenuItem icon={<IconLogout size={15} />} danger>Sign out</MenuItem>
  </Menu>
</Topbar>` },
    },
  ],
  a11y: [
    { tr: "`header` öğesi olarak çizilir; `aria-label` gibi yerel öznitelikler öğeye aktarılır.", en: "Renders a `header` element, and native attributes such as `aria-label` reach it." },
    { tr: "`TopbarSearch` `search` türünde bir girdi çizer. Erişilebilir adı `placeholder` metninden, o da yoksa yerelleştirme dosyasındaki `search` metninden gelir; `aria-label` verirseniz bu ad geçerli olur.", en: "`TopbarSearch` renders an input of type `search`. Its accessible name comes from `placeholder`, then the locale's `search` string; an `aria-label` you pass takes over." },
    { tr: "Yalnız ikonlu düğmelerde `IconButton` kullanın; zorunlu `label` ekran okuyucuya adı verir.", en: "Use `IconButton` for icon-only actions; its required `label` gives screen readers a name." },
    { tr: "`shortcut` görseldir. Tuş kısayolu bağlıyorsanız bir girdinin içindeyken devreye girmemesine dikkat edin.", en: "`shortcut` is visual only. If you bind a key, make sure it stays quiet while someone is typing in a field." },
  ],
  keyboard: [
    ["Tab", { tr: "Çubuktaki düğme ve girdiler arasında ilerler", en: "Moves through the bar's buttons and fields" }],
    ["Shift + Tab", { tr: "Bir önceki öğeye döner", en: "Moves to the previous element" }],
    ["Enter", { tr: "Odaktaki düğmeyi çalıştırır", en: "Presses the focused button" }],
    ["Space", { tr: "Odaktaki düğmeyi çalıştırır", en: "Presses the focused button" }],
  ],
  api: [
    {
      name: "Topbar",
      description: { tr: "Tüm yerel `header` öznitelikleri iletilir. `TopbarSpacer` ve `TopbarSeparator` özellik almaz.", en: "All native `header` attributes are forwarded. `TopbarSpacer` and `TopbarSeparator` take no props." },
      props: [
        { name: "className", type: "string", description: { tr: "Kök öğeye eklenir", en: "Added to the root element" } },
        { name: "children", type: "ReactNode", description: { tr: "Çubuğun içeriği; `AppShell` içinde menü düğmesinden sonra gelir", en: "Bar content; follows the menu button inside `AppShell`" } },
      ],
    },
    {
      name: "TopbarSearch",
      description: { tr: "`type` dışındaki tüm yerel `input` öznitelikleri ve ref iletilir.", en: "All native `input` attributes except `type`, and the ref, are forwarded." },
      props: [
        { name: "shortcut", type: "ReactNode", description: { tr: "Girdinin sağında gösterilen ipucu, genelde `Kbd`", en: "Hint shown to the right of the field, usually a `Kbd`" } },
        { name: "placeholder", type: "string", default: "locale.search", description: { tr: "Yer tutucu ve erişilebilir ad", en: "Placeholder and accessible name" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-surface", kind: "var", description: { tr: "Çubuğun zemini", en: "Bar background" } },
    { name: "--bt-border", kind: "var", description: { tr: "Alt çizgi, ayırıcı ve arama kenarı", en: "Bottom line, separator and search border" } },
    { name: "--bt-bg", kind: "var", description: { tr: "Odak dışındaki arama zemini", en: "Search background when not focused" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Odaktaki arama kenarı", en: "Search border on focus" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Odaktaki arama halkası", en: "Search focus ring" } },
  ],
  related: ["app-shell", "sidebar", "search-input", "kbd", "menu"],
});
