import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { Popover } from "@base-ui/react/popover";
import { ChevronLeft, ChevronRight, Columns, Filter } from "../icons";
import { useLocale } from "../locale";
import { cx, flag, storageGet, storageSet } from "../utils";
import { Button } from "./button";
import { Checkbox } from "./form";
import { Loading } from "./display";

/** Page numbers to show: first, last, and a window around the current page. */
export function pageRange(page: number, pageCount: number, siblings = 1): Array<number | "gap"> {
  const pages: Array<number | "gap"> = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= siblings) pages.push(p);
    else if (pages[pages.length - 1] !== "gap") pages.push("gap");
  }
  return pages;
}

export type PaginationProps = { page: number; pageCount: number; onChange: (page: number) => void };

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  const t = useLocale();
  return (
    <div className="bt-pages">
      <button type="button" className="bt-page" aria-label={t.previous} disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={14} /></button>
      {pageRange(page, pageCount).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="bt-page-gap">…</span>
        ) : (
          <button key={p} type="button" className="bt-page" data-active={flag(p === page)} aria-current={p === page ? "page" : undefined} onClick={() => onChange(p)}>{p}</button>
        ),
      )}
      <button type="button" className="bt-page" aria-label={t.next} disabled={page >= pageCount} onClick={() => onChange(page + 1)}><ChevronRight size={14} /></button>
    </div>
  );
}

export type SortState = { key: string; direction: "asc" | "desc" };

export type Column<T> = {
  key: string;
  header: ReactNode;
  /** Cell content. Defaults to the row's field named `key`. */
  cell?: (row: T) => ReactNode;
  /** Value used for sorting. Defaults to the row's field named `key`. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: number | string;
  /** Hidden until the user turns it on from the column menu. */
  hidden?: boolean;
  /** false keeps the column out of the column menu. */
  hideable?: boolean;
  footer?: ReactNode;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  title?: ReactNode;
  titleNote?: ReactNode;
  icon?: ReactNode;
  /** Chips in the band, beside the title. */
  chips?: ReactNode;
  actions?: ReactNode;
  /** Column and density menus. On by default when the table has a band. */
  controls?: boolean;
  /** localStorage key that remembers hidden columns and density. */
  storageKey?: string;
  pageSize?: number;
  /** Server mode: `rows` is the current page. Sorting is reported by `onSortChange`, not applied. */
  server?: { total: number; page: number; onPageChange: (page: number) => void };
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  loading?: boolean;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  selectedKey?: string | number | null;
  renderDetail?: (row: T) => ReactNode;
  rowClassName?: (row: T) => string | undefined;
  /** Extra content on the left of the footer, such as totals. */
  footerNote?: ReactNode;
  maxHeight?: number | string;
  className?: string;
};

type Saved = { hidden?: string[]; compact?: boolean };

function field<T>(row: T, key: string) {
  return (row as Record<string, unknown>)[key];
}

export function sortRows<T>(rows: T[], column: Column<T> | undefined, direction: "asc" | "desc", lang: string) {
  if (!column) return rows;
  const collator = new Intl.Collator(lang, { numeric: true, sensitivity: "base" });
  const read = (row: T) => (column.sortValue ? column.sortValue(row) : (field(row, column.key) as string | number | null | undefined));
  const factor = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = read(a);
    const y = read(b);
    // Blank values stay at the bottom in both directions.
    const xBlank = x === null || x === undefined || x === "";
    const yBlank = y === null || y === undefined || y === "";
    if (xBlank || yBlank) return xBlank === yBlank ? 0 : xBlank ? 1 : -1;
    if (typeof x === "number" && typeof y === "number") return (x - y) * factor;
    if (x instanceof Date && y instanceof Date) return (x.getTime() - y.getTime()) * factor;
    return collator.compare(String(x), String(y)) * factor;
  });
}

export function DataTable<T>({
  columns, rows, getRowKey, title, titleNote, icon, chips, actions, controls, storageKey, pageSize, server, sort, defaultSort = null, onSortChange,
  loading, empty, onRowClick, selectedKey, renderDetail, rowClassName, footerNote, maxHeight, className,
}: DataTableProps<T>) {
  const t = useLocale();
  const initialHidden = useMemo(() => columns.filter((c) => c.hidden).map((c) => c.key), [columns]);
  const [hidden, setHidden] = useState<string[]>(initialHidden);
  const [compact, setCompact] = useState(false);
  const [ownSort, setOwnSort] = useState<SortState | null>(defaultSort);
  const [ownPage, setOwnPage] = useState(1);
  const [open, setOpen] = useState<Set<string | number>>(() => new Set());
  const activeSort = sort !== undefined ? sort : ownSort;

  // Read after mount so server and client render the same first frame.
  useEffect(() => {
    const raw = storageGet(storageKey);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as Saved;
      if (Array.isArray(saved.hidden)) setHidden(saved.hidden);
      if (typeof saved.compact === "boolean") setCompact(saved.compact);
    } catch {
      storageSet(storageKey, null);
    }
  }, [storageKey]);

  function save(next: Saved) {
    storageSet(storageKey, JSON.stringify({ hidden, compact, ...next }));
  }

  const visible = columns.filter((c) => !hidden.includes(c.key));
  const sorted = useMemo(
    () => (server || !activeSort ? rows : sortRows(rows, columns.find((c) => c.key === activeSort.key), activeSort.direction, t.lang)),
    [rows, columns, activeSort, server, t.lang],
  );

  const size = pageSize ?? (server ? rows.length : 0);
  const total = server ? server.total : rows.length;
  const pageCount = size > 0 ? Math.max(1, Math.ceil(total / size)) : 1;
  const page = Math.min(server ? server.page : ownPage, pageCount);
  const shown = !server && size > 0 ? sorted.slice((page - 1) * size, page * size) : sorted;
  const from = total === 0 ? 0 : size > 0 ? (page - 1) * size + 1 : 1;
  const to = size > 0 ? Math.min(page * size, total) : total;

  function goTo(next: number) {
    if (server) server.onPageChange(next);
    else setOwnPage(next);
  }

  function toggleSort(key: string) {
    const next: SortState | null =
      activeSort?.key !== key ? { key, direction: "asc" } : activeSort.direction === "asc" ? { key, direction: "desc" } : null;
    setOwnSort(next);
    onSortChange?.(next);
    if (!server) setOwnPage(1);
  }

  function toggleColumn(key: string, show: boolean) {
    const next = show ? hidden.filter((k) => k !== key) : [...hidden, key];
    setHidden(next);
    save({ hidden: next });
  }

  function toggleDensity() {
    setCompact(!compact);
    save({ compact: !compact });
  }

  function toggleDetail(key: string | number) {
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  }

  const hasBand = !!(title || chips || actions);
  const showControls = controls ?? hasBand;
  const hideable = columns.filter((c) => c.hideable !== false);
  const hasFooter = visible.some((c) => c.footer !== undefined);
  const span = visible.length + (renderDetail ? 1 : 0);

  return (
    <section className={cx("bt-table-card", className)} data-density={compact ? "compact" : "comfortable"}>
      {hasBand || showControls ? (
        <div className="bt-band">
          {title ? (
            <span className="bt-band-title">
              {icon}
              <b>{title}</b>
              {titleNote !== undefined ? <small>({titleNote})</small> : null}
            </span>
          ) : null}
          {chips}
          <span className="bt-band-space" />
          {showControls ? (
            <>
              <Popover.Root>
                <Popover.Trigger render={<Button variant="ghost" icon={<Columns size={14} />}>{t.columns}</Button>} />
                <Popover.Portal>
                  <Popover.Positioner className="bt-positioner" sideOffset={6} align="end">
                    <Popover.Popup className="bt-popup bt-columns">
                      <div className="bt-columns-head">
                        <b>{t.columns}</b>
                        <small>{hideable.filter((c) => !hidden.includes(c.key)).length} / {hideable.length}</small>
                      </div>
                      <div className="bt-columns-list">
                        {hideable.map((c) => {
                          const isOn = !hidden.includes(c.key);
                          const last = isOn && visible.length === 1;
                          return <Checkbox key={c.key} checked={isOn} disabled={last} onChange={(on) => toggleColumn(c.key, on)} label={c.header} />;
                        })}
                      </div>
                      <div className="bt-columns-foot">
                        <Button fullWidth onClick={() => { setHidden(initialHidden); save({ hidden: initialHidden }); }}>{t.resetColumns}</Button>
                      </div>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
              <Button variant="ghost" icon={<Filter size={14} />} title={t.density} aria-pressed={compact} onClick={toggleDensity}>
                {compact ? t.compact : t.comfortable}
              </Button>
            </>
          ) : null}
          {actions}
        </div>
      ) : null}
      <div className="bt-table-scroll" style={maxHeight !== undefined ? { maxHeight } : undefined}>
        <table className={cx("bt-table", loading && rows.length > 0 && "bt-table-loading")} aria-busy={loading || undefined}>
          <thead>
            <tr>
              {renderDetail ? <th style={{ width: 38 }}><span className="bt-sr">{t.showDetail}</span></th> : null}
              {visible.map((c) => {
                const canSort = c.sortable !== false && (!server || !!onSortChange);
                const dir = activeSort?.key === c.key ? activeSort.direction : null;
                return (
                  <th key={c.key} data-align={c.align} style={c.width !== undefined ? { width: c.width } : undefined} aria-sort={dir ? (dir === "asc" ? "ascending" : "descending") : undefined}>
                    {canSort ? (
                      <button type="button" className="bt-sort" onClick={() => toggleSort(c.key)}>
                        {c.header}
                        <span className="bt-sort-mark" aria-hidden="true">{dir === "asc" ? "▲" : dir === "desc" ? "▼" : "↕"}</span>
                      </button>
                    ) : c.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={span}>{loading ? <Loading /> : <div className="bt-empty">{empty ?? t.empty}</div>}</td>
              </tr>
            ) : (
              shown.map((row) => {
                const key = getRowKey(row);
                const expanded = open.has(key);
                return (
                  <Fragment key={key}>
                    <tr
                      data-row=""
                      data-clickable={flag(onRowClick)}
                      data-selected={flag(selectedKey !== undefined && selectedKey === key)}
                      className={rowClassName?.(row)}
                      tabIndex={onRowClick ? 0 : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      onKeyDown={onRowClick ? (e) => { if (e.key === "Enter" && e.target === e.currentTarget) onRowClick(row); } : undefined}
                    >
                      {renderDetail ? (
                        <td>
                          <button type="button" className="bt-detail-toggle" aria-label={t.showDetail} aria-expanded={expanded} onClick={(e) => { e.stopPropagation(); toggleDetail(key); }}>
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      ) : null}
                      {visible.map((c) => (
                        <td key={c.key} data-align={c.align}>{c.cell ? c.cell(row) : (field(row, c.key) as ReactNode)}</td>
                      ))}
                    </tr>
                    {renderDetail && expanded ? (
                      <tr><td className="bt-detail" colSpan={span}>{renderDetail(row)}</td></tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
          {hasFooter ? (
            <tfoot>
              <tr>
                {renderDetail ? <td /> : null}
                {visible.map((c) => <td key={c.key} data-align={c.align}>{c.footer}</td>)}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      {size > 0 || footerNote ? (
        <div className="bt-table-foot">
          <span>{footerNote ?? (size > 0 ? t.records(from, to, total) : null)}</span>
          {size > 0 && pageCount > 1 ? <Pagination page={page} pageCount={pageCount} onChange={goTo} /> : null}
        </div>
      ) : null}
    </section>
  );
}
