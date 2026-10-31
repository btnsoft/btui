import type { ComponentType } from "react";
import {
  IconAlertCircle, IconAlertTriangle, IconAppWindow, IconArrowsMoveVertical, IconBadge, IconBell, IconBook, IconBox, IconBrush, IconBulb, IconCalculator, IconCards, IconCheckbox, IconChevronsRight,
  IconCircleDot, IconClick, IconColumns3, IconDots, IconDownload, IconFileUpload, IconFilter, IconForms, IconHeading, IconId, IconKeyboard, IconLanguage, IconLayoutNavbar, IconLayoutSidebar,
  IconLayoutSidebarRight, IconList, IconListCheck, IconLoader2, IconMessage, IconMoodEmpty, IconNumbers, IconPageBreak, IconPencil, IconPointFilled, IconProgress, IconSearch, IconSelect, IconSquares, IconTable, IconTag, IconTextSize, IconToggleLeft, IconUser, IconWindowMaximize,
} from "@tabler/icons-react";
import type { Text } from "./i18n";

export type NavPage = { id: string; title: Text; icon: ComponentType<{ size?: number }> };
export type NavSection = { title: Text; pages: NavPage[] };

export const NAV: NavSection[] = [
  {
    title: { tr: "Başlarken", en: "Getting started" },
    pages: [
      { id: "introduction", title: { tr: "Giriş", en: "Introduction" }, icon: IconBook },
      { id: "installation", title: { tr: "Kurulum", en: "Installation" }, icon: IconDownload },
      { id: "theming", title: { tr: "Tema", en: "Theming" }, icon: IconBrush },
      { id: "localization", title: { tr: "Dil ve biçim", en: "Localization" }, icon: IconLanguage },
      { id: "patterns", title: { tr: "Ekran kalıpları", en: "Screen patterns" }, icon: IconBulb },
    ],
  },
  {
    title: { tr: "Eylem", en: "Actions" },
    pages: [
      { id: "button", title: "Button", icon: IconClick },
      { id: "icon-button", title: "IconButton", icon: IconPointFilled },
      { id: "button-group", title: "ButtonGroup", icon: IconSquares },
      { id: "menu", title: "Menu", icon: IconDots },
    ],
  },
  {
    title: { tr: "Form", en: "Forms" },
    pages: [
      { id: "field", title: "Field", icon: IconForms },
      { id: "input", title: "Input", icon: IconPencil },
      { id: "number-input", title: "NumberInput", icon: IconCalculator },
      { id: "textarea", title: "Textarea", icon: IconTextSize },
      { id: "search-input", title: "SearchInput", icon: IconSearch },
      { id: "select", title: "Select", icon: IconSelect },
      { id: "multi-select", title: "MultiSelect", icon: IconListCheck },
      { id: "checkbox", title: "Checkbox", icon: IconCheckbox },
      { id: "radio-group", title: "RadioGroup", icon: IconCircleDot },
      { id: "switch", title: "Switch", icon: IconToggleLeft },
      { id: "file-dropzone", title: "FileDropzone", icon: IconFileUpload },
    ],
  },
  {
    title: { tr: "Veri", en: "Data" },
    pages: [
      { id: "data-table", title: "DataTable", icon: IconTable },
      { id: "pagination", title: "Pagination", icon: IconPageBreak },
      { id: "card", title: "Card", icon: IconBox },
      { id: "kpi", title: "Kpi", icon: IconNumbers },
      { id: "info-row", title: "InfoRow", icon: IconList },
      { id: "badge", title: "Badge", icon: IconBadge },
      { id: "status", title: "Status", icon: IconPointFilled },
      { id: "chip", title: "Chip", icon: IconTag },
      { id: "avatar", title: "Avatar", icon: IconUser },
      { id: "kbd", title: "Kbd", icon: IconKeyboard },
      { id: "empty-state", title: "EmptyState", icon: IconMoodEmpty },
    ],
  },
  {
    title: { tr: "Geri bildirim", en: "Feedback" },
    pages: [
      { id: "alert", title: "Alert", icon: IconAlertCircle },
      { id: "toast", title: "Toast", icon: IconBell },
      { id: "confirm", title: "useConfirm", icon: IconAlertTriangle },
      { id: "progress", title: "Progress", icon: IconProgress },
      { id: "spinner", title: "Spinner", icon: IconLoader2 },
      { id: "skeleton", title: "Skeleton", icon: IconCards },
    ],
  },
  {
    title: { tr: "Katmanlar", en: "Overlays" },
    pages: [
      { id: "modal", title: "Modal", icon: IconWindowMaximize },
      { id: "drawer", title: "Drawer", icon: IconLayoutSidebarRight },
      { id: "popover", title: "Popover", icon: IconMessage },
      { id: "tooltip", title: "Tooltip", icon: IconId },
    ],
  },
  {
    title: { tr: "Yerleşim", en: "Layout" },
    pages: [
      { id: "app-shell", title: "AppShell", icon: IconAppWindow },
      { id: "sidebar", title: "Sidebar", icon: IconLayoutSidebar },
      { id: "topbar", title: "Topbar", icon: IconLayoutNavbar },
      { id: "breadcrumb", title: "Breadcrumb", icon: IconChevronsRight },
      { id: "page-header", title: "PageHeader", icon: IconHeading },
      { id: "filter-bar", title: "FilterBar", icon: IconFilter },
      { id: "tabs", title: "Tabs", icon: IconColumns3 },
      { id: "accordion", title: "Accordion", icon: IconArrowsMoveVertical },
    ],
  },
];

export const PAGES = NAV.flatMap((section) => section.pages.map((page) => ({ ...page, section: section.title })));
export const GUIDE_IDS = NAV[0].pages.map((page) => page.id);
