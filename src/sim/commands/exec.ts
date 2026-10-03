/** User / privileged EXEC commands. */
import { a, k, num, type Node } from '../cli/grammar';
import type { Ctx, Session, TermIO } from '../cli/session';
import type { Net } from '../engine/net';
import type { Device } from '../model/state';
import { ipHostAddr } from '../model/state';
import { verifySecret } from '../util/crypto';
import { chunk, iosClock, monthIndex, EPOCH_MS } from '../util/format';
import { ipStr, parseIp } from '../util/ip';
import { parseV6, v6Ios } from '../util/ipv6';
import { pingSeries, roundTrip6, traceroute4, type RoundTrip } from '../engine/packet';
import { resolveName } from '../engine/services';
import { showRoots } from './show';
import { normalizeConfig, runningConfig, savedConfigText } from '../show/running';
import { configExitMessage } from './global';
import { lookupIf } from '../engine/topo';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function rtts(n: number, hops: number): [number, number, number] {
  if (!n) return [0, 0, 0];
  const base = Math.max(1, hops);
  return [Math.max(0, base - 1), base, base + 1 + (hops > 2 ? 1 : 0)];
}

function hopCount(r: RoundTrip): number {
  return r.fwd.hops.filter((h) => h.action.startsWith('Routed')).length;
}

export function iosPingOutput(targetLabel: string, results: RoundTrip[], size: number, timeout: number, srcLabel?: string): string[] {
  const out = ['Type escape sequence to abort.', `Sending ${results.length}, ${size}-byte ICMP Echos to ${targetLabel}, timeout is ${timeout} seconds:`];
  if (srcLabel) out.push(`Packet sent with a source address of ${srcLabel} `);
  const syms = results.map((r) => r.symbol).join('');
  for (const part of chunk([...syms], 70)) out.push(part.join(''));
  const ok = results.filter((r) => r.symbol === '!').length;
  const pct = Math.floor((ok * 100) / results.length);
  if (ok) {
    const h = Math.max(...results.filter((r) => r.symbol === '!').map(hopCount));
    const [mn, av, mx] = rtts(ok, h);
    out.push(`Success rate is ${pct} percent (${ok}/${results.length}), round-trip min/avg/max = ${mn}/${av}/${mx} ms`);
  } else out.push(`Success rate is ${pct} percent (0/${results.length})`);
  return out;
}

function resolveTarget(c: Ctx, target: string): { ip?: number; v6?: bigint; label: string } | null {
  const ip = parseIp(target);
  if (ip !== null) return { ip, label: target };
  const v6 = target.includes(':') ? parseV6(target) : null;
  if (v6 !== null) return { v6, label: v6Ios(v6) };
  const r = resolveName(c.net, c.dev, target);
  if (r.ok) {
    if (ipHostAddr(c.dev.st.cfg, target) === undefined && r.server !== undefined) c.out.push(`Translating "${target}"...domain server (${ipStr(r.server)}) [OK]`, '');
    return { ip: r.ip, label: ipStr(r.ip) };
  }
  if (r.reason === 'nolookup') c.out.push(`Translating "${target}"`);
  else c.out.push(`Translating "${target}"...domain server (${r.server !== undefined ? ipStr(r.server) : '255.255.255.255'})`);
  c.out.push('% Unrecognized host or address, or protocol not running.');
  return null;
}

function srcFromArg(c: Ctx, v: unknown): { srcIf?: string; src?: number; label?: string } {
  if (typeof v === 'number') return { src: v, label: ipStr(v) };
  if (typeof v === 'string') {
    const a4 = c.net.d.addrs.get(`${c.dev.id}|${v}`)?.[0];
    return { srcIf: v, src: a4?.ip, label: a4 ? ipStr(a4.ip) : undefined };
  }
  return {};
}

function doPing(c: Ctx, target: string, opts: { count?: number; size?: number; timeout?: number; source?: unknown; v6?: boolean }): void {
  const t = resolveTarget(c, target);
  if (!t) return;
  const count = opts.count ?? 5;
  const size = opts.size ?? 100;
  const timeout = opts.timeout ?? 2;
  if (t.v6 !== undefined || opts.v6) {
    const dst = t.v6 ?? parseV6(target);
    if (dst === null || dst === undefined) {
      c.out.push('% Unrecognized host or address, or protocol not running.');
      return;
    }
    const res: RoundTrip[] = [];
    for (let i = 0; i < count; i++) {
      const r = roundTrip6(c.net, c.dev, v6Ios(dst));
      res.push({ ok: r.ok, symbol: r.symbol, fwd: { ok: r.ok, pkt: { src: 0, dst: 0, proto: 'icmp', ttl: 64, size }, hops: r.fwd.hops, arpDrop: false }, arpDrop: false, detail: r.detail });
    }
    c.out.push(...iosPingOutput(v6Ios(dst), res, size, timeout));
    return;
  }
  const src = srcFromArg(c, opts.source);
  if (opts.source !== undefined && src.src === undefined) {
    c.out.push('% Invalid source address- IP address not on any of our up interfaces');
    return;
  }
  const res = pingSeries(c.net, c.dev, t.ip!, count, { size, src: src.src, srcIf: src.srcIf });
  c.out.push(...iosPingOutput(t.label, res, size, timeout, src.label));
}

/* ------------------------------------------------------------------ */
/* handlers                                                            */
/* ------------------------------------------------------------------ */

function enable(c: Ctx): void {
  const s = c.s;
  const cfg = c.dev.st.cfg;
  const level = (c.a.level as number | undefined) ?? 15;
  if (level < 15) {
    s.priv = level;
    s.mode = level >= 15 ? 'priv' : 'user';
    return;
  }
  if (s.priv >= 15) {
    s.mode = 'priv';
    return;
  }
  const secret = cfg.enableSecret;
  const pw = cfg.enablePassword;
  if (!secret && !pw) {
    if (s.via === 'vty') {
      c.out.push('% No password set');
      return;
    }
    s.priv = 15;
    s.mode = 'priv';
    return;
  }
  let tries = 0;
  const ask = () =>
    c.io.ask(
      'Password: ',
      (inp) => {
        const ok = secret ? verifySecret(secret, inp) : pw!.plain === inp;
        if (ok) {
          s.priv = 15;
          s.mode = 'priv';
          return;
        }
        tries++;
        if (tries >= 3) {
          c.out.push(secret ? '% Bad secrets' : '% Bad passwords');
          return;
        }
        ask();
      },
      { secret: true },
    );
  ask();
}

function disable(c: Ctx): void {
  c.s.priv = 1;
  c.s.mode = 'user';
}

function exitExec(c: Ctx): void {
  c.io.exitSession();
}

function configure(c: Ctx): void {
  const go = () => {
    c.s.mode = 'config';
    c.out.push('Enter configuration commands, one per line.  End with CNTL/Z.');
  };
  if (c.a.terminal) {
    go();
    return;
  }
  if (c.a.memory) {
    copyStartRun(c, false);
    return;
  }
  c.io.ask('Configuring from terminal, memory, or network [terminal]? ', (inp) => {
    const t = inp.trim().toLowerCase();
    if (t === '' || 'terminal'.startsWith(t)) go();
    else if ('memory'.startsWith(t)) copyStartRun(c, false);
    else c.out.push('?Must be "terminal", "memory" or "network"');
  });
}

export function saveConfig(c: Ctx): void {
  const dev = c.dev;
  dev.st.startup = savedConfigText(c.net, dev);
  dev.st.dyn.savedAt = c.net.clock;
  dev.st.savedRsa = dev.st.dyn.rsa ? { ...dev.st.dyn.rsa } : undefined;
  c.out.push('Building configuration...', '[OK]');
  c.net.touch();
}

function copyRunStart(c: Ctx): void {
  c.io.ask('Destination filename [startup-config]? ', (inp) => {
    const t = inp.trim();
    if (t && t !== 'startup-config' && t !== 'nvram:startup-config') {
      c.out.push(`%Error opening flash:${t} (Permission denied)`);
      return;
    }
    saveConfig(c);
  });
}

function copyStartRun(c: Ctx, ask = true): void {
  const doIt = () => {
    const text = c.dev.st.startup;
    if (!text) {
      c.out.push('%Error opening nvram:startup-config (No such file or directory)');
      return;
    }
    c.net.applyConfigText?.(c.dev, text);
    c.out.push('', `${text.length} bytes copied in 0.${String(100 + (text.length % 800)).padStart(3, '0')} secs (${Math.round(text.length / 0.5)} bytes/sec)`);
    c.net.log(c.dev.id, '%SYS-5-CONFIG_I: Configured from memory by console');
    c.net.touch();
  };
  if (!ask) return doIt();
  c.io.ask('Destination filename [running-config]? ', () => doIt());
}

function writeRun(c: Ctx): void {
  if (c.a.erase) return eraseStartup(c);
  if (c.a.terminal) {
    c.out.push(...runningConfig(c.net, c.dev).split('\n'));
    return;
  }
  saveConfig(c);
}

function eraseStartup(c: Ctx): void {
  c.io.ask('Erasing the nvram filesystem will remove all configuration files! Continue? [confirm]', (inp) => {
    if (/^n/i.test(inp.trim())) return;
    c.dev.st.startup = null;
    c.dev.st.dyn.savedAt = null;
    c.out.push('[OK]', 'Erase of nvram: complete');
    c.net.log(c.dev.id, '%SYS-7-NV_BLOCK_INIT: Initialized the geometry of nvram');
    c.net.touch();
  });
}

function reloadRun(c: Ctx): void {
  const proceed = () =>
    c.io.ask('Proceed with reload? [confirm]', (inp) => {
      if (/^n/i.test(inp.trim())) return;
      c.io.reload();
    });
  const running = normalizeConfig(savedConfigText(c.net, c.dev));
  const startup = c.dev.st.startup ? normalizeConfig(c.dev.st.startup) : null;
  if (startup !== running && c.dev.st.dyn.cfgChanged !== null) {
    const askSave = () =>
      c.io.ask('System configuration has been modified. Save? [yes/no]: ', (inp) => {
        const t = inp.trim().toLowerCase();
        if (t.startsWith('y')) {
          saveConfig(c);
          proceed();
        } else if (t.startsWith('n')) proceed();
        else {
          c.out.push('% Please answer \'yes\' or \'no\'.');
          askSave();
        }
      });
    askSave();
    return;
  }
  proceed();
}

function deleteRun(c: Ctx): void {
  const f = String(c.a.file).replace(/^flash:\/?/, '');
  c.io.ask(`Delete filename [${f}]? `, () => {
    c.io.ask(`Delete flash:/${f}? [confirm]`, (inp) => {
      if (/^n/i.test(inp.trim())) return;
      if (f === 'vlan.dat' && c.dev.kind !== 'router' && c.dev.st.vlanDat) {
        c.dev.st.vlanDat = false;
        return;
      }
      c.out.push(`%Error deleting flash:/${f} (No such file or directory)`);
    });
  });
}

function clearRun(c: Ctx): void {
  const dev = c.dev;
  const dyn = dev.st.dyn;
  if (c.a.nat) {
    dyn.nat = [];
    c.net.touch();
    return;
  }
  if (c.a.mac) {
    dyn.mac = {};
    return;
  }
  if (c.a.arp) {
    dyn.arp = {};
    return;
  }
  if (c.a.counters) {
    c.io.ask('Clear "show interface" counters on all interfaces [confirm]', (inp) => {
      if (/^n/i.test(inp.trim())) return;
      for (const d of Object.values(dyn.ifd)) {
        d.inPkts = d.outPkts = d.inBytes = d.outBytes = d.bcast = d.crc = d.runts = d.collisions = d.lateColl = 0;
        d.lastClear = c.net.clock;
      }
      c.net.log(dev.id, `%CLEAR-5-COUNTERS: Clear counter on all interfaces by ${c.s.via === 'vty' ? c.s.user ?? 'vty' : 'console'}`);
    });
    return;
  }
  if (c.a.dhcpb) {
    dyn.dhcpBind = {};
    c.net.touch();
    return;
  }
  if (c.a.ospf) {
    const v6 = !!c.a.ipv6;
    c.io.ask('Reset ALL OSPF processes? [no]: ', (inp) => {
      if (!/^y/i.test(inp.trim())) return;
      clearOspf(c.net, dev.id, v6);
    });
    return;
  }
  if (c.a.psec) {
    for (const d of Object.values(dyn.ifd)) d.psLearned = [];
    c.net.touch();
    return;
  }
  if (c.a.errdis !== undefined) {
    const d = dyn.ifd[c.a.errdis as string];
    if (d) d.errDisabled = undefined;
    c.net.touch();
  }
}

/** Restart OSPF on a device: neighbors drop, DR/BDR re-elect, RID re-selected. */
export function clearOspf(net: Net, devId: string, v6: boolean): void {
  const dev = net.ios(devId);
  if (!dev) return;
  const table = v6 ? dev.st.cfg.ospf6 : dev.st.cfg.ospf;
  for (const p of Object.values(table)) dev.st.dyn.ospfStart[`${v6 ? '6' : '4'}|${p.pid}|down`] = 1;
  net.touch();
  net.commit(true);
  for (const p of Object.values(table)) {
    delete dev.st.dyn.ospfStart[`${v6 ? '6' : '4'}|${p.pid}|down`];
    delete (v6 ? dev.st.dyn.ospf6Rid : dev.st.dyn.ospfRid)[String(p.pid)];
  }
  const roles = v6 ? dev.st.dyn.ospf6Role : dev.st.dyn.ospfRole;
  for (const k2 of Object.keys(roles)) delete roles[k2];
  net.touch();
  net.commit(true);
}

function terminalRun(c: Ctx): void {
  if (c.a.length !== undefined) c.s.termLength = c.a.length as number;
  else if (c.a.monitor) c.s.monitor = !c.neg;
}

function clockSet(c: Ctx): void {
  const time = String(c.a.time);
  const [hh, mm, ss] = time.split(':').map(Number);
  let day: number;
  let mon: number;
  if (c.a.day1 !== undefined) {
    day = c.a.day1 as number;
    mon = monthIndex(String(c.a.mon1));
  } else {
    day = c.a.day2 as number;
    mon = monthIndex(String(c.a.mon2));
  }
  const year = c.a.year as number;
  if (mon < 0) {
    c.out.push("% Invalid input detected at '^' marker.");
    return;
  }
  const target = Date.UTC(year, mon, day, hh, mm, ss || 0);
  const tz = c.dev.st.cfg.tz;
  const off = tz ? (tz.h * 60 + (tz.h < 0 ? -tz.m : tz.m)) * 60000 : 0;
  const zone = tz?.name ?? 'UTC';
  const before = iosClock(c.net.devClock(c.dev), zone, off / 60000).replace(/\.\d+/, '');
  c.dev.st.dyn.clockOffset = target - off - c.net.now();
  c.dev.st.dyn.clockSet = true;
  const after = iosClock(c.net.devClock(c.dev), zone, off / 60000).replace(/\.\d+/, '');
  const who = c.s.via === 'vty' ? `vty${c.s.vtyLine ?? 0}${c.s.peerIp !== undefined ? ` (${ipStr(c.s.peerIp)})` : ''}` : 'console';
  c.net.log(c.dev.id, `%SYS-6-CLOCKUPDATE: System clock has been updated from ${before} to ${after}, configured from console by ${who}.`);
}

const DEBUG_TEXT: Record<string, string> = {
  'ip icmp': 'ICMP packet debugging is on',
  'ip ospf adj': 'OSPF adjacency debugging is on',
  'ip ospf events': 'OSPF events debugging is on',
  'ip ospf hello': 'OSPF hello debugging is on',
  'ip packet': 'IP packet debugging is on',
  'ip routing': 'IP routing debugging is on',
  'ip nat': 'IP NAT debugging is on',
  'ip dhcp server events': 'DHCP server event debugging is on.',
  'ip dhcp server packet': 'DHCP server packet debugging is on.',
  'spanning-tree events': 'Spanning Tree event debugging is on',
  'standby': 'HSRP Errors debugging is on\nHSRP Events debugging is on\nHSRP Packets debugging is on',
  'ppp authentication': 'PPP authentication debugging is on',
  'ip ssh': 'Incoming ssh debugging is on',
  'ntp packets': 'NTP packets debugging is on',
};

function debugRun(c: Ctx): void {
  const what = String(c.a.what ?? '').trim().toLowerCase();
  if (c.neg || c.a.undebug) {
    if (what === 'all' || !what) c.out.push('All possible debugging has been turned off');
    else c.out.push((DEBUG_TEXT[what] ?? `${what} debugging is on`).replace(/is on/g, 'is off'));
    return;
  }
  if (what === 'all') {
    c.out.push('This may severely impact network performance. Continue? (yes/[no]): ');
    return;
  }
  c.out.push(DEBUG_TEXT[what] ?? `${what.replace(/\b\w/, (m) => m.toUpperCase())} debugging is on`);
}

function traceRun(c: Ctx): void {
  const target = String(c.a.target);
  const t = resolveTarget(c, target);
  if (!t) return;
  if (t.v6 !== undefined) {
    c.out.push('Type escape sequence to abort.', `Tracing the route to ${t.label}`, '');
    const r = roundTrip6(c.net, c.dev, t.label);
    c.out.push(`  1 ${r.ok ? t.label : '*  *  *'}${r.ok ? ' 0 msec 1 msec 0 msec' : ''}`);
    return;
  }
  c.out.push('Type escape sequence to abort.', `Tracing the route to ${t.label}`, 'VRF info: (vrf in name/id, vrf out name/id)');
  const hops = traceroute4(c.net, c.dev, t.ip!, 30);
  for (const h of hops) {
    const n = String(h.ttl).padStart(3, ' ');
    if (h.from === undefined) c.out.push(`${n}  *  *  * `);
    else if (h.unreach) c.out.push(`${n} ${ipStr(h.from)} !H  !H  !H `);
    else c.out.push(`${n} ${ipStr(h.from)} ${h.ttl} msec ${h.ttl > 1 ? h.ttl - 1 : 0} msec ${h.ttl} msec`);
  }
}

function sshRun(c: Ctx): void {
  const target = String(c.a.host);
  const t = resolveTarget(c, target);
  if (!t || t.ip === undefined) return;
  c.io.remote('ssh', t.ip, c.a.user as string, target);
}

function telnetRun(c: Ctx): void {
  const target = String(c.a.host);
  const t = resolveTarget(c, target);
  if (!t || t.ip === undefined) return;
  c.io.remote('telnet', t.ip, undefined, target);
}

function extendedPing(c: Ctx): void {
  const st: { proto?: string; target?: string; count?: number; size?: number; timeout?: number; source?: unknown } = {};
  const ask = (q: string, fn: (v: string) => void) => c.io.ask(q, fn);
  ask('Protocol [ip]: ', (p) => {
    st.proto = p.trim() || 'ip';
    ask('Target IP address: ', (tgt) => {
      st.target = tgt.trim();
      if (!st.target) {
        c.out.push('% Bad IP address');
        return;
      }
      ask('Repeat count [5]: ', (r) => {
        st.count = Number(r.trim() || 5) || 5;
        ask('Datagram size [100]: ', (sz) => {
          st.size = Number(sz.trim() || 100) || 100;
          ask('Timeout in seconds [2]: ', (to) => {
            st.timeout = Number(to.trim() || 2) || 2;
            ask('Extended commands [n]: ', (ext) => {
              if (!/^y/i.test(ext.trim())) {
                doPing(c, st.target!, st);
                return;
              }
              ask('Source address or interface: ', (src) => {
                const v = src.trim();
                if (v) {
                  const ip = parseIp(v);
                  if (ip !== null) st.source = ip;
                  else {
                    const name = lookupIf(c.dev, v);
                    st.source = name ?? v;
                  }
                }
                ask('Type of service [0]: ', () =>
                  ask('Set DF bit in IP header? [no]: ', () =>
                    ask('Validate reply data? [no]: ', () =>
                      ask('Data pattern [0x0000ABCD]: ', () =>
                        ask('Loose, Strict, Record, Timestamp, Verbose[none]: ', () =>
                          ask('Sweep range of sizes [n]: ', () => doPing(c, st.target!, st)),
                        ),
                      ),
                    ),
                  ),
                );
              });
            });
          });
        });
      });
    });
  });
}

function pingRun(c: Ctx): void {
  if (c.a.target === undefined) {
    if (c.s.priv < 15) {
      c.out.push('% Incomplete command.');
      return;
    }
    extendedPing(c);
    return;
  }
  doPing(c, String(c.a.target), {
    count: c.a.repeat as number | undefined,
    size: c.a.size as number | undefined,
    timeout: c.a.timeout as number | undefined,
    source: c.a.srcip ?? c.a.srcif,
    v6: !!c.a.ipv6,
  });
}

function dirRun(c: Ctx): void {
  const dev = c.dev;
  const fl = dev.hw.flashDev;
  c.out.push(`Directory of ${fl}:/`, '');
  const img = dev.hw.imageFile.replace(/^[^:]+:/, '');
  c.out.push(`    1  -rw-   ${String(dev.hw.iosXe ? 392573971 : 33591768).padStart(10)}  Mar 1 1993 00:00:00 +00:00  ${img}`);
  if (dev.kind !== 'router' && dev.st.vlanDat) c.out.push(`    2  -rw-   ${'1048'.padStart(10)}  Mar 1 1993 00:02:11 +00:00  vlan.dat`);
  c.out.push('', `${dev.hw.iosXe ? '7194652672 bytes total (6294573056 bytes free)' : '64016384 bytes total (30424616 bytes free)'}`);
}

function moreRun(c: Ctx): void {
  const f = String(c.a.file);
  if (/running-config/.test(f)) c.out.push(...runningConfig(c.net, c.dev).split('\n'));
  else if (/startup-config/.test(f)) c.out.push(...(c.dev.st.startup ?? '').split('\n'));
  else c.out.push(`%Error opening ${f} (No such file or directory)`);
}

/** Unknown single word at the EXEC prompt: IOS tries it as a host name (telnet). */
export function unknownExecWord(net: Net, s: Session, word: string, io: TermIO, out: string[]): void {
  const dev = s.dev;
  const cfg = dev.st.cfg;
  const ip = parseIp(word);
  if (ip !== null) {
    io.remote('telnet', ip, undefined, word);
    return;
  }
  const h = ipHostAddr(cfg, word);
  if (h !== undefined) {
    io.remote('telnet', h, undefined, word);
    return;
  }
  if (!cfg.domainLookup) {
    out.push(`Translating "${word}"`, '% Unknown command or computer name, or unable to find computer address');
    return;
  }
  const r = resolveName(net, dev, word);
  if (r.ok) {
    out.push(`Translating "${word}"...domain server (${r.server !== undefined ? ipStr(r.server) : '255.255.255.255'}) [OK]`);
    io.remote('telnet', r.ip, undefined, word);
    return;
  }
  out.push(`Translating "${word}"...domain server (${r.server !== undefined ? ipStr(r.server) : '255.255.255.255'})`, '% Unknown command or computer name, or unable to find computer address');
}

/* ------------------------------------------------------------------ */
/* tree                                                                */
/* ------------------------------------------------------------------ */

let roots: Node[] | null = null;

export function execRoots(): Node[] {
  if (roots) return roots;
  const iface = (help: string, key: string, run?: (c: Ctx) => void, sub?: Node[] | (() => Node[])) => ({ ...a('iface', 'IFACE', help, { key, run }, sub), ifPolicy: 'exist' as const });
  const pingOpts = (): Node[] => [
    k('df-bit', 'enable do not fragment bit in IP header', { run: pingRun }, pingOpts),
    k('repeat', 'specify repeat count', [num(1, 2147483647, 'repeat count', { key: 'repeat', run: pingRun }, pingOpts)]),
    k('size', 'specify datagram size', [num(36, 18024, 'datagram size', { key: 'size', run: pingRun }, pingOpts)]),
    k('source', 'specify source address or name', [a('ipv4', 'A.B.C.D', 'source address', { key: 'srcip', run: pingRun }, pingOpts), iface('Interface', 'srcif', pingRun, pingOpts)]),
    k('timeout', 'specify timeout interval', [num(0, 3600, 'timeout seconds', { key: 'timeout', run: pingRun }, pingOpts)]),
  ];
  const target = (run: (c: Ctx) => void, sub?: () => Node[]) => a('word', 'WORD', 'Ping destination address or hostname', { key: 'target', run }, sub);
  roots = [
    k('clear', 'Reset functions', { priv: true }, [
      k('arp-cache', 'Clear the entire ARP cache', { key: 'arp', run: clearRun }),
      k('counters', 'Clear counters on one or all interfaces', { run: clearRun }, [iface('Interface', 'cif', clearRun)]),
      k('errdisable', 'Clear err-disable state', [k('interface', 'Interface', [iface('Interface', 'errdis', clearRun)])]),
      k('ip', 'IP', [
        k('dhcp', 'Delete items from the DHCP database', [k('binding', 'DHCP address bindings', { key: 'dhcpb' }, [k('*', 'Clear all automatic bindings', { run: clearRun }), a('ipv4', 'A.B.C.D', 'DHCP address binding', { key: 'bip', run: clearRun })])]),
        k('nat', 'Clear NAT', [k('translation', 'Clear dynamic translation', { key: 'nat' }, [k('*', 'Delete all dynamic translations', { run: clearRun })])]),
        k('ospf', 'OSPF clear commands', [k('process', 'Reset OSPF process', { run: clearRun }), num(1, 65535, 'Process ID', { key: 'opid' }, [k('process', 'Reset OSPF process', { run: clearRun })])]),
      ]),
      k('ipv6', 'IPv6', { key: 'ipv6' }, [k('ospf', 'OSPF clear commands', [k('process', 'Reset OSPF process', { run: clearRun }), num(1, 65535, 'Process ID', { key: 'opid' }, [k('process', 'Reset OSPF process', { run: clearRun })])])]),
      k('mac', 'MAC forwarding table', [k('address-table', 'MAC forwarding table', [k('dynamic', 'dynamic entry type', { run: clearRun }, [k('interface', 'interface keyword', [iface('Interface', 'mif', clearRun)]), k('vlan', 'vlan keyword', [num(1, 4094, 'Vlan number', { key: 'mvl', run: clearRun })])])])]),
      k('mac-address-table', 'MAC forwarding table', { key: 'mac', hide: true }, [k('dynamic', 'dynamic entry type', { run: clearRun })]),
      k('port-security', 'Clear secure MAC addresses', { key: 'psec' }, [k('all', 'All secure MAC addresses', { run: clearRun }), k('dynamic', 'Dynamic secure MAC addresses', { run: clearRun }), k('sticky', 'Sticky secure MAC addresses', { run: clearRun })]),
    ]),
    k('clock', 'Manage the system clock', { priv: true }, [
      k('set', 'Set the time and date', [
        a('time', 'hh:mm:ss', 'Current Time', { key: 'time' }, [
          num(1, 31, 'Day of the month', { key: 'day1' }, [a('word', 'MONTH', 'Month of the year', { key: 'mon1', test: (t) => monthIndex(t) >= 0 }, [num(1993, 2035, 'Year', { key: 'year', run: clockSet })])]),
          a('word', 'MONTH', 'Month of the year', { key: 'mon2', test: (t) => monthIndex(t) >= 0 }, [num(1, 31, 'Day of the month', { key: 'day2' }, [num(1993, 2035, 'Year', { key: 'year', run: clockSet })])]),
        ]),
      ]),
    ]),
    k('configure', 'Enter configuration mode', { priv: true, run: configure }, [k('memory', 'Configure from NV memory', { run: configure }), k('terminal', 'Configure from the terminal', { run: configure })]),
    k('connect', 'Open a terminal connection', [a('word', 'WORD', 'IP address or hostname of a remote system', { key: 'host', run: telnetRun })]),
    k('copy', 'Copy from one file to another', { priv: true }, [
      k('running-config', 'Copy from current system configuration', [
        k('startup-config', 'Copy to startup configuration', { run: copyRunStart }),
        k('tftp:', 'Copy to tftp: file system', { run: (c: Ctx) => c.io.ask('Address or name of remote host []? ', (h) => c.io.ask('Destination filename [running-config]? ', () => c.out.push(`!!`, `${savedConfigText(c.net, c.dev).length} bytes copied in 1.234 secs`, h ? '' : '%Error opening tftp://255.255.255.255/running-config (Timed out)'))) }),
      ]),
      k('startup-config', 'Copy from startup configuration', [k('running-config', 'Update (merge with) current system configuration', { run: (c: Ctx) => copyStartRun(c) })]),
    ]),
    k('debug', 'Debugging functions (see also \'undebug\')', { priv: true }, [a('line', 'LINE', 'Debug options', { key: 'what', run: debugRun })]),
    k('delete', 'Delete a file', { priv: true }, [a('word', 'WORD', 'File to delete (flash:vlan.dat)', { key: 'file', run: deleteRun })]),
    k('dir', 'List files on a filesystem', { priv: true, run: dirRun }, [a('word', 'WORD', 'Directory or file name', { key: 'd', run: dirRun })]),
    k('disable', 'Turn off privileged commands', { run: disable }),
    k('disconnect', 'Disconnect an existing network connection', { run: () => {} }),
    k('enable', 'Turn on privileged commands', { run: enable }, [num(0, 15, 'Enable level', { key: 'level', run: enable })]),
    k('erase', 'Erase a filesystem', { priv: true }, [k('nvram:', 'nvram: filesystem', { run: eraseStartup }), k('startup-config', 'Erase contents of configuration memory', { run: eraseStartup })]),
    k('exit', 'Exit from the EXEC', { run: exitExec }),
    k('logout', 'Exit from the EXEC', { run: exitExec }),
    k('more', 'Display the contents of a file', { priv: true }, [a('word', 'WORD', 'File name', { key: 'file', run: moreRun })]),
    k('no', 'Disable debugging functions', { priv: true, negate: true }, [k('debug', 'Disable debugging functions', [a('line', 'LINE', 'Debug options', { key: 'what', run: debugRun })])]),
    k('ping', 'Send echo messages', { run: pingRun }, [
      k('ip', 'IP echo', [target(pingRun, pingOpts)]),
      k('ipv6', 'IPv6 echo', { key: 'ipv6' }, [a('word', 'WORD', 'Ping destination address or hostname', { key: 'target', run: pingRun }, pingOpts)]),
      target(pingRun, pingOpts),
    ]),
    k('reload', 'Halt and perform a cold restart', { priv: true, run: reloadRun }),
    k('resume', 'Resume an active network connection', { run: () => {} }),
    k('show', 'Show running system information', () => showRoots()),
    k('ssh', 'Open a secure shell client connection', [
      k('-l', 'Log in using this user name', [a('word', 'WORD', 'Login name', { key: 'user' }, () => {
        const opts = (): Node[] => [
          k('-v', 'Specify SSH Protocol Version', [num(1, 2, 'Protocol Version', { key: 'ver' }, opts)]),
          k('-p', 'Connect to this port', [num(1, 65535, 'Port Number', { key: 'port' }, opts)]),
          a('word', 'WORD', 'IP address or hostname of a remote system', { key: 'host', run: sshRun }),
        ];
        return opts();
      })]),
      k('-v', 'Specify SSH Protocol Version', [num(1, 2, 'Protocol Version', { key: 'ver' }, [k('-l', 'Log in using this user name', [a('word', 'WORD', 'Login name', { key: 'user' }, [a('word', 'WORD', 'IP address or hostname of a remote system', { key: 'host', run: sshRun })])])])]),
    ]),
    k('telnet', 'Open a telnet connection', [a('word', 'WORD', 'IP address or hostname of a remote system', { key: 'host', run: telnetRun }, [num(0, 65535, 'Port number', { key: 'port', run: telnetRun })])]),
    k('terminal', 'Set terminal line parameters', [
      k('history', 'Enable and control the command history function', { run: () => {} }, [k('size', 'Set history buffer size', [num(0, 256, 'Size of history buffer', { key: 'hs', run: () => {} })])]),
      k('length', 'Set number of lines on a screen', [num(0, 512, 'Number of lines on screen (0 for no pausing)', { key: 'length', run: terminalRun })]),
      k('monitor', 'Copy debug output to the current terminal line', { run: terminalRun }),
      k('no', 'Negate a command or set its defaults', { negate: true }, [k('monitor', 'Copy debug output to the current terminal line', { run: terminalRun })]),
      k('width', 'Set width of the display terminal', [num(0, 512, 'Number of characters on a screen line', { key: 'w', run: () => {} })]),
    ]),
    k('traceroute', 'Trace route to destination', [a('word', 'WORD', 'Trace route to destination address or hostname', { key: 'target', run: traceRun }), k('ip', 'IP Trace', [a('word', 'WORD', 'Trace route to destination address or hostname', { key: 'target', run: traceRun })])]),
    k('undebug', 'Disable debugging functions (see also \'debug\')', { priv: true, key: 'undebug' }, [a('line', 'LINE', 'Debug options', { key: 'what', run: debugRun })]),
    k('write', 'Write running configuration to memory, network, or terminal', { priv: true, run: writeRun }, [
      k('erase', 'Erase NV memory', { run: writeRun }),
      k('memory', 'Write to NV memory', { run: writeRun }),
      k('terminal', 'Write to terminal', { run: writeRun }),
    ]),
  ];
  return roots;
}

export { configExitMessage, EPOCH_MS };
export type { Device };
