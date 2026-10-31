import { useState } from "react";
import { IconChecklist, IconFileInvoice, IconPlus, IconSearchOff } from "@tabler/icons-react";
import { Button, Card, DataTable, EmptyState, SearchInput, type Column } from "btui";
import { CUSTOMERS } from "../lib/data";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Default() {
  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <Card><EmptyState /></Card>
    </div>
  );
}

function FirstUse() {
  const t = useText();
  return (
    <div style={{ width: "100%", maxWidth: 460 }}>
      <Card title={t({ tr: "Faturalar", en: "Invoices" })}>
        <EmptyState
          icon={<IconFileInvoice size={20} />}
          title={t({ tr: "Henüz fatura kesilmedi", en: "No invoices yet" })}
          action={<Button variant="primary" icon={<IconPlus size={15} />}>{t({ tr: "Fatura oluştur", en: "Create invoice" })}</Button>}
        >
          {t({ tr: "İlk faturanız burada görünecek.", en: "Your first one will show up here." })}
        </EmptyState>
      </Card>
    </div>
  );
}

function Message() {
  const t = useText();
  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <Card title={t({ tr: "Onaylarım", en: "My approvals" })}>
        <EmptyState>{t({ tr: "Onayınızı bekleyen talep yok.", en: "No requests are waiting for your approval." })}</EmptyState>
      </Card>
    </div>
  );
}

function TitleOnly() {
  const t = useText();
  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <Card title={t({ tr: "Bekleyen işler", en: "Pending work" })}>
        <EmptyState icon={<IconChecklist size={20} />} title={t({ tr: "Her şey tamam", en: "All done" })} />
      </Card>
    </div>
  );
}

function SearchResult() {
  const t = useText();
  const [query, setQuery] = useState("Zümrüt");
  const rows = CUSTOMERS.filter((c) => c.toLocaleLowerCase("tr").includes(query.trim().toLocaleLowerCase("tr")));
  return (
    <div style={{ display: "grid", gap: 10, width: "100%", maxWidth: 420 }}>
      <SearchInput block value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t({ tr: "Müşteri ara", en: "Search customers" })} />
      <Card flush>
        {rows.length > 0 ? (
          <ul style={{ margin: 0, padding: "8px 16px", listStyle: "none" }}>{rows.map((c) => <li key={c} style={{ padding: "4px 0" }}>{c}</li>)}</ul>
        ) : (
          <div role="status">
            <EmptyState
              icon={<IconSearchOff size={20} />}
              title={t({ tr: "Sonuç yok", en: "No results" })}
              action={<Button size="sm" onClick={() => setQuery("")}>{t({ tr: "Aramayı temizle", en: "Clear search" })}</Button>}
            >
              {t({ tr: `"${query}" için müşteri bulunamadı.`, en: `No customers found for "${query}".` })}
            </EmptyState>
          </div>
        )}
      </Card>
    </div>
  );
}

function InTable() {
  const t = useText();
  const columns: Column<{ id: number; name: string }>[] = [
    { key: "name", header: t({ tr: "Müşteri", en: "Customer" }) },
    { key: "city", header: t({ tr: "Şehir", en: "City" }) },
  ];
  return <DataTable columns={columns} rows={[]} getRowKey={(c) => c.id} empty={t({ tr: "Bu şehirde kayıtlı müşteri yok.", en: "No customers on record in this city." })} />;
}

export default definePage({
  summary: { tr: "Gösterilecek veri olmadığında bunu söyler. İyi bir boş durum nedenini açıklar ve sıradaki adımı gösterir.", en: "Says so when there is no data to show. A good empty state explains why and points to the next step." },
  imports: 'import { EmptyState } from "btui";',
  hero: {
    Demo: FirstUse,
    code: `<Card title="Invoices">
  <EmptyState
    icon={<IconFileInvoice size={20} />}
    title="No invoices yet"
    action={<Button variant="primary" icon={<IconPlus size={15} />}>Create invoice</Button>}
  >
    Your first one will show up here.
  </EmptyState>
</Card>`,
  },
  use: {
    do: [
      { tr: "İlk kullanımda kullanıcıyı ilk kayda yönlendirmek", en: "Guiding people to the first record on first use" },
      { tr: "Arama ya da filtre sonuç vermediğinde çıkış yolu sunmak", en: "Offering a way out when a search or filter returns nothing" },
      { tr: "Yapılacak iş kalmadığını bildirmek", en: "Saying that nothing is left to do" },
    ],
    dont: [
      { tr: "Veri yüklenirken göstermek; önce `Loading` ya da `Skeleton` kullanın", en: "Showing it while data loads; use `Loading` or `Skeleton` first" },
      { tr: "Hata durumu; bağlantı sorunlarını `Alert` ile anlatın", en: "Error states; explain connection problems with `Alert`" },
      { tr: "`DataTable` içinde; tablonun `empty` prop'u aynı çerçeveyi zaten çizer", en: "Inside `DataTable`; its `empty` prop already draws the same frame" },
    ],
  },
  anatomy: `<EmptyState icon={<Icon />} title="Title" action={<Button />}>
  Message
</EmptyState>`,
  examples: [
    {
      id: "default",
      title: { tr: "Varsayılan metin", en: "Default text" },
      body: { tr: "`children` ve `title` verilmezse `BtuiProvider` dilindeki `empty` metni gösterilir. Hızlı bir başlangıçtır ama çoğu ekranda daha açıklayıcı bir cümle gerekir.", en: "Without `children` and `title`, the `empty` text from the `BtuiProvider` language shows. It is a quick start, but most screens deserve a more helpful sentence." },
      example: { Demo: Default, code: `<EmptyState />` },
    },
    {
      id: "message",
      title: { tr: "Özel mesaj", en: "Custom message" },
      body: { tr: "Boşluğun neden olduğunu söyleyin. \"Kayıt yok\" yerine \"Onayınızı bekleyen talep yok\" kullanıcıya işinin bittiğini anlatır.", en: "Say why it is empty. \"No requests are waiting for your approval\" tells people their work is done, where \"No records\" does not." },
      example: { Demo: Message, code: `<EmptyState>No requests are waiting for your approval.</EmptyState>` },
    },
    {
      id: "icon-title",
      title: { tr: "İkon ve başlık", en: "Icon and title" },
      body: { tr: "`icon` üstte kare bir zemin içinde durur, `title` kalın satır olur. Söylenecek başka şey yoksa `children` vermeyin; `title` tek başına yeter ve varsayılan metin görünmez.", en: "`icon` sits on a square background at the top and `title` is the bold line. With nothing else to say, leave out `children`; `title` is enough on its own and the default text stays away." },
      example: { Demo: TitleOnly, code: `<EmptyState icon={<IconChecklist size={20} />} title="All done" />` },
    },
    {
      id: "search",
      title: { tr: "Arama sonucu yok", en: "No search results" },
      body: { tr: "`action` sıradaki adımı gösterir: aramayı değiştirmek için tek tıkla çıkış verin. Sonuç değişimini duyurmak için bileşeni `role=\"status\"` taşıyan bir öğe içine alın; `EmptyState` kendisi duyuru yapmaz. Kutuyu temizleyip listeye dönmeyi deneyin.", en: "`action` shows the next step, so offer a one click way out of the search. Wrap the component in an element with `role=\"status\"` to announce the change; `EmptyState` announces nothing itself. Clear the box to get back to the list." },
      example: {
        Demo: SearchResult,
        code: `{rows.length === 0 ? (
  <div role="status">
    <EmptyState
      icon={<IconSearchOff size={20} />}
      title="No results"
      action={<Button size="sm" onClick={() => setQuery("")}>Clear search</Button>}
    >
      No customers found for "{query}".
    </EmptyState>
  </div>
) : <CustomerList rows={rows} />}`,
      },
    },
    {
      id: "in-table",
      title: { tr: "Tabloda", en: "In a table" },
      body: { tr: "`DataTable` boş durumu kendisi çizer. İçeriği `empty` ile değiştirin; buraya `EmptyState` koyarsanız iç boşluk iki kat olur.", en: "`DataTable` draws its own empty state. Change the content with `empty`; putting an `EmptyState` there doubles the padding." },
      example: {
        Demo: InTable,
        block: true,
        code: `<DataTable columns={columns} rows={[]} getRowKey={(c) => c.id} empty="No customers on record in this city." />`,
      },
    },
  ],
  a11y: [
    { tr: "Sade bir `<div>` çizer ve canlı bölge değildir. İçerik sonradan değişiyorsa `role=\"status\"` taşıyan bir kaba alın.", en: "Renders a plain `<div>` and is not a live region. If the content appears later, place it in a container with `role=\"status\"`." },
    { tr: "İkonlar süs amaçlıdır, anlamı metinde verin.", en: "Icons are decorative, so carry the meaning in the text." },
    { tr: "Eylem düğmesinin etiketi sonucu söylesin: \"Tamam\" yerine \"Fatura oluştur\".", en: "Let the button label say what happens: \"Create invoice\" rather than \"OK\"." },
  ],
  api: [
    {
      name: "EmptyState",
      description: { tr: "Yerel öznitelikler iletilmez; yalnız aşağıdaki prop'lar geçerlidir.", en: "Native attributes are not forwarded; only the props below apply." },
      props: [
        { name: "icon", type: "ReactNode", description: { tr: "Üstte kare zemin içinde gösterilir", en: "Shown on a square background at the top" } },
        { name: "title", type: "ReactNode", description: { tr: "İletinin üstündeki kalın satır", en: "Bold line above the message" } },
        { name: "children", type: "ReactNode", default: "locale.empty", description: { tr: "İleti; `title` varsa varsayılan metin gösterilmez", en: "The message; with `title`, the default text does not show" } },
        { name: "action", type: "ReactNode", description: { tr: "Sıradaki adım, genelde bir `Button`", en: "The next step, usually a `Button`" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-muted", kind: "var", description: { tr: "Metin rengi", en: "Text colour" } },
    { name: "--bt-text", kind: "var", description: { tr: "Başlık rengi", en: "Title colour" } },
    { name: "--bt-neutral-soft", kind: "var", description: { tr: "İkon zemini", en: "Icon background" } },
  ],
  related: ["data-table", "card", "alert", "skeleton"],
});
