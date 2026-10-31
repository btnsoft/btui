export type Tone = "neutral" | "ok" | "warn" | "danger" | "info";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function flag(on: unknown) {
  return on ? "" : undefined;
}

export function storageGet(key: string | undefined) {
  if (!key) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storageSet(key: string | undefined, value: string | null) {
  if (!key) return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the preference then lasts for this page only.
  }
}

/** Case-insensitive contains, with the casing rules of the given locale (i/İ, ı/I). */
export function includesText(text: string, query: string, lang: string) {
  return text.toLocaleLowerCase(lang).includes(query.trim().toLocaleLowerCase(lang));
}

export function formatBytes(bytes: number, lang: string) {
  const fmt = (n: number, digits = 0) => n.toLocaleString(lang, { maximumFractionDigits: digits });
  if (bytes >= 1048576) return `${fmt(bytes / 1048576, 1)} MB`;
  return `${fmt(Math.max(1, Math.round(bytes / 1024)))} KB`;
}

/** Matches the `accept` syntax of file inputs. A dropped file skips the browser's own check. */
export function fileMatchesAccept(file: Pick<File, "name" | "type">, accept: string | undefined) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.split(",").some((raw) => {
    const rule = raw.trim().toLowerCase();
    if (!rule) return false;
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}
