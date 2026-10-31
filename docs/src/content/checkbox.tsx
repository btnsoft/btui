import { useState, type FormEvent } from "react";
import { Button, Checkbox, Field } from "btui";
import { ORDERS, money } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const INVOICES = ORDERS.slice(0, 3);

function Notifications() {
  const t = useText();
  return (
    <div className="d-stack">
      <Checkbox defaultChecked label={t({ tr: "Fatura kesildiğinde e-posta gönder", en: "Email me when an invoice is issued" })} />
      <Checkbox defaultChecked label={t({ tr: "Ödeme alındığında bildir", en: "Notify me when a payment arrives" })} />
      <Checkbox label={t({ tr: "Vadesi geçen faturaları günlük özetle", en: "Summarise overdue invoices daily" })} />
    </div>
  );
}

function Controlled() {
  const t = useText();
  const lang = useLang();
  const [invoice, setInvoice] = useState(true);
  return (
    <div className="d-stack">
      <Checkbox checked={invoice} onChange={setInvoice} label={t({ tr: "Fatura ayrı adrese gönderilsin", en: "Send the invoice to a separate address" })} />
      <span>{invoice ? t({ tr: `Ek ücret: ${money(45, lang)}`, en: `Extra fee: ${money(45, lang)}` }) : t({ tr: "Ek ücret yok", en: "No extra fee" })}</span>
    </div>
  );
}

function SelectAll() {
  const t = useText();
  const lang = useLang();
  const [chosen, setChosen] = useState<number[]>([INVOICES[0].id]);
  const all = chosen.length === INVOICES.length;
  const some = chosen.length > 0 && !all;
  const toggle = (id: number) => (on: boolean) => setChosen(on ? [...chosen, id] : chosen.filter((item) => item !== id));
  return (
    <div className="d-stack">
      <Checkbox
        checked={all}
        indeterminate={some}
        onChange={(on) => setChosen(on ? INVOICES.map((o) => o.id) : [])}
        label={t({ tr: `Tüm faturalar (${chosen.length} / ${INVOICES.length})`, en: `All invoices (${chosen.length} of ${INVOICES.length})` })}
      />
      <div style={{ display: "grid", gap: 8, paddingLeft: 24 }}>
        {INVOICES.map((o) => (
          <Checkbox key={o.id} checked={chosen.includes(o.id)} onChange={toggle(o.id)} label={`${o.no} · ${o.customer} · ${money(o.amount, lang)}`} />
        ))}
      </div>
    </div>
  );
}

function Hints() {
  const t = useText();
  return (
    <div className="d-stack">
      <Checkbox defaultChecked label={t({ tr: "E-fatura mükellefi", en: "E-invoice taxpayer" })} hint={t({ tr: "Faturalar e-belge olarak düzenlenir", en: "Invoices are issued as e-documents" })} />
      <Checkbox label={t({ tr: "KDV'den muaf", en: "VAT exempt" })} hint={t({ tr: "Muafiyet belgesi cari kartına eklenmelidir", en: "Attach the exemption certificate to the account" })} />
    </div>
  );
}

function Disabled() {
  const t = useText();
  return (
    <div className="d-stack">
      <Checkbox disabled defaultChecked label={t({ tr: "KDV dahil (yasal zorunluluk)", en: "VAT included (legal requirement)" })} />
      <Checkbox disabled label={t({ tr: "E-arşiv (paketinizde yok)", en: "E-archive (not in your plan)" })} />
    </div>
  );
}

function NoLabel() {
  const t = useText();
  const [checked, setChecked] = useState(false);
  return (
    <>
      <Checkbox checked={checked} onChange={setChecked} aria-label={t({ tr: "SP-1040 siparişini seç", en: "Select order SP-1040" })} />
      <span>SP-1040 · Mavi Yapı</span>
    </>
  );
}

function Consent() {
  const t = useText();
  const [accepted, setAccepted] = useState(false);
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Bayilik sözleşmesi", en: "Dealer contract" })} hint={t({ tr: "Sözleşme her yıl yenilenir", en: "The contract renews every year" })} error={accepted ? undefined : t({ tr: "Devam etmek için kabul edin", en: "Accept to continue" })}>
        <Checkbox checked={accepted} onChange={setAccepted} label={t({ tr: "Okudum, kabul ediyorum", en: "I have read and accept it" })} />
      </Field>
    </div>
  );
}

function InForm() {
  const t = useText();
  const [sent, setSent] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))));
  };
  return (
    <form className="d-stack" onSubmit={submit}>
      <Checkbox name="eInvoice" defaultChecked label={t({ tr: "E-fatura mükellefi", en: "E-invoice taxpayer" })} />
      <Checkbox name="exempt" label={t({ tr: "KDV'den muaf", en: "VAT exempt" })} />
      <Checkbox name="terms" required label={t({ tr: "Koşulları kabul ediyorum", en: "I accept the terms" })} />
      <Button type="submit" variant="primary">{t({ tr: "Kaydet", en: "Save" })}</Button>
      {sent ? <code>{sent}</code> : null}
    </form>
  );
}

export default definePage({
  summary: { tr: "Bağımsız bir seçeneği açar ya da kapatır. Ayarlar listelerinde, toplu seçimde ve onay metinlerinde kullanılır; değişiklik genelde kaydet düğmesiyle uygulanır.", en: "Turns an independent option on or off. It is used in settings lists, bulk selection and consent lines, and the change usually applies with a save button." },
  imports: 'import { Checkbox } from "btui";',
  base: "checkbox",
  hero: {
    Demo: Notifications,
    code: `<Checkbox defaultChecked label="Email me when an invoice is issued" />
<Checkbox defaultChecked label="Notify me when a payment arrives" />
<Checkbox label="Summarise overdue invoices daily" />`,
  },
  use: {
    do: [
      { tr: "Birbirinden bağımsız seçenekler; hepsi birlikte seçilebilir", en: "Options independent of each other; all can be on together" },
      { tr: "Kaydet düğmesiyle uygulanacak form seçimleri", en: "Form choices that apply when saved" },
      { tr: "Tablolarda toplu seçim; üst kutu `indeterminate` ile kısmi seçimi gösterir", en: "Bulk selection in tables; the top box shows a partial choice with `indeterminate`" },
    ],
    dont: [
      { tr: "Tek bir seçenek zorunluysa; `RadioGroup` kullanın", en: "When exactly one option is required; use `RadioGroup`" },
      { tr: "Anında uygulanan ayarlar; `Switch` bu beklentiyi doğru verir", en: "Settings that apply at once; `Switch` sets the right expectation" },
      { tr: "Olumsuz ifadeler: \"Bildirim gönderme\"; işaretin anlamı karışır", en: "Negative wording such as \"Do not notify\"; the meaning of a tick gets confusing" },
    ],
  },
  anatomy: `<Checkbox checked={checked} indeterminate={false} onChange={setChecked} label="Label" />`,
  examples: [
    {
      id: "controlled",
      title: { tr: "Denetimli kullanım", en: "Controlled" },
      body: { tr: "`onChange` olay nesnesi yerine doğrudan yeni durumu verir. Durumu kendiniz tutuyorsanız `checked`, yalnız başlangıç değeri vermek için `defaultChecked` kullanın.", en: "`onChange` gives the new state directly, not an event. Use `checked` when you hold the state, and `defaultChecked` when you only set the starting value." },
      example: { Demo: Controlled, code: `const [invoice, setInvoice] = useState(true);\n\n<Checkbox checked={invoice} onChange={setInvoice} label="Send the invoice to a separate address" />` },
    },
    {
      id: "indeterminate",
      title: { tr: "Kısmi seçim", en: "Partial selection" },
      body: { tr: "`indeterminate` çocuklardan bir bölümü seçiliyken üst kutuyu çizgiyle gösterir. Durumu bileşen hesaplamaz, sizin vermeniz gerekir. Kutu tıklandığında `onChange` bir sonraki değeri bildirir.", en: "`indeterminate` shows the parent box with a dash while only some children are chosen. The component does not work this out, so you pass it in. On click, `onChange` reports the next value." },
      example: {
        Demo: SelectAll,
        code: `const all = chosen.length === invoices.length;
const some = chosen.length > 0 && !all;

<Checkbox
  checked={all}
  indeterminate={some}
  onChange={(on) => setChosen(on ? invoices.map((o) => o.id) : [])}
  label="All invoices"
/>`,
      },
    },
    {
      id: "hints",
      title: { tr: "Açıklama satırı", en: "Hint text" },
      body: { tr: "Seçeneğin sonucu etiketten anlaşılmıyorsa `hint` ile tek cümlede anlatın. Açıklama da tıklanabilir alanın içindedir.", en: "When a label does not explain the outcome, use `hint` for one sentence. The hint is part of the clickable area too." },
      example: {
        Demo: Hints,
        code: `<Checkbox
  defaultChecked
  label="E-invoice taxpayer"
  hint="Invoices are issued as e-documents"
/>`,
      },
    },
    {
      id: "without-label",
      title: { tr: "Etiketsiz", en: "Without a label" },
      body: { tr: "Tablo satırı gibi bağlamın görsel olarak açık olduğu yerlerde `label` vermeyebilirsiniz. Bu durumda `aria-label` şarttır ve kayıt numarasını içermelidir.", en: "Where the context is visually clear, as in a table row, you can leave out `label`. Then `aria-label` is a must and should include the record number." },
      example: { Demo: NoLabel, code: `<Checkbox checked={checked} onChange={setChecked} aria-label="Select order SP-1040" />` },
    },
    {
      id: "disabled",
      title: { tr: "Kapalı", en: "Disabled" },
      body: { tr: "Seçilemeyen ya da zorunlu seçenekleri `disabled` ile gösterin. Nedenini etikette söyleyin. Kapalı kutular forma gönderilmez.", en: "Show options that cannot change with `disabled`, and give the reason in the label. Disabled boxes are not submitted." },
      example: { Demo: Disabled, code: `<Checkbox disabled defaultChecked label="VAT included (legal requirement)" />\n<Checkbox disabled label="E-archive (not in your plan)" />` },
    },
    {
      id: "consent",
      title: { tr: "Onay ve hata", en: "Consent and errors" },
      body: { tr: "`Field` başlık, açıklama ve hatayı verir. Alan etiketi kutunun üstünde başlık olur, kutu kendi `label` metniyle okunur. `Checkbox` `Field` öğesinin doğrudan çocuğu olmalıdır.", en: "`Field` gives the caption, hint and error. The field label sits above as a caption, and the box is read by its own `label`. `Checkbox` must be a direct child of `Field`." },
      example: {
        Demo: Consent,
        code: `<Field label="Dealer contract" hint="The contract renews every year" error={accepted ? undefined : "Accept to continue"}>
  <Checkbox checked={accepted} onChange={setAccepted} label="I have read and accept it" />
</Field>`,
      },
    },
    {
      id: "form",
      title: { tr: "Form gönderimi", en: "Form submission" },
      body: { tr: "İşaretli kutu `name` ile `on` değerini gönderir, işaretsiz kutu hiç gönderilmez. `required` işaretlenmeden gönderimi durdurur. Formu gönderip farkı görün.", en: "A ticked box submits `on` under its `name`, while an unticked box is not sent at all. `required` stops the submission until it is ticked. Submit the form to see the difference." },
      example: {
        Demo: InForm,
        code: `<form onSubmit={submit}>
  <Checkbox name="eInvoice" defaultChecked label="E-invoice taxpayer" />
  <Checkbox name="exempt" label="VAT exempt" />
  <Checkbox name="terms" required label="I accept the terms" />
  <Button type="submit" variant="primary">Save</Button>
</form>`,
      },
    },
  ],
  a11y: [
    { tr: "`checkbox` rolü ve `aria-checked` hazır gelir; `indeterminate` durumunda `aria-checked=\"mixed\"` yazılır.", en: "The `checkbox` role and `aria-checked` come built in; `indeterminate` writes `aria-checked=\"mixed\"`." },
    { tr: "`label` verildiğinde kutu ve metin tek bir tıklama alanı olur.", en: "With `label`, the box and the text form one click target." },
    { tr: "`label` yoksa `aria-label` şarttır; aksi halde kutunun adı olmaz.", en: "Without `label`, `aria-label` is a must; otherwise the box has no name." },
  ],
  keyboard: [
    ["Tab", { tr: "Kutuya odaklanır", en: "Moves focus to the box" }],
    ["Space", { tr: "İşareti değiştirir", en: "Toggles the box" }],
    ["Enter", { tr: "İşareti değiştirmez; form içindeyse formu gönderir", en: "Does not toggle; submits the form, when inside one" }],
  ],
  api: [
    {
      name: "Checkbox",
      description: { tr: "Yerel öznitelikler ve ref iletilmez; yalnız aşağıdaki proplar geçerlidir.", en: "Native attributes and the ref are not forwarded; only the props below apply." },
      props: [
        { name: "checked", type: "boolean", description: { tr: "Denetimli durum", en: "Controlled state" } },
        { name: "defaultChecked", type: "boolean", default: "false", description: { tr: "Denetimsiz başlangıç durumu", en: "Uncontrolled initial state" } },
        { name: "indeterminate", type: "boolean", default: "false", description: { tr: "Kısmi seçimi gösterir", en: "Shows a partial selection" } },
        { name: "onChange", type: "(checked: boolean) => void", description: { tr: "Yeni durumu bildirir", en: "Reports the new state" } },
        { name: "label", type: "ReactNode", description: { tr: "Kutunun yanındaki metin", en: "Text beside the box" } },
        { name: "hint", type: "ReactNode", description: { tr: "Etiketin altında soluk açıklama. `label` ile birlikte görünür", en: "Quieter text under the label. Shown together with `label`" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Kutuyu kapatır", en: "Turns the box off" } },
        { name: "required", type: "boolean", default: "false", description: { tr: "İşaretlenmeden formun gönderilmesini engeller", en: "Blocks form submission until the box is ticked" } },
        { name: "className", type: "string", description: { tr: "Dış öğeye eklenir", en: "Added to the outer element" } },
        { name: "name", type: "string", description: { tr: "Form gönderiminde kullanılan ad", en: "Name used on form submission" } },
        { name: "aria-label", type: "string", description: { tr: "`label` yoksa erişilebilir ad", en: "Accessible name when there is no `label`" } },
      ],
    },
  ],
  styling: [
    { name: "data-checked", kind: "data", description: { tr: "İşaretliyken bulunur", en: "Present while ticked" } },
    { name: "data-indeterminate", kind: "data", description: { tr: "Kısmi seçimde bulunur", en: "Present on a partial selection" } },
    { name: "data-disabled", kind: "data", description: { tr: "Kapalıyken bulunur", en: "Present while disabled" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "İşaretli zemin ve kenarlık", en: "Ticked background and border" } },
    { name: "--bt-border", kind: "var", description: { tr: "İşaretsiz kenarlık", en: "Unticked border" } },
    { name: "--bt-radius", kind: "var", description: { tr: "Köşe yarıçapı", en: "Corner radius" } },
  ],
  related: ["switch", "radio-group", "field", "data-table"],
});
