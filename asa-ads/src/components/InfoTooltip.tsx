import { useId, useState, type ReactNode } from "react";
import { useI18n } from "../../../shared/i18n/I18n.tsx";

interface Props {
  children: ReactNode;
  title?: string;
}

export default function InfoTooltip({ children, title }: Props) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const { t } = useI18n();

  return (
    <span className="info-tooltip">
      <button
        type="button"
        className="info-tooltip-trigger"
        aria-label={title ? t("tooltip.explanationTitle", { title }) : t("tooltip.explanation")}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >?</button>
      {open && (
        <div id={tooltipId} role="tooltip" className="ds-pop info-tooltip-pop">
          {title && <div className="info-tooltip-title">{title}</div>}
          {children}
        </div>
      )}
    </span>
  );
}
