import { describe, it, expect } from 'vitest';
import { computeForecast } from './forecast';
import type { IncomeStream, Debt, Goal, Account } from '../types';

describe('computeForecast Simulation Horizon and Broke Line', () => {
  const mockIncome: IncomeStream[] = [
    {
      key: 'i1',
      name: 'Salary',
      glyph: '💼',
      amount: 5000,
      frequency: 'Monthly',
      start: 0,
      duration: null,
      active: true,
      dot: '#2F7D5B',
    },
  ];

  const mockSpending = 3800; // Net cashflow +1200/mo

  const mockDebts: Debt[] = [];
  const mockGoals: Goal[] = [];
  const mockAccounts: Account[] = [
    {
      key: 'a1',
      name: 'Checking',
      glyph: '🏦',
      balance: 10000,
      dot: '#5C7B8A',
    },
  ];

  it('should run simulation for 60 months by default (61 datapoints)', () => {
    const res = computeForecast(mockIncome, mockSpending, mockDebts, mockGoals, mockAccounts);
    expect(res.cur).toHaveLength(61);
    expect(res.baseline).toHaveLength(61);
    // Ending balance should be 10000 + 60 * 1200 = 82000
    expect(res.cur[60]).toBe(82000);
  });

  it('should support a 6-month simulation horizon (7 datapoints)', () => {
    const res = computeForecast(mockIncome, mockSpending, mockDebts, mockGoals, mockAccounts, 6);
    expect(res.cur).toHaveLength(7);
    expect(res.baseline).toHaveLength(7);
    // Ending balance should be 10000 + 6 * 1200 = 17200
    expect(res.cur[6]).toBe(17200);
  });

  it('should support a 12-month simulation horizon (13 datapoints)', () => {
    const res = computeForecast(mockIncome, mockSpending, mockDebts, mockGoals, mockAccounts, 12);
    expect(res.cur).toHaveLength(13);
    expect(res.baseline).toHaveLength(13);
    // Ending balance should be 10000 + 12 * 1200 = 24400
    expect(res.cur[12]).toBe(24400);
  });
});
