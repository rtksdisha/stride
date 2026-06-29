import { useRef, useState, type CSSProperties } from 'react';
import { money, pctLabel, parseNumStr } from '../../lib/format';

interface EditableNumberProps {
  value: number;
  onChange: (n: number) => void;
  kind?: 'money' | 'percent';
  min?: number;
  max?: number;
  width?: number;
  style?: CSSProperties;
  suffix?: string;
}

function fmtEdit(v: number, kind: 'money' | 'percent'): string {
  return kind === 'percent' ? pctLabel(v) : money(v);
}

function draftInit(v: number, kind: 'money' | 'percent'): string {
  return kind === 'percent' ? String(+v.toFixed(2)) : String(Math.round(v));
}

export function EditableNumber({ value, onChange, kind = 'money', min, max, width = 100, style, suffix }: EditableNumberProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', justifyContent: 'flex-end' }}>
      <input
        ref={inputRef}
        className="edit-input"
        value={editing ? draft : fmtEdit(value, kind)}
        onFocus={() => {
          setEditing(true);
          setDraft(draftInit(value, kind));
          requestAnimationFrame(() => inputRef.current?.select());
        }}
        onChange={(e) => {
          const d = e.target.value;
          const n = parseNumStr(d);
          if (n != null) {
            let v = n;
            if (min != null) v = Math.max(min, v);
            if (max != null) v = Math.min(max, v);
            onChange(v);
          }
          setDraft(d);
        }}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur();
        }}
        style={{ textAlign: 'right', width, ...style }}
      />
      {suffix ? <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--ink-faint)', marginLeft: 2 }}>{suffix}</span> : null}
    </span>
  );
}
