import { useMemo, useState } from 'react';
import type { ScreenId } from './types';
import { StrideProvider, useStride } from './state/StrideContext';
import { computeForecast } from './lib/forecast';
import { Sidebar } from './components/Sidebar';
import { EditPanel } from './components/panel/EditPanel';
import { Onboarding } from './screens/Onboarding';
import { Dashboard } from './screens/Dashboard';
import { Scenario } from './screens/Scenario';
import { Milestone } from './screens/Milestone';
import { AiChat } from './screens/AiChat';

function AppShell() {
  const stride = useStride();
  const [screen, setScreen] = useState<ScreenId>(stride.hasOnboarded ? 'dashboard' : 'onboarding');
  const [milestonePicked, setMilestonePicked] = useState<string | null>(null);

  const forecast = useMemo(
    () => computeForecast(stride.incomeStreams, stride.spending, stride.debts, stride.goals, stride.accounts, stride.horizonMonths || 60),
    [stride.incomeStreams, stride.spending, stride.debts, stride.goals, stride.accounts, stride.horizonMonths]
  );

  if (screen === 'onboarding') {
    return (
      <div className="app-frame">
        <Onboarding
          onDone={() => {
            stride.completeOnboarding();
            setScreen('dashboard');
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-frame" style={{ position: 'relative' }}>
      <div className="app-shell">
        <Sidebar screen={screen} onNavigate={setScreen} forecast={forecast} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {screen === 'dashboard' && <Dashboard forecast={forecast} onAdjustPlan={() => setScreen('scenario')} onAddMilestone={() => setScreen('milestone')} />}
          {screen === 'scenario' && <Scenario />}
          {screen === 'milestone' && (
            <Milestone
              forecast={forecast}
              picked={milestonePicked}
              onPick={setMilestonePicked}
              onBack={() => setScreen('dashboard')}
              onGoScenario={() => setScreen('scenario')}
            />
          )}
        </div>
        <EditPanel net={forecast.net} cur={forecast.cur} brokeLimit={stride.brokeLimit || 0} />
      </div>
      <AiChat />
    </div>
  );
}

export default function App() {
  return (
    <StrideProvider>
      <AppShell />
    </StrideProvider>
  );
}
