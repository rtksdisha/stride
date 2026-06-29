import type { Account, Debt, Goal, IncomeStream } from '../types';
import { buildSeries, debtOutflow, mFirstWord, mMonth, startBalance, steadyIncome } from './finance';
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
  accounts: Account[]
): ForecastResult {
  const startBal = startBalance(accounts);
  const cur = buildSeries(streams, spending, debts, goals, ['committed', 'active'], HORIZON, startBal);
  const baseline = buildSeries(streams, spending, debts, goals, ['committed'], HORIZON, startBal);
  const net = steadyIncome(streams) - spending - debtOutflow(debts);
  const firstNeg = cur.findIndex((v) => v < 0);
  const lowest = Math.min(...cur);
  const shownGoals = goals.filter((g) => g.status !== 'inactive');
  const markers: ChartMarker[] = shownGoals.map((g) => ({ m: mMonth(g), label: mFirstWord(g), color: g.dot }));
  return { cur, baseline, net, firstNeg, lowest, markers };
}
