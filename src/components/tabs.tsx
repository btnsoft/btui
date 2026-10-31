import type { ReactNode } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { Badge } from "./display";

export type TabItem = {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
  content?: ReactNode;
};

export type TabsProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: "line" | "chip";
  className?: string;
};

export function Tabs({ items, value, defaultValue, onChange, variant = "line", className }: TabsProps) {
  return (
    <BaseTabs.Root value={value} defaultValue={defaultValue ?? items[0]?.value} onValueChange={(next) => onChange?.(next as string)} className={className}>
      <BaseTabs.List className="bt-tabs-list" data-variant={variant}>
        {items.map((tab) => (
          <BaseTabs.Tab key={tab.value} value={tab.value} disabled={tab.disabled} className="bt-tab">
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined ? <Badge>{tab.badge}</Badge> : null}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {items.map((tab) =>
        tab.content !== undefined ? (
          <BaseTabs.Panel key={tab.value} value={tab.value} className="bt-tab-panel">{tab.content}</BaseTabs.Panel>
        ) : null,
      )}
    </BaseTabs.Root>
  );
}
