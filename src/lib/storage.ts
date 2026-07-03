import type { StrideData } from '../types';
import { defaultAccounts, defaultDebts, defaultGoals, defaultIncome } from './defaults';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const GUEST_KEY = 'stride-data-guest';

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
    horizonMonths: 60,
    brokeLimit: 0,
  };
}

export function loadGuestData(): StrideData {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return defaultStrideData();
    return { ...defaultStrideData(), ...JSON.parse(raw) };
  } catch {
    return defaultStrideData();
  }
}

export function saveGuestData(data: StrideData): void {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(data));
  } catch {}
}

export async function loadUserData(uid: string): Promise<StrideData> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const saved = snap.data().strideData;
      if (saved) return { ...defaultStrideData(), ...saved };
    }
    return defaultStrideData();
  } catch (e) {
    console.warn('Firestore load failed, using defaults:', e);
    return defaultStrideData();
  }
}

export async function saveUserData(uid: string, data: StrideData): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), { strideData: data }, { merge: true });
  } catch (e) {
    console.warn('Firestore save failed:', e);
  }
}

export function loadStrideData(): StrideData {
  return loadGuestData();
}

export function saveStrideData(data: StrideData): void {
  saveGuestData(data);
}
