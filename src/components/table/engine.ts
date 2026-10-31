import type { ReactNode } from "react";
import { includesText } from "../../utils";

export type ColumnType = "text" | "number" | "date" | "boolean";
export type Aggregate = "sum" | "avg" | "min" | "max" | "count" | ((values: unknown[]) => unknown);
export type SortState = { key: string; direction: "asc" | "desc" };

export type TextFilter = { type: "text"; op: "contains" | "notContains" | "equals" | "startsWith" | "empty" | "notEmpty"; value?: string };
export type NumberFilter = { type: "number"; op: "=" | "!=" | ">" | ">=" | "<" | "<=" | "between" | "empty" | "notEmpty"; value?: number | null; to?: number | null };
export type DateFilter = { type: "date"; start?: string | null; end?: string | null };
export type SetFilter = { type: "set"; values: string[] };
export type ColumnFilter = TextFilter | NumberFilter | DateFilter | SetFilter;
export type Filters = Record<string, ColumnFilter>;

export type CellChange<T> = { row: T; key: string; value: unknown; previous: unknown };

export type Column<T> = {
  key: string;
  header: ReactNode;
  /** Cell content. Defaults to the value. */
  cell?: (row: T) => ReactNode;
  /** Small mark before the cell content, such as an avatar. */
  icon?: (row: T) => ReactNode;
  /** The raw value behind the cell, used by sorting, filters, totals and exports. Defaults to the field named `key`. */
  value?: (row: T) => unknown;
  /** Value used for sorting when it differs from `value`. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  /** Drives the filter panel, the export format and paste parsing. */
  type?: ColumnType;
  /** Plain text for copying and exports. Defaults to the value. */
  format?: (value: unknown, row: T) => string;
  /** For numbers stored in a smaller unit, such as 100 for kuruş: people then filter, paste, sum and export in lira. */
  scale?: number;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: number | string;
  minWidth?: number;
  /** Hidden until the user turns it on from the column menu. */
  hidden?: boolean;
  /** false keeps the column out of the column menu. */
  hideable?: boolean;
  footer?: ReactNode;
  /** Starts pinned to an edge. */
  pin?: "left" | "right";
  /** Filter kind in the column menu. `false` turns it off. Defaults to the column type. */
  filter?: "text" | "number" | "date" | "set" | false;
  /** Values for a `set` filter when the rows on hand are not all of them, as in server mode. */
  filterOptions?: string[];
  /** Summary shown on group rows and, with `totals`, in the footer. */
  aggregate?: Aggregate;
  /** false keeps the column out of grouping. */
  groupable?: boolean;
  /** Turns on in-place editing for this column. */
  editable?: boolean | ((row: T) => boolean);
  /** Choices for a dropdown editor. */
  options?: Array<{ value: string; label: string }>;
  /** Returns a message to reject the new value. */
  validate?: (value: unknown, row: T) => string | undefined | null;
};

export function readValue<T>(column: Column<T>, row: T) {
  return column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
}

export function isBlank(value: unknown) {
  return value === null || value === undefined || value === "";
}

export function textOf<T>(column: Column<T>, row: T) {
  const value = readValue(column, row);
  if (column.format) return column.format(value, row);
  if (isBlank(value)) return "";
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
}

function sortKey<T>(column: Column<T>, row: T) {
  return column.sortValue ? column.sortValue(row) : (readValue(column, row) as string | number | Date | null | undefined);
}

/** Sorts by several columns in order. Blank values stay last in either direction. */
export function sortByMany<T>(rows: T[], sorts: SortState[], columns: Column<T>[], lang: string) {
  const active = sorts.flatMap((sort) => {
    const column = columns.find((c) => c.key === sort.key);
    return column ? [{ column, factor: sort.direction === "asc" ? 1 : -1 }] : [];
  });
  if (active.length === 0) return rows;
  const collator = new Intl.Collator(lang, { numeric: true, sensitivity: "base" });
  // Reading each key once keeps a sort over 100k rows cheap with costly accessors.
  const keyed = rows.map((row) => ({ row, keys: active.map((a) => sortKey(a.column, row)) }));
  keyed.sort((a, b) => {
    for (let i = 0; i < active.length; i++) {
      const x = a.keys[i];
      const y = b.keys[i];
      const xBlank = isBlank(x);
      const yBlank = isBlank(y);
      if (xBlank || yBlank) {
        if (xBlank !== yBlank) return xBlank ? 1 : -1;
        continue;
      }
      let order: number;
      if (typeof x === "number" && typeof y === "number") order = x - y;
      else if (x instanceof Date && y instanceof Date) order = x.getTime() - y.getTime();
      else order = collator.compare(String(x), String(y));
      if (order !== 0) return order * active[i].factor;
    }
    return 0;
  });
  return keyed.map((item) => item.row);
}

export function sortRows<T>(rows: T[], column: Column<T> | undefined, direction: "asc" | "desc", lang: string) {
  return column ? sortByMany(rows, [{ key: column.key, direction }], [column], lang) : rows;
}

function matches(value: unknown, filter: ColumnFilter, text: string, lang: string, scale = 1) {
  switch (filter.type) {
    case "set":
      return filter.values.includes(text);
    case "date": {
      const day = value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "").slice(0, 10);
      if (!day) return false;
      return (!filter.start || day >= filter.start) && (!filter.end || day <= filter.end);
    }
    case "number": {
      if (filter.op === "empty") return isBlank(value);
      if (filter.op === "notEmpty") return !isBlank(value);
      if (isBlank(value)) return false;
      const n = Number(value) / scale;
      const v = filter.value ?? 0;
      switch (filter.op) {
        case "=": return n === v;
        case "!=": return n !== v;
        case ">": return n > v;
        case ">=": return n >= v;
        case "<": return n < v;
        case "<=": return n <= v;
        case "between": return n >= v && n <= (filter.to ?? v);
      }
      return true;
    }
    case "text": {
      if (filter.op === "empty") return text === "";
      if (filter.op === "notEmpty") return text !== "";
      const q = (filter.value ?? "").toLocaleLowerCase(lang);
      const t = text.toLocaleLowerCase(lang);
      if (filter.op === "equals") return t === q;
      if (filter.op === "startsWith") return t.startsWith(q);
      if (filter.op === "notContains") return !t.includes(q);
      return t.includes(q);
    }
  }
}

export function isFilterActive(filter: ColumnFilter | undefined) {
  if (!filter) return false;
  if (filter.type === "set") return true;
  if (filter.type === "date") return !!(filter.start || filter.end);
  if (filter.op === "empty" || filter.op === "notEmpty") return true;
  return filter.type === "number" ? filter.value !== null && filter.value !== undefined : !!filter.value;
}

export function filterRows<T>(rows: T[], columns: Column<T>[], filters: Filters, search: string, lang: string) {
  const active = columns.filter((c) => isFilterActive(filters[c.key]));
  const query = search.trim();
  if (active.length === 0 && !query) return rows;
  return rows.filter((row) => {
    for (const column of active) {
      const filter = filters[column.key];
      // Text is only needed by these two, and formatting it for every row is what slows a large filter.
      const text = filter.type === "text" || filter.type === "set" ? textOf(column, row) : "";
      if (!matches(readValue(column, row), filter, text, lang, column.scale)) return false;
    }
    return !query || columns.some((column) => !column.hidden && includesText(textOf(column, row), query, lang));
  });
}

export function aggregate(kind: Aggregate, values: unknown[]) {
  if (typeof kind === "function") return kind(values);
  if (kind === "count") return values.filter((v) => !isBlank(v)).length;
  const numbers = values.filter((v) => !isBlank(v)).map(Number).filter((n) => !Number.isNaN(n));
  if (numbers.length === 0) return null;
  if (kind === "min") return numbers.reduce((a, b) => (b < a ? b : a));
  if (kind === "max") return numbers.reduce((a, b) => (b > a ? b : a));
  const sum = numbers.reduce((a, b) => a + b, 0);
  return kind === "sum" ? sum : sum / numbers.length;
}

export function aggregateColumn<T>(column: Column<T>, rows: T[]) {
  return column.aggregate ? aggregate(column.aggregate, rows.map((row) => readValue(column, row))) : undefined;
}

export type GroupNode<T> = { key: string; level: number; value: string; column: Column<T>; rows: T[]; children: GroupNode<T>[] | null };

/** Builds the tree of nested groups, keeping the order the rows arrived in. */
export function groupRows<T>(rows: T[], groupBy: Column<T>[], level = 0, parent = ""): GroupNode<T>[] {
  const column = groupBy[level];
  const buckets = new Map<string, T[]>();
  for (const row of rows) {
    const value = textOf(column, row);
    const bucket = buckets.get(value);
    if (bucket) bucket.push(row);
    else buckets.set(value, [row]);
  }
  return Array.from(buckets, ([value, members]) => {
    const key = `${parent}/${value}`;
    return { key, level, value, column, rows: members, children: level + 1 < groupBy.length ? groupRows(members, groupBy, level + 1, key) : null };
  });
}

export type PivotConfig<T> = {
  /** Fields that form the rows. */
  rows: Array<Column<T>>;
  /** Field whose values become columns. */
  columns: Column<T>;
  /** Number being summarised. */
  value: Column<T>;
  aggregate: Exclude<Aggregate, ((values: unknown[]) => unknown)>;
  /** Header for a value of the across field, when its sort key is not what people should read. */
  columnLabel?: (value: string) => ReactNode;
  /** Order of the across values. Defaults to alphabetical. */
  columnOrder?: (a: string, b: string) => number;
};

export type PivotRow = { id: string } & Record<string, unknown>;

/** Turns rows into a cross-tab: feed the result to DataTable, with a total column and a total row. */
export function pivot<T>(data: T[], { rows, columns: across, value, aggregate: kind, columnLabel, columnOrder }: PivotConfig<T>, lang: string, totalLabel: string) {
  const heads = Array.from(new Set(data.map((row) => textOf(across, row)))).sort(columnOrder ?? new Intl.Collator(lang, { numeric: true }).compare);
  const leaves: Array<{ path: string[]; rows: T[] }> = [];
  const walk = (nodes: GroupNode<T>[], path: string[]) => {
    for (const node of nodes) {
      if (node.children) walk(node.children, [...path, node.value]);
      else leaves.push({ path: [...path, node.value], rows: node.rows });
    }
  };
  walk(groupRows(data, rows), []);
  const bucket = (members: T[]) => {
    const parts = new Map<string, T[]>();
    for (const row of members) {
      const head = textOf(across, row);
      const part = parts.get(head);
      if (part) part.push(row);
      else parts.set(head, [row]);
    }
    return parts;
  };
  const summarise = (members: T[] | undefined) => (members?.length ? aggregate(kind, members.map((row) => readValue(value, row))) : null);
  const overall = bucket(data);
  const pivotRows: PivotRow[] = leaves.map((leaf) => {
    const parts = bucket(leaf.rows);
    const record: PivotRow = { id: leaf.path.join("/"), __total: summarise(leaf.rows) };
    rows.forEach((column, i) => { record[`r:${column.key}`] = leaf.path[i]; });
    for (const head of heads) record[`c:${head}`] = summarise(parts.get(head));
    return record;
  });
  const number = (key: string, header: ReactNode, footerValue: unknown): Column<PivotRow> => ({
    key,
    header,
    type: "number",
    align: "right",
    scale: value.scale,
    // The grand figure, so exports get the same total row the screen shows.
    aggregate: () => footerValue,
    format: value.format as Column<PivotRow>["format"],
    cell: (row) => (isBlank(row[key]) ? "" : value.format ? value.format(row[key], data[0]) : String(row[key])),
    footer: isBlank(footerValue) ? "" : value.format ? value.format(footerValue, data[0]) : String(footerValue),
  });
  const pivotColumns: Column<PivotRow>[] = [
    ...rows.map((column): Column<PivotRow> => ({ key: `r:${column.key}`, header: column.header, footer: rows[0] === column ? totalLabel : undefined })),
    ...heads.map((head) => number(`c:${head}`, columnLabel ? columnLabel(head) : head, summarise(overall.get(head)))),
    number("__total", totalLabel, summarise(data)),
  ];
  return { columns: pivotColumns, rows: pivotRows };
}

/** Number → column letters for spreadsheets: 0 is A, 26 is AA. */
export function columnName(index: number) {
  let name = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
}

/** Spreadsheet-style text for the clipboard. Cells that hold tabs or line breaks are quoted. */
export function toTsv(grid: string[][]) {
  return grid.map((row) => row.map((cell) => (/[\t\n"]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join("\t")).join("\n");
}

export function parseTsv(text: string) {
  const rows: string[][] = [[]];
  let cell = "";
  let quoted = false;
  const body = text.replace(/\r\n?/g, "\n").replace(/\n$/, "");
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quoted) {
      if (c === '"' && body[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell === "") quoted = true;
    else if (c === "\t") { rows[rows.length - 1].push(cell); cell = ""; }
    else if (c === "\n") { rows[rows.length - 1].push(cell); rows.push([]); cell = ""; }
    else cell += c;
  }
  rows[rows.length - 1].push(cell);
  return rows;
}

/** Reads a pasted number in the table's language: "1.250,50" in Turkish, "1,250.50" in English. */
export function parseNumber(text: string, lang: string) {
  const parts = new Intl.NumberFormat(lang).formatToParts(12345.6);
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const clean = text.replace(/[^\d.,\-]/g, "").split(group).join("").replace(decimal, ".");
  const value = Number(clean);
  return clean === "" || Number.isNaN(value) ? null : value;
}

function trailingNumber(text: string) {
  const match = /^(.*?)(\d+)$/.exec(text);
  return match ? { head: match[1], digits: match[2], value: Number(match[2]) } : null;
}

/**
 * Continues a selection the way a spreadsheet fill handle does: numbers, ISO dates and
 * text ending in a number follow their step; anything else repeats.
 */
export function fillSeries(source: unknown[], count: number, backwards = false): unknown[] {
  const seed = backwards ? [...source].reverse() : source;
  const repeat = () => Array.from({ length: count }, (_, i) => seed[i % seed.length]);
  const stepOf = (values: number[]) => {
    if (values.length < 2) return null;
    const step = values[1] - values[0];
    return values.every((v, i) => i === 0 || v - values[i - 1] === step) ? step : null;
  };
  if (seed.every((v) => typeof v === "number")) {
    const step = stepOf(seed as number[]);
    if (step === null) return repeat();
    const last = seed[seed.length - 1] as number;
    return Array.from({ length: count }, (_, i) => last + step * (i + 1));
  }
  if (seed.every((v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v))) {
    const days = (seed as string[]).map((v) => Date.parse(`${v}T00:00:00Z`) / 86400000);
    const step = stepOf(days) ?? (days.length === 1 ? 1 : null);
    if (step === null) return repeat();
    const last = days[days.length - 1];
    return Array.from({ length: count }, (_, i) => new Date((last + step * (i + 1)) * 86400000).toISOString().slice(0, 10));
  }
  const parts = seed.map((v) => (typeof v === "string" ? trailingNumber(v) : null));
  if (parts.every(Boolean) && parts.every((p) => p!.head === parts[0]!.head)) {
    const step = stepOf(parts.map((p) => p!.value)) ?? (parts.length === 1 ? 1 : null);
    if (step === null) return repeat();
    const last = parts[parts.length - 1]!;
    return Array.from({ length: count }, (_, i) => `${last.head}${String(Math.max(0, last.value + step * (i + 1))).padStart(last.digits.length, "0")}`);
  }
  return repeat();
}

export type TreeNode<T> = { row: T; key: string | number; level: number; children: TreeNode<T>[] };

type TreeOptions<T> = {
  childrenOf: (row: T) => T[] | undefined;
  getKey: (row: T) => string | number;
  /** Filter test. A match keeps its ancestors and all its descendants. */
  keep: (row: T) => boolean;
  order: (rows: T[]) => T[];
};

/** Filters and sorts each level of a hierarchy. Siblings stay together under their parent. */
export function buildTree<T>(rows: T[], options: TreeOptions<T>, level = 0, ancestorMatched = false): TreeNode<T>[] {
  const nodes: TreeNode<T>[] = [];
  for (const row of options.order(rows)) {
    const matched = ancestorMatched || options.keep(row);
    const children = buildTree(options.childrenOf(row) ?? [], options, level + 1, matched);
    if (matched || children.length > 0) nodes.push({ row, key: options.getKey(row), level, children });
  }
  return nodes;
}

export function leafRows<T>(node: TreeNode<T>): T[] {
  return node.children.length === 0 ? [node.row] : node.children.flatMap(leafRows);
}

export function flattenTree<T>(nodes: TreeNode<T>[]): TreeNode<T>[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)]);
}
