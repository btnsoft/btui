import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import { ChevronDown, Close } from "../icons";
import { useLocale } from "../locale";
import { cx } from "../utils";
import { IconButton } from "./button";

export type AlertProps = {
  tone?: "info" | "ok" | "warn" | "danger";
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  /** Shows a close button and hides the alert after it is pressed. */
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
};

export function Alert({ tone = "info", title, children, actions, dismissible, onDismiss, className }: AlertProps) {
  const t = useLocale();
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div className={cx("bt-alert", className)} data-tone={tone} role={tone === "danger" || tone === "warn" ? "alert" : "status"}>
      <div className="bt-alert-main">
        {title ? <p className="bt-alert-title">{title}</p> : null}
        {children ? <div className="bt-alert-text">{children}</div> : null}
      </div>
      {actions || dismissible ? (
        <div className="bt-alert-actions">
          {actions}
          {dismissible ? <IconButton size="sm" label={t.close} onClick={() => { setGone(true); onDismiss?.(); }}><Close size={13} /></IconButton> : null}
        </div>
      ) : null}
    </div>
  );
}

export type ProgressProps = {
  /** 0-100. `null` shows an indeterminate state. */
  value: number | null;
  label?: ReactNode;
  showValue?: boolean;
  tone?: "accent" | "ok" | "warn" | "danger";
  /** Accessible name when there is no visible `label`. */
  "aria-label"?: string;
  className?: string;
};

export function Progress({ value, label, showValue = true, tone = "accent", "aria-label": ariaLabel, className }: ProgressProps) {
  const t = useLocale();
  return (
    <BaseProgress.Root value={value} locale={t.lang} aria-label={ariaLabel} getAriaValueText={(formatted, current) => (current === null ? t.loading : formatted)} className={cx("bt-progress", className)} data-tone={tone}>
      {label ? <BaseProgress.Label className="bt-progress-label">{label}</BaseProgress.Label> : <span />}
      {showValue ? <BaseProgress.Value className="bt-progress-value" /> : <span />}
      <BaseProgress.Track className="bt-progress-track">
        <BaseProgress.Indicator className="bt-progress-bar" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}

export type SkeletonProps = ComponentPropsWithoutRef<"span"> & { width?: number | string; height?: number | string };

export function Skeleton({ width, height, className, style, ...rest }: SkeletonProps) {
  return <span aria-hidden="true" className={cx("bt-skeleton", className)} style={{ width, height, ...style }} {...rest} />;
}

export type TopLoaderProps = {
  /** True while the next screen is on its way. */
  active: boolean;
  /** Stays hidden for this many milliseconds, so quick changes show nothing. */
  delay?: number;
  /** Once shown, stays this long, so it never just blinks. */
  minDuration?: number;
};

/** A thin bar along the top of the window while a page changes. */
export function TopLoader({ active, delay = 120, minDuration = 320 }: TopLoaderProps) {
  const t = useLocale();
  const [shown, setShown] = useState(false);
  const since = useRef(0);
  useEffect(() => {
    if (active) {
      const timer = window.setTimeout(() => { since.current = performance.now(); setShown(true); }, delay);
      return () => window.clearTimeout(timer);
    }
    if (!shown) return;
    const timer = window.setTimeout(() => setShown(false), Math.max(0, minDuration - (performance.now() - since.current)));
    return () => window.clearTimeout(timer);
  }, [active, delay, minDuration, shown]);
  return shown ? <div className="bt-top-loader" role="progressbar" aria-label={t.loading}><span /></div> : null;
}

export type PopoverProps = {
  trigger: ReactElement;
  title?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Pass with `onOpenChange` to control it, for example to close from a button inside. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export function Popover({ trigger, title, side = "bottom", align = "start", open, onOpenChange, children }: PopoverProps) {
  return (
    <BasePopover.Root open={open} onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}>
      <BasePopover.Trigger render={trigger as ReactElement<Record<string, unknown>>} />
      <BasePopover.Portal>
        <BasePopover.Positioner className="bt-positioner" side={side} align={align} sideOffset={6}>
          <BasePopover.Popup className="bt-popup bt-popover">
            {title ? <BasePopover.Title className="bt-popover-title">{title}</BasePopover.Title> : null}
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

export type AccordionItem = { value: string; title: ReactNode; content: ReactNode; disabled?: boolean };

export type AccordionProps = {
  items: AccordionItem[];
  /** Open panels. Leave it out to let the component manage them. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** Allow more than one open panel. */
  multiple?: boolean;
  className?: string;
};

export function Accordion({ items, value, defaultValue, onChange, multiple, className }: AccordionProps) {
  return (
    <BaseAccordion.Root value={value} defaultValue={defaultValue} onValueChange={(next) => onChange?.(next as string[])} multiple={multiple} className={cx("bt-accordion", className)}>
      {items.map((item) => (
        <BaseAccordion.Item key={item.value} value={item.value} disabled={item.disabled} className="bt-acc-item">
          <BaseAccordion.Header className="bt-acc-head">
            <BaseAccordion.Trigger className="bt-acc-trigger">
              {item.title}
              <span className="bt-acc-chevron"><ChevronDown size={14} /></span>
            </BaseAccordion.Trigger>
          </BaseAccordion.Header>
          <BaseAccordion.Panel className="bt-acc-panel"><div className="bt-acc-body">{item.content}</div></BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  );
}
