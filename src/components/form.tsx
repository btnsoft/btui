import { Children, cloneElement, createContext, forwardRef, isValidElement, useContext, useId, useMemo, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Field as BaseField } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { NumberField } from "@base-ui/react/number-field";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { Search } from "../icons";
import { useLocale } from "../locale";
import { cx, flag } from "../utils";

export type FieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  /** A message here marks the field invalid and replaces the hint. */
  error?: ReactNode;
  name?: string;
  className?: string;
  children: ReactNode;
};

type FieldInfo = { name?: string; labelled: boolean };
const InFieldContext = createContext<FieldInfo | null>(null);

/** What the surrounding Field knows, for controls that do their own form wiring. */
export function useFieldInfo() {
  return useContext(InFieldContext);
}

/** `always` and a labelled `labelled` control name their own options, so Field only captions them. */
type GroupControl = { btGroup?: "always" | "labelled" };

function asGroupControl(children: ReactNode) {
  const only = Children.count(children) === 1 && isValidElement(children) ? (children as ReactElement<{ label?: ReactNode }>) : null;
  const group = (only?.type as GroupControl | undefined)?.btGroup;
  return only && (group === "always" || (group === "labelled" && only.props.label)) ? only : null;
}

/** Gives each option in a group its own label wiring. Base UI allows this only inside a Field. */
export function FieldItem({ children }: { children: ReactNode }) {
  return useContext(InFieldContext) ? <BaseField.Item className="bt-field-item">{children}</BaseField.Item> : children;
}

export function Field({ label, hint, error, name, className, children }: FieldProps) {
  const labelId = useId();
  const group = asGroupControl(children);
  const info = useMemo(() => ({ name, labelled: !!label }), [name, label]);
  return (
    <BaseField.Root name={name} invalid={error ? true : undefined} className={cx("bt-field", className)} data-invalid={flag(error)}>
      {!label ? null : group ? <span id={labelId} className="bt-label">{label}</span> : <BaseField.Label className="bt-label">{label}</BaseField.Label>}
      <InFieldContext.Provider value={info}>
        {group && label ? cloneElement(group, { "aria-labelledby": labelId } as Record<string, string>) : children}
      </InFieldContext.Provider>
      {error ? (
        <BaseField.Error match className="bt-field-error">{error}</BaseField.Error>
      ) : hint ? (
        <BaseField.Description className="bt-field-hint">{hint}</BaseField.Description>
      ) : null}
    </BaseField.Root>
  );
}

export type InputProps = Omit<ComponentPropsWithoutRef<typeof BaseInput>, "prefix"> & {
  className?: string;
  /** Fixed content before the value, such as a currency sign. */
  prefix?: ReactNode;
  /** Fixed content after the value, such as a unit. */
  suffix?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, prefix, suffix, ...rest }, ref) {
  const input = <BaseInput ref={ref} className={cx("bt-input", className)} {...rest} />;
  if (!prefix && !suffix) return input;
  return (
    <span className="bt-input-wrap">
      {prefix ? <span className="bt-adorn">{prefix}</span> : null}
      {input}
      {suffix ? <span className="bt-adorn">{suffix}</span> : null}
    </span>
  );
});

export type NumberInputProps = {
  value?: number | null;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** `Intl.NumberFormat` options, such as `{ style: "currency", currency: "TRY" }`. */
  format?: Intl.NumberFormatOptions;
  /** Hides the minus and plus buttons. */
  hideSteppers?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
  "aria-label"?: string;
};

export function NumberInput({ value, defaultValue, onChange, min, max, step, format, hideSteppers, disabled, required, name, className, "aria-label": ariaLabel }: NumberInputProps) {
  const t = useLocale();
  return (
    <NumberField.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onChange?.(next)}
      min={min}
      max={max}
      step={step}
      format={format}
      locale={t.lang}
      disabled={disabled}
      required={required}
      name={name}
    >
      <NumberField.Group className={cx("bt-input-wrap", className)}>
        {hideSteppers ? null : <NumberField.Decrement className="bt-number-btn" aria-label={t.decrease}>−</NumberField.Decrement>}
        <NumberField.Input className="bt-input bt-number" aria-label={ariaLabel} />
        {hideSteppers ? null : <NumberField.Increment className="bt-number-btn" aria-label={t.increase}>+</NumberField.Increment>}
      </NumberField.Group>
    </NumberField.Root>
  );
}

export type RadioOption = { value: string; label: ReactNode; hint?: ReactNode; disabled?: boolean };

export type RadioGroupProps = {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export function RadioGroup({ options, value, defaultValue, onChange, orientation = "vertical", disabled, required, name, className, "aria-label": ariaLabel, "aria-labelledby": labelledBy }: RadioGroupProps) {
  return (
    <BaseRadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onChange?.(next as string)}
      disabled={disabled}
      required={required}
      name={name}
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      className={cx("bt-radios", className)}
      data-orientation={orientation}
    >
      {options.map((option) => (
        <FieldItem key={option.value}>
          <label className="bt-radio-wrap">
            <Radio.Root value={option.value} disabled={option.disabled} className="bt-radio">
              <Radio.Indicator className="bt-radio-dot" />
            </Radio.Root>
            <span>{option.label}{option.hint ? <small>{option.hint}</small> : null}</span>
          </label>
        </FieldItem>
      ))}
    </BaseRadioGroup>
  );
}

export type TextareaProps = ComponentPropsWithoutRef<"textarea">;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...rest }, ref) {
  return <BaseField.Control className={cx("bt-input", className)} render={<textarea ref={ref} {...rest} />} />;
});

export type SearchInputProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "size"> & { block?: boolean };

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput({ block, className, placeholder, ...rest }, ref) {
  const t = useLocale();
  const inField = useContext(InFieldContext);
  return (
    <span className={cx("bt-search", className)} data-block={flag(block)}>
      <Search size={14} />
      <BaseInput ref={ref} type="search" placeholder={placeholder ?? t.search} aria-label={rest["aria-label"] ?? (inField?.labelled ? undefined : placeholder ?? t.search)} {...rest} />
    </span>
  );
});

export type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  /** Text beside the switch. */
  label?: ReactNode;
  /** Quieter text under the label. */
  hint?: ReactNode;
  className?: string;
  /** Text inside the switch: the classic red/green labelled toggle. Use both or neither. */
  onLabel?: string;
  offLabel?: string;
  "aria-label"?: string;
};

export function Switch({ checked, defaultChecked, onChange, disabled, name, label, hint, className, onLabel, offLabel, "aria-label": ariaLabel }: SwitchProps) {
  const id = useId();
  const labelled = onLabel !== undefined && offLabel !== undefined;
  const control = (
    <BaseSwitch.Root
      id={id}
      name={name}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(next) => onChange?.(next)}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx("bt-switch", !label && className)}
      data-labelled={flag(labelled)}
      render={(props, state) => (
        <span {...props}>
          {labelled ? (state.checked ? onLabel : offLabel) : null}
          <BaseSwitch.Thumb className="bt-switch-thumb" />
        </span>
      )}
    />
  );
  if (!label) return control;
  return (
    <FieldItem>
      <span className={cx("bt-switch-wrap", className)}>
        {control}
        <label htmlFor={id} className="bt-check-text">{label}{hint ? <small>{hint}</small> : null}</label>
      </span>
    </FieldItem>
  );
}

export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  label?: ReactNode;
  /** Quieter text under the label. */
  hint?: ReactNode;
  className?: string;
  "aria-label"?: string;
};

export function Checkbox({ checked, defaultChecked, indeterminate, onChange, disabled, required, name, label, hint, className, "aria-label": ariaLabel }: CheckboxProps) {
  const control = (
    <BaseCheckbox.Root
      name={name}
      checked={checked}
      defaultChecked={defaultChecked}
      indeterminate={indeterminate}
      onCheckedChange={(next) => onChange?.(next)}
      disabled={disabled}
      required={required}
      aria-label={ariaLabel}
      className={cx("bt-check", !label && className)}
    >
      <BaseCheckbox.Indicator className="bt-check-mark">
        {indeterminate ? (
          <span className="bt-check-dash" />
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" aria-hidden="true">
            <path d="M2 6.5 4.8 9.2 10 3" pathLength="1" />
          </svg>
        )}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
  if (!label) return control;
  return (
    <FieldItem>
      <label className={cx("bt-check-wrap", className)}>
        {control}
        <span className="bt-check-text">
          {label}
          {hint ? <small>{hint}</small> : null}
        </span>
      </label>
    </FieldItem>
  );
}

RadioGroup.btGroup = "always" as const;
Checkbox.btGroup = "labelled" as const;
Switch.btGroup = "labelled" as const;
