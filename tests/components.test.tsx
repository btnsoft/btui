import { useState } from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Accordion, Alert, Avatar, BtuiProvider, Button, DataTable, Sidebar, Tabs, Field, FileDropzone, Input, Modal, MultiSelect, NumberInput, RadioGroup, Select, Switch, pageRange, sortRows, useConfirm, type Column } from "../src";
import { fileMatchesAccept, includesText } from "../src/utils";

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
    expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "asc" });
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
