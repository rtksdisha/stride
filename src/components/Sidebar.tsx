import type { ScreenId, UserProfile } from '../types';
import { monthLabel } from '../lib/format';
import { HORIZON } from '../lib/forecast';
import type { ForecastResult } from '../lib/forecast';
import { getInitials } from '../lib/auth';

const navDef: { id: ScreenId; label: string }[] = [
  { id: 'dashboard', label: 'Forecast' },
  { id: 'scenario', label: 'Plan' },
  { id: 'milestone', label: 'Milestones' },
];

function NavIcon({ id, color }: { id: ScreenId; color: string }) {
  if (id === 'dashboard')
    return (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" stroke={color}>
        <polyline points="2,15 8,9 12,12 20,4" />
      </svg>
    );
  if (id === 'scenario')
    return (
      <svg width="18" height="18" viewBox="0 0 22 22" fill="none" strokeWidth={2.2} stroke={color}>
        <line x1={3} y1={7} x2={19} y2={7} />
        <line x1={3} y1={15} x2={19} y2={15} />
        <circle cx={8} cy={7} r={2.6} fill="#E7E9E2" />
        <circle cx={14} cy={15} r={2.6} fill="#E7E9E2" />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" strokeWidth={2.2} stroke={color}>
      <circle cx={11} cy={11} r={7.5} />
      <circle cx={11} cy={11} r={2.6} />
    </svg>
  );
}

interface SidebarProps {
  screen: ScreenId;
  onNavigate: (s: ScreenId) => void;
  forecast: ForecastResult;
  user: UserProfile | null;
  onLogOut: () => void;
}

export function Sidebar({ screen, onNavigate, forecast, user, onLogOut }: SidebarProps) {
  const tight = forecast.firstNeg >= 0;
  const healthDot = tight ? 'var(--amber)' : 'var(--green)';
  const healthLabel = tight ? 'Tight spot ahead' : 'Looking steady';
  const healthSub = tight ? 'You dip below zero around ' + monthLabel(forecast.firstNeg) + '.' : 'No broke months across 5 years.';

  const displayName = user?.displayName || 'Guest';
  const initials = user ? getInitials(user.displayName) : 'G';

  return (
    <div
      style={{
        width: 230,
        flexShrink: 0,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid rgba(30,37,34,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '26px 18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px' }}>
        <span style={{ font: "600 21px 'Spline Sans'", letterSpacing: '-0.02em', color: 'var(--ink)' }}>stride</span>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', marginTop: 7 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 34 }}>
        {navDef.map((item) => {
          const active = screen === item.id;
          const color = active ? 'var(--ink)' : '#7B827D';
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 12px',
                borderRadius: 12,
                cursor: 'pointer',
                background: active ? '#fff' : 'transparent',
              }}
            >
              <span style={{ color, display: 'flex' }}>
                <NavIcon id={item.id} color={color} />
              </span>
              <span style={{ font: "600 14px 'Spline Sans'", color }}>{item.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 'auto', background: '#fff', borderRadius: 14, padding: 14, border: '1px solid rgba(30,37,34,0.06)' }}>
        <div style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.08em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
          Forecast health
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: healthDot }} />
          <span style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)' }}>{healthLabel}</span>
        </div>
        <div style={{ font: "400 11px/1.4 'Spline Sans'", color: 'var(--ink-faint)', marginTop: 5 }}>{healthSub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--ink)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              font: "600 12px 'Spline Sans'",
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ font: "600 13px 'Spline Sans'", color: 'var(--ink)' }}>{displayName}</div>
            <div style={{ font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-faint)' }}>
              {user ? user.email : 'Guest mode'}
            </div>
          </div>
        </div>
        <div
          onClick={onLogOut}
          title="Log out"
          style={{
            cursor: 'pointer',
            color: 'var(--ink-faint)',
            display: 'flex',
            padding: 4,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3M13 14l4-4-4-4M17 10H7" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export { HORIZON };

