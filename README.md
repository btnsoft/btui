# btui

Yoğun veri ekranları için sakin React bileşenleri. Davranış ve erişilebilirlik [Base UI](https://base-ui.com)'dan, görünüm hoki mavisi tasarım dilinden gelir.

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

- **Form:** Button, IconButton, Select, MultiSelect, Field, Input, Textarea, SearchInput, Switch, Checkbox, FileDropzone
- **Veri:** DataTable, Pagination, Card, Kpi, InfoRow, Badge, Status, Chip, Avatar, Kbd, Spinner
- **Katmanlar:** Modal, Drawer, useConfirm, useToast, Menu, Tooltip
- **Yerleşim:** AppShell, Sidebar, Topbar, Breadcrumb, PageHeader, FilterBar, Tabs

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
