import { useRef } from 'react';
import { fmt, monthLabel, money } from '../lib/format';

export interface ChartMarker {
  m: number;
  label: string;
  color: string;
}

interface ChartProps {
  series: number[];
  height?: number;
  padTop?: number;
  baseline?: number[] | null;
  preview?: number[] | null;
  previewColor?: string;
  markers?: ChartMarker[];
  hover: number | null;
  onHover: (i: number | null) => void;
  accent?: string;
  id: string;
  brokeLimit?: number;
}

export function Chart({ series, height = 230, padTop = 28, baseline, preview, previewColor, markers = [], hover, onHover, accent, id, brokeLimit = 0 }: ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 700;
  const H = height;
  const padX = 16;
  const padBot = 30;
  const N = series.length;
  const vals = baseline ? series.concat(baseline) : series.slice();
  let maxV = Math.max(...vals, brokeLimit);
  let minV = Math.min(...vals, brokeLimit);
  const padV = (maxV - minV) * 0.12 || 1;
  maxV += padV;
  minV -= padV;
  const rng = maxV - minV || 1;
  const X = (i: number) => padX + (i / (N - 1)) * (W - 2 * padX);
  const Y = (v: number) => padTop + (1 - (v - minV) / rng) * (H - padTop - padBot);
  const neg = series.some((v) => v < brokeLimit);
  const c = accent || (neg ? '#C0792E' : '#2F7D5B');
  const gid = 'g' + id;

  const linePts = series.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const areaD =
    `M${X(0).toFixed(1)},${Y(series[0]).toFixed(1)} ` +
    series.map((v, i) => `L${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ') +
    ` L${X(N - 1).toFixed(1)},${H - padBot} L${X(0).toFixed(1)},${H - padBot} Z`;

  // Dynamically adjust x-axis ticks based on timeline duration
  const len = N - 1; // duration in months
  let tickInterval = 12;
  if (len <= 6) tickInterval = 1;
  else if (len <= 12) tickInterval = 2;
  else if (len <= 24) tickInterval = 6;
  else if (len <= 36) tickInterval = 6;
  else tickInterval = 12;

  const ticks: { ti: number; tx: number; anchor: string }[] = [];
  for (let ti = 0; ti <= len; ti += tickInterval) {
    ticks.push({
      ti,
      tx: X(ti),
      anchor: ti === 0 ? 'start' : ti === len ? 'end' : 'middle'
    });
  }
  // Force include the last tick if it didn't align exactly
  if (ticks.length > 0 && ticks[ticks.length - 1].ti !== len) {
    ticks.push({
      ti: len,
      tx: X(len),
      anchor: 'end'
    });
  }

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let i = Math.round((px - padX) / ((W - 2 * padX) / (N - 1)));
    i = Math.min(Math.max(i, 0), N - 1);
    onHover(i);
  }

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1={0} y1={0} x2={0} y2={1}>
          <stop offset="0%" stopColor={c} stopOpacity={0.16} />
          <stop offset="100%" stopColor={c} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Dynamic broke line indicator */}
      {minV < brokeLimit && maxV > brokeLimit && (
        <>
          <line x1={padX} x2={W - padX} y1={Y(brokeLimit)} y2={Y(brokeLimit)} stroke="#E2433C" strokeWidth={1} strokeDasharray="2 4" opacity={0.55} />
          <text x={padX + 2} y={Y(brokeLimit) - 5} fontSize={10} fontFamily="Spline Sans Mono" fill="#E2433C" opacity={0.7}>
            broke line · {money(brokeLimit)}
          </text>
        </>
      )}
      <path d={areaD} fill={`url(#${gid})`} />
      {baseline && (
        <polyline
          points={baseline.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}
          fill="none"
          stroke="#B6BCB6"
          strokeWidth={2}
          strokeDasharray="3 5"
          strokeLinecap="round"
        />
      )}
      {preview && (
        <polyline
          points={preview.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}
          fill="none"
          stroke={previewColor || 'var(--green)'}
          strokeWidth={2.5}
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
      )}
      <polyline points={linePts} fill="none" stroke={c} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {markers.map((mk, idx) => {
        const mmi = Math.min(Math.max(mk.m, 0), N - 1);
        const mx = X(mmi);
        const my = Y(series[mmi]);
        const tx = Math.min(Math.max(mx, padX + 24), W - padX - 24);
        return (
          <g key={'mk' + idx}>
            <line x1={mx} x2={mx} y1={my} y2={H - padBot} stroke={mk.color} strokeWidth={1} opacity={0.25} />
            <circle cx={mx} cy={my} r={5} fill="#fff" stroke={mk.color} strokeWidth={2.5} />
            <text x={tx} y={my - 12} fontSize={10.5} fontFamily="Spline Sans Mono" fill={mk.color} textAnchor="middle" fontWeight={500}>
              {mk.label}
            </text>
          </g>
        );
      })}
      {ticks.map(({ ti, tx, anchor }, t) => (
        <g key={'ax' + t}>
          <line x1={tx} x2={tx} y1={H - padBot} y2={H - padBot + 4} stroke="rgba(30,37,34,0.18)" strokeWidth={1} />
          <text x={tx} y={H - 9} fontSize={9.5} fontFamily="Spline Sans Mono" fill="#A8AEA8" textAnchor={anchor as 'start' | 'middle' | 'end'}>
            {monthLabel(ti)}
          </text>
        </g>
      ))}
      {hover != null && hover >= 0 && hover < N && (
        <g>
          <line x1={X(hover)} x2={X(hover)} y1={padTop - 6} y2={H - padBot} stroke="#1E2522" strokeWidth={1} opacity={0.18} />
          <circle cx={X(hover)} cy={Y(series[hover])} r={5.5} fill={c} stroke="#fff" strokeWidth={2.5} />
          {(() => {
            const bw = 116;
            const bh = 42;
            let bx = X(hover) - bw / 2;
            bx = Math.min(Math.max(bx, padX), W - padX - bw);
            const by = Math.max(padTop - 8, Y(series[hover]) - bh - 14);
            return (
              <g>
                <rect x={bx} y={by} width={bw} height={bh} rx={9} fill="#1E2522" />
                <text x={bx + 12} y={by + 17} fontSize={10.5} fontFamily="Spline Sans Mono" fill="rgba(255,255,255,0.6)">
                  {monthLabel(hover)}
                </text>
                <text x={bx + 12} y={by + 33} fontSize={15} fontFamily="Spline Sans" fontWeight={600} fill="#fff">
                  {fmt(series[hover])}
                </text>
              </g>
            );
          })()}
        </g>
      )}
      <rect
        x={0}
        y={0}
        width={W}
        height={H}
        fill="transparent"
        style={{ cursor: 'crosshair' }}
        onMouseMove={handleMove}
        onMouseLeave={() => onHover(null)}
      />
    </svg>
  );
}
