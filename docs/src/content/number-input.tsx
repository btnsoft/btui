import { useRef, useState } from "react";
import { Button, Field, NumberInput } from "btui";
import { money } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Quantity() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Sipariş adedi", en: "Order quantity" })} hint={t({ tr: "En az 1, en çok 500", en: "At least 1, at most 500" })}>
        <NumberInput defaultValue={12} min={1} max={500} />
      </Field>
    </div>
  );
}

function Currency() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Fatura tutarı", en: "Invoice amount" })}>
        <NumberInput hideSteppers defaultValue={18450.75} format={{ style: "currency", currency: "TRY" }} />
      </Field>
    </div>
  );
}

function Percent() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "İskonto oranı", en: "Discount rate" })} hint={t({ tr: "En çok %50", en: "At most 50%" })}>
        <NumberInput defaultValue={0.15} min={0} max={0.5} step={0.05} format={{ style: "percent" }} />
      </Field>
    </div>
  );
}

function Step() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Palet başına koli", en: "Boxes per pallet" })} hint={t({ tr: "Koliler 25'er artar", en: "Boxes go up in 25s" })}>
        <NumberInput defaultValue={100} min={25} step={25} />
      </Field>
    </div>
  );
}

function Controlled() {
  const t = useText();
  const lang = useLang();
  const [quantity, setQuantity] = useState<number | null>(8);
  const total = (quantity ?? 0) * 1450;
  return (
    <div className="d-stack">
      <Field
        label={t({ tr: "Adet", en: "Quantity" })}
        hint={t({ tr: `Toplam: ${money(total, lang)}`, en: `Total: ${money(total, lang)}` })}
        error={quantity === null ? t({ tr: "Adet boş bırakılamaz", en: "Quantity cannot be empty" }) : undefined}
      >
        <NumberInput value={quantity} onChange={setQuantity} min={1} />
      </Field>
    </div>
  );
}

function Disabled() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Onaylanan limit", en: "Approved limit" })} hint={t({ tr: "Onaydan sonra değiştirilemez", en: "Cannot change after approval" })}>
        <NumberInput disabled defaultValue={250000} format={{ style: "currency", currency: "TRY", maximumFractionDigits: 0 }} />
      </Field>
    </div>
  );
}

function Adornments() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Birim fiyat", en: "Unit price" })}>
        <NumberInput hideSteppers defaultValue={1450} prefix="₺" />
      </Field>
      <Field label={t({ tr: "Koli ağırlığı", en: "Box weight" })}>
        <NumberInput defaultValue={18} min={1} suffix="kg" />
      </Field>
    </div>
  );
}

function FocusField() {
  const t = useText();
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Sayılan stok", en: "Counted stock" })}>
        <NumberInput ref={input} defaultValue={0} min={0} />
      </Field>
      <div><Button size="sm" onClick={() => input.current?.select()}>{t({ tr: "Sonraki rafa geç", en: "Next shelf" })}</Button></div>
    </div>
  );
}

export default definePage({
  summary: { tr: "Sayısal değer girişi. Sınırları, adımı ve dile uygun biçimi sizin yerinize yönetir; adet, tutar ve oran alanları için uygundur.", en: "Numeric entry that manages limits, steps and locale-aware formatting for you. It suits quantity, amount and rate fields." },
  imports: 'import { NumberInput } from "btui";',
  base: "number-field",
  hero: {
    Demo: Quantity,
    code: `<Field label="Order quantity" hint="At least 1, at most 500">
  <NumberInput defaultValue={12} min={1} max={500} />
</Field>`,
  },
  use: {
    do: [
      { tr: "Sınırı olan değerler: adet, koli, gün sayısı", en: "Values with limits: quantity, boxes, number of days" },
      { tr: "Dile göre biçimlenmesi gereken tutar ve oranlar", en: "Amounts and rates that must follow the locale's format" },
      { tr: "Küçük adımlarla ayarlanan değerler; artırma ve azaltma düğmeleri işi hızlandırır", en: "Values tuned in small steps; the minus and plus buttons speed this up" },
    ],
    dont: [
      { tr: "Rakamlardan oluşan kimlikler: vergi numarası, telefon, IBAN; bunlar sayı değil metindir, `Input` kullanın", en: "Identifiers made of digits: tax number, phone, IBAN; these are text, so use `Input`" },
      { tr: "Büyük tutarlarda artırma düğmeleri; `hideSteppers` ile kaldırın", en: "Steppers on large amounts; remove them with `hideSteppers`" },
      { tr: "Az sayıda sabit seçenek; `Select` ya da `RadioGroup` daha hızlıdır", en: "A few fixed choices; `Select` or `RadioGroup` is faster" },
    ],
  },
  anatomy: `<Field label="Label">
  <NumberInput value={value} onChange={setValue} min={0} max={100} step={1} prefix="₺" suffix="kg" required name="fieldName" />
</Field>`,
  examples: [
    {
      id: "currency",
      title: { tr: "Para birimi", en: "Currency" },
      body: { tr: "`format` değeri `Intl.NumberFormat` seçenekleridir. Binlik ayracı ve ondalık işareti `BtuiProvider` dilinden gelir. Büyük tutarlarda `hideSteppers` ile düğmeleri kaldırın.", en: "`format` takes `Intl.NumberFormat` options. Grouping and decimal marks follow the `BtuiProvider` language. Remove the buttons on large amounts with `hideSteppers`." },
      example: { Demo: Currency, code: `<NumberInput hideSteppers defaultValue={18450.75} format={{ style: "currency", currency: "TRY" }} />` },
    },
    {
      id: "adornments",
      title: { tr: "Ön ek ve son ek", en: "Prefix and suffix" },
      body: { tr: "`prefix` değerin önüne, `suffix` arkasına sabit bir içerik koyar: para işareti, `kg`, `adet`. İçerik girdinin parçası değildir, değerle birlikte gönderilmez ve `onChange` yalnız sayıyı bildirir. Birimi ekranda göstermek için en kısa yol budur. Tam para biçimi için `format` kullanın; ikisini birlikte vermeyin, işaret iki kez görünür.", en: "`prefix` puts fixed content before the value and `suffix` after it: a currency sign, `kg`, `pcs`. It is not part of the input, is not submitted with the value, and `onChange` reports only the number. This is the shortest way to show a unit. Use `format` for a full money format, and do not pass both, or the sign shows twice." },
      example: { Demo: Adornments, code: `<NumberInput hideSteppers defaultValue={1450} prefix="₺" />\n<NumberInput defaultValue={18} min={1} suffix="kg" />` },
    },
    {
      id: "percent",
      title: { tr: "Yüzde", en: "Percent" },
      body: { tr: "`format={{ style: \"percent\" }}` ile değer 0 ile 1 arasında bir oran olarak tutulur, ekranda yüzde görünür. `0.15` değeri %15 demektir. `min`, `max` ve `step` de aynı ölçektedir.", en: "With `format={{ style: \"percent\" }}` the value stays a fraction between 0 and 1 and shows as a percentage. `0.15` means 15%. `min`, `max` and `step` use the same scale." },
      example: { Demo: Percent, code: `<NumberInput defaultValue={0.15} min={0} max={0.5} step={0.05} format={{ style: "percent" }} />` },
    },
    {
      id: "step",
      title: { tr: "Adım", en: "Step" },
      body: { tr: "`step` düğmelerin ve ok tuşlarının artış miktarıdır. Koli gibi belirli katlarla satılan ürünlerde işe yarar.", en: "`step` is the amount added by the buttons and arrow keys. It helps with goods sold in fixed multiples, such as boxes." },
      example: { Demo: Step, code: `<NumberInput defaultValue={100} min={25} step={25} />` },
    },
    {
      id: "controlled",
      title: { tr: "Denetimli kullanım", en: "Controlled" },
      body: { tr: "`onChange` sayı verir, alan boşalınca `null` verir. Bu değeri mutlaka karşılayın; aşağıda boş adet toplamı sıfırlar ve hata gösterir. Değeri silip deneyin.", en: "`onChange` gives a number, and `null` when the field is empty. Always handle that case; below, an empty quantity resets the total and shows an error. Clear the value to try." },
      example: {
        Demo: Controlled,
        code: `const [quantity, setQuantity] = useState<number | null>(8);
const total = (quantity ?? 0) * 1450;

<Field
  label="Quantity"
  hint={\`Total: \${money(total, "en")}\`}
  error={quantity === null ? "Quantity cannot be empty" : undefined}
>
  <NumberInput value={quantity} onChange={setQuantity} min={1} />
</Field>`,
      },
    },
    {
      id: "ref",
      title: { tr: "Ref ile odak", en: "Focus through a ref" },
      body: { tr: "`ref` gerçek `input` öğesine iletilir, bu yüzden `focus` ve `select` doğrudan çalışır. Sayım gibi art arda giriş yapılan ekranlarda değeri seçili bırakır, kullanıcı yazmaya devam eder.", en: "`ref` reaches the real `input`, so `focus` and `select` work directly. On screens with entry after entry, such as a stock count, it leaves the value selected so people keep typing." },
      example: { Demo: FocusField, code: `const input = useRef<HTMLInputElement>(null);

<NumberInput ref={input} defaultValue={0} min={0} />
<Button size="sm" onClick={() => input.current?.select()}>Next shelf</Button>` },
    },
    {
      id: "disabled",
      title: { tr: "Kapalı", en: "Disabled" },
      body: { tr: "`disabled` alanı ve düğmeleri birlikte kapatır, değer forma gönderilmez. Nedenini `hint` ile söyleyin.", en: "`disabled` turns off the field and its buttons together, and the value is not submitted. Give the reason in `hint`." },
      example: { Demo: Disabled, code: `<NumberInput disabled defaultValue={250000} format={{ style: "currency", currency: "TRY", maximumFractionDigits: 0 }} />` },
    },
  ],
  a11y: [
    { tr: "`Field` içinde etikete otomatik bağlanır. `Field` yoksa `aria-label` verin; bu ad `input` öğesine yazılır.", en: "Inside `Field` it links to the label automatically. Without `Field`, pass `aria-label`; it is set on the `input` element." },
    { tr: "Artırma ve azaltma düğmelerinin adı dil dosyasından gelir: `increase` ve `decrease`.", en: "The minus and plus buttons take their names from the locale: `increase` and `decrease`." },
    { tr: "Alan metin türünde bir `input` çizer, dokunmatik cihazlarda sayısal klavye açılır.", en: "The field renders a text `input` and opens a numeric keyboard on touch devices." },
  ],
  keyboard: [
    ["Tab", { tr: "Alana odaklanır", en: "Moves focus to the field" }],
    ["↑ / ↓", { tr: "`step` kadar artırır ya da azaltır", en: "Raises or lowers the value by `step`" }],
    ["Shift + ↑ / ↓", { tr: "10 artırır ya da azaltır", en: "Raises or lowers the value by 10" }],
    ["Alt + ↑ / ↓", { tr: "0,1 artırır ya da azaltır", en: "Raises or lowers the value by 0.1" }],
    ["Home", { tr: "`min` verilmişse en küçük değere gider", en: "Jumps to the lowest value, when `min` is set" }],
    ["End", { tr: "`max` verilmişse en büyük değere gider", en: "Jumps to the highest value, when `max` is set" }],
  ],
  api: [
    {
      name: "NumberInput",
      description: { tr: "Ref `input` öğesine iletilir. Yerel öznitelikler iletilmez; yalnız aşağıdaki özellikler geçerlidir.", en: "The ref reaches the `input`. Native attributes are not forwarded; only the props below apply." },
      props: [
        { name: "value", type: "number | null", description: { tr: "Denetimli değer", en: "Controlled value" } },
        { name: "defaultValue", type: "number", description: { tr: "Denetimsiz başlangıç değeri", en: "Uncontrolled initial value" } },
        { name: "onChange", type: "(value: number | null) => void", description: { tr: "Yeni değeri bildirir; alan boşken `null`", en: "Reports the new value; `null` when empty" } },
        { name: "min", type: "number", description: { tr: "En küçük değer", en: "Lowest value" } },
        { name: "max", type: "number", description: { tr: "En büyük değer", en: "Highest value" } },
        { name: "step", type: "number", default: "1", description: { tr: "Düğme ve ok tuşu adımı", en: "Step of the buttons and arrow keys" } },
        { name: "format", type: "Intl.NumberFormatOptions", description: { tr: "Görüntü biçimi; dil `BtuiProvider` üzerinden gelir", en: "Display format; the language comes from `BtuiProvider`" } },
        { name: "hideSteppers", type: "boolean", default: "false", description: { tr: "Eksi ve artı düğmelerini gizler", en: "Hides the minus and plus buttons" } },
        { name: "prefix", type: "ReactNode", description: { tr: "Değerin önündeki sabit içerik, örn. para işareti", en: "Fixed content before the value, such as a currency sign" } },
        { name: "suffix", type: "ReactNode", description: { tr: "Değerin arkasındaki sabit içerik, örn. birim", en: "Fixed content after the value, such as a unit" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Alanı ve düğmeleri kapatır", en: "Turns off the field and its buttons" } },
        { name: "required", type: "boolean", default: "false", description: { tr: "Alan boşken formun gönderilmesini engeller", en: "Blocks form submission while the field is empty" } },
        { name: "name", type: "string", description: { tr: "Form gönderiminde kullanılan ad", en: "Name used on form submission" } },
        { name: "className", type: "string", description: { tr: "Alanı ve düğmeleri saran kaba eklenir", en: "Added to the wrapper around the field and its buttons" } },
        { name: "aria-label", type: "string", description: { tr: "`Field` yoksa erişilebilir ad", en: "Accessible name when there is no `Field`" } },
      ],
    },
  ],
  styling: [
    { name: "data-invalid", kind: "data", description: { tr: "Dıştaki `Field` üzerinde; `error` varken kenarlığı kırmızı yapar", en: "On the outer `Field`; turns the border red while `error` is set" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Odaktaki kenarlık", en: "Focused border" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Odak halkası", en: "Focus ring" } },
    { name: "--bt-border", kind: "var", description: { tr: "Kenarlık", en: "Border" } },
    { name: "--bt-bg", kind: "var", description: { tr: "Düğmelerin fareyle üzerine gelindiğindeki zemini", en: "Hover background of the buttons" } },
  ],
  related: ["input", "field", "select"],
});
