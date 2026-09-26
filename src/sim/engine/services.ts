/** Application services: SSH/Telnet login evaluation, DNS resolution and NTP synchronization. */
import type { Device, IosDevice, LineCfg } from '../model/state';
import { parseIp } from '../util/ip';
import { verifySecret } from '../util/crypto';
import type { Net } from './net';
import { hostEffective } from './l3';
import { roundTrip4, type RoundTrip } from './packet';
import { evalAcl } from './acl';

export interface LoginReach {
  ok: boolean;
  msg?: string;
  target?: IosDevice;
  srcIp?: number;
  line?: number;
  auth?: 'none' | 'line' | 'local';
  rt?: RoundTrip;
}

let ephemeral = 1025;

export function vtyTransportAllows(l: LineCfg, proto: 'ssh' | 'telnet'): boolean {
  if (!l.transport) return true;
  if (l.transport.includes('none')) return false;
  return l.transport.includes('all') || l.transport.includes(proto);
}

export function authMode(dev: IosDevice, l: LineCfg): 'none' | 'line' | 'local' {
  if (dev.st.cfg.aaa) {
    const def = dev.st.cfg.aaaLines.find((x) => /^authentication login default/.test(x));
    if (!def || /\blocal\b/.test(def)) return 'local';
    return 'local';
  }
  return l.login;
}

/** Can `from` open a TCP session to `dstIp` (22/23) and which VTY line/auth applies? */
export function loginReach(net: Net, from: Device, dstIp: number, proto: 'ssh' | 'telnet', busyLines = 0): LoginReach {
  const port = proto === 'ssh' ? 22 : 23;
  ephemeral = ephemeral >= 65000 ? 1025 : ephemeral + 1;
  const rt = roundTrip4(net, from, { src: 0, dst: dstIp, proto: 'tcp', sport: ephemeral, dport: port, ttl: from.t === 'ios' ? 255 : 128, size: 60 });
  const fwd = rt.fwd;
  if (!fwd.ok) {
    if (rt.symbol === 'U') return { ok: false, msg: '% Destination unreachable; gateway or host down', rt };
    return { ok: false, msg: '% Connection timed out; remote host not responding', rt };
  }
  const target = net.ios(fwd.to!.dev);
  if (!target) return { ok: false, msg: '% Connection refused by remote host', rt };
  const vty = target.st.cfg.lines.vty;
  const idx = busyLines;
  if (idx >= vty.length) return { ok: false, msg: '% Connection refused by remote host', rt };
  const line = vty[idx];
  if (!vtyTransportAllows(line, proto)) return { ok: false, msg: '% Connection refused by remote host', rt };
  if (proto === 'ssh' && !target.st.dyn.rsa) return { ok: false, msg: '% Connection refused by remote host', rt };
  if (line.accessIn) {
    const v = evalAcl(target, line.accessIn, { src: fwd.pkt.src, dst: fwd.pkt.dst, proto: 'tcp', sport: fwd.pkt.sport, dport: port });
    if (!v.permit) return { ok: false, msg: '% Connection refused by remote host', rt };
  }
  if (!rt.rep?.ok) return { ok: false, msg: '% Connection timed out; remote host not responding', rt };
  return { ok: true, target, srcIp: fwd.pkt.src, line: idx, auth: authMode(target, line), rt };
}

export type CredResult = { ok: true; privilege: number } | { ok: false; msg: string };

/** Verify credentials against the target line / local user database. */
export function checkCreds(target: IosDevice, line: LineCfg, auth: 'none' | 'line' | 'local', proto: 'ssh' | 'telnet' | 'console', user: string | undefined, pass: string): CredResult {
  const linePriv = line.privilege ?? 1;
  if (auth === 'none') return { ok: true, privilege: linePriv };
  if (auth === 'line') {
    if (proto === 'ssh') return { ok: false, msg: '% Authentication failed.' };
    if (!line.password) return { ok: false, msg: 'Password required, but none set' };
    return line.password.plain === pass ? { ok: true, privilege: linePriv } : { ok: false, msg: '% Bad passwords' };
  }
  const u = user !== undefined ? target.st.cfg.users[user] : undefined;
  if (!u) return { ok: false, msg: '% Login invalid' };
  let good = false;
  if (u.secret) good = verifySecret(u.secret, pass);
  else if (u.password) good = u.password.plain === pass;
  if (!good) return { ok: false, msg: '% Login invalid' };
  return { ok: true, privilege: u.privilege ?? linePriv };
}

/* ---------------- DNS ---------------- */

export type Resolve = { ok: true; ip: number; server?: number } | { ok: false; reason: 'noserver' | 'timeout' | 'nxdomain' | 'nolookup'; server?: number };

export function dnsQuery(net: Net, from: Device, server: number, name: string): Resolve {
  const rt = roundTrip4(net, from, { src: 0, dst: server, proto: 'udp', sport: 53000 + (name.length % 900), dport: 53, ttl: 128, size: 60 });
  if (!rt.fwd.ok || !rt.rep?.ok) return { ok: false, reason: 'timeout', server };
  const sdev = net.dev(rt.fwd.to!.dev)!;
  if (sdev.t !== 'host' || !sdev.services?.dns) return { ok: false, reason: 'timeout', server };
  const n = name.toLowerCase().replace(/\.$/, '');
  const rec = sdev.services.dns.find((r) => r.name.toLowerCase().replace(/\.$/, '') === n);
  if (!rec) return { ok: false, reason: 'nxdomain', server };
  const ip = parseIp(rec.ip);
  if (ip === null) return { ok: false, reason: 'nxdomain', server };
  return { ok: true, ip, server };
}

export function resolveName(net: Net, from: Device, name: string): Resolve {
  if (from.t === 'ios') {
    const h = from.st.cfg.hosts[name.toLowerCase()];
    if (h !== undefined) return { ok: true, ip: h };
    if (!from.st.cfg.domainLookup) return { ok: false, reason: 'nolookup' };
    const servers = from.st.cfg.nameServers;
    if (!servers.length) return { ok: false, reason: 'noserver' };
    let last: Resolve = { ok: false, reason: 'timeout' };
    for (const s of servers) {
      last = dnsQuery(net, from, s, name);
      if (last.ok || last.reason === 'nxdomain') return last;
    }
    return last;
  }
  const e = hostEffective(from);
  if (e.dns === undefined) return { ok: false, reason: 'noserver' };
  return dnsQuery(net, from, e.dns, name);
}

/* ---------------- NTP ---------------- */

export interface NtpState {
  synced: boolean;
  stratum: number;
  ref?: number;
  refIsLocal?: boolean;
  server?: number;
}

export function ntpState(net: Net, dev: IosDevice, depth = 0): NtpState {
  const cfg = dev.st.cfg.ntp;
  if (depth > 4) return { synced: false, stratum: 16 };
  for (const s of [...cfg.servers].sort((a, b) => Number(b.prefer) - Number(a.prefer))) {
    const rt = roundTrip4(net, dev, { src: 0, dst: s.ip, proto: 'udp', sport: 123, dport: 123, ttl: 255, size: 76 });
    if (!rt.fwd.ok || !rt.rep?.ok) continue;
    const sdev = net.dev(rt.fwd.to!.dev)!;
    if (sdev.t === 'host') {
      if (sdev.services?.ntp) return { synced: true, stratum: 2, ref: s.ip, server: s.ip };
      continue;
    }
    if (sdev.id === dev.id) continue;
    const inner = ntpState(net, sdev, depth + 1);
    if (inner.synced && inner.stratum < 15) return { synced: true, stratum: inner.stratum + 1, ref: s.ip, server: s.ip };
  }
  if (cfg.master !== undefined) return { synced: true, stratum: cfg.master, refIsLocal: true };
  return { synced: false, stratum: 16 };
}
