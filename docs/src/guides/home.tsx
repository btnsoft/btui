import { useState } from "react";
import { IconArrowRight, IconBrandGithub, IconKeyboard, IconLanguage, IconLayoutGrid, IconMoon, IconPlus, IconTable } from "@tabler/icons-react";
import { Badge, Button, Chip, ChipGroup, DataTable, Kpi, KpiGrid, type Column } from "btui";
import { ORDERS, STATUS_LABEL, STATUS_TONE, money, type Order, type OrderStatus } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { NAV } from "../lib/nav";
import { Code } from "../lib/ui";

const FILTERS: OrderStatus[] = ["open", "pending", "done"];

function Showcase() {
  const t = useText();
  const lang = useLang();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const rows = status ? ORDERS.filter((o) => o.status === status) : ORDERS;
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), cell: (r) => <span className="bt-mono">{r.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "city", header: t({ tr: "İl", en: "City" }) },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", cell: (r) => money(r.amount, lang) },
    { key: "status", header: t({ tr: "Durum", en: "Status" }), cell: (r) => <Badge tone={STATUS_TONE[r.status]}>{t(STATUS_LABEL[r.status])}</Badge> },
  ];
  return (
    <div className="h-show">
      <KpiGrid>
        <Kpi label={t({ tr: "Açık sipariş", en: "Open orders" })} value="128" trend={{ value: "%8", direction: "up" }} note={t({ tr: "geçen aya göre", en: "vs last month" })} />
        <Kpi label={t({ tr: "Tahsilat", en: "Collected" })} value={money(1240000, lang)} tone="ok" />
        <Kpi label={t({ tr: "Geciken", en: "Overdue" })} value="9" tone="danger" trend={{ value: "2", direction: "down" }} />
      </KpiGrid>
      <DataTable
        title={t({ tr: "Siparişler", en: "Orders" })}
        titleNote={String(rows.length)}
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        pageSize={5}
        chips={
          <ChipGroup>
            {FILTERS.map((s) => <Chip key={s} tone={STATUS_TONE[s]} active={status === s} onClick={() => setStatus(status === s ? "" : s)}>{t(STATUS_LABEL[s])}</Chip>)}
          </ChipGroup>
        }
        actions={<Button size="sm" variant="primary" icon={<IconPlus size={14} />}>{t({ tr: "Yeni", en: "New" })}</Button>}
      />
    </div>
  );
}

export default function Home() {
  const t = useText();
  const lang = useLang();
  const features = [
    { icon: IconTable, title: { tr: "Lisanssız güçlü ızgara", en: "A serious grid, no licence" }, text: { tr: "100 bin satır, filtre, gruplama, pivot, Excel, hücre seçimi ve yerinde düzenleme. Lisans ücreti yok.", en: "100k rows, filters, grouping, pivot, Excel, cell selection and inline editing. No licence fee." } },
    { icon: IconLayoutGrid, title: { tr: "Keskin ve yoğun", en: "Sharp and dense" }, text: { tr: "Kurumsal ekranlar için tasarlandı: az köşe, az gölge, çok bilgi.", en: "Made for corporate screens: few curves, few shadows, plenty of information." } },
    { icon: IconKeyboard, title: { tr: "Erişilebilir temel", en: "Accessible core" }, text: { tr: "Klavye, odak ve ekran okuyucu davranışı Base UI'dan gelir.", en: "Keyboard, focus and screen reader behaviour come from Base UI." } },
    { icon: IconLanguage, title: { tr: "Türkçe doğru çalışır", en: "Turkish done right" }, text: { tr: "Arama \"izmir\" yazınca \"İzmir\"i bulur, sıralama Ç ve Ş'yi doğru yere koyar.", en: "Search matches \"İzmir\" from \"izmir\", sorting places Ç and Ş correctly." } },
    { icon: IconMoon, title: { tr: "Değişkenlerle tema", en: "Themed with variables" }, text: { tr: "Bütün renkler CSS değişkeni. Koyu tema hazır gelir.", en: "Every colour is a CSS variable. Dark theme is included." } },
    { icon: IconBrandGithub, title: { tr: "Küçük bağımlılık", en: "Small footprint" }, text: { tr: "Tek çalışma zamanı bağımlılığı Base UI. Tailwind gerekmez.", en: "Base UI is the only runtime dependency. No Tailwind required." } },
  ];
  return (
    <div className="h-home">
      <section className="h-hero">
        <div>
          <span className="d-eyebrow">{t({ tr: "Base UI üzerine kurulu React bileşenleri", en: "React components built on Base UI" })}</span>
          <h1>{t({ tr: "İş yazılımı gibi görünen iş yazılımı arayüzü.", en: "A business UI that looks like business software." })}</h1>
          <p className="d-lead">{t({ tr: "btui; listeler, filtreler, formlar ve onay akışlarıyla dolu ekranlar için hazır, keskin ve yoğun bileşenler sunar.", en: "btui gives you ready, sharp and dense components for screens full of lists, filters, forms and approval flows." })}</p>
          <div className="h-actions">
            <Button size="lg" variant="primary" iconEnd={<IconArrowRight size={16} />} render={<a href={`#/${lang}/installation`} />} nativeButton={false}>{t({ tr: "Başla", en: "Get started" })}</Button>
            <Button size="lg" render={<a href={`#/${lang}/data-grid`} />} nativeButton={false}>{t({ tr: "Izgarayı gör", en: "See the grid" })}</Button>
          </div>
        </div>
        <Code>{"npm install github:btnsoft/btui"}</Code>
      </section>
      <Showcase />
      <section className="h-features">
        {features.map((f) => (
          <div key={t(f.title)}>
            <f.icon size={20} />
            <b>{t(f.title)}</b>
            <p>{t(f.text)}</p>
          </div>
        ))}
      </section>
      <section className="h-index">
        {NAV.slice(1).map((section) => (
          <div key={t(section.title)}>
            <b>{t(section.title)}</b>
            {section.pages.map((p) => <a key={p.id} href={`#/${lang}/${p.id}`}>{t(p.title)}</a>)}
          </div>
        ))}
      </section>
    </div>
  );
}
