import { useState } from "react";
import { IconChevronDown, IconInfoCircle } from "@tabler/icons-react";
import { Button, Field, IconButton, InfoRow, Popover, Progress, Select } from "btui";
import { CITIES, ORDERS, money } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function CreditSummary() {
  const t = useText();
  const lang = useLang();
  return (
    <Popover title={t({ tr: "Mavi Yapı kredi durumu", en: "Mavi Yapı credit status" })} trigger={<Button iconEnd={<IconChevronDown size={15} />}>{t({ tr: "Kredi durumu", en: "Credit status" })}</Button>}>
      <InfoRow label={t({ tr: "Limit", en: "Limit" })}>{money(250000, lang)}</InfoRow>
      <InfoRow label={t({ tr: "Açık bakiye", en: "Open balance" })}>{money(184500, lang)}</InfoRow>
      <InfoRow label={t({ tr: "Vade", en: "Payment term" })}>{t({ tr: "45 gün", en: "45 days" })}</InfoRow>
    </Popover>
  );
}

function Plain() {
  const t = useText();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {t({ tr: "Net vade", en: "Net term" })}
      <Popover trigger={<IconButton size="sm" label={t({ tr: "Net vade nedir?", en: "What is net term?" })}><IconInfoCircle size={15} /></IconButton>}>
        {t({ tr: "Fatura tarihinden ödeme gününe kadar geçen süredir. İskonto dönemi bu süreye dahil değildir.", en: "The time from the invoice date to the due date. The discount period is not included." })}
      </Popover>
    </span>
  );
}

function Sides() {
  const t = useText();
  const text = t({ tr: "Son güncelleme: bugün 09.40", en: "Last updated: today at 09:40" });
  return (
    <>
      <Popover side="top" trigger={<Button>top</Button>}>{text}</Popover>
      <Popover side="right" trigger={<Button>right</Button>}>{text}</Popover>
      <Popover side="bottom" trigger={<Button>bottom</Button>}>{text}</Popover>
      <Popover side="left" trigger={<Button>left</Button>}>{text}</Popover>
    </>
  );
}

function Aligns() {
  const t = useText();
  const text = t({ tr: "Bu sipariş Can Demir'in onayında.", en: "This order is with Can Demir for approval." });
  return (
    <>
      <Popover align="start" trigger={<Button>start</Button>}>{text}</Popover>
      <Popover align="center" trigger={<Button>center</Button>}>{text}</Popover>
      <Popover align="end" trigger={<Button>end</Button>}>{text}</Popover>
    </>
  );
}

function RichContent() {
  const t = useText();
  const lang = useLang();
  const order = ORDERS[2];
  return (
    <Popover title={order.customer} trigger={<Button variant="ghost">{order.no}</Button>}>
      <div style={{ display: "grid", gap: 10, minWidth: 240 }}>
        <span>{t({ tr: `${money(order.amount, lang)} tutarındaki sipariş hazırlanıyor.`, en: `The order of ${money(order.amount, lang)} is being prepared.` })}</span>
        <Progress value={64} label={t({ tr: "Toplama", en: "Picking" })} />
      </div>
    </Popover>
  );
}

function QuickFilter() {
  const t = useText();
  const [city, setCity] = useState("");
  return (
    <>
      <Popover title={t({ tr: "Hızlı filtre", en: "Quick filter" })} trigger={<Button>{t({ tr: "Şehre göre", en: "By city" })}</Button>}>
        <div style={{ minWidth: 240 }}>
          <Field label={t({ tr: "Teslimat şehri", en: "Delivery city" })}>
            <Select value={city} onChange={setCity} options={CITIES} block clearable />
          </Field>
        </div>
      </Popover>
      {city ? <code>{city}</code> : null}
    </>
  );
}

export default definePage({
  summary: { tr: "Bir öğeye bağlı küçük bir panel açar. Sayfadan kopmadan ek bilgi ya da birkaç kontrol gösterir, dışına tıklanınca kapanır.", en: "Opens a small panel attached to an element. It shows extra information or a few controls without leaving the page, and closes on an outside click." },
  imports: 'import { Popover } from "btui";',
  base: "popover",
  hero: {
    Demo: CreditSummary,
    code: `<Popover
  title="Mavi Yapı credit status"
  trigger={<Button iconEnd={<IconChevronDown size={15} />}>Credit status</Button>}
>
  <InfoRow label="Limit">₺250,000</InfoRow>
  <InfoRow label="Open balance">₺184,500</InfoRow>
  <InfoRow label="Payment term">45 days</InfoRow>
</Popover>`,
  },
  use: {
    do: [
      { tr: "Bir kaydın özet bilgisi: kredi durumu, sevkiyat aşaması", en: "A summary of a record: credit status, shipment stage" },
      { tr: "Bir alanın yanındaki uzun açıklama", en: "A longer explanation next to a field" },
      { tr: "Birkaç kontrollük hafif ayar: tek filtre, görünüm seçimi", en: "Light settings with a few controls: one filter, a view choice" },
    ],
    dont: [
      { tr: "Tek satırlık ipucu; `Tooltip` yeterlidir", en: "A one-line hint; `Tooltip` is enough" },
      { tr: "Eylem listesi; `Menu` klavye gezintisini hazır getirir", en: "A list of actions; `Menu` comes with keyboard navigation" },
      { tr: "Birden çok alanlı kayıt formları; odaklanılması gereken iş için `Modal` kullanın", en: "Record forms with several fields; use `Modal` for work that needs full attention" },
    ],
  },
  anatomy: `<Popover trigger={<Button />} title="Title" side="bottom" align="start">
  Content
</Popover>`,
  examples: [
    {
      id: "plain",
      title: { tr: "Başlıksız", en: "Without a title" },
      body: { tr: "`title` isteğe bağlıdır. Bir terimi açıklarken tek bir paragraf yeter. Tetikleyici yalnız ikonsa `IconButton` kullanın ve `label` içine soruyu yazın.", en: "`title` is optional. A single paragraph is enough to explain a term. If the trigger is icon-only, use `IconButton` and write the question in `label`." },
      example: {
        Demo: Plain,
        code: `<Popover trigger={<IconButton size="sm" label="What is net term?"><IconInfoCircle size={15} /></IconButton>}>
  The time from the invoice date to the due date.
</Popover>`,
      },
    },
    {
      id: "side",
      title: { tr: "Yön", en: "Side" },
      body: { tr: "`side` panelin hangi yönde açılacağını söyler, varsayılan `bottom` değeridir. Yer kalmazsa Base UI paneli karşı tarafa alır.", en: "`side` sets the direction the panel opens in, and defaults to `bottom`. Base UI flips the panel when there is no room." },
      example: {
        Demo: Sides,
        code: `<Popover side="top" trigger={<Button>top</Button>}>…</Popover>
<Popover side="right" trigger={<Button>right</Button>}>…</Popover>
<Popover side="bottom" trigger={<Button>bottom</Button>}>…</Popover>
<Popover side="left" trigger={<Button>left</Button>}>…</Popover>`,
      },
    },
    {
      id: "align",
      title: { tr: "Hizalama", en: "Alignment" },
      body: { tr: "`align` paneli tetikleyicinin başlangıcına, ortasına ya da sonuna hizalar. Varsayılan `start` değeridir; `Menu` ise `end` ile gelir.", en: "`align` lines the panel up with the start, centre or end of the trigger. The default is `start`, while `Menu` defaults to `end`." },
      example: {
        Demo: Aligns,
        code: `<Popover align="start" trigger={<Button>start</Button>}>…</Popover>
<Popover align="center" trigger={<Button>center</Button>}>…</Popover>
<Popover align="end" trigger={<Button>end</Button>}>…</Popover>`,
      },
    },
    {
      id: "rich",
      title: { tr: "Zengin içerik", en: "Rich content" },
      body: { tr: "`children` başka bileşenleri de alır. Panel en fazla 340px genişler, bu yüzden içeriği kısa tutun. Daha fazlası için `Drawer` kullanın.", en: "`children` accepts other components too. The panel grows to 340px at most, so keep the content short. Use `Drawer` for anything larger." },
      example: {
        Demo: RichContent,
        code: `<Popover title="Çınar Gıda" trigger={<Button variant="ghost">SP-1054</Button>}>
  <p>The order is being prepared.</p>
  <Progress value={64} label="Picking" />
</Popover>`,
      },
    },
    {
      id: "controls",
      title: { tr: "Kontrol içeren panel", en: "Panel with controls" },
      body: { tr: "Değeri anında uygulanan kontroller panelde iyi durur. Açık kapalı durumu bileşenin içindedir, kullanıcı `Esc` ile ya da dışarı tıklayarak kapatır. Bu yüzden onay düğmesi gerektiren akışlarda kullanmayın.", en: "Controls that apply at once work well in a panel. The open state lives inside the component, and the user closes it with `Esc` or an outside click. Do not use it for flows that need a confirm button." },
      example: {
        Demo: QuickFilter,
        code: `const [city, setCity] = useState("");

<Popover title="Quick filter" trigger={<Button>By city</Button>}>
  <Field label="Delivery city">
    <Select value={city} onChange={setCity} options={CITIES} block clearable />
  </Field>
</Popover>`,
      },
    },
  ],
  a11y: [
    { tr: "Tetikleyici `aria-haspopup=\"dialog\"` ve `aria-expanded` alır, panel `role=\"dialog\"` ile açılır.", en: "The trigger gets `aria-haspopup=\"dialog\"` and `aria-expanded`, and the panel opens with `role=\"dialog\"`." },
    { tr: "`title` verilirse panelin adı olur. Başlıksız panellerde metin ekran okuyucuya yine ulaşır, ama kısa ve açık yazın.", en: "`title`, when given, names the panel. Without one the text still reaches screen readers, so keep it short and clear." },
    { tr: "Açılınca odak panelin içine geçer, kapanınca tetikleyiciye döner.", en: "On open, focus moves into the panel, and on close it returns to the trigger." },
    { tr: "Panel sayfayı kilitlemez; arkadaki içerik kullanılabilir kalır.", en: "The panel does not lock the page, so the content behind stays usable." },
  ],
  keyboard: [
    ["Enter", { tr: "Tetikleyicideyken paneli açar", en: "Opens the panel from the trigger" }],
    ["Space", { tr: "Tetikleyicideyken paneli açar", en: "Opens the panel from the trigger" }],
    ["Tab", { tr: "Panel içindeki öğeler arasında gezer", en: "Moves between elements in the panel" }],
    ["Esc", { tr: "Paneli kapatır, odağı tetikleyiciye verir", en: "Closes the panel and returns focus to the trigger" }],
  ],
  api: [
    {
      name: "Popover",
      props: [
        { name: "trigger", type: "ReactElement", required: true, description: { tr: "Paneli açan öğe. Ref ve olayları iletmelidir", en: "The element that opens the panel. It must forward its ref and events" } },
        { name: "title", type: "ReactNode", description: { tr: "Panel başlığı", en: "Panel title" } },
        { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: { tr: "Açılma yönü", en: "Direction the panel opens in" } },
        { name: "align", type: '"start" | "center" | "end"', default: '"start"', description: { tr: "Tetikleyiciye göre hiza", en: "Alignment against the trigger" } },
        { name: "open", type: "boolean", description: { tr: "`onOpenChange` ile birlikte verilince paneli siz yönetirsiniz", en: "Controls the panel together with `onOpenChange`" } },
        { name: "onOpenChange", type: "(open: boolean) => void", description: { tr: "Panel açılınca ya da kapanınca çağrılır", en: "Called when the panel opens or closes" } },
        { name: "children", type: "ReactNode", required: true, description: { tr: "Panel içeriği", en: "Panel content" } },
      ],
    },
  ],
  styling: [
    { name: "data-side", kind: "data", description: { tr: "Panelin gerçekte açıldığı yön", en: "The side the panel actually opened on" } },
    { name: "data-align", kind: "data", description: { tr: "Panelin gerçek hizası", en: "The actual alignment of the panel" } },
    { name: "data-starting-style", kind: "data", description: { tr: "Açılış geçişinin ilk karesi", en: "First frame of the opening transition" } },
    { name: "data-ending-style", kind: "data", description: { tr: "Kapanış geçişi sırasında bulunur", en: "Present during the closing transition" } },
    { name: "--bt-shadow-pop", kind: "var", description: { tr: "Panel gölgesi", en: "Panel shadow" } },
    { name: "--bt-border", kind: "var", description: { tr: "Panel kenarlığı", en: "Panel border" } },
    { name: "--bt-radius-lg", kind: "var", description: { tr: "Köşe yarıçapı", en: "Corner radius" } },
  ],
  related: ["tooltip", "menu", "drawer", "modal"],
});
