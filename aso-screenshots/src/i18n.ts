import type { Messages, UiLanguage } from '../../shared/i18n/I18n';

export const screenshotMessages: Record<UiLanguage, Messages> = {
  en: {
    'screenshots.step.setup': 'Setup', 'screenshots.step.style': 'Style',
    'screenshots.step.editor': 'Editor', 'screenshots.step.polish': 'AI Polish',
    'screenshots.step.locales': 'Locales', 'screenshots.step.export': 'Export',
    'screenshots.completePrevious': 'Complete the previous step first',
    'screenshots.settings': 'Settings',
  },
  pl: {
    'screenshots.step.setup': 'Konfiguracja', 'screenshots.step.style': 'Styl',
    'screenshots.step.editor': 'Edytor', 'screenshots.step.polish': 'Dopracowanie AI',
    'screenshots.step.locales': 'Lokalizacje', 'screenshots.step.export': 'Eksport',
    'screenshots.completePrevious': 'Najpierw ukończ poprzedni krok',
    'screenshots.settings': 'Ustawienia',
  },
  ru: {
    'screenshots.step.setup': 'Настройка', 'screenshots.step.style': 'Стиль',
    'screenshots.step.editor': 'Редактор', 'screenshots.step.polish': 'AI-обработка',
    'screenshots.step.locales': 'Локализации', 'screenshots.step.export': 'Экспорт',
    'screenshots.completePrevious': 'Сначала завершите предыдущий шаг',
    'screenshots.settings': 'Настройки',
  },
};
