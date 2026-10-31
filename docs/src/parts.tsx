import { useState, type ReactNode } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { DataTable, IconButton, type Column } from "btui";

export function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="doc-code">
      <pre><code>{children}</code></pre>
      <IconButton size="sm" label={copied ? "Kopyalandı" : "Kopyala"} onClick={copy}>{copied ? <IconCheck size={14} /> : <IconCopy size={14} />}</IconButton>
    </div>
  );
}

export function CodeBlock({ children }: { children: string }) {
  return <div className="doc-example doc-code-only"><Code>{children}</Code></div>;
}

export function Example({ code, block, children }: { code: string; block?: boolean; children: ReactNode }) {
  return (
    <div className="doc-example">
      <div className="doc-stage" data-block={block ? "" : undefined}>{children}</div>
      <Code>{code}</Code>
    </div>
  );
}

type Prop = { name: string; type: string; note: string };
const columns: Column<Prop>[] = [
  { key: "name", header: "Prop", sortable: false, cell: (r) => <code>{r.name}</code> },
  { key: "type", header: "Tip", sortable: false, cell: (r) => <code>{r.type}</code> },
  { key: "note", header: "Açıklama", sortable: false },
];

export function Props({ rows }: { rows: Array<[string, string, string]> }) {
  return (
    <>
      <h2>Prop'lar</h2>
      <DataTable controls={false} columns={columns} rows={rows.map(([name, type, note]) => ({ name, type, note }))} getRowKey={(r) => r.name} />
    </>
  );
}
