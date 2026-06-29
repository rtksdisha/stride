import type { ReactNode } from 'react';
import { EditableNumber } from './EditableNumber';

interface SliderFieldProps {
  label: ReactNode;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  editable?: boolean;
  kind?: 'money' | 'percent';
  valueDisplay?: ReactNode;
  valueColor?: string;
  suffix?: string;
  loLabel?: ReactNode;
  hiLabel?: ReactNode;
  border?: 'top' | 'bottom' | 'none';
  small?: boolean;
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  editable = true,
  kind = 'money',
  valueDisplay,
  valueColor,
  suffix,
  loLabel,
  hiLabel,
  border = 'bottom',
  small = false,
}: SliderFieldProps) {
  return (
    <div
      style={{
        padding: small ? '11px 0 2px' : '18px 0 4px',
        borderBottom: border === 'bottom' ? '1px solid var(--line)' : undefined,
        borderTop: border === 'top' ? '1px solid var(--line)' : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ font: `${small ? 400 : 500} ${small ? 12 : 14}px 'Spline Sans'`, color: small ? 'var(--ink-dim)' : 'var(--ink)' }}>{label}</span>
        {valueDisplay !== undefined ? (
          <span
            style={{
              font: `600 ${small ? 13 : 17}px 'Spline Sans'`,
              color: valueColor || 'var(--ink)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {valueDisplay}
          </span>
        ) : editable ? (
          <span style={{ font: `600 ${small ? 13 : 17}px 'Spline Sans'`, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
            <EditableNumber value={value} onChange={onChange} kind={kind} min={min} max={max} width={small ? 92 : 104} suffix={suffix} />
          </span>
        ) : null}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ marginTop: small ? 9 : 13, display: 'block' }}
      />
      {(loLabel || hiLabel) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 9,
            marginBottom: 6,
            font: "400 11px 'Spline Sans Mono'",
            color: 'var(--ink-faint-2)',
          }}
        >
          <span>{loLabel}</span>
          <span>{hiLabel}</span>
        </div>
      )}
    </div>
  );
}
