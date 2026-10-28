import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type UiLanguage = 'en' | 'pl' | 'ru';
export type Messages = Record<string, string>;

const STORAGE_KEY = 'aso-studio.language';

const sharedMessages: Record<UiLanguage, Messages> = {
  en: {
    'language.english': 'English',
    'language.polish': 'Polski',
    'language.russian': 'Русский',
    'language.label': 'Interface language',
    'switcher.changeProduct': 'switch product',
    'product.keywords.purpose': 'Keywords and App Store rankings',
    'product.ads.purpose': 'Apple Ads performance',
    'product.screenshots.purpose': 'App Store screenshots',
    'product.video.purpose': 'Video ad production',
    'product.inapp.purpose': 'In-App Event cards',
  },
  pl: {
    'language.english': 'English',
    'language.polish': 'Polski',
    'language.russian': 'Русский',
    'language.label': 'Język interfejsu',
    'switcher.changeProduct': 'zmień produkt',
    'product.keywords.purpose': 'Słowa kluczowe i pozycje w App Store',
    'product.ads.purpose': 'Wyniki Apple Ads',
    'product.screenshots.purpose': 'Zrzuty ekranu do App Store',
    'product.video.purpose': 'Produkcja reklam wideo',
    'product.inapp.purpose': 'Karty wydarzeń In-App',
  },
  ru: {
    'language.english': 'English',
    'language.polish': 'Polski',
    'language.russian': 'Русский',
    'language.label': 'Язык интерфейса',
    'switcher.changeProduct': 'сменить продукт',
    'product.keywords.purpose': 'Ключевые слова и позиции в App Store',
    'product.ads.purpose': 'Эффективность Apple Ads',
    'product.screenshots.purpose': 'Скриншоты для App Store',
    'product.video.purpose': 'Создание видеорекламы',
    'product.inapp.purpose': 'Карточки событий In-App',
  },
};

function initialLanguage(): UiLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'pl' || saved === 'ru') return saved;
  } catch { /* storage may be unavailable */ }
  return 'en';
}

interface I18nValue {
  language: UiLanguage;
  setLanguage: (language: UiLanguage) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children, messages }: { children: ReactNode; messages?: Partial<Record<UiLanguage, Messages>> }) {
  const [language, setLanguageState] = useState<UiLanguage>(initialLanguage);

  const setLanguage = useCallback((next: UiLanguage) => {
    setLanguageState(next);
    document.documentElement.lang = next;
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* storage may be unavailable */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && (event.newValue === 'en' || event.newValue === 'pl' || event.newValue === 'ru')) {
        setLanguageState(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [language]);

  const merged = useMemo(() => ({
    en: { ...sharedMessages.en, ...messages?.en },
    pl: { ...sharedMessages.pl, ...messages?.pl },
    ru: { ...sharedMessages.ru, ...messages?.ru },
  }), [messages]);

  const t = useCallback((key: string, values?: Record<string, string | number>) => {
    let text = merged[language][key] ?? merged.en[key] ?? key;
    if (values) {
      for (const [name, value] of Object.entries(values)) text = text.replaceAll(`{${name}}`, String(value));
    }
    return text;
  }, [language, merged]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();
  return (
    <div className={`ui-language${compact ? ' ui-language--compact' : ''}`} aria-label={t('language.label')}>
      {(['en', 'pl', 'ru'] as const).map((code) => (
        <button
          key={code}
          type="button"
          className={language === code ? 'is-active' : ''}
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
          title={t(code === 'en' ? 'language.english' : code === 'pl' ? 'language.polish' : 'language.russian')}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
