import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "../../icons";
import { useLocale } from "../../locale";
import { flag, includesText } from "../../utils";
import { DateRangePicker } from "../date";
import { Checkbox, Input, NumberInput, SearchInput } from "../form";
import { Select } from "../select";
import { isFilterActive, textOf, type Column, type ColumnFilter, type NumberFilter, type TextFilter } from "./engine";

/**
 * Page numbers to show. The list keeps one length while the page changes, so the
 * buttons stay where they are: 1 2 3 4 5 … 12, then 1 … 5 6 7 … 12, then 1 … 8 9 10 11 12.
 */
export function pageRange(page: number, pageCount: number, siblings = 1): Array<number | "gap"> {
  const slots = siblings * 2 + 5;
  if (pageCount <= slots) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const edge = slots - 2;
  if (page <= edge - siblings) return [...Array.from({ length: edge }, (_, i) => i + 1), "gap", pageCount];
  if (page >= pageCount - edge + 1 + siblings) return [1, "gap", ...Array.from({ length: edge }, (_, i) => pageCount - edge + 1 + i)];
  return [1, "gap", ...Array.from({ length: siblings * 2 + 1 }, (_, i) => page - siblings + i), "gap", pageCount];
}

export type PaginationProps = { page: number; pageCount: number; onChange: (page: number) => void; siblings?: number; className?: string };

export function Pagination({ page, pageCount, onChange, siblings, className }: PaginationProps) {
  const t = useLocale();
  // aria-disabled rather than disabled: a disabled button would drop keyboard focus on the last page.
  const step = (to: number, off: boolean) => ({ "aria-disabled": off || undefined, "data-off": flag(off), onClick: () => { if (!off) onChange(to); } });
  return (
    <nav className={className ? `bt-pages ${className}` : "bt-pages"} aria-label={t.pagination}>
      <button type="button" className="bt-page" aria-label={t.previous} {...step(page - 1, page <= 1)}><ChevronLeft size={14} /></button>
      {pageRange(page, pageCount, siblings).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="bt-page-gap">…</span>
        ) : (
          <button key={i} type="button" className="bt-page" data-active={flag(p === page)} aria-current={p === page ? "page" : undefined} onClick={() => onChange(p)}>{p}</button>
        ),
      )}
      <button type="button" className="bt-page" aria-label={t.next} {...step(page + 1, page >= pageCount)}><ChevronRight size={14} /></button>
    </nav>
  );
}

export function filterKind<T>(column: Column<T>) {
  if (column.filter === false) return null;
  if (column.filter) return column.filter;
  if (column.options || column.type === "boolean") return "set";
  return column.type === "number" || column.type === "date" ? column.type : "text";
}

type PanelProps<T> = { column: Column<T>; rows: T[]; filter: ColumnFilter | undefined; onChange: (filter: ColumnFilter | undefined) => void };

const MAX_SET_VALUES = 500;

function SetPanel<T>({ column, rows, filter, onChange }: PanelProps<T>) {
  const t = useLocale();
  const [query, setQuery] = useState("");
  const counts = useMemo(() => {
    const seen = new Map<string, number>();
    if (column.filterOptions) column.filterOptions.forEach((value) => seen.set(value, 0));
    for (const row of rows) {
      const value = textOf(column, row);
      if (!column.filterOptions && seen.size >= MAX_SET_VALUES && !seen.has(value)) continue;
      seen.set(value, (seen.get(value) ?? 0) + 1);
    }
    return seen;
  }, [column, rows]);
  const all = useMemo(() => Array.from(counts.keys()).sort(new Intl.Collator(t.lang, { numeric: true }).compare), [counts, t.lang]);
  const shown = all.filter((value) => includesText(value, query, t.lang));
  const chosen = filter?.type === "set" ? filter.values : null;
  const set = (values: string[]) => onChange(values.length === all.length ? undefined : { type: "set", values });
  const on = (value: string) => !chosen || chosen.includes(value);
  return (
    <div className="bt-set">
      <SearchInput block value={query} onChange={(e) => setQuery(e.target.value)} />
      <Checkbox label={t.grid.selectAllValues} checked={!chosen} indeterminate={!!chosen && chosen.length > 0} onChange={(next) => set(next ? all : [])} />
      <div className="bt-set-list">
        {shown.map((value) => (
          <Checkbox
            key={value}
            checked={on(value)}
            onChange={(next) => set(next ? [...(chosen ?? []), value] : (chosen ?? all).filter((v) => v !== value))}
            label={<>{value === "" ? t.grid.blank : value}{counts.get(value) ? <small className="bt-set-count">{counts.get(value)}</small> : null}</>}
          />
        ))}
      </div>
    </div>
  );
}

function NumberPanel<T>({ filter, onChange }: PanelProps<T>) {
  const { grid: g } = useLocale();
  // The chosen condition lives here: with no value yet there is no filter to hold it.
  const [draft, setDraft] = useState<NumberFilter>(filter?.type === "number" ? filter : { type: "number", op: "=", value: null });
  const change = (next: Partial<NumberFilter>) => {
    const merged = { ...draft, ...next };
    setDraft(merged);
    onChange(isFilterActive(merged) ? merged : undefined);
  };
  const noValue = draft.op === "empty" || draft.op === "notEmpty";
  return (
    <div className="bt-filter-fields">
      <Select block value={draft.op} onChange={(op) => change({ op: op as NumberFilter["op"] })} aria-label={g.condition} options={(["=", "!=", ">", ">=", "<", "<=", "between", "empty", "notEmpty"] as const).map((op) => ({ value: op, label: g.ops[op] }))} />
      {noValue ? null : <NumberInput hideSteppers aria-label={g.value} value={draft.value ?? null} onChange={(next) => change({ value: next })} />}
      {draft.op === "between" ? <NumberInput hideSteppers aria-label={g.valueTo} value={draft.to ?? null} onChange={(next) => change({ to: next })} /> : null}
    </div>
  );
}

function TextPanel<T>({ filter, onChange }: PanelProps<T>) {
  const { grid: g } = useLocale();
  const [draft, setDraft] = useState<TextFilter>(filter?.type === "text" ? filter : { type: "text", op: "contains", value: "" });
  const change = (next: Partial<TextFilter>) => {
    const merged = { ...draft, ...next };
    setDraft(merged);
    onChange(isFilterActive(merged) ? merged : undefined);
  };
  const noValue = draft.op === "empty" || draft.op === "notEmpty";
  return (
    <div className="bt-filter-fields">
      <Select block value={draft.op} onChange={(op) => change({ op: op as TextFilter["op"] })} aria-label={g.condition} options={(["contains", "notContains", "equals", "startsWith", "empty", "notEmpty"] as const).map((op) => ({ value: op, label: g.ops[op] }))} />
      {noValue ? null : <Input aria-label={g.value} value={draft.value ?? ""} onChange={(e) => change({ value: e.target.value })} />}
    </div>
  );
}

export function FilterPanel<T>(props: PanelProps<T>) {
  const { column, filter, onChange } = props;
  const kind = filterKind(column);
  if (kind === "set") return <SetPanel {...props} />;
  if (kind === "date") {
    const value = filter?.type === "date" ? filter : { start: null, end: null };
    return <DateRangePicker block presets={false} value={{ start: value.start ?? null, end: value.end ?? null }} onChange={(next) => onChange(next.start || next.end ? { type: "date", ...next } : undefined)} aria-label={String(column.header)} />;
  }
  return kind === "number" ? <NumberPanel {...props} /> : <TextPanel {...props} />;
}
