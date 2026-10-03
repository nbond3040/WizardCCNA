import { useId } from 'react';
import type { SequenceDiagram } from '../../content/types';
import { DeviceIcon } from './icons';
import { clamp, svgText, tone, useWidth, wrapText } from './util';

export function Sequence({ d }: { d: SequenceDiagram }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const uid = useId().replace(/:/g, '');
  const n = d.actors.length;
  const W = clamp(width, Math.max(480, n * 130), Math.max(520, n * 230));
  const colW = W / n;
  const xOf: Record<string, number> = {};
  d.actors.forEach((a, i) => (xOf[a.id] = colW * (i + 0.5)));
  const hasIcons = d.actors.some((a) => a.icon);
  const headH = hasIcons ? 78 : 40;
  const maxChars = Math.max(14, Math.floor(colW / 6.6));

  // layout rows
  let y = headH + 14;
  const rows = d.steps.map((s) => {
    if ('note' in s) {
      const lines = wrapText(svgText(s.note), Math.floor((W - 40) / 6.6), 3);
      const h = 14 + lines.length * 16;
      const r = { y, h, lines };
      y += h + 12;
      return r;
    }
    const span = Math.abs(xOf[s.to] - xOf[s.from]) || colW;
    const lines = wrapText(svgText(s.label), Math.max(maxChars, Math.floor(span / 6.8)), 2);
    const subLines = s.sub ? wrapText(svgText(s.sub), Math.max(maxChars, Math.floor(span / 6.2)), 2) : [];
    const h = 18 + lines.length * 16 + subLines.length * 14 + 8;
    const r = { y, h, lines, subLines };
    y += h;
    return r;
  });
  const H = y + 10;

  return (
    <div ref={ref} className="dg dg-sequence">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sequence diagram">
        <defs>
          {(['default', 'accent', 'muted', 'good', 'bad', 'warn'] as const).map((t) => (
            <marker key={t} id={`${uid}-s-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill={tone(t)} />
            </marker>
          ))}
        </defs>
        {d.actors.map((a) => (
          <g key={a.id}>
            {a.icon && <DeviceIcon icon={a.icon} size={34} x={xOf[a.id]} y={22} />}
            <text x={xOf[a.id]} y={hasIcons ? 60 : 22} className="dg-node-label" textAnchor="middle">
              {svgText(a.label)}
            </text>
            <line x1={xOf[a.id]} y1={headH} x2={xOf[a.id]} y2={H - 4} stroke="var(--d-muted)" strokeDasharray="3 5" strokeWidth={1.2} />
          </g>
        ))}
        {d.steps.map((s, i) => {
          const r = rows[i] as { y: number; h: number; lines: string[]; subLines?: string[] };
          if ('note' in s) {
            return (
              <g key={i}>
                <rect x={16} y={r.y} width={W - 32} height={r.h} rx={8} fill="var(--d-fill-2)" stroke={s.tone ? tone(s.tone) : 'var(--border)'} strokeOpacity={s.tone ? 0.6 : 1} />
                {r.lines.map((line, j) => (
                  <text key={j} x={W / 2} y={r.y + 19 + j * 16} textAnchor="middle" className="dg-note" fill={s.tone ? tone(s.tone) : undefined}>
                    {line}
                  </text>
                ))}
              </g>
            );
          }
          const x1 = xOf[s.from];
          const x2 = xOf[s.to];
          const color = tone(s.tone);
          const labelY = r.y + 16;
          const arrowY = labelY + (r.lines.length - 1) * 16 + 10;
          const cx = (x1 + x2) / 2;
          if (x1 === x2) {
            return (
              <g key={i}>
                <path d={`M${x1} ${arrowY} h28 v14 h-26`} fill="none" stroke={color} strokeWidth={1.6} markerEnd={`url(#${uid}-s-${s.tone ?? 'default'})`} />
                <text x={x1 + 34} y={arrowY + 4} className="dg-msg" fill={s.tone ? color : undefined}>{r.lines.join(' ')}</text>
              </g>
            );
          }
          const dir = x2 > x1 ? 1 : -1;
          return (
            <g key={i}>
              {r.lines.map((line, j) => (
                <text key={j} x={cx} y={labelY + j * 16 - 2} textAnchor="middle" className="dg-msg" fill={s.tone ? color : undefined}>
                  {line}
                </text>
              ))}
              <line
                x1={x1 + dir * 3}
                y1={arrowY}
                x2={x2 - dir * 4}
                y2={arrowY}
                stroke={color}
                strokeWidth={s.tone === 'accent' ? 2 : 1.6}
                strokeDasharray={s.dashed ? '6 5' : undefined}
                markerEnd={`url(#${uid}-s-${s.tone ?? 'default'})`}
              />
              {r.subLines?.map((line, j) => (
                <text key={`s${j}`} x={cx} y={arrowY + 16 + j * 14} textAnchor="middle" className="dg-sub">
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
