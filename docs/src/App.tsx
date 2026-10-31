import { useEffect, useMemo, useState } from "react";
import { IconBrandGithub, IconMoon, IconSun } from "@tabler/icons-react";
import { AppShell, Button, IconButton, Page, PageHeader, Sidebar, Topbar, TopbarSearch, TopbarSpacer, Tooltip, type NavGroup } from "btui";
import { GROUPS, PAGES } from "./pages";

const REPO = "https://github.com/btnsoft/btui";
const currentId = () => decodeURIComponent(location.hash.replace(/^#\/?/, "")) || "baslangic";
const lower = (s: string) => s.toLocaleLowerCase("tr");

export function App() {
  const [id, setId] = useState(currentId);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("btui-docs-theme") === "dark"; } catch { return false; }
  });

  useEffect(() => {
    const onHash = () => setId(currentId());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.btTheme = dark ? "dark" : "light";
    try { localStorage.setItem("btui-docs-theme", dark ? "dark" : "light"); } catch { /* yalnız bu oturum için */ }
  }, [dark]);

  const page = PAGES.find((p) => p.id === id) ?? PAGES[0];
  useEffect(() => { document.title = `${page.title} · btui`; document.querySelector(".bt-content")?.scrollTo(0, 0); }, [page]);

  const groups = useMemo<NavGroup[]>(() => {
    const q = lower(query.trim());
    return GROUPS.map((label) => ({
      label,
      items: PAGES.filter((p) => p.group === label && lower(p.title).includes(q)).map((p) => ({
        label: p.title,
        icon: <p.icon size={18} />,
        href: `#/${p.id}`,
        active: p.id === page.id,
      })),
    })).filter((g) => g.items.length > 0);
  }, [query, page.id]);

  const index = PAGES.indexOf(page);
  const prev = PAGES[index - 1];
  const next = PAGES[index + 1];

  return (
    <AppShell
      storageKey="btui-docs-nav"
      sidebar={<Sidebar logo={<span className="doc-mark">bt</span>} logoText="btui" groups={groups} />}
      topbar={
        <Topbar>
          <TopbarSearch placeholder="Bileşen ara…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <TopbarSpacer />
          <Tooltip content={dark ? "Açık tema" : "Koyu tema"} side="bottom">
            <IconButton label="Temayı değiştir" onClick={() => setDark(!dark)}>{dark ? <IconSun size={18} /> : <IconMoon size={18} />}</IconButton>
          </Tooltip>
          <Button render={<a href={REPO} />} nativeButton={false} icon={<IconBrandGithub size={15} />}>GitHub</Button>
        </Topbar>
      }
    >
      <Page>
        {page.id !== "baslangic" ? <PageHeader title={page.title} breadcrumb={[{ label: "btui", href: "#/baslangic" }, { label: page.group }, { label: page.title }]} /> : null}
        <div className="doc" key={page.id}>
          <page.Body />
          <div className="doc-pager">
            {prev ? <Button render={<a href={`#/${prev.id}`} />} nativeButton={false}>← {prev.title}</Button> : <span />}
            {next ? <Button render={<a href={`#/${next.id}`} />} nativeButton={false}>{next.title} →</Button> : <span />}
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
