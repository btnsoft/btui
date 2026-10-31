import { useState } from "react";
import { Badge, Button, Drawer, Field, InfoRow, Input, Select, useToast } from "btui";
import { CITIES, ORDERS, STATUS_LABEL, STATUS_TONE, money, type Order } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function OrderRows({ order }: { order: Order }) {
  const t = useText();
  const lang = useLang();
  return (
    <>
      <InfoRow label={t({ tr: "Müşteri", en: "Customer" })}>{order.customer}</InfoRow>
      <InfoRow label={t({ tr: "Şehir", en: "City" })}>{order.city}</InfoRow>
      <InfoRow label={t({ tr: "Tarih", en: "Date" })}>{order.date}</InfoRow>
      <InfoRow label={t({ tr: "Sorumlu", en: "Owner" })}>{order.owner}</InfoRow>
      <InfoRow label={t({ tr: "Tutar", en: "Amount" })}>{money(order.amount, lang)}</InfoRow>
      <InfoRow label={t({ tr: "Durum", en: "Status" })}><Badge tone={STATUS_TONE[order.status]}>{t(STATUS_LABEL[order.status])}</Badge></InfoRow>
    </>
  );
}

function Detail() {
  const t = useText();
  const [open, setOpen] = useState(false);
  const order = ORDERS[0];
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t({ tr: "Sipariş ayrıntısı", en: "Order details" })}</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title={order.no} subtitle={order.customer}>
        <OrderRows order={order} />
      </Drawer>
    </>
  );
}

function FromList() {
  const t = useText();
  const lang = useLang();
  const [selected, setSelected] = useState<Order | null>(null);
  const [shown, setShown] = useState(ORDERS[4]);
  const show = (order: Order) => {
    setShown(order);
    setSelected(order);
  };
  return (
    <div className="d-stack-wide">
      {ORDERS.slice(4, 7).map((order) => (
        <div key={order.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <b style={{ width: 72 }}>{order.no}</b>
          <span style={{ flex: 1, minWidth: 0 }}>{order.customer}</span>
          <span>{money(order.amount, lang)}</span>
          <Button size="xs" onClick={() => show(order)}>{t({ tr: "İncele", en: "Inspect" })}</Button>
        </div>
      ))}
      <Drawer open={selected !== null} onClose={() => setSelected(null)} title={shown.no} subtitle={shown.customer}>
        <OrderRows order={shown} />
      </Drawer>
    </div>
  );
}

function Footer() {
  const t = useText();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const order = ORDERS[1];
  const approve = () => {
    setOpen(false);
    toast({ title: t({ tr: `${order.no} onaylandı`, en: `${order.no} approved` }), tone: "ok" });
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t({ tr: "Onay bekleyen sipariş", en: "Order awaiting approval" })}</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={order.no}
        subtitle={t({ tr: "Onay bekliyor", en: "Awaiting approval" })}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>{t({ tr: "Vazgeç", en: "Cancel" })}</Button>
            <Button variant="success" onClick={approve}>{t({ tr: "Onayla", en: "Approve" })}</Button>
          </>
        }
      >
        <OrderRows order={order} />
      </Drawer>
    </>
  );
}

function EditForm() {
  const t = useText();
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("İzmir");
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t({ tr: "Müşteriyi düzenle", en: "Edit customer" })}</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Ege Tekstil"
        subtitle={t({ tr: "Müşteri kartı", en: "Customer record" })}
        width={520}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>{t({ tr: "Vazgeç", en: "Cancel" })}</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>{t({ tr: "Kaydet", en: "Save" })}</Button>
          </>
        }
      >
        <div style={{ display: "grid", gap: 12, paddingTop: 4 }}>
          <Field label={t({ tr: "Firma adı", en: "Company name" })}><Input defaultValue="Ege Tekstil" /></Field>
          <Field label={t({ tr: "Vergi numarası", en: "Tax number" })}><Input defaultValue="3890125674" /></Field>
          <Field label={t({ tr: "Şehir", en: "City" })}><Select value={city} onChange={setCity} options={CITIES} block /></Field>
        </div>
      </Drawer>
    </>
  );
}

function FromLeft() {
  const t = useText();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t({ tr: "Filtreleri aç", en: "Open the filters" })}</Button>
      <Drawer open={open} onClose={() => setOpen(false)} side="left" width={320} title={t({ tr: "Filtreler", en: "Filters" })} subtitle={t({ tr: "Sipariş listesi", en: "Order list" })} className="orders-filters">
        <Field label={t({ tr: "Şehir", en: "City" })}><Select options={CITIES} defaultValue="İzmir" block /></Field>
      </Drawer>
    </>
  );
}

export default definePage({
  summary: { tr: "Ekranın kenarından açılan bir panel. Kullanıcı listeden kopmadan bir kaydı inceler ya da düzenler. Durumu siz yönetirsiniz: `open` ve `onClose`.", en: "A panel that slides in from the edge of the screen. People inspect or edit a record without losing their place in the list. You own the state through `open` and `onClose`." },
  imports: 'import { Drawer } from "btui";',
  base: "drawer",
  hero: {
    Demo: Detail,
    code: `const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Order details</Button>
<Drawer open={open} onClose={() => setOpen(false)} title="SP-1040" subtitle="Mavi Yapı">
  <InfoRow label="City">Ankara</InfoRow>
  <InfoRow label="Owner">Ada Yılmaz</InfoRow>
</Drawer>`,
  },
  use: {
    do: [
      { tr: "Tablodaki bir satırın ayrıntısı", en: "The details of a table row" },
      { tr: "Bağlamın korunması gereken düzenleme formları", en: "Edit forms where the context must stay in view" },
      { tr: "Sırayla birkaç kayda bakılan inceleme işleri", en: "Review work that goes through several records in turn" },
    ],
    dont: [
      { tr: "Tüm dikkati isteyen kararlar; `Modal` ya da `useConfirm` kullanın", en: "Decisions that need full attention; use `Modal` or `useConfirm`" },
      { tr: "Birkaç satırlık ipucu; `Popover` daha hafiftir", en: "A few lines of help; `Popover` is lighter" },
      { tr: "Ana gezinme; bunun için `Sidebar` vardır", en: "Main navigation; that is what `Sidebar` is for" },
    ],
  },
  anatomy: `<Drawer open={open} onClose={close} title="Title" subtitle="Subtitle" side="right" width={420} footer={<Button />}>
  Content
</Drawer>`,
  examples: [
    {
      id: "from-list",
      title: { tr: "Listeden açma", en: "Opening from a list" },
      body: { tr: "En yaygın kullanım budur. Seçili kaydı durumda tutun. Son kaydı ayrıca saklarsanız kapanış geçişi sırasında içerik boşalmaz.", en: "This is the most common use. Keep the selected record in state. Storing the last record separately keeps the content in place during the closing transition." },
      example: {
        block: true,
        Demo: FromList,
        code: `const [selected, setSelected] = useState<Order | null>(null);
const [shown, setShown] = useState(orders[0]);

const show = (order: Order) => {
  setShown(order);
  setSelected(order);
};

<Drawer open={selected !== null} onClose={() => setSelected(null)} title={shown.no} subtitle={shown.customer}>
  <OrderRows order={shown} />
</Drawer>`,
      },
    },
    {
      id: "footer",
      title: { tr: "Alt şerit", en: "Footer" },
      body: { tr: "`footer` gövde kaysa da altta sabit kalır. Onay gibi kesin eylemleri buraya koyun, kullanıcı aşağı kaydırmak zorunda kalmasın.", en: "`footer` stays at the bottom while the body scrolls. Put final actions such as approval there, so nobody has to scroll down for them." },
      example: {
        Demo: Footer,
        code: `<Drawer
  open={open}
  onClose={close}
  title="SP-1047"
  subtitle="Awaiting approval"
  footer={
    <>
      <Button onClick={close}>Cancel</Button>
      <Button variant="success" onClick={approve}>Approve</Button>
    </>
  }
>
  <OrderRows order={order} />
</Drawer>`,
      },
    },
    {
      id: "form",
      title: { tr: "Düzenleme ve genişlik", en: "Editing and width" },
      body: { tr: "Varsayılan genişlik 420px'tir. Yan yana alanlar ya da uzun değerler için `width` verin. Panel ne olursa olsun ekranın yüzde 92'sini geçmez.", en: "The default width is 420px. Pass `width` for side-by-side fields or long values. Whatever the value, the panel never exceeds 92 percent of the screen." },
      example: {
        Demo: EditForm,
        code: `<Drawer
  open={open}
  onClose={close}
  title="Ege Tekstil"
  subtitle="Customer record"
  width={520}
  footer={<Button variant="primary" onClick={save}>Save</Button>}
>
  <Field label="Company name"><Input defaultValue="Ege Tekstil" /></Field>
  <Field label="Tax number"><Input defaultValue="3890125674" /></Field>
  <Field label="City"><Select value={city} onChange={setCity} options={CITIES} block /></Field>
</Drawer>`,
      },
    },
    {
      id: "side",
      title: { tr: "Sol kenar", en: "Left edge" },
      body: { tr: "`side` panelin açıldığı kenarı belirler, varsayılan `right`. Kayıt ayrıntısı sağda açılır; filtreler ya da içindekiler gibi sayfanın solunda duran içerikler için `left` daha doğaldır. Dokunmatik kaydırma yönü de kenara uyar. `className` panele sınıf ekler.", en: "`side` sets the edge the panel opens from, with `right` as the default. Record details open on the right, while `left` feels natural for content that lives on the left of a page, such as filters or a table of contents. The touch swipe direction follows the edge. `className` adds a class to the panel." },
      example: {
        Demo: FromLeft,
        code: `<Drawer open={open} onClose={close} side="left" width={320} title="Filters" subtitle="Order list" className="orders-filters">
  <Field label="City"><Select options={CITIES} defaultValue="İzmir" block /></Field>
</Drawer>`,
      },
    },
  ],
  a11y: [
    { tr: "`role=\"dialog\"` taşır. `title` panelin adı, `subtitle` açıklaması olarak bağlanır.", en: "It carries `role=\"dialog\"`. `title` is tied in as the name of the panel and `subtitle` as its description." },
    { tr: "Açıkken odak panelin içinde kalır ve arkadaki sayfa etkileşime kapanır.", en: "While open, focus stays inside the panel and the page behind is blocked from interaction." },
    { tr: "Kapanınca odak paneli açan öğeye döner.", en: "When it closes, focus returns to the element that opened it." },
    { tr: "Dokunmatik ekranda panelin açıldığı kenara doğru kaydırmak onu kapatır; kapatma düğmesi her zaman alternatif olarak durur.", en: "On touch screens a swipe towards the panel's edge closes it, and the close button is always there as an alternative." },
  ],
  keyboard: [
    ["Tab", { tr: "Panel içindeki sonraki öğeye geçer", en: "Moves to the next element in the panel" }],
    ["Shift + Tab", { tr: "Panel içindeki önceki öğeye geçer", en: "Moves to the previous element in the panel" }],
    ["Esc", { tr: "`onClose` çağırır", en: "Calls `onClose`" }],
  ],
  api: [
    {
      name: "Drawer",
      props: [
        { name: "open", type: "boolean", required: true, description: { tr: "Panel açık mı", en: "Whether the panel is open" } },
        { name: "onClose", type: "() => void", required: true, description: { tr: "Kapatma düğmesi, `Esc`, arka plan tıklaması ya da kaydırmada çalışır", en: "Runs on the close button, `Esc`, a backdrop click or a swipe" } },
        { name: "title", type: "ReactNode", required: true, description: { tr: "Panel başlığı", en: "Panel title" } },
        { name: "subtitle", type: "ReactNode", description: { tr: "Başlığın altındaki kısa açıklama", en: "Short description below the title" } },
        { name: "width", type: "number", default: "420", description: { tr: "Genişlik, piksel. En fazla ekranın yüzde 92'si", en: "Width in pixels. At most 92 percent of the screen" } },
        { name: "side", type: '"left" | "right"', default: '"right"', description: { tr: "Panelin açıldığı kenar", en: "The edge the panel opens from" } },
        { name: "footer", type: "ReactNode", description: { tr: "Sağa hizalı, sabit alt şerit", en: "Right-aligned, fixed bottom strip" } },
        { name: "children", type: "ReactNode", required: true, description: { tr: "Gövde içeriği; uzayınca kayar", en: "Body content; scrolls when it grows" } },
        { name: "className", type: "string", description: { tr: "Panele eklenen sınıf", en: "Class added to the panel" } },
      ],
    },
  ],
  styling: [
    { name: "data-side", kind: "data", description: { tr: "Panel ve kabı üzerinde seçili kenar", en: "The current edge, on the panel and its viewport" } },
    { name: "data-swiping", kind: "data", description: { tr: "Dokunmatik kaydırma sırasında bulunur; geçiş kapanır", en: "Present during a touch swipe; the transition is off" } },
    { name: "data-starting-style", kind: "data", description: { tr: "Açılış geçişinin ilk karesi", en: "First frame of the opening transition" } },
    { name: "data-ending-style", kind: "data", description: { tr: "Kapanış geçişi sırasında bulunur", en: "Present during the closing transition" } },
    { name: "--bt-drawer-width", kind: "var", description: { tr: "Panel genişliği; `width` bunu ayarlar", en: "Panel width; set by `width`" } },
    { name: "--drawer-swipe-movement-x", kind: "var", description: { tr: "Kaydırma sırasındaki yatay kayma", en: "Horizontal offset during a swipe" } },
    { name: "--bt-scrim", kind: "var", description: { tr: "Arka plan örtüsü", en: "Backdrop colour" } },
    { name: "--bt-slow", kind: "var", description: { tr: "Kayma geçişinin süresi", en: "Duration of the slide transition" } },
  ],
  related: ["modal", "data-table", "info-row", "popover"],
});
