import { fmt, monthLabel } from '../lib/format';

interface DebtCompareChartProps {
  avaSeries: number[];
  snoSeries: number[];
  minSeries: number[];
  strategy: 'avalanche' | 'snowball';
  hover: number | null;
  onHover: (i: number | null) => void;
}

export function DebtCompareChart({ avaSeries, snoSeries, minSeries, strategy, hover, onHover }: DebtCompareChartProps) {
  const W = 660;
  const H = 196;
  const padX = 16;
  const padTop = 22;
  const padBot = 26;
  const all = avaSeries.concat(snoSeries, minSeries);
  const Nmax = Math.max(avaSeries.length, snoSeries.length, minSeries.length);
  const maxV = Math.max(...all, 1);
  const X = (i: number) => padX + (Nmax <= 1 ? 0 : (i / (Nmax - 1)) * (W - 2 * padX));
  const Y = (v: number) => padTop + (1 - v / maxV) * (H - padTop - padBot);
  const poly = (ser: number[], color: string, dash: string | undefined, w: number) => (
    <polyline
      points={ser.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeDasharray={dash}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
  const avaActive = strategy === 'avalanche';

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let i = Math.round((px - padX) / ((W - 2 * padX) / Math.max(1, Nmax - 1)));
    i = Math.min(Math.max(i, 0), Nmax - 1);
    onHover(i);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <line x1={padX} x2={W - padX} y1={Y(0)} y2={Y(0)} stroke="rgba(30,37,34,0.18)" strokeWidth={1} />
      <text x={padX + 2} y={Y(0) - 5} fontSize={9.5} fontFamily="Spline Sans Mono" fill="#A8AEA8">
        debt-free
      </text>
      {poly(minSeries, '#B6BCB6', '3 5', 1.8)}
      {poly(snoSeries, avaActive ? 'rgba(138,111,176,0.45)' : '#8A6FB0', undefined, avaActive ? 2 : 3)}
      {poly(avaSeries, avaActive ? '#2F7D5B' : 'rgba(47,125,91,0.45)', undefined, avaActive ? 3 : 2)}
      {hover != null && hover >= 0 && (
        <g>
          {(() => {
            const hi = Math.min(hover, Nmax - 1);
            const hx = X(hi);
            const av = avaSeries[Math.min(hi, avaSeries.length - 1)];
            const sn = snoSeries[Math.min(hi, snoSeries.length - 1)];
            const bw = 128;
            const bh = 50;
            let bx = hx - bw / 2;
            bx = Math.min(Math.max(bx, padX), W - padX - bw);
            const by = padTop - 6;
            return (
              <>
                <line x1={hx} x2={hx} y1={padTop - 4} y2={H - padBot} stroke="#1E2522" strokeWidth={1} opacity={0.16} />
                <circle cx={hx} cy={Y(av)} r={4} fill="#2F7D5B" stroke="#fff" strokeWidth={2} />
                <circle cx={hx} cy={Y(sn)} r={4} fill="#8A6FB0" stroke="#fff" strokeWidth={2} />
                <rect x={bx} y={by} width={bw} height={bh} rx={9} fill="#1E2522" />
                <text x={bx + 11} y={by + 15} fontSize={9.5} fontFamily="Spline Sans Mono" fill="rgba(255,255,255,0.55)">
                  {monthLabel(hi)}
                </text>
                <text x={bx + 11} y={by + 30} fontSize={11.5} fontFamily="Spline Sans" fontWeight={600} fill="#6FB894">
                  {'Aval ' + fmt(av)}
                </text>
                <text x={bx + 11} y={by + 44} fontSize={11.5} fontFamily="Spline Sans" fontWeight={600} fill="#B79AD6">
                  {'Snow ' + fmt(sn)}
                </text>
              </>
            );
          })()}
        </g>
      )}
      <rect x={0} y={0} width={W} height={H} fill="transparent" style={{ cursor: 'crosshair' }} onMouseMove={handleMove} onMouseLeave={() => onHover(null)} />
    </svg>
  );
}
