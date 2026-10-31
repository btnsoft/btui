import { useState, type FormEvent } from "react";
import { Button, Checkbox, Field, Input, MultiSelect, NumberInput, Select, Textarea } from "btui";
import { CITIES } from "../lib/data";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Customer() {
  const t = useText();
  const [city, setCity] = useState("İzmir");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Ticari unvan", en: "Company name" })} hint={t({ tr: "Fatura üzerinde görünen ad", en: "The name printed on invoices" })}>
        <Input defaultValue="Ege Tekstil A.Ş." />
      </Field>
      <Field label={t({ tr: "Fatura şehri", en: "Billing city" })}>
        <Select value={city} onChange={setCity} options={CITIES} />
      </Field>
    </div>
  );
}

function Hint() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "IBAN", en: "IBAN" })} hint={t({ tr: "26 karakter, TR ile başlar", en: "26 characters, starts with TR" })}>
        <Input placeholder="TR00 0000 0000 0000 0000 0000 00" />
      </Field>
    </div>
  );
}

function Validation() {
  const t = useText();
  const [taxNo, setTaxNo] = useState("12345");
  const error = taxNo.length === 10 ? undefined : t({ tr: "Vergi numarası 10 haneli olmalıdır", en: "Tax number must have 10 digits" });
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Vergi numarası", en: "Tax number" })} hint={t({ tr: "10 haneli, boşluksuz", en: "10 digits, no spaces" })} error={error}>
        <Input value={taxNo} inputMode="numeric" onChange={(e) => setTaxNo(e.target.value.replace(/\D/g, ""))} />
      </Field>
    </div>
  );
}

function Controls() {
  const t = useText();
  const [owner, setOwner] = useState("");
  const [regions, setRegions] = useState<string[]>(["İstanbul", "Bursa"]);
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Sipariş sorumlusu", en: "Order owner" })} error={owner ? undefined : t({ tr: "Bir sorumlu seçin", en: "Choose an owner" })}>
        <Select value={owner} onChange={setOwner} options={[{ value: "ada", label: "Ada Yılmaz" }, { value: "can", label: "Can Demir" }, { value: "elif", label: "Elif Kaya" }]} />
      </Field>
      <Field label={t({ tr: "Sevkiyat bölgeleri", en: "Delivery regions" })}>
        <MultiSelect variant="field" value={regions} onChange={setRegions} options={CITIES} />
      </Field>
      <Field label={t({ tr: "Kredi limiti", en: "Credit limit" })} hint={t({ tr: "Yöneticinin onayı gerekir", en: "Needs a manager's approval" })}>
        <NumberInput defaultValue={150000} step={5000} min={0} format={{ style: "currency", currency: "TRY", maximumFractionDigits: 0 }} />
      </Field>
      <Field label={t({ tr: "Müşteri notu", en: "Customer note" })}>
        <Textarea rows={2} />
      </Field>
    </div>
  );
}

function Consent() {
  const t = useText();
  const [accepted, setAccepted] = useState(false);
  return (
    <div className="d-stack">
      <Field error={accepted ? undefined : t({ tr: "Devam etmek için onay gerekir", en: "Approval is required to continue" })}>
        <Checkbox checked={accepted} onChange={setAccepted} label={t({ tr: "Ödeme koşullarını okudum, kabul ediyorum", en: "I have read and accept the payment terms" })} />
      </Field>
    </div>
  );
}

function PurchaseForm() {
  const t = useText();
  const [sent, setSent] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))));
  };
  return (
    <form className="d-stack" onSubmit={submit}>
      <Field name="poNumber" label={t({ tr: "Satın alma no", en: "Purchase order no" })}>
        <Input defaultValue="PO-2026-118" />
      </Field>
      <Field name="quantity" label={t({ tr: "Adet", en: "Quantity" })}>
        <NumberInput defaultValue={24} min={1} />
      </Field>
      <Button type="submit" variant="primary">{t({ tr: "Gönder", en: "Submit" })}</Button>
      {sent ? <code>{sent}</code> : null}
    </form>
  );
}

export default definePage({
  summary: { tr: "Bir form denetimine etiket, açıklama ve hata iletisi bağlar. Etiket, kontrol ve mesaj arasındaki erişilebilirlik bağlantılarını sizin yerinize kurar.", en: "Attaches a label, a hint and an error message to a form control. It wires the accessibility links between them for you." },
  imports: 'import { Field } from "btui";',
  base: "field",
  hero: {
    Demo: Customer,
    code: `const [city, setCity] = useState("İzmir");

<Field label="Company name" hint="The name printed on invoices">
  <Input defaultValue="Ege Tekstil A.Ş." />
</Field>
<Field label="Billing city">
  <Select value={city} onChange={setCity} options={CITIES} />
</Field>`,
  },
  use: {
    do: [
      { tr: "`Input`, `Textarea`, `NumberInput`, `Select` ve `MultiSelect` için etiket ve hata", en: "Labels and errors for `Input`, `Textarea`, `NumberInput`, `Select` and `MultiSelect`" },
      { tr: "Biçim gerektiren alanlarda kısa `hint`: IBAN, vergi numarası", en: "A short `hint` on fields that need a format: IBAN, tax number" },
      { tr: "Sunucudan dönen hatayı alanın altında göstermek", en: "Showing an error returned by the server under its field" },
    ],
    dont: [
      { tr: "`RadioGroup` ile `label`; alan etiketi seçeneklerin adının yerine geçer ve tıklayınca ilk seçeneği işaretler", en: "`label` with `RadioGroup`; the field label replaces the option names and a click on it selects the first option" },
      { tr: "`SearchInput` ve `FileDropzone`; `Field` bu ikisine bağlanamaz, etiket boşa düşer", en: "`SearchInput` and `FileDropzone`; `Field` cannot link to these two, so the label goes nowhere" },
      { tr: "Uzun açıklamalar; bir satırı aşan bilgi için `Alert` kullanın", en: "Long explanations; use `Alert` for anything beyond one line" },
    ],
  },
  anatomy: `<Field label="Label" hint="Help text" error="Error message" name="fieldName">
  <Input />
</Field>`,
  examples: [
    {
      id: "hint",
      title: { tr: "Açıklama", en: "Hint" },
      body: { tr: "`hint` etiketin söyleyemediğini söyler: beklenen biçim, uzunluk ya da bilginin nerede kullanılacağı. Kontrole `aria-describedby` ile bağlanır.", en: "`hint` says what the label cannot: the expected format, the length or where the value will be used. It is linked to the control through `aria-describedby`." },
      example: { Demo: Hint, code: `<Field label="IBAN" hint="26 characters, starts with TR">\n  <Input placeholder="TR00 0000 0000 0000 0000 0000 00" />\n</Field>` },
    },
    {
      id: "error",
      title: { tr: "Hata", en: "Error" },
      body: { tr: "`error` dolu olduğu sürece alan geçersiz sayılır, kenarlık kırmızıya döner ve ileti `hint` yerine geçer. Ne yapılması gerektiğini söyleyin: \"Geçersiz\" yerine \"10 haneli olmalıdır\". Numarayı tamamlayıp hatanın kalktığını görün.", en: "While `error` has a value the field is invalid, its border turns red and the message replaces `hint`. Say what to do: \"Must have 10 digits\" beats \"Invalid\". Complete the number to see the error clear." },
      example: {
        Demo: Validation,
        code: `const [taxNo, setTaxNo] = useState("12345");
const error = taxNo.length === 10 ? undefined : "Tax number must have 10 digits";

<Field label="Tax number" hint="10 digits, no spaces" error={error}>
  <Input value={taxNo} inputMode="numeric" onChange={(e) => setTaxNo(e.target.value.replace(/\\D/g, ""))} />
</Field>`,
      },
    },
    {
      id: "controls",
      title: { tr: "Farklı denetimlerle", en: "With other controls" },
      body: { tr: "`Select`, `MultiSelect`, `NumberInput` ve `Textarea` da etiketini ve hatasını `Field` üzerinden alır. `MultiSelect` varsayılan olarak filtre görünümündedir, formda `variant=\"field\"` verin.", en: "`Select`, `MultiSelect`, `NumberInput` and `Textarea` also take their label and error from `Field`. `MultiSelect` looks like a filter by default, so pass `variant=\"field\"` in forms." },
      example: {
        Demo: Controls,
        code: `<Field label="Order owner" error={owner ? undefined : "Choose an owner"}>
  <Select value={owner} onChange={setOwner} options={OWNERS} />
</Field>
<Field label="Delivery regions">
  <MultiSelect variant="field" value={regions} onChange={setRegions} options={CITIES} />
</Field>
<Field label="Credit limit" hint="Needs a manager's approval">
  <NumberInput defaultValue={150000} step={5000} min={0} format={{ style: "currency", currency: "TRY", maximumFractionDigits: 0 }} />
</Field>
<Field label="Customer note">
  <Textarea rows={2} />
</Field>`,
      },
    },
    {
      id: "checkbox",
      title: { tr: "Onay kutusu ile", en: "With a checkbox" },
      body: { tr: "`Checkbox` ve `Switch` kendi etiketini taşır, bu yüzden `Field` üzerinde `label` vermeyin; yalnız `hint` ve `error` kullanın. İkisini birlikte verirseniz denetimin adı alan etiketi olur, kendi etiketi okunmaz.", en: "`Checkbox` and `Switch` carry their own label, so leave out `label` on `Field` and use only `hint` and `error`. With both, the control is named by the field label and its own label is not read." },
      example: {
        Demo: Consent,
        code: `<Field error={accepted ? undefined : "Approval is required to continue"}>
  <Checkbox checked={accepted} onChange={setAccepted} label="I have read and accept the payment terms" />
</Field>`,
      },
    },
    {
      id: "form",
      title: { tr: "Form gönderimi", en: "Form submission" },
      body: { tr: "`name` değerini `Field` üzerine yazabilirsiniz; içindeki denetim bu adla gönderilir ve denetimin kendi `name` değerinin önüne geçer. Formu gönderip çıkan veriye bakın.", en: "You can set `name` on `Field`; the control inside submits under it, and it takes precedence over the control's own `name`. Submit the form to see the data." },
      example: {
        Demo: PurchaseForm,
        code: `<form onSubmit={submit}>
  <Field name="poNumber" label="Purchase order no">
    <Input defaultValue="PO-2026-118" />
  </Field>
  <Field name="quantity" label="Quantity">
    <NumberInput defaultValue={24} min={1} />
  </Field>
  <Button type="submit" variant="primary">Submit</Button>
</form>`,
      },
    },
  ],
  a11y: [
    { tr: "Etiket `Input`, `Textarea`, `NumberInput`, `Select` ve `MultiSelect` denetimlerine `for` ve `aria-labelledby` ile bağlanır.", en: "The label links to `Input`, `Textarea`, `NumberInput`, `Select` and `MultiSelect` through `for` and `aria-labelledby`." },
    { tr: "`hint` ve `error` metni denetimin `aria-describedby` değerine eklenir. `error` varken denetim `aria-invalid` taşır.", en: "`hint` and `error` text join the control's `aria-describedby`. While `error` is set the control carries `aria-invalid`." },
    { tr: "`SearchInput` ve `FileDropzone` bu bağlantıyı kuramaz. `SearchInput` için `aria-label`, `FileDropzone` için `title` kullanın.", en: "`SearchInput` and `FileDropzone` cannot make these links. Use `aria-label` on `SearchInput` and `title` on `FileDropzone`." },
    { tr: "Hata yalnız renkle anlatılmaz; ileti metni her zaman görünür.", en: "An error is never told by colour alone; the message text is always visible." },
  ],
  api: [
    {
      name: "Field",
      props: [
        { name: "children", type: "ReactNode", required: true, description: { tr: "Form denetimi", en: "The form control" } },
        { name: "label", type: "ReactNode", description: { tr: "Denetimin üstündeki etiket", en: "Label above the control" } },
        { name: "hint", type: "ReactNode", description: { tr: "Denetimin altındaki açıklama", en: "Help text under the control" } },
        { name: "error", type: "ReactNode", description: { tr: "Doluysa alanı geçersiz yapar ve `hint` yerine görünür", en: "When set, marks the field invalid and replaces `hint`" } },
        { name: "name", type: "string", description: { tr: "Form gönderiminde kullanılan ad; denetimin `name` değerinin önüne geçer", en: "Name used on form submission; takes precedence over the control's `name`" } },
        { name: "className", type: "string", description: { tr: "Kök öğeye eklenen sınıf", en: "Class added to the root element" } },
      ],
    },
  ],
  styling: [
    { name: "data-invalid", kind: "data", description: { tr: "Kök, etiket ve denetim üzerinde; `error` doluyken bulunur", en: "On the root, label and control; present while `error` is set" } },
    { name: "--bt-danger", kind: "var", description: { tr: "Hata metni ve geçersiz kenarlık", en: "Error text and invalid border" } },
    { name: "--bt-text-2", kind: "var", description: { tr: "Etiket rengi", en: "Label colour" } },
    { name: "--bt-muted", kind: "var", description: { tr: "Açıklama rengi", en: "Hint colour" } },
  ],
  related: ["input", "select", "number-input", "textarea"],
});
