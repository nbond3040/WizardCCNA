import { Lock } from 'lucide-react';
import type { NodeIcon } from '../../content/types';
import type { DeviceModel } from '../../content/labTypes';
import type { SimDeviceInfo, SimLinkInfo } from '../../sim';
import { DeviceIcon } from '../diagrams/icons';
import { clamp, labelLayout, labelSide, labelWidth, useWidth } from '../diagrams/util';

export const MODEL_ICON: Record<DeviceModel, NodeIcon> = {
  isr4321: 'router',
  isr2911: 'router',
  c2960: 'switch',
  c3650: 'l3switch',
  pc: 'pc',
  laptop: 'laptop',
  server: 'server',
  cloud: 'cloud',
};

export const MODEL_NAME: Record<DeviceModel, string> = {
  isr4321: 'ISR 4321',
  isr2911: 'ISR 2911',
  c2960: 'Catalyst 2960',
  c3650: 'Catalyst 3650',
  pc: 'PC',
  laptop: 'Laptop',
  server: 'Server',
  cloud: 'Internet',
};

interface Props {
  devices: SimDeviceInfo[];
  links: SimLinkInfo[];
  selected?: string;
  onSelect: (id: string) => void;
  /** Device ids along a traced packet path (drawn as an animated overlay). */
  path?: string[];
  pathOk?: boolean;
}

export function TopologyCanvas({ devices, links, selected, onSelect, path, pathOk }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>(800);
  const gw = Math.max(12, ...devices.map((d) => d.x + 1));
  const gh = Math.max(5, ...devices.map((d) => d.y + 1));
  const unit = clamp(width / gw, 34, 90);
  const W = gw * unit;
  const H = gh * unit;
  const icon = clamp(unit * 0.5, 28, 44);
  const pos = Object.fromEntries(devices.map((d) => [d.id, { x: d.x * unit, y: d.y * unit }]));
  const ifStatus = (dev: string, iface: string) => devices.find((d) => d.id === dev)?.interfaces.find((i) => i.name === iface || i.short === iface)?.status;
  const short = (dev: string, iface: string) => devices.find((d) => d.id === dev)?.interfaces.find((i) => i.name === iface || i.short === iface)?.short ?? iface;
  const dotColor = (st: string | undefined, blocked: boolean) =>
    blocked ? 'var(--warn)' : st === 'up' ? 'var(--good)' : st === 'err-disabled' ? 'var(--bad)' : 'var(--bad)';

  const pathPts = (path ?? []).map((id) => pos[id]).filter(Boolean);

  return (
    <div ref={ref} className="lab-canvas">
      <svg width={W} height={H + 56} viewBox={`0 -34 ${W} ${H + 56}`}>
        {links.map((l) => {
          const a = pos[l.a.device];
          const b = pos[l.b.device];
          if (!a || !b) return null;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const r = icon * 0.62;
          const x1 = a.x + ux * r;
          const y1 = a.y + uy * r;
          const x2 = b.x - ux * r;
          const y2 = b.y - uy * r;
          const up = l.status === 'up';
          const sa = ifStatus(l.a.device, l.a.iface);
          const sb = ifStatus(l.b.device, l.b.iface);
          const lx1 = a.x + ux * (r + 16) - uy * 12;
          const ly1 = a.y + uy * (r + 16) + ux * 12;
          const lx2 = b.x - ux * (r + 16) - uy * 12;
          const ly2 = b.y - uy * (r + 16) + ux * 12;
          return (
            <g key={l.id}>
              {l.type === 'serial' ? (
                <path
                  d={`M${x1} ${y1} L${(x1 + x2) / 2 - ux * 6} ${(y1 + y2) / 2 - uy * 6} L${(x1 + x2) / 2 - uy * 7} ${(y1 + y2) / 2 + ux * 7} L${(x1 + x2) / 2 + uy * 7} ${(y1 + y2) / 2 - ux * 7} L${(x1 + x2) / 2 + ux * 6} ${(y1 + y2) / 2 + uy * 6} L${x2} ${y2}`}
                  fill="none"
                  stroke={up ? 'var(--d-ink)' : 'var(--d-muted)'}
                  strokeWidth={1.6}
                  strokeDasharray={up ? undefined : '5 5'}
                />
              ) : (
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={up ? 'var(--d-ink)' : 'var(--d-muted)'} strokeWidth={l.type === 'fiber' ? 2.2 : 1.6} strokeDasharray={up ? undefined : '5 5'} />
              )}
              <circle cx={a.x + ux * (r + 5)} cy={a.y + uy * (r + 5)} r={4} fill={dotColor(sa, l.aBlocked)} />
              <circle cx={b.x - ux * (r + 5)} cy={b.y - uy * (r + 5)} r={4} fill={dotColor(sb, l.bBlocked)} />
              <text x={lx1} y={ly1 + 3} className="lab-port" textAnchor="middle">{short(l.a.device, l.a.iface)}</text>
              <text x={lx2} y={ly2 + 3} className="lab-port" textAnchor="middle">{short(l.b.device, l.b.iface)}</text>
            </g>
          );
        })}

        {pathPts.length > 1 && (
          <polyline
            points={pathPts.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={pathOk ? 'var(--accent)' : 'var(--bad)'}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lab-path"
          />
        )}

        {devices.map((d) => {
          const p = pos[d.id];
          const sel = d.id === selected;
          const neighbors = links.filter((l) => l.a.device === d.id || l.b.device === d.id).map((l) => (l.a.device === d.id ? l.b.device : l.a.device));
          const sub = d.label !== d.hostname && d.label !== d.id ? d.label : MODEL_NAME[d.model];
          const tw = labelWidth(d.hostname, sub);
          const fits = { right: p.x + icon / 2 + 10 + tw <= W - 4, left: p.x - icon / 2 - 10 - tw >= 4 };
          const side = labelSide(d.id, pos, neighbors, fits);
          const L = labelLayout(side, p.x, p.y, icon, true, true);
          return (
            <g key={d.id} className={`lab-node ${sel ? 'sel' : ''}`} onClick={() => onSelect(d.id)} role="button" aria-label={`Open ${d.hostname}`}>
              <circle cx={p.x} cy={p.y} r={icon * 0.78} className="lab-node-halo" />
              <DeviceIcon icon={MODEL_ICON[d.model]} size={icon} x={p.x} y={p.y} color={sel ? 'var(--accent)' : 'var(--d-ink)'} />
              <text x={L.lx} y={L.ly} textAnchor={L.anchor} className="lab-node-label">{d.hostname}</text>
              <text x={L.sx} y={L.sy} textAnchor={L.anchor} className="lab-node-sub">{sub}</text>
            </g>
          );
        })}
      </svg>
      {devices.some((d) => d.locked) && (
        <div className="lab-legend">
          <Lock size={11} /> locked devices are managed by someone else (e.g. the ISP)
        </div>
      )}
    </div>
  );
}
