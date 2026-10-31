import { useState } from "react";
import { IconDots, IconTrash } from "@tabler/icons-react";
import { Button, IconButton, Menu, MenuItem, MenuSeparator, useConfirm, useToast } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Approve() {
  const t = useText();
  const confirm = useConfirm();
  const toast = useToast();
  const approve = async () => {
    const ok = await confirm({
      title: t({ tr: "Sipariş onaylansın mı?", en: "Approve this order?" }),
      message: t({ tr: "SP-1040 onaylanınca depoya iletilecek ve Mavi Yapı için sevkiyat planı oluşturulacak.", en: "Once approved, SP-1040 goes to the warehouse and a shipment plan is created for Mavi Yapı." }),
      confirmLabel: t({ tr: "Siparişi onayla", en: "Approve order" }),
    });
    if (ok) toast({ title: t({ tr: "SP-1040 onaylandı", en: "SP-1040 approved" }), tone: "ok" });
  };
  return <Button variant="primary" onClick={approve}>{t({ tr: "Onaya gönder", en: "Send for approval" })}</Button>;
}

function Shorthand() {
  const t = useText();
  const confirm = useConfirm();
  const [answer, setAnswer] = useState<boolean | null>(null);
  const ask = async () => setAnswer(await confirm(t({ tr: "Taslak teklif müşteriye gönderilsin mi?", en: "Send the draft quote to the customer?" })));
  return (
    <>
      <Button onClick={ask}>{t({ tr: "Teklifi gönder", en: "Send quote" })}</Button>
      {answer === null ? null : <code>{String(answer)}</code>}
    </>
  );
}

function Danger() {
  const t = useText();
  const confirm = useConfirm();
  const toast = useToast();
  const remove = async () => {
    const ok = await confirm({
      danger: true,
      message: t({ tr: "12 fatura taslağı kalıcı olarak silinecek. Bu işlem geri alınamaz.", en: "12 invoice drafts will be permanently deleted. This cannot be undone." }),
      confirmLabel: t({ tr: "12 taslağı sil", en: "Delete 12 drafts" }),
    });
    if (ok) toast({ title: t({ tr: "12 taslak silindi", en: "12 drafts deleted" }), tone: "ok" });
  };
  return <Button variant="danger" icon={<IconTrash size={15} />} onClick={remove}>{t({ tr: "Taslakları sil", en: "Delete drafts" })}</Button>;
}

function Labels() {
  const t = useText();
  const confirm = useConfirm();
  const cancel = () => confirm({
    title: t({ tr: "Fatura iptal edilsin mi?", en: "Cancel this invoice?" }),
    message: t({ tr: "FT-2026-0412 iptal edilince müşteriye iptal bildirimi gider.", en: "Cancelling FT-2026-0412 sends a notice to the customer." }),
    confirmLabel: t({ tr: "Faturayı iptal et", en: "Cancel invoice" }),
    cancelLabel: t({ tr: "Fatura kalsın", en: "Keep invoice" }),
    danger: true,
  });
  return <Button onClick={cancel}>{t({ tr: "Faturayı iptal et", en: "Cancel invoice" })}</Button>;
}

function Rich() {
  const t = useText();
  const confirm = useConfirm();
  const close = () => confirm({
    title: t({ tr: "Dönem kapatılsın mı?", en: "Close this period?" }),
    message: (
      <>
        {t({ tr: "Ekim 2026 kapanınca şu kayıtlar değiştirilemez:", en: "Once October 2026 closes, these records are locked:" })}
        <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
          <li>{t({ tr: "418 fatura", en: "418 invoices" })}</li>
          <li>{t({ tr: "96 tahsilat", en: "96 payments" })}</li>
        </ul>
      </>
    ),
    confirmLabel: t({ tr: "Dönemi kapat", en: "Close period" }),
  });
  return <Button onClick={close}>{t({ tr: "Ay sonu kapanışı", en: "Month end closing" })}</Button>;
}

function Busy() {
  const t = useText();
  const confirm = useConfirm();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const refund = async () => {
    const ok = await confirm({
      message: t({ tr: "Çınar Gıda hesabına 8.450 TL iade edilecek.", en: "8,450 TRY will be refunded to Çınar Gıda." }),
      confirmLabel: t({ tr: "İadeyi başlat", en: "Start refund" }),
    });
    if (!ok) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast({ title: t({ tr: "İade başlatıldı", en: "Refund started" }), tone: "ok" });
    }, 1200);
  };
  return <Button variant="primary" loading={busy} onClick={refund}>{t({ tr: "İade et", en: "Refund" })}</Button>;
}

function FromMenu() {
  const t = useText();
  const confirm = useConfirm();
  const remove = () => confirm({
    danger: true,
    message: t({ tr: "Ege Tekstil müşteri kartı silinecek. Geçmiş siparişler arşivde kalır.", en: "The Ege Tekstil customer record will be deleted. Past orders stay in the archive." }),
    confirmLabel: t({ tr: "Müşteriyi sil", en: "Delete customer" }),
  });
  return (
    <Menu trigger={<IconButton label={t({ tr: "Müşteri işlemleri", en: "Customer actions" })}><IconDots size={16} /></IconButton>}>
      <MenuItem>{t({ tr: "Düzenle", en: "Edit" })}</MenuItem>
      <MenuSeparator />
      <MenuItem danger onClick={remove}>{t({ tr: "Müşteriyi sil", en: "Delete customer" })}</MenuItem>
    </Menu>
  );
}

export default definePage({
  summary: { tr: "Sonucu ağır olan bir işlemden önce kullanıcıya sorar. Yerel `confirm()` gibi yazılır: cevabı bir `Promise<boolean>` olarak verir.", en: "Asks the user before an action with heavy consequences. It reads like the native `confirm()`: the answer arrives as a `Promise<boolean>`." },
  imports: 'import { useConfirm } from "btui";',
  base: "alert-dialog",
  hero: {
    Demo: Approve,
    code: `const confirm = useConfirm();

const approve = async () => {
  const ok = await confirm({
    title: "Approve this order?",
    message: "Once approved, SP-1040 goes to the warehouse and a shipment plan is created for Mavi Yapı.",
    confirmLabel: "Approve order",
  });
  if (ok) await approveOrder("SP-1040");
};

<Button variant="primary" onClick={approve}>Send for approval</Button>`,
  },
  use: {
    do: [
      { tr: "Geri alınamayan işlemler: silme, fatura iptali, dönem kapatma", en: "Irreversible work: deleting, cancelling an invoice, closing a period" },
      { tr: "Başka insanları etkileyen adımlar: müşteriye gönderim, depoya iletme", en: "Steps that affect other people: sending to a customer, releasing to the warehouse" },
      { tr: "Toplu işlemler; kaç kaydın etkileneceğini yazın", en: "Bulk actions; state how many records are affected" },
    ],
    dont: [
      { tr: "Kolayca geri alınabilen sıradan kayıtlar; her adımda sorulan soru okunmaz olur", en: "Everyday saves that are easy to undo; a question on every step stops being read" },
      { tr: "Veri toplamak; form gerekiyorsa `Modal` kullanın", en: "Collecting data; use `Modal` when you need a form" },
      { tr: "Bilgi vermek; tek düğmelik mesaj için `Alert` ya da `useToast` yeter", en: "Passing on information; `Alert` or `useToast` is enough for a one-button message" },
    ],
  },
  anatomy: `const confirm = useConfirm();

const ok = await confirm({
  title: "Title",
  message: "What will happen",
  confirmLabel: "Do it",
  cancelLabel: "Keep it",
  danger: true,
});`,
  examples: [
    {
      id: "shorthand",
      title: { tr: "Kısa yazım", en: "Shorthand" },
      body: { tr: "Yalnız bir soru soracaksanız düz metin verin; `message` olarak kullanılır, başlık ve düğmeler dile göre gelir. Düğmeye basıp sonucu görün: onayda `true`, vazgeçince `false` döner.", en: "For a single question, pass a plain string. It becomes the `message`, and the title and buttons follow the locale. Press the button to see the result: `true` on confirm, `false` on cancel." },
      example: {
        Demo: Shorthand,
        code: `const [answer, setAnswer] = useState<boolean | null>(null);

const ask = async () => setAnswer(await confirm("Send the draft quote to the customer?"));`,
      },
    },
    {
      id: "danger",
      title: { tr: "Yıkıcı işlem", en: "Destructive action" },
      body: { tr: "`danger` onay düğmesini `danger` görünümüne alır, işareti kırmızı yapar ve varsayılan başlığı \"Emin misiniz?\" olarak değiştirir. Düğme sonucu söylesin: \"Onayla\" yerine \"12 taslağı sil\".", en: "`danger` switches the confirm button to the `danger` variant, turns the mark red and changes the default title to \"Are you sure?\". Let the button state the outcome: \"Delete 12 drafts\" beats \"Confirm\"." },
      example: {
        Demo: Danger,
        code: `const ok = await confirm({
  danger: true,
  message: "12 invoice drafts will be permanently deleted. This cannot be undone.",
  confirmLabel: "Delete 12 drafts",
});`,
      },
    },
    {
      id: "labels",
      title: { tr: "Düğme etiketleri", en: "Button labels" },
      body: { tr: "\"İptal\" sözcüğü işlemin kendisi de iptalse kafa karıştırır. Böyle durumlarda `cancelLabel` ile vazgeçme düğmesine açık bir ad verin.", en: "The word \"Cancel\" is confusing when the action itself is a cancellation. In those cases give the dismiss button a clear name with `cancelLabel`." },
      example: {
        Demo: Labels,
        code: `confirm({
  title: "Cancel this invoice?",
  message: "Cancelling FT-2026-0412 sends a notice to the customer.",
  confirmLabel: "Cancel invoice",
  cancelLabel: "Keep invoice",
  danger: true,
});`,
      },
    },
    {
      id: "rich-message",
      title: { tr: "Zengin içerik", en: "Rich content" },
      body: { tr: "`message` ve `title` `ReactNode` alır. Etkilenecek kayıtları kısa bir listeyle gösterebilirsiniz. Liste uzuyorsa soru diyaloğu yerine `Modal` kullanın.", en: "`message` and `title` accept a `ReactNode`, so you can show the affected records in a short list. If the list grows long, use `Modal` instead of a question dialog." },
      example: {
        Demo: Rich,
        code: `confirm({
  title: "Close this period?",
  message: (
    <>
      Once October 2026 closes, these records are locked:
      <ul>
        <li>418 invoices</li>
        <li>96 payments</li>
      </ul>
    </>
  ),
  confirmLabel: "Close period",
});`,
      },
    },
    {
      id: "then-work",
      title: { tr: "Onaydan sonra çalışma", en: "Working after confirmation" },
      body: { tr: "Diyalog cevapla birlikte kapanır, işi beklemez. Bu yüzden uzun işlerde onaydan sonra asıl düğmeyi `loading` yapın ve sonucu `useToast` ile bildirin. `false` cevabında işlevden erkenden çıkın.", en: "The dialog closes with the answer and does not wait for the work. For long jobs, set the original button to `loading` after confirmation and report the result with `useToast`. On `false`, return early." },
      example: {
        Demo: Busy,
        code: `const refund = async () => {
  const ok = await confirm({
    message: "8,450 TRY will be refunded to Çınar Gıda.",
    confirmLabel: "Start refund",
  });
  if (!ok) return;
  setBusy(true);
  await startRefund();
  setBusy(false);
  toast({ title: "Refund started", tone: "ok" });
};

<Button variant="primary" loading={busy} onClick={refund}>Refund</Button>`,
      },
    },
    {
      id: "from-menu",
      title: { tr: "Menüden açma", en: "Opening from a menu" },
      body: { tr: "`MenuItem` içinden çağırmak güvenlidir: menü kapanır, diyalog açılır. Kapandığında odak menünün tetikleyicisine döner.", en: "Calling it from a `MenuItem` is safe: the menu closes and the dialog opens. When it closes, focus goes back to the menu trigger." },
      example: {
        Demo: FromMenu,
        code: `const remove = () => confirm({
  danger: true,
  message: "The Ege Tekstil customer record will be deleted. Past orders stay in the archive.",
  confirmLabel: "Delete customer",
});

<Menu trigger={<IconButton label="Customer actions"><IconDots size={16} /></IconButton>}>
  <MenuItem>Edit</MenuItem>
  <MenuSeparator />
  <MenuItem danger onClick={remove}>Delete customer</MenuItem>
</Menu>`,
      },
    },
  ],
  a11y: [
    { tr: "Base UI Alert Dialog üzerine kuruludur: `role=\"alertdialog\"`, başlık ve mesaj diyaloğa bağlıdır, ekran okuyucu ikisini de okur.", en: "Built on the Base UI Alert Dialog: `role=\"alertdialog\"`, with the title and message tied to the dialog so a screen reader reads both." },
    { tr: "Açılınca odak ilk düğmeye, yani vazgeçmeye gelir. Yanlışlıkla `Enter` tuşuna basmak işlemi çalıştırmaz.", en: "On open, focus lands on the first button, which is cancel. An accidental `Enter` does not run the action." },
    { tr: "Arka plana tıklamak diyaloğu kapatmaz; kullanıcı açıkça bir seçim yapmalıdır.", en: "Clicking the backdrop does not close it, so the user has to make an explicit choice." },
    { tr: "Kapanınca odak diyaloğu açan öğeye döner.", en: "When it closes, focus returns to the element that opened it." },
  ],
  keyboard: [
    ["Tab", { tr: "Diyalog içindeki düğmeler arasında döner", en: "Cycles between the buttons in the dialog" }],
    ["Shift + Tab", { tr: "Ters yönde döner", en: "Cycles in reverse" }],
    ["Enter", { tr: "Odaktaki düğmeyi çalıştırır", en: "Runs the focused button" }],
    ["Space", { tr: "Odaktaki düğmeyi çalıştırır", en: "Runs the focused button" }],
    ["Esc", { tr: "Vazgeçer, sonuç `false` olur", en: "Cancels and resolves to `false`" }],
  ],
  api: [
    {
      name: "useConfirm",
      description: { tr: "Hiç argüman almaz ve `(options: ConfirmOptions | string) => Promise<boolean>` imzalı bir işlev döndürür. Yalnız onayda `true` döner; vazgeçme, `Esc` ve yeni bir `confirm` çağrısı önceki isteği `false` ile bitirir. Hook `<BtuiProvider>` dışında hata fırlatır. Aşağıdaki tablo `ConfirmOptions` nesnesini anlatır.", en: "Takes no arguments and returns a function with the signature `(options: ConfirmOptions | string) => Promise<boolean>`. It resolves `true` only on confirm; cancel, `Esc` and a newer `confirm` call all settle the earlier request with `false`. The hook throws outside `<BtuiProvider>`. The table below describes the `ConfirmOptions` object." },
      props: [
        { name: "message", type: "ReactNode", required: true, description: { tr: "Ne olacağını anlatan metin", en: "Text that explains what will happen" } },
        { name: "title", type: "ReactNode", default: "locale.confirm", description: { tr: "Başlık. `danger` ile varsayılanı `locale.areYouSure` olur", en: "The title. With `danger` the default becomes `locale.areYouSure`" } },
        { name: "confirmLabel", type: "string", default: "locale.confirm", description: { tr: "Onay düğmesinin etiketi", en: "Label of the confirm button" } },
        { name: "cancelLabel", type: "string", default: "locale.cancel", description: { tr: "Vazgeçme düğmesinin etiketi", en: "Label of the cancel button" } },
        { name: "danger", type: "boolean", default: "false", description: { tr: "Yıkıcı işlem görünümü: `danger` düğme, kırmızı işaret", en: "Destructive look: a `danger` button and a red mark" } },
      ],
    },
  ],
  styling: [
    { name: "data-danger", kind: "data", description: { tr: "`danger` isteğinde işaret kutusunda bulunur", en: "Present on the mark for a `danger` request" } },
    { name: "data-starting-style", kind: "data", description: { tr: "Açılış geçişinin ilk karesi", en: "First frame of the opening transition" } },
    { name: "data-ending-style", kind: "data", description: { tr: "Kapanış geçişi sırasında bulunur", en: "Present during the closing transition" } },
    { name: "--bt-danger-soft", kind: "var", description: { tr: "`danger` işaretinin zemini", en: "Background of the `danger` mark" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Normal işaretin zemini", en: "Background of the regular mark" } },
    { name: "--bt-scrim", kind: "var", description: { tr: "Arka plan örtüsü", en: "Backdrop colour" } },
    { name: "--bt-shadow-modal", kind: "var", description: { tr: "Diyalog gölgesi", en: "Dialog shadow" } },
  ],
  related: ["modal", "toast", "menu", "button"],
});
