import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { useLocale } from "../locale";
import { cx, flag, type Tone } from "../utils";

export type BadgeProps = ComponentPropsWithoutRef<"span"> & { tone?: Tone };

export function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return <span className={cx("bt-badge", className)} data-tone={tone} {...rest} />;
}

export type StatusProps = ComponentPropsWithoutRef<"span"> & { tone?: Tone | "muted" };

export function Status({ tone = "neutral", className, ...rest }: StatusProps) {
  return <span className={cx("bt-status", className)} data-tone={tone} {...rest} />;
}

export type ChipProps = Omit<ComponentPropsWithoutRef<"button">, "type"> & {
  active?: boolean;
  count?: ReactNode;
  /** Status colour: a dot on the chip, a solid fill in an accent DataTable band. */
  tone?: Tone;
};

export function Chip({ active, count, tone, className, children, ...rest }: ChipProps) {
  return (
    <button type="button" className={cx("bt-chip", className)} aria-pressed={!!active} data-active={flag(active)} data-tone={tone} {...rest}>
      {children}
      {count !== undefined ? <span className="bt-chip-count">{count}</span> : null}
    </button>
  );
}

export function ChipGroup({ className, ...rest }: ComponentPropsWithoutRef<"div">) {
  return <div role="group" className={cx("bt-chips", className)} {...rest} />;
}

export function Kbd({ className, ...rest }: ComponentPropsWithoutRef<"kbd">) {
  return <kbd className={cx("bt-kbd", className)} {...rest} />;
}

export type AvatarProps = Omit<ComponentPropsWithoutRef<typeof BaseAvatar.Root>, "children" | "className"> & { name: string; src?: string; size?: number; className?: string };

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ name, src, size, className, ...rest }, ref) {
  const t = useLocale();
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toLocaleUpperCase(t.lang);
  return (
    <BaseAvatar.Root ref={ref} role="img" aria-label={name} className={cx("bt-avatar", className)} style={size ? { width: size, height: size, fontSize: size * 0.38 } : undefined} {...rest}>
      {src ? <BaseAvatar.Image src={src} alt={name} /> : null}
      <BaseAvatar.Fallback>{initials}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
});

export function Spinner({ size, label }: { size?: number; label?: string }) {
  const t = useLocale();
  return <span role="status" aria-label={label ?? t.loading} className="bt-spinner" style={size ? { width: size, height: size } : undefined} />;
}

export function Loading({ children }: { children?: ReactNode }) {
  const t = useLocale();
  return (
    <div className="bt-loading" role="status">
      <span className="bt-spinner" aria-hidden="true" />
      {children ?? t.loading}
    </div>
  );
}

export type EmptyStateProps = {
  icon?: ReactNode;
  /** Bold line above the message. */
  title?: ReactNode;
  children?: ReactNode;
  /** The next step, usually a Button. */
  action?: ReactNode;
};

export function EmptyState({ icon, title, children, action }: EmptyStateProps) {
  const t = useLocale();
  return (
    <div className="bt-empty">
      {icon ? <div className="bt-empty-icon">{icon}</div> : null}
      {title ? <b className="bt-empty-title">{title}</b> : null}
      <div>{children ?? (title ? null : t.empty)}</div>
      {action ? <div className="bt-empty-action">{action}</div> : null}
    </div>
  );
}
