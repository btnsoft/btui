import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cx, flag } from "../utils";

export type ButtonVariant = "default" | "primary" | "dark" | "danger" | "success" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ComponentPropsWithoutRef<typeof BaseButton> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "default", size = "md", icon, fullWidth, className, children, ...rest },
  ref,
) {
  return (
    <BaseButton ref={ref} className={cx("bt-btn", className)} data-variant={variant} data-size={size} data-full={flag(fullWidth)} {...rest}>
      {icon}
      {children}
    </BaseButton>
  );
});

export type IconButtonProps = ComponentPropsWithoutRef<typeof BaseButton> & {
  /** Required: an icon alone gives assistive technology nothing to read. */
  label: string;
  size?: "sm" | "md";
  /** Filled look used for row actions in tables. */
  solid?: boolean;
  className?: string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = "md", solid, className, children, ...rest },
  ref,
) {
  return (
    <BaseButton ref={ref} aria-label={label} title={label} className={cx("bt-icon-btn", className)} data-size={size} data-solid={flag(solid)} {...rest}>
      {children}
    </BaseButton>
  );
});
