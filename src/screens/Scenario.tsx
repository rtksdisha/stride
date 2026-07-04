import { useStride } from '../state/StrideContext';
import {
  breakEvenPayment,
  debtInterest,
  isDebtGrowing,
  incomeAt,
  incomeTimeframe,
  monthlyEquiv,
  simulateDebts,
  startBalance,
} from '../lib/finance';
import { money, pctLabel, ordinal } from '../lib/format';
import { tintFor } from '../lib/defaults';
import { EditableNumber } from '../components/ui/EditableNumber';
import { Switch } from '../components/ui/Switch';

export function Scenario() {
  const stride = useStride();
  const debts = stride.debts;
  const ava = simulateDebts(debts, stride.extraPayment, 'avalanche');
  const sno = simulateDebts(debts, stride.extraPayment, 'snowball');
  const pick = stride.strategy === 'snowball' ? sno : ava;
  const other = stride.strategy === 'snowball' ? ava : sno;
  const totalDebtNow = debts.filter((d) => d.active !== false).reduce((a, d) => a + (+d.balance || 0), 0);
  const dMonthsLabel = (r: { months: number | null }) =>
    r.months == null ? '60+ mo' : r.months >= 12 ? Math.floor(r.months / 12) + 'y ' + (r.months % 12) + 'm' : r.months + ' mo';
  const hasDebt = totalDebtNow > 0;

  const startBalanceLabel = money(startBalance(stride.accounts));
  const incomeTotalLabel = money(incomeAt(0, stride.incomeStreams));

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '30px 36px 36px', background: '#F8F9F6' }}>
      <div style={{ maxWidth: 1060 }}>
      <div style={{ font: "500 12px 'Spline Sans Mono'", letterSpacing: '0.12em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
        Plan · Inputs
      </div>
      <div style={{ font: "600 27px/1 'Spline Sans'", color: 'var(--ink)', marginTop: 6, letterSpacing: '-0.01em' }}>
        Configure your financial baseline
      </div>
      <div style={{ marginTop: 22, display: 'flex', gap: 24 }}>
        
        {/* LEFT COLUMN: INCOME & EXPENSES/DEBTS */}
        <div style={{ flex: 1.2, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* INCOME STREAMS */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid rgba(30,37,34,0.06)', boxShadow: '0 12px 24px rgba(30,37,34,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ font: "600 15px 'Spline Sans'", color: 'var(--ink)' }}>Income Streams</span>
              <div
                onClick={stride.addIncome}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(30,37,34,0.05)', borderRadius: 9, padding: '7px 12px', font: "600 12px 'Spline Sans'", color: 'var(--ink)', cursor: 'pointer' }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14">
                  <path d="M7 1.8v10.4M1.8 7h10.4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                </svg>
                Add income
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {stride.incomeStreams.map((inc) => {
                const isPanel = stride.panel && stride.panel.type === 'income' && stride.panel.key === inc.key;
                const on = inc.active !== false;
                return (
                  <div
                    key={inc.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      background: isPanel ? '#FBFCFA' : '#F6F7F4',
                      border: `1px solid ${isPanel ? 'rgba(47,125,91,0.5)' : 'rgba(30,37,34,0.05)'}`,
                      borderRadius: 13,
                      padding: '11px 12px',
                    }}
                  >
                    <div onClick={() => stride.openPanel('income', inc.key)} style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1, minWidth: 0, cursor: 'pointer', opacity: on ? 1 : 0.45 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: inc.tint || tintFor(inc.dot), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                        {inc.glyph}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)' }}>{inc.name}</div>
                        <div style={{ font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-faint)', marginTop: 1 }}>{incomeTimeframe(inc)}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{money(monthlyEquiv(inc))}</div>
                        <div style={{ font: "400 10px 'Spline Sans Mono'", color: 'var(--ink-faint)' }}>/mo</div>
                      </div>
                    </div>
                    <Switch on={on} onToggle={() => stride.toggleIncome(inc.key)} size="sm" />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 13, borderTop: '1px solid rgba(30,37,34,0.07)' }}>
              <span style={{ font: "400 12px 'Spline Sans'", color: 'var(--ink-faint)' }}>Total monthly income</span>
              <span style={{ font: "600 14px 'Spline Sans'", color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>{incomeTotalLabel}/mo</span>
            </div>
          </div>

          {/* SPENDING & DEBT INPUTS */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '20px', border: '1px solid rgba(30,37,34,0.06)', boxShadow: '0 12px 24px rgba(30,37,34,0.02)' }}>
            <div style={{ font: "600 15px 'Spline Sans'", color: 'var(--ink)', marginBottom: 14 }}>Base Monthly Outflow</div>
            <div style={{ padding: '0 0 16px', borderBottom: '1px solid rgba(30,37,34,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ font: "500 14px 'Spline Sans'", color: 'var(--ink)' }}>Base lifestyle spending</span>
                <span style={{ font: "600 17px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'baseline', justifyContent: 'flex-end' }}>
                  <EditableNumber value={stride.spending} onChange={stride.setSpending} kind="money" min={2000} max={6000} width={80} suffix="/mo" />
                </span>
              </div>
              <input type="range" min={2000} max={6000} step={100} value={stride.spending} onChange={(e) => stride.setSpending(+e.target.value)} style={{ marginTop: 14, display: 'block', width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9, font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-faint-2)' }}>
                <span>$2,000</span>
                <span>$6,000</span>
              </div>
            </div>

            <div style={{ padding: '16px 0 16px', borderBottom: '1px solid rgba(30,37,34,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ font: "500 14px 'Spline Sans'", color: 'var(--ink)' }}>Broke Line threshold</span>
                <span style={{ font: "600 17px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'baseline', justifyContent: 'flex-end' }}>
                  <EditableNumber value={stride.brokeLimit || 0} onChange={(v) => stride.applyStateDelta({ brokeLimit: v })} kind="money" min={0} max={25000} width={80} suffix="" />
                </span>
              </div>
              <input type="range" min={0} max={25000} step={1000} value={stride.brokeLimit || 0} onChange={(e) => stride.applyStateDelta({ brokeLimit: +e.target.value })} style={{ marginTop: 14, display: 'block', width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9, font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-faint-2)' }}>
                <span>$0</span>
                <span>$25,000</span>
              </div>
            </div>

            {/* DEBTS LIST */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 11 }}>
              <span style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)' }}>Active Debts</span>
              <div
                onClick={stride.addDebt}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(30,37,34,0.05)', borderRadius: 9, padding: '6px 11px', font: "600 12px 'Spline Sans'", color: 'var(--ink)', cursor: 'pointer' }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14">
                  <path d="M7 1.8v10.4M1.8 7h10.4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                </svg>
                Add debt
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {debts.map((d) => {
                const isPanel = stride.panel && stride.panel.type === 'debt' && stride.panel.key === d.key;
                const growing = isDebtGrowing(d);
                const on = d.active !== false;
                const interest = debtInterest(d);
                const breakEven = breakEvenPayment(d);
                return (
                  <div
                    key={d.key}
                    style={{
                      background: isPanel ? '#FBFCFA' : '#F6F7F4',
                      border: `1px solid ${isPanel ? 'rgba(47,125,91,0.5)' : growing ? 'rgba(212,107,75,0.35)' : 'rgba(30,37,34,0.05)'}`,
                      borderRadius: 13,
                      padding: '11px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div onClick={() => stride.openPanel('debt', d.key)} style={{ display: 'flex', alignItems: 'center', gap: 11, flex: 1, minWidth: 0, cursor: 'pointer', opacity: on ? 1 : 0.45 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: d.tint || 'rgba(176,114,106,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                          {d.glyph}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)' }}>{d.name}</div>
                          <div style={{ font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-faint)', marginTop: 1 }}>
                            {pctLabel(d.apr)} APR · {money(d.minPayment)}/mo min · due {ordinal(d.paymentDay || 1)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{money(d.balance)}</div>
                          <div style={{ font: "400 10px 'Spline Sans Mono'", color: 'var(--ink-faint)' }}>balance</div>
                        </div>
                      </div>
                      <Switch on={on} onToggle={() => stride.toggleDebt(d.key)} size="sm" />
                    </div>
                    {growing && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 10, background: 'var(--debt-bad-bg)', borderRadius: 10, padding: '9px 11px' }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 1 }}>
                          <path d="M8 1.5l6.5 11.5h-13z" fill="none" stroke="#C0552E" strokeWidth={1.4} strokeLinejoin="round" />
                          <path d="M8 6.2v3.2M8 11.2v.2" stroke="#C0552E" strokeWidth={1.4} strokeLinecap="round" />
                        </svg>
                        <div>
                          <div style={{ font: "600 11.5px 'Spline Sans'", color: 'var(--debt-bad)' }}>This debt is growing</div>
                          <div style={{ font: "400 11px/1.4 'Spline Sans'", color: '#9A5A45', marginTop: 1 }}>
                            Minimum doesn't cover {money(interest)}/mo interest. Pay {money(breakEven)}/mo to break even.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNTS & DEBT REPAYMENT SETTINGS */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* STARTING CASH / ACCOUNTS */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid rgba(30,37,34,0.06)', boxShadow: '0 12px 24px rgba(30,37,34,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ font: "600 15px 'Spline Sans'", color: 'var(--ink)' }}>Accounts & Cash</span>
              <div
                onClick={stride.addAccount}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(92,123,138,0.12)', borderRadius: 9, padding: '7px 12px', font: "600 12px 'Spline Sans'", color: '#5C7B8A', cursor: 'pointer' }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14">
                  <path d="M7 1.8v10.4M1.8 7h10.4" stroke="#5C7B8A" strokeWidth={2} strokeLinecap="round" />
                </svg>
                Add account
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {stride.accounts.map((acct) => {
                const isPanel = stride.panel && stride.panel.type === 'account' && stride.panel.key === acct.key;
                return (
                  <div
                    key={acct.key}
                    onClick={() => stride.openPanel('account', acct.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      background: isPanel ? '#FBFCFA' : '#F6F7F4',
                      border: `1px solid ${isPanel ? 'rgba(47,125,91,0.5)' : 'rgba(30,37,34,0.05)'}`,
                      borderRadius: 13,
                      padding: '11px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: acct.tint || tintFor(acct.dot), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                      {acct.glyph}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, font: "600 14px 'Spline Sans'", color: 'var(--ink)' }}>{acct.name}</div>
                    <div style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{money(acct.balance)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 13, borderTop: '1px solid rgba(30,37,34,0.07)' }}>
              <span style={{ font: "400 12px 'Spline Sans'", color: 'var(--ink-faint)' }}>Total starting balance</span>
              <span style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{startBalanceLabel}</span>
            </div>
          </div>

          {/* DEBT PAYDOWN STRATEGY */}
          {hasDebt && (
            <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid rgba(30,37,34,0.06)', boxShadow: '0 12px 24px rgba(30,37,34,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ font: "600 15px 'Spline Sans'", color: 'var(--ink)' }}>Paydown Optimizer</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div
                    onClick={() => stride.setStrategy('avalanche')}
                    title="Targets highest interest rate APR debts first to save you the most money."
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      font: "600 11px 'Spline Sans'",
                      background: stride.strategy === 'avalanche' ? '#fff' : 'transparent',
                      color: stride.strategy === 'avalanche' ? 'var(--ink)' : '#7B827D',
                      border: `1.5px solid ${stride.strategy === 'avalanche' ? 'rgba(47,125,91,0.55)' : 'rgba(30,37,34,0.1)'}`,
                    }}
                  >
                    Avalanche
                  </div>
                  <div
                    onClick={() => stride.setStrategy('snowball')}
                    title="Targets smallest balance debts first to build momentum with quick wins."
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      font: "600 11px 'Spline Sans'",
                      background: stride.strategy === 'snowball' ? '#fff' : 'transparent',
                      color: stride.strategy === 'snowball' ? 'var(--ink)' : '#7B827D',
                      border: `1.5px solid ${stride.strategy === 'snowball' ? 'rgba(47,125,91,0.55)' : 'rgba(30,37,34,0.1)'}`,
                    }}
                  >
                    Snowball
                  </div>
                </div>
              </div>
              <div style={{ font: "400 12px/1.45 'Spline Sans'", color: 'var(--ink-faint)', marginTop: 9, background: '#F8F9F6', borderRadius: 10, padding: '9px 12px', border: '1px solid rgba(30,37,34,0.03)' }}>
                {stride.strategy === 'avalanche' ? (
                  <span><strong>⚡ Avalanche mode</strong> targets your highest interest rate (APR) debts first. This is mathematically optimal and minimizes your total interest paid.</span>
                ) : (
                  <span><strong>❄️ Snowball mode</strong> targets your smallest balance debts first. This builds psychological momentum by knocking out individual loans quickly.</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, background: '#F6F7F4', borderRadius: 13, padding: '11px 14px' }}>
                <div>
                  <span style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.06em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                    Extra monthly payment
                  </span>
                  <div style={{ font: "600 16px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', marginTop: 1, display: 'inline-flex', alignItems: 'baseline' }}>
                    <EditableNumber value={stride.extraPayment} onChange={stride.setExtraPayment} kind="money" min={0} max={1500} width={65} suffix="/mo" />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1500}
                  step={50}
                  value={stride.extraPayment}
                  onChange={(e) => stride.setExtraPayment(+e.target.value)}
                  style={{ width: 140 }}
                />
              </div>

              {/* STRATEGY STATS SUMMARY */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                <div style={{ background: 'rgba(47,125,91,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.05em', color: 'var(--green)', textTransform: 'uppercase' }}>
                    {stride.strategy === 'snowball' ? 'Snowball' : 'Avalanche'} (Active)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ font: "600 22px 'Newsreader'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{dMonthsLabel(pick)}</span>
                    <span style={{ font: "400 11px 'Spline Sans'", color: 'var(--ink-dim)' }}>to debt-free</span>
                  </div>
                  <div style={{ font: "400 11px 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 2 }}>{money(pick.totalInterest)} total interest</div>
                </div>

                <div style={{ background: '#F6F7F4', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.05em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                    Alternative: {stride.strategy === 'snowball' ? 'Avalanche' : 'Snowball'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ font: "600 22px 'Newsreader'", color: 'var(--ink-dim)', fontVariantNumeric: 'tabular-nums' }}>{dMonthsLabel(other)}</span>
                    <span style={{ font: "400 11px 'Spline Sans'", color: 'var(--ink-faint)' }}>to debt-free</span>
                  </div>
                  <div style={{ font: "400 11px 'Spline Sans'", color: 'var(--ink-faint)', marginTop: 2 }}>{money(other.totalInterest)} total interest</div>
                </div>
              </div>
            </div>
          )}
          
          <div onClick={stride.resetScenario} style={{ font: "500 12px 'Spline Sans'", color: 'var(--ink-faint)', cursor: 'pointer', textAlign: 'center', padding: '6px 0' }}>
            Reset to default settings
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
