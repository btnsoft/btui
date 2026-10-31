import { useState } from "react";
import { IconMail, IconPhone } from "@tabler/icons-react";
import { Button, Field, Input } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Basic() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Müşteri adı", en: "Customer name" })}>
        <Input placeholder={t({ tr: "Örn. Mavi Yapı", en: "e.g. Mavi Yapı" })} />
      </Field>
      <Field label={t({ tr: "Fatura e-postası", en: "Billing email" })}>
        <Input type="email" defaultValue="muhasebe@maviyapi.com.tr" />
      </Field>
    </div>
  );
}

function Adornments() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Birim fiyat", en: "Unit price" })}>
        <Input prefix="₺" defaultValue="1.250,00" inputMode="decimal" />
      </Field>
      <Field label={t({ tr: "Ağırlık", en: "Weight" })}>
        <Input suffix="kg" defaultValue="42" inputMode="decimal" />
      </Field>
      <Field label={t({ tr: "Web sitesi", en: "Website" })}>
        <Input prefix="https://" suffix=".com.tr" defaultValue="egetekstil" />
      </Field>
    </div>
  );
}

function IconAdornment() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Telefon", en: "Phone" })}>
        <Input type="tel" suffix={<IconPhone size={14} />} defaultValue="0232 555 01 44" />
      </Field>
      <Field label={t({ tr: "E-posta", en: "Email" })}>
        <Input type="email" suffix={<IconMail size={14} />} defaultValue="siparis@egetekstil.com.tr" />
      </Field>
    </div>
  );
}

function Controlled() {
  const t = useText();
  const [plate, setPlate] = useState("35 abc 123");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Araç plakası", en: "Vehicle plate" })} hint={t({ tr: "Yazdıkça büyük harfe çevrilir", en: "Turns to capitals as you type" })}>
        <Input value={plate} onValueChange={(next) => setPlate(next.toLocaleUpperCase("tr"))} />
      </Field>
    </div>
  );
}

function States() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Fatura no", en: "Invoice no" })} hint={t({ tr: "Sistem verir, değiştirilemez", en: "Set by the system, cannot change" })}>
        <Input readOnly defaultValue="FT-2026-00418" />
      </Field>
      <Field label={t({ tr: "Onaylayan", en: "Approved by" })}>
        <Input disabled defaultValue="Elif Kaya" />
      </Field>
    </div>
  );
}

function Required() {
  const t = useText();
  return (
    <form className="d-stack" onSubmit={(e) => e.preventDefault()}>
      <Field label={t({ tr: "Yetkili kişi", en: "Contact person" })} hint={t({ tr: "Boş bırakıp gönderin", en: "Leave it empty and submit" })}>
        <Input required />
      </Field>
      <Button type="submit" variant="primary">{t({ tr: "Kaydet", en: "Save" })}</Button>
    </form>
  );
}

export default definePage({
  summary: { tr: "Tek satırlık metin girişi. Müşteri adı, e-posta, referans numarası gibi kısa ve serbest değerler için kullanılır.", en: "A single line text entry for short, free values such as a customer name, an email address or a reference number." },
  imports: 'import { Input } from "btui";',
  base: "input",
  hero: {
    Demo: Basic,
    code: `<Field label="Customer name">
  <Input placeholder="e.g. Mavi Yapı" />
</Field>
<Field label="Billing email">
  <Input type="email" defaultValue="muhasebe@maviyapi.com.tr" />
</Field>`,
  },
  use: {
    do: [
      { tr: "Tek satıra sığan serbest metinler: unvan, adres satırı, referans", en: "Free text that fits on one line: company name, address line, reference" },
      { tr: "`type` ile doğru klavye ve otomatik doldurma: `email`, `tel`", en: "The right keyboard and autofill through `type`: `email`, `tel`" },
      { tr: "Sabit birimler için `prefix` ve `suffix`: para birimi, kg", en: "`prefix` and `suffix` for fixed units: currency, kg" },
    ],
    dont: [
      { tr: "Sayısal değerler; sınır ve adım için `NumberInput` kullanın", en: "Numbers; use `NumberInput` for limits and steps" },
      { tr: "Birkaç satırlık açıklamalar; `Textarea` daha doğru alan verir", en: "Multi-line notes; `Textarea` gives the right room" },
      { tr: "Etiket yerine yalnız yer tutucu; yazmaya başlayınca kaybolur", en: "A placeholder instead of a label; it vanishes as soon as typing starts" },
    ],
  },
  anatomy: `<Field label="Label">
  <Input prefix="₺" suffix="kg" placeholder="Value" />
</Field>`,
  examples: [
    {
      id: "adornments",
      title: { tr: "Ön ek ve son ek", en: "Prefix and suffix" },
      body: { tr: "Değerin parçası olmayan ama anlamını tamamlayan bilgiyi `prefix` ve `suffix` ile gösterin. Bu metinler forma gönderilmez, yalnız değer gönderilir.", en: "Show what completes the meaning without being part of the value through `prefix` and `suffix`. These texts are not submitted, only the value is." },
      example: {
        Demo: Adornments,
        code: `<Input prefix="₺" defaultValue="1.250,00" inputMode="decimal" />
<Input suffix="kg" defaultValue="42" inputMode="decimal" />
<Input prefix="https://" suffix=".com.tr" defaultValue="egetekstil" />`,
      },
    },
    {
      id: "icon",
      title: { tr: "İkonlu", en: "With an icon" },
      body: { tr: "`prefix` ve `suffix` her türlü öğeyi alır, ikon da verebilirsiniz. İkon süstür, anlamı etikette kalmalıdır.", en: "`prefix` and `suffix` take any node, including an icon. The icon is decoration, so the meaning must stay in the label." },
      example: {
        Demo: IconAdornment,
        code: `<Input type="tel" suffix={<IconPhone size={14} />} defaultValue="0232 555 01 44" />
<Input type="email" suffix={<IconMail size={14} />} defaultValue="siparis@egetekstil.com.tr" />`,
      },
    },
    {
      id: "controlled",
      title: { tr: "Denetimli kullanım", en: "Controlled" },
      body: { tr: "`onValueChange` yeni metni doğrudan verir, olay nesnesiyle uğraşmazsınız. Yerel `onChange` da çalışır. Türkçe metinde büyük harf için `toLocaleUpperCase(\"tr\")` kullanın, yoksa \"i\" harfi \"I\" olur.", en: "`onValueChange` hands you the new text directly, with no event object. Native `onChange` also works. For Turkish text use `toLocaleUpperCase(\"tr\")`, otherwise \"i\" turns into \"I\"." },
      example: {
        Demo: Controlled,
        code: `const [plate, setPlate] = useState("35 abc 123");

<Input value={plate} onValueChange={(next) => setPlate(next.toLocaleUpperCase("tr"))} />`,
      },
    },
    {
      id: "states",
      title: { tr: "Salt okunur ve kapalı", en: "Read-only and disabled" },
      body: { tr: "`readOnly` değeri gösterir, seçilip kopyalanabilir ve forma gönderilir. `disabled` alanı devre dışı bırakır, değer gönderilmez. Sistemin verdiği numaralar için `readOnly` daha doğrudur.", en: "`readOnly` shows the value, lets people select and copy it, and still submits it. `disabled` turns the field off and the value is not submitted. For numbers issued by the system `readOnly` is the better fit." },
      example: {
        Demo: States,
        code: `<Input readOnly defaultValue="FT-2026-00418" />
<Input disabled defaultValue="Elif Kaya" />`,
      },
    },
    {
      id: "required",
      title: { tr: "Zorunlu alan", en: "Required" },
      body: { tr: "Yerel `required` özniteliği iletilir, tarayıcı boş gönderimi kendi iletisiyle durdurur. Kendi metninizi göstermek istiyorsanız `Field` üzerindeki `error` ile doğrulayın.", en: "The native `required` attribute is forwarded, so the browser stops an empty submission with its own message. To show your own text, validate with `error` on `Field`." },
      example: {
        Demo: Required,
        code: `<form onSubmit={submit}>
  <Field label="Contact person">
    <Input required />
  </Field>
  <Button type="submit" variant="primary">Save</Button>
</form>`,
      },
    },
  ],
  a11y: [
    { tr: "`Field` içinde etikete otomatik bağlanır. `Field` yoksa `aria-label` verin.", en: "Inside `Field` it links to the label automatically. Without `Field`, pass `aria-label`." },
    { tr: "Yer tutucu etiket değildir; soluk kalır ve yazınca kaybolur.", en: "A placeholder is no label; it stays faint and disappears on typing." },
    { tr: "`prefix` ve `suffix` metni erişilebilir ada girmez. Birim önemliyse etikette de söyleyin: \"Ağırlık (kg)\".", en: "`prefix` and `suffix` text is not part of the accessible name. If the unit matters, repeat it in the label: \"Weight (kg)\"." },
  ],
  keyboard: [
    ["Tab", { tr: "Alana odaklanır", en: "Moves focus to the field" }],
    ["Enter", { tr: "Form içindeyse formu gönderir", en: "Submits the form, when inside one" }],
  ],
  api: [
    {
      name: "Input",
      description: { tr: "Tüm yerel `input` öznitelikleri ve ref iletilir; `value`, `defaultValue`, `type`, `placeholder`, `required`, `readOnly`, `disabled` bunlara dahildir. `prefix` ya da `suffix` verildiğinde `className` ve ref yine `input` öğesine gider.", en: "All native `input` attributes and the ref are forwarded, including `value`, `defaultValue`, `type`, `placeholder`, `required`, `readOnly` and `disabled`. With `prefix` or `suffix`, `className` and the ref still go to the `input` element." },
      props: [
        { name: "prefix", type: "ReactNode", description: { tr: "Değerden önce sabit içerik; para birimi gibi", en: "Fixed content before the value, such as a currency sign" } },
        { name: "suffix", type: "ReactNode", description: { tr: "Değerden sonra sabit içerik; birim gibi", en: "Fixed content after the value, such as a unit" } },
        { name: "onValueChange", type: "(value: string, eventDetails) => void", description: { tr: "Değer değişince yeni metni bildirir", en: "Reports the new text when the value changes" } },
        { name: "render", type: "ReactElement", description: { tr: "Başka bir öğe olarak çizer", en: "Renders as another element" } },
        { name: "className", type: "string", description: { tr: "`input` öğesine eklenen sınıf", en: "Class added to the `input` element" } },
      ],
    },
  ],
  styling: [
    { name: "data-invalid", kind: "data", description: { tr: "`Field` üzerinde `error` varken bulunur", en: "Present while `Field` has an `error`" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Odaktaki kenarlık", en: "Focused border" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Odak halkası", en: "Focus ring" } },
    { name: "--bt-border", kind: "var", description: { tr: "Kenarlık", en: "Border" } },
    { name: "--bt-faint", kind: "var", description: { tr: "Yer tutucu rengi", en: "Placeholder colour" } },
    { name: "--bt-surface-2", kind: "var", description: { tr: "Salt okunur ve kapalı zemini", en: "Read-only and disabled background" } },
  ],
  related: ["field", "number-input", "textarea", "search-input"],
});
