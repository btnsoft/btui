import { useMemo, useRef, useState } from "react";
import { IconCopy, IconEye, IconTrash } from "@tabler/icons-react";
import { Badge, Button, DataTable, Select, fillSeries, pivot, type CellChange, type Column, type DataSource, type TableState } from "btui";
import { CITY_NAMES, CUSTOMERS, ORDERS, STATUS_LABEL, STATUS_TONE, money, type Order, type OrderStatus } from "../lib/data";
import { useLang, useText, type Text } from "../lib/i18n";
import { definePage } from "../lib/schema";

function useColumns(): Column<Order>[] {
  const t = useText();
  const lang = useLang();
  return useMemo(() => [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), width: 120, pin: undefined, cell: (r) => <span className="bt-mono">{r.no}</span> },
    { key: "customer", header: t({ tr: "Müşteri", en: "Customer" }), width: 190 },
    { key: "city", header: t({ tr: "İl", en: "City" }), width: 130, filter: "set" },
    { key: "owner", header: t({ tr: "Sorumlu", en: "Owner" }), width: 150, filter: "set" },
    { key: "date", header: t({ tr: "Tarih", en: "Date" }), width: 130, type: "date" },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), width: 130, type: "number", align: "right", aggregate: "sum", format: (v) => (typeof v === "number" ? money(v, lang) : "") },
    {
      key: "status",
      header: t({ tr: "Durum", en: "Status" }),
      width: 120,
      filter: "set",
      format: (v) => t(STATUS_LABEL[v as OrderStatus]),
      cell: (r) => <Badge tone={STATUS_TONE[r.status]}>{t(STATUS_LABEL[r.status])}</Badge>,
    },
  ], [t, lang]);
}

function Everything() {
  const t = useText();
  const columns = useColumns();
  const [keys, setKeys] = useState<Array<string | number>>([]);
  return (
    <DataTable
      advanced
      title={t({ tr: "Siparişler", en: "Orders" })}
      columns={columns}
      rows={ORDERS}
      getRowKey={(r) => r.id}
      pageSize={8}
      pageSizeOptions={[8, 20, 50]}
      totals
      exportFileName="orders"
      selectedKeys={keys}
      onSelectionChange={setKeys}
      bulkActions={<Button size="sm" variant="danger" icon={<IconTrash size={14} />}>{t({ tr: "Sil", en: "Delete" })}</Button>}
    />
  );
}

const BIG = Array.from({ length: 100000 }, (_, i): Order => ({
  id: i + 1,
  no: `SP-${100000 + i}`,
  customer: CUSTOMERS[i % CUSTOMERS.length],
  city: CITY_NAMES[(i * 7) % CITY_NAMES.length],
  amount: 500 + ((i * 7919) % 90000),
  status: (["open", "pending", "done", "cancelled"] as const)[(i * 3 + (i >> 2)) % 4],
  date: `202${5 + (i % 2)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
  owner: ["Ada Yılmaz", "Can Demir", "Elif Kaya", "Mert Aydın"][i % 4],
}));

function Virtual() {
  const t = useText();
  const columns = useColumns();
  return <DataTable virtual advanced title={t({ tr: "100.000 sipariş", en: "100,000 orders" })} columns={columns} rows={BIG} getRowKey={(r) => r.id} maxHeight={420} defaultDensity="compact" totals />;
}

function Filters() {
  const t = useText();
  const columns = useColumns();
  return (
    <DataTable
      filterable
      searchable
      title={t({ tr: "Filtreli liste", en: "Filtered list" })}
      columns={columns}
      rows={ORDERS}
      getRowKey={(r) => r.id}
      pageSize={6}
      defaultFilters={{ status: { type: "set", values: [t(STATUS_LABEL.open), t(STATUS_LABEL.pending)] } }}
    />
  );
}

function Grouping() {
  const t = useText();
  const columns = useColumns();
  return <DataTable groupable title={t({ tr: "İl ve duruma göre", en: "By city and status" })} columns={columns} rows={ORDERS} getRowKey={(r) => r.id} defaultGroupBy={["city"]} totals exportable maxHeight={380} />;
}

function Layout() {
  const t = useText();
  const columns = useColumns();
  return <DataTable resizable reorderable pinnable title={t({ tr: "Düzenlenebilir düzen", en: "Adjustable layout" })} columns={columns.map((c) => (c.key === "no" ? { ...c, pin: "left" as const } : c))} rows={ORDERS} getRowKey={(r) => r.id} pageSize={5} storageKey="btui-docs-grid-layout" />;
}

function Range() {
  const t = useText();
  const columns = useColumns();
  return <DataTable cellSelection title={t({ tr: "Hücre seçimi", en: "Cell selection" })} columns={columns} rows={ORDERS.slice(0, 10)} getRowKey={(r) => r.id} />;
}

type Budget = { id: number; item: string; category: string; qty: number; price: number };

function Editing() {
  const t = useText();
  const categories = [{ value: "ofis", label: t({ tr: "Ofis", en: "Office" }) }, { value: "bt", label: t({ tr: "Bilişim", en: "IT" }) }];
  const [rows, setRows] = useState<Budget[]>([
    { id: 1, item: t({ tr: "Dizüstü bilgisayar", en: "Laptop" }), category: "bt", qty: 4, price: 42000 },
    { id: 2, item: t({ tr: "Sandalye", en: "Chair" }), category: "ofis", qty: 12, price: 3800 },
    { id: 3, item: t({ tr: "Yazıcı", en: "Printer" }), category: "bt", qty: 2, price: 9500 },
    { id: 4, item: t({ tr: "Masa", en: "Desk" }), category: "ofis", qty: 6, price: 6200 },
  ]);
  const columns: Column<Budget>[] = [
    { key: "item", header: t({ tr: "Kalem", en: "Item" }), editable: true, validate: (v) => (v ? undefined : t({ tr: "Boş olamaz", en: "Required" })) },
    { key: "category", header: t({ tr: "Kategori", en: "Category" }), editable: true, options: categories, format: (v) => categories.find((c) => c.value === v)?.label ?? "" },
    { key: "qty", header: t({ tr: "Adet", en: "Qty" }), type: "number", align: "right", editable: true, aggregate: "sum", validate: (v) => (typeof v === "number" && v >= 0 ? undefined : t({ tr: "Sıfırdan küçük olamaz", en: "Cannot be negative" })) },
    { key: "price", header: t({ tr: "Birim fiyat", en: "Unit price" }), type: "number", align: "right", editable: true },
    { key: "total", header: t({ tr: "Toplam", en: "Total" }), type: "number", align: "right", value: (r) => r.qty * r.price, aggregate: "sum" },
  ];
  const save = (changes: CellChange<Budget>[]) => setRows((list) => list.map((row) => changes.reduce((acc, c) => (c.row.id === row.id ? { ...acc, [c.key]: c.value } : acc), row)));
  return <DataTable cellSelection controls={false} columns={columns} rows={rows} getRowKey={(r) => r.id} onCellEdit={save} totals />;
}

type PlanRow = { id: number; lot: string; date: string; qty: number; site: string };

const PLAN: PlanRow[] = [
  { id: 1, lot: "LOT-0098", date: "2026-11-02", qty: 120, site: "İzmir" },
  { id: 2, lot: "LOT-0099", date: "2026-11-03", qty: 140, site: "İzmir" },
  { id: 3, lot: "", date: "", qty: 0, site: "" },
  { id: 4, lot: "", date: "", qty: 0, site: "" },
  { id: 5, lot: "", date: "", qty: 0, site: "" },
  { id: 6, lot: "", date: "", qty: 0, site: "" },
];

function FillHandle() {
  const t = useText();
  const [rows, setRows] = useState(PLAN);
  const [calls, setCalls] = useState<number[]>([]);
  const columns: Column<PlanRow>[] = [
    { key: "lot", header: t({ tr: "Parti", en: "Lot" }), editable: true },
    { key: "date", header: t({ tr: "Üretim tarihi", en: "Production date" }), type: "date", editable: true },
    { key: "qty", header: t({ tr: "Adet", en: "Quantity" }), type: "number", align: "right", editable: true },
    { key: "site", header: t({ tr: "Tesis", en: "Plant" }), editable: true },
  ];
  const save = (changes: CellChange<PlanRow>[]) => {
    setCalls((list) => [...list, changes.length]);
    setRows((list) => list.map((row) => changes.reduce((acc, c) => (c.row.id === row.id ? { ...acc, [c.key]: c.value } : acc), row)));
  };
  return (
    <div className="d-stack-wide">
      <DataTable
        cellSelection
        title={t({ tr: "Üretim planı", en: "Production plan" })}
        titleNote={`onCellEdit: ${calls.length}`}
        controls={false}
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        onCellEdit={save}
      />
      <small>{calls.length ? t({ tr: `Son çağrıda ${calls[calls.length - 1]} hücre değişti.`, en: `The last call changed ${calls[calls.length - 1]} cells.` }) : t({ tr: "İlk iki satırı seçin, sağ alttaki kareyi aşağı sürükleyin.", en: "Select the first two rows and drag the square at the bottom right downwards." })}</small>
      <code>{`fillSeries([120, 140], 3) = ${JSON.stringify(fillSeries([120, 140], 3))}`}</code>
    </div>
  );
}

type Unit = { id: string; name: Text; owner?: string; budget?: number; spent?: number; children?: Unit[] };

const LINE = (id: string, name: Text, owner: string, budget: number, spent: number): Unit => ({ id, name, owner, budget, spent });

const BUDGET: Unit[] = [
  {
    id: "sales",
    name: { tr: "Satış", en: "Sales" },
    children: [
      {
        id: "sales-marmara",
        name: { tr: "Marmara bölgesi", en: "Marmara region" },
        children: [
          LINE("sm-1", { tr: "Saha ekibi", en: "Field team" }, "Ada Yılmaz", 420000, 396500),
          LINE("sm-2", { tr: "Fuar ve etkinlik", en: "Fairs and events" }, "Can Demir", 150000, 171200),
        ],
      },
      {
        id: "sales-ege",
        name: { tr: "Ege bölgesi", en: "Aegean region" },
        children: [
          LINE("se-1", { tr: "Saha ekibi", en: "Field team" }, "Elif Kaya", 310000, 287400),
          LINE("se-2", { tr: "Bayi destekleri", en: "Dealer support" }, "Mert Aydın", 95000, 61800),
        ],
      },
    ],
  },
  {
    id: "ops",
    name: { tr: "Operasyon", en: "Operations" },
    children: [
      LINE("op-1", { tr: "Depo kirası", en: "Warehouse rent" }, "Can Demir", 540000, 540000),
      LINE("op-2", { tr: "Nakliye", en: "Freight" }, "Mert Aydın", 380000, 412600),
    ],
  },
  LINE("it", { tr: "Bilişim", en: "IT" }, "Elif Kaya", 260000, 198300),
];

function useBudgetColumns(): Column<Unit>[] {
  const t = useText();
  const lang = useLang();
  const amount = (v: unknown) => (typeof v === "number" ? money(v, lang) : "");
  return [
    { key: "name", header: t({ tr: "Gider merkezi", en: "Cost centre" }), width: 280, value: (r) => t(r.name) },
    { key: "owner", header: t({ tr: "Sorumlu", en: "Owner" }), width: 150, filter: "set" },
    { key: "budget", header: t({ tr: "Bütçe", en: "Budget" }), type: "number", align: "right", width: 150, aggregate: "sum", format: amount },
    { key: "spent", header: t({ tr: "Harcanan", en: "Spent" }), type: "number", align: "right", width: 150, aggregate: "sum", format: amount },
  ];
}

function Tree() {
  const t = useText();
  const columns = useBudgetColumns();
  return (
    <DataTable
      cellSelection
      searchable
      filterable
      totals
      controls={false}
      title={t({ tr: "2026 gider bütçesi", en: "2026 expense budget" })}
      columns={columns}
      rows={BUDGET}
      getRowKey={(r) => r.id}
      getChildren={(r) => r.children}
      defaultExpanded={1}
    />
  );
}

const LAZY: Unit[] = [
  { id: "north", name: { tr: "Kuzey deposu", en: "North warehouse" }, owner: "Ada Yılmaz", budget: 640000, spent: 588000 },
  { id: "south", name: { tr: "Güney deposu", en: "South warehouse" }, owner: "Can Demir", budget: 410000, spent: 377500 },
  { id: "archive", name: { tr: "Kapalı depo", en: "Closed warehouse" }, owner: "Elif Kaya", budget: 12000, spent: 12000 },
];

function LazyTree() {
  const t = useText();
  const columns = useBudgetColumns();
  const [requests, setRequests] = useState(0);
  const load = async (row: Unit) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    setRequests((n) => n + 1);
    const share = (row.budget ?? 0) / 2;
    const used = (row.spent ?? 0) / 2;
    return [
      { id: `${row.id}-rack`, name: { tr: "Raf sistemi", en: "Racking" }, owner: row.owner, budget: share, spent: used },
      { id: `${row.id}-fork`, name: { tr: "Forklift bakımı", en: "Forklift service" }, owner: row.owner, budget: share, spent: used },
    ];
  };
  return (
    <DataTable
      cellSelection
      controls={false}
      title={t({ tr: "Depolar", en: "Warehouses" })}
      titleNote={`${requests} ${t({ tr: "istek", en: "requests" })}`}
      columns={columns}
      rows={LAZY}
      getRowKey={(r) => r.id}
      hasChildren={(r) => r.id !== "archive"}
      loadChildren={load}
    />
  );
}

type RegionRow = { id: number; region: Text; q1: number; q2: number; q3: number };

const REGIONS: RegionRow[] = [
  { id: 1, region: "Marmara", q1: 1245000, q2: 1389000, q3: 1502000 },
  { id: 2, region: { tr: "Ege", en: "Aegean" }, q1: 812000, q2: 846000, q3: 917000 },
  { id: 3, region: { tr: "İç Anadolu", en: "Central Anatolia" }, q1: 604000, q2: 655000, q3: 688000 },
  { id: 4, region: { tr: "Akdeniz", en: "Mediterranean" }, q1: 498000, q2: 561000, q3: 702000 },
  { id: 5, region: { tr: "Karadeniz", en: "Black Sea" }, q1: 287000, q2: 301000, q3: 322000 },
];

function SelectionCharts() {
  const t = useText();
  const lang = useLang();
  const amount = (v: unknown) => (typeof v === "number" ? money(v, lang) : "");
  const columns: Column<RegionRow>[] = [
    { key: "region", header: t({ tr: "Bölge", en: "Region" }), value: (r) => t(r.region) },
    { key: "q1", header: t({ tr: "1. çeyrek", en: "Q1" }), type: "number", align: "right", format: amount },
    { key: "q2", header: t({ tr: "2. çeyrek", en: "Q2" }), type: "number", align: "right", format: amount },
    { key: "q3", header: t({ tr: "3. çeyrek", en: "Q3" }), type: "number", align: "right", format: amount },
  ];
  return <DataTable cellSelection controls={false} title={t({ tr: "Bölgelere göre ciro", en: "Revenue by region" })} columns={columns} rows={REGIONS} getRowKey={(r) => r.id} />;
}

function ServerGrid() {
  const t = useText();
  const lang = useLang();
  const columns = useColumns();
  const log = useRef(0);
  const [requests, setRequests] = useState(0);
  const source = useMemo<DataSource<Order>>(() => ({
    getRows: async ({ start, end, sorts, search }) => {
      await new Promise((resolve) => setTimeout(resolve, 350));
      log.current += 1;
      setRequests(log.current);
      const query = search.toLocaleLowerCase(lang);
      let rows = query ? BIG.filter((o) => `${o.no} ${o.customer}`.toLocaleLowerCase(lang).includes(query)) : BIG;
      const sort = sorts[0];
      if (sort) {
        const sign = sort.direction === "asc" ? 1 : -1;
        const read = (o: Order) => o[sort.key as keyof Order];
        rows = [...rows].sort((a, b) => (read(a) > read(b) ? sign : read(a) < read(b) ? -sign : 0));
      }
      return { rows: rows.slice(start, end), total: rows.length };
    },
  }), [lang]);
  return <DataTable searchable title={t({ tr: "Sunucudan yüklenen", en: "Loaded from the server" })} titleNote={`${requests} ${t({ tr: "istek", en: "requests" })}`} columns={columns} rows={[]} getRowKey={(r) => r.id} dataSource={source} maxHeight={380} onSortChange={() => undefined} />;
}

function Pivot() {
  const t = useText();
  const lang = useLang();
  const columns = useColumns();
  const [across, setAcross] = useState("status");
  const [kind, setKind] = useState<"sum" | "avg" | "count">("sum");
  const byKey = (key: string) => columns.find((c) => c.key === key)!;
  const table = pivot(ORDERS, { rows: [byKey("city")], columns: byKey(across), value: byKey("amount"), aggregate: kind }, lang, t({ tr: "Toplam", en: "Total" }));
  return (
    <div className="d-stack-wide">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Select variant="filter" label={t({ tr: "Sütun", en: "Columns" })} value={across} onChange={setAcross} options={[{ value: "status", label: t({ tr: "Durum", en: "Status" }) }, { value: "owner", label: t({ tr: "Sorumlu", en: "Owner" }) }]} />
        <Select variant="filter" label={t({ tr: "Hesap", en: "Measure" })} value={kind} onChange={(v) => setKind(v as typeof kind)} options={[{ value: "sum", label: t({ tr: "Toplam", en: "Sum" }) }, { value: "avg", label: t({ tr: "Ortalama", en: "Average" }) }, { value: "count", label: t({ tr: "Adet", en: "Count" }) }]} />
      </div>
      <DataTable key={`${across}-${kind}`} cellSelection exportable title={t({ tr: "İl bazında tutar", en: "Amount by city" })} columns={table.columns} rows={table.rows} getRowKey={(r) => r.id} defaultSort={{ key: "__total", direction: "desc" }} />
    </div>
  );
}

function Views() {
  const t = useText();
  const columns = useColumns();
  const views: Record<string, Partial<TableState>> = {
    all: {},
    open: { filters: { status: { type: "set", values: [t(STATUS_LABEL.open)] } }, sorts: [{ key: "amount", direction: "desc" }] },
    team: { groupBy: ["owner"], hidden: ["city"], compact: true },
  };
  const [view, setView] = useState("all");
  return (
    <div className="d-stack-wide">
      <div>
        <Select variant="filter" label={t({ tr: "Görünüm", en: "View" })} value={view} onChange={setView} options={[{ value: "all", label: t({ tr: "Tümü", en: "All" }) }, { value: "open", label: t({ tr: "Açık ve büyük", en: "Open, largest first" }) }, { value: "team", label: t({ tr: "Sorumluya göre", en: "By owner" }) }]} />
      </div>
      <DataTable key={view} initialState={views[view]} columns={columns} rows={ORDERS} getRowKey={(r) => r.id} pageSize={5} groupable filterable title={t({ tr: "Kayıtlı görünümler", en: "Saved views" })} />
    </div>
  );
}

function RowMenu() {
  const t = useText();
  const columns = useColumns();
  const [last, setLast] = useState("");
  return (
    <DataTable
      cellSelection
      title={t({ tr: "Sağ tık menüsü", en: "Right-click menu" })}
      titleNote={last || undefined}
      columns={columns}
      rows={ORDERS.slice(0, 5)}
      getRowKey={(r) => r.id}
      contextMenu={({ row }) => [
        { label: t({ tr: "Ayrıntıyı aç", en: "Open details" }), icon: <IconEye size={14} />, onClick: () => setLast(row.no) },
        { label: t({ tr: "Numarayı kopyala", en: "Copy number" }), icon: <IconCopy size={14} />, onClick: () => { void navigator.clipboard?.writeText(row.no); setLast(row.no); } },
        { label: t({ tr: "Sil", en: "Delete" }), icon: <IconTrash size={14} />, danger: true, onClick: () => setLast(row.no) },
      ]}
    />
  );
}

export default definePage({
  summary: {
    tr: "Filtre, gruplama, toplam, Excel, hücre seçimi, yerinde düzenleme, doldurma tutamacı, ağaç veri, seçimden grafik, 100 bin satır ve sunucu verisi. Paralı ızgaralarda lisans gerektiren yetenekler btui'da MIT lisansıyla gelir.",
    en: "Filters, grouping, totals, Excel, cell selection, inline editing, fill handle, tree data, charts from a selection, 100k rows and server data. Features paid grids put behind a licence come with btui under MIT.",
  },
  imports: 'import { DataTable, fillSeries, pivot, type Column, type DataSource } from "btui";',
  hero: {
    Demo: Everything,
    block: true,
    code: `<DataTable
  advanced
  title="Orders"
  columns={columns}
  rows={orders}
  getRowKey={(r) => r.id}
  pageSize={8}
  pageSizeOptions={[8, 20, 50]}
  totals
  exportFileName="orders"
/>`,
  },
  use: {
    do: [
      { tr: "Kullanıcının veriyi süzüp, gruplayıp, dışa aktardığı operasyon ve raporlama ekranları", en: "Operations and reporting screens where people slice, group and export data" },
      { tr: "Excel'den kopyala-yapıştırla çalışan ekipler; hücre seçimi ve yapıştırma tanıdık gelir", en: "Teams that live in Excel; cell selection and paste feel familiar" },
      { tr: "Milyonlarca kayıt; `dataSource` yalnız görünen blokları ister", en: "Millions of records; `dataSource` asks only for the blocks in view" },
      { tr: "Planlama ekranları; doldurma tutamacı seriyi Excel'deki gibi sürdürür", en: "Planning screens; the fill handle continues a series as Excel does" },
      { tr: "Hiyerarşik kayıtlar: gider merkezi, ürün ağacı, organizasyon; `getChildren` satırları iç içe çizer", en: "Hierarchies: cost centres, bills of materials, organisations; `getChildren` nests the rows" },
    ],
    dont: [
      { tr: "Beş satırlık özet tablolar; düz `DataTable` daha sade kalır", en: "Five-row summary tables; a plain `DataTable` stays simpler" },
      { tr: "Yüzlerce kolonlu tablolar; kolonlar sanal çizilmez, yalnız satırlar çizilir", en: "Tables with hundreds of columns; only rows are virtualised, not columns" },
      { tr: "Formül hesaplayan hesap tablosu; btui bir ızgaradır, Excel motoru değildir", en: "Spreadsheets with formulas; btui is a grid, not a calculation engine" },
    ],
  },
  anatomy: `<DataTable
  advanced             // every switch below at once
  searchable filterable groupable pinnable
  resizable reorderable cellSelection exportable
  virtual maxHeight={480}
  totals
  onCellEdit={save}
  dataSource={source}
/>`,
  examples: [
    {
      id: "virtual",
      title: { tr: "100 bin satır", en: "100,000 rows" },
      body: { tr: "`virtual` yalnız görünen satırları çizer; kaydırma, sıralama ve filtre 100 bin satırda akıcı kalır. Aşağıdaki veri tarayıcıda duruyor; başlığa basıp sıralayın, kaydırın. `maxHeight` kaydırma alanını belirler.", en: "`virtual` draws only the rows in view, so scrolling, sorting and filtering stay smooth at 100k. This data lives in the browser: sort a header and scroll. `maxHeight` sets the scroll area." },
      example: { Demo: Virtual, block: true, code: `<DataTable virtual advanced columns={columns} rows={rows} getRowKey={(r) => r.id} maxHeight={420} totals />` },
    },
    {
      id: "filters",
      title: { tr: "Kolon filtreleri", en: "Column filters" },
      body: { tr: "Başlığın üstüne gelince çıkan menüden filtreleyin. Kolon tipine göre panel değişir: metinde koşul, sayıda aralık, tarihte takvim, `filter: \"set\"` kolonda değer listesi. Filtreler birlikte çalışır, bantta tek düğmeyle temizlenir.", en: "Filter from the menu that appears on a header. The panel follows the column type: conditions for text, ranges for numbers, a calendar for dates and a value list for `filter: \"set\"`. Filters combine and clear with one button in the band." },
      example: {
        Demo: Filters,
        block: true,
        code: `const columns = [
  { key: "city", header: "City", filter: "set" },
  { key: "date", header: "Date", type: "date" },
  { key: "amount", header: "Amount", type: "number" },
];

<DataTable
  filterable
  searchable
  columns={columns}
  rows={rows}
  defaultFilters={{ status: { type: "set", values: ["Open"] } }}
/>`,
      },
    },
    {
      id: "grouping",
      title: { tr: "Gruplama ve toplamlar", en: "Grouping and totals" },
      body: { tr: "Kolon menüsünden \"Grupla\" ile iç içe gruplar kurulur. `aggregate` verilen kolonlar grup satırında ve `totals` ile altta özetlenir: `sum`, `avg`, `min`, `max`, `count` ya da kendi işleviniz. Excel çıktısı grupları katlanabilir satırlar olarak yazar.", en: "\"Group\" in the column menu builds nested groups. Columns with `aggregate` summarise on group rows and, with `totals`, at the bottom: `sum`, `avg`, `min`, `max`, `count` or your own function. Excel output writes groups as collapsible rows." },
      example: {
        Demo: Grouping,
        block: true,
        code: `{ key: "amount", header: "Amount", type: "number", aggregate: "sum" }

<DataTable groupable defaultGroupBy={["city"]} totals exportable columns={columns} rows={rows} />`,
      },
    },
    {
      id: "layout",
      title: { tr: "Sabitleme, boyut ve sıra", en: "Pinning, sizing and order" },
      body: { tr: "Kolon kenarını sürükleyerek boyutlandırın, çift tıklayarak içeriğe sığdırın, başlığı sürükleyerek yerini değiştirin. Menüden sola ya da sağa sabitleyin. Klavyede kenar tutamacı ok tuşlarıyla, sıra da menüdeki oklarla değişir. `storageKey` düzeni hatırlar.", en: "Drag a column edge to resize, double-click to fit, drag a header to reorder, and pin left or right from the menu. On the keyboard, the edge handle takes arrow keys and the menu has move buttons. `storageKey` remembers the layout." },
      example: { Demo: Layout, block: true, code: `<DataTable resizable reorderable pinnable storageKey="orders-layout" columns={columns} rows={rows} />` },
    },
    {
      id: "range",
      title: { tr: "Hücre seçimi ve kopyalama", en: "Cell selection and copy" },
      body: { tr: "Fareyle sürükleyin ya da Shift ve ok tuşlarıyla aralık seçin. Alt çubukta adet, toplam, ortalama, en az ve en çok görünür. `Ctrl+C` seçimi Excel'in anladığı biçimde kopyalar.", en: "Drag with the mouse or use Shift with the arrows to select a range. The footer shows count, sum, average, min and max. `Ctrl+C` copies in the format Excel understands." },
      example: { Demo: Range, block: true, code: `<DataTable cellSelection columns={columns} rows={rows} getRowKey={(r) => r.id} />` },
    },
    {
      id: "editing",
      title: { tr: "Yerinde düzenleme", en: "Inline editing" },
      body: { tr: "Çift tıklayın, Enter'a basın ya da yazmaya başlayın. Enter aşağı, Tab sağa geçer, Esc vazgeçer. `validate` hatalı değeri reddeder, Delete seçimi temizler, Excel'den yapıştırma çalışır, `Ctrl+Z` ve `Ctrl+Y` geri alır. `onCellEdit` hepsini tek biçimde değişiklik listesi olarak bildirir; yapıştırma tek çağrıda gelir. Toplam kolonu hesaplanan bir `value` kullanıyor.", en: "Double-click, press Enter or start typing. Enter moves down, Tab moves right and Esc cancels. `validate` rejects bad values, Delete clears the selection, pasting from Excel works, and `Ctrl+Z` and `Ctrl+Y` undo and redo. `onCellEdit` reports everything as one list of changes, so a paste arrives in a single call. The total column uses a computed `value`." },
      example: {
        Demo: Editing,
        block: true,
        code: `const columns = [
  { key: "qty", header: "Qty", type: "number", editable: true,
    validate: (v) => (v >= 0 ? undefined : "Cannot be negative") },
  { key: "category", header: "Category", editable: true, options: categories },
];

<DataTable
  cellSelection
  columns={columns}
  rows={rows}
  onCellEdit={(changes) => save(changes)}
/>`,
      },
    },
    {
      id: "export",
      title: { tr: "Excel ve CSV", en: "Excel and CSV" },
      body: { tr: "`exportable`, ek paket olmadan gerçek `.xlsx` üretir: biçimli ve sabit başlık, otomatik filtre, sayı ve tarih hücreleri, gruplar için katlanabilir satırlar, toplam satırı. Filtre ve sıralama korunur, tüm sayfalar yazılır. Hücre metni formül olarak çalışmaz. CSV'de Türkçe harfler bozulmaz, formül karakterleri etkisizleştirilir. Tablo dışında `buildXlsx` ile de kullanılabilir.", en: "`exportable` writes a real `.xlsx` with no extra package: a styled frozen header, auto filter, number and date cells, collapsible group rows and a totals row. Filters and sort carry over and every page is written. Cell text never runs as a formula. CSV keeps Turkish letters and neutralises formula characters. `buildXlsx` also works outside the table." },
      code: `import { buildXlsx, download } from "btui";

const file = buildXlsx({
  name: "Orders",
  columns: [{ header: "Customer" }, { header: "Amount", type: "number" }],
  rows: [["Ege Tekstil", 18450]],
});
download(file, "orders.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");`,
    },
    {
      id: "server",
      title: { tr: "Sunucu veri modeli", en: "Server row model" },
      body: { tr: "`dataSource` milyonlarca satır için: tablo kaydırıldıkça 100'lük bloklar ister, geleni önbellekte tutar, sıralama ya da arama değişince eski istekleri iptal eder. Yüklenmeyen satırlar iskelet gösterir. Burada 350 ms gecikmeli bir sunucu taklit ediliyor; kaydırırken başlıktaki istek sayısını izleyin. Excel çıktısı tüm kayıtları bloklar halinde çeker.", en: "`dataSource` is for millions of rows: the table asks for blocks of 100 as it scrolls, caches them and cancels stale requests when sort or search change. Rows not yet loaded show a placeholder. This demo fakes a server with 350 ms latency, so watch the request count while scrolling. Excel export fetches every record in blocks." },
      example: {
        Demo: ServerGrid,
        block: true,
        code: `const source = {
  getRows: async ({ start, end, sorts, filters, search, signal }) => {
    const response = await fetch(buildUrl({ start, end, sorts, filters, search }), { signal });
    return response.json(); // { rows, total }
  },
};

<DataTable dataSource={source} columns={columns} rows={[]} getRowKey={(r) => r.id} maxHeight={480} />`,
      },
    },
    {
      id: "pivot",
      title: "Pivot",
      body: { tr: "`pivot` satırları çapraz tabloya çevirir, sonucu `DataTable` çizer; sıralama, hücre seçimi ve Excel aynen çalışır. Satır ve sütun toplamları kendiliğinden gelir. Alanları değiştirip deneyin.", en: "`pivot` turns rows into a cross-tab and `DataTable` draws it, so sorting, cell selection and Excel keep working. Row and column totals come for free. Change the fields to try it." },
      example: {
        Demo: Pivot,
        block: true,
        code: `const table = pivot(
  orders,
  { rows: [cityColumn], columns: statusColumn, value: amountColumn, aggregate: "sum" },
  "tr",
  "Toplam",
);

<DataTable columns={table.columns} rows={table.rows} getRowKey={(r) => r.id} />`,
      },
    },
    {
      id: "views",
      title: { tr: "Kayıtlı görünümler", en: "Saved views" },
      body: { tr: "Kolonlar, sıra, genişlikler, sabitlemeler, sıralama, filtre, gruplama ve yoğunluk tek bir durum nesnesidir. `onStateChange` ile sunucuya kaydedin, `initialState` ile geri yükleyin. Kullanıcı başına görünüm böyle kurulur.", en: "Columns, order, widths, pins, sort, filters, grouping and density form one state object. Store it with `onStateChange` and restore it with `initialState`, which is how per-user views work." },
      example: {
        Demo: Views,
        block: true,
        code: `<DataTable
  key={viewId}
  initialState={view.state}
  onStateChange={(state) => saveView(viewId, state)}
  columns={columns}
  rows={rows}
/>`,
      },
    },
    {
      id: "context-menu",
      title: { tr: "Sağ tık menüsü", en: "Context menu" },
      body: { tr: "Kopyalama ve dışa aktarma hazır gelir; `contextMenu` satıra özel eylemler ekler. Bir hücreye sağ tıklayın.", en: "Copy and export come ready, and `contextMenu` adds actions for the row. Right-click a cell." },
      example: {
        Demo: RowMenu,
        block: true,
        code: `<DataTable
  cellSelection
  contextMenu={({ row, column }) => [
    { label: "Open details", onClick: () => open(row) },
    { label: "Delete", danger: true, onClick: () => remove(row) },
  ]}
/>`,
      },
    },
    {
      id: "fill-handle",
      title: { tr: "Doldurma tutamacı", en: "Fill handle" },
      body: { tr: "Seçimin sağ altındaki kareyi dört yönden birine sürükleyin. Sayılar adımını izler, ISO tarihler günle ilerler, sayıyla biten metin artar, geri kalanı yinelenir. Tek sayı yinelenir, adımı görmek için iki hücre seçin; tek tarih ve sayıyla biten tek metin birer artar. Sola ve yukarı sürüklemede seri geriye doğru sürer. `Ctrl + D` seçimin ilk satırını aşağı, `Ctrl + R` ilk sütununu sağa kopyalar; bu iki tuş seri üretmez ve tek hücrede bir şey yapmaz. Tüm doldurma tek `onCellEdit` çağrısıyla gelir ve `Ctrl + Z` ile tek adımda geri alınır. `validate` reddeden ve `editable` olmayan hücreler atlanır. Aynı kuralları paketten gelen `fillSeries` ile tablo dışında da kullanabilirsiniz.", en: "Drag the square at the bottom right of the selection in any of the four directions. Numbers follow their step, ISO dates follow days, text ending in a number increments and anything else repeats. A single number repeats, so select two cells to give it a step; a single date and a single text ending in a number go up by one. Dragging left or up runs the series backwards. `Ctrl + D` copies the first row of the selection down and `Ctrl + R` copies its first column right; these two keys build no series and do nothing on a single cell. A whole fill arrives as one `onCellEdit` call and undoes in one step with `Ctrl + Z`. Cells that `validate` rejects or that are not `editable` are skipped. The same rules work outside the table through `fillSeries` from the package." },
      example: {
        Demo: FillHandle,
        block: true,
        code: `const columns = [
  { key: "lot", header: "Lot", editable: true },
  { key: "date", header: "Production date", type: "date", editable: true },
  { key: "qty", header: "Quantity", type: "number", align: "right", editable: true },
  { key: "site", header: "Plant", editable: true },
];

<DataTable
  cellSelection
  columns={columns}
  rows={rows}
  getRowKey={(r) => r.id}
  onCellEdit={(changes) => save(changes)}
/>`,
      },
      code: `import { fillSeries } from "btui";

fillSeries([120, 140], 3);
fillSeries(["2026-11-02"], 2);
fillSeries(["LOT-0099"], 2);
fillSeries(["İzmir", "Bursa"], 3);
fillSeries([10, 20], 2, true);`,
    },
    {
      id: "tree",
      title: { tr: "Ağaç veri", en: "Tree data" },
      body: { tr: "`getChildren` satırın alt satırlarını döndürür; `rows` yalnız en üst düzeyi tutar. `defaultExpanded` için `true` tüm ağacı, sayı o kadar düzeyi açar. Üst satırlarda `aggregate` verilen kolonlar yapraklardan hesaplanır, `totals` da yalnız yaprakları toplar. Üst satırın görünen değeri `format` üzerinden yazıldığı için tutar kolonlarına `format` verin. Filtre ve arama, eşleşen satırı atalarıyla ve tüm alt satırlarıyla birlikte tutar; filtre açıkken ağaç açık gelir ve üst satırlar yalnız görünen yaprakları toplar. Sıralama her düzeyde ayrı çalışır, alt satırlar üst satırının altında kalır. `cellSelection` açıkken ilk hücrede sağ ok açar, sol ok kapatır. Yukarıda gider merkezini arayın ya da başlıktan sıralayın.", en: "`getChildren` returns the children of a row and `rows` holds only the top level. With `defaultExpanded`, `true` opens the whole tree and a number opens that many levels. On parent rows, columns with `aggregate` roll up from the leaves, and `totals` adds up the leaves only. A parent's shown value is written through `format`, so give money columns a `format`. Filter and search keep a matching row with its ancestors and all its descendants; while a filter is on the tree opens and parents add up only the leaves in view. Sorting works per level, so children stay under their parent. With `cellSelection`, on the first cell the right arrow opens and the left arrow closes. Search for a cost centre above, or sort from a header." },
      example: {
        Demo: Tree,
        block: true,
        code: `<DataTable
  cellSelection
  searchable
  filterable
  totals
  columns={[
    { key: "name", header: "Cost centre", width: 280 },
    { key: "budget", header: "Budget", type: "number", align: "right", aggregate: "sum", format: amount },
    { key: "spent", header: "Spent", type: "number", align: "right", aggregate: "sum", format: amount },
  ]}
  rows={roots}
  getRowKey={(r) => r.id}
  getChildren={(r) => r.children}
  defaultExpanded={1}
/>`,
      },
    },
    {
      id: "tree-lazy",
      title: { tr: "Alt satırları sonradan yüklemek", en: "Loading children later" },
      body: { tr: "`hasChildren` satırın açılabileceğini söyler, `loadChildren` ilk açılışta alt satırları getirir. Yükleme sürerken okun yerinde gösterge döner, gelen satırlar saklanır ve ikinci açılışta istek gitmez. Üst satır, alt satırları gelene kadar kendi değerini gösterir; sonra toplamı yapraklardan hesaplanır. Burada 700 ms gecikmeli bir sunucu taklit ediliyor; bir depoyu açıp kapatın ve başlıktaki istek sayısını izleyin.", en: "`hasChildren` says a row can open, and `loadChildren` fetches its children on first open. A spinner replaces the arrow during the load, the rows are kept and a second open sends no request. A parent shows its own value until the children arrive, then rolls up from the leaves. This demo fakes a server with 700 ms latency; open and close a warehouse and watch the request count in the band." },
      example: {
        Demo: LazyTree,
        block: true,
        code: `<DataTable
  cellSelection
  columns={columns}
  rows={warehouses}
  getRowKey={(r) => r.id}
  hasChildren={(r) => r.lineCount > 0}
  loadChildren={async (row) => {
    const response = await fetch(\`/warehouses/\${row.id}/lines\`);
    return response.json();
  }}
/>`,
      },
    },
    {
      id: "charts",
      title: { tr: "Seçimden grafik", en: "Charts from a selection" },
      body: { tr: "`cellSelection` açıkken bir aralık seçin, sağ tıklayıp \"Grafik oluştur\" deyin. Seçilen sayısal kolonlar seri olur, seçimdeki ilk metin kolonu satırları adlandırır; seçimde metin kolonu yoksa soldaki en yakın metin kolonu kullanılır. Pencerede çubuk, yığılmış, çizgi ve alan arasında geçilir; tek kolonda yığılmış yerine halka gelir. Seçimde sayı yoksa komut kapalıdır. Grafik ek paket istemez ve tablo görünümü burada da vardır. Aşağıda bölgeleri ve üç çeyreği seçip deneyin.", en: "With `cellSelection` on, select a range, right-click and choose \"Create chart\". Selected numeric columns become series and the first text column in the selection names the rows; with none in the selection, the nearest text column to the left is used. The window switches between bar, stacked, line and area, and with a single column a donut replaces stacked. With no numbers in the selection the command is off. The chart needs no extra package and has its table view here too. Select the regions and the three quarters below to try it." },
      example: {
        Demo: SelectionCharts,
        block: true,
        code: `<DataTable
  cellSelection
  title="Revenue by region"
  columns={[
    { key: "region", header: "Region" },
    { key: "q1", header: "Q1", type: "number", align: "right" },
    { key: "q2", header: "Q2", type: "number", align: "right" },
    { key: "q3", header: "Q3", type: "number", align: "right" },
  ]}
  rows={rows}
  getRowKey={(r) => r.id}
/>`,
      },
    },
    {
      id: "comparison",
      title: { tr: "Paralı ızgaralarla karşılaştırma", en: "Compared to paid grids" },
      body: { tr: "AG Grid'de aralık seçimi, pano, doldurma tutamacı, Excel, gruplama, pivot, ağaç veri, bütünleşik grafikler, sunucu modeli ve bağlam menüsü Enterprise lisansı ister; MUI X'te de bunların çoğu Pro ya da Premium'dadır. btui hepsini MIT ile verir. Şunlar hâlâ yoktur: kolon sanallaştırma, formül, sunucu tarafı gruplama ve yapay zekâ asistanı. Bunlardan biri işin merkezindeyse paralı bir ızgara hâlâ doğru seçim olabilir.", en: "In AG Grid, range selection, clipboard, the fill handle, Excel, grouping, pivot, tree data, integrated charts, the server model and context menus need an Enterprise licence, and MUI X keeps most of them in Pro or Premium. btui ships them all under MIT. It still does not have column virtualisation, formulas, server-side grouping or an AI assistant. If one of those is central to the job, a paid grid may still be the right pick." },
    },
  ],
  a11y: [
    { tr: "`cellSelection` ya da düzenleme açıkken tablo W3C grid kalıbını izler: tek sekme durağı, `aria-activedescendant` ile etkin hücre.", en: "With `cellSelection` or editing the table follows the W3C grid pattern: one tab stop, with the active cell in `aria-activedescendant`." },
    { tr: "Sanal modda `aria-rowcount` tüm satır sayısını, `aria-rowindex` satırın gerçek yerini söyler; ekran okuyucu 100 binde 42. satırda olduğunu bilir.", en: "In virtual mode `aria-rowcount` holds the full count and `aria-rowindex` the real position, so a screen reader knows it is on row 42 of 100,000." },
    { tr: "Boyut ve sıra işlerinin klavye karşılığı vardır: boyut için ok tuşları, sıra için menü düğmeleri. Doldurmada `Ctrl + D` ve `Ctrl + R` kopyalar; artan seri yalnız tutamaçla kurulur, klavyede değerleri düzenleme ya da yapıştırma ile girin.", en: "Sizing and ordering have keyboard paths: arrow keys for width and menu buttons for order. For filling, `Ctrl + D` and `Ctrl + R` copy; a rising series is built with the handle alone, so on the keyboard enter the values by editing or paste." },
    { tr: "`cellSelection` ya da düzenleme açıkken ağaç tablo `treegrid` rolü alır; satırlar `aria-level` ve `aria-expanded` taşır.", en: "With `cellSelection` or editing a tree table takes the `treegrid` role, and rows carry `aria-level` and `aria-expanded`." },
    { tr: "Seçimden açılan grafik klavyeyle gezilir ve tablo görünümü taşır; bkz. `BarChart`.", en: "A chart opened from a selection works from the keyboard and has a table view; see `BarChart`." },
    { tr: "Sıralama `aria-sort` ile duyurulur, hatalı düzenleme `aria-invalid` taşır.", en: "Sorting is announced with `aria-sort` and a rejected edit carries `aria-invalid`." },
  ],
  keyboard: [
    ["Arrow keys", { tr: "Etkin hücreyi taşır", en: "Moves the active cell" }],
    ["Shift + Arrow keys", { tr: "Seçimi genişletir", en: "Extends the selection" }],
    ["Home", { tr: "Satırın başına gider", en: "Goes to the start of the row" }],
    ["End", { tr: "Satırın sonuna gider", en: "Goes to the end of the row" }],
    ["Ctrl + Home", { tr: "İlk hücreye gider", en: "Goes to the first cell" }],
    ["Ctrl + End", { tr: "Son hücreye gider", en: "Goes to the last cell" }],
    ["PageUp", { tr: "Bir ekran yukarı", en: "One screen up" }],
    ["PageDown", { tr: "Bir ekran aşağı", en: "One screen down" }],
    ["Ctrl + A", { tr: "Tümünü seçer", en: "Selects everything" }],
    ["Ctrl + C", { tr: "Seçimi kopyalar", en: "Copies the selection" }],
    ["Ctrl + V", { tr: "Düzenlenebilir hücrelere yapıştırır", en: "Pastes into editable cells" }],
    ["Enter", { tr: "Düzenlemeyi başlatır ve onaylar; grup satırını açar, kapatır", en: "Starts and confirms an edit; toggles a group row" }],
    ["F2", { tr: "Düzenlemeyi başlatır", en: "Starts an edit" }],
    ["Tab", { tr: "Düzenlerken sağa geçer", en: "Moves right while editing" }],
    ["Esc", { tr: "Düzenlemeden vazgeçer, seçimi daraltır", en: "Cancels an edit and collapses the selection" }],
    ["Delete", { tr: "Düzenlenebilir hücreleri temizler", en: "Clears editable cells" }],
    ["Ctrl + D", { tr: "Seçimin ilk satırını aşağıya kopyalar", en: "Copies the first row of the selection down" }],
    ["Ctrl + R", { tr: "Seçimin ilk sütununu sağa kopyalar", en: "Copies the first column of the selection right" }],
    ["← / →", { tr: "Ağaçta ilk hücredeyken satırı kapatır ya da açar", en: "In a tree, closes or opens the row from the first cell" }],
    ["Ctrl + Z", { tr: "Geri alır", en: "Undoes" }],
    ["Ctrl + Y", { tr: "Yineler", en: "Redoes" }],
  ],
  api: [
    {
      name: "DataTable",
      description: { tr: "Temel özellikler için DataTable sayfasına bakın. Buradakiler ızgara özellikleridir.", en: "See the DataTable page for the base props. These are the grid features." },
      props: [
        { name: "advanced", type: "boolean", description: { tr: "Arama, filtre, boyut, sıra, sabitleme, gruplama, hücre seçimi ve dışa aktarmayı birlikte açar. Biri `false` verilerek kapatılır", en: "Turns on search, filters, resizing, reordering, pinning, grouping, cell selection and export together. Set one to `false` to leave it out" } },
        { name: "searchable", type: "boolean", description: { tr: "Bantta arama kutusu", en: "Search box in the band" } },
        { name: "search / onSearchChange", type: "string / (search) => void", description: { tr: "Denetimli arama", en: "Controlled search" } },
        { name: "filterable", type: "boolean", description: { tr: "Kolon menüsünde filtre", en: "Filters in the column menu" } },
        { name: "filters / defaultFilters / onFiltersChange", type: "Filters", description: { tr: "Filtre durumu; kolon anahtarına göre", en: "Filter state, by column key" } },
        { name: "groupable", type: "boolean", description: { tr: "Kolon menüsünde gruplama", en: "Grouping in the column menu" } },
        { name: "groupBy / defaultGroupBy / onGroupByChange", type: "string[]", description: { tr: "Gruplanan kolonlar, sırayla", en: "Grouped columns, in order" } },
        { name: "totals", type: "boolean", description: { tr: "Altta `aggregate` toplam satırı", en: "Footer row with each `aggregate`" } },
        { name: "resizable", type: "boolean", description: { tr: "Kenardan boyutlandırma", en: "Resize from the edge" } },
        { name: "reorderable", type: "boolean", description: { tr: "Başlığı sürükleyerek sıralama", en: "Reorder by dragging headers" } },
        { name: "pinnable", type: "boolean", description: { tr: "Kolon sabitleme", en: "Column pinning" } },
        { name: "cellSelection", type: "boolean", description: { tr: "Aralık seçimi, klavye gezintisi, kopyalama ve seçimden grafik", en: "Range selection, keyboard navigation, copy and charts from a selection" } },
        { name: "onCellEdit", type: "(changes: CellChange<T>[]) => void", description: { tr: "Düzenleme, yapıştırma, doldurma, silme, geri alma ve yineleme sonuçları", en: "Results of edits, paste, fill, delete, undo and redo" } },
        { name: "exportable", type: "boolean", description: { tr: "Excel ve CSV menüsü", en: "Excel and CSV menu" } },
        { name: "exportFileName", type: "string", default: '"export"', description: { tr: "Uzantısız dosya adı", en: "File name without extension" } },
        { name: "contextMenu", type: "({ row, column }) => ContextMenuItem[]", description: { tr: "Sağ tık menüsüne ek eylemler", en: "Extra right-click actions" } },
        { name: "getChildren", type: "(row: T) => T[] | undefined", description: { tr: "Ağaç veri: satırın alt satırlarını döndürür. `rows` yalnız en üst düzeyi tutar", en: "Tree data: returns a row's children. `rows` then holds only the top level" } },
        { name: "hasChildren", type: "(row: T) => boolean", description: { tr: "Alt satırları yüklenmeden satırın açılabileceğini söyler. `loadChildren` ile kullanın", en: "Says a row can open before its children are loaded. Use with `loadChildren`" } },
        { name: "loadChildren", type: "(row: T) => Promise<T[]>", description: { tr: "İlk açılışta alt satırları getirir", en: "Fetches children on first open" } },
        { name: "defaultExpanded", type: "boolean | number", default: "false", description: { tr: "`true` tüm ağacı, sayı o kadar düzeyi açar", en: "`true` opens the whole tree, a number opens that many levels" } },
        { name: "virtual", type: "boolean", description: { tr: "Yalnız görünen satırları çizer", en: "Draws only the rows in view" } },
        { name: "rowHeight", type: "number", default: "41 / 29", description: { tr: "Sanal modda satır yüksekliği", en: "Row height in virtual mode" } },
        { name: "detailHeight", type: "number", default: "180", description: { tr: "Sanal modda açık ayrıntı satırı", en: "Open detail row in virtual mode" } },
        { name: "dataSource", type: "DataSource<T>", description: { tr: "Sunucu veri modeli; `virtual` açar", en: "Server row model; turns on `virtual`" } },
        { name: "pageSizeOptions", type: "number[]", description: { tr: "Altta sayfa boyutu seçimi", en: "Page size choices in the footer" } },
        { name: "initialState", type: "Partial<TableState>", description: { tr: "Başlangıç düzeni", en: "Layout to start from" } },
        { name: "onStateChange", type: "(state: TableState) => void", description: { tr: "Her düzen değişikliğini bildirir", en: "Reports each layout change" } },
        { name: "bandTone", type: '"plain" | "accent"', default: '"plain"', description: { tr: "Bant rengi", en: "Band colour" } },
      ],
    },
    {
      name: "Column",
      description: { tr: "DataTable'daki kolon alanlarına ek olarak:", en: "On top of the column fields on the DataTable page:" },
      props: [
        { name: "value", type: "(row: T) => unknown", description: { tr: "Ham değer. Sıralama, filtre, toplam ve dışa aktarma bunu okur", en: "The raw value, read by sorting, filters, totals and exports" } },
        { name: "type", type: '"text" | "number" | "date" | "boolean"', description: { tr: "Filtre panelini, Excel biçimini ve yapıştırmayı belirler", en: "Sets the filter panel, Excel format and paste parsing" } },
        { name: "format", type: "(value, row) => string", description: { tr: "Kopyalama ve dışa aktarma metni", en: "Text for copying and exports" } },
        { name: "filter", type: '"text" | "number" | "date" | "set" | false', description: { tr: "Filtre türü", en: "Filter kind" } },
        { name: "filterOptions", type: "string[]", description: { tr: "Sunucu modunda `set` filtre değerleri", en: "`set` filter values in server mode" } },
        { name: "aggregate", type: '"sum" | "avg" | "min" | "max" | "count" | ((values) => unknown)', description: { tr: "Grup, toplam ve ağaçta üst satır özeti", en: "Summary on group, total and tree parent rows" } },
        { name: "pin", type: '"left" | "right"', description: { tr: "Başlangıçta sabit", en: "Starts pinned" } },
        { name: "minWidth", type: "number", default: "60", description: { tr: "Boyutlandırma alt sınırı", en: "Lowest width when resizing" } },
        { name: "groupable", type: "boolean", default: "true", description: { tr: "`false` gruplamadan çıkarır", en: "`false` keeps it out of grouping" } },
        { name: "editable", type: "boolean | ((row: T) => boolean)", description: { tr: "Yerinde düzenlemeyi açar", en: "Turns on inline editing" } },
        { name: "options", type: "{ value, label }[]", description: { tr: "Açılır liste düzenleyici", en: "Dropdown editor" } },
        { name: "validate", type: "(value, row) => string | undefined", description: { tr: "Metin dönerse değer reddedilir", en: "Returning text rejects the value" } },
      ],
    },
    {
      name: "fillSeries",
      description: { tr: "Doldurma tutamacının kullandığı işlev: `fillSeries(source, count, backwards)`. Yeni değerleri kaynağa en yakın olandan başlayarak döndürür.", en: "The function the fill handle uses: `fillSeries(source, count, backwards)`. It returns the new values, starting with the one nearest the source." },
      props: [
        { name: "source", type: "unknown[]", required: true, description: { tr: "Örnek değerler", en: "The sample values" } },
        { name: "count", type: "number", required: true, description: { tr: "Üretilecek değer sayısı", en: "How many values to produce" } },
        { name: "backwards", type: "boolean", default: "false", description: { tr: "Seriyi kaynaktan geriye doğru sürdürür", en: "Runs the series backwards from the source" } },
      ],
    },
    {
      name: "DataSource",
      props: [
        { name: "getRows", type: "(request) => Promise<{ rows, total }>", required: true, description: { tr: "İstekte `start`, `end`, `sorts`, `filters`, `search` ve `signal` gelir", en: "The request holds `start`, `end`, `sorts`, `filters`, `search` and `signal`" } },
        { name: "blockSize", type: "number", default: "100", description: { tr: "Tek istekte satır sayısı", en: "Rows per request" } },
      ],
    },
  ],
  styling: [
    { name: "data-range", kind: "data", description: { tr: "Seçili aralıktaki hücre", en: "A cell inside the selected range" } },
    { name: "data-active-cell", kind: "data", description: { tr: "Etkin hücre", en: "The active cell" } },
    { name: "data-pin", kind: "data", description: { tr: "Sabit hücre: `left` ya da `right`", en: "A pinned cell: `left` or `right`" } },
    { name: "data-group", kind: "data", description: { tr: "Grup satırı", en: "A group row" } },
    { name: "data-editable", kind: "data", description: { tr: "Düzenlenebilir hücre", en: "An editable cell" } },
    { name: "data-fill", kind: "data", description: { tr: "Doldurma sırasında yazılacak hücre", en: "A cell about to be written during a fill" } },
    { name: "data-tree-parent", kind: "data", description: { tr: "Alt satırları olan ağaç satırı", en: "A tree row with children" } },
    { name: "--bt-row-h", kind: "var", description: { tr: "Sanal modda satır yüksekliği", en: "Row height in virtual mode" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Seçim zemini", en: "Selection background" } },
  ],
  related: ["data-table", "pagination", "filter-bar", "date-range-picker", "bar-chart", "patterns"],
});
