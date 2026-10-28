import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { useSse } from "./lib/sse.ts";
import Dashboard from "./screens/Dashboard.tsx";
import CommandCenter from "./screens/CommandCenter.tsx";
import Profitability from "./screens/Profitability.tsx";
import Keywords from "./screens/Keywords.tsx";
import SearchTerms from "./screens/SearchTerms.tsx";
import Actions from "./screens/Actions.tsx";
import CampaignDetail from "./screens/CampaignDetail.tsx";
import Alerts from "./screens/Alerts.tsx";
import SettingsPage from "./screens/Settings.tsx";
import Negatives from "./screens/Negatives.tsx";
import KeywordMatrix from "./screens/KeywordMatrix.tsx";
import TrafficIntelligence from "./screens/TrafficIntelligence.tsx";
import KeywordScreen from "./components/KeywordScreen.tsx";
import AppSwitcher from "./components/AppSwitcher.tsx";
import CountrySwitcher from "./components/CountrySwitcher.tsx";
import { useCountry } from "./lib/CountryContext.tsx";
import { StudioSwitcher } from "../../shared/shell/StudioSwitcher.tsx";
import { api } from "./api.ts";
import { useI18n } from "../../shared/i18n/I18n.tsx";

export default function App() {
  const { t } = useI18n();
  const [syncing, setSyncing] = useState(false);
  const [phase, setPhase] = useState<{ label: string; progress: number } | null>(null);
  const [lastSync, setLastSync] = useState<string>("");
  const [reloadKey, setReloadKey] = useState(0);
  const { reload: reloadCountries } = useCountry();

  // On mount — check if a sync is in progress (e.g. user navigated away and back)
  useEffect(() => {
    api.syncStatus().then((s) => {
      if (s.active) {
        setSyncing(true);
        setPhase({ label: s.label, progress: s.progress });
      } else if (s.finished_at) {
        setLastSync(new Date(s.finished_at).toLocaleTimeString());
      }
    }).catch(() => {});
  }, []);

  const { connected } = useSse((event, data) => {
    if (event === "sync:start") {
      setSyncing(true);
        setPhase({ label: t("ads.sync.starting"), progress: 0.02 });
    }
    if (event === "sync:phase") {
      const d = data as { label: string; progress: number };
      setPhase(d);
    }
    if (event === "sync:done") {
      setPhase({ label: t("ads.sync.done"), progress: 1 });
      setLastSync(new Date().toLocaleTimeString());
      setReloadKey((k) => k + 1);
      reloadCountries();
      setTimeout(() => {
        setSyncing(false);
        setPhase(null);
      }, 800);
    }
    if (event === "sync:error") {
      setPhase({ label: t("ads.sync.error"), progress: 1 });
      setTimeout(() => { setSyncing(false); setPhase(null); }, 2000);
    }
    if (event === "action:applied" || event === "action:failed") {
      setReloadKey((k) => k + 1);
    }
  });

  async function doSync(): Promise<void> {
    if (syncing) return;
    setSyncing(true);
    setPhase({ label: t("ads.sync.connecting"), progress: 0.02 });
    try {
      await api.sync(14);
    } catch (e) {
      console.error(e);
      setPhase({ label: t("ads.sync.errorDetail", { message: (e as Error).message }), progress: 1 });
      setTimeout(() => { setSyncing(false); setPhase(null); }, 3000);
    }
  }

  useEffect(() => {
    document.title = "Ads";
  }, []);

  return (
    <div className="app">
      <aside className="sidebar">
        <StudioSwitcher current="ads" />
        <AppSwitcher />
        <CountrySwitcher />
        <nav>
          <NavLink to="/" end>{t("ads.nav.overview")}</NavLink>
          <NavLink to="/command">{t("ads.nav.command")}</NavLink>
          <NavLink to="/profitability">{t("ads.nav.profitability")}</NavLink>
          <NavLink to="/keyword-matrix">{t("ads.nav.keywordMatrix")}</NavLink>
          <NavLink to="/traffic">{t("ads.nav.traffic")}</NavLink>
          <NavLink to="/keywords">{t("ads.nav.keywords")}</NavLink>
          <NavLink to="/search-terms">{t("ads.nav.searchTerms")}</NavLink>
          <NavLink to="/negatives">{t("ads.nav.negatives")}</NavLink>
          <NavLink to="/actions">{t("ads.nav.actions")}</NavLink>
          <NavLink to="/alerts">{t("ads.nav.alerts")}</NavLink>
          <NavLink to="/settings">{t("ads.nav.settings")}</NavLink>
        </nav>
        <div className="spacer" />
        <div className="status">
          <div className={`live ${connected ? "" : "off"}`}>{t(connected ? "ads.connection.online" : "ads.connection.offline")}</div>
          {lastSync && <div className="meta">{t("ads.updated", { time: lastSync })}</div>}
        </div>
        {syncing && phase ? (
          <div className="sync-progress">
            <div className="sync-progress-label">{phase.label}</div>
            <div className="sync-progress-bar">
              <div className="sync-progress-fill" style={{ width: `${Math.round(phase.progress * 100)}%` }} />
            </div>
            <div className="sync-progress-pct">{Math.round(phase.progress * 100)}%</div>
          </div>
        ) : (
          <button className="sync-btn primary" onClick={doSync} disabled={syncing}>
            {t("ads.refresh")}
          </button>
        )}
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard reloadKey={reloadKey} />} />
          <Route path="/command" element={<CommandCenter reloadKey={reloadKey} />} />
          <Route path="/profitability" element={<Profitability reloadKey={reloadKey} />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/keywords" element={<Keywords reloadKey={reloadKey} />} />
          <Route path="/keyword-matrix" element={
            <KeywordScreen title={t("ads.nav.keywordMatrix")}>
              {(k) => (
                <KeywordMatrix
                  app={{ id: k.app.id, name: k.app.name, iTunesId: k.app.iTunesId, bundle: k.app.bundle, iconUrl: k.app.iconUrl }}
                  locale={k.locale}
                  artworks={k.artworks}
                  sharedTopFive={k.sharedTopFive}
                  sharedTopFiveStatus={k.sharedTopFiveStatus}
                  onResolveTopFive={k.resolveTopFive}
                  onEnsureArtworks={k.ensureArtworks}
                />
              )}
            </KeywordScreen>
          } />
          <Route path="/traffic" element={
            <KeywordScreen title={t("ads.nav.traffic")}>
              {(k) => (
                <TrafficIntelligence
                  className="content"
                  app={{ id: k.app.id, name: k.app.name, iTunesId: k.app.iTunesId, bundle: k.app.bundle, iconUrl: k.app.iconUrl }}
                  locale={k.locale}
                  rankings={k.rankings}
                  artworks={k.artworks}
                  sharedTopFive={k.sharedTopFive}
                  sharedTopFiveStatus={k.sharedTopFiveStatus}
                  onResolveTopFive={k.resolveTopFive}
                  onEnsureArtworks={k.ensureArtworks}
                />
              )}
            </KeywordScreen>
          } />
          <Route path="/search-terms" element={<SearchTerms reloadKey={reloadKey} />} />
          <Route path="/actions" element={<Actions reloadKey={reloadKey} />} />
          <Route path="/negatives" element={<Negatives />} />
          <Route path="/alerts" element={<Alerts reloadKey={reloadKey} />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
