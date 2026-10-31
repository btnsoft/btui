import { useState, type ReactNode } from "react";
import { IconCheck, IconCopy, IconExternalLink, IconThumbDown, IconThumbUp } from "@tabler/icons-react";
import { Badge, DataTable, IconButton, Tabs, type Column } from "btui";
import { highlight } from "./highlight";
import { useLang, useText, type Text } from "./i18n";
import type { ApiEntry, Example, Prop, StyleHook } from "./schema";

/** Renders text with `inline code` written between backticks. */
export function Rich({ children }: { children: string }) {
  return <>{children.split(/(`[^`]+`)/).map((part, i) => (part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part))}</>;
}

export function P({ children }: { children: Text }) {
  const t = useText();
  return <p className="d-p"><Rich>{t(children)}</Rich></p>;
}

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return <h2 className="d-h2" id={id} data-toc="">{children}</h2>;
}

export function H3({ id, children }: { id: string; children: ReactNode }) {
  return <h3 className="d-h3" id={id} data-toc="">{children}</h3>;
}

export function Code({ children, lang }: { children: string; lang?: string }) {
  const t = useText();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="d-code">
      {lang ? <span className="d-code-lang">{lang}</span> : null}
      <pre><code>{highlight(children)}</code></pre>
      <IconButton size="sm" label={copied ? t({ tr: "Kopyalandı", en: "Copied" }) : t({ tr: "Kopyala", en: "Copy" })} onClick={copy}>
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </IconButton>
    </div>
  );
}

export function Stage({ block, children }: { block?: boolean; children: ReactNode }) {
  return <div className="d-stage" data-block={block ? "" : undefined}>{children}</div>;
}

export function Demo({ example }: { example: Example }) {
  const t = useText();
  const { Demo: Live, code, block } = example;
  return (
    <div className="d-demo">
      <Tabs
        variant="chip"
        items={[
          { value: "preview", label: t({ tr: "Önizleme", en: "Preview" }), content: <Stage block={block}><Live /></Stage> },
          { value: "code", label: t({ tr: "Kod", en: "Code" }), content: <Code>{t(code)}</Code> },
        ]}
      />
    </div>
  );
}

export function DoDont({ use }: { use: { do: Text[]; dont: Text[] } }) {
  const t = useText();
  return (
    <div className="d-dodont">
      <div data-kind="do">
        <b><IconThumbUp size={15} />{t({ tr: "Şunun için kullanın", en: "Use it for" })}</b>
        <ul>{use.do.map((item, i) => <li key={i}><Rich>{t(item)}</Rich></li>)}</ul>
      </div>
      <div data-kind="dont">
        <b><IconThumbDown size={15} />{t({ tr: "Şunun için kullanmayın", en: "Avoid it for" })}</b>
        <ul>{use.dont.map((item, i) => <li key={i}><Rich>{t(item)}</Rich></li>)}</ul>
      </div>
    </div>
  );
}

function PropName({ prop }: { prop: Prop }) {
  return <span className="d-prop"><code>{prop.name}</code>{prop.required ? <Badge tone="danger">required</Badge> : null}</span>;
}

export function ApiTable({ entry }: { entry: ApiEntry }) {
  const t = useText();
  const lang = useLang();
  const columns: Column<Prop>[] = [
    { key: "name", header: "Prop", sortable: false, width: "22%", cell: (p) => <PropName prop={p} /> },
    { key: "type", header: t({ tr: "Tip", en: "Type" }), sortable: false, width: "30%", cell: (p) => <code className="d-type">{p.type}</code> },
    { key: "default", header: t({ tr: "Varsayılan", en: "Default" }), sortable: false, cell: (p) => (p.default ? <code>{p.default}</code> : <span className="d-muted">—</span>) },
    { key: "description", header: t({ tr: "Açıklama", en: "Description" }), sortable: false, cell: (p) => <Rich>{t(p.description)}</Rich> },
  ];
  return <DataTable key={lang} controls={false} columns={columns} rows={entry.props} getRowKey={(p) => p.name} className="d-api" />;
}

export function StyleTable({ hooks }: { hooks: StyleHook[] }) {
  const t = useText();
  const columns: Column<StyleHook>[] = [
    { key: "name", header: t({ tr: "Ad", en: "Name" }), sortable: false, width: "38%", cell: (h) => <code>{h.name}</code> },
    { key: "kind", header: t({ tr: "Tür", en: "Kind" }), sortable: false, cell: (h) => <Badge tone={h.kind === "var" ? "info" : "neutral"}>{h.kind === "var" ? "CSS var" : "data"}</Badge> },
    { key: "description", header: t({ tr: "Açıklama", en: "Description" }), sortable: false, cell: (h) => <Rich>{t(h.description)}</Rich> },
  ];
  return <DataTable controls={false} columns={columns} rows={hooks} getRowKey={(h) => h.name} className="d-api" />;
}

export function BaseLink({ slug }: { slug: string }) {
  const t = useText();
  return (
    <a className="d-pill" href={`https://base-ui.com/react/components/${slug}`} target="_blank" rel="noreferrer">
      {t({ tr: "Base UI üzerine kurulu", en: "Built on Base UI" })}<IconExternalLink size={12} />
    </a>
  );
}
