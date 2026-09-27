/**
 * IOS command executor: parses a line in the session's mode (falling back to global configuration
 * from sub-modes like real IOS), runs the handler, applies output modifiers and formats IOS errors.
 */
import type { Net } from '../engine/net';
import { ifResolve } from '../engine/topo';
import { IF_TYPES } from '../model/hardware';
import type { IosDevice } from '../model/state';
import { iosRegex } from '../util/format';
import { parseIp } from '../util/ip';
import { complete as gComplete, formatHelp, help as gHelp, ifTypeOnly, parse, tokenize, type Env, type HelpEntry, type Node } from './grammar';
import { isConfigMode, type Ctx, type Mode, type Session, type TermIO } from './session';
import { rootsFor, modeHeader, flushVlanMode } from './modes';
import { unknownExecWord } from '../commands/exec';

export function devFlag(dev: IosDevice, flag: string): boolean {
  switch (flag) {
    case 'router':
      return dev.kind === 'router';
    case 'switch':
      return dev.kind !== 'router';
    case 'l2':
      return dev.kind === 'switch';
    case 'l3sw':
      return dev.kind === 'l3switch';
    case 'l3':
      return dev.kind !== 'switch';
    case 'c3650':
      return dev.model === 'c3650';
    case 'xe':
      return dev.hw.iosXe;
    default:
      return false;
  }
}

export function makeEnv(s: Session): Env {
  const dev = s.dev;
  return {
    neg: false,
    dflt: false,
    doExec: false,
    priv: s.priv >= 15,
    types: dev.hw.types,
    ifResolve: (name, policy) => ifResolve(dev, name, policy),
    is: (flag) => devFlag(dev, flag),
  };
}

const MODIFIERS: [string, string][] = [
  ['append', 'Append redirected output to URL (URLs supporting append operation only)'],
  ['begin', 'Begin with the line that matches'],
  ['count', 'Count number of lines which match regexp'],
  ['exclude', 'Exclude lines that match'],
  ['format', 'Format the output using the specified spec file'],
  ['include', 'Include lines that match'],
  ['redirect', 'Redirect output to URL'],
  ['section', 'Filter a section of output'],
  ['tee', 'Copy output to URL'],
];

interface Pipe {
  kind: string;
  re: string;
}

function isShowLike(cmd: string): boolean {
  const toks = tokenize(cmd);
  if (!toks.length) return false;
  let i = 0;
  if ('do'.startsWith(toks[0].text.toLowerCase()) && toks[0].text.length >= 2) i = 1;
  const w = toks[i]?.text.toLowerCase() ?? '';
  return (w.length >= 2 && 'show'.startsWith(w)) || (w.length >= 2 && 'more'.startsWith(w)) || w === 'write' || w === 'wr';
}

function splitPipe(text: string): { cmd: string; pipe?: Pipe; error?: string } {
  const idx = text.indexOf('|');
  if (idx < 0 || !isShowLike(text.slice(0, idx))) return { cmd: text };
  const cmd = text.slice(0, idx);
  const rest = text.slice(idx + 1).trim();
  const m = /^(\S+)\s*(.*)$/.exec(rest);
  if (!m) return { cmd, error: '% Incomplete command.' };
  const cands = MODIFIERS.filter(([k]) => k.startsWith(m[1].toLowerCase()));
  if (cands.length !== 1) return { cmd, error: cands.length ? `% Ambiguous command:  "${text.trim()}"` : "% Invalid input detected at '^' marker." };
  const kind = cands[0][0];
  if (!['begin', 'count', 'exclude', 'include', 'section'].includes(kind)) return { cmd, error: "% Invalid input detected at '^' marker." };
  if (!m[2] && kind !== 'count') return { cmd, error: '% Incomplete command.' };
  return { cmd, pipe: { kind, re: m[2] } };
}

function applyPipe(lines: string[], p: Pipe): string[] {
  const text = lines.join('\n').split('\n');
  const re = iosRegex(p.re);
  switch (p.kind) {
    case 'include':
      return text.filter((l) => re.test(l));
    case 'exclude':
      return text.filter((l) => !re.test(l));
    case 'begin': {
      const i = text.findIndex((l) => re.test(l));
      return i < 0 ? [] : text.slice(i);
    }
    case 'count':
      return [`Number of lines which match regexp = ${text.filter((l) => (p.re ? re.test(l) : true)).length}`];
    case 'section': {
      const out: string[] = [];
      for (let i = 0; i < text.length; i++) {
        const l = text[i];
        if (!re.test(l)) continue;
        const indent = /^\s*/.exec(l)![0].length;
        out.push(l);
        let j = i + 1;
        while (j < text.length && text[j].trim() !== '' && /^\s*/.exec(text[j])![0].length > indent && text[j].trim() !== '!') {
          out.push(text[j]);
          j++;
        }
        i = j - 1;
      }
      return out;
    }
  }
  return text;
}

export function caretLines(promptLen: number, pos: number): string[] {
  return [' '.repeat(promptLen + pos) + '^', "% Invalid input detected at '^' marker."];
}

/** Execute one line in a session; returns output lines. */
export function runLine(net: Net, s: Session, rawLine: string, io: TermIO, out: string[] = []): string[] {
  const start = out.length;
  const line = rawLine.replace(/\t/g, ' ').replace(/\s+$/, '');
  if (!line.trim()) return out;
  if (line.trim().startsWith('!')) return out;
  if (line.endsWith('?')) {
    out.push(...helpText(s, line.slice(0, -1), io.promptLen).split('\n'));
    return out;
  }
  const sp = splitPipe(line);
  if (sp.error) {
    if (sp.error.startsWith('% Invalid')) out.push(...caretLines(io.promptLen, line.indexOf('|') + 1));
    else out.push(sp.error);
    return out;
  }
  const cmd = sp.cmd;
  const startMode = s.mode;
  let env = makeEnv(s);
  let r = parse(rootsFor(s.mode, s), cmd, env);
  if (!r.ok && r.kind !== 'empty' && isConfigMode(s.mode) && s.mode !== 'config') {
    env = makeEnv(s);
    const r2 = parse(rootsFor('config', s), cmd, env);
    if (r2.ok) {
      flushVlanMode(net, s);
      exitSubmode(s, 'config');
      r = r2;
    } else if (!r2.ok && r.kind === 'invalid' && r2.kind === 'invalid' && r2.pos > r.pos) r = r2;
  }
  if (!r.ok) {
    if (r.kind === 'empty') return out;
    if (r.kind === 'ambiguous') {
      out.push(`% Ambiguous command:  "${cmd.trim()}"`);
      return out;
    }
    if (r.kind === 'incomplete') {
      out.push('% Incomplete command.');
      return out;
    }
    // invalid
    if (!isConfigMode(s.mode) && r.tokIndex === 0) {
      const toks = tokenize(cmd);
      if (toks.length === 1) {
        unknownExecWord(net, s, toks[0].text, io, out);
        return out;
      }
      if (parseIp(toks[0].text) !== null || s.dev.st.cfg.hosts[toks[0].text.toLowerCase()] !== undefined) {
        out.push(...caretLines(io.promptLen, toks[1].start));
        return out;
      }
      out.push(...caretLines(io.promptLen, toks[1].start));
      return out;
    }
    out.push(...caretLines(io.promptLen, r.pos));
    return out;
  }
  const ctx: Ctx = { net, dev: s.dev, s, a: r.args, neg: r.env.neg, dflt: r.env.dflt, line: cmd, out, io };
  try {
    r.handler(ctx);
  } catch (e) {
    out.push(`% Internal simulator error: ${(e as Error).message}`);
  }
  if (isConfigMode(startMode) && !r.env.doExec && s.via !== 'internal') {
    s.dev.st.dyn.cfgChanged = net.clock;
    s.dev.st.dyn.cfgChangedBy = s.via === 'vty' ? `${s.user ?? 'vty'}` : 'console';
    net.touch();
  }
  if (s.mode !== 'vlan') flushVlanMode(net, s);
  if (sp.pipe) {
    const filtered = applyPipe(out.splice(start), sp.pipe);
    out.push(...filtered);
  }
  return out;
}

export function exitSubmode(s: Session, to: Mode): void {
  s.mode = to;
  if (to === 'config' || to === 'priv' || to === 'user') {
    s.ifs = [];
    s.line = undefined;
    s.pid = undefined;
    s.pool = undefined;
    s.acl = undefined;
    s.block = undefined;
  }
}

/* ---------------- help & completion ---------------- */

function ifNumberRange(dev: IosDevice, typeName: string): string {
  const def = IF_TYPES[typeName as keyof typeof IF_TYPES];
  if (def?.logical) {
    if (typeName === 'Port-channel') return `<${dev.hw.poRange[0]}-${dev.hw.poRange[1]}>`;
    const [lo, hi] = def.range ?? [0, 0];
    return `<${lo}-${hi}>`;
  }
  const firsts = dev.hw.ifaces.filter((p) => p.type === typeName).map((p) => Number(p.name.slice(typeName.length).split('/')[0]));
  if (!firsts.length) return '<0-0>';
  return `<${Math.min(...firsts)}-${Math.max(...firsts)}>`;
}

export function helpText(s: Session, line: string, promptLen: number): string {
  const idx = line.indexOf('|');
  if (idx >= 0 && isShowLike(line.slice(0, idx))) {
    const rest = line.slice(idx + 1);
    if (!rest.trim()) return formatHelp(MODIFIERS.map(([k, h]) => ({ label: k, help: h })), false);
    const m = /^\s*(\S+)\s+(.*)$/.exec(rest);
    if (m) return formatHelp([{ label: 'LINE', help: 'Regular Expression' }], false);
    const w = rest.trim().toLowerCase();
    const words = MODIFIERS.filter(([k]) => k.startsWith(w)).map(([k]) => k);
    return words.length ? words.join('  ') + '  ' : '% Unrecognized command';
  }
  const env = makeEnv(s);
  // "interface GigabitEthernet ?" → number range
  const tOnly = ifTypeOnly(line, env);
  if (tOnly) {
    const toks = tokenize(line);
    const prefix = line.slice(0, toks[toks.length - 1].start);
    const r = gHelp(rootsFor(s.mode, s), prefix, env);
    if (r.kind === 'list' && r.entries.some((e) => e.label === tOnly)) {
      return formatHelp([{ label: ifNumberRange(s.dev, tOnly), help: `${tOnly} interface number` }], false);
    }
  }
  let r = gHelp(rootsFor(s.mode, s), line, env);
  if (r.kind !== 'list' && r.kind !== 'words' && isConfigMode(s.mode) && s.mode !== 'config') {
    const r2 = gHelp(rootsFor('config', s), line, env);
    if (r2.kind === 'list' || r2.kind === 'words') r = r2;
  }
  switch (r.kind) {
    case 'error':
      if (r.err === 'ambiguous') return `% Ambiguous command:  "${line.trim()}"`;
      return caretLines(promptLen, r.pos).join('\n');
    case 'unrecognized':
      return '% Unrecognized command';
    case 'words':
      return r.words.join('  ') + '  ';
    case 'list': {
      const top = tokenize(line).length === 0;
      const pipe = !top && isShowLike(line) && r.cr;
      const body = formatHelp(r.entries as HelpEntry[], r.cr, pipe);
      return top ? `${modeHeader(s.mode)}\n${body}` : body;
    }
  }
}

export function completeLine(s: Session, line: string): { line: string; options: string[] } {
  const env = makeEnv(s);
  let r = gComplete(rootsFor(s.mode, s), line, env);
  if (r.line === line && !r.options.length && isConfigMode(s.mode) && s.mode !== 'config') {
    r = gComplete(rootsFor('config', s), line, env);
  }
  return r;
}

export type { Node };
