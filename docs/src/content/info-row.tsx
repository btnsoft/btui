import type { ReactNode } from "react";
import { Avatar, Badge, Card, InfoList, InfoRow, Status } from "btui";
import { money, ORDERS, STATUS_LABEL, STATUS_TONE } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const ORDER = ORDERS[3];

function Narrow({ children }: { children: ReactNode }) {
  return <div style={{ maxWidth: 420, margin: "0 auto" }}>{children}</div>;
}

function Summary() {
  const t = useText();
  const lang = useLang();
  return (
    <Narrow>
      <Card title={ORDER.no} subtitle={ORDER.customer}>
        <InfoList>
          <InfoRow label={t({ tr: "Şehir", en: "City" })}>{ORDER.city}</InfoRow>
          <InfoRow label={t({ tr: "Sorumlu", en: "Owner" })}>{ORDER.owner}</InfoRow>
          <InfoRow label={t({ tr: "Tutar", en: "Amount" })}>{money(ORDER.amount, lang)}</InfoRow>
          <InfoRow label={t({ tr: "Durum", en: "Status" })}><Badge tone={STATUS_TONE[ORDER.status]}>{t(STATUS_LABEL[ORDER.status])}</Badge></InfoRow>
        </InfoList>
      </Card>
    </Narrow>
  );
}

function Plain() {
  const t = useText();
  const lang = useLang();
  return (
    <Narrow>
      <InfoRow className="erp-total" label={t({ tr: "Ödenecek tutar", en: "Amount due" })}>{money(42800, lang)}</InfoRow>
    </Narrow>
  );
}

function RichValues() {
  const t = useText();
  return (
    <Narrow>
      <InfoRow label={t({ tr: "Vergi no", en: "Tax number" })}><span className="bt-mono">4620183759</span></InfoRow>
      <InfoRow label={t({ tr: "Entegrasyon", en: "Integration" })}><Status tone="ok">{t({ tr: "Bağlı", en: "Connected" })}</Status></InfoRow>
      <InfoRow label={t({ tr: "Müşteri temsilcisi", en: "Account manager" })}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Avatar name="Elif Kaya" size={22} />
          Elif Kaya
        </span>
      </InfoRow>
    </Narrow>
  );
}

function LongValue() {
  const t = useText();
  return (
    <Narrow>
      <InfoRow label={t({ tr: "Teslimat adresi", en: "Delivery address" })}>Kemalpaşa OSB, 3. Cadde No: 14, Ansızca Mahallesi, Kemalpaşa, İzmir</InfoRow>
      <InfoRow label={t({ tr: "Ödeme koşulu", en: "Payment terms" })}>{t({ tr: "Fatura tarihinden itibaren 30 gün", en: "30 days from the invoice date" })}</InfoRow>
    </Narrow>
  );
}

function TwoColumns() {
  const t = useText();
  const lang = useLang();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 24px" }}>
      <InfoRow label={t({ tr: "Fatura no", en: "Invoice no" })}><span className="bt-mono">FT-2026-0412</span></InfoRow>
      <InfoRow label={t({ tr: "Düzenleme tarihi", en: "Issue date" })}>{new Date("2026-10-05T00:00:00").toLocaleDateString(lang)}</InfoRow>
      <InfoRow label={t({ tr: "Matrah", en: "Net" })}>{money(48200, lang)}</InfoRow>
      <InfoRow label={t({ tr: "KDV", en: "VAT" })}>{money(9640, lang)}</InfoRow>
    </div>
  );
}

function Missing() {
  const t = useText();
  return (
    <Narrow>
      <InfoRow label={t({ tr: "Telefon", en: "Phone" })}>0232 555 01 42</InfoRow>
      <InfoRow label={t({ tr: "Faks", en: "Fax" })}><span style={{ color: "var(--bt-faint)", fontWeight: 400 }}>{t({ tr: "Belirtilmedi", en: "Not provided" })}</span></InfoRow>
    </Narrow>
  );
}

export default definePage({
  summary: { tr: "Tek bir kaydın alanlarını etiket ve değer olarak alt alta dizer. Etiket solda, değer sağda durur. `InfoList` satırları tanım listesi olarak bağlar.", en: "Lists the fields of one record as label and value pairs. The label sits on the left and the value on the right. `InfoList` ties the rows together as a description list." },
  imports: 'import { InfoList, InfoRow } from "btui";',
  hero: {
    Demo: Summary,
    block: true,
    code: `<Card title="SP-1061" subtitle="Ege Tekstil">
  <InfoList>
    <InfoRow label="City">{order.city}</InfoRow>
    <InfoRow label="Owner">{order.owner}</InfoRow>
    <InfoRow label="Amount">{money(order.amount, lang)}</InfoRow>
    <InfoRow label="Status"><Badge tone="ok">Done</Badge></InfoRow>
  </InfoList>
</Card>`,
  },
  use: {
    do: [
      { tr: "Müşteri, sipariş ya da fatura ayrıntısı", en: "Customer, order or invoice details" },
      { tr: "`Card`, `Drawer` ve `DataTable` ayrıntı satırı içinde özet", en: "Summaries inside a `Card`, a `Drawer` or a `DataTable` detail row" },
    ],
    dont: [
      { tr: "Çok kaydı karşılaştırmak; bunun için `DataTable` kullanın", en: "Comparing many records; use `DataTable`" },
      { tr: "Düzenlenebilir alanlar; `Field` ile `Input` gerekir", en: "Editable values; those need `Field` with `Input`" },
      { tr: "Paragraf uzunluğunda değerler; dar alanda etiketin yanı daralır", en: "Paragraph length values; the space beside the label runs out" },
    ],
  },
  anatomy: `<InfoList>
  <InfoRow label="Label">Value</InfoRow>
</InfoList>`,
  examples: [
    {
      id: "list",
      title: { tr: "InfoList ile tanım listesi", en: "Description list with InfoList" },
      body: { tr: "Birden çok satırı `InfoList` içine alın. Liste `<dl>`, etiketler `<dt>`, değerler `<dd>` olarak çizilir, görünüm değişmez ama ekran okuyucu her değeri etiketine bağlar. Üstteki örnek bunu kullanır. Tek satır için `InfoRow` tek başına yeterlidir; `className` satıra sınıf ekler.", en: "Wrap several rows in `InfoList`. The list renders as `<dl>`, labels as `<dt>` and values as `<dd>`. The look stays the same, but a screen reader ties each value to its label. The example above uses it. For a single row `InfoRow` stands alone, and `className` adds a class to the row." },
      example: {
        Demo: Plain,
        block: true,
        code: `<InfoRow className="erp-total" label="Amount due">{money(42800, lang)}</InfoRow>`,
      },
    },
    {
      id: "rich-values",
      title: { tr: "Zengin değerler", en: "Rich values" },
      body: { tr: "`children` her tür içerik alır: kod için `bt-mono`, durum için `Status`, kişi için `Avatar`. Değer kalın ve sağa yaslı gelir, göz sütun gibi tarar.", en: "`children` accepts any content: `bt-mono` for codes, `Status` for states, `Avatar` for people. Values are bold and right aligned, so the eye scans them as a column." },
      example: {
        Demo: RichValues,
        block: true,
        code: `<InfoRow label="Tax number"><span className="bt-mono">4620183759</span></InfoRow>
<InfoRow label="Integration"><Status tone="ok">Connected</Status></InfoRow>
<InfoRow label="Account manager">
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    <Avatar name="Elif Kaya" size={22} />
    Elif Kaya
  </span>
</InfoRow>`,
      },
    },
    {
      id: "long-value",
      title: { tr: "Uzun değer", en: "Long value" },
      body: { tr: "Uzun değerler satır kırar ve sağa yaslı kalır. Adres gibi birkaç satırı geçmeyen metinler için uygundur.", en: "Long values wrap and stay right aligned. That works for text of a few lines, such as an address." },
      example: {
        Demo: LongValue,
        block: true,
        code: `<InfoRow label="Delivery address">Kemalpaşa OSB, 3. Cadde No: 14, Ansızca Mahallesi, Kemalpaşa, İzmir</InfoRow>`,
      },
    },
    {
      id: "two-columns",
      title: { tr: "İki sütun", en: "Two columns" },
      body: { tr: "Geniş alanlarda satırları CSS Grid ile iki sütuna yayın. `InfoRow` kabını doldurur, ek ayar gerekmez.", en: "On wide areas, spread the rows over two columns with CSS Grid. `InfoRow` fills its container, so nothing else is needed." },
      example: {
        Demo: TwoColumns,
        block: true,
        code: `<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 24px" }}>
  <InfoRow label="Invoice no">FT-2026-0412</InfoRow>
  <InfoRow label="Issue date">05.10.2026</InfoRow>
  <InfoRow label="Net">{money(48200, lang)}</InfoRow>
  <InfoRow label="VAT">{money(9640, lang)}</InfoRow>
</div>`,
      },
    },
    {
      id: "missing-value",
      title: { tr: "Eksik değer", en: "Missing value" },
      body: { tr: "Boş alanı gizlemek yerine açıkça söyleyin. Satır yok olursa kullanıcı verinin hiç istenmediğini sanar. `children` zorunludur, boş bırakmayın.", en: "State an empty field rather than hiding it. When a row vanishes, people assume the data was never asked for. `children` is required, so do not leave it blank." },
      example: {
        Demo: Missing,
        block: true,
        code: `<InfoRow label="Fax">
  <span style={{ color: "var(--bt-faint)", fontWeight: 400 }}>Not provided</span>
</InfoRow>`,
      },
    },
  ],
  a11y: [
    { tr: "`InfoList` içinde `<dl>`, `<dt>` ve `<dd>` çizilir; etiket ile değer anlamsal olarak bağlanır. Birden çok satırda bunu kullanın.", en: "Inside `InfoList` it renders `<dl>`, `<dt>` and `<dd>`, so label and value are linked semantically. Use it for several rows." },
    { tr: "`InfoList` dışında sade `div` ve `span` çizer. Ekran okuyucu ikisini arka arkaya okur, bu yüzden etiketler kendi başına anlaşılır olmalıdır.", en: "Outside `InfoList` it renders plain `div` and `span` elements. Screen readers read them in sequence, so labels must make sense on their own." },
    { tr: "Sayfada aynı yapıda çok kayıt varsa gruba `Card` başlığı verin; kullanıcı değerlerin hangi kayda ait olduğunu bilir.", en: "With several similar groups on a page, title each with a `Card`, so people know which record the values belong to." },
    { tr: "Değer olarak yalnız renk kullanmayın; `Status` ve `Badge` metni de taşımalıdır.", en: "Do not use colour alone as a value; `Status` and `Badge` must carry text too." },
  ],
  api: [
    {
      name: "InfoRow",
      description: { tr: "Yerel öznitelikler iletilmez; yalnız aşağıdaki özellikler geçerlidir.", en: "Native attributes are not forwarded; only the props below apply." },
      props: [
        { name: "label", type: "ReactNode", required: true, description: { tr: "Sol taraftaki etiket", en: "Label on the left" } },
        { name: "children", type: "ReactNode", required: true, description: { tr: "Sağ taraftaki değer", en: "Value on the right" } },
        { name: "className", type: "string", description: { tr: "Satıra eklenen sınıf", en: "Class added to the row" } },
      ],
    },
    {
      name: "InfoList",
      description: { tr: "`InfoRow` satırlarını `<dl>` olarak gruplar.", en: "Groups `InfoRow` lines as a `<dl>`." },
      props: [
        { name: "children", type: "ReactNode", required: true, description: { tr: "`InfoRow` öğeleri", en: "`InfoRow` elements" } },
        { name: "className", type: "string", description: { tr: "Listeye eklenen sınıf", en: "Class added to the list" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-border", kind: "var", description: { tr: "Satır altındaki kesikli çizgi", en: "Dashed rule under the row" } },
    { name: "--bt-muted", kind: "var", description: { tr: "Etiket rengi", en: "Label colour" } },
  ],
  related: ["card", "drawer", "data-table", "badge"],
});
