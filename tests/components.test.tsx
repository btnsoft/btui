import { useState } from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { BarChart, DonutChart, LineChart, Sparkline, niceTicks, Calendar, DatePicker, DateRangePicker, IconButton, Menu, MenuGroup, MenuItem, SearchInput, SubMenu, Tooltip, useToast, Accordion, Alert, Avatar, BtuiProvider, Checkbox, Button, DataTable, Sidebar, Tabs, Field, FileDropzone, Input, Modal, MultiSelect, NumberInput, RadioGroup, Select, Switch, pageRange, sortRows, useConfirm, type Column } from "../src";
import { fileMatchesAccept, includesText } from "../src/utils";
import { buildCsv, buildXlsx, parseNumber, pivot, sortByMany } from "../src";
import { FilterPanel } from "../src/components/table/parts";
import { buildTree, columnName, fillSeries, filterRows, groupRows, leafRows, parseTsv, toTsv, type Column as GridColumn } from "../src/components/table/engine";
import { addMonths, dateOrder, firstDayOfWeek, monthGrid, parseDate } from "../src/date";

type Row = { id: number; name: string; km: number | null };
const rows: Row[] = [
  { id: 1, name: "Şule", km: 300 },
  { id: 2, name: "Ali", km: null },
  { id: 3, name: "Çınar", km: 20 },
  { id: 4, name: "Zeki", km: 100 },
];
const columns: Column<Row>[] = [{ key: "name", header: "Ad" }, { key: "km", header: "KM", align: "right" }];
const firstCells = () => screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[0].textContent);

function Controlled({ count = 3, onChange }: { count?: number; onChange?: (v: string) => void }) {
  const [value, setValue] = useState("");
  const options = ["İzmir", "Ankara", "Iğdır", "Bursa", "Muğla", "Adana", "Kars", "Rize", "Van", "Bolu"].slice(0, count).map((c) => ({ value: c, label: c }));
  return <BtuiProvider><Select aria-label="İl" options={options} value={value} clearable onChange={(v) => { setValue(v); onChange?.(v); }} /></BtuiProvider>;
}

describe("Select", () => {
  it("picks an option and clears it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    await user.click(screen.getByRole("combobox", { name: "İl" }));
    await user.click(await screen.findByRole("option", { name: "Ankara" }));
    expect(onChange).toHaveBeenLastCalledWith("Ankara");
    await user.click(screen.getByRole("button", { name: "Temizle" }));
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("adds a search box past 8 options and filters with Turkish casing", async () => {
    const user = userEvent.setup();
    render(<Controlled count={10} />);
    await user.click(screen.getByLabelText("İl"));
    const box = await screen.findByPlaceholderText("Ara…");
    await user.type(box, "izmir");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    expect(screen.getByRole("option", { name: "İzmir" })).toBeInTheDocument();
    await user.clear(box);
    await user.type(box, "zzz");
    expect(await screen.findByText("Sonuç yok")).toBeInTheDocument();
  });
});

describe("MultiSelect", () => {
  it("adds and removes values and summarises them", async () => {
    const user = userEvent.setup();
    const Demo = () => {
      const [value, setValue] = useState<string[]>([]);
      return <BtuiProvider><MultiSelect label="İl" aria-label="İl" value={value} onChange={setValue} options={[{ value: "a", label: "Ankara" }, { value: "b", label: "Bursa" }]} /></BtuiProvider>;
    };
    render(<Demo />);
    await user.click(screen.getByLabelText("İl"));
    await user.click(await screen.findByRole("option", { name: "Ankara" }));
    await user.click(await screen.findByRole("option", { name: "Bursa" }));
    expect(screen.getAllByText("2 seçili").length).toBeGreaterThan(0);
    await user.click(await screen.findByRole("option", { name: "Bursa" }));
    expect(screen.getAllByText("Ankara").length).toBeGreaterThan(0);
    expect(screen.queryByText("2 seçili")).toBeNull();
  });
});

describe("DataTable", () => {
  it("sorts with Turkish collation, cycles direction and keeps blanks last", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} />);
    const name = screen.getByRole("button", { name: /Ad/ });
    await user.click(name);
    expect(firstCells()).toEqual(["Ali", "Çınar", "Şule", "Zeki"]);
    expect(screen.getByRole("columnheader", { name: /Ad/ })).toHaveAttribute("aria-sort", "ascending");
    await user.click(name);
    expect(firstCells()).toEqual(["Zeki", "Şule", "Çınar", "Ali"]);
    await user.click(name);
    expect(firstCells()).toEqual(["Şule", "Ali", "Çınar", "Zeki"]);
    await user.click(screen.getByRole("button", { name: /KM/ }));
    await user.click(screen.getByRole("button", { name: /KM/ }));
    expect(firstCells()).toEqual(["Şule", "Zeki", "Çınar", "Ali"]);
  });

  it("paginates and resets to page 1 on sort", async () => {
    const user = userEvent.setup();
    render(<BtuiProvider><DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} pageSize={2} /></BtuiProvider>);
    expect(screen.getByText("1-2 / 4 kayıt")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "2" }));
    expect(firstCells()).toEqual(["Çınar", "Zeki"]);
    await user.click(screen.getByRole("button", { name: /Ad/ }));
    expect(firstCells()).toEqual(["Ali", "Çınar"]);
  });

  it("leaves rows untouched in server mode and asks for the page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();
    render(<DataTable columns={columns} rows={rows.slice(0, 2)} getRowKey={(r) => r.id} pageSize={2} onSortChange={onSortChange} server={{ total: 40, page: 1, onPageChange }} />);
    await user.click(screen.getByRole("button", { name: /Ad/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "asc" }, [{ key: "name", direction: "asc" }]);
    expect(firstCells()).toEqual(["Şule", "Ali"]);
    await user.click(screen.getByRole("button", { name: "Sonraki sayfa" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("hides columns, remembers them and never hides the last one", async () => {
    const user = userEvent.setup();
    const ui = <DataTable title="Liste" storageKey="t" columns={columns} rows={rows} getRowKey={(r) => r.id} />;
    const { unmount } = render(ui);
    await user.click(screen.getByRole("button", { name: "Kolonlar" }));
    await user.click(await screen.findByRole("checkbox", { name: "KM" }));
    expect(screen.queryByRole("columnheader", { name: /KM/ })).toBeNull();
    expect(screen.getByRole("checkbox", { name: "Ad" })).toHaveAttribute("aria-disabled", "true");
    unmount();
    render(ui);
    await waitFor(() => expect(screen.queryByRole("columnheader", { name: /KM/ })).toBeNull());
  });

  it("survives corrupt saved preferences", () => {
    localStorage.setItem("t", "{bozuk");
    render(<DataTable storageKey="t" columns={columns} rows={rows} getRowKey={(r) => r.id} />);
    expect(screen.getByRole("columnheader", { name: /KM/ })).toBeInTheDocument();
    expect(localStorage.getItem("t")).toBeNull();
  });

  it("opens detail without firing the row click", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} rows={rows.slice(0, 1)} getRowKey={(r) => r.id} onRowClick={onRowClick} renderDetail={(r) => <p>detay {r.name}</p>} />);
    await user.click(screen.getByRole("button", { name: "Ayrıntıyı göster" }));
    expect(screen.getByText("detay Şule")).toBeInTheDocument();
    expect(onRowClick).not.toHaveBeenCalled();
    await user.click(screen.getByText("Şule"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("shows empty and loading states", () => {
    const { rerender } = render(<DataTable columns={columns} rows={[]} getRowKey={(r) => r.id} />);
    expect(screen.getByText("Kayıt yok.")).toBeInTheDocument();
    rerender(<DataTable columns={columns} rows={[]} getRowKey={(r) => r.id} loading />);
    expect(screen.getByText("Yükleniyor…")).toBeInTheDocument();
  });
});

describe("helpers", () => {
  it("pageRange keeps ends and a window", () => {
    expect(pageRange(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
    expect(pageRange(1, 3)).toEqual([1, 2, 3]);
  });
  it("sortRows does not mutate its input", () => {
    const before = [...rows];
    sortRows(rows, columns[0], "asc", "tr");
    expect(rows).toEqual(before);
  });
  it("includesText follows locale casing", () => {
    expect(includesText("İZMİR", "izmir", "tr")).toBe(true);
    expect(includesText("IĞDIR", "ığdır", "tr")).toBe(true);
    expect(includesText("Iğdır", "igdir", "tr")).toBe(false);
  });
  it("fileMatchesAccept handles extensions and wildcards", () => {
    expect(fileMatchesAccept({ name: "a.PDF", type: "" }, ".pdf")).toBe(true);
    expect(fileMatchesAccept({ name: "a.png", type: "image/png" }, "image/*,.pdf")).toBe(true);
    expect(fileMatchesAccept({ name: "a.exe", type: "x/y" }, "image/*,.pdf")).toBe(false);
    expect(fileMatchesAccept({ name: "a.exe", type: "" }, undefined)).toBe(true);
  });
});

describe("Modal and confirm", () => {
  it("closes on Escape and the close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<BtuiProvider><Modal open onClose={onClose} title="Başlık">gövde</Modal></BtuiProvider>);
    expect(screen.getByRole("dialog", { name: "Başlık" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Kapat" }));
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  function Ask({ onResult }: { onResult: (ok: boolean) => void }) {
    const confirm = useConfirm();
    return <button onClick={() => confirm({ message: "Silinsin mi?", danger: true, confirmLabel: "Sil" }).then(onResult)}>sor</button>;
  }

  it("resolves true on confirm and false on cancel", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    render(<BtuiProvider><Ask onResult={onResult} /></BtuiProvider>);
    await user.click(screen.getByText("sor"));
    await user.click(await screen.findByRole("button", { name: "Sil" }));
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    await user.click(screen.getByText("sor"));
    await user.click(await screen.findByRole("button", { name: "İptal" }));
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(false));
  });

  it("settles an earlier request when a new one arrives", async () => {
    const results: boolean[] = [];
    const Twice = () => {
      const confirm = useConfirm();
      return <button onClick={() => { confirm("bir").then((r) => results.push(r)); confirm("iki").then((r) => results.push(r)); }}>sor</button>;
    };
    render(<BtuiProvider><Twice /></BtuiProvider>);
    await act(async () => { fireEvent.click(screen.getByText("sor")); });
    await waitFor(() => expect(results).toEqual([false]));
    expect(await screen.findByText("iki")).toBeInTheDocument();
  });
});

describe("form parts", () => {
  it("Field links the label and shows the error", () => {
    render(<Field label="Plaka" error="Zorunlu"><Input /></Field>);
    expect(screen.getByLabelText("Plaka")).toBeInTheDocument();
    expect(screen.getByText("Zorunlu")).toBeInTheDocument();
  });

  it("labelled Switch reports state and swaps its text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch defaultChecked={false} onLabel="Açık" offLabel="Kapalı" aria-label="Durum" onChange={onChange} />);
    expect(screen.getByText("Kapalı")).toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: "Durum" }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByText("Açık")).toBeInTheDocument();
  });

  it("FileDropzone rejects by type and size on drop", () => {
    const onChange = vi.fn();
    const { container } = render(<FileDropzone files={[]} onChange={onChange} accept=".pdf" maxSize={5} multiple />);
    const box = container.querySelector(".bt-drop-box")!;
    const good = new File(["abc"], "a.pdf");
    const big = new File(["abcdefgh"], "b.pdf");
    const bad = new File(["abc"], "c.exe");
    fireEvent.drop(box, { dataTransfer: { files: [good, big, bad] } });
    expect(onChange).toHaveBeenCalledWith([good]);
    expect(screen.getByText("b.pdf: dosya çok büyük")).toBeInTheDocument();
    expect(screen.getByText("c.exe: bu dosya türü kabul edilmiyor")).toBeInTheDocument();
  });
});

describe("0.2 additions", () => {
  it("loading Button blocks clicks and stays focusable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Kaydet</Button>);
    const button = screen.getByRole("button", { name: "Kaydet" });
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
    await user.tab();
    expect(button).toHaveFocus();
  });

  it("DataTable selects a page, shows bulk actions and goes indeterminate", async () => {
    const user = userEvent.setup();
    const Demo = () => {
      const [keys, setKeys] = useState<Array<string | number>>([]);
      return <DataTable columns={columns} rows={rows} getRowKey={(r) => r.id} pageSize={2} selectedKeys={keys} onSelectionChange={setKeys} bulkActions={<Button>Sil</Button>} />;
    };
    render(<Demo />);
    await user.click(screen.getByRole("checkbox", { name: "Tümünü seç" }));
    expect(screen.getByText("2 seçili")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sil" })).toBeInTheDocument();
    await user.click(screen.getAllByRole("checkbox", { name: "Satırı seç" })[0]);
    expect(screen.getByText("1 seçili")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Tümünü seç" })).toHaveAttribute("aria-checked", "mixed");
  });

  it("row checkbox does not fire the row click", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} rows={rows.slice(0, 1)} getRowKey={(r) => r.id} onRowClick={onRowClick} selectedKeys={[]} onSelectionChange={() => {}} />);
    await user.click(screen.getByRole("checkbox", { name: "Satırı seç" }));
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("NumberInput formats for the locale and respects max", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BtuiProvider><NumberInput aria-label="Tutar" defaultValue={1500} max={1501} onChange={onChange} /></BtuiProvider>);
    expect(screen.getByLabelText("Tutar")).toHaveValue("1.500");
    await user.click(screen.getByRole("button", { name: "Artır" }));
    await user.click(screen.getByRole("button", { name: "Artır" }));
    expect(onChange).toHaveBeenLastCalledWith(1501);
  });

  it("RadioGroup reports its value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioGroup aria-label="Tür" onChange={onChange} options={[{ value: "a", label: "Bir" }, { value: "b", label: "İki" }]} />);
    await user.click(screen.getByRole("radio", { name: "İki" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("dismissible Alert goes away", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Alert title="Dikkat" dismissible onDismiss={onDismiss} />);
    await user.click(screen.getByRole("button", { name: "Kapat" }));
    expect(screen.queryByText("Dikkat")).toBeNull();
    expect(onDismiss).toHaveBeenCalled();
  });

  it("Accordion opens a panel from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Accordion items={[{ value: "a", title: "Başlık", content: "İçerik" }]} />);
    screen.getByRole("button", { name: "Başlık" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Başlık" })).toHaveAttribute("aria-expanded", "true");
  });
});

describe("0.2 fixes", () => {
  it("Tabs skips a disabled first tab", () => {
    render(<Tabs items={[{ value: "a", label: "Bir", disabled: true, content: "birinci" }, { value: "b", label: "İki", content: "ikinci" }]} />);
    expect(screen.getByRole("tab", { name: "İki" })).toHaveAttribute("aria-selected", "true");
  });

  it("Sidebar item without href is a keyboard-reachable button", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<BtuiProvider><Sidebar groups={[{ items: [{ label: "Çıkış", onClick }] }]} /></BtuiProvider>);
    screen.getByRole("button", { name: "Çıkış" }).focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("DataTable honours defaultDensity and Space on a row", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const { container } = render(<DataTable defaultDensity="compact" columns={columns} rows={rows.slice(0, 1)} getRowKey={(r) => r.id} onRowClick={onRowClick} />);
    expect(container.querySelector(".bt-table-card")).toHaveAttribute("data-density", "compact");
    container.querySelector<HTMLElement>("tbody tr")!.focus();
    await user.keyboard(" ");
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("Avatar names itself and upper-cases by locale", () => {
    render(<BtuiProvider><Avatar name="ipek ince" /></BtuiProvider>);
    expect(screen.getByRole("img", { name: "ipek ince" })).toHaveTextContent("İİ");
  });
});

describe("toast", () => {
  function Demo({ onUndo }: { onUndo: () => void }) {
    const toast = useToast();
    return <button onClick={() => toast({ title: "Arşivlendi", tone: "ok", action: { label: "Geri al", onClick: onUndo } })}>göster</button>;
  }

  it("runs its action and closes", async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    render(<BtuiProvider><Demo onUndo={onUndo} /></BtuiProvider>);
    await user.click(screen.getByText("göster"));
    await user.click(await screen.findByRole("button", { name: "Geri al" }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText("Arşivlendi")).toBeNull());
  });
});

describe("Checkbox", () => {
  it("toggles from the label and the hint text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="KDV muaf" hint="Belge gerekir" onChange={onChange} />);
    await user.click(screen.getByText("Belge gerekir"));
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
  });

  it("shows a dash when indeterminate", () => {
    const { container } = render(<Checkbox indeterminate aria-label="Tümü" />);
    expect(container.querySelector(".bt-check-dash")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Tümü" })).toHaveAttribute("aria-checked", "mixed");
  });
});

describe("Field wiring", () => {
  it("keeps option names in a labelled RadioGroup, with unique ids", () => {
    const { container } = render(<Field label="Teslimat"><RadioGroup options={[{ value: "a", label: "Kargo" }, { value: "b", label: "Elden" }]} /></Field>);
    expect(screen.getByRole("radio", { name: "Kargo" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Elden" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Teslimat" })).toBeInTheDocument();
    const ids = Array.from(container.querySelectorAll("input")).map((i) => i.id).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not let the Field label rename a labelled Checkbox or Switch", () => {
    render(<><Field label="Vergi"><Checkbox label="KDV muaf" /></Field><Field label="Bildirim"><Switch label="E-posta" /></Field></>);
    expect(screen.getByRole("checkbox", { name: "KDV muaf" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "E-posta" })).toBeInTheDocument();
  });

  it("links a SearchInput and a FileDropzone to the Field label and hint", () => {
    const { container } = render(<><Field label="Ara" hint="En az üç harf"><SearchInput /></Field><Field label="Belge"><FileDropzone files={[]} onChange={() => {}} /></Field></>);
    expect(screen.getByLabelText("Ara")).toHaveAccessibleDescription("En az üç harf");
    expect(screen.getByLabelText("Belge")).toBe(container.querySelector("input[type=file]"));
  });

  it("FileDropzone skips duplicates and honours maxFiles", () => {
    const onChange = vi.fn();
    const a = new File(["a"], "a.pdf", { lastModified: 1 });
    const { container } = render(<FileDropzone files={[a]} onChange={onChange} multiple maxFiles={2} />);
    const b = new File(["b"], "b.pdf", { lastModified: 2 });
    const c = new File(["c"], "c.pdf", { lastModified: 3 });
    fireEvent.drop(container.querySelector(".bt-drop-box")!, { dataTransfer: { files: [a, b, c] } });
    expect(onChange).toHaveBeenCalledWith([a, b]);
    expect(screen.getByText("En çok 2 dosya eklenebilir")).toBeInTheDocument();
  });
});

describe("dates", () => {
  it("parses what people type, by language", () => {
    expect(parseDate("31.10.2026", "tr")).toBe("2026-10-31");
    expect(parseDate("31/10/26", "tr")).toBe("2026-10-31");
    expect(parseDate("31102026", "tr")).toBe("2026-10-31");
    expect(parseDate("10/31/2026", "en")).toBe("2026-10-31");
    expect(parseDate("31.02.2026", "tr")).toBeNull();
    expect(parseDate("elma", "tr")).toBeNull();
    expect(dateOrder("tr")).toEqual(["day", "month", "year"]);
  });

  it("clamps month ends and starts weeks by language", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(firstDayOfWeek("tr")).toBe(1);
    expect(monthGrid("2026-10-15", 1)[0]).toBe("2026-09-28");
    expect(monthGrid("2026-10-15", 1)).toHaveLength(42);
  });

  it("Calendar moves by keyboard across months and skips nothing", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<BtuiProvider><Calendar value="2026-10-31" onSelect={onSelect} /></BtuiProvider>);
    const day = screen.getByRole("button", { name: /^31 Ekim 2026/ });
    day.focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toHaveAttribute("data-date", "2026-11-01");
    await user.keyboard("{PageUp}");
    expect(document.activeElement).toHaveAttribute("data-date", "2026-10-01");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("2026-10-01");
  });

  it("Calendar closes days outside the limits", () => {
    render(<BtuiProvider><Calendar value="2026-10-15" min="2026-10-10" isDateDisabled={(d) => d === "2026-10-20"} onSelect={() => {}} /></BtuiProvider>);
    expect(screen.getByRole("button", { name: /^9 Ekim 2026/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^20 Ekim 2026/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^10 Ekim 2026/ })).toBeEnabled();
  });

  function Picker({ onChange, ...rest }: { onChange: (v: string | null) => void; min?: string }) {
    const [value, setValue] = useState<string | null>("2026-10-15");
    return <BtuiProvider><DatePicker aria-label="Vade" value={value} onChange={(v) => { setValue(v); onChange(v); }} {...rest} /></BtuiProvider>;
  }

  it("DatePicker commits typed text, rejects a bad day and picks from the calendar", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Picker onChange={onChange} />);
    const input = screen.getByLabelText("Vade");
    expect(input).toHaveValue("15.10.2026");
    await user.clear(input);
    await user.type(input, "31.02.2026{Enter}");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onChange).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, "20102026{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("2026-10-20");
    await user.click(screen.getByRole("button", { name: "Takvimi aç" }));
    await user.click(await screen.findByRole("button", { name: /^22 Ekim 2026/ }));
    expect(onChange).toHaveBeenLastCalledWith("2026-10-22");
  });

  it("DateRangePicker swaps reversed picks and applies presets", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const Demo = () => {
      const [value, setValue] = useState({ start: "2026-10-10", end: "2026-10-12" } as { start: string | null; end: string | null });
      return <BtuiProvider><DateRangePicker value={value} onChange={(v) => { setValue(v); onChange(v); }} /></BtuiProvider>;
    };
    render(<Demo />);
    await user.click(screen.getByRole("button", { name: "Takvimi aç" }));
    await user.click(await screen.findByRole("button", { name: /^20 Ekim 2026/ }));
    await user.click(screen.getByRole("button", { name: /^5 Ekim 2026/ }));
    expect(onChange).toHaveBeenLastCalledWith({ start: "2026-10-05", end: "2026-10-20" });
    await user.click(screen.getByRole("button", { name: "Takvimi aç" }));
    await user.click(await screen.findByRole("button", { name: "Bugün" }));
    const last = onChange.mock.lastCall![0];
    expect(last.start).toBe(last.end);
  });
});

describe("grid engine", () => {
  type Sale = { id: number; city: string; team: string; amount: number | null; day: string };
  const sales: Sale[] = [
    { id: 1, city: "İzmir", team: "A", amount: 100, day: "2026-10-01" },
    { id: 2, city: "Şırnak", team: "A", amount: 50, day: "2026-10-05" },
    { id: 3, city: "İzmir", team: "B", amount: null, day: "2026-11-01" },
    { id: 4, city: "Ankara", team: "B", amount: 300, day: "2026-11-09" },
  ];
  const cols: GridColumn<Sale>[] = [{ key: "city", header: "İl" }, { key: "team", header: "Ekip" }, { key: "amount", header: "Tutar", type: "number", aggregate: "sum" }, { key: "day", header: "Gün", type: "date" }];

  it("filters by text, number, date and set with AND logic", () => {
    const ids = (f: Parameters<typeof filterRows<Sale>>[2], search = "") => filterRows(sales, cols, f, search, "tr").map((r) => r.id);
    expect(ids({ city: { type: "text", op: "contains", value: "izmir" } })).toEqual([1, 3]);
    expect(ids({ amount: { type: "number", op: ">=", value: 100 } })).toEqual([1, 4]);
    expect(ids({ amount: { type: "number", op: "between", value: 40, to: 120 } })).toEqual([1, 2]);
    expect(ids({ amount: { type: "number", op: "empty" } })).toEqual([3]);
    expect(ids({ day: { type: "date", start: "2026-10-02", end: "2026-11-01" } })).toEqual([2, 3]);
    expect(ids({ team: { type: "set", values: ["B"] } })).toEqual([3, 4]);
    expect(ids({ team: { type: "set", values: ["B"] }, city: { type: "text", op: "equals", value: "ankara" } })).toEqual([4]);
    expect(ids({}, "şırnak")).toEqual([2]);
  });

  it("sorts by several columns and keeps blanks last both ways", () => {
    const order = (s: Parameters<typeof sortByMany<Sale>>[1]) => sortByMany(sales, s, cols, "tr").map((r) => r.id);
    expect(order([{ key: "team", direction: "asc" }, { key: "amount", direction: "desc" }])).toEqual([1, 2, 4, 3]);
    expect(order([{ key: "amount", direction: "desc" }])).toEqual([4, 1, 2, 3]);
    expect(order([{ key: "amount", direction: "asc" }])).toEqual([2, 1, 4, 3]);
  });

  it("nests groups", () => {
    const tree = groupRows(sales, [cols[1], cols[0]]);
    expect(tree.map((n) => [n.value, n.rows.length])).toEqual([["A", 2], ["B", 2]]);
    expect(tree[1].children!.map((n) => n.value)).toEqual(["İzmir", "Ankara"]);
  });

  it("builds a pivot with totals that add up", () => {
    const result = pivot(sales, { rows: [cols[0]], columns: cols[1], value: cols[2], aggregate: "sum" }, "tr", "Toplam");
    expect(result.columns.map((c) => c.key)).toEqual(["r:city", "c:A", "c:B", "__total"]);
    const izmir = result.rows.find((r) => r["r:city"] === "İzmir")!;
    expect(izmir["c:A"]).toBe(100);
    expect(izmir.__total).toBe(100);
    expect(result.columns.at(-1)!.footer).toBe("450");
  });

  it("round-trips TSV with quotes, tabs and line breaks", () => {
    const grid = [["a", "b\tc"], ['say "hi"', "line\nbreak"]];
    expect(parseTsv(toTsv(grid))).toEqual(grid);
  });

  it("reads pasted numbers by language", () => {
    expect(parseNumber("1.250,50", "tr")).toBe(1250.5);
    expect(parseNumber("1,250.50", "en")).toBe(1250.5);
    expect(parseNumber("₺3.000", "tr")).toBe(3000);
    expect(parseNumber("abc", "tr")).toBeNull();
  });

  it("names spreadsheet columns", () => {
    expect([0, 25, 26, 701, 702].map(columnName)).toEqual(["A", "Z", "AA", "ZZ", "AAA"]);
  });

  it("neutralises formulas in CSV and keeps Turkish letters", () => {
    const csv = buildCsv([{ header: "Şirket" }], [["=HYPERLINK(1)"], ["Çınar;Gıda"]]);
    expect(csv.startsWith("\ufeffŞirket")).toBe(true);
    expect(csv).toContain("'=HYPERLINK(1)");
    expect(csv).toContain('"Çınar;Gıda"');
  });

  it("writes a zip container with the workbook parts", () => {
    const bytes = buildXlsx({ columns: [{ header: "A" }], rows: [["x"]] });
    expect([bytes[0], bytes[1]]).toEqual([0x50, 0x4b]);
    expect(new TextDecoder().decode(bytes)).toContain("xl/worksheets/sheet1.xml");
  });
});

describe("grid behaviour", () => {
  type Item = { id: number; name: string; qty: number };
  const items: Item[] = [{ id: 1, name: "Kalem", qty: 5 }, { id: 2, name: "Defter", qty: 12 }, { id: 3, name: "Silgi", qty: 7 }];
  const cols: Column<Item>[] = [{ key: "name", header: "Ürün", editable: true }, { key: "qty", header: "Adet", type: "number", editable: true, validate: (v) => (typeof v === "number" && v < 0 ? "Negatif olamaz" : undefined), aggregate: "sum" }];

  function Editable({ onEdit }: { onEdit: (c: { key: string; value: unknown; previous: unknown }[]) => void }) {
    const [rows, setRows] = useState(items);
    return (
      <BtuiProvider>
        <DataTable aria-label="x" columns={cols} rows={rows} getRowKey={(r) => r.id} cellSelection totals onCellEdit={(changes) => {
          onEdit(changes);
          setRows((list) => list.map((row) => changes.reduce((acc, c) => (c.row.id === row.id ? { ...acc, [c.key]: c.value } : acc), row)));
        }} />
      </BtuiProvider>
    );
  }

  it("moves with arrow keys, edits, rejects a bad value and undoes", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Editable onEdit={onEdit} />);
    const grid = screen.getByRole("grid");
    grid.focus();
    await user.keyboard("{ArrowDown}{ArrowRight}");
    expect(grid.getAttribute("aria-activedescendant")).toMatch(/-0-1$/);
    await user.keyboard("{Enter}");
    const box = screen.getByRole("textbox", { name: "Adet" });
    await user.clear(box);
    await user.type(box, "-1{Enter}");
    expect(onEdit).not.toHaveBeenCalled();
    expect(box).toHaveAttribute("aria-invalid", "true");
    await user.clear(box);
    await user.type(box, "9{Enter}");
    expect(onEdit).toHaveBeenLastCalledWith([expect.objectContaining({ key: "qty", value: 9, previous: 5 })]);
    expect(screen.getAllByRole("gridcell")[1]).toHaveTextContent("9");
    await user.keyboard("{Control>}z{/Control}");
    expect(onEdit).toHaveBeenLastCalledWith([expect.objectContaining({ key: "qty", value: 5, previous: 9 })]);
    await user.keyboard("{Control>}y{/Control}");
    expect(onEdit).toHaveBeenLastCalledWith([expect.objectContaining({ key: "qty", value: 9, previous: 5 })]);
  });

  it("sums a dragged range in the status bar and pastes a block", async () => {
    const onEdit = vi.fn();
    const { container } = render(<Editable onEdit={onEdit} />);
    const cells = screen.getAllByRole("gridcell");
    fireEvent.pointerDown(cells[1], { button: 0 });
    fireEvent.pointerOver(cells[5]);
    fireEvent.pointerUp(window);
    expect(container.querySelector(".bt-status-bar")).toHaveTextContent("Toplam: 24");
    const paste = new Event("paste", { bubbles: true }) as Event & { clipboardData?: unknown };
    paste.clipboardData = { getData: () => "1\n2" };
    fireEvent(screen.getByRole("grid"), paste);
    expect(onEdit).toHaveBeenCalledWith([expect.objectContaining({ value: 1 }), expect.objectContaining({ value: 2 })]);
  });

  it("adds a sort level with Shift and groups with totals", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<DataTable columns={cols} rows={items} getRowKey={(r) => r.id} defaultGroupBy={[]} onSortChange={onSort} />);
    await user.click(screen.getByRole("button", { name: /Ürün/ }));
    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("button", { name: /Adet/ }));
    await user.keyboard("{/Shift}");
    expect(onSort.mock.lastCall![1]).toHaveLength(2);
  });

  it("collapses a group and shows its aggregate", async () => {
    const user = userEvent.setup();
    type G = { id: number; team: string; qty: number };
    const rows: G[] = [{ id: 1, team: "A", qty: 2 }, { id: 2, team: "A", qty: 3 }, { id: 3, team: "B", qty: 9 }];
    const groupCols: Column<G>[] = [{ key: "id", header: "No" }, { key: "team", header: "Ekip" }, { key: "qty", header: "Adet", type: "number", aggregate: "sum" }];
    render(<BtuiProvider><DataTable columns={groupCols} rows={rows} getRowKey={(r) => r.id} defaultGroupBy={["team"]} /></BtuiProvider>);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(6);
    await user.click(screen.getByRole("button", { name: "Ekip: A" }));
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("loads blocks from a data source and drops stale answers", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const getRows = vi.fn(async ({ start, end, search }: { start: number; end: number; search: string }) => ({
      rows: Array.from({ length: Math.min(end, 1000) - start }, (_, i) => ({ id: start + i, name: `${search}R${start + i}`, qty: 1 })),
      total: 1000,
    }));
    render(<BtuiProvider><DataTable columns={cols} rows={[]} getRowKey={(r) => r.id} dataSource={{ getRows }} /></BtuiProvider>);
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    vi.useRealTimers();
    expect(getRows).toHaveBeenCalled();
    expect(getRows.mock.calls[0][0]).toMatchObject({ start: 0, end: 100 });
    expect(await screen.findByText("R0")).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveAttribute("aria-rowcount", "1001");
  });
});

describe("filter panel", () => {
  it("keeps a chosen condition until a value arrives", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const column: GridColumn<{ qty: number }> = { key: "qty", header: "Adet", type: "number" };
    render(<BtuiProvider><FilterPanel column={column} rows={[]} filter={undefined} onChange={onChange} /></BtuiProvider>);
    await user.click(screen.getByRole("combobox", { name: "Koşul" }));
    await user.click(await screen.findByRole("option", { name: "Büyük eşit" }));
    await user.type(screen.getByRole("textbox", { name: "Değer" }), "20000{Enter}");
    expect(onChange).toHaveBeenLastCalledWith({ type: "number", op: ">=", value: 20000 });
  });
});

describe("date picker wiring", () => {
  it("opens from the filter variant", async () => {
    const user = userEvent.setup();
    render(<BtuiProvider><DatePicker variant="filter" label="Vade" value={null} onChange={() => {}} /></BtuiProvider>);
    await user.click(screen.getByRole("button", { name: /Vade/ }));
    expect(await screen.findByRole("grid")).toBeInTheDocument();
  });

  it("submits ISO from a Field name and keeps edge names in a range", () => {
    const { container } = render(
      <BtuiProvider>
        <form>
          <Field name="due" label="Vade"><DatePicker value="2026-10-31" onChange={() => {}} /></Field>
          <Field name="span" label="Dönem"><DateRangePicker value={{ start: "2026-10-01", end: "2026-10-05" }} onChange={() => {}} /></Field>
        </form>
      </BtuiProvider>,
    );
    const data = new FormData(container.querySelector("form")!);
    expect([...data.keys()].sort()).toEqual(["due", "spanEnd", "spanStart"]);
    expect(data.get("due")).toBe("2026-10-31");
    expect(screen.getByLabelText("Vade")).toHaveValue("31.10.2026");
    expect(screen.getByRole("group", { name: "Dönem" })).toBeInTheDocument();
    expect(screen.getByLabelText("Başlangıç tarihi").id).not.toBe(screen.getByLabelText("Bitiş tarihi").id);
  });

  it("makes required count on the empty field and filter variants", () => {
    const { container } = render(
      <BtuiProvider>
        <form id="a"><DatePicker aria-label="A" required value={null} onChange={() => {}} /></form>
        <form id="b"><DatePicker variant="filter" required name="x" value={null} onChange={() => {}} /></form>
      </BtuiProvider>,
    );
    expect(container.querySelector<HTMLFormElement>("#a")!.checkValidity()).toBe(false);
    expect(container.querySelector<HTMLFormElement>("#b")!.checkValidity()).toBe(false);
  });

  it("skips closed days from the keyboard and always keeps a tab stop", async () => {
    const user = userEvent.setup();
    const weekend = (d: string) => [0, 6].includes(new Date(`${d}T00:00:00Z`).getUTCDay());
    render(<BtuiProvider><Calendar value="2026-10-30" isDateDisabled={weekend} onSelect={() => {}} /></BtuiProvider>);
    screen.getByRole("button", { name: /^30 Ekim 2026/ }).focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toHaveAttribute("data-date", "2026-11-02");
    await user.click(screen.getByRole("button", { name: "Sonraki ay" }));
    await user.click(screen.getByRole("button", { name: "Sonraki ay" }));
    expect(document.querySelectorAll('.bt-cal-day[tabindex="0"]')).toHaveLength(1);
  });

  it("enforces maxDays on typed dates and shortcuts", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BtuiProvider><DateRangePicker maxDays={7} value={{ start: "2026-10-01", end: "2026-10-03" }} onChange={onChange} /></BtuiProvider>);
    const end = screen.getByLabelText("Bitiş tarihi");
    await user.clear(end);
    await user.type(end, "20.10.2026{Enter}");
    expect(onChange).not.toHaveBeenCalled();
    expect(end).toHaveAttribute("aria-invalid", "true");
    await user.click(screen.getByRole("button", { name: "Takvimi aç" }));
    expect(await screen.findByRole("button", { name: "Son 30 gün" })).toBeDisabled();
  });
});

describe("fill series", () => {
  it("continues numbers, dates and numbered text, repeats the rest", () => {
    expect(fillSeries([5], 3)).toEqual([5, 5, 5]);
    expect(fillSeries([2, 4], 3)).toEqual([6, 8, 10]);
    expect(fillSeries([1, 2, 4], 4)).toEqual([1, 2, 4, 1]);
    expect(fillSeries(["2026-10-30"], 3)).toEqual(["2026-10-31", "2026-11-01", "2026-11-02"]);
    expect(fillSeries(["2026-01-01", "2026-01-08"], 1)).toEqual(["2026-01-15"]);
    expect(fillSeries(["SP-009"], 2)).toEqual(["SP-010", "SP-011"]);
    expect(fillSeries(["a", "b"], 3)).toEqual(["a", "b", "a"]);
    expect(fillSeries([10, 20], 2, true)).toEqual([0, -10]);
  });
});

describe("tree", () => {
  type Dept = { id: number; name: string; cost?: number; kids?: Dept[] };
  const org: Dept[] = [
    { id: 1, name: "Operasyon", kids: [{ id: 2, name: "Depo", cost: 10 }, { id: 3, name: "Lojistik", kids: [{ id: 4, name: "Şoför", cost: 5 }, { id: 5, name: "Filo", cost: 7 }] }] },
    { id: 6, name: "Finans", cost: 3 },
  ];
  const columns: Column<Dept>[] = [{ key: "name", header: "Birim" }, { key: "cost", header: "Maliyet", type: "number", aggregate: "sum" }];

  it("keeps ancestors of a match and all descendants of a matched parent", () => {
    const opts = { childrenOf: (r: Dept) => r.kids, getKey: (r: Dept) => r.id, order: (l: Dept[]) => l };
    const names = (q: string) => buildTree(org, { ...opts, keep: (r) => r.name.includes(q) }).map((n) => [n.row.name, n.children.map((c) => c.row.name)]);
    expect(names("Filo")).toEqual([["Operasyon", ["Lojistik"]]]);
    expect(names("Lojistik")).toEqual([["Operasyon", ["Lojistik"]]]);
    const lojistik = buildTree(org, { ...opts, keep: (r) => r.name === "Lojistik" })[0].children[0];
    expect(lojistik.children.map((c) => c.row.name)).toEqual(["Şoför", "Filo"]);
    expect(leafRows(buildTree(org, { ...opts, keep: () => true })[0]).map((r) => r.name)).toEqual(["Depo", "Şoför", "Filo"]);
  });

  it("opens levels, rolls leaf totals up and sums only leaves in the footer", async () => {
    const user = userEvent.setup();
    render(<BtuiProvider><DataTable columns={columns} rows={org} getRowKey={(r) => r.id} getChildren={(r) => r.kids} totals /></BtuiProvider>);
    expect(screen.queryByText("Depo")).toBeNull();
    const parent = screen.getByText("Operasyon").closest("tr")!;
    expect(within(parent).getByText("22")).toBeInTheDocument();
    expect(screen.getByRole("table").querySelector("tfoot")).toHaveTextContent("25");
    await user.click(within(parent).getByRole("button"));
    expect(screen.getByText("Depo")).toBeInTheDocument();
  });

  it("loads children on first open", async () => {
    const user = userEvent.setup();
    const loadChildren = vi.fn(async () => [{ id: 9, name: "Sonradan" }]);
    render(<BtuiProvider><DataTable columns={columns} rows={[{ id: 8, name: "Kök" }]} getRowKey={(r) => r.id} hasChildren={() => true} loadChildren={loadChildren} /></BtuiProvider>);
    await user.click(within(screen.getByText("Kök").closest("tr")!).getByRole("button"));
    expect(await screen.findByText("Sonradan")).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });
});

describe("gaps", () => {
  it("Select works uncontrolled with defaultValue", async () => {
    const user = userEvent.setup();
    render(<BtuiProvider><Select aria-label="Tür" defaultValue="a" options={[{ value: "a", label: "Bir" }, { value: "b", label: "İki" }]} /></BtuiProvider>);
    const box = screen.getByRole("combobox", { name: "Tür" });
    expect(box).toHaveTextContent("Bir");
    await user.click(box);
    await user.click(await screen.findByRole("option", { name: "İki" }));
    expect(box).toHaveTextContent("İki");
  });

  it("MultiSelect selects all and clears", async () => {
    const user = userEvent.setup();
    const Demo = () => { const [v, s] = useState<string[]>([]); return <BtuiProvider><MultiSelect aria-label="İl" value={v} onChange={s} options={["a", "b", "c", "d", "e", "f"].map((x) => ({ value: x, label: x }))} /></BtuiProvider>; };
    render(<Demo />);
    await user.click(screen.getByLabelText("İl"));
    await user.click(await screen.findByRole("button", { name: "Tümünü seç" }));
    expect(screen.getByLabelText("İl")).toHaveTextContent("6 seçili");
    await user.click(screen.getByRole("button", { name: "Temizle" }));
    expect(screen.getByLabelText("İl")).not.toHaveTextContent("seçili");
  });

  it("toast can be updated and closed by id, and errors are urgent", async () => {
    let api: ReturnType<typeof useToast>;
    const Grab = () => { api = useToast(); return null; };
    render(<BtuiProvider><Grab /></BtuiProvider>);
    let id = "";
    act(() => { id = api!({ title: "Kaydediliyor", timeout: 0 }); });
    expect(await screen.findByText("Kaydediliyor")).toBeInTheDocument();
    act(() => api!.update(id, { title: "Kaydedildi", tone: "ok" }));
    expect(await screen.findByText("Kaydedildi")).toBeInTheDocument();
    act(() => api!.close(id));
    await waitFor(() => expect(screen.queryByText("Kaydedildi")).toBeNull());
  });

  it("Tooltip drops the native title of its trigger", () => {
    render(<BtuiProvider><Tooltip content="İpucu"><IconButton label="Yazdır">x</IconButton></Tooltip></BtuiProvider>);
    expect(screen.getByRole("button", { name: "Yazdır" })).not.toHaveAttribute("title");
  });

  it("Menu renders links, groups and submenus", async () => {
    const user = userEvent.setup();
    render(<BtuiProvider><Menu trigger={<Button>Aç</Button>}><MenuGroup label="Rapor"><MenuItem href="/x">Bağlantı</MenuItem></MenuGroup><SubMenu label="Dışa aktar"><MenuItem>Excel</MenuItem></SubMenu></Menu></BtuiProvider>);
    await user.click(screen.getByRole("button", { name: "Aç" }));
    expect((await screen.findByRole("menuitem", { name: "Bağlantı" })).closest("a,[href]")).toHaveAttribute("href", "/x");
    expect(screen.getByRole("group", { name: "Rapor" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Dışa aktar" })).toHaveAttribute("aria-haspopup", "menu");
  });

  it("server table keeps its page count when the last page is short", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<DataTable columns={[{ key: "id", header: "No" }]} rows={[{ id: 1 }, { id: 2 }]} getRowKey={(r) => r.id} server={{ total: 5, page: 1, onPageChange }} />);
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    rerender(<DataTable columns={[{ key: "id", header: "No" }]} rows={[{ id: 5 }]} getRowKey={(r) => r.id} server={{ total: 5, page: 3, onPageChange }} />);
    expect(screen.getByRole("button", { name: "3" })).toHaveAttribute("aria-current", "page");
  });

  it("offers selecting every page once a page is checked", async () => {
    const user = userEvent.setup();
    const Demo = () => { const [k, s] = useState<Array<string | number>>([]); return <DataTable columns={[{ key: "id", header: "No" }]} rows={[1, 2, 3].map((id) => ({ id }))} getRowKey={(r) => r.id} pageSize={2} selectedKeys={k} onSelectionChange={s} bulkActions={<i />} />; };
    render(<Demo />);
    await user.click(screen.getByRole("checkbox", { name: "Tümünü seç" }));
    await user.click(screen.getByRole("button", { name: "3 kaydın tümünü seç" }));
    expect(screen.getByText("3 seçili")).toBeInTheDocument();
  });
});

describe("charts", () => {
  const data = [{ m: "Oca", a: 10, b: 4 }, { m: "Şub", a: 20, b: 6 }];
  const series = [{ key: "a", label: "Anka" }, { key: "b", label: "Bursa" }];

  it("rounds ticks and always keeps zero", () => {
    expect(niceTicks(0, 95)).toEqual([0, 25, 50, 75, 100]);
    expect(niceTicks(-40, 80)[0]).toBeLessThanOrEqual(-40);
    expect(niceTicks(-40, 80)).toContain(0);
    expect(niceTicks(0, 0)).toEqual([0, 1]);
  });

  it("offers a table with the same numbers and a legend for two series", async () => {
    const user = userEvent.setup();
    render(<BtuiProvider><BarChart label="Satış" data={data} x={(d) => d.m} series={series} /></BtuiProvider>);
    expect(screen.getByText("Anka")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tablo" }));
    const row = screen.getByRole("rowheader", { name: "Şub" }).closest("tr")!;
    expect(row).toHaveTextContent("Şub206");
  });

  it("hides the legend for a single series", () => {
    render(<BtuiProvider><LineChart label="Satış" data={data} x={(d) => d.m} series={[series[0]]} /></BtuiProvider>);
    expect(document.querySelector(".bt-legend")).toBeNull();
  });

  it("folds extra donut slices into Other and shows shares", async () => {
    const user = userEvent.setup();
    const many = ["a", "b", "c", "d"].map((n, i) => ({ n, v: 40 - i * 10 }));
    render(<BtuiProvider><DonutChart label="Pay" data={many} x={(d) => d.n} value={(d) => d.v} maxSlices={3} /></BtuiProvider>);
    expect(screen.getByText("Diğer")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tablo" }));
    expect(screen.getByRole("rowheader", { name: "d" }).closest("tr")).toHaveTextContent("10");
  });

  it("describes a sparkline in words", () => {
    render(<BtuiProvider><Sparkline values={[1, 5, 3]} /></BtuiProvider>);
    expect(screen.getByRole("img")).toHaveAccessibleName("Eğilim: 1 değerinden 3 değerine, en yüksek 5");
  });
});

describe("second review", () => {
  beforeAll(() => { Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 600 }); });
  afterAll(() => { delete (HTMLElement.prototype as unknown as { clientWidth?: number }).clientWidth; });
  const data = [{ m: "Oca", a: 10 }, { m: "Şub", a: 20 }];
  const series = [{ key: "a", label: "Anka" }];

  it("redraws after the table view and when data arrives late", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<BtuiProvider><BarChart label="S" data={[] as typeof data} x={(d) => d.m} series={series} /></BtuiProvider>);
    rerender(<BtuiProvider><BarChart label="S" data={data} x={(d) => d.m} series={series} /></BtuiProvider>);
    expect(container.querySelectorAll(".bt-chart-bar")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Tablo" }));
    await user.click(screen.getByRole("button", { name: "Grafik" }));
    expect(container.querySelectorAll(".bt-chart-bar")).toHaveLength(2);
  });

  it("marks a lone point and splits area fills at gaps", () => {
    const gaps = [{ m: "a", v: 1 }, { m: "b", v: null }, { m: "c", v: 3 }, { m: "d", v: null }, { m: "e", v: 5 }, { m: "f", v: 6 }];
    const { container } = render(<BtuiProvider><LineChart area label="S" data={gaps} x={(d) => d.m} series={[{ key: "v", label: "V" }]} /></BtuiProvider>);
    expect(container.querySelectorAll(".bt-chart-wash")).toHaveLength(3);
    expect(container.querySelectorAll("circle:not(.bt-chart-dot)")).toHaveLength(2);
  });

  it("can leave zero off a line axis", () => {
    expect(niceTicks(92, 98, 5, false)[0]).toBeGreaterThan(0);
    expect(niceTicks(92, 98)).toContain(0);
  });

  it("donut steps with Home and End and lists folded slices in its table", async () => {
    const user = userEvent.setup();
    const many = ["a", "b", "c", "d"].map((n, i) => ({ n, v: 40 - i * 10 }));
    render(<BtuiProvider><DonutChart label="Pay" data={many} x={(d) => d.n} value={(d) => d.v} maxSlices={3} /></BtuiProvider>);
    screen.getByRole("group", { name: "Pay" }).focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("status")).toHaveTextContent("Diğer");
    await user.click(screen.getByRole("button", { name: "Tablo" }));
    expect(screen.getByRole("rowheader", { name: "d" })).toBeInTheDocument();
  });

  type D = { id: number; day: string; note: string; qty: number };
  function Grid({ onEdit }: { onEdit: (c: Array<{ key: string; value: unknown }>) => void }) {
    const [rows, setRows] = useState<D[]>([{ id: 1, day: "2026-05-01", note: "İzmir", qty: 4 }]);
    const cols: Column<D>[] = [
      { key: "note", header: "Not", editable: true },
      { key: "day", header: "Gün", type: "date", editable: true, format: (v) => `Gün ${v}` },
      { key: "qty", header: "Adet", type: "number", editable: true },
    ];
    return <BtuiProvider><DataTable cellSelection controls={false} columns={cols} rows={rows} getRowKey={(r) => r.id} onCellEdit={(c) => { onEdit(c); setRows((l) => l.map((row) => c.reduce((a, x) => ({ ...a, [x.key]: x.value }), row))); }} /></BtuiProvider>;
  }

  it("edits the raw value of a formatted date", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const { container } = render(<Grid onEdit={onEdit} />);
    await user.dblClick(screen.getAllByRole("gridcell")[1]);
    const box = container.querySelector<HTMLInputElement>(".bt-cell-edit")!;
    expect(box.value).toBe("2026-05-01");
    await user.keyboard("{Enter}");
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("keeps wrong types out of a sideways fill", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Grid onEdit={onEdit} />);
    const cells = screen.getAllByRole("gridcell");
    fireEvent.pointerDown(cells[0], { button: 0 });
    fireEvent.pointerOver(cells[2]);
    fireEvent.pointerUp(window);
    screen.getByRole("grid").focus();
    await user.keyboard("{Control>}r{/Control}");
    expect(onEdit).not.toHaveBeenCalled();
  });

  type Dept = { id: number; name: string; cost?: number; kids?: Dept[] };
  const org: Dept[] = [{ id: 1, name: "Küçük", kids: [{ id: 2, name: "x", cost: 1 }] }, { id: 3, name: "Büyük", kids: [{ id: 4, name: "y", cost: 9 }] }];
  const cols: Column<Dept>[] = [{ key: "name", header: "Birim" }, { key: "cost", header: "Maliyet", type: "number", aggregate: "sum" }];

  it("sorts tree parents by their rollup and counts open rows", async () => {
    const user = userEvent.setup();
    render(<BtuiProvider><DataTable cellSelection columns={cols} rows={org} getRowKey={(r) => r.id} getChildren={(r) => r.kids} /></BtuiProvider>);
    expect(screen.getByRole("treegrid")).toHaveAttribute("aria-rowcount", "3");
    await user.click(screen.getByRole("button", { name: /Maliyet/ }));
    await user.click(screen.getByRole("button", { name: /Maliyet/ }));
    const names = screen.getAllByRole("row").slice(1).map((r) => r.textContent);
    expect(names[0]).toContain("Büyük");
  });

  it("fetches children for rows that start open, and survives a failure", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const loadChildren = vi.fn(async (row: Dept) => { if (row.id === 2) throw new Error("olmadı"); return [{ id: 9, name: "Yüklendi" }]; });
    render(<BtuiProvider><DataTable columns={cols} rows={[{ id: 1, name: "A" }, { id: 2, name: "B" }]} getRowKey={(r) => r.id} hasChildren={(r) => r.id < 3} loadChildren={loadChildren} defaultExpanded={1} /></BtuiProvider>);
    expect(await screen.findByText("Yüklendi")).toBeInTheDocument();
    await waitFor(() => expect(within(screen.getByText("B").closest("tr")!).getByRole("button")).toHaveAttribute("aria-expanded", "false"));
    expect(loadChildren).toHaveBeenCalledTimes(2);
    quiet.mockRestore();
  });

  it("follows a changed pageSize prop", () => {
    const rows = [1, 2, 3, 4, 5].map((id) => ({ id }));
    const c = [{ key: "id", header: "No" }];
    const { rerender } = render(<DataTable columns={c} rows={rows} getRowKey={(r) => r.id} pageSize={2} />);
    expect(screen.getByText("1-2 / 5 kayıt")).toBeInTheDocument();
    rerender(<DataTable columns={c} rows={rows} getRowKey={(r) => r.id} pageSize={5} />);
    expect(screen.getByText("1-5 / 5 kayıt")).toBeInTheDocument();
  });
});
