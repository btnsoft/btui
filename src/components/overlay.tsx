import { createContext, useCallback, useContext, useMemo, useRef, useState, type CSSProperties, type ReactElement, type ReactNode, type RefObject } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog } from "@base-ui/react/dialog";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Toast } from "@base-ui/react/toast";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { CheckCircle, Close, ErrorCircle, InfoCircle, WarnTriangle } from "../icons";
import { en, LocaleContext, tr, useLocale, type BtuiLocale } from "../locale";
import { cx, flag } from "../utils";
import { Button, IconButton } from "./button";

const MODAL_WIDTHS = { sm: 440, md: 640, lg: 880, xl: 1120 };

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Announced with the title when the window opens. */
  description?: ReactNode;
  /** Element that receives focus on open. By default the close button does. */
  initialFocus?: RefObject<HTMLElement | null>;
  size?: keyof typeof MODAL_WIDTHS;
  footer?: ReactNode;
  /** `accent` fills the header with the brand colour. */
  tone?: "plain" | "accent";
  children: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, description, initialFocus, size = "md", footer, tone = "plain", children, className }: ModalProps) {
  const t = useLocale();
  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="bt-scrim" />
        <Dialog.Popup className={cx("bt-popup bt-modal", className)} initialFocus={initialFocus} data-tone={tone} style={{ "--bt-modal-width": `${MODAL_WIDTHS[size]}px` } as CSSProperties}>
          <div className="bt-modal-head">
            <Dialog.Title className="bt-modal-title">{title}</Dialog.Title>
            <Dialog.Close render={<IconButton label={t.close}><Close size={16} /></IconButton>} />
          </div>
          <div className="bt-modal-body">
            {description ? <Dialog.Description className="bt-modal-desc">{description}</Dialog.Description> : null}
            {children}
          </div>
          {footer ? <div className="bt-modal-foot">{footer}</div> : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  width?: number;
  footer?: ReactNode;
  children: ReactNode;
};

export function Drawer({ open, onClose, title, subtitle, width, footer, children }: DrawerProps) {
  const t = useLocale();
  return (
    <BaseDrawer.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }} swipeDirection="right">
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop className="bt-scrim" />
        <BaseDrawer.Viewport className="bt-drawer-viewport">
          <BaseDrawer.Popup className="bt-popup bt-drawer" style={width ? ({ "--bt-drawer-width": `${width}px` } as CSSProperties) : undefined}>
            <div className="bt-drawer-head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <BaseDrawer.Title className="bt-drawer-title">{title}</BaseDrawer.Title>
                {subtitle ? <BaseDrawer.Description className="bt-drawer-sub">{subtitle}</BaseDrawer.Description> : null}
              </div>
              <BaseDrawer.Close render={<IconButton label={t.close}><Close size={16} /></IconButton>} />
            </div>
            <div className="bt-drawer-body">{children}</div>
            {footer ? <div className="bt-drawer-foot">{footer}</div> : null}
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}

export type TooltipProps = {
  content: ReactNode;
  children: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
};

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children as ReactElement<Record<string, unknown>>} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner className="bt-positioner" side={side} sideOffset={6}>
          <BaseTooltip.Popup className="bt-popup bt-tooltip">{content}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

export type MenuProps = {
  /** The element that opens the menu, usually a Button. */
  trigger: ReactElement;
  align?: "start" | "center" | "end";
  children: ReactNode;
};

export function Menu({ trigger, align = "end", children }: MenuProps) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={trigger as ReactElement<Record<string, unknown>>} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner className="bt-positioner" sideOffset={6} align={align}>
          <BaseMenu.Popup className="bt-popup bt-menu">{children}</BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export type MenuItemProps = {
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export function MenuItem({ icon, danger, disabled, onClick, children }: MenuItemProps) {
  return (
    <BaseMenu.Item className="bt-menu-item" data-danger={flag(danger)} disabled={disabled} onClick={onClick}>
      {icon}
      {children}
    </BaseMenu.Item>
  );
}

export function MenuSeparator() {
  return <BaseMenu.Separator className="bt-menu-sep" />;
}

export type ConfirmOptions = {
  message: ReactNode;
  title?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type Confirm = (options: ConfirmOptions | string) => Promise<boolean>;
const ConfirmContext = createContext<Confirm | null>(null);

/** Promise-based `confirm()`. Resolves true only when the user confirms. */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used inside <BtuiProvider>.");
  return confirm;
}

function ConfirmHost({ children }: { children: ReactNode }) {
  const t = useLocale();
  const [request, setRequest] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const finish = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOpen(false);
  }, []);

  const confirm = useCallback<Confirm>((options) => {
    // A second request supersedes the first, which must still settle.
    resolver.current?.(false);
    setRequest(typeof options === "string" ? { message: options } : options);
    setOpen(true);
    return new Promise((resolve) => { resolver.current = resolve; });
  }, []);

  const danger = !!request?.danger;
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root open={open} onOpenChange={(next) => { if (!next) finish(false); }}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="bt-scrim" />
          <AlertDialog.Popup className="bt-popup bt-modal bt-confirm">
            <div className="bt-confirm-body">
              <div className="bt-confirm-mark" data-danger={flag(danger)} aria-hidden="true">!</div>
              <div>
                <AlertDialog.Title className="bt-confirm-title">{request?.title ?? (danger ? t.areYouSure : t.confirm)}</AlertDialog.Title>
                <AlertDialog.Description className="bt-confirm-text">{request?.message}</AlertDialog.Description>
              </div>
            </div>
            <div className="bt-modal-foot">
              <Button onClick={() => finish(false)}>{request?.cancelLabel ?? t.cancel}</Button>
              <Button variant={danger ? "danger" : "primary"} onClick={() => finish(true)}>{request?.confirmLabel ?? t.confirm}</Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}

export type ToastOptions = {
  title?: ReactNode;
  description?: ReactNode;
  tone?: "info" | "ok" | "warn" | "danger";
  /** Milliseconds. 0 keeps it until dismissed. */
  timeout?: number;
  /** A button on the toast, such as "Undo". Pressing it also closes the toast. */
  action?: { label: string; onClick: () => void };
};

/** Returns a function that shows a toast and gives back its id. */
export function useToast() {
  const manager = Toast.useToastManager();
  return useCallback(
    ({ title, description, tone = "info", timeout, action }: ToastOptions) => {
      const id: string = manager.add({
        title,
        description,
        type: tone,
        timeout,
        actionProps: action
          ? { children: action.label, onClick: () => { action.onClick(); manager.close(id); } }
          : undefined,
      });
      return id;
    },
    [manager],
  );
}

const TOAST_ICONS = {
  ok: <CheckCircle size={18} />,
  warn: <WarnTriangle size={18} />,
  danger: <ErrorCircle size={18} />,
  info: <InfoCircle size={18} />,
};

function ToastList() {
  const t = useLocale();
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport className="bt-popup bt-toasts" aria-label={t.notifications}>
        {toasts.map((toast) => (
          <Toast.Root key={toast.id} toast={toast} className="bt-toast" data-type={toast.type}>
            <Toast.Content className="bt-toast-body">
              <span className="bt-toast-icon">{TOAST_ICONS[toast.type as keyof typeof TOAST_ICONS] ?? <InfoCircle size={18} />}</span>
              <div className="bt-toast-main">
                <Toast.Title className="bt-toast-title" />
                <Toast.Description className="bt-toast-text" />
              </div>
              {toast.actionProps ? <Toast.Action className="bt-toast-action" /> : null}
              <Toast.Close render={<IconButton label={t.close} size="sm"><Close size={14} /></IconButton>} />
            </Toast.Content>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

export type BtuiProviderProps = {
  /** `"tr"`, `"en"` or your own object. Default is Turkish. */
  locale?: "tr" | "en" | BtuiLocale;
  children: ReactNode;
};

/** Wrap the app once. Supplies labels, confirm dialogs, toasts and tooltip timing. */
export function BtuiProvider({ locale = "tr", children }: BtuiProviderProps) {
  const value = useMemo(() => (locale === "tr" ? tr : locale === "en" ? en : locale), [locale]);
  return (
    <LocaleContext.Provider value={value}>
      <BaseTooltip.Provider delay={300}>
        <Toast.Provider>
          <ConfirmHost>{children}</ConfirmHost>
          <ToastList />
        </Toast.Provider>
      </BaseTooltip.Provider>
    </LocaleContext.Provider>
  );
}
