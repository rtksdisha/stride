import type { StrideData } from '../types';
import { defaultAccounts, defaultDebts, defaultGoals, defaultIncome } from './defaults';

const STORAGE_KEY = 'stride-data';

export function defaultStrideData(): StrideData {
  return {
    incomeStreams: defaultIncome(),
    spending: 3800,
    accounts: defaultAccounts(),
    debts: defaultDebts(),
    goals: defaultGoals(),
    extraPayment: 200,
    strategy: 'avalanche',
    hasOnboarded: false,
  };
}

export function loadStrideData(): StrideData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStrideData();
    const parsed = JSON.parse(raw);
    return { ...defaultStrideData(), ...parsed };
  } catch {
    return defaultStrideData();
  }
}

export function saveStrideData(data: StrideData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable (e.g. private mode quota) — fail silently, state stays in-memory only
  }
}
