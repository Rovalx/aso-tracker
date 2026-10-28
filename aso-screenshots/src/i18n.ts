import type { Messages, UiLanguage } from '../../shared/i18n/I18n';

/** Legacy editor copy is also consumed by prompt/schema data, so changing the
 * stored values would invalidate saved projects.  Keep those stable values and
 * translate their rendered text/attributes at the React shell boundary. */
const legacy: Record<string, [string, string]> = {
  'Загрузить иконку приложения': ['Upload app icon', 'Prześlij ikonę aplikacji'],
  'Иконка загружена — AI получит её через image_urls.': ['Icon uploaded — AI will receive it through image_urls.', 'Ikona przesłana — AI otrzyma ją przez image_urls.'],
  'Загрузи PNG/JPG, чтобы AI использовал точную иконку.': ['Upload a PNG/JPG so AI uses the exact icon.', 'Prześlij PNG/JPG, aby AI użyło dokładnej ikony.'],
  'Удалить': ['Remove', 'Usuń'], 'Убрать': ['Remove', 'Usuń'], 'удалить': ['delete', 'usuń'],
  'Тип кадра': ['Frame type', 'Typ kadru'], 'Hero / Заглавный кадр': ['Hero / Lead frame', 'Hero / Kadr główny'],
  'Декорации + соц-доказательство — только один hero в шаблоне.': ['Decorations + social proof — only one hero per template.', 'Dekoracje + social proof — tylko jeden hero w szablonie.'],
  'Тема для AI': ['AI theme', 'Motyw AI'], 'Тема приложения': ['App theme', 'Motyw aplikacji'],
  'Промпт шаблона': ['Template prompt', 'Prompt szablonu'], 'Стиль-промпт шаблона': ['Template style prompt', 'Prompt stylu szablonu'],
  'У шаблона нет своего промпта': ['This template has no custom prompt', 'Ten szablon nie ma własnego promptu'],
  'AI будет использовать дефолтный hero-builder.': ['AI will use the default hero builder.', 'AI użyje domyślnego kreatora hero.'],
  'Композиция': ['Composition', 'Kompozycja'], 'Скрыть устройство': ['Hide device', 'Ukryj urządzenie'],
  'Когда скрыто — на hero рисуется только заголовок + ингредиенты, без iPhone.': ['When hidden, the hero contains only the headline + ingredients, without an iPhone.', 'Po ukryciu hero zawiera tylko nagłówek + elementy, bez iPhone’a.'],
  'Ингредиенты hero (AI)': ['Hero ingredients (AI)', 'Elementy hero (AI)'], 'Сверху': ['Top', 'U góry'], 'Снизу': ['Bottom', 'Na dole'],
  'Сдвиг AI-картинки': ['AI image offset', 'Przesunięcie obrazu AI'], 'Цвет': ['Color', 'Kolor'],
  'Акцент (все слоты)': ['Accent (all slots)', 'Akcent (wszystkie sloty)'], 'Переопределить фон слота': ['Override slot background', 'Nadpisz tło slotu'],
  'Что улучшить': ['What to improve', 'Co poprawić'], 'Свой промпт': ['Custom prompt', 'Własny prompt'],
  'Заголовок': ['Headline', 'Nagłówek'], 'Глагол / Title': ['Verb / Title', 'Czasownik / Tytuł'], 'Подзаголовок': ['Subtitle', 'Podtytuł'],
  'Шрифт': ['Font', 'Czcionka'], 'Цвет заголовка': ['Headline color', 'Kolor nagłówka'], 'Цвет подзаголовка': ['Subtitle color', 'Kolor podtytułu'],
  'Акцентный цвет (*слова*)': ['Accent color (*words*)', 'Kolor akcentu (*słowa*)'], 'Размер заголовка': ['Headline size', 'Rozmiar nagłówka'],
  'Размер подзаголовка': ['Subtitle size', 'Rozmiar podtytułu'], 'Позиция (верх → низ)': ['Position (top → bottom)', 'Pozycja (góra → dół)'],
  'Сдвиг X': ['X offset', 'Przesunięcie X'], 'Сдвиг Y': ['Y offset', 'Przesunięcie Y'], 'Pill / бейдж': ['Pill / badge', 'Pill / plakietka'],
  'Бейдж над заголовком': ['Badge above headline', 'Plakietka nad nagłówkiem'], 'Текст pill': ['Pill text', 'Tekst pill'], 'Цвета pill': ['Pill colors', 'Kolory pill'],
  'фон / текст': ['background / text', 'tło / tekst'], 'Режим исходника': ['Source mode', 'Tryb źródła'],
  'Экран в телефоне': ['Screen in phone', 'Ekran w telefonie'], 'Готовое превью': ['Ready preview', 'Gotowy podgląd'],
  'Размер готового превью': ['Ready preview size', 'Rozmiar gotowego podglądu'], 'Масштаб': ['Scale', 'Skala'],
  'Выравнивание текста': ['Text alignment', 'Wyrównanie tekstu'], 'Слева': ['Left', 'Do lewej'], 'По центру': ['Center', 'Do środka'], 'Справа': ['Right', 'Do prawej'],
  'Взять из пресета': ['Use preset value', 'Użyj wartości presetu'], 'Авто': ['Auto', 'Auto'], 'Арка': ['Arch', 'Łuk'],
  'Начало арки': ['Arch start', 'Początek łuku'], 'Начало полос': ['Strips start', 'Początek pasów'], 'Поле по краям': ['Side padding', 'Margines boczny'],
  'Каёмка': ['Rim', 'Obramowanie'], 'Наклон реза': ['Cut angle', 'Kąt cięcia'], 'Зум полос': ['Strip zoom', 'Powiększenie pasów'],
  'Цвет каёмки': ['Rim color', 'Kolor obramowania'], 'До / после': ['Before / after', 'Przed / po'], 'Положение шва': ['Split position', 'Pozycja podziału'],
  'Высота ручки': ['Handle height', 'Wysokość uchwytu'], 'Затемнение под текстом': ['Scrim under text', 'Przyciemnienie pod tekstem'],
  'Бейдж — строка 1': ['Badge — line 1', 'Plakietka — wiersz 1'], 'Бейдж — строка 2': ['Badge — line 2', 'Plakietka — wiersz 2'],
  'Звёзды в бейдже': ['Stars in badge', 'Gwiazdki na plakietce'], 'Стиль устройства': ['Device style', 'Styl urządzenia'],
  'Титан': ['Titanium', 'Tytan'], 'Без рамки': ['Frameless', 'Bez ramki'], 'Срез снизу': ['Bottom crop', 'Przycięcie od dołu'],
  'Позиция устройства': ['Device position', 'Pozycja urządzenia'], 'Второе устройство (V-мокап)': ['Second device (V mockup)', 'Drugie urządzenie (makieta V)'],
  'Заменить задний экран': ['Replace rear screen', 'Zastąp tylny ekran'], '+ Добавить второй экран': ['+ Add second screen', '+ Dodaj drugi ekran'],
  'Наклон устройства': ['Device tilt', 'Nachylenie urządzenia'], 'Позиция текста': ['Text position', 'Pozycja tekstu'],
  'Текст X': ['Text X', 'Tekst X'], 'Текст Y': ['Text Y', 'Tekst Y'], 'пузырь': ['bubble', 'dymek'],
  'под устройством': ['behind device', 'pod urządzeniem'], 'над устройством': ['above device', 'nad urządzeniem'], 'над всем': ['above everything', 'nad wszystkim'],
  'URL прозрачного PNG': ['Transparent PNG URL', 'URL przezroczystego PNG'], 'Ширина': ['Width', 'Szerokość'], 'Поворот': ['Rotation', 'Obrót'],
  '+ пузырь': ['+ bubble', '+ dymek'], '+ дудл': ['+ doodle', '+ doodle'], '+ картинка': ['+ image', '+ obraz'],
  'Устройство сразу под заголовком (если пресет это умеет)': ['Device directly below headline (if supported by the preset)', 'Urządzenie bezpośrednio pod nagłówkiem (jeśli preset to obsługuje)'],
  'Перетащи новый файл для замены · двойной клик — выбрать файл': ['Drop a new file to replace · double-click to choose a file', 'Upuść nowy plik, aby zastąpić · kliknij dwukrotnie, aby wybrać plik'],
  'Отпусти, чтобы заменить превью': ['Drop to replace preview', 'Upuść, aby zastąpić podgląd'], 'Добавить готовое превью': ['Add ready preview', 'Dodaj gotowy podgląd'],
  'PNG, JPG или WebP · можно перетащить сюда': ['PNG, JPG or WebP · you can drop it here', 'PNG, JPG lub WebP · możesz upuścić tutaj'],
  'Завершить проект и сохранить в Recent?': ['Finish the project and save it to Recent?', 'Zakończyć projekt i zapisać w Ostatnich?'],
};

export function translateLegacyScreenshotUi(language: UiLanguage, value: string): string {
  if (language === 'ru') return value;
  const direct = legacy[value];
  if (direct) return direct[language === 'en' ? 0 : 1];
  let translated = value;
  for (const [source, target] of Object.entries(legacy).sort((a, b) => b[0].length - a[0].length)) {
    translated = translated.replaceAll(source, target[language === 'en' ? 0 : 1]);
  }
  return translated;
}

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
