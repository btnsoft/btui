import { useState } from "react";
import { Field, Textarea } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const LIMIT = 280;

function Basic() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Sevkiyat notu", en: "Delivery note" })}>
        <Textarea placeholder={t({ tr: "Örn. Depo girişi yalnız 09.00 ile 17.00 arası açıktır", en: "e.g. The warehouse gate is open only from 09:00 to 17:00" })} />
      </Field>
    </div>
  );
}

function Counter() {
  const t = useText();
  const [note, setNote] = useState("");
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Red gerekçesi", en: "Rejection reason" })} hint={`${note.length} / ${LIMIT}`}>
        <Textarea value={note} maxLength={LIMIT} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </div>
  );
}

function Validation() {
  const t = useText();
  const [reason, setReason] = useState("Tutar");
  const error = reason.trim().length < 20 ? t({ tr: "Gerekçe en az 20 karakter olmalıdır", en: "The reason must have at least 20 characters" }) : undefined;
  return (
    <div className="d-stack">
      <Field label={t({ tr: "İade gerekçesi", en: "Return reason" })} hint={t({ tr: "Müşteriye de gönderilir", en: "Also sent to the customer" })} error={error}>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
      </Field>
    </div>
  );
}

function Rows() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Sözleşme özel koşulları", en: "Special contract terms" })}>
        <Textarea rows={6} defaultValue={t({ tr: "Ödeme vadesi fatura tarihinden itibaren 45 gündür.\nGeciken ödemelere aylık faiz uygulanır.", en: "Payment is due 45 days after the invoice date.\nLate payments carry monthly interest." })} />
      </Field>
    </div>
  );
}

function States() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Muhasebe notu", en: "Accounting note" })}>
        <Textarea readOnly rows={2} defaultValue={t({ tr: "Ekim dönemi kapatıldı, kayıtlar kilitli.", en: "October period is closed, records are locked." })} />
      </Field>
      <Field label={t({ tr: "Müşteri yanıtı", en: "Customer reply" })}>
        <Textarea disabled rows={2} placeholder={t({ tr: "Yanıt bekleniyor", en: "Awaiting a reply" })} />
      </Field>
    </div>
  );
}

export default definePage({
  summary: { tr: "Çok satırlı metin girişi. Red gerekçesi, sevkiyat notu ve sözleşme koşulları gibi birden fazla satır gerektiren içerikler içindir.", en: "Multi-line text entry for content that needs more than one line, such as a rejection reason, a delivery note or contract terms." },
  imports: 'import { Textarea } from "btui";',
  hero: {
    Demo: Basic,
    code: `<Field label="Delivery note">
  <Textarea placeholder="e.g. The warehouse gate is open only from 09:00 to 17:00" />
</Field>`,
  },
  use: {
    do: [
      { tr: "Açıklama, gerekçe ve not gibi serbest metinler", en: "Free text such as descriptions, reasons and notes" },
      { tr: "Uzunluğu önceden bilinmeyen içerikler; kullanıcı alanı aşağı doğru büyütebilir", en: "Content of unknown length; people can drag the field taller" },
    ],
    dont: [
      { tr: "Tek satırlık değerler: unvan, referans; `Input` yeterlidir", en: "Single line values: company name, reference; `Input` is enough" },
      { tr: "Biçimli metin; bileşen kalın, liste gibi biçimleri desteklemez", en: "Rich text; the component has no bold, lists or other formatting" },
    ],
  },
  anatomy: `<Field label="Label" hint="Help text">
  <Textarea rows={4} placeholder="Value" />
</Field>`,
  examples: [
    {
      id: "counter",
      title: { tr: "Karakter sayacı", en: "Character counter" },
      body: { tr: "Sınır varsa `maxLength` ile uygulayın, kalan alanı `hint` içinde gösterin. Sayaç bileşene dahil değildir, birkaç satırla kurulur. Yazmaya başlayın.", en: "If there is a limit, enforce it with `maxLength` and show the room left in `hint`. The counter is not built in, and takes a few lines. Start typing." },
      example: {
        Demo: Counter,
        code: `const [note, setNote] = useState("");

<Field label="Rejection reason" hint={\`\${note.length} / 280\`}>
  <Textarea value={note} maxLength={280} onChange={(e) => setNote(e.target.value)} />
</Field>`,
      },
    },
    {
      id: "validation",
      title: { tr: "Doğrulama", en: "Validation" },
      body: { tr: "`Field` üzerindeki `error` alanı geçersiz yapar ve `hint` yerine görünür. Gerekçeyi tamamlayın, hata kalkar ve açıklama geri gelir.", en: "`error` on `Field` marks the field invalid and replaces `hint`. Complete the reason and the error clears, bringing the hint back." },
      example: {
        Demo: Validation,
        code: `const error = reason.trim().length < 20 ? "The reason must have at least 20 characters" : undefined;

<Field label="Return reason" hint="Also sent to the customer" error={error}>
  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
</Field>`,
      },
    },
    {
      id: "rows",
      title: { tr: "Yükseklik", en: "Height" },
      body: { tr: "`rows` başlangıç yüksekliğini belirler; en az 74px'tir. Kullanıcı sağ alt köşeden alanı dikey olarak büyütebilir. Alan içeriğe göre kendiliğinden büyümez.", en: "`rows` sets the starting height, with a minimum of 74px. People can drag the bottom right corner to make it taller. The field does not grow with its content on its own." },
      example: { Demo: Rows, code: `<Textarea rows={6} defaultValue="Payment is due 45 days after the invoice date." />` },
    },
    {
      id: "states",
      title: { tr: "Salt okunur ve kapalı", en: "Read-only and disabled" },
      body: { tr: "`readOnly` metni okutur ve seçtirir, forma gönderilir. `disabled` alanı kapatır, değer gönderilmez. İkisi de aynı soluk zemini kullanır.", en: "`readOnly` keeps the text readable and selectable, and it is submitted. `disabled` turns the field off and the value is not submitted. Both use the same muted background." },
      example: {
        Demo: States,
        code: `<Textarea readOnly rows={2} defaultValue="October period is closed, records are locked." />
<Textarea disabled rows={2} placeholder="Awaiting a reply" />`,
      },
    },
  ],
  a11y: [
    { tr: "`Field` içinde etikete, açıklamaya ve hataya otomatik bağlanır. `Field` yoksa `aria-label` verin.", en: "Inside `Field` it links to the label, hint and error automatically. Without `Field`, pass `aria-label`." },
    { tr: "`maxLength` sınıra gelince yazmayı sessizce durdurur; kalan alanı görünür kılın.", en: "`maxLength` silently stops typing at the limit, so keep the room left visible." },
  ],
  keyboard: [
    ["Tab", { tr: "Alana odaklanır, sonraki denetime geçer", en: "Moves focus into the field and on to the next control" }],
    ["Enter", { tr: "Yeni satır ekler; formu göndermez", en: "Adds a new line; it does not submit the form" }],
  ],
  api: [
    {
      name: "Textarea",
      description: { tr: "Tüm yerel `textarea` öznitelikleri ve ref iletilir; aşağıdakiler en sık kullanılanlardır. Bileşen kendi propunu eklemez.", en: "All native `textarea` attributes and the ref are forwarded; the most used ones are below. The component adds no props of its own." },
      props: [
        { name: "value", type: "string", description: { tr: "Denetimli değer", en: "Controlled value" } },
        { name: "defaultValue", type: "string", description: { tr: "Denetimsiz başlangıç değeri", en: "Uncontrolled initial value" } },
        { name: "onChange", type: "ChangeEventHandler<HTMLTextAreaElement>", description: { tr: "Yerel değişiklik olayı", en: "Native change event" } },
        { name: "rows", type: "number", description: { tr: "Başlangıç satır sayısı", en: "Starting number of rows" } },
        { name: "maxLength", type: "number", description: { tr: "En çok karakter sayısı", en: "Largest number of characters" } },
        { name: "placeholder", type: "string", description: { tr: "Boşken görünen örnek metin", en: "Sample text shown while empty" } },
        { name: "readOnly", type: "boolean", default: "false", description: { tr: "Değiştirmeyi kapatır, değer gönderilir", en: "Blocks editing, the value is still submitted" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Alanı kapatır, değer gönderilmez", en: "Turns the field off, the value is not submitted" } },
        { name: "className", type: "string", description: { tr: "`textarea` öğesine eklenen sınıf", en: "Class added to the `textarea` element" } },
      ],
    },
  ],
  styling: [
    { name: "data-invalid", kind: "data", description: { tr: "`Field` üzerinde `error` varken bulunur", en: "Present while `Field` has an `error`" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Odaktaki kenarlık", en: "Focused border" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Odak halkası", en: "Focus ring" } },
    { name: "--bt-border", kind: "var", description: { tr: "Kenarlık", en: "Border" } },
    { name: "--bt-surface-2", kind: "var", description: { tr: "Salt okunur ve kapalı zemini", en: "Read-only and disabled background" } },
  ],
  related: ["input", "field"],
});
