export type Frequency =
  | 'Weekly'
  | 'Biweekly'
  | 'Semi-monthly'
  | 'Monthly'
  | 'Quarterly'
  | 'Annual'
  | 'One-time';

export type GoalStatus = 'committed' | 'active' | 'inactive';

export interface IncomeStream {
  key: string;
  name: string;
  glyph: string;
  amount: number;
  frequency: Frequency;
  start: number;
  duration: number | null;
  active: boolean;
  dot: string;
  tint?: string;
}

export interface Debt {
  key: string;
  name: string;
  glyph: string;
  balance: number;
  apr: number;
  minPayment: number;
  paymentDay: number;
  active: boolean;
  dot: string;
  tint?: string;
}

export interface Account {
  key: string;
  name: string;
  glyph: string;
  balance: number;
  dot: string;
  tint?: string;
}

export type TemplateKey = 'buy_car' | 'buy_house' | 'sabbatical' | 'custom';

export type PrimKind = 'once' | 'recur' | 'loan';

export interface Primitive {
  kind: PrimKind;
  label: string;
  amt?: number;
  month?: number;
  months?: number;
  principal?: number;
  apr?: number;
  term?: number;
}

export type TemplateParams = Record<string, unknown> & { prims?: Primitive[] };

export interface SimpleGoal {
  key: string;
  kind?: undefined;
  name: string;
  glyph: string;
  tint: string;
  dot: string;
  amount: number;
  month: number;
  saved: number;
  ratio: number;
  status: GoalStatus;
}

export interface TemplateGoal {
  key: string;
  kind: 'template';
  template: TemplateKey;
  name: string;
  glyph: string;
  tint: string;
  dot: string;
  status: GoalStatus;
  params: TemplateParams;
}

export type Goal = SimpleGoal | TemplateGoal;

export interface TemplateFieldDef {
  key: string;
  label: string;
  type: 'money' | 'percent' | 'int' | 'date' | 'income';
  min?: number;
  max?: number;
  step?: number;
  def?: number;
  unit?: string;
  optional?: boolean;
}

export interface TemplateDef {
  label: string;
  glyph: string;
  dot: string;
  blurb: string;
  fields: TemplateFieldDef[];
}

export type PanelType = 'pick' | 'goal' | 'income' | 'debt' | 'account' | 'template';

export interface PanelRef {
  type: PanelType;
  key: string;
}

export type DraftKind = 'goal' | 'income' | 'debt' | 'account' | 'template';

export interface Draft {
  kind: DraftKind;
  name: string;
  glyph: string;
  [key: string]: unknown;
}

export type ScreenId = 'onboarding' | 'dashboard' | 'scenario' | 'milestone';

export interface OneTimeEvent {
  m: number;
  amt: number;
}

export interface RecurringEvent {
  from: number;
  to: number;
  amt: number;
}

export interface MilestoneEvents {
  oneTimes: OneTimeEvent[];
  recurrings: RecurringEvent[];
}

export interface StrideData {
  incomeStreams: IncomeStream[];
  spending: number;
  accounts: Account[];
  debts: Debt[];
  goals: Goal[];
  extraPayment: number;
  strategy: 'avalanche' | 'snowball';
  hasOnboarded: boolean;
}
