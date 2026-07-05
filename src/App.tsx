import { useMemo, useState, useEffect, useRef } from 'react';
import type { ScreenId } from './types';
import { StrideProvider, useStride } from './state/StrideContext';
import { computeForecast } from './lib/forecast';
import { Sidebar } from './components/Sidebar';
import { EditPanel } from './components/panel/EditPanel';
import { Landing } from './screens/Landing';
import { AuthScreen } from './screens/AuthScreen';
import { Onboarding } from './screens/Onboarding';
import { Dashboard } from './screens/Dashboard';
import { Scenario } from './screens/Scenario';
import { Milestone } from './screens/Milestone';
import { AiChat } from './screens/AiChat';

import { parseUrl, getPathForState } from './lib/router';

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

function AppShell() {
  const stride = useStride();
  const width = useWindowWidth();
  const isWide = width >= 1440;

  const initialRoute = useMemo(() => parseUrl(window.location.pathname), []);
  const [screen, setScreen] = useState<ScreenId>(initialRoute.screen);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>(initialRoute.authMode || 'signup');
  const [milestonePicked, setMilestonePicked] = useState<string | null>(null);

  const prevUser = useRef<any>(null);

  // Sync URL from state changes
  useEffect(() => {
    const path = getPathForState(screen, authMode);
    if (window.location.pathname !== path) {
      window.history.pushState({ screen, authMode }, '', path);
    }
  }, [screen, authMode]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const route = parseUrl(window.location.pathname);
      setScreen(route.screen);
      if (route.authMode) {
        setAuthMode(route.authMode);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync route reactively based on auth state and onboarding progress
  useEffect(() => {
    if (!stride.authReady) return;

    if (stride.user) {
      if (stride.hasOnboarded) {
        setScreen('dashboard');
      } else {
        setScreen('onboarding');
      }
    } else {
      // If we just transitioned from logged-in to logged-out, go to landing
      if (prevUser.current !== null) {
        setScreen('landing');
      } else {
        // Not logged in. If they were a guest and finished onboarding, go to dashboard
        // Otherwise stay on landing (unless they are currently inside the auth panel)
        setScreen((current) => {
          if (current === 'auth') return 'auth';
          if (current === 'landing') return 'landing';
          return stride.hasOnboarded ? 'dashboard' : 'landing';
        });
      }
    }
    prevUser.current = stride.user;
  }, [stride.user, stride.hasOnboarded, stride.authReady]);

  const forecast = useMemo(
    () => computeForecast(stride.incomeStreams, stride.spending, stride.debts, stride.goals, stride.accounts, stride.horizonMonths || 60),
    [stride.incomeStreams, stride.spending, stride.debts, stride.goals, stride.accounts, stride.horizonMonths]
  );

  // Show loading spinner while Firebase auth initializes
  if (!stride.authReady) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1E2522', color: '#fff', font: "500 16px 'Spline Sans'",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ font: "600 24px 'Spline Sans'", letterSpacing: '-0.02em' }}>stride</span>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2f7d5b', marginTop: 7 }} />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', font: "400 14px 'Spline Sans'" }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Landing page
  if (screen === 'landing') {
    return (
      <Landing
        onGetStarted={() => {
          setAuthMode('signup');
          setScreen('auth');
        }}
        onLogin={() => {
          setAuthMode('login');
          setScreen('auth');
        }}
        onTryGuest={() => {
          stride.completeOnboarding();
          setScreen('dashboard');
        }}
      />
    );
  }

  // Auth screen
  if (screen === 'auth') {
    return (
      <div className="app-frame">
        <AuthScreen
          initialMode={authMode}
          onAuth={() => {}}
          onGuest={() => {
            stride.completeOnboarding();
            setScreen('dashboard');
          }}
          onLogoClick={() => setScreen('landing')}
        />
      </div>
    );
  }

  // Onboarding
  if (screen === 'onboarding') {
    return (
      <div className="app-frame">
        <Onboarding
          onDone={() => {
            stride.completeOnboarding();
            setScreen('dashboard');
          }}
          onLogoClick={() => setScreen('landing')}
        />
      </div>
    );
  }

  // Main app shell
  return (
    <div className="app-frame" style={{ position: 'relative' }}>
      <div className="app-shell">
        <Sidebar
          screen={screen}
          onNavigate={setScreen}
          forecast={forecast}
          user={stride.user}
          onLogOut={async () => {
            await stride.logOut();
            setScreen('landing');
          }}
        />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 960, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {screen === 'dashboard' && <Dashboard forecast={forecast} onAdjustPlan={() => setScreen('scenario')} onAddMilestone={stride.addMilestone} />}
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
        </div>

        {isWide && (
          <div style={{ width: 340, height: '100%', flexShrink: 0 }}>
            <AiChat inline />
          </div>
        )}

        <EditPanel net={forecast.net} cur={forecast.cur} brokeLimit={stride.brokeLimit || 0} />
      </div>
      {!isWide && <AiChat />}
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
