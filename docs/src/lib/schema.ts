import type { ComponentType } from "react";
import type { Text } from "./i18n";

export type Prop = { name: string; type: string; default?: string; required?: boolean; description: Text };
export type ApiEntry = { name: string; description?: Text; props: Prop[] };
export type Example = { Demo: ComponentType; code: Text; /** Full-width stage instead of a centred one. */ block?: boolean };
export type Section = { id: string; title: Text; body?: Text; example?: Example; /** Code without a live demo. */ code?: Text };
export type StyleHook = { name: string; kind: "data" | "var"; description: Text };

export type PageContent = {
  summary: Text;
  /** Import line shown under the title. */
  imports: string;
  /** Base UI page slug, when the component is built on one. */
  base?: string;
  hero: Example;
  use: { do: Text[]; dont: Text[] };
  /** Structure of a typical usage, as code. */
  anatomy?: string;
  examples: Section[];
  a11y: Text[];
  keyboard?: Array<[keys: string, action: Text]>;
  api: ApiEntry[];
  styling?: StyleHook[];
  /** Ids from nav.ts. */
  related: string[];
};

export function definePage(page: PageContent) {
  return page;
}
