import { useState, useMemo } from 'react';
import { useStride } from '../state/StrideContext';
import type { ForecastResult } from '../lib/forecast';
import { mMonth, milestoneSummary, buildSeries, startBalance } from '../lib/finance';
import { fmt, monthLabel, money } from '../lib/format';
import { Chart } from '../components/Chart';

interface DashboardProps {
  forecast: ForecastResult;
  onAdjustPlan: () => void;
  onAddMilestone: () => void;
}

export function Dashboard({ forecast, onAdjustPlan, onAddMilestone }: DashboardProps) {
  const stride = useStride();
  const [hover, setHover] = useState<number | null>(null);
  const [hoveredGoal, setHoveredGoal] = useState<string | null>(null);
  const { cur, baseline, firstNeg, lowest, markers } = forecast;
  
  // Calculate dynamic timeline months duration
  const currentHorizonMonths = stride.horizonMonths || 60;
  const N = currentHorizonMonths + 1;

  const previewSeries = useMemo(() => {
    if (!hoveredGoal) return null;
    const g = stride.goals.find((x) => x.key === hoveredGoal);
    if (!g) return null;
    const startBal = startBalance(stride.accounts);
    
    // If it is active (what-if), show baseline + this goal
    if (g.status === 'active') {
      return buildSeries(
        stride.incomeStreams,
        stride.spending,
        stride.debts,
        stride.goals,
        ['committed'],
        N,
        startBal,
        hoveredGoal
      );
    }
    
    // If it is committed, show baseline WITHOUT this goal
    if (g.status === 'committed') {
      return buildSeries(
        stride.incomeStreams,
        stride.spending,
        stride.debts,
        stride.goals,
        ['committed'],
        N,
        startBal,
        undefined,
        hoveredGoal
      );
    }
    return null;
  }, [hoveredGoal, stride.goals, stride.incomeStreams, stride.spending, stride.debts, stride.accounts, N]);

  const hoveredGoalObj = hoveredGoal ? stride.goals.find((x) => x.key === hoveredGoal) : null;
  const previewColor = hoveredGoalObj?.dot || undefined;

  let tone: string, headPill: string, headPillBg: string, headPre: string, headDate: string, headSub: string;
  if (firstNeg >= 0) {
    tone = 'var(--amber)';
    headPill = 'Heads up';
    headPillBg = 'var(--amber-bg)';
    headPre = "You're clear until";
    headDate = monthLabel(firstNeg);
    headSub = 'A milestone outpaces your savings around then, dipping you below zero. Toggle a what-if off or push its date to stay clear.';
  } else {
    tone = 'var(--green)';
    headPill = 'On track';
    headPillBg = 'var(--green-bg)';
    headPre = 'You stay above water all the way to';
    headDate = monthLabel(N - 1);
    headSub = 'Every committed milestone and active what-if is funded on time. No broke months in sight.';
  }
  const lowTone = lowest < 0 ? 'var(--amber)' : 'var(--ink)';

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '30px 36px 36px' }}>
      <div style={{ maxWidth: 1060 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ font: "500 12px 'Spline Sans Mono'", letterSpacing: '0.12em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
            Forecast · updated today
          </div>
          <div style={{ font: "600 27px/1 'Spline Sans'", color: 'var(--ink)', marginTop: 6, letterSpacing: '-0.01em' }}>
            Where your money is headed
          </div>
        </div>
        <div
          onClick={onAdjustPlan}
          style={{
            background: '#fff',
            border: '1px solid rgba(30,37,34,0.08)',
            borderRadius: 12,
            padding: '11px 18px',
            font: "600 14px 'Spline Sans'",
            color: 'var(--ink)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 22 22" fill="none" stroke="#2F7D5B" strokeWidth={2.2}>
            <line x1={3} y1={7} x2={19} y2={7} />
            <line x1={3} y1={15} x2={19} y2={15} />
            <circle cx={8} cy={7} r={2.6} fill="#fff" />
            <circle cx={14} cy={15} r={2.6} fill="#fff" />
          </svg>
          Adjust plan
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 22,
          padding: '26px 28px',
          border: '1px solid rgba(30,37,34,0.06)',
          boxShadow: '0 1px 2px rgba(30,37,34,0.04), 0 22px 44px rgba(30,37,34,0.05)',
          marginTop: 20,
        }}
      >
        <div style={{ maxWidth: 730 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: headPillBg, borderRadius: 999, padding: '5px 12px' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: tone }} />
            <span style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.06em', color: tone, textTransform: 'uppercase' }}>{headPill}</span>
          </div>
          <div style={{ font: "400 37px/1.24 'Newsreader'", color: 'var(--ink)', marginTop: 14, letterSpacing: '-0.01em' }}>
            {headPre} <span style={{ color: tone, fontWeight: 500 }}>{headDate}</span>.
          </div>
          <div style={{ font: "400 15px/1.55 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 10 }}>{headSub}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20, maxWidth: 560 }}>
          <div style={{ background: '#F4F5F2', borderRadius: 14, padding: '13px 16px' }}>
            <div style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.05em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Today</div>
            <div style={{ font: "600 20px 'Spline Sans'", color: 'var(--ink)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{fmt(cur[0])}</div>
          </div>
          <div style={{ background: '#F4F5F2', borderRadius: 14, padding: '13px 16px' }}>
            <div style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.05em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Net worth '31</div>
            <div style={{ font: "600 20px 'Spline Sans'", color: 'var(--ink)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{fmt(cur[N - 1])}</div>
          </div>
          <div style={{ background: '#F4F5F2', borderRadius: 14, padding: '13px 16px' }}>
            <div style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.05em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Lowest point</div>
            <div style={{ font: "600 20px 'Spline Sans'", color: lowTone, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{fmt(lowest)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 -4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 16, height: 3, borderRadius: 3, background: 'var(--green)' }} />
              <span style={{ font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-dim)' }}>With your what-ifs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 16, height: 0, borderTop: '2px dashed #B6BCB6' }} />
              <span style={{ font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-faint)' }}>Baseline · committed only</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ font: "500 11px 'Spline Sans Mono'", color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Timeline:</span>
            <select
              value={stride.horizonMonths || 60}
              onChange={(e) => stride.applyStateDelta({ horizonMonths: +e.target.value })}
              style={{
                font: "600 12px 'Spline Sans'",
                color: 'var(--ink)',
                background: '#fff',
                border: '1px solid rgba(30,37,34,0.12)',
                borderRadius: 8,
                padding: '4px 8px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={6}>6 months</option>
              <option value={12}>1 year</option>
              <option value={24}>2 years</option>
              <option value={36}>3 years</option>
              <option value={60}>5 years</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Chart series={cur} height={240} id="dash" baseline={baseline} preview={previewSeries} previewColor={previewColor} markers={markers} hover={hover} onHover={setHover} brokeLimit={stride.brokeLimit || 0} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6, font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-faint-2)' }}>
          <svg width="13" height="13" viewBox="0 0 12 12">
            <path d="M2 9l3-3 2 2 3-4" stroke="#B6BCB6" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Hover the line to read your balance in any month
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '26px 4px 6px' }}>
        <span style={{ font: "600 18px 'Spline Sans'", color: 'var(--ink)' }}>Milestones on your timeline</span>
        <div
          onClick={onAddMilestone}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: '#fff',
            border: '1px solid rgba(30,37,34,0.1)',
            borderRadius: 11,
            padding: '9px 15px',
            font: "600 13px 'Spline Sans'",
            color: 'var(--ink)',
            cursor: 'pointer',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14">
            <path d="M7 1.8v10.4M1.8 7h10.4" stroke="#2F7D5B" strokeWidth={2} strokeLinecap="round" />
          </svg>
          Add milestone
        </div>
      </div>
      <div style={{ font: "400 12px/1.4 'Spline Sans'", color: 'var(--ink-faint)', margin: '0 4px 14px' }}>
        Toggle what-ifs on to test them. Committed milestones are locked into your baseline.
      </div>
      <div className="dashboard-goals">
        {stride.goals.map((g) => {
          const isTpl = g.kind === 'template';
          const mm = mMonth(g);
          const balAfter = cur[Math.min(mm, N - 1)];
          const funded = balAfter >= (stride.brokeLimit || 0);
          const pct = isTpl ? 100 : Math.max(0, Math.min(100, Math.round(((g as any).saved / (g as any).amount) * 100)));
          const isPanel = stride.panel && stride.panel.type === 'goal' && stride.panel.key === g.key;
          const committed = g.status === 'committed';
          const inactive = g.status === 'inactive';
          const sum = isTpl ? milestoneSummary(g, stride.incomeStreams, N) : null;
          let statusLabel: string, sTone: string, sBg: string;
          if (committed) {
            statusLabel = 'Committed';
            sTone = 'var(--ink-dim)';
            sBg = 'rgba(30,37,34,0.06)';
          } else if (inactive) {
            statusLabel = 'Muted';
            sTone = '#9AA09A';
            sBg = 'rgba(30,37,34,0.05)';
          } else {
            statusLabel = funded ? 'On track' : 'At risk';
            sTone = funded ? 'var(--green)' : 'var(--amber)';
            sBg = funded ? 'var(--green-bg)' : 'var(--amber-bg)';
          }
          const amountLabel = isTpl ? money(sum!.monthlyPeak) + '/mo' : money((g as any).amount);
          const metaLabel = isTpl ? 'from ' + monthLabel(mm) : 'target ' + monthLabel((g as any).month);
          const oneTimeLabel = isTpl ? money(Math.abs(sum!.oneTime)) + ' up front' : '';
          const bodyOpacity = inactive ? 0.5 : 1;

          return (
            <div
              key={g.key}
              onMouseEnter={() => setHoveredGoal(g.key)}
              onMouseLeave={() => setHoveredGoal(null)}
              style={{
                position: 'relative',
                background: isPanel ? '#FBFCFA' : '#fff',
                borderRadius: 18,
                padding: 18,
                border: `1px solid ${isPanel ? 'rgba(47,125,91,0.5)' : 'rgba(30,37,34,0.06)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  onClick={() => stride.openPanel('goal', g.key)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: g.tint,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 17,
                    cursor: 'pointer',
                    opacity: bodyOpacity,
                  }}
                >
                  {g.glyph}
                </div>
                {committed ? (
                  <div
                    onClick={() => stride.openPanel('goal', g.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(30,37,34,0.06)', borderRadius: 999, padding: '5px 10px', cursor: 'pointer' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12">
                      <path d="M3 5V3.5a3 3 0 016 0V5" stroke="#5C645F" strokeWidth={1.4} fill="none" />
                      <rect x={2.2} y={5} width={7.6} height={5.5} rx={1.3} fill="#5C645F" />
                    </svg>
                    <span style={{ font: "500 10px 'Spline Sans Mono'", color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Committed</span>
                  </div>
                ) : (
                  <div
                    onClick={() => stride.toggleGoal(g.key)}
                    style={{
                      width: 38,
                      height: 22,
                      borderRadius: 999,
                      background: g.status === 'active' ? 'var(--green)' : 'rgba(30,37,34,0.16)',
                      position: 'relative',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'background .15s',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: g.status === 'active' ? 18 : 2,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: '#fff',
                        boxShadow: '0 1px 3px rgba(30,37,34,0.3)',
                        transition: 'left .15s',
                      }}
                    />
                  </div>
                )}
              </div>
              <div onClick={() => stride.openPanel('goal', g.key)} style={{ cursor: 'pointer', opacity: bodyOpacity }}>
                <div style={{ font: "600 16px 'Spline Sans'", color: 'var(--ink)', marginTop: 14 }}>{g.name}</div>
                <div style={{ font: "400 12px 'Spline Sans Mono'", color: 'var(--ink-faint)', marginTop: 3 }}>
                  {amountLabel} · {metaLabel}
                </div>
                {!isTpl && (
                  <div style={{ height: 6, borderRadius: 6, background: '#EEF0EB', marginTop: 14, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: pct + '%', background: g.dot, borderRadius: 6 }} />
                  </div>
                )}
                {isTpl && (
                  <div style={{ font: "400 12px 'Spline Sans Mono'", color: '#5C7B8A', marginTop: 13, marginBottom: 1 }}>{oneTimeLabel}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
                  <span style={{ font: "500 11px 'Spline Sans'", color: sTone, background: sBg, padding: '4px 10px', borderRadius: 999 }}>{statusLabel}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, font: "500 11px 'Spline Sans'", color: 'var(--green)' }}>
                    Edit
                    <svg width="11" height="11" viewBox="0 0 12 12">
                      <path d="M8.5 1.5l2 2-6 6-2.5.5.5-2.5 6-6z" stroke="#2F7D5B" strokeWidth={1.2} fill="none" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
