import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cx, flag } from "../utils";

export type ButtonVariant = "default" | "primary" | "soft" | "dark" | "danger" | "success" | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export type ButtonProps = ComponentPropsWithoutRef<typeof BaseButton> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  /** Shows a spinner, keeps the width, blocks clicks and stays focusable. */
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "default", size = "md", icon, iconEnd, loading, fullWidth, disabled, className, children, ...rest },
  ref,
) {
  return (
    <BaseButton
      ref={ref}
      className={cx("bt-btn", className)}
      data-variant={variant}
      data-size={size}
      data-full={flag(fullWidth)}
      data-loading={flag(loading)}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      focusableWhenDisabled={loading || undefined}
      {...rest}
    >
      {icon}
      {typeof children === "string" || typeof children === "number" ? <span>{children}</span> : children}
      {iconEnd}
      {loading ? <span className="bt-btn-spin" aria-hidden="true" /> : null}
    </BaseButton>
  );
});

export function ButtonGroup({ className, ...rest }: ComponentPropsWithoutRef<"div">) {
  return <div role="group" className={cx("bt-btn-group", className)} {...rest} />;
}

export type IconButtonProps = ComponentPropsWithoutRef<typeof BaseButton> & {
  /** Required: an icon alone gives assistive technology nothing to read. */
  label: string;
  size?: "sm" | "md";
  /** Filled look used for row actions in tables. */
  solid?: boolean;
  /** Marks a destructive action. */
  tone?: "default" | "danger";
  /** Shows a spinner, blocks clicks and stays focusable. */
  loading?: boolean;
  className?: string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = "md", solid, tone = "default", loading, disabled, className, children, ...rest },
  ref,
) {
  return (
    <BaseButton
      ref={ref}
      aria-label={label}
      title={label}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      focusableWhenDisabled={loading || undefined}
      className={cx("bt-icon-btn", className)}
      data-size={size}
      data-solid={flag(solid)}
      data-tone={tone}
      data-loading={flag(loading)}
      {...rest}
    >
      {loading ? <span className="bt-btn-spin" aria-hidden="true" /> : children}
    </BaseButton>
  );
});
