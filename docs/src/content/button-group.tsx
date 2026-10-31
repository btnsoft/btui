import { useState } from "react";
import { IconCheck, IconChevronDown, IconChevronLeft, IconChevronRight, IconDownload, IconFileSpreadsheet, IconFileTypePdf, IconLayoutGrid, IconLayoutList, IconPrinter, IconX } from "@tabler/icons-react";
import { Button, ButtonGroup, Menu, MenuItem } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const RANGES = [
  { value: "today", label: { tr: "Bugün", en: "Today" } },
  { value: "week", label: { tr: "Bu hafta", en: "This week" } },
  { value: "month", label: { tr: "Bu ay", en: "This month" } },
];

function DateRange() {
  const t = useText();
  const [range, setRange] = useState("week");
  return (
    <ButtonGroup aria-label={t({ tr: "Rapor dönemi", en: "Report period" })}>
      {RANGES.map((item) => (
        <Button key={item.value} variant={range === item.value ? "primary" : "default"} aria-pressed={range === item.value} onClick={() => setRange(item.value)}>
          {t(item.label)}
        </Button>
      ))}
    </ButtonGroup>
  );
}

function Approval() {
  const t = useText();
  return (
    <ButtonGroup aria-label={t({ tr: "Fatura onayı", en: "Invoice approval" })}>
      <Button icon={<IconCheck size={15} />}>{t({ tr: "Onayla", en: "Approve" })}</Button>
      <Button icon={<IconX size={15} />}>{t({ tr: "Reddet", en: "Reject" })}</Button>
      <Button>{t({ tr: "Ertele", en: "Postpone" })}</Button>
    </ButtonGroup>
  );
}

function Split() {
  const t = useText();
  return (
    <ButtonGroup aria-label={t({ tr: "Dışa aktarma", en: "Export" })}>
      <Button icon={<IconDownload size={15} />}>{t({ tr: "Excel olarak indir", en: "Download as Excel" })}</Button>
      <Menu trigger={<Button aria-label={t({ tr: "Diğer biçimler", en: "Other formats" })} icon={<IconChevronDown size={15} />} />}>
        <MenuItem icon={<IconFileTypePdf size={15} />}>{t({ tr: "PDF olarak indir", en: "Download as PDF" })}</MenuItem>
        <MenuItem icon={<IconFileSpreadsheet size={15} />}>{t({ tr: "CSV olarak indir", en: "Download as CSV" })}</MenuItem>
        <MenuItem icon={<IconPrinter size={15} />}>{t({ tr: "Yazdır", en: "Print" })}</MenuItem>
      </Menu>
    </ButtonGroup>
  );
}

function ViewSwitch() {
  const t = useText();
  const [view, setView] = useState("list");
  return (
    <ButtonGroup aria-label={t({ tr: "Görünüm", en: "View" })}>
      <Button size="sm" aria-label={t({ tr: "Liste görünümü", en: "List view" })} aria-pressed={view === "list"} variant={view === "list" ? "primary" : "default"} icon={<IconLayoutList size={14} />} onClick={() => setView("list")} />
      <Button size="sm" aria-label={t({ tr: "Kart görünümü", en: "Card view" })} aria-pressed={view === "grid"} variant={view === "grid" ? "primary" : "default"} icon={<IconLayoutGrid size={14} />} onClick={() => setView("grid")} />
    </ButtonGroup>
  );
}

function Stepper() {
  const t = useText();
  const [page, setPage] = useState(3);
  return (
    <ButtonGroup aria-label={t({ tr: "Fatura gezintisi", en: "Invoice navigation" })}>
      <Button aria-label={t({ tr: "Önceki fatura", en: "Previous invoice" })} icon={<IconChevronLeft size={15} />} disabled={page === 1} onClick={() => setPage(page - 1)} />
      <Button disabled>{t({ tr: `Fatura ${page} / 5`, en: `Invoice ${page} of 5` })}</Button>
      <Button aria-label={t({ tr: "Sonraki fatura", en: "Next invoice" })} icon={<IconChevronRight size={15} />} disabled={page === 5} onClick={() => setPage(page + 1)} />
    </ButtonGroup>
  );
}

export default definePage({
  summary: { tr: "Birbiriyle ilişkili düğmeleri tek bir sıra halinde birleştirir. Dönem seçimi, görünüm değiştirme ve bölünmüş düğme gibi kalıpların temelidir.", en: "Joins related buttons into a single row. It is the base of patterns such as period selection, view switching and split buttons." },
  imports: 'import { ButtonGroup } from "btui";',
  hero: {
    Demo: DateRange,
    code: `const [range, setRange] = useState("week");

<ButtonGroup aria-label="Report period">
  <Button variant={range === "today" ? "primary" : "default"} aria-pressed={range === "today"} onClick={() => setRange("today")}>Today</Button>
  <Button variant={range === "week" ? "primary" : "default"} aria-pressed={range === "week"} onClick={() => setRange("week")}>This week</Button>
  <Button variant={range === "month" ? "primary" : "default"} aria-pressed={range === "month"} onClick={() => setRange("month")}>This month</Button>
</ButtonGroup>`,
  },
  use: {
    do: [
      { tr: "Aynı nesneye ait yakın eylemler: onayla, reddet, ertele", en: "Close actions on one object: approve, reject, postpone" },
      { tr: "Az seçenekli geçişler: bugün, bu hafta, bu ay", en: "Switches with few options: today, this week, this month" },
      { tr: "Ana eylem ve yanında daha fazlası için `Menu` birleşimi", en: "A main action paired with a `Menu` for the rest" },
    ],
    dont: [
      { tr: "Birbiriyle ilgisiz eylemler; bitişik görünmek ilişki olduğunu söyler", en: "Unrelated actions; touching edges imply a relationship" },
      { tr: "Beşten fazla seçenek; `Tabs` ya da `Select` daha iyi okunur", en: "More than five options; `Tabs` or `Select` read better" },
      { tr: "`IconButton` ile; grup yalnız doğrudan çocuğu olan `Button` öğelerini birleştirir", en: "With `IconButton`; the group only joins direct `Button` children" },
    ],
  },
  anatomy: `<ButtonGroup aria-label="What this group does">
  <Button>First</Button>
  <Button>Second</Button>
  <Button>Third</Button>
</ButtonGroup>`,
  examples: [
    {
      id: "actions",
      title: { tr: "İlişkili eylemler", en: "Related actions" },
      body: { tr: "Onay ekranındaki üç karar tek bir sırada durur. `aria-label` gruba ad verir; ekran okuyucu önce \"Fatura onayı\" der, sonra düğmeleri sıralar.", en: "The three decisions on an approval screen sit in one row. `aria-label` names the group, so a screen reader says \"Invoice approval\" before listing the buttons." },
      example: {
        Demo: Approval,
        code: `<ButtonGroup aria-label="Invoice approval">
  <Button icon={<IconCheck size={15} />}>Approve</Button>
  <Button icon={<IconX size={15} />}>Reject</Button>
  <Button>Postpone</Button>
</ButtonGroup>`,
      },
    },
    {
      id: "split",
      title: { tr: "Bölünmüş düğme", en: "Split button" },
      body: { tr: "Sık kullanılan eylem solda, seçenekleri sağda durur. `Menu` kendi düğmesini doğrudan gruba çizdiği için köşeler doğru birleşir. Etiketsiz düğmeye `aria-label` vermeyi unutmayın.", en: "The frequent action stays on the left and its alternatives on the right. `Menu` draws its trigger directly into the group, so the edges join correctly. Remember `aria-label` on the unlabelled button." },
      example: {
        Demo: Split,
        code: `<ButtonGroup aria-label="Export">
  <Button icon={<IconDownload size={15} />}>Download as Excel</Button>
  <Menu trigger={<Button aria-label="Other formats" icon={<IconChevronDown size={15} />} />}>
    <MenuItem icon={<IconFileTypePdf size={15} />}>Download as PDF</MenuItem>
    <MenuItem icon={<IconFileSpreadsheet size={15} />}>Download as CSV</MenuItem>
    <MenuItem icon={<IconPrinter size={15} />}>Print</MenuItem>
  </Menu>
</ButtonGroup>`,
      },
    },
    {
      id: "view-switch",
      title: { tr: "Görünüm değiştirici", en: "View switcher" },
      body: { tr: "Yalnız ikonlu seçeneklerde `IconButton` yerine `Button` kullanın ve `icon` ile `aria-label` verin. Seçili durumu `aria-pressed` ile bildirin; renk tek başına yetmez.", en: "For icon-only options use `Button` rather than `IconButton`, with `icon` and `aria-label`. Report the selected state with `aria-pressed`, since colour alone is not enough." },
      example: {
        Demo: ViewSwitch,
        code: `<ButtonGroup aria-label="View">
  <Button size="sm" aria-label="List view" aria-pressed={view === "list"} variant={view === "list" ? "primary" : "default"} icon={<IconLayoutList size={14} />} onClick={() => setView("list")} />
  <Button size="sm" aria-label="Card view" aria-pressed={view === "grid"} variant={view === "grid" ? "primary" : "default"} icon={<IconLayoutGrid size={14} />} onClick={() => setView("grid")} />
</ButtonGroup>`,
      },
    },
    {
      id: "navigation",
      title: { tr: "Önceki ve sonraki", en: "Previous and next" },
      body: { tr: "Fatura incelerken kayıtlar arasında geçmek için ortada konumu gösteren kapalı bir düğme bırakın. Uçlara gelince ilgili düğme kapanır.", en: "To move between records while reviewing invoices, keep a disabled button in the middle that shows the position. The button at each end turns off when the end is reached." },
      example: {
        Demo: Stepper,
        code: `<ButtonGroup aria-label="Invoice navigation">
  <Button aria-label="Previous invoice" icon={<IconChevronLeft size={15} />} disabled={page === 1} onClick={() => setPage(page - 1)} />
  <Button disabled>Invoice {page} of 5</Button>
  <Button aria-label="Next invoice" icon={<IconChevronRight size={15} />} disabled={page === 5} onClick={() => setPage(page + 1)} />
</ButtonGroup>`,
      },
    },
  ],
  a11y: [
    { tr: "`role=\"group\"` hazır gelir. `aria-label` vererek grubun ne işe yaradığını söyleyin.", en: "`role=\"group\"` comes built in. Add `aria-label` to say what the group is for." },
    { tr: "Seçim yapan gruplarda her düğmeye `aria-pressed` verin; bileşen bunu sizin yerinize yapmaz.", en: "In groups that select, give each button `aria-pressed`; the component does not do this for you." },
    { tr: "Her düğme sekme sırasında ayrı durur. Grup ok tuşlarıyla gezilmez.", en: "Each button keeps its own place in the tab order. The group does not use arrow key navigation." },
  ],
  keyboard: [
    ["Tab", { tr: "Sıradaki düğmeye geçer", en: "Moves to the next button" }],
    ["Shift + Tab", { tr: "Önceki düğmeye döner", en: "Moves to the previous button" }],
    ["Enter", { tr: "Odaktaki düğmeyi çalıştırır", en: "Runs the focused button" }],
    ["Space", { tr: "Odaktaki düğmeyi çalıştırır", en: "Runs the focused button" }],
  ],
  api: [
    {
      name: "ButtonGroup",
      description: { tr: "Tüm yerel `div` öznitelikleri iletilir. Ref iletilmez.", en: "All native `div` attributes are forwarded. The ref is not." },
      props: [
        { name: "children", type: "ReactNode", description: { tr: "Birleştirilecek `Button` öğeleri; doğrudan çocuk olmalıdır", en: "The `Button` elements to join; they must be direct children" } },
        { name: "aria-label", type: "string", description: { tr: "Grubun erişilebilir adı", en: "Accessible name of the group" } },
        { name: "className", type: "string", description: { tr: "Gruba eklenen sınıf", en: "Class added to the group" } },
      ],
    },
  ],
  styling: [
    { name: "data-variant", kind: "data", description: { tr: "İçteki her `Button` üzerinde seçili görünüm; seçili öğeyi buradan ayırt edin", en: "The variant on each inner `Button`; use it to tell the selected item apart" } },
    { name: "--bt-radius", kind: "var", description: { tr: "Grubun iki ucundaki köşe yarıçapı", en: "Corner radius at both ends of the group" } },
    { name: "--bt-border", kind: "var", description: { tr: "Düğmeler arasındaki çizgi", en: "The line between the buttons" } },
    { name: "--bt-accent-strong", kind: "var", description: { tr: "`primary` seçenek zemini", en: "Background of a `primary` option" } },
  ],
  related: ["button", "icon-button", "menu", "tabs"],
});
