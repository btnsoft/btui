import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BtuiProvider } from "btui";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/600.css";
import "@fontsource/archivo/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "btui/styles.css";
import "./docs.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BtuiProvider>
      <App />
    </BtuiProvider>
  </StrictMode>,
);
