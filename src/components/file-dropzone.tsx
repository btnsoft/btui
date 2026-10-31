import { useId, useState, type DragEvent, type ReactNode } from "react";
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
  disabled?: boolean;
  title?: ReactNode;
  hint?: ReactNode;
  note?: ReactNode;
  name?: string;
  className?: string;
};

export function FileDropzone({ files, onChange, accept, multiple, maxSize, disabled, title, hint, note, name, className }: FileDropzoneProps) {
  const t = useLocale();
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function add(list: FileList | null) {
    const rejected: string[] = [];
    const ok = Array.from(list ?? []).filter((file) => {
      if (!fileMatchesAccept(file, accept)) rejected.push(t.fileRejected(file.name));
      else if (maxSize !== undefined && file.size > maxSize) rejected.push(t.fileTooLarge(file.name));
      else return true;
      return false;
    });
    setErrors(rejected);
    if (ok.length) onChange(multiple ? [...files, ...ok] : ok.slice(0, 1));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (!disabled) add(e.dataTransfer.files);
  }

  return (
    <div className={cx("bt-drop", className)} data-dragging={flag(dragging)}>
      <label
        className="bt-drop-box"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          id={id}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => { add(e.target.files); e.target.value = ""; }}
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
              <IconButton size="sm" label={`${t.remove}: ${file.name}`} onClick={() => onChange(files.filter((_, n) => n !== i))}><Close size={13} /></IconButton>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
