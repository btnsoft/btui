import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef, type MouseEvent, type MouseEventHandler, type ReactElement, type ReactNode } from "react";
import { ChevronRight, Filter, Menu as MenuIcon, Search } from "../icons";
import { useLocale } from "../locale";
import { cx, flag, storageGet, storageSet } from "../utils";
import { IconButton } from "./button";

type ShellState = { toggle: () => void; closeNav: () => void; navOpen: boolean };
const ShellContext = createContext<ShellState | null>(null);
const MOBILE = "(max-width: 800px)";

export type AppShellProps = {
  sidebar: ReactNode;
  topbar?: ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** localStorage key that remembers the collapsed sidebar. */
  storageKey?: string;
  className?: string;
  children: ReactNode;
};

export function AppShell({ sidebar, topbar, collapsed, defaultCollapsed = false, onCollapsedChange, storageKey, className, children }: AppShellProps) {
  const t = useLocale();
  const [own, setOwn] = useState(defaultCollapsed);
  const [navOpen, setNavOpen] = useState(false);
  const isCollapsed = collapsed ?? own;

  // Read after mount so server and client render the same first frame.
  useEffect(() => {
    const saved = storageGet(storageKey);
    if (saved !== null) setOwn(saved === "1");
  }, [storageKey]);

  const toggle = useCallback(() => {
    if (window.matchMedia(MOBILE).matches) {
      setNavOpen((open) => !open);
      return;
    }
    const next = !isCollapsed;
    setOwn(next);
    storageSet(storageKey, next ? "1" : "0");
    onCollapsedChange?.(next);
  }, [isCollapsed, onCollapsedChange, storageKey]);

  const closeNav = useCallback(() => setNavOpen(false), []);

  // On a phone the menu acts as a dialog: focus goes in, and comes back when it closes.
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (navOpen) {
      opener.current = document.activeElement as HTMLElement;
      root.current?.querySelector<HTMLElement>(".bt-side a, .bt-side button")?.focus();
    } else if (opener.current) {
      opener.current.focus();
      opener.current = null;
    }
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setNavOpen(false); };
    // Growing past phone width leaves the drawer behind, so nothing may stay inert.
    const wide = window.matchMedia(MOBILE);
    const onWide = () => { if (!wide.matches) setNavOpen(false); };
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => { window.removeEventListener("keydown", onKey); wide.removeEventListener("change", onWide); };
  }, [navOpen]);

  const state = useMemo(() => ({ toggle, closeNav, navOpen }), [toggle, closeNav, navOpen]);

  return (
    <ShellContext.Provider value={state}>
      <div ref={root} className={cx("bt-root bt-app", className)} data-collapsed={flag(isCollapsed)} data-nav-open={flag(navOpen)}>
        {sidebar}
        <button type="button" className="bt-scrim-nav" aria-label={t.close} onClick={closeNav} />
        <div className="bt-main" inert={navOpen || undefined}>
          {topbar}
          <main className="bt-content">{children}</main>
        </div>
      </div>
    </ShellContext.Provider>
  );
}

export type NavItem = {
  label: string;
  icon?: ReactNode;
  href?: string;
  active?: boolean;
  count?: number;
  onClick?: MouseEventHandler;
};

export type NavGroup = { label?: string; items: NavItem[] };

export type SidebarProps = {
  logo?: ReactNode;
  logoText?: ReactNode;
  groups: NavGroup[];
  /** `light` for apps that prefer a white rail. */
  tone?: "dark" | "light";
  /** Plug in your router's link. Receives the anchor props to spread. */
  renderLink?: (props: ComponentPropsWithoutRef<"a"> & { "data-active"?: string }, item: NavItem) => ReactElement;
  /** Names the navigation landmark. */
  "aria-label"?: string;
  className?: string;
};

export function Sidebar({ logo, logoText, groups, tone = "dark", renderLink, "aria-label": ariaLabel, className }: SidebarProps) {
  const shell = useContext(ShellContext);
  return (
    <aside className={cx("bt-side", className)} data-tone={tone}>
      {logo || logoText ? (
        <div className="bt-logo">
          {logo}
          {logoText ? <span className="bt-logo-text">{logoText}</span> : null}
        </div>
      ) : null}
      <nav aria-label={ariaLabel}>
        {groups.map((group, i) => (
          <div key={group.label ?? i}>
            {group.label ? <div className="bt-nav-group">{group.label}</div> : null}
            {group.items.map((item) => {
              const props = {
                href: item.href,
                className: "bt-nav-item",
                title: item.label,
                "data-active": flag(item.active),
                "aria-current": item.active ? ("page" as const) : undefined,
                onClick: (e: MouseEvent<HTMLAnchorElement>) => { item.onClick?.(e); shell?.closeNav(); },
                children: (
                  <>
                    {item.icon}
                    <span className="bt-nav-label">{item.label}</span>
                    {item.count ? <span className="bt-nav-count">{item.count}</span> : null}
                  </>
                ),
              };
              if (!item.href && !renderLink) {
                const { href: _href, ...button } = props;
                return <button key={item.label} type="button" {...(button as unknown as ComponentPropsWithoutRef<"button">)} />;
              }
              return <span key={item.label}>{renderLink ? renderLink(props, item) : <a {...props} />}</span>;
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function Topbar({ className, children, ...rest }: ComponentPropsWithoutRef<"header">) {
  const t = useLocale();
  const shell = useContext(ShellContext);
  return (
    <header className={cx("bt-top", className)} {...rest}>
      {shell ? <IconButton label={t.menu} aria-expanded={shell.navOpen} onClick={shell.toggle}><MenuIcon size={18} /></IconButton> : null}
      {children}
    </header>
  );
}

export const TopbarSpacer = () => <div className="bt-top-space" />;
export const TopbarSeparator = () => <div className="bt-top-sep" />;

export type TopbarSearchProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & { shortcut?: ReactNode };

export const TopbarSearch = forwardRef<HTMLInputElement, TopbarSearchProps>(function TopbarSearch({ shortcut, placeholder, ...rest }, ref) {
  const t = useLocale();
  return (
    <label className="bt-top-search">
      <Search size={14} />
      <input ref={ref} type="search" placeholder={placeholder ?? t.search} aria-label={placeholder ?? t.search} {...rest} />
      {shortcut}
    </label>
  );
});

export type Crumb = { label: ReactNode; href?: string };

export type BreadcrumbProps = {
  items: Crumb[];
  /** Plug in your router's link. */
  renderLink?: (props: ComponentPropsWithoutRef<"a">, item: Crumb) => ReactElement;
};

export function Breadcrumb({ items, renderLink }: BreadcrumbProps) {
  const t = useLocale();
  return (
    <nav aria-label={t.breadcrumb}>
      <ol className="bt-crumbs">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i}>
              {i > 0 ? <ChevronRight size={12} /> : null}
              {item.href && !last ? (renderLink ? renderLink({ href: item.href, children: item.label }, item) : <a href={item.href}>{item.label}</a>) : <span aria-current={last ? "page" : undefined}>{item.label}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Page({ className, ...rest }: ComponentPropsWithoutRef<"div">) {
  return <div className={cx("bt-page-wrap", className)} {...rest} />;
}

export type PageHeaderProps = { title: ReactNode; breadcrumb?: Crumb[]; actions?: ReactNode };

export function PageHeader({ title, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="bt-page-head">
      <div className="bt-page-head-text">
        {breadcrumb ? <Breadcrumb items={breadcrumb} /> : null}
        <h1 className="bt-page-title">{title}</h1>
      </div>
      {actions}
    </div>
  );
}

export type FilterBarProps = {
  children: ReactNode;
  /** Filters folded under "More filters". */
  more?: ReactNode;
  moreOpen?: boolean;
  onMoreOpenChange?: (open: boolean) => void;
  /** Names the filter area for assistive technology. */
  "aria-label"?: string;
  /** Shows the "Clear filters" action. */
  onClear?: () => void;
  className?: string;
};

export function FilterBar({ children, more, moreOpen, onMoreOpenChange, onClear, "aria-label": ariaLabel, className }: FilterBarProps) {
  const t = useLocale();
  return (
    <div className={cx("bt-filter", className)} role={ariaLabel ? "search" : undefined} aria-label={ariaLabel}>
      <div className="bt-filter-row">{children}</div>
      {more ? (
        <details className="bt-filter-more" open={moreOpen} onToggle={(e) => onMoreOpenChange?.(e.currentTarget.open)}>
          <summary><Filter size={14} />{t.moreFilters}</summary>
          <div className="bt-filter-row">{more}</div>
        </details>
      ) : null}
      {onClear ? (
        <div>
          <button type="button" className="bt-filter-clear" onClick={onClear}>{t.clearFilters}</button>
        </div>
      ) : null}
    </div>
  );
}
