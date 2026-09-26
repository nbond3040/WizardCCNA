import type { HeaderDiagram } from '../../content/types';
import { clamp, svgText, tone, toneSoft, useWidth, wrapText } from './util';

export function Header({ d }: { d: HeaderDiagram }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const layout = d.layout ?? 'rows';
  const unit = d.unit ?? 'bits';
  const sizeText = (n: number) => `${n} ${unit === 'bits' ? (n === 1 ? 'bit' : 'bits') : n === 1 ? 'byte' : 'bytes'}`;

  if (layout === 'line') {
    const W = clamp(width, 300, 1000);
    const weights = d.fields.map((f) => Math.sqrt(f.size));
    const total = weights.reduce((a, b) => a + b, 0);
    let widths = weights.map((w) => Math.max(70, (W * w) / total));
    const sum = widths.reduce((a, b) => a + b, 0);
    widths = widths.map((w) => (w * W) / sum);
    const h = 58;
    let x = 0;
    return (
      <div ref={ref} className="dg dg-header">
        <svg width={W} height={h + 40} viewBox={`-1 -1 ${W + 2} ${h + 40}`} role="img" aria-label="Frame format diagram">
          {d.fields.map((f, i) => {
            const w = widths[i];
            const x0 = x;
            x += w;
            const lines = wrapText(svgText(f.label), Math.max(6, Math.floor(w / 7.4)), 2);
            return (
              <g key={i}>
                <rect x={x0} y={0} width={w} height={h} fill={f.tone ? toneSoft(f.tone) : 'var(--d-fill)'} stroke={f.tone ? tone(f.tone) : 'var(--d-ink)'} strokeWidth={1.3} />
                {lines.map((line, j) => (
                  <text key={j} x={x0 + w / 2} y={h / 2 + 5 - (lines.length - 1) * 8 + j * 16} textAnchor="middle" className="dg-field" fill={f.tone ? tone(f.tone) : undefined}>
                    {line}
                  </text>
                ))}
                <text x={x0 + w / 2} y={h + 18} textAnchor="middle" className="dg-sub">
                  {sizeText(f.size)}
                </text>
                {f.sub && (
                  <text x={x0 + w / 2} y={h + 33} textAnchor="middle" className="dg-sub faint-text">
                    {svgText(f.sub)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {d.caption && <div className="dg-caption">{svgText(d.caption)}</div>}
      </div>
    );
  }

  const per = d.bitsPerRow ?? 32;
  const W = clamp(width, 320, 860);
  const cell = W / per;
  const rowH = 46;
  const top = 26;
  // place fields into row segments
  type Seg = { row: number; start: number; len: number; fi: number };
  const segs: Seg[] = [];
  let pos = 0;
  d.fields.forEach((f, fi) => {
    let remaining = f.size;
    while (remaining > 0) {
      const row = Math.floor(pos / per);
      const start = pos % per;
      const len = Math.min(remaining, per - start);
      segs.push({ row, start, len, fi });
      pos += len;
      remaining -= len;
    }
  });
  const rows = Math.ceil(pos / per);
  // merge consecutive full-row segments of the same field into one tall block
  const blocks: { row: number; rows: number; start: number; len: number; fi: number }[] = [];
  for (const s of segs) {
    const prev = blocks[blocks.length - 1];
    if (prev && prev.fi === s.fi && prev.start === 0 && prev.len === per && s.start === 0 && s.len === per) prev.rows += 1;
    else blocks.push({ row: s.row, rows: 1, start: s.start, len: s.len, fi: s.fi });
  }
  const labelled = new Set<number>();
  const H = top + rows * rowH + 8;
  const ticks = per === 32 ? [0, 8, 16, 24, 31] : [0, per - 1];
  return (
    <div ref={ref} className="dg dg-header">
      <svg width={W} height={H} viewBox={`-1 0 ${W + 2} ${H}`} role="img" aria-label="Header format diagram">
        {ticks.map((t) => (
          <text key={t} x={t * cell + cell / 2} y={14} textAnchor="middle" className="dg-tick">
            {t}
          </text>
        ))}
        {Array.from({ length: per + 1 }, (_, i) => (
          <line key={i} x1={i * cell} y1={18} x2={i * cell} y2={i % 8 === 0 ? 24 : 21} stroke="var(--d-muted)" strokeWidth={1} />
        ))}
        {blocks.map((b, i) => {
          const f = d.fields[b.fi];
          const x = b.start * cell;
          const y = top + b.row * rowH;
          const w = b.len * cell;
          const h = b.rows * rowH;
          const showLabel = !labelled.has(b.fi) && (w > 30 || d.fields[b.fi].size <= b.len);
          if (showLabel) labelled.add(b.fi);
          const lines = wrapText(svgText(f.label), Math.max(4, Math.floor(w / 7.2)), 2);
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill={f.tone ? toneSoft(f.tone) : 'var(--d-fill)'} stroke={f.tone ? tone(f.tone) : 'var(--d-ink)'} strokeWidth={1.2} />
              {showLabel && (
                <>
                  {lines.map((line, j) => (
                    <text key={j} x={x + w / 2} y={y + h / 2 - (lines.length - 1) * 7 + j * 14 + (w > 60 ? -1 : 4)} textAnchor="middle" className="dg-field" fill={f.tone ? tone(f.tone) : undefined}>
                      {line}
                    </text>
                  ))}
                  {w > 60 && (
                    <text x={x + w / 2} y={y + h / 2 + (lines.length - 1) * 7 + 14} textAnchor="middle" className="dg-sub">
                      {f.sub ? svgText(f.sub) : sizeText(f.size)}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}
      </svg>
      {d.caption && <div className="dg-caption">{svgText(d.caption)}</div>}
    </div>
  );
}
