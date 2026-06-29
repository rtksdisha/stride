import { useState } from 'react';

interface Option {
  key: string;
  label: string;
  sub: string;
  glyph: string;
  tint: string;
}

const OPTS: Option[] = [
  { key: 'house', label: 'A house down payment', sub: 'most popular', glyph: '🏠', tint: 'rgba(47,125,91,0.13)' },
  { key: 'car', label: 'A new car', sub: '12–36 months out', glyph: '🚗', tint: 'rgba(92,123,138,0.14)' },
  { key: 'sab', label: 'A sabbatical / career break', sub: '2–5 years out', glyph: '🌿', tint: 'rgba(192,121,46,0.14)' },
  { key: 'runway', label: 'Just a safety runway', sub: 'months of cushion', glyph: '🛟', tint: 'rgba(30,37,34,0.07)' },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState('house');

  return (
    <div className="app-shell onboarding-shell" style={{ display: 'flex' }}>
      <div
        className="onboarding-left"
        style={{
          background: '#1E2522',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ font: "600 22px 'Spline Sans'", letterSpacing: '-0.02em' }}>stride</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6FB894', marginTop: 8 }} />
        </div>
        <div>
          <div style={{ font: "400 13px 'Spline Sans Mono'", letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            When am I not broke?
          </div>
          <div style={{ font: "400 42px/1.18 'Newsreader'", marginTop: 18, letterSpacing: '-0.01em' }}>
            See exactly when your money runs ahead — or runs out.
          </div>
          <div style={{ font: "400 16px/1.6 'Spline Sans'", color: 'rgba(255,255,255,0.62)', marginTop: 20, maxWidth: 380 }}>
            Stride projects your balance years into the future and tells you the date you hit every milestone. No
            spreadsheets. No anxiety spirals.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 26 }}>
          <div>
            <div style={{ font: "500 22px 'Newsreader'", color: '#6FB894' }}>5 yrs</div>
            <div style={{ font: "400 12px 'Spline Sans Mono'", color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>forecast horizon</div>
          </div>
          <div>
            <div style={{ font: "500 22px 'Newsreader'", color: '#6FB894' }}>~2 min</div>
            <div style={{ font: "400 12px 'Spline Sans Mono'", color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>to set up</div>
          </div>
        </div>
      </div>
      <div className="onboarding-right" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.14em', color: '#A8AEA8', textTransform: 'uppercase' }}>
          Step 1 of 3
        </div>
        <div style={{ font: "400 32px/1.22 'Newsreader'", color: '#1E2522', marginTop: 12, letterSpacing: '-0.01em' }}>
          What are you saving toward first?
        </div>
        <div style={{ font: "400 15px/1.55 'Spline Sans'", color: '#5C645F', marginTop: 11, maxWidth: 430 }}>
          Pick one goal to anchor your forecast. You can add the rest in a minute.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 30, maxWidth: 480 }}>
          {OPTS.map((opt) => {
            const active = picked === opt.key;
            return (
              <div
                key={opt.key}
                onClick={() => setPicked(opt.key)}
                style={{
                  position: 'relative',
                  background: '#fff',
                  borderRadius: 16,
                  padding: '18px 20px',
                  border: '1px solid rgba(30,37,34,0.07)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: opt.tint,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 19,
                    }}
                  >
                    {opt.glyph}
                  </div>
                  <div>
                    <div style={{ font: "600 16px 'Spline Sans'", color: '#1E2522' }}>{opt.label}</div>
                    <div style={{ font: "400 12px 'Spline Sans Mono'", color: '#A8AEA8', marginTop: 2 }}>{opt.sub}</div>
                  </div>
                </div>
                {active && (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2F7D5B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 12 12">
                      <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                {active && (
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: '1.5px solid #2F7D5B', pointerEvents: 'none' }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 32, maxWidth: 480 }}>
          <div
            onClick={onDone}
            style={{
              background: '#1E2522',
              color: '#fff',
              borderRadius: 14,
              padding: '16px 28px',
              font: "600 16px 'Spline Sans'",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
            }}
          >
            Build my forecast
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M3 8h9m0 0l-4-4m4 4l-4 4" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ font: "400 12px 'Spline Sans'", color: '#A8AEA8' }}>Nothing leaves your device</span>
        </div>
      </div>
    </div>
  );
}
