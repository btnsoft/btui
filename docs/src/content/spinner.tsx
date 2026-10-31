import { useState } from "react";
import { Button, Card, Loading, Spinner, TopLoader } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function PageChange() {
  const t = useText();
  const [active, setActive] = useState(false);
  return (
    <>
      <TopLoader active={active} />
      <Button onClick={() => { setActive(true); setTimeout(() => setActive(false), 1200); }}>{t({ tr: "Sayfa değiştir", en: "Change page" })}</Button>
    </>
  );
}

function Overview() {
  const t = useText();
  return (
    <>
      <Spinner label={t({ tr: "Fatura hazırlanıyor", en: "Preparing invoice" })} />
      <Loading>{t({ tr: "Siparişler yükleniyor…", en: "Loading orders…" })}</Loading>
    </>
  );
}

function Sizes() {
  const t = useText();
  const label = t({ tr: "Stok sorgulanıyor", en: "Checking stock" });
  return (
    <>
      <Spinner size={16} label={label} />
      <Spinner label={label} />
      <Spinner size={32} label={label} />
    </>
  );
}

function Inline() {
  const t = useText();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Spinner size={16} label={t({ tr: "Stok sorgulanıyor", en: "Checking stock" })} />
      {t({ tr: "Depo stoğu kontrol ediliyor", en: "Checking warehouse stock" })}
    </span>
  );
}

function DefaultLabel() {
  return <Loading />;
}

function InCard() {
  const t = useText();
  const [loading, setLoading] = useState(false);
  const reload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1600);
  };
  return (
    <div className="d-stack">
      <Card title={t({ tr: "Açık bakiye", en: "Open balance" })} actions={<Button size="sm" disabled={loading} onClick={reload}>{t({ tr: "Yenile", en: "Refresh" })}</Button>} flush={loading}>
        {loading ? <Loading>{t({ tr: "Bakiye hesaplanıyor…", en: "Calculating balance…" })}</Loading> : <b>{t({ tr: "48.200 TL", en: "48,200 TRY" })}</b>}
      </Card>
    </div>
  );
}

function OnButton() {
  const t = useText();
  const [busy, setBusy] = useState(false);
  const send = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 1600);
  };
  return <Button variant="primary" loading={busy} onClick={send}>{t({ tr: "Faturayı gönder", en: "Send invoice" })}</Button>;
}

export default definePage({
  summary: { tr: "Süresi belli olmayan kısa beklemeleri gösterir. `Spinner` yalnız dönen göstergedir, `Loading` ona ortalanmış bir mesaj ekler.", en: "Shows short waits of unknown length. `Spinner` is the indicator alone, and `Loading` adds a centred message to it." },
  imports: 'import { Loading, Spinner } from "btui";',
  hero: {
    Demo: Overview,
    code: `<Spinner label="Preparing invoice" />
<Loading>Loading orders…</Loading>`,
  },
  use: {
    do: [
      { tr: "Birkaç saniye süren sorgular: stok, bakiye, kur bilgisi", en: "Queries that take a few seconds: stock, balance, exchange rate" },
      { tr: "Bir kartın ya da panelin içeriği gelirken `Loading`", en: "`Loading` while the content of a card or panel arrives" },
      { tr: "Satır içi durum metninin yanında küçük bir `Spinner`", en: "A small `Spinner` next to an inline status text" },
    ],
    dont: [
      { tr: "Düğmeye basıldıktan sonraki bekleme; `Button` üzerindeki `loading` bunu çözer", en: "The wait after a button press; `loading` on `Button` handles that" },
      { tr: "Düzeni belli sayfaların ilk yüklenişi; `Skeleton` sayfanın zıplamasını önler", en: "First load of a page with a known layout; `Skeleton` stops the page from jumping" },
      { tr: "Uzun işler; yüzdesi bilinen işlerde `Progress` kullanın", en: "Long jobs; use `Progress` when the percentage is known" },
    ],
  },
  anatomy: `<Spinner size={22} label="What is loading" />

<Loading>Message</Loading>`,
  examples: [
    {
      id: "top-loader",
      title: { tr: "Sayfa geçişi", en: "Page changes" },
      body: { tr: "`TopLoader` pencerenin üstünde ince bir çubuk gösterir. `active` gecikmediği sürece hiçbir şey görünmez, göründüğünde de yanıp sönmez. Yönlendiricinin bekleme durumunu verin; `useTransition` kullanıyorsanız `isPending` tam karşılığıdır. Düğmeye basıp deneyin.", en: "`TopLoader` shows a thin bar along the top of the window. Nothing appears unless `active` lasts, and once shown it never just blinks. Pass your router's waiting state; with `useTransition`, `isPending` is exactly that. Press the button to try." },
      example: {
        Demo: PageChange,
        code: `const [changing, startTransition] = useTransition();

<TopLoader active={changing} delay={120} minDuration={320} />`,
      },
    },
    {
      id: "sizes",
      title: { tr: "Boyutlar", en: "Sizes" },
      body: { tr: "`size` piksel cinsindendir, verilmezse 22px olur. Metin satırında 16, boş panelin ortasında 32 iyi çalışır. Çizgi kalınlığı 3px sabittir.", en: "`size` is in pixels and defaults to 22px. 16 works in a line of text and 32 in the middle of an empty panel. The stroke stays at 3px." },
      example: { Demo: Sizes, code: `<Spinner size={16} label="Checking stock" />\n<Spinner label="Checking stock" />\n<Spinner size={32} label="Checking stock" />` },
    },
    {
      id: "inline",
      title: { tr: "Satır içi", en: "Inline" },
      body: { tr: "Yanında görünür bir metin olsa da `label` verin; `Spinner` kendi başına `role=\"status\"` taşır ve bu adı duyurur.", en: "Pass `label` even with visible text next to it; `Spinner` carries its own `role=\"status\"` and announces that name." },
      example: {
        Demo: Inline,
        code: `<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
  <Spinner size={16} label="Checking stock" />
  Checking warehouse stock
</span>`,
      },
    },
    {
      id: "loading-default",
      title: { tr: "Varsayılan metin", en: "Default text" },
      body: { tr: "`Loading` içerik almazsa `BtuiProvider` dilindeki metni kullanır: `Yükleniyor…` ya da `Loading…`. Sitenin dilini değiştirip deneyin.", en: "Without children, `Loading` uses the text from the `BtuiProvider` locale: `Yükleniyor…` or `Loading…`. Switch the site language to try it." },
      example: { Demo: DefaultLabel, code: `<Loading />` },
    },
    {
      id: "in-card",
      title: { tr: "Kart içinde", en: "Inside a card" },
      body: { tr: "`Loading` kendi dolgusunu getirir ve bulunduğu alana ortalanır. Yerini tutması için kartın `flush` özelliğiyle gövde dolgusunu kapatın. Yenile düğmesine basıp deneyin.", en: "`Loading` brings its own padding and centres in its space. Turn off the card body padding with `flush` while it shows. Press Refresh to try." },
      example: {
        Demo: InCard,
        code: `<Card title="Open balance" actions={<Button size="sm" onClick={reload}>Refresh</Button>} flush={loading}>
  {loading ? <Loading>Calculating balance…</Loading> : <b>48,200 TRY</b>}
</Card>`,
      },
    },
    {
      id: "on-button",
      title: { tr: "Düğmede bekleme", en: "Waiting on a button" },
      body: { tr: "Düğmenin içine `Spinner` koymayın. `loading` hem göstergeyi çizer hem de genişliği ve odağı korur.", en: "Do not put a `Spinner` inside a button. `loading` draws the indicator and keeps the width and focus as well." },
      example: { Demo: OnButton, code: `<Button variant="primary" loading={busy} onClick={send}>Send invoice</Button>` },
    },
  ],
  a11y: [
    { tr: "`Spinner` `role=\"status\"` ve `aria-label` taşır. `label` verilmezse dildeki yükleniyor metni kullanılır.", en: "`Spinner` carries `role=\"status\"` and `aria-label`. Without `label`, the locale's loading text is used." },
    { tr: "`label` içine neyin yüklendiğini yazın: \"Yükleniyor\" yerine \"Fatura hazırlanıyor\".", en: "Say what is loading in `label`: \"Preparing invoice\" beats \"Loading\"." },
    { tr: "`Loading` kök öğede `role=\"status\"` taşır, içindeki gösterge gizlidir; ekran okuyucu yalnız metni okur.", en: "`Loading` has `role=\"status\"` on its root and hides its indicator, so a screen reader reads only the text." },
    { tr: "`prefers-reduced-motion` açıkken dönüş 2 saniyeye yavaşlar.", en: "With `prefers-reduced-motion` on, the rotation slows to 2 seconds." },
  ],
  api: [
    {
      name: "Spinner",
      props: [
        { name: "size", type: "number", default: "22", description: { tr: "Genişlik ve yükseklik, piksel", en: "Width and height in pixels" } },
        { name: "label", type: "string", default: "locale.loading", description: { tr: "Ekran okuyucunun duyurduğu ad", en: "Name announced by screen readers" } },
      ],
    },
    {
      name: "TopLoader",
      props: [
        { name: "active", type: "boolean", required: true, description: { tr: "Sonraki ekran yoldayken `true`", en: "`true` while the next screen is on its way" } },
        { name: "delay", type: "number", default: "120", description: { tr: "Bu kadar milisaniye gizli kalır, kısa geçişlerde hiçbir şey görünmez", en: "Stays hidden this many milliseconds, so quick changes show nothing" } },
        { name: "minDuration", type: "number", default: "320", description: { tr: "Görününce en az bu kadar kalır", en: "Once shown, stays at least this long" } },
      ],
    },
    {
      name: "Loading",
      props: [
        { name: "children", type: "ReactNode", default: "locale.loading", description: { tr: "Göstergenin yanındaki mesaj", en: "Message next to the indicator" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-accent", kind: "var", description: { tr: "Dönen kenarın rengi", en: "Colour of the moving edge" } },
    { name: "--bt-line", kind: "var", description: { tr: "Sabit halkanın rengi", en: "Colour of the still ring" } },
    { name: "--bt-text-2", kind: "var", description: { tr: "`Loading` metin rengi", en: "`Loading` text colour" } },
  ],
  related: ["skeleton", "progress", "button", "empty-state"],
});
