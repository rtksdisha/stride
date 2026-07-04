import { useState } from 'react';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onTryGuest: () => void;
}

export function Landing({ onGetStarted, onLogin, onTryGuest }: LandingProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    { glyph: '📈', title: '5-Year Forecast', desc: 'See your balance projected month by month with committed milestones and what-if scenarios.' },
    { glyph: '🤖', title: 'AI Chat Assistant', desc: 'Chat with Stride AI to add milestones, simulate scenarios, and get personalized insights.' },
    { glyph: '🎯', title: 'Smart Milestones', desc: 'Model cars, houses, sabbaticals, and custom goals with real amortization math.' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)', color: 'var(--ink)' }}>
      {/* NAV BAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px',
        background: 'rgba(30,37,34,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* LOGO */}
        <div onClick={() => scrollTo('hero')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ font: "600 22px 'Spline Sans'", letterSpacing: '-0.02em', color: '#fff' }}>stride</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2f7d5b', marginTop: 7 }} />
        </div>

        {/* MIDDLE NAV */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span onClick={() => scrollTo('hero')} style={{ font: "500 13.5px 'Spline Sans'", color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>Home</span>
          <span onClick={() => scrollTo('how-it-works')} style={{ font: "500 13.5px 'Spline Sans'", color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>How it works</span>
          <span onClick={() => scrollTo('about-us')} style={{ font: "500 13.5px 'Spline Sans'", color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>About us</span>
        </div>

        {/* RIGHT CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span
            onClick={onLogin}
            style={{ font: "500 14px 'Spline Sans'", color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          >
            Log in
          </span>
          <div
            onClick={onGetStarted}
            style={{
              background: '#fff', color: '#1E2522',
              padding: '10px 22px', borderRadius: 12,
              font: "600 14px 'Spline Sans'", cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Sign up
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <div id="hero" style={{
        background: '#1E2522',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '130px 40px 80px',
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
          font: "400 56px/1.12 'Newsreader'",
          color: '#fff',
          marginTop: 22,
          maxWidth: 760,
          letterSpacing: '-0.02em',
        }}>
          See exactly when your money runs ahead — or runs out.
        </h1>
        <p style={{
          font: "400 17.5px/1.65 'Spline Sans'",
          color: 'rgba(255,255,255,0.55)',
          marginTop: 22,
          maxWidth: 580,
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
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Get Started — it's free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h9m0 0l-4-4m4 4l-4 4" stroke="#1E2522" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div
            onClick={onTryGuest}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.85)',
              padding: '16px 28px', borderRadius: 14,
              font: "600 15px 'Spline Sans'", cursor: 'pointer',
              border: '1.5px solid rgba(255,255,255,0.2)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Try as Guest
          </div>
        </div>

        {/* HIGH FIDELITY DASHBOARD MOCKUP SCREEN */}
        <div style={{
          width: '92%',
          maxWidth: 920,
          aspectRatio: '16/10.5',
          marginTop: 64,
          background: '#FBFCFA',
          borderRadius: 16,
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(255,255,255,0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'left',
        }}>
          {/* Mock Browser Titlebar */}
          <div style={{
            height: 38,
            background: '#F0F1ED',
            borderBottom: '1px solid rgba(30, 37, 34, 0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            position: 'relative',
          }}>
            {/* Dots */}
            <div style={{ display: 'flex', gap: 6, position: 'absolute', left: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
            </div>
            {/* Address Bar */}
            <div style={{
              margin: '0 auto',
              background: '#fff',
              borderRadius: 6,
              width: 320,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              font: "400 11px/1 'Spline Sans Mono'",
              color: 'var(--ink-faint)',
              border: '1px solid rgba(30,37,34,0.06)',
            }}>
              🔒 stride.app/workspace/forecast
            </div>
          </div>

          {/* Browser Workspace Content */}
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* Left Mock Sidebar */}
            <div style={{
              width: 172,
              background: '#E7E9E2',
              borderRight: '1px solid rgba(30, 37, 34, 0.07)',
              padding: '20px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
                <span style={{ font: "600 18px 'Spline Sans'", letterSpacing: '-0.02em', color: 'var(--ink)' }}>stride</span>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink)', marginTop: 6 }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ background: '#fff', color: 'var(--ink)', font: "600 12.5px 'Spline Sans'", padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>📈 Forecast</div>
                <div style={{ color: 'var(--ink-dim)', font: "500 12.5px 'Spline Sans'", padding: '8px 12px', borderRadius: 8 }}>🎯 Milestones</div>
                <div style={{ color: 'var(--ink-dim)', font: "500 12.5px 'Spline Sans'", padding: '8px 12px', borderRadius: 8 }}>⚡ Scenario Setup</div>
                <div style={{ color: 'var(--ink-dim)', font: "500 12.5px 'Spline Sans'", padding: '8px 12px', borderRadius: 8 }}>💬 AI Planner</div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid rgba(30,37,34,0.08)', paddingTop: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "600 11px 'Spline Sans'" }}>GM</div>
                <div style={{ font: "600 12px 'Spline Sans'", color: 'var(--ink)' }}>Guest Mode</div>
              </div>
            </div>

            {/* Main Panel Content */}
            <div style={{ flex: 1, padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 18, overflow: 'hidden' }}>
              {/* Header metrics */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ font: "400 24px 'Newsreader'", color: 'var(--ink)' }}>Good morning, planner</div>
                  <div style={{ font: "400 12px 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 4 }}>Here is your 5-year timeline projection.</div>
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(30,37,34,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ font: "500 9px 'Spline Sans Mono'", color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Net Worth (Yr 5)</div>
                    <div style={{ font: "600 16px 'Spline Sans'", color: 'var(--ink)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      $69,400
                      <span style={{ color: '#2f7d5b', fontSize: 11 }}>▲</span>
                    </div>
                  </div>
                  <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(30,37,34,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ font: "500 9px 'Spline Sans Mono'", color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Monthly Surplus</div>
                    <div style={{ font: "600 16px 'Spline Sans'", color: 'var(--green)', marginTop: 2 }}>+$1,970/mo</div>
                  </div>
                </div>
              </div>

              {/* Chart Mock */}
              <div style={{ position: 'relative', flex: 1, background: '#fff', border: '1px solid rgba(30,37,34,0.06)', borderRadius: 16, padding: '18px 20px', minHeight: 160, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ font: "600 12.5px 'Spline Sans'", color: 'var(--ink)' }}>Cashflow Balance Curve</span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, font: "400 10px 'Spline Sans Mono'", color: 'var(--ink-dim)' }}>
                      <span style={{ width: 12, height: 2.5, borderRadius: 2, background: 'var(--ink)' }} />
                      Forecast
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, font: "400 10px 'Spline Sans Mono'", color: 'var(--ink-dim)' }}>
                      <span style={{ width: 12, height: 0, borderTop: '2px dashed #B6BCB6' }} />
                      Baseline
                    </span>
                  </div>
                </div>

                {/* SVG Curve */}
                <div style={{ position: 'relative', flex: 1 }}>
                  <svg viewBox="0 0 500 110" style={{ width: '100%', height: '100%', display: 'block' }}>
                    <defs>
                      <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2f7d5b" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#2f7d5b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" x2="500" y1="100" y2="100" stroke="rgba(30,37,34,0.06)" strokeWidth={1} />
                    <line x1="0" x2="500" y1="60" y2="60" stroke="rgba(30,37,34,0.04)" strokeWidth={1} />
                    <line x1="0" x2="500" y1="20" y2="20" stroke="rgba(30,37,34,0.04)" strokeWidth={1} />

                    {/* Area fill */}
                    <path d="M 0 90 Q 120 75 220 50 T 380 20 T 500 12 L 500 100 L 0 100 Z" fill="url(#glow)" />
                    {/* Baseline */}
                    <path d="M 0 90 Q 120 85 220 80 T 380 75 T 500 70" fill="none" stroke="#B6BCB6" strokeWidth={1.5} strokeDasharray="3 4" />
                    {/* Active curve */}
                    <path d="M 0 90 Q 120 75 220 50 T 380 20 T 500 12" fill="none" stroke="var(--ink)" strokeWidth={2.8} />

                    {/* Milestone Target Dot */}
                    <circle cx="280" cy="40" r="5" fill="var(--ink)" stroke="#fff" strokeWidth={2} />
                    {/* Tooltip marker */}
                    <line x1="280" x2="280" y1="40" y2="100" stroke="var(--ink)" strokeWidth={1.2} strokeDasharray="2 2" opacity={0.4} />
                  </svg>
                  {/* Floating target tag */}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 210,
                    background: 'var(--ink)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 6,
                    font: "600 9.5px 'Spline Sans'",
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    🎯 House Down Payment (Mo 30)
                  </div>
                </div>
              </div>

              {/* Bottom Cards Mock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Card 1 */}
                <div style={{ background: 'var(--ink)', borderRadius: 14, padding: 12, border: '1px solid var(--ink)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🚗</div>
                    <span style={{ font: "500 8.5px 'Spline Sans Mono'", color: 'var(--ink)', background: '#fff', padding: '2px 6px', borderRadius: 4 }}>Committed</span>
                  </div>
                  <div>
                    <div style={{ font: "600 12.5px 'Spline Sans'", color: '#fff' }}>Toyota RAV4 Hybrid</div>
                    <div style={{ font: "400 10.5px 'Spline Sans Mono'", color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>$12,000 down · Mo 14</div>
                  </div>
                </div>

                {/* Card 2 */}
                <div style={{ background: 'rgba(30,37,34,0.03)', borderRadius: 14, padding: 12, border: '1px dashed rgba(30,37,34,0.3)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(30,37,34,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🏠</div>
                    <span style={{ font: "500 8.5px 'Spline Sans Mono'", color: 'var(--ink)', background: 'rgba(30,37,34,0.08)', padding: '2px 6px', borderRadius: 4 }}>Exploring</span>
                  </div>
                  <div>
                    <div style={{ font: "600 12.5px 'Spline Sans'", color: 'var(--ink)' }}>House Down Payment</div>
                    <div style={{ font: "400 10.5px 'Spline Sans Mono'", color: 'var(--ink-dim)', marginTop: 2 }}>$8,200 saved · Mo 30</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          font: "400 12px 'Spline Sans'",
          color: 'rgba(255,255,255,0.3)',
          marginTop: 40,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 10 }}>✦</span>
          100% private — your data never leaves your device unless you sign in
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div id="how-it-works" style={{
        background: 'var(--paper)',
        padding: '90px 40px 70px',
        borderBottom: '1px solid rgba(30,37,34,0.06)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <div style={{
              font: "500 11px 'Spline Sans Mono'",
              letterSpacing: '0.14em',
              color: 'var(--ink-faint)',
              textTransform: 'uppercase',
            }}>
              What Stride does
            </div>
            <div style={{
              font: "400 36px/1.2 'Newsreader'",
              color: 'var(--ink)',
              marginTop: 12,
              letterSpacing: '-0.01em',
            }}>
              Your finances, projected forward.
            </div>
          </div>

          {/* Clean Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {features.map((f, i) => (
              <div
                key={f.title}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: '32px 28px',
                  border: `1px solid ${hoveredFeature === i ? 'rgba(30,37,34,0.25)' : 'rgba(30,37,34,0.06)'}`,
                  boxShadow: hoveredFeature === i
                    ? '0 12px 32px rgba(30,37,34,0.05)'
                    : '0 4px 16px rgba(30,37,34,0.02)',
                  transition: 'all 0.25s ease',
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: 'rgba(30,37,34,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {f.glyph}
                </div>
                <div style={{ font: "600 17px 'Spline Sans'", color: 'var(--ink)', marginTop: 20 }}>
                  {f.title}
                </div>
                <div style={{ font: "400 14px/1.55 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 8 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Alternate Block 1: Smart Projection Engine */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 64,
            marginTop: 90,
            paddingTop: 40,
          }}>
            {/* Left side text */}
            <div style={{ flex: 1.1 }}>
              <div style={{ font: "500 10.5px 'Spline Sans Mono'", color: '#2f7d5b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Smart Projection Engine</div>
              <h2 style={{ font: "400 36px/1.2 'Newsreader'", color: 'var(--ink)', marginTop: 14 }}>Deeper math for smarter lifestyle choices</h2>
              <p style={{ font: "400 15px/1.6 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 14 }}>
                Stride builds a chronological simulation of your account balances, amortizing loan interest, mortgage escrow schedules, and tax implications month-by-month. Easily toggle what-ifs to see exactly how buying a home or taking a sabbatical affects your timeline.
              </p>
              <div onClick={onGetStarted} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: "600 14px 'Spline Sans'", color: 'var(--ink)', marginTop: 20, cursor: 'pointer' }}>
                Build your scenario
                <span style={{ fontSize: 13, transition: 'transform 0.2s' }}>➔</span>
              </div>
            </div>
            {/* Right side mockup */}
            <div style={{ flex: 0.9, background: '#fff', borderRadius: 20, padding: 24, border: '1px solid rgba(30,37,34,0.06)', boxShadow: '0 12px 32px rgba(0,0,0,0.03)' }}>
              <div style={{ font: "600 13.5px 'Spline Sans'", color: 'var(--ink)' }}>Timeline Drivers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid rgba(30,37,34,0.06)' }}>
                  <span style={{ font: "400 12.5px 'Spline Sans'", color: 'var(--ink-dim)' }}>Set aside each month</span>
                  <span style={{ font: "600 12.5px 'Spline Sans'", color: 'var(--ink)' }}>$1,250/mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid rgba(30,37,34,0.06)' }}>
                  <span style={{ font: "400 12.5px 'Spline Sans'", color: 'var(--ink-dim)' }}>Surplus cash reserves</span>
                  <span style={{ font: "600 12.5px 'Spline Sans'", color: 'var(--green)' }}>+$28,400</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid rgba(30,37,34,0.06)' }}>
                  <span style={{ font: "400 12.5px 'Spline Sans'", color: 'var(--ink-dim)' }}>Remaining to save</span>
                  <span style={{ font: "600 12.5px 'Spline Sans'", color: 'var(--ink)' }}>$11,500</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ font: "400 12.5px 'Spline Sans'", color: 'var(--ink-dim)' }}>Time to target date</span>
                  <span style={{ font: "600 12.5px 'Spline Sans'", color: 'var(--ink)' }}>9 months early</span>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 6, background: '#EEF0EB', marginTop: 18, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '75%', background: 'var(--ink)', borderRadius: 6 }} />
              </div>
              <div style={{ font: "500 11px 'Spline Sans Mono'", color: 'var(--ink-faint)', marginTop: 8, textAlign: 'right' }}>75% SAVED</div>
            </div>
          </div>

          {/* Alternate Block 2: Interactive AI Chat Guidance */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 64,
            marginTop: 80,
            paddingTop: 40,
          }}>
            {/* Left side mockup */}
            <div style={{ flex: 0.9, background: '#fff', borderRadius: 20, border: '1px solid rgba(30,37,34,0.06)', boxShadow: '0 12px 32px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: '#F0F1ED', padding: '12px 16px', borderBottom: '1px solid rgba(30,37,34,0.06)', font: "600 12px 'Spline Sans'", color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2f7d5b' }} />
                Stride AI Assistant
              </div>
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'rgba(30,37,34,0.03)', color: 'var(--ink)', padding: '10px 12px', borderRadius: '12px 12px 4px 12px', alignSelf: 'flex-end', font: "400 12.5px 'Spline Sans'", maxWidth: '85%' }}>
                  Can I afford to pause my salary for a sabbatical next spring?
                </div>
                <div style={{ background: '#FBFCFA', border: '1px solid rgba(30,37,34,0.06)', color: 'var(--ink)', padding: '10px 12px', borderRadius: '12px 12px 12px 4px', alignSelf: 'flex-start', font: "400 12.5px/1.4 'Newsreader'", maxWidth: '85%' }}>
                  Yes. If you start a 6-month sabbatical in March, your cash reserve lowest point dips to $4,200. You remain above your broke limit ($2,000) throughout.
                </div>
                <div style={{ background: 'rgba(30,37,34,0.05)', color: 'var(--ink-dim)', padding: '8px 10px', borderRadius: 8, font: "600 10.5px 'Spline Sans'", cursor: 'pointer', textAlign: 'center', border: '1px solid rgba(30,37,34,0.06)' }}>
                  ⚡ Model Sabbatical Event
                </div>
              </div>
            </div>
            {/* Right side text */}
            <div style={{ flex: 1.1 }}>
              <div style={{ font: "500 10.5px 'Spline Sans Mono'", color: '#2f7d5b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Financial Assistant</div>
              <h2 style={{ font: "400 36px/1.2 'Newsreader'", color: 'var(--ink)', marginTop: 14 }}>Talk to your timeline. Adjust in real-time.</h2>
              <p style={{ font: "400 15px/1.6 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 14 }}>
                Skip the manual formula setups. Stride integrates an intelligent conversational agent. Simply tell Stride AI what you plan to do, and it will immediately generate milestone proposals, adjust saving parameters, and tell you the exact timeline outcomes.
              </p>
              <div onClick={onGetStarted} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: "600 14px 'Spline Sans'", color: 'var(--ink)', marginTop: 20, cursor: 'pointer' }}>
                Chat with Stride AI
                <span style={{ fontSize: 13 }}>➔</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ABOUT US SECTION */}
      <div id="about-us" style={{
        background: '#1E2522',
        color: '#fff',
        padding: '90px 40px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            font: "500 11px 'Spline Sans Mono'",
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
          }}>
            Our Philosophy
          </div>
          <h2 style={{
            font: "400 42px/1.2 'Newsreader'",
            color: '#fff',
            marginTop: 18,
            letterSpacing: '-0.01em',
          }}>
            Designed for clarity, built for privacy.
          </h2>
          <p style={{
            font: "400 16.5px/1.65 'Spline Sans'",
            color: 'rgba(255,255,255,0.6)',
            marginTop: 22,
            maxWidth: 620,
            margin: '22px auto 0',
          }}>
            Stride was created to replace the chaotic and static nature of financial spreadsheets. We believe you should plan your life milestones based on chronological forecast curves, not ad-hoc equations. Stride is designed from the ground up to keep your financial life private and intuitive.
          </p>

          {/* Privacy metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            marginTop: 48,
            maxWidth: 720,
            margin: '48px auto 0',
          }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '24px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
              <div style={{ font: "600 14px 'Spline Sans'", color: '#fff' }}>100% Private</div>
              <div style={{ font: "400 11px/1.4 'Spline Sans'", color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>No credentials required. Your cashflow data is completely yours.</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '24px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🚫</div>
              <div style={{ font: "600 14px 'Spline Sans'", color: '#fff' }}>No Advertisements</div>
              <div style={{ font: "400 11px/1.4 'Spline Sans'", color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>We never sell your financial records or serve targeted ads.</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '24px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
              <div style={{ font: "600 14px 'Spline Sans'", color: '#fff' }}>Instant Projection</div>
              <div style={{ font: "400 11px/1.4 'Spline Sans'", color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Real-time updates dynamically project timeline changes.</div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        background: '#151B18',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '36px 40px',
        textAlign: 'center',
        font: "400 12.5px 'Spline Sans Mono'",
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.04em',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ font: "600 16px 'Spline Sans'", color: '#fff', letterSpacing: '-0.02em' }}>stride</span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2f7d5b' }} />
        </div>
        <div>Built with Google ADK · Powered by Gemini</div>
        <div style={{ font: "400 11px 'Spline Sans'", color: 'rgba(255,255,255,0.18)', marginTop: 8 }}>
          &copy; {new Date().getFullYear()} Stride Forecaster. All rights reserved.
        </div>
      </div>
    </div>
  );
}
