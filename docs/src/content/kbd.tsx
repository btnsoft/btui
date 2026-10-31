import { IconSearch } from "@tabler/icons-react";
import { Button, Card, InfoRow, Kbd, Tooltip } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Single() {
  return (
    <>
      <Kbd>Esc</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>⌘K</Kbd>
    </>
  );
}

function Combos() {
  return (
    <>
      <span><Kbd>Ctrl</Kbd> + <Kbd>S</Kbd></span>
      <span><Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd></span>
      <span><Kbd>⌘</Kbd> + <Kbd>Enter</Kbd></span>
    </>
  );
}

function Sentence() {
  const t = useText();
  return (
    <p style={{ margin: 0, maxWidth: 460 }}>
      {t({ tr: "Formu kaydetmek için ", en: "To save the form, press " })}<Kbd>Ctrl</Kbd> + <Kbd>S</Kbd>{t({ tr: " tuşlarına, vazgeçmek için ", en: " or press " })}<Kbd>Esc</Kbd>{t({ tr: " tuşuna basın.", en: " to cancel." })}
    </p>
  );
}

function Hint() {
  const t = useText();
  return (
    <Tooltip content={<>{t({ tr: "Sipariş ara", en: "Search orders" })} <Kbd>⌘K</Kbd></>}>
      <Button icon={<IconSearch size={15} />}>{t({ tr: "Ara", en: "Search" })}</Button>
    </Tooltip>
  );
}

function Shortcuts() {
  const t = useText();
  return (
    <div style={{ maxWidth: 420, margin: "0 auto" }}>
      <Card title={t({ tr: "Kısayollar", en: "Shortcuts" })}>
        <InfoRow label={t({ tr: "Yeni sipariş", en: "New order" })}><Kbd>N</Kbd></InfoRow>
        <InfoRow label={t({ tr: "Ara", en: "Search" })}><Kbd>⌘K</Kbd></InfoRow>
        <InfoRow label={t({ tr: "Kaydet", en: "Save" })}><Kbd>Ctrl</Kbd> + <Kbd>S</Kbd></InfoRow>
        <InfoRow label={t({ tr: "Çekmeceyi kapat", en: "Close the drawer" })}><Kbd>Esc</Kbd></InfoRow>
      </Card>
    </div>
  );
}

export default definePage({
  summary: { tr: "Klavye tuşlarını ve kısayolları metin içinde gösterir. Kısayol davranışı eklemez, yalnız tuşu görünür kılar.", en: "Shows keys and shortcuts within text. It adds no shortcut behaviour; it only makes the key visible." },
  imports: 'import { Kbd } from "btui";',
  hero: {
    Demo: Single,
    code: `<Kbd>Esc</Kbd>
<Kbd>Enter</Kbd>
<Kbd>Tab</Kbd>
<Kbd>⌘K</Kbd>`,
  },
  use: {
    do: [
      { tr: "Yardım metinlerinde ve kısayol listelerinde tuş adı", en: "Key names in help text and shortcut lists" },
      { tr: "Arama kutusunda ya da ipucunda kısayolu hatırlatmak", en: "Reminding people of a shortcut in a search box or a tooltip" },
    ],
    dont: [
      { tr: "Kod ya da değişken adı; bunun için `code` öğesi kullanın", en: "Code or variable names; use a `code` element" },
      { tr: "Tıklanacak düğmeler; `Kbd` etkileşimli değildir", en: "Buttons to press; `Kbd` is not interactive" },
      { tr: "Çalışmayan kısayolları göstermek; önce kısayolu gerçekten bağlayın", en: "Showing shortcuts that do nothing; wire the shortcut up first" },
    ],
  },
  examples: [
    {
      id: "combinations",
      title: { tr: "Tuş birleşimi", en: "Key combinations" },
      body: { tr: "Her tuşu ayrı bir `Kbd` içine yazın, aralarına `+` koyun. Bileşen birleşim oluşturmaz, düzeni siz kurarsınız. macOS ve Windows kullanıcılarına uygun tuşu ayrı ayrı gösterin.", en: "Put each key in its own `Kbd` with a `+` between them. The component builds no combinations, so the layout is yours. Show the right key for macOS and Windows users." },
      example: {
        Demo: Combos,
        code: `<Kbd>Ctrl</Kbd> + <Kbd>S</Kbd>
<Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd>
<Kbd>⌘</Kbd> + <Kbd>Enter</Kbd>`,
      },
    },
    {
      id: "in-text",
      title: { tr: "Metin içinde", en: "In a sentence" },
      body: { tr: "Satır içi öğe olduğu için cümlenin akışını bozmaz. Yardım metinlerinde tuş adını tırnak içinde yazmak yerine bunu kullanın.", en: "It is an inline element, so it does not break the flow of a sentence. Use it in help text rather than writing the key name in quotes." },
      example: {
        Demo: Sentence,
        code: `<p>To save the form, press <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> or press <Kbd>Esc</Kbd> to cancel.</p>`,
      },
    },
    {
      id: "tooltip",
      title: { tr: "İpucu içinde", en: "In a tooltip" },
      body: { tr: "Sık kullanılan eylemlerin kısayolunu `Tooltip` içinde gösterin. Düğmenin üzerine gelince kullanıcı kısayolu da öğrenir.", en: "Show the shortcut of frequent actions in a `Tooltip`. Hovering over the button teaches the shortcut too." },
      example: {
        Demo: Hint,
        code: `<Tooltip content={<>Search orders <Kbd>⌘K</Kbd></>}>
  <Button icon={<IconSearch size={15} />}>Search</Button>
</Tooltip>`,
      },
    },
    {
      id: "shortcut-list",
      title: { tr: "Kısayol listesi", en: "Shortcut list" },
      body: { tr: "`InfoRow` ile yardım penceresinde düzenli bir liste kurabilirsiniz. Değerler sağa yaslı olduğu için tuşlar sütun gibi hizalanır.", en: "With `InfoRow` you can build a tidy list for a help dialog. Values are right aligned, so the keys line up in a column." },
      example: {
        Demo: Shortcuts,
        block: true,
        code: `<Card title="Shortcuts">
  <InfoRow label="New order"><Kbd>N</Kbd></InfoRow>
  <InfoRow label="Search"><Kbd>⌘K</Kbd></InfoRow>
  <InfoRow label="Save"><Kbd>Ctrl</Kbd> + <Kbd>S</Kbd></InfoRow>
  <InfoRow label="Close the drawer"><Kbd>Esc</Kbd></InfoRow>
</Card>`,
      },
    },
  ],
  a11y: [
    { tr: "Anlamsal `<kbd>` öğesi çizer, ekran okuyucular içindeki metni okur.", en: "Renders a semantic `<kbd>` element, and screen readers read its text." },
    { tr: "`⌘` gibi semboller her zaman doğru okunmaz. Önemli yerlerde tuşun adını metin olarak da yazın.", en: "Symbols such as `⌘` are not always read correctly. Where it matters, write the key name as text too." },
    { tr: "Klavye kısayolu tek yol olmamalıdır; aynı eylem düğmeyle de yapılabilmelidir.", en: "A shortcut must not be the only way in; the same action should also work from a button." },
  ],
  api: [
    {
      name: "Kbd",
      description: { tr: "Tüm yerel `kbd` öznitelikleri iletilir.", en: "All native `kbd` attributes are forwarded." },
      props: [
        { name: "className", type: "string", description: { tr: "`.bt-kbd` öğesine eklenir", en: "Added to `.bt-kbd`" } },
        { name: "children", type: "ReactNode", description: { tr: "Tuş adı", en: "Key name" } },
      ],
    },
  ],
  styling: [
    { name: "--bt-mono", kind: "var", description: { tr: "Yazı tipi", en: "Font family" } },
    { name: "--bt-border", kind: "var", description: { tr: "Kenar rengi", en: "Border colour" } },
    { name: "--bt-surface", kind: "var", description: { tr: "Zemin", en: "Background" } },
    { name: "--bt-muted", kind: "var", description: { tr: "Metin rengi", en: "Text colour" } },
  ],
  related: ["tooltip", "search-input", "topbar", "button"],
});
