import type { Account, Debt, Goal, IncomeStream } from '../types';
import { buildSeries, debtOutflow, mFirstWord, mMonth, milestoneEvents, startBalance, steadyIncome } from './finance';
import type { ChartMarker } from '../components/Chart';

export const HORIZON_MONTHS = 60;
export const HORIZON = HORIZON_MONTHS + 1;

export interface ForecastResult {
  cur: number[];
  baseline: number[];
  net: number;
  firstNeg: number;
  lowest: number;
  markers: ChartMarker[];
}

export function computeForecast(
  streams: IncomeStream[],
  spending: number,
  debts: Debt[],
  goals: Goal[],
  accounts: Account[],
  horizonMonths: number = 60
): ForecastResult {
  const horizon = horizonMonths + 1;
  const startBal = startBalance(accounts);
  const cur = buildSeries(streams, spending, debts, goals, ['committed', 'active'], horizon, startBal);
  const baseline = buildSeries(streams, spending, debts, goals, ['committed'], horizon, startBal);
  const net = steadyIncome(streams) - spending - debtOutflow(debts);
  const firstNeg = cur.findIndex((v) => v < 0);
  const lowest = Math.min(...cur);
  const shownGoals = goals.filter((g) => g.status !== 'inactive');
  const markers: ChartMarker[] = shownGoals.map((g) => {
    const ev = milestoneEvents(g, streams, horizon);
    let oneTime = 0;
    for (const o of ev.oneTimes) oneTime += o.amt;
    
    const isTpl = g.kind === 'template';
    let ahead = 0;
    if (!isTpl) {
      const remaining = Math.max(0, g.amount - g.saved);
      const monthlyToward = Math.max(120, Math.round(net * (g.ratio || 0.5)));
      const monthsNeeded = monthlyToward > 0 ? Math.ceil(remaining / monthlyToward) : 99;
      ahead = Math.round(g.month) - monthsNeeded;
    }

    return {
      m: mMonth(g),
      label: mFirstWord(g),
      color: g.dot,
      glyph: g.glyph,
      amount: oneTime,
      ahead,
    };
  });
  return { cur, baseline, net, firstNeg, lowest, markers };
}
