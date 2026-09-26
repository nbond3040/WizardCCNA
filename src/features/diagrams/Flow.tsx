import { useId } from 'react';
import type { FlowDiagram } from '../../content/types';
import { boxExit, clamp, svgText, tone, toneSoft, useWidth, wrapText } from './util';

type NodeBox = { id: string; cx: number; cy: number; w: number; h: number };

export function Flow({ d }: { d: FlowDiagram }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const uid = useId().replace(/:/g, '');
  const manual = d.nodes.length > 0 && d.nodes.every((n) => n.x !== undefined && n.y !== undefined);
  const dir = d.direction ?? 'horizontal';
  const n = d.nodes.length;
  const avail = clamp(width, 300, 1000);
  const boxes: Record<string, NodeBox> = {};
  let W: number;
  let H: number;

  if (manual) {
    const gw = d.width ?? Math.max(...d.nodes.map((m) => m.x!)) + 1;
    const gh = d.height ?? Math.max(...d.nodes.map((m) => m.y!)) + 1;
    const unit = clamp(avail / gw, 40, 120);
    const w = clamp(unit * 1.7, 96, 180);
    const h = 56;
    d.nodes.forEach((m) => (boxes[m.id] = { id: m.id, cx: m.x! * unit, cy: m.y! * unit, w: m.shape === 'diamond' ? w * 1.05 : w, h: m.shape === 'diamond' ? h * 1.25 : h }));
    W = gw * unit;
    H = gh * unit;
  } else if (dir === 'horizontal') {
    const gap = n > 5 ? 26 : 38;
    const w = clamp((avail - (n - 1) * gap) / n, 80, 190);
    const h = 64;
    W = n * w + (n - 1) * gap;
    H = h * 1.3 + 8;
    d.nodes.forEach((m, i) => (boxes[m.id] = { id: m.id, cx: i * (w + gap) + w / 2, cy: H / 2, w, h: m.shape === 'diamond' ? h * 1.25 : h }));
  } else {
    const gap = 26;
    const w = clamp(avail * 0.62, 180, 360);
    const h = 50;
    W = Math.max(w + 40, Math.min(avail, w + 200));
    H = n * h + (n - 1) * gap + 12;
    d.nodes.forEach((m, i) => (boxes[m.id] = { id: m.id, cx: W / 2, cy: 6 + i * (h + gap) + h / 2, w, h: m.shape === 'diamond' ? h * 1.2 : h }));
  }

  const edges = d.edges ?? (manual ? [] : d.nodes.slice(1).map((m, i) => ({ from: d.nodes[i].id, to: m.id })));

  return (
    <div ref={ref} className="dg dg-flow">
      <svg width={W + 8} height={H + 8} viewBox={`-4 -4 ${W + 8} ${H + 8}`} role="img" aria-label="Flow diagram">
        <defs>
          {(['default', 'accent', 'muted', 'good', 'bad', 'warn'] as const).map((t) => (
            <marker key={t} id={`${uid}-f-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill={tone(t)} />
            </marker>
          ))}
        </defs>
        {edges.map((e, i) => {
          const a = boxes[e.from];
          const b = boxes[e.to];
          if (!a || !b) return null;
          const dx = b.cx - a.cx;
          const dy = b.cy - a.cy;
          const [ax, ay] = boxExit(a.w + 6, a.h + 6, dx, dy);
          const [bx, by] = boxExit(b.w + 10, b.h + 10, -dx, -dy);
          const x1 = a.cx + ax;
          const y1 = a.cy + ay;
          const x2 = b.cx + bx;
          const y2 = b.cy + by;
          const label = 'label' in e ? (e as { label?: string }).label : undefined;
          const et = 'tone' in e ? (e as { tone?: FlowDiagram['nodes'][number]['tone'] }).tone : undefined;
          const dashed = 'dashed' in e ? (e as { dashed?: boolean }).dashed : false;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={tone(et)} strokeWidth={1.6} strokeDasharray={dashed ? '6 5' : undefined} markerEnd={`url(#${uid}-f-${et ?? 'default'})`} />
              {label && (
                <g>
                  <rect x={mx - (svgText(label).length * 6.3 + 12) / 2} y={my - 10} width={svgText(label).length * 6.3 + 12} height={20} rx={10} className="dg-pill" stroke="var(--border-strong)" />
                  <text x={mx} y={my + 4} textAnchor="middle" className="dg-link-label">
                    {svgText(label)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        {d.nodes.map((m) => {
          const b = boxes[m.id];
          const stroke = m.tone ? tone(m.tone) : 'var(--d-ink)';
          const fill = m.tone && m.tone !== 'default' ? toneSoft(m.tone) : 'var(--d-fill)';
          const shape = m.shape ?? 'box';
          const lines = wrapText(svgText(m.label), Math.max(8, Math.floor((shape === 'diamond' ? b.w * 0.62 : b.w - 16) / 7.2)), 3);
          const subLines = m.sub ? wrapText(svgText(m.sub), Math.max(8, Math.floor((b.w - 12) / 6.2)), 2) : [];
          const block = lines.length * 15 + subLines.length * 13;
          const y0 = b.cy - block / 2 + 11;
          return (
            <g key={m.id}>
              {shape === 'diamond' ? (
                <polygon
                  points={`${b.cx},${b.cy - b.h / 2} ${b.cx + b.w / 2},${b.cy} ${b.cx},${b.cy + b.h / 2} ${b.cx - b.w / 2},${b.cy}`}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                />
              ) : (
                <rect
                  x={b.cx - b.w / 2}
                  y={b.cy - b.h / 2}
                  width={b.w}
                  height={b.h}
                  rx={shape === 'pill' ? b.h / 2 : shape === 'round' ? 16 : 8}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.4}
                />
              )}
              {lines.map((line, j) => (
                <text key={j} x={b.cx} y={y0 + j * 15} textAnchor="middle" className="dg-flow-label" fill={m.tone && m.tone !== 'default' ? tone(m.tone) : undefined}>
                  {line}
                </text>
              ))}
              {subLines.map((line, j) => (
                <text key={`s${j}`} x={b.cx} y={y0 + lines.length * 15 + j * 13} textAnchor="middle" className="dg-sub">
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
