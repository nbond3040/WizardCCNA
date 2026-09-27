/** Apply configuration text (lab initial config, startup-config at reload) in global configuration mode. */
import type { Net } from '../engine/net';
import type { IosDevice } from '../model/state';
import { runLine } from './ios';
import { newSession, type TermIO } from './session';
import { flushVlanMode } from './modes';

/**
 * Returns a list of lines that failed to parse (for lab authoring diagnostics).
 * `boot` applies startup-config semantics (reload): every interface named in the text comes up
 * unless the text also says `shutdown`, because a saved configuration never lists `no shutdown`.
 */
export function applyConfigText(net: Net, dev: IosDevice, text: string, opts: { boot?: boolean } = {}): string[] {
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
    if (opts.boot && /^int/i.test(t) && ((s.mode as string) === 'if' || (s.mode as string) === 'subif')) {
      for (const name of s.ifs) {
        const ic = dev.st.cfg.ifaces[name];
        if (ic) ic.shutdown = false;
      }
    }
    const bad = buf.filter((l) => /^% ?(Invalid input|Incomplete command|Ambiguous command|Unknown command)/.test(l));
    if (bad.length) errors.push(`${dev.id}: "${t}" → ${bad.join(' ')}`);
    if ((s.mode as string) === 'priv' || (s.mode as string) === 'user') s.mode = 'config';
  }
  flushVlanMode(net, s);
  return errors;
}
