import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { BtuiProvider } from "btui";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/600.css";
import "@fontsource/archivo/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "btui/styles.css";
import "./docs.css";
import { App } from "./App";
import type { Lang } from "./lib/i18n";

function Root() {
  const [lang, setLang] = useState<Lang>("tr");
  return (
    <BtuiProvider locale={lang}>
      <App onLang={setLang} />
    </BtuiProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
