import { useState } from "react";
import { IconChevronDown, IconDownload, IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

function Variants() {
  const t = useText();
  return (
    <>
      <Button variant="primary" icon={<IconPlus size={15} />}>{t({ tr: "Yeni sipariş", en: "New order" })}</Button>
      <Button>{t({ tr: "Vazgeç", en: "Cancel" })}</Button>
      <Button variant="soft">{t({ tr: "Taslak", en: "Save draft" })}</Button>
      <Button variant="dark">{t({ tr: "Yayınla", en: "Publish" })}</Button>
      <Button variant="success">{t({ tr: "Onayla", en: "Approve" })}</Button>
      <Button variant="danger">{t({ tr: "Sil", en: "Delete" })}</Button>
      <Button variant="ghost">{t({ tr: "Atla", en: "Skip" })}</Button>
    </>
  );
}

function Sizes() {
  const t = useText();
  return (
    <>
      <Button size="xs">{t({ tr: "Çok küçük", en: "Extra small" })}</Button>
      <Button size="sm">{t({ tr: "Küçük", en: "Small" })}</Button>
      <Button>{t({ tr: "Orta", en: "Medium" })}</Button>
      <Button size="lg">{t({ tr: "Büyük", en: "Large" })}</Button>
    </>
  );
}

function Icons() {
  const t = useText();
  return (
    <>
      <Button icon={<IconDownload size={15} />}>{t({ tr: "Dışa aktar", en: "Export" })}</Button>
      <Button iconEnd={<IconChevronDown size={15} />}>{t({ tr: "İşlemler", en: "Actions" })}</Button>
    </>
  );
}

function Loading() {
  const t = useText();
  const [busy, setBusy] = useState(false);
  const save = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 1800);
  };
  return <Button variant="primary" loading={busy} onClick={save}>{t({ tr: "Kaydet", en: "Save" })}</Button>;
}

function Disabled() {
  const t = useText();
  return (
    <>
      <Button disabled>{t({ tr: "Kapalı", en: "Disabled" })}</Button>
      <Button variant="primary" disabled>{t({ tr: "Gönder", en: "Submit" })}</Button>
    </>
  );
}

function Link() {
  const t = useText();
  return <Button render={<a href="#/en/data-table" />} nativeButton={false}>{t({ tr: "Listeye git", en: "Open the list" })}</Button>;
}

function Destructive() {
  const t = useText();
  return <Button variant="danger" icon={<IconTrash size={15} />}>{t({ tr: "12 kaydı sil", en: "Delete 12 records" })}</Button>;
}

export default definePage({
  summary: { tr: "Bir eylemi başlatır. Sayfanın ana işi tek bir `primary` düğmede toplanır, geri kalanı geri planda durur.", en: "Starts an action. A screen keeps its main task on a single `primary` button while the rest stay quiet." },
  imports: 'import { Button } from "btui";',
  base: "button",
  hero: {
    Demo: Variants,
    code: `<Button variant="primary" icon={<IconPlus size={15} />}>New order</Button>
<Button>Cancel</Button>
<Button variant="soft">Save draft</Button>
<Button variant="dark">Publish</Button>
<Button variant="success">Approve</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Skip</Button>`,
  },
  use: {
    do: [
      { tr: "Veriyi değiştiren ya da bir süreci başlatan eylemler", en: "Actions that change data or start a process" },
      { tr: "Form gönderme; `type=\"submit\"` yazmayı unutmayın", en: "Submitting a form; remember to set `type=\"submit\"`" },
      { tr: "Sonucu bekletilen işlemler; `loading` ile geri bildirim verin", en: "Slow operations; give feedback with `loading`" },
    ],
    dont: [
      { tr: "Başka bir sayfaya gitmek; düz bağlantı daha doğru bir anlam taşır", en: "Moving to another page; a plain link carries the right meaning" },
      { tr: "Bir ekranda birden çok `primary`; göz neye basacağını bulamaz", en: "Several `primary` buttons on one screen; the eye loses the main action" },
      { tr: "Yalnız ikonlu eylem; bunun için `IconButton` kullanın", en: "Icon-only actions; use `IconButton` for those" },
    ],
  },
  anatomy: `<Button variant="primary" size="md" icon={<Icon />} iconEnd={<Icon />}>
  Label
</Button>`,
  examples: [
    {
      id: "sizes",
      title: { tr: "Boyutlar", en: "Sizes" },
      body: { tr: "Formlarda `md`, tablo satırlarında `xs` ya da `sm`, tek eylemli boş ekranlarda `lg` kullanın.", en: "Use `md` in forms, `xs` or `sm` inside table rows and `lg` on empty screens with a single action." },
      example: { Demo: Sizes, code: `<Button size="xs">Extra small</Button>\n<Button size="sm">Small</Button>\n<Button>Medium</Button>\n<Button size="lg">Large</Button>` },
    },
    {
      id: "icons",
      title: { tr: "İkonlar", en: "Icons" },
      body: { tr: "`icon` eylemi anlatır, `iconEnd` genelde bir açılır menü olduğunu gösterir. btui ikon taşımaz, istediğiniz seti verirsiniz.", en: "`icon` describes the action, `iconEnd` usually signals a menu. btui ships no icon set, so pass any you like." },
      example: { Demo: Icons, code: `<Button icon={<IconDownload size={15} />}>Export</Button>\n<Button iconEnd={<IconChevronDown size={15} />}>Actions</Button>` },
    },
    {
      id: "loading",
      title: { tr: "Yükleniyor", en: "Loading" },
      body: { tr: "`loading` genişliği korur, ikinci tıklamayı engeller ve odağı düğmede tutar. Çift kayıt hatalarının çoğu burada önlenir. Düğmeye basıp deneyin.", en: "`loading` keeps the width, blocks a second click and leaves focus on the button. Most duplicate submissions stop here. Press it to try." },
      example: { Demo: Loading, code: `const [busy, setBusy] = useState(false);\n\n<Button variant="primary" loading={busy} onClick={save}>Save</Button>` },
    },
    {
      id: "disabled",
      title: { tr: "Kapalı", en: "Disabled" },
      body: { tr: "Eylem şu an yapılamıyorsa kapatın ve nedenini yakınında anlatın. Neden görünmüyorsa kullanıcı takılır.", en: "Disable an action only when it cannot run, and explain why nearby. Without a reason people get stuck." },
      example: { Demo: Disabled, code: `<Button disabled>Disabled</Button>\n<Button variant="primary" disabled>Submit</Button>` },
    },
    {
      id: "destructive",
      title: { tr: "Yıkıcı eylem", en: "Destructive action" },
      body: { tr: "Etiket sonucu söylesin: \"Sil\" yerine \"12 kaydı sil\". Geri alınamayan işlemleri `useConfirm` ile doğrulatın.", en: "Say what happens: \"Delete 12 records\" beats \"Delete\". Confirm irreversible work with `useConfirm`." },
      example: { Demo: Destructive, code: `<Button variant="danger" icon={<IconTrash size={15} />}>Delete 12 records</Button>` },
    },
    {
      id: "as-link",
      title: { tr: "Bağlantı olarak", en: "As a link" },
      body: { tr: "Görünümü düğme, anlamı bağlantı olsun istiyorsanız `render` verin. Yerel düğme olmadığı için `nativeButton={false}` gerekir.", en: "To look like a button but act as a link, pass `render`. It is no longer a native button, so set `nativeButton={false}`." },
      example: { Demo: Link, code: `<Button render={<a href="/orders" />} nativeButton={false}>Open the list</Button>` },
    },
  ],
  a11y: [
    { tr: "Gerçek bir `<button>` çizer; odak, klavye ve ekran okuyucu davranışı hazır gelir.", en: "Renders a real `<button>`, so focus, keyboard and screen reader behaviour work out of the box." },
    { tr: "`loading` sırasında `aria-busy` eklenir ve düğme odakta kalır; odak sayfanın başına düşmez.", en: "`loading` adds `aria-busy` and keeps the button focusable, so focus never jumps to the top of the page." },
    { tr: "Renk tek başına anlam taşımaz; yıkıcı eylemin etiketi de bunu söylemelidir.", en: "Colour alone carries no meaning, so the label of a destructive action must say it too." },
  ],
  keyboard: [
    ["Tab", { tr: "Düğmeye odaklanır", en: "Moves focus to the button" }],
    ["Enter", { tr: "Eylemi çalıştırır", en: "Runs the action" }],
    ["Space", { tr: "Eylemi çalıştırır", en: "Runs the action" }],
  ],
  api: [
    {
      name: "Button",
      description: { tr: "Tüm yerel `button` öznitelikleri ve ref iletilir.", en: "All native `button` attributes and the ref are forwarded." },
      props: [
        { name: "variant", type: '"default" | "primary" | "soft" | "dark" | "danger" | "success" | "ghost"', default: '"default"', description: { tr: "Görsel önem düzeyi", en: "Visual weight" } },
        { name: "size", type: '"xs" | "sm" | "md" | "lg"', default: '"md"', description: { tr: "Yükseklik: 24, 28, 32, 38px", en: "Height: 24, 28, 32, 38px" } },
        { name: "icon", type: "ReactNode", description: { tr: "Etiketten önce gösterilir", en: "Shown before the label" } },
        { name: "iconEnd", type: "ReactNode", description: { tr: "Etiketten sonra gösterilir", en: "Shown after the label" } },
        { name: "loading", type: "boolean", default: "false", description: { tr: "Dönen gösterge çizer, tıklamayı engeller, odağı korur", en: "Shows a spinner, blocks clicks, keeps focus" } },
        { name: "fullWidth", type: "boolean", default: "false", description: { tr: "Kabın genişliğini doldurur", en: "Fills its container" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Eylemi kapatır", en: "Turns the action off" } },
        { name: "render", type: "ReactElement", description: { tr: "Başka bir öğe olarak çizer", en: "Renders as another element" } },
        { name: "nativeButton", type: "boolean", default: "true", description: { tr: "`render` yerel düğme değilse `false` verin", en: "Set to `false` when `render` is not a native button" } },
      ],
    },
  ],
  styling: [
    { name: "data-variant", kind: "data", description: { tr: "Seçili görünüm", en: "The current variant" } },
    { name: "data-size", kind: "data", description: { tr: "Seçili boyut", en: "The current size" } },
    { name: "data-loading", kind: "data", description: { tr: "Yükleme sürerken bulunur", en: "Present while loading" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "`primary` zemini", en: "`primary` background" } },
    { name: "--bt-radius", kind: "var", description: { tr: "Köşe yarıçapı", en: "Corner radius" } },
  ],
  related: ["icon-button", "button-group", "menu", "confirm"],
});
