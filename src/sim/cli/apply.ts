/** Apply configuration text (lab initial config, startup-config at reload) in global configuration mode. */
import type { Net } from '../engine/net';
import type { IosDevice } from '../model/state';
import { runLine } from './ios';
import { newSession, type TermIO } from './session';
import { flushVlanMode } from './modes';

/** Returns a list of lines that failed to parse (for lab authoring diagnostics). */
export function applyConfigText(net: Net, dev: IosDevice, text: string): string[] {
  const s = newSession(dev, 'nvram', 15);
  s.mode = 'config';
  const errors: string[] = [];
  let pending: ((input: string) => void) | null = null;
  const buf: string[] = [];
  const io: TermIO = {
    ask: (_p, h) => {
      pending = h;
    },
    remote: () => {},
    exitSession: () => {},
    reload: () => {},
    clearScreen: () => {},
    vtyBusy: () => 0,
    interactive: false,
    promptLen: 0,
  };
  const lines = text.split(/\r?\n/);
  for (const raw of lines) {
    if (pending) {
      const p: (input: string) => void = pending;
      pending = null;
      buf.length = 0;
      p(raw);
      continue;
    }
    const t = raw.trim();
    if (!t || t.startsWith('!')) continue;
    if (/^end$/i.test(t)) break;
    if (/^(Building configuration|Current configuration|Using \d+ out of)/i.test(t)) continue;
    buf.length = 0;
    runLine(net, s, t, io, buf);
    const bad = buf.filter((l) => /^% ?(Invalid input|Incomplete command|Ambiguous command|Unknown command)/.test(l));
    if (bad.length) errors.push(`${dev.id}: "${t}" → ${bad.join(' ')}`);
    if ((s.mode as string) === 'priv' || (s.mode as string) === 'user') s.mode = 'config';
  }
  flushVlanMode(net, s);
  return errors;
}
