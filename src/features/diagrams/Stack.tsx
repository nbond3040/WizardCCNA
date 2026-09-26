import type { StackDiagram } from '../../content/types';
import { clamp, svgText, tone, toneSoft, useWidth, wrapText } from './util';

export function Stack({ d }: { d: StackDiagram }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const C = d.columns.length;
  const gap = 20;
  const colW = clamp((clamp(width, 260, 900) - (C - 1) * gap) / C, 120, 250);
  const W = C * colW + (C - 1) * gap;
  const totalRows = Math.max(...d.columns.map((c) => c.layers.reduce((a, l) => a + (l.span ?? 1), 0)));
  const rowH = totalRows > 8 ? 36 : 44;
  const hasTitles = d.columns.some((c) => c.title);
  const top = hasTitles ? 28 : 0;
  const H = top + totalRows * rowH;
  return (
    <div ref={ref} className="dg dg-stack">
      <svg width={W} height={H} viewBox={`-1 -1 ${W + 2} ${H + 2}`} role="img" aria-label="Layer stack diagram">
        {d.columns.map((c, ci) => {
          const x = ci * (colW + gap);
          let row = 0;
          return (
            <g key={ci}>
              {c.title && (
                <text x={x + colW / 2} y={16} textAnchor="middle" className="dg-col-title">
                  {svgText(c.title)}
                </text>
              )}
              {c.layers.map((l, li) => {
                const span = l.span ?? 1;
                const y = top + row * rowH;
                row += span;
                const h = span * rowH - 6;
                const lines = wrapText(svgText(l.label), Math.floor(colW / 7.6), 2);
                const subY = y + h / 2 + (lines.length - 1) * 7 + 13;
                return (
                  <g key={li}>
                    <rect x={x} y={y} width={colW} height={h} rx={8} fill={l.tone ? toneSoft(l.tone) : 'var(--d-fill)'} stroke={l.tone ? tone(l.tone) : 'var(--d-ink)'} strokeWidth={1.3} />
                    {lines.map((line, j) => (
                      <text key={j} x={x + colW / 2} y={y + h / 2 + (l.sub ? -2 : 5) - (lines.length - 1) * 7 + j * 14} textAnchor="middle" className="dg-layer" fill={l.tone ? tone(l.tone) : undefined}>
                        {line}
                      </text>
                    ))}
                    {l.sub && h > 34 && (
                      <text x={x + colW / 2} y={subY} textAnchor="middle" className="dg-sub">
                        {svgText(l.sub)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
