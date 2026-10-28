import { useLocation } from "react-router-dom";
import { useCountry } from "../lib/CountryContext.tsx";
import { WORLD, countryFlag, countryName } from "../lib/countries.ts";
import { useI18n } from "../../../shared/i18n/I18n.tsx";

/** Screens whose data has no storefront dimension. */
const NOT_APPLIED = ["/actions", "/alerts", "/settings"];

export function countryFilterApplies(pathname: string): boolean {
  return !NOT_APPLIED.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function optionLabel(code: string, language: string): string {
  return `${countryFlag(code)} ${code} · ${countryName(code, language)}`;
}

/** Global storefront filter under the app switcher. Stays visible (disabled)
 *  on screens without a country split so the sidebar never jumps. */
export default function CountrySwitcher() {
  const { country, setCountry, options } = useCountry();
  const { language, t } = useI18n();
  const { pathname } = useLocation();
  const applies = countryFilterApplies(pathname);
  const known = country === WORLD || options.some((row) => row.code === country);

  return (
    <div className="app-switcher country-switcher" title={applies ? t("country.filterHint") : t("country.notAppliedHint")}>
      <div className="app-switcher-label">
        {t("common.country")}{!applies && <span className="country-switcher-na"> · {t("country.notApplied")}</span>}
      </div>
      <select
        className="ds-select"
        aria-label={t("common.country")}
        value={country}
        disabled={!applies}
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value={WORLD}>🌍 {t("country.world")}</option>
        {/* Keep a URL/stored value visible while the list is still loading. */}
        {!known && <option value={country}>{optionLabel(country, language)}</option>}
        {options.map((row) => (
          <option key={row.code} value={row.code}>{optionLabel(row.code, language)}</option>
        ))}
      </select>
    </div>
  );
}

/** Scope chip for page headers: «🌍 Весь мир» / «🇧🇷 Бразилия». */
export function ScopeBadge({ note, notApplied }: { note?: string; notApplied?: boolean }) {
  const { label } = useCountry();
  const { t } = useI18n();
  if (notApplied) {
    return <span className="scope-badge muted" title={t("country.notAppliedHint")}>🌍 {t("country.allCountries")}</span>;
  }
  return <span className="scope-badge" title={note ?? t("country.globalFilterHint")}>{label}</span>;
}
