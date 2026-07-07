import type {
  Account,
  Debt,
  Goal,
  GoalStatus,
  IncomeStream,
  MilestoneEvents,
} from '../types';
import { monthLabel, money } from './format';

export const PER_MONTH: Record<string, number> = {
  Weekly: 52 / 12,
  Biweekly: 26 / 12,
  'Semi-monthly': 2,
  Monthly: 1,
  Quarterly: 1 / 3,
  Annual: 1 / 12,
  'One-time': 0,
};

// Standard loan amortization payment for a fixed-rate, fixed-term loan.
export function amort(principal: number, aprPct: number, months: number): number {
  principal = Math.max(0, principal);
  months = Math.round(months);
  if (months <= 0) return 0;
  const r = aprPct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function monthlyEquiv(stream: IncomeStream): number {
  return (+stream.amount || 0) * (PER_MONTH[stream.frequency] ?? 1);
}

export function incomeAt(i: number, streams: IncomeStream[]): number {
  let sum = 0;
  for (const s of streams) {
    if (s.active === false) continue;
    const st = Math.round(s.start);
    const within = i >= st && (s.duration == null || i < st + Math.round(s.duration));
    if (!within) continue;
    if (s.frequency === 'One-time') {
      if (i === st) sum += +s.amount || 0;
    } else sum += monthlyEquiv(s);
  }
  return sum;
}

export function steadyIncome(streams: IncomeStream[]): number {
  return incomeAt(0, streams);
}

export function debtOutflow(debts: Debt[]): number {
  let sum = 0;
  for (const d of debts) {
    if (d.active === false) continue;
    sum += +d.minPayment || 0;
  }
  return sum;
}

export function debtInterest(d: Debt): number {
  return ((+d.balance || 0) * (+d.apr || 0)) / 100 / 12;
}

export function isDebtGrowing(d: Debt): boolean {
  return debtInterest(d) > (+d.minPayment || 0) + 0.5;
}

export function breakEvenPayment(d: Debt): number {
  return Math.ceil(debtInterest(d) / 5) * 5;
}

export function startBalance(accounts: Account[], fallback = 8200): number {
  if (!accounts || !accounts.length) return fallback;
  return accounts.reduce((s, x) => s + (+x.balance || 0), 0);
}

export function incomeTimeframe(s: IncomeStream): string {
  const start = Math.round(s.start);
  const freq = s.frequency && s.frequency !== 'Monthly' ? s.frequency : null;
  let base: string;
  if (s.duration == null) {
    base = start === 0 ? 'Ongoing' : 'From ' + monthLabel(start);
  } else {
    const dur = Math.round(s.duration);
    base = dur + (dur === 1 ? ' mo' : ' mos') + ' · ' + monthLabel(start);
  }
  return freq ? freq + ' · ' + base : base;
}

export function mMonth(g: Goal): number {
  if (g.kind !== 'template') return Math.round(g.month ?? 0);
  if (g.template === 'custom') {
    const prims = g.params?.prims || [];
    if (prims.length === 0) return 0;
    return Math.min(...prims.map((pr) => Math.round(pr.month || 0)));
  }
  return Math.round(((g.params?.month as number) ?? 0));
}

export function mFirstWord(g: Goal): string {
  const w = (g.name || '').split(' ')[0];
  return w === 'New' ? g.name.split(' ')[1] || 'Goal' : w;
}

// Net cash outflow events for a milestone (amt > 0 reduces balance).
export function milestoneEvents(g: Goal, streams: IncomeStream[], horizon: number): MilestoneEvents {
  const oneTimes: MilestoneEvents['oneTimes'] = [];
  const recurrings: MilestoneEvents['recurrings'] = [];
  if (g.kind !== 'template') {
    oneTimes.push({ m: Math.round(g.month), amt: g.amount });
    return { oneTimes, recurrings };
  }
  const p = g.params || {};
  const m = Math.round((p.month as number) || 0);
  if (g.template === 'buy_car') {
    const principal = Math.max(0, (+(p.price as number) || 0) - (+(p.down as number) || 0) - (+(p.tradeIn as number) || 0));
    const pay = amort(principal, +(p.apr as number) || 0, +(p.term as number) || 1);
    oneTimes.push({ m, amt: +(p.down as number) || 0 });
    if (+(p.tradeIn as number)) oneTimes.push({ m, amt: -(+(p.tradeIn as number)) });
    recurrings.push({ from: m + 1, to: m + 1 + Math.round(+(p.term as number) || 0), amt: pay });
    recurrings.push({ from: m, to: horizon, amt: +(p.insurance as number) || 0 });
    recurrings.push({ from: m, to: horizon, amt: +(p.gas as number) || 0 });
  } else if (g.template === 'buy_house') {
    const months = Math.round((+(p.amortYears as number) || 30) * 12);
    const principal = Math.max(0, (+(p.price as number) || 0) - (+(p.down as number) || 0));
    const pay = amort(principal, +(p.apr as number) || 0, months);
    oneTimes.push({ m, amt: +(p.down as number) || 0 });
    oneTimes.push({ m, amt: ((+(p.price as number) || 0) * (+(p.closingPct as number) || 0)) / 100 });
    recurrings.push({ from: m + 1, to: m + 1 + months, amt: pay });
    recurrings.push({ from: m, to: horizon, amt: ((+(p.price as number) || 0) * (+(p.taxPct as number) || 0)) / 100 / 12 });
    recurrings.push({ from: m, to: horizon, amt: +(p.insurance as number) || 0 });
    recurrings.push({ from: m, to: horizon, amt: ((+(p.price as number) || 0) * (+(p.maintPct as number) || 0)) / 100 / 12 });
    if (+(p.hoa as number)) recurrings.push({ from: m, to: horizon, amt: +(p.hoa as number) });
  } else if (g.template === 'sabbatical') {
    const dur = Math.round(+(p.duration as number) || 6);
    const src = (streams || []).find((x) => x.key === p.pauseKey);
    const paused = src ? monthlyEquiv(src) : 0;
    recurrings.push({ from: m, to: m + dur, amt: paused });
    recurrings.push({ from: m, to: m + dur, amt: +(p.travel as number) || 0 });
    recurrings.push({ from: m, to: m + dur, amt: +(p.healthcare as number) || 0 });
  } else if (g.template === 'wedding') {
    oneTimes.push({ m, amt: +(p.price as number) || 0 });
    if (+(p.contribution as number)) {
      oneTimes.push({ m, amt: -(+(p.contribution as number)) });
    }
  } else if (g.template === 'savings_goal') {
    // No target-date deduction (since it is a savings bucket, not a payment/purchase)
    // Instead, support recurring/lump-sum positive contributions (negative outflows)
    if (+(p.monthlyContribution as number)) {
      recurrings.push({ from: 0, to: m, amt: -(+(p.monthlyContribution as number)) });
    }
    if (+(p.initialDeposit as number)) {
      oneTimes.push({ m: 0, amt: -(+(p.initialDeposit as number)) });
    }
  } else if (g.template === 'custom') {
    for (const pr of p.prims || []) {
      const pm = Math.round(pr.month || 0);
      if (pr.kind === 'once') oneTimes.push({ m: pm, amt: pr.amt || 0 });
      else if (pr.kind === 'recur') recurrings.push({ from: pm, to: pm + Math.round(pr.months || 1), amt: pr.amt || 0 });
      else if (pr.kind === 'loan') {
        const pay = amort(pr.principal || 0, pr.apr || 0, pr.term || 1);
        recurrings.push({ from: pm + 1, to: pm + 1 + Math.round(pr.term || 0), amt: pay });
      }
    }
  }
  return { oneTimes, recurrings };
}

export interface MilestoneSummary {
  oneTime: number;
  monthlyNow: number;
  monthlyPeak: number;
}

export function milestoneSummary(g: Goal, streams: IncomeStream[], horizon: number): MilestoneSummary {
  const ev = milestoneEvents(g, streams, horizon);
  let oneTime = 0;
  for (const o of ev.oneTimes) oneTime += o.amt;
  let monthlyNow = 0,
    monthlyPeak = 0;
  const startMonth = mMonth(g);
  for (let i = startMonth; i < horizon; i++) {
    let mo = 0;
    for (const r of ev.recurrings) if (i >= r.from && i < r.to) mo += r.amt;
    if (i === startMonth) monthlyNow = mo;
    monthlyPeak = Math.max(monthlyPeak, mo);
  }
  return { oneTime, monthlyNow, monthlyPeak };
}

export function buildSeries(
  streams: IncomeStream[],
  spending: number,
  debts: Debt[],
  goals: Goal[],
  statuses: GoalStatus[],
  horizon: number,
  startBal: number,
  onlyGoalKey?: string,
  excludeGoalKey?: string
): number[] {
  const arr: number[] = [];
  let bal = startBal;
  const debtOut = debtOutflow(debts);
  const active = goals.filter((g) => {
    if (excludeGoalKey && g.key === excludeGoalKey) return false;
    if (onlyGoalKey) {
      return g.status === 'committed' || g.key === onlyGoalKey;
    }
    return statuses.indexOf(g.status) >= 0;
  });
  const evs = active.map((g) => milestoneEvents(g, streams, horizon));
  for (let i = 0; i < horizon; i++) {
    if (i > 0) bal += incomeAt(i, streams) - spending - debtOut;
    for (const ev of evs) {
      for (const o of ev.oneTimes) if (o.m === i) bal -= o.amt;
      for (const r of ev.recurrings) if (i >= r.from && i < r.to) bal -= r.amt;
    }
    arr.push(bal);
  }
  return arr;
}

export interface DebtSimResult {
  months: number | null;
  totalInterest: number;
  series: number[];
}

// Simulate paying down debts under a strategy with an extra monthly budget.
export function simulateDebts(debts: Debt[], extra: number, strategy: 'avalanche' | 'snowball'): DebtSimResult {
  let bals = debts
    .filter((d) => d.active !== false && (+d.balance || 0) > 0)
    .map((d) => ({ apr: +d.apr || 0, min: +d.minPayment || 0, bal: +d.balance || 0 }));
  const series: number[] = [];
  let totalInterest = 0;
  let month = 0;
  const MAX = 600;
  const start = bals.reduce((s, d) => s + d.bal, 0);
  series.push(start);
  while (bals.some((d) => d.bal > 0.5) && month < MAX) {
    month++;
    let budget = bals.reduce((s, d) => s + (d.bal > 0.5 ? d.min : 0), 0) + extra;
    for (const d of bals) {
      if (d.bal <= 0.5) continue;
      const interest = (d.bal * d.apr) / 100 / 12;
      d.bal += interest;
      totalInterest += interest;
    }
    let order = bals.filter((d) => d.bal > 0.5).slice();
    order.sort((a, b) => (strategy === 'snowball' ? a.bal - b.bal : b.apr - a.apr));
    for (const d of order) {
      if (budget <= 0) break;
      const pay = Math.min(budget, d.bal);
      d.bal -= pay;
      budget -= pay;
    }
    series.push(bals.reduce((s, d) => s + Math.max(0, d.bal), 0));
  }
  return { months: month >= MAX ? null : month, totalInterest, series };
}

export interface GoalMetrics {
  monthlyToward: number;
  remaining: number;
  monthsNeeded: number;
  ahead: number;
  tone: string;
  pillBg: string;
  statusLabel: string;
  hitDate: string;
  pct: number;
  sub: string;
}

export function metrics(g: { amount: number; saved: number; ratio: number; month: number }, net: number): GoalMetrics {
  const monthlyToward = Math.max(120, Math.round(net * (g.ratio || 0.5)));
  const remaining = Math.max(0, g.amount - g.saved);
  const monthsNeeded = monthlyToward > 0 ? Math.ceil(remaining / monthlyToward) : 99;
  const ahead = Math.round(g.month) - monthsNeeded;
  const tone = ahead >= 0 ? '#2F7D5B' : '#C0792E';
  const pct = Math.max(0, Math.min(100, Math.round((g.saved / g.amount) * 100)));
  return {
    monthlyToward,
    remaining,
    monthsNeeded,
    ahead,
    tone,
    pct,
    pillBg: ahead >= 0 ? 'rgba(47,125,91,0.1)' : 'rgba(192,121,46,0.12)',
    statusLabel: ahead >= 0 ? (ahead === 0 ? 'Right on time' : ahead + ' months early') : Math.abs(ahead) + ' months behind',
    hitDate: monthLabel(monthsNeeded),
    sub:
      ahead >= 0
        ? 'At ' +
          money(monthlyToward) +
          '/mo set aside, you clear the ' +
          money(g.amount) +
          ' target ' +
          (ahead === 0 ? 'right on schedule' : 'ahead of your ' + monthLabel(g.month) + ' date') +
          '.'
        : 'At ' + money(monthlyToward) + '/mo you fall short of your ' + monthLabel(g.month) + ' date. Trim spending or move the date out.',
  };
}
