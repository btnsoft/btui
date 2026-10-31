import type { CSSProperties } from "react";
import { Button } from "btui";
import { useText } from "../lib/i18n";
import { Code, H2, P } from "../lib/ui";

const GROUPS = [
  { title: { tr: "Marka", en: "Brand" }, names: ["--bt-accent", "--bt-accent-strong", "--bt-accent-soft", "--bt-accent-text", "--bt-selected"] },
  { title: { tr: "Yüzey", en: "Surface" }, names: ["--bt-bg", "--bt-surface", "--bt-surface-2", "--bt-head", "--bt-nav"] },
  { title: { tr: "Yazı ve çizgi", en: "Text and lines" }, names: ["--bt-text", "--bt-text-2", "--bt-muted", "--bt-faint", "--bt-border", "--bt-line"] },
  { title: { tr: "Durum", en: "Status" }, names: ["--bt-ok", "--bt-ok-soft", "--bt-warn", "--bt-warn-soft", "--bt-danger", "--bt-danger-soft"] },
];

const THEMES = [
  { id: "navy", name: "Navy", vars: {} },
  { id: "pine", name: "Pine", vars: { "--bt-accent": "#2f7d6b", "--bt-accent-strong": "#1f5f50", "--bt-accent-soft": "#dfeeea", "--bt-accent-text": "#1f5f50" } },
  { id: "wine", name: "Wine", vars: { "--bt-accent": "#8a3b50", "--bt-accent-strong": "#6d2a3d", "--bt-accent-soft": "#f3e4e8", "--bt-accent-text": "#6d2a3d" } },
  { id: "graphite", name: "Graphite", vars: { "--bt-accent": "#4b5563", "--bt-accent-strong": "#1f2937", "--bt-accent-soft": "#e7e9ec", "--bt-accent-text": "#1f2937" } },
];

export default function Theming() {
  const t = useText();
  return (
    <>
      <p className="d-lead">{t({ tr: "Bütün görsel kararlar CSS değişkenidir. Tema yazmak için bileşenlere dokunmazsınız, değişkenleri ezersiniz.", en: "Every visual decision is a CSS variable. To theme btui you never touch components, you override variables." })}</p>
      <H2 id="tokens">{t({ tr: "Değişkenler", en: "Tokens" })}</H2>
      {GROUPS.map((group) => (
        <div key={t(group.title)}>
          <b className="d-sub">{t(group.title)}</b>
          <div className="d-swatches">
            {group.names.map((name) => <div className="d-swatch" key={name}><i style={{ background: `var(${name})` }} />{name}</div>)}
          </div>
        </div>
      ))}
      <H2 id="brand">{t({ tr: "Marka rengi", en: "Brand colour" })}</H2>
      <P>{{ tr: "Dört değişken yeterli: ana renk, koyu ton, açık zemin ve metin rengi. Metin rengi ayrı durur, çünkü koyu temada düğme zemini ile yazı aynı rengi taşıyamaz. Değişken sayfanın herhangi bir bölümünde de ezilebilir, aşağıdaki örnekler böyle çalışıyor.", en: "Four variables are enough: the main colour, a strong tone, a soft background and a text colour. Text has its own token because in a dark theme a button fill and text cannot share one colour. They can be overridden on any part of a page, which is how the samples below work." }}</P>
      <div className="d-themes">
        {THEMES.map((theme) => (
          <div key={theme.id} style={theme.vars as CSSProperties}>
            <b>{theme.name}</b>
            <Button variant="primary">{t({ tr: "Kaydet", en: "Save" })}</Button>
            <Button variant="soft">{t({ tr: "Taslak", en: "Draft" })}</Button>
          </div>
        ))}
      </div>
      <Code>{`:root {
  --bt-accent: #2f7d6b;
  --bt-accent-strong: #1f5f50;
  --bt-accent-soft: #dfeeea;
  --bt-accent-text: #1f5f50;
}`}</Code>
      <H2 id="radius">{t({ tr: "Köşeler", en: "Corners" })}</H2>
      <P>{{ tr: "btui bilinçli olarak keskindir: `--bt-radius` varsayılan olarak 2px'tir. Yuvarlak kalan tek şeyler şekli anlam taşıyanlardır: avatar, radio ve durum noktası.", en: "btui is sharp on purpose: `--bt-radius` defaults to 2px. The only round things are those whose shape means something: avatars, radios and status dots." }}</P>
      <H2 id="dark">{t({ tr: "Koyu tema", en: "Dark theme" })}</H2>
      <P>{{ tr: "Kök öğeye `data-bt-theme=\"dark\"` verin. Pencereler `body` altına taşındığı için özniteliği `html` üzerine koyun. Üst çubuktaki ay düğmesi de bunu yapar.", en: "Set `data-bt-theme=\"dark\"` on the root element. Popups are moved under `body`, so put the attribute on `html`. The moon button in the top bar does exactly that." }}</P>
      <Code>{`document.documentElement.dataset.btTheme = "dark";`}</Code>
    </>
  );
}
