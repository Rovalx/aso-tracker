import { useEffect, useState } from "react";
import { api, type SearchTermSuggestion } from "../api.ts";
import { useApp } from "../lib/AppContext.tsx";
import { campaignDisplayName } from "../lib/campaignNames.ts";
import Dropdown from "../components/Dropdown.tsx";
import FillPage from "../components/FillPage.tsx";
import { useCountry } from "../lib/CountryContext.tsx";
import { ScopeBadge } from "../components/CountrySwitcher.tsx";
import { NEGATIVES_GLOBAL_HINT } from "../lib/countries.ts";
import { useI18n } from "../../../shared/i18n/I18n.tsx";

interface Props { reloadKey: number }

export default function SearchTerms({ reloadKey }: Props) {
  const { t } = useI18n();
  const { selected: appSel } = useApp();
  const { country, isWorld, label } = useCountry();
  const [recs, setRecs] = useState<SearchTermSuggestion[]>([]);
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "negative" | "add_as_keyword">("all");

  useEffect(() => {
    setLoading(true);
    // Storefront mode reads the search-term × country report (Apple splits
    // search terms by countryOrRegion), so thresholds apply to that country.
    api.stRecs(days, appSel, country).then(setRecs).finally(() => setLoading(false));
  }, [days, reloadKey, appSel, country]);

  const filtered = recs.filter((r) => filter === "all" || r.suggestion === filter);

  async function applyNegative(r: SearchTermSuggestion): Promise<void> {
    const { id } = await api.enqueueAction({
      type: "add_negative",
      campaign_id: r.campaign_id,
      term: r.term,
      match_type: "EXACT",
    });
    const res = await api.applyAction(id);
    if (!res.ok) alert(t("action.applyError", { error: res.error ?? "" }));
  }

  return (
    <FillPage>
      <div className="topbar">
        <div className="title-with-scope">
          <h1 className="ds-page-title" title={t(isWorld ? "searchTerms.descriptionWorld" : "searchTerms.descriptionCountry", { country: label })}>{t("searchTerms.title")}</h1>
          <ScopeBadge />
        </div>
        <div className="controls">
          <Dropdown ariaLabel={t("common.filter")} value={filter} onChange={(v) => setFilter(v as typeof filter)} options={[{ value: "all", label: t("common.all", { count: recs.length }) }, { value: "negative", label: t("searchTerms.negatives", { count: recs.filter((r) => r.suggestion === "negative").length }) }, { value: "add_as_keyword", label: t("searchTerms.candidates", { count: recs.filter((r) => r.suggestion === "add_as_keyword").length }) }]} />
          <Dropdown ariaLabel={t("common.period")} value={days} onChange={(v) => setDays(v)} options={[7, 14, 30].map((value) => ({ value, label: t("common.days", { count: value }) }))} />
        </div>
      </div>

      {loading ? <div className="data-state loading">{t("searchTerms.loading")}</div> : filtered.length === 0 ? (
        <div className="data-state">{t(isWorld ? "searchTerms.emptyWorld" : "searchTerms.emptyCountry", { country: label })}</div>
      ) : (
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("searchTerms.query")}</th>
              <th>{t("common.campaign")}</th>
              <th>{t("searchTerms.recommendation")}</th>
              <th className="num">{t("searchTerms.impressions")}</th>
              <th className="num">{t("searchTerms.taps")}</th>
              <th className="num">{t("searchTerms.installs")}</th>
              <th className="num">{t("common.spend")}</th>
              <th>{t("searchTerms.reason")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={`${r.campaign_id}-${r.term}-${idx}`}>
                <td className="nowrap"><strong>{r.term}</strong></td>
                <td className="muted cell-clip cell-campaign" title={campaignDisplayName(r.campaign_name)}>{campaignDisplayName(r.campaign_name)}</td>
                <td>
                  <span className={`badge ${r.suggestion === "negative" ? "bad" : "ok"}`}>
                    {t(r.suggestion === "negative" ? "searchTerms.toNegative" : "searchTerms.reviewKeyword")}
                  </span>
                </td>
                <td className="num">{r.impressions}</td>
                <td className="num">{r.taps}</td>
                <td className="num">{r.installs}</td>
                <td className="num">${r.spend.toFixed(2)}</td>
                <td className="muted cell-clip cell-flex" title={r.reason}>{r.reason}</td>
                <td className="nowrap">
                  {r.suggestion === "negative" && (
                    <button className="compact danger" disabled={!isWorld} onClick={() => applyNegative(r)} title={isWorld ? t("searchTerms.addNegativeTitle") : NEGATIVES_GLOBAL_HINT}>{t("searchTerms.addNegative")}</button>
                  )}
                  {r.suggestion === "add_as_keyword" && (
                    <span className="note" title={t("searchTerms.manualTitle")}>{t("searchTerms.manual")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </FillPage>
  );
}
