import { useEffect, useState } from "react";
import { useText } from "./i18n";

type Entry = { id: string; text: string; level: number };

/** "On this page": reads headings from the article, so pages need no extra data. */
export function Toc({ pageKey }: { pageKey: string }) {
  const t = useText();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const article = document.querySelector(".d-article");
    if (!article) return;
    const read = () => {
      const heads = Array.from(article.querySelectorAll<HTMLElement>("[data-toc]"));
      setEntries(heads.map((h) => ({ id: h.id, text: h.textContent ?? "", level: h.tagName === "H3" ? 3 : 2 })));
      return heads;
    };
    read();
    const content = new MutationObserver(read);
    content.observe(article, { childList: true, subtree: true });
    const scroller = document.querySelector(".bt-content");
    const onScroll = () => {
      const heads = Array.from(article.querySelectorAll<HTMLElement>("[data-toc]"));
      const top = scroller?.getBoundingClientRect().top ?? 0;
      const current = heads.filter((h) => h.getBoundingClientRect().top - top < 120).pop();
      setActive(current?.id ?? "");
    };
    onScroll();
    scroller?.addEventListener("scroll", onScroll, { passive: true });
    return () => { content.disconnect(); scroller?.removeEventListener("scroll", onScroll); };
  }, [pageKey]);

  if (entries.length === 0) return <aside className="d-toc" />;
  return (
    <aside className="d-toc">
      <nav aria-label={t({ tr: "Bu sayfada", en: "On this page" })}>
        <b>{t({ tr: "Bu sayfada", en: "On this page" })}</b>
        {entries.map((entry) => (
          <button key={entry.id} type="button" data-level={entry.level} data-active={entry.id === active ? "" : undefined} onClick={() => document.getElementById(entry.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            {entry.text}
          </button>
        ))}
      </nav>
    </aside>
  );
}
