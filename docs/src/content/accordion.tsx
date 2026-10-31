import { useState } from "react";
import { Accordion, Badge, Button, Switch, type AccordionItem } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function useFaq(): AccordionItem[] {
  const t = useText();
  return [
    {
      value: "due",
      title: t({ tr: "Fatura vadesi nasıl hesaplanır?", en: "How is an invoice due date calculated?" }),
      content: t({ tr: "Vade, fatura tarihinden başlar ve müşteri kartındaki ödeme süresi kadar uzar. Mavi Yapı için bu süre 30 gündür.", en: "The due date starts from the invoice date and extends by the payment term on the customer card. For Mavi Yapı that term is 30 days." }),
    },
    {
      value: "cancel",
      title: t({ tr: "Onaylanmış bir sipariş iptal edilebilir mi?", en: "Can an approved order be cancelled?" }),
      content: t({ tr: "Sevkiyat başlamadıysa evet. Sevk edilmiş siparişlerde iade kaydı açmanız gerekir.", en: "Yes, if shipping has not started. For shipped orders, open a return record instead." }),
    },
    {
      value: "limit",
      title: t({ tr: "Onay sınırını kim değiştirebilir?", en: "Who can change the approval limit?" }),
      content: t({ tr: "Yalnız finans yöneticileri. Değişiklik bir sonraki siparişten itibaren geçerli olur.", en: "Finance managers only. The change applies from the next order." }),
    },
  ];
}

function Hero() {
  const items = useFaq();
  return <div className="d-stack-wide"><Accordion items={items} defaultValue={["due"]} /></div>;
}

function Multiple() {
  const t = useText();
  const [mail, setMail] = useState(true);
  const [reminder, setReminder] = useState(true);
  const [limit, setLimit] = useState(false);
  const [lock, setLock] = useState(false);
  const items: AccordionItem[] = [
    {
      value: "notifications",
      title: t({ tr: "Bildirimler", en: "Notifications" }),
      content: (
        <div style={{ display: "grid", gap: 10 }}>
          <Switch checked={mail} onChange={setMail} label={t({ tr: "Yeni siparişte e-posta gönder", en: "Email me on a new order" })} />
          <Switch checked={reminder} onChange={setReminder} label={t({ tr: "Vadesi yaklaşan faturaları hatırlat", en: "Remind me of invoices coming due" })} />
        </div>
      ),
    },
    {
      value: "approvals",
      title: t({ tr: "Onay kuralları", en: "Approval rules" }),
      content: (
        <div style={{ display: "grid", gap: 10 }}>
          <Switch checked={limit} onChange={setLimit} label={t({ tr: "50.000 TL üzerini onaya gönder", en: "Send orders above 50,000 TL for approval" })} />
          <Switch checked={lock} onChange={setLock} label={t({ tr: "Onaylanan faturayı kilitle", en: "Lock invoices once approved" })} />
        </div>
      ),
    },
  ];
  return <div className="d-stack-wide"><Accordion multiple items={items} defaultValue={["notifications", "approvals"]} /></div>;
}

function Controlled() {
  const t = useText();
  const items = useFaq();
  const [open, setOpen] = useState<string[]>(["due"]);
  return (
    <div className="d-stack-wide">
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button size="sm" onClick={() => setOpen(items.map((item) => item.value))}>{t({ tr: "Tümünü aç", en: "Open all" })}</Button>
        <Button size="sm" onClick={() => setOpen([])}>{t({ tr: "Tümünü kapat", en: "Close all" })}</Button>
        <small>{t({ tr: `${open.length} / ${items.length} açık`, en: `${open.length} of ${items.length} open` })}</small>
      </div>
      <Accordion multiple items={items} value={open} onChange={setOpen} />
    </div>
  );
}

function RichTitles() {
  const t = useText();
  const items: AccordionItem[] = [
    {
      value: "sp-1061",
      title: <span>SP-1061 <Badge tone="warn">{t({ tr: "Bekliyor", en: "Pending" })}</Badge></span>,
      content: t({ tr: "Kuzey Lojistik, 84.500 TL. Tutar onay sınırının üstünde olduğu için finans yöneticisi onayı gerekiyor.", en: "Kuzey Lojistik, 84,500 TL. The amount is above the approval limit, so a finance manager must approve it." }),
    },
    {
      value: "sp-1068",
      title: <span>SP-1068 <Badge tone="ok">{t({ tr: "Onaylandı", en: "Approved" })}</Badge></span>,
      content: t({ tr: "Çınar Gıda, 12.300 TL. Elif Kaya tarafından onaylandı.", en: "Çınar Gıda, 12,300 TL. Approved by Elif Kaya." }),
    },
  ];
  return <div className="d-stack-wide"><Accordion items={items} /></div>;
}

function Disabled() {
  const t = useText();
  const items: AccordionItem[] = [
    {
      value: "company",
      title: t({ tr: "Şirket bilgileri", en: "Company details" }),
      content: t({ tr: "Unvan, vergi dairesi ve vergi numarası fatura çıktısında görünür.", en: "The legal name, tax office and tax number appear on printed invoices." }),
    },
    {
      value: "bank",
      title: t({ tr: "Banka hesapları (yalnız finans yöneticileri)", en: "Bank accounts (finance managers only)" }),
      content: t({ tr: "Banka hesapları", en: "Bank accounts" }),
      disabled: true,
    },
  ];
  return <div className="d-stack-wide"><Accordion items={items} defaultValue={["company"]} /></div>;
}

export default definePage({
  summary: { tr: "Birbiriyle ilişkili içerikleri başlıklar altında toplar, kullanıcı yalnız ihtiyaç duyduğunu açar. Sık sorulan sorular ve uzun ayar sayfaları için uygundur.", en: "Stacks related content under headings, and people open only what they need. It suits frequently asked questions and long settings pages." },
  imports: 'import { Accordion, type AccordionItem } from "btui";',
  base: "accordion",
  hero: {
    Demo: Hero,
    block: true,
    code: `const items: AccordionItem[] = [
  {
    value: "due",
    title: "How is an invoice due date calculated?",
    content: "The due date starts from the invoice date and extends by the payment term on the customer card.",
  },
  {
    value: "cancel",
    title: "Can an approved order be cancelled?",
    content: "Yes, if shipping has not started. For shipped orders, open a return record instead.",
  },
  {
    value: "limit",
    title: "Who can change the approval limit?",
    content: "Finance managers only. The change applies from the next order.",
  },
];

<Accordion items={items} defaultValue={["due"]} />`,
  },
  use: {
    do: [
      { tr: "Destek ve yardım sayfalarında sık sorulan sorular", en: "Frequently asked questions on help and support pages" },
      { tr: "Bildirim, onay kuralı, vergi bilgisi gibi konulara ayrılan uzun ayar sayfaları", en: "Long settings pages split by topic, such as notifications, approval rules and tax details" },
      { tr: "Bir kaydın seyrek bakılan ayrıntıları; ilk görünüm kısa kalır", en: "Details of a record that are rarely needed, keeping the first view short" },
    ],
    dont: [
      { tr: "Herkesin görmesi gereken kritik bilgi; kapalı başlık altında gözden kaçar", en: "Critical information everyone must see; it gets missed under a closed heading" },
      { tr: "Tek bir bölüm; başlığı ve içeriği düz gösterin ya da `Card` kullanın", en: "A single section; show the heading and content plainly or use a `Card`" },
      { tr: "Yan yana görünümler arasında seçim; bunun için `Tabs` kullanın", en: "Choosing between parallel views; use `Tabs` for that" },
    ],
  },
  anatomy: `<Accordion
  multiple
  defaultValue={["a"]}
  items={[
    { value: "a", title: "Heading", content: <Panel /> },
    { value: "b", title: "Heading", content: <Panel />, disabled: true },
  ]}
/>`,
  examples: [
    {
      id: "single",
      title: { tr: "Tek panel", en: "Single panel" },
      body: { tr: "Varsayılan davranışta aynı anda bir panel açık kalır, yeni panel öncekini kapatır. Yukarıdaki örnek böyle çalışır. Tek panel olsa da `value` ve `defaultValue` her zaman dizidir: `[\"due\"]` gibi.", en: "By default one panel stays open and a new one closes the last. The example above works this way. Even with one panel, `value` and `defaultValue` are always arrays, as in `[\"due\"]`." },
      code: `<Accordion items={items} defaultValue={["due"]} />`,
    },
    {
      id: "multiple",
      title: { tr: "Birden çok panel", en: "Multiple panels" },
      body: { tr: "`multiple` ile paneller birbirinden bağımsız açılır. Ayar sayfalarında kullanıcı iki bölümü karşılaştırabilir. Kapanan panelin içeriği sayfadan kaldırılır, bu yüzden buradaki gibi anahtar değerlerini `Accordion` dışındaki durumda tutun; yoksa panel kapanınca değişiklik kaybolur.", en: "With `multiple`, panels open independently, so people can compare two sections of a settings page. A closed panel's content is removed from the page, so keep switch values in state outside `Accordion`, as here; otherwise changes are lost when the panel closes." },
      example: { Demo: Multiple, block: true, code: `const [mail, setMail] = useState(true);
const [reminder, setReminder] = useState(true);

<Accordion
  multiple
  defaultValue={["notifications", "approvals"]}
  items={[
    {
      value: "notifications",
      title: "Notifications",
      content: (
        <>
          <Switch checked={mail} onChange={setMail} label="Email me on a new order" />
          <Switch checked={reminder} onChange={setReminder} label="Remind me of invoices coming due" />
        </>
      ),
    },
    { value: "approvals", title: "Approval rules", content: <ApprovalRules /> },
  ]}
/>` },
    },
    {
      id: "controlled",
      title: { tr: "Dışarıdan denetim", en: "Controlled" },
      body: { tr: "`value` ve `onChange` ile açık panelleri siz tutarsınız. Tümünü aç ve kapat düğmeleri bu sayede yazılır. Düğmelere basıp sayacın değişmesini izleyin.", en: "With `value` and `onChange`, you hold the open panels. This is how open all and close all buttons are written. Press them and watch the counter change." },
      example: { Demo: Controlled, block: true, code: `const [open, setOpen] = useState<string[]>(["due"]);

<Button size="sm" onClick={() => setOpen(items.map((item) => item.value))}>Open all</Button>
<Button size="sm" onClick={() => setOpen([])}>Close all</Button>
<Accordion multiple items={items} value={open} onChange={setOpen} />` },
    },
    {
      id: "rich-titles",
      title: { tr: "Durumlu başlıklar", en: "Titles with status" },
      body: { tr: "`title` `ReactNode` alır. Onay kuyruğunda belge numarası ile durumu başlıkta gösterin ki kullanıcı açmadan karar verebilsin. Başlık tek çocuk olmalı; birden çok öğeyi `span` içinde toplayın, yoksa satırda iki yana dağılırlar.", en: "`title` takes a `ReactNode`. In an approval queue, show the document number and status in the heading so people can decide without opening it. Keep the title a single child; wrap several elements in a `span`, or they spread across the row." },
      example: { Demo: RichTitles, block: true, code: `<Accordion
  items={[
    {
      value: "sp-1061",
      title: <span>SP-1061 <Badge tone="warn">Pending</Badge></span>,
      content: "Kuzey Lojistik, 84,500 TL. A finance manager must approve it.",
    },
    {
      value: "sp-1068",
      title: <span>SP-1068 <Badge tone="ok">Approved</Badge></span>,
      content: "Çınar Gıda, 12,300 TL. Approved by Elif Kaya.",
    },
  ]}
/>` },
    },
    {
      id: "disabled",
      title: { tr: "Devre dışı öğe", en: "Disabled items" },
      body: { tr: "`disabled` öğenin açılmasını engeller ve düğme odak sırasından çıkar. Devre dışı öğe görünüşte diğerlerinden ayrılmadığı için nedenini başlıkta yazın.", en: "`disabled` stops the item from opening and takes the button out of the focus order. A disabled item looks the same as the others, so state the reason in its title." },
      example: { Demo: Disabled, block: true, code: `<Accordion
  defaultValue={["company"]}
  items={[
    { value: "company", title: "Company details", content: "The legal name, tax office and tax number appear on printed invoices." },
    { value: "bank", title: "Bank accounts (finance managers only)", content: "Bank accounts", disabled: true },
  ]}
/>` },
    },
  ],
  a11y: [
    { tr: "Her başlık `h3` içinde bir `button` olarak çizilir ve `aria-expanded` ile durumunu bildirir.", en: "Each heading is a `button` inside an `h3` and reports its state with `aria-expanded`." },
    { tr: "Açık panel `role=\"region\"` taşır ve `aria-labelledby` ile başlığına bağlanır.", en: "An open panel has `role=\"region\"` and is tied to its heading with `aria-labelledby`." },
    { tr: "Başlıklar arasında ok tuşlarıyla dolaşılmaz; `Tab` ile geçilir. Base UI bu davranışı güncel ARIA rehberine göre kaldırmıştır.", en: "Headings are not reached with arrow keys; use `Tab`. Base UI removed that behaviour to follow the updated ARIA guidance." },
    { tr: "Kapalı panelin içeriği sayfada bulunmaz, tarayıcının sayfa içi aramasıyla da bulunamaz.", en: "A closed panel's content is not on the page, so the browser's find-in-page cannot reach it." },
  ],
  keyboard: [
    ["Tab", { tr: "Sonraki başlığa ya da açık panelin içindeki öğeye geçer", en: "Moves to the next heading or to an element inside an open panel" }],
    ["Shift + Tab", { tr: "Önceki öğeye döner", en: "Moves to the previous element" }],
    ["Enter", { tr: "Odaktaki paneli açar ya da kapatır", en: "Opens or closes the focused panel" }],
    ["Space", { tr: "Odaktaki paneli açar ya da kapatır", en: "Opens or closes the focused panel" }],
  ],
  api: [
    {
      name: "Accordion",
      props: [
        { name: "items", type: "AccordionItem[]", required: true, description: { tr: "Bölümler", en: "The sections" } },
        { name: "value", type: "string[]", description: { tr: "Açık paneller; verilirse denetim sizdedir", en: "Open panels; passing it puts you in control" } },
        { name: "defaultValue", type: "string[]", description: { tr: "Denetimsiz kullanımda başlangıçta açık paneller", en: "Panels open at the start when uncontrolled" } },
        { name: "onChange", type: "(value: string[]) => void", description: { tr: "Açık paneller değişince çalışır", en: "Called when the open panels change" } },
        { name: "multiple", type: "boolean", default: "false", description: { tr: "Aynı anda birden çok panele izin verir", en: "Allows more than one open panel" } },
        { name: "className", type: "string", description: { tr: "Kök öğeye eklenir", en: "Added to the root element" } },
      ],
    },
    {
      name: "AccordionItem",
      props: [
        { name: "value", type: "string", required: true, description: { tr: "Bölümün kimliği", en: "Identifier of the section" } },
        { name: "title", type: "ReactNode", required: true, description: { tr: "Başlık", en: "Heading" } },
        { name: "content", type: "ReactNode", required: true, description: { tr: "Panel içeriği", en: "Panel content" } },
        { name: "disabled", type: "boolean", description: { tr: "Bölümün açılmasını engeller", en: "Stops the section from opening" } },
      ],
    },
  ],
  styling: [
    { name: "data-panel-open", kind: "data", description: { tr: "Paneli açık başlık düğmesinde bulunur", en: "Present on the heading button while its panel is open" } },
    { name: "data-disabled", kind: "data", description: { tr: "Devre dışı öğede bulunur; hazır stili yoktur, görünümü kendiniz verebilirsiniz", en: "Present on a disabled item; it has no built-in style, so you can provide your own" } },
    { name: "--accordion-panel-height", kind: "var", description: { tr: "Base UI tarafından ölçülen panel yüksekliği; açılma geçişini sürer", en: "Panel height measured by Base UI; drives the opening transition" } },
    { name: "--bt-line", kind: "var", description: { tr: "Bölümler arası çizgi", en: "Line between sections" } },
    { name: "--bt-hover", kind: "var", description: { tr: "Başlık üzerine gelindiğindeki zemin", en: "Heading background on hover" } },
    { name: "--bt-slow", kind: "var", description: { tr: "Açılma geçişinin süresi", en: "Duration of the opening transition" } },
  ],
  related: ["tabs", "card", "info-row", "switch"],
});
