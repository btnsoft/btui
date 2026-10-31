import { Fragment } from "react";
import { DataTable, type Column } from "btui";
import { useLang, useText, type Text } from "./i18n";
import { PAGES } from "./nav";
import type { PageContent } from "./schema";
import { ApiTable, BaseLink, Code, Demo, DoDont, H2, H3, P, Rich, StyleTable } from "./ui";

export function ComponentPage({ page }: { page: PageContent }) {
  const t = useText();
  const lang = useLang();
  const keyColumns: Column<{ keys: string; action: Text }>[] = [
    { key: "keys", header: t({ tr: "Tuş", en: "Key" }), sortable: false, width: "34%", cell: (r) => <>{r.keys.split(" + ").map((k, i) => <Fragment key={k}>{i > 0 ? " + " : ""}<kbd className="bt-kbd">{k}</kbd></Fragment>)}</> },
    { key: "action", header: t({ tr: "Eylem", en: "Action" }), sortable: false, cell: (r) => <Rich>{t(r.action)}</Rich> },
  ];
  return (
    <>
      <div className="d-meta">
        <code className="d-import">{page.imports}</code>
        {page.base ? <BaseLink slug={page.base} /> : null}
      </div>
      <Demo example={page.hero} />

      <H2 id="usage">{t({ tr: "Kullanım", en: "Usage" })}</H2>
      <DoDont use={page.use} />

      {page.anatomy ? (
        <>
          <H2 id="anatomy">{t({ tr: "Anatomi", en: "Anatomy" })}</H2>
          <Code>{page.anatomy}</Code>
        </>
      ) : null}

      <H2 id="examples">{t({ tr: "Örnekler", en: "Examples" })}</H2>
      {page.examples.map((section) => (
        <Fragment key={section.id}>
          <H3 id={section.id}>{t(section.title)}</H3>
          {section.body ? <P>{section.body}</P> : null}
          {section.example ? <Demo example={section.example} /> : null}
          {section.code ? <Code>{t(section.code)}</Code> : null}
        </Fragment>
      ))}

      <H2 id="accessibility">{t({ tr: "Erişilebilirlik", en: "Accessibility" })}</H2>
      <ul className="d-ul">{page.a11y.map((item, i) => <li key={i}><Rich>{t(item)}</Rich></li>)}</ul>
      {page.keyboard ? <DataTable key={lang} controls={false} columns={keyColumns} rows={page.keyboard.map(([keys, action]) => ({ keys, action }))} getRowKey={(r) => r.keys} className="d-api" /> : null}

      <H2 id="api">{t({ tr: "API", en: "API reference" })}</H2>
      {page.api.map((entry) => (
        <Fragment key={entry.name}>
          <H3 id={`api-${entry.name}`}>{entry.name}</H3>
          {entry.description ? <P>{entry.description}</P> : null}
          <ApiTable entry={entry} />
        </Fragment>
      ))}

      {page.styling ? (
        <>
          <H2 id="styling">{t({ tr: "Stil kancaları", en: "Styling hooks" })}</H2>
          <StyleTable hooks={page.styling} />
        </>
      ) : null}

      <H2 id="related">{t({ tr: "İlgili", en: "Related" })}</H2>
      <div className="d-related">
        {page.related.map((id) => {
          const target = PAGES.find((p) => p.id === id);
          return target ? <a key={id} href={`#/${lang}/${id}`}><target.icon size={16} />{t(target.title)}</a> : null;
        })}
      </div>
    </>
  );
}
