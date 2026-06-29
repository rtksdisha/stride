import { useState } from 'react';
import { useStride } from '../state/StrideContext';
import type { ForecastResult } from '../lib/forecast';
import { HORIZON } from '../lib/forecast';
import { metrics, mFirstWord } from '../lib/finance';
import { money } from '../lib/format';
import { Chart } from '../components/Chart';
import type { SimpleGoal } from '../types';

interface MilestoneProps {
  forecast: ForecastResult;
  picked: string | null;
  onPick: (key: string | null) => void;
  onBack: () => void;
  onGoScenario: () => void;
}

const MODE_WORD: Record<string, string> = { committed: 'Committed', active: 'What-if', inactive: 'Muted' };

export function Milestone({ forecast, picked, onPick, onBack, onGoScenario }: MilestoneProps) {
  const stride = useStride();
  const [mHover, setMHover] = useState<number | null>(null);
  const { net } = forecast;
  const N = HORIZON;

  const simpleGoals = stride.goals.filter((g): g is SimpleGoal => g.kind !== 'template');
  const g = simpleGoals.find((x) => x.key === picked) || simpleGoals[0];

  if (!g) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '30px 36px 36px' }}>
        <div style={{ font: "400 15px 'Spline Sans'", color: 'var(--ink-dim)' }}>No milestones yet.</div>
      </div>
    );
  }

  const mm = metrics(g, net);
  const mSeries: number[] = [];
  for (let i = 0; i < N; i++) {
    mSeries.push(Math.min(g.amount, g.saved + mm.monthlyToward * i));
  }
  const modeLabel = MODE_WORD[g.status] || 'What-if';

  const drivers = [
    { label: 'Set aside each month', value: money(mm.monthlyToward) },
    { label: 'Surplus after spending', value: money(net) + '/mo' },
    { label: 'Still to save', value: money(mm.remaining) },
    { label: 'Months to target', value: mm.monthsNeeded + ' mo' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '30px 36px 36px' }}>
      <div
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          font: "500 13px 'Spline Sans'",
          color: 'var(--ink-dim)',
          cursor: 'pointer',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 12 12">
          <path d="M7.5 2L3 6l4.5 4" stroke="#5C645F" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to forecast
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
          {simpleGoals.map((x) => {
            const active = x.key === g.key;
            return (
              <div
                key={x.key}
                onClick={() => {
                  onPick(x.key);
                  setMHover(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: active ? '#fff' : 'transparent',
                  border: `1px solid ${active ? 'rgba(30,37,34,0.12)' : 'rgba(30,37,34,0.08)'}`,
                  borderRadius: 999,
                  padding: '7px 13px',
                  cursor: 'pointer',
                  font: "500 12.5px 'Spline Sans'",
                  color: active ? '#1E2522' : '#5C645F',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: x.dot }} />
                {mFirstWord(x)}
              </div>
            );
          })}
        </div>
        <div
          onClick={() => stride.addMilestone()}
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

      <div className="milestone-cols" style={{ marginTop: 18 }}>
        <div
          style={{
            flex: 1.5,
            background: '#fff',
            borderRadius: 22,
            padding: 28,
            border: '1px solid rgba(30,37,34,0.06)',
            boxShadow: '0 1px 2px rgba(30,37,34,0.04), 0 22px 44px rgba(30,37,34,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: g.tint,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 19,
                }}
              >
                {g.glyph}
              </div>
              <div>
                <div style={{ font: "600 18px 'Spline Sans'", color: 'var(--ink)' }}>{g.name}</div>
                <div style={{ font: "400 12px 'Spline Sans Mono'", color: 'var(--ink-faint)', marginTop: 2 }}>
                  Target {money(g.amount)} · {modeLabel}
                </div>
              </div>
            </div>
            <div
              onClick={() => stride.openPanel('goal', g.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#fff',
                border: '1px solid rgba(30,37,34,0.1)',
                borderRadius: 10,
                padding: '8px 13px',
                font: "600 12.5px 'Spline Sans'",
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12">
                <path d="M8.5 1.5l2 2-6 6-2.5.5.5-2.5 6-6z" stroke="#2F7D5B" strokeWidth={1.2} fill="none" strokeLinejoin="round" />
              </svg>
              Edit goal
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: mm.pillBg,
              borderRadius: 999,
              padding: '5px 12px',
              marginTop: 18,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: mm.tone }} />
            <span style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.06em', color: mm.tone, textTransform: 'uppercase' }}>
              {mm.statusLabel}
            </span>
          </div>
          <div style={{ font: "400 30px/1.26 'Newsreader'", color: 'var(--ink)', marginTop: 12, letterSpacing: '-0.01em' }}>
            You reach it by <span style={{ color: mm.tone, fontWeight: 500 }}>{mm.hitDate}</span>.
          </div>
          <div style={{ font: "400 14px/1.55 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 9, maxWidth: 480 }}>{mm.sub}</div>

          <div style={{ marginTop: 18 }}>
            <Chart
              series={mSeries}
              height={200}
              padTop={24}
              id="m"
              accent={g.dot}
              markers={[
                { m: mm.monthsNeeded, label: 'reached', color: g.dot },
                { m: Math.round(g.month), label: 'target', color: '#A8AEA8' },
              ]}
              hover={mHover}
              onHover={setMHover}
            />
          </div>
        </div>

        <div className="milestone-side" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: 20,
              border: '1px solid rgba(30,37,34,0.06)',
            }}
          >
            <div style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)' }}>Progress</div>
            <div style={{ height: 8, borderRadius: 8, background: '#EEF0EB', marginTop: 14, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: mm.pct + '%', background: g.dot, borderRadius: 8 }} />
            </div>
            <div style={{ font: "500 12.5px 'Spline Sans'", color: 'var(--ink)', marginTop: 10 }}>
              {mm.pct}% of {money(g.amount)}
            </div>
            <div style={{ font: "400 12px 'Spline Sans Mono'", color: 'var(--ink-faint)', marginTop: 3 }}>{money(g.saved)} saved so far</div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: 20,
              border: '1px solid rgba(30,37,34,0.06)',
            }}
          >
            <div style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)' }}>What's driving the timeline</div>
            <div style={{ marginTop: 8 }}>
              {drivers.map((d, idx) => (
                <div
                  key={d.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 0',
                    borderBottom: idx < drivers.length - 1 ? '1px solid rgba(30,37,34,0.06)' : 'none',
                  }}
                >
                  <span style={{ font: "400 12.5px 'Spline Sans'", color: 'var(--ink-dim)' }}>{d.label}</span>
                  <span style={{ font: "600 13px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{d.value}</span>
                </div>
              ))}
            </div>
            <div
              onClick={onGoScenario}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                font: "600 13px 'Spline Sans'",
                color: 'var(--green)',
                marginTop: 14,
                cursor: 'pointer',
              }}
            >
              Tune income &amp; spending
              <svg width="13" height="13" viewBox="0 0 16 16">
                <path d="M3 8h9m0 0l-4-4m4 4l-4 4" stroke="#2F7D5B" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
