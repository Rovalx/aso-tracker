import { createRoot } from 'react-dom/client';
import '../../shared/ds.css';
import './styles.css';
import './ds-bridge.css';
import App from './App.tsx';
import { I18nProvider } from '../../shared/i18n/I18n';
// after App: its screen stylesheets load first, this layer wins
import './polish.css';

createRoot(document.getElementById('root')!).render(<I18nProvider><App /></I18nProvider>);
