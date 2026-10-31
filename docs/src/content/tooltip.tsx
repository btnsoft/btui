import { IconDownload, IconPrinter, IconRefresh, IconSend } from "@tabler/icons-react";
import { Button, IconButton, Tooltip } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Toolbar() {
  const t = useText();
  const items = [
    { Icon: IconSend, label: t({ tr: "Müşteriye gönder", en: "Send to customer" }) },
    { Icon: IconPrinter, label: t({ tr: "Faturayı yazdır", en: "Print invoice" }) },
    { Icon: IconDownload, label: t({ tr: "PDF indir", en: "Download PDF" }) },
    { Icon: IconRefresh, label: t({ tr: "Kuru güncelle", en: "Refresh exchange rate" }) },
  ];
  return (
    <>
      {items.map(({ Icon, label }) => (
        <Tooltip key={label} content={label}>
          <IconButton label={label} title={undefined}><Icon size={16} /></IconButton>
        </Tooltip>
      ))}
    </>
  );
}

function Sides() {
  const t = useText();
  const text = t({ tr: "KDV dahil tutar", en: "Amount including VAT" });
  return (
    <>
      <Tooltip side="top" content={text}><Button>top</Button></Tooltip>
      <Tooltip side="right" content={text}><Button>right</Button></Tooltip>
      <Tooltip side="bottom" content={text}><Button>bottom</Button></Tooltip>
      <Tooltip side="left" content={text}><Button>left</Button></Tooltip>
    </>
  );
}

function WithIconButton() {
  const t = useText();
  const label = t({ tr: "Faturayı yazdır", en: "Print invoice" });
  return (
    <Tooltip content={label}>
      <IconButton label={label} title={undefined}><IconPrinter size={16} /></IconButton>
    </Tooltip>
  );
}

function Disabled() {
  const t = useText();
  return (
    <Tooltip content={t({ tr: "Önce vergi numarasını tamamlayın", en: "Complete the tax number first" })}>
      <Button variant="primary" disabled focusableWhenDisabled>{t({ tr: "Fatura kes", en: "Create invoice" })}</Button>
    </Tooltip>
  );
}

function Truncated() {
  const t = useText();
  const name = t({ tr: "Kuzey Lojistik Taşımacılık ve Dış Ticaret Anonim Şirketi", en: "Kuzey Lojistik Transport and Foreign Trade Incorporated" });
  return (
    <Tooltip content={name}>
      <span tabIndex={0} style={{ display: "block", width: 180, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{name}</span>
    </Tooltip>
  );
}

export default definePage({
  summary: { tr: "Bir öğenin üzerine gelince ya da odaklanınca kısa bir açıklama gösterir. En çok yalnız ikonlu düğmelerin ne yaptığını söylemek için kullanılır.", en: "Shows a short explanation when an element is hovered or focused. Its main job is to say what icon-only buttons do." },
  imports: 'import { Tooltip } from "btui";',
  base: "tooltip",
  hero: {
    Demo: Toolbar,
    code: `<Tooltip content="Send to customer">
  <IconButton label="Send to customer" title={undefined}><IconSend size={16} /></IconButton>
</Tooltip>
<Tooltip content="Print invoice">
  <IconButton label="Print invoice" title={undefined}><IconPrinter size={16} /></IconButton>
</Tooltip>`,
  },
  use: {
    do: [
      { tr: "Yalnız ikonlu düğmelerin adı", en: "The name of icon-only buttons" },
      { tr: "Kesilen uzun metinlerin tamamı: firma adı, adres", en: "The full text of truncated values: a company name, an address" },
      { tr: "Bir eylemin neden kapalı olduğu", en: "The reason an action is disabled" },
    ],
    dont: [
      { tr: "Mutlaka okunması gereken bilgi; dokunmatik ekranda açılmaz, sayfaya yazın", en: "Information people must read; it does not open on touch screens, so put it on the page" },
      { tr: "Tıklanabilir içerik; bağlantı ya da düğme için `Popover` kullanın", en: "Interactive content; use `Popover` for links or buttons" },
      { tr: "Görünür etiketi tekrar etmek; aynı metni iki kez göstermiş olursunuz", en: "Repeating a visible label; it shows the same text twice" },
    ],
  },
  anatomy: `<Tooltip content="Text" side="top">
  <Button />
</Tooltip>`,
  examples: [
    {
      id: "side",
      title: { tr: "Yön", en: "Side" },
      body: { tr: "`side` varsayılan olarak `top` değerindedir. Araç çubuğu ekranın üstündeyse `bottom` seçin. Yer kalmazsa Base UI ipucunu karşı tarafa alır.", en: "`side` defaults to `top`. Choose `bottom` for a toolbar at the top of the screen. Base UI flips the hint when there is no room." },
      example: {
        Demo: Sides,
        code: `<Tooltip side="top" content="Amount including VAT"><Button>top</Button></Tooltip>
<Tooltip side="right" content="Amount including VAT"><Button>right</Button></Tooltip>
<Tooltip side="bottom" content="Amount including VAT"><Button>bottom</Button></Tooltip>
<Tooltip side="left" content="Amount including VAT"><Button>left</Button></Tooltip>`,
      },
    },
    {
      id: "icon-button",
      title: { tr: "IconButton ile", en: "With IconButton" },
      body: { tr: "`IconButton`, `label` değerini tarayıcının yerel `title` ipucu olarak da yazar. `Tooltip` ile birlikte iki ipucu görünmesin diye `title={undefined}` verin. Erişilebilir ad `label` üzerinden gelmeye devam eder.", en: "`IconButton` also writes `label` to the browser's native `title` hint. Pass `title={undefined}` so two hints do not appear alongside `Tooltip`. The accessible name still comes from `label`." },
      example: {
        Demo: WithIconButton,
        code: `<Tooltip content="Print invoice">
  <IconButton label="Print invoice" title={undefined}><IconPrinter size={16} /></IconButton>
</Tooltip>`,
      },
    },
    {
      id: "disabled",
      title: { tr: "Kapalı düğmede neden", en: "Reason on a disabled button" },
      body: { tr: "Yerel olarak kapalı bir düğme fare ve odak olaylarını almaz. `focusableWhenDisabled` düğmeyi odaklanabilir tutar, tıklamayı ise yine engeller; ipucu böylece çalışır.", en: "A natively disabled button receives no pointer or focus events. `focusableWhenDisabled` keeps it focusable while still blocking clicks, so the hint works." },
      example: {
        Demo: Disabled,
        code: `<Tooltip content="Complete the tax number first">
  <Button variant="primary" disabled focusableWhenDisabled>Create invoice</Button>
</Tooltip>`,
      },
    },
    {
      id: "truncated",
      title: { tr: "Kesilen metin", en: "Truncated text" },
      body: { tr: "Dar kolonlarda kesilen değerin tamamını gösterin. Metin normalde odak almaz, bu yüzden klavye kullanıcıları için `tabIndex={0}` ekleyin. `Tooltip` çocuğunun ref ve olayları iletmesi gerekir; yerel öğeler bunu zaten yapar.", en: "Show the full value when a narrow column cuts it off. Text does not take focus by default, so add `tabIndex={0}` for keyboard users. `Tooltip` needs a child that forwards its ref and events, which native elements already do." },
      example: {
        Demo: Truncated,
        code: `<Tooltip content={customer.legalName}>
  <span tabIndex={0} style={{ display: "block", width: 180, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
    {customer.legalName}
  </span>
</Tooltip>`,
      },
    },
  ],
  a11y: [
    { tr: "İpucu yalnız görseldir ve tetikleyiciye `aria-describedby` ile bağlanmaz. Ekran okuyucu onu okumaz, bu yüzden tetikleyicinin kendi adı olmalıdır.", en: "The hint is visual only and is not tied to the trigger with `aria-describedby`. Screen readers do not read it, so the trigger needs its own name." },
    { tr: "Yalnız ikonlu düğmede ad `IconButton` üzerindeki `label` ile gelir.", en: "On an icon-only button the name comes from the `label` of `IconButton`." },
    { tr: "İpucu klavye odağında da açılır, yalnız fare kullanıcılarına özel değildir.", en: "The hint also opens on keyboard focus, so it is not limited to mouse users." },
    { tr: "Dokunmatik ekranda ipucu açılmaz. Vazgeçilmez bilgiyi sayfada gösterin.", en: "The hint does not open on touch screens. Show essential information on the page." },
  ],
  keyboard: [
    ["Tab", { tr: "Tetikleyiciye odaklanır ve ipucunu açar", en: "Focuses the trigger and opens the hint" }],
    ["Esc", { tr: "İpucunu kapatır", en: "Closes the hint" }],
  ],
  api: [
    {
      name: "Tooltip",
      description: { tr: "Fare ile açılma gecikmesi 300 ms'dir ve `BtuiProvider` tarafından ayarlanır.", en: "The hover delay is 300 ms and is set by `BtuiProvider`." },
      props: [
        { name: "content", type: "ReactNode", required: true, description: { tr: "İpucu metni. En fazla 280px genişler", en: "Hint text. Grows to 280px at most" } },
        { name: "children", type: "ReactElement", required: true, description: { tr: "Tetikleyici. Tek öğe olmalı, ref ve olayları iletmelidir", en: "The trigger. It must be a single element that forwards its ref and events" } },
        { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"top"', description: { tr: "Açılma yönü", en: "Direction the hint opens in" } },
      ],
    },
  ],
  styling: [
    { name: "data-side", kind: "data", description: { tr: "İpucunun gerçekte açıldığı yön", en: "The side the hint actually opened on" } },
    { name: "data-starting-style", kind: "data", description: { tr: "Açılış geçişinin ilk karesi", en: "First frame of the opening transition" } },
    { name: "data-ending-style", kind: "data", description: { tr: "Kapanış geçişi sırasında bulunur", en: "Present during the closing transition" } },
    { name: "--bt-nav", kind: "var", description: { tr: "İpucu zemini", en: "Hint background" } },
    { name: "--bt-radius", kind: "var", description: { tr: "Köşe yarıçapı", en: "Corner radius" } },
    { name: "--bt-fast", kind: "var", description: { tr: "Geçiş süresi", en: "Transition duration" } },
  ],
  related: ["popover", "icon-button", "button", "menu"],
});
