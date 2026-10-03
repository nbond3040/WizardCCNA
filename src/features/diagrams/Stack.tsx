import type { StackDiagram } from '../../content/types';
import { clamp, svgText, tone, toneSoft, useWidth, wrapText } from './util';

export function Stack({ d }: { d: StackDiagram }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const C = d.columns.length;
  const gap = 20;
  const colW = clamp((clamp(width, 260, 900) - (C - 1) * gap) / C, 110, 250);
  const W = C * colW + (C - 1) * gap;
  const totalRows = Math.max(...d.columns.map((c) => c.layers.reduce((a, l) => a + (l.span ?? 1), 0)));

  // Wrap every label to its column width first, then size the rows to the tallest wrapped text.
  const labelCap = Math.max(6, Math.floor((colW - 12) / 7.6));
  const subCap = Math.max(8, Math.floor((colW - 14) / 7));
  const wrapped = d.columns.map((c) =>
    c.layers.map((l) => ({
      label: wrapText(svgText(l.label), labelCap, 2),
      sub: l.sub ? wrapText(svgText(l.sub), subCap, 3) : [],
    })),
  );
  const maxLabelLines = Math.max(1, ...wrapped.flat().map((w) => w.label.length));
  const maxSubLines = Math.max(0, ...wrapped.flat().map((w) => w.sub.length));
  const textH = maxLabelLines * 15 + (maxSubLines ? maxSubLines * 12 + 4 : 0) + 16;
  const rowH = Math.max(totalRows > 8 ? 36 : 44, textH + 6);

  // Column titles are uppercase with letter spacing (~8px per character), so wrap them to the column.
  const titleCap = Math.max(8, Math.floor((colW - 8) / 8));
  const titles = d.columns.map((c) => (c.title ? wrapText(svgText(c.title), titleCap, 2) : []));
  const titleLines = Math.max(0, ...titles.map((t) => t.length));
  const top = titleLines ? 14 + titleLines * 13 : 0;
  const H = top + totalRows * rowH;
  return (
    <div ref={ref} className="dg dg-stack">
      <svg width={W} height={H} viewBox={`-1 -1 ${W + 2} ${H + 2}`} role="img" aria-label="Layer stack diagram">
        {d.columns.map((c, ci) => {
          const x = ci * (colW + gap);
          let row = 0;
          return (
            <g key={ci}>
              {titles[ci].map((line, j) => (
                <text key={j} x={x + colW / 2} y={16 + j * 13} textAnchor="middle" className="dg-col-title">
                  {line}
                </text>
              ))}
              {c.layers.map((l, li) => {
                const span = l.span ?? 1;
                const y = top + row * rowH;
                row += span;
                const h = span * rowH - 6;
                const w = wrapped[ci][li];
                const block = w.label.length * 15 + (w.sub.length ? w.sub.length * 12 + 4 : 0);
                const y0 = y + (h - block) / 2 + 11; // first label baseline, block centered in the box
                return (
                  <g key={li}>
                    <rect x={x} y={y} width={colW} height={h} rx={8} fill={l.tone ? toneSoft(l.tone) : 'var(--d-fill)'} stroke={l.tone ? tone(l.tone) : 'var(--d-ink)'} strokeWidth={1.3} />
                    {w.label.map((line, j) => (
                      <text key={j} x={x + colW / 2} y={y0 + j * 15} textAnchor="middle" className="dg-layer" fill={l.tone ? tone(l.tone) : undefined}>
                        {line}
                      </text>
                    ))}
                    {w.sub.map((line, j) => (
                      <text key={`s${j}`} x={x + colW / 2} y={y0 + w.label.length * 15 - 1 + j * 12} textAnchor="middle" className="dg-sub">
                        {line}
                      </text>
                    ))}
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
