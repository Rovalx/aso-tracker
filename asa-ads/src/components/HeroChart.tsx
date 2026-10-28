import { useState } from "react";
import type { DailyTotals } from "../api.ts";
import { Legend, LineChart, SERIES } from "../../../shared/charts/Charts.tsx";
import { useI18n } from "../../../shared/i18n/I18n.tsx";

interface Props {
  daily: DailyTotals[];
}

type Metric = "spend" | "installs" | "cpi" | "trial_starts" | "ttr";

const METRICS: { key: Metric; labelKey: string; format: (n: number) => string }[] = [
  { key: "spend", labelKey: "common.spend", format: (n) => `$${n.toFixed(2)}` },
  { key: "installs", labelKey: "common.installs", format: (n) => String(Math.round(n)) },
  { key: "cpi", labelKey: "common.cpi", format: (n) => `$${n.toFixed(2)}` },
  { key: "trial_starts", labelKey: "common.trialStarts", format: (n) => String(Math.round(n)) },
  { key: "ttr", labelKey: "common.ttr", format: (n) => `${(n * 100).toFixed(2)}%` },
];

const CURRENT = SERIES[0];
const WEEK_AGO = "var(--ds-subtle)";

export default function HeroChart({ daily }: Props) {
  const { t } = useI18n();
  const [metric, setMetric] = useState<Metric>("spend");
  const m = METRICS.find((x) => x.key === metric)!;

  if (daily.length === 0) return null;

  const values = daily.map((d) => Number(d[metric] ?? 0));
  const labels = daily.map((d) => d.date.slice(5));
  // WoW overlay: the same metric 7 days earlier, aligned to today's x.
  const weekAgo = values.map((_, i) => (i >= 7 ? values[i - 7] : null));

  return (
    <div className="card">
      <div className="card-toolbar">
        <div className="ds-seg">
          {METRICS.map((mm) => (
            <button
              key={mm.key}
              className={mm.key === metric ? "on" : ""}
              onClick={() => setMetric(mm.key)}
            >
              {t(mm.labelKey)}
            </button>
          ))}
        </div>
        <div className="note">
          {t("heroChart.lastPoint")} · <b className="strong">{m.format(values[values.length - 1] ?? 0)}</b>
        </div>
      </div>
      <Legend line items={[[CURRENT, `${t(m.labelKey)} · ${t("heroChart.currentPeriod")}`], [WEEK_AGO, t("heroChart.weekAgo")]]} />
      <LineChart
        labels={labels}
        yFmt={m.format}
        series={[
          { label: t(m.labelKey), color: CURRENT, values, end: true },
          { label: t("heroChart.weekAgo"), color: WEEK_AGO, values: weekAgo, dashed: true, width: 1.5 },
        ]}
      />
      <div className="note chart-note">
        {t("heroChart.note")}
      </div>
    </div>
  );
}
