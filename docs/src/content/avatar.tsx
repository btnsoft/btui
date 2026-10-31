import { Avatar, DataTable, type Column } from "btui";
import { money, ORDERS, type Order } from "../lib/data";
import { useLang, useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const PHOTO = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><rect width="60" height="60" fill="#41628f"/><circle cx="30" cy="23" r="11" fill="#e8eef6"/><path d="M8 60c2-16 12-23 22-23s20 7 22 23z" fill="#e8eef6"/></svg>')}`;
const BROKEN = "data:image/png;base64,AA==";

function Team() {
  return (
    <>
      <Avatar name="Ada Yılmaz" />
      <Avatar name="Can Demir" />
      <Avatar name="Elif Kaya" />
      <Avatar name="Mert Aydın" />
    </>
  );
}

function Sizes() {
  return (
    <>
      <Avatar name="Şafak Enerji" size={22} />
      <Avatar name="Şafak Enerji" />
      <Avatar name="Şafak Enerji" size={40} />
      <Avatar name="Şafak Enerji" size={56} />
    </>
  );
}

function Images() {
  return (
    <>
      <Avatar name="Ada Yılmaz" src={PHOTO} />
      <Avatar name="Can Demir" src={PHOTO} size={40} />
    </>
  );
}

function Fallback() {
  return (
    <>
      <Avatar name="Elif Kaya" src={BROKEN} size={40} />
      <Avatar name="Çınar Gıda" src={BROKEN} size={40} />
    </>
  );
}

function Initials() {
  return (
    <>
      <Avatar name="Işık Medikal" />
      <Avatar name="Ege Tekstil Sanayi Anonim Şirketi" />
      <Avatar name="Atlas" />
    </>
  );
}

function InTable() {
  const t = useText();
  const lang = useLang();
  const columns: Column<Order>[] = [
    { key: "no", header: t({ tr: "Sipariş", en: "Order" }), cell: (o) => <span className="bt-mono">{o.no}</span> },
    {
      key: "owner",
      header: t({ tr: "Sorumlu", en: "Owner" }),
      cell: (o) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Avatar name={o.owner} size={24} />
          {o.owner}
        </span>
      ),
    },
    { key: "amount", header: t({ tr: "Tutar", en: "Amount" }), align: "right", cell: (o) => money(o.amount, lang) },
  ];
  return <DataTable columns={columns} rows={ORDERS.slice(0, 4)} getRowKey={(o) => o.id} />;
}

export default definePage({
  summary: { tr: "Kişiyi ya da firmayı görseliyle, görsel yoksa baş harfleriyle temsil eder. Görsel yüklenemezse baş harflere kendiliğinden döner.", en: "Represents a person or company with an image, or with initials when there is none. If the image fails to load it falls back to the initials on its own." },
  imports: 'import { Avatar } from "btui";',
  base: "avatar",
  hero: {
    Demo: Team,
    code: `<Avatar name="Ada Yılmaz" />
<Avatar name="Can Demir" />
<Avatar name="Elif Kaya" />
<Avatar name="Mert Aydın" />`,
  },
  use: {
    do: [
      { tr: "Sipariş sorumlusu, onaylayan, atanan kişi", en: "Order owners, approvers and assignees" },
      { tr: "Müşteri listelerinde firmayı hızlı ayırt etmek", en: "Telling companies apart in customer lists" },
    ],
    dont: [
      { tr: "Kişinin adının yerine geçmek; yanına adı da yazın", en: "Standing in for a name; write the name beside it" },
      { tr: "Süs olarak; temsil edilen bir kişi ya da kurum yoksa kullanmayın", en: "Decoration; leave it out when no person or organisation is represented" },
      { tr: "Uzun firma adının sığmasını beklemek; yalnız ilk iki kelimenin baş harfi görünür", en: "Expecting a long company name to fit; only the initials of the first two words show" },
    ],
  },
  anatomy: `<Avatar name="Ada Yılmaz" src="/people/ada.jpg" size={30} />`,
  examples: [
    {
      id: "sizes",
      title: { tr: "Boyutlar", en: "Sizes" },
      body: { tr: "`size` piksel cinsindendir ve yazı boyutu bununla orantılı büyür. Varsayılan 30px; tablo satırında 22-24px, profil başlığında 40-56px iyi durur.", en: "`size` is in pixels and the text scales with it. The default is 30px; 22-24px suits table rows and 40-56px suits profile headers." },
      example: {
        Demo: Sizes,
        code: `<Avatar name="Şafak Enerji" size={22} />
<Avatar name="Şafak Enerji" />
<Avatar name="Şafak Enerji" size={40} />
<Avatar name="Şafak Enerji" size={56} />`,
      },
    },
    {
      id: "image",
      title: { tr: "Görsel", en: "Image" },
      body: { tr: "`src` verilince görsel alanı doldurur. `name` görselin alternatif metni olur, bu yüzden her zaman gerçek adı yazın.", en: "With `src`, the image fills the area. `name` becomes its alternative text, so always pass the real name." },
      example: {
        Demo: Images,
        code: `<Avatar name="Ada Yılmaz" src="/people/ada.jpg" />
<Avatar name="Can Demir" src="/people/can.jpg" size={40} />`,
      },
    },
    {
      id: "fallback",
      title: { tr: "Yüklenemeyen görsel", en: "Failed image" },
      body: { tr: "Bağlantı kopuksa ya da dosya silinmişse kırık görsel yerine baş harfler görünür. Bu örnekteki adresler bilerek bozuktur.", en: "When the link is dead or the file is gone, initials show instead of a broken image. The addresses in this example are broken on purpose." },
      example: {
        Demo: Fallback,
        code: `<Avatar name="Elif Kaya" src="/people/missing.jpg" size={40} />
<Avatar name="Çınar Gıda" src="/people/missing.jpg" size={40} />`,
      },
    },
    {
      id: "initials",
      title: { tr: "Baş harfler", en: "Initials" },
      body: { tr: "Baş harfler adın ilk iki kelimesinden alınır, tek kelimede tek harf görünür. Ç, Ş ve İ gibi harfler korunur. Küçük `i` tarayıcının diline göre büyütüldüğü için adları doğru yazımıyla verin.", en: "Initials come from the first two words of the name; a single word gives one letter. Letters such as Ç, Ş and İ are preserved. A lowercase `i` is uppercased by the browser language, so pass names with their proper spelling." },
      example: {
        Demo: Initials,
        code: `<Avatar name="Işık Medikal" />
<Avatar name="Ege Tekstil Sanayi Anonim Şirketi" />
<Avatar name="Atlas" />`,
      },
    },
    {
      id: "in-table",
      title: { tr: "Tabloda", en: "In a table" },
      body: { tr: "Adla birlikte kullanın. Satır yüksekliğini bozmaması için 24px yeterlidir.", en: "Use it together with the name. 24px is enough to keep the row height intact." },
      example: {
        Demo: InTable,
        block: true,
        code: `{
  key: "owner",
  header: "Owner",
  cell: (o) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Avatar name={o.owner} size={24} />
      {o.owner}
    </span>
  ),
}`,
      },
    },
  ],
  a11y: [
    { tr: "Görsel varsa `name` değeri `alt` metni olarak kullanılır.", en: "With an image, `name` is used as the `alt` text." },
    { tr: "Görsel yokken ekran okuyucu yalnız baş harfleri duyar. Adı yanında metin olarak yazın.", en: "Without an image, screen readers hear only the initials. Write the name beside it as text." },
    { tr: "Bileşen `title` ya da `aria-label` almaz. Yalnız baş harf göstermeniz gerekiyorsa `<span title=\"Ada Yılmaz\">` ile sarın.", en: "The component takes no `title` or `aria-label`. If you must show initials alone, wrap it in `<span title=\"Ada Yılmaz\">`." },
  ],
  api: [
    {
      name: "Avatar",
      description: { tr: "Yalnız aşağıdaki prop'ları alır; yerel öznitelikler ve ref iletilmez.", en: "Takes only the props below; native attributes and the ref are not forwarded." },
      props: [
        { name: "name", type: "string", required: true, description: { tr: "Baş harfler ve `alt` metni için ad", en: "Name used for the initials and `alt` text" } },
        { name: "src", type: "string", description: { tr: "Görsel adresi", en: "Image address" } },
        { name: "size", type: "number", default: "30", description: { tr: "Genişlik ve yükseklik, piksel. Yazı boyutu orantılı değişir", en: "Width and height in pixels. Text scales with it" } },
        { name: "className", type: "string", description: { tr: "`.bt-avatar` öğesine eklenir. Diğer özellikler ve `ref` kök öğeye aktarılır", en: "Added to `.bt-avatar`. Other props and the `ref` reach the root" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-accent", kind: "var", description: { tr: "Baş harflerin zemini", en: "Background behind the initials" } },
  ],
  related: ["data-table", "info-row", "tooltip", "topbar"],
});
