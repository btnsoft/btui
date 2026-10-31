import { useMemo, type ReactNode } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown, Close, Search } from "../icons";
import { useLocale } from "../locale";
import { cx, flag, includesText } from "../utils";

export type SelectOption = {
  value: string;
  label: string;
  /** Muted text on the right: a count, a code. */
  hint?: string;
  disabled?: boolean;
};

type SharedProps = {
  options: SelectOption[];
  placeholder?: string;
  /** With `variant="filter"` shows as a prefix, "City: Izmir". */
  label?: string;
  /** `field` for forms, `filter` for filter bars: a chosen value fills the box. */
  variant?: "field" | "filter";
  size?: "sm" | "md";
  disabled?: boolean;
  block?: boolean;
  className?: string;
  "aria-label"?: string;
};

export type SelectProps = SharedProps & {
  value: string;
  onChange: (value: string) => void;
  /** Search box in the list. By default it appears above 8 options. */
  searchable?: boolean;
  /** Clear button. Clearing reports an empty string. */
  clearable?: boolean;
  name?: string;
};

const SEARCH_THRESHOLD = 8;

function TriggerContent({ label, variant, text, empty }: { label?: string; variant: string; text: ReactNode; empty: boolean }) {
  return (
    <>
      {variant === "filter" && label ? <span className="bt-select-prefix">{label}:</span> : null}
      <span className="bt-select-value" data-empty={flag(empty)}>{text}</span>
      <span className="bt-select-chevron"><ChevronDown size={13} /></span>
    </>
  );
}

function Row({ option, Indicator }: { option: SelectOption; Indicator: typeof BaseSelect.ItemIndicator | typeof Combobox.ItemIndicator }) {
  return (
    <>
      <span className="bt-item-check"><Indicator><Check size={13} /></Indicator></span>
      <span className="bt-item-text">{option.label}</span>
      {option.hint ? <span className="bt-item-hint">{option.hint}</span> : null}
    </>
  );
}

function useFilter() {
  const t = useLocale();
  return useMemo(() => (item: SelectOption, query: string) => includesText(item.label, query, t.lang), [t.lang]);
}

function SearchRow({ placeholder }: { placeholder: string }) {
  return (
    <label className="bt-list-search">
      <Search size={13} />
      <Combobox.Input placeholder={placeholder} aria-label={placeholder} />
    </label>
  );
}

export function Select({
  value, onChange, options, placeholder, label, variant = "field", size = "md", searchable, clearable, disabled, block, name, className, "aria-label": ariaLabel,
}: SelectProps) {
  const t = useLocale();
  const filter = useFilter();
  const selected = options.find((o) => o.value === value) ?? null;
  const search = searchable ?? options.length > SEARCH_THRESHOLD;
  const canClear = !!clearable && !!selected && !disabled;
  const shared = {
    className: "bt-select",
    "data-variant": variant,
    "data-size": size,
    "data-filled": flag(variant === "filter" && selected),
    "aria-label": ariaLabel ?? (variant === "filter" ? undefined : label),
  };
  const content = <TriggerContent label={label} variant={variant} text={selected?.label ?? placeholder ?? t.select} empty={!selected} />;

  return (
    <span className={cx("bt-select-wrap", className)} data-block={flag(block || variant === "field")} data-clearable={flag(canClear)}>
      {search ? (
        <Combobox.Root
          items={options}
          value={selected}
          onValueChange={(item) => onChange(item?.value ?? "")}
          itemToStringLabel={(item) => item.label}
          isItemEqualToValue={(a, b) => a.value === b.value}
          filter={filter}
          disabled={disabled}
          name={name}
        >
          <Combobox.Trigger {...shared}>{content}</Combobox.Trigger>
          <Combobox.Portal>
            <Combobox.Positioner className="bt-positioner" sideOffset={4} align="start">
              <Combobox.Popup className="bt-popup bt-list-pop">
                <SearchRow placeholder={t.search} />
                <Combobox.Empty className="bt-list-empty">{t.noResults}</Combobox.Empty>
                <Combobox.List className="bt-list">
                  {(o: SelectOption) => (
                    <Combobox.Item key={o.value} value={o} disabled={o.disabled} className="bt-item">
                      <Row option={o} Indicator={Combobox.ItemIndicator} />
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      ) : (
        <BaseSelect.Root
          items={options}
          value={selected ? selected.value : null}
          onValueChange={(next) => onChange(next ?? "")}
          disabled={disabled}
          name={name}
        >
          <BaseSelect.Trigger {...shared}>{content}</BaseSelect.Trigger>
          <BaseSelect.Portal>
            <BaseSelect.Positioner className="bt-positioner" sideOffset={4} align="start" alignItemWithTrigger={false}>
              <BaseSelect.Popup className="bt-popup bt-list-pop">
                <BaseSelect.List className="bt-list">
                  {options.map((o) => (
                    <BaseSelect.Item key={o.value} value={o.value} label={o.label} disabled={o.disabled} className="bt-item">
                      <Row option={o} Indicator={BaseSelect.ItemIndicator} />
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.List>
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </BaseSelect.Portal>
        </BaseSelect.Root>
      )}
      {canClear ? (
        <button type="button" className="bt-select-clear" aria-label={t.clear} title={t.clear} onClick={() => onChange("")}>
          <Close size={11} />
        </button>
      ) : null}
    </span>
  );
}

export type MultiSelectProps = SharedProps & {
  value: string[];
  onChange: (value: string[]) => void;
  name?: string;
};

export function MultiSelect({
  value, onChange, options, placeholder, label, variant = "filter", size = "md", disabled, block, name, className, "aria-label": ariaLabel,
}: MultiSelectProps) {
  const t = useLocale();
  const filter = useFilter();
  const selected = useMemo(() => options.filter((o) => value.includes(o.value)), [options, value]);
  const text = selected.length === 0 ? placeholder ?? t.select : selected.length === 1 ? selected[0].label : t.selected(selected.length);

  return (
    <span className={cx("bt-select-wrap", className)} data-block={flag(block || variant === "field")}>
      <Combobox.Root
        multiple
        items={options}
        value={selected}
        onValueChange={(items) => onChange(items.map((o) => o.value))}
        itemToStringLabel={(item) => item.label}
        isItemEqualToValue={(a, b) => a.value === b.value}
        filter={filter}
        disabled={disabled}
        name={name}
      >
        <Combobox.Trigger
          className="bt-select"
          data-variant={variant}
          data-size={size}
          data-filled={flag(variant === "filter" && selected.length)}
          aria-label={ariaLabel ?? (variant === "filter" ? undefined : label)}
        >
          <TriggerContent label={label} variant={variant} text={text} empty={selected.length === 0} />
        </Combobox.Trigger>
        <Combobox.Portal>
          <Combobox.Positioner className="bt-positioner" sideOffset={4} align="start">
            <Combobox.Popup className="bt-popup bt-list-pop">
              <SearchRow placeholder={t.search} />
              <Combobox.Empty className="bt-list-empty">{t.noResults}</Combobox.Empty>
              <Combobox.List className="bt-list">
                {(o: SelectOption) => (
                  <Combobox.Item key={o.value} value={o} disabled={o.disabled} className="bt-item">
                    <Row option={o} Indicator={Combobox.ItemIndicator} />
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </span>
  );
}
