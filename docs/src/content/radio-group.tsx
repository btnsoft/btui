import { useState } from "react";
import { Field, Input, RadioGroup } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Payment() {
  const t = useText();
  const label = t({ tr: "Ödeme yöntemi", en: "Payment method" });
  return (
    <div className="d-stack">
      <span className="bt-label">{label}</span>
      <RadioGroup
        aria-label={label}
        defaultValue="transfer"
        options={[
          { value: "transfer", label: t({ tr: "Havale / EFT", en: "Bank transfer" }), hint: t({ tr: "Fatura tarihinden itibaren 30 gün vade", en: "Due 30 days after the invoice date" }) },
          { value: "card", label: t({ tr: "Kredi kartı", en: "Credit card" }), hint: t({ tr: "Sipariş anında tahsil edilir", en: "Charged when the order is placed" }) },
          { value: "check", label: t({ tr: "Çek", en: "Cheque" }), hint: t({ tr: "Yalnız onaylı bayiler için", en: "For approved dealers only" }) },
        ]}
      />
    </div>
  );
}

function Horizontal() {
  const t = useText();
  return (
    <RadioGroup
      aria-label={t({ tr: "Fatura türü", en: "Invoice type" })}
      orientation="horizontal"
      defaultValue="corporate"
      options={[
        { value: "corporate", label: t({ tr: "Kurumsal", en: "Corporate" }) },
        { value: "personal", label: t({ tr: "Bireysel", en: "Personal" }) },
        { value: "export", label: t({ tr: "İhracat", en: "Export" }) },
      ]}
    />
  );
}

function Conditional() {
  const t = useText();
  const [type, setType] = useState("corporate");
  return (
    <div className="d-stack">
      <RadioGroup
        aria-label={t({ tr: "Fatura türü", en: "Invoice type" })}
        orientation="horizontal"
        value={type}
        onChange={setType}
        options={[
          { value: "corporate", label: t({ tr: "Kurumsal", en: "Corporate" }) },
          { value: "personal", label: t({ tr: "Bireysel", en: "Personal" }) },
        ]}
      />
      {type === "corporate" ? (
        <Field label={t({ tr: "Vergi numarası", en: "Tax number" })}><Input inputMode="numeric" defaultValue="4210098765" /></Field>
      ) : (
        <Field label={t({ tr: "T.C. kimlik numarası", en: "National ID number" })}><Input inputMode="numeric" /></Field>
      )}
    </div>
  );
}

function DisabledOption() {
  const t = useText();
  return (
    <RadioGroup
      aria-label={t({ tr: "Kargo seçeneği", en: "Shipping option" })}
      defaultValue="standard"
      options={[
        { value: "standard", label: t({ tr: "Standart", en: "Standard" }), hint: t({ tr: "2-3 iş günü", en: "2-3 business days" }) },
        { value: "express", label: t({ tr: "Hızlı", en: "Express" }), hint: t({ tr: "Ertesi iş günü", en: "Next business day" }) },
        { value: "pallet", label: t({ tr: "Paletli", en: "Pallet" }), hint: t({ tr: "Bu sipariş için uygun değil", en: "Not available for this order" }), disabled: true },
      ]}
    />
  );
}

function DisabledGroup() {
  const t = useText();
  return (
    <RadioGroup
      aria-label={t({ tr: "Onay akışı", en: "Approval flow" })}
      disabled
      defaultValue="two"
      options={[
        { value: "one", label: t({ tr: "Tek onay", en: "Single approval" }) },
        { value: "two", label: t({ tr: "Çift onay", en: "Double approval" }) },
      ]}
    />
  );
}

function Validation() {
  const t = useText();
  const [term, setTerm] = useState("");
  return (
    <div className="d-stack">
      <span className="bt-label">{t({ tr: "Ödeme vadesi", en: "Payment term" })}</span>
      <Field error={term ? undefined : t({ tr: "Bir vade seçin", en: "Choose a term" })}>
        <RadioGroup
          aria-label={t({ tr: "Ödeme vadesi", en: "Payment term" })}
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
    </div>
  );
}

export default definePage({
  summary: { tr: "Birbirini dışlayan seçeneklerden tam olarak birini seçtirir. Tüm seçenekler görünür kaldığı için karşılaştırmayı kolaylaştırır.", en: "Picks exactly one of several mutually exclusive options. All options stay in view, which makes them easy to compare." },
  imports: 'import { RadioGroup } from "btui";',
  base: "radio-group",
  hero: {
    Demo: Payment,
    code: `<span className="bt-label">Payment method</span>
<RadioGroup
  aria-label="Payment method"
  defaultValue="transfer"
  options={[
    { value: "transfer", label: "Bank transfer", hint: "Due 30 days after the invoice date" },
    { value: "card", label: "Credit card", hint: "Charged when the order is placed" },
    { value: "check", label: "Cheque", hint: "For approved dealers only" },
  ]}
/>`,
  },
  use: {
    do: [
      { tr: "İki ile beş arası seçenek: ödeme yöntemi, fatura türü", en: "Two to five options: payment method, invoice type" },
      { tr: "Seçeneklerin açıklama gerektirdiği kararlar; `hint` farkı anlatır", en: "Decisions where options need explaining; `hint` tells them apart" },
      { tr: "Seçime göre formun değiştiği durumlar", en: "Cases where the form changes with the choice" },
    ],
    dont: [
      { tr: "Altıdan fazla seçenek; `Select` daha az yer kaplar", en: "More than six options; `Select` takes less room" },
      { tr: "Birden çok seçim; `Checkbox` kullanın", en: "Several choices; use `Checkbox`" },
      { tr: "`Field` ile `label` birlikte; alan etiketi her seçeneğin adı olur ve tıklayınca ilk seçeneği seçer", en: "`Field` with a `label`; the field label names every option and a click on it selects the first" },
    ],
  },
  anatomy: `<RadioGroup
  aria-label="Group name"
  orientation="vertical"
  value={value}
  onChange={setValue}
  options={[{ value: "a", label: "Option", hint: "Help text", disabled: false }]}
/>`,
  examples: [
    {
      id: "horizontal",
      title: { tr: "Yatay", en: "Horizontal" },
      body: { tr: "Kısa etiketli iki üç seçenek için `orientation=\"horizontal\"` yer kazandırır. Dar ekranda alt satıra geçer. Açıklamalı seçeneklerde dikey düzen daha rahat okunur.", en: "For two or three short options, `orientation=\"horizontal\"` saves room and wraps on narrow screens. Options with hints read better vertically." },
      example: {
        Demo: Horizontal,
        code: `<RadioGroup
  aria-label="Invoice type"
  orientation="horizontal"
  defaultValue="corporate"
  options={[
    { value: "corporate", label: "Corporate" },
    { value: "personal", label: "Personal" },
    { value: "export", label: "Export" },
  ]}
/>`,
      },
    },
    {
      id: "conditional",
      title: { tr: "Seçime bağlı alan", en: "Fields that depend on the choice" },
      body: { tr: "`onChange` seçilen `value` değerini verir. Fatura türüne göre vergi numarası ya da kimlik numarası gösterin. Seçimi değiştirip alanın değiştiğini görün.", en: "`onChange` gives the chosen `value`. Show a tax number or a national ID depending on the invoice type. Change the choice and watch the field change." },
      example: {
        Demo: Conditional,
        code: `const [type, setType] = useState("corporate");

<RadioGroup aria-label="Invoice type" orientation="horizontal" value={type} onChange={setType} options={TYPES} />
{type === "corporate" ? (
  <Field label="Tax number"><Input inputMode="numeric" /></Field>
) : (
  <Field label="National ID number"><Input inputMode="numeric" /></Field>
)}`,
      },
    },
    {
      id: "disabled-option",
      title: { tr: "Kapalı seçenek", en: "Disabled option" },
      body: { tr: "Şu an kullanılamayan seçeneği gizlemek yerine `disabled` ile kapatın ve nedenini `hint` içinde yazın. Kullanıcı seçeneğin neden olmadığını anlar.", en: "Rather than hiding an option that is unavailable for now, turn it off with `disabled` and put the reason in `hint`. People then see why it is not on offer." },
      example: {
        Demo: DisabledOption,
        code: `options={[
  { value: "standard", label: "Standard", hint: "2-3 business days" },
  { value: "express", label: "Express", hint: "Next business day" },
  { value: "pallet", label: "Pallet", hint: "Not available for this order", disabled: true },
]}`,
      },
    },
    {
      id: "disabled-group",
      title: { tr: "Kapalı grup", en: "Disabled group" },
      body: { tr: "`disabled` grubun tamamını kapatır. Seçili değer görünür kalır; onaylanmış kayıtlarda geçmiş kararı göstermek için uygundur.", en: "`disabled` turns off the whole group. The chosen value stays visible, which suits showing a past decision on approved records." },
      example: { Demo: DisabledGroup, code: `<RadioGroup aria-label="Approval flow" disabled defaultValue="two" options={FLOWS} />` },
    },
    {
      id: "validation",
      title: { tr: "Hata", en: "Error" },
      body: { tr: "Hata iletisi için `Field` kullanın ama `label` vermeyin; görünür başlığı ayrı yazın, adı `aria-label` ile verin. Hata yalnız metin olarak görünür, daireler kırmızıya dönmez. Bir seçenek seçince hata kalkar.", en: "Use `Field` for the error message but leave out `label`; write the visible title separately and pass the name through `aria-label`. The error shows as text only, the circles do not turn red. Choose an option to clear it." },
      example: {
        Demo: Validation,
        code: `<span className="bt-label">Payment term</span>
<Field error={term ? undefined : "Choose a term"}>
  <RadioGroup aria-label="Payment term" orientation="horizontal" value={term} onChange={setTerm} options={TERMS} />
</Field>`,
      },
    },
  ],
  a11y: [
    { tr: "`radiogroup` ve `radio` rolleri hazır gelir. Gruba `aria-label` ile ad verin; `Field` etiketi bu bileşen için uygun değildir.", en: "The `radiogroup` and `radio` roles come built in. Name the group with `aria-label`; a `Field` label does not suit this component." },
    { tr: "Her seçenek bir `label` içinde durur; daire, metin ve `hint` tek tıklama alanıdır.", en: "Each option sits inside a `label`, so the circle, text and `hint` form one click target." },
    { tr: "`hint` seçeneğin adına dahil olur ve ekran okuyucu tarafından birlikte okunur; kısa tutun.", en: "`hint` is part of the option's name and is read along with it, so keep it short." },
  ],
  keyboard: [
    ["Tab", { tr: "Seçili seçeneğe, seçim yoksa ilk seçeneğe odaklanır", en: "Moves to the chosen option, or the first one if none is chosen" }],
    ["↑ / ↓", { tr: "Önceki ya da sonraki seçeneğe geçer ve seçer", en: "Moves to the previous or next option and picks it" }],
    ["← / →", { tr: "Önceki ya da sonraki seçeneğe geçer ve seçer", en: "Moves to the previous or next option and picks it" }],
    ["Space", { tr: "Odaktaki seçeneği seçer", en: "Picks the focused option" }],
  ],
  api: [
    {
      name: "RadioGroup",
      description: { tr: "Yerel öznitelikler ve ref iletilmez; yalnız aşağıdaki proplar geçerlidir.", en: "Native attributes and the ref are not forwarded; only the props below apply." },
      props: [
        { name: "options", type: "RadioOption[]", required: true, description: { tr: "Seçenekler", en: "The options" } },
        { name: "value", type: "string", description: { tr: "Denetimli değer", en: "Controlled value" } },
        { name: "defaultValue", type: "string", description: { tr: "Denetimsiz başlangıç değeri", en: "Uncontrolled initial value" } },
        { name: "onChange", type: "(value: string) => void", description: { tr: "Seçilen değeri bildirir", en: "Reports the chosen value" } },
        { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: { tr: "Yerleşim yönü", en: "Layout direction" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Grubun tamamını kapatır", en: "Turns off the whole group" } },
        { name: "name", type: "string", description: { tr: "Form gönderiminde kullanılan ad", en: "Name used on form submission" } },
        { name: "aria-label", type: "string", description: { tr: "Grubun erişilebilir adı", en: "Accessible name of the group" } },
      ],
    },
    {
      name: "RadioOption",
      props: [
        { name: "value", type: "string", required: true, description: { tr: "Bildirilen ve gönderilen değer", en: "The value reported and submitted" } },
        { name: "label", type: "ReactNode", required: true, description: { tr: "Görünen metin", en: "The visible text" } },
        { name: "hint", type: "ReactNode", description: { tr: "Etiketin altında soluk açıklama", en: "Muted text under the label" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Seçeneği kapatır", en: "Turns the option off" } },
      ],
    },
  ],
  styling: [
    { name: "data-orientation", kind: "data", description: { tr: "Grup üzerinde yerleşim yönü", en: "The layout direction, on the group" } },
    { name: "data-checked", kind: "data", description: { tr: "Daire seçiliyken bulunur", en: "Present on the circle while chosen" } },
    { name: "data-disabled", kind: "data", description: { tr: "Daire kapalıyken bulunur", en: "Present on the circle while disabled" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "Seçili zemin ve kenarlık", en: "Chosen background and border" } },
    { name: "--bt-border", kind: "var", description: { tr: "Seçili olmayan kenarlık", en: "Border when not chosen" } },
    { name: "--bt-muted", kind: "var", description: { tr: "`hint` rengi", en: "`hint` colour" } },
  ],
  related: ["checkbox", "select", "switch", "field"],
});
