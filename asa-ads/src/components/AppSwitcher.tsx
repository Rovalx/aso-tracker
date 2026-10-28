import { useApp } from "../lib/AppContext.tsx";
import { useI18n } from "../../../shared/i18n/I18n.tsx";

export default function AppSwitcher() {
  const { apps, selected, setSelected } = useApp();
  const { t } = useI18n();

  if (apps.length === 0) return null;

  function shortName(name: string | null): string {
    if (!name) return "—";
    // "My App: Tagline & Subtitle" → "My App"
    return name.split(":")[0].split(" — ")[0].trim();
  }

  return (
    <div className="app-switcher">
      <div className="app-switcher-label">{t("appSwitcher.label")}</div>
      <select
        className="ds-select"
        value={String(selected)}
        onChange={(e) => setSelected(e.target.value === "all" ? "all" : Number(e.target.value))}
      >
        <option value="all">{t("appSwitcher.all", { count: apps.length })}</option>
        {apps.map((a) => (
          <option key={a.app_id} value={a.app_id}>
            {shortName(a.app_name)} · {a.active_count}/{a.campaign_count}
          </option>
        ))}
      </select>
    </div>
  );
}
