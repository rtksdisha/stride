import { useState } from 'react';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onTryGuest: () => void;
}

export function Landing({ onGetStarted, onLogin, onTryGuest }: LandingProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    { glyph: '📈', title: '5-Year Forecast', desc: 'See your balance projected month by month with committed milestones and what-if scenarios.' },
    { glyph: '🤖', title: 'AI Financial Assistant', desc: 'Chat with Stride AI to add milestones, simulate scenarios, and get personalized insights.' },
    { glyph: '🎯', title: 'Smart Milestones', desc: 'Model cars, houses, sabbaticals, and custom goals with real amortization math.' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* NAV BAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px',
        background: 'rgba(30,37,34,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ font: "600 22px 'Spline Sans'", letterSpacing: '-0.02em', color: '#fff' }}>stride</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6FB894', marginTop: 7 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span
            onClick={onLogin}
            style={{ font: "500 14px 'Spline Sans'", color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
          >
            Log in
          </span>
          <div
            onClick={onGetStarted}
            style={{
              background: '#fff', color: '#1E2522',
              padding: '10px 22px', borderRadius: 12,
              font: "600 14px 'Spline Sans'", cursor: 'pointer',
            }}
          >
            Get Started
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{
        minHeight: '92vh',
        background: '#1E2522',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 40px 80px',
        textAlign: 'center',
      }}>
        <div style={{
          font: "500 11px 'Spline Sans Mono'",
          letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
        }}>
          Personal Finance Forecaster
        </div>
        <h1 style={{
          font: "400 52px/1.15 'Newsreader'",
          color: '#fff',
          marginTop: 22,
          maxWidth: 720,
          letterSpacing: '-0.02em',
        }}>
          See exactly when your money runs ahead — or runs out.
        </h1>
        <p style={{
          font: "400 17px/1.65 'Spline Sans'",
          color: 'rgba(255,255,255,0.55)',
          marginTop: 22,
          maxWidth: 540,
        }}>
          Stride projects your balance years into the future, tells you the date you hit every milestone, and uses AI to help you plan. No spreadsheets. No guesswork.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36 }}>
          <div
            onClick={onGetStarted}
            style={{
              background: '#fff', color: '#1E2522',
              padding: '16px 32px', borderRadius: 14,
              font: "600 16px 'Spline Sans'", cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            Get Started — it's free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h9m0 0l-4-4m4 4l-4 4" stroke="#1E2522" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div
            onClick={onTryGuest}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.8)',
              padding: '16px 28px', borderRadius: 14,
              font: "600 15px 'Spline Sans'", cursor: 'pointer',
              border: '1.5px solid rgba(255,255,255,0.2)',
            }}
          >
            Try as Guest
          </div>
        </div>
        <div style={{
          font: "400 12px 'Spline Sans'",
          color: 'rgba(255,255,255,0.3)',
          marginTop: 24,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 10 }}>✦</span>
          100% private — your data never leaves your device unless you sign in
        </div>
      </div>

      {/* FEATURES */}
      <div style={{
        background: 'var(--paper)',
        padding: '80px 40px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              font: "500 11px 'Spline Sans Mono'",
              letterSpacing: '0.14em',
              color: 'var(--ink-faint)',
              textTransform: 'uppercase',
            }}>
              What Stride does
            </div>
            <div style={{
              font: "400 34px/1.2 'Newsreader'",
              color: 'var(--ink)',
              marginTop: 12,
              letterSpacing: '-0.01em',
            }}>
              Your finances, projected forward.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {features.map((f, i) => (
              <div
                key={f.title}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: '32px 28px',
                  border: `1px solid ${hoveredFeature === i ? 'rgba(47,125,91,0.3)' : 'rgba(30,37,34,0.06)'}`,
                  boxShadow: hoveredFeature === i
                    ? '0 12px 32px rgba(47,125,91,0.08)'
                    : '0 4px 16px rgba(30,37,34,0.03)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'rgba(47,125,91,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {f.glyph}
                </div>
                <div style={{ font: "600 17px 'Spline Sans'", color: 'var(--ink)', marginTop: 18 }}>
                  {f.title}
                </div>
                <div style={{ font: "400 14px/1.55 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 8 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        background: '#1E2522',
        padding: '28px 40px',
        textAlign: 'center',
        font: "400 12px 'Spline Sans Mono'",
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.04em',
      }}>
        Built with Google ADK · Powered by Gemini
      </div>
    </div>
  );
}
