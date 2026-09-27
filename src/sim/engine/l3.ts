/** Layer 3: effective addresses, routing tables (IPv4/IPv6), lookups and HSRP. */
import type { Addr4, Device, IosDevice } from '../model/state';
import { parentOf, typeOfName } from '../model/ifname';
import { classfulLen, inNet, maskFromLen, maskLen, netOf, parseIp } from '../util/ip';
import { linkLocalFromMac, parseV6, v6InNet, v6Net, v6Str, eui64, isLinkLocal } from '../util/ipv6';
import { ifMac, isPhysical } from './topo';
import { ek, type Net } from './net';
import { flood, type L2State } from './l2';

export interface Hop {
  nh?: number;
  ifName?: string;
  /** OSPF advertising router */
  from?: number;
}

export interface Route {
  code: string;
  proto: 'connected' | 'local' | 'static' | 'ospf' | 'dhcp';
  net: number;
  len: number;
  ad: number;
  metric: number;
  hops: Hop[];
  ospfType?: 'intra' | 'inter' | 'E1' | 'E2';
  pid?: number;
  area?: string;
  since?: number;
}

export interface Hop6 {
  nh?: string;
  ifName?: string;
  from?: number;
}

export interface Route6 {
  code: string;
  proto: 'connected' | 'local' | 'static' | 'ospf' | 'nd';
  net: string;
  len: number;
  ad: number;
  metric: number;
  hops: Hop6[];
  pid?: number;
}

export interface V6Addr {
  addr: string;
  len: number;
  linkLocal: boolean;
  eui64?: boolean;
  auto?: boolean;
}

/* ------------------------------------------------------------------ */
/* addresses                                                           */
/* ------------------------------------------------------------------ */

/** Is this interface a Layer 3 interface (routed) on its device? */
export function isL3If(dev: IosDevice, name: string): boolean {
  const c = dev.st.cfg.ifaces[name];
  if (!c) return false;
  if (dev.kind === 'router') return true;
  const t = typeOfName(name)?.name;
  if (t === 'Vlan' || t === 'Loopback' || t === 'Tunnel') return true;
  return !c.sw;
}

/** IPv4 addresses configured/learned on IOS interfaces (primary first). */
export function computeAddrs(net: Net): Map<string, Addr4[]> {
  const out = new Map<string, Addr4[]>();
  for (const dev of net.iosDevices()) {
    for (const [name, c] of Object.entries(dev.st.cfg.ifaces)) {
      if (!isL3If(dev, name)) continue;
      const list: Addr4[] = [];
      if (c.ip) list.push(c.ip);
      else if (c.dhcp) {
        const lease = dev.st.dyn.ifd[name]?.lease;
        if (lease) list.push({ ip: lease.ip, mask: lease.mask });
      }
      if (list.length) list.push(...c.secondary);
      if (list.length) out.set(ek(dev.id, name), list);
    }
  }
  // clouds without explicit addressing borrow the subnet of the attached router interface
  for (const dev of net.allDevices()) {
    if (dev.t !== 'host' || dev.kind !== 'cloud') continue;
    dev.cloudAuto = undefined;
    const ip = dev.st.cfg.ip ? parseIp(dev.st.cfg.ip) ?? undefined : dev.cloudIp;
    if (ip === undefined) continue;
    for (const p of dev.hw.ifaces) {
      const peer = net.peerOf(dev.id, p.name);
      const a = peer ? out.get(ek(peer.dev, peer.ifName))?.[0] : undefined;
      if (!a) continue;
      dev.cloudAuto = { mask: inNet(ip, a.ip, a.mask) ? a.mask : 0xffffffff, gw: a.ip };
      break;
    }
  }
  return out;
}

export interface HostEff {
  ip?: number;
  mask?: number;
  gw?: number;
  dns?: number;
  dhcp: boolean;
  apipa: boolean;
}

export function hostEffective(dev: Device): HostEff {
  if (dev.t !== 'host') return { dhcp: false, apipa: false };
  const c = dev.st.cfg;
  if (dev.kind === 'cloud') {
    const ip = c.ip ? parseIp(c.ip) ?? undefined : dev.cloudIp;
    const mask = c.mask ? parseIp(c.mask) ?? undefined : dev.cloudAuto?.mask;
    const gw = c.gateway ? parseIp(c.gateway) ?? undefined : dev.cloudAuto?.gw;
    return { ip, mask, gw, dhcp: false, apipa: false };
  }
  if (c.dhcp) {
    const l = dev.st.lease;
    if (l) return { ip: l.ip, mask: l.mask, gw: l.gw, dns: l.dns, dhcp: true, apipa: false };
    if (dev.st.apipa) return { ip: dev.st.apipa, mask: 0xffff0000, dhcp: true, apipa: true };
    return { dhcp: true, apipa: false };
  }
  return {
    ip: c.ip ? parseIp(c.ip) ?? undefined : undefined,
    mask: c.mask ? parseIp(c.mask) ?? undefined : undefined,
    gw: c.gateway ? parseIp(c.gateway) ?? undefined : undefined,
    dns: c.dns ? parseIp(c.dns) ?? undefined : undefined,
    dhcp: false,
    apipa: false,
  };
}

/** All IPv4 addresses owned by a device (for "is this packet for me?"). */
export function ownsIp(_net: Net, addrs: Map<string, Addr4[]>, dev: Device, ip: number): string | null {
  if (dev.t === 'host') {
    const e = hostEffective(dev);
    return e.ip === ip ? dev.hw.ifaces[0].name : null;
  }
  for (const name of Object.keys(dev.st.cfg.ifaces)) {
    const list = addrs.get(ek(dev.id, name));
    if (list?.some((a) => a.ip === ip)) return name;
  }
  return null;
}

/* ---------------- IPv6 addresses ---------------- */

export function computeAddrs6(net: Net, l2: L2State): Map<string, V6Addr[]> {
  const out = new Map<string, V6Addr[]>();
  for (const dev of net.iosDevices()) {
    for (const [name, c] of Object.entries(dev.st.cfg.ifaces)) {
      if (!isL3If(dev, name)) continue;
      const list: V6Addr[] = [];
      const hasGlobal = c.v6.some((x) => !x.linkLocal);
      const manualLL = c.v6.find((x) => x.linkLocal);
      if (c.v6Enabled || hasGlobal || manualLL || c.v6Auto) {
        const mac = ifMac(dev, name);
        list.push({ addr: manualLL ? manualLL.addr : v6Str(linkLocalFromMac(mac)), len: 64, linkLocal: true });
        for (const x of c.v6) {
          if (x.linkLocal) continue;
          if (x.eui64) {
            const base = parseV6(x.addr);
            if (base === null) continue;
            const v = v6Net(base, 64) | eui64(mac);
            list.push({ addr: v6Str(v), len: x.len, linkLocal: false, eui64: true });
          } else list.push({ addr: x.addr, len: x.len, linkLocal: false });
        }
        if (c.v6Auto) {
          const pfx = raPrefixFor(net, l2, dev, name);
          if (pfx) list.push({ addr: v6Str(pfx.net | eui64(mac)), len: 64, linkLocal: false, auto: true });
        }
      }
      if (list.length) out.set(ek(dev.id, name), list);
    }
  }
  return out;
}

/** First router advertisement prefix heard on an interface (SLAAC). */
export function raPrefixFor(net: Net, l2: L2State, dev: Device, ifName: string): { net: bigint; router: string; routerIf: string } | null {
  const fl = flood(net, l2, dev, ifName);
  for (const ep of fl.eps) {
    const r = net.ios(ep.dev);
    if (!r || !r.st.cfg.v6Routing || r.id === dev.id) continue;
    const c = r.st.cfg.ifaces[ep.ifName];
    if (!c) continue;
    const st = l2.ifs.get(ek(r.id, ep.ifName));
    if (!st || st.proto !== 'up') continue;
    const g = c.v6.find((x) => !x.linkLocal && x.len === 64);
    if (!g) continue;
    const v = parseV6(g.addr);
    if (v === null) continue;
    return { net: v6Net(v, 64), router: r.id, routerIf: ep.ifName };
  }
  return null;
}

export interface HostEff6 {
  addrs: V6Addr[];
  gw?: string;
  gwDev?: string;
}

export function hostEffective6(net: Net, l2: L2State, dev: Device): HostEff6 {
  if (dev.t !== 'host') return { addrs: [] };
  const mac = ifMac(dev, dev.hw.ifaces[0].name);
  const ll: V6Addr = { addr: v6Str(linkLocalFromMac(mac)), len: 64, linkLocal: true };
  const out: HostEff6 = { addrs: [ll] };
  const c = dev.st.cfg;
  if (c.ipv6) {
    const m = /^(.+)\/(\d+)$/.exec(c.ipv6);
    const v = parseV6(m ? m[1] : c.ipv6);
    if (v !== null) out.addrs.push({ addr: v6Str(v), len: m ? Number(m[2]) : 64, linkLocal: false });
    if (c.ipv6Gateway) {
      const g = parseV6(c.ipv6Gateway);
      if (g !== null) out.gw = v6Str(g);
    }
  }
  if (c.ipv6Auto) {
    const ra = raPrefixFor(net, l2, dev, dev.hw.ifaces[0].name);
    if (ra) {
      out.addrs.push({ addr: v6Str(ra.net | eui64(mac)), len: 64, linkLocal: false, auto: true });
      const r = net.ios(ra.router)!;
      if (!out.gw) {
        out.gw = v6Str(linkLocalFromMac(ifMac(r, ra.routerIf)));
        const rc = r.st.cfg.ifaces[ra.routerIf];
        const manual = rc?.v6.find((x) => x.linkLocal);
        if (manual) out.gw = manual.addr;
        out.gwDev = r.id;
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* IPv4 RIB                                                            */
/* ------------------------------------------------------------------ */

export function routeKey(net: number, len: number): string {
  return `${net}/${len}`;
}

export function connectedRoutes(_net: Net, l2: L2State, addrs: Map<string, Addr4[]>, dev: IosDevice): Route[] {
  const out: Route[] = [];
  for (const name of Object.keys(dev.st.cfg.ifaces)) {
    const list = addrs.get(ek(dev.id, name));
    if (!list) continue;
    const st = l2.ifs.get(ek(dev.id, name));
    if (!st || st.line !== 'up' || st.proto !== 'up') continue;
    for (const a of list) {
      const len = maskLen(a.mask);
      if (len < 0) continue;
      out.push({ code: 'C', proto: 'connected', net: netOf(a.ip, a.mask), len, ad: 0, metric: 0, hops: [{ ifName: name }] });
      if (len < 32) out.push({ code: 'L', proto: 'local', net: a.ip, len: 32, ad: 0, metric: 0, hops: [{ ifName: name }] });
    }
  }
  return out;
}

/** Longest-prefix match over a route list. */
export function lpm(routes: Route[], ip: number, exclude?: Route): Route | undefined {
  let best: Route | undefined;
  for (const r of routes) {
    if (r === exclude) continue;
    if (!inNet(ip, r.net, maskFromLen(r.len))) continue;
    if (!best || r.len > best.len) best = r;
  }
  return best;
}

/** Resolve a (possibly recursive) hop to egress interface + next-hop IP. */
export function resolveHop(routes: Route[], hop: Hop, dst: number, depth = 0): { ifName: string; nh: number } | null {
  if (depth > 8) return null;
  if (hop.ifName) return { ifName: hop.ifName, nh: hop.nh ?? dst };
  if (hop.nh === undefined) return null;
  const r = lpm(routes, hop.nh);
  if (!r) return null;
  const h = r.hops[0];
  if (r.proto === 'connected' || r.proto === 'local') return { ifName: h.ifName!, nh: hop.nh };
  return resolveHop(routes, h, hop.nh, depth + 1);
}

function selectBest(cands: Route[], maxPaths = 16): Route[] {
  const byKey = new Map<string, Route[]>();
  for (const r of cands) {
    const k = routeKey(r.net, r.len) + (r.proto === 'local' ? 'L' : '');
    const arr = byKey.get(k) ?? [];
    arr.push(r);
    byKey.set(k, arr);
  }
  const out: Route[] = [];
  for (const arr of byKey.values()) {
    arr.sort((x, y) => x.ad - y.ad || x.metric - y.metric);
    const best = arr[0];
    if (best.proto === 'static') {
      const same = arr.filter((r) => r.proto === 'static' && r.ad === best.ad);
      const hops = same.flatMap((r) => r.hops).slice(0, maxPaths);
      out.push({ ...best, hops });
    } else out.push(best);
  }
  return out;
}

export interface RibInput {
  connected: Route[];
  ospf: Route[];
  dhcpDefault?: Route;
}

/** Validate static routes against a table (recursive next hops, exit interface state). */
export function staticCandidates(_net: Net, l2: L2State, dev: IosDevice, table: Route[]): Route[] {
  const out: Route[] = [];
  for (const s of dev.st.cfg.routes) {
    const len = maskLen(s.mask);
    if (len < 0) continue;
    const r: Route = {
      code: len === 0 ? 'S*' : 'S',
      proto: 'static',
      net: netOf(s.net, s.mask),
      len,
      ad: s.ad,
      metric: 0,
      hops: [{ nh: s.nh, ifName: s.ifName }],
    };
    if (s.ifName) {
      if (s.ifName === 'Null0') {
        out.push(r);
        continue;
      }
      const st = l2.ifs.get(ek(dev.id, s.ifName));
      if (!st || st.line !== 'up' || st.proto !== 'up') {
        if (!s.permanent) continue;
      }
      out.push(r);
      continue;
    }
    if (s.nh === undefined) continue;
    // recursive: next hop must resolve through a non-self route
    const res = lpm(table, s.nh);
    if (!res) continue;
    if (res.proto === 'static' && res.net === r.net && res.len === r.len) continue;
    if (resolveHop(table, { nh: s.nh }, s.nh) === null) continue;
    out.push(r);
  }
  return out;
}

export function buildRib(net: Net, l2: L2State, dev: IosDevice, inp: RibInput): Route[] {
  const base = [...inp.connected, ...inp.ospf];
  if (inp.dhcpDefault) base.push(inp.dhcpDefault);
  let table = selectBest(base);
  for (let i = 0; i < 4; i++) {
    const st = staticCandidates(net, l2, dev, table);
    const next = selectBest([...base, ...st], 16);
    if (next.length === table.length && next.every((r, j) => r === table[j] || (r.net === table[j].net && r.len === table[j].len && r.proto === table[j].proto && r.hops.length === table[j].hops.length))) {
      table = next;
      break;
    }
    table = next;
  }
  // OSPF ECMP limited by maximum-paths is already applied by the OSPF engine
  return sortRoutes(table);
}

export function sortRoutes(rs: Route[]): Route[] {
  return rs.sort((a, b) => a.net - b.net || a.len - b.len || (a.proto === 'local' ? 1 : 0) - (b.proto === 'local' ? 1 : 0));
}

export interface Lookup {
  route: Route;
  ifName: string;
  nh: number;
}

/** Forwarding lookup with recursion; returns the first usable path (ECMP → first hop). */
export function lookup(routes: Route[], dst: number): Lookup | null {
  const r = lpm(routes, dst);
  if (!r) return null;
  for (const h of r.hops) {
    if (r.proto === 'connected' || r.proto === 'local') return { route: r, ifName: h.ifName!, nh: dst };
    if (h.ifName === 'Null0') return { route: r, ifName: 'Null0', nh: dst };
    const res = resolveHop(routes, h, dst);
    if (res) return { route: r, ifName: res.ifName, nh: res.nh };
  }
  return null;
}

export function classfulNet(ip: number): { net: number; len: number } {
  const len = classfulLen(ip);
  return { net: netOf(ip, maskFromLen(len)), len };
}

/* ------------------------------------------------------------------ */
/* IPv6 RIB                                                            */
/* ------------------------------------------------------------------ */

export function buildRib6(_net: Net, l2: L2State, addrs6: Map<string, V6Addr[]>, dev: IosDevice, ospf6: Route6[]): Route6[] {
  const base: Route6[] = [];
  for (const name of Object.keys(dev.st.cfg.ifaces)) {
    const list = addrs6.get(ek(dev.id, name));
    if (!list) continue;
    const st = l2.ifs.get(ek(dev.id, name));
    if (!st || st.line !== 'up' || st.proto !== 'up') continue;
    for (const a of list) {
      if (a.linkLocal) continue;
      const v = parseV6(a.addr)!;
      base.push({ code: 'C', proto: 'connected', net: v6Str(v6Net(v, a.len)), len: a.len, ad: 0, metric: 0, hops: [{ ifName: name }] });
      if (a.len < 128) base.push({ code: 'L', proto: 'local', net: a.addr, len: 128, ad: 0, metric: 0, hops: [{ ifName: name }] });
    }
  }
  base.push(...ospf6);
  const statics: Route6[] = [];
  for (const s of dev.st.cfg.routes6) {
    const r: Route6 = { code: 'S', proto: 'static', net: s.net, len: s.len, ad: s.ad, metric: 0, hops: [{ nh: s.nh, ifName: s.ifName }] };
    if (s.ifName) {
      if (s.ifName !== 'Null0') {
        const st = l2.ifs.get(ek(dev.id, s.ifName));
        if (!st || st.line !== 'up' || st.proto !== 'up') continue;
      }
      statics.push(r);
      continue;
    }
    if (!s.nh) continue;
    const nh = parseV6(s.nh);
    if (nh === null || isLinkLocal(nh)) continue;
    if (!lpm6(base, nh)) continue;
    statics.push(r);
  }
  const all = [...base, ...statics];
  const byKey = new Map<string, Route6[]>();
  for (const r of all) {
    const k = `${r.net}/${r.len}/${r.proto === 'local' ? 'L' : ''}`;
    const arr = byKey.get(k) ?? [];
    arr.push(r);
    byKey.set(k, arr);
  }
  const out: Route6[] = [];
  for (const arr of byKey.values()) {
    arr.sort((x, y) => x.ad - y.ad || x.metric - y.metric);
    const best = arr[0];
    if (best.proto === 'static') out.push({ ...best, hops: arr.filter((r) => r.proto === 'static' && r.ad === best.ad).flatMap((r) => r.hops) });
    else out.push(best);
  }
  out.sort((a, b) => {
    const x = parseV6(a.net)!;
    const y = parseV6(b.net)!;
    return x < y ? -1 : x > y ? 1 : a.len - b.len;
  });
  return out;
}

export function lpm6(routes: Route6[], dst: bigint): Route6 | undefined {
  let best: Route6 | undefined;
  for (const r of routes) {
    const n = parseV6(r.net);
    if (n === null) continue;
    if (!v6InNet(dst, n, r.len)) continue;
    if (!best || r.len > best.len) best = r;
  }
  return best;
}

export function lookup6(routes: Route6[], dst: bigint, depth = 0): { route: Route6; ifName: string; nh: string } | null {
  if (depth > 6) return null;
  const r = lpm6(routes, dst);
  if (!r) return null;
  const h = r.hops[0];
  if (r.proto === 'connected' || r.proto === 'local') return { route: r, ifName: h.ifName!, nh: v6Str(dst) };
  if (h.ifName) return { route: r, ifName: h.ifName, nh: h.nh ?? v6Str(dst) };
  if (!h.nh) return null;
  const nh = parseV6(h.nh)!;
  const inner = lookup6(routes, nh, depth + 1);
  if (!inner) return null;
  return { route: r, ifName: inner.ifName, nh: inner.route.proto === 'connected' ? h.nh : inner.nh };
}

/* ------------------------------------------------------------------ */
/* HSRP                                                                */
/* ------------------------------------------------------------------ */

export interface HsrpMember {
  dev: string;
  ifName: string;
  group: number;
  prio: number;
  preempt: boolean;
  ip: number;
  vip?: number;
  state: 'Active' | 'Standby' | 'Listen' | 'Init';
  version: 1 | 2;
}

export interface HsrpGroupState {
  key: string;
  members: HsrpMember[];
  active?: HsrpMember;
  standby?: HsrpMember;
  vip?: number;
  vmac: string;
}

export function hsrpVmac(group: number, version: 1 | 2): string {
  if (version === 2) return '00000c9ff' + group.toString(16).padStart(3, '0');
  return '00000c07ac' + group.toString(16).padStart(2, '0');
}

export function computeHsrp(net: Net, l2: L2State, addrs: Map<string, Addr4[]>): { groups: HsrpGroupState[]; byIf: Map<string, HsrpMember[]> } {
  const members: HsrpMember[] = [];
  for (const dev of net.iosDevices()) {
    for (const [name, c] of Object.entries(dev.st.cfg.ifaces)) {
      const gkeys = Object.keys(c.hsrp);
      if (!gkeys.length) continue;
      const a = addrs.get(ek(dev.id, name))?.[0];
      const st = l2.ifs.get(ek(dev.id, name));
      const up = !!st && st.line === 'up' && st.proto === 'up' && !!a;
      for (const g of gkeys) {
        const cfg = c.hsrp[g];
        members.push({
          dev: dev.id,
          ifName: name,
          group: Number(g),
          prio: cfg.priority ?? 100,
          preempt: !!cfg.preempt,
          ip: a?.ip ?? 0,
          vip: cfg.ip,
          state: up ? 'Listen' : 'Init',
          version: c.hsrpVer,
        });
      }
    }
  }
  // segment grouping via L2 flood reachability
  const groups: HsrpGroupState[] = [];
  const assigned = new Set<HsrpMember>();
  for (const m of members) {
    if (assigned.has(m) || m.state === 'Init') continue;
    const dev = net.ios(m.dev)!;
    const fl = flood(net, l2, dev, m.ifName);
    const reach = new Set(fl.eps.map((e) => ek(e.dev, e.ifName)));
    const seg = members.filter((x) => x === m || (x.state !== 'Init' && x.group === m.group && x.version === m.version && reach.has(ek(x.dev, x.ifName))));
    seg.forEach((x) => assigned.add(x));
    const key = `${m.version}|${m.group}|${seg.map((x) => ek(x.dev, x.ifName)).sort()[0]}`;
    const rank = (x: HsrpMember) => x.prio * 4294967296 + x.ip;
    let active: HsrpMember | undefined;
    const sticky = seg.find((x) => net.ios(x.dev)!.st.dyn.hsrp[`${x.ifName}|${x.group}`] === 'Active');
    const best = [...seg].sort((x, y) => rank(y) - rank(x))[0];
    if (sticky && !(best !== sticky && best.preempt && rank(best) > rank(sticky))) active = sticky;
    else active = best;
    const rest = seg.filter((x) => x !== active).sort((x, y) => rank(y) - rank(x));
    const standby = rest[0];
    for (const x of seg) x.state = x === active ? 'Active' : x === standby ? 'Standby' : 'Listen';
    const vip = active?.vip ?? seg.find((x) => x.vip !== undefined)?.vip;
    groups.push({ key, members: seg, active, standby, vip, vmac: hsrpVmac(m.group, m.version) });
  }
  const byIf = new Map<string, HsrpMember[]>();
  for (const m of members) {
    const arr = byIf.get(ek(m.dev, m.ifName)) ?? [];
    arr.push(m);
    byIf.set(ek(m.dev, m.ifName), arr);
  }
  return { groups, byIf };
}

export function isRoutedPhysical(dev: IosDevice, name: string): boolean {
  return isPhysical(dev, name) && isL3If(dev, name);
}

export { parentOf };
