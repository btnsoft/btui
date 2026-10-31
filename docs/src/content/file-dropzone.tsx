import { useEffect, useRef, useState } from "react";
import { IconUpload } from "@tabler/icons-react";
import { Button, FileDropzone, Progress } from "btui";
import { useText } from "../lib/i18n";
import { definePage } from "../lib/schema";

const MB = 1024 * 1024;

function sample(name: string, size: number, type: string) {
  return new File([new Uint8Array(size)], name, { type });
}

function Invoice() {
  const t = useText();
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="d-stack">
      <FileDropzone files={files} onChange={setFiles} accept=".pdf" maxSize={5 * MB} note={t({ tr: "Yalnız PDF, en çok 5 MB", en: "PDF only, up to 5 MB" })} />
    </div>
  );
}

function Multiple() {
  const t = useText();
  const [files, setFiles] = useState<File[]>(() => [
    sample("fatura-ekim-2026.pdf", 482000, "application/pdf"),
    sample("irsaliye-SP-1040.pdf", 96000, "application/pdf"),
  ]);
  return (
    <div className="d-stack">
      <FileDropzone files={files} onChange={setFiles} multiple note={t({ tr: "Fatura ve irsaliyeleri birlikte ekleyin", en: "Add invoices and waybills together" })} />
    </div>
  );
}

function Restricted() {
  const t = useText();
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="d-stack">
      <FileDropzone files={files} onChange={setFiles} multiple accept=".xlsx,.csv,image/*" maxSize={MB} note={t({ tr: "Excel, CSV ya da görsel, en çok 1 MB", en: "Excel, CSV or images, up to 1 MB" })} />
    </div>
  );
}

function CustomText() {
  const t = useText();
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="d-stack">
      <FileDropzone
        files={files}
        onChange={setFiles}
        accept=".pdf,.jpg,.png"
        title={t({ tr: "Vergi levhasını ekleyin", en: "Add the tax certificate" })}
        hint={t({ tr: "Taranmış kopya ya da telefon fotoğrafı olabilir", en: "A scanned copy or a phone photo will do" })}
        note={t({ tr: "Bayi başvurusu için zorunludur", en: "Required for the dealer application" })}
      />
    </div>
  );
}

function Upload() {
  const t = useText();
  const [files, setFiles] = useState<File[]>(() => [sample("mutabakat-eylul-2026.xlsx", 1840000, "application/vnd.ms-excel")]);
  const [progress, setProgress] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);
  const start = () => {
    let value = 0;
    setProgress(0);
    timer.current = setInterval(() => {
      value += 10;
      if (value < 100) {
        setProgress(value);
        return;
      }
      clearInterval(timer.current);
      setProgress(null);
      setFiles([]);
    }, 180);
  };
  return (
    <div className="d-stack">
      <FileDropzone files={files} onChange={setFiles} disabled={progress !== null} />
      {progress !== null ? <Progress label={t({ tr: "Yükleniyor", en: "Uploading" })} value={progress} /> : null}
      <Button variant="primary" icon={<IconUpload size={15} />} disabled={!files.length} loading={progress !== null} onClick={start}>{t({ tr: "Yüklemeyi başlat", en: "Start upload" })}</Button>
    </div>
  );
}

function Disabled() {
  const t = useText();
  const [files, setFiles] = useState<File[]>(() => [sample("sozlesme-imzali.pdf", 2300000, "application/pdf")]);
  return (
    <div className="d-stack">
      <FileDropzone files={files} onChange={setFiles} disabled note={t({ tr: "Onaylanan başvuruya dosya eklenemez", en: "Files cannot be added to an approved application" })} />
    </div>
  );
}

export default definePage({
  summary: { tr: "Sürükle bırak ya da seçim penceresiyle dosya alır. Türü ve boyutu denetler, reddedilen dosyayı nedeniyle bildirir. Yüklemenin kendisi size aittir.", en: "Takes files by drag and drop or through the file picker. It checks type and size and reports rejected files with a reason. The upload itself is yours to do." },
  imports: 'import { FileDropzone } from "btui";',
  hero: {
    Demo: Invoice,
    code: `const [files, setFiles] = useState<File[]>([]);

<FileDropzone files={files} onChange={setFiles} accept=".pdf" maxSize={5 * 1024 * 1024} note="PDF only, up to 5 MB" />`,
  },
  use: {
    do: [
      { tr: "Belge ekleme: fatura, irsaliye, vergi levhası", en: "Attaching documents: invoices, waybills, tax certificates" },
      { tr: "Toplu dosya alma; `multiple` listeyi biriktirir", en: "Taking files in bulk; `multiple` builds up the list" },
      { tr: "Tür ve boyut kuralı olan yüklemeler; ihlaller dosya adıyla bildirilir", en: "Uploads with type and size rules; violations are reported by file name" },
    ],
    dont: [
      { tr: "Klasik form gönderimiyle dosya göndermek; dosya `input` içinde kalmaz, `files` üzerinden kendiniz yükleyin", en: "Sending files through a plain form submit; the file does not stay in the `input`, so upload from `files` yourself" },
      { tr: "`Field` içinde `label` ile; etiket alana bağlanmaz, başlık için `title` kullanın", en: "Inside `Field` with `label`; the label does not reach the box, use `title` for the heading" },
      { tr: "Tablo satırı gibi dar alanlar; kutu en az yüz piksel ister", en: "Tight places such as table rows; the box needs at least a hundred pixels" },
    ],
  },
  anatomy: `<FileDropzone
  files={files}
  onChange={setFiles}
  accept=".pdf"
  maxSize={5 * 1024 * 1024}
  multiple
  title="Heading"
  hint="Second line"
  note="Small print"
/>`,
  examples: [
    {
      id: "multiple",
      title: { tr: "Birden çok dosya", en: "Multiple files" },
      body: { tr: "`multiple` yeni dosyaları listenin sonuna ekler; olmadan her seçim öncekinin yerine geçer. Her satırdaki düğme dosyayı listeden çıkarır. Aynı dosya iki kez eklenirse iki kez listelenir; tekrarı `onChange` içinde süzün.", en: "`multiple` appends new files to the list; without it each choice replaces the last. The button on each row removes that file. A file added twice is listed twice, so filter duplicates in `onChange`." },
      example: { Demo: Multiple, code: `const [files, setFiles] = useState<File[]>([]);\n\n<FileDropzone files={files} onChange={setFiles} multiple note="Add invoices and waybills together" />` },
    },
    {
      id: "rules",
      title: { tr: "Tür ve boyut kuralları", en: "Type and size rules" },
      body: { tr: "`accept` uzantı (`.xlsx`), MIME türü (`application/pdf`) ve joker (`image/*`) kabul eder, virgülle ayrılır. `maxSize` bayt cinsindendir. Kural sürüklenen dosyalara da uygulanır; tarayıcı bunu tek başına yapmaz. Reddedilen dosya kutunun altında adıyla yazılır, uygun olanlar eklenir. Bir `.txt` dosyası sürükleyip deneyin.", en: "`accept` takes extensions (`.xlsx`), MIME types (`application/pdf`) and wildcards (`image/*`), separated by commas. `maxSize` is in bytes. The rules also apply to dragged files, which the browser does not check alone. A rejected file is named under the box and the valid ones are added. Drag in a `.txt` file to try." },
      example: { Demo: Restricted, code: `<FileDropzone files={files} onChange={setFiles} multiple accept=".xlsx,.csv,image/*" maxSize={1024 * 1024} note="Excel, CSV or images, up to 1 MB" />` },
    },
    {
      id: "text",
      title: { tr: "Metinleri değiştirmek", en: "Changing the text" },
      body: { tr: "`title` ana başlıktır, `hint` ikinci satırdır, `note` en altta küçük yazılır. Verilmezlerse dil dosyasındaki `dropTitle` ve `dropHint` görünür. Hangi belgenin beklendiğini başlıkta söyleyin.", en: "`title` is the heading, `hint` the second line and `note` the small print at the bottom. Without them `dropTitle` and `dropHint` from the locale show. Say in the heading which document you expect." },
      example: {
        Demo: CustomText,
        code: `<FileDropzone
  files={files}
  onChange={setFiles}
  accept=".pdf,.jpg,.png"
  title="Add the tax certificate"
  hint="A scanned copy or a phone photo will do"
  note="Required for the dealer application"
/>`,
      },
    },
    {
      id: "upload",
      title: { tr: "Yükleme akışı", en: "Upload flow" },
      body: { tr: "Bileşen dosyaları yalnız toplar. Gönderimi `files` dizisiyle kendiniz yapın ve ilerlemeyi `Progress` ile gösterin. Yükleme sürerken `disabled` verin. Aşağıdaki akış yüklemeyi taklit eder, gerçek bir istek göndermez.", en: "The component only collects files. Send them yourself from the `files` array and show progress with `Progress`. Pass `disabled` during the upload. The flow below imitates an upload and sends no real request." },
      example: {
        Demo: Upload,
        code: `const upload = async () => {
  const body = new FormData();
  files.forEach((file) => body.append("documents", file));
  await fetch("/api/documents", { method: "POST", body });
  setFiles([]);
};

<FileDropzone files={files} onChange={setFiles} disabled={busy} />
{busy ? <Progress label="Uploading" value={progress} /> : null}
<Button variant="primary" disabled={!files.length} loading={busy} onClick={upload}>Start upload</Button>`,
      },
    },
    {
      id: "disabled",
      title: { tr: "Kapalı", en: "Disabled" },
      body: { tr: "`disabled` dosya seçimini, bırakmayı ve listeden kaldırmayı kapatır, kutu da soluklaşır. Nedenini `note` ile yazın.", en: "`disabled` blocks choosing, dropping and removing, and the box fades. Give the reason in `note`." },
      example: { Demo: Disabled, code: `<FileDropzone files={files} onChange={setFiles} disabled note="Files cannot be added to an approved application" />` },
    },
  ],
  a11y: [
    { tr: "İçeride gerçek bir `input type=\"file\"` durur; klavye ve ekran okuyucu onu doğrudan kullanır. Alanın adı `title`, `hint` ve `note` metinlerinden oluşur.", en: "A real `input type=\"file\"` sits inside, so keyboards and screen readers use it directly. The field is named by the `title`, `hint` and `note` texts." },
    { tr: "Sürükle bırak zorunlu değildir; aynı işi tıklama ve klavye de yapar.", en: "Drag and drop is never the only way; a click or the keyboard does the same job." },
    { tr: "Reddetme iletileri `role=\"alert\"` taşır ve hemen okunur.", en: "Rejection messages carry `role=\"alert\"` and are read at once." },
    { tr: "Kaldırma düğmesinin adı dosya adını içerir: \"Kaldır: fatura.pdf\".", en: "The remove button's name includes the file name: \"Remove: invoice.pdf\"." },
  ],
  keyboard: [
    ["Tab", { tr: "Kutuya, sonra kaldırma düğmelerine geçer", en: "Moves to the box, then to the remove buttons" }],
    ["Enter", { tr: "Kutudayken dosya seçim penceresini açar; kaldırma düğmesinde dosyayı çıkarır", en: "Opens the file picker on the box; removes the file on a remove button" }],
    ["Space", { tr: "Kutudayken dosya seçim penceresini açar; kaldırma düğmesinde dosyayı çıkarır", en: "Opens the file picker on the box; removes the file on a remove button" }],
  ],
  api: [
    {
      name: "FileDropzone",
      description: { tr: "Yalnız denetimli çalışır: `files` ve `onChange` zorunludur. Yerel öznitelikler ve ref iletilmez.", en: "It only works controlled: `files` and `onChange` are required. Native attributes and the ref are not forwarded." },
      props: [
        { name: "files", type: "File[]", required: true, description: { tr: "Seçili dosyalar", en: "The chosen files" } },
        { name: "onChange", type: "(files: File[]) => void", required: true, description: { tr: "Yeni listeyi bildirir; ekleme ve kaldırmada çağrılır", en: "Reports the new list; called on add and remove" } },
        { name: "accept", type: "string", description: { tr: "Kabul edilen türler: uzantı, MIME türü ya da `image/*`", en: "Accepted types: extension, MIME type or `image/*`" } },
        { name: "multiple", type: "boolean", default: "false", description: { tr: "Dosyaları listeye ekler; kapalıyken son seçim öncekinin yerine geçer", en: "Appends files to the list; when off, the last choice replaces the previous one" } },
        { name: "maxSize", type: "number", description: { tr: "En büyük dosya boyutu, bayt", en: "Largest file size, in bytes" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Seçimi ve bırakmayı kapatır; kaldırma düğmeleri etkilenmez", en: "Blocks choosing and dropping; remove buttons are not affected" } },
        { name: "title", type: "ReactNode", default: "locale.dropTitle", description: { tr: "Ana başlık", en: "The heading" } },
        { name: "hint", type: "ReactNode", default: "locale.dropHint", description: { tr: "İkinci satır", en: "The second line" } },
        { name: "note", type: "ReactNode", description: { tr: "En altta küçük yazı", en: "Small print at the bottom" } },
        { name: "name", type: "string", description: { tr: "Yerel `input` öğesine yazılır; seçim hemen temizlendiği için dosyalar form gönderimine girmez", en: "Set on the native `input`; the selection is cleared right away, so files are not part of a form submit" } },
        { name: "className", type: "string", description: { tr: "Kök öğeye eklenen sınıf", en: "Class added to the root element" } },
      ],
    },
  ],
  styling: [
    { name: "data-dragging", kind: "data", description: { tr: "Dosya kutunun üzerindeyken kök öğede bulunur", en: "Present on the root while a file is over the box" } },
    { name: "--bt-accent", kind: "var", description: { tr: "Sürükleme ve odak kenarlığı, ikon rengi", en: "Drag and focus border, icon colour" } },
    { name: "--bt-accent-soft", kind: "var", description: { tr: "Sürükleme ve odak zemini, ikon zemini", en: "Drag and focus background, icon background" } },
    { name: "--bt-surface-2", kind: "var", description: { tr: "Kutu zemini", en: "Box background" } },
    { name: "--bt-border", kind: "var", description: { tr: "Kesik çizgili kenarlık", en: "Dashed border" } },
    { name: "--bt-danger", kind: "var", description: { tr: "Reddetme iletisi", en: "Rejection message" } },
  ],
  related: ["field", "progress", "button", "alert"],
});
