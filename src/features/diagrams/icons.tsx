import type { ReactElement } from 'react';
import type { NodeIcon } from '../../content/types';

/**
 * Minimal monoline device icons drawn in a 48×48 box centered on the origin.
 * Stroke color comes from the parent's `color` (currentColor); fills use the diagram paper color
 * so links never show through.
 */
const F = 'var(--d-fill)';

function arrow(x1: number, y1: number, x2: number, y2: number, head = 3.6) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const l = [x2 - head * Math.cos(a - 0.6), y2 - head * Math.sin(a - 0.6)];
  const r = [x2 - head * Math.cos(a + 0.6), y2 - head * Math.sin(a + 0.6)];
  return `M${x1} ${y1} L${x2} ${y2} M${l[0].toFixed(2)} ${l[1].toFixed(2)} L${x2} ${y2} L${r[0].toFixed(2)} ${r[1].toFixed(2)}`;
}

const wifi = (cx: number, cy: number) => (
  <>
    <path d={`M${cx - 5} ${cy - 4} A7 7 0 0 1 ${cx + 5} ${cy - 4}`} fill="none" />
    <path d={`M${cx - 9.5} ${cy - 8} A13 13 0 0 1 ${cx + 9.5} ${cy - 8}`} fill="none" />
    <circle cx={cx} cy={cy} r={1.3} fill="currentColor" stroke="none" />
  </>
);

const ICONS: Record<NodeIcon, () => ReactElement> = {
  router: () => (
    <>
      <circle r={19} fill={F} />
      <path d={arrow(-5, 0, -14, 0)} />
      <path d={arrow(5, 0, 14, 0)} />
      <path d={arrow(0, -14, 0, -5)} />
      <path d={arrow(0, 14, 0, 5)} />
    </>
  ),
  switch: () => (
    <>
      <rect x={-20} y={-14} width={40} height={28} rx={5} fill={F} />
      <path d={arrow(-11, -5, 11, -5)} />
      <path d={arrow(11, 5, -11, 5)} />
    </>
  ),
  l3switch: () => (
    <>
      <rect x={-19} y={-19} width={38} height={38} rx={6} fill={F} />
      <path d={arrow(-3, -3, -12, -12)} />
      <path d={arrow(3, -3, 12, -12)} />
      <path d={arrow(-3, 3, -12, 12)} />
      <path d={arrow(3, 3, 12, 12)} />
    </>
  ),
  hub: () => (
    <>
      <rect x={-20} y={-9} width={40} height={18} rx={4} fill={F} />
      {[-12, -4, 4, 12].map((x) => (
        <circle key={x} cx={x} cy={0} r={1.8} fill="currentColor" stroke="none" />
      ))}
    </>
  ),
  firewall: () => (
    <>
      <rect x={-19} y={-15} width={38} height={30} rx={3} fill={F} />
      <path d="M-19 -5 H19 M-19 5 H19 M-6 -15 V-5 M8 -15 V-5 M1 -5 V5 M-12 -5 V5 M13 -5 V5 M-6 5 V15 M8 5 V15" />
    </>
  ),
  ips: () => (
    <>
      <path d="M0 -19 L15 -12.5 V0 C15 10 8.5 16 0 20 C-8.5 16 -15 10 -15 0 V-12.5 Z" fill={F} />
      <path d="M-9 1 H-4.5 L-1.5 -6 L2 8 L4.5 1 H9" fill="none" />
    </>
  ),
  ap: () => (
    <>
      <rect x={-15} y={6} width={30} height={9} rx={4.5} fill={F} />
      {wifi(0, 1)}
    </>
  ),
  wlc: () => (
    <>
      <rect x={-20} y={-2} width={40} height={16} rx={3} fill={F} />
      <circle cx={-13} cy={6} r={1.4} fill="currentColor" stroke="none" />
      <circle cx={-8} cy={6} r={1.4} fill="currentColor" stroke="none" />
      <path d="M2 6 H14" />
      {wifi(0, -6)}
    </>
  ),
  controller: () => (
    <>
      <rect x={-19} y={-17} width={38} height={34} rx={7} fill={F} />
      <circle cx={0} cy={0} r={3.2} />
      <circle cx={-10} cy={-9} r={2.4} />
      <circle cx={10} cy={-9} r={2.4} />
      <circle cx={-10} cy={9} r={2.4} />
      <circle cx={10} cy={9} r={2.4} />
      <path d="M-2.4 -2 L-8.2 -7.3 M2.4 -2 L8.2 -7.3 M-2.4 2 L-8.2 7.3 M2.4 2 L8.2 7.3" />
    </>
  ),
  pc: () => (
    <>
      <rect x={-18} y={-17} width={36} height={25} rx={3} fill={F} />
      <path d="M0 8 V14 M-9 15 H9" />
    </>
  ),
  laptop: () => (
    <>
      <rect x={-15} y={-15} width={30} height={21} rx={2.5} fill={F} />
      <path d="M-20 10 H20 L17 14.5 H-17 Z" fill={F} />
    </>
  ),
  phone: () => (
    <>
      <rect x={-16} y={-6} width={32} height={20} rx={4} fill={F} />
      <path d="M-15 -6 C-15 -17 15 -17 15 -6" fill="none" />
      {[-7, 0, 7].map((x) => [1, 7].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={1.3} fill="currentColor" stroke="none" />))}
    </>
  ),
  tablet: () => (
    <>
      <rect x={-13} y={-18} width={26} height={36} rx={4} fill={F} />
      <circle cx={0} cy={13} r={1.6} fill="currentColor" stroke="none" />
    </>
  ),
  printer: () => (
    <>
      <rect x={-10} y={-18} width={20} height={9} rx={1.5} fill={F} />
      <rect x={-18} y={-10} width={36} height={18} rx={3} fill={F} />
      <rect x={-10} y={4} width={20} height={12} rx={1.5} fill={F} />
      <circle cx={12} cy={-4} r={1.4} fill="currentColor" stroke="none" />
    </>
  ),
  server: () => (
    <>
      <rect x={-13} y={-20} width={26} height={40} rx={3} fill={F} />
      <path d="M-8 -11 H8 M-8 -4 H8 M-8 3 H8" />
      <circle cx={0} cy={13} r={1.6} fill="currentColor" stroke="none" />
    </>
  ),
  database: () => (
    <>
      <path d="M-15 -12 V12 C-15 20 15 20 15 12 V-12" fill={F} />
      <ellipse cx={0} cy={-12} rx={15} ry={6} fill={F} />
      <path d="M-15 0 C-15 8 15 8 15 0" fill="none" />
    </>
  ),
  cloud: () => (
    <path
      d="M-14 12 H14 C21.5 12 23.5 1 17 -2 C17.5 -12 6 -16.5 0.5 -10 C-4 -18 -17 -14.5 -15.5 -4 C-23 -2.5 -22.5 12 -14 12 Z"
      fill={F}
    />
  ),
  internet: () => (
    <>
      <circle r={18} fill={F} />
      <ellipse rx={7.5} ry={18} fill="none" />
      <path d="M-18 0 H18 M-15.5 -9 H15.5 M-15.5 9 H15.5" />
    </>
  ),
  vm: () => (
    <>
      <rect x={-18} y={-15} width={36} height={30} rx={3.5} fill={F} />
      <path d="M-18 -7 H18" />
      <circle cx={-13} cy={-11} r={1.2} fill="currentColor" stroke="none" />
      <circle cx={-9} cy={-11} r={1.2} fill="currentColor" stroke="none" />
      <rect x={-8} y={-2} width={16} height={11} rx={1.5} fill="none" />
    </>
  ),
  container: () => (
    <>
      <path d="M0 -18 L16 -9 V9 L0 18 L-16 9 V-9 Z" fill={F} />
      <path d="M-16 -9 L0 0 L16 -9 M0 0 V18" fill="none" />
    </>
  ),
  hypervisor: () => (
    <>
      <rect x={-18} y={-17} width={36} height={9} rx={2.5} fill={F} />
      <rect x={-18} y={-4.5} width={36} height={9} rx={2.5} fill={F} />
      <rect x={-18} y={8} width={36} height={9} rx={2.5} fill={F} />
    </>
  ),
  user: () => (
    <>
      <circle cx={0} cy={-9} r={7} fill={F} />
      <path d="M-14 17 C-14 4 14 4 14 17" fill={F} />
    </>
  ),
  attacker: () => (
    <>
      <path d="M-11 -2 C-11 -22 11 -22 11 -2 L8 3 H-8 Z" fill={F} />
      <path d="M-5 -7 H5" strokeWidth={2.6} />
      <path d="M-14 18 C-14 7 14 7 14 18" fill={F} />
    </>
  ),
  iot: () => (
    <>
      <rect x={-12} y={-12} width={24} height={24} rx={3} fill={F} />
      <path d="M-6 -12 V-17 M0 -12 V-17 M6 -12 V-17 M-6 12 V17 M0 12 V17 M6 12 V17 M-12 -6 H-17 M-12 0 H-17 M-12 6 H-17 M12 -6 H17 M12 0 H17 M12 6 H17" />
      <circle r={4} fill="none" />
    </>
  ),
  camera: () => (
    <>
      <path d="M-17 -11 H7 L13 -5 V2 H-17 Z" fill={F} />
      <path d="M-6 2 V11 M-13 11 H1" />
      <circle cx={8} cy={-2} r={1.4} fill="currentColor" stroke="none" />
    </>
  ),
  modem: () => (
    <>
      <rect x={-19} y={-4} width={38} height={16} rx={4} fill={F} />
      <path d="M11 -4 L15 -17" />
      {[-11, -5, 1].map((x) => (
        <circle key={x} cx={x} cy={4} r={1.4} fill="currentColor" stroke="none" />
      ))}
    </>
  ),
  box: () => <rect x={-18} y={-14} width={36} height={28} rx={5} fill={F} />,
};

export function DeviceIcon({ icon, size = 44, x = 0, y = 0, color }: { icon: NodeIcon; size?: number; x?: number; y?: number; color?: string }) {
  const Draw = ICONS[icon] ?? ICONS.box;
  const s = size / 48;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      style={{ color: color ?? 'var(--d-ink)' }}
      stroke="currentColor"
      strokeWidth={1.6 / Math.max(0.5, s)}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <Draw />
    </g>
  );
}
