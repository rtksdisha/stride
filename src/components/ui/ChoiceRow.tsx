interface Choice {
  label: string;
  active: boolean;
  onPick: () => void;
}

export function ChoiceRow({ choices, flex = false }: { choices: Choice[]; flex?: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: flex ? undefined : 'wrap', gap: 7, marginTop: 10 }}>
      {choices.map((c, i) => (
        <div
          key={c.label + i}
          onClick={c.onPick}
          style={{
            flex: flex ? 1 : undefined,
            textAlign: flex ? 'center' : undefined,
            padding: flex ? '10px 4px' : '9px 13px',
            borderRadius: 10,
            cursor: 'pointer',
            font: "600 12px 'Spline Sans'",
            background: c.active ? '#fff' : 'transparent',
            color: c.active ? 'var(--ink)' : '#7B827D',
            border: `1.5px solid ${c.active ? 'rgba(47,125,91,0.55)' : 'rgba(30,37,34,0.1)'}`,
          }}
        >
          {c.label}
        </div>
      ))}
    </div>
  );
}
