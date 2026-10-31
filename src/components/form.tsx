import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Field as BaseField } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { Check, Search } from "../icons";
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

export function Field({ label, hint, error, name, className, children }: FieldProps) {
  return (
    <BaseField.Root name={name} invalid={error ? true : undefined} className={cx("bt-field", className)} data-invalid={flag(error)}>
      {label ? <BaseField.Label className="bt-label">{label}</BaseField.Label> : null}
      {children}
      {error ? (
        <BaseField.Error match className="bt-field-error">{error}</BaseField.Error>
      ) : hint ? (
        <BaseField.Description className="bt-field-hint">{hint}</BaseField.Description>
      ) : null}
    </BaseField.Root>
  );
}

export type InputProps = ComponentPropsWithoutRef<typeof BaseInput> & { className?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...rest }, ref) {
  return <BaseInput ref={ref} className={cx("bt-input", className)} {...rest} />;
});

export type TextareaProps = ComponentPropsWithoutRef<"textarea">;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...rest }, ref) {
  return <BaseField.Control className={cx("bt-input", className)} render={<textarea ref={ref} {...rest} />} />;
});

export type SearchInputProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "size"> & { block?: boolean };

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput({ block, className, placeholder, ...rest }, ref) {
  const t = useLocale();
  return (
    <label className={cx("bt-search", className)} data-block={flag(block)}>
      <Search size={14} />
      <input ref={ref} type="search" placeholder={placeholder ?? t.search} aria-label={rest["aria-label"] ?? placeholder ?? t.search} {...rest} />
    </label>
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
  /** Text inside the switch: the classic red/green labelled toggle. Use both or neither. */
  onLabel?: string;
  offLabel?: string;
  "aria-label"?: string;
};

export function Switch({ checked, defaultChecked, onChange, disabled, name, label, onLabel, offLabel, "aria-label": ariaLabel }: SwitchProps) {
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
      className="bt-switch"
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
    <span className="bt-switch-wrap">
      {control}
      <label htmlFor={id}>{label}</label>
    </span>
  );
}

export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  label?: ReactNode;
  "aria-label"?: string;
};

export function Checkbox({ checked, defaultChecked, indeterminate, onChange, disabled, name, label, "aria-label": ariaLabel }: CheckboxProps) {
  const control = (
    <BaseCheckbox.Root
      name={name}
      checked={checked}
      defaultChecked={defaultChecked}
      indeterminate={indeterminate}
      onCheckedChange={(next) => onChange?.(next)}
      disabled={disabled}
      aria-label={ariaLabel}
      className="bt-check"
    >
      <BaseCheckbox.Indicator>{indeterminate ? "–" : <Check size={12} />}</BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
  if (!label) return control;
  return (
    <label className="bt-check-wrap">
      {control}
      <span>{label}</span>
    </label>
  );
}
