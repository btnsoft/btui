# btui

Kurumsal iş yazılımları için keskin ve yoğun React bileşenleri. Davranış ve erişilebilirlik [Base UI](https://base-ui.com)'dan gelir, hazır görünüm ve iş bileşenleri btui'dandır.

**Dokümantasyon:** https://btnsoft.github.io/btui/

## Kurulum

```bash
npm install github:btnsoft/btui
```

React 18 ya da 19 gerekir.

```tsx
import { BtuiProvider, Button } from "btui";
import "btui/styles.css";

export function App() {
  return (
    <BtuiProvider locale="tr">
      <div className="bt-root">
        <Button variant="primary">Kaydet</Button>
      </div>
    </BtuiProvider>
  );
}
```

## İçindekiler

- **Eylem:** Button, IconButton, ButtonGroup, Menu
- **Form:** Field, Input, NumberInput, Textarea, SearchInput, Select, MultiSelect, Checkbox, RadioGroup, Switch, DatePicker, DateRangePicker, Calendar, FileDropzone
- **Veri:** DataTable (100 bin satır, kolon filtreleri, gruplama, pivot, hücre seçimi, yerinde düzenleme, gerçek .xlsx, sunucu veri modeli), Pagination, Card, Kpi, InfoRow, Badge, Status, Chip, Avatar, Kbd, EmptyState
- **Geri bildirim:** Alert, useToast, useConfirm, Progress, Spinner, Loading, Skeleton
- **Katmanlar:** Modal, Drawer, Popover, Tooltip
- **Yerleşim:** AppShell, Sidebar, Topbar, Breadcrumb, PageHeader, FilterBar, Tabs, Accordion

Her bileşenin Türkçe ve İngilizce ayrı sayfası var: kullanım kuralları, canlı örnekler, erişilebilirlik ve API tablosu.

## Geliştirme

```bash
npm install
npm run dev        # dokümantasyon sitesi
npm test
npm run typecheck
npm run build      # paket: dist/
npm run build:docs # site: docs/dist/
```

## Lisans

MIT
