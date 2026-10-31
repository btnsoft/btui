import { useEffect, useState } from "react";
import { Button, Progress } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Overview() {
  const t = useText();
  return (
    <div className="d-stack">
      <Progress value={72} label={t({ tr: "Fatura aktarımı", en: "Invoice import" })} />
      <Progress value={100} tone="ok" label={t({ tr: "Ekim mutabakatı", en: "October reconciliation" })} />
      <Progress value={91} tone="warn" label={t({ tr: "Kredi limiti kullanımı", en: "Credit limit usage" })} />
    </div>
  );
}

function Tones() {
  const t = useText();
  return (
    <div className="d-stack">
      <Progress value={45} label={t({ tr: "Sevkiyat hazırlığı", en: "Shipment preparation" })} />
      <Progress value={100} tone="ok" label={t({ tr: "Onaylanan siparişler", en: "Approved orders" })} />
      <Progress value={82} tone="warn" label={t({ tr: "Depo doluluğu", en: "Warehouse usage" })} />
      <Progress value={97} tone="danger" label={t({ tr: "Bütçe kullanımı", en: "Budget usage" })} />
    </div>
  );
}

function Live() {
  const t = useText();
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setValue((v) => Math.min(v + 8, 100)), 300);
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (value === 100) setRunning(false);
  }, [value]);
  const start = () => {
    setValue(0);
    setRunning(true);
  };
  return (
    <div className="d-stack">
      <Progress value={value} tone={value === 100 ? "ok" : "accent"} label={t({ tr: "230 fatura aktarılıyor", en: "Importing 230 invoices" })} />
      <div><Button size="sm" disabled={running} onClick={start}>{t({ tr: "Aktarımı başlat", en: "Start import" })}</Button></div>
    </div>
  );
}

function NoValue() {
  const t = useText();
  return (
    <div className="d-stack">
      <Progress value={3 * 25} showValue={false} label={t({ tr: "Adım 3 / 4: Ödeme bilgileri", en: "Step 3 of 4: Payment details" })} />
    </div>
  );
}

function Indeterminate() {
  const t = useText();
  return (
    <div className="d-stack">
      <Progress value={null} label={t({ tr: "Banka yanıtı bekleniyor", en: "Waiting for the bank" })} />
    </div>
  );
}

function NoLabel() {
  const t = useText();
  return (
    <div className="d-stack">
      <Progress value={64} showValue={false} aria-label={t({ tr: "Dosya yükleme", en: "File upload" })} />
    </div>
  );
}

export default definePage({
  summary: { tr: "Bir işin ne kadarının bittiğini ya da bir sınırın ne kadarının kullanıldığını yatay bir çubukla gösterir.", en: "Shows how much of a job is done, or how much of a limit is used, with a horizontal bar." },
  imports: 'import { Progress } from "btui";',
  base: "progress",
  hero: {
    Demo: Overview,
    code: `<Progress value={72} label="Invoice import" />
<Progress value={100} tone="ok" label="October reconciliation" />
<Progress value={91} tone="warn" label="Credit limit usage" />`,
  },
  use: {
    do: [
      { tr: "Süresi ölçülebilen işler: toplu fatura aktarımı, dosya yükleme", en: "Work you can measure: a bulk invoice import, a file upload" },
      { tr: "Kullanım oranları: kredi limiti, bütçe, depo doluluğu", en: "Usage ratios: credit limit, budget, warehouse usage" },
      { tr: "Çok adımlı akışlarda bulunulan adım", en: "The current step in a multi-step flow" },
    ],
    dont: [
      { tr: "Kısa beklemeler; birkaç saniyelik işlerde `Spinner` yeter", en: "Short waits; `Spinner` is enough for a few seconds" },
      { tr: "Sayfanın ilk yüklenişi; içerik yeri için `Skeleton` kullanın", en: "The first page load; use `Skeleton` to hold the content's place" },
      { tr: "Kullanıcının değiştirebileceği değerler; `NumberInput` kullanın", en: "Values the user can change; use `NumberInput`" },
    ],
  },
  anatomy: `<Progress value={72} label="Label" showValue tone="accent" />`,
  examples: [
    {
      id: "tones",
      title: { tr: "Tonlar", en: "Tones" },
      body: { tr: "`tone` çubuğun rengini değiştirir. Kullanım oranlarında tonu değere göre seçin: sınıra yaklaşınca `warn`, aşınca `danger`. Tamamlanan işlerde `ok` kullanın.", en: "`tone` changes the bar colour. For usage ratios, choose it from the value: `warn` near the limit and `danger` beyond it. Use `ok` for finished work." },
      example: {
        Demo: Tones,
        code: `<Progress value={45} label="Shipment preparation" />
<Progress value={100} tone="ok" label="Approved orders" />
<Progress value={82} tone="warn" label="Warehouse usage" />
<Progress value={97} tone="danger" label="Budget usage" />`,
      },
    },
    {
      id: "live",
      title: { tr: "Canlı değer", en: "Live value" },
      body: { tr: "`value` kontrollüdür; yeni değeri siz verirsiniz, çubuk geçişli olarak ilerler. İş bitince tonu `ok` yapın. Düğmeye basıp deneyin.", en: "`value` is controlled: you supply each new value and the bar moves smoothly. Switch the tone to `ok` when the job ends. Press the button to try." },
      example: {
        Demo: Live,
        code: `const [value, setValue] = useState(0);

<Progress
  value={value}
  tone={value === 100 ? "ok" : "accent"}
  label="Importing 230 invoices"
/>`,
      },
    },
    {
      id: "no-value",
      title: { tr: "Yüzdesiz", en: "Without a percentage" },
      body: { tr: "`showValue={false}` yüzde yazısını gizler. Adım göstergelerinde bilgi zaten etikettedir. Değer 0 ile 100 arasında olmalıdır, bu yüzden adımları yüzdeye çevirin.", en: "`showValue={false}` hides the percentage. In step indicators the label already says it. The value must be between 0 and 100, so convert steps to a percentage." },
      example: {
        Demo: NoValue,
        code: `<Progress value={75} showValue={false} label="Step 3 of 4: Payment details" />`,
      },
    },
    {
      id: "indeterminate",
      title: { tr: "Belirsiz süre", en: "Unknown duration" },
      body: { tr: "İşin ne kadar süreceği bilinmiyorsa `value={null}` verin. Çubuk soldan sağa kayar, yüzde yazılmaz ve yardımcı teknoloji dil dosyasındaki `loading` metnini okur. Sonucu dış bir sistemden beklediğiniz durumlarda işe yarar.", en: "When the duration is unknown, pass `value={null}`. The bar slides from left to right, no percentage appears and assistive technology reads the `loading` text from the locale. This suits waiting on an outside system." },
      example: {
        Demo: Indeterminate,
        code: `<Progress value={null} label="Waiting for the bank" />`,
      },
    },
    {
      id: "aria-label",
      title: { tr: "Görünür etiket olmadan", en: "Without a visible label" },
      body: { tr: "Çubuk bir kart ya da satır içinde tek başına duruyorsa ve görünür metin yoksa `aria-label` ile adlandırın. Adsız bir çubuk ekran okuyucuda yalnız bir yüzde olarak duyulur.", en: "When a bar stands alone in a card or a row with no visible text, name it with `aria-label`. An unnamed bar reaches a screen reader as a bare percentage." },
      example: {
        Demo: NoLabel,
        code: `<Progress value={64} showValue={false} aria-label="File upload" />`,
      },
    },
  ],
  a11y: [
    { tr: "`role=\"progressbar\"` ile `aria-valuenow`, `aria-valuemin` ve `aria-valuemax` otomatik gelir.", en: "`role=\"progressbar\"` comes with `aria-valuenow`, `aria-valuemin` and `aria-valuemax` set for you." },
    { tr: "`value={null}` iken `aria-valuenow` yazılmaz, `aria-valuetext` dildeki yükleniyor metnini taşır: \"Yükleniyor…\".", en: "With `value={null}`, `aria-valuenow` is left out and `aria-valuetext` carries the language's loading text: \"Loading…\"." },
    { tr: "`label` çubuğa `aria-labelledby` ile bağlanır. Görünür etiket istemiyorsanız `aria-label` verin.", en: "`label` is tied to the bar with `aria-labelledby`. Pass `aria-label` when you want no visible label." },
    { tr: "Görünen yüzde metni ekran okuyucudan gizlidir; aynı değer `aria-valuetext` ile okunur.", en: "The visible percentage is hidden from screen readers; the same value is read through `aria-valuetext`." },
    { tr: "Ton yalnız renkle anlam taşır. `warn` ve `danger` durumunu etikette ya da yakındaki metinde de söyleyin.", en: "Tone carries meaning through colour alone. State `warn` and `danger` conditions in the label or nearby text as well." },
  ],
  api: [
    {
      name: "Progress",
      props: [
        { name: "aria-label", type: "string", description: { tr: "`label` yoksa erişilebilir ad", en: "Accessible name when there is no `label`" } },
        { name: "value", type: "number | null", required: true, description: { tr: "0 ile 100 arası değer. `null` belirsiz durumdur: çubuk kayar, dildeki yükleniyor metni okunur", en: "A value from 0 to 100. `null` means indeterminate: the bar slides and the language's loading text is read" } },
        { name: "label", type: "ReactNode", description: { tr: "Çubuğun üstünde sol tarafta görünen ad", en: "Name shown above the bar on the left" } },
        { name: "showValue", type: "boolean", default: "true", description: { tr: "Yüzde yazısını gösterir", en: "Shows the percentage text" } },
        { name: "tone", type: '"accent" | "ok" | "warn" | "danger"', default: '"accent"', description: { tr: "Çubuk rengi", en: "Bar colour" } },
        { name: "className", type: "string", description: { tr: "Kök öğeye eklenen sınıf", en: "Class added to the root element" } },
      ],
    },
  ],
  styling: [
    { name: "data-tone", kind: "data", description: { tr: "Seçili ton", en: "The current tone" } },
    { name: "data-indeterminate", kind: "data", description: { tr: "`value` `null` iken kök ve parçalarda bulunur", en: "Present on the root and its parts while `value` is `null`" } },
    { name: "data-complete", kind: "data", description: { tr: "Değer 100 olunca kök ve parçalarda bulunur", en: "Present on the root and its parts once the value reaches 100" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "`accent` çubuk rengi", en: "`accent` bar colour" } },
    { name: "--bt-neutral-soft", kind: "var", description: { tr: "Çubuk zemini", en: "Track background" } },
    { name: "--bt-slow", kind: "var", description: { tr: "Genişlik geçişinin süresi", en: "Duration of the width transition" } },
  ],
  related: ["spinner", "skeleton", "file-dropzone", "toast"],
});
