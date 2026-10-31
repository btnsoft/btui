import { useState } from "react";
import { Button, Card, InfoRow, Kpi, KpiGrid, Skeleton } from "btui";
import { ORDERS, money } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function CustomerCard() {
  const t = useText();
  return (
    <div className="d-stack">
      <Card title={t({ tr: "Müşteri kartı", en: "Customer record" })}>
        <div aria-busy="true" style={{ display: "grid", gap: 10 }}>
          <Skeleton width="60%" height={18} />
          <Skeleton />
          <Skeleton />
          <Skeleton width="40%" />
        </div>
      </Card>
    </div>
  );
}

function Rows() {
  return (
    <div className="d-stack-wide" aria-busy="true">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 72px", gap: 16, alignItems: "center" }}>
          <Skeleton />
          <Skeleton width="70%" />
          <Skeleton />
          <Skeleton height={20} />
        </div>
      ))}
    </div>
  );
}

function Kpis() {
  const t = useText();
  const labels = [t({ tr: "Açık siparişler", en: "Open orders" }), t({ tr: "Ödenmemiş faturalar", en: "Unpaid invoices" }), t({ tr: "Bekleyen onaylar", en: "Pending approvals" })];
  return (
    <div aria-busy="true">
      <KpiGrid>
        {labels.map((label) => <Kpi key={label} label={label} value={<Skeleton width={96} height={28} />} />)}
      </KpiGrid>
    </div>
  );
}

function Swap() {
  const t = useText();
  const lang = useLang();
  const [loading, setLoading] = useState(false);
  const order = ORDERS[3];
  const reload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1600);
  };
  return (
    <div className="d-stack">
      <Card title={order.no} actions={<Button size="sm" disabled={loading} onClick={reload}>{t({ tr: "Yenile", en: "Refresh" })}</Button>}>
        <div aria-busy={loading}>
          <InfoRow label={t({ tr: "Müşteri", en: "Customer" })}>{loading ? <Skeleton width={110} /> : order.customer}</InfoRow>
          <InfoRow label={t({ tr: "Şehir", en: "City" })}>{loading ? <Skeleton width={80} /> : order.city}</InfoRow>
          <InfoRow label={t({ tr: "Tutar", en: "Amount" })}>{loading ? <Skeleton width={70} /> : money(order.amount, lang)}</InfoRow>
        </div>
      </Card>
    </div>
  );
}

export default definePage({
  summary: { tr: "Veri gelirken içeriğin yerini tutar. Kullanıcı sayfanın düzenini baştan görür, veri gelince hiçbir şey yerinden oynamaz.", en: "Holds the place of content while data arrives. People see the layout from the start and nothing moves when the data lands." },
  imports: 'import { Skeleton } from "btui";',
  hero: {
    Demo: CustomerCard,
    code: `<Card title="Customer record">
  <div aria-busy="true" style={{ display: "grid", gap: 10 }}>
    <Skeleton width="60%" height={18} />
    <Skeleton />
    <Skeleton />
    <Skeleton width="40%" />
  </div>
</Card>`,
  },
  use: {
    do: [
      { tr: "Düzeni önceden bilinen ekranların ilk yüklenişi", en: "First load of screens with a known layout" },
      { tr: "Tablo satırları, KPI kartları, müşteri özetleri", en: "Table rows, KPI cards, customer summaries" },
      { tr: "Veri geldiğinde sayfanın zıplamasını önlemek", en: "Keeping the page from jumping when data arrives" },
    ],
    dont: [
      { tr: "Düzeni belli olmayan sonuçlar; `Loading` daha dürüsttür", en: "Results with an unknown layout; `Loading` is more honest" },
      { tr: "Düğmeye basıldıktan sonraki bekleme; `Button` üzerindeki `loading` kullanılır", en: "The wait after a button press; use `loading` on `Button`" },
      { tr: "Yarım saniyeden kısa yanıtlar; bir anlık titreme yaratır", en: "Responses faster than half a second; it only causes a flicker" },
    ],
  },
  anatomy: `<div aria-busy="true">
  <Skeleton width="60%" height={18} />
  <Skeleton />
</div>`,
  examples: [
    {
      id: "table-rows",
      title: { tr: "Tablo satırları", en: "Table rows" },
      body: { tr: "Sütun genişliklerini gerçek tabloyla aynı tutun. `width` verilmezse parça kabını doldurur, yüzde ya da piksel verilebilir. Sayı piksel sayılır.", en: "Keep the column widths the same as the real table. Without `width` the block fills its container; a percentage or pixel value also works. A number counts as pixels." },
      example: {
        block: true,
        Demo: Rows,
        code: `<div aria-busy="true">
  {rows.map((row) => (
    <div key={row} style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 72px", gap: 16 }}>
      <Skeleton />
      <Skeleton width="70%" />
      <Skeleton />
      <Skeleton height={20} />
    </div>
  ))}
</div>`,
      },
    },
    {
      id: "kpis",
      title: { tr: "KPI kartları", en: "KPI cards" },
      body: { tr: "Yalnız değişen veriyi iskelete çevirin. Başlıklar baştan belli olduğu için onları olduğu gibi gösterin; kullanıcı ne beklediğini bilsin.", en: "Replace only the data that changes. Labels are known from the start, so keep them visible and let the user see what is coming." },
      example: {
        block: true,
        Demo: Kpis,
        code: `<KpiGrid>
  <Kpi label="Open orders" value={<Skeleton width={96} height={28} />} />
  <Kpi label="Unpaid invoices" value={<Skeleton width={96} height={28} />} />
  <Kpi label="Pending approvals" value={<Skeleton width={96} height={28} />} />
</KpiGrid>`,
      },
    },
    {
      id: "swap",
      title: { tr: "Veriyle değişim", en: "Swapping with data" },
      body: { tr: "Her değeri kendi iskeletiyle değiştirin. Genişlikleri gerçek metne yakın seçin, böylece satırlar yer değiştirmez. Yenile düğmesine basıp deneyin.", en: "Swap each value with its own skeleton. Pick widths close to the real text so rows keep their place. Press Refresh to try." },
      example: {
        Demo: Swap,
        code: `<div aria-busy={loading}>
  <InfoRow label="Customer">{loading ? <Skeleton width={110} /> : order.customer}</InfoRow>
  <InfoRow label="City">{loading ? <Skeleton width={80} /> : order.city}</InfoRow>
  <InfoRow label="Amount">{loading ? <Skeleton width={70} /> : money(order.amount, lang)}</InfoRow>
</div>`,
      },
    },
  ],
  a11y: [
    { tr: "`Skeleton` `aria-hidden=\"true\"` ile yardımcı teknolojiden gizlenir; ekran okuyucu parçaları tek tek okumaz.", en: "`Skeleton` is hidden from assistive technology with `aria-hidden=\"true\"`, so a screen reader does not walk through the blocks." },
    { tr: "Yüklenen bölgeye `aria-busy=\"true\"` verin, veri gelince kaldırın.", en: "Set `aria-busy=\"true\"` on the loading region and remove it when the data arrives." },
    { tr: "`prefers-reduced-motion` açıkken nabız animasyonu durur, parçalar sabit kalır.", en: "With `prefers-reduced-motion` on, the pulse stops and the blocks stay still." },
  ],
  api: [
    {
      name: "Skeleton",
      description: { tr: "Tüm yerel `span` öznitelikleri iletilir.", en: "All native `span` attributes are forwarded." },
      props: [
        { name: "width", type: "number | string", description: { tr: "Genişlik. Verilmezse kabını doldurur, sayı piksel sayılır", en: "Width. Fills its container when left out; a number counts as pixels" } },
        { name: "height", type: "number | string", default: "14px", description: { tr: "Yükseklik. Sayı piksel sayılır", en: "Height. A number counts as pixels" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-neutral-soft", kind: "var", description: { tr: "Parça zemini", en: "Block background" } },
    { name: "--bt-radius", kind: "var", description: { tr: "Köşe yarıçapı", en: "Corner radius" } },
  ],
  related: ["spinner", "progress", "data-table", "kpi"],
});
