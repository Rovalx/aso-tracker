import { useEffect, useState } from "react";
import { api } from "../api.ts";
import { ScopeBadge } from "../components/CountrySwitcher.tsx";
import { useI18n } from "../../../shared/i18n/I18n.tsx";

interface AlertRow {
  id: number;
  campaign_id: number | null;
  alert_type: string;
  message: string;
  sent_at: string;
  delivered: number;
}

interface Props { reloadKey: number }

export default function Alerts({ reloadKey }: Props) {
  const { language, t } = useI18n();
  const [rows, setRows] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  async function load(): Promise<void> {
    const data = await api.alerts();
    setRows(data);
  }
  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [reloadKey]);

  async function runCheck(): Promise<void> {
    setChecking(true);
    try {
      const r = await api.checkAlerts();
      alert(t("alerts.result", { checked: r.checked, sent: r.sent, skipped: r.skipped }));
      await load();
    } finally {
      setChecking(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="title-with-scope">
          <h1 className="ds-page-title" title={t("alerts.titleHint")}>{t("alerts.title")}</h1>
          <ScopeBadge notApplied />
        </div>
        <div className="controls">
          <button onClick={runCheck} disabled={checking}>{checking ? t("alerts.checking") : t("alerts.checkNow")}</button>
        </div>
      </div>

      <div className="card">
        <h3>{t("alerts.rules")}</h3>
        <div className="note">
          <strong>🔥 {t("alerts.ruleWasteName")}:</strong> {t("alerts.ruleWaste")}<br />
          <strong>💸 {t("alerts.ruleCpiName")}:</strong> {t("alerts.ruleCpi")}<br />
          <strong>⚠️ {t("alerts.ruleStoppedName")}:</strong> {t("alerts.ruleStopped")}<br />
          <strong>📈 {t("alerts.ruleSpikeName")}:</strong> {t("alerts.ruleSpike")}<br />
          <br />
          {t("alerts.configuration")} <code>.env</code>: <code>ALERTS_ENABLED=true</code>, <code>TG_BOT_TOKEN</code>, <code>TG_CHAT_ID</code>, <code>ALERT_CPI_THRESHOLD</code>, <code>ALERT_SPEND_NO_INSTALL</code>, <code>ALERT_INTERVAL_MIN</code>.
        </div>
      </div>

      {loading ? <div className="data-state loading">{t("alerts.loading")}</div> : rows.length === 0 ? (
        <div className="data-state">{t("alerts.empty")}</div>
      ) : (
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("alerts.sentAt")}</th>
              <th>{t("alerts.type")}</th>
              <th>{t("alerts.message")}</th>
              <th>{t("alerts.delivered")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td className="muted nowrap">{new Date(a.sent_at).toLocaleString(language === "pl" ? "pl-PL" : language === "ru" ? "ru-RU" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                <td><span className="badge">{a.alert_type}</span></td>
                <td dangerouslySetInnerHTML={{ __html: a.message }} />
                <td>
                  <span className={`badge ${a.delivered ? "ok" : "bad"}`}>{a.delivered ? t("alerts.sent") : t("alerts.error")}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </>
  );
}
