import { useRef, useState, type FormEvent } from "react";
import { Alert, Badge, Button, Field, InfoRow, Input, Modal, Select, useConfirm, useToast } from "btui";
import { CITIES, ORDERS, STATUS_LABEL, STATUS_TONE, money } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function OrderDetail() {
  const t = useText();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const order = ORDERS[0];
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t({ tr: "Siparişi görüntüle", en: "View order" })}</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t({ tr: `Sipariş ${order.no}`, en: `Order ${order.no}` })}
        footer={<Button onClick={() => setOpen(false)}>{t({ tr: "Kapat", en: "Close" })}</Button>}
      >
        <InfoRow label={t({ tr: "Müşteri", en: "Customer" })}>{order.customer}</InfoRow>
        <InfoRow label={t({ tr: "Şehir", en: "City" })}>{order.city}</InfoRow>
        <InfoRow label={t({ tr: "Tutar", en: "Amount" })}>{money(order.amount, lang)}</InfoRow>
        <InfoRow label={t({ tr: "Durum", en: "Status" })}><Badge tone={STATUS_TONE[order.status]}>{t(STATUS_LABEL[order.status])}</Badge></InfoRow>
      </Modal>
    </>
  );
}

const SIZES = ["sm", "md", "lg", "xl"] as const;

function Sizes() {
  const t = useText();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<(typeof SIZES)[number]>("md");
  const show = (next: (typeof SIZES)[number]) => {
    setSize(next);
    setOpen(true);
  };
  return (
    <>
      {SIZES.map((item) => <Button key={item} onClick={() => show(item)}>{item}</Button>)}
      <Modal open={open} onClose={() => setOpen(false)} size={size} title={t({ tr: `Fatura önizleme, ${size}`, en: `Invoice preview, ${size}` })}>
        {t({ tr: "Kısa onaylar için sm, formlar için md, satır tabloları için lg ve xl uygundur.", en: "Use sm for short approvals, md for forms, and lg or xl for line tables." })}
      </Modal>
    </>
  );
}

function NewCustomer() {
  const t = useText();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [tried, setTried] = useState(false);
  const close = () => {
    setOpen(false);
    setName("");
    setCity("");
    setTried(false);
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setTried(true);
      return;
    }
    toast({ title: t({ tr: `${name} kaydedildi`, en: `${name} saved` }), tone: "ok" });
    close();
  };
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>{t({ tr: "Yeni müşteri", en: "New customer" })}</Button>
      <Modal
        open={open}
        onClose={close}
        size="sm"
        title={t({ tr: "Yeni müşteri", en: "New customer" })}
        footer={
          <>
            <Button onClick={close}>{t({ tr: "Vazgeç", en: "Cancel" })}</Button>
            <Button variant="primary" type="submit" form="new-customer">{t({ tr: "Kaydet", en: "Save" })}</Button>
          </>
        }
      >
        <form id="new-customer" onSubmit={save} style={{ display: "grid", gap: 12 }}>
          <Field label={t({ tr: "Firma adı", en: "Company name" })} error={tried && !name.trim() ? t({ tr: "Firma adı zorunlu", en: "Company name is required" }) : undefined}>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={t({ tr: "Şehir", en: "City" })}>
            <Select value={city} onChange={setCity} options={CITIES} block />
          </Field>
        </form>
      </Modal>
    </>
  );
}

function Described() {
  const t = useText();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t({ tr: "Faturayı iptal et", en: "Cancel the invoice" })}</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title={t({ tr: "Fatura iptali", en: "Invoice cancellation" })}
        description={t({ tr: "İptal edilen fatura için müşteriye bilgilendirme gönderilir.", en: "The customer is notified about a cancelled invoice." })}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>{t({ tr: "Vazgeç", en: "Cancel" })}</Button>
            <Button variant="danger" onClick={() => setOpen(false)}>{t({ tr: "Faturayı iptal et", en: "Cancel the invoice" })}</Button>
          </>
        }
      >
        <InfoRow label={t({ tr: "Fatura", en: "Invoice" })}>FT-2026-0412</InfoRow>
        <InfoRow label={t({ tr: "Müşteri", en: "Customer" })}>Ege Tekstil</InfoRow>
      </Modal>
    </>
  );
}

function FirstInput() {
  const t = useText();
  const [open, setOpen] = useState(false);
  const first = useRef<HTMLInputElement>(null);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>{t({ tr: "Tahsilat gir", en: "Enter a payment" })}</Button>
      <Modal
        open={open}
        onClose={close}
        size="sm"
        title={t({ tr: "Tahsilat", en: "Payment" })}
        initialFocus={first}
        footer={
          <>
            <Button onClick={close}>{t({ tr: "Vazgeç", en: "Cancel" })}</Button>
            <Button variant="primary" type="submit" form="new-payment">{t({ tr: "Kaydet", en: "Save" })}</Button>
          </>
        }
      >
        <form id="new-payment" onSubmit={(e) => { e.preventDefault(); close(); }} style={{ display: "grid", gap: 12 }}>
          <Field label={t({ tr: "Makbuz no", en: "Receipt no" })}>
            <Input ref={first} />
          </Field>
          <Field label={t({ tr: "Açıklama", en: "Note" })}>
            <Input />
          </Field>
        </form>
      </Modal>
    </>
  );
}

function Accent() {
  const t = useText();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t({ tr: "Onay talebini aç", en: "Open approval request" })}</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        tone="accent"
        size="sm"
        title={t({ tr: "Bölge müdürü onayı", en: "Regional manager approval" })}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>{t({ tr: "Reddet", en: "Reject" })}</Button>
            <Button variant="success" onClick={() => setOpen(false)}>{t({ tr: "Onayla", en: "Approve" })}</Button>
          </>
        }
      >
        {t({ tr: "SP-1047, 42.500 TL ile onay sınırını aşıyor. Kuzey Lojistik için talebi inceleyin.", en: "SP-1047 exceeds the approval threshold at 42,500 TRY. Review the request for Kuzey Lojistik." })}
      </Modal>
    </>
  );
}

function Scrolling() {
  const t = useText();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t({ tr: "Fatura kalemleri", en: "Invoice lines" })}</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t({ tr: "FT-2026-0412 kalemleri", en: "FT-2026-0412 lines" })}
        footer={<Button variant="primary" onClick={() => setOpen(false)}>{t({ tr: "Tamam", en: "Done" })}</Button>}
      >
        {ORDERS.map((order) => <InfoRow key={order.id} label={`${order.no} · ${order.customer}`}>{money(order.amount, lang)}</InfoRow>)}
      </Modal>
    </>
  );
}

function Guarded() {
  const t = useText();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const close = async () => {
    if (note) {
      const leave = await confirm({
        danger: true,
        message: t({ tr: "Yazdığınız not kaydedilmedi. Çıkarsanız silinecek.", en: "Your note has not been saved. It will be lost if you leave." }),
        confirmLabel: t({ tr: "Notu sil ve çık", en: "Discard and leave" }),
        cancelLabel: t({ tr: "Düzenlemeye dön", en: "Keep editing" }),
      });
      if (!leave) return;
    }
    setNote("");
    setOpen(false);
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t({ tr: "Tahsilat notu ekle", en: "Add payment note" })}</Button>
      <Modal
        open={open}
        onClose={close}
        size="sm"
        title={t({ tr: "Tahsilat notu", en: "Payment note" })}
        footer={<Button onClick={close}>{t({ tr: "Kapat", en: "Close" })}</Button>}
      >
        <Field label={t({ tr: "Çınar Gıda için not", en: "Note for Çınar Gıda" })} hint={t({ tr: "Bir şey yazıp Esc tuşuna basın.", en: "Type something, then press Esc." })}>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </Modal>
    </>
  );
}

function WithAlert() {
  const t = useText();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t({ tr: "Toplu faturalama", en: "Bulk invoicing" })}</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title={t({ tr: "Toplu faturalama", en: "Bulk invoicing" })}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>{t({ tr: "Vazgeç", en: "Cancel" })}</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>{t({ tr: "14 fatura kes", en: "Create 14 invoices" })}</Button>
          </>
        }
      >
        <Alert tone="warn" title={t({ tr: "2 sipariş atlanacak", en: "2 orders will be skipped" })}>
          {t({ tr: "Ege Tekstil ve Atlas Makine için vergi numarası eksik.", en: "Tax numbers are missing for Ege Tekstil and Atlas Makine." })}
        </Alert>
      </Modal>
    </>
  );
}

export default definePage({
  summary: { tr: "Kullanıcının dikkatini tek bir işe çeker, arkadaki ekranı bu iş bitene kadar kapatır. Durumu siz yönetirsiniz: `open` ve `onClose`.", en: "Pulls attention to a single task and blocks the screen behind until it is done. You own the state through `open` and `onClose`." },
  imports: 'import { Modal } from "btui";',
  base: "dialog",
  hero: {
    Demo: OrderDetail,
    code: `const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>View order</Button>
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Order SP-1040"
  footer={<Button onClick={() => setOpen(false)}>Close</Button>}
>
  <InfoRow label="Customer">Mavi Yapı</InfoRow>
  <InfoRow label="City">Ankara</InfoRow>
</Modal>`,
  },
  use: {
    do: [
      { tr: "Akışı kesmesi gereken kısa formlar: yeni müşteri, tahsilat kaydı", en: "Short forms that should interrupt the flow: a new customer, a payment entry" },
      { tr: "Onaydan önce incelenmesi gereken bilgiler", en: "Information to review before an approval" },
      { tr: "Sayfadan ayrılmadan tamamlanması gereken tek bir görev", en: "A single task to finish without leaving the page" },
    ],
    dont: [
      { tr: "Listeye bakarken kayıt incelemek; `Drawer` listeyi görünür bırakır", en: "Inspecting a record while reading a list; `Drawer` keeps the list visible" },
      { tr: "Evet ya da hayır soruları; `useConfirm` daha kısa ve daha güvenlidir", en: "Yes or no questions; `useConfirm` is shorter and safer" },
      { tr: "Uzun, çok bölümlü formlar; bunlar kendi sayfasını hak eder", en: "Long forms with many sections; they deserve their own page" },
    ],
  },
  anatomy: `<Modal
  open={open}
  onClose={close}
  title="Title"
  description="Short explanation"
  initialFocus={ref}
  size="md"
  tone="plain"
  footer={<Button />}
>
  Content
</Modal>`,
  examples: [
    {
      id: "sizes",
      title: { tr: "Boyutlar", en: "Sizes" },
      body: { tr: "`size` en büyük genişliği belirler: 440, 640, 880, 1120px. Dar ekranlarda diyalog kenarlarda 16px boşluk bırakacak kadar daralır.", en: "`size` sets the largest width: 440, 640, 880, 1120px. On narrow screens the dialog shrinks and leaves 16px on each side." },
      example: {
        Demo: Sizes,
        code: `<Modal open={open} onClose={close} size="sm" title="Invoice preview">…</Modal>
<Modal open={open} onClose={close} size="md" title="Invoice preview">…</Modal>
<Modal open={open} onClose={close} size="lg" title="Invoice preview">…</Modal>
<Modal open={open} onClose={close} size="xl" title="Invoice preview">…</Modal>`,
      },
    },
    {
      id: "form",
      title: { tr: "Form", en: "Form" },
      body: { tr: "Düğmeler `footer` içinde, form gövdede kalır. Bu yüzden gönderme düğmesini forma `form` özniteliğiyle bağlayın; `Enter` tuşu da çalışır. Boş kaydetmeyi deneyin.", en: "Buttons sit in `footer` while the form stays in the body, so link the submit button to the form with the `form` attribute. `Enter` works too. Try saving it empty." },
      example: {
        Demo: NewCustomer,
        code: `<Modal
  open={open}
  onClose={close}
  size="sm"
  title="New customer"
  footer={
    <>
      <Button onClick={close}>Cancel</Button>
      <Button variant="primary" type="submit" form="new-customer">Save</Button>
    </>
  }
>
  <form id="new-customer" onSubmit={save}>
    <Field label="Company name" error={error}>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
    </Field>
    <Field label="City">
      <Select value={city} onChange={setCity} options={CITIES} block />
    </Field>
  </form>
</Modal>`,
      },
    },
    {
      id: "description",
      title: { tr: "Açıklama", en: "Description" },
      body: { tr: "`description` gövdenin başında kısa bir metin gösterir ve diyaloğa `aria-describedby` ile bağlanır; ekran okuyucu açılışta başlıkla birlikte okur. Bir iki cümleyi aşan bilgi gövdeye gider.", en: "`description` shows a short text at the top of the body and links to the dialog through `aria-describedby`, so screen readers read it with the title on open. Anything beyond a sentence or two belongs in the body." },
      example: {
        Demo: Described,
        code: `<Modal
  open={open}
  onClose={close}
  size="sm"
  title="Invoice cancellation"
  description="The customer is notified about a cancelled invoice."
  footer={<Button variant="danger" onClick={cancelInvoice}>Cancel the invoice</Button>}
>
  <InfoRow label="Invoice">FT-2026-0412</InfoRow>
  <InfoRow label="Customer">Ege Tekstil</InfoRow>
</Modal>`,
      },
    },
    {
      id: "initial-focus",
      title: { tr: "İlk odak", en: "Initial focus" },
      body: { tr: "Varsayılan olarak odak başlıktaki kapatma düğmesine gelir. Formlarda `initialFocus` ile ilk alana ref verin, kullanıcı hemen yazmaya başlasın. Diyaloğu açıp yazmayı deneyin.", en: "By default focus lands on the close button in the header. In forms, pass a ref to the first field through `initialFocus`, so people can start typing at once. Open the dialog and start typing." },
      example: {
        Demo: FirstInput,
        code: `const first = useRef<HTMLInputElement>(null);

<Modal open={open} onClose={close} size="sm" title="Payment" initialFocus={first}>
  <Field label="Receipt no">
    <Input ref={first} />
  </Field>
  <Field label="Note">
    <Input />
  </Field>
</Modal>`,
      },
    },
    {
      id: "accent",
      title: { tr: "Vurgulu başlık", en: "Accent header" },
      body: { tr: "`tone=\"accent\"` başlık şeridini marka rengiyle doldurur. Onay gibi önemli anlar için saklayın; her diyalogda kullanılırsa ayırt ediciliğini yitirir.", en: "`tone=\"accent\"` fills the header with the brand colour. Save it for key moments such as approvals, because it stops standing out if every dialog uses it." },
      example: {
        Demo: Accent,
        code: `<Modal
  open={open}
  onClose={close}
  tone="accent"
  size="sm"
  title="Regional manager approval"
  footer={
    <>
      <Button onClick={reject}>Reject</Button>
      <Button variant="success" onClick={approve}>Approve</Button>
    </>
  }
>
  SP-1047 exceeds the approval threshold at 42,500 TRY.
</Modal>`,
      },
    },
    {
      id: "scrolling",
      title: { tr: "Uzun içerik", en: "Long content" },
      body: { tr: "Yükseklik ekranı aşınca yalnız gövde kayar; başlık ve `footer` yerinde kalır. Düğmeler her zaman görünür.", en: "When the height exceeds the screen only the body scrolls, while the header and `footer` stay in place. The buttons are always visible." },
      example: {
        Demo: Scrolling,
        code: `<Modal open={open} onClose={close} title="FT-2026-0412 lines" footer={<Button variant="primary">Done</Button>}>
  {lines.map((line) => <InfoRow key={line.id} label={line.label}>{line.total}</InfoRow>)}
</Modal>`,
      },
    },
    {
      id: "guarded",
      title: { tr: "Kaydedilmemiş veri", en: "Unsaved changes" },
      body: { tr: "`Modal` tamamen kontrollüdür: `onClose` yalnız bir istektir, `open` değerini değiştirmezseniz diyalog açık kalır. Kapatma düğmesi, `Esc` ve arka plan tıklaması hep bu yoldan geçer. Böylece kaydedilmemiş veriyi `useConfirm` ile koruyabilirsiniz.", en: "`Modal` is fully controlled: `onClose` is only a request, and the dialog stays open unless you change `open`. The close button, `Esc` and a backdrop click all go through it, so you can protect unsaved work with `useConfirm`." },
      example: {
        Demo: Guarded,
        code: `const confirm = useConfirm();

const close = async () => {
  if (note) {
    const leave = await confirm({
      danger: true,
      message: "Your note has not been saved. It will be lost if you leave.",
      confirmLabel: "Discard and leave",
      cancelLabel: "Keep editing",
    });
    if (!leave) return;
  }
  setNote("");
  setOpen(false);
};

<Modal open={open} onClose={close} size="sm" title="Payment note">…</Modal>`,
      },
    },
    {
      id: "with-alert",
      title: { tr: "Uyarıyla birlikte", en: "With an alert" },
      body: { tr: "Onaydan önce bilinmesi gerekenleri gövdede `Alert` ile söyleyin. Birincil düğmenin etiketi sonucu tam olarak anlatsın.", en: "State what needs attention before approval with an `Alert` in the body. Let the primary button say the exact outcome." },
      example: {
        Demo: WithAlert,
        code: `<Modal
  open={open}
  onClose={close}
  size="sm"
  title="Bulk invoicing"
  footer={
    <>
      <Button onClick={close}>Cancel</Button>
      <Button variant="primary" onClick={run}>Create 14 invoices</Button>
    </>
  }
>
  <Alert tone="warn" title="2 orders will be skipped">
    Tax numbers are missing for Ege Tekstil and Atlas Makine.
  </Alert>
</Modal>`,
      },
    },
  ],
  a11y: [
    { tr: "`role=\"dialog\"` taşır ve `title` diyaloğun adı olarak bağlanır. Başlığı her zaman anlamlı yazın. `description` verilirse `aria-describedby` ile bağlanır.", en: "It carries `role=\"dialog\"` and `title` is tied in as the dialog name, so always write a meaningful title. `description` links through `aria-describedby` when given." },
    { tr: "Açıkken odak içeride döner, arkadaki sayfa etkileşime kapanır ve kaydırılmaz.", en: "While open, focus cycles inside, and the page behind is blocked from interaction and scrolling." },
    { tr: "Açılınca odak `initialFocus` ile verilen öğeye gelir. Verilmezse başlıktaki kapatma düğmesine gelir.", en: "On open, focus lands on the element given through `initialFocus`, or else on the close button in the header." },
    { tr: "Kapanınca odak diyaloğu açan öğeye döner.", en: "When it closes, focus returns to the element that opened it." },
    { tr: "Kapatma düğmesinin adı `BtuiProvider` dilinden gelir.", en: "The name of the close button comes from the `BtuiProvider` locale." },
  ],
  keyboard: [
    ["Tab", { tr: "Diyalog içindeki sonraki öğeye geçer", en: "Moves to the next element in the dialog" }],
    ["Shift + Tab", { tr: "Diyalog içindeki önceki öğeye geçer", en: "Moves to the previous element in the dialog" }],
    ["Esc", { tr: "`onClose` çağırır", en: "Calls `onClose`" }],
  ],
  api: [
    {
      name: "Modal",
      props: [
        { name: "open", type: "boolean", required: true, description: { tr: "Diyalog açık mı", en: "Whether the dialog is open" } },
        { name: "onClose", type: "() => void", required: true, description: { tr: "Kapatma düğmesi, `Esc` ya da arka plan tıklamasında çalışır", en: "Runs on the close button, `Esc` or a backdrop click" } },
        { name: "title", type: "ReactNode", required: true, description: { tr: "Başlık; tek satırdır, sığmazsa kesilir", en: "Title; a single line that truncates when it does not fit" } },
        { name: "description", type: "ReactNode", description: { tr: "Gövdenin başındaki kısa metin; açılışta başlıkla birlikte okunur", en: "Short text at the top of the body; read along with the title on open" } },
        { name: "initialFocus", type: "RefObject<HTMLElement | null>", description: { tr: "Açılışta odak alacak öğe; verilmezse kapatma düğmesi odaklanır", en: "Element that receives focus on open; by default the close button does" } },
        { name: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"md"', description: { tr: "En büyük genişlik: 440, 640, 880, 1120px", en: "Largest width: 440, 640, 880, 1120px" } },
        { name: "footer", type: "ReactNode", description: { tr: "Sağa hizalı alt şerit, genelde düğmeler", en: "Right-aligned bottom strip, usually buttons" } },
        { name: "tone", type: '"plain" | "accent"', default: '"plain"', description: { tr: "`accent` başlık şeridini marka rengiyle doldurur", en: "`accent` fills the header with the brand colour" } },
        { name: "children", type: "ReactNode", required: true, description: { tr: "Gövde içeriği; uzayınca kayar", en: "Body content; scrolls when it grows" } },
        { name: "className", type: "string", description: { tr: "Diyalog öğesine eklenen sınıf", en: "Class added to the dialog element" } },
      ],
    },
  ],
  styling: [
    { name: "data-tone", kind: "data", description: { tr: "Seçili ton", en: "The current tone" } },
    { name: "data-starting-style", kind: "data", description: { tr: "Açılış geçişinin ilk karesi", en: "First frame of the opening transition" } },
    { name: "data-ending-style", kind: "data", description: { tr: "Kapanış geçişi sırasında bulunur", en: "Present during the closing transition" } },
    { name: "--bt-modal-width", kind: "var", description: { tr: "Diyalog genişliği; `size` bunu ayarlar", en: "Dialog width; set by `size`" } },
    { name: "--bt-scrim", kind: "var", description: { tr: "Arka plan örtüsü", en: "Backdrop colour" } },
    { name: "--bt-shadow-modal", kind: "var", description: { tr: "Diyalog gölgesi", en: "Dialog shadow" } },
    { name: "--bt-radius-lg", kind: "var", description: { tr: "Köşe yarıçapı", en: "Corner radius" } },
  ],
  related: ["drawer", "confirm", "popover", "field"],
});
