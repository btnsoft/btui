import { useEffect, useLayoutEffect, useMemo, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { useLocale } from "../locale";
import { cx, flag } from "../utils";
import { Button } from "./button";

export type ChartSeries<D> = {
  key: string;
  label: string;
  /** Reads the number. Defaults to the field named `key`. */
  value?: (datum: D) => number | null | undefined;
  /** Colour slot from 1 to 8. Set it when series can be filtered, so each keeps its colour. Defaults to the position. */
  slot?: number;
};

type ChartBase<D> = {
  data: D[];
  /** Label on the category axis. */
  x: (datum: D) => string;
  series: ChartSeries<D>[];
  /** Short description for assistive technology, such as "Monthly sales by region". */
  label: string;
  height?: number;
  /** Formats numbers in tooltips, labels and the table. */
  format?: (value: number) => string;
  /** Entrance and update motion. Always off for people who ask for reduced motion. */
  animated?: boolean;
  className?: string;
};

const CHART_PAD = { top: 10, right: 12, bottom: 26, left: 8 };
const MAX_SLOTS = 8;
const MAX_BAR = 24;

/** Bars rise one after another, but the whole entrance stays quick however many there are. */
const stagger = (index: number, count: number) => `${Math.round((index / Math.max(1, count)) * 260)}ms`;

const slotOf = (index: number, slot?: number) => `var(--bt-chart-${slot ?? (index % MAX_SLOTS) + 1})`;

/** Round axis ticks that cover the range. Bars and areas need zero; a line may leave it out. */
export function niceTicks(minValue: number, maxValue: number, count = 5, zero = true) {
  const low = zero ? Math.min(0, minValue) : minValue;
  const high = zero ? Math.max(0, maxValue) : maxValue;
  if (low === high) return zero ? [0, 1] : [low - 1, low, low + 1];
  const rough = (high - low) / Math.max(1, count - 1);
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((n) => n * power).find((n) => n >= rough) ?? 10 * power;
  const start = Math.floor(low / step) * step;
  const end = Math.ceil(high / step) * step;
  const ticks: number[] = [];
  for (let tick = start; tick <= end + step / 2; tick += step) ticks.push(Number(tick.toFixed(10)));
  return ticks;
}

/** Unbroken stretches of a series, as lists of indexes. */
function runsOf(values: Array<number | null>) {
  const runs: number[][] = [];
  let current: number[] = [];
  values.forEach((value, i) => {
    if (value === null) {
      if (current.length) runs.push(current);
      current = [];
    } else current.push(i);
  });
  if (current.length) runs.push(current);
  return runs;
}

const read = <D,>(series: ChartSeries<D>, datum: D) => {
  const value = series.value ? series.value(datum) : (datum as Record<string, unknown>)[series.key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

function useWidth() {
  // A callback ref: the plot unmounts for the table view and for empty data.
  const [el, ref] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  return [ref, width] as const;
}

function useFormatters(format?: (value: number) => string) {
  const t = useLocale();
  return useMemo(() => {
    const plain = new Intl.NumberFormat(t.lang, { maximumFractionDigits: 2 });
    const compact = new Intl.NumberFormat(t.lang, { notation: "compact", maximumFractionDigits: 1 });
    return { full: format ?? ((n: number) => plain.format(n)), short: (n: number) => compact.format(n) };
  }, [t.lang, format]);
}

function Legend<D>({ series, keyShape }: { series: ChartSeries<D>[]; keyShape: "box" | "line" }) {
  if (series.length < 2) return null;
  return (
    <ul className="bt-legend">
      {series.map((s, i) => (
        <li key={s.key}>
          <i data-shape={keyShape} style={{ background: slotOf(i, s.slot) }} />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

type TipRow = { label: string; value: string; color: string };

function Tooltip({ title, rows, x, y, width }: { title: string; rows: TipRow[]; x: number; y: number; width: number }) {
  const flip = x > width - 170;
  return (
    <div className="bt-chart-tip" role="status" style={{ top: y, left: flip ? undefined : x + 12, right: flip ? width - x + 12 : undefined }}>
      <span className="bt-chart-tip-title">{title}</span>
      {rows.map((row) => (
        <span key={row.label} className="bt-chart-tip-row">
          <i style={{ background: row.color }} />
          <b>{row.value}</b>
          <span>{row.label}</span>
        </span>
      ))}
    </div>
  );
}

function DataTableView<D>({ data, x, series, format, caption }: { data: D[]; x: (d: D) => string; series: ChartSeries<D>[]; format: (n: number) => string; caption: string }) {
  return (
    <div className="bt-chart-table">
      <table>
        <caption className="bt-sr">{caption}</caption>
        <thead>
          <tr><th scope="col" />{series.map((s) => <th key={s.key} scope="col">{s.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((datum, i) => (
            <tr key={i}>
              <th scope="row">{x(datum)}</th>
              {series.map((s) => { const value = read(s, datum); return <td key={s.key}>{value === null ? "" : format(value)}</td>; })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type FrameProps<D> = ChartBase<D> & {
  keyShape: "box" | "line";
  children: (size: { width: number; height: number }) => ReactNode;
  /** Number of positions the keyboard can step through. */
  positions: number;
  active: number | null;
  setActive: (index: number | null) => void;
};

function ChartFrame<D>({ data, x, series, label, height = 260, format, keyShape, animated = true, className, children, positions, active, setActive }: FrameProps<D>) {
  const t = useLocale();
  const [ref, width] = useWidth();
  const [table, setTable] = useState(false);
  const { full } = useFormatters(format);

  function onKey(e: KeyboardEvent) {
    if (positions === 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setActive(active === null ? 0 : Math.min(positions - 1, active + 1)); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setActive(active === null ? positions - 1 : Math.max(0, active - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(positions - 1); }
    else if (e.key === "Escape") setActive(null);
  }

  return (
    <figure className={cx("bt-chart", className)} data-animated={flag(animated)}>
      <figcaption className="bt-sr">{label}</figcaption>
      <div className="bt-chart-head">
        <Legend series={series} keyShape={keyShape} />
        <Button size="xs" variant="ghost" aria-pressed={table} onClick={() => setTable(!table)}>{table ? t.chart.showChart : t.chart.showTable}</Button>
      </div>
      {data.length === 0 ? (
        <div className="bt-empty" style={{ height }}>{t.chart.empty}</div>
      ) : table ? (
        <DataTableView data={data} x={x} series={series} format={full} caption={label} />
      ) : (
        <div ref={ref} className="bt-chart-plot" style={{ height }} role="group" aria-label={label} tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}>
          {width > 0 ? children({ width, height }) : null}
        </div>
      )}
    </figure>
  );
}

function Grid({ ticks, y, left, right, short, zero }: { ticks: number[]; y: (v: number) => number; left: number; right: number; short: (n: number) => string; zero?: boolean }) {
  return (
    <g aria-hidden="true">
      {ticks.map((tick) => (
        <g key={tick}>
          <line className={tick === 0 && zero ? "bt-chart-axis" : "bt-chart-grid"} x1={left} x2={right} y1={y(tick)} y2={y(tick)} />
          <text className="bt-chart-tick" x={left - 8} y={y(tick)} dy="0.32em" textAnchor="end">{short(tick)}</text>
        </g>
      ))}
    </g>
  );
}

/** Thins category labels until they stop colliding. */
function labelStep(slot: number, longest: number) {
  return Math.max(1, Math.ceil((longest * 6.6 + 14) / Math.max(1, slot)));
}

export type BarChartProps<D> = ChartBase<D> & {
  /** Piles the series on top of each other. */
  stacked?: boolean;
  /** Bars run sideways. Suits long category names. */
  horizontal?: boolean;
};

export function BarChart<D>(props: BarChartProps<D>) {
  const { data, x, series, format, stacked, horizontal } = props;
  const [active, setActive] = useState<number | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const { full, short } = useFormatters(format);
  const totals = data.map((d) => series.reduce((sum, s) => sum + Math.max(0, read(s, d) ?? 0), 0));
  const values = data.flatMap((d) => series.map((s) => read(s, d) ?? 0));
  const ticks = niceTicks(Math.min(0, ...values), stacked ? Math.max(0, ...totals) : Math.max(0, ...values));
  const longest = Math.max(1, ...data.map((d) => x(d).length));
  const tipFor = (index: number) => series.flatMap((s, i) => { const value = read(s, data[index]); return value === null ? [] : [{ label: s.label, value: full(value), color: slotOf(i, s.slot) }]; });

  return (
    <ChartFrame {...props} keyShape="box" positions={data.length} active={active} setActive={setActive}>
      {({ width, height }) => {
        const low = ticks[0];
        const high = ticks[ticks.length - 1];
        const labelWidth = horizontal ? Math.min(150, longest * 6.6 + 12) : Math.max(...ticks.map((tick) => short(tick).length)) * 6.6 + 12;
        const left = CHART_PAD.left + labelWidth;
        const right = width - CHART_PAD.right - (horizontal ? 40 : 0);
        const top = CHART_PAD.top;
        const bottom = height - CHART_PAD.bottom;
        const scale = (v: number) => ((v - low) / (high - low || 1));
        const band = (horizontal ? bottom - top : right - left) / Math.max(1, data.length);
        const groups = stacked ? 1 : series.length;
        const thick = Math.min(MAX_BAR, Math.max(2, (band * 0.72 - (groups - 1) * 2) / groups));
        // A few categories all keep a label, shortened to fit; many thin out instead.
        const few = !horizontal && data.length <= 12;
        const step = few ? 1 : labelStep(band, longest);
        const room = Math.max(3, Math.floor((band - 6) / 6.4));
        const shorten = (text: string) => (few && text.length > room ? `${text.slice(0, room - 1)}…` : text);
        const onMove = (e: PointerEvent<SVGSVGElement>) => {
          const box = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - box.left;
          const py = e.clientY - box.top;
          const at = Math.floor((horizontal ? py - top : px - left) / band);
          setPointer({ x: px, y: Math.min(py, height - 90) });
          setActive(at >= 0 && at < data.length ? at : null);
        };
        const pos = active === null ? pointer : horizontal
          ? { x: left + (right - left) * 0.5, y: Math.min(top + band * active, height - 90) }
          : { x: left + band * (active + 0.5), y: top };
        return (
          <>
            <svg width={width} height={height} onPointerMove={onMove} onPointerLeave={() => setActive(null)} aria-hidden="true">
              {horizontal ? (
                <g>
                  {ticks.map((tick) => {
                    const gx = left + scale(tick) * (right - left);
                    return (
                      <g key={tick}>
                        <line className={tick === 0 ? "bt-chart-axis" : "bt-chart-grid"} x1={gx} x2={gx} y1={top} y2={bottom} />
                        <text className="bt-chart-tick" x={gx} y={bottom + 16} textAnchor="middle">{short(tick)}</text>
                      </g>
                    );
                  })}
                </g>
              ) : <Grid ticks={ticks} y={(v) => bottom - scale(v) * (bottom - top)} left={left} right={right} short={short} zero />}
              {data.map((d, index) => {
                const centre = (horizontal ? top : left) + band * (index + 0.5);
                let stack = 0;
                return (
                  <g key={index} data-active={flag(active === index)} className="bt-chart-band">
                    {active === index ? <rect className="bt-chart-hover" x={horizontal ? left : left + band * index} y={horizontal ? top + band * index : top} width={horizontal ? right - left : band} height={horizontal ? band : bottom - top} /> : null}
                    {series.map((s, i) => {
                      const value = read(s, d) ?? 0;
                      const from = stacked ? stack : 0;
                      const to = from + value;
                      if (stacked) stack = to;
                      const offset = stacked ? -thick / 2 : -((thick + 2) * groups - 2) / 2 + (thick + 2) * i;
                      const a = Math.min(scale(from), scale(to));
                      const b = Math.max(scale(from), scale(to));
                      const span = horizontal ? right - left : bottom - top;
                      // The 2px surface gap keeps stacked segments apart.
                      const size = Math.max(0, (b - a) * span - (stacked && i > 0 ? 2 : 0));
                      return horizontal
                        ? <rect key={s.key} className="bt-chart-bar" data-dir="x" style={{ animationDelay: stagger(index, data.length) }} x={left + a * span} y={centre + offset} width={size} height={thick} fill={slotOf(i, s.slot)} rx={1} />
                        : <rect key={s.key} className="bt-chart-bar" data-dir={value < 0 ? "down" : "y"} style={{ animationDelay: stagger(index, data.length) }} x={centre + offset} y={bottom - b * span} width={thick} height={size} fill={slotOf(i, s.slot)} rx={1} />;
                    })}
                    {horizontal ? (
                      <text className="bt-chart-tick" x={left - 8} y={centre} dy="0.32em" textAnchor="end">{x(d).length > 22 ? `${x(d).slice(0, 21)}…` : x(d)}</text>
                    ) : index % step === 0 ? (
                      <text className="bt-chart-tick" x={centre} y={bottom + 16} textAnchor="middle">{shorten(x(d))}</text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
            {active !== null ? <Tooltip title={x(data[active])} rows={tipFor(active)} x={pos.x} y={pos.y} width={width} /> : null}
          </>
        );
      }}
    </ChartFrame>
  );
}

export type LineChartProps<D> = ChartBase<D> & {
  /** Fills under each line with a light wash. */
  area?: boolean;
  /** Piles the areas. Use only when the total means something. */
  stacked?: boolean;
  /** `false` lets a line axis start near the data, for values that sit close together. Ignored with `area`. */
  zero?: boolean;
};

export function LineChart<D>(props: LineChartProps<D>) {
  const { data, x, series, format, area, stacked, zero = true } = props;
  const [active, setActive] = useState<number | null>(null);
  const { full, short } = useFormatters(format);
  const cumulative = useMemo(() => {
    const running = data.map(() => 0);
    return series.map((s) => data.map((d, i) => {
      const value = read(s, d);
      if (value === null) return null;
      if (!stacked) return value;
      running[i] += value;
      return running[i];
    }));
  }, [data, series, stacked]);
  const all = cumulative.flat().filter((v): v is number => v !== null);
  const keepZero = zero || !!area;
  const ticks = niceTicks(keepZero ? Math.min(0, ...all) : Math.min(...all), keepZero ? Math.max(0, ...all) : Math.max(...all), 5, keepZero);
  const direct = series.length >= 2 && series.length <= 4;
  const longestName = Math.max(...series.map((s) => s.label.length));

  return (
    <ChartFrame {...props} keyShape={area ? "box" : "line"} positions={data.length} active={active} setActive={setActive}>
      {({ width, height }) => {
        const low = ticks[0];
        const high = ticks[ticks.length - 1];
        const roomy = direct && width >= 460;
        const left = CHART_PAD.left + Math.max(...ticks.map((tick) => short(tick).length)) * 6.6 + 12;
        const endRoom = Math.min(120, longestName * 6.4 + 14);
        const endChars = Math.floor((endRoom - 14) / 6.4);
        const right = width - CHART_PAD.right - (roomy ? endRoom : 6);
        const top = CHART_PAD.top;
        const bottom = height - CHART_PAD.bottom;
        const px = (i: number) => left + (data.length < 2 ? (right - left) / 2 : ((right - left) * i) / (data.length - 1));
        const py = (v: number) => bottom - ((v - low) / (high - low || 1)) * (bottom - top);
        const step = labelStep((right - left) / Math.max(1, data.length), Math.max(...data.map((d) => x(d).length)));
        const onMove = (e: PointerEvent<SVGSVGElement>) => {
          const box = e.currentTarget.getBoundingClientRect();
          const at = Math.round(((e.clientX - box.left - left) / (right - left || 1)) * (data.length - 1));
          setActive(Math.max(0, Math.min(data.length - 1, at)));
        };
        const pathOf = (values: Array<number | null>) => {
          let d = "";
          let pen = false;
          values.forEach((v, i) => {
            if (v === null) { pen = false; return; }
            d += `${pen ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`;
            pen = true;
          });
          return d;
        };
        // End labels step apart so close series stay readable.
        const ends = series.map((s, i) => {
          const values = cumulative[i];
          let at = values.length - 1;
          while (at > 0 && values[at] === null) at--;
          return { key: s.key, label: s.label, y: py(values[at] ?? 0), last: at };
        }).sort((a, b) => a.y - b.y);
        ends.forEach((end, i) => { if (i > 0 && end.y - ends[i - 1].y < 14) end.y = ends[i - 1].y + 14; });
        const rows = active === null ? [] : series.flatMap((s, i) => { const value = read(s, data[active]); return value === null ? [] : [{ label: s.label, value: full(value), color: slotOf(i, s.slot) }]; });
        return (
          <>
            <svg width={width} height={height} onPointerMove={onMove} onPointerLeave={() => setActive(null)} aria-hidden="true">
              <Grid ticks={ticks} y={py} left={left} right={right} short={short} zero />
              {data.map((d, i) => (i % step === 0 ? <text key={i} className="bt-chart-tick" x={px(i)} y={bottom + 16} textAnchor="middle">{x(d)}</text> : null))}
              {area ? series.flatMap((s, i) => runsOf(cumulative[i]).map((run) => {
                // A gap in the data is a gap in the fill: each unbroken run closes on its own.
                const base = stacked && i > 0 ? cumulative[i - 1] : null;
                const top = run.map((n, at) => `${at ? "L" : "M"}${px(n).toFixed(1)} ${py(cumulative[i][n]!).toFixed(1)}`).join("");
                const back = [...run].reverse().map((n) => `L${px(n).toFixed(1)} ${py(base?.[n] ?? 0).toFixed(1)}`).join("");
                return <path key={`${s.key}-${run[0]}`} className="bt-chart-wash" d={`${top}${back}Z`} fill={slotOf(i, s.slot)} />;
              })) : null}
              {series.flatMap((s, i) => runsOf(cumulative[i]).filter((run) => run.length === 1).map((run) => <circle key={`${s.key}-${run[0]}`} cx={px(run[0])} cy={py(cumulative[i][run[0]]!)} r={3} fill={slotOf(i, s.slot)} />))}
              {series.map((s, i) => <path key={s.key} className="bt-chart-line" pathLength={1} d={pathOf(cumulative[i])} fill="none" stroke={slotOf(i, s.slot)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />)}
              {active !== null ? <line className="bt-chart-cross" x1={px(active)} x2={px(active)} y1={top} y2={bottom} /> : null}
              {series.map((s, i) => {
                const values = cumulative[i];
                const shown = active !== null ? active : values.length - 1;
                const value = values[shown];
                return value === null || value === undefined ? null : <circle key={s.key} cx={px(shown)} cy={py(value)} r={4} fill={slotOf(i, s.slot)} className="bt-chart-dot" data-end={flag(active === null)} />;
              })}
              {roomy ? ends.map((end) => <text key={end.key} className="bt-chart-end" data-reveal="" x={right + 10} y={end.y} dy="0.32em">{end.label.length > endChars ? `${end.label.slice(0, endChars - 1)}…` : end.label}</text>) : null}
            </svg>
            {active !== null ? <Tooltip title={x(data[active])} rows={rows} x={px(active)} y={top} width={width} /> : null}
          </>
        );
      }}
    </ChartFrame>
  );
}

export function AreaChart<D>(props: Omit<LineChartProps<D>, "area">) {
  return <LineChart {...props} area />;
}

export type DonutChartProps<D> = Omit<ChartBase<D>, "series"> & {
  /** Reads each slice. */
  value: (datum: D) => number;
  /** Colour slot per slice, so a slice keeps its colour when ranks change. Defaults to rank. */
  slot?: (datum: D) => number;
  /** Middle line. Defaults to the total. */
  centre?: ReactNode;
  /** Slices past this many fold into "Other". */
  maxSlices?: number;
};

export function DonutChart<D>({ data, x, value, slot, label, height = 240, format, centre, maxSlices = 6, animated = true, className }: DonutChartProps<D>) {
  const t = useLocale();
  const { full } = useFormatters(format);
  const [active, setActive] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const ranked = useMemo(() => data
    .map((d): { label: string; value: number; slot?: number; other?: boolean } => ({ label: x(d), value: Math.max(0, value(d)), slot: slot?.(d) }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value), [data, x, value, slot]);
  const colorOf = (slice: { slot?: number; other?: boolean }, i: number) => (slice.other ? "var(--bt-chart-other)" : slotOf(i, slice.slot));
  const slices = useMemo(() => {
    if (ranked.length <= maxSlices) return ranked;
    const head = ranked.slice(0, maxSlices - 1);
    return [...head, { label: t.chart.other, value: ranked.slice(maxSlices - 1).reduce((sum, s) => sum + s.value, 0), other: true }];
  }, [ranked, maxSlices, t.chart.other]);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const size = height;
  const outer = size / 2 - 2;
  const inner = outer - 26;
  const middle = (outer + inner) / 2;
  const length = 2 * Math.PI * middle;
  const share = new Intl.NumberFormat(t.lang, { style: "percent", maximumFractionDigits: 1 });
  let run = 0;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setActive(active === null ? 0 : Math.min(slices.length - 1, active + 1)); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setActive(active === null ? slices.length - 1 : Math.max(0, active - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(slices.length - 1); }
    else if (e.key === "Escape") setActive(null);
  };
  return (
    <figure className={cx("bt-chart", className)} data-animated={flag(animated)}>
      <figcaption className="bt-sr">{label}</figcaption>
      <div className="bt-chart-head">
        <span />
        <Button size="xs" variant="ghost" aria-pressed={table} onClick={() => setTable(!table)}>{table ? t.chart.showChart : t.chart.showTable}</Button>
      </div>
      {slices.length === 0 ? (
        <div className="bt-empty" style={{ height }}>{t.chart.empty}</div>
      ) : table ? (
        <DataTableView data={ranked} x={(s) => s.label} series={[{ key: "value", label }]} format={full} caption={label} />
      ) : (
        <div className="bt-donut">
          <div className="bt-chart-plot" style={{ width: size, height: size }} role="group" aria-label={label} tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}>
            <svg width={size} height={size} aria-hidden="true" onPointerLeave={() => setActive(null)}>
              <g className="bt-donut-ring" transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                {slices.map((slice, i) => {
                  const fraction = slice.value / (total || 1);
                  const dash = Math.max(0.5, fraction * length - 2);
                  const circle = (
                    <circle
                      key={slice.label}
                      cx={size / 2}
                      cy={size / 2}
                      r={middle}
                      fill="none"
                      stroke={colorOf(slice, i)}
                      strokeWidth={active === i ? 30 : 26}
                      className="bt-donut-slice"
                      style={{ "--bt-slice": `${dash}`, "--bt-ring": `${length}`, animationDelay: stagger(i, slices.length) } as CSSProperties}
                      strokeDasharray={`${dash} ${length - dash}`}
                      strokeDashoffset={-run * length}
                      onPointerEnter={() => setActive(i)}
                    />
                  );
                  run += fraction;
                  return circle;
                })}
              </g>
            </svg>
            <div className="bt-donut-centre" role="status">
              {active !== null ? (
                <><b>{full(slices[active].value)}</b><span>{slices[active].label}</span></>
              ) : centre ?? <><b>{full(total)}</b><span>{t.grid.total}</span></>}
            </div>
          </div>
          <ul className="bt-donut-legend">
            {slices.map((slice, i) => (
              <li key={slice.label} data-active={flag(active === i)} onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)}>
                <i data-shape="box" style={{ background: colorOf(slice, i) }} />
                <span>{slice.label}</span>
                <b>{share.format(slice.value / (total || 1))}</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
}

export type SparklineProps = {
  values: number[];
  /** Spoken summary. Defaults to the first, last and highest value. */
  label?: string;
  width?: number;
  height?: number;
  /** Fills under the line. */
  area?: boolean;
  slot?: number;
  className?: string;
};

/** A word-sized trend for table cells and Kpi cards. */
export function Sparkline({ values, label, width = 96, height = 24, area, slot = 1, className }: SparklineProps) {
  const t = useLocale();
  const number = useMemo(() => new Intl.NumberFormat(t.lang, { maximumFractionDigits: 2 }), [t.lang]);
  if (values.length === 0) return null;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const px = (i: number) => (values.length < 2 ? width / 2 : 3 + ((width - 8) * i) / (values.length - 1));
  const py = (v: number) => 3 + (height - 6) * (1 - (v - low) / (high - low || 1));
  const line = values.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join("");
  const spoken = label ?? t.chart.trend(number.format(values[0]), number.format(values[values.length - 1]), number.format(high));
  return (
    <svg className={cx("bt-spark", className)} width={width} height={height} role="img" aria-label={spoken}>
      {area ? <path className="bt-chart-wash" d={`${line}L${px(values.length - 1)} ${height}L${px(0)} ${height}Z`} fill={`var(--bt-chart-${slot})`} /> : null}
      <path className="bt-chart-line" pathLength={1} d={line} fill="none" stroke={`var(--bt-chart-${slot})`} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={px(values.length - 1)} cy={py(values[values.length - 1])} r={2.5} fill={`var(--bt-chart-${slot})`} />
    </svg>
  );
}

/** A value drawn as a bar behind its number, for comparing rows in a column. */
export function DataBar({ value, max, children, slot = 1 }: { value: number; max: number; children?: ReactNode; slot?: number }) {
  const width = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <span className="bt-databar">
      <i className="bt-databar-fill" style={{ width: `${width}%`, background: `var(--bt-chart-${slot})` }} />
      <span>{children ?? value}</span>
    </span>
  );
}

type ChartKind = "bar" | "stacked" | "line" | "area" | "donut";
export type ChartPickerProps = { columns: string[]; categories: string[]; rows: number[][]; label: string };

/** Draws a table selection: one bar or line per selected numeric column. */
export function SelectionChart({ columns, categories, rows, label }: ChartPickerProps) {
  const t = useLocale();
  const [kind, setKind] = useState<ChartKind>("bar");
  const data = useMemo(() => categories.map((name, i) => ({ name, values: rows[i] })), [categories, rows]);
  const series = useMemo(() => columns.map((column, i): ChartSeries<{ values: number[] }> => ({ key: column, label: column, value: (d) => d.values[i] })), [columns]);
  const kinds: ChartKind[] = columns.length === 1 ? ["bar", "line", "area", "donut"] : ["bar", "stacked", "line", "area"];
  useEffect(() => { if (!kinds.includes(kind)) setKind("bar"); });
  const shared = { data, x: (d: { name: string }) => d.name, series, label, height: 300 };
  return (
    <div className="bt-chart-pick">
      <div className="bt-col-row" role="group" aria-label={t.chart.type}>
        {kinds.map((name) => <Button key={name} size="xs" variant={kind === name ? "soft" : "default"} aria-pressed={kind === name} onClick={() => setKind(name)}>{t.chart.kinds[name]}</Button>)}
      </div>
      {kind === "line" ? <LineChart {...shared} /> : kind === "area" ? <AreaChart {...shared} /> : kind === "donut" ? <DonutChart data={data} x={shared.x} value={(d) => d.values[0]} label={label} height={280} /> : <BarChart {...shared} stacked={kind === "stacked"} />}
    </div>
  );
}
