import { useEffect, useRef, useState, type FormEvent } from "react";
import { IconUpload } from "@tabler/icons-react";
import { Button, Field, FileDropzone, Progress } from "btui";
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

function Limited() {
  const t = useText();
  const [files, setFiles] = useState<File[]>(() => [sample("teklif-1.pdf", 120000, "application/pdf"), sample("teklif-2.pdf", 98000, "application/pdf")]);
  return (
    <div className="d-stack">
      <FileDropzone files={files} onChange={setFiles} multiple maxFiles={3} accept=".pdf" note={t({ tr: "En çok 3 teklif", en: "Up to 3 quotes" })} />
    </div>
  );
}

function InField() {
  const t = useText();
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="d-stack">
      <Field label={t({ tr: "Vergi levhası", en: "Tax certificate" })} hint={t({ tr: "PDF ya da fotoğraf, en çok 5 MB", en: "PDF or photo, up to 5 MB" })}>
        <FileDropzone files={files} onChange={setFiles} accept=".pdf,image/*" maxSize={5 * MB} />
      </Field>
    </div>
  );
}

function NativeForm() {
  const t = useText();
  const [files, setFiles] = useState<File[]>(() => [sample("fatura-ekim-2026.pdf", 482000, "application/pdf")]);
  const [sent, setSent] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(JSON.stringify(new FormData(e.currentTarget).getAll("documents").map((file) => (file as File).name)));
  };
  return (
    <form className="d-stack" onSubmit={submit}>
      <FileDropzone name="documents" files={files} onChange={setFiles} multiple />
      <Button type="submit" variant="primary">{t({ tr: "Gönder", en: "Submit" })}</Button>
      {sent ? <code>{sent}</code> : null}
    </form>
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
  summary: { tr: "Sürükle bırak ya da seçim penceresiyle dosya alır. Türü, boyutu ve sayıyı denetler, reddedilen dosyayı nedeniyle bildirir. Dosyaları kendiniz yükleyebilir ya da `name` ile yerel form gönderimine bırakabilirsiniz.", en: "Takes files by drag and drop or through the file picker. It checks type, size and count and reports rejected files with a reason. Upload the files yourself, or leave them to a native form submit through `name`." },
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
      { tr: "Tek satırlık metin alanları; dosya yerine bağlantı isteniyorsa `Input` yeterlidir", en: "Single line text fields; if you want a link rather than a file, `Input` is enough" },
      { tr: "Dosyaları sunucuda denetlememek; tarayıcıdaki kurallar yalnız kullanıcıya kolaylıktır", en: "Skipping checks on the server; the rules in the browser are only a convenience" },
      { tr: "Tablo satırı gibi dar alanlar; kutu en az yüz piksel ister", en: "Tight places such as table rows; the box needs at least a hundred pixels" },
    ],
  },
  anatomy: `<FileDropzone
  files={files}
  onChange={setFiles}
  accept=".pdf"
  maxSize={5 * 1024 * 1024}
  multiple
  maxFiles={3}
  name="documents"
  title="Heading"
  hint="Second line"
  note="Small print"
/>`,
  examples: [
    {
      id: "multiple",
      title: { tr: "Birden çok dosya", en: "Multiple files" },
      body: { tr: "`multiple` yeni dosyaları listenin sonuna ekler; olmadan her seçim öncekinin yerine geçer. Her satırdaki düğme dosyayı listeden çıkarır. Aynı dosya yeniden eklenirse atlanır: adı, boyutu ve son değişiklik zamanı aynı olan dosya listeye girmez, ileti de çıkmaz.", en: "`multiple` appends new files to the list; without it each choice replaces the last. The button on each row removes that file. Duplicates are skipped: a file with the same name, size and last modified time does not join the list, and no message shows." },
      example: { Demo: Multiple, code: `const [files, setFiles] = useState<File[]>([]);\n\n<FileDropzone files={files} onChange={setFiles} multiple note="Add invoices and waybills together" />` },
    },
    {
      id: "rules",
      title: { tr: "Tür ve boyut kuralları", en: "Type and size rules" },
      body: { tr: "`accept` uzantı (`.xlsx`), MIME türü (`application/pdf`) ve joker (`image/*`) kabul eder, virgülle ayrılır. `maxSize` bayt cinsindendir. Kural sürüklenen dosyalara da uygulanır; tarayıcı bunu tek başına yapmaz. Reddedilen dosya kutunun altında adıyla yazılır, uygun olanlar eklenir. Bir `.txt` dosyası sürükleyip deneyin.", en: "`accept` takes extensions (`.xlsx`), MIME types (`application/pdf`) and wildcards (`image/*`), separated by commas. `maxSize` is in bytes. The rules also apply to dragged files, which the browser does not check alone. A rejected file is named under the box and the valid ones are added. Drag in a `.txt` file to try." },
      example: { Demo: Restricted, code: `<FileDropzone files={files} onChange={setFiles} multiple accept=".xlsx,.csv,image/*" maxSize={1024 * 1024} note="Excel, CSV or images, up to 1 MB" />` },
    },
    {
      id: "max-files",
      title: { tr: "En çok dosya sayısı", en: "Most files" },
      body: { tr: "`maxFiles` listenin tutabileceği dosya sayısını sınırlar. Sığan dosyalar eklenir, kalanı için `tooManyFiles` iletisi çıkar. Aşağıdaki listeye iki PDF daha sürükleyip deneyin.", en: "`maxFiles` limits how many files the list may hold. Files that fit are added and the rest raise the `tooManyFiles` message. Drag two more PDFs onto the list below to try." },
      example: { Demo: Limited, code: `<FileDropzone files={files} onChange={setFiles} multiple maxFiles={3} accept=".pdf" note="Up to 3 quotes" />` },
    },
    {
      id: "in-field",
      title: { tr: "Field içinde", en: "Inside Field" },
      body: { tr: "`Field` etiketi ve açıklaması içerideki `input` öğesine bağlanır. Kutunun kendi metinleri yerinde kalır; `error` ile sunucudan dönen hatayı gösterebilirsiniz.", en: "The `Field` label and hint link to the `input` inside. The box keeps its own texts, and `error` can show an error returned by the server." },
      example: {
        Demo: InField,
        code: `<Field label="Tax certificate" hint="PDF or photo, up to 5 MB">
  <FileDropzone files={files} onChange={setFiles} accept=".pdf,image/*" maxSize={5 * 1024 * 1024} />
</Field>`,
      },
    },
    {
      id: "form",
      title: { tr: "Yerel form gönderimi", en: "Native form submit" },
      body: { tr: "`name` verildiğinde liste `DataTransfer` ile gerçek `input` öğesine yansıtılır, bu yüzden dosyalar form gönderimine girer. Tarayıcının kendi gönderimi için `<form method=\"post\" encType=\"multipart/form-data\">` yazın. Kapalı `input` gönderilmediği için `disabled` iken dosyalar gitmez. Formu gönderip okunan dosya adlarına bakın.", en: "With `name`, the list is mirrored onto the real `input` through `DataTransfer`, so the files join a form submission. For the browser's own submit, write `<form method=\"post\" encType=\"multipart/form-data\">`. A disabled `input` is not sent, so no files go while `disabled` is on. Submit the form to see the file names read back." },
      example: {
        Demo: NativeForm,
        code: `<form method="post" action="/api/documents" encType="multipart/form-data">
  <FileDropzone name="documents" files={files} onChange={setFiles} multiple />
  <Button type="submit" variant="primary">Submit</Button>
</form>`,
      },
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
      body: { tr: "İlerleme göstermek istiyorsanız gönderimi `files` dizisiyle kendiniz yapın ve durumu `Progress` ile gösterin. Yükleme sürerken `disabled` verin. Aşağıdaki akış yüklemeyi taklit eder, gerçek bir istek göndermez.", en: "To show progress, send the files yourself from the `files` array and report it with `Progress`. Pass `disabled` during the upload. The flow below imitates an upload and sends no real request." },
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
    { tr: "İçeride gerçek bir `input type=\"file\"` durur; klavye ve ekran okuyucu onu doğrudan kullanır. Alanın adı `title`, `hint` ve `note` metinlerinden oluşur. `Field` içinde adı alan etiketi verir, açıklama `aria-describedby` ile bağlanır.", en: "A real `input type=\"file\"` sits inside, so keyboards and screen readers use it directly. The field is named by the `title`, `hint` and `note` texts. Inside `Field` the field label names it, and the hint links through `aria-describedby`." },
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
        { name: "maxFiles", type: "number", description: { tr: "Listenin tutabileceği en çok dosya sayısı", en: "Most files the list may hold" } },
        { name: "disabled", type: "boolean", default: "false", description: { tr: "Seçimi, bırakmayı ve listeden kaldırmayı kapatır", en: "Blocks choosing, dropping and removing" } },
        { name: "title", type: "ReactNode", default: "locale.dropTitle", description: { tr: "Ana başlık", en: "The heading" } },
        { name: "hint", type: "ReactNode", default: "locale.dropHint", description: { tr: "İkinci satır", en: "The second line" } },
        { name: "note", type: "ReactNode", description: { tr: "En altta küçük yazı", en: "Small print at the bottom" } },
        { name: "name", type: "string", description: { tr: "Yerel `input` öğesine yazılır; dosyalar `DataTransfer` ile yansıtıldığı için form gönderimine girer", en: "Set on the native `input`; files are mirrored onto it through `DataTransfer`, so they join a form submit" } },
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
