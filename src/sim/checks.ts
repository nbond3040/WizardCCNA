/** Lab check evaluation. Every check runs as a dry run (no side effects) and never throws. */
import type { LabCheck } from '../content/labTypes';
import type { CheckResult } from './api';
import type { Net } from './engine/net';
import { ek } from './engine/net';
import type { Device, IosDevice } from './model/state';
import { lookupIf, ifNames } from './engine/topo';
import { hostEffective, hostEffective6, lpm } from './engine/l3';
import { pingSeries, roundTrip4, roundTrip6 } from './engine/packet';
import { authMode, checkCreds, loginReach, resolveName } from './engine/services';
import { rangesEqual, parseRangeList, rangesStr } from './util/format';
import { inNet, ipStr, maskLen, parseIp, parsePrefix } from './util/ip';
import { parseV6, parseV6Prefix, v6Str } from './util/ipv6';
import { shortIf } from './model/ifname';
import { normalizeConfig, runningConfig, savedConfigText } from './show/running';
import { runLine } from './cli/ios';
import { newSession, type TermIO } from './cli/session';

function findDev(net: Net, id: string): Device | undefined {
  return net.dev(id) ?? net.byName(id);
}

function name(d: Device): string {
  return d.t === 'ios' ? d.st.cfg.hostname : d.id;
}

function re(pattern: string): RegExp {
  try {
    return new RegExp(pattern, 'im');
  } catch {
    return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'im');
  }
}

/** Primary IPv4 address used when a check targets a device id. */
export function primaryAddress(net: Net, d: Device): number | undefined {
  if (d.t === 'host') return hostEffective(d).ip;
  const dd = net.d;
  let loop: number | undefined;
  for (const n of ifNames(d)) {
    const a = dd.addrs.get(ek(d.id, n))?.[0];
    const st = dd.l2.ifs.get(ek(d.id, n));
    if (!a || !st || st.line !== 'up' || st.proto !== 'up') continue;
    if (n.startsWith('Loopback')) {
      loop ??= a.ip;
      continue;
    }
    return a.ip;
  }
  return loop;
}

const quietIO: TermIO = {
  ask: () => {},
  remote: () => {},
  exitSession: () => {},
  reload: () => {},
  clearScreen: () => {},
  vtyBusy: () => 0,
  interactive: false,
  promptLen: 0,
};

export function runShow(net: Net, dev: IosDevice, command: string): string {
  const s = newSession(dev, 'internal', 15);
  const out: string[] = [];
  runLine(net, s, command, quietIO, out);
  return out.join('\n');
}

function section(text: string, header: string, dev: IosDevice): string | null {
  const lines = text.split('\n');
  let hdr = header.trim();
  const m = /^interface\s+(.+)$/i.exec(hdr);
  if (m) {
    const n = lookupIf(dev, m[1]);
    if (n) hdr = `interface ${n}`;
  }
  const collect = (h: string): string[] | null => {
    const i = lines.findIndex((l) => l.trim().toLowerCase() === h.toLowerCase());
    if (i < 0) return null;
    const out = [lines[i]];
    for (let j = i + 1; j < lines.length && /^\s/.test(lines[j]); j++) out.push(lines[j]);
    return out;
  };
  const exact = collect(hdr);
  if (exact) return exact.join('\n');
  const vm = /^line vty (\d+)(?:\s+(\d+))?$/i.exec(hdr);
  if (vm) {
    const a = Number(vm[1]);
    const b = vm[2] !== undefined ? Number(vm[2]) : a;
    const parts: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const lm = /^line vty (\d+)(?:\s+(\d+))?$/.exec(lines[i]);
      if (!lm) continue;
      const x = Number(lm[1]);
      const y = lm[2] !== undefined ? Number(lm[2]) : x;
      if (y < a || x > b) continue;
      parts.push(lines[i]);
      for (let j = i + 1; j < lines.length && /^\s/.test(lines[j]); j++) parts.push(lines[j]);
    }
    return parts.length ? parts.join('\n') : null;
  }
  return null;
}

function targetIp(net: Net, to: string): { ip?: number; v6?: string; label: string } | null {
  const ip = parseIp(to);
  if (ip !== null) return { ip, label: to };
  if (to.includes(':')) {
    const v = parseV6(to);
    if (v !== null) return { v6: v6Str(v), label: to };
  }
  const d = findDev(net, to);
  if (!d) return null;
  const a = primaryAddress(net, d);
  if (a === undefined) return null;
  return { ip: a, label: `${to} (${ipStr(a)})` };
}

function ping(net: Net, c: Extract<LabCheck, { type: 'ping' }>): CheckResult {
  const from = findDev(net, c.from);
  if (!from) return { pass: false, detail: `Unknown device ${c.from}` };
  const expect = c.expect ?? true;
  const t = targetIp(net, c.to);
  if (!t) return { pass: false, detail: `${c.from} → ${c.to}: cannot determine the target address` };
  let ok: boolean;
  let detail: string;
  if (t.v6) {
    const r = roundTrip6(net, from, t.v6);
    ok = r.ok || roundTrip6(net, from, t.v6).ok;
    detail = r.ok ? `Reply from ${t.v6}` : r.detail;
  } else {
    let src: number | undefined;
    let srcIf: string | undefined;
    if (c.source && from.t === 'ios') {
      const sip = parseIp(c.source);
      if (sip !== null) src = sip;
      else {
        const n = lookupIf(from, c.source);
        if (!n) return { pass: false, detail: `${c.from}: unknown source interface ${c.source}` };
        srcIf = n;
        src = net.d.addrs.get(ek(from.id, n))?.[0]?.ip;
        if (src === undefined) return { pass: false, detail: `${c.from} ${shortIf(n)} has no IP address to use as the source` };
      }
    }
    const res = pingSeries(net, from, t.ip!, 5, { src, srcIf });
    const good = res.find((r) => r.symbol === '!');
    ok = !!good;
    const last = res[res.length - 1];
    if (ok) detail = `Reply from ${ipStr(t.ip!)}`;
    else if (last.symbol === 'U') detail = `Destination unreachable (${last.detail})`;
    else detail = `Request timed out (${last.detail})`;
  }
  const head = `${c.from} → ${t.label}`;
  if (ok === expect) return { pass: true, detail: expect ? `${head}: ${detail}` : `${head}: blocked as expected (${detail})` };
  return { pass: false, detail: expect ? `${head}: ${detail}` : `${head}: ping succeeded but should fail` };
}

function traffic(net: Net, c: Extract<LabCheck, { type: 'traffic' }>): CheckResult {
  const from = findDev(net, c.from);
  if (!from) return { pass: false, detail: `Unknown device ${c.from}` };
  const expect = c.expect ?? true;
  const t = targetIp(net, c.to);
  if (!t || t.ip === undefined) return { pass: false, detail: `${c.from} → ${c.to}: cannot determine the target address` };
  const port = c.port ?? (c.proto === 'tcp' ? 80 : 53);
  const pkt =
    c.proto === 'icmp'
      ? { src: 0, dst: t.ip, proto: 'icmp' as const, icmp: 'echo' as const, ttl: 128, size: 64, sport: 1, dport: 1 }
      : { src: 0, dst: t.ip, proto: c.proto, sport: 49152 + (port % 1000), dport: port, ttl: 128, size: 64 };
  let r = roundTrip4(net, from, pkt);
  if (!r.ok && r.arpDrop) r = roundTrip4(net, from, pkt);
  const ok = r.ok || (r.symbol === '!' && !r.refused);
  const what = c.proto === 'icmp' ? 'ICMP' : `${c.proto.toUpperCase()}/${port}`;
  const head = `${c.from} → ${t.label} ${what}`;
  if (ok === expect) return { pass: true, detail: expect ? `${head}: delivered and answered` : `${head}: blocked as expected (${r.detail})` };
  return { pass: false, detail: expect ? `${head}: failed (${r.detail})` : `${head}: traffic was allowed but should be blocked` };
}

function config(net: Net, c: Extract<LabCheck, { type: 'config' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown IOS device ${c.device}` };
  const expect = c.expect ?? true;
  let text = runningConfig(net, dev);
  if (c.section) {
    const sec = section(text, c.section, dev);
    if (sec === null) return { pass: !expect, detail: `${name(dev)}: section "${c.section}" not found in running-config` };
    text = sec;
  }
  const found = re(c.pattern).test(text);
  const where = c.section ? ` (${c.section})` : '';
  if (found === expect) return { pass: true, detail: `${name(dev)} running-config${where} ${found ? 'contains' : 'does not contain'} /${c.pattern}/` };
  return { pass: false, detail: `${name(dev)} running-config${where} ${found ? 'still contains' : 'is missing'} /${c.pattern}/` };
}

function show(net: Net, c: Extract<LabCheck, { type: 'show' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown IOS device ${c.device}` };
  const expect = c.expect ?? true;
  const out = runShow(net, dev, c.command);
  const found = re(c.pattern).test(out);
  if (found === expect) return { pass: true, detail: `"${c.command}" on ${name(dev)} ${found ? 'matches' : 'does not match'} /${c.pattern}/` };
  return { pass: false, detail: `"${c.command}" on ${name(dev)} ${found ? 'unexpectedly matches' : 'does not match'} /${c.pattern}/` };
}

function iface(net: Net, c: Extract<LabCheck, { type: 'interface' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev) return { pass: false, detail: `Unknown device ${c.device}` };
  const n = lookupIf(dev, c.iface);
  if (!n) return { pass: false, detail: `${name(dev)} has no interface ${c.iface}` };
  const d = net.d;
  const st = d.l2.ifs.get(ek(dev.id, n));
  const label = `${name(dev)} ${shortIf(n)}`;
  const problems: string[] = [];
  if (c.status) {
    const actual = !st ? 'down' : st.line === 'admin-down' ? 'admin-down' : st.line === 'up' && st.proto === 'up' ? 'up' : 'down';
    if (actual !== c.status) {
      const txt = !st ? 'down' : st.errdis ? `err-disabled (${st.errdis})` : st.line === 'admin-down' ? 'administratively down' : `${st.line}/${st.proto}`;
      problems.push(`is ${txt} (expected ${c.status === 'up' ? 'up/up' : c.status})`);
    }
  }
  if (c.ip || c.mask) {
    const a = dev.t === 'host' ? (() => {
      const e = hostEffective(dev);
      return e.ip !== undefined ? { ip: e.ip, mask: e.mask ?? 0 } : undefined;
    })() : d.addrs.get(ek(dev.id, n))?.[0];
    if (!a) problems.push(`has no IPv4 address (expected ${c.ip ?? ''}${c.mask ? ` ${c.mask}` : ''})`.replace(' )', ')'));
    else {
      if (c.ip && parseIp(c.ip) !== a.ip) problems.push(`has IP ${ipStr(a.ip)}/${maskLen(a.mask)}, expected ${c.ip}`);
      if (c.mask && parseIp(c.mask) !== a.mask) problems.push(`has mask ${ipStr(a.mask)}, expected ${c.mask}`);
    }
  }
  if (c.ipv6) {
    const want = parseV6Prefix(c.ipv6) ?? (() => {
      const v = parseV6(c.ipv6!);
      return v !== null ? { addr: v, len: -1 } : null;
    })();
    const list = dev.t === 'host' ? hostEffective6(net, d.l2, dev).addrs : d.addrs6.get(ek(dev.id, n)) ?? [];
    const has = want && list.some((x) => parseV6(x.addr) === want.addr && (want.len < 0 || x.len === want.len));
    if (!has) problems.push(`does not have IPv6 address ${c.ipv6}${list.length ? ` (has ${list.map((x) => `${x.addr}${x.linkLocal ? '' : `/${x.len}`}`).join(', ')})` : ''}`);
  }
  if (c.description !== undefined && dev.t === 'ios') {
    const desc = dev.st.cfg.ifaces[n]?.description ?? '';
    if (desc.trim() !== c.description.trim()) problems.push(desc ? `description is "${desc}" (expected "${c.description}")` : `has no description (expected "${c.description}")`);
  }
  if (problems.length) return { pass: false, detail: `${label} ${problems.join('; ')}` };
  return { pass: true, detail: `${label} OK` };
}

function vlan(net: Net, c: Extract<LabCheck, { type: 'vlan' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown switch ${c.device}` };
  const expect = c.exists ?? true;
  const rec = dev.st.vlans[String(c.vlan)];
  if (!expect) return rec ? { pass: false, detail: `VLAN ${c.vlan} still exists on ${name(dev)}` } : { pass: true, detail: `VLAN ${c.vlan} does not exist on ${name(dev)}` };
  if (!rec) return { pass: false, detail: `VLAN ${c.vlan} does not exist on ${name(dev)}` };
  if (c.name !== undefined && rec.name !== c.name) return { pass: false, detail: `VLAN ${c.vlan} exists but is named ${rec.name} (expected ${c.name})` };
  return { pass: true, detail: `VLAN ${c.vlan}${c.name ? ` (${c.name})` : ''} exists on ${name(dev)}` };
}

function switchport(net: Net, c: Extract<LabCheck, { type: 'switchport' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown switch ${c.device}` };
  const n = lookupIf(dev, c.iface);
  if (!n) return { pass: false, detail: `${name(dev)} has no interface ${c.iface}` };
  const cfg = dev.st.cfg.ifaces[n];
  const label = `${name(dev)} ${shortIf(n)}`;
  if (!cfg.sw) return { pass: false, detail: `${label} is not a switchport` };
  const d = net.d;
  const logical = d.l2.memberPo.get(ek(dev.id, n)) ?? n;
  const o = d.l2.oper.get(ek(dev.id, logical));
  const lcfg = dev.st.cfg.ifaces[logical] ?? cfg;
  const problems: string[] = [];
  if (c.mode) {
    let mode: string;
    if (o && o.mode !== 'down') mode = o.mode;
    else mode = lcfg.mode === 'access' ? 'access' : lcfg.mode === 'trunk' ? 'trunk' : 'down';
    if (mode !== c.mode) problems.push(mode === 'down' ? `is down (dynamic mode ${lcfg.mode}; expected ${c.mode})` : `is in ${mode} mode, expected ${c.mode}`);
  }
  if (c.accessVlan !== undefined && lcfg.accessVlan !== c.accessVlan) problems.push(`is in VLAN ${lcfg.accessVlan}, expected ${c.accessVlan}`);
  if (c.voiceVlan !== undefined && lcfg.voiceVlan !== c.voiceVlan) problems.push(`voice VLAN is ${lcfg.voiceVlan ?? 'none'}, expected ${c.voiceVlan}`);
  if (c.nativeVlan !== undefined && lcfg.nativeVlan !== c.nativeVlan) problems.push(`native VLAN is ${lcfg.nativeVlan}, expected ${c.nativeVlan}`);
  if (c.allowed !== undefined) {
    const want = /^all$/i.test(c.allowed.trim()) ? [[1, 4094]] as [number, number][] : parseRangeList(c.allowed, 1, 4094);
    if (!want || !rangesEqual(want, lcfg.allowed)) problems.push(`allowed VLANs are ${lcfg.allowed.length ? rangesStr(lcfg.allowed) : 'none'}, expected ${c.allowed}`);
  }
  if (problems.length) return { pass: false, detail: `${label} ${problems.join('; ')}` };
  return { pass: true, detail: `${label} OK` };
}

function codeMatches(code: string, want: string): boolean {
  const a = code.replace(/\s+/g, '').toUpperCase();
  const b = want.replace(/\s+/g, '').toUpperCase();
  if (a === b) return true;
  if (a.replace('*', '') === b) return true;
  if (b.length === 1 && a[0] === b) return true;
  return false;
}

function route(net: Net, c: Extract<LabCheck, { type: 'route' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown router ${c.device}` };
  const expect = c.expect ?? true;
  const d = net.d;
  const exitIf = c.exitIf ? lookupIf(dev, c.exitIf) ?? c.exitIf : undefined;
  if (c.prefix.includes(':')) {
    const p = parseV6Prefix(c.prefix);
    if (!p) return { pass: false, detail: `Invalid IPv6 prefix ${c.prefix}` };
    const netS = v6Str(p.addr);
    const r = (d.rib6.get(dev.id) ?? []).find((x) => parseV6(x.net) === parseV6(netS) && x.len === p.len);
    let ok = !!r;
    const why: string[] = [];
    if (r && c.source && !codeMatches(r.code, c.source)) {
      ok = false;
      why.push(`source is ${r.code}, expected ${c.source}`);
    }
    if (r && c.nextHop && !r.hops.some((h) => h.nh && parseV6(h.nh) === parseV6(c.nextHop!))) {
      ok = false;
      why.push(`next hop is ${r.hops.map((h) => h.nh ?? h.ifName).join(', ')}, expected ${c.nextHop}`);
    }
    if (r && exitIf && !r.hops.some((h) => h.ifName === exitIf)) {
      ok = false;
      why.push(`exit interface is ${r.hops.map((h) => h.ifName ?? '?').join(', ')}, expected ${exitIf}`);
    }
    if (ok === expect) return { pass: true, detail: `${name(dev)} ${ok ? 'has' : 'does not have'} route ${c.prefix}${r ? ` (${r.code})` : ''}` };
    return { pass: false, detail: r ? `${name(dev)} route ${c.prefix}: ${why.join('; ') || 'present but should not be'}` : `${name(dev)} has no IPv6 route to ${c.prefix}` };
  }
  const p = parsePrefix(c.prefix);
  if (!p) return { pass: false, detail: `Invalid prefix ${c.prefix}` };
  const rib = d.rib.get(dev.id) ?? [];
  const r = rib.find((x) => x.net === p.addr && x.len === p.len);
  let ok = !!r;
  const why: string[] = [];
  if (r && c.source && !codeMatches(r.proto === 'dhcp' ? 'S*' : r.code, c.source)) {
    ok = false;
    why.push(`source is ${r.code}, expected ${c.source}`);
  }
  if (r && c.nextHop) {
    const nh = parseIp(c.nextHop);
    if (!r.hops.some((h) => h.nh === nh)) {
      ok = false;
      why.push(`next hop is ${r.hops.map((h) => (h.nh !== undefined ? ipStr(h.nh) : `directly connected ${h.ifName}`)).join(', ')}, expected ${c.nextHop}`);
    }
  }
  if (r && exitIf && !r.hops.some((h) => h.ifName === exitIf)) {
    ok = false;
    why.push(`exit interface is ${r.hops.map((h) => h.ifName ?? 'recursive').join(', ')}, expected ${exitIf}`);
  }
  if (ok === expect) return { pass: true, detail: `${name(dev)} ${ok ? 'has' : 'does not have'} route ${c.prefix}${r ? ` [${r.code} ${r.ad}/${r.metric}]` : ''}` };
  if (!r) {
    const best = lpm(rib, p.addr);
    return { pass: false, detail: `${name(dev)} has no route to ${c.prefix}${best ? ` (packets would use ${ipStr(best.net)}/${best.len} [${best.code}])` : ''}` };
  }
  return { pass: false, detail: `${name(dev)} route ${c.prefix}: ${why.join('; ') || `present (${r.code}) but should not be`}` };
}

function ospfNeighbor(net: Net, c: Extract<LabCheck, { type: 'ospfNeighbor' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown router ${c.device}` };
  const d = net.d;
  let want = parseIp(c.neighbor);
  const nd = want === null ? findDev(net, c.neighbor) : undefined;
  let wantDev: string | undefined;
  if (want === null && nd) wantDev = nd.id;
  const procs = [...d.ospf.procs.values(), ...d.ospf6.procs.values()].filter((p) => p.dev === dev.id);
  if (!procs.length) return { pass: false, detail: `${name(dev)} is not running OSPF` };
  for (const p of procs) {
    for (const n of p.nbrs) {
      const match = (want !== null && (n.rid === want || n.addr === c.neighbor)) || (wantDev !== undefined && n.remoteDev === wantDev);
      if (!match) continue;
      const problems: string[] = [];
      if (c.state && n.state !== c.state) problems.push(`state is ${n.state}, expected ${c.state}`);
      if (c.role && n.role !== c.role) problems.push(`role is ${n.role === '-' ? 'none (point-to-point)' : n.role}, expected ${c.role}`);
      if (problems.length) return { pass: false, detail: `${name(dev)} neighbor ${ipStr(n.rid)}: ${problems.join('; ')}` };
      return { pass: true, detail: `${name(dev)} has neighbor ${ipStr(n.rid)} ${n.state}/${n.role === '-' ? ' -' : n.role} on ${shortIf(n.ifName)}` };
    }
  }
  want ??= nd && nd.t === 'ios' ? ([...d.ospf.procs.values()].find((p) => p.dev === nd.id)?.rid ?? null) : null;
  const have = procs.flatMap((p) => p.nbrs.map((n) => ipStr(n.rid)));
  return { pass: false, detail: `${name(dev)} has no OSPF neighbor ${c.neighbor}${have.length ? ` (neighbors: ${have.join(', ')})` : ' (no neighbors)'}` };
}

function ospfRid(net: Net, c: Extract<LabCheck, { type: 'ospfRouterId' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown router ${c.device}` };
  const p = [...net.d.ospf.procs.values(), ...net.d.ospf6.procs.values()].find((x) => x.dev === dev.id);
  if (!p) return { pass: false, detail: `${name(dev)} is not running OSPF` };
  if (p.rid === null) return { pass: false, detail: `${name(dev)} OSPF process ${p.pid} has no router ID` };
  const want = parseIp(c.rid);
  if (p.rid === want) return { pass: true, detail: `${name(dev)} OSPF router ID is ${c.rid}` };
  const cfgRid = p.cfg.rid;
  const hint = cfgRid !== undefined && cfgRid !== p.rid ? ` (router-id ${ipStr(cfgRid)} is configured — use "clear ip ospf process")` : '';
  return { pass: false, detail: `${name(dev)} OSPF router ID is ${ipStr(p.rid)}, expected ${c.rid}${hint}` };
}

function stpRoot(net: Net, c: Extract<LabCheck, { type: 'stpRoot' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown switch ${c.device}` };
  const inst = net.d.l2.stp.get(dev.id)?.get(c.vlan);
  if (!inst) return { pass: false, detail: `${name(dev)} has no spanning-tree instance for VLAN ${c.vlan}` };
  if (inst.isRoot) return { pass: true, detail: `${name(dev)} is the root bridge for VLAN ${c.vlan} (priority ${inst.bridgePrio + c.vlan})` };
  const root = net.iosDevices().find((x) => x.mac === inst.rootMac);
  return { pass: false, detail: `${root ? name(root) : inst.rootMac} is the root for VLAN ${c.vlan} (priority ${inst.rootPrio + c.vlan}), not ${name(dev)} (priority ${inst.bridgePrio + c.vlan})` };
}

function stpPort(net: Net, c: Extract<LabCheck, { type: 'stpPort' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown switch ${c.device}` };
  const n = lookupIf(dev, c.iface);
  if (!n) return { pass: false, detail: `${name(dev)} has no interface ${c.iface}` };
  const logical = net.d.l2.memberPo.get(ek(dev.id, n)) ?? n;
  const inst = net.d.l2.stp.get(dev.id)?.get(c.vlan);
  const p = inst?.ports.get(logical);
  if (!p) return { pass: false, detail: `${name(dev)} ${shortIf(n)} is not in the VLAN ${c.vlan} spanning tree (port down or VLAN not carried)` };
  const problems: string[] = [];
  if (c.role && p.role !== c.role) problems.push(`role is ${p.role}, expected ${c.role}`);
  if (c.state && p.state !== c.state) problems.push(`state is ${p.state}, expected ${c.state}`);
  if (problems.length) return { pass: false, detail: `${name(dev)} ${shortIf(logical)} VLAN ${c.vlan}: ${problems.join('; ')}` };
  return { pass: true, detail: `${name(dev)} ${shortIf(logical)} VLAN ${c.vlan}: ${p.role} ${p.state}` };
}

function etherchannel(net: Net, c: Extract<LabCheck, { type: 'etherchannel' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown switch ${c.device}` };
  const b = net.d.l2.bundles.get(ek(dev.id, `Port-channel${c.group}`));
  if (!b) return { pass: false, detail: `${name(dev)} has no channel-group ${c.group}` };
  const problems: string[] = [];
  const proto = b.proto === 'LACP' ? 'lacp' : b.proto === 'PAgP' ? 'pagp' : 'on';
  if (c.protocol && proto !== c.protocol) problems.push(`protocol is ${proto}, expected ${c.protocol}`);
  if (c.up !== undefined && b.up !== c.up) problems.push(`Po${c.group} is ${b.up ? 'up' : 'down'} (member flags ${b.members.map((m) => `${shortIf(m.ifName)}(${m.flag})`).join(' ')})`);
  const bundled = b.members.filter((m) => m.flag === 'P').length;
  if (c.members !== undefined && bundled !== c.members) problems.push(`${bundled} member(s) bundled, expected ${c.members} (${b.members.map((m) => `${shortIf(m.ifName)}(${m.flag})`).join(' ')})`);
  if (problems.length) return { pass: false, detail: `${name(dev)} Po${c.group}: ${problems.join('; ')}` };
  return { pass: true, detail: `${name(dev)} Po${c.group} ${b.up ? 'up' : 'down'}, ${bundled} bundled (${proto})` };
}

function host(net: Net, c: Extract<LabCheck, { type: 'host' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'host') return { pass: false, detail: `Unknown host ${c.device}` };
  const e = hostEffective(dev);
  const problems: string[] = [];
  if (c.dhcp !== undefined && !!dev.st.cfg.dhcp !== c.dhcp) problems.push(c.dhcp ? 'is not using DHCP' : 'is using DHCP (expected static)');
  if (c.ip && (e.ip === undefined || parseIp(c.ip) !== e.ip)) problems.push(`IP is ${e.ip !== undefined ? ipStr(e.ip) : 'not set'}, expected ${c.ip}`);
  if (c.mask && (e.mask === undefined || parseIp(c.mask) !== e.mask)) problems.push(`mask is ${e.mask !== undefined ? ipStr(e.mask) : 'not set'}, expected ${c.mask}`);
  if (c.gateway && (e.gw === undefined || parseIp(c.gateway) !== e.gw)) problems.push(`gateway is ${e.gw !== undefined ? ipStr(e.gw) : 'not set'}, expected ${c.gateway}`);
  if (c.dns && (e.dns === undefined || parseIp(c.dns) !== e.dns)) problems.push(`DNS server is ${e.dns !== undefined ? ipStr(e.dns) : 'not set'}, expected ${c.dns}`);
  if (c.inSubnet) {
    const p = parsePrefix(c.inSubnet);
    if (!p) problems.push(`invalid subnet ${c.inSubnet}`);
    else if (e.ip === undefined || e.apipa || !inNet(e.ip, p.addr, (0xffffffff << (32 - p.len)) >>> 0)) problems.push(`address ${e.ip !== undefined ? ipStr(e.ip) : 'none'}${e.apipa ? ' (APIPA — no DHCP server answered)' : ''} is not in ${c.inSubnet}`);
  }
  if (problems.length) return { pass: false, detail: `${dev.id} ${problems.join('; ')}` };
  return { pass: true, detail: `${dev.id} ${e.ip !== undefined ? ipStr(e.ip) : ''} OK` };
}

function login(net: Net, c: Extract<LabCheck, { type: 'login' }>): CheckResult {
  const from = findDev(net, c.from);
  if (!from) return { pass: false, detail: `Unknown device ${c.from}` };
  const expect = c.expect ?? true;
  const t = targetIp(net, c.to);
  if (!t || t.ip === undefined) return { pass: false, detail: `${c.from} → ${c.to}: cannot determine the target address` };
  const r = loginReach(net, from, t.ip, c.protocol);
  let ok = false;
  let detail: string;
  if (!r.ok || !r.target) detail = (r.msg ?? 'connection failed').replace(/^% /, '');
  else {
    const line = r.target.st.cfg.lines.vty[r.line ?? 0];
    const auth = authMode(r.target, line);
    const cr = checkCreds(r.target, line, auth, c.protocol, c.username, c.password);
    ok = cr.ok;
    detail = cr.ok ? `logged in to ${r.target.st.cfg.hostname} (${cr.privilege >= 15 ? 'privileged' : 'user'} EXEC)` : `${cr.msg.replace(/^% /, '')}${c.protocol === 'ssh' && auth === 'line' ? ' (SSH requires login local / a username)' : ''}`;
  }
  const head = `${c.from} → ${t.label} ${c.protocol.toUpperCase()}`;
  if (ok === expect) return { pass: true, detail: expect ? `${head}: ${detail}` : `${head}: refused as expected (${detail})` };
  return { pass: false, detail: expect ? `${head}: ${detail}` : `${head}: login succeeded but should be refused` };
}

function saved(net: Net, c: Extract<LabCheck, { type: 'saved' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown IOS device ${c.device}` };
  if (!dev.st.startup) return { pass: false, detail: `${name(dev)} has no startup-config (use copy running-config startup-config)` };
  const same = normalizeConfig(dev.st.startup) === normalizeConfig(savedConfigText(net, dev));
  return same ? { pass: true, detail: `${name(dev)} running-config is saved` } : { pass: false, detail: `${name(dev)} running-config has unsaved changes` };
}

function hsrp(net: Net, c: Extract<LabCheck, { type: 'hsrp' }>): CheckResult {
  const dev = findDev(net, c.device);
  if (!dev || dev.t !== 'ios') return { pass: false, detail: `Unknown router ${c.device}` };
  const d = net.d;
  const mine = [...d.hsrp.byIf.entries()].filter(([k2]) => k2.startsWith(dev.id + '|')).flatMap(([, l]) => l).filter((m) => m.group === c.group);
  if (!mine.length) return { pass: false, detail: `${name(dev)} has no HSRP group ${c.group}` };
  const m = mine[0];
  const g = d.hsrp.groups.find((x) => x.members.includes(m));
  const problems: string[] = [];
  if (c.state && m.state !== c.state) problems.push(`state is ${m.state}, expected ${c.state}`);
  if (c.vip) {
    const vip = g?.vip ?? m.vip;
    if (vip === undefined || vip !== parseIp(c.vip)) problems.push(`virtual IP is ${vip !== undefined ? ipStr(vip) : 'unknown'}, expected ${c.vip}`);
  }
  if (problems.length) return { pass: false, detail: `${name(dev)} HSRP group ${c.group}: ${problems.join('; ')}` };
  return { pass: true, detail: `${name(dev)} HSRP group ${c.group} is ${m.state}` };
}

function resolve(net: Net, c: Extract<LabCheck, { type: 'resolve' }>): CheckResult {
  const from = findDev(net, c.from);
  if (!from) return { pass: false, detail: `Unknown device ${c.from}` };
  const r = resolveName(net, from, c.name);
  if (!r.ok) {
    const why = r.reason === 'noserver' ? 'no DNS server configured' : r.reason === 'timeout' ? `DNS server ${r.server !== undefined ? ipStr(r.server) : ''} not reachable on UDP 53` : r.reason === 'nxdomain' ? 'name not found on the DNS server' : 'domain lookup disabled';
    return { pass: false, detail: `${c.from} cannot resolve ${c.name}: ${why}` };
  }
  if (r.ip !== parseIp(c.ip)) return { pass: false, detail: `${c.from} resolves ${c.name} to ${ipStr(r.ip)}, expected ${c.ip}` };
  return { pass: true, detail: `${c.from} resolves ${c.name} to ${c.ip}` };
}

export function evaluateCheck(net: Net, check: LabCheck): CheckResult {
  try {
    return net.dryRun(() => {
      switch (check.type) {
        case 'ping':
          return ping(net, check);
        case 'traffic':
          return traffic(net, check);
        case 'config':
          return config(net, check);
        case 'show':
          return show(net, check);
        case 'interface':
          return iface(net, check);
        case 'vlan':
          return vlan(net, check);
        case 'switchport':
          return switchport(net, check);
        case 'route':
          return route(net, check);
        case 'ospfNeighbor':
          return ospfNeighbor(net, check);
        case 'ospfRouterId':
          return ospfRid(net, check);
        case 'stpRoot':
          return stpRoot(net, check);
        case 'stpPort':
          return stpPort(net, check);
        case 'etherchannel':
          return etherchannel(net, check);
        case 'host':
          return host(net, check);
        case 'login':
          return login(net, check);
        case 'saved':
          return saved(net, check);
        case 'hsrp':
          return hsrp(net, check);
        case 'resolve':
          return resolve(net, check);
        default:
          return { pass: false, detail: `Unknown check type ${(check as { type: string }).type}` };
      }
    });
  } catch (e) {
    return { pass: false, detail: `Check error: ${(e as Error).message}` };
  }
}
