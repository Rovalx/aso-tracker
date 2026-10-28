import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Settings, Sparkles } from 'lucide-react';
import { Button } from './components/shared/Button';
import { Topbar } from './components/shared/Topbar';
import { StudioSwitcher } from '../../shared/shell/StudioSwitcher';
import { SettingsModal } from './components/SettingsModal';
import { KeyMissingDialog } from './components/KeyMissingDialog';
import { useStudio } from './state/studio';
import { useKeyGate } from './state/keyGate';
import { LanguageSwitcher, useI18n } from '../../shared/i18n/I18n';

const STEPS = [
  { value: '/setup', key: 'screenshots.step.setup', n: 1 },
  { value: '/catalog', key: 'screenshots.step.style', n: 2 },
  { value: '/editor', key: 'screenshots.step.editor', n: 3 },
  { value: '/polish', key: 'screenshots.step.polish', n: 4 },
  { value: '/locales', key: 'screenshots.step.locales', n: 5 },
  { value: '/export', key: 'screenshots.step.export', n: 6 },
];

/** Tiny pill in the topbar — running cost of all gpt-image-2 calls in this project.
 *  Click → reset (with confirm). */
function SpendCounter() {
  const aiSpent = useStudio((s) => s.aiSpent);
  const aiCallCount = useStudio((s) => s.aiCallCount);
  const reset = useStudio((s) => s.resetAiSpent);
  const onClick = () => {
    if (aiSpent === 0) return;
    if (confirm(`Reset AI-spend counter? Current: $${aiSpent.toFixed(2)} across ${aiCallCount} renders.`)) reset();
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={`AI spend: $${aiSpent.toFixed(4)} across ${aiCallCount} renders. Click to reset.`}
      className="btn btn--sm"
      style={{ gap: 6, cursor: aiSpent > 0 ? 'pointer' : 'default' }}
    >
      <Sparkles size={13} style={{ color: 'var(--ai)' }} />
      <span className="tabular">${aiSpent.toFixed(2)}</span>
      <span style={{ color: 'var(--fg-2)' }}>· {aiCallCount}</span>
    </button>
  );
}

export function AppShell() {
  const { t } = useI18n();
  const nav = useNavigate();
  const loc = useLocation();
  // PPO / Icon Generator sit outside the wizard: no step is highlighted there,
  // but reachability still follows the first step.
  const matchedStep = STEPS.find((s) => loc.pathname.startsWith(s.value));
  const activeStep = matchedStep ?? STEPS[0];
  const settingsOpen = useKeyGate((s) => s.settingsOpen);
  const openSettings = useKeyGate((s) => s.openSettings);
  const closeSettings = useKeyGate((s) => s.closeSettings);

  return (
    <div className="app-shell">
      <KeyMissingDialog />
      <SettingsModal open={settingsOpen} onClose={closeSettings} />
      <Topbar
        brand={<StudioSwitcher current="screenshots" />}
        steps={STEPS.map((s) => {
          // Sequential gate: free to step backward, only one step forward at a time.
          // Anything farther than current + 1 is disabled to avoid jumping into a
          // page that depends on data from the skipped step (e.g. Editor without
          // a picked Style → blank canvas).
          const isActive = matchedStep?.value === s.value;
          const reachable = s.n <= activeStep.n + 1;
          return (
            <div
              key={s.value}
              className={`step ${isActive ? 'active' : ''}${reachable ? '' : ' disabled'}`}
              onClick={() => { if (reachable) nav(s.value); }}
              title={!reachable ? t('screenshots.completePrevious') : undefined}
              style={!reachable ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
              aria-disabled={!reachable}
            >
              <span className="num">{s.n}</span>
              <span className="step-label">{t(s.key)}</span>
            </div>
          );
        })}
        actions={
          <>
            <LanguageSwitcher compact />
            <SpendCounter />
            <Button variant="ghost" size="icon" aria-label={t('screenshots.settings')} onClick={openSettings}>
              <Settings size={16} />
            </Button>
          </>
        }
      />

      <div className="app-content" style={{ overflow: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}
