import { useEffect, useState } from "react";
import { api, type ActionRow } from "../api.ts";
import FillPage from "../components/FillPage.tsx";
import { ScopeBadge } from "../components/CountrySwitcher.tsx";
import { useI18n } from "../../../shared/i18n/I18n.tsx";

interface Props { reloadKey: number }

const ACTION_LABEL: Record<string, string> = {
  update_bid: "actions.kind.keywordBid", update_default_bid: "actions.kind.groupBid",
  add_negative: "actions.kind.negative", create_campaign_negative: "actions.kind.campaignNegative",
  pause_keyword: "actions.kind.pauseKeyword", platform_pause_keyword: "actions.kind.pauseKeyword",
  pause_campaign: "actions.kind.pauseCampaign", resume_campaign: "actions.kind.resumeCampaign",
  update_daily_budget: "actions.kind.dailyBudget",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "actions.status.pending", applied: "actions.status.applied",
  failed: "actions.status.failed", cancelled: "actions.status.cancelled",
};

/** Human-readable parameters; the raw JSON stays in the cell tooltip. */
function summarizePayload(payload: string, t: (key: string, vars?: Record<string, string | number>) => string): string {
  try {
    const p = JSON.parse(payload) as Record<string, unknown>;
    const d = (p.data && typeof p.data === "object" ? p.data : p) as Record<string, unknown>;
    const parts: string[] = [];
    if (d.term ?? d.text) parts.push(`«${String(d.term ?? d.text)}»`);
    if (d.amount !== undefined) parts.push(`$${String(d.amount)}`);
    if (d.keyword_id ?? d.keywordId) parts.push(t("actions.keywordId", { id: String(d.keyword_id ?? d.keywordId) }));
    if (d.campaign_id ?? d.campaignId) parts.push(t("actions.campaignId", { id: String(d.campaign_id ?? d.campaignId) }));
    return parts.length ? parts.join(" · ") : payload;
  } catch {
    return payload;
  }
}

/** Apple readback as words; the raw JSON stays in the cell tooltip. */
function summarizeResult(result: string | null, error: string | null, t: (key: string) => string): string {
  if (error) return error;
  if (!result) return "—";
  try {
    const r = JSON.parse(result) as { verified?: unknown };
    if (r.verified === true) return t("actions.verified");
    if (r.verified === false) return t("actions.notVerified");
  } catch { /* not JSON — show as is */ }
  return result;
}

/** "24.09.2026, 14:10" — same-length timestamps keep the column steady. */
function fmtWhen(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Actions({ reloadKey }: Props) {
  const { language, t } = useI18n();
  const locale = language === "pl" ? "pl-PL" : language === "ru" ? "ru-RU" : "en-GB";
  const [rows, setRows] = useState<ActionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashed, setFlashed] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoading(true);
    api.actions()
      .then((data) => {
        setRows(prev => {
          const prevIds = new Set(prev.map((p) => p.id));
          const newOnes = data.filter((d) => !prevIds.has(d.id));
          if (newOnes.length > 0) {
            const fl = new Set(newOnes.map((n) => n.id));
            setFlashed(fl);
            setTimeout(() => setFlashed(new Set()), 1400);
          }
          return data;
        });
      })
      .finally(() => setLoading(false));
  }, [reloadKey]);

  async function applyOne(id: number): Promise<void> {
    const r = await api.applyAction(id);
    if (!r.ok) alert(t("action.applyError", { error: r.error ?? "Unknown error" }));
  }
  async function cancelOne(id: number): Promise<void> {
    await api.cancelAction(id);
  }

  return (
    <FillPage>
      <div className="topbar">
        <div className="title-with-scope">
          <h1 className="ds-page-title" title={t("actions.titleHint")}>{t("actions.title")}</h1>
          <ScopeBadge notApplied />
        </div>
        {rows.length > 0 && <span className="meta">{t("actions.entries", { count: rows.length })}</span>}
      </div>
      {loading ? <div className="data-state loading">{t("actions.loading")}</div> : rows.length === 0 ? (
        <div className="empty">{t("actions.empty")}</div>
      ) : (
        <div className="table-wrap">
        <table className="actions-table">
          <thead>
            <tr>
              <th>ID</th><th>{t("common.type")}</th><th>{t("actions.parameters")}</th><th>{t("actions.status")}</th><th>{t("actions.createdApplied")}</th><th>{t("actions.result")}</th><th />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className={flashed.has(a.id) ? "flash" : ""}>
                <td className="muted">#{a.id}</td>
                <td><span className="badge" title={a.type}>{ACTION_LABEL[a.type] ? t(ACTION_LABEL[a.type]) : a.type}</span></td>
                <td className="cell-clip" title={a.payload}>
                  {summarizePayload(a.payload, t)}
                </td>
                <td>
                  <span className={`badge ${a.status === "applied" ? "ok" : a.status === "failed" ? "bad" : a.status === "pending" ? "warn" : ""}`}>
                    {STATUS_LABEL[a.status] ? t(STATUS_LABEL[a.status]) : a.status}
                  </span>
                </td>
                <td
                  className="muted nowrap"
                  title={`${t("actions.created")}: ${new Date(a.created_at).toLocaleString(locale)}${a.applied_at ? `\n${t("actions.applied")}: ${new Date(a.applied_at).toLocaleString(locale)}` : ""}`}
                >
                  {fmtWhen(a.created_at, locale)}
                  {a.applied_at && fmtWhen(a.applied_at, locale) !== fmtWhen(a.created_at, locale) && <> → {fmtWhen(a.applied_at, locale).slice(-5)}</>}
                </td>
                <td className="muted cell-clip cell-flex" title={a.result ?? a.error ?? undefined}>{summarizeResult(a.result, a.error, t)}</td>
                <td className="nowrap">
                  {a.status === "pending" && (
                    <div className="btn-group">
                      <button onClick={() => applyOne(a.id)}>{t("actions.apply")}</button>
                      <button className="danger" onClick={() => cancelOne(a.id)}>{t("actions.cancel")}</button>
                    </div>
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
