/**
 * Generic IOS-style command grammar: a tree of keyword and argument nodes per CLI mode.
 * Implements unique-prefix abbreviation, `no` / `default` / `do`, argument typing, context help (`?`)
 * and Tab completion with IOS error semantics (invalid / incomplete / ambiguous).
 */
import type { IfTypeName } from '../model/hardware';
import { IF_TYPES } from '../model/hardware';
import { parseIfName, matchTypes } from '../model/ifname';
import { parseIp, parsePrefix } from '../util/ip';
import { parseV6, parseV6Prefix } from '../util/ipv6';
import { parseMac } from '../util/mac';
import { parseRangeList } from '../util/format';

export type ArgKind =
  | 'word'
  | 'line'
  | 'num'
  | 'ipv4'
  | 'ipv4pfx'
  | 'ipv6'
  | 'ipv6pfx'
  | 'mac'
  | 'iface'
  | 'hex'
  | 'time'
  | 'vlanlist';

export type Args = Record<string, unknown>;

/** Interface lookup policy for `iface` arguments. */
export type IfPolicy = 'exist' | 'create' | 'any' | 'phys' | 'exist+null';

export interface Env {
  /** negated (`no ...`) */
  neg: boolean;
  /** `default ...` */
  dflt: boolean;
  /** true once `do` was matched */
  doExec: boolean;
  /** privileged EXEC available */
  priv: boolean;
  types: IfTypeName[];
  /** validates an interface reference; returns canonical name or null */
  ifResolve(name: string, policy: IfPolicy): string | null;
  /** device predicate hook for `when` */
  is(flag: string): boolean;
}

export interface Node {
  kw?: string;
  arg?: ArgKind;
  /** displayed label for arguments ("A.B.C.D", "WORD", "<1-4094>") */
  label?: string;
  help: string;
  key?: string;
  min?: number;
  max?: number;
  ifPolicy?: IfPolicy;
  /** extra validation for word args */
  test?: (tok: string) => boolean;
  run?: Handler;
  /** negated form may end here (true → use first descendant handler) */
  nr?: Handler | true;
  sub?: Node[] | (() => Node[]);
  hide?: boolean;
  priv?: boolean;
  /** visibility predicate */
  when?: (env: Env) => boolean;
  /** special markers */
  negate?: boolean;
  dflt?: boolean;
  doExec?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler = (c: any) => void;

export interface Tok {
  text: string;
  start: number;
}

export function tokenize(line: string): Tok[] {
  const out: Tok[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) out.push({ text: m[0], start: m.index });
  return out;
}

/* ---------------- node builders ---------------- */

type Opts = Partial<Omit<Node, 'kw' | 'arg' | 'help' | 'sub'>>;

export function k(kw: string, help: string, opts?: Opts | Node[] | (() => Node[]), sub?: Node[] | (() => Node[])): Node {
  if (Array.isArray(opts) || typeof opts === 'function') return { kw, help, sub: opts };
  return { kw, help, ...(opts ?? {}), sub };
}

export function a(arg: ArgKind, label: string, help: string, opts?: Opts | Node[] | (() => Node[]), sub?: Node[] | (() => Node[])): Node {
  if (Array.isArray(opts) || typeof opts === 'function') return { arg, label, help, sub: opts };
  return { arg, label, help, ...(opts ?? {}), sub };
}

export function num(min: number, max: number, help: string, opts?: Opts | Node[] | (() => Node[]), sub?: Node[] | (() => Node[])): Node {
  const n = a('num', `<${min}-${max}>`, help, opts, sub);
  n.min = min;
  n.max = max;
  return n;
}

export function children(n: Node): Node[] {
  if (!n.sub) return [];
  return typeof n.sub === 'function' ? n.sub() : n.sub;
}

function visible(n: Node, env: Env): boolean {
  if (n.priv && !env.priv) return false;
  if (n.when && !n.when(env)) return false;
  return true;
}

/* ---------------- matching ---------------- */

interface ArgMatch {
  n: number;
  v: unknown;
}

const ARG_ORDER: Record<ArgKind, number> = {
  num: 0,
  hex: 0,
  ipv4: 1,
  ipv4pfx: 1,
  ipv6pfx: 1,
  ipv6: 2,
  mac: 2,
  time: 2,
  vlanlist: 3,
  iface: 4,
  word: 8,
  line: 9,
};

export function matchArg(node: Node, toks: Tok[], i: number, line: string, env: Env): ArgMatch | null {
  const t = toks[i].text;
  switch (node.arg) {
    case 'word':
      return !node.test || node.test(t) ? { n: 1, v: t } : null;
    case 'line': {
      const raw = line.slice(toks[i].start).replace(/\s+$/, '');
      return { n: toks.length - i, v: raw };
    }
    case 'num': {
      if (!/^\d+$/.test(t)) return null;
      const v = Number(t);
      if (node.min !== undefined && v < node.min) return null;
      if (node.max !== undefined && v > node.max) return null;
      return { n: 1, v };
    }
    case 'hex':
      return /^0x[0-9a-f]{1,8}$/i.test(t) ? { n: 1, v: parseInt(t, 16) } : null;
    case 'ipv4': {
      const v = parseIp(t);
      return v === null ? null : { n: 1, v };
    }
    case 'ipv4pfx': {
      const v = parsePrefix(t);
      return v === null ? null : { n: 1, v };
    }
    case 'ipv6': {
      if (t.includes('/')) return null;
      const v = parseV6(t);
      return v === null ? null : { n: 1, v };
    }
    case 'ipv6pfx': {
      const v = parseV6Prefix(t);
      return v === null ? null : { n: 1, v };
    }
    case 'mac': {
      if (!t.includes('.')) return null;
      const v = parseMac(t);
      return v === null ? null : { n: 1, v };
    }
    case 'time':
      return /^\d{1,2}:\d{2}(:\d{2})?$/.test(t) ? { n: 1, v: t } : null;
    case 'vlanlist': {
      const v = parseRangeList(t, node.min ?? 1, node.max ?? 4094);
      return v === null ? null : { n: 1, v };
    }
    case 'iface': {
      const policy = node.ifPolicy ?? 'exist';
      const p = parseIfName(t, env.types);
      if ('ok' in p) {
        const name = env.ifResolve(p.ok.name, policy);
        return name ? { n: 1, v: name } : null;
      }
      if (p.err === 'incomplete' && i + 1 < toks.length) {
        const p2 = parseIfName(t + toks[i + 1].text, env.types);
        if ('ok' in p2) {
          const name = env.ifResolve(p2.ok.name, policy);
          return name ? { n: 2, v: name } : null;
        }
      }
      return null;
    }
    default:
      return null;
  }
}

export type ParseResult =
  | { ok: true; node: Node; handler: Handler; args: Args; env: Env; consumed: Node[] }
  | { ok: false; kind: 'invalid' | 'incomplete' | 'ambiguous' | 'empty'; pos: number; tokIndex: number; env: Env };

interface WalkState {
  nodes: Node[];
  last: Node | null;
  args: Args;
  env: Env;
  consumed: Node[];
}

function nodeKey(n: Node): string {
  return n.key ?? n.kw ?? n.label ?? '?';
}

/** Match one token position. Returns chosen node + tokens consumed or an error kind. */
function step(st: WalkState, toks: Tok[], i: number, line: string): { node: Node; n: number; v: unknown } | 'invalid' | 'ambiguous' {
  const tok = toks[i].text.toLowerCase();
  const cands = st.nodes.filter((n) => visible(n, st.env));
  const kws = cands.filter((n) => n.kw !== undefined);
  const exact = kws.filter((n) => n.kw!.toLowerCase() === tok);
  if (exact.length) return { node: exact[0], n: 1, v: true };
  const pref = kws.filter((n) => n.kw!.toLowerCase().startsWith(tok));
  // Prefer a unique non-hidden match when hidden aliases also match.
  const prefVisible = pref.filter((n) => !n.hide);
  const prefUse = prefVisible.length ? prefVisible : pref;
  if (prefUse.length === 1) return { node: prefUse[0], n: 1, v: true };
  const argsN = cands.filter((n) => n.arg !== undefined).sort((x, y) => ARG_ORDER[x.arg!] - ARG_ORDER[y.arg!]);
  if (prefUse.length > 1) {
    // an argument that matches the token exactly (e.g. a number) resolves ambiguity only when no keyword could apply
    return 'ambiguous';
  }
  for (const n of argsN) {
    const m = matchArg(n, toks, i, line, st.env);
    if (m) return { node: n, n: m.n, v: m.v };
  }
  return 'invalid';
}

export function parse(roots: Node[], line: string, env: Env): ParseResult {
  const toks = tokenize(line);
  if (!toks.length) return { ok: false, kind: 'empty', pos: 0, tokIndex: 0, env };
  const st: WalkState = { nodes: roots, last: null, args: {}, env, consumed: [] };
  let i = 0;
  while (i < toks.length) {
    if (st.last && !st.nodes.length) {
      return { ok: false, kind: 'invalid', pos: toks[i].start, tokIndex: i, env: st.env };
    }
    const r = step(st, toks, i, line);
    if (r === 'invalid') return { ok: false, kind: 'invalid', pos: toks[i].start, tokIndex: i, env: st.env };
    if (r === 'ambiguous') return { ok: false, kind: 'ambiguous', pos: toks[i].start, tokIndex: i, env: st.env };
    const n = r.node;
    if (n.negate) st.env = { ...st.env, neg: true };
    if (n.dflt) st.env = { ...st.env, dflt: true, neg: true };
    if (n.doExec) st.env = { ...st.env, doExec: true, priv: true, neg: false };
    const key = nodeKey(n);
    if (n.arg) {
      // repeated keys become arrays only when explicitly requested by key suffix "[]"
      if (key.endsWith('[]')) {
        const k2 = key.slice(0, -2);
        const arr = (st.args[k2] as unknown[] | undefined) ?? [];
        arr.push(r.v);
        st.args[k2] = arr;
      } else st.args[key] = r.v;
    } else st.args[key] = true;
    st.consumed.push(n);
    st.last = n;
    i += r.n;
    st.nodes = children(n);
  }
  const last = st.last!;
  if (st.env.neg && !st.env.doExec) {
    if (last.nr) {
      const h = last.nr === true ? firstHandler(last) : last.nr;
      if (h) return { ok: true, node: last, handler: h, args: st.args, env: st.env, consumed: st.consumed };
    }
    if (last.run) return { ok: true, node: last, handler: last.run, args: st.args, env: st.env, consumed: st.consumed };
  } else if (last.run) {
    return { ok: true, node: last, handler: last.run, args: st.args, env: st.env, consumed: st.consumed };
  }
  return { ok: false, kind: 'incomplete', pos: line.length, tokIndex: toks.length, env: st.env };
}

function firstHandler(n: Node, depth = 0): Handler | undefined {
  if (n.run) return n.run;
  if (depth > 8) return undefined;
  for (const c of children(n)) {
    const h = firstHandler(c, depth + 1);
    if (h) return h;
  }
  return undefined;
}

/* ---------------- help & completion ---------------- */

export interface HelpEntry {
  label: string;
  help: string;
}

export type HelpResult =
  | { kind: 'list'; entries: HelpEntry[]; cr: boolean }
  | { kind: 'words'; words: string[] }
  | { kind: 'error'; err: 'invalid' | 'ambiguous'; pos: number }
  | { kind: 'unrecognized' };

/** Walk all complete tokens; returns the node list at the end (or an error). */
function walkPrefix(roots: Node[], line: string, toks: Tok[], env: Env): WalkState | { err: 'invalid' | 'ambiguous'; pos: number } {
  const st: WalkState = { nodes: roots, last: null, args: {}, env, consumed: [] };
  let i = 0;
  while (i < toks.length) {
    if (st.last && !st.nodes.length) return { err: 'invalid', pos: toks[i].start };
    const r = step(st, toks, i, line);
    if (r === 'invalid' || r === 'ambiguous') return { err: r, pos: toks[i].start };
    const n = r.node;
    if (n.negate) st.env = { ...st.env, neg: true };
    if (n.dflt) st.env = { ...st.env, dflt: true, neg: true };
    if (n.doExec) st.env = { ...st.env, doExec: true, priv: true, neg: false };
    st.last = n;
    i += r.n;
    if (n.arg === 'line') {
      st.nodes = [];
      break;
    }
    st.nodes = children(n);
  }
  return st;
}

function canEnd(st: WalkState): boolean {
  if (!st.last) return false;
  if (st.env.neg && !st.env.doExec && st.last.nr) return true;
  return !!st.last.run;
}

export function help(roots: Node[], line: string, env: Env): HelpResult {
  const endsSpace = line.length === 0 || /\s$/.test(line);
  const toks = tokenize(line);
  const partial = endsSpace ? '' : toks.pop()!.text;
  // interface number help: "interface GigabitEthernet ?"
  const st = walkPrefix(roots, line, toks, env);
  if ('err' in st) return { kind: 'error', err: st.err, pos: st.pos };
  const cands = st.nodes.filter((n) => visible(n, st.env) && !n.hide);
  if (!endsSpace) {
    const p = partial.toLowerCase();
    const words: string[] = [];
    for (const n of cands) {
      if (n.kw !== undefined && n.kw.toLowerCase().startsWith(p)) words.push(n.kw);
    }
    for (const n of cands) {
      if (n.arg === 'iface') {
        const m = /^([a-zA-Z][a-zA-Z-]*)$/.exec(partial);
        if (m) for (const t of matchTypes(m[1], st.env.types)) words.push(t.name);
      } else if (n.arg !== undefined && n.label) {
        const fake: Tok[] = [{ text: partial, start: 0 }];
        if (n.arg === 'word' || n.arg === 'line' || matchArg(n, fake, 0, partial, st.env)) words.push(n.label);
      }
    }
    if (!words.length) return { kind: 'unrecognized' };
    return { kind: 'words', words: [...new Set(words)].sort((x, y) => (x.startsWith('<') || /^[A-Z]/.test(x) ? -1 : 0) - (y.startsWith('<') || /^[A-Z]/.test(y) ? -1 : 0) || x.localeCompare(y)) };
  }
  const entries: HelpEntry[] = [];
  const argEntries: HelpEntry[] = [];
  for (const n of cands) {
    if (n.kw !== undefined) entries.push({ label: n.kw, help: n.help });
    else if (n.arg === 'iface') {
      for (const t of st.env.types) {
        const def = IF_TYPES[t];
        if (n.ifPolicy === 'exist' || n.ifPolicy === 'phys' || n.ifPolicy === 'exist+null') {
          if (t === 'Null' && n.ifPolicy !== 'exist+null') continue;
        }
        entries.push({ label: def.name, help: def.help });
      }
    } else argEntries.push({ label: n.label ?? 'WORD', help: n.help });
  }
  entries.sort((x, y) => x.label.toLowerCase().localeCompare(y.label.toLowerCase()));
  return { kind: 'list', entries: [...argEntries, ...entries], cr: canEnd(st) };
}

/** Interface type named by a type-only last token, e.g. "interface GigabitEthernet ?" → GigabitEthernet. */
export function ifTypeOnly(line: string, env: Env): IfTypeName | null {
  const toks = tokenize(line);
  if (!/\s$/.test(line) || !toks.length) return null;
  const last = toks[toks.length - 1].text;
  const p = parseIfName(last, env.types);
  if ('err' in p && p.err === 'incomplete' && p.typeOnly) return p.typeOnly.name;
  return null;
}

export function formatHelp(entries: HelpEntry[], cr: boolean, extraPipe = false): string {
  const all = [...entries];
  if (extraPipe) all.push({ label: '|', help: 'Output modifiers' });
  const width = Math.max(0, ...all.map((e) => e.label.length));
  const lines = all.map((e) => `  ${e.label.padEnd(width + 2)}${e.help}`.replace(/\s+$/, ''));
  if (cr) lines.push('  <cr>');
  return lines.join('\n');
}

export interface Completion {
  line: string;
  options: string[];
}

export function complete(roots: Node[], line: string, env: Env): Completion {
  if (!line.length || /\s$/.test(line)) return { line, options: [] };
  const toks = tokenize(line);
  const lastTok = toks.pop()!;
  const st = walkPrefix(roots, line, toks, env);
  if ('err' in st) return { line, options: [] };
  const p = lastTok.text.toLowerCase();
  const cands = st.nodes.filter((n) => visible(n, st.env) && !n.hide);
  const kws = cands.filter((n) => n.kw !== undefined && n.kw.toLowerCase().startsWith(p)).map((n) => n.kw!);
  const exact = kws.find((w) => w.toLowerCase() === p);
  const opts = [...new Set(kws)];
  // interface type completion: "g0/0" → "GigabitEthernet0/0"
  if (!kws.length && cands.some((n) => n.arg === 'iface')) {
    const m = /^([a-zA-Z][a-zA-Z-]*)(.*)$/.exec(lastTok.text);
    if (m) {
      const types = matchTypes(m[1], st.env.types);
      if (types.length === 1) {
        const done = types[0].name + m[2];
        return { line: line.slice(0, lastTok.start) + done + (m[2] ? ' ' : ''), options: [done] };
      }
      return { line, options: types.map((t) => t.name) };
    }
  }
  if (exact) return { line: line.slice(0, lastTok.start) + exact + ' ', options: opts };
  if (opts.length === 1) return { line: line.slice(0, lastTok.start) + opts[0] + ' ', options: opts };
  return { line, options: opts.sort() };
}
