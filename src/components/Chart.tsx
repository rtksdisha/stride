import { useRef } from 'react';
import { fmt, monthLabel, money } from '../lib/format';

export interface ChartMarker {
  m: number;
  label: string;
  color: string;
  glyph?: string;
  amount?: number;
  ahead?: number;
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
  const c = neg ? 'var(--debt-bad)' : (accent || 'var(--green)');
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

  const yTicks = [
    minV + rng * 0.25,
    minV + rng * 0.5,
    minV + rng * 0.75,
  ];

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1={0} y1={0} x2={0} y2={1}>
          <stop offset="0%" stopColor={c} stopOpacity={0.16} />
          <stop offset="100%" stopColor={c} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Y-axis grid lines and labels */}
      {yTicks.map((val, t) => (
        <g key={'yax' + t}>
          <line x1={padX} x2={W - padX} y1={Y(val)} y2={Y(val)} stroke="rgba(30,37,34,0.06)" strokeWidth={1} style={{ transition: 'y1 0.35s ease, y2 0.35s ease' }} />
          <text x={padX + 2} y={Y(val) - 4} fontSize={9} fontFamily="Spline Sans Mono" fill="#A8AEA8" style={{ transition: 'y 0.35s ease' }}>
            {money(val)}
          </text>
        </g>
      ))}
      {/* Dynamic broke line indicator */}
      {minV < brokeLimit && maxV > brokeLimit && (
        <>
          <line x1={padX} x2={W - padX} y1={Y(brokeLimit)} y2={Y(brokeLimit)} stroke="#E2433C" strokeWidth={1} strokeDasharray="2 4" opacity={0.55} style={{ transition: 'y1 0.35s ease, y2 0.35s ease' }} />
          <text x={padX + 2} y={Y(brokeLimit) - 5} fontSize={10} fontFamily="Spline Sans Mono" fill="#E2433C" opacity={0.7} style={{ transition: 'y 0.35s ease' }}>
            broke line · {money(brokeLimit)}
          </text>
        </>
      )}
      <path d={areaD} fill={`url(#${gid})`} style={{ transition: 'd 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      {baseline && (
        <polyline
          points={baseline.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}
          fill="none"
          stroke="#B6BCB6"
          strokeWidth={2}
          strokeDasharray="3 5"
          strokeLinecap="round"
          style={{ transition: 'points 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      )}
      {preview && (
        <polyline
          points={preview.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}
          fill="none"
          stroke={previewColor || 'var(--ink)'}
          strokeWidth={2.5}
          strokeDasharray="4 4"
          strokeLinecap="round"
          style={{ transition: 'points 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      )}
      <polyline points={linePts} fill="none" stroke={c} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" style={{ transition: 'points 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      {markers.map((mk, idx) => {
        const mmi = Math.min(Math.max(mk.m, 0), N - 1);
        const mx = X(mmi);
        const my = Y(series[mmi]);
        const tx = Math.min(Math.max(mx, padX + 24), W - padX - 24);
        const hasPill = !!mk.glyph;
        const isMarkerAtRisk = (mk.ahead != null && mk.ahead < 0) || series.slice(mmi).some((v) => v < brokeLimit);
        const markerColor = isMarkerAtRisk ? 'var(--debt-bad)' : mk.color;
        const markerLabel = isMarkerAtRisk ? `⚠️ ${mk.label}` : mk.label;
        const labelText = mk.glyph ? `${mk.glyph} ${markerLabel}` : markerLabel;
        const pillW = hasPill ? labelText.length * 6.2 + 18 : 0;
        const pillX = hasPill ? Math.min(Math.max(mx - pillW / 2, padX), W - padX - pillW) : 0;
        const transitionStyle = { transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)' };

        return (
          <g key={'mk' + idx}>
            {/* Grid leader line to bottom */}
            <line x1={mx} x2={mx} y1={my} y2={H - padBot} stroke={markerColor} strokeWidth={1} opacity={0.15} style={transitionStyle} />
            
            {/* Circle dot on curve */}
            <circle cx={mx} cy={my} r={5} fill="#fff" stroke={markerColor} strokeWidth={2.5} style={transitionStyle} />

            {/* Vertical drop line */}
            {mk.amount && mk.amount > 0 && (
              <line x1={mx} x2={mx} y1={Y(Math.max(minV, Math.min(maxV, series[mmi] + mk.amount)))} y2={my} stroke={markerColor} strokeWidth={1.5} strokeDasharray="2 3" style={transitionStyle} />
            )}

            {hasPill ? (
              <g style={transitionStyle}>
                {/* Short leader line from dot to pill */}
                <line x1={mx} x2={mx} y1={my - 5} y2={my - 24} stroke={markerColor} strokeWidth={1.5} style={transitionStyle} />
                {/* Floating dark pill container */}
                <g transform={`translate(${pillX}, ${my - 43})`} style={transitionStyle}>
                  <rect width={pillW} height={19} rx={9.5} fill={isMarkerAtRisk ? 'var(--debt-bad)' : 'var(--ink)'} />
                  <text
                    x={pillW / 2}
                    y={12.5}
                    fontSize={9}
                    fontFamily="Spline Sans"
                    fill="#fff"
                    textAnchor="middle"
                    fontWeight={600}
                  >
                    {labelText}
                  </text>
                </g>
              </g>
            ) : (
              /* Fallback simple plain text label for other markers */
              <text x={tx} y={my - 12} fontSize={10.5} fontFamily="Spline Sans Mono" fill={markerColor} textAnchor="middle" fontWeight={500} style={transitionStyle}>
                {markerLabel}
              </text>
            )}
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
            const bw = 135;
            const bh = 42;
            let bx = X(hover) - bw / 2;
            bx = Math.min(Math.max(bx, padX), W - padX - bw);
            const by = Math.max(padTop - 8, Y(series[hover]) - bh - 14);
            return (
              <g>
                <rect x={bx} y={by} width={bw} height={bh} rx={9} fill="#1E2522" />
                <text x={bx + 12} y={by + 17} fontSize={10.5} fontFamily="Spline Sans Mono" fill="rgba(255,255,255,0.6)">
                  {monthLabel(hover)} (Month {hover})
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
