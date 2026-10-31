import { IconCopy, IconDots, IconChevronDown, IconExternalLink, IconFileInvoice, IconListDetails, IconPencil, IconPrinter, IconSend, IconTrash, IconTruckDelivery } from "@tabler/icons-react";
import { Badge, Button, IconButton, Menu, MenuGroup, MenuItem, MenuSeparator, SubMenu, useConfirm, useToast } from "btui";
import { ORDERS, STATUS_LABEL, STATUS_TONE, money } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function OrderActions() {
  const t = useText();
  const toast = useToast();
  const run = (title: string) => toast({ title, tone: "ok" });
  return (
    <Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>{t({ tr: "Sipariş işlemleri", en: "Order actions" })}</Button>}>
      <MenuItem icon={<IconPencil size={15} />} onClick={() => run(t({ tr: "Düzenleme açıldı", en: "Editing opened" }))}>{t({ tr: "Düzenle", en: "Edit" })}</MenuItem>
      <MenuItem icon={<IconCopy size={15} />} onClick={() => run(t({ tr: "SP-1040 kopyalandı", en: "SP-1040 duplicated" }))}>{t({ tr: "Kopyasını oluştur", en: "Duplicate" })}</MenuItem>
      <MenuItem icon={<IconFileInvoice size={15} />} onClick={() => run(t({ tr: "Fatura taslağı hazır", en: "Invoice draft is ready" }))}>{t({ tr: "Fatura kes", en: "Create invoice" })}</MenuItem>
      <MenuSeparator />
      <MenuItem danger icon={<IconTrash size={15} />} onClick={() => run(t({ tr: "Sipariş silindi", en: "Order deleted" }))}>{t({ tr: "Siparişi sil", en: "Delete order" })}</MenuItem>
    </Menu>
  );
}

function RowActions() {
  const t = useText();
  const lang = useLang();
  const toast = useToast();
  return (
    <div className="d-stack-wide">
      {ORDERS.slice(0, 3).map((order) => (
        <div key={order.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <b style={{ width: 72 }}>{order.no}</b>
          <span style={{ flex: 1, minWidth: 0 }}>{order.customer}</span>
          <span>{money(order.amount, lang)}</span>
          <Badge tone={STATUS_TONE[order.status]}>{t(STATUS_LABEL[order.status])}</Badge>
          <Menu trigger={<IconButton size="sm" label={t({ tr: `${order.no} işlemleri`, en: `${order.no} actions` })}><IconDots size={15} /></IconButton>}>
            <MenuItem onClick={() => toast({ title: t({ tr: `${order.no} açıldı`, en: `${order.no} opened` }) })}>{t({ tr: "Ayrıntıyı aç", en: "Open details" })}</MenuItem>
            <MenuItem onClick={() => toast({ title: t({ tr: "Yazdırma kuyruğuna alındı", en: "Sent to the print queue" }) })}>{t({ tr: "Yazdır", en: "Print" })}</MenuItem>
          </Menu>
        </div>
      ))}
    </div>
  );
}

function Grouped() {
  const t = useText();
  return (
    <Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>{t({ tr: "Fatura", en: "Invoice" })}</Button>}>
      <MenuItem icon={<IconSend size={15} />}>{t({ tr: "E-posta ile gönder", en: "Send by email" })}</MenuItem>
      <MenuItem icon={<IconPrinter size={15} />}>{t({ tr: "Yazdır", en: "Print" })}</MenuItem>
      <MenuSeparator />
      <MenuItem>{t({ tr: "PDF indir", en: "Download PDF" })}</MenuItem>
      <MenuItem>{t({ tr: "e-Arşiv kopyasını indir", en: "Download e-archive copy" })}</MenuItem>
    </Menu>
  );
}

function Disabled() {
  const t = useText();
  return (
    <>
      <Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>{t({ tr: "İptal edilen sipariş", en: "Cancelled order" })}</Button>}>
        <MenuItem>{t({ tr: "Ayrıntıyı aç", en: "Open details" })}</MenuItem>
        <MenuItem disabled>{t({ tr: "Fatura kes", en: "Create invoice" })}</MenuItem>
        <MenuItem disabled>{t({ tr: "Sevkiyatı başlat", en: "Start shipment" })}</MenuItem>
      </Menu>
      <span className="d-muted">{t({ tr: "İptal edilen siparişe fatura kesilmez.", en: "Cancelled orders cannot be invoiced." })}</span>
    </>
  );
}

function Alignment() {
  const t = useText();
  const items = (
    <>
      <MenuItem>{t({ tr: "Bugün", en: "Today" })}</MenuItem>
      <MenuItem>{t({ tr: "Bu hafta", en: "This week" })}</MenuItem>
      <MenuItem>{t({ tr: "Bu ay", en: "This month" })}</MenuItem>
    </>
  );
  return (
    <>
      <Menu align="start" trigger={<Button>start</Button>}>{items}</Menu>
      <Menu align="center" trigger={<Button>center</Button>}>{items}</Menu>
      <Menu align="end" trigger={<Button>end</Button>}>{items}</Menu>
    </>
  );
}

function Destructive() {
  const t = useText();
  const confirm = useConfirm();
  const toast = useToast();
  const remove = async () => {
    const ok = await confirm({
      danger: true,
      message: t({ tr: "SP-1040 ve bağlı sevkiyat planı silinecek. Bu işlem geri alınamaz.", en: "SP-1040 and its shipment plan will be deleted. This cannot be undone." }),
      confirmLabel: t({ tr: "Siparişi sil", en: "Delete order" }),
    });
    if (ok) toast({ title: t({ tr: "SP-1040 silindi", en: "SP-1040 deleted" }), tone: "ok" });
  };
  return (
    <Menu trigger={<IconButton label={t({ tr: "Sipariş işlemleri", en: "Order actions" })}><IconDots size={16} /></IconButton>}>
      <MenuItem>{t({ tr: "Düzenle", en: "Edit" })}</MenuItem>
      <MenuSeparator />
      <MenuItem danger icon={<IconTrash size={15} />} onClick={remove}>{t({ tr: "Siparişi sil", en: "Delete order" })}</MenuItem>
    </Menu>
  );
}

function Links() {
  const t = useText();
  const lang = useLang();
  return (
    <Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>{t({ tr: "SP-1040 kısayolları", en: "SP-1040 shortcuts" })}</Button>}>
      <MenuItem icon={<IconListDetails size={15} />} href={`#/${lang}/data-table`}>{t({ tr: "Sipariş listesine git", en: "Go to the order list" })}</MenuItem>
      <MenuItem icon={<IconFileInvoice size={15} />} href={`#/${lang}/data-grid`}>{t({ tr: "Fatura raporuna git", en: "Go to the invoice report" })}</MenuItem>
      <MenuSeparator />
      <MenuItem icon={<IconExternalLink size={15} />} href="https://base-ui.com">{t({ tr: "Kargo takibini aç", en: "Open cargo tracking" })}</MenuItem>
    </Menu>
  );
}

function Groups() {
  const t = useText();
  return (
    <Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>{t({ tr: "Dışa aktar", en: "Export" })}</Button>}>
      <MenuGroup label={t({ tr: "Bu sayfa", en: "This page" })}>
        <MenuItem>Excel (.xlsx)</MenuItem>
        <MenuItem>CSV</MenuItem>
      </MenuGroup>
      <MenuSeparator />
      <MenuGroup label={t({ tr: "Tüm kayıtlar", en: "All records" })}>
        <MenuItem>Excel (.xlsx)</MenuItem>
        <MenuItem>PDF</MenuItem>
      </MenuGroup>
    </Menu>
  );
}

function Nested() {
  const t = useText();
  const toast = useToast();
  const assign = (name: string) => toast({ title: t({ tr: `SP-1040, ${name} kişisine atandı`, en: `SP-1040 assigned to ${name}` }), tone: "ok" });
  return (
    <Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>{t({ tr: "Sipariş işlemleri", en: "Order actions" })}</Button>}>
      <MenuItem icon={<IconPencil size={15} />}>{t({ tr: "Düzenle", en: "Edit" })}</MenuItem>
      <SubMenu icon={<IconSend size={15} />} label={t({ tr: "Sorumlu ata", en: "Assign owner" })}>
        <MenuItem onClick={() => assign("Ada Yılmaz")}>Ada Yılmaz</MenuItem>
        <MenuItem onClick={() => assign("Can Demir")}>Can Demir</MenuItem>
        <MenuItem onClick={() => assign("Elif Kaya")}>Elif Kaya</MenuItem>
      </SubMenu>
      <SubMenu disabled icon={<IconTruckDelivery size={15} />} label={t({ tr: "Sevkiyata al", en: "Move to shipment" })}>
        <MenuItem>{t({ tr: "Bugün", en: "Today" })}</MenuItem>
      </SubMenu>
    </Menu>
  );
}

function Side() {
  const t = useText();
  const items = (
    <>
      <MenuItem>{t({ tr: "Bugün", en: "Today" })}</MenuItem>
      <MenuItem>{t({ tr: "Bu hafta", en: "This week" })}</MenuItem>
    </>
  );
  return (
    <>
      <Menu side="top" align="start" trigger={<Button>top</Button>}>{items}</Menu>
      <Menu side="right" align="start" trigger={<Button>right</Button>}>{items}</Menu>
      <Menu side="bottom" align="start" trigger={<Button>bottom</Button>}>{items}</Menu>
      <Menu side="left" align="start" trigger={<Button>left</Button>}>{items}</Menu>
    </>
  );
}

export default definePage({
  summary: { tr: "Bir kayıtla ilgili ikincil eylemleri tek bir düğmenin arkasında toplar. Ekran sade kalır, eylemler bir tık uzakta durur.", en: "Gathers the secondary actions of a record behind one button. The screen stays clean and the actions stay one click away." },
  imports: 'import { Menu, MenuGroup, MenuItem, MenuSeparator, SubMenu } from "btui";',
  base: "menu",
  hero: {
    Demo: OrderActions,
    code: `<Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>Order actions</Button>}>
  <MenuItem icon={<IconPencil size={15} />} onClick={edit}>Edit</MenuItem>
  <MenuItem icon={<IconCopy size={15} />} onClick={duplicate}>Duplicate</MenuItem>
  <MenuItem icon={<IconFileInvoice size={15} />} onClick={invoice}>Create invoice</MenuItem>
  <MenuSeparator />
  <MenuItem danger icon={<IconTrash size={15} />} onClick={remove}>Delete order</MenuItem>
</Menu>`,
  },
  use: {
    do: [
      { tr: "Tablo satırındaki eylemler; satır başına tek bir `IconButton` yeter", en: "Row actions in a table; a single `IconButton` per row is enough" },
      { tr: "Sayfa başlığında yer bulamayan ikincil eylemler", en: "Secondary actions that do not fit in the page header" },
      { tr: "Aynı kayda ait, tek tıkla çalışan kısa komutlar", en: "Short one-click commands that belong to the same record" },
      { tr: "Kayıtla ilgili sayfalara kısa yollar; `href` verilen öğe gerçek bağlantıdır", en: "Shortcuts to pages about the record; an item with `href` is a real link" },
    ],
    dont: [
      { tr: "Değer seçtirmek; form alanında `Select` kullanın", en: "Picking a value; use `Select` in a form" },
      { tr: "Ekranın ana eylemi; kullanıcı onu menüde aramamalı", en: "The main action of a screen; nobody should hunt for it in a menu" },
      { tr: "Uygulamanın ana gezinmesi; `href` birkaç kısa yol içindir, modüller arası geçiş `Sidebar` işidir", en: "The main navigation of an app; `href` is for a few shortcuts, moving between modules is the job of `Sidebar`" },
      { tr: "İki düzeyden derin alt menüler; işaretçi yolunu kaybeder, ekranı bölün", en: "Submenus deeper than two levels; the pointer loses its way, so split the screen instead" },
    ],
  },
  anatomy: `<Menu trigger={<Button />} side="bottom" align="end">
  <MenuGroup label="Group">
    <MenuItem icon={<Icon />} onClick={run}>Label</MenuItem>
    <MenuItem href="/orders">Link</MenuItem>
    <MenuItem disabled>Label</MenuItem>
  </MenuGroup>
  <MenuSeparator />
  <SubMenu label="More" icon={<Icon />}>
    <MenuItem>Label</MenuItem>
  </SubMenu>
  <MenuItem danger>Label</MenuItem>
</Menu>`,
  examples: [
    {
      id: "row-actions",
      title: { tr: "Satır eylemleri", en: "Row actions" },
      body: { tr: "Listelerde tetikleyici olarak küçük bir `IconButton` kullanın. `label` içine sipariş numarasını yazın; ekran okuyucu her satırda aynı adı duymasın.", en: "In lists, use a small `IconButton` as the trigger. Put the order number in `label` so a screen reader does not hear the same name on every row." },
      example: {
        block: true,
        Demo: RowActions,
        code: `<Menu trigger={<IconButton size="sm" label={\`\${order.no} actions\`}><IconDots size={15} /></IconButton>}>
  <MenuItem onClick={() => open(order)}>Open details</MenuItem>
  <MenuItem onClick={() => print(order)}>Print</MenuItem>
</Menu>`,
      },
    },
    {
      id: "grouped",
      title: { tr: "Gruplama", en: "Grouping" },
      body: { tr: "`MenuSeparator` yakın anlamlı eylemleri ayırır. İkon kullanacaksanız bütün öğelere verin ya da hiçbirine vermeyin; karışık kullanımda etiketler aynı hizada durmaz.", en: "`MenuSeparator` splits related actions into groups. Give icons to every item in a group or to none, because mixed use breaks the label alignment." },
      example: {
        Demo: Grouped,
        code: `<Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>Invoice</Button>}>
  <MenuItem icon={<IconSend size={15} />}>Send by email</MenuItem>
  <MenuItem icon={<IconPrinter size={15} />}>Print</MenuItem>
  <MenuSeparator />
  <MenuItem>Download PDF</MenuItem>
  <MenuItem>Download e-archive copy</MenuItem>
</Menu>`,
      },
    },
    {
      id: "groups",
      title: { tr: "Başlıklı gruplar", en: "Labelled groups" },
      body: { tr: "`MenuGroup` öğeleri başlık altında toplar ve yardımcı teknolojiye grup olarak duyurur. Aynı adlı öğeler farklı bağlamlarda durduğunda başlık ikisini ayırır. Başlık seçilemez, ok tuşları onu atlar.", en: "`MenuGroup` gathers items under a heading and announces them to assistive technology as a group. When items share a name in different contexts, the heading tells them apart. The heading cannot be chosen and the arrow keys skip it." },
      example: {
        Demo: Groups,
        code: `<Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>Export</Button>}>
  <MenuGroup label="This page">
    <MenuItem>Excel (.xlsx)</MenuItem>
    <MenuItem>CSV</MenuItem>
  </MenuGroup>
  <MenuSeparator />
  <MenuGroup label="All records">
    <MenuItem>Excel (.xlsx)</MenuItem>
    <MenuItem>PDF</MenuItem>
  </MenuGroup>
</Menu>`,
      },
    },
    {
      id: "links",
      title: { tr: "Bağlantı öğeleri", en: "Link items" },
      body: { tr: "`href` verilen `MenuItem` gerçek bir `<a>` olur: yeni sekmede açılabilir, adresi kopyalanabilir. Seçilince menü kapanır. Aynı listede komutlarla birlikte durabilir. `disabled` verilirse bağlantı yerine kapalı bir öğe çizilir.", en: "A `MenuItem` with `href` is a real `<a>`: it opens in a new tab and its address can be copied. Choosing it closes the menu. It can sit beside commands in the same list. With `disabled` it renders a closed item instead of a link." },
      example: {
        Demo: Links,
        code: `<Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>SP-1040 shortcuts</Button>}>
  <MenuItem icon={<IconListDetails size={15} />} href="/orders">Go to the order list</MenuItem>
  <MenuItem icon={<IconFileInvoice size={15} />} href="/reports/invoices">Go to the invoice report</MenuItem>
</Menu>`,
      },
    },
    {
      id: "submenu",
      title: { tr: "Alt menü", en: "Submenu" },
      body: { tr: "`SubMenu` uzun seçenekleri ikinci bir düzeye alır; `label` öğenin adı, `children` alt listedir. Sağ kenardaki ok alt menüyü gösterir. Alt menü üzerine gelince ya da sağ ok tuşuyla açılır, sol ok ile kapanır. Bir öğe seçilince tüm menü kapanır. `disabled` alt menüyü kapatır.", en: "`SubMenu` moves long choices to a second level; `label` names the item and `children` holds the list. The arrow on the right edge marks it. A submenu opens on hover or with the right arrow key and closes with the left arrow key. Choosing an item closes the whole menu. `disabled` turns the submenu off." },
      example: {
        Demo: Nested,
        code: `<Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>Order actions</Button>}>
  <MenuItem icon={<IconPencil size={15} />}>Edit</MenuItem>
  <SubMenu icon={<IconSend size={15} />} label="Assign owner">
    <MenuItem onClick={() => assign("Ada Yılmaz")}>Ada Yılmaz</MenuItem>
    <MenuItem onClick={() => assign("Can Demir")}>Can Demir</MenuItem>
  </SubMenu>
  <SubMenu disabled icon={<IconTruckDelivery size={15} />} label="Move to shipment">
    <MenuItem>Today</MenuItem>
  </SubMenu>
</Menu>`,
      },
    },
    {
      id: "side",
      title: { tr: "Yön", en: "Side" },
      body: { tr: "`side` menünün tetikleyicinin hangi yanında açılacağını belirler; varsayılan `bottom`. Sayfanın altındaki bir araç çubuğunda `top`, dar bir kenar sütununda `right` işe yarar. Yer kalmazsa Base UI menüyü karşı yana alır.", en: "`side` sets which side of the trigger the menu opens on, with `bottom` as the default. `top` helps in a toolbar at the bottom of the page and `right` in a narrow side column. Base UI flips the menu when there is no room." },
      example: {
        Demo: Side,
        code: `<Menu side="top" align="start" trigger={<Button>top</Button>}>{items}</Menu>
<Menu side="right" align="start" trigger={<Button>right</Button>}>{items}</Menu>
<Menu side="bottom" align="start" trigger={<Button>bottom</Button>}>{items}</Menu>
<Menu side="left" align="start" trigger={<Button>left</Button>}>{items}</Menu>`,
      },
    },
    {
      id: "disabled",
      title: { tr: "Kapalı öğeler", en: "Disabled items" },
      body: { tr: "Eylem bu kayıt için geçerli değilse öğeyi kaldırmak yerine `disabled` yapın; menünün düzeni kayıttan kayda değişmez. Nedeni menünün dışında anlatın, çünkü öğenin kendisi açıklama taşımaz.", en: "When an action does not apply to this record, set `disabled` instead of removing the item, so the menu keeps the same shape across records. Explain why outside the menu, since the item itself carries no hint." },
      example: {
        Demo: Disabled,
        code: `<Menu trigger={<Button iconEnd={<IconChevronDown size={15} />}>Cancelled order</Button>}>
  <MenuItem>Open details</MenuItem>
  <MenuItem disabled>Create invoice</MenuItem>
  <MenuItem disabled>Start shipment</MenuItem>
</Menu>`,
      },
    },
    {
      id: "align",
      title: { tr: "Hizalama", en: "Alignment" },
      body: { tr: "`align` menünün tetikleyiciye göre yatay hizasını belirler. Varsayılan `end`, sağ kenardaki satır eylemlerinde menüyü ekran içinde tutar. Yer kalmazsa Base UI konumu kendisi düzeltir.", en: "`align` sets the horizontal alignment against the trigger. The default `end` keeps row actions on the right edge inside the screen. Base UI corrects the position when space runs out." },
      example: {
        Demo: Alignment,
        code: `<Menu align="start" trigger={<Button>start</Button>}>{items}</Menu>
<Menu align="center" trigger={<Button>center</Button>}>{items}</Menu>
<Menu align="end" trigger={<Button>end</Button>}>{items}</Menu>`,
      },
    },
    {
      id: "destructive",
      title: { tr: "Yıkıcı öğe", en: "Destructive item" },
      body: { tr: "`danger` yalnız rengi değiştirir, güvenlik sağlamaz. Geri alınamayan işlemi `onClick` içinde `useConfirm` ile doğrulatın ve menünün en altına, bir ayraçtan sonra koyun.", en: "`danger` changes only the colour and adds no safety. Confirm irreversible work with `useConfirm` inside `onClick`, and place the item last, after a separator." },
      example: {
        Demo: Destructive,
        code: `const confirm = useConfirm();

const remove = async () => {
  const ok = await confirm({
    danger: true,
    message: "SP-1040 and its shipment plan will be deleted. This cannot be undone.",
    confirmLabel: "Delete order",
  });
  if (ok) await deleteOrder("SP-1040");
};

<Menu trigger={<IconButton label="Order actions"><IconDots size={16} /></IconButton>}>
  <MenuItem>Edit</MenuItem>
  <MenuSeparator />
  <MenuItem danger icon={<IconTrash size={15} />} onClick={remove}>Delete order</MenuItem>
</Menu>`,
      },
    },
  ],
  a11y: [
    { tr: "Tetikleyici `aria-haspopup=\"menu\"` alır, öğeler `role=\"menuitem\"` ile duyurulur.", en: "The trigger gets `aria-haspopup=\"menu\"` and items are announced with `role=\"menuitem\"`." },
    { tr: "Yalnız ikonlu tetikleyicide `IconButton` kullanın; zorunlu `label` erişilebilir adı sağlar.", en: "Use `IconButton` for icon-only triggers; its required `label` supplies the accessible name." },
    { tr: "Kapalı öğeler `aria-disabled` taşır ve ok tuşlarıyla atlanmaz, böylece ekran okuyucu kullanıcısı da o eylemin var olduğunu öğrenir.", en: "Disabled items carry `aria-disabled` and stay reachable with the arrow keys, so screen reader users also learn the action exists." },
    { tr: "Menü kapanınca odak tetikleyiciye döner.", en: "Focus returns to the trigger when the menu closes." },
    { tr: "`href` verilen öğe gerçek `<a>` çizer, rolü `menuitem` kalır; ekran okuyucu onu menü öğesi olarak duyurur. `MenuGroup` grup rolü taşır ve başlığıyla adlandırılır.", en: "An item with `href` renders a real `<a>` and keeps the `menuitem` role, so a screen reader announces it as a menu item. `MenuGroup` carries the group role and is named by its heading." },
  ],
  keyboard: [
    ["Enter", { tr: "Menüyü açar, açıkken vurgulu öğeyi çalıştırır", en: "Opens the menu, or runs the highlighted item when open" }],
    ["Space", { tr: "Menüyü açar, açıkken vurgulu öğeyi çalıştırır", en: "Opens the menu, or runs the highlighted item when open" }],
    ["ArrowDown", { tr: "Menüyü açar, açıkken sonraki öğeye geçer", en: "Opens the menu, or moves to the next item when open" }],
    ["ArrowUp", { tr: "Menüyü açar, açıkken önceki öğeye geçer", en: "Opens the menu, or moves to the previous item when open" }],
    ["ArrowRight", { tr: "`SubMenu` üzerindeyken alt menüyü açar", en: "Opens the submenu while on a `SubMenu`" }],
    ["ArrowLeft", { tr: "Alt menüyü kapatır, odağı üst menüye verir", en: "Closes the submenu and returns focus to the parent menu" }],
    ["Home", { tr: "İlk öğeye gider", en: "Moves to the first item" }],
    ["End", { tr: "Son öğeye gider", en: "Moves to the last item" }],
    ["Esc", { tr: "Menüyü kapatır, odağı tetikleyiciye verir", en: "Closes the menu and returns focus to the trigger" }],
    ["A-Z", { tr: "Yazılan harfle başlayan öğeye gider", en: "Moves to the item starting with the typed letter" }],
  ],
  api: [
    {
      name: "Menu",
      props: [
        { name: "trigger", type: "ReactElement", required: true, description: { tr: "Menüyü açan öğe, genelde `Button` ya da `IconButton`. Ref ve olayları iletmelidir", en: "The element that opens the menu, usually a `Button` or `IconButton`. It must forward its ref and events" } },
        { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: { tr: "Tetikleyicinin hangi yanında açılacağı", en: "The side of the trigger it opens on" } },
        { name: "align", type: '"start" | "center" | "end"', default: '"end"', description: { tr: "Tetikleyiciye göre hiza", en: "Alignment against the trigger" } },
        { name: "children", type: "ReactNode", required: true, description: { tr: "`MenuItem`, `MenuGroup`, `SubMenu` ve `MenuSeparator` öğeleri", en: "`MenuItem`, `MenuGroup`, `SubMenu` and `MenuSeparator` elements" } },
      ],
    },
    {
      name: "MenuItem",
      props: [
        { name: "icon", type: "ReactNode", description: { tr: "Etiketten önce gösterilir", en: "Shown before the label" } },
        { name: "danger", type: "boolean", default: "false", description: { tr: "Öğeyi yıkıcı eylem rengiyle çizer", en: "Paints the item in the destructive colour" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Öğeyi kapatır; `onClick` çalışmaz. `href` ile birlikte etkisizdir", en: "Turns the item off; `onClick` does not run. It has no effect with `href`" } },
        { name: "href", type: "string", description: { tr: "Öğeyi gerçek bağlantı yapar", en: "Makes the item a real link" } },
        { name: "onClick", type: "() => void", description: { tr: "Öğe seçilince çalışır, ardından menü kapanır", en: "Runs when the item is chosen, then the menu closes" } },
        { name: "children", type: "ReactNode", required: true, description: { tr: "Öğe etiketi", en: "Item label" } },
      ],
    },
    {
      name: "MenuGroup",
      props: [
        { name: "label", type: "ReactNode", required: true, description: { tr: "Grubun başlığı", en: "The group heading" } },
        { name: "children", type: "ReactNode", required: true, description: { tr: "Gruptaki öğeler", en: "Items in the group" } },
      ],
    },
    {
      name: "SubMenu",
      props: [
        { name: "label", type: "ReactNode", required: true, description: { tr: "Alt menüyü açan öğenin adı", en: "Name of the item that opens the submenu" } },
        { name: "icon", type: "ReactNode", description: { tr: "Etiketten önce gösterilir", en: "Shown before the label" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Alt menüyü kapatır", en: "Turns the submenu off" } },
        { name: "children", type: "ReactNode", required: true, description: { tr: "Alt listedeki öğeler", en: "Items in the nested list" } },
      ],
    },
    {
      name: "MenuSeparator",
      description: { tr: "Öğe grupları arasına ince bir çizgi koyar. Özellik almaz.", en: "Draws a thin line between groups of items. Takes no props." },
      props: [],
    },
  ],
  styling: [
    { name: "data-danger", kind: "data", description: { tr: "`danger` öğede bulunur", en: "Present on a `danger` item" } },
    { name: "data-highlighted", kind: "data", description: { tr: "Fare ya da klavye ile vurgulu öğede bulunur", en: "Present on the item highlighted by pointer or keyboard" } },
    { name: "data-disabled", kind: "data", description: { tr: "Kapalı öğede bulunur", en: "Present on a disabled item" } },
    { name: "data-starting-style", kind: "data", description: { tr: "Açılış geçişinin ilk karesi", en: "First frame of the opening transition" } },
    { name: "data-ending-style", kind: "data", description: { tr: "Kapanış geçişi sırasında bulunur", en: "Present during the closing transition" } },
    { name: "--bt-border", kind: "var", description: { tr: "Menü kenarlığı ve ayraç rengi", en: "Menu border and separator colour" } },
    { name: "--bt-bg", kind: "var", description: { tr: "Vurgulu öğenin zemini", en: "Background of the highlighted item" } },
    { name: "--bt-danger", kind: "var", description: { tr: "`danger` öğenin metin rengi", en: "Text colour of a `danger` item" } },
  ],
  related: ["button", "icon-button", "confirm", "popover"],
});
