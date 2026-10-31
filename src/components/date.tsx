import { forwardRef, useEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent, type ReactNode } from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { Popover } from "@base-ui/react/popover";
import { addDays, addMonths, endOfMonth, firstDayOfWeek, formatDate, monthGrid, parseDate, startOfMonth, toUtc, todayIso, weekdayNames, type IsoDate } from "../date";
import { CalendarIcon, ChevronLeft, ChevronRight, Close } from "../icons";
import { useLocale } from "../locale";
import { cx, flag } from "../utils";
import { FieldItem, useFieldInfo } from "./form";

export type { IsoDate } from "../date";

type Limits = {
  /** First selectable day. */
  min?: IsoDate;
  /** Last selectable day. */
  max?: IsoDate;
  /** Closes individual days, such as weekends or holidays. */
  isDateDisabled?: (date: IsoDate) => boolean;
};

function blocked(date: IsoDate, { min, max, isDateDisabled }: Limits) {
  return (!!min && date < min) || (!!max && date > max) || !!isDateDisabled?.(date);
}

function daysBetween(a: IsoDate, b: IsoDate) {
  return Math.abs(toUtc(a)!.getTime() - toUtc(b)!.getTime()) / 86400000;
}

/** Nearest open day from `from`, walking in steps. Null when the walk leaves the limits. */
function nearestOpen(from: IsoDate, step: number, limits: Limits) {
  let date = from;
  for (let i = 0; i < 400; i++) {
    if ((limits.min && date < limits.min) || (limits.max && date > limits.max)) return null;
    if (!blocked(date, limits)) return date;
    date = addDays(date, step);
  }
  return null;
}

function nearestWithin(start: IsoDate, end: IsoDate, limits: Limits) {
  const from = limits.min && limits.min > start ? limits.min : start;
  return nearestOpen(from, 1, { ...limits, max: limits.max && limits.max < end ? limits.max : end });
}

export type CalendarProps = Limits & {
  /** Selected day. */
  value?: IsoDate | null;
  /** Selected span. Takes the place of `value`. */
  range?: { start: IsoDate | null; end: IsoDate | null };
  onSelect: (date: IsoDate) => void;
  /** Months shown side by side. */
  months?: 1 | 2;
  /** Month shown first. Defaults to the selection, then today. */
  defaultMonth?: IsoDate;
  className?: string;
};

export function Calendar({ value, range, onSelect, months = 1, defaultMonth, min, max, isDateDisabled, className }: CalendarProps) {
  const t = useLocale();
  const today = todayIso();
  const limits = { min, max, isDateDisabled };
  const anchor = defaultMonth ?? value ?? range?.start ?? today;
  const [month, setMonth] = useState(startOfMonth(anchor));
  const [picking, setPicking] = useState(false);
  const [focused, setFocused] = useState(value ?? range?.start ?? (blocked(today, limits) ? (min ?? today) : today));
  const shownMonths = Array.from({ length: months }, (_, i) => addMonths(month, i));
  const firstShown = shownMonths[0];
  const lastShown = endOfMonth(shownMonths[months - 1]);
  // Keyboard users always need one day to land on, even after paging through months.
  const tabDate = focused >= firstShown && focused <= lastShown && !blocked(focused, limits) ? focused : nearestWithin(firstShown, lastShown, limits);
  const [hover, setHover] = useState<IsoDate | null>(null);
  const moveFocus = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const firstDay = firstDayOfWeek(t.lang);
  const days = useMemo(() => weekdayNames(t.lang, firstDay), [t.lang, firstDay]);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    root.current?.querySelector<HTMLElement>(`[data-date="${focused}"]:not([data-outside])`)?.focus();
  }, [focused, month]);

  function go(next: IsoDate) {
    moveFocus.current = true;
    setFocused(next);
    const last = addMonths(month, months - 1);
    if (next < month) setMonth(startOfMonth(next));
    else if (next > endOfMonth(last)) setMonth(startOfMonth(addMonths(next, 1 - months)));
  }

  function onKeyDown(e: KeyboardEvent) {
    const weekStart = addDays(focused, -((toUtc(focused)!.getUTCDay() - firstDay + 7) % 7));
    const moves: Record<string, () => IsoDate> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => weekStart,
      End: () => addDays(weekStart, 6),
      PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    const target = move();
    const vertical = e.key === "ArrowUp" || e.key === "ArrowDown";
    const direction = target < focused ? -1 : 1;
    const open = nearestOpen(target, (vertical ? 7 : 1) * direction, limits);
    if (open) go(open);
  }

  const selectedEnd = range ? range.end ?? (range.start && hover ? hover : null) : null;
  const [from, to] = range?.start && selectedEnd ? (range.start <= selectedEnd ? [range.start, selectedEnd] : [selectedEnd, range.start]) : [range?.start ?? null, null];

  if (picking) {
    const year = month.slice(0, 4);
    const names = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}-01`);
    return (
      <div className={cx("bt-cal", className)} ref={root}>
        <div className="bt-cal-head">
          <button type="button" className="bt-cal-nav" aria-label={t.previousYear} onClick={() => setMonth(addMonths(month, -12))}><ChevronLeft size={14} /></button>
          <button type="button" className="bt-cal-title" onClick={() => setPicking(false)}>{year}</button>
          <button type="button" className="bt-cal-nav" aria-label={t.nextYear} onClick={() => setMonth(addMonths(month, 12))}><ChevronRight size={14} /></button>
        </div>
        <div className="bt-cal-months">
          {names.map((name) => (
            <button key={name} type="button" data-current={flag(name === month)} onClick={() => { setMonth(name); setFocused(name); setPicking(false); }}>
              {formatDate(name, t.lang, { month: "short" })}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cx("bt-cal", className)} data-months={months} ref={root}>
      {Array.from({ length: months }, (_, index) => {
        const shown = addMonths(month, index);
        const cells = monthGrid(shown, firstDay);
        const inMonth = shown.slice(0, 7);
        return (
          <div key={shown} className="bt-cal-month">
            <div className="bt-cal-head">
              <button type="button" className="bt-cal-nav" aria-label={t.previousMonth} hidden={index > 0} onClick={() => setMonth(addMonths(month, -1))}><ChevronLeft size={14} /></button>
              <button type="button" className="bt-cal-title" title={t.chooseMonth} aria-live="polite" onClick={() => setPicking(true)}>
                {formatDate(shown, t.lang, { month: "long", year: "numeric" })}
              </button>
              <button type="button" className="bt-cal-nav" aria-label={t.nextMonth} hidden={index < months - 1} onClick={() => setMonth(addMonths(month, 1))}><ChevronRight size={14} /></button>
            </div>
            <table role="grid" className="bt-cal-grid" aria-label={formatDate(shown, t.lang, { month: "long", year: "numeric" })} onKeyDown={onKeyDown} onMouseLeave={() => setHover(null)}>
              <thead>
                <tr>{days.map((day) => <th key={day.long} scope="col" abbr={day.long}>{day.short}</th>)}</tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, week) => (
                  <tr key={week}>
                    {cells.slice(week * 7, week * 7 + 7).map((date) => {
                      const outside = !date.startsWith(inMonth);
                      // Side by side, a day shown in both months would read as two different days.
                      if (outside && months > 1) return <td key={date} />;
                      const off = blocked(date, limits);
                      const isEdge = date === value || date === from || date === to;
                      const inside = !!from && !!to && date > from && date < to;
                      return (
                        <td key={date} role="gridcell" aria-selected={isEdge || inside}>
                          <button
                            type="button"
                            className="bt-cal-day"
                            data-date={date}
                            data-outside={flag(outside)}
                            data-today={flag(date === today)}
                            data-selected={flag(isEdge)}
                            data-range={flag(inside)}
                            tabIndex={date === tabDate && !outside ? 0 : -1}
                            disabled={off}
                            aria-current={date === today ? "date" : undefined}
                            aria-label={formatDate(date, t.lang, { day: "numeric", month: "long", year: "numeric", weekday: "long" })}
                            onClick={() => { setFocused(date); onSelect(date); }}
                            onMouseEnter={() => setHover(date)}
                          >
                            {Number(date.slice(8))}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

type TextDateProps = Limits & {
  value: IsoDate | null;
  onCommit: (value: IsoDate | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  "aria-label"?: string;
};

function TextDate({ value, onCommit, disabled, required, placeholder, min, max, isDateDisabled, "aria-label": ariaLabel }: TextDateProps) {
  const t = useLocale();
  const shown = value ? formatDate(value, t.lang) : "";
  const [draft, setDraft] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);

  function commit() {
    if (draft === null) return;
    const text = draft.trim();
    if (!text) {
      setWrong(false);
      setDraft(null);
      if (value) onCommit(null);
      return;
    }
    const parsed = parseDate(text, t.lang);
    if (!parsed || blocked(parsed, { min, max, isDateDisabled })) {
      setWrong(true);
      return;
    }
    setWrong(false);
    setDraft(null);
    if (parsed !== value) onCommit(parsed);
  }

  return (
    <BaseInput
      className="bt-input bt-date-text"
      value={draft ?? shown}
      placeholder={placeholder ?? formatDate("2026-12-31", t.lang)}
      disabled={disabled}
      required={required}
      // The visible text is for people: the form receives the ISO value from a hidden field.
      render={(props) => { const { name: _name, ...rest } = props as ComponentPropsWithoutRef<"input">; return <input {...rest} />; }}
      inputMode="numeric"
      autoComplete="off"
      aria-label={ariaLabel}
      aria-invalid={wrong || undefined}
      title={wrong ? t.invalidDate : undefined}
      data-wrong={flag(wrong)}
      onChange={(e) => { setDraft(e.target.value); setWrong(false); }}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
    />
  );
}

function focusDay(popup: HTMLElement | null) {
  return popup?.querySelector<HTMLElement>('.bt-cal-day[tabindex="0"]') ?? true;
}

type PickerShared = Limits & {
  /** Prefix in the `filter` variant. */
  label?: string;
  placeholder?: string;
  /** `field` is a typed input, `filter` a compact box for filter bars. */
  variant?: "field" | "filter";
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  block?: boolean;
  className?: string;
  "aria-label"?: string;
};

type FilterTriggerProps = ComponentPropsWithoutRef<"button"> & { label?: string; text: ReactNode; filled: boolean };

const FilterTrigger = forwardRef<HTMLButtonElement, FilterTriggerProps>(function FilterTrigger({ label, text, filled, ...rest }, ref) {
  return (
    <button ref={ref} type="button" {...rest} className="bt-select" data-variant="filter" data-size="md" data-filled={flag(filled)}>
      {label ? <span className="bt-select-prefix">{label}:</span> : null}
      <span className="bt-select-value" data-empty={flag(!filled)}>{text}</span>
      <span className="bt-select-chevron"><CalendarIcon size={14} /></span>
    </button>
  );
});

/** Carries the ISO value into forms. In the filter variant it also gives `required` something to check. */
function FormValue({ name, value, required, filter }: { name?: string; value: IsoDate | null; required?: boolean; filter: boolean }) {
  if (filter && required) return <input className="bt-sr" tabIndex={-1} aria-hidden="true" name={name} value={value ?? ""} required onChange={() => undefined} />;
  return name ? <input type="hidden" name={name} value={value ?? ""} /> : null;
}

export type DatePickerProps = PickerShared & {
  value: IsoDate | null;
  onChange: (value: IsoDate | null) => void;
};

export function DatePicker({ value, onChange, label, placeholder, variant = "field", clearable, disabled, required, name, block, className, min, max, isDateDisabled, "aria-label": ariaLabel }: DatePickerProps) {
  const t = useLocale();
  const field = useFieldInfo();
  const formName = name ?? field?.name;
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLSpanElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const limits = { min, max, isDateDisabled };
  const filter = variant === "filter";
  const canClear = !!clearable && !!value && !disabled;
  const clear = canClear ? <button type="button" className={filter ? "bt-select-clear" : "bt-date-clear"} aria-label={t.clear} onClick={() => onChange(null)}><Close size={filter ? 11 : 13} /></button> : null;

  return (
    <span ref={anchor} className={cx(filter ? "bt-select-wrap" : "bt-input-wrap bt-date", className)} data-block={flag(block)} data-clearable={flag(filter && canClear)}>
      <FormValue name={formName} value={value} required={required} filter={filter} />
      <Popover.Root open={open} onOpenChange={(next) => setOpen(next)}>
        {filter ? (
          <Popover.Trigger disabled={disabled} nativeButton render={<FilterTrigger label={label} text={value ? formatDate(value, t.lang) : placeholder ?? t.select} filled={!!value} />} />
        ) : (
          <>
            <TextDate value={value} onCommit={onChange} disabled={disabled} required={required} placeholder={placeholder} aria-label={ariaLabel ?? (field?.labelled ? undefined : label)} {...limits} />
            {clear}
            <Popover.Trigger className="bt-date-btn" disabled={disabled} aria-label={t.openCalendar}><CalendarIcon size={15} /></Popover.Trigger>
          </>
        )}
        <Popover.Portal>
          <Popover.Positioner className="bt-positioner" anchor={anchor} align="start" sideOffset={4}>
            <Popover.Popup ref={popup} className="bt-popup bt-date-pop" initialFocus={() => focusDay(popup.current)}>
              <Calendar value={value} onSelect={(date) => { onChange(date); setOpen(false); }} {...limits} />
              <div className="bt-date-foot">
                <button type="button" disabled={blocked(todayIso(), limits)} onClick={() => { onChange(todayIso()); setOpen(false); }}>{t.today}</button>
                {value ? <button type="button" onClick={() => { onChange(null); setOpen(false); }}>{t.clear}</button> : null}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {filter ? clear : null}
    </span>
  );
}

export type DateRange = { start: IsoDate | null; end: IsoDate | null };
export type DateRangePreset = { label: string; range: () => { start: IsoDate; end: IsoDate } };

/** The standard shortcuts of reporting screens, measured from `today`. */
export function datePresets(labels: { today: string; yesterday: string; last7: string; last30: string; thisMonth: string; lastMonth: string; thisYear: string }, today = todayIso()): DateRangePreset[] {
  const lastMonth = addMonths(startOfMonth(today), -1);
  return [
    { label: labels.today, range: () => ({ start: today, end: today }) },
    { label: labels.yesterday, range: () => ({ start: addDays(today, -1), end: addDays(today, -1) }) },
    { label: labels.last7, range: () => ({ start: addDays(today, -6), end: today }) },
    { label: labels.last30, range: () => ({ start: addDays(today, -29), end: today }) },
    { label: labels.thisMonth, range: () => ({ start: startOfMonth(today), end: endOfMonth(today) }) },
    { label: labels.lastMonth, range: () => ({ start: lastMonth, end: endOfMonth(lastMonth) }) },
    { label: labels.thisYear, range: () => ({ start: `${today.slice(0, 4)}-01-01`, end: `${today.slice(0, 4)}-12-31` }) },
  ];
}

export type DateRangePickerProps = PickerShared & {
  value: DateRange;
  onChange: (value: DateRange) => void;
  /** Shortcut list. `false` hides it. */
  presets?: DateRangePreset[] | false;
  /** Longest span allowed, in days. Applies to the calendar, typed dates and shortcuts. */
  maxDays?: number;
  "aria-labelledby"?: string;
};

export function DateRangePicker({ value, onChange, label, placeholder, variant = "field", clearable, disabled, required, name, block, className, min, max, isDateDisabled, presets, maxDays, "aria-label": ariaLabel, "aria-labelledby": labelledBy }: DateRangePickerProps) {
  const t = useLocale();
  const field = useFieldInfo();
  const formName = name ?? field?.name;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | null>(null);
  const anchor = useRef<HTMLSpanElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const shown = draft ?? value;
  const filter = variant === "filter";
  const list = presets === false ? [] : presets ?? datePresets(t.presets);
  const filled = !!value.start && !!value.end;
  const canClear = !!clearable && !!(value.start || value.end) && !disabled;
  const text = filled ? `${formatDate(value.start!, t.lang)} – ${formatDate(value.end!, t.lang)}` : placeholder ?? t.select;

  // Once a start is chosen, days past the longest span close.
  const limits = {
    min,
    max,
    isDateDisabled: (date: IsoDate) => {
      if (isDateDisabled?.(date)) return true;
      const start = draft?.start;
      return !!(maxDays && start && !draft?.end && (date > addDays(start, maxDays - 1) || date < addDays(start, 1 - maxDays)));
    },
  };

  const tooLong = (a: IsoDate, b: IsoDate | null) => !!maxDays && !!b && daysBetween(a, b) + 1 > maxDays;
  const presetOff = ({ start, end }: { start: IsoDate; end: IsoDate }) => blocked(start, { min, max, isDateDisabled }) || blocked(end, { min, max, isDateDisabled }) || tooLong(start, end);
  const edgeLimit = (other: IsoDate | null) => (date: IsoDate) => !!isDateDisabled?.(date) || tooLong(date, other);

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) setDraft(null);
  }

  function pick(date: IsoDate) {
    if (!draft?.start || draft.end) {
      setDraft({ start: date, end: null });
      return;
    }
    onChange(date < draft.start ? { start: date, end: draft.start } : { start: draft.start, end: date });
    changeOpen(false);
  }

  function setEdge(edge: "start" | "end", next: IsoDate | null) {
    const merged = { ...value, [edge]: next };
    onChange(merged.start && merged.end && merged.start > merged.end ? { start: merged.end, end: merged.start } : merged);
  }

  const clear = canClear ? <button type="button" className={filter ? "bt-select-clear" : "bt-date-clear"} aria-label={t.clear} onClick={() => onChange({ start: null, end: null })}><Close size={filter ? 11 : 13} /></button> : null;

  return (
    <span ref={anchor} className={cx(filter ? "bt-select-wrap" : "bt-input-wrap bt-date bt-date-range", className)} data-block={flag(block)} data-clearable={flag(filter && canClear)} role="group" aria-label={labelledBy ? undefined : ariaLabel ?? label} aria-labelledby={labelledBy}>
      <FormValue name={formName && `${formName}Start`} value={value.start} required={required} filter={filter} />
      <FormValue name={formName && `${formName}End`} value={value.end} required={required} filter={filter} />
      <Popover.Root open={open} onOpenChange={(next) => changeOpen(next)}>
        {filter ? (
          <Popover.Trigger disabled={disabled} nativeButton render={<FilterTrigger label={label} text={text} filled={filled} />} />
        ) : (
          <>
            <FieldItem><TextDate value={value.start} onCommit={(next) => setEdge("start", next)} disabled={disabled} required={required} aria-label={t.startDate} min={min} max={max} isDateDisabled={edgeLimit(value.end)} /></FieldItem>
            <span className="bt-date-sep" aria-hidden="true">–</span>
            <FieldItem><TextDate value={value.end} onCommit={(next) => setEdge("end", next)} disabled={disabled} required={required} aria-label={t.endDate} min={min} max={max} isDateDisabled={edgeLimit(value.start)} /></FieldItem>
            {clear}
            <Popover.Trigger className="bt-date-btn" disabled={disabled} aria-label={t.openCalendar}><CalendarIcon size={15} /></Popover.Trigger>
          </>
        )}
        <Popover.Portal>
          <Popover.Positioner className="bt-positioner" anchor={anchor} align="start" sideOffset={4}>
            <Popover.Popup ref={popup} className="bt-popup bt-date-pop" data-range="" initialFocus={() => focusDay(popup.current)}>
              {list.length ? (
                <div className="bt-date-presets">
                  {list.map((preset) => {
                    const range = preset.range();
                    return <button key={preset.label} type="button" disabled={presetOff(range)} onClick={() => { onChange(range); changeOpen(false); }}>{preset.label}</button>;
                  })}
                </div>
              ) : null}
              <Calendar range={shown} onSelect={pick} months={2} {...limits} />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {filter ? clear : null}
    </span>
  );
}

DateRangePicker.btGroup = "always" as const;
