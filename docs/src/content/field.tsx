import { useState, type FormEvent } from "react";
import { Button, Checkbox, Field, FileDropzone, Input, MultiSelect, NumberInput, RadioGroup, SearchInput, Select, Switch, Textarea } from "btui";
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

function Groups() {
  const t = useText();
  const [term, setTerm] = useState("30");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Ödeme vadesi", en: "Payment term" })} hint={t({ tr: "Vade fatura tarihinden başlar", en: "The term starts on the invoice date" })}>
        <RadioGroup
          orientation="horizontal"
          value={term}
          onChange={setTerm}
          options={[
            { value: "30", label: t({ tr: "30 gün", en: "30 days" }) },
            { value: "60", label: t({ tr: "60 gün", en: "60 days" }) },
            { value: "90", label: t({ tr: "90 gün", en: "90 days" }) },
          ]}
        />
      </Field>
      <Field label={t({ tr: "Fatura adresi", en: "Billing address" })}>
        <Checkbox defaultChecked label={t({ tr: "Teslimat adresiyle aynı", en: "Same as the delivery address" })} />
      </Field>
      <Field label={t({ tr: "Bildirimler", en: "Notices" })} hint={t({ tr: "Değişiklik hemen uygulanır", en: "The change applies at once" })}>
        <Switch defaultChecked label={t({ tr: "Fatura kesilince e-posta gönder", en: "Email when an invoice is issued" })} />
      </Field>
    </div>
  );
}

function Consent() {
  const t = useText();
  const [accepted, setAccepted] = useState(false);
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Ödeme koşulları", en: "Payment terms" })} error={accepted ? undefined : t({ tr: "Devam etmek için onay gerekir", en: "Approval is required to continue" })}>
        <Checkbox checked={accepted} onChange={setAccepted} label={t({ tr: "Okudum, kabul ediyorum", en: "I have read and accept them" })} />
      </Field>
    </div>
  );
}

function SearchAndFiles() {
  const t = useText();
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Müşteri ara", en: "Find a customer" })} hint={t({ tr: "Ticari unvan ya da vergi numarası", en: "Company name or tax number" })}>
        <SearchInput block />
      </Field>
      <Field label={t({ tr: "Vergi levhası", en: "Tax certificate" })} hint={t({ tr: "PDF, en çok 5 MB", en: "PDF, up to 5 MB" })}>
        <FileDropzone files={files} onChange={setFiles} accept=".pdf" maxSize={5 * 1024 * 1024} />
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
      { tr: "Tüm form denetimleri için etiket ve hata: `Input`, `Select`, `RadioGroup`, `FileDropzone` ve diğerleri", en: "Labels and errors for every form control: `Input`, `Select`, `RadioGroup`, `FileDropzone` and the rest" },
      { tr: "Biçim gerektiren alanlarda kısa `hint`: IBAN, vergi numarası", en: "A short `hint` on fields that need a format: IBAN, tax number" },
      { tr: "Sunucudan dönen hatayı alanın altında göstermek", en: "Showing an error returned by the server under its field" },
    ],
    dont: [
      { tr: "Grubu başka bir öğeyle sarmak; `RadioGroup`, `Checkbox` ve `Switch` yalnız doğrudan çocuk olarak tanınır", en: "Wrapping a group in another element; `RadioGroup`, `Checkbox` and `Switch` are only detected as a direct child" },
      { tr: "Tek `Field` içinde birden çok denetim; her denetime kendi `Field` öğesini verin", en: "Several controls in one `Field`; give each control its own `Field`" },
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
      id: "groups",
      title: { tr: "Seçenek grupları", en: "Option groups" },
      body: { tr: "`RadioGroup`, etiketli `Checkbox` ve etiketli `Switch` `Field` içinde sorunsuz çalışır: alan etiketi grubun başlığı olur, seçenekler kendi adlarını korur ve her birinin kimliği benzersizdir. Alan etiketine tıklamak bir seçeneği işaretlemez. `RadioGroup` adını bu başlıktan alır; `Checkbox` ve `Switch` kendi `label` metniyle okunur. Bu bağlantı yalnız denetim `Field` öğesinin doğrudan ve tek çocuğuysa kurulur; arada bir `div` varsa kurulmaz.", en: "`RadioGroup`, a labelled `Checkbox` and a labelled `Switch` all work inside `Field`: the field label captions the group, the options keep their own names and every id stays unique. A click on the field label ticks nothing. `RadioGroup` is named by this caption, while `Checkbox` and `Switch` are read by their own `label`. This only happens when the control is the direct and only child of `Field`; a `div` in between breaks it." },
      example: {
        Demo: Groups,
        code: `<Field label="Payment term" hint="The term starts on the invoice date">
  <RadioGroup orientation="horizontal" value={term} onChange={setTerm} options={TERMS} />
</Field>
<Field label="Billing address">
  <Checkbox defaultChecked label="Same as the delivery address" />
</Field>
<Field label="Notices" hint="The change applies at once">
  <Switch defaultChecked label="Email when an invoice is issued" />
</Field>`,
      },
    },
    {
      id: "checkbox",
      title: { tr: "Onay kutusu ile", en: "With a checkbox" },
      body: { tr: "`error` kutunun altında görünür. Başlık gerekmiyorsa `label` vermeyebilirsiniz; `Field` yine `hint` ve `error` için çalışır. Kutuyu işaretleyince hata kalkar.", en: "`error` shows under the box. If no caption is needed you can leave out `label`; `Field` still handles `hint` and `error`. Tick the box to clear the error." },
      example: {
        Demo: Consent,
        code: `<Field label="Payment terms" error={accepted ? undefined : "Approval is required to continue"}>
  <Checkbox checked={accepted} onChange={setAccepted} label="I have read and accept them" />
</Field>`,
      },
    },
    {
      id: "search-and-files",
      title: { tr: "Arama ve dosya", en: "Search and files" },
      body: { tr: "`SearchInput` ve `FileDropzone` da `Field` ile kaydolur: etiket ve açıklama içlerindeki `input` öğesine bağlanır.", en: "`SearchInput` and `FileDropzone` register with `Field` too: the label and hint link to the `input` inside them." },
      example: {
        Demo: SearchAndFiles,
        code: `<Field label="Find a customer" hint="Company name or tax number">
  <SearchInput block />
</Field>
<Field label="Tax certificate" hint="PDF, up to 5 MB">
  <FileDropzone files={files} onChange={setFiles} accept=".pdf" maxSize={5 * 1024 * 1024} />
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
    { tr: "Etiket `Input`, `Textarea`, `NumberInput`, `Select`, `MultiSelect`, `SearchInput` ve `FileDropzone` denetimlerine `for` ve `aria-labelledby` ile bağlanır.", en: "The label links to `Input`, `Textarea`, `NumberInput`, `Select`, `MultiSelect`, `SearchInput` and `FileDropzone` through `for` and `aria-labelledby`." },
    { tr: "`RadioGroup` içinde alan etiketi gruba `aria-labelledby` ile bağlanır, seçenekler kendi adını korur. Etiketli `Checkbox` ve `Switch` kendi `label` metniyle okunur; alan etiketi görsel başlıktır.", en: "With `RadioGroup` the field label links to the group through `aria-labelledby` and the options keep their names. A labelled `Checkbox` or `Switch` is read by its own `label`; the field label is a visual caption." },
    { tr: "`hint` ve `error` metni denetimin `aria-describedby` değerine eklenir. `error` varken denetim `aria-invalid` taşır.", en: "`hint` and `error` text join the control's `aria-describedby`. While `error` is set the control carries `aria-invalid`." },
    { tr: "Hata yalnız renkle anlatılmaz; ileti metni her zaman görünür.", en: "An error is never told by colour alone; the message text is always visible." },
  ],
  api: [
    {
      name: "Field",
      props: [
        { name: "children", type: "ReactNode", required: true, description: { tr: "Form denetimi", en: "The form control" } },
        { name: "label", type: "ReactNode", description: { tr: "Denetimin üstündeki etiket; `RadioGroup`, etiketli `Checkbox` ve etiketli `Switch` için grup başlığı", en: "Label above the control; the group caption for `RadioGroup`, a labelled `Checkbox` and a labelled `Switch`" } },
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
  related: ["input", "select", "radio-group", "checkbox", "switch", "date-picker"],
});
