import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ClipboardEvent, type CSSProperties, type DragEvent, type KeyboardEvent, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { ContextMenu } from "@base-ui/react/context-menu";
import { Popover } from "@base-ui/react/popover";
import { ChevronRight, Close, Columns, Dots, Download, Filter } from "../../icons";
import { useLocale } from "../../locale";
import { cx, flag, storageGet, storageSet } from "../../utils";
import { Button } from "../button";
import { Checkbox, SearchInput } from "../form";
import { Loading, Spinner } from "../display";
import { SelectionChart, type ChartPickerProps } from "../chart";
import { Menu, MenuItem, MenuSeparator, Modal } from "../overlay";
import { Select } from "../select";
import { aggregate, aggregateColumn, buildTree, fillSeries, filterRows, flattenTree, groupRows, isBlank, leafRows, isFilterActive, parseNumber, parseTsv, readValue, sortByMany, textOf, toTsv, type CellChange, type Column, type ColumnFilter, type Filters, type GroupNode, type SortState, type TreeNode } from "./engine";
import { filterKind, FilterPanel, Pagination } from "./parts";
import { useDataSource, type DataSource } from "./useDataSource";
import { buildCsv, buildXlsx, download, type SheetCell, type SheetColumn } from "./xlsx";

export type TableState = {
  hidden: string[];
  compact: boolean;
  widths: Record<string, number>;
  order: string[] | null;
  pins: Record<string, "left" | "right" | null>;
  sorts: SortState[];
  filters: Filters;
  groupBy: string[];
};

export type ContextMenuItem = { label: ReactNode; icon?: ReactNode; danger?: boolean; disabled?: boolean; onClick: () => void };

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
  /** `accent` fills the band with the brand colour. */
  bandTone?: "plain" | "accent";
  /** Column and density menus. On by default when the table has a band. */
  controls?: boolean;
  /** Turns on every grid feature at once. Set one to `false` to leave it out. */
  advanced?: boolean;
  /** Search box in the band, over every visible column. */
  searchable?: boolean;
  search?: string;
  onSearchChange?: (search: string) => void;
  /** Filter panels in the column menus. */
  filterable?: boolean;
  filters?: Filters;
  defaultFilters?: Filters;
  onFiltersChange?: (filters: Filters) => void;
  /** Drag column edges to resize. */
  resizable?: boolean;
  /** Drag headers to change the order. */
  reorderable?: boolean;
  /** Pin columns from the column menu. */
  pinnable?: boolean;
  /** Group by columns from the column menu. */
  groupable?: boolean;
  groupBy?: string[];
  defaultGroupBy?: string[];
  onGroupByChange?: (groupBy: string[]) => void;
  /** Footer row with each column's `aggregate`. */
  totals?: boolean;
  /** Excel-style cell selection, keyboard navigation and copy. */
  cellSelection?: boolean;
  /** Saves edits from cells, paste, delete, undo and redo. Columns opt in with `editable`. */
  onCellEdit?: (changes: CellChange<T>[]) => void;
  /** Excel and CSV buttons. */
  exportable?: boolean;
  exportFileName?: string;
  /** Extra right-click entries. */
  contextMenu?: (target: { row: T; column: Column<T> }) => ContextMenuItem[];
  /** Renders only the rows in view. Use with `maxHeight`; handles 100k rows or more. */
  virtual?: boolean;
  /** Row height in pixels in virtual mode. */
  rowHeight?: number;
  /** Height of an open detail row in virtual mode. */
  detailHeight?: number;
  /** Server row model: blocks of rows load as the user scrolls. Turns on `virtual`. */
  dataSource?: DataSource<T>;
  /** Tree data: returns a row's children. `rows` then holds only the top level. */
  getChildren?: (row: T) => T[] | undefined;
  /** Says a row can open before its children are loaded. Use with `loadChildren`. */
  hasChildren?: (row: T) => boolean;
  /** Fetches children on first open. */
  loadChildren?: (row: T) => Promise<T[]>;
  /** `true` opens the whole tree, a number opens that many levels. */
  defaultExpanded?: boolean | number;
  /** Starting row density. A value saved under `storageKey` wins. */
  defaultDensity?: "comfortable" | "compact";
  /** localStorage key that remembers the layout: columns, widths, pins, sort, filters, grouping, density. */
  storageKey?: string;
  /** A saved layout to start from. */
  initialState?: Partial<TableState>;
  /** Reports each layout change, for saved views. */
  onStateChange?: (state: TableState) => void;
  pageSize?: number;
  /** Page size choices in the footer. */
  pageSizeOptions?: number[];
  /** Server mode: `rows` is the current page. Sorting and filters are reported, not applied. */
  server?: { total: number; page: number; onPageChange: (page: number) => void; onPageSizeChange?: (size: number) => void };
  sort?: SortState | null;
  defaultSort?: SortState | null;
  /** Second argument holds every sort level. Hold Shift on a header to add a level. */
  onSortChange?: (sort: SortState | null, all: SortState[]) => void;
  loading?: boolean;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  selectedKey?: string | number | null;
  /** Checkbox column. Pass with `onSelectionChange`. */
  selectedKeys?: Array<string | number>;
  onSelectionChange?: (keys: Array<string | number>) => void;
  /** Shown in the band while rows are checked. */
  bulkActions?: ReactNode;
  renderDetail?: (row: T) => ReactNode;
  rowClassName?: (row: T) => string | undefined;
  /** Replaces the record counter on the left of the footer, such as with totals. */
  footerNote?: ReactNode;
  maxHeight?: number | string;
  className?: string;
};

type Key = string | number;
type Display<T> =
  | { kind: "row"; row: T; key: Key; node?: TreeNode<T> }
  | { kind: "group"; node: GroupNode<T>; open: boolean }
  | { kind: "detail"; row: T; key: Key }
  | { kind: "pending"; index: number };
type Cell = { r: number; c: number };

const DEFAULT_WIDTH = 160;
const MIN_WIDTH = 60;
const UTILITY = { select: 42, detail: 38 };
const OVERSCAN = 8;
const HEADER_HEIGHT = 38;
const ROW_HEIGHT = { comfortable: 41, compact: 29 };

function initialSorts(sort: SortState | null | undefined) {
  return sort ? [sort] : [];
}

export function DataTable<T>(props: DataTableProps<T>) {
  const {
    columns, rows, getRowKey, title, titleNote, icon, chips, actions, bandTone = "plain", controls, advanced,
    searchable = advanced, search, onSearchChange, filterable = advanced, filters: controlledFilters, defaultFilters, onFiltersChange,
    resizable = advanced, reorderable = advanced, pinnable = advanced, groupable: groupableProp = advanced,
    groupBy: controlledGroupBy, defaultGroupBy, onGroupByChange, totals, cellSelection = advanced, onCellEdit,
    exportable = advanced, exportFileName = "export", contextMenu, dataSource, rowHeight, detailHeight = 180,
    getChildren, hasChildren, loadChildren, defaultExpanded = false,
    defaultDensity = "comfortable", storageKey, initialState, onStateChange, pageSize, pageSizeOptions, server,
    sort, defaultSort = null, onSortChange, loading, empty, onRowClick, selectedKey, selectedKeys, onSelectionChange, bulkActions,
    renderDetail, rowClassName, footerNote, maxHeight, className,
  } = props;
  const virtual = props.virtual || !!dataSource;
  // A tree already has its hierarchy, so grouping it would only hide the column.
  const groupable = groupableProp && !(props.getChildren || props.loadChildren);
  const t = useLocale();
  const g = t.grid;
  const uid = useId();
  const defaultHidden = useMemo(() => columns.filter((c) => c.hidden).map((c) => c.key), [columns]);
  const defaultPins = useMemo(() => Object.fromEntries(columns.filter((c) => c.pin).map((c) => [c.key, c.pin!])), [columns]);

  const [hidden, setHidden] = useState<string[]>(initialState?.hidden ?? defaultHidden);
  const [compact, setCompact] = useState(initialState?.compact ?? defaultDensity === "compact");
  const [widths, setWidths] = useState<Record<string, number>>(initialState?.widths ?? {});
  const [order, setOrder] = useState<string[] | null>(initialState?.order ?? null);
  const [pins, setPins] = useState<TableState["pins"]>(initialState?.pins ?? defaultPins);
  const [ownSorts, setOwnSorts] = useState<SortState[]>(initialState?.sorts ?? initialSorts(defaultSort));
  const [ownFilters, setOwnFilters] = useState<Filters>(initialState?.filters ?? defaultFilters ?? {});
  const [ownGroupBy, setOwnGroupBy] = useState<string[]>(initialState?.groupBy ?? defaultGroupBy ?? []);
  const [ownSearch, setOwnSearch] = useState("");
  const [ownPage, setOwnPage] = useState(1);
  const [ownPageSize, setOwnPageSize] = useState(pageSize);
  useEffect(() => setOwnPageSize(pageSize), [pageSize]);
  const [expanded, setExpanded] = useState<Set<Key>>(() => new Set());
  const [closedGroups, setClosedGroups] = useState<Set<string>>(() => new Set());

  const sorts = sort !== undefined ? initialSorts(sort) : ownSorts;
  const filters = controlledFilters ?? ownFilters;
  const groupBy = controlledGroupBy ?? ownGroupBy;
  const searchText = search ?? ownSearch;

  const stateRef = useRef<TableState>({ hidden, compact, widths, order, pins, sorts, filters, groupBy });
  stateRef.current = { hidden, compact, widths, order, pins, sorts, filters, groupBy };

  // Read after mount so server and client render the same first frame.
  useEffect(() => {
    const raw = storageGet(storageKey);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as Partial<TableState>;
      if (Array.isArray(saved.hidden)) setHidden(saved.hidden);
      if (typeof saved.compact === "boolean") setCompact(saved.compact);
      if (saved.widths) setWidths(saved.widths);
      if (saved.order !== undefined) setOrder(saved.order);
      if (saved.pins) setPins(saved.pins);
      if (Array.isArray(saved.sorts)) setOwnSorts(saved.sorts);
      if (saved.filters) setOwnFilters(saved.filters);
      if (Array.isArray(saved.groupBy)) setOwnGroupBy(saved.groupBy);
    } catch {
      storageSet(storageKey, null);
    }
  }, [storageKey]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    storageSet(storageKey, JSON.stringify(stateRef.current));
    onStateChange?.(stateRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden, compact, widths, order, pins, ownSorts, ownFilters, ownGroupBy]);

  const byKey = useMemo(() => new Map(columns.map((c) => [c.key, c])), [columns]);
  const grouped = useMemo(() => groupBy.flatMap((key) => (byKey.has(key) ? [byKey.get(key)!] : [])), [groupBy, byKey]);

  const visible = useMemo(() => {
    const known = order ? [...order.filter((k) => byKey.has(k)), ...columns.map((c) => c.key).filter((k) => !order.includes(k))] : columns.map((c) => c.key);
    const shown = known.map((k) => byKey.get(k)!).filter((c) => !hidden.includes(c.key) && !groupBy.includes(c.key));
    const pinOf = (c: Column<T>) => pins[c.key] ?? null;
    return [...shown.filter((c) => pinOf(c) === "left"), ...shown.filter((c) => !pinOf(c)), ...shown.filter((c) => pinOf(c) === "right")];
  }, [order, columns, byKey, hidden, groupBy, pins]);

  const source = useDataSource(dataSource, { sorts, filters, search: searchText });

  const isTree = !!(getChildren || loadChildren);
  const [loaded, setLoaded] = useState<Map<Key, T[]>>(() => new Map());
  const [loadingKeys, setLoadingKeys] = useState<Set<Key>>(() => new Set());
  const [toggled, setToggled] = useState<Set<Key>>(() => new Set());
  const childrenOf = useCallback((row: T) => loaded.get(getRowKey(row)) ?? getChildren?.(row), [loaded, getChildren, getRowKey]);
  const filtering = Object.values(filters).some(isFilterActive) || !!searchText.trim();

  const leavesOf = useCallback(function leaves(row: T): T[] {
    const kids = childrenOf(row);
    return kids?.length ? kids.flatMap(leaves) : [row];
  }, [childrenOf]);

  /** A parent shows its leaves' total, so that total is what sorting and copying use. */
  const rollupOf = useCallback((column: Column<T>, row: T) => (column.aggregate && childrenOf(row)?.length ? aggregateColumn(column, leavesOf(row)) : undefined), [childrenOf, leavesOf]);

  const tree = useMemo(() => {
    if (!isTree) return null;
    const sortable = columns.map((c) => (c.aggregate ? { ...c, sortValue: (row: T) => (rollupOf(c, row) as number | undefined) ?? (c.sortValue ? c.sortValue(row) : (readValue(c, row) as number | undefined)) } : c));
    return buildTree(rows, {
      childrenOf,
      getKey: getRowKey,
      keep: (row) => filterRows([row], columns, filters, searchText, t.lang).length > 0,
      order: (level) => sortByMany(level, sorts, sortable, t.lang),
    });
  }, [isTree, rows, childrenOf, getRowKey, columns, filters, searchText, sorts, t.lang, rollupOf]);

  const processed = useMemo(() => {
    if (server || dataSource) return rows;
    if (tree) return tree.map((node) => node.row);
    return sortByMany(filterRows(rows, columns, filters, searchText, t.lang), sorts, columns, t.lang);
  }, [rows, columns, filters, searchText, sorts, server, dataSource, t.lang, tree]);

  /** The rows totals and exports count: in a tree, the leaves. */
  const countable = useMemo(() => (tree ? tree.flatMap(leafRows) : processed), [tree, processed]);

  const treeOpen = useCallback((key: Key, level: number) => {
    const byDefault = defaultExpanded === true || (typeof defaultExpanded === "number" && level < defaultExpanded);
    return toggled.has(key) ? !byDefault : byDefault;
  }, [defaultExpanded, toggled]);

  const canOpen = useCallback((row: T, node?: TreeNode<T>) => (node?.children.length ? true : hasChildren?.(row) ?? false), [hasChildren]);

  const flip = useCallback((key: Key) => setToggled((current) => {
    const next = new Set(current);
    if (!next.delete(key)) next.add(key);
    return next;
  }), []);

  const asked = useRef(new Set<Key>());

  const fetchChildren = useCallback(async (row: T, key: Key, level: number) => {
    if (!loadChildren || childrenOf(row)?.length || asked.current.has(key)) return;
    asked.current.add(key);
    setLoadingKeys((current) => new Set(current).add(key));
    try {
      const children = await loadChildren(row);
      setLoaded((current) => new Map(current).set(key, children));
    } catch (error) {
      // A failed row closes again, and opening it tries once more.
      console.error(error);
      asked.current.delete(key);
      setToggled((current) => {
        const byDefault = defaultExpanded === true || (typeof defaultExpanded === "number" && level < defaultExpanded);
        const next = new Set(current);
        if (byDefault) next.add(key);
        else next.delete(key);
        return next;
      });
    } finally {
      setLoadingKeys((current) => { const next = new Set(current); next.delete(key); return next; });
    }
  }, [loadChildren, childrenOf, defaultExpanded]);

  function toggleTree(row: T, key: Key, level: number) {
    const opening = !treeOpen(key, level);
    flip(key);
    if (opening) void fetchChildren(row, key, level);
  }

  // Without a pageSize the first page is the best guide: a short last page must not change it.
  const seenSize = useRef(0);
  seenSize.current = Math.max(seenSize.current, server ? rows.length : 0);
  const size = ownPageSize ?? seenSize.current;
  const paged = size > 0 && !virtual;
  const totalRows = dataSource ? source.total : server ? server.total : processed.length;
  const pageCount = paged ? Math.max(1, Math.ceil(totalRows / size)) : 1;
  const page = Math.min(server ? server.page : ownPage, pageCount);
  const onPage = !server && paged ? processed.slice((page - 1) * size, page * size) : processed;

  const display = useMemo<Display<T>[]>(() => {
    if (dataSource) return [];
    const out: Display<T>[] = [];
    const pushRow = (row: T) => {
      const key = getRowKey(row);
      out.push({ kind: "row", row, key });
      if (renderDetail && expanded.has(key)) out.push({ kind: "detail", row, key });
    };
    if (tree) {
      const roots = new Set(onPage);
      const pushNode = (node: TreeNode<T>) => {
        out.push({ kind: "row", row: node.row, key: node.key, node });
        if (renderDetail && expanded.has(node.key)) out.push({ kind: "detail", row: node.row, key: node.key });
        if (filtering || treeOpen(node.key, node.level)) node.children.forEach(pushNode);
      };
      tree.filter((node) => roots.has(node.row)).forEach(pushNode);
      return out;
    }
    if (grouped.length === 0) { onPage.forEach(pushRow); return out; }
    const walk = (nodes: GroupNode<T>[]) => {
      for (const node of nodes) {
        const open = !closedGroups.has(node.key);
        out.push({ kind: "group", node, open });
        if (!open) continue;
        if (node.children) walk(node.children);
        else node.rows.forEach(pushRow);
      }
    };
    walk(groupRows(onPage, grouped));
    return out;
  }, [dataSource, onPage, grouped, closedGroups, expanded, renderDetail, getRowKey, tree, filtering, treeOpen]);

  // Rows that start open still need their children fetched.
  useEffect(() => {
    if (!loadChildren) return;
    for (const item of display) {
      if (item.kind === "row" && item.node && hasChildren?.(item.row) && treeOpen(item.key, item.node.level)) void fetchChildren(item.row, item.key, item.node.level);
    }
  }, [display, loadChildren, hasChildren, treeOpen, fetchChildren]);

  const count = dataSource ? source.total : display.length;
  const at = useCallback((index: number): Display<T> => {
    if (!dataSource) return display[index];
    const row = source.rowAt(index);
    return row === undefined ? { kind: "pending", index } : { kind: "row", row, key: getRowKey(row) };
  }, [dataSource, display, source.rowAt, getRowKey]);

  const lineHeight = rowHeight ?? ROW_HEIGHT[compact ? "compact" : "comfortable"];
  const hasDetails = !dataSource && display.some((d) => d.kind === "detail");
  const offsets = useMemo(() => {
    if (!virtual || !hasDetails) return null;
    const list = new Float64Array(display.length + 1);
    display.forEach((d, i) => { list[i + 1] = list[i] + (d.kind === "detail" ? detailHeight : lineHeight); });
    return list;
  }, [virtual, hasDetails, display, detailHeight, lineHeight]);

  const scroller = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ top: 0, height: 600 });
  const frame = useRef(0);
  const onScroll = () => {
    if (!virtual) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = scroller.current;
      if (el) setScroll({ top: el.scrollTop, height: el.clientHeight || 600 });
    });
  };
  useLayoutEffect(() => {
    if (virtual && scroller.current?.clientHeight) setScroll((s) => ({ ...s, height: scroller.current!.clientHeight }));
  }, [virtual]);

  const offsetOf = useCallback((index: number) => (offsets ? offsets[index] : index * lineHeight), [offsets, lineHeight]);
  const indexAt = useCallback((y: number) => {
    if (!offsets) return Math.floor(y / lineHeight);
    let low = 0;
    let high = offsets.length - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (offsets[mid + 1] <= y) low = mid + 1;
      else high = mid;
    }
    return low;
  }, [offsets, lineHeight]);

  const first = virtual ? Math.max(0, indexAt(scroll.top) - OVERSCAN) : 0;
  const last = virtual ? Math.min(count, indexAt(scroll.top + scroll.height) + OVERSCAN + 1) : count;
  const totalHeight = virtual ? offsetOf(count) : 0;

  const { ensure } = source;
  useEffect(() => { if (dataSource) ensure(first, last); }, [dataSource, ensure, first, last, source.total]);

  // Group toolbars and resizing need numeric widths; fixed layout keeps columns steady while scrolling.
  const hasPins = visible.some((c) => pins[c.key]);
  const fixed = virtual || !!resizable || hasPins;
  const widthOf = useCallback((c: Column<T>) => widths[c.key] ?? (typeof c.width === "number" ? c.width : DEFAULT_WIDTH), [widths]);
  const tableRef = useRef<HTMLTableElement>(null);
  const [measured, setMeasured] = useState<Record<string, number>>({});

  useLayoutEffect(() => {
    if (!hasPins || !tableRef.current) return;
    const read = () => {
      const next: Record<string, number> = {};
      tableRef.current?.querySelectorAll<HTMLElement>("thead th[data-key]").forEach((th) => { next[th.dataset.key!] = th.offsetWidth; });
      setMeasured((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
    };
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, [hasPins, visible, widths]);

  // Plain tables size columns from content, so sorting or paging would shift them.
  // Once drawn the widths hold, as shares so the table still follows its container.
  const layoutKey = `${visible.map((c) => c.key).join("|")}:${compact}:${!!renderDetail}:${!!onSelectionChange}`;
  const [locked, setLocked] = useState<{ key: string; shares: number[] } | null>(null);
  const lockedShares = locked?.key === layoutKey ? locked.shares : null;
  useLayoutEffect(() => {
    if (fixed || lockedShares || count === 0) return;
    const heads = Array.from(tableRef.current?.querySelectorAll<HTMLElement>("thead th") ?? []);
    const widthsNow = heads.map((th) => th.offsetWidth);
    const total = widthsNow.reduce((sum, w) => sum + w, 0);
    if (total > 0) setLocked({ key: layoutKey, shares: widthsNow.map((w) => (w / total) * 100) });
  }, [fixed, lockedShares, count, layoutKey]);

  const selectable = !!onSelectionChange;
  const utilityWidth = (selectable ? UTILITY.select : 0) + (renderDetail ? UTILITY.detail : 0);

  const pinStyle = useMemo(() => {
    const styles = new Map<string, CSSProperties>();
    let left = utilityWidth;
    for (const c of visible) {
      if (pins[c.key] !== "left") continue;
      styles.set(c.key, { left });
      left += measured[c.key] ?? widthOf(c);
    }
    let right = 0;
    for (const c of [...visible].reverse()) {
      if (pins[c.key] !== "right") continue;
      styles.set(c.key, { right });
      right += measured[c.key] ?? widthOf(c);
    }
    return styles;
  }, [visible, pins, measured, widthOf, utilityWidth]);
  const lastLeftPin = [...visible].reverse().find((c) => pins[c.key] === "left")?.key;
  const firstRightPin = visible.find((c) => pins[c.key] === "right")?.key;

  function changeFilters(next: Filters) {
    setOwnFilters(next);
    onFiltersChange?.(next);
    setOwnPage(1);
  }

  function setColumnFilter(key: string, filter: ColumnFilter | undefined) {
    const next = { ...filters };
    if (filter) next[key] = filter;
    else delete next[key];
    changeFilters(next);
  }

  function changeGroupBy(next: string[]) {
    setOwnGroupBy(next);
    onGroupByChange?.(next);
  }

  function changeSearch(next: string) {
    setOwnSearch(next);
    onSearchChange?.(next);
    setOwnPage(1);
  }

  function applySort(next: SortState[]) {
    setOwnSorts(next);
    onSortChange?.(next[0] ?? null, next);
    if (!server) setOwnPage(1);
  }

  function toggleSort(key: string, add: boolean) {
    const current = sorts.find((s) => s.key === key);
    const cycled: SortState | null = !current ? { key, direction: "asc" } : current.direction === "asc" ? { key, direction: "desc" } : null;
    if (add) {
      const rest = sorts.filter((s) => s.key !== key);
      applySort(cycled ? (current ? sorts.map((s) => (s.key === key ? cycled : s)) : [...rest, cycled]) : rest);
    } else applySort(cycled ? [cycled] : []);
  }

  function goTo(next: number) {
    if (server) server.onPageChange(next);
    else setOwnPage(next);
  }

  function toggleColumn(key: string, show: boolean) {
    setHidden(show ? hidden.filter((k) => k !== key) : [...hidden, key]);
  }

  function resetLayout() {
    setHidden(defaultHidden);
    setWidths({});
    setOrder(null);
    setPins(defaultPins);
    changeGroupBy([]);
  }

  function toggleDetail(key: Key) {
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  }

  function toggleGroup(key: string) {
    setClosedGroups((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  }

  function allGroupKeys() {
    const keys: string[] = [];
    const walk = (nodes: GroupNode<T>[]) => nodes.forEach((n) => { keys.push(n.key); if (n.children) walk(n.children); });
    walk(groupRows(processed, grouped));
    return keys;
  }

  function moveColumn(key: string, target: string) {
    if (key === target) return;
    const keys = visible.map((c) => c.key);
    const rest = columns.map((c) => c.key).filter((k) => !keys.includes(k));
    const without = keys.filter((k) => k !== key);
    without.splice(keys.indexOf(target), 0, key);
    setOrder([...without, ...rest]);
  }

  function shiftColumn(key: string, by: number) {
    const keys = visible.map((c) => c.key);
    const target = keys[keys.indexOf(key) + by];
    if (target) moveColumn(key, target);
  }

  function startResize(e: ReactPointerEvent, column: Column<T>) {
    e.preventDefault();
    e.stopPropagation();
    const th = (e.target as HTMLElement).closest("th")!;
    const startX = e.clientX;
    const start = th.offsetWidth;
    const min = column.minWidth ?? MIN_WIDTH;
    const move = (ev: PointerEvent) => setWidths((w) => ({ ...w, [column.key]: Math.max(min, Math.round(start + ev.clientX - startX)) }));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function autoSize(column: Column<T>) {
    const table = tableRef.current;
    if (!table) return;
    let widest = MIN_WIDTH;
    table.querySelectorAll<HTMLElement>(`[data-col="${CSS.escape(column.key)}"]`).forEach((cell) => {
      const range = document.createRange();
      range.selectNodeContents(cell);
      widest = Math.max(widest, Math.ceil(range.getBoundingClientRect().width) + 34);
    });
    setWidths((w) => ({ ...w, [column.key]: widest }));
  }

  const hasEditable = !!onCellEdit && columns.some((c) => c.editable);
  const interactive = !!cellSelection || hasEditable;
  const [active, setActive] = useState<Cell | null>(null);
  const [anchor, setAnchor] = useState<Cell | null>(null);
  const [editing, setEditing] = useState<(Cell & { text: string; error?: string }) | null>(null);
  const dragging = useRef(false);
  const [fillTarget, setFillTarget] = useState<Cell | null>(null);
  const filling = useRef(false);
  const finishFill = useRef<() => void>(() => undefined);
  const undoStack = useRef<CellChange<T>[][]>([]);
  const redoStack = useRef<CellChange<T>[][]>([]);

  const bounds = active && anchor ? {
    top: Math.min(active.r, anchor.r), bottom: Math.max(active.r, anchor.r),
    left: Math.min(active.c, anchor.c), right: Math.max(active.c, anchor.c),
  } : null;
  const multi = !!bounds && (bounds.top !== bounds.bottom || bounds.left !== bounds.right);

  useEffect(() => {
    const up = () => {
      dragging.current = false;
      if (filling.current) { filling.current = false; finishFill.current(); }
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  function rowsInRange() {
    if (!bounds) return [] as T[];
    const out: T[] = [];
    for (let r = bounds.top; r <= bounds.bottom; r++) {
      const item = at(r);
      if (item?.kind === "row") out.push(item.row);
    }
    return out;
  }

  const stats = useMemo(() => {
    if (!multi || !bounds) return null;
    const numbers: number[] = [];
    let cells = 0;
    for (let r = bounds.top; r <= bounds.bottom; r++) {
      const item = at(r);
      if (item?.kind !== "row") continue;
      for (let c = bounds.left; c <= bounds.right; c++) {
        const value = readValue(visible[c], item.row);
        if (isBlank(value)) continue;
        cells++;
        if (typeof value === "number") numbers.push(value);
      }
    }
    return { cells, numbers };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multi, bounds?.top, bounds?.bottom, bounds?.left, bounds?.right, at, visible]);

  function cellGrid(withHeaders: boolean) {
    if (!bounds) return [] as string[][];
    const cols = visible.slice(bounds.left, bounds.right + 1);
    const text = (c: Column<T>, row: T) => {
      const rollup = rollupOf(c, row);
      if (rollup === undefined) return textOf(c, row);
      return c.format ? c.format(rollup, row) : String(rollup ?? "");
    };
    const grid = rowsInRange().map((row) => cols.map((c) => text(c, row)));
    return withHeaders ? [cols.map((c) => plainHeader(c)), ...grid] : grid;
  }

  function copy(withHeaders = false) {
    const text = toTsv(cellGrid(withHeaders));
    if (text) void navigator.clipboard?.writeText(text);
  }

  const [chart, setChart] = useState<ChartPickerProps | null>(null);

  /** Numeric columns in the range become series; the first text column names the rows. */
  function chartFromRange() {
    if (!bounds) return null;
    const cols = visible.slice(bounds.left, bounds.right + 1);
    const picked = rowsInRange();
    const numeric = cols.filter((c) => picked.some((row) => typeof readValue(c, row) === "number"));
    if (numeric.length === 0 || picked.length === 0) return null;
    const nameColumn = cols.find((c) => !numeric.includes(c)) ?? visible.slice(0, bounds.left).reverse().find((c) => !numeric.includes(c));
    return {
      columns: numeric.map(plainHeader),
      categories: picked.map((row, i) => (nameColumn ? textOf(nameColumn, row) : String(i + 1))),
      rows: picked.map((row) => numeric.map((c) => Number(readValue(c, row)) || 0)),
      label: typeof title === "string" ? title : g.chartTitle,
    };
  }

  function reveal(index: number) {
    const el = scroller.current;
    if (!el || !virtual) return;
    const y = offsetOf(index);
    if (y < el.scrollTop) el.scrollTop = y;
    else if (y + lineHeight + HEADER_HEIGHT > el.scrollTop + el.clientHeight) el.scrollTop = y + lineHeight + HEADER_HEIGHT - el.clientHeight;
  }

  function step(from: number, by: number) {
    let r = from;
    for (let i = 0; i < count; i++) {
      r += by > 0 ? 1 : -1;
      if (r < 0 || r >= count) return from;
      if (at(r)?.kind !== "detail") return r;
    }
    return from;
  }

  function moveTo(next: Cell, extend: boolean) {
    const r = Math.max(0, Math.min(count - 1, next.r));
    const c = Math.max(0, Math.min(visible.length - 1, next.c));
    setActive({ r, c });
    if (!extend) setAnchor({ r, c });
    reveal(r);
  }

  function canEdit(cell: Cell) {
    const column = visible[cell.c];
    const item = at(cell.r);
    if (!onCellEdit || !column || item?.kind !== "row") return false;
    return typeof column.editable === "function" ? column.editable(item.row) : !!column.editable;
  }

  function startEdit(cell: Cell, seed?: string) {
    if (!canEdit(cell)) return false;
    const item = at(cell.r) as { row: T };
    const column = visible[cell.c];
    const value = readValue(column, item.row);
    // Editors work on the raw value: `format` is for reading, and would be saved back as data.
    const raw = isBlank(value) ? "" : value instanceof Date ? value.toISOString().slice(0, 10) : typeof value === "number" ? value.toLocaleString(t.lang, { useGrouping: false, maximumFractionDigits: 20 }) : String(value);
    setEditing({ ...cell, text: seed ?? raw });
    return true;
  }

  function coerce(column: Column<T>, text: string): unknown {
    if (column.type === "number") return parseNumber(text, t.lang);
    if (column.type === "boolean") return /^(1|true|evet|yes|doğru)$/i.test(text.trim());
    return text;
  }

  function apply(changes: CellChange<T>[]) {
    if (changes.length === 0) return;
    onCellEdit?.(changes);
    undoStack.current.push(changes);
    redoStack.current = [];
  }

  function undo() {
    const changes = undoStack.current.pop();
    if (!changes) return;
    redoStack.current.push(changes);
    onCellEdit?.(changes.map((c) => ({ ...c, value: c.previous, previous: c.value })));
  }

  function redo() {
    const changes = redoStack.current.pop();
    if (!changes) return;
    undoStack.current.push(changes);
    onCellEdit?.(changes);
  }

  function commitEdit(move?: Cell) {
    if (!editing) return;
    const column = visible[editing.c];
    const item = at(editing.r);
    if (item?.kind !== "row") { setEditing(null); return; }
    const value = coerce(column, editing.text);
    const previous = readValue(column, item.row);
    const error = column.validate?.(value, item.row);
    if (error) { setEditing({ ...editing, error }); return; }
    if (column.type === "number" && editing.text.trim() && value === null) { setEditing({ ...editing, error: g.invalidNumber }); return; }
    setEditing(null);
    if (!(value === previous || (isBlank(value) && isBlank(previous)))) apply([{ row: item.row, key: column.key, value, previous }]);
    if (move) moveTo(move, false);
    tableRef.current?.focus({ preventScroll: true });
  }

  /** Rows of the range extended by the fill handle, in the direction it was dragged. */
  const fillArea = bounds && fillTarget ? (() => {
    const down = fillTarget.r - bounds.bottom;
    const up = bounds.top - fillTarget.r;
    const right = fillTarget.c - bounds.right;
    const left = bounds.left - fillTarget.c;
    if (Math.max(down, up) >= Math.max(right, left)) {
      if (down > 0) return { axis: "rows" as const, from: bounds.bottom + 1, to: fillTarget.r, backwards: false };
      if (up > 0) return { axis: "rows" as const, from: fillTarget.r, to: bounds.top - 1, backwards: true };
    } else {
      if (right > 0) return { axis: "cols" as const, from: bounds.right + 1, to: fillTarget.c, backwards: false };
      if (left > 0) return { axis: "cols" as const, from: fillTarget.c, to: bounds.left - 1, backwards: true };
    }
    return null;
  })() : null;

  /** A fill crossing columns must not put text in a number column or a name in a date column. */
  function accepts(column: Column<T>, value: unknown) {
    if (isBlank(value)) return true;
    if (column.options) return column.options.some((o) => o.value === value);
    if (column.type === "number") return typeof value === "number";
    if (column.type === "date") return typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value);
    if (column.type === "boolean") return typeof value === "boolean";
    return typeof value === "string" || typeof value === "number";
  }

  function fillChanges(area: NonNullable<typeof fillArea>) {
    if (!bounds) return [];
    const changes: CellChange<T>[] = [];
    const write = (r: number, c: number, value: unknown) => {
      const item = at(r);
      if (item?.kind !== "row" || !canEdit({ r, c })) return;
      const column = visible[c];
      const previous = readValue(column, item.row);
      if (value !== previous && accepts(column, value) && !column.validate?.(value, item.row)) changes.push({ row: item.row, key: column.key, value, previous });
    };
    const rowsBetween = (from: number, to: number) => {
      const list: number[] = [];
      for (let r = from; r <= to; r++) if (at(r)?.kind === "row") list.push(r);
      return list;
    };
    const sourceRows = rowsBetween(bounds.top, bounds.bottom);
    if (area.axis === "rows") {
      const targets = rowsBetween(area.from, area.to);
      const ordered = area.backwards ? [...targets].reverse() : targets;
      for (let c = bounds.left; c <= bounds.right; c++) {
        const seed = sourceRows.map((r) => readValue(visible[c], (at(r) as { row: T }).row));
        fillSeries(seed, ordered.length, area.backwards).forEach((value, i) => write(ordered[i], c, value));
      }
    } else {
      const count = area.to - area.from + 1;
      for (const r of sourceRows) {
        const row = (at(r) as { row: T }).row;
        const seed = visible.slice(bounds.left, bounds.right + 1).map((c) => readValue(c, row));
        fillSeries(seed, count, area.backwards).forEach((value, i) => write(r, area.backwards ? area.to - i : area.from + i, value));
      }
    }
    return changes;
  }

  finishFill.current = () => {
    if (fillArea && bounds) {
      apply(fillChanges(fillArea));
      setAnchor({ r: fillArea.axis === "rows" ? Math.min(bounds.top, fillArea.from) : bounds.top, c: fillArea.axis === "cols" ? Math.min(bounds.left, fillArea.from) : bounds.left });
      setActive({ r: fillArea.axis === "rows" ? Math.max(bounds.bottom, fillArea.to) : bounds.bottom, c: fillArea.axis === "cols" ? Math.max(bounds.right, fillArea.to) : bounds.right });
    }
    setFillTarget(null);
  };

  function fillFromEdge(direction: "down" | "right") {
    if (!bounds) return;
    const changes: CellChange<T>[] = [];
    for (let r = bounds.top; r <= bounds.bottom; r++) {
      for (let c = bounds.left; c <= bounds.right; c++) {
        const item = at(r);
        const origin = at(direction === "down" ? bounds.top : r);
        if (item?.kind !== "row" || origin?.kind !== "row" || (direction === "down" ? r === bounds.top : c === bounds.left) || !canEdit({ r, c })) continue;
        const column = visible[c];
        const value = readValue(direction === "down" ? column : visible[bounds.left], origin.row);
        const previous = readValue(column, item.row);
        if (value !== previous && accepts(column, value) && !column.validate?.(value, item.row)) changes.push({ row: item.row, key: column.key, value, previous });
      }
    }
    apply(changes);
  }

  function clearRange() {
    if (!bounds) return;
    const changes: CellChange<T>[] = [];
    for (let r = bounds.top; r <= bounds.bottom; r++) {
      for (let c = bounds.left; c <= bounds.right; c++) {
        const item = at(r);
        if (item?.kind !== "row" || !canEdit({ r, c })) continue;
        const previous = readValue(visible[c], item.row);
        if (!isBlank(previous)) changes.push({ row: item.row, key: visible[c].key, value: visible[c].type === "number" ? null : "", previous });
      }
    }
    apply(changes);
  }

  function onPaste(e: ClipboardEvent) {
    if (!onCellEdit || !active || editing) return;
    const grid = parseTsv(e.clipboardData.getData("text/plain"));
    if (grid.length === 0) return;
    e.preventDefault();
    const single = grid.length === 1 && grid[0].length === 1;
    const top = bounds?.top ?? active.r;
    const left = bounds?.left ?? active.c;
    const height = single && bounds ? bounds.bottom - bounds.top + 1 : grid.length;
    const width = single && bounds ? bounds.right - bounds.left + 1 : grid[0].length;
    const changes: CellChange<T>[] = [];
    let row = top;
    for (let i = 0; i < height && row < count; i++, row = step(row, 1)) {
      for (let j = 0; j < width; j++) {
        const c = left + j;
        const item = at(row);
        if (c >= visible.length || item?.kind !== "row" || !canEdit({ r: row, c })) continue;
        const column = visible[c];
        const text = single ? grid[0][0] : grid[i]?.[j];
        if (text === undefined) continue;
        const value = coerce(column, text);
        const previous = readValue(column, item.row);
        if (column.validate?.(value, item.row) || (column.type === "number" && text.trim() && value === null) || value === previous) continue;
        changes.push({ row: item.row, key: column.key, value, previous });
      }
      if (row === step(row, 1)) break;
    }
    apply(changes);
  }

  function onGridKey(e: KeyboardEvent) {
    if (!interactive || editing || (e.target as HTMLElement).closest("input, select, textarea, button, a")) return;
    const mod = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();
    if (mod && key === "c") { e.preventDefault(); copy(); return; }
    if (mod && key === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
    if (mod && key === "y") { e.preventDefault(); redo(); return; }
    if (mod && key === "d" && hasEditable) { e.preventDefault(); fillFromEdge("down"); return; }
    if (mod && key === "r" && hasEditable) { e.preventDefault(); fillFromEdge("right"); return; }
    if (mod && key === "a") { e.preventDefault(); setAnchor({ r: 0, c: 0 }); setActive({ r: count - 1, c: visible.length - 1 }); return; }
    if (!active) {
      if (/^(Arrow|Home|End|Page)/.test(e.key)) { e.preventDefault(); moveTo({ r: 0, c: 0 }, false); }
      return;
    }
    const page = Math.max(1, Math.floor((scroller.current?.clientHeight ?? 400) / lineHeight) - 2);
    const extend = e.shiftKey;
    const item = at(active.r);
    const moves: Record<string, () => Cell> = {
      ArrowUp: () => ({ r: step(active.r, -1), c: active.c }),
      ArrowDown: () => ({ r: step(active.r, 1), c: active.c }),
      ArrowLeft: () => ({ r: active.r, c: active.c - 1 }),
      ArrowRight: () => ({ r: active.r, c: active.c + 1 }),
      Home: () => (mod ? { r: 0, c: 0 } : { r: active.r, c: 0 }),
      End: () => (mod ? { r: count - 1, c: visible.length - 1 } : { r: active.r, c: visible.length - 1 }),
      PageUp: () => ({ r: active.r - page, c: active.c }),
      PageDown: () => ({ r: active.r + page, c: active.c }),
    };
    if (item?.kind === "group" && (e.key === "ArrowRight" || e.key === "ArrowLeft") && item.open === (e.key === "ArrowLeft")) {
      e.preventDefault();
      toggleGroup(item.node.key);
      return;
    }
    if (item?.kind === "row" && item.node && active.c === 0 && (e.key === "ArrowRight" || e.key === "ArrowLeft") && canOpen(item.row, item.node)) {
      const open = filtering || treeOpen(item.key, item.node.level);
      if (open === (e.key === "ArrowLeft")) {
        e.preventDefault();
        void toggleTree(item.row, item.key, item.node.level);
        return;
      }
    }
    if (moves[e.key]) {
      e.preventDefault();
      moveTo(moves[e.key](), extend);
    } else if (e.key === "Tab" && hasEditable && visible.length > 1) {
      e.preventDefault();
      moveTo({ r: active.r, c: active.c + (e.shiftKey ? -1 : 1) }, false);
    } else if (e.key === "Escape") {
      setAnchor(active);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (hasEditable) { e.preventDefault(); clearRange(); }
    } else if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault();
      if (item?.kind === "group") toggleGroup(item.node.key);
      else if (startEdit(active)) return;
      else if (e.key === "Enter" && item?.kind === "row") {
        const inner = tableRef.current?.querySelector<HTMLElement>(`[id="${uid}-${active.r}-${active.c}"] :is(a, button)`);
        if (inner) inner.click();
        else onRowClick?.(item.row);
      }
    } else if (e.key.length === 1 && !mod && !e.altKey) {
      if (startEdit(active, e.key)) e.preventDefault();
    }
  }

  function cellFrom(e: { target: EventTarget | null }) {
    const td = (e.target as HTMLElement).closest<HTMLElement>("td[data-c]");
    const tr = td?.closest<HTMLElement>("tr[data-r]");
    return td && tr ? { r: Number(tr.dataset.r), c: Number(td.dataset.c) } : null;
  }

  function edgeScroll(e: ReactPointerEvent) {
    const el = scroller.current;
    if (!el || !(dragging.current || filling.current)) return;
    const box = el.getBoundingClientRect();
    if (e.clientY > box.bottom - 28) el.scrollTop += lineHeight;
    else if (e.clientY < box.top + HEADER_HEIGHT + 20) el.scrollTop -= lineHeight;
  }

  function onCellPointerDown(e: ReactPointerEvent) {
    if ((e.target as HTMLElement).closest(".bt-fill-handle")) {
      e.preventDefault();
      // Touch pointers stay bound to where they started; release so cells report the drag.
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      filling.current = true;
      return;
    }
    if (!interactive || e.button !== 0 || (e.target as HTMLElement).closest("input, select, textarea, button, a, label")) return;
    const cell = cellFrom(e);
    if (!cell) return;
    if (editing) commitEdit();
    dragging.current = true;
    setActive(cell);
    if (!(e.shiftKey && anchor)) setAnchor(cell);
    tableRef.current?.focus({ preventScroll: true });
  }

  function onCellPointerOver(e: ReactPointerEvent) {
    edgeScroll(e);
    const cell = cellFrom(e);
    if (!cell) return;
    if (filling.current) setFillTarget(cell);
    else if (dragging.current) setActive(cell);
  }

  function onCellContextMenu(e: MouseEvent) {
    const cell = cellFrom(e);
    if (!cell) return;
    const inside = bounds && cell.r >= bounds.top && cell.r <= bounds.bottom && cell.c >= bounds.left && cell.c <= bounds.right;
    if (!inside) { setActive(cell); setAnchor(cell); }
  }

  function plainHeader(column: Column<T>) {
    return typeof column.header === "string" ? column.header : column.key;
  }

  async function exportAs(kind: "xlsx" | "csv", selectedOnly = false) {
    const source_ = dataSource ? await source.all() : processed;
    const chosen = selectedOnly && selectedKeys ? source_.filter((row) => selectedKeys.includes(getRowKey(row))) : source_;
    const cols = visible;
    const sheetColumns: SheetColumn[] = cols.map((c) => ({ header: plainHeader(c), type: c.type, align: c.align, width: widths[c.key] ? Math.round(widths[c.key] / 7) : undefined }));
    const cell = (c: Column<T>, row: T): SheetCell => {
      const value = readValue(c, row);
      if (typeof value === "number" || value instanceof Date || typeof value === "boolean") return value;
      if (c.type === "number" && !isBlank(value) && !Number.isNaN(Number(value))) return Number(value);
      return c.type === "date" && !c.format ? (value as SheetCell) : textOf(c, row);
    };
    const data: SheetCell[][] = [];
    const outline: number[] = [];
    const boldRows = new Set<number>();
    if (tree && !selectedOnly) {
      for (const node of flattenTree(tree)) {
        outline.push(node.level);
        if (node.children.length) boldRows.add(data.length);
        data.push(cols.map((c) => (node.children.length && c.aggregate ? (aggregateColumn(c, leafRows(node)) as SheetCell) : cell(c, node.row))));
      }
    } else if (grouped.length && !selectedOnly) {
      const walk = (nodes: GroupNode<T>[]) => {
        for (const node of nodes) {
          boldRows.add(data.length);
          outline.push(node.level);
          data.push(cols.map((c, i) => (i === 0 ? `${node.value || g.blank} (${node.rows.length})` : (aggregateColumn(c, node.rows) as SheetCell))));
          if (node.children) walk(node.children);
          else for (const row of node.rows) { outline.push(node.level + 1); data.push(cols.map((c) => cell(c, row))); }
        }
      };
      walk(groupRows(chosen, grouped));
    } else {
      for (const row of chosen) data.push(cols.map((c) => cell(c, row)));
    }
    const totalsOver = tree && !selectedOnly ? countable : chosen;
    const summary = cols.some((c) => c.aggregate) ? cols.map((c, i) => (c.aggregate ? (aggregateColumn(c, totalsOver) as SheetCell) : i === 0 ? g.total : null)) : undefined;
    const name = exportFileName;
    if (kind === "xlsx") {
      const sheetName = typeof title === "string" ? title : undefined;
      download(buildXlsx({ name: sheetName, columns: sheetColumns, rows: data, outline: outline.length ? outline : undefined, boldRows, totals: summary }) as BlobPart, `${name}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    } else {
      download(buildCsv(sheetColumns, data), `${name}.csv`, "text/csv;charset=utf-8");
    }
  }

  const hasBand = !!(title || chips || actions || bulkActions || searchable || exportable);
  const showControls = controls ?? hasBand;
  const hideable = columns.filter((c) => c.hideable !== false && !groupBy.includes(c.key));
  const hasFooter = visible.some((c) => c.footer !== undefined) || (totals && visible.some((c) => c.aggregate));
  const checked = selectedKeys ?? [];
  const pageKeys = useMemo(() => (dataSource ? [] : tree ? flattenTree(tree).map((node) => node.key) : onPage.map(getRowKey)), [dataSource, onPage, getRowKey, tree]);
  const pageChecked = pageKeys.filter((k) => checked.includes(k)).length;
  const span = visible.length + (renderDetail ? 1 : 0) + (selectable ? 1 : 0);
  const activeFilterCount = Object.values(filters).filter(isFilterActive).length;
  const from = totalRows === 0 ? 0 : paged ? (page - 1) * size + 1 : 1;
  const to = paged ? Math.min(page * size, totalRows) : totalRows;
  const hasMenu = (c: Column<T>) => (filterable && !!filterKind(c)) || pinnable || (groupable && c.groupable !== false) || c.hideable !== false && !!(reorderable || resizable);
  const wantContext = !!(cellSelection || contextMenu || exportable);
  const [menuTarget, setMenuTarget] = useState<{ row: T; column: Column<T> } | null>(null);

  function togglePage(on: boolean) {
    const rest = checked.filter((k) => !pageKeys.includes(k));
    onSelectionChange?.(on ? [...rest, ...pageKeys] : rest);
  }

  function toggleRow(key: Key, on: boolean) {
    onSelectionChange?.(on ? [...checked, key] : checked.filter((k) => k !== key));
  }

  function columnPopover(c: Column<T>) {
    const dir = sorts.find((s) => s.key === c.key)?.direction;
    const canSort = c.sortable !== false && (!server || !!onSortChange);
    const pin = pins[c.key] ?? null;
    const filterOn = isFilterActive(filters[c.key]);
    const label = plainHeader(c);
    return (
      <Popover.Root>
        <Popover.Trigger className="bt-th-menu" data-active={flag(filterOn)} aria-label={`${label}: ${g.columnMenu}`} draggable={false}>
          {filterOn ? <Filter size={13} /> : <Dots size={13} />}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner className="bt-positioner" sideOffset={6} align="start" collisionPadding={8}>
            <Popover.Popup className="bt-popup bt-col-pop">
              {canSort ? (
                <div className="bt-col-row">
                  <Button size="xs" variant={dir === "asc" ? "soft" : "default"} onClick={() => applySort([{ key: c.key, direction: "asc" }])}>{g.sortAsc}</Button>
                  <Button size="xs" variant={dir === "desc" ? "soft" : "default"} onClick={() => applySort([{ key: c.key, direction: "desc" }])}>{g.sortDesc}</Button>
                  {dir ? <Button size="xs" variant="ghost" onClick={() => applySort(sorts.filter((s) => s.key !== c.key))}>{t.clear}</Button> : null}
                </div>
              ) : null}
              {filterable && filterKind(c) ? (
                <div className="bt-col-sec">
                  <b>{g.filter}</b>
                  <FilterPanel column={c} rows={rows} filter={filters[c.key]} onChange={(next) => setColumnFilter(c.key, next)} />
                  {filterOn ? <Button size="xs" variant="ghost" onClick={() => setColumnFilter(c.key, undefined)}>{g.clearFilter}</Button> : null}
                </div>
              ) : null}
              {pinnable ? (
                <div className="bt-col-sec">
                  <b>{g.pin}</b>
                  <div className="bt-col-row">
                    <Button size="xs" variant={pin === "left" ? "soft" : "default"} onClick={() => setPins({ ...pins, [c.key]: "left" })}>{g.pinLeft}</Button>
                    <Button size="xs" variant={pin === "right" ? "soft" : "default"} onClick={() => setPins({ ...pins, [c.key]: "right" })}>{g.pinRight}</Button>
                    {pin ? <Button size="xs" variant="ghost" onClick={() => setPins({ ...pins, [c.key]: null })}>{g.unpin}</Button> : null}
                  </div>
                </div>
              ) : null}
              <div className="bt-col-sec">
                <div className="bt-col-row">
                  {groupable && c.groupable !== false ? <Button size="xs" onClick={() => changeGroupBy([...groupBy, c.key])}>{g.groupBy}</Button> : null}
                  {reorderable ? <Button size="xs" aria-label={g.moveLeft} onClick={() => shiftColumn(c.key, -1)}>←</Button> : null}
                  {reorderable ? <Button size="xs" aria-label={g.moveRight} onClick={() => shiftColumn(c.key, 1)}>→</Button> : null}
                  {resizable ? <Button size="xs" onClick={() => autoSize(c)}>{g.autoSize}</Button> : null}
                  {c.hideable !== false && visible.length > 1 ? <Button size="xs" variant="ghost" onClick={() => toggleColumn(c.key, false)}>{g.hide}</Button> : null}
                </div>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  const [dropOn, setDropOn] = useState<string | null>(null);
  const dragKey = useRef<string | null>(null);
  const dragProps = (c: Column<T>) => (reorderable ? {
    draggable: true,
    onDragStart: (e: DragEvent) => { dragKey.current = c.key; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", c.key); },
    onDragOver: (e: DragEvent) => { if (dragKey.current) { e.preventDefault(); setDropOn(c.key); } },
    onDragLeave: () => setDropOn((k) => (k === c.key ? null : k)),
    onDrop: (e: DragEvent) => { e.preventDefault(); if (dragKey.current) moveColumn(dragKey.current, c.key); dragKey.current = null; setDropOn(null); },
    onDragEnd: () => { dragKey.current = null; setDropOn(null); },
  } : {});

  const pinAttrs = (c: Column<T>) => ({
    "data-pin": pins[c.key] ?? undefined,
    "data-pin-edge": flag(c.key === lastLeftPin || c.key === firstRightPin),
    style: pinStyle.get(c.key),
  });

  const utilityPin = hasPins ? "left" : undefined;

  function renderEditor(column: Column<T>) {
    if (!editing) return null;
    const onKey = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Escape") { setEditing(null); tableRef.current?.focus({ preventScroll: true }); }
      else if (e.key === "Enter") { e.preventDefault(); commitEdit({ r: step(editing.r, e.shiftKey ? -1 : 1), c: editing.c }); }
      else if (e.key === "Tab") { e.preventDefault(); commitEdit({ r: editing.r, c: editing.c + (e.shiftKey ? -1 : 1) }); }
    };
    const common = { autoFocus: true, className: "bt-cell-edit", value: editing.text, "aria-label": plainHeader(column), "aria-invalid": editing.error ? true : undefined, title: editing.error, onKeyDown: onKey, onBlur: () => commitEdit() };
    if (column.options) {
      return (
        <select {...common} onChange={(e) => setEditing({ ...editing, text: e.target.value, error: undefined })}>
          {column.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    return <input {...common} type={column.type === "date" ? "date" : "text"} inputMode={column.type === "number" ? "decimal" : undefined} onChange={(e) => setEditing({ ...editing, text: e.target.value, error: undefined })} onFocus={(e) => { if (e.target.type === "text") e.target.setSelectionRange(e.target.value.length, e.target.value.length); }} />;
  }

  function renderRow(item: Display<T>, r: number) {
    const rowIndex = interactive || virtual ? r + 2 : undefined;
    if (item.kind === "pending") {
      return (
        <tr key={`p-${item.index}`} data-pending="" aria-rowindex={rowIndex}>
          {selectable ? <td data-select="" /> : null}
          {renderDetail ? <td /> : null}
          {visible.map((c) => <td key={c.key}><span className="bt-skeleton" style={{ width: "62%" }} /></td>)}
        </tr>
      );
    }
    if (item.kind === "detail") {
      return (
        <tr key={`${item.key}-detail`} data-detail="">
          <td className="bt-detail" colSpan={span} style={virtual ? { height: detailHeight } : undefined}>
            <div style={virtual ? { maxHeight: detailHeight - 26, overflow: "auto" } : undefined}>{renderDetail?.(item.row)}</div>
          </td>
        </tr>
      );
    }
    if (item.kind === "group") {
      const { node, open } = item;
      return (
        <tr key={`g-${node.key}`} data-r={r} data-group="" aria-rowindex={rowIndex}>
          {selectable ? <td data-select="" /> : null}
          {renderDetail ? <td /> : null}
          {visible.map((c, i) => {
            const summary = i === 0 ? null : aggregateColumn(c, node.rows);
            const isActive = active?.r === r && active.c === i;
            return (
              <td key={c.key} id={`${uid}-${r}-${i}`} data-c={i} data-col={c.key} data-align={i === 0 ? undefined : c.align} data-active-cell={flag(isActive)} {...pinAttrs(c)}>
                {i === 0 ? (
                  <span className="bt-group-label" style={{ paddingLeft: node.level * 18 }}>
                    <button type="button" className="bt-detail-toggle" aria-expanded={open} aria-label={`${plainHeader(node.column)}: ${node.value || g.blank}`} onClick={() => toggleGroup(node.key)}><ChevronRight size={14} /></button>
                    <span>{node.value || g.blank}</span>
                    <small>{node.rows.length}</small>
                  </span>
                ) : summary === undefined || summary === null ? null : (c.format ? c.format(summary, node.rows[0]) : typeof summary === "number" ? summary.toLocaleString(t.lang, { maximumFractionDigits: 2 }) : String(summary))}
              </td>
            );
          })}
        </tr>
      );
    }
    const { row, key, node } = item;
    const open = expanded.has(key);
    const parent = !!node && canOpen(row, node);
    const treeIsOpen = !!node && parent && (filtering || treeOpen(key, node.level));
    const leaves = node && node.children.length ? leafRows(node) : null;
    const isSelected = selectedKey !== undefined && selectedKey === key;
    const isChecked = checked.includes(key);
    return (
      <tr
        key={key}
        data-row=""
        data-r={r}
        data-clickable={flag(onRowClick)}
        data-selected={flag(isSelected || isChecked)}
        aria-current={isSelected ? "true" : undefined}
        aria-rowindex={rowIndex}
        aria-level={interactive && node ? node.level + 1 : undefined}
        aria-expanded={interactive && parent ? treeIsOpen : undefined}
        data-tree-parent={flag(leaves)}
        className={rowClassName?.(row)}
        tabIndex={onRowClick && !interactive ? 0 : undefined}
        onClick={onRowClick ? (e) => { if (!multi && !(e.target as HTMLElement).closest("input, select, button, a, label")) onRowClick(row); } : undefined}
        onKeyDown={onRowClick && !interactive ? (e) => { if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) { e.preventDefault(); onRowClick(row); } } : undefined}
      >
        {selectable ? (
          <td data-select="" data-pin={utilityPin} style={utilityPin ? { left: 0 } : undefined} onClick={(e) => e.stopPropagation()}>
            <Checkbox aria-label={t.selectRow} checked={isChecked} onChange={(on) => toggleRow(key, on)} />
          </td>
        ) : null}
        {renderDetail ? (
          <td data-pin={utilityPin} style={utilityPin ? { left: selectable ? UTILITY.select : 0 } : undefined}>
            <button type="button" className="bt-detail-toggle" aria-label={t.showDetail} aria-expanded={open} onClick={(e) => { e.stopPropagation(); toggleDetail(key); }}>
              <ChevronRight size={14} />
            </button>
          </td>
        ) : null}
        {visible.map((c, i) => {
          const isEditing = editing?.r === r && editing.c === i;
          const inRange = !!bounds && r >= bounds.top && r <= bounds.bottom && i >= bounds.left && i <= bounds.right;
          const isActive = active?.r === r && active.c === i;
          const rollup = leaves && c.aggregate ? aggregateColumn(c, leaves) : undefined;
          const shown = rollup !== undefined ? (c.format ? c.format(rollup, row) : typeof rollup === "number" ? rollup.toLocaleString(t.lang, { maximumFractionDigits: 2 }) : (rollup as ReactNode)) : c.cell ? c.cell(row) : (c.format ? textOf(c, row) : (readValue(c, row) as ReactNode));
          const value = node && i === 0 ? (
            <span className="bt-tree-label" style={{ paddingLeft: node.level * 18 }}>
              {parent ? (
                <button type="button" className="bt-detail-toggle" aria-expanded={treeIsOpen} aria-label={t.showDetail} onClick={(e) => { e.stopPropagation(); void toggleTree(row, key, node.level); }}>
                  {loadingKeys.has(key) ? <span className="bt-btn-spin" aria-hidden="true" /> : <ChevronRight size={14} />}
                </button>
              ) : <span className="bt-tree-gap" />}
              <span className="bt-tree-text">{shown}</span>
            </span>
          ) : shown;
          const handleHere = hasEditable && !!bounds && !editing && !fillTarget && r === bounds.bottom && i === bounds.right;
          const inFill = !!fillArea && !!bounds && (fillArea.axis === "rows" ? r >= fillArea.from && r <= fillArea.to && i >= bounds.left && i <= bounds.right : i >= fillArea.from && i <= fillArea.to && r >= bounds.top && r <= bounds.bottom);
          return (
            <td
              key={c.key}
              id={`${uid}-${r}-${i}`}
              role={interactive ? "gridcell" : undefined}
              aria-selected={interactive ? inRange : undefined}
              data-c={i}
              data-col={c.key}
              data-align={c.align}
              data-range={flag(inRange && multi)}
              data-active-cell={flag(isActive)}
              data-editable={flag(hasEditable && canEdit({ r, c: i }))}
              data-fill={flag(inFill)}
              onDoubleClick={() => startEdit({ r, c: i })}
              {...pinAttrs(c)}
            >
              {isEditing ? renderEditor(c) : value}
              {handleHere ? <span className="bt-fill-handle" aria-hidden="true" title={g.fillHint} /> : null}
            </td>
          );
        })}
      </tr>
    );
  }

  const rendered: ReactNode[] = [];
  for (let r = first; r < last; r++) {
    const item = at(r);
    if (item) rendered.push(renderRow(item, r));
  }

  const statusBar = stats ? (
    <span className="bt-status-bar">
      <span>{g.count}: <b>{stats.cells}</b></span>
      {stats.numbers.length ? (
        <>
          <span>{g.sum}: <b>{(aggregate("sum", stats.numbers) as number).toLocaleString(t.lang, { maximumFractionDigits: 2 })}</b></span>
          <span>{g.average}: <b>{(aggregate("avg", stats.numbers) as number).toLocaleString(t.lang, { maximumFractionDigits: 2 })}</b></span>
          <span>{g.min}: <b>{(aggregate("min", stats.numbers) as number).toLocaleString(t.lang)}</b></span>
          <span>{g.max}: <b>{(aggregate("max", stats.numbers) as number).toLocaleString(t.lang)}</b></span>
        </>
      ) : null}
    </span>
  ) : null;

  const scrollArea = (
    <div
      className="bt-table-scroll"
      ref={scroller}
      onScroll={onScroll}
      onContextMenu={onCellContextMenu}
      onContextMenuCapture={(e) => {
        const cell = cellFrom(e);
        const item = cell ? at(cell.r) : null;
        setMenuTarget(cell && item?.kind === "row" ? { row: item.row, column: visible[cell.c] } : null);
      }}
      style={maxHeight !== undefined ? { maxHeight } : virtual ? { maxHeight: 520 } : undefined}
    >
      <table
        ref={tableRef}
        className={cx("bt-table", loading && count > 0 && "bt-table-loading")}
        role={interactive ? (isTree ? "treegrid" : "grid") : undefined}
        aria-busy={loading || source.loading || undefined}
        aria-rowcount={interactive || virtual ? (tree ? count : totalRows) + 1 : undefined}
        aria-multiselectable={cellSelection || undefined}
        aria-activedescendant={active ? `${uid}-${active.r}-${active.c}` : undefined}
        aria-label={typeof title === "string" ? title : undefined}
        tabIndex={interactive ? 0 : undefined}
        data-fixed={flag(fixed)}
        data-locked={flag(!fixed && lockedShares)}
        data-virtual={flag(virtual)}
        data-interactive={flag(interactive)}
        style={{ "--bt-row-h": `${lineHeight}px`, minWidth: fixed ? visible.reduce((sum, c) => sum + widthOf(c), utilityWidth) : undefined } as CSSProperties}
        onKeyDown={onGridKey}
        onPaste={onPaste}
        onPointerDown={onCellPointerDown}
        onPointerOver={onCellPointerOver}
      >
        {!fixed && lockedShares ? (
          <colgroup>{lockedShares.map((share, i) => <col key={i} style={{ width: `${share}%` }} />)}</colgroup>
        ) : null}
        {fixed ? (
          <colgroup>
            {selectable ? <col style={{ width: UTILITY.select }} /> : null}
            {renderDetail ? <col style={{ width: UTILITY.detail }} /> : null}
            {visible.map((c) => <col key={c.key} style={{ width: widthOf(c) }} />)}
          </colgroup>
        ) : null}
        <thead>
          <tr aria-rowindex={interactive || virtual ? 1 : undefined}>
            {selectable ? (
              <th data-select="" data-pin={utilityPin} style={utilityPin ? { left: 0 } : undefined}>
                <Checkbox aria-label={t.selectAll} checked={pageKeys.length > 0 && pageChecked === pageKeys.length} indeterminate={pageChecked > 0 && pageChecked < pageKeys.length} onChange={togglePage} />
              </th>
            ) : null}
            {renderDetail ? <th data-pin={utilityPin} style={utilityPin ? { left: selectable ? UTILITY.select : 0 } : undefined}><span className="bt-sr">{t.showDetail}</span></th> : null}
            {visible.map((c) => {
              const canSort = c.sortable !== false && (!server || !!onSortChange);
              const index = sorts.findIndex((s) => s.key === c.key);
              const dir = index >= 0 ? sorts[index].direction : null;
              return (
                <th
                  key={c.key}
                  data-key={c.key}
                  data-col={c.key}
                  data-align={c.align}
                  data-drop={flag(dropOn === c.key)}
                  style={{ ...(!fixed && c.width !== undefined ? { width: c.width } : null), ...pinStyle.get(c.key) }}
                  data-pin={pins[c.key] ?? undefined}
                  data-pin-edge={flag(c.key === lastLeftPin || c.key === firstRightPin)}
                  aria-sort={dir ? (dir === "asc" ? "ascending" : "descending") : undefined}
                  {...dragProps(c)}
                >
                  <span className="bt-th">
                    {canSort ? (
                      <button type="button" className="bt-sort" onClick={(e) => toggleSort(c.key, e.shiftKey)} title={g.sortHint}>
                        <span className="bt-th-text">{c.header}</span>
                        <span className="bt-sort-mark" aria-hidden="true">{dir === "asc" ? "▲" : dir === "desc" ? "▼" : "↕"}</span>
                        {sorts.length > 1 && index >= 0 ? <sup className="bt-sort-rank">{index + 1}</sup> : null}
                      </button>
                    ) : <span className="bt-th-text">{c.header}</span>}
                    {hasMenu(c) ? columnPopover(c) : isFilterActive(filters[c.key]) ? <Filter size={13} /> : null}
                  </span>
                  {resizable ? (
                    <span
                      className="bt-resize"
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`${plainHeader(c)}: ${g.resize}`}
                      aria-valuenow={widthOf(c)}
                      tabIndex={0}
                      onPointerDown={(e) => startResize(e, c)}
                      onDoubleClick={() => autoSize(c)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                        e.preventDefault();
                        const base = (e.currentTarget.parentElement as HTMLElement).offsetWidth;
                        setWidths((w) => ({ ...w, [c.key]: Math.max(c.minWidth ?? MIN_WIDTH, base + (e.key === "ArrowRight" ? 16 : -16)) }));
                      }}
                    />
                  ) : null}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {count === 0 && !source.loading ? (
            <tr>
              <td colSpan={span}>{loading ? <Loading /> : <div className="bt-empty">{empty ?? t.empty}</div>}</td>
            </tr>
          ) : count === 0 ? (
            <tr><td colSpan={span}><Loading /></td></tr>
          ) : (
            <>
              {virtual && first > 0 ? <tr aria-hidden="true" data-spacer=""><td colSpan={span} style={{ height: offsetOf(first), padding: 0, border: 0 }} /></tr> : null}
              {rendered.map((node, i) => <Fragment key={i}>{node}</Fragment>)}
              {virtual && last < count ? <tr aria-hidden="true" data-spacer=""><td colSpan={span} style={{ height: totalHeight - offsetOf(last), padding: 0, border: 0 }} /></tr> : null}
            </>
          )}
        </tbody>
        {hasFooter ? (
          <tfoot>
            <tr>
              {selectable ? <td /> : null}
              {renderDetail ? <td /> : null}
              {visible.map((c, i) => {
                const auto = totals && c.aggregate ? aggregateColumn(c, countable) : undefined;
                const text = c.footer ?? (auto === undefined || auto === null ? (totals && i === 0 ? g.total : null) : c.format ? c.format(auto, processed[0]) : typeof auto === "number" ? auto.toLocaleString(t.lang, { maximumFractionDigits: 2 }) : String(auto));
                return <td key={c.key} data-align={c.align} {...pinAttrs(c)}>{text}</td>;
              })}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );

  return (
    <section className={cx("bt-table-card", className)} data-density={compact ? "compact" : "comfortable"}>
      {hasBand || showControls ? (
        <div className="bt-band" data-tone={bandTone}>
          {title ? (
            <span className="bt-band-title">
              {icon}
              <b>{title}</b>
              {titleNote !== undefined ? <small>({titleNote})</small> : null}
            </span>
          ) : null}
          {searchable ? <SearchInput value={searchText} onChange={(e) => changeSearch(e.target.value)} className="bt-band-search" /> : null}
          {checked.length > 0 && bulkActions ? (
            <span className="bt-band-bulk">
              {t.selected(checked.length)}
              {paged && !server && pageKeys.length > 0 && pageChecked === pageKeys.length && checked.length < processed.length ? (
                <Button size="xs" variant="ghost" onClick={() => onSelectionChange?.(processed.map(getRowKey))}>{g.selectAllRows(processed.length)}</Button>
              ) : null}
              {bulkActions}
            </span>
          ) : chips}
          {grouped.map((c) => (
            <span key={c.key} className="bt-tag">
              {plainHeader(c)}
              <button type="button" aria-label={`${g.ungroup}: ${plainHeader(c)}`} onClick={() => changeGroupBy(groupBy.filter((k) => k !== c.key))}><Close size={11} /></button>
            </span>
          ))}
          {grouped.length ? (
            <Button size="xs" variant="ghost" onClick={() => setClosedGroups(closedGroups.size ? new Set() : new Set(allGroupKeys()))}>{closedGroups.size ? g.expandAll : g.collapseAll}</Button>
          ) : null}
          {activeFilterCount ? (
            <Button size="xs" variant="ghost" onClick={() => changeFilters({})}>{g.clearFilters(activeFilterCount)}</Button>
          ) : null}
          <span className="bt-band-space" />
          {source.loading ? <Spinner size={16} /> : null}
          {exportable ? (
            <Menu trigger={<Button variant="ghost" icon={<Download size={14} />}>{g.export}</Button>}>
              <MenuItem onClick={() => void exportAs("xlsx")}>{g.exportExcel}</MenuItem>
              <MenuItem onClick={() => void exportAs("csv")}>{g.exportCsv}</MenuItem>
              {selectable && checked.length > 0 ? <MenuSeparator /> : null}
              {selectable && checked.length > 0 ? <MenuItem onClick={() => void exportAs("xlsx", true)}>{g.exportSelected(checked.length)}</MenuItem> : null}
            </Menu>
          ) : null}
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
                          const lastOne = isOn && visible.length === 1;
                          return <Checkbox key={c.key} checked={isOn} disabled={lastOne} onChange={(on) => toggleColumn(c.key, on)} label={c.header} />;
                        })}
                      </div>
                      <div className="bt-columns-foot">
                        <Button fullWidth onClick={resetLayout}>{t.resetColumns}</Button>
                      </div>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
              <Button variant="ghost" icon={<Filter size={14} />} title={t.density} aria-pressed={compact} onClick={() => setCompact(!compact)}>
                {compact ? t.compact : t.comfortable}
              </Button>
            </>
          ) : null}
          {actions}
        </div>
      ) : null}
      {wantContext ? (
        <ContextMenu.Root>
          <ContextMenu.Trigger render={<div className="bt-table-context" />}>{scrollArea}</ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Positioner className="bt-positioner">
              <ContextMenu.Popup className="bt-popup bt-menu">
                {cellSelection ? <ContextMenu.Item className="bt-menu-item" onClick={() => copy()}>{g.copy}</ContextMenu.Item> : null}
                {cellSelection ? <ContextMenu.Item className="bt-menu-item" onClick={() => copy(true)}>{g.copyWithHeaders}</ContextMenu.Item> : null}
                {cellSelection ? (
                  <ContextMenu.Item className="bt-menu-item" onClick={() => { const next = chartFromRange(); if (next) setChart(next); }} disabled={!chartFromRange()} title={chartFromRange() ? undefined : g.chartNeedsNumbers}>{g.makeChart}</ContextMenu.Item>
                ) : null}
                {exportable ? <ContextMenu.Separator className="bt-menu-sep" /> : null}
                {exportable ? <ContextMenu.Item className="bt-menu-item" onClick={() => void exportAs("xlsx")}>{g.exportExcel}</ContextMenu.Item> : null}
                {menuTarget && contextMenu ? contextMenu(menuTarget).map((item, i) => (
                  <ContextMenu.Item key={i} className="bt-menu-item" data-danger={flag(item.danger)} disabled={item.disabled} onClick={item.onClick}>{item.icon}{item.label}</ContextMenu.Item>
                )) : null}
              </ContextMenu.Popup>
            </ContextMenu.Positioner>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      ) : scrollArea}
      {chart ? (
        <Modal open onClose={() => setChart(null)} title={g.chartTitle} size="lg">
          <SelectionChart {...chart} />
        </Modal>
      ) : null}
      {paged || footerNote || virtual || stats ? (
        <div className="bt-table-foot">
          <span>{statusBar ?? footerNote ?? (paged || virtual ? t.records(from, to, totalRows) : null)}</span>
          <span className="bt-table-foot-end">
            {pageSizeOptions && paged ? (
              <Select size="sm" aria-label={g.rowsPerPage} value={String(size)} onChange={(next) => { setOwnPageSize(Number(next)); setOwnPage(1); server?.onPageSizeChange?.(Number(next)); }} options={pageSizeOptions.map((n) => ({ value: String(n), label: g.perPage(n) }))} />
            ) : null}
            {paged && pageCount > 1 ? <Pagination page={page} pageCount={pageCount} onChange={goTo} /> : null}
          </span>
        </div>
      ) : null}
    </section>
  );
}
