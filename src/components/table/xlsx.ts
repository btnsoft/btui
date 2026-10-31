import { columnName } from "./engine";

export type SheetCell = string | number | boolean | Date | null | undefined;
export type SheetColumn = { header: string; width?: number; type?: "text" | "number" | "date" | "boolean"; align?: "left" | "right" | "center" };
export type Sheet = {
  name?: string;
  columns: SheetColumn[];
  rows: SheetCell[][];
  /** Indent level per row, for grouped data. */
  outline?: number[];
  /** Rows drawn bold, such as group headers. */
  boldRows?: Set<number>;
  /** Last row, written bold under a rule. */
  totals?: SheetCell[];
};

const encoder = new TextEncoder();

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value: number) { return [value & 255, (value >>> 8) & 255]; }
function u32(value: number) { return [value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]; }

/** A ZIP archive with stored (uncompressed) entries. Every spreadsheet app opens it. */
function zip(files: Array<{ name: string; data: Uint8Array }>) {
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;
    const common = [...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(size), ...u32(size), ...u16(name.length), ...u16(0)];
    const local = new Uint8Array([0x50, 0x4b, 3, 4, ...common]);
    chunks.push(local, name, file.data);
    const head = new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...common, ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]);
    central.push(head, name);
    offset += local.length + name.length + size;
  }
  const centralSize = central.reduce((sum, chunk) => sum + chunk.length, 0);
  const end = new Uint8Array([0x50, 0x4b, 5, 6, ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(centralSize), ...u32(offset), ...u16(0)]);
  const out = new Uint8Array(offset + centralSize + end.length);
  let at = 0;
  for (const chunk of [...chunks, ...central, end]) { out.set(chunk, at); at += chunk.length; }
  return out;
}

const xml = (text: string) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");

// Style slots, matching cellXfs below.
const STYLE = { text: 0, header: 1, number: 2, date: 3, bold: 4, boldNumber: 5, boldDate: 6, total: 7, totalNumber: 8 };

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0.##"/><numFmt numFmtId="165" formatCode="dd\\.mm\\.yyyy"/></numFmts>
<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2F4B73"/></patternFill></fill></fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top style="thin"><color auto="1"/></top><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="9">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
<xf numFmtId="164" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyNumberFormat="1"/>
<xf numFmtId="165" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyNumberFormat="1"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
<xf numFmtId="164" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyNumberFormat="1" applyBorder="1"/>
</cellXfs>
</styleSheet>`;

function serial(date: Date) {
  return date.getTime() / 86400000 + 25569;
}

function cellXml(ref: string, value: SheetCell, column: SheetColumn | undefined, tone: "plain" | "bold" | "total") {
  const bold = tone !== "plain";
  const textStyle = tone === "total" ? STYLE.total : bold ? STYLE.bold : STYLE.text;
  const numberStyle = tone === "total" ? STYLE.totalNumber : bold ? STYLE.boldNumber : STYLE.number;
  if (value === null || value === undefined || value === "") return tone === "total" ? `<c r="${ref}" s="${textStyle}"/>` : "";
  if (typeof value === "boolean") return `<c r="${ref}" s="${textStyle}" t="b"><v>${value ? 1 : 0}</v></c>`;
  if (typeof value === "number" && Number.isFinite(value)) return `<c r="${ref}" s="${numberStyle}"><v>${value}</v></c>`;
  let date: Date | null = value instanceof Date ? value : null;
  if (!date && column?.type === "date" && typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (date && !Number.isNaN(date.getTime())) return `<c r="${ref}" s="${bold ? STYLE.boldDate : STYLE.date}"><v>${serial(date)}</v></c>`;
  // Leading "=", "+", "-" or "@" stays inert: the cell is stored as text, never as a formula.
  return `<c r="${ref}" s="${textStyle}" t="inlineStr"><is><t xml:space="preserve">${xml(String(value))}</t></is></c>`;
}

/** Builds a real .xlsx file. Header row is styled and frozen, with filters on every column. */
export function buildXlsx(sheet: Sheet) {
  const name = xml((sheet.name ?? "Sheet1").replace(/[\\/*?:[\]]/g, " ").slice(0, 31));
  const lastColumn = columnName(Math.max(0, sheet.columns.length - 1));
  const lines: string[] = [];
  lines.push(`<row r="1">${sheet.columns.map((column, c) => `<c r="${columnName(c)}1" s="${STYLE.header}" t="inlineStr"><is><t>${xml(column.header)}</t></is></c>`).join("")}</row>`);
  sheet.rows.forEach((row, r) => {
    const n = r + 2;
    const level = sheet.outline?.[r];
    const tone = sheet.boldRows?.has(r) ? "bold" : "plain";
    lines.push(`<row r="${n}"${level ? ` outlineLevel="${level}"` : ""}>${row.map((value, c) => cellXml(`${columnName(c)}${n}`, value, sheet.columns[c], tone)).join("")}</row>`);
  });
  if (sheet.totals) {
    const n = sheet.rows.length + 2;
    lines.push(`<row r="${n}">${sheet.totals.map((value, c) => cellXml(`${columnName(c)}${n}`, value, sheet.columns[c], "total")).join("")}</row>`);
  }
  const widths = sheet.columns.map((column, c) => {
    const width = column.width ?? Math.min(48, Math.max(column.header.length + 3, ...sheet.rows.slice(0, 200).map((row) => {
      const value = row[c];
      return value instanceof Date ? 11 : String(value ?? "").length + 2;
    })));
    return `<col min="${c + 1}" max="${c + 1}" width="${width}" customWidth="1"/>`;
  }).join("");
  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr><outlinePr summaryBelow="0"/></sheetPr><dimension ref="A1:${lastColumn}${sheet.rows.length + 1}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>${widths}</cols><sheetData>${lines.join("")}</sheetData><autoFilter ref="A1:${lastColumn}${sheet.rows.length + 1}"/></worksheet>`;
  const part = (data: string) => encoder.encode(data);
  return zip([
    { name: "[Content_Types].xml", data: part(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`) },
    { name: "_rels/.rels", data: part(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`) },
    { name: "xl/workbook.xml", data: part(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${name}" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'${name}'!$A$1:$${lastColumn}$${sheet.rows.length + 1}</definedName></definedNames></workbook>`) },
    { name: "xl/_rels/workbook.xml.rels", data: part(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`) },
    { name: "xl/styles.xml", data: part(STYLES) },
    { name: "xl/worksheets/sheet1.xml", data: part(worksheet) },
  ]);
}

export function buildCsv(columns: SheetColumn[], rows: SheetCell[][], separator = ";") {
  const cell = (value: SheetCell) => {
    let text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "");
    // A leading formula character would run in Excel: neutralise it.
    if (/^[=+\-@\t\r]/.test(text) && typeof value !== "number") text = `'${text}`;
    return text.includes(separator) || /["\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  // The BOM tells Excel the file is UTF-8, so Turkish letters survive.
  return `﻿${[columns.map((c) => cell(c.header)), ...rows.map((row) => row.map(cell))].map((row) => row.join(separator)).join("\r\n")}`;
}

export function download(data: BlobPart, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
