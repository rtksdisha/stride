import type { Account, Debt, Frequency, Goal, IncomeStream, PrimKind, TemplateDef, TemplateKey } from '../types';

export const START_BALANCE = 8200;

export const PALETTE = ['var(--ink)', 'var(--ink-dim)', 'var(--ink-faint)'];
export const GOAL_GLYPHS = ['🏠', '🚗', '🌿', '🛟', '✈️', '💍', '🎓', '👶', '🏝️', '💻'];
export const INCOME_GLYPHS = ['💼', '🏠', '💻', '📈', '🎁', '🪙', '🏦', '🚀'];
export const DEBT_GLYPHS = ['💳', '🎓', '🚗', '🏦', '🏠', '📱', '🧾', '💉'];
export const ACCOUNT_GLYPHS = ['🏦', '💰', '🐷', '💵', '📈', '🪙'];
export const FREQS: Frequency[] = ['Weekly', 'Biweekly', 'Semi-monthly', 'Monthly', 'Quarterly', 'Annual', 'One-time'];

export const PRIM_KINDS: { kind: PrimKind; label: string }[] = [
  { kind: 'once', label: 'One-time event' },
  { kind: 'recur', label: 'Recurring event' },
  { kind: 'loan', label: 'Amortized loan' },
];

export function templateDefs(): Record<TemplateKey, TemplateDef> {
  return {
    buy_car: {
      label: 'Buy a car',
      glyph: '🚗',
      dot: '#a3452f',
      blurb: 'Down payment, loan amortization & running costs',
      fields: [
        { key: 'price', label: 'Purchase price', type: 'money', min: 8000, max: 120000, step: 1000, def: 35000 },
        { key: 'down', label: 'Down payment', type: 'money', min: 0, max: 40000, step: 500, def: 5000 },
        { key: 'tradeIn', label: 'Trade-in value', type: 'money', min: 0, max: 40000, step: 500, def: 0, optional: true },
        { key: 'apr', label: 'Loan APR', type: 'percent', min: 0, max: 20, step: 0.25, def: 7.5 },
        { key: 'term', label: 'Loan term', type: 'int', min: 12, max: 84, step: 12, def: 60, unit: 'mo' },
        { key: 'month', label: 'Purchase date', type: 'date', min: 0, max: 48, step: 1, def: 2 },
        { key: 'insurance', label: 'Monthly insurance', type: 'money', min: 0, max: 600, step: 25, def: 175 },
        { key: 'gas', label: 'Gas & maintenance', type: 'money', min: 0, max: 800, step: 25, def: 250 },
      ],
    },
    buy_house: {
      label: 'Buy a house',
      glyph: '🏠',
      dot: '#8c7355',
      blurb: 'Down payment, closing, mortgage, taxes & upkeep',
      fields: [
        { key: 'price', label: 'Purchase price', type: 'money', min: 150000, max: 2000000, step: 10000, def: 650000 },
        { key: 'down', label: 'Down payment', type: 'money', min: 0, max: 600000, step: 5000, def: 130000 },
        { key: 'apr', label: 'Mortgage APR', type: 'percent', min: 0, max: 12, step: 0.04, def: 5.04 },
        { key: 'amortYears', label: 'Amortization', type: 'int', min: 10, max: 30, step: 5, def: 30, unit: 'yr' },
        { key: 'month', label: 'Closing date', type: 'date', min: 0, max: 48, step: 1, def: 4 },
        { key: 'closingPct', label: 'Closing costs', type: 'percent', min: 0, max: 6, step: 0.1, def: 2, unit: '% of price' },
        { key: 'taxPct', label: 'Property tax / yr', type: 'percent', min: 0, max: 3, step: 0.1, def: 1.1, unit: '% of price' },
        { key: 'insurance', label: 'Monthly home insurance', type: 'money', min: 0, max: 600, step: 10, def: 130 },
        { key: 'maintPct', label: 'Maintenance / yr', type: 'percent', min: 0, max: 3, step: 0.1, def: 1.0, unit: '% of price' },
        { key: 'hoa', label: 'Monthly HOA fees', type: 'money', min: 0, max: 1500, step: 25, def: 0, optional: true },
      ],
    },
    sabbatical: {
      label: 'Take a sabbatical',
      glyph: '🌿',
      dot: '#2f7d5b',
      blurb: 'Pause an income stream + travel & healthcare costs',
      fields: [
        { key: 'pauseKey', label: 'Income to pause', type: 'income' },
        { key: 'month', label: 'Sabbatical start', type: 'date', min: 0, max: 48, step: 1, def: 6 },
        { key: 'duration', label: 'Duration', type: 'int', min: 1, max: 24, step: 1, def: 6, unit: 'mo' },
        { key: 'travel', label: 'Travel / lifestyle / mo', type: 'money', min: 0, max: 6000, step: 100, def: 1500 },
        { key: 'healthcare', label: 'Healthcare / mo', type: 'money', min: 0, max: 2000, step: 50, def: 400 },
      ],
    },
    custom: {
      label: 'Custom milestone',
      glyph: '🎯',
      dot: '#5c7b8a',
      blurb: 'Build it from scratch — add any primitives you need',
      fields: [],
    },
  };
}

export function templateParamDefaults(tpl: TemplateKey, incomeStreams: IncomeStream[]): Record<string, unknown> {
  const def = templateDefs()[tpl];
  const p: Record<string, unknown> = {};
  for (const f of def.fields) {
    if (f.type === 'income') {
      const s = incomeStreams[0];
      p[f.key] = s ? s.key : null;
    } else {
      p[f.key] = f.def;
    }
  }
  if (tpl === 'custom') p.prims = [];
  return p;
}

export function tintFor(hex: string): string {
  if (hex.startsWith('var(')) {
    return 'rgba(30,37,34,0.12)';
  }
  const c = (hex.replace('#', '').match(/.{2}/g) || []).map((h) => parseInt(h, 16));
  return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.20)';
}

export function defaultIncome(): IncomeStream[] {
  return [
    { key: 'salary', name: 'Take-home salary', glyph: '💼', amount: 5200, frequency: 'Monthly', start: 0, duration: null, active: true, dot: '#2f7d5b', tint: 'rgba(47,125,91,0.13)' },
    { key: 'freelance', name: 'Freelance design', glyph: '💻', amount: 850, frequency: 'Monthly', start: 0, duration: null, active: true, dot: '#2f7d5b', tint: 'rgba(47,125,91,0.13)' },
  ];
}

export function defaultDebts(): Debt[] {
  return [
    { key: 'card', name: 'Credit card', glyph: '💳', balance: 6400, apr: 19.99, minPayment: 95, paymentDay: 15, active: true, dot: '#a3452f', tint: 'rgba(163,69,47,0.14)' },
    { key: 'student', name: 'Student loan', glyph: '🎓', balance: 14200, apr: 4.5, minPayment: 185, paymentDay: 1, active: true, dot: '#a3452f', tint: 'rgba(163,69,47,0.14)' },
  ];
}

export function defaultAccounts(): Account[] {
  return [
    { key: 'checking', name: 'Checking', glyph: '🏦', balance: 6200, dot: 'var(--ink)', tint: 'rgba(30,37,34,0.06)' },
    { key: 'savings', name: 'Savings', glyph: '💰', balance: 2000, dot: '#2f7d5b', tint: 'rgba(47,125,91,0.13)' },
  ];
}

export function defaultGoals(): Goal[] {
  return [
    { key: 'car', name: 'New car', glyph: '🚗', tint: 'rgba(163,69,47,0.20)', dot: '#a3452f', amount: 12000, month: 14, saved: 3500, ratio: 0.4, status: 'committed' },
    { key: 'house', name: 'House down payment', glyph: '🏠', tint: 'rgba(140,115,85,0.20)', dot: '#8c7355', amount: 45000, month: 30, saved: 8200, ratio: 0.7, status: 'active' },
    { key: 'sab', name: 'Sabbatical fund', glyph: '🌿', tint: 'rgba(47,125,91,0.20)', dot: '#2f7d5b', amount: 20000, month: 48, saved: 1200, ratio: 0.3, status: 'inactive' },
  ];
}
