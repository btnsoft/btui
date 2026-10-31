import { useState, type ComponentType } from "react";
import {
  IconAlertTriangle, IconBell, IconBox, IconChartBar, IconChevronDown, IconClick, IconColumns3, IconDots, IconEdit, IconFileUpload, IconFilter, IconForms,
  IconHome, IconLayoutSidebar, IconLayoutSidebarRight, IconPalette, IconPlus, IconSelect, IconTable, IconTag, IconTrash, IconWindowMaximize,
} from "@tabler/icons-react";
import {
  Avatar, Badge, Button, Card, Checkbox, Chip, ChipGroup, DataTable, Drawer, Field, FileDropzone, FilterBar, IconButton, InfoRow, Input, Kbd, Kpi, KpiGrid, Menu, MenuItem, MenuSeparator, Modal,
  MultiSelect, SearchInput, Select, Spinner, Status, Switch, Tabs, Textarea, Tooltip, useConfirm, useToast, type Column,
} from "btui";
import { CodeBlock, Example, Props } from "./parts";

type Order = { id: number; no: string; customer: string; city: string; amount: number; status: "Açık" | "Bekliyor" | "Tamam" | "İptal"; date: string };

const CITIES = ["Ankara", "Antalya", "Bursa", "Çanakkale", "Eskişehir", "İstanbul", "İzmir", "Konya", "Muğla", "Şırnak", "Trabzon", "Van"].map((c) => ({ value: c, label: c }));
const CUSTOMERS = ["Mavi Yapı", "Kuzey Lojistik", "Çınar Gıda", "Ege Tekstil", "Şafak Enerji", "Atlas Makine", "Deniz Otomotiv", "Işık Medikal"];
const STATUSES: Order["status"][] = ["Açık", "Bekliyor", "Tamam", "İptal"];
const ORDERS: Order[] = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  no: `SP-${String(1040 + i * 7)}`,
  customer: CUSTOMERS[i % CUSTOMERS.length],
  city: CITIES[(i * 5) % CITIES.length].label,
  amount: 1250 + ((i * 7919) % 48000),
  status: STATUSES[(i * 3) % 4 === 3 && i % 2 ? 3 : i % 3],
  date: `${String((i % 28) + 1).padStart(2, "0")}.10.2026`,
}));
const money = (n: number) => `${n.toLocaleString("tr-TR")} ₺`;
const TONES = { Açık: "info", Bekliyor: "warn", Tamam: "ok", İptal: "danger" } as const;

function GettingStarted() {
  return (
    <>
      <div className="doc-hero">
        <h1>Yoğun veri ekranları için sakin arayüz.</h1>
        <p className="doc-lead">btui; tablolar, filtreler ve formlarla dolu iş uygulamaları için React bileşenleri sunar. Erişilebilirlik ve davranış <a href="https://base-ui.com">Base UI</a>'dan, görünüm hoki mavisi tasarım dilinden gelir.</p>
        <div className="doc-hero-actions">
          <Button variant="primary" render={<a href="#/datatable" />} nativeButton={false}>Tabloya bak</Button>
          <Button render={<a href="#/tema" />} nativeButton={false}>Temayı incele</Button>
        </div>
      </div>
      <h2>Kurulum</h2>
      <p>Paket şimdilik GitHub üzerinden kurulur. React 18 ya da 19 gerekir.</p>
      <CodeBlock>{"npm install github:btnsoft/btui"}</CodeBlock>
      <h2>Bağlama</h2>
      <p>Stil dosyasını bir kez içe aktarın, uygulamayı <code>BtuiProvider</code> ile sarın. Onay pencereleri, bildirimler ve hazır metinler buradan gelir.</p>
      <CodeBlock>{`import { BtuiProvider, Button } from "btui";
import "btui/styles.css";

export function App() {
  return (
    <BtuiProvider locale="tr">
      <div className="bt-root">
        <Button variant="primary">Kaydet</Button>
      </div>
    </BtuiProvider>
  );
}`}</CodeBlock>
      <p><code>AppShell</code> kullanıyorsanız <code>bt-root</code> kapsayıcısı ona dahildir. Next.js'te ek ayar gerekmez, paket <code>"use client"</code> ile gelir.</p>
      <h2>Yazı tipleri</h2>
      <p>Tasarım Archivo ve IBM Plex Mono ile çizildi. Paket yazı tipi dosyası taşımaz; yüklü değilse sistem yazı tipine düşer.</p>
      <CodeBlock>{`npm install @fontsource/archivo @fontsource/ibm-plex-mono

import "@fontsource/archivo/400.css";
import "@fontsource/archivo/700.css";
import "@fontsource/ibm-plex-mono/400.css";`}</CodeBlock>
    </>
  );
}

const SWATCHES = ["--bt-accent", "--bt-accent-strong", "--bt-accent-soft", "--bt-nav", "--bt-bg", "--bt-surface", "--bt-border", "--bt-text", "--bt-muted", "--bt-ok", "--bt-warn", "--bt-danger"];

function Theme() {
  return (
    <>
      <p className="doc-lead">Bütün renkler, köşeler ve hareket süreleri CSS değişkenidir. Tema yazmak için bileşenlere dokunmazsınız, değişkenleri ezersiniz.</p>
      <div className="doc-swatches">
        {SWATCHES.map((name) => <div className="doc-swatch" key={name}><i style={{ background: `var(${name})` }} />{name}</div>)}
      </div>
      <h2>Kendi renginiz</h2>
      <CodeBlock>{`:root {
  --bt-accent: #2f7d6b;
  --bt-accent-strong: #236253;
  --bt-accent-soft: #dff0eb;
  --bt-radius: 2px;
}`}</CodeBlock>
      <h2>Koyu tema</h2>
      <p>Kök öğeye <code>data-bt-theme="dark"</code> verin. Bu sayfanın üstündeki düğme de bunu yapar. Pencereler <code>body</code>'ye taşındığı için özniteliği <code>html</code> üzerine koyun.</p>
      <CodeBlock>{`document.documentElement.dataset.btTheme = "dark";`}</CodeBlock>
      <h2>Dil</h2>
      <p>Hazır metinler Türkçe gelir. <code>locale="en"</code> İngilizceye geçirir, kendi nesnenizi de verebilirsiniz. Sıralama ve aramadaki büyük-küçük harf kuralları dili izler, yani "izmir" araması "İzmir"i bulur.</p>
    </>
  );
}

function Buttons() {
  return (
    <>
      <p className="doc-lead">Sayfanın ana eylemi tek bir <code>primary</code> düğmedir. Geri kalanı varsayılan görünümde durur.</p>
      <Example code={`<Button variant="primary" icon={<IconPlus size={14} />}>Yeni kayıt</Button>
<Button>Vazgeç</Button>
<Button variant="dark">Dışa aktar</Button>
<Button variant="success">Onayla</Button>
<Button variant="danger">Sil</Button>
<Button variant="ghost">Daha fazla</Button>`}>
        <Button variant="primary" icon={<IconPlus size={14} />}>Yeni kayıt</Button>
        <Button>Vazgeç</Button>
        <Button variant="dark">Dışa aktar</Button>
        <Button variant="success">Onayla</Button>
        <Button variant="danger">Sil</Button>
        <Button variant="ghost">Daha fazla</Button>
      </Example>
      <Example code={`<Button size="sm">Küçük</Button>
<Button size="lg">Büyük</Button>
<Button disabled>Kapalı</Button>
<IconButton label="Düzenle"><IconEdit size={16} /></IconButton>
<IconButton solid label="Sil"><IconTrash size={14} /></IconButton>`}>
        <Button size="sm">Küçük</Button>
        <Button>Orta</Button>
        <Button size="lg">Büyük</Button>
        <Button disabled>Kapalı</Button>
        <IconButton label="Düzenle"><IconEdit size={16} /></IconButton>
        <IconButton solid label="Sil"><IconTrash size={14} /></IconButton>
      </Example>
      <Props rows={[
        ["variant", '"default" | "primary" | "dark" | "danger" | "success" | "ghost"', "Görünüm"],
        ["size", '"sm" | "md" | "lg"', "Yükseklik: 26, 30, 36px"],
        ["icon", "ReactNode", "Yazıdan önce gösterilir"],
        ["fullWidth", "boolean", "Kabı doldurur"],
        ["render", "ReactElement", "Base UI: başka öğe olarak çizer, ör. bağlantı"],
      ]} />
    </>
  );
}

function SelectPage() {
  const [city, setCity] = useState("");
  const [filter, setFilter] = useState("İzmir");
  const [small, setSmall] = useState("Tamam");
  return (
    <>
      <p className="doc-lead">Seçenek sayısı 8'i geçince listeye arama kutusu kendiliğinden gelir. Klavye, ekran okuyucu ve konumlama Base UI'dan gelir.</p>
      <Example code={`<Select value={city} onChange={setCity} options={cities} placeholder="İl seçin" clearable />`}>
        <div className="doc-stack"><Field label="İl"><Select value={city} onChange={setCity} options={CITIES} placeholder="İl seçin" clearable /></Field></div>
      </Example>
      <h2>Filtre görünümü</h2>
      <p>Filtre çubuklarında kullanılır: etiket önde durur, seçim yapılınca kutu dolar.</p>
      <Example code={`<Select variant="filter" label="İl" value={city} onChange={setCity} options={cities} clearable />`}>
        <Select variant="filter" label="İl" value={filter} onChange={setFilter} options={CITIES} placeholder="Tümü" clearable />
        <Select variant="filter" label="Durum" value="" onChange={() => {}} options={STATUSES.map((s) => ({ value: s, label: s }))} placeholder="Tümü" />
      </Example>
      <h2>Ek bilgi ve kapalı seçenek</h2>
      <Example code={`options={[{ value: "Tamam", label: "Tamam", hint: "128" }, { value: "İptal", label: "İptal", disabled: true }]}`}>
        <div className="doc-stack"><Select value={small} onChange={setSmall} options={[{ value: "Açık", label: "Açık", hint: "42" }, { value: "Tamam", label: "Tamam", hint: "128" }, { value: "İptal", label: "İptal", hint: "3", disabled: true }]} /></div>
      </Example>
      <Props rows={[
        ["value", "string", "Seçili değer; boşsa \"\""],
        ["onChange", "(value: string) => void", "Temizleyince \"\" gelir"],
        ["options", "SelectOption[]", "value, label, hint, disabled"],
        ["variant", '"field" | "filter"', "Form alanı ya da filtre kutusu"],
        ["label", "string", "Filtre görünümünde önek"],
        ["searchable", "boolean", "Varsayılan: 8'den çok seçenekte açık"],
        ["clearable", "boolean", "Temizleme düğmesi"],
      ]} />
    </>
  );
}

function MultiSelectPage() {
  const [value, setValue] = useState<string[]>(["Ankara", "İzmir"]);
  return (
    <>
      <p className="doc-lead">Birden çok değer seçtirir. Kutu kalabalıklaşmaz, seçim sayısını yazar.</p>
      <Example code={`<MultiSelect label="İller" value={cities} onChange={setCities} options={options} placeholder="Tümü" />`}>
        <MultiSelect label="İller" value={value} onChange={setValue} options={CITIES} placeholder="Tümü" />
      </Example>
      <Props rows={[
        ["value", "string[]", "Seçili değerler"],
        ["onChange", "(value: string[]) => void", "Her değişiklikte tüm liste"],
        ["options", "SelectOption[]", "Select ile aynı"],
        ["variant", '"field" | "filter"', "Varsayılan: filter"],
      ]} />
    </>
  );
}

const ORDER_COLUMNS: Column<Order>[] = [
  { key: "no", header: "Sipariş", cell: (r) => <span className="bt-mono">{r.no}</span> },
  { key: "customer", header: "Müşteri" },
  { key: "city", header: "İl" },
  { key: "date", header: "Tarih", hidden: true },
  { key: "amount", header: "Tutar", align: "right", cell: (r) => <span className="bt-mono">{money(r.amount)}</span> },
  { key: "status", header: "Durum", cell: (r) => <Badge tone={TONES[r.status]}>{r.status}</Badge> },
];

function TablePage() {
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<number | null>(3);
  const rows = status ? ORDERS.filter((o) => o.status === status) : ORDERS;
  return (
    <>
      <p className="doc-lead">Liste ekranlarının bel kemiği: üstte hoki bandı, altta sayfalama. Kolon seçimi ve satır yoğunluğu <code>storageKey</code> ile tarayıcıda saklanır.</p>
      <Example block code={`<DataTable
  title="Siparişler"
  titleNote={\`\${rows.length} kayıt\`}
  columns={columns}
  rows={rows}
  getRowKey={(r) => r.id}
  pageSize={8}
  storageKey="siparisler"
  defaultSort={{ key: "amount", direction: "desc" }}
  onRowClick={(r) => setSelected(r.id)}
  selectedKey={selected}
  renderDetail={(r) => <InfoRow label="Tarih">{r.date}</InfoRow>}
  chips={<ChipGroup>…</ChipGroup>}
  actions={<Button variant="primary">Yeni sipariş</Button>}
/>`}>
        <DataTable
          title="Siparişler"
          titleNote={`${rows.length} kayıt`}
          icon={<IconTable size={17} />}
          columns={ORDER_COLUMNS}
          rows={rows}
          getRowKey={(r) => r.id}
          pageSize={8}
          storageKey="btui-docs-orders"
          defaultSort={{ key: "amount", direction: "desc" }}
          onRowClick={(r) => setSelected(r.id)}
          selectedKey={selected}
          renderDetail={(r) => <div style={{ maxWidth: 320 }}><InfoRow label="Tarih">{r.date}</InfoRow><InfoRow label="Müşteri">{r.customer}</InfoRow></div>}
          chips={
            <ChipGroup>
              {STATUSES.map((s) => (
                <Chip key={s} tone={TONES[s]} active={status === s} count={ORDERS.filter((o) => o.status === s).length} onClick={() => setStatus(status === s ? "" : s)}>{s}</Chip>
              ))}
            </ChipGroup>
          }
          actions={<Button variant="primary" icon={<IconPlus size={14} />}>Yeni sipariş</Button>}
        />
      </Example>
      <h2>Sunucu taraflı</h2>
      <p><code>server</code> verilince tablo satırları olduğu gibi çizer, sayfa ve sıralama isteklerini size bildirir. Yüz binlerce satırlık listeler için bu yolu kullanın.</p>
      <CodeBlock>{`<DataTable
  columns={columns}
  rows={currentPage}
  getRowKey={(r) => r.id}
  pageSize={50}
  loading={isFetching}
  onSortChange={setSort}
  server={{ total, page, onPageChange: setPage }}
/>`}</CodeBlock>
      <Props rows={[
        ["columns", "Column<T>[]", "key, header, cell, sortValue, sortable, align, width, hidden, hideable, footer"],
        ["rows", "T[]", "Satırlar"],
        ["getRowKey", "(row: T) => string | number", "Satır kimliği"],
        ["title / titleNote / icon", "ReactNode", "Band başlığı"],
        ["chips / actions", "ReactNode", "Banttaki çipler ve düğmeler"],
        ["controls", "boolean", "Kolon ve yoğunluk menüleri; bant varsa açık"],
        ["storageKey", "string", "Tercihlerin saklandığı anahtar"],
        ["pageSize", "number", "Verilmezse sayfalama yok"],
        ["server", "{ total, page, onPageChange }", "Sunucu modu"],
        ["sort / defaultSort / onSortChange", "SortState | null", "Sıralama durumu"],
        ["loading / empty", "boolean / ReactNode", "Durum gösterimi"],
        ["onRowClick / selectedKey", "fn / key", "Tıklanır ve seçili satır"],
        ["renderDetail", "(row: T) => ReactNode", "Açılır satır ayrıntısı"],
        ["footerNote", "ReactNode", "Alt çubuğun solu, ör. toplam"],
      ]} />
    </>
  );
}

function ModalPage() {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  return (
    <>
      <p className="doc-lead">Odak pencere içinde kalır, Esc ve dış tıklama kapatır. İçindeki Select listeleri pencerenin üstünde açılır.</p>
      <Example code={`<Modal open={open} onClose={() => setOpen(false)} title="Yeni kayıt"
  footer={<><Button onClick={close}>Vazgeç</Button><Button variant="primary">Kaydet</Button></>}>
  <Field label="Ad"><Input /></Field>
</Modal>`}>
        <Button variant="primary" onClick={() => setOpen(true)}>Pencereyi aç</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Yeni kayıt" size="sm" footer={<><Button onClick={() => setOpen(false)}>Vazgeç</Button><Button variant="primary" onClick={() => setOpen(false)}>Kaydet</Button></>}>
          <div style={{ display: "grid", gap: 12 }}>
            <Field label="Ad"><Input placeholder="Ad Soyad" /></Field>
            <Field label="İl"><Select value={city} onChange={setCity} options={CITIES} /></Field>
          </div>
        </Modal>
      </Example>
      <Props rows={[
        ["open / onClose", "boolean / () => void", "Denetimli açılış"],
        ["title", "ReactNode", "Başlık bandı"],
        ["size", '"sm" | "md" | "lg" | "xl"', "440, 640, 880, 1120px"],
        ["footer", "ReactNode", "Alt düğmeler"],
      ]} />
    </>
  );
}

function FormPage() {
  const [on, setOn] = useState(true);
  return (
    <>
      <p className="doc-lead"><code>Field</code> etiketi, ipucunu ve hatayı alana bağlar; ekran okuyucular bunları birlikte duyurur.</p>
      <Example code={`<Field label="Ad" hint="Kimlikte yazdığı gibi"><Input /></Field>
<Field label="E-posta" error="Geçerli bir adres girin"><Input defaultValue="ali@" /></Field>
<Field label="Not"><Textarea rows={3} /></Field>
<SearchInput placeholder="Kayıt ara" />`}>
        <div className="doc-stack">
          <Field label="Ad" hint="Kimlikte yazdığı gibi"><Input /></Field>
          <Field label="E-posta" error="Geçerli bir adres girin"><Input defaultValue="ali@" /></Field>
          <Field label="Not"><Textarea rows={3} /></Field>
          <SearchInput block placeholder="Kayıt ara" />
        </div>
      </Example>
      <h2>Anahtar ve onay kutusu</h2>
      <Example code={`<Switch checked={on} onChange={setOn} label="Bildirimler" />
<Switch defaultChecked onLabel="Aktif" offLabel="Pasif" aria-label="Durum" />
<Checkbox defaultChecked label="Şartları kabul ediyorum" />
<Checkbox indeterminate label="Kısmen seçili" />`}>
        <Switch checked={on} onChange={setOn} label="Bildirimler" />
        <Switch defaultChecked onLabel="Aktif" offLabel="Pasif" aria-label="Durum" />
        <Checkbox defaultChecked label="Şartları kabul ediyorum" />
        <Checkbox indeterminate label="Kısmen seçili" />
      </Example>
    </>
  );
}

function CardPage() {
  return (
    <>
      <p className="doc-lead">Kart beyaz kalır, durum rakamın renginden okunur. Böylece bir panoda göz ilk önce sorunlu sayıya gider.</p>
      <Example block code={`<KpiGrid>
  <Kpi label="Açık sipariş" value="128" note="Bu ay" />
  <Kpi label="Tahsilat" value="1,2 M₺" tone="ok" />
  <Kpi label="Geciken" value="9" tone="danger" onClick={openList} />
</KpiGrid>`}>
        <KpiGrid>
          <Kpi label="Açık sipariş" value="128" note="Bu ay" icon={<IconChartBar size={13} />} />
          <Kpi label="Tahsilat" value="1,2 M₺" tone="ok" note="+%8" />
          <Kpi label="Bekleyen" value="34" tone="warn" />
          <Kpi label="Geciken" value="9" tone="danger" note="Tıklanabilir" onClick={() => {}} />
        </KpiGrid>
      </Example>
      <Example block code={`<Card title="Sipariş özeti" subtitle="Son 30 gün" actions={<Button size="sm">Tümü</Button>}>
  <InfoRow label="Müşteri">Mavi Yapı</InfoRow>
</Card>`}>
        <Card title="Sipariş özeti" subtitle="Son 30 gün" actions={<Button size="sm">Tümü</Button>}>
          <InfoRow label="Müşteri">Mavi Yapı</InfoRow>
          <InfoRow label="Tutar"><span className="bt-mono">{money(18450)}</span></InfoRow>
          <InfoRow label="Durum"><Status tone="ok">Tamam</Status></InfoRow>
        </Card>
      </Example>
    </>
  );
}

function BadgePage() {
  const [active, setActive] = useState("Tümü");
  return (
    <>
      <p className="doc-lead">Tablo hücrelerinde durum göstermek için küçük parçalar. Renk adları her bileşende aynıdır.</p>
      <Example code={`<Badge tone="ok">Tamam</Badge>
<Status tone="warn">Bekliyor</Status>
<Chip active count={42}>Tümü</Chip>
<Kbd>⌘K</Kbd>
<Avatar name="Ada Yılmaz" />
<Spinner />`}>
        <Badge>Taslak</Badge>
        <Badge tone="info">Yeni</Badge>
        <Badge tone="ok">Tamam</Badge>
        <Badge tone="warn">Bekliyor</Badge>
        <Badge tone="danger">Gecikti</Badge>
        <Status tone="ok">Çevrimiçi</Status>
        <Status tone="warn">Beklemede</Status>
        <Status tone="muted">Pasif</Status>
        <Kbd>⌘K</Kbd>
        <Avatar name="Ada Yılmaz" />
        <Spinner />
      </Example>
      <Example code={`<ChipGroup>
  <Chip active={active === "Tümü"} count={42} onClick={…}>Tümü</Chip>
</ChipGroup>`}>
        <ChipGroup>
          {[["Tümü", 42], ["Açık", 18], ["Kapalı", 24]].map(([label, count]) => (
            <Chip key={label} active={active === label} count={count} onClick={() => setActive(label as string)}>{label}</Chip>
          ))}
        </ChipGroup>
      </Example>
    </>
  );
}

function TabsPage() {
  return (
    <>
      <p className="doc-lead">Çok bölümlü sayfalar için. <code>chip</code> görünümü sayfa çubuğunda daha az yer kaplar.</p>
      <Example block code={`<Tabs items={[
  { value: "genel", label: "Genel", content: <p>…</p> },
  { value: "belgeler", label: "Belgeler", badge: 3, content: <p>…</p> },
]} />`}>
        <Tabs items={[{ value: "genel", label: "Genel", content: <p>Genel bilgiler burada.</p> }, { value: "belgeler", label: "Belgeler", badge: 3, content: <p>Belgeler burada.</p> }, { value: "gecmis", label: "Geçmiş", disabled: true }]} />
      </Example>
      <Example block code={`<Tabs variant="chip" items={items} />`}>
        <Tabs variant="chip" items={[{ value: "a", label: "Bu hafta", content: <p>Bu haftanın kayıtları.</p> }, { value: "b", label: "Bu ay", content: <p>Bu ayın kayıtları.</p> }]} />
      </Example>
    </>
  );
}

function FilterPage() {
  const [city, setCity] = useState("Ankara");
  const [q, setQ] = useState("");
  return (
    <>
      <p className="doc-lead">Listenin üstünde durur. Az kullanılan filtreler <code>more</code> altında katlanır, sayfa kısa kalır.</p>
      <Example block code={`<FilterBar onClear={clear} more={<Select variant="filter" label="Durum" … />}>
  <SearchInput value={q} onChange={(e) => setQ(e.target.value)} />
  <Select variant="filter" label="İl" … />
</FilterBar>`}>
        <FilterBar onClear={() => { setCity(""); setQ(""); }} more={<Select variant="filter" label="Durum" value="" onChange={() => {}} options={STATUSES.map((s) => ({ value: s, label: s }))} placeholder="Tümü" />}>
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kayıt ara" />
          <Select variant="filter" label="İl" value={city} onChange={setCity} options={CITIES} placeholder="Tümü" clearable />
        </FilterBar>
      </Example>
    </>
  );
}

function DrawerPage() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <p className="doc-lead">Listeden çıkmadan ayrıntı göstermek için sağdan açılır. Dokunmatik ekranda sağa kaydırarak kapanır.</p>
      <Example code={`<Drawer open={open} onClose={close} title="SP-1040" subtitle="Mavi Yapı">
  <InfoRow label="Tutar">18.450 ₺</InfoRow>
</Drawer>`}>
        <Button onClick={() => setOpen(true)} icon={<IconLayoutSidebarRight size={14} />}>Ayrıntıyı aç</Button>
        <Drawer open={open} onClose={() => setOpen(false)} title="SP-1040" subtitle="Mavi Yapı" footer={<Button variant="primary" onClick={() => setOpen(false)}>Tamam</Button>}>
          <InfoRow label="Tutar">18.450 ₺</InfoRow>
          <InfoRow label="İl">İzmir</InfoRow>
          <InfoRow label="Durum"><Badge tone="ok">Tamam</Badge></InfoRow>
        </Drawer>
      </Example>
    </>
  );
}

function ConfirmPage() {
  const confirm = useConfirm();
  const toast = useToast();
  return (
    <>
      <p className="doc-lead"><code>useConfirm</code>, tarayıcının <code>confirm()</code> kutusunun yerini alır ve sözle (Promise) yanıt verir.</p>
      <Example code={`const confirm = useConfirm();

if (await confirm({ message: "Kayıt silinsin mi?", danger: true, confirmLabel: "Sil" })) {
  await remove();
}`}>
        <Button variant="danger" onClick={async () => {
          const ok = await confirm({ message: "Bu kayıt kalıcı olarak silinecek.", danger: true, confirmLabel: "Sil" });
          toast(ok ? { title: "Kayıt silindi", tone: "ok" } : { title: "Vazgeçildi" });
        }}>Sil</Button>
      </Example>
      <h2>Bildirim</h2>
      <Example code={`const toast = useToast();
toast({ title: "Kaydedildi", description: "Değişiklikler alındı.", tone: "ok" });`}>
        <Button onClick={() => toast({ title: "Kaydedildi", description: "Değişiklikler alındı.", tone: "ok" })}>Başarılı</Button>
        <Button onClick={() => toast({ title: "Dikkat", description: "Oturumunuz bitmek üzere.", tone: "warn" })}>Uyarı</Button>
        <Button onClick={() => toast({ title: "Kaydedilemedi", description: "Bağlantıyı kontrol edin.", tone: "danger", timeout: 0 })}>Hata</Button>
      </Example>
    </>
  );
}

function MenuPage() {
  return (
    <>
      <p className="doc-lead">Satır eylemleri ve kullanıcı menüsü için. Tetikleyici olarak hangi öğeyi verirseniz o kullanılır.</p>
      <Example code={`<Menu trigger={<Button icon={<IconDots size={14} />}>İşlemler</Button>}>
  <MenuItem icon={<IconEdit size={14} />}>Düzenle</MenuItem>
  <MenuSeparator />
  <MenuItem danger icon={<IconTrash size={14} />}>Sil</MenuItem>
</Menu>

<Tooltip content="Yeni bildirim yok">
  <IconButton label="Bildirimler"><IconBell size={18} /></IconButton>
</Tooltip>`}>
        <Menu align="start" trigger={<Button icon={<IconDots size={14} />}>İşlemler</Button>}>
          <MenuItem icon={<IconEdit size={14} />}>Düzenle</MenuItem>
          <MenuItem disabled>Kopyala</MenuItem>
          <MenuSeparator />
          <MenuItem danger icon={<IconTrash size={14} />}>Sil</MenuItem>
        </Menu>
        <Tooltip content="Yeni bildirim yok"><IconButton label="Bildirimler"><IconBell size={18} /></IconButton></Tooltip>
      </Example>
    </>
  );
}

function DropPage() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <>
      <p className="doc-lead">Tıklanır ve sürükle-bırak dosya alanı. Sürüklenen dosyalar da <code>accept</code> ve <code>maxSize</code> denetiminden geçer.</p>
      <Example block code={`<FileDropzone files={files} onChange={setFiles} accept=".pdf,image/*" maxSize={5 * 1024 * 1024} multiple note="PDF ya da görsel, en çok 5 MB" />`}>
        <FileDropzone files={files} onChange={setFiles} accept=".pdf,image/*" maxSize={5 * 1024 * 1024} multiple note="PDF ya da görsel, en çok 5 MB" />
      </Example>
    </>
  );
}

function ShellPage() {
  return (
    <>
      <p className="doc-lead">Uygulama iskeleti: koyu yan menü, üst çubuk, içerik. Bu dokümantasyon sitesi de aynı bileşenlerle yapıldı; soldaki menü <code>Sidebar</code>, üstteki <code>Topbar</code>.</p>
      <CodeBlock>{`<AppShell
  storageKey="menu"
  sidebar={<Sidebar logoText="Uygulama" groups={[{ label: "Ana", items: [
    { label: "Pano", icon: <IconHome size={18} />, href: "/", active: true },
    { label: "Görevler", href: "/gorevler", count: 3 },
  ] }]} />}
  topbar={<Topbar><TopbarSearch /><TopbarSpacer /><Avatar name="Ada Yılmaz" /></Topbar>}
>
  <Page>
    <PageHeader title="Pano" breadcrumb={[{ label: "Ana", href: "/" }, { label: "Pano" }]} />
  </Page>
</AppShell>`}</CodeBlock>
      <h2>Yönlendirici bağlama</h2>
      <p>Next.js ya da React Router bağlantısı için <code>renderLink</code> verin.</p>
      <CodeBlock>{`<Sidebar groups={groups} renderLink={(props, item) => <Link {...props} href={item.href!} />} />`}</CodeBlock>
      <p>Menü geniş ekranda daralır, 800px altında çekmece olarak açılır. Üst çubuktaki düğme ikisini de yönetir.</p>
    </>
  );
}

export type DocPage = { id: string; title: string; group: string; icon: ComponentType<{ size?: number }>; Body: ComponentType };

export const GROUPS = ["Başlarken", "Form", "Veri", "Katmanlar", "Yerleşim"];

export const PAGES: DocPage[] = [
  { id: "baslangic", title: "Kurulum", group: "Başlarken", icon: IconHome, Body: GettingStarted },
  { id: "tema", title: "Tema", group: "Başlarken", icon: IconPalette, Body: Theme },
  { id: "button", title: "Button", group: "Form", icon: IconClick, Body: Buttons },
  { id: "select", title: "Select", group: "Form", icon: IconSelect, Body: SelectPage },
  { id: "multiselect", title: "MultiSelect", group: "Form", icon: IconChevronDown, Body: MultiSelectPage },
  { id: "field", title: "Field ve Input", group: "Form", icon: IconForms, Body: FormPage },
  { id: "filedropzone", title: "FileDropzone", group: "Form", icon: IconFileUpload, Body: DropPage },
  { id: "datatable", title: "DataTable", group: "Veri", icon: IconTable, Body: TablePage },
  { id: "card", title: "Card ve Kpi", group: "Veri", icon: IconBox, Body: CardPage },
  { id: "badge", title: "Badge ve Chip", group: "Veri", icon: IconTag, Body: BadgePage },
  { id: "modal", title: "Modal", group: "Katmanlar", icon: IconWindowMaximize, Body: ModalPage },
  { id: "drawer", title: "Drawer", group: "Katmanlar", icon: IconLayoutSidebarRight, Body: DrawerPage },
  { id: "confirm", title: "Onay ve Bildirim", group: "Katmanlar", icon: IconAlertTriangle, Body: ConfirmPage },
  { id: "menu", title: "Menu ve Tooltip", group: "Katmanlar", icon: IconDots, Body: MenuPage },
  { id: "appshell", title: "AppShell", group: "Yerleşim", icon: IconLayoutSidebar, Body: ShellPage },
  { id: "filterbar", title: "FilterBar", group: "Yerleşim", icon: IconFilter, Body: FilterPage },
  { id: "tabs", title: "Tabs", group: "Yerleşim", icon: IconColumns3, Body: TabsPage },
];
