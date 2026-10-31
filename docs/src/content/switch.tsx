import { useState, type FormEvent } from "react";
import { Button, Field, Switch } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Settings() {
  const t = useText();
  return (
    <div className="d-stack">
      <Switch defaultChecked label={t({ tr: "Yeni siparişte e-posta bildirimi", en: "Email notice on new orders" })} />
      <Switch label={t({ tr: "Kredi limiti aşılınca siparişi durdur", en: "Hold orders over the credit limit" })} />
      <Switch defaultChecked label={t({ tr: "Faturaları otomatik gönder", en: "Send invoices automatically" })} />
    </div>
  );
}

function Labelled() {
  const t = useText();
  return (
    <>
      <Switch defaultChecked onLabel={t({ tr: "Aktif", en: "Active" })} offLabel={t({ tr: "Pasif", en: "Inactive" })} aria-label={t({ tr: "Müşteri kaydı durumu", en: "Customer record status" })} />
      <Switch onLabel={t({ tr: "Aktif", en: "Active" })} offLabel={t({ tr: "Pasif", en: "Inactive" })} aria-label={t({ tr: "Bayi kaydı durumu", en: "Dealer record status" })} />
    </>
  );
}

function Controlled() {
  const t = useText();
  const [auto, setAuto] = useState(false);
  return (
    <div className="d-stack">
      <Switch checked={auto} onChange={setAuto} label={t({ tr: "Otomatik mutabakat", en: "Automatic reconciliation" })} />
      <span>{auto ? t({ tr: "Her gece 02.00'de çalışır", en: "Runs every night at 02:00" }) : t({ tr: "Mutabakatı elle başlatmanız gerekir", en: "You need to start reconciliation by hand" })}</span>
    </div>
  );
}

function Pending() {
  const t = useText();
  const [on, setOn] = useState(true);
  const [busy, setBusy] = useState(false);
  const change = (next: boolean) => {
    setBusy(true);
    setTimeout(() => {
      setOn(next);
      setBusy(false);
    }, 900);
  };
  return <Switch checked={on} disabled={busy} onChange={change} label={busy ? t({ tr: "Kaydediliyor…", en: "Saving…" }) : t({ tr: "Bayi portalı açık", en: "Dealer portal is open" })} />;
}

function Disabled() {
  const t = useText();
  return (
    <div className="d-stack">
      <Switch disabled defaultChecked label={t({ tr: "İki adımlı giriş (kurum politikası)", en: "Two-step sign-in (company policy)" })} />
      <Switch disabled label={t({ tr: "E-irsaliye (paketinizde yok)", en: "E-waybill (not in your plan)" })} />
    </div>
  );
}

function WithHint() {
  const t = useText();
  return (
    <div className="d-stack">
      <Switch defaultChecked label={t({ tr: "Yönetici onayı iste", en: "Require manager approval" })} hint={t({ tr: "Açıkken 50.000 TL üzeri siparişler yöneticiye gider", en: "When on, orders above 50,000 TRY go to a manager" })} />
      <Switch label={t({ tr: "Kısmi sevkiyata izin ver", en: "Allow partial shipments" })} hint={t({ tr: "Eksik kalemler sonraki sevkiyatla gider", en: "Missing lines go with the next shipment" })} />
    </div>
  );
}

function InField() {
  const t = useText();
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Onay akışı", en: "Approval flow" })} hint={t({ tr: "Değişiklik yeni siparişlere uygulanır", en: "The change applies to new orders" })}>
        <Switch defaultChecked label={t({ tr: "Yönetici onayı iste", en: "Require manager approval" })} />
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
      <Switch name="active" defaultChecked label={t({ tr: "Müşteri aktif", en: "Customer is active" })} />
      <Switch name="blacklist" label={t({ tr: "Kara listede", en: "Blacklisted" })} />
      <Button type="submit" variant="primary">{t({ tr: "Kaydet", en: "Save" })}</Button>
      {sent ? <code>{sent}</code> : null}
    </form>
  );
}

export default definePage({
  summary: { tr: "Bir ayarı açar ya da kapatır ve değişikliğin hemen geçerli olacağını anlatır. Kaydet düğmesi beklemeyen seçenekler içindir.", en: "Turns a setting on or off and signals that the change takes effect at once. It is for options that do not wait for a save button." },
  imports: 'import { Switch } from "btui";',
  base: "switch",
  hero: {
    Demo: Settings,
    code: `<Switch defaultChecked label="Email notice on new orders" />
<Switch label="Hold orders over the credit limit" />
<Switch defaultChecked label="Send invoices automatically" />`,
  },
  use: {
    do: [
      { tr: "Hemen uygulanan ayarlar: bildirim, otomatik gönderim", en: "Settings that apply at once: notices, automatic sending" },
      { tr: "Kayıt durumu: `onLabel` ve `offLabel` ile aktif, pasif", en: "Record status: active and inactive through `onLabel` and `offLabel`" },
      { tr: "Tablo satırında tek bir açma kapama", en: "A single on and off control in a table row" },
    ],
    dont: [
      { tr: "Kaydet düğmesi bekleyen form seçimleri; `Checkbox` daha doğrudur", en: "Form choices that wait for a save button; `Checkbox` fits better" },
      { tr: "Açık ya da kapalı olmayan seçimler: \"Havale / Kart\"; `RadioGroup` kullanın", en: "Choices that are not on or off, such as \"Transfer / Card\"; use `RadioGroup`" },
      { tr: "Geri alınamayan eylemler; `Button` ve `useConfirm` kullanın", en: "Irreversible actions; use `Button` with `useConfirm`" },
    ],
  },
  anatomy: `<Switch checked={checked} onChange={setChecked} label="Label" />
<Switch checked={checked} onChange={setChecked} onLabel="On" offLabel="Off" aria-label="Name" />`,
  examples: [
    {
      id: "labelled",
      title: { tr: "Yazılı anahtar", en: "Labelled switch" },
      body: { tr: "`onLabel` ve `offLabel` metni anahtarın içine yazar; kapalıyken kırmızı, açıkken yeşil görünür. İkisini birlikte verin, yalnız biri verilirse yok sayılır. Anahtarın adı olmadığı için `aria-label` ekleyin.", en: "`onLabel` and `offLabel` write the text inside the switch, which shows red when off and green when on. Pass both, as one alone is ignored. The switch has no name of its own, so add `aria-label`." },
      example: { Demo: Labelled, code: `<Switch defaultChecked onLabel="Active" offLabel="Inactive" aria-label="Customer record status" />\n<Switch onLabel="Active" offLabel="Inactive" aria-label="Dealer record status" />` },
    },
    {
      id: "controlled",
      title: { tr: "Denetimli kullanım", en: "Controlled" },
      body: { tr: "`onChange` doğrudan yeni durumu verir. Durumu kendiniz tutuyorsanız `checked`, yalnız başlangıç değeri için `defaultChecked` kullanın.", en: "`onChange` gives the new state directly. Use `checked` when you hold the state and `defaultChecked` for a starting value only." },
      example: { Demo: Controlled, code: `const [auto, setAuto] = useState(false);\n\n<Switch checked={auto} onChange={setAuto} label="Automatic reconciliation" />` },
    },
    {
      id: "pending",
      title: { tr: "Sunucu yanıtını beklemek", en: "Waiting for the server" },
      body: { tr: "Değişiklik sunucuya gidiyorsa `checked` değerini yanıt gelince güncelleyin ve bu sırada `disabled` verin. Bileşenin `loading` durumu yoktur, etiket metniyle geri bildirim verin. Anahtara basıp deneyin.", en: "If the change goes to the server, update `checked` once the reply arrives and pass `disabled` in the meantime. The component has no `loading` state, so give feedback through the label. Press the switch to try." },
      example: {
        Demo: Pending,
        code: `const change = async (next) => {
  setBusy(true);
  await savePortalState(next);
  setOn(next);
  setBusy(false);
};

<Switch checked={on} disabled={busy} onChange={change} label={busy ? "Saving…" : "Dealer portal is open"} />`,
      },
    },
    {
      id: "disabled",
      title: { tr: "Kapalı", en: "Disabled" },
      body: { tr: "Kullanıcının değiştiremediği ayarları `disabled` ile gösterin ve nedenini etikette yazın.", en: "Show settings people cannot change with `disabled`, and give the reason in the label." },
      example: { Demo: Disabled, code: `<Switch disabled defaultChecked label="Two-step sign-in (company policy)" />\n<Switch disabled label="E-waybill (not in your plan)" />` },
    },
    {
      id: "hint",
      title: { tr: "Açıklamalı", en: "With a hint" },
      body: { tr: "`hint` etiketin altına soluk bir açıklama yazar ve tıklanabilir alanın içinde kalır. Yalnız `label` ile birlikte görünür.", en: "`hint` adds quieter text under the label and stays inside the clickable area. It only shows together with `label`." },
      example: {
        Demo: WithHint,
        code: `<Switch defaultChecked label="Require manager approval" hint="When on, orders above 50,000 TRY go to a manager" />
<Switch label="Allow partial shipments" hint="Missing lines go with the next shipment" />`,
      },
    },
    {
      id: "in-field",
      title: { tr: "Field içinde", en: "Inside Field" },
      body: { tr: "`Field` üzerindeki `label` anahtarın üstünde başlık olur, anahtar kendi `label` metniyle okunur. `Switch` `Field` öğesinin doğrudan çocuğu olmalıdır.", en: "The `label` on `Field` sits above as a caption, and the switch is read by its own `label`. `Switch` must be a direct child of `Field`." },
      example: {
        Demo: InField,
        code: `<Field label="Approval flow" hint="The change applies to new orders">
  <Switch defaultChecked label="Require manager approval" />
</Field>`,
      },
    },
    {
      id: "form",
      title: { tr: "Form gönderimi", en: "Form submission" },
      body: { tr: "Açık anahtar `name` ile `on` değerini gönderir, kapalı anahtar hiç gönderilmez. Formu gönderip görün.", en: "A switch that is on submits `on` under its `name`, while one that is off is not sent. Submit the form to see." },
      example: {
        Demo: InForm,
        code: `<form onSubmit={submit}>
  <Switch name="active" defaultChecked label="Customer is active" />
  <Switch name="blacklist" label="Blacklisted" />
  <Button type="submit" variant="primary">Save</Button>
</form>`,
      },
    },
  ],
  a11y: [
    { tr: "`switch` rolü ve `aria-checked` hazır gelir.", en: "The `switch` role and `aria-checked` come built in." },
    { tr: "`label` yoksa `aria-label` şarttır. Yazılı anahtarda iç metin duruma göre değişir, kaydın adını söylemez; `aria-label` bunu tamamlar.", en: "Without `label`, `aria-label` is a must. In a labelled switch the inner text changes with the state and never names the record, which `aria-label` makes up for." },
    { tr: "Yazılı anahtarda durum hem renk hem metinle anlatılır. Yazısız anahtarda etiket durumu değil ayarı anlatmalıdır: \"Bildirim açık\" yerine \"Bildirimler\".", en: "A labelled switch tells the state by both colour and text. On a plain switch the label should name the setting, not the state: \"Notices\" beats \"Notices are on\"." },
  ],
  keyboard: [
    ["Tab", { tr: "Anahtara odaklanır", en: "Moves focus to the switch" }],
    ["Space", { tr: "Durumu değiştirir", en: "Toggles the switch" }],
    ["Enter", { tr: "Durumu değiştirir", en: "Toggles the switch" }],
  ],
  api: [
    {
      name: "Switch",
      description: { tr: "Yerel öznitelikler ve ref iletilmez; yalnız aşağıdaki proplar geçerlidir.", en: "Native attributes and the ref are not forwarded; only the props below apply." },
      props: [
        { name: "checked", type: "boolean", description: { tr: "Denetimli durum", en: "Controlled state" } },
        { name: "defaultChecked", type: "boolean", default: "false", description: { tr: "Denetimsiz başlangıç durumu", en: "Uncontrolled initial state" } },
        { name: "onChange", type: "(checked: boolean) => void", description: { tr: "Yeni durumu bildirir", en: "Reports the new state" } },
        { name: "label", type: "ReactNode", description: { tr: "Anahtarın yanındaki metin", en: "Text beside the switch" } },
        { name: "hint", type: "ReactNode", description: { tr: "Etiketin altında soluk açıklama. `label` ile birlikte görünür", en: "Quieter text under the label. Shown together with `label`" } },
        { name: "onLabel", type: "string", description: { tr: "Açıkken içeride yazan metin; `offLabel` ile birlikte verin", en: "Text inside while on; pass it with `offLabel`" } },
        { name: "offLabel", type: "string", description: { tr: "Kapalıyken içeride yazan metin; `onLabel` ile birlikte verin", en: "Text inside while off; pass it with `onLabel`" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Anahtarı kapatır", en: "Turns the switch off" } },
        { name: "name", type: "string", description: { tr: "Form gönderiminde kullanılan ad", en: "Name used on form submission" } },
        { name: "className", type: "string", description: { tr: "`label` verildiğinde dış öğeye eklenir; `label` yoksa uygulanmaz", en: "Added to the outer element when `label` is set; ignored without `label`" } },
        { name: "aria-label", type: "string", description: { tr: "`label` yoksa erişilebilir ad", en: "Accessible name when there is no `label`" } },
      ],
    },
  ],
  styling: [
    { name: "data-checked", kind: "data", description: { tr: "Açıkken bulunur", en: "Present while on" } },
    { name: "data-disabled", kind: "data", description: { tr: "Kapalıyken bulunur", en: "Present while disabled" } },
    { name: "data-labelled", kind: "data", description: { tr: "`onLabel` ve `offLabel` verildiğinde bulunur", en: "Present when `onLabel` and `offLabel` are set" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "Yazısız anahtarın açık zemini", en: "On background of a plain switch" } },
    { name: "--bt-faint", kind: "var", description: { tr: "Yazısız anahtarın kapalı zemini", en: "Off background of a plain switch" } },
    { name: "--bt-radius", kind: "var", description: { tr: "Köşe yarıçapı", en: "Corner radius" } },
  ],
  related: ["checkbox", "radio-group", "field"],
});
