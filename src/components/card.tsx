import { createContext, useContext, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "../utils";

export type CardProps = Omit<ComponentPropsWithoutRef<"section">, "title"> & {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  /** Removes body padding, for a chart or list that fills the card. */
  flush?: boolean;
};

export function Card({ title, subtitle, icon, actions, flush, className, children, ...rest }: CardProps) {
  return (
    <section className={cx("bt-card", className)} {...rest}>
      {title || subtitle || actions ? (
        <header className="bt-card-head">
          <div>
            {title ? <h2 className="bt-card-title">{icon}{title}</h2> : null}
            {subtitle ? <small className="bt-card-sub">{subtitle}</small> : null}
          </div>
          {actions ? <div className="bt-card-actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="bt-card-body" data-flush={flush ? "" : undefined}>{children}</div>
    </section>
  );
}

export type KpiProps = {
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  /** Change against the previous period. `good` sets the colour when falling is good news, such as for costs. */
  trend?: { value: ReactNode; direction: "up" | "down"; good?: boolean };
  icon?: ReactNode;
  /** Colours the number only. The card itself stays neutral. */
  tone?: "neutral" | "ok" | "warn" | "danger";
  onClick?: () => void;
  /** Marks a clickable card as the filter in use. */
  active?: boolean;
  className?: string;
};

export function Kpi({ label, value, note, trend, icon, tone = "neutral", onClick, active, className }: KpiProps) {
  const body = (
    <>
      <span className="bt-kpi-label">{icon}{label}</span>
      <b className="bt-kpi-value">{value}</b>
      {note !== undefined || trend ? (
        <small className="bt-kpi-note">
          {trend ? <span className="bt-kpi-trend" data-good={(trend.good ?? trend.direction === "up") ? "true" : "false"}>{trend.direction === "up" ? "↑" : "↓"} {trend.value}</span> : null}
          {note}
        </small>
      ) : null}
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} aria-pressed={active === undefined ? undefined : active} data-active={active ? "" : undefined} className={cx("bt-kpi", className)} data-tone={tone}>{body}</button>
  ) : (
    <div className={cx("bt-kpi", className)} data-tone={tone}>{body}</div>
  );
}

export function KpiGrid({ className, ...rest }: ComponentPropsWithoutRef<"div">) {
  return <div className={cx("bt-kpis", className)} {...rest} />;
}

const InListContext = createContext(false);

/** Groups InfoRows as a description list, so each label stays tied to its value. */
export function InfoList({ className, children }: { className?: string; children: ReactNode }) {
  return <dl className={cx("bt-info-list", className)}><InListContext.Provider value>{children}</InListContext.Provider></dl>;
}

export function InfoRow({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  const inList = useContext(InListContext);
  const Label = inList ? "dt" : "span";
  const Value = inList ? "dd" : "span";
  return (
    <div className={cx("bt-info", className)}>
      <Label className="bt-info-label">{label}</Label>
      <Value className="bt-info-value">{children}</Value>
    </div>
  );
}
