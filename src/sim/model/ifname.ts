/** Interface name parsing, canonicalization and abbreviation (IOS style). */
import { IF_TYPES, type IfTypeDef, type IfTypeName } from './hardware';

export interface ParsedIf {
  type: IfTypeDef;
  /** number part, e.g. "0/0/0" or "10" */
  num: string;
  /** subinterface number */
  sub?: number;
  /** canonical full name */
  name: string;
}

export type IfParse = { ok: ParsedIf } | { err: 'type' | 'ambiguous' | 'number' | 'incomplete'; typeOnly?: IfTypeDef };

/** Candidate types whose name starts with `prefix` (case-insensitive). Exact match wins. */
export function matchTypes(prefix: string, types: IfTypeName[]): IfTypeDef[] {
  const p = prefix.toLowerCase();
  if (!p) return [];
  const exact = types.filter((t) => t.toLowerCase() === p);
  if (exact.length) return exact.map((t) => IF_TYPES[t]);
  return types.filter((t) => t.toLowerCase().startsWith(p)).map((t) => IF_TYPES[t]);
}

const NUM_RE = /^\d+(\/\d+)*(\.\d+)?$/;

/** Parse "gi0/0/0", "GigabitEthernet 0/0/0", "lo0", "vlan 10", "po1", "g0/0/0.10". */
export function parseIfName(text: string, types: IfTypeName[]): IfParse {
  const t = text.trim();
  const m = /^([a-zA-Z][a-zA-Z-]*)\s*(.*)$/.exec(t);
  if (!m) return { err: 'type' };
  const cands = matchTypes(m[1], types);
  if (cands.length === 0) return { err: 'type' };
  if (cands.length > 1) return { err: 'ambiguous' };
  const type = cands[0];
  const num = m[2].trim();
  if (!num) return { err: 'incomplete', typeOnly: type };
  if (!NUM_RE.test(num)) return { err: 'number', typeOnly: type };
  const dot = num.indexOf('.');
  const base = dot >= 0 ? num.slice(0, dot) : num;
  const sub = dot >= 0 ? Number(num.slice(dot + 1)) : undefined;
  // normalize numbers ("00/1" → "0/1")
  const normBase = base
    .split('/')
    .map((x) => String(Number(x)))
    .join('/');
  const name = `${type.name}${normBase}${sub !== undefined ? `.${sub}` : ''}`;
  return { ok: { type, num: normBase, sub, name } };
}

export function typeOfName(name: string): IfTypeDef | undefined {
  let best: IfTypeDef | undefined;
  for (const t of Object.values(IF_TYPES)) {
    if (name.startsWith(t.name) && /^[\d]/.test(name.slice(t.name.length)) && (!best || t.name.length > best.name.length)) best = t;
  }
  return best;
}

/** "GigabitEthernet0/0/0" → "Gi0/0/0" */
export function shortIf(name: string): string {
  const t = typeOfName(name);
  return t ? t.short + name.slice(t.name.length) : name;
}

/** "GigabitEthernet0/0/0" → "Gig 0/0/0" (CDP neighbor tables) */
export function cdpIf(name: string): string {
  const t = typeOfName(name);
  return t ? `${t.cdp} ${name.slice(t.name.length)}` : name;
}

export function parentOf(name: string): string | undefined {
  const i = name.indexOf('.');
  return i >= 0 ? name.slice(0, i) : undefined;
}

export function ifNumberParts(name: string): number[] {
  const t = typeOfName(name);
  const rest = t ? name.slice(t.name.length) : name;
  return rest.split(/[/.]/).map(Number);
}

/**
 * Parse an interface range: "f0/1 - 5 , f0/7", "fa0/1-5,fa0/7-8", "vlan 10 - 20".
 * Returns canonical names (not validated against the device) or null when malformed.
 */
export function parseIfRange(text: string, types: IfTypeName[]): string[] | null {
  const out: string[] = [];
  const parts = text.split(',').map((p) => p.trim());
  let lastType: IfTypeDef | undefined;
  for (const part of parts) {
    if (!part) return null;
    const m = /^(?:([a-zA-Z][a-zA-Z-]*)\s*)?((?:\d+\/)*)(\d+)(?:\s*-\s*(\d+))?$/.exec(part);
    if (!m) return null;
    let type: IfTypeDef | undefined;
    if (m[1]) {
      const c = matchTypes(m[1], types);
      if (c.length !== 1) return null;
      type = c[0];
    } else type = lastType;
    if (!type) return null;
    lastType = type;
    const pre = m[2]
      .split('/')
      .filter((x) => x !== '')
      .map((x) => String(Number(x)));
    const a = Number(m[3]);
    const b = m[4] !== undefined ? Number(m[4]) : a;
    if (b < a) return null;
    for (let i = a; i <= b; i++) out.push(`${type.name}${pre.length ? pre.join('/') + '/' : ''}${i}`);
  }
  return out;
}

/** IOS ordering helper for interface lists. */
export function ifCompare(a: string, b: string): number {
  const pa = ifNumberParts(a);
  const pb = ifNumberParts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? -1;
    const y = pb[i] ?? -1;
    if (x !== y) return x - y;
  }
  return 0;
}
