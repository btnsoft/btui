import type { ReactNode } from "react";

function Icon({ size = 14, children }: { size?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

type P = { size?: number };
export const ChevronDown = (p: P) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>;
export const ChevronRight = (p: P) => <Icon {...p}><path d="m9 6 6 6-6 6" /></Icon>;
export const ChevronLeft = (p: P) => <Icon {...p}><path d="m15 6-6 6 6 6" /></Icon>;
export const Check = (p: P) => <Icon {...p}><path d="m5 12 5 5L20 7" /></Icon>;
export const Close = (p: P) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12" /></Icon>;
export const Search = (p: P) => <Icon {...p}><circle cx="10" cy="10" r="7" /><path d="m21 21-6-6" /></Icon>;
export const Menu = (p: P) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>;
export const Filter = (p: P) => <Icon {...p}><path d="M4 6h16M7 12h10M10 18h4" /></Icon>;
export const Columns = (p: P) => <Icon {...p}><path d="M4 5h16v14H4zM12 5v14" /></Icon>;
export const Upload = (p: P) => <Icon {...p}><path d="M12 16V5M7 10l5-5 5 5M4 19h16" /></Icon>;
