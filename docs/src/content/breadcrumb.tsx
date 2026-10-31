import { useState, type ReactNode } from "react";
import { IconFileInvoice, IconHome } from "@tabler/icons-react";
import { Breadcrumb } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Stay({ children }: { children: ReactNode }) {
  return (
    <div onClick={(e) => { if ((e.target as HTMLElement).closest("a")) e.preventDefault(); }}>
      {children}
    </div>
  );
}

function Hero() {
  const t = useText();
  return (
    <Stay>
      <Breadcrumb items={[
        { label: t({ tr: "Ana sayfa", en: "Home" }), href: "/" },
        { label: t({ tr: "Siparişler", en: "Orders" }), href: "/orders" },
        { label: "SP-1061" },
      ]} />
    </Stay>
  );
}

function Current() {
  const t = useText();
  return (
    <Stay>
      <Breadcrumb items={[
        { label: t({ tr: "Müşteriler", en: "Customers" }), href: "/customers" },
        { label: "Mavi Yapı", href: "/customers/42" },
      ]} />
    </Stay>
  );
}

function WithIcon() {
  const t = useText();
  return (
    <Stay>
      <Breadcrumb items={[
        { label: <IconHome size={14} aria-label={t({ tr: "Ana sayfa", en: "Home" })} />, href: "/" },
        { label: <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><IconFileInvoice size={14} />{t({ tr: "Faturalar", en: "Invoices" })}</span>, href: "/invoices" },
        { label: "FT-2026-0418" },
      ]} />
    </Stay>
  );
}

function Deep() {
  const t = useText();
  return (
    <Stay>
      <Breadcrumb items={[
        { label: t({ tr: "Ayarlar", en: "Settings" }), href: "/settings" },
        { label: t({ tr: "Onay akışları", en: "Approval flows" }), href: "/settings/approvals" },
        { label: t({ tr: "Satın alma", en: "Purchasing" }), href: "/settings/approvals/purchasing" },
        { label: t({ tr: "50.000 TL üzeri", en: "Above 50,000 TL" }) },
      ]} />
    </Stay>
  );
}

function WithRouter() {
  const t = useText();
  const [path, setPath] = useState("/invoices/418");
  return (
    <div className="d-stack-wide">
      <Breadcrumb
        items={[
          { label: t({ tr: "Ana sayfa", en: "Home" }), href: "/" },
          { label: t({ tr: "Faturalar", en: "Invoices" }), href: "/invoices" },
          { label: "FT-2026-0418" },
        ]}
        renderLink={(props, item) => <a {...props} onClick={(e) => { e.preventDefault(); setPath(item.href ?? "/"); }} />}
      />
      <small>{t({ tr: "Yönlendirici adresi", en: "Router path" })}: <code>{path}</code></small>
    </div>
  );
}

export default definePage({
  summary: { tr: "Kullanıcının uygulama içindeki yerini gösterir ve üst sayfalara tek tıkla dönmesini sağlar. Sipariş, fatura gibi derin ayrıntı ekranlarında yön kaybını önler.", en: "Shows where the user is in the application and gives a one-click way back to parent pages. It keeps people oriented on deep detail screens such as an order or an invoice." },
  imports: 'import { Breadcrumb, type Crumb } from "btui";',
  hero: {
    Demo: Hero,
    code: `<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Orders", href: "/orders" },
    { label: "SP-1061" },
  ]}
/>`,
  },
  use: {
    do: [
      { tr: "En az iki düzey derinlikteki ayrıntı ekranları; müşteri, sipariş ya da fatura kaydı", en: "Detail screens at least two levels deep; a customer, order or invoice record" },
      { tr: "Kaydın belge numarasını son öğede göstermek; kullanıcı neye baktığını bilir", en: "Showing the record's document number as the last item, so people know what they are viewing" },
      { tr: "`PageHeader` içinde sayfa başlığının üstünde kullanmak; `breadcrumb` özelliği bunu hazır verir", en: "Placing it above the page title in `PageHeader`; the `breadcrumb` prop does this for you" },
    ],
    dont: [
      { tr: "Tek düzeyli sayfalar; kenar menüsü zaten konumu gösterir", en: "Single-level pages; the sidebar already shows the location" },
      { tr: "Adım adım ilerleyen akışlar; konum yolu hiyerarşiyi gösterir, kullanıcının geçmişini değil", en: "Step-by-step flows; a breadcrumb shows hierarchy, not the path someone took" },
      { tr: "Ana gezinmenin yerine geçirmek; yalnız üst sayfalara dönüş sağlar", en: "Replacing the main navigation; it only leads back to parent pages" },
    ],
  },
  anatomy: `<Breadcrumb
  items={[
    { label: "Parent", href: "/parent" },
    { label: "Current page" },
  ]}
  renderLink={(props, item) => <Link {...props} />}
/>`,
  examples: [
    {
      id: "current",
      title: { tr: "Son öğe", en: "The last item" },
      body: { tr: "Son öğe her zaman düz metindir ve `aria-current=\"page\"` taşır. `href` verseniz bile bağlantıya dönüşmez, çünkü kullanıcı zaten o sayfadadır. Aradaki bir öğede `href` yoksa da düz metin çizilir.", en: "The last item is always plain text with `aria-current=\"page\"`. Even with an `href` it stays text, because the user is already there. An item in the middle without `href` is drawn as text too." },
      example: { Demo: Current, code: `<Breadcrumb
  items={[
    { label: "Customers", href: "/customers" },
    { label: "Mavi Yapı", href: "/customers/42" },
  ]}
/>` },
    },
    {
      id: "icons",
      title: { tr: "İkonlu etiket", en: "Labels with icons" },
      body: { tr: "`label` `ReactNode` kabul eder. Ana sayfa için yalnız ikon kullanacaksanız ikona erişilebilir bir ad verin; ad yoksa bağlantı ekran okuyucuda boş kalır.", en: "`label` accepts a `ReactNode`. If home is an icon alone, give the icon an accessible name; without one the link reads as empty." },
      example: { Demo: WithIcon, code: `<Breadcrumb
  items={[
    { label: <IconHome size={14} aria-label="Home" />, href: "/" },
    { label: <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><IconFileInvoice size={14} />Invoices</span>, href: "/invoices" },
    { label: "FT-2026-0418" },
  ]}
/>` },
    },
    {
      id: "deep",
      title: { tr: "Derin yol", en: "Deep paths" },
      body: { tr: "Ayarlar gibi derin ağaçlarda tüm düzeyleri yazın, bileşen ara öğeleri kendisi gizlemez. Yol kısa ve okunur kalsın diye düzey sayısını sınırlayın; dört düzeyi geçen bir ağaç genelde sadeleştirme ister.", en: "In deep trees such as settings, list every level; the component does not hide middle items. Keep the path short and readable; a tree beyond four levels usually needs simplifying." },
      example: { Demo: Deep, code: `<Breadcrumb
  items={[
    { label: "Settings", href: "/settings" },
    { label: "Approval flows", href: "/settings/approvals" },
    { label: "Purchasing", href: "/settings/approvals/purchasing" },
    { label: "Above 50,000 TL" },
  ]}
/>` },
    },
    {
      id: "router",
      title: { tr: "Yönlendirici ile", en: "With a router" },
      body: { tr: "`href` düz bir `<a>` çizer ve sayfa yenilenir. İstemci tarafı geçiş için `href` değerlerini olduğu gibi bırakın, `renderLink` ile yönlendiricinizin bağlantısını takın. `renderLink` hazır bağlantı özelliklerini (`href`, `children`) ve öğenin kendisini alır; yalnız bağlantı olacak öğelerde çağrılır, son öğeye dokunmaz. Bağlantı biçimi aynı kalır. Canlı örnekteki bağlantılar yönlendiriciyi taklit eder.", en: "`href` draws a plain `<a>` and reloads the page. For client-side moves, keep your `href` values and plug in your router's link with `renderLink`. `renderLink` receives the ready-made link props (`href`, `children`) and the item itself; it runs only for items that will be links and leaves the last one alone. The link keeps its look. The links in the live example stand in for a router." },
      example: { Demo: WithRouter, block: true, code: `import { Link } from "react-router";

<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Invoices", href: "/invoices" },
    { label: "FT-2026-0418" },
  ]}
  renderLink={({ href, children }) => <Link to={href ?? "/"}>{children}</Link>}
/>` },
    },
  ],
  a11y: [
    { tr: "`nav` ve sıralı liste `ol` ile çizilir; ekran okuyucu öğe sayısını ve sırayı bildirir.", en: "Renders a `nav` with an ordered list `ol`, so screen readers announce the count and order." },
    { tr: "Son öğe `aria-current=\"page\"` taşır; açık sayfa yalnız renkle anlatılmaz.", en: "The last item carries `aria-current=\"page\"`, so the current page is not told by colour alone." },
    { tr: "Ayırıcı ikon `aria-hidden` olduğundan okunmaz.", en: "The separator icon is `aria-hidden`, so it is not read out." },
    { tr: "`nav` öğesinin adı dile göre gelir: yerelleştirme dosyasındaki `breadcrumb` metni.", en: "The `nav` name follows the language: the `breadcrumb` label in the locale." },
  ],
  keyboard: [
    ["Tab", { tr: "Sonraki bağlantıya geçer", en: "Moves to the next link" }],
    ["Shift + Tab", { tr: "Önceki bağlantıya döner", en: "Moves to the previous link" }],
    ["Enter", { tr: "Odaktaki bağlantıya gider", en: "Follows the focused link" }],
  ],
  api: [
    {
      name: "Breadcrumb",
      props: [
        { name: "items", type: "Crumb[]", required: true, description: { tr: "Baştan sona yol öğeleri; sonuncusu açık sayfadır", en: "Path items from first to last; the last one is the current page" } },
        { name: "renderLink", type: '(props: ComponentPropsWithoutRef<"a">, item: Crumb) => ReactElement', description: { tr: "Yönlendiricinizin bağlantısını takar; `href` taşıyan ve son olmayan öğelerde çağrılır", en: "Plugs in your router's link; called for items with `href` that are not the last" } },
      ],
    },
    {
      name: "Crumb",
      props: [
        { name: "label", type: "ReactNode", required: true, description: { tr: "Öğenin içeriği", en: "Item content" } },
        { name: "href", type: "string", description: { tr: "Bağlantı adresi; son öğede yok sayılır", en: "Link target; ignored on the last item" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-accent-strong", kind: "var", description: { tr: "Bağlantı rengi", en: "Link colour" } },
    { name: "--bt-text-2", kind: "var", description: { tr: "Son öğenin rengi", en: "Colour of the last item" } },
    { name: "--bt-muted", kind: "var", description: { tr: "Aradaki düz metin rengi", en: "Colour of plain text in the middle" } },
    { name: "--bt-faint", kind: "var", description: { tr: "Ayırıcı ikon rengi", en: "Separator icon colour" } },
  ],
  related: ["page-header", "sidebar", "app-shell"],
});
