import { useState } from "react";
import { Button, useToast } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Tones() {
  const t = useText();
  const toast = useToast();
  return (
    <>
      <Button onClick={() => toast({ title: t({ tr: "Rapor hazırlanıyor", en: "Report is being prepared" }) })}>info</Button>
      <Button onClick={() => toast({ title: t({ tr: "Sipariş kaydedildi", en: "Order saved" }), tone: "ok" })}>ok</Button>
      <Button onClick={() => toast({ title: t({ tr: "Stok azaldı", en: "Stock is running low" }), tone: "warn" })}>warn</Button>
      <Button onClick={() => toast({ title: t({ tr: "Fatura gönderilemedi", en: "Invoice could not be sent" }), tone: "danger" })}>danger</Button>
    </>
  );
}

function Description() {
  const t = useText();
  const toast = useToast();
  const send = () => toast({
    title: t({ tr: "Fatura gönderildi", en: "Invoice sent" }),
    description: t({ tr: "FT-2026-0412, muhasebe@mavi-yapi.example adresine iletildi.", en: "FT-2026-0412 was delivered to muhasebe@mavi-yapi.example." }),
    tone: "ok",
  });
  return <Button onClick={send}>{t({ tr: "Faturayı gönder", en: "Send invoice" })}</Button>;
}

function Persistent() {
  const t = useText();
  const toast = useToast();
  const failed = () => toast({
    title: t({ tr: "Aktarım yarıda kaldı", en: "Import stopped halfway" }),
    description: t({ tr: "212 fatura aktarıldı, 18 satır işlenemedi.", en: "212 invoices were imported, 18 rows failed." }),
    tone: "danger",
    timeout: 0,
  });
  return <Button onClick={failed}>{t({ tr: "Aktarımı bitir", en: "Finish import" })}</Button>;
}

function Duration() {
  const t = useText();
  const toast = useToast();
  return (
    <>
      <Button onClick={() => toast({ title: t({ tr: "Bağlantı kopyalandı", en: "Link copied" }), timeout: 2000 })}>{t({ tr: "2 saniye", en: "2 seconds" })}</Button>
      <Button onClick={() => toast({ title: t({ tr: "Filtre görünümü kaydedildi", en: "Filter view saved" }) })}>{t({ tr: "Varsayılan", en: "Default" })}</Button>
      <Button onClick={() => toast({ title: t({ tr: "Ay sonu kapanışı tamamlandı", en: "Month end closing finished" }), timeout: 10000 })}>{t({ tr: "10 saniye", en: "10 seconds" })}</Button>
    </>
  );
}

function Undo() {
  const t = useText();
  const toast = useToast();
  const [count, setCount] = useState(3);
  const archive = () => {
    setCount((n) => n - 1);
    toast({
      title: t({ tr: "Fatura arşivlendi", en: "Invoice archived" }),
      tone: "ok",
      timeout: 8000,
      action: { label: t({ tr: "Geri al", en: "Undo" }), onClick: () => setCount((n) => n + 1) },
    });
  };
  return <Button disabled={count === 0} onClick={archive}>{t({ tr: `Arşivle (${count} fatura)`, en: `Archive (${count} invoices)` })}</Button>;
}

function AfterSave() {
  const t = useText();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const approve = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast({ title: t({ tr: "SP-1040 onaylandı", en: "SP-1040 approved" }), tone: "ok" });
    }, 1200);
  };
  return <Button variant="primary" loading={busy} onClick={approve}>{t({ tr: "Siparişi onayla", en: "Approve order" })}</Button>;
}

export default definePage({
  summary: { tr: "Bir işlemin sonucunu köşede kısa süreli bir bildirimle söyler. Kullanıcının işini bölmez, süresi dolunca kendiliğinden kapanır.", en: "Reports the result of an action with a short notice in the corner. It does not interrupt the work and closes by itself when its time is up." },
  imports: 'import { useToast } from "btui";',
  base: "toast",
  hero: {
    Demo: Tones,
    code: `const toast = useToast();

<Button onClick={() => toast({ title: "Report is being prepared" })}>info</Button>
<Button onClick={() => toast({ title: "Order saved", tone: "ok" })}>ok</Button>
<Button onClick={() => toast({ title: "Stock is running low", tone: "warn" })}>warn</Button>
<Button onClick={() => toast({ title: "Invoice could not be sent", tone: "danger" })}>danger</Button>`,
  },
  use: {
    do: [
      { tr: "Kaydetme, gönderme, kopyalama gibi işlemlerin sonucu", en: "The result of saving, sending or copying" },
      { tr: "Sayfa değişse de görünmesi gereken kısa geri bildirim", en: "Short feedback that should survive a page change" },
      { tr: "Arka planda biten işler: rapor hazır, aktarım tamam", en: "Background work that finished: report ready, import done" },
    ],
    dont: [
      { tr: "Kullanıcının mutlaka görmesi gereken hatalar; sayfada `Alert` gösterin", en: "Errors the user must not miss; show an `Alert` in the page" },
      { tr: "Yanıt bekleyen sorular; bunun için `useConfirm` kullanın", en: "Questions that need an answer; use `useConfirm` for those" },
      { tr: "Forma özgü alan hataları; `Field` üzerindeki `error` doğru yerdir", en: "Field errors in a form; the `error` prop on `Field` is the right place" },
    ],
  },
  anatomy: `const toast = useToast();

toast({
  title: "Title",
  description: "Detail",
  tone: "ok",
  timeout: 5000,
});`,
  examples: [
    {
      id: "description",
      title: { tr: "Başlık ve açıklama", en: "Title and description" },
      body: { tr: "`title` ne olduğunu, `description` ayrıntısını söyler. Ayrıntıya kayıt numarasını yazın; kullanıcı hangi faturanın gittiğini görsün.", en: "`title` says what happened and `description` adds the detail. Include the record number so the user sees which invoice went out." },
      example: {
        Demo: Description,
        code: `toast({
  title: "Invoice sent",
  description: "FT-2026-0412 was delivered to muhasebe@mavi-yapi.example.",
  tone: "ok",
});`,
      },
    },
    {
      id: "duration",
      title: { tr: "Süre", en: "Duration" },
      body: { tr: "`timeout` milisaniye cinsindendir, verilmezse bildirim 5 saniye kalır. Metin uzadıkça süreyi de uzatın. İmleç bildirimin üzerindeyken ya da odak içindeyken süre durur.", en: "`timeout` is in milliseconds and defaults to 5 seconds. Longer text needs more time. The countdown stops while the pointer is over the notice or focus is inside it." },
      example: {
        Demo: Duration,
        code: `toast({ title: "Link copied", timeout: 2000 });
toast({ title: "Filter view saved" });
toast({ title: "Month end closing finished", timeout: 10000 });`,
      },
    },
    {
      id: "persistent",
      title: { tr: "Kalıcı bildirim", en: "Persistent notice" },
      body: { tr: "`timeout: 0` bildirimi kullanıcı kapatana kadar ekranda tutar. Sonucu okunmadan kaybolmaması gereken, ama sayfaya bağlı olmayan işlerde kullanın.", en: "`timeout: 0` keeps the notice until the user closes it. Use it for results that must not vanish unread but are not tied to one page." },
      example: {
        Demo: Persistent,
        code: `toast({
  title: "Import stopped halfway",
  description: "212 invoices were imported, 18 rows failed.",
  tone: "danger",
  timeout: 0,
});`,
      },
    },
    {
      id: "undo",
      title: { tr: "Geri alma", en: "Undo" },
      body: { tr: "`action`, sonucu kolay geri çevrilen işlemlerde onay penceresinden daha iyidir: kullanıcıyı durdurmaz, hata yaparsa düzeltme şansı verir. Geri alma için süreyi uzatın. Geri alınamayan işlemlerde `useConfirm` kullanın.", en: "`action` beats a confirm dialog when a result is easy to reverse: it does not stop people and still lets them fix a mistake. Give undo a longer timeout. Use `useConfirm` when work cannot be reversed." },
      example: {
        Demo: Undo,
        code: `toast({
  title: "Invoice archived",
  tone: "ok",
  timeout: 8000,
  action: { label: "Undo", onClick: restore },
});`,
      },
    },
    {
      id: "after-save",
      title: { tr: "Kayıttan sonra", en: "After saving" },
      body: { tr: "En yaygın akış budur: düğme `loading` ile bekler, sunucu yanıt verince bildirim çıkar. Bildirimi işlem başlarken değil, sonuç belli olunca gösterin.", en: "This is the most common flow: the button waits with `loading` and the notice appears when the server responds. Show it when the result is known, not when the work starts." },
      example: {
        Demo: AfterSave,
        code: `const toast = useToast();
const [busy, setBusy] = useState(false);

const approve = async () => {
  setBusy(true);
  await approveOrder("SP-1040");
  setBusy(false);
  toast({ title: "SP-1040 approved", tone: "ok" });
};

<Button variant="primary" loading={busy} onClick={approve}>Approve order</Button>`,
      },
    },
  ],
  a11y: [
    { tr: "Bildirim alanı `role=\"region\"` ve `aria-live=\"polite\"` taşır; ekran okuyucu yeni bildirimi eldeki işi bitirince okur.", en: "The notice area carries `role=\"region\"` and `aria-live=\"polite\"`, so a screen reader reads a new notice once it finishes what it is saying." },
    { tr: "`danger` tonu da aynı sırayla duyurulur. Acil bir durumu yalnız bildirimle anlatmayın, sayfaya `Alert` ekleyin.", en: "The `danger` tone is announced in the same polite order. Do not rely on a notice alone for urgent matters; add an `Alert` to the page." },
    { tr: "Ton yalnız sol kenar rengiyle gösterilir; sonucu metinle söyleyin.", en: "Tone shows only in the left edge colour, so state the outcome in words." },
    { tr: "İmleç ya da odak bildirimin üzerindeyken süre durur, böylece metni okumaya zaman kalır.", en: "The countdown stops while the pointer or focus is on the notice, which leaves time to read it." },
  ],
  keyboard: [
    ["F6", { tr: "Odağı bildirim alanına taşır ve süreleri durdurur", en: "Moves focus to the notice area and stops the countdowns" }],
    ["Tab", { tr: "Bildirimler ve kapatma düğmeleri arasında gezer", en: "Moves between notices and their close buttons" }],
    ["Esc", { tr: "Odaktaki bildirimi kapatır", en: "Closes the focused notice" }],
    ["Enter", { tr: "Odaktaki kapatma düğmesini çalıştırır", en: "Runs the focused close button" }],
  ],
  api: [
    {
      name: "useToast",
      description: { tr: "Hiç argüman almaz ve `(options: ToastOptions) => string` imzalı bir işlev döndürür. Bu işlev bildirimi gösterir ve kimliğini verir. Hook `<BtuiProvider>` içinde çalışır. Aşağıdaki tablo `ToastOptions` nesnesini anlatır.", en: "Takes no arguments and returns a function with the signature `(options: ToastOptions) => string`. That function shows the notice and gives back its id. The hook works inside `<BtuiProvider>`. The table below describes the `ToastOptions` object." },
      props: [
        { name: "title", type: "ReactNode", description: { tr: "Kalın başlık satırı", en: "Bold heading line" } },
        { name: "description", type: "ReactNode", description: { tr: "Başlığın altındaki ayrıntı", en: "Detail below the title" } },
        { name: "tone", type: '"info" | "ok" | "warn" | "danger"', default: '"info"', description: { tr: "İkon ve ikon rengi", en: "Icon and its colour" } },
        { name: "action", type: "{ label: string; onClick: () => void }", description: { tr: "Bildirimdeki düğme, örn. Geri al. Basınca bildirim de kapanır", en: "A button on the toast, such as Undo. Pressing it also closes the toast" } },
        { name: "timeout", type: "number", default: "5000", description: { tr: "Milisaniye. `0` kullanıcı kapatana kadar tutar", en: "Milliseconds. `0` keeps it until the user closes it" } },
      ],
    },
  ],
  styling: [
    { name: "data-type", kind: "data", description: { tr: "Bildirimin tonu", en: "The tone of the notice" } },
    { name: "data-starting-style", kind: "data", description: { tr: "Giriş geçişinin ilk karesi", en: "First frame of the entry transition" } },
    { name: "data-ending-style", kind: "data", description: { tr: "Çıkış geçişi sırasında bulunur", en: "Present during the exit transition" } },
    { name: "--bt-accent", kind: "var", description: { tr: "`info` kenar rengi", en: "`info` edge colour" } },
    { name: "--bt-ok", kind: "var", description: { tr: "`ok` kenar rengi", en: "`ok` edge colour" } },
    { name: "--bt-warn", kind: "var", description: { tr: "`warn` kenar rengi", en: "`warn` edge colour" } },
    { name: "--bt-danger", kind: "var", description: { tr: "`danger` kenar rengi", en: "`danger` edge colour" } },
    { name: "--bt-shadow-pop", kind: "var", description: { tr: "Bildirim gölgesi", en: "Notice shadow" } },
  ],
  related: ["alert", "confirm", "progress", "button"],
});
