import type { ReactNode } from 'react';
import { useState } from 'react';
import type { Primitive } from '../../types';
import { useStride } from '../../state/StrideContext';
import { ACCOUNT_GLYPHS, DEBT_GLYPHS, FREQS, GOAL_GLYPHS, INCOME_GLYPHS, templateDefs, tintFor } from '../../lib/defaults';
import { addPrim, removePrim, setPrim } from '../../lib/prims';
import { fmt, money, monthLabel, ordinal, pctLabel } from '../../lib/format';
import { breakEvenPayment, debtInterest, isDebtGrowing, metrics, milestoneSummary, monthlyEquiv } from '../../lib/finance';
import { HORIZON } from '../../lib/forecast';
import { EditableNumber } from '../ui/EditableNumber';
import { SliderField } from '../ui/SliderField';
import { ChoiceRow } from '../ui/ChoiceRow';

type AnyRec = any;

const STATUS_DEFS = [
  { k: 'committed', label: 'Committed' },
  { k: 'active', label: 'What-if' },
  { k: 'inactive', label: 'Muted' },
] as const;
const STATUS_HINTS: Record<string, string> = {
  committed: 'Locked into your baseline — a decision you’ve made.',
  active: 'Layered on top as a what-if you’re testing.',
  inactive: 'Parked. Left out of the forecast for now.',
};

function SectionLabel({ children, marginTop = 22 }: { children: ReactNode; marginTop?: number }) {
  return (
    <div style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.05em', color: 'var(--ink-faint)', textTransform: 'uppercase', marginTop }}>
      {children}
    </div>
  );
}

function StatusChoices({ status, onPick, hint }: { status: string; onPick: (k: string) => void; hint: string }) {
  return (
    <>
      <SectionLabel>Status in forecast</SectionLabel>
      <ChoiceRow
        flex
        choices={STATUS_DEFS.map((sd) => ({ label: sd.label, active: sd.k === status, onPick: () => onPick(sd.k) }))}
      />
      <div style={{ font: "400 11px/1.4 'Spline Sans'", color: 'var(--ink-faint)', marginTop: 8 }}>{hint}</div>
    </>
  );
}

export function EditPanel({ net, cur, brokeLimit }: { net: number; cur: number[]; brokeLimit: number }) {
  const stride = useStride();
  const { panel } = stride;
  if (!panel) return null;

  return (
    <>
      <div onClick={stride.closePanel} style={{ position: 'absolute', inset: 0, background: 'rgba(30,37,34,0.30)', zIndex: 40 }} />
      <div
        className="edit-panel"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          background: '#F6F7F4',
          zIndex: 41,
          boxShadow: '-26px 0 70px rgba(30,37,34,0.20)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PanelBody net={net} cur={cur} brokeLimit={brokeLimit} />
      </div>
    </>
  );
}

function Header({ kicker, glyph, tint, name, editable, onName, placeholder }: { kicker: string; glyph: string; tint: string; name: string; editable: boolean; onName?: (v: string) => void; placeholder?: string }) {
  const stride = useStride();
  return (
    <div style={{ padding: '26px 28px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23 }}>{glyph}</div>
        <div>
          <div style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.1em', color: 'var(--ink-faint)', textTransform: 'uppercase' }}>{kicker}</div>
          {editable ? (
            <input
              value={name}
              onChange={(e) => onName?.(e.target.value)}
              placeholder={placeholder}
              style={{ border: 'none', background: 'transparent', font: "600 20px 'Spline Sans'", color: 'var(--ink)', padding: '2px 0', outline: 'none', width: 250 }}
            />
          ) : (
            <div style={{ font: "600 20px 'Spline Sans'", color: 'var(--ink)', padding: '2px 0' }}>{name}</div>
          )}
        </div>
      </div>
      <div
        onClick={stride.closePanel}
        style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', border: '1px solid rgba(30,37,34,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
      >
        <svg width="13" height="13" viewBox="0 0 12 12">
          <path d="M2 2l8 8M10 2l-8 8" stroke="#5C645F" strokeWidth={1.8} strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function Footer({ isNew, addLabel, onCommit, onRemove }: { isNew: boolean; addLabel?: string; onCommit?: () => void; onRemove?: () => void }) {
  const stride = useStride();
  return (
    <div style={{ padding: '16px 28px 22px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
      {isNew && onCommit && (
        <div onClick={onCommit} style={{ flex: 1, background: 'var(--ink)', color: '#fff', borderRadius: 13, padding: 15, textAlign: 'center', font: "600 15px 'Spline Sans'", cursor: 'pointer' }}>
          {addLabel}
        </div>
      )}
      {!isNew && onRemove && (
        <div onClick={onRemove} style={{ font: "500 14px 'Spline Sans'", color: 'var(--debt-bad)', cursor: 'pointer', padding: '14px 6px' }}>
          Remove
        </div>
      )}
      {!isNew && (
        <div onClick={stride.closePanel} style={{ flex: 1, background: 'var(--ink)', color: '#fff', borderRadius: 13, padding: 15, textAlign: 'center', font: "600 15px 'Spline Sans'", cursor: 'pointer' }}>
          Done
        </div>
      )}
    </div>
  );
}

function GlyphChooser({ pool, current, onPick }: { pool: string[]; current: string; onPick: (g: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginTop: 18, marginBottom: 18 }}>
      <SectionLabel marginTop={0}>Icon</SectionLabel>
      
      {/* Clickable option trigger */}
      <div 
        onClick={() => setExpanded(prev => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: '#fff',
          border: '1px solid rgba(30,37,34,0.08)',
          borderRadius: 12,
          padding: '8px 12px',
          cursor: 'pointer',
          marginTop: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(30,37,34,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
          {current}
        </div>
        <span style={{ font: "500 12.5px 'Spline Sans'", color: 'var(--ink-dim)' }}>
          {expanded ? 'Select an icon' : 'Click to change icon'}
        </span>
        <svg width="10" height="10" viewBox="0 0 12 12" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 4 }}>
          <path d="M2 4l4 4 4-4" stroke="var(--ink-faint)" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Collapsible icons pool */}
      {expanded && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, padding: 12, background: 'rgba(30,37,34,0.02)', borderRadius: 12, border: '1px dashed rgba(30,37,34,0.08)' }}>
          {pool.map((gl) => (
            <div
              key={gl}
              onClick={() => {
                onPick(gl);
                setExpanded(false); // Collapse on pick
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                cursor: 'pointer',
                background: gl === current ? '#fff' : 'transparent',
                border: `1.5px solid ${gl === current ? 'var(--green)' : 'rgba(30,37,34,0.08)'}`,
                boxShadow: gl === current ? '0 2px 6px rgba(47,125,91,0.15)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {gl}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PickPanel() {
  const stride = useStride();
  const defs = templateDefs();
  const cards = (['buy_car', 'buy_house', 'sabbatical', 'custom'] as const).map((t) => ({
    key: t,
    label: defs[t].label,
    glyph: defs[t].glyph,
    tint: tintFor(defs[t].dot),
    blurb: defs[t].blurb,
    onPick: () => stride.pickTemplate(t),
  }));
  cards.push({ key: 'savings' as any, label: 'Savings goal', glyph: '🎯', tint: 'rgba(47,125,91,0.13)', blurb: 'A simple target amount by a target date', onPick: () => stride.pickTemplate('savings') });

  return (
    <>
      <Header kicker="New goal" glyph="✨" tint="rgba(138,111,176,0.14)" name="What are you planning?" editable={false} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px 18px' }}>
        <div style={{ font: "400 14px/1.5 'Spline Sans'", color: 'var(--ink-dim)', marginBottom: 16 }}>
          Pick a template and Stride builds the cashflow primitives — loans, recurring costs, one-time hits — for you. Tune everything after.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cards.map((c) => (
            <div
              key={c.key}
              onClick={c.onPick}
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid rgba(30,37,34,0.08)', borderRadius: 15, padding: '15px 16px', cursor: 'pointer' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{c.glyph}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "600 15px 'Spline Sans'", color: 'var(--ink)' }}>{c.label}</div>
                <div style={{ font: "400 12px/1.4 'Spline Sans'", color: 'var(--ink-faint)', marginTop: 2 }}>{c.blurb}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
                <path d="M4 1.5l5 4.5-5 4.5" stroke="#A8AEA8" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>
      </div>
      <Footer isNew={false} />
    </>
  );
}

function PanelBody({ net, cur, brokeLimit }: { net: number; cur: number[]; brokeLimit: number }) {
  const stride = useStride();
  const { panel, draft, incomeStreams, debts, accounts, goals } = stride;
  if (!panel) return null;
  const type = panel.type;
  const isNew = panel.key === '__new';

  if (type === 'pick') return <PickPanel />;

  const pool: AnyRec[] = type === 'income' ? incomeStreams : type === 'debt' ? debts : type === 'account' ? accounts : goals;
  const src: AnyRec | undefined = isNew ? (draft as AnyRec) : pool.find((x) => x.key === panel.key);
  if (!src) return null;

  const key = panel.key;
  const isTpl = type === 'template' || src.kind === 'template';

  const setField = (f: string, v: unknown) => {
    if (isNew) stride.setDraft(f, v);
    else if (type === 'income') stride.setIncomeField(key, f, v);
    else if (type === 'debt') stride.setDebtField(key, f, v);
    else if (type === 'account') stride.setAccountField(key, f, v);
    else stride.setGoalField(key, f, v);
  };
  const setParam = (f: string, v: unknown) => {
    if (isNew) stride.setTplParam(f, v);
    else stride.setMilestoneParam(key, f, v);
  };

  const glyphPool = type === 'income' ? INCOME_GLYPHS : type === 'debt' ? DEBT_GLYPHS : type === 'account' ? ACCOUNT_GLYPHS : GOAL_GLYPHS;
  const tint = src.tint || (src.dot ? tintFor(src.dot) : 'rgba(30,37,34,0.08)');
  const entityType = type === 'goal' ? 'goal' : type === 'income' ? 'income' : type === 'debt' ? 'debt' : 'account';

  const kicker =
    type === 'income' ? (isNew ? 'New income' : 'Editing income') :
    type === 'debt' ? (isNew ? 'New debt' : 'Editing debt') :
    type === 'account' ? (isNew ? 'New account' : 'Editing account') :
    isNew ? 'New goal' : 'Editing goal';
  const placeholder = type === 'income' ? 'Name this income' : type === 'debt' ? 'Name this debt' : type === 'account' ? 'Name this account' : 'Name this goal';
  const addLabel = type === 'income' ? 'Add income' : type === 'debt' ? 'Add debt' : type === 'account' ? 'Add account' : isTpl ? 'Add to forecast' : 'Add goal';

  return (
    <>
      <Header kicker={kicker} glyph={src.glyph} tint={tint} name={src.name} editable onName={(v) => setField('name', v)} placeholder={placeholder} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px 18px' }}>
        {type === 'goal' && !isTpl && <GoalStatusCard src={src} net={net} cur={cur} brokeLimit={brokeLimit} />}
        {type === 'income' && <IncomeStatusCard src={src} />}
        {type === 'debt' && <DebtStatusCard src={src} />}

        <GlyphChooser pool={glyphPool} current={src.glyph} onPick={(g) => setField('glyph', g)} />

        {type === 'goal' && !isTpl && <GoalFields src={src} setField={setField} />}
        {type === 'income' && <IncomeFields src={src} setField={setField} />}
        {type === 'debt' && <DebtFields src={src} setField={setField} />}
        {type === 'account' && <AccountFields src={src} setField={setField} />}
        {isTpl && <TemplateFields src={src} setField={setField} setParam={setParam} incomeStreams={incomeStreams} />}

        {(type === 'goal' || isTpl) && (
          <StatusChoices status={src.status} onPick={(k) => setField('status', k)} hint={STATUS_HINTS[src.status] || ''} />
        )}
      </div>
      <Footer isNew={isNew} addLabel={addLabel} onCommit={stride.commitDraft} onRemove={isNew ? undefined : () => stride.removeEntity(entityType, key)} />
    </>
  );
}

function GoalStatusCard({ src, net, cur, brokeLimit }: { src: AnyRec; net: number; cur: number[]; brokeLimit: number }) {
  const met = metrics(src, net);

  const mm = Math.round(src.month);
  const behindOnSavings = met.ahead < 0;
  
  // Check if balance dips below brokeLimit at or after month mm
  const brokeInFuture = cur.slice(mm).some((v) => v < brokeLimit);
  const isAtRisk = behindOnSavings || brokeInFuture;

  const tone = isAtRisk 
    ? (behindOnSavings ? '#C0792E' : 'var(--debt-bad)')
    : '#2F7D5B';
  const pillBg = isAtRisk
    ? (behindOnSavings ? 'rgba(192,121,46,0.12)' : 'var(--debt-bad-bg)')
    : 'rgba(47,125,91,0.09)';
  
  const statusLabel = behindOnSavings 
    ? `${Math.abs(met.ahead)} MONTHS BEHIND` 
    : (brokeInFuture ? 'AT RISK' : 'ON TRACK');

  return (
    <div style={{ background: pillBg, borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: tone }} />
        <span style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.06em', color: tone, textTransform: 'uppercase' }}>
          {statusLabel}
        </span>
      </div>
      <div style={{ font: "400 25px/1.2 'Newsreader'", color: 'var(--ink)', marginTop: 8 }}>
        {behindOnSavings ? (
          <>You reach it by <span style={{ color: tone, fontWeight: 500 }}>{met.hitDate}</span>.</>
        ) : (
          brokeInFuture ? 'Goal is unaffordable' : 'Goal is on track'
        )}
      </div>
      <div style={{ font: "400 13px/1.45 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 6 }}>
        {behindOnSavings && `At ${money(met.monthlyToward)}/mo you fall short of your ${monthLabel(src.month)} date. Trim spending or move the date out.`}
        {!behindOnSavings && brokeInFuture && (
          <div style={{ marginTop: 8, font: "500 12.5px 'Spline Sans'", color: 'var(--debt-bad)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M8 1.5l6.5 11.5h-13z" fill="none" stroke="var(--debt-bad)" strokeWidth={1.5} strokeLinejoin="round" />
              <path d="M8 6.2v3.2M8 11.2v.2" stroke="var(--debt-bad)" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
            <span>
              <strong>Note:</strong> Although your savings rate is on track, your total combined cash balance dips below your broke line ({money(brokeLimit)}) at or after this goal, making the purchase or its ongoing maintenance costs unsustainable.
            </span>
          </div>
        )}
        {!behindOnSavings && !brokeInFuture && 'Your savings rate is on track, and your future cashflow remains healthy and positive.'}
      </div>
    </div>
  );
}

function IncomeStatusCard({ src }: { src: AnyRec }) {
  return (
    <div style={{ background: 'rgba(47,125,91,0.09)', borderRadius: 16, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
        <span style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.06em', color: 'var(--green)', textTransform: 'uppercase' }}>Income stream</span>
      </div>
      <div style={{ font: "400 30px/1.1 'Newsreader'", color: 'var(--ink)', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
        {money(monthlyEquiv(src))} <span style={{ fontSize: 16, color: 'var(--ink-dim)' }}>/ mo equivalent</span>
      </div>
      <div style={{ font: "400 13px/1.45 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 6 }}>{incomeSub(src)}</div>
    </div>
  );
}

function incomeSub(src: AnyRec): string {
  const ongoing = src.duration == null;
  const dur = src.duration == null ? 3 : Math.round(src.duration);
  const start = Math.round(src.start);
  const freq = src.frequency || 'Monthly';
  const prefix = freq !== 'Monthly' ? money(monthlyEquiv(src)) + '/mo equivalent. ' : '';
  if (ongoing) return prefix + (start === 0 ? 'Counts toward your forecast every month, starting now.' : 'Kicks in ' + monthLabel(start) + ' and keeps going.');
  return prefix + 'Runs ' + dur + (dur === 1 ? ' month' : ' months') + ' (' + monthLabel(start) + '–' + monthLabel(start + dur - 1) + '), then stops.';
}

function DebtStatusCard({ src }: { src: AnyRec }) {
  const interest = debtInterest(src);
  const growing = isDebtGrowing(src);
  const breakEven = breakEvenPayment(src);
  return (
    <div style={{ background: growing ? 'var(--debt-bad-bg)' : 'var(--green-bg)', borderRadius: 16, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: growing ? 'var(--debt-bad)' : 'var(--green)' }} />
        <span style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.06em', color: growing ? 'var(--debt-bad)' : 'var(--green)', textTransform: 'uppercase' }}>
          {growing ? 'Debt is growing' : 'Debt is shrinking'}
        </span>
      </div>
      <div style={{ font: "400 26px/1.15 'Newsreader'", color: 'var(--ink)', marginTop: 8 }}>{growing ? 'Interest outpaces your payment.' : 'You’re chipping it down.'}</div>
      <div style={{ font: "400 13px/1.45 'Spline Sans'", color: 'var(--ink-dim)', marginTop: 6 }}>
        {growing
          ? 'At ' + pctLabel(src.apr) + ' APR this balance adds ' + money(interest) + '/mo in interest — more than your ' + money(src.minPayment) + ' minimum. Raise it to ' + money(breakEven) + '/mo just to stop the bleed.'
          : 'Interest runs about ' + money(interest) + '/mo, under your ' + money(src.minPayment) + ' payment, so the balance falls over time.'}
      </div>
    </div>
  );
}

function GoalFields({ src, setField }: { src: AnyRec; setField: (f: string, v: unknown) => void }) {
  return (
    <>
      <SliderField
        label="Target amount"
        value={src.amount}
        onChange={(v) => {
          setField('amount', v);
          if (src.saved > v) setField('saved', v);
        }}
        min={1000}
        max={100000}
        step={1000}
        loLabel="$1k"
        hiLabel="$100k"
      />
      <SliderField
        label="Target date"
        value={src.month}
        onChange={(v) => setField('month', v)}
        min={3}
        max={60}
        step={1}
        editable={false}
        valueDisplay={monthLabel(src.month)}
        valueColor="var(--ink)"
        loLabel={monthLabel(3)}
        hiLabel={monthLabel(60)}
      />
      <SliderField
        label="Saved so far"
        value={src.saved}
        onChange={(v) => setField('saved', v)}
        min={0}
        max={src.amount}
        step={500}
        loLabel="$0"
        hiLabel={money(src.amount)}
      />
    </>
  );
}

function IncomeFields({ src, setField }: { src: AnyRec; setField: (f: string, v: unknown) => void }) {
  const ongoing = src.duration == null;
  const dur = src.duration == null ? 3 : Math.round(src.duration);
  const start = Math.round(src.start);
  const freq = src.frequency || 'Monthly';
  const perWord: Record<string, string> = { Weekly: 'per week', Biweekly: 'per paycheck', 'Semi-monthly': 'per paycheck', Monthly: 'per month' };

  return (
    <>
      <SliderField
        label={`Amount (${perWord[freq] || 'per month'})`}
        value={src.amount}
        onChange={(v) => setField('amount', v)}
        min={0}
        max={12000}
        step={50}
        loLabel="$0"
        hiLabel="$12k"
      />
      <div style={{ padding: '18px 0 4px', borderBottom: '1px solid var(--line)' }}>
        <span style={{ font: "500 14px 'Spline Sans'", color: 'var(--ink)' }}>How often?</span>
        <ChoiceRow choices={FREQS.map((f) => ({ label: f, active: f === freq, onPick: () => setField('frequency', f) }))} />
      </div>
      <SliderField
        label="Starts"
        value={start}
        onChange={(v) => setField('start', v)}
        min={0}
        max={48}
        step={1}
        editable={false}
        valueDisplay={start === 0 ? 'This month' : monthLabel(start)}
        valueColor="var(--green)"
        loLabel="This month"
        hiLabel={monthLabel(48)}
      />
      <div style={{ padding: '18px 0 4px', borderBottom: '1px solid var(--line)' }}>
        <span style={{ font: "500 14px 'Spline Sans'", color: 'var(--ink)' }}>How long does it last?</span>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <ChoicePill label="Ongoing" active={ongoing} onPick={() => setField('duration', null)} />
          <ChoicePill label="For a set time" active={!ongoing} onPick={() => setField('duration', dur)} />
        </div>
      </div>
      {!ongoing && (
        <SliderField label="Lasts for" value={dur} onChange={(v) => setField('duration', v)} min={1} max={36} step={1} editable={false} valueDisplay={dur + (dur === 1 ? ' month' : ' months')} loLabel="1 mo" hiLabel="36 mo" border="none" />
      )}
    </>
  );
}

function ChoicePill({ label, active, onPick }: { label: string; active: boolean; onPick: () => void }) {
  return (
    <div
      onClick={onPick}
      style={{
        flex: 1,
        textAlign: 'center',
        padding: 11,
        borderRadius: 11,
        cursor: 'pointer',
        font: "600 13px 'Spline Sans'",
        background: active ? '#fff' : 'transparent',
        color: active ? 'var(--ink)' : '#7B827D',
        border: `1.5px solid ${active ? 'rgba(47,125,91,0.55)' : 'rgba(30,37,34,0.1)'}`,
      }}
    >
      {label}
    </div>
  );
}

function DebtFields({ src, setField }: { src: AnyRec; setField: (f: string, v: unknown) => void }) {
  const growing = isDebtGrowing(src);
  return (
    <>
      <SliderField label="Balance owed" value={src.balance} onChange={(v) => setField('balance', v)} min={0} max={40000} step={100} loLabel="$0" hiLabel="$40k" />
      <SliderField label="Interest rate (APR)" value={src.apr} onChange={(v) => setField('apr', v)} min={0} max={30} step={0.5} kind="percent" loLabel="0%" hiLabel="30%" />
      <SliderField
        label="Minimum payment"
        value={src.minPayment}
        onChange={(v) => setField('minPayment', v)}
        min={0}
        max={1200}
        step={5}
        suffix="/mo"
        valueColor={growing ? 'var(--debt-bad)' : 'var(--ink)'}
        loLabel="$0"
        hiLabel="$1,200"
      />
      <SliderField
        label="Payment due day"
        value={src.paymentDay || 1}
        onChange={(v) => setField('paymentDay', v)}
        min={1}
        max={28}
        step={1}
        editable={false}
        valueDisplay={ordinal(src.paymentDay || 1)}
        valueColor="var(--ink)"
        loLabel="1st"
        hiLabel="28th"
        border="top"
      />
    </>
  );
}

function AccountFields({ src, setField }: { src: AnyRec; setField: (f: string, v: unknown) => void }) {
  return (
    <div style={{ padding: '18px 0 4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ font: "500 14px 'Spline Sans'", color: 'var(--ink)' }}>Starting balance</span>
        <span style={{ font: "600 17px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
          <EditableNumber value={src.balance} onChange={(v) => setField('balance', v)} kind="money" min={0} max={120000} width={104} />
        </span>
      </div>
      <input type="range" min={0} max={120000} step={500} value={src.balance} onChange={(e) => setField('balance', +e.target.value)} style={{ marginTop: 14, display: 'block' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9, font: "400 11px 'Spline Sans Mono'", color: 'var(--ink-faint-2)' }}>
        <span>$0</span>
        <span>$120k</span>
      </div>
      <div style={{ font: "400 12px/1.45 'Spline Sans'", color: 'var(--ink-faint)', marginTop: 12 }}>Counts toward the balance your forecast starts from today.</div>
    </div>
  );
}

interface TplFieldDescriptor {
  key: string;
  label: string;
  isField: boolean;
  isIncomeField: boolean;
  valueLabel?: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  lo?: string;
  hi?: string;
  editable?: boolean;
  kind?: 'money' | 'percent';
  onInput?: (v: number) => void;
  incomeChoices?: { label: string; active: boolean; onPick: () => void }[];
}

function templateFieldDescriptor(f: AnyRec, p: AnyRec, setParam: (f: string, v: unknown) => void, incomeStreams: AnyRec[]): TplFieldDescriptor {
  if (f.type === 'income') {
    return {
      key: f.key,
      label: f.label,
      isField: false,
      isIncomeField: true,
      incomeChoices: incomeStreams.map((st) => ({
        label: st.name,
        active: st.key === p[f.key],
        onPick: () => setParam(f.key, p[f.key] === st.key ? null : st.key),
      })),
    };
  }
  const v = p[f.key];
  let valueLabel = '';
  let lo = '';
  let hi = '';
  let note = '';
  if (f.type === 'money') {
    valueLabel = money(v);
    lo = fmt(f.min);
    hi = fmt(f.max);
  } else if (f.type === 'percent') {
    valueLabel = pctLabel(v);
    lo = f.min + '%';
    hi = f.max + (f.unit ? ' ' + f.unit.replace('% of price', '%') : '%');
    if (f.unit && f.unit.indexOf('%') >= 0) note = f.unit;
  } else if (f.type === 'date') {
    valueLabel = Math.round(v) === 0 ? 'This month' : monthLabel(v);
    lo = 'This month';
    hi = monthLabel(f.max);
  } else {
    valueLabel = Math.round(v) + (f.unit ? ' ' + f.unit : '');
    lo = f.min + (f.unit ? ' ' + f.unit : '');
    hi = f.max + (f.unit ? ' ' + f.unit : '');
  }
  const editable = f.type === 'money' || f.type === 'percent';
  return {
    key: f.key,
    label: f.label + (f.optional ? '  (optional)' : '') + (note ? '  · ' + note : ''),
    isField: true,
    isIncomeField: false,
    valueLabel,
    value: v,
    min: f.min,
    max: f.max,
    step: f.step,
    lo,
    hi,
    editable,
    kind: f.type === 'percent' ? 'percent' : 'money',
    onInput: (n: number) => setParam(f.key, n),
  };
}

function TemplateFields({ src, setParam, incomeStreams }: { src: AnyRec; setField: (f: string, v: unknown) => void; setParam: (f: string, v: unknown) => void; incomeStreams: AnyRec[] }) {
  const tpl = src.template;
  const def = templateDefs()[tpl as keyof ReturnType<typeof templateDefs>];
  const p: AnyRec = src.params || {};
  const sum = milestoneSummary(src, incomeStreams as any, HORIZON);
  const fields = (def.fields || []).map((f) => templateFieldDescriptor(f as AnyRec, p, setParam, incomeStreams));
  const isCustom = tpl === 'custom';
  const prims: Primitive[] = p.prims || [];

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
        <div style={{ flex: 1, background: 'rgba(92,123,138,0.1)', borderRadius: 14, padding: '13px 15px' }}>
          <div style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.05em', color: '#5C7B8A', textTransform: 'uppercase' }}>Up front</div>
          <div style={{ font: "600 19px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', marginTop: 3 }}>
            {(sum.oneTime < 0 ? '+' : '') + money(Math.abs(sum.oneTime))}
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--amber-bg)', borderRadius: 14, padding: '13px 15px' }}>
          <div style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.05em', color: 'var(--amber)', textTransform: 'uppercase' }}>Peak monthly</div>
          <div style={{ font: "600 19px 'Spline Sans'", color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', marginTop: 3 }}>{money(sum.monthlyPeak)}</div>
        </div>
      </div>
      <div style={{ font: "400 13px/1.45 'Spline Sans'", color: 'var(--ink-dim)', margin: '4px 2px 4px' }}>{def.blurb}</div>
      <div style={{ marginTop: 6 }}>
        {fields.map((f) =>
          f.isIncomeField ? (
            <div key={f.key} style={{ padding: '16px 0 4px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ font: "500 14px 'Spline Sans'", color: 'var(--ink)' }}>{f.label}</span>
              <ChoiceRow choices={f.incomeChoices || []} />
            </div>
          ) : (
            <SliderField
              key={f.key}
              label={f.label}
              value={f.value!}
              onChange={(v) => f.onInput?.(v)}
              min={f.min!}
              max={f.max!}
              step={f.step!}
              editable={f.editable}
              kind={f.kind}
              valueDisplay={f.editable ? undefined : f.valueLabel}
              loLabel={f.lo}
              hiLabel={f.hi}
              small
            />
          )
        )}
      </div>
      {isCustom && <CustomPrimitives prims={prims} setParam={setParam} />}
    </>
  );
}

function CustomPrimitives({ prims, setParam }: { prims: Primitive[]; setParam: (f: string, v: unknown) => void }) {
  return (
    <>
      <SectionLabel marginTop={20}>Primitives</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 11 }}>
        {prims.map((pr, idx) => (
          <PrimitiveCard key={idx} pr={pr} idx={idx} prims={prims} setParam={setParam} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
        <AddPrimButton label="+ One-time" onClick={() => setParam('prims', addPrim(prims, 'once'))} />
        <AddPrimButton label="+ Recurring" onClick={() => setParam('prims', addPrim(prims, 'recur'))} />
        <AddPrimButton label="+ Loan" onClick={() => setParam('prims', addPrim(prims, 'loan'))} />
      </div>
    </>
  );
}

function AddPrimButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: 11, cursor: 'pointer', font: "600 12px 'Spline Sans'", background: '#fff', color: 'var(--ink)', border: '1.5px dashed rgba(30,37,34,0.18)' }}>
      {label}
    </div>
  );
}

function PrimitiveCard({ pr, idx, prims, setParam }: { pr: Primitive; idx: number; prims: Primitive[]; setParam: (f: string, v: unknown) => void }) {
  const kindLabel = pr.kind === 'once' ? 'One-time' : pr.kind === 'recur' ? 'Recurring' : 'Loan';
  const set = (field: keyof Primitive, v: unknown) => setParam('prims', setPrim(prims, idx, field, v));

  let fields: { fk: string; label: string; kind: 'money' | 'percent' | 'num'; value: number; min: number; max: number; step: number; valueLabel: string; onChange: (v: number) => void }[];
  if (pr.kind === 'once') {
    fields = [
      { fk: 'amt', label: 'Amount', kind: 'money', value: pr.amt ?? 0, min: 0, max: 50000, step: 500, valueLabel: money(pr.amt ?? 0), onChange: (v) => set('amt', v) },
      { fk: 'month', label: 'When', kind: 'num', value: pr.month ?? 0, min: 0, max: 48, step: 1, valueLabel: monthLabel(pr.month ?? 0), onChange: (v) => set('month', v) },
    ];
  } else if (pr.kind === 'recur') {
    fields = [
      { fk: 'amt', label: 'Amount / mo', kind: 'money', value: pr.amt ?? 0, min: 0, max: 6000, step: 50, valueLabel: money(pr.amt ?? 0), onChange: (v) => set('amt', v) },
      { fk: 'month', label: 'Starts', kind: 'num', value: pr.month ?? 0, min: 0, max: 48, step: 1, valueLabel: monthLabel(pr.month ?? 0), onChange: (v) => set('month', v) },
      { fk: 'months', label: 'For', kind: 'num', value: pr.months ?? 1, min: 1, max: 60, step: 1, valueLabel: Math.round(pr.months ?? 1) + ' mo', onChange: (v) => set('months', v) },
    ];
  } else {
    fields = [
      { fk: 'principal', label: 'Principal', kind: 'money', value: pr.principal ?? 0, min: 0, max: 80000, step: 1000, valueLabel: money(pr.principal ?? 0), onChange: (v) => set('principal', v) },
      { fk: 'apr', label: 'APR', kind: 'percent', value: pr.apr ?? 0, min: 0, max: 25, step: 0.5, valueLabel: (pr.apr ?? 0) + '%', onChange: (v) => set('apr', v) },
      { fk: 'term', label: 'Term', kind: 'num', value: pr.term ?? 1, min: 6, max: 84, step: 6, valueLabel: Math.round(pr.term ?? 1) + ' mo', onChange: (v) => set('term', v) },
      { fk: 'month', label: 'Starts', kind: 'num', value: pr.month ?? 0, min: 0, max: 48, step: 1, valueLabel: monthLabel(pr.month ?? 0), onChange: (v) => set('month', v) },
    ];
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(30,37,34,0.08)', borderRadius: 14, padding: '14px 15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <input
          value={pr.label}
          onChange={(e) => set('label', e.target.value)}
          style={{ border: 'none', background: 'transparent', font: "600 14px 'Spline Sans'", color: 'var(--ink)', outline: 'none', flex: 1, minWidth: 0 }}
        />
        <span style={{ font: "500 10px 'Spline Sans Mono'", letterSpacing: '0.04em', color: 'var(--ink-faint)', textTransform: 'uppercase', flexShrink: 0 }}>{kindLabel}</span>
        <div onClick={() => setParam('prims', removePrim(prims, idx))} style={{ cursor: 'pointer', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 12 12">
            <path d="M2 2l8 8M10 2l-8 8" stroke="var(--debt-bad)" strokeWidth={1.6} strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {fields.map((f) => (
        <SliderField
          key={f.fk}
          label={f.label}
          value={f.value}
          onChange={f.onChange}
          min={f.min}
          max={f.max}
          step={f.step}
          editable={f.kind !== 'num'}
          kind={f.kind === 'percent' ? 'percent' : 'money'}
          valueDisplay={f.kind === 'num' ? f.valueLabel : undefined}
          small
        />
      ))}
    </div>
  );
}
