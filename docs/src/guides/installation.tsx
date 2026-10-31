import { Alert } from "btui";
import { useText } from "../lib/i18n";
import { Code, H2, P } from "../lib/ui";

export default function Installation() {
  const t = useText();
  return (
    <>
      <p className="d-lead">{t({ tr: "Beş dakikada ilk ekranınız hazır olur. React 18 ya da 19 yeterli, Tailwind gerekmez.", en: "Your first screen is ready in five minutes. React 18 or 19 is enough and Tailwind is not required." })}</p>
      <H2 id="install">{t({ tr: "Paketi kurun", en: "Install the package" })}</H2>
      <Alert title={t({ tr: "Şimdilik GitHub'dan", en: "From GitHub for now" })}>{t({ tr: "Paket henüz npm'de değil. Kurulum sırasında GitHub'dan indirilip derlenir.", en: "The package is not on npm yet. It is fetched from GitHub and built during install." })}</Alert>
      <Code>{"npm install github:btnsoft/btui"}</Code>
      <H2 id="setup">{t({ tr: "Bağlayın", en: "Wire it up" })}</H2>
      <P>{{ tr: "Stil dosyasını bir kez içe aktarın ve uygulamayı `BtuiProvider` ile sarın. Onay pencereleri, bildirimler ve hazır metinler buradan gelir.", en: "Import the stylesheet once and wrap the app in `BtuiProvider`. Confirm dialogs, toasts and built-in labels come from it." }}</P>
      <Code>{`import { BtuiProvider, Button } from "btui";
import "btui/styles.css";

export function App() {
  return (
    <BtuiProvider locale="tr">
      <div className="bt-root">
        <Button variant="primary">Kaydet</Button>
      </div>
    </BtuiProvider>
  );
}`}</Code>
      <P>{{ tr: "`bt-root` kök katmanı açar, böylece açılır pencereler sayfanın üstünde kalır. `AppShell` kullanıyorsanız bu sınıf ona dahildir.", en: "`bt-root` opens a stacking root so popups stay above the page. `AppShell` already includes this class." }}</P>
      <H2 id="nextjs">Next.js</H2>
      <P>{{ tr: "Paket `\"use client\"` ile gelir, sunucuda çizilir. Sağlayıcıyı kök düzene koyun.", en: "The package ships with `\"use client\"` and renders on the server. Put the provider in the root layout." }}</P>
      <Code>{`// app/layout.tsx
import { BtuiProvider } from "btui";
import "btui/styles.css";

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{ position: "relative" }}>
        <BtuiProvider>{children}</BtuiProvider>
      </body>
    </html>
  );
}`}</Code>
      <H2 id="fonts">{t({ tr: "Yazı tipleri", en: "Fonts" })}</H2>
      <P>{{ tr: "Tasarım Archivo ve IBM Plex Mono ile çizildi. Paket yazı tipi taşımaz; yüklü değilse sistem yazı tipine düşer.", en: "The design uses Archivo and IBM Plex Mono. The package ships no fonts and falls back to the system font." }}</P>
      <Code>{`npm install @fontsource/archivo @fontsource/ibm-plex-mono

import "@fontsource/archivo/400.css";
import "@fontsource/archivo/600.css";
import "@fontsource/ibm-plex-mono/400.css";`}</Code>
      <H2 id="icons">{t({ tr: "İkonlar", en: "Icons" })}</H2>
      <P>{{ tr: "btui ikon seti dayatmaz, `icon` prop'ları her React öğesini kabul eder. Bu sitede Tabler kullanıldı, 15 ile 16px boyutları düğmelerle iyi durur.", en: "btui forces no icon set, and `icon` props accept any React element. This site uses Tabler, and 15 to 16px works well in buttons." }}</P>
    </>
  );
}
