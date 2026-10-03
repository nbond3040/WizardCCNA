import { useLayoutEffect, useRef, useState } from 'react';
import type { Tone } from '../../content/types';

export const TONE: Record<Tone, string> = {
  default: 'var(--d-ink)',
  accent: 'var(--accent)',
  muted: 'var(--d-muted)',
  good: 'var(--good)',
  bad: 'var(--bad)',
  warn: 'var(--warn)',
};

export const TONE_SOFT: Record<Tone, string> = {
  default: 'var(--d-fill-2)',
  accent: 'var(--accent-soft)',
  muted: 'var(--d-fill-2)',
  good: 'var(--good-soft)',
  bad: 'var(--bad-soft)',
  warn: 'var(--warn-soft)',
};

export const tone = (t?: Tone) => TONE[t ?? 'default'];
export const toneSoft = (t?: Tone) => TONE_SOFT[t ?? 'default'];

/** Measure an element's content width, re-rendering on resize. */
export function useWidth<T extends HTMLElement>(fallback = 720) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setWidth(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Greedy word wrap into at most `maxLines` lines of ~maxChars characters. */
export function wrapText(text: string, maxChars: number, maxLines = 3): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/.{0,2}$/, '') + '…';
    return kept;
  }
  return lines;
}

/** Strip RichText markers for SVG text (SVG has no inline markup). */
export const svgText = (s: string | undefined) => (s ?? '').replace(/\*\*|==|`/g, '');

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Where a ray from the center of a w×h box toward (dx, dy) exits the box. */
export function boxExit(w: number, h: number, dx: number, dy: number): [number, number] {
  if (dx === 0 && dy === 0) return [0, 0];
  const sx = dx === 0 ? Infinity : (w / 2) / Math.abs(dx);
  const sy = dy === 0 ? Infinity : (h / 2) / Math.abs(dy);
  const s = Math.min(sx, sy);
  return [dx * s, dy * s];
}

export type LabelSide = 'below' | 'above' | 'right' | 'left';

/** Pick the side of a node where its label collides least with the links attached to it. */
export function labelSide(id: string, pos: Record<string, { x: number; y: number }>, neighbors: string[], fits: { right: boolean; left: boolean } = { right: true, left: true }): LabelSide {
  const me = pos[id];
  if (!me) return 'below';
  const angles = neighbors
    .map((n) => pos[n])
    .filter((p): p is { x: number; y: number } => !!p)
    .map((p) => Math.atan2(p.y - me.y, p.x - me.x));
  if (!angles.length) return 'below';
  const candidates: [LabelSide, number, number][] = [
    ['below', Math.PI / 2, 0.15],
    ['above', -Math.PI / 2, 0.05],
    ['right', 0, 0],
    ['left', Math.PI, -0.01],
  ];
  let best: LabelSide = 'below';
  let bestScore = -1;
  for (const [side, a, bias] of candidates) {
    if ((side === 'right' && !fits.right) || (side === 'left' && !fits.left)) continue;
    let min = Math.PI;
    for (const l of angles) {
      let d = Math.abs(l - a);
      if (d > Math.PI) d = 2 * Math.PI - d;
      min = Math.min(min, d);
    }
    const score = min + bias;
    if (score > bestScore) {
      bestScore = score;
      best = side;
    }
  }
  return best;
}

/** Text anchors and baselines for a node's name and sub-label on a given side of its icon. */
export function labelLayout(side: LabelSide, cx: number, cy: number, icon: number, hasLabel: boolean, hasSub: boolean) {
  const r = icon / 2;
  switch (side) {
    case 'above':
      return { anchor: 'middle' as const, lx: cx, ly: cy - r - (hasSub ? 21 : 8), sx: cx, sy: cy - r - 8 };
    case 'right':
      return { anchor: 'start' as const, lx: cx + r + 10, ly: cy + (hasSub ? -1 : 4), sx: cx + r + 10, sy: cy + (hasLabel ? 13 : 4) };
    case 'left':
      return { anchor: 'end' as const, lx: cx - r - 10, ly: cy + (hasSub ? -1 : 4), sx: cx - r - 10, sy: cy + (hasLabel ? 13 : 4) };
    default:
      return { anchor: 'middle' as const, lx: cx, ly: cy + r + 15, sx: cx, sy: cy + r + (hasLabel ? 29 : 15) };
  }
}

/** Approximate rendered width (px) of a node's label block, for side-room checks. */
export const labelWidth = (label?: string, sub?: string) => Math.max((label?.length ?? 0) * 7.6, (sub?.length ?? 0) * 7);
