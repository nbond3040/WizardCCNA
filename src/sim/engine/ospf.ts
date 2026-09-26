/**
 * OSPFv2 / OSPFv3 engine. Convergence is instantaneous: adjacencies form as soon as conditions are met.
 * DR/BDR election is non-preemptive (RFC 2328 §9.4) using roles remembered from the previous commit.
 */
import type { Addr4, IosDevice, IfCfg, OspfCfg } from '../model/state';
import { typeOfName } from '../model/ifname';
import { classfulLen, ipStr, maskFromLen, maskLen, netOf, parseIp, wildcardMatches } from '../util/ip';
import { parseV6, v6Net, v6Str } from '../util/ipv6';
import { isPhysical } from './topo';
import { ek, type Net } from './net';
import { flood, type L2State } from './l2';
import { isL3If, type Route, type Route6, type V6Addr } from './l3';

export type OType = 'broadcast' | 'point-to-point' | 'loopback' | 'non-broadcast' | 'point-to-multipoint';

export interface OIf {
  dev: string;
  pid: number;
  ifName: string;
  area: string;
  areaNum: number;
  /** v4: interface IP; v6: link-local */
  addr: string;
  ipNum?: number;
  mask?: number;
  prefixes: { net: string; len: number }[];
  cost: number;
  prio: number;
  type: OType;
  hello: number;
  dead: number;
  passive: boolean;
  mtu: number;
  mtuIgnore: boolean;
  via: 'network' | 'interface';
  up: boolean;
  bw: number;
}

export interface ONbr {
  ifName: string;
  rid: number;
  addr: string;
  prio: number;
  state: 'FULL' | '2WAY' | 'EXSTART' | 'INIT';
  role: 'DR' | 'BDR' | 'DROTHER' | '-';
  remoteDev: string;
  remoteIf: string;
  noSpf?: boolean;
}

export interface OSeg {
  role: 'DR' | 'BDR' | 'DROTHER' | 'P2P' | 'LOOP' | 'DOWN' | 'WAIT';
  dr?: { rid: number; addr: string };
  bdr?: { rid: number; addr: string };
}

export interface ORoute {
  net: string;
  len: number;
  cost: number;
  type: 'intra' | 'inter' | 'E1' | 'E2';
  hops: { ifName: string; nh?: string; from: number }[];
  area?: string;
  fwdCost?: number;
}

export interface OLsa {
  kind: 'router' | 'network' | 'summary' | 'external';
  id: string;
  adv: number;
  links?: number;
  area?: string;
}

export interface OProc {
  v6: boolean;
  dev: string;
  pid: number;
  rid: number | null;
  cfg: OspfCfg;
  ifs: OIf[];
  nbrs: ONbr[];
  segs: Map<string, OSeg>;
  routes: ORoute[];
  abr: boolean;
  asbr: boolean;
  areas: string[];
  lsdb: OLsa[];
  dupRid: { rid: number; from: string; ifName: string }[];
  mismatches: { ifName: string; from: string; kind: string }[];
}

export function areaNum(a: string): number {
  if (/^\d+$/.test(a)) return Number(a) >>> 0;
  return parseIp(a) ?? 0;
}

export function areaLabel(a: string): string {
  return a;
}

/* ------------------------------------------------------------------ */

function defaultBw(net: Net, l2: L2State, dev: IosDevice, name: string, c: IfCfg): number {
  if (c.bandwidth) return c.bandwidth;
  const t = typeOfName(name)?.name;
  if (t === 'Port-channel') {
    const b = l2.bundles.get(ek(dev.id, name));
    const mem = b?.members.filter((m) => m.flag === 'P') ?? [];
    const sp = mem.length ? l2.l1.get(ek(dev.id, mem[0].ifName))!.speed : 1000;
    return Math.max(1, mem.length) * sp * 1000;
  }
  if (t === 'Serial') return 1544;
  if (t === 'Loopback') return 8000000;
  if (t === 'Vlan') return 1000000;
  if (t === 'Tunnel') return 100;
  const base = name.includes('.') ? name.slice(0, name.indexOf('.')) : name;
  if (isPhysical(dev, base)) {
    const s = l2.l1.get(ek(dev.id, base));
    const ph = dev.hw.ifaces.find((p) => p.name === base)!;
    const sp = s?.carrier ? s.speed : ph.speed;
    return sp * 1000;
  }
  void net;
  return 1000000;
}

export function ifBandwidth(net: Net, l2: L2State, dev: IosDevice, name: string): number {
  const c = dev.st.cfg.ifaces[name];
  return c ? defaultBw(net, l2, dev, name, c) : 1000000;
}

function ospfType(name: string, c: IfCfg, v6: boolean): OType {
  const o = v6 ? c.ospf6 : c.ospf;
  if (o.net) return o.net;
  const t = typeOfName(name)?.name;
  if (t === 'Loopback') return 'loopback';
  if (t === 'Serial') return 'point-to-point';
  return 'broadcast';
}

function isPassive(cfg: OspfCfg, name: string): boolean {
  if (cfg.passiveDefault) return !cfg.noPassive.includes(name);
  return cfg.passive.includes(name);
}

/** Candidate router ID: configured > highest up loopback > highest up interface. */
export function candidateRid(net: Net, l2: L2State, addrs: Map<string, Addr4[]>, dev: IosDevice, cfg: OspfCfg): number | null {
  if (cfg.rid !== undefined) return cfg.rid;
  let lo: number | null = null;
  let other: number | null = null;
  for (const name of Object.keys(dev.st.cfg.ifaces)) {
    const a = addrs.get(ek(dev.id, name))?.[0];
    if (!a) continue;
    const st = l2.ifs.get(ek(dev.id, name));
    if (!st || st.line !== 'up' || st.proto !== 'up') continue;
    if (name.startsWith('Loopback')) {
      if (lo === null || a.ip > lo) lo = a.ip;
    } else if (other === null || a.ip > other) other = a.ip;
  }
  void net;
  return lo ?? other;
}

function buildIfs(net: Net, l2: L2State, addrs: Map<string, Addr4[]>, addrs6: Map<string, V6Addr[]>, dev: IosDevice, cfg: OspfCfg, v6: boolean): OIf[] {
  const out: OIf[] = [];
  const refBw = (cfg.refBw ?? 100) * 1000;
  for (const [name, c] of Object.entries(dev.st.cfg.ifaces)) {
    if (!isL3If(dev, name)) continue;
    const st = l2.ifs.get(ek(dev.id, name));
    const up = !!st && st.line === 'up' && st.proto === 'up';
    const oc = v6 ? c.ospf6 : c.ospf;
    let area: string | undefined;
    let via: 'network' | 'interface' = 'interface';
    let addr = '';
    let ipNum: number | undefined;
    let mask: number | undefined;
    let prefixes: { net: string; len: number }[] = [];
    const type = ospfType(name, c, v6);
    if (!v6) {
      const list = addrs.get(ek(dev.id, name));
      if (!list?.length) continue;
      const a = list[0];
      if (oc.pid === cfg.pid && oc.area !== undefined) area = oc.area;
      else {
        const n = cfg.networks.find((x) => wildcardMatches(a.ip, x.addr, x.wc));
        if (n) {
          area = n.area;
          via = 'network';
        }
      }
      if (area === undefined) continue;
      addr = ipStr(a.ip);
      ipNum = a.ip;
      mask = a.mask;
      const len = maskLen(a.mask);
      if (type === 'loopback') prefixes = [{ net: ipStr(a.ip), len: 32 }];
      else prefixes = list.map((x) => ({ net: ipStr(netOf(x.ip, x.mask)), len: maskLen(x.mask) }));
      void len;
    } else {
      if (oc.pid !== cfg.pid || oc.area === undefined) continue;
      area = oc.area;
      const list = addrs6.get(ek(dev.id, name));
      if (!list?.length) continue;
      const ll = list.find((x) => x.linkLocal);
      if (!ll) continue;
      addr = ll.addr;
      prefixes = list
        .filter((x) => !x.linkLocal)
        .map((x) => (type === 'loopback' ? { net: x.addr, len: 128 } : { net: v6Str(v6Net(parseV6(x.addr)!, x.len)), len: x.len }));
    }
    const bw = defaultBw(net, l2, dev, name, c);
    const cost = oc.cost ?? Math.max(1, Math.floor(refBw / bw));
    const nbma = type === 'non-broadcast' || type === 'point-to-multipoint';
    const hello = oc.hello ?? (nbma ? 30 : 10);
    const dead = oc.dead ?? (oc.hello ? oc.hello * 4 : nbma ? 120 : 40);
    out.push({
      dev: dev.id,
      pid: cfg.pid,
      ifName: name,
      area,
      areaNum: areaNum(area),
      addr,
      ipNum,
      mask,
      prefixes,
      cost,
      prio: oc.priority ?? 1,
      type,
      hello,
      dead,
      passive: isPassive(cfg, name),
      mtu: c.ipMtu ?? c.mtu ?? 1500,
      mtuIgnore: !!oc.mtuIgnore,
      via,
      up,
      bw,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */

export interface OspfResult {
  procs: Map<string, OProc>;
}

export function procKey(dev: string, pid: number): string {
  return `${dev}|${pid}`;
}

/**
 * Compute OSPF for one address family.
 * `preRib` (IPv4 only) is the non-OSPF routing table used for default-information originate / redistribution.
 */
export function computeOspf(
  net: Net,
  l2: L2State,
  addrs: Map<string, Addr4[]>,
  addrs6: Map<string, V6Addr[]>,
  preRib: Map<string, Route[]>,
  preRib6: Map<string, Route6[]>,
  v6: boolean,
): OspfResult {
  const procs = new Map<string, OProc>();
  for (const dev of net.iosDevices()) {
    const enabled = v6 ? dev.st.cfg.v6Routing : dev.st.cfg.ipRouting;
    if (!enabled) continue;
    const table = v6 ? dev.st.cfg.ospf6 : dev.st.cfg.ospf;
    for (const cfg of Object.values(table)) {
      if (dev.st.dyn.ospfStart[`${v6 ? '6' : '4'}|${cfg.pid}|down`]) continue;
      const sticky = (v6 ? dev.st.dyn.ospf6Rid : dev.st.dyn.ospfRid)[String(cfg.pid)];
      const rid = sticky ?? candidateRid(net, l2, addrs, dev, cfg);
      const p: OProc = {
        v6,
        dev: dev.id,
        pid: cfg.pid,
        rid: rid ?? null,
        cfg,
        ifs: rid === null || rid === undefined ? [] : buildIfs(net, l2, addrs, addrs6, dev, cfg, v6),
        nbrs: [],
        segs: new Map(),
        routes: [],
        abr: false,
        asbr: false,
        areas: [],
        lsdb: [],
        dupRid: [],
        mismatches: [],
      };
      p.areas = [...new Set(p.ifs.map((i) => i.area))].sort((a, b) => areaNum(a) - areaNum(b));
      p.abr = p.areas.length > 1 && p.areas.some((a) => areaNum(a) === 0);
      procs.set(procKey(dev.id, cfg.pid), p);
    }
  }
  // interface lookup
  const oifBy = new Map<string, { p: OProc; i: OIf }>();
  for (const p of procs.values()) for (const i of p.ifs) oifBy.set(ek(p.dev, i.ifName), { p, i });

  // neighbor discovery
  type Pair = { a: { p: OProc; i: OIf }; b: { p: OProc; i: OIf }; kind: 'ok' | 'mtu' | 'type' };
  const pairs: Pair[] = [];
  const reachCache = new Map<string, Set<string>>();
  const reach = (p: OProc, i: OIf): Set<string> => {
    const key = ek(p.dev, i.ifName);
    let s = reachCache.get(key);
    if (!s) {
      const fl = flood(net, l2, net.dev(p.dev)!, i.ifName);
      s = new Set(fl.eps.map((e) => ek(e.dev, e.ifName)));
      reachCache.set(key, s);
    }
    return s;
  };
  const seen = new Set<string>();
  for (const x of oifBy.values()) {
    const { p, i } = x;
    if (!i.up || i.passive || i.type === 'loopback' || p.rid === null) continue;
    for (const epKey of reach(p, i)) {
      const y = oifBy.get(epKey);
      if (!y || y.p.dev === p.dev) continue;
      const { p: q, i: j } = y;
      if (!j.up || j.passive || j.type === 'loopback' || q.rid === null) continue;
      const pk = [ek(p.dev, i.ifName), ek(q.dev, j.ifName)].sort().join('#');
      if (seen.has(pk)) continue;
      seen.add(pk);
      if (!reach(q, j).has(ek(p.dev, i.ifName))) continue;
      // compatibility
      if (!v6) {
        const sameNet = i.ipNum !== undefined && j.ipNum !== undefined && netOf(i.ipNum, i.mask!) === netOf(j.ipNum, i.mask!) && netOf(j.ipNum, j.mask!) === netOf(i.ipNum, j.mask!);
        const p2p = i.type === 'point-to-point' && j.type === 'point-to-point';
        if (!sameNet || (!p2p && i.mask !== j.mask)) {
          p.mismatches.push({ ifName: i.ifName, from: j.addr, kind: 'subnet' });
          continue;
        }
      }
      if (i.areaNum !== j.areaNum) {
        p.mismatches.push({ ifName: i.ifName, from: j.addr, kind: 'area' });
        q.mismatches.push({ ifName: j.ifName, from: i.addr, kind: 'area' });
        continue;
      }
      if (i.hello !== j.hello || i.dead !== j.dead) {
        p.mismatches.push({ ifName: i.ifName, from: j.addr, kind: 'hello' });
        q.mismatches.push({ ifName: j.ifName, from: i.addr, kind: 'hello' });
        continue;
      }
      if (p.rid === q.rid) {
        p.dupRid.push({ rid: q.rid!, from: j.addr, ifName: i.ifName });
        q.dupRid.push({ rid: p.rid!, from: i.addr, ifName: j.ifName });
        continue;
      }
      const bcastI = i.type === 'broadcast' || i.type === 'non-broadcast';
      const bcastJ = j.type === 'broadcast' || j.type === 'non-broadcast';
      let kind: Pair['kind'] = 'ok';
      if (bcastI !== bcastJ) kind = 'type';
      else if (!v6 && i.mtu !== j.mtu && !(i.mtuIgnore && j.mtuIgnore)) kind = 'mtu';
      pairs.push({ a: x, b: y, kind });
    }
  }

  // DR election on broadcast segments
  const parent = new Map<string, string>();
  const find = (k: string): string => {
    let r = k;
    while (parent.get(r) !== r) r = parent.get(r)!;
    parent.set(k, r);
    return r;
  };
  for (const [k, x] of oifBy) if (x.i.up && (x.i.type === 'broadcast' || x.i.type === 'non-broadcast')) parent.set(k, k);
  for (const pr of pairs) {
    if (pr.kind === 'type') continue;
    const ka = ek(pr.a.p.dev, pr.a.i.ifName);
    const kb = ek(pr.b.p.dev, pr.b.i.ifName);
    if (parent.has(ka) && parent.has(kb)) parent.set(find(ka), find(kb));
  }
  const segs = new Map<string, { p: OProc; i: OIf }[]>();
  for (const k of parent.keys()) {
    const r = find(k);
    const arr = segs.get(r) ?? [];
    arr.push(oifBy.get(k)!);
    segs.set(r, arr);
  }
  const roleOf = new Map<string, 'DR' | 'BDR' | 'DROTHER'>();
  const segDr = new Map<string, { dr?: { rid: number; addr: string }; bdr?: { rid: number; addr: string } }>();
  for (const [root, members] of segs) {
    const rank = (m: { p: OProc; i: OIf }) => m.i.prio * 4294967296 + (m.p.rid ?? 0);
    const prevRole = (m: { p: OProc; i: OIf }) => {
      const d = net.ios(m.p.dev)!.st.dyn;
      return (v6 ? d.ospf6Role : d.ospfRole)[`${m.p.pid}|${m.i.ifName}`];
    };
    const eligible = members.filter((m) => m.i.prio > 0);
    const best = (arr: typeof members) => (arr.length ? [...arr].sort((x, y) => rank(y) - rank(x))[0] : undefined);
    const declaredDr = eligible.filter((m) => prevRole(m) === 'DR');
    let dr = best(declaredDr);
    const bdrPool = eligible.filter((m) => m !== dr && !(declaredDr.includes(m)));
    const declaredBdr = bdrPool.filter((m) => prevRole(m) === 'BDR');
    let bdr = best(declaredBdr.length ? declaredBdr : bdrPool);
    if (!dr) {
      dr = bdr;
      const pool2 = eligible.filter((m) => m !== dr);
      const decl2 = pool2.filter((m) => prevRole(m) === 'BDR');
      bdr = best(decl2.length ? decl2 : pool2);
    }
    for (const m of members) roleOf.set(ek(m.p.dev, m.i.ifName), m === dr ? 'DR' : m === bdr ? 'BDR' : 'DROTHER');
    segDr.set(root, {
      dr: dr ? { rid: dr.p.rid!, addr: dr.i.addr } : undefined,
      bdr: bdr ? { rid: bdr.p.rid!, addr: bdr.i.addr } : undefined,
    });
  }
  for (const [k, x] of oifBy) {
    const { p, i } = x;
    let seg: OSeg;
    if (!i.up) seg = { role: 'DOWN' };
    else if (i.type === 'loopback') seg = { role: 'LOOP' };
    else if (i.type === 'point-to-point' || i.type === 'point-to-multipoint') seg = { role: 'P2P' };
    else {
      const info = segDr.get(find(k))!;
      seg = { role: roleOf.get(k) ?? 'DROTHER', dr: info.dr, bdr: info.bdr };
    }
    p.segs.set(i.ifName, seg);
  }
  // neighbor records
  for (const pr of pairs) {
    for (const [me, other] of [
      [pr.a, pr.b],
      [pr.b, pr.a],
    ] as const) {
      let state: ONbr['state'] = 'FULL';
      let role: ONbr['role'] = '-';
      const myBcast = me.i.type === 'broadcast' || me.i.type === 'non-broadcast';
      if (pr.kind === 'mtu') state = 'EXSTART';
      else if (pr.kind === 'type') {
        state = 'FULL';
        role = myBcast ? 'DROTHER' : '-';
      } else if (myBcast) {
        const mine = roleOf.get(ek(me.p.dev, me.i.ifName)) ?? 'DROTHER';
        const theirs = roleOf.get(ek(other.p.dev, other.i.ifName)) ?? 'DROTHER';
        role = theirs;
        state = mine === 'DROTHER' && theirs === 'DROTHER' ? '2WAY' : 'FULL';
      }
      me.p.nbrs.push({
        ifName: me.i.ifName,
        rid: other.p.rid!,
        addr: other.i.addr,
        prio: other.i.prio,
        state,
        role,
        remoteDev: other.p.dev,
        remoteIf: other.i.ifName,
        noSpf: pr.kind === 'type',
      });
    }
  }
  for (const p of procs.values()) p.nbrs.sort((x, y) => y.rid - x.rid);

  spfAll(net, procs, preRib, preRib6, v6);
  return { procs };
}

/* ------------------------------------------------------------------ */
/* SPF                                                                 */
/* ------------------------------------------------------------------ */

interface GNode {
  id: string;
  kind: 'router' | 'net';
  proc?: OProc;
  edges: { to: string; cost: number; ifName?: string; nbrAddr?: string }[];
  stubs: { net: string; len: number; cost: number }[];
  /** transit network prefix */
  pfx?: { net: string; len: number }[];
  /** router interface attached to a transit net (for next-hop addresses) */
  attach?: Map<string, string>;
}

function spfAll(net: Net, procs: Map<string, OProc>, preRib: Map<string, Route[]>, preRib6: Map<string, Route6[]>, v6: boolean): void {
  const allAreas = new Set<string>();
  for (const p of procs.values()) for (const a of p.areas) allAreas.add(String(areaNum(a)));
  // per-area graph
  const graphs = new Map<string, Map<string, GNode>>();
  for (const a of allAreas) graphs.set(a, buildGraph(procs, Number(a)));
  // intra-area SPF for every router in every area it belongs to
  const intra = new Map<string, Map<string, { dist: Map<string, number>; hops: Map<string, ORoute['hops']> }>>();
  for (const p of procs.values()) {
    if (p.rid === null) continue;
    const m = new Map<string, { dist: Map<string, number>; hops: Map<string, ORoute['hops']> }>();
    for (const a of p.areas) {
      const g = graphs.get(String(areaNum(a)))!;
      m.set(String(areaNum(a)), dijkstra(g, rkey(p), p));
    }
    intra.set(rkey(p), m);
  }
  // collect intra-area routes
  const intraRoutes = new Map<string, ORoute[]>();
  for (const p of procs.values()) {
    if (p.rid === null) continue;
    const routes: ORoute[] = [];
    for (const [a, res] of intra.get(rkey(p))!) {
      const g = graphs.get(a)!;
      for (const [nid, d] of res.dist) {
        const node = g.get(nid)!;
        const hops = res.hops.get(nid) ?? [];
        if (nid === rkey(p)) continue;
        if (node.kind === 'router') {
          for (const s of node.stubs) routes.push({ net: s.net, len: s.len, cost: d + s.cost, type: 'intra', hops: hops.map((h) => ({ ...h, from: node.proc!.rid! })), area: a });
        } else {
          for (const pf of node.pfx ?? []) routes.push({ net: pf.net, len: pf.len, cost: d, type: 'intra', hops: hops.map((h) => ({ ...h })), area: a });
        }
      }
    }
    intraRoutes.set(rkey(p), bestRoutes(routes, p.cfg.maxPaths ?? 4));
  }
  // inter-area: summaries originated by ABRs
  const summaries = new Map<string, { abr: OProc; area: string; net: string; len: number; cost: number }[]>();
  for (const p of procs.values()) {
    if (!p.abr || p.rid === null) continue;
    const own = intraRoutes.get(rkey(p))!;
    for (const target of p.areas) {
      const tnum = String(areaNum(target));
      const list = summaries.get(tnum) ?? [];
      for (const r of own) {
        if (r.area === tnum) continue;
        list.push({ abr: p, area: tnum, net: r.net, len: r.len, cost: r.cost });
      }
      // directly attached networks in other areas
      for (const i of p.ifs) {
        if (!i.up || String(i.areaNum) === tnum) continue;
        for (const pf of i.prefixes) list.push({ abr: p, area: tnum, net: pf.net, len: pf.len, cost: i.cost });
      }
      summaries.set(tnum, list);
    }
  }
  // externals
  const externals: { asbr: OProc; net: string; len: number; metric: number; etype: 1 | 2 }[] = [];
  for (const p of procs.values()) {
    if (p.rid === null) continue;
    const dev = net.ios(p.dev)!;
    const d = p.cfg.defOrig;
    if (d) {
      const hasDefault = v6
        ? (preRib6.get(p.dev) ?? []).some((r) => r.len === 0 && r.proto !== 'ospf')
        : (preRib.get(p.dev) ?? []).some((r) => r.len === 0 && r.proto !== 'ospf');
      if (d.always || hasDefault) {
        externals.push({ asbr: p, net: v6 ? '::' : '0.0.0.0', len: 0, metric: d.metric ?? 1, etype: (d.type ?? 2) as 1 | 2 });
        p.asbr = true;
      }
    }
    if (!v6) {
      for (const red of p.cfg.redistribute) {
        const m = /^(static|connected)(.*)$/.exec(red);
        if (!m) continue;
        const subnets = /\bsubnets\b/.test(m[2]);
        const mm = /metric (\d+)/.exec(m[2]);
        const mt = /metric-type (\d)/.exec(m[2]);
        for (const r of preRib.get(p.dev) ?? []) {
          if (m[1] === 'static' && r.proto !== 'static') continue;
          if (m[1] === 'connected' && r.proto !== 'connected') continue;
          if (r.len === 0) continue;
          if (m[1] === 'connected' && p.ifs.some((i) => i.ifName === r.hops[0]?.ifName)) continue;
          if (!subnets && r.len !== classfulLen(r.net)) continue;
          externals.push({ asbr: p, net: ipStr(r.net), len: r.len, metric: mm ? Number(mm[1]) : 20, etype: mt && mt[1] === '1' ? 1 : 2 });
          p.asbr = true;
        }
      }
    }
    void dev;
  }
  // final per-router route sets
  for (const p of procs.values()) {
    if (p.rid === null) continue;
    const mine = intraRoutes.get(rkey(p))!;
    const routes: ORoute[] = [...mine];
    const ownPrefixes = new Set(p.ifs.filter((i) => i.up).flatMap((i) => i.prefixes.map((x) => `${x.net}/${x.len}`)));
    // inter-area
    for (const a of p.areas) {
      const anum = String(areaNum(a));
      const res = intra.get(rkey(p))!.get(anum)!;
      for (const s of summaries.get(anum) ?? []) {
        if (s.abr === p) continue;
        const dAbr = res.dist.get(rkey(s.abr));
        if (dAbr === undefined) continue;
        if (ownPrefixes.has(`${s.net}/${s.len}`)) continue;
        routes.push({ net: s.net, len: s.len, cost: dAbr + s.cost, type: 'inter', hops: (res.hops.get(rkey(s.abr)) ?? []).map((h) => ({ ...h, from: s.abr.rid! })), area: anum });
      }
    }
    // external
    for (const e of externals) {
      if (e.asbr === p) continue;
      let bestD: number | undefined;
      let bestHops: ORoute['hops'] = [];
      for (const res of intra.get(rkey(p))!.values()) {
        const dd = res.dist.get(rkey(e.asbr));
        if (dd !== undefined && (bestD === undefined || dd < bestD)) {
          bestD = dd;
          bestHops = res.hops.get(rkey(e.asbr)) ?? [];
        }
      }
      if (bestD === undefined) {
        // reachable through an ABR? use any inter-area path to the ASBR's networks
        continue;
      }
      routes.push({ net: e.net, len: e.len, cost: e.etype === 1 ? bestD + e.metric : e.metric, fwdCost: bestD, type: e.etype === 1 ? 'E1' : 'E2', hops: bestHops.map((h) => ({ ...h, from: e.asbr.rid! })) });
    }
    p.routes = bestRoutes(routes, p.cfg.maxPaths ?? 4).filter((r) => !ownPrefixes.has(`${r.net}/${r.len}`) || r.type !== 'intra');
    // LSDB summary
    const lsdb: OLsa[] = [];
    for (const a of p.areas) {
      const g = graphs.get(String(areaNum(a)))!;
      for (const n of g.values()) {
        if (n.kind === 'router') lsdb.push({ kind: 'router', id: ipStr(n.proc!.rid!), adv: n.proc!.rid!, links: n.edges.length + n.stubs.length, area: a });
        else lsdb.push({ kind: 'network', id: n.id.split('|')[1], adv: Number(n.id.split('|')[2]), area: a });
      }
      for (const s of summaries.get(String(areaNum(a))) ?? []) lsdb.push({ kind: 'summary', id: s.net, adv: s.abr.rid!, area: a });
    }
    for (const e of externals) lsdb.push({ kind: 'external', id: e.net, adv: e.asbr.rid! });
    p.lsdb = lsdb;
  }
}

function rkey(p: OProc): string {
  return `R|${p.dev}|${p.pid}`;
}

function buildGraph(procs: Map<string, OProc>, area: number): Map<string, GNode> {
  const g = new Map<string, GNode>();
  const byDevIf = new Map<string, OProc>();
  for (const p of procs.values()) {
    if (p.rid === null) continue;
    if (!p.ifs.some((i) => i.areaNum === area)) continue;
    g.set(rkey(p), { id: rkey(p), kind: 'router', proc: p, edges: [], stubs: [] });
    for (const i of p.ifs) byDevIf.set(ek(p.dev, i.ifName), p);
  }
  // transit networks: segment with a DR that is FULL with at least one neighbor
  const nets = new Map<string, GNode>();
  for (const p of procs.values()) {
    if (!g.has(rkey(p))) continue;
    const node = g.get(rkey(p))!;
    for (const i of p.ifs) {
      if (i.areaNum !== area || !i.up) continue;
      const seg = p.segs.get(i.ifName)!;
      if (i.type === 'loopback') {
        for (const pf of i.prefixes) node.stubs.push({ ...pf, cost: i.cost });
        continue;
      }
      const full = p.nbrs.filter((n) => n.ifName === i.ifName && n.state === 'FULL' && !n.noSpf);
      if (i.type === 'point-to-point' || i.type === 'point-to-multipoint') {
        for (const n of full) {
          const q = byDevIf.get(ek(n.remoteDev, n.remoteIf));
          if (!q || !g.has(rkey(q))) continue;
          node.edges.push({ to: rkey(q), cost: i.cost, ifName: i.ifName, nbrAddr: n.addr });
        }
        for (const pf of i.prefixes) node.stubs.push({ ...pf, cost: i.cost });
        continue;
      }
      // broadcast
      const drRid = seg.dr?.rid;
      const drAddr = seg.dr?.addr;
      const drFull = drRid !== undefined && (seg.role === 'DR' ? full.length > 0 : full.some((n) => n.rid === drRid));
      if (!drFull || drRid === undefined || drAddr === undefined) {
        for (const pf of i.prefixes) node.stubs.push({ ...pf, cost: i.cost });
        continue;
      }
      const nid = `N|${drAddr}|${drRid}`;
      let nn = nets.get(nid);
      if (!nn) {
        nn = { id: nid, kind: 'net', edges: [], stubs: [], pfx: [], attach: new Map() };
        nets.set(nid, nn);
        g.set(nid, nn);
      }
      node.edges.push({ to: nid, cost: i.cost, ifName: i.ifName });
      nn.edges.push({ to: rkey(p), cost: 0 });
      nn.attach!.set(rkey(p), i.addr);
      if (seg.role === 'DR') nn.pfx = i.prefixes;
    }
  }
  // fill missing transit prefixes (DR in another area/process edge cases)
  for (const nn of nets.values()) {
    if (nn.pfx && nn.pfx.length) continue;
    for (const [rk] of nn.attach!) {
      const p = g.get(rk)!.proc!;
      const i = p.ifs.find((x) => g.get(rk)!.edges.some((e) => e.to === nn.id && e.ifName === x.ifName));
      if (i) {
        nn.pfx = i.prefixes;
        break;
      }
    }
  }
  // two-way check for router→router edges
  for (const n of g.values()) {
    if (n.kind !== 'router') continue;
    n.edges = n.edges.filter((e) => {
      const t = g.get(e.to);
      if (!t) return false;
      if (t.kind === 'net') return t.edges.some((b) => b.to === n.id);
      return t.edges.some((b) => b.to === n.id);
    });
  }
  return g;
}

function dijkstra(g: Map<string, GNode>, src: string, self: OProc): { dist: Map<string, number>; hops: Map<string, ORoute['hops']> } {
  const dist = new Map<string, number>([[src, 0]]);
  const hops = new Map<string, ORoute['hops']>([[src, []]]);
  const done = new Set<string>();
  const maxPaths = self.cfg.maxPaths ?? 4;
  for (;;) {
    let u: string | undefined;
    for (const [id, d] of dist) if (!done.has(id) && (u === undefined || d < dist.get(u)!)) u = id;
    if (u === undefined) break;
    done.add(u);
    const node = g.get(u);
    if (!node) continue;
    for (const e of node.edges) {
      const nd = dist.get(u)! + e.cost;
      let h: ORoute['hops'];
      if (u === src) {
        const target = g.get(e.to)!;
        if (target.kind === 'net') h = [{ ifName: e.ifName!, from: self.rid! }];
        else h = [{ ifName: e.ifName!, nh: e.nbrAddr, from: self.rid! }];
      } else if (node.kind === 'net' && hops.get(u)!.some((x) => x.nh === undefined)) {
        // directly attached transit network: next hop is the router's address on the segment
        const addr = node.attach!.get(e.to);
        h = hops.get(u)!.map((x) => ({ ...x, nh: x.nh ?? addr }));
      } else h = hops.get(u)!;
      if (e.to === src) continue;
      const cur = dist.get(e.to);
      if (cur === undefined || nd < cur) {
        dist.set(e.to, nd);
        hops.set(e.to, dedupHops(h).slice(0, maxPaths));
      } else if (nd === cur && !done.has(e.to)) {
        hops.set(e.to, dedupHops([...hops.get(e.to)!, ...h]).slice(0, maxPaths));
      }
    }
  }
  return { dist, hops };
}

function dedupHops(h: ORoute['hops']): ORoute['hops'] {
  const seen = new Set<string>();
  return h.filter((x) => {
    const k = `${x.ifName}|${x.nh}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const TYPE_RANK: Record<ORoute['type'], number> = { intra: 0, inter: 1, E1: 2, E2: 3 };

function bestRoutes(routes: ORoute[], maxPaths: number): ORoute[] {
  const by = new Map<string, ORoute>();
  for (const r of routes) {
    const k = `${r.net}/${r.len}`;
    const cur = by.get(k);
    const better =
      !cur ||
      TYPE_RANK[r.type] < TYPE_RANK[cur.type] ||
      (TYPE_RANK[r.type] === TYPE_RANK[cur.type] && (r.cost < cur.cost || (r.cost === cur.cost && (r.fwdCost ?? 0) < (cur.fwdCost ?? 0))));
    if (better) by.set(k, { ...r, hops: [...r.hops] });
    else if (cur && TYPE_RANK[r.type] === TYPE_RANK[cur.type] && r.cost === cur.cost && (r.fwdCost ?? 0) === (cur.fwdCost ?? 0)) {
      cur.hops = dedupHops([...cur.hops, ...r.hops]).slice(0, maxPaths);
    }
  }
  return [...by.values()];
}

/* ------------------------------------------------------------------ */
/* conversion to RIB entries                                           */
/* ------------------------------------------------------------------ */

export function ospfToRib(p: OProc, since: (key: string) => number | undefined): Route[] {
  const out: Route[] = [];
  for (const r of p.routes) {
    const netNum = parseIp(r.net);
    if (netNum === null) continue;
    const code = r.type === 'intra' ? 'O' : r.type === 'inter' ? 'O IA' : r.len === 0 ? `O*${r.type}` : `O ${r.type}`;
    out.push({
      code,
      proto: 'ospf',
      net: netOf(netNum, maskFromLen(r.len)),
      len: r.len,
      ad: 110,
      metric: r.cost,
      hops: r.hops.map((h) => ({ ifName: h.ifName, nh: h.nh ? parseIp(h.nh) ?? undefined : undefined, from: h.from })),
      ospfType: r.type,
      pid: p.pid,
      area: r.area,
      since: since(`${r.net}/${r.len}`),
    });
  }
  return out;
}

export function ospf6ToRib(p: OProc): Route6[] {
  return p.routes.map((r) => ({
    code: r.type === 'intra' ? 'O' : r.type === 'inter' ? 'OI' : `O${r.type}`,
    proto: 'ospf' as const,
    net: r.net,
    len: r.len,
    ad: 110,
    metric: r.cost,
    hops: r.hops.map((h) => ({ ifName: h.ifName, nh: h.nh, from: h.from })),
    pid: p.pid,
  }));
}
