import { useCallback, useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { Close, Upload } from "../icons";
import { useLocale } from "../locale";
import { cx, fileMatchesAccept, flag, formatBytes } from "../utils";
import { IconButton } from "./button";

export type FileDropzoneProps = {
  /** Chosen files. Pass with `onChange` to control the list. */
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  /** Largest allowed file, in bytes. */
  maxSize?: number;
  /** Most files the list may hold. */
  maxFiles?: number;
  disabled?: boolean;
  title?: ReactNode;
  hint?: ReactNode;
  note?: ReactNode;
  name?: string;
  className?: string;
};

export function FileDropzone({ files, onChange, accept, multiple, maxSize, maxFiles, disabled, title, hint, note, name, className }: FileDropzoneProps) {
  const t = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // The real input mirrors the list, so a native form submission carries the files.
  const mirror = useCallback(() => {
    if (!input.current || typeof DataTransfer === "undefined") return;
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.current.files = transfer.files;
  }, [files]);

  useEffect(mirror, [mirror]);

  function add(list: FileList | null) {
    const rejected: string[] = [];
    const same = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
    const ok = Array.from(list ?? []).filter((file, i, all) => {
      if (files.some((f) => same(f, file)) || all.findIndex((f) => same(f, file)) !== i) return false;
      if (!fileMatchesAccept(file, accept)) rejected.push(t.fileRejected(file.name));
      else if (maxSize !== undefined && file.size > maxSize) rejected.push(t.fileTooLarge(file.name));
      else return true;
      return false;
    });
    const room = maxFiles === undefined ? ok.length : Math.max(0, maxFiles - (multiple ? files.length : 0));
    if (ok.length > room) rejected.push(t.tooManyFiles(maxFiles ?? room));
    setErrors(rejected);
    const accepted = ok.slice(0, room);
    if (accepted.length) onChange(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (!disabled) add(e.dataTransfer.files);
  }

  return (
    <div className={cx("bt-drop", className)} data-dragging={flag(dragging)} data-disabled={flag(disabled)}>
      <label
        className="bt-drop-box"
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <BaseInput
          ref={input}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => { add(e.target.files); mirror(); }}
        />
        <span className="bt-drop-icon"><Upload size={22} /></span>
        <b>{title ?? t.dropTitle}</b>
        <span>{hint ?? t.dropHint}</span>
        {note ? <small>{note}</small> : null}
      </label>
      {errors.map((error) => <div key={error} className="bt-drop-error" role="alert">{error}</div>)}
      {files.length ? (
        <ul className="bt-drop-files">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`}>
              <span>{file.name}</span>
              <small>{formatBytes(file.size, t.lang)}</small>
              <IconButton size="sm" disabled={disabled} label={`${t.remove}: ${file.name}`} onClick={() => onChange(files.filter((_, n) => n !== i))}><Close size={13} /></IconButton>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
