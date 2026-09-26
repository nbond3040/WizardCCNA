import type { BitsDiagram } from '../../content/types';
import { clamp, svgText, tone, useWidth } from './util';

function toBits(value: string): string {
  if (/^[01]{32}$/.test(value)) return value;
  return value
    .split('.')
    .map((o) => Number(o).toString(2).padStart(8, '0'))
    .join('');
}

export function Bits({ d }: { d: BitsDiagram }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const showDec = d.showDecimal !== false;
  const hasLabels = d.rows.some((r) => r.label);
  const labelW = hasLabels ? clamp(Math.max(...d.rows.map((r) => svgText(r.label).length)) * 7.4 + 16, 60, 150) : 0;
  const octGap = 10;
  const avail = clamp(width, 300, 900) - labelW - octGap * 3;
  const cell = clamp(avail / 32, 11, 22);
  const cw = cell - 2;
  const rowH = cell + (showDec ? 30 : 12);
  const W = labelW + cell * 32 + octGap * 3;
  const H = d.rows.length * rowH + 4;
  const fs = clamp(cell * 0.6, 9, 13);
  return (
    <div ref={ref} className="dg dg-bits">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Binary address diagram">
        {d.rows.map((r, ri) => {
          const bits = toBits(r.value);
          const y = ri * rowH + 2;
          const octets = [0, 1, 2, 3].map((o) => parseInt(bits.slice(o * 8, o * 8 + 8), 2));
          const xOf = (i: number) => labelW + i * cell + Math.floor(i / 8) * octGap;
          return (
            <g key={ri}>
              {r.label && (
                <text x={labelW - 12} y={y + cell / 2 + 4} textAnchor="end" className="dg-bits-label" fill={r.tone ? tone(r.tone) : undefined}>
                  {svgText(r.label)}
                </text>
              )}
              {bits.split('').map((b, i) => {
                const net = r.prefix !== undefined && i < r.prefix;
                const host = r.prefix !== undefined && i >= r.prefix;
                return (
                  <g key={i}>
                    <rect
                      x={xOf(i) + 1}
                      y={y}
                      width={cw}
                      height={cell}
                      rx={3}
                      fill={net ? 'var(--accent-soft)' : 'var(--d-fill-2)'}
                      stroke={net ? 'var(--accent)' : 'var(--border)'}
                      strokeOpacity={net ? 0.5 : 1}
                    />
                    <text x={xOf(i) + 1 + cw / 2} y={y + cell / 2 + fs * 0.36} textAnchor="middle" className="dg-bit" style={{ fontSize: fs }} fill={net ? 'var(--accent)' : host ? 'var(--muted)' : 'var(--text)'}>
                      {b}
                    </text>
                  </g>
                );
              })}
              {r.prefix !== undefined && r.prefix > 0 && r.prefix < 32 && (
                <line
                  x1={xOf(r.prefix) - (r.prefix % 8 === 0 ? octGap / 2 : 0) + 0.5}
                  y1={y - 3}
                  x2={xOf(r.prefix) - (r.prefix % 8 === 0 ? octGap / 2 : 0) + 0.5}
                  y2={y + cell + 3}
                  stroke="var(--accent)"
                  strokeWidth={2}
                />
              )}
              {showDec &&
                octets.map((o, oi) => (
                  <text key={oi} x={xOf(oi * 8) + (cell * 8) / 2} y={y + cell + 17} textAnchor="middle" className="dg-dec" fill={r.tone ? tone(r.tone) : undefined}>
                    {o}
                  </text>
                ))}
              {showDec && [1, 2, 3].map((k) => (
                <text key={`dot${k}`} x={xOf(k * 8) - octGap / 2} y={y + cell + 17} textAnchor="middle" className="dg-dec muted-fill">.</text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
