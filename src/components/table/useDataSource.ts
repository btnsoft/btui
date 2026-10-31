import { useCallback, useEffect, useRef, useState } from "react";
import type { Filters, SortState } from "./engine";

export type DataQuery = { sorts: SortState[]; filters: Filters; search: string };
export type DataRequest = DataQuery & { start: number; end: number; signal: AbortSignal };
export type DataResponse<T> = { rows: T[]; total: number };

/** Server row model: the table asks for the block of rows it is about to show. */
export type DataSource<T> = { getRows: (request: DataRequest) => Promise<DataResponse<T>>; blockSize?: number };

const DEFAULT_BLOCK = 100;

export function useDataSource<T>(source: DataSource<T> | undefined, query: DataQuery) {
  const block = source?.blockSize ?? DEFAULT_BLOCK;
  const blocks = useRef(new Map<number, T[]>());
  const pending = useRef(new Map<number, AbortController>());
  const [total, setTotal] = useState(0);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(!!source);
  const key = JSON.stringify(query);
  const ref = useRef({ source, query, key, block });
  ref.current = { source, query, key, block };

  const fetchBlock = useCallback((index: number) => {
    const { source: current, query: q, block: size } = ref.current;
    if (!current || blocks.current.has(index) || pending.current.has(index)) return;
    const controller = new AbortController();
    pending.current.set(index, controller);
    setLoading(true);
    current.getRows({ ...q, start: index * size, end: (index + 1) * size, signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        blocks.current.set(index, response.rows);
        setTotal(response.total);
      })
      .catch((error) => { if (!controller.signal.aborted) console.error(error); })
      .finally(() => {
        if (controller.signal.aborted) return;
        pending.current.delete(index);
        setLoading(pending.current.size > 0);
        setVersion((v) => v + 1);
      });
  }, []);

  // A new query makes every cached block stale. A short wait lets typing finish first.
  useEffect(() => {
    if (!source) return;
    const running = pending.current;
    running.forEach((controller) => controller.abort());
    running.clear();
    blocks.current.clear();
    const timer = setTimeout(() => { fetchBlock(0); setVersion((v) => v + 1); }, 200);
    return () => clearTimeout(timer);
  }, [source, key, fetchBlock]);

  const rowAt = useCallback((index: number) => blocks.current.get(Math.floor(index / block))?.[index % block], [block, version]);

  const ensure = useCallback((start: number, end: number) => {
    for (let i = Math.floor(start / block); i <= Math.floor(Math.max(start, end - 1) / block); i++) fetchBlock(i);
  }, [block, fetchBlock]);

  /** Every row for the current query, for exports. */
  const all = useCallback(async () => {
    const { source: current, query: q } = ref.current;
    if (!current) return [] as T[];
    const size = 1000;
    const rows: T[] = [];
    for (let start = 0; ; start += size) {
      const response = await current.getRows({ ...q, start, end: start + size, signal: new AbortController().signal });
      rows.push(...response.rows);
      if (response.rows.length === 0 || rows.length >= response.total) return rows;
    }
  }, []);

  return { total, rowAt, ensure, all, loading, version };
}
