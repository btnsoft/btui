import { useState } from "react";
import { Alert, Button } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Tones() {
  const t = useText();
  return (
    <div className="d-stack-wide">
      <Alert title={t({ tr: "e-Fatura bakımı", en: "e-Invoice maintenance" })}>{t({ tr: "Bu gece 23.00 ile 01.00 arasında e-Fatura gönderimi kuyruğa alınacak.", en: "e-Invoice delivery will be queued tonight between 23:00 and 01:00." })}</Alert>
      <Alert tone="ok" title={t({ tr: "Sipariş onaylandı", en: "Order approved" })}>{t({ tr: "SP-1040 depoya iletildi, sevkiyat planı oluşturuldu.", en: "SP-1040 was sent to the warehouse and a shipment plan was created." })}</Alert>
      <Alert tone="warn" title={t({ tr: "Kredi limiti dolmak üzere", en: "Credit limit almost reached" })}>{t({ tr: "Mavi Yapı limitinin yüzde 92'sini kullandı. Yeni siparişler finans onayına düşecek.", en: "Mavi Yapı has used 92 percent of its limit. New orders will need finance approval." })}</Alert>
      <Alert tone="danger" title={t({ tr: "Fatura gönderilemedi", en: "Invoice could not be sent" })}>{t({ tr: "FT-2026-0412 için vergi numarası doğrulanamadı. Müşteri kartını kontrol edin.", en: "The tax number for FT-2026-0412 could not be verified. Check the customer record." })}</Alert>
    </div>
  );
}

function TextOnly() {
  const t = useText();
  return (
    <div className="d-stack-wide">
      <Alert tone="warn">{t({ tr: "Bu teklifin süresi 3 gün içinde doluyor.", en: "This quote expires in 3 days." })}</Alert>
    </div>
  );
}

function Actions() {
  const t = useText();
  return (
    <div className="d-stack-wide">
      <Alert
        tone="danger"
        title={t({ tr: "Vadesi geçmiş 3 fatura var", en: "3 invoices are overdue" })}
        actions={<Button size="sm">{t({ tr: "Faturaları gör", en: "View invoices" })}</Button>}
      >
        {t({ tr: "Çınar Gıda hesabında toplam 48.200 TL ödeme bekliyor.", en: "Çınar Gıda has a total of 48,200 TRY awaiting payment." })}
      </Alert>
    </div>
  );
}

function Dismissible() {
  const t = useText();
  const [round, setRound] = useState(0);
  const [closed, setClosed] = useState(false);
  const reset = () => {
    setClosed(false);
    setRound((n) => n + 1);
  };
  return (
    <div className="d-stack-wide">
      <Alert key={round} dismissible onDismiss={() => setClosed(true)} title={t({ tr: "Yeni onay akışı", en: "New approval flow" })}>
        {t({ tr: "10.000 TL üzerindeki siparişler artık bölge müdürü onayından geçiyor.", en: "Orders above 10,000 TRY now go through regional manager approval." })}
      </Alert>
      {closed ? <div><Button size="sm" onClick={reset}>{t({ tr: "Yeniden göster", en: "Show again" })}</Button></div> : null}
    </div>
  );
}

function Summary() {
  const t = useText();
  return (
    <div className="d-stack-wide">
      <Alert tone="danger" title={t({ tr: "Kayıt tamamlanamadı, 2 alanı düzeltin", en: "Could not save, fix 2 fields" })}>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li>{t({ tr: "Vergi numarası 10 haneli olmalı", en: "Tax number must have 10 digits" })}</li>
          <li>{t({ tr: "Teslimat adresi boş bırakılamaz", en: "Delivery address cannot be empty" })}</li>
        </ul>
      </Alert>
    </div>
  );
}

export default definePage({
  summary: { tr: "Sayfanın içinde kalan kalıcı bir mesaj gösterir. Kullanıcı konuyu çözene ya da kapatana kadar yerinde durur.", en: "Shows a lasting message inside the page. It stays in place until the user resolves or dismisses it." },
  imports: 'import { Alert } from "btui";',
  hero: {
    block: true,
    Demo: Tones,
    code: `<Alert title="e-Invoice maintenance">e-Invoice delivery will be queued tonight.</Alert>
<Alert tone="ok" title="Order approved">SP-1040 was sent to the warehouse.</Alert>
<Alert tone="warn" title="Credit limit almost reached">Mavi Yapı has used 92 percent of its limit.</Alert>
<Alert tone="danger" title="Invoice could not be sent">Check the customer record.</Alert>`,
  },
  use: {
    do: [
      { tr: "Kullanıcının bilmesi gereken ve ekranda kalması gereken durumlar", en: "Conditions the user must know about, which should stay on screen" },
      { tr: "Form üstünde, kaydı engelleyen hataların özeti", en: "A summary above a form of the errors blocking the save" },
      { tr: "Bir kayda bağlı uyarılar: vadesi geçmiş fatura, dolan kredi limiti", en: "Warnings tied to a record: an overdue invoice, a credit limit running out" },
    ],
    dont: [
      { tr: "Geçici başarı mesajları; bunun için `useToast` kullanın", en: "Passing success messages; use `useToast` for those" },
      { tr: "Tek bir alanın hatası; `Field` üzerindeki `error` onu alanın yanında gösterir", en: "An error on a single field; the `error` prop on `Field` shows it next to the input" },
      { tr: "Karar gerektiren anlar; işlem durmalıysa `useConfirm` kullanın", en: "Moments that need a decision; use `useConfirm` when work must stop" },
    ],
  },
  anatomy: `<Alert tone="warn" title="Title" actions={<Button size="sm" />} dismissible onDismiss={save}>
  Message
</Alert>`,
  examples: [
    {
      id: "text-only",
      title: { tr: "Yalnız metin", en: "Text only" },
      body: { tr: "`title` isteğe bağlıdır. Mesaj tek cümleyse başlık eklemeyin; aynı şeyi iki kez söylemiş olursunuz.", en: "`title` is optional. Skip it when the message is one sentence, or you end up saying the same thing twice." },
      example: { block: true, Demo: TextOnly, code: `<Alert tone="warn">This quote expires in 3 days.</Alert>` },
    },
    {
      id: "actions",
      title: { tr: "Eylem", en: "Actions" },
      body: { tr: "`actions` sorunu çözecek adımı mesajın hemen yanına koyar. Çoğu zaman `size=\"sm\"` tek düğme yeter.", en: "`actions` places the step that resolves the problem right next to the message. A single `size=\"sm\"` button is usually enough." },
      example: {
        block: true,
        Demo: Actions,
        code: `<Alert
  tone="danger"
  title="3 invoices are overdue"
  actions={<Button size="sm">View invoices</Button>}
>
  Çınar Gıda has a total of 48,200 TRY awaiting payment.
</Alert>`,
      },
    },
    {
      id: "dismissible",
      title: { tr: "Kapatılabilir", en: "Dismissible" },
      body: { tr: "`dismissible` bir kapatma düğmesi ekler. Kapanma durumu bileşenin içinde tutulur ve sayfa yenilenince unutulur; kalıcı olması için `onDismiss` içinde kaydedin. Yeniden göstermek için `key` değerini değiştirin. Çözülmemiş hataları kapatılabilir yapmayın.", en: "`dismissible` adds a close button. The closed state lives inside the component and is lost on reload, so store it in `onDismiss` when it must last. Change `key` to show the alert again. Never make unresolved errors dismissible." },
      example: {
        block: true,
        Demo: Dismissible,
        code: `<Alert key={round} dismissible onDismiss={() => setClosed(true)} title="New approval flow">
  Orders above 10,000 TRY now go through regional manager approval.
</Alert>`,
      },
    },
    {
      id: "form-summary",
      title: { tr: "Form hata özeti", en: "Form error summary" },
      body: { tr: "`children` her tür içeriği alır. Uzun formlarda hataları üstte listeleyin, her alanın hatasını ayrıca `Field` üzerinde gösterin.", en: "`children` accepts any content. On long forms, list the errors at the top and still show each one on its `Field`." },
      example: {
        block: true,
        Demo: Summary,
        code: `<Alert tone="danger" title="Could not save, fix 2 fields">
  <ul>
    <li>Tax number must have 10 digits</li>
    <li>Delivery address cannot be empty</li>
  </ul>
</Alert>`,
      },
    },
  ],
  a11y: [
    { tr: "`warn` ve `danger` tonları `role=\"alert\"`, `info` ve `ok` tonları `role=\"status\"` alır; ilki hemen, ikincisi sırası gelince duyurulur.", en: "`warn` and `danger` get `role=\"alert\"`, `info` and `ok` get `role=\"status\"`; the first is announced at once, the second when the reader is idle." },
    { tr: "Canlı bölgeler içerik sonradan eklenince duyurulur. Bir işlemin sonucunu bildiriyorsanız uyarıyı o anda ekrana ekleyin.", en: "Live regions announce content added later. When reporting the result of an action, insert the alert at that moment." },
    { tr: "Ton yalnız sol kenar rengiyle gösterilir; durumu başlıkta ya da metinde de söyleyin.", en: "Tone shows only in the left edge colour, so state the situation in the title or text as well." },
    { tr: "Kapatma düğmesinin adı `BtuiProvider` diline göre `Kapat` ya da `Close` olur.", en: "The close button is named `Kapat` or `Close` according to the `BtuiProvider` locale." },
  ],
  keyboard: [
    ["Tab", { tr: "Eylem ve kapatma düğmelerine odaklanır", en: "Moves focus to the action and close buttons" }],
    ["Enter", { tr: "Odaktaki düğmeyi çalıştırır", en: "Runs the focused button" }],
    ["Space", { tr: "Odaktaki düğmeyi çalıştırır", en: "Runs the focused button" }],
  ],
  api: [
    {
      name: "Alert",
      props: [
        { name: "tone", type: '"info" | "ok" | "warn" | "danger"', default: '"info"', description: { tr: "Mesajın önemi; kenar rengini ve canlı bölge rolünü belirler", en: "Importance of the message; sets the edge colour and the live region role" } },
        { name: "title", type: "ReactNode", description: { tr: "Kalın başlık satırı", en: "Bold heading line" } },
        { name: "children", type: "ReactNode", description: { tr: "Mesaj metni ya da içerik", en: "Message text or content" } },
        { name: "actions", type: "ReactNode", description: { tr: "Sağ tarafa yerleşen eylemler", en: "Actions placed on the right" } },
        { name: "dismissible", type: "boolean", description: { tr: "Kapatma düğmesi ekler; basılınca uyarı gizlenir", en: "Adds a close button that hides the alert when pressed" } },
        { name: "onDismiss", type: "() => void", description: { tr: "Kapatma düğmesine basılınca çalışır", en: "Runs when the close button is pressed" } },
        { name: "className", type: "string", description: { tr: "Kök öğeye eklenen sınıf", en: "Class added to the root element" } },
      ],
    },
  ],
  styling: [
    { name: "data-tone", kind: "data", description: { tr: "Seçili ton", en: "The current tone" } },
    { name: "--bt-accent", kind: "var", description: { tr: "`info` kenar rengi", en: "`info` edge colour" } },
    { name: "--bt-ok", kind: "var", description: { tr: "`ok` kenar rengi", en: "`ok` edge colour" } },
    { name: "--bt-warn", kind: "var", description: { tr: "`warn` kenar rengi", en: "`warn` edge colour" } },
    { name: "--bt-danger", kind: "var", description: { tr: "`danger` kenar rengi", en: "`danger` edge colour" } },
  ],
  related: ["toast", "confirm", "field", "empty-state"],
});
