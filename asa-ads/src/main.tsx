// Loaded first on purpose: its .kw-scope resets must lose ties to the keyword
// screens' own class rules (imported later via App).
import "./kw-tokens.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AppProvider } from "./lib/AppContext.tsx";
import { CountryProvider } from "./lib/CountryContext.tsx";
import "../../shared/ds.css";
import "./styles.css";
import "./ds-bridge.css";
// Adapty-style polish (no dividers, soft tables, compact headers) — must load last.
import "./polish.css";
import { I18nProvider } from "../../shared/i18n/I18n.tsx";
import { adsMessages } from "./i18n.ts";
import { AdsLocalization } from "./localization.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider messages={adsMessages}>
      <AdsLocalization><BrowserRouter basename="/asa">
        <AppProvider>
          <CountryProvider>
            <App />
          </CountryProvider>
        </AppProvider>
      </BrowserRouter></AdsLocalization>
    </I18nProvider>
  </StrictMode>,
);
