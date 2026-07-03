import { useState } from 'react';
import { useStride } from '../state/StrideContext';
import { defaultDebts, defaultAccounts, defaultGoals } from '../lib/defaults';

interface Option {
  key: string;
  label: string;
  sub: string;
  glyph: string;
  tint: string;
  dot: string;
}

const GOAL_OPTS: Option[] = [
  { key: 'house', label: 'A house down payment', sub: 'Model mortgage, closing, property tax & upkeep', glyph: '🏠', tint: 'rgba(47,125,91,0.13)', dot: '#2F7D5B' },
  { key: 'car', label: 'A new car', sub: 'Model down payment, loan terms & auto insurance', glyph: '🚗', tint: 'rgba(92,123,138,0.14)', dot: '#5C7B8A' },
  { key: 'sab', label: 'A sabbatical / career break', sub: 'Model paused income & lifestyle/travel costs', glyph: '🌿', tint: 'rgba(192,121,46,0.14)', dot: '#C0792E' },
  { key: 'runway', label: 'Emergency runway', sub: 'Calculate months of safety cushion', glyph: '🛟', tint: 'rgba(30,37,34,0.07)', dot: '#7B827D' },
];

const PURPOSE_OPTS = [
  { key: 'forecast', label: '5-Year Forecast', desc: 'See cashflow and net worth projection' },
  { key: 'milestones', label: 'Plan Milestones', desc: 'Simulate big purchases like cars or homes' },
  { key: 'debt', label: 'Pay down debt', desc: 'Optimize snowball vs avalanche payoff' },
  { key: 'savings', label: 'Build savings', desc: 'Set up virtual buckets and safety runway' },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const stride = useStride();
  const [step, setStep] = useState(1);

  // Wizard state
  const [age, setAge] = useState<number>(28);
  const [income, setIncome] = useState<number>(5500);
  const [expenses, setExpenses] = useState<number>(3800);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(['forecast']);
  const [pickedGoal, setPickedGoal] = useState<string>('house');

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Build final onboarding data
      const finalIncome = [
        {
          key: 'salary',
          name: 'Primary Income',
          glyph: '💼',
          amount: income,
          frequency: 'Monthly' as const,
          start: 0,
          duration: null,
          active: true,
          dot: '#2F7D5B',
          tint: 'rgba(47,125,91,0.13)'
        }
      ];

      // Setup initial goals based on selected onboarding options
      const initialGoals = defaultGoals().map(g => {
        if (g.key === pickedGoal) {
          return { ...g, status: 'active' as const };
        } else {
          return { ...g, status: 'inactive' as const };
        }
      });

      // Update stride state delta
      stride.applyStateDelta({
        incomeStreams: finalIncome,
        spending: expenses,
        goals: initialGoals,
        accounts: defaultAccounts(),
        debts: defaultDebts(),
      });

      onDone();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const togglePurpose = (key: string) => {
    setSelectedPurposes(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const inputStyle = {
    width: '100%',
    maxWidth: 400,
    padding: '14px 16px',
    border: '1.5px solid rgba(30,37,34,0.12)',
    borderRadius: 12,
    font: "400 15px 'Spline Sans'",
    color: '#1E2522',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginTop: 6,
    background: '#fff',
  };

  const netSavings = income - expenses;
  const savingRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;

  return (
    <div className="app-shell onboarding-shell" style={{ display: 'flex' }}>
      {/* LEFT PANEL */}
      <div
        className="onboarding-left"
        style={{
          width: '46%',
          background: '#1E2522',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '54px 48px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ font: "600 22px 'Spline Sans'", letterSpacing: '-0.02em' }}>stride</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6FB894', marginTop: 8 }} />
        </div>
        <div>
          <div style={{ font: "400 13px 'Spline Sans Mono'", letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Personal Finance Forecaster
          </div>
          <div style={{ font: "400 42px/1.18 'Newsreader'", marginTop: 18, letterSpacing: '-0.01em' }}>
            {step === 1 && 'Let’s customize your projection.'}
            {step === 2 && 'Balancing your monthly flow.'}
            {step === 3 && 'Tailoring your Stride cockpit.'}
            {step === 4 && 'Setting your first major target.'}
            {step === 5 && 'Verify and generate your plan.'}
          </div>
          <div style={{ font: "400 16px/1.6 'Spline Sans'", color: 'rgba(255,255,255,0.62)', marginTop: 20, maxWidth: 380 }}>
            {step === 1 && 'Input your current age and primary monthly take-home income so we can anchor the start of your timeline.'}
            {step === 2 && 'Set your average monthly expenses. This includes rent/mortgage, utilities, groceries, and subscription plans.'}
            {step === 3 && 'Select all the goals you want to focus on. We will pre-configure your dashboard tools based on these priorities.'}
            {step === 4 && 'Choose a milestone to start with. Stride models interest rates, loan terms, and recurring costs automatically.'}
            {step === 5 && 'Verify your cash flow projection dashboard. Hit build to generate your full interactive 5-year forecast.'}
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

      {/* RIGHT PANEL (WIZARD STEPS) */}
      <div className="onboarding-right" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '54px 56px' }}>
        <div style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.14em', color: '#A8AEA8', textTransform: 'uppercase' }}>
          Step {step} of 5
        </div>

        {/* STEP 1: INCOME & AGE */}
        {step === 1 && (
          <div style={{ marginTop: 12 }}>
            <h2 style={{ font: "400 32px/1.22 'Newsreader'", color: '#1E2522', letterSpacing: '-0.01em' }}>
              Welcome, {stride.user?.displayName || 'Friend'}. Let’s start.
            </h2>
            <div style={{ font: "400 15px/1.55 'Spline Sans'", color: '#5C645F', marginTop: 11, maxWidth: 430 }}>
              Provide your details so the projections match your career and lifecycle timeline.
            </div>
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.06em', color: '#7B827D', textTransform: 'uppercase' }}>How old are you?</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.06em', color: '#7B827D', textTransform: 'uppercase' }}>Primary Monthly Take-Home Income</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  style={inputStyle}
                />
                <div style={{ font: "400 12px 'Spline Sans'", color: '#7B827D', marginTop: 6 }}>
                  Your salary after tax and deductions. You can add freelance, dividends, or other income streams later.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SPENDING / EXPENSES */}
        {step === 2 && (
          <div style={{ marginTop: 12 }}>
            <h2 style={{ font: "400 32px/1.22 'Newsreader'", color: '#1E2522', letterSpacing: '-0.01em' }}>
              What are your typical monthly expenses?
            </h2>
            <div style={{ font: "400 15px/1.55 'Spline Sans'", color: '#5C645F', marginTop: 11, maxWidth: 430 }}>
              Estimate your monthly baseline costs. Include housing, bills, food, fun, and shopping.
            </div>
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.06em', color: '#7B827D', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', maxWidth: 400 }}>
                  <span>Monthly Expenses</span>
                  <span style={{ color: '#2F7D5B', fontWeight: 600 }}>${expenses.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max={Math.max(15000, income * 1.2)}
                  step="50"
                  value={expenses}
                  onChange={(e) => setExpenses(Number(e.target.value))}
                  style={{ width: '100%', maxWidth: 400, marginTop: 12, accentColor: '#2F7D5B' }}
                />
              </div>

              <div style={{
                background: 'rgba(47,125,91,0.06)',
                borderRadius: 14,
                padding: '16px 20px',
                maxWidth: 400,
                border: '1px solid rgba(47,125,91,0.12)',
              }}>
                <div style={{ font: "500 11px 'Spline Sans Mono'", color: '#2F7D5B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Onboarding Cashflow summary</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                  <span style={{ font: "400 14px 'Spline Sans'", color: 'var(--ink-dim)' }}>Net Monthly Savings</span>
                  <span style={{ font: "600 16px 'Spline Sans'", color: netSavings >= 0 ? '#2F7D5B' : '#C0463B' }}>
                    {netSavings >= 0 ? `+$${netSavings.toLocaleString()}` : `-$${Math.abs(netSavings).toLocaleString()}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ font: "400 14px 'Spline Sans'", color: 'var(--ink-dim)' }}>Savings Rate</span>
                  <span style={{ font: "600 14px 'Spline Sans'", color: savingRate >= 20 ? '#2F7D5B' : 'var(--ink)' }}>
                    {savingRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PURPOSE */}
        {step === 3 && (
          <div style={{ marginTop: 12 }}>
            <h2 style={{ font: "400 32px/1.22 'Newsreader'", color: '#1E2522', letterSpacing: '-0.01em' }}>
              What are you using Stride for?
            </h2>
            <div style={{ font: "400 15px/1.55 'Spline Sans'", color: '#5C645F', marginTop: 11, maxWidth: 430 }}>
              Select as many as apply to help configure your workspace.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 24, maxWidth: 460 }}>
              {PURPOSE_OPTS.map(p => {
                const active = selectedPurposes.includes(p.key);
                return (
                  <div
                    key={p.key}
                    onClick={() => togglePurpose(p.key)}
                    style={{
                      background: '#fff',
                      border: `1.5px solid ${active ? '#2F7D5B' : 'rgba(30,37,34,0.08)'}`,
                      borderRadius: 16,
                      padding: 16,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: active ? '0 4px 12px rgba(47,125,91,0.06)' : 'none',
                    }}
                  >
                    <div style={{ font: "600 15px 'Spline Sans'", color: '#1E2522' }}>{p.label}</div>
                    <div style={{ font: "400 12px 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 4 }}>{p.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: GOAL PICKER */}
        {step === 4 && (
          <div style={{ marginTop: 12 }}>
            <h2 style={{ font: "400 32px/1.22 'Newsreader'", color: '#1E2522', letterSpacing: '-0.01em' }}>
              Select your first major milestone
            </h2>
            <div style={{ font: "400 15px/1.55 'Spline Sans'", color: '#5C645F', marginTop: 11, maxWidth: 430 }}>
              Pick a template to build. You can modify its parameters, down payments, or dates at any time.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 24, maxWidth: 480 }}>
              {GOAL_OPTS.map((opt) => {
                const active = pickedGoal === opt.key;
                return (
                  <div
                    key={opt.key}
                    onClick={() => setPickedGoal(opt.key)}
                    style={{
                      position: 'relative',
                      background: '#fff',
                      borderRadius: 16,
                      padding: '16px 20px',
                      border: '1px solid rgba(30,37,34,0.07)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.15s ease',
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
                        <div style={{ font: "600 15px 'Spline Sans'", color: '#1E2522' }}>{opt.label}</div>
                        <div style={{ font: "400 12px 'Spline Sans Mono'", color: '#A8AEA8', marginTop: 2 }}>{opt.sub}</div>
                      </div>
                    </div>
                    {active && (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2F7D5B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="11" height="11" viewBox="0 0 12 12">
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
          </div>
        )}

        {/* STEP 5: CONFIRM & SUBMIT */}
        {step === 5 && (
          <div style={{ marginTop: 12 }}>
            <h2 style={{ font: "400 32px/1.22 'Newsreader'", color: '#1E2522', letterSpacing: '-0.01em' }}>
              Your Stride profile is ready.
            </h2>
            <div style={{ font: "400 15px/1.55 'Spline Sans'", color: '#5C645F', marginTop: 11, maxWidth: 430 }}>
              Let’s review the dashboard setup before building your dynamic projection.
            </div>
            <div style={{
              background: '#fff',
              border: '1.5px solid rgba(30,37,34,0.07)',
              borderRadius: 16,
              padding: '24px',
              maxWidth: 480,
              marginTop: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(30,37,34,0.06)', paddingBottom: 12 }}>
                <span style={{ font: "500 12px 'Spline Sans Mono'", color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Demographics</span>
                <span style={{ font: "600 14px 'Spline Sans'", color: '#1E2522' }}>{age} years old</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(30,37,34,0.06)', paddingBottom: 12 }}>
                <span style={{ font: "500 12px 'Spline Sans Mono'", color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Take-home Salary</span>
                <span style={{ font: "600 14px 'Spline Sans'", color: '#2F7D5B' }}>${income.toLocaleString()} / mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(30,37,34,0.06)', paddingBottom: 12 }}>
                <span style={{ font: "500 12px 'Spline Sans Mono'", color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Estimated Spending</span>
                <span style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)' }}>${expenses.toLocaleString()} / mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(30,37,34,0.06)', paddingBottom: 12 }}>
                <span style={{ font: "500 12px 'Spline Sans Mono'", color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Net Cashflow</span>
                <span style={{ font: "600 14px 'Spline Sans'", color: netSavings >= 0 ? '#2F7D5B' : '#C0463B' }}>
                  +${netSavings.toLocaleString()} / mo
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ font: "500 12px 'Spline Sans Mono'", color: 'var(--ink-faint)', textTransform: 'uppercase' }}>Selected Milestone</span>
                <span style={{ font: "600 14px 'Spline Sans'", color: '#1E2522' }}>
                  {GOAL_OPTS.find(g => g.key === pickedGoal)?.label || 'None'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BUTTONS NAVIGATION */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 32, maxWidth: 480 }}>
          {step > 1 && (
            <div
              onClick={handleBack}
              style={{
                border: '1.5px solid rgba(30,37,34,0.12)',
                background: 'transparent',
                color: '#1E2522',
                borderRadius: 14,
                padding: '14px 24px',
                font: "600 15px 'Spline Sans'",
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Back
            </div>
          )}
          <div
            onClick={handleNext}
            style={{
              background: '#1E2522',
              color: '#fff',
              borderRadius: 14,
              padding: '16px 32px',
              font: "600 16px 'Spline Sans'",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              flex: 1,
            }}
          >
            {step === 5 ? 'Build my forecast' : 'Continue'}
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M3 8h9m0 0l-4-4m4 4l-4 4" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
