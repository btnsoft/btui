import { useState } from "react";
import { IconCheck, IconCopy, IconDots, IconDownload, IconEye, IconFileInvoice, IconPencil, IconPrinter, IconRefresh, IconSend, IconTrash, IconX } from "@tabler/icons-react";
import { Badge, Button, DataTable, IconButton, Menu, MenuItem, MenuSeparator, type Column } from "btui";
import { ORDERS, STATUS_LABEL, STATUS_TONE, money, type Order } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function RowActions() {
  const t = useText();
  return (
    <>
      <IconButton label={t({ tr: "Siparişi düzenle", en: "Edit order" })}><IconPencil size={16} /></IconButton>
      <IconButton label={t({ tr: "Faturayı indir", en: "Download invoice" })}><IconDownload size={16} /></IconButton>
      <IconButton label={t({ tr: "Yazdır", en: "Print" })}><IconPrinter size={16} /></IconButton>
      <IconButton tone="danger" label={t({ tr: "Siparişi sil", en: "Delete order" })}><IconTrash size={16} /></IconButton>
    </>
  );
}

function Danger() {
  const t = useText();
  return (
    <>
      <IconButton tone="danger" label={t({ tr: "Faturayı iptal et", en: "Void invoice" })}><IconTrash size={16} /></IconButton>
      <IconButton tone="danger" size="sm" label={t({ tr: "Satırı kaldır", en: "Remove the line" })}><IconX size={14} /></IconButton>
    </>
  );
}

function Busy() {
  const t = useText();
  const [busy, setBusy] = useState(false);
  const refresh = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 1500);
  };
  return <IconButton loading={busy} label={t({ tr: "Listeyi yenile", en: "Refresh the list" })} onClick={refresh}><IconRefresh size={16} /></IconButton>;
}

function Sizes() {
  const t = useText();
  return (
    <>
      <IconButton label={t({ tr: "Listeyi yenile", en: "Refresh the list" })}><IconRefresh size={16} /></IconButton>
      <IconButton size="sm" label={t({ tr: "Listeyi yenile", en: "Refresh the list" })}><IconRefresh size={14} /></IconButton>
      <IconButton solid label={t({ tr: "Listeyi yenile", en: "Refresh the list" })}><IconRefresh size={14} /></IconButton>
      <IconButton solid size="sm" label={t({ tr: "Listeyi yenile", en: "Refresh the list" })}><IconRefresh size={13} /></IconButton>
    </>
  );
}

function TableRows() {
  const t = useText();
  const lang = useLang();
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), sortable: false },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }), sortable: false },
    { key: "status", header: t({ tr: "Durum", en: "Status" }), sortable: false, cell: (r) => <Badge tone={STATUS_TONE[r.status]}>{t(STATUS_LABEL[r.status])}</Badge> },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), sortable: false, align: "right", cell: (r) => money(r.amount, lang) },
    { key: "actions", header: "", sortable: false, align: "right", cell: (r) => <IconButton solid label={`${t({ tr: "Aç", en: "Open" })}: ${r.no}`}><IconEye size={14} /></IconButton> },
  ];
  return <DataTable key={lang} controls={false} columns={columns} rows={ORDERS.slice(0, 3)} getRowKey={(r) => r.id} />;
}

function Overflow() {
  const t = useText();
  return (
    <Menu trigger={<IconButton label={t({ tr: "Fatura işlemleri", en: "Invoice actions" })}><IconDots size={16} /></IconButton>}>
      <MenuItem icon={<IconFileInvoice size={15} />}>{t({ tr: "Faturayı görüntüle", en: "View invoice" })}</MenuItem>
      <MenuItem icon={<IconSend size={15} />}>{t({ tr: "Müşteriye gönder", en: "Send to customer" })}</MenuItem>
      <MenuSeparator />
      <MenuItem icon={<IconTrash size={15} />} danger>{t({ tr: "Faturayı iptal et", en: "Void invoice" })}</MenuItem>
    </Menu>
  );
}

function CopyNumber() {
  const t = useText();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <>
      <code>SP-1040</code>
      <IconButton size="sm" label={copied ? t({ tr: "Kopyalandı", en: "Copied" }) : t({ tr: "Sipariş numarasını kopyala", en: "Copy order number" })} onClick={copy}>
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </IconButton>
    </>
  );
}

function Disabled() {
  const t = useText();
  return (
    <>
      <IconButton disabled label={t({ tr: "Onaylı fatura silinemez", en: "An approved invoice cannot be deleted" })}><IconTrash size={16} /></IconButton>
      <IconButton disabled focusableWhenDisabled label={t({ tr: "Onaylı fatura düzenlenemez", en: "An approved invoice cannot be edited" })}><IconPencil size={16} /></IconButton>
    </>
  );
}

function AsLink() {
  const t = useText();
  return (
    <IconButton render={<a href="#/en/data-table" />} nativeButton={false} label={t({ tr: "Sipariş listesini aç", en: "Open the order list" })}>
      <IconEye size={16} />
    </IconButton>
  );
}

function Dismiss() {
  const t = useText();
  const [open, setOpen] = useState(true);
  if (!open) return <Button size="sm" onClick={() => setOpen(true)}>{t({ tr: "Geri getir", en: "Bring it back" })}</Button>;
  return (
    <>
      <span>{t({ tr: "3 fatura onay bekliyor", en: "3 invoices await approval" })}</span>
      <IconButton size="sm" label={t({ tr: "Uyarıyı kapat", en: "Dismiss the notice" })} onClick={() => setOpen(false)}><IconX size={14} /></IconButton>
    </>
  );
}

export default definePage({
  summary: { tr: "Yalnız ikon taşıyan düğme. Tablo satırları ve araç çubukları gibi yerin dar olduğu ama anlamın açık olduğu yerlerde tekrar eden eylemleri sessizce sunar.", en: "A button that carries only an icon. It keeps repeated actions quiet where space is tight and the meaning is clear, such as table rows and toolbars." },
  imports: 'import { IconButton } from "btui";',
  base: "button",
  hero: {
    Demo: RowActions,
    code: `<IconButton label="Edit order"><IconPencil size={16} /></IconButton>
<IconButton label="Download invoice"><IconDownload size={16} /></IconButton>
<IconButton label="Print"><IconPrinter size={16} /></IconButton>
<IconButton tone="danger" label="Delete order"><IconTrash size={16} /></IconButton>`,
  },
  use: {
    do: [
      { tr: "Her satırda tekrar eden eylemler: düzenle, indir, aç", en: "Actions repeated on every row: edit, download, open" },
      { tr: "Herkesin tanıdığı ikonlar: yazdır, sil, kapat, yenile", en: "Icons everyone recognises: print, delete, close, refresh" },
      { tr: "`Menu` tetikleyicisi olarak satır sonundaki üç nokta", en: "The three dots at the end of a row, as a `Menu` trigger" },
    ],
    dont: [
      { tr: "Ekranın ana eylemi; bir etiket taşıması gerekir, `Button` kullanın", en: "The main action of a screen; it needs a visible label, so use `Button`" },
      { tr: "Anlamı tahmin gerektiren ikonlar; \"Mutabakat başlat\" gibi bir iş ikonla anlatılamaz", en: "Icons that need guessing; a task like \"Start reconciliation\" cannot be told with a picture" },
      { tr: "`ButtonGroup` içinde; grup yalnız `Button` çocuklarını birleştirir", en: "Inside a `ButtonGroup`; the group only joins `Button` children" },
    ],
  },
  anatomy: `<IconButton label="Accessible name" size="md" tone="default" solid={false} loading={false}>
  <Icon size={16} />
</IconButton>`,
  examples: [
    {
      id: "sizes",
      title: { tr: "Boyut ve dolgu", en: "Size and fill" },
      body: { tr: "`md` 32px, `sm` 26px yer kaplar. `solid` düğmeyi dolgulu gösterir ve `size` değerine uyar: `md` ile 28px, `sm` ile 24px. İkonu da orantılı seçin: `md` için 16, `sm` ve `solid` için 14, küçük `solid` için 13.", en: "`md` takes 32px and `sm` takes 26px. `solid` fills the button and follows `size`: 28px with `md` and 24px with `sm`. Scale the icon too: 16 for `md`, 14 for `sm` and `solid`, and 13 for a small `solid`." },
      example: { Demo: Sizes, code: `<IconButton label="Refresh the list"><IconRefresh size={16} /></IconButton>\n<IconButton size="sm" label="Refresh the list"><IconRefresh size={14} /></IconButton>\n<IconButton solid label="Refresh the list"><IconRefresh size={14} /></IconButton>\n<IconButton solid size="sm" label="Refresh the list"><IconRefresh size={13} /></IconButton>` },
    },
    {
      id: "tone",
      title: { tr: "Yıkıcı ton", en: "Destructive tone" },
      body: { tr: "`tone=\"danger\"` ikonu ve üzerine gelindiğindeki zemini kırmızı yapar. Silme ve iptal gibi eylemlerde kullanın. Ton yalnız görseldir; anlamı `label` söyler, geri alınamayan işlemi `useConfirm` ile doğrulatın.", en: "`tone=\"danger\"` turns the icon and the hover background red. Use it for actions such as delete and void. The tone is visual only: `label` carries the meaning, and irreversible work needs `useConfirm`." },
      example: { Demo: Danger, code: `<IconButton tone="danger" label="Void invoice"><IconTrash size={16} /></IconButton>\n<IconButton tone="danger" size="sm" label="Remove the line"><IconX size={14} /></IconButton>` },
    },
    {
      id: "loading",
      title: { tr: "Yükleniyor", en: "Loading" },
      body: { tr: "`loading` ikonun yerine dönen gösterge çizer, tıklamayı engeller ve odağı düğmede tutar. Boyut değişmez, yanındaki öğeler oynamaz. Düğmeye basıp deneyin.", en: "`loading` swaps the icon for a spinner, blocks clicks and keeps focus on the button. The size does not change, so nothing beside it moves. Press it to try." },
      example: {
        Demo: Busy,
        code: `const [busy, setBusy] = useState(false);

<IconButton loading={busy} label="Refresh the list" onClick={refresh}><IconRefresh size={16} /></IconButton>`,
      },
    },
    {
      id: "table-row",
      title: { tr: "Tablo satırında", en: "In a table row" },
      body: { tr: "Satırın tek eylemi varsa `solid` onu görünür kılar. Etikete kayıt numarasını yazın; ekran okuyucu kullanıcısı on tane \"Aç\" düğmesini ancak böyle ayırt eder.", en: "When a row has a single action, `solid` makes it visible. Put the record number in the label, because that is the only way a screen reader user can tell ten \"Open\" buttons apart." },
      example: {
        Demo: TableRows,
        block: true,
        code: `{
  key: "actions",
  header: "",
  align: "right",
  cell: (row) => <IconButton solid label={\`Open: \${row.no}\`}><IconEye size={14} /></IconButton>,
}`,
      },
    },
    {
      id: "menu-trigger",
      title: { tr: "Menü tetikleyicisi", en: "Menu trigger" },
      body: { tr: "Üç eylemden fazlası satırı kalabalıklaştırır. Geri kalanını `Menu` içine alın, `IconButton` tetikleyici olur. Düğmeye basıp menüyü açın.", en: "More than three actions crowd a row. Move the rest into a `Menu` and let `IconButton` be the trigger. Press it to open the menu." },
      example: {
        Demo: Overflow,
        code: `<Menu trigger={<IconButton label="Invoice actions"><IconDots size={16} /></IconButton>}>
  <MenuItem icon={<IconFileInvoice size={15} />}>View invoice</MenuItem>
  <MenuItem icon={<IconSend size={15} />}>Send to customer</MenuItem>
  <MenuSeparator />
  <MenuItem icon={<IconTrash size={15} />} danger>Void invoice</MenuItem>
</Menu>`,
      },
    },
    {
      id: "feedback",
      title: { tr: "Anlık geri bildirim", en: "Instant feedback" },
      body: { tr: "`label` değiştiğinde hem ekran okuyucunun okuduğu ad hem de fareyle üzerine gelince çıkan başlık değişir. Kopyalama gibi küçük eylemlerde ikonu ve etiketi birlikte değiştirin.", en: "Changing `label` updates both the name a screen reader announces and the title shown on hover. For small actions such as copying, swap the icon and the label together." },
      example: {
        Demo: CopyNumber,
        code: `const [copied, setCopied] = useState(false);

<IconButton size="sm" label={copied ? "Copied" : "Copy order number"} onClick={copy}>
  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
</IconButton>`,
      },
    },
    {
      id: "dismiss",
      title: { tr: "Kapatma düğmesi", en: "Dismiss button" },
      body: { tr: "Bir uyarıyı kapatmak için `size=\"sm\"` yeterlidir. Etiket neyin kapandığını söylesin: \"Kapat\" yerine \"Uyarıyı kapat\".", en: "`size=\"sm\"` is enough to dismiss a notice. Let the label say what closes: \"Dismiss the notice\" beats \"Close\"." },
      example: { Demo: Dismiss, code: `<span>3 invoices await approval</span>\n<IconButton size="sm" label="Dismiss the notice" onClick={dismiss}><IconX size={14} /></IconButton>` },
    },
    {
      id: "disabled",
      title: { tr: "Kapalı", en: "Disabled" },
      body: { tr: "`disabled` düğmeyi odak sırasından çıkarır, bu yüzden nedeni klavye kullanıcısına ulaşmaz. Nedeni `label` içinde taşıyacaksanız `focusableWhenDisabled` ekleyin; ikinci düğmeye sekme tuşuyla gelinebilir.", en: "`disabled` removes the button from the tab order, so the reason never reaches keyboard users. If `label` carries the reason, add `focusableWhenDisabled`; the second button can be reached with Tab." },
      example: { Demo: Disabled, code: `<IconButton disabled label="An approved invoice cannot be deleted"><IconTrash size={16} /></IconButton>\n<IconButton disabled focusableWhenDisabled label="An approved invoice cannot be edited"><IconPencil size={16} /></IconButton>` },
    },
    {
      id: "as-link",
      title: { tr: "Bağlantı olarak", en: "As a link" },
      body: { tr: "Eylem bir sayfaya götürüyorsa `render` ile bağlantı çizin. Yerel düğme kalmadığı için `nativeButton={false}` gerekir.", en: "When the action leads to a page, draw a link with `render`. It is no longer a native button, so set `nativeButton={false}`." },
      example: { Demo: AsLink, code: `<IconButton render={<a href="/orders" />} nativeButton={false} label="Open the order list">\n  <IconEye size={16} />\n</IconButton>` },
    },
  ],
  a11y: [
    { tr: "`label` zorunludur ve hem `aria-label` hem `title` olarak yazılır; ikon tek başına yardımcı teknolojiye bir şey söylemez.", en: "`label` is required and is written as both `aria-label` and `title`, because an icon alone tells assistive technology nothing." },
    { tr: "Etiket eylemi ve nesnesini söylesin: \"Sil\" yerine \"SP-1040 siparişini sil\".", en: "Let the label name the action and its object: \"Delete order SP-1040\" beats \"Delete\"." },
    { tr: "`loading` sırasında `aria-busy` eklenir ve düğme odakta kalır; odak sayfanın başına düşmez.", en: "`loading` adds `aria-busy` and keeps the button focusable, so focus never jumps to the top of the page." },
    { tr: "`title` dokunmatik ekranda görünmez. Anlamı kritik eylemlerde görünür etiketli `Button` tercih edin.", en: "`title` never shows on touch screens. Prefer a labelled `Button` for actions whose meaning is critical." },
  ],
  keyboard: [
    ["Tab", { tr: "Düğmeye odaklanır", en: "Moves focus to the button" }],
    ["Enter", { tr: "Eylemi çalıştırır", en: "Runs the action" }],
    ["Space", { tr: "Eylemi çalıştırır", en: "Runs the action" }],
  ],
  api: [
    {
      name: "IconButton",
      description: { tr: "Tüm yerel `button` öznitelikleri ve ref iletilir.", en: "All native `button` attributes and the ref are forwarded." },
      props: [
        { name: "label", type: "string", required: true, description: { tr: "Erişilebilir ad; `aria-label` ve `title` olarak yazılır", en: "Accessible name; written as `aria-label` and `title`" } },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: { tr: "Kare ölçü: 26, 32px", en: "Square size: 26, 32px" } },
        { name: "solid", type: "boolean", default: "false", description: { tr: "Dolgulu görünüm; satır eylemleri için. `size` değerine uyar: 28, 24px", en: "Filled look for row actions. Follows `size`: 28, 24px" } },
        { name: "tone", type: '"default" | "danger"', default: '"default"', description: { tr: "`danger` yıkıcı eylemi işaretler", en: "`danger` marks a destructive action" } },
        { name: "loading", type: "boolean", default: "false", description: { tr: "Dönen gösterge çizer, tıklamayı engeller, odağı korur", en: "Shows a spinner, blocks clicks, keeps focus" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Eylemi kapatır", en: "Turns the action off" } },
        { name: "focusableWhenDisabled", type: "boolean", default: "false", description: { tr: "Kapalıyken de odak alabilir", en: "Stays focusable while disabled" } },
        { name: "render", type: "ReactElement", description: { tr: "Başka bir öğe olarak çizer", en: "Renders as another element" } },
        { name: "nativeButton", type: "boolean", default: "true", description: { tr: "`render` yerel düğme değilse `false` verin", en: "Set to `false` when `render` is not a native button" } },
        { name: "className", type: "string", description: { tr: "Düğmeye eklenen sınıf", en: "Class added to the button" } },
      ],
    },
  ],
  styling: [
    { name: "data-size", kind: "data", description: { tr: "Seçili boyut", en: "The current size" } },
    { name: "data-solid", kind: "data", description: { tr: "`solid` açıkken bulunur", en: "Present when `solid` is on" } },
    { name: "data-tone", kind: "data", description: { tr: "Seçili ton", en: "The current tone" } },
    { name: "data-loading", kind: "data", description: { tr: "Yükleme sürerken bulunur", en: "Present while loading" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "`solid` zemini", en: "`solid` background" } },
    { name: "--bt-danger", kind: "var", description: { tr: "`danger` ikon rengi", en: "`danger` icon colour" } },
    { name: "--bt-bg", kind: "var", description: { tr: "Fareyle üzerine gelindiğinde zemin", en: "Hover background" } },
    { name: "--bt-radius-lg", kind: "var", description: { tr: "Köşe yarıçapı", en: "Corner radius" } },
  ],
  related: ["button", "button-group", "menu", "tooltip"],
});
