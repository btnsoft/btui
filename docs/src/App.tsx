import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { IconBrandGithub, IconMoon, IconSun } from "@tabler/icons-react";
import { AppShell, Button, ButtonGroup, IconButton, Kbd, Page, Sidebar, Skeleton, Topbar, TopbarSearch, TopbarSpacer, Tooltip, type NavGroup } from "btui";
import { LangContext, useText, type Lang } from "./lib/i18n";
import { GUIDE_IDS, NAV, PAGES } from "./lib/nav";
import { ComponentPage } from "./lib/ComponentPage";
import type { PageContent } from "./lib/schema";
import { Rich } from "./lib/ui";
import { Toc } from "./lib/Toc";

const REPO = "https://github.com/btnsoft/btui";
const componentFiles = import.meta.glob<{ default: PageContent }>("./content/*.tsx");
const guideFiles = import.meta.glob<{ default: ComponentType }>("./guides/*.tsx");

const components = new Map(
  Object.entries(componentFiles).map(([path, load]) => {
    const id = path.replace("./content/", "").replace(".tsx", "");
    return [id, lazy(async () => {
      const page = (await load()).default;
      return { default: () => <Body summary={page.summary}><ComponentPage page={page} /></Body> };
    })];
  }),
);
const guides = new Map(
  Object.entries(guideFiles).map(([path, load]) => [path.replace("./guides/", "").replace(".tsx", ""), lazy(load)]),
);

function Body({ summary, children }: { summary: PageContent["summary"]; children: ReactNode }) {
  const t = useText();
  return (
    <>
      <p className="d-lead"><Rich>{t(summary)}</Rich></p>
      {children}
    </>
  );
}

function readRoute() {
  const [, first, second] = location.hash.split("/");
  const known = first === "tr" || first === "en";
  return { lang: (known ? first : null) as Lang | null, id: (known ? second : first) || "home" };
}

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem("btui-docs-lang");
    if (saved === "tr" || saved === "en") return saved;
  } catch { /* yalnız bu oturum için */ }
  return navigator.language.toLowerCase().startsWith("tr") ? "tr" : "en";
}

const lower = (s: string, lang: Lang) => s.toLocaleLowerCase(lang);

export function App({ onLang }: { onLang: (lang: Lang) => void }) {
  const [route, setRoute] = useState(readRoute);
  const [fallback] = useState(initialLang);
  const lang = route.lang ?? fallback;
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("btui-docs-theme") === "dark"; } catch { return false; }
  });
  const search = useRef<HTMLInputElement>(null);
  const t = (x: string | { tr: string; en: string }) => (typeof x === "string" ? x : x[lang]);

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    onLang(lang);
    document.documentElement.lang = lang;
    try { localStorage.setItem("btui-docs-lang", lang); } catch { /* yalnız bu oturum için */ }
  }, [lang, onLang]);

  useEffect(() => {
    document.documentElement.dataset.btTheme = dark ? "dark" : "light";
    try { localStorage.setItem("btui-docs-theme", dark ? "dark" : "light"); } catch { /* yalnız bu oturum için */ }
  }, [dark]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        search.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const page = PAGES.find((p) => p.id === route.id);
  useEffect(() => {
    document.title = page ? `${t(page.title)} · btui` : "btui";
    document.querySelector(".bt-content")?.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, lang]);

  const groups = useMemo<NavGroup[]>(() => {
    const q = lower(query.trim(), lang);
    return NAV.map((section) => ({
      label: t(section.title),
      items: section.pages
        .filter((p) => lower(t(p.title), lang).includes(q))
        .map((p) => ({ label: t(p.title), icon: <p.icon size={16} />, href: `#/${lang}/${p.id}`, active: p.id === route.id })),
    })).filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, route.id, lang]);

  const index = page ? PAGES.indexOf(page) : -1;
  const prev = PAGES[index - 1];
  const next = PAGES[index + 1];
  const isGuide = !!page && GUIDE_IDS.includes(page.id);
  const Content = route.id === "home" ? guides.get("home") : isGuide ? guides.get(route.id) : components.get(route.id);
  const switchTo = (next: Lang) => { location.hash = `#/${next}/${route.id}`; };

  return (
    <LangContext.Provider value={lang}>
      <AppShell
        storageKey="btui-docs-nav"
        sidebar={<Sidebar tone="light" logo={<a href={`#/${lang}/home`} className="d-mark" aria-label="btui">bt</a>} logoText="btui" groups={groups} />}
        topbar={
          <Topbar>
            <TopbarSearch ref={search} placeholder={t({ tr: "Bileşen ara…", en: "Search components…" })} value={query} onChange={(e) => setQuery(e.target.value)} shortcut={<Kbd>⌘K</Kbd>} />
            <TopbarSpacer />
            <ButtonGroup aria-label={t({ tr: "Dil", en: "Language" })}>
              <Button size="sm" variant={lang === "tr" ? "soft" : "default"} aria-pressed={lang === "tr"} onClick={() => switchTo("tr")}>TR</Button>
              <Button size="sm" variant={lang === "en" ? "soft" : "default"} aria-pressed={lang === "en"} onClick={() => switchTo("en")}>EN</Button>
            </ButtonGroup>
            <Tooltip content={dark ? t({ tr: "Açık tema", en: "Light theme" }) : t({ tr: "Koyu tema", en: "Dark theme" })} side="bottom">
              <IconButton label={t({ tr: "Temayı değiştir", en: "Toggle theme" })} onClick={() => setDark(!dark)}>{dark ? <IconSun size={18} /> : <IconMoon size={18} />}</IconButton>
            </Tooltip>
            <IconButton label="GitHub" render={<a href={REPO} />} nativeButton={false}><IconBrandGithub size={18} /></IconButton>
          </Topbar>
        }
      >
        <Page className="d-page">
          <div className="d-layout" data-home={route.id === "home" ? "" : undefined}>
            <article className="d-article" key={`${route.id}-${lang}`}>
              {page ? <div className="d-eyebrow">{t(page.section)}</div> : null}
              {page ? <h1 className="d-h1">{t(page.title)}</h1> : null}
              <Suspense fallback={<div className="d-loading"><Skeleton width="70%" /><Skeleton /><Skeleton height={200} /></div>}>
                {Content ? <Content /> : <p className="d-lead">{t({ tr: "Sayfa bulunamadı.", en: "Page not found." })}</p>}
              </Suspense>
              {page ? (
                <nav className="d-pager">
                  {prev ? <a href={`#/${lang}/${prev.id}`}><small>{t({ tr: "Önceki", en: "Previous" })}</small>{t(prev.title)}</a> : <span />}
                  {next ? <a href={`#/${lang}/${next.id}`} data-next=""><small>{t({ tr: "Sonraki", en: "Next" })}</small>{t(next.title)}</a> : <span />}
                </nav>
              ) : null}
            </article>
            {page ? <Toc pageKey={`${route.id}-${lang}`} /> : null}
          </div>
        </Page>
      </AppShell>
    </LangContext.Provider>
  );
}
