import { useState } from 'react';
import { useStride } from '../state/StrideContext';
import type { ForecastResult } from '../lib/forecast';
import { HORIZON } from '../lib/forecast';
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
import { fmt, money, monthLabel, ordinal, pctLabel } from '../lib/format';
import { tintFor } from '../lib/defaults';
import { Chart } from '../components/Chart';
import { DebtCompareChart } from '../components/DebtCompareChart';
import { EditableNumber } from '../components/ui/EditableNumber';
import { Switch } from '../components/ui/Switch';

export function Scenario({ forecast }: { forecast: ForecastResult }) {
  const stride = useStride();
  const [hover, setHover] = useState<number | null>(null);
  const [dHover, setDHover] = useState<number | null>(null);
  const { cur, baseline, markers } = forecast;
  const N = HORIZON;

  const endDiff = cur[N - 1] - baseline[N - 1];
  const activeWhatIfs = stride.goals.filter((g) => g.status === 'active').length;
  const insightAmt = (endDiff >= 0 ? '+' : '−') + fmt(Math.abs(endDiff)).replace('-', '');
  const insightTone = endDiff > 0 ? 'var(--green)' : endDiff < 0 ? 'var(--amber)' : 'var(--ink-dim)';
  const insightBg = endDiff > 0 ? 'var(--green-bg)' : endDiff < 0 ? 'var(--amber-bg)' : 'rgba(30,37,34,0.05)';
  const insightStatus = activeWhatIfs === 0 ? 'No what-ifs active' : activeWhatIfs + (activeWhatIfs === 1 ? ' what-if on' : ' what-ifs on');
  const insightSub =
    activeWhatIfs === 0
      ? 'Toggle a milestone on to see how it bends your forecast against the committed baseline.'
      : 'Net-worth difference at ' + monthLabel(N - 1) + ' between your baseline and the what-ifs you have switched on.';

  const debts = stride.debts;
  const ava = simulateDebts(debts, stride.extraPayment, 'avalanche');
  const sno = simulateDebts(debts, stride.extraPayment, 'snowball');
  const baseNoExtra = simulateDebts(debts, 0, 'avalanche');
  const pick = stride.strategy === 'snowball' ? sno : ava;
  const other = stride.strategy === 'snowball' ? ava : sno;
  const totalDebtNow = debts.filter((d) => d.active !== false).reduce((a, d) => a + (+d.balance || 0), 0);
  const dMonthsLabel = (r: { months: number | null }) =>
    r.months == null ? '60+ mo' : r.months >= 12 ? Math.floor(r.months / 12) + 'y ' + (r.months % 12) + 'm' : r.months + ' mo';
  const hasDebt = totalDebtNow > 0;

  const startBalanceLabel = money(startBalance(stride.accounts));
  const incomeTotalLabel = money(incomeAt(0, stride.incomeStreams));

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '30px 36px 36px' }}>
      <div style={{ font: "500 12px 'Spline Sans Mono'", letterSpacing: '0.12em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
        Plan · what-if
      </div>
      <div style={{ font: "600 27px/1 'Spline Sans'", color: 'var(--ink)', marginTop: 6, letterSpacing: '-0.01em' }}>
        Adjust the plan, watch it react
      </div>
      <div className="scenario-cols" style={{ marginTop: 22 }}>
        <div style={{ flex: 1.5, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: insightBg, borderRadius: 20, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: insightTone }} />
              <span style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.08em', color: insightTone, textTransform: 'uppercase' }}>
                {insightStatus}
              </span>
            </div>
            <div style={{ font: "400 34px/1.05 'Newsreader'", color: 'var(--ink)', marginTop: 10, fontVariantNumeric: 'tabular-nums' }}>
              {insightAmt} <span style={{ fontSize: 17, color: 'var(--ink-dim)' }}>from your what-ifs</span>
            </div>
            <div style={{ font: "400 14px/1.5 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 6 }}>{insightSub}</div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 22, border: '1px solid rgba(30,37,34,0.06)', boxShadow: '0 18px 36px rgba(30,37,34,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 16, height: 3, borderRadius: 3, background: 'var(--green)' }} />
                <span style={{ font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-dim)' }}>With your what-ifs</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 16, height: 0, borderTop: '2px dashed #B6BCB6' }} />
                <span style={{ font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-faint)' }}>Baseline · committed only</span>
              </div>
            </div>
            <Chart series={cur} height={210} id="scen" baseline={baseline} markers={markers} hover={hover} onHover={setHover} />
          </div>

          {hasDebt && (
            <div style={{ background: '#fff', borderRadius: 20, padding: 22, border: '1px solid rgba(30,37,34,0.06)', boxShadow: '0 18px 36px rgba(30,37,34,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ font: "600 16px 'Spline Sans'", color: 'var(--ink)' }}>Pay debt down faster</div>
                  <div style={{ font: "400 13px 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 3 }}>
                    {money(totalDebtNow)} across your active debts. Compare two payoff strategies.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <div
                    onClick={() => stride.setStrategy('avalanche')}
                    style={{
                      padding: '8px 13px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      font: "600 12px 'Spline Sans'",
                      background: stride.strategy === 'avalanche' ? '#fff' : 'transparent',
                      color: stride.strategy === 'avalanche' ? 'var(--ink)' : '#7B827D',
                      border: `1.5px solid ${stride.strategy === 'avalanche' ? 'rgba(47,125,91,0.55)' : 'rgba(30,37,34,0.1)'}`,
                    }}
                  >
                    Avalanche
                  </div>
                  <div
                    onClick={() => stride.setStrategy('snowball')}
                    style={{
                      padding: '8px 13px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      font: "600 12px 'Spline Sans'",
                      background: stride.strategy === 'snowball' ? '#fff' : 'transparent',
                      color: stride.strategy === 'snowball' ? 'var(--ink)' : '#7B827D',
                      border: `1.5px solid ${stride.strategy === 'snowball' ? 'rgba(47,125,91,0.55)' : 'rgba(30,37,34,0.1)'}`,
                    }}
                  >
                    Snowball
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, background: '#F6F7F4', borderRadius: 13, padding: '13px 16px' }}>
                <div>
                  <span style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.06em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                    Extra toward debt
                  </span>
                  <div style={{ font: "600 18px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', marginTop: 2, display: 'inline-flex', alignItems: 'baseline' }}>
                    <EditableNumber value={stride.extraPayment} onChange={stride.setExtraPayment} kind="money" min={0} max={1500} width={74} suffix="/mo" />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1500}
                  step={50}
                  value={stride.extraPayment}
                  onChange={(e) => stride.setExtraPayment(+e.target.value)}
                  style={{ width: 170 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '16px 0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 16, height: 3, borderRadius: 3, background: 'var(--green)' }} />
                  <span style={{ font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-dim)' }}>Avalanche</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 16, height: 3, borderRadius: 3, background: '#8A6FB0' }} />
                  <span style={{ font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-dim)' }}>Snowball</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 16, height: 0, borderTop: '2px dashed #B6BCB6' }} />
                  <span style={{ font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-faint)' }}>Minimums only</span>
                </div>
              </div>
              <DebtCompareChart avaSeries={ava.series} snoSeries={sno.series} minSeries={baseNoExtra.series} strategy={stride.strategy} hover={dHover} onHover={setDHover} />
              <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                <div style={{ flex: 1, background: 'rgba(47,125,91,0.07)', borderRadius: 14, padding: '15px 16px' }}>
                  <div style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.05em', color: 'var(--green)', textTransform: 'uppercase' }}>
                    {stride.strategy === 'snowball' ? 'Snowball' : 'Avalanche'} · your pick
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                    <span style={{ font: "400 27px 'Newsreader'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{dMonthsLabel(pick)}</span>
                    <span style={{ font: "400 12px 'Spline Sans'", color: 'var(--ink-dim)' }}>to debt-free</span>
                  </div>
                  <div style={{ font: "400 12px 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 4 }}>{money(pick.totalInterest)} total interest</div>
                  <div style={{ font: "400 12px/1.4 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 7 }}>
                    {stride.strategy === 'snowball'
                      ? 'Clears the smallest balance first — quick wins for momentum.'
                      : 'Targets the highest APR first — least interest paid overall.'}
                  </div>
                </div>
                <div style={{ flex: 1, background: '#F6F7F4', borderRadius: 14, padding: '15px 16px' }}>
                  <div style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.05em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                    {stride.strategy === 'snowball' ? 'Avalanche' : 'Snowball'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                    <span style={{ font: "400 27px 'Newsreader'", color: 'var(--ink-dim)', fontVariantNumeric: 'tabular-nums' }}>{dMonthsLabel(other)}</span>
                    <span style={{ font: "400 12px 'Spline Sans'", color: 'var(--ink-faint)' }}>to debt-free</span>
                  </div>
                  <div style={{ font: "400 12px 'Spline Sans'", color: 'var(--ink-faint)', marginTop: 4 }}>{money(other.totalInterest)} total interest</div>
                  <div style={{ font: "400 12px/1.4 'Spline Sans'", color: 'var(--green)', marginTop: 7, fontWeight: 600 }}>
                    {money(Math.max(0, baseNoExtra.totalInterest - pick.totalInterest))} saved vs. minimums alone
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="scenario-side" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid rgba(30,37,34,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ font: "600 15px 'Spline Sans'", color: 'var(--ink)' }}>Accounts today</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
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
              <span style={{ font: "400 12px 'Spline Sans'", color: 'var(--ink-faint)' }}>Starting balance today</span>
              <span style={{ font: "600 14px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{startBalanceLabel}</span>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid rgba(30,37,34,0.06)' }}>
            <div
              onClick={stride.addIncome}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(47,125,91,0.09)', borderRadius: 9, padding: '7px 12px', font: "600 12px 'Spline Sans'", color: 'var(--green)', cursor: 'pointer' }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14">
                <path d="M7 1.8v10.4M1.8 7h10.4" stroke="#2F7D5B" strokeWidth={2} strokeLinecap="round" />
              </svg>
              Add income
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
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
              <span style={{ font: "400 12px 'Spline Sans'", color: 'var(--ink-faint)' }}>Coming in this month</span>
              <span style={{ font: "600 14px 'Spline Sans'", color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>{incomeTotalLabel}/mo</span>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: '6px 20px 16px', border: '1px solid rgba(30,37,34,0.06)' }}>
            <div style={{ padding: '16px 0 0', font: "600 15px 'Spline Sans'", color: 'var(--ink)' }}>Money out</div>
            <div style={{ padding: '14px 0 16px', borderBottom: '1px solid rgba(30,37,34,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ font: "500 14px 'Spline Sans'", color: 'var(--ink)' }}>Monthly spending</span>
                <span style={{ font: "600 17px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'baseline', justifyContent: 'flex-end' }}>
                  <EditableNumber value={stride.spending} onChange={stride.setSpending} kind="money" min={2000} max={6000} width={80} suffix="/mo" />
                </span>
              </div>
              <input type="range" min={2000} max={6000} step={100} value={stride.spending} onChange={(e) => stride.setSpending(+e.target.value)} style={{ marginTop: 14, display: 'block' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9, font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-faint-2)' }}>
                <span>$2k</span>
                <span>$6k</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 }}>
              <span style={{ font: "600 13px 'Spline Sans'", color: 'var(--ink)' }}>Debts</span>
              <div
                onClick={stride.addDebt}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(176,114,106,0.1)', borderRadius: 9, padding: '6px 11px', font: "600 12px 'Spline Sans'", color: '#B0726A', cursor: 'pointer' }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14">
                  <path d="M7 1.8v10.4M1.8 7h10.4" stroke="#B0726A" strokeWidth={2} strokeLinecap="round" />
                </svg>
                Add debt
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 11 }}>
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
            <div onClick={stride.resetScenario} style={{ marginTop: 14, textAlign: 'center', font: "500 13px 'Spline Sans'", color: 'var(--ink-faint)', cursor: 'pointer', padding: 4 }}>
              Reset to starting plan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
