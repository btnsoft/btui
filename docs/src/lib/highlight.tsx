import { Fragment, type ReactNode } from "react";

const TOKENS = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?[A-Za-z][\w.]*|\/?>)|\b(import|export|from|const|let|function|return|await|async|if|else|type|default|new|true|false|null|undefined)\b|([A-Za-z_][\w-]*)(?==[{"'])/g;

/** A small TSX tokenizer: enough colour to scan a snippet, no dependency. */
export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(TOKENS)) {
    const at = match.index;
    if (at > last) out.push(<Fragment key={last}>{code.slice(last, at)}</Fragment>);
    const kind = match[1] ? "comment" : match[2] ? "string" : match[3] ? "tag" : match[4] ? "keyword" : "attr";
    out.push(<span key={at} className={`tk-${kind}`}>{match[0]}</span>);
    last = at + match[0].length;
  }
  if (last < code.length) out.push(<Fragment key={last}>{code.slice(last)}</Fragment>);
  return out;
}
