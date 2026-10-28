import { useEffect, useState } from "react";
import { api } from "../api.ts";
import { useApp } from "../lib/AppContext.tsx";
import { exportRows } from "../lib/csv.ts";
import { campaignDisplayName } from "../lib/campaignNames.ts";
import FillPage from "../components/FillPage.tsx";
import { useCountry } from "../lib/CountryContext.tsx";
import { ScopeBadge } from "../components/CountrySwitcher.tsx";
import { useI18n } from "../../../shared/i18n/I18n.tsx";

interface NegRow {
  id: number;
  campaign_id: number;
  campaign_name: string;
  country: string;
  text: string;
  match_type: string;
  remote_id: number | null;
  added_at: string;
}

export default function Negatives() {
  const { language, t } = useI18n();
  const { selected: appSel } = useApp();
  const { country, isWorld, label } = useCountry();
  const [rows, setRows] = useState<NegRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    api.negatives(appSel, country).then(setRows).finally(() => setLoading(false));
  }, [appSel, country]);

  const filtered = rows.filter((r) =>
    !filter ||
    r.text.toLowerCase().includes(filter.toLowerCase()) ||
    (r.campaign_name ?? "").toLowerCase().includes(filter.toLowerCase()),
  );

  function doExport(): void {
    exportRows(
      `negatives-${new Date().toISOString().slice(0, 10)}.csv`,
      ["text", "match_type", "campaign_name", "country", "added_at", "remote_id"],
      filtered as unknown as Array<Record<string, unknown>>,
    );
  }

  return (
    <FillPage>
      <div className="topbar">
        <div className="title-with-scope">
          <h1 className="ds-page-title" title={t(isWorld ? "negatives.descriptionWorld" : "negatives.descriptionCountry", { country: label })}>{t("negatives.title")}</h1>
          <ScopeBadge />
        </div>
        <div className="controls">
          <input type="text" aria-label={t("negatives.searchLabel")} placeholder={t("negatives.searchPlaceholder")} value={filter} onChange={(e) => setFilter(e.target.value)} />
          <button onClick={doExport} disabled={filtered.length === 0}>{t("common.exportCsv")}</button>
        </div>
      </div>

      <div className="page-stats fold">
        <span>{t("negatives.total")} <b>{rows.length}</b></span>
        {filter && <span>{t("negatives.filtered")} <b>{filtered.length}</b></span>}
        <span className="page-stats-note">{t("negatives.note")}</span>
      </div>

      {loading ? <div className="data-state loading">{t("negatives.loading")}</div> : filtered.length === 0 ? (
        <div className="data-state">{t(isWorld ? "negatives.emptyWorld" : "negatives.emptyCountry", { country: label })}</div>
      ) : (
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("negatives.word")}</th>
              <th title={t("negatives.matchType")}>{t("negatives.type")}</th>
              <th>{t("common.campaign")}</th>
              <th>{t("common.country")}</th>
              <th>{t("negatives.added")}</th>
              <th className="num">{t("negatives.appleId")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.text}</strong></td>
                <td><span className="badge">{r.match_type}</span></td>
                <td className="muted cell-clip" title={r.campaign_name ? campaignDisplayName(r.campaign_name) : undefined}>{r.campaign_name ? campaignDisplayName(r.campaign_name) : "—"}</td>
                <td>{r.country === "WW" ? t("negatives.multiGeo") : r.country ?? "—"}</td>
                <td className="muted nowrap">{new Date(r.added_at).toLocaleString(language === "pl" ? "pl-PL" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                <td className="num muted">{r.remote_id ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </FillPage>
  );
}
