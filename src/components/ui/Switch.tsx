interface SwitchProps {
  on: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}

export function Switch({ on, onToggle, size = 'md' }: SwitchProps) {
  const w = size === 'md' ? 38 : 34;
  const h = size === 'md' ? 22 : 20;
  const knob = size === 'md' ? 18 : 16;
  const left = on ? w - knob - 2 : 2;
  return (
    <div
      onClick={onToggle}
      style={{
        width: w,
        height: h,
        borderRadius: 999,
        background: on ? 'var(--green)' : 'rgba(30,37,34,0.16)',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background .15s',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left,
          width: knob,
          height: knob,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(30,37,34,0.3)',
          transition: 'left .15s',
        }}
      />
    </div>
  );
}
