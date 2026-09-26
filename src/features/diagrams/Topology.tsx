import { useId } from 'react';
import type { TopologyDiagram } from '../../content/types';
import { DeviceIcon } from './icons';
import { clamp, svgText, tone, toneSoft, useWidth } from './util';

type Pt = { x: number; y: number };

export function Topology({ d, maxUnit = 96 }: { d: TopologyDiagram; maxUnit?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const uid = useId().replace(/:/g, '');
  const gw = d.width ?? 10;
  const gh = d.height ?? 5;
  const unit = clamp(width / gw, 30, maxUnit);
  const W = gw * unit;
  const H = gh * unit;
  const icon = clamp(unit * 0.52, 26, 46);
  const pad = 14;
  const labelSpace = 30;

  const pos: Record<string, Pt> = {};
  for (const n of d.nodes) pos[n.id] = { x: n.x * unit, y: n.y * unit };

  // Parallel links between the same pair are offset side by side.
  const pairCount: Record<string, number> = {};
  const pairIndex: number[] = [];
  d.links.forEach((l) => {
    const k = [l.from, l.to].sort().join('|');
    pairIndex.push(pairCount[k] ?? 0);
    pairCount[k] = (pairCount[k] ?? 0) + 1;
  });

  return (
    <div ref={ref} className="dg dg-topology">
      <svg
        width={W + pad * 2}
        height={H + pad * 2 + labelSpace}
        viewBox={`${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2 + labelSpace}`}
        role="img"
        aria-label="Network topology diagram"
      >
        <defs>
          {(['default', 'accent', 'muted', 'good', 'bad', 'warn'] as const).map((t) => (
            <marker key={t} id={`${uid}-a-${t}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill={tone(t)} />
            </marker>
          ))}
        </defs>

        {d.groups?.map((g, i) => (
          <g key={`g${i}`}>
            <rect
              x={g.x * unit}
              y={g.y * unit}
              width={g.w * unit}
              height={g.h * unit}
              rx={14}
              fill={toneSoft(g.tone ?? 'muted')}
              stroke={tone(g.tone ?? 'muted')}
              strokeOpacity={0.45}
              strokeDasharray="5 5"
            />
            <text x={g.x * unit + 12} y={g.y * unit + 19} className="dg-group-label" fill={tone(g.tone ?? 'muted')}>
              {svgText(g.label)}
            </text>
          </g>
        ))}

        {d.links.map((l, i) => {
          const a = pos[l.from];
          const b = pos[l.to];
          if (!a || !b) return null;
          const k = [l.from, l.to].sort().join('|');
          const count = pairCount[k];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          // normal (consistent direction regardless of from/to order)
          const sign = l.from < l.to ? 1 : -1;
          const nx = -uy * sign;
          const ny = ux * sign;
          const off = (pairIndex[i] - (count - 1) / 2) * 9;
          const r = icon * 0.58;
          const x1 = a.x + ux * r + nx * off;
          const y1 = a.y + uy * r + ny * off;
          const x2 = b.x - ux * r + nx * off;
          const y2 = b.y - uy * r + ny * off;
          const color = tone(l.tone);
          const style = l.style ?? 'solid';
          const dash = style === 'dashed' ? '7 5' : style === 'dotted' ? '1.5 5' : style === 'wireless' ? '2 6' : undefined;
          const sw = style === 'thick' ? 3.4 : 1.6;
          const markerEnd = l.arrow === 'forward' || l.arrow === 'both' ? `url(#${uid}-a-${l.tone ?? 'default'})` : undefined;
          const markerStart = l.arrow === 'back' || l.arrow === 'both' ? `url(#${uid}-a-${l.tone ?? 'default'})` : undefined;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          let path = `M${x1} ${y1} L${x2} ${y2}`;
          if (style === 'serial') {
            const z = 7;
            path = `M${x1} ${y1} L${mx - ux * z} ${my - uy * z} L${mx + nx * z} ${my + ny * z} L${mx - nx * z} ${my - ny * z} L${mx + ux * z} ${my + uy * z} L${x2} ${y2}`;
          }
          // label anchor offsets: keep end labels on the "upper" side of the line
          const lnx = ny === 0 && nx === 0 ? 0 : (ny > 0 || (ny === 0 && nx > 0) ? -nx : nx);
          const lny = ny > 0 || (ny === 0 && nx > 0) ? -ny : ny;
          const endLabel = (t: number, text: string, key: string) => {
            const px = x1 + (x2 - x1) * t + lnx * 11 + (Math.abs(dy) > Math.abs(dx) ? 4 : 0);
            const py = y1 + (y2 - y1) * t + lny * 11;
            const anchor = Math.abs(dy) > Math.abs(dx) * 1.5 ? 'start' : 'middle';
            return (
              <text key={key} x={px} y={py + 4} className="dg-port" textAnchor={anchor}>
                {svgText(text)}
              </text>
            );
          };
          return (
            <g key={`l${i}`}>
              <path d={path} stroke={color} strokeWidth={sw} fill="none" strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" markerEnd={markerEnd} markerStart={markerStart} />
              {l.fromLabel && endLabel(0.2, l.fromLabel, 'fl')}
              {l.toLabel && endLabel(0.8, l.toLabel, 'tl')}
              {l.label && (
                <g>
                  <rect
                    x={mx - (svgText(l.label).length * 6.4 + 12) / 2}
                    y={my - 10}
                    width={svgText(l.label).length * 6.4 + 12}
                    height={20}
                    rx={10}
                    className="dg-pill"
                    stroke={l.tone ? color : 'var(--border-strong)'}
                  />
                  <text x={mx} y={my + 4} className="dg-link-label" textAnchor="middle" fill={l.tone ? color : undefined}>
                    {svgText(l.label)}
                  </text>
                </g>
              )}
              {l.blocked && (
                <g transform={`translate(${x1 + (x2 - x1) * 0.84} ${y1 + (y2 - y1) * 0.84})`}>
                  <circle r={7.5} fill="var(--d-fill)" stroke="var(--bad)" strokeWidth={1.8} />
                  <path d="M-4.2 -4.2 L4.2 4.2" stroke="var(--bad)" strokeWidth={1.8} strokeLinecap="round" />
                </g>
              )}
            </g>
          );
        })}

        {d.nodes.map((n) => (
          <g key={n.id}>
            <DeviceIcon icon={n.icon} size={icon} x={n.x * unit} y={n.y * unit} color={tone(n.tone)} />
            {n.label && (
              <text x={n.x * unit} y={n.y * unit + icon / 2 + 15} className="dg-node-label" textAnchor="middle" fill={n.tone && n.tone !== 'default' ? tone(n.tone) : undefined}>
                {svgText(n.label)}
              </text>
            )}
            {n.sub && (
              <text x={n.x * unit} y={n.y * unit + icon / 2 + (n.label ? 29 : 15)} className="dg-node-sub" textAnchor="middle">
                {svgText(n.sub)}
              </text>
            )}
          </g>
        ))}

        {d.annotations?.map((a, i) => (
          <text key={`an${i}`} x={a.x * unit} y={a.y * unit} className="dg-annot" textAnchor="middle" fill={a.tone ? tone(a.tone) : undefined}>
            {svgText(a.text)}
          </text>
        ))}
      </svg>
    </div>
  );
}
