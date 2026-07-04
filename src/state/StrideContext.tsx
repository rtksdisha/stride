import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type {
  Account,
  Debt,
  Draft,
  Goal,
  IncomeStream,
  PanelRef,
  PanelType,
  StrideData,
  TemplateKey,
  UserProfile,
} from '../types';
import { defaultDebts, defaultGoals, defaultIncome, templateDefs, templateParamDefaults, tintFor } from '../lib/defaults';
import { loadGuestData, saveGuestData, loadUserData, saveUserData } from '../lib/storage';
import { onAuthChange, logOutUser } from '../lib/auth';

interface StrideContextValue extends StrideData {
  panel: PanelRef | null;
  draft: Draft | null;
  user: UserProfile | null;
  authReady: boolean;

  setSpending: (v: number) => void;
  setExtraPayment: (v: number) => void;
  setStrategy: (s: 'avalanche' | 'snowball') => void;
  completeOnboarding: () => void;
  resetScenario: () => void;
  logOut: () => Promise<void>;

  setIncomeField: (key: string, field: string, value: unknown) => void;
  setDebtField: (key: string, field: string, value: unknown) => void;
  setAccountField: (key: string, field: string, value: unknown) => void;
  setGoalField: (key: string, field: string, value: unknown) => void;
  setMilestoneParam: (key: string, field: string, value: unknown) => void;

  toggleIncome: (key: string) => void;
  toggleDebt: (key: string) => void;
  toggleGoal: (key: string) => void;

  removeEntity: (type: 'income' | 'debt' | 'account' | 'goal', key: string) => void;

  openPanel: (type: PanelType, key: string) => void;
  closePanel: () => void;
  addMilestone: () => void;
  pickTemplate: (tpl: TemplateKey | 'savings') => void;
  setDraft: (field: string, value: unknown) => void;
  setTplParam: (field: string, value: unknown) => void;
  addIncome: () => void;
  addDebt: () => void;
  addAccount: () => void;
  commitDraft: () => void;
  applyStateDelta: (delta: any) => void;
}

const StrideContext = createContext<StrideContextValue | null>(null);

export function StrideProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StrideData>(() => loadGuestData());
  const [panel, setPanel] = useState<PanelRef | null>(null);
  const [draft, setDraftState] = useState<Draft | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setAuthReady(false);
      if (firebaseUser) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        };
        const userData = await loadUserData(firebaseUser.uid);
        setData(userData);
        setUser(profile);
      } else {
        setUser(null);
        setData(loadGuestData());
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // Debounced save — Firestore for logged-in users, localStorage for guests
  useEffect(() => {
    if (!authReady) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (user) {
        saveUserData(user.uid, data);
      } else {
        saveGuestData(data);
      }
    }, 500);
  }, [data, user, authReady]);

  const logOut = useCallback(async () => {
    await logOutUser();
    setUser(null);
    setData(loadGuestData());
  }, []);

  const value = useMemo<StrideContextValue>(() => {
    const setSpending = (v: number) => setData((s) => ({ ...s, spending: v }));
    const setExtraPayment = (v: number) => setData((s) => ({ ...s, extraPayment: v }));
    const setStrategy = (strategy: 'avalanche' | 'snowball') => setData((s) => ({ ...s, strategy }));
    const completeOnboarding = () => setData((s) => ({ ...s, hasOnboarded: true }));
    const applyStateDelta = (delta: any) =>
      setData((s) => {
        const updated = { ...s };
        if (delta.goals !== undefined) updated.goals = delta.goals;
        if (delta.spending !== undefined) updated.spending = delta.spending;
        if (delta.debts !== undefined) updated.debts = delta.debts;
        if (delta.incomeStreams !== undefined) updated.incomeStreams = delta.incomeStreams;
        if (delta.extraPayment !== undefined) updated.extraPayment = delta.extraPayment;
        if (delta.strategy !== undefined) updated.strategy = delta.strategy;
        if (delta.accounts !== undefined) updated.accounts = delta.accounts;
        if (delta.horizonMonths !== undefined) updated.horizonMonths = delta.horizonMonths;
        if (delta.brokeLimit !== undefined) updated.brokeLimit = delta.brokeLimit;
        return updated;
      });
    const resetScenario = () =>
      setData((s) => ({ ...s, incomeStreams: defaultIncome(), spending: 3800, debts: defaultDebts(), goals: defaultGoals() }));

    const setIncomeField = (key: string, field: string, val: unknown) =>
      setData((s) => ({ ...s, incomeStreams: s.incomeStreams.map((x) => (x.key === key ? { ...x, [field]: val } : x)) }));
    const setDebtField = (key: string, field: string, val: unknown) =>
      setData((s) => ({ ...s, debts: s.debts.map((x) => (x.key === key ? { ...x, [field]: val } : x)) }));
    const setAccountField = (key: string, field: string, val: unknown) =>
      setData((s) => ({ ...s, accounts: s.accounts.map((x) => (x.key === key ? { ...x, [field]: val } : x)) }));
    const setGoalField = (key: string, field: string, val: unknown) =>
      setData((s) => ({ ...s, goals: s.goals.map((g) => (g.key === key ? { ...g, [field]: val } : g)) }));
    const setMilestoneParam = (key: string, field: string, val: unknown) =>
      setData((s) => ({
        ...s,
        goals: s.goals.map((g) =>
          g.key === key && g.kind === 'template' ? { ...g, params: { ...g.params, [field]: val } } : g
        ),
      }));

    const toggleIncome = (key: string) =>
      setData((s) => ({
        ...s,
        incomeStreams: s.incomeStreams.map((x) => (x.key === key ? { ...x, active: !(x.active !== false) } : x)),
      }));
    const toggleDebt = (key: string) =>
      setData((s) => ({ ...s, debts: s.debts.map((x) => (x.key === key ? { ...x, active: !(x.active !== false) } : x)) }));
    const toggleGoal = (key: string) =>
      setData((s) => ({
        ...s,
        goals: s.goals.map((g) =>
          g.key === key
            ? { ...g, status: g.status === 'active' ? 'inactive' : g.status === 'inactive' ? 'active' : g.status }
            : g
        ),
      }));

    const removeEntity = (type: 'income' | 'debt' | 'account' | 'goal', key: string) => {
      setData((s) => {
        if (type === 'income') return { ...s, incomeStreams: s.incomeStreams.filter((x) => x.key !== key) };
        if (type === 'debt') return { ...s, debts: s.debts.filter((x) => x.key !== key) };
        if (type === 'account') return { ...s, accounts: s.accounts.filter((x) => x.key !== key) };
        return { ...s, goals: s.goals.filter((g) => g.key !== key) };
      });
      setPanel(null);
    };

    const openPanel = (type: PanelType, key: string) => setPanel({ type, key });
    const closePanel = () => {
      setPanel(null);
      setDraftState(null);
    };
    const addMilestone = () => {
      setPanel({ type: 'pick', key: '__new' });
      setDraftState(null);
    };
    const pickTemplate = (tpl: TemplateKey | 'savings') => {
      if (tpl === 'savings') {
        setPanel({ type: 'goal', key: '__new' });
        setDraftState({ kind: 'goal', name: '', glyph: '🎯', amount: 15000, month: 24, saved: 0, ratio: 0.5, status: 'active' });
        return;
      }
      const def = templateDefs()[tpl];
      setPanel({ type: 'template', key: '__new' });
      setDraftState({
        kind: 'template',
        name: def.label,
        glyph: def.glyph,
        template: tpl,
        dot: def.dot,
        status: 'active',
        params: templateParamDefaults(tpl, data.incomeStreams),
      });
    };
    const setDraft = (field: string, val: unknown) => setDraftState((d) => (d ? { ...d, [field]: val } : d));
    const setTplParam = (field: string, val: unknown) =>
      setDraftState((d) =>
        d ? { ...d, params: { ...(d.params as Record<string, unknown>), [field]: val } } : d
      );
    const addIncome = () => {
      setPanel({ type: 'income', key: '__new' });
      setDraftState({ kind: 'income', name: '', glyph: '💼', amount: 1500, frequency: 'Monthly', start: 0, duration: null, active: true });
    };
    const addDebt = () => {
      setPanel({ type: 'debt', key: '__new' });
      setDraftState({ kind: 'debt', name: '', glyph: '💳', balance: 5000, apr: 18, minPayment: 120, paymentDay: 1, active: true });
    };
    const addAccount = () => {
      setPanel({ type: 'account', key: '__new' });
      setDraftState({ kind: 'account', name: '', glyph: '🏦', balance: 3000 });
    };

    const commitDraft = () => {
      setData((s) => {
        const d = draft;
        if (!d) return s;
        if (d.kind === 'income') {
          const key = 'i' + Date.now();
          const dot = '#2f7d5b';
          const x: IncomeStream = {
            key,
            name: (d.name as string) || 'New income',
            glyph: d.glyph,
            amount: +(d.amount as number),
            frequency: (d.frequency as IncomeStream['frequency']) || 'Monthly',
            start: +(d.start as number) || 0,
            duration: d.duration == null ? null : +(d.duration as number),
            active: true,
            dot,
            tint: tintFor(dot),
          };
          setPanel({ type: 'income', key });
          setDraftState(null);
          return { ...s, incomeStreams: [...s.incomeStreams, x] };
        }
        if (d.kind === 'debt') {
          const key = 'd' + Date.now();
          const dot = '#a3452f';
          const x: Debt = {
            key,
            name: (d.name as string) || 'New debt',
            glyph: d.glyph,
            balance: +(d.balance as number),
            apr: +(d.apr as number),
            minPayment: +(d.minPayment as number),
            paymentDay: +(d.paymentDay as number) || 1,
            active: true,
            dot,
            tint: tintFor(dot),
          };
          setPanel({ type: 'debt', key });
          setDraftState(null);
          return { ...s, debts: [...s.debts, x] };
        }
        if (d.kind === 'account') {
          const key = 'a' + Date.now();
          const dot = 'var(--ink)';
          const x: Account = {
            key,
            name: (d.name as string) || 'New account',
            glyph: d.glyph,
            balance: +(d.balance as number),
            dot,
            tint: tintFor(dot),
          };
          setPanel({ type: 'account', key });
          setDraftState(null);
          return { ...s, accounts: [...s.accounts, x] };
        }
        if (d.kind === 'template') {
          const key = 'm' + Date.now();
          const dot = 'var(--ink)';
          const g: Goal = {
            key,
            kind: 'template',
            template: d.template as TemplateKey,
            name: (d.name as string) || 'New milestone',
            glyph: d.glyph,
            tint: tintFor(dot),
            dot,
            status: (d.status as Goal['status']) || 'active',
            params: { ...(d.params as Record<string, unknown>) },
          };
          setPanel({ type: 'goal', key });
          setDraftState(null);
          return { ...s, goals: [...s.goals, g] };
        }
        const key = 'c' + Date.now();
        const dot = 'var(--ink)';
        const g: Goal = {
          key,
          name: (d.name as string) || 'New milestone',
          glyph: d.glyph,
          tint: tintFor(dot),
          dot,
          amount: +(d.amount as number),
          month: +(d.month as number),
          saved: +(d.saved as number),
          ratio: 0.5,
          status: (d.status as Goal['status']) || 'active',
        };
        setPanel({ type: 'goal', key });
        setDraftState(null);
        return { ...s, goals: [...s.goals, g] };
      });
    };

    return {
      ...data,
      panel,
      draft,
      user,
      authReady,
      setSpending,
      setExtraPayment,
      setStrategy,
      completeOnboarding,
      resetScenario,
      logOut,
      setIncomeField,
      setDebtField,
      setAccountField,
      setGoalField,
      setMilestoneParam,
      toggleIncome,
      toggleDebt,
      toggleGoal,
      removeEntity,
      openPanel,
      closePanel,
      addMilestone,
      pickTemplate,
      setDraft,
      setTplParam,
      addIncome,
      addDebt,
      addAccount,
      commitDraft,
      applyStateDelta,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, panel, draft, user, authReady, logOut]);

  return <StrideContext.Provider value={value}>{children}</StrideContext.Provider>;
}

export function useStride(): StrideContextValue {
  const ctx = useContext(StrideContext);
  if (!ctx) throw new Error('useStride must be used within a StrideProvider');
  return ctx;
}
