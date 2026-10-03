/** Layer 3 and services show commands: routing tables, OSPF, HSRP, ACLs, NAT, DHCP, NTP, SSH. */
import type { Ctx } from '../cli/session';
import { ek } from '../engine/net';
import { ifNames } from '../engine/topo';
import { classfulNet, lookup, lpm, type Route, type Route6 } from '../engine/l3';
import { areaNum, type OProc, type OIf } from '../engine/ospf';
import { ntpState } from '../engine/services';
import { hostEffective } from '../engine/l3';
import { age, hms, iosClock, leaseStamp, pad, padL } from '../util/format';
import { inNet, ipStr, maskFromLen, maskLen, netOf } from '../util/ip';
import { parseV6, v6Ios } from '../util/ipv6';
import { macDotted } from '../util/mac';
import { shortIf } from '../model/ifname';
import { aclShowText, v6Disp } from './running';
import { statusWords } from './basic';

/* ------------------------------------------------------------------ */
/* show ip route                                                       */
/* ------------------------------------------------------------------ */

const LEGEND = [
  'Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP',
  '       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area ',
  '       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2',
  '       E1 - OSPF external type 1, E2 - OSPF external type 2',
  '       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2',
  '       ia - IS-IS inter area, * - candidate default, U - per-user static route',
  '       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP',
  '       a - application route',
  '       + - replicated route, % - next hop override, p - overrides from PfR',
];

function routeText(r: Route, net: import('../engine/net').Net, devId: string): { first: string; more: string[] } {
  const pfx = `${ipStr(r.net)}/${r.len}`;
  if (r.proto === 'connected' || r.proto === 'local') return { first: `${pfx} is directly connected, ${r.hops[0].ifName}`, more: [] };
  const ageS = (h: { from?: number }) => {
    void h;
    const since = r.since ?? 0;
    return age((net.clock - since) / 1000);
  };
  const hopText = (h: Route['hops'][number]): string => {
    if (r.proto === 'ospf') return `via ${ipStr(h.nh ?? 0)}, ${ageS(h)}, ${h.ifName}`;
    if (h.nh !== undefined && h.ifName) return `via ${ipStr(h.nh)}, ${h.ifName}`;
    if (h.nh !== undefined) return `via ${ipStr(h.nh)}`;
    return `is directly connected, ${h.ifName}`;
  };
  const first = r.hops[0];
  if (r.proto === 'static' && first.nh === undefined) return { first: `${pfx} is directly connected, ${first.ifName}`, more: r.hops.slice(1).map((h) => `is directly connected, ${h.ifName}`) };
  const metric = `[${r.ad}/${r.metric}]`;
  const more = r.hops.slice(1).map((h) => `${metric} ${hopText(h)}`);
  void devId;
  return { first: `${pfx} ${metric} ${hopText(first)}`, more };
}

export function renderRoutes(c: Ctx, routes: Route[], all: Route[]): string[] {
  const out: string[] = [];
  const groups = new Map<string, { net: number; len: number; routes: Route[] }>();
  const order: string[] = [];
  const allGroups = new Map<string, Route[]>();
  for (const r of all) {
    if (r.len <= 0) continue;
    const cn = classfulNet(r.net);
    if (r.len < cn.len) continue;
    const key = `${cn.net}/${cn.len}`;
    const arr = allGroups.get(key) ?? [];
    arr.push(r);
    allGroups.set(key, arr);
  }
  const sorted = [...routes].sort((a, b) => a.net - b.net || a.len - b.len || (a.proto === 'local' ? 1 : 0) - (b.proto === 'local' ? 1 : 0));
  for (const r of sorted) {
    const cn = classfulNet(r.net);
    const key = r.len < cn.len || r.len === 0 ? `top:${r.net}/${r.len}` : `${cn.net}/${cn.len}`;
    if (!groups.has(key)) {
      groups.set(key, { net: cn.net, len: cn.len, routes: [] });
      order.push(key);
    }
    groups.get(key)!.routes.push(r);
  }
  for (const key of order) {
    const g = groups.get(key)!;
    const full = allGroups.get(key) ?? g.routes;
    const header = !key.startsWith('top:') && !(full.length === 1 && full[0].len === g.len);
    if (header) {
      const masks = new Set(full.map((r) => r.len));
      if (masks.size > 1) out.push(`      ${ipStr(g.net)}/${g.len} is variably subnetted, ${full.length} subnets, ${masks.size} masks`);
      else out.push(`      ${ipStr(g.net)}/${[...masks][0]} is subnetted, ${full.length} subnets`);
    }
    for (const r of g.routes) {
      const code = r.proto === 'dhcp' ? 'S*' : r.code;
      const width = header ? 9 : 6;
      const t = routeText(r, c.net, c.dev.id);
      const line = `${pad(code, width)}${t.first}`;
      out.push(line);
      const bracket = line.indexOf('[');
      const indent = bracket > 0 ? bracket : width + `${ipStr(r.net)}/${r.len} `.length;
      for (const m of t.more) out.push(`${' '.repeat(indent)}${m}`);
    }
  }
  return out;
}

function gatewayLine(routes: Route[]): string {
  const def = routes.find((r) => r.len === 0);
  if (!def) return 'Gateway of last resort is not set';
  const h = def.hops[0];
  return `Gateway of last resort is ${h.nh !== undefined ? ipStr(h.nh) : '0.0.0.0'} to network 0.0.0.0`;
}

export function showIpRoute(c: Ctx): void {
  const dev = c.dev;
  const all = c.net.d.rib.get(dev.id) ?? [];
  if (!dev.st.cfg.ipRouting || dev.kind === 'switch') {
    const gw = dev.st.cfg.defaultGw;
    c.out.push(gw !== undefined ? `Default gateway is ${ipStr(gw)}` : 'Default gateway is not set', '', 'Host               Gateway           Last Use    Total Uses  Interface', 'ICMP redirect cache is empty');
    return;
  }
  if (c.a.addr !== undefined) return showRouteEntry(c, all);
  let list = all;
  const filt = Object.keys(c.a).find((x) => x.startsWith('rf='))?.split('=')[1];
  if (filt === 'static') list = all.filter((r) => r.proto === 'static' || r.proto === 'dhcp');
  else if (filt === 'connected') list = all.filter((r) => r.proto === 'connected');
  else if (filt === 'ospf') list = all.filter((r) => r.proto === 'ospf');
  else if (filt === 'local') list = all.filter((r) => r.proto === 'local');
  c.out.push(...LEGEND, '', gatewayLine(all), '');
  c.out.push(...renderRoutes(c, list, all));
}

function showRouteEntry(c: Ctx, all: Route[]): void {
  const ip = c.a.addr as number;
  const mask = c.a.mask as number | undefined;
  let r: Route | undefined;
  if (mask !== undefined) r = all.find((x) => x.net === netOf(ip, mask) && x.len === maskLen(mask));
  else {
    const nonDefault = all.filter((x) => x.len > 0);
    r = nonDefault.find((x) => x.net === ip && x.len !== 32) ?? lpm(nonDefault, ip);
  }
  if (!r) {
    const cn = classfulNet(ip);
    const anyInClass = all.some((x) => inNet(x.net, cn.net, maskFromLen(cn.len)) && x.len >= cn.len);
    c.out.push(anyInClass ? '% Subnet not in table' : '% Network not in table');
    return;
  }
  const pfx = `${ipStr(r.net)}/${r.len}`;
  c.out.push(`Routing entry for ${pfx}`);
  if (r.proto === 'connected' || r.proto === 'local') {
    c.out.push(`  Known via "connected", distance 0, metric 0 (connected, via interface)`, '  Routing Descriptor Blocks:', `  * directly connected, via ${r.hops[0].ifName}`, '      Route metric is 0, traffic share count is 1');
    return;
  }
  if (r.proto === 'ospf') {
    const typ = r.ospfType === 'intra' ? 'intra area' : r.ospfType === 'inter' ? 'inter area' : `extern ${r.ospfType === 'E1' ? 1 : 2}, forward metric ${r.metric}`;
    c.out.push(`  Known via "ospf ${r.pid}", distance 110, metric ${r.metric}, type ${typ}`);
    const h0 = r.hops[0];
    c.out.push(`  Last update from ${ipStr(h0.nh ?? 0)} on ${h0.ifName}, ${hms((c.net.clock - (r.since ?? 0)) / 1000)} ago`, '  Routing Descriptor Blocks:');
    r.hops.forEach((h, i) => c.out.push(`  ${i === 0 ? '*' : ' '} ${ipStr(h.nh ?? 0)}, from ${ipStr(h.from ?? 0)}, ${hms((c.net.clock - (r!.since ?? 0)) / 1000)} ago, via ${h.ifName}`, `      Route metric is ${r!.metric}, traffic share count is 1`));
    return;
  }
  c.out.push(`  Known via "static", distance ${r.ad}, metric 0${r.len === 0 ? ', candidate default path' : ''}`, '  Routing Descriptor Blocks:');
  r.hops.forEach((h, i) => {
    const via = h.nh !== undefined ? ipStr(h.nh) : `directly connected, via ${h.ifName}`;
    c.out.push(`  ${i === 0 ? '*' : ' '} ${via}${h.nh !== undefined && h.ifName ? `, via ${h.ifName}` : ''}`, '      Route metric is 0, traffic share count is 1');
  });
}

/* ---------------- IPv6 ---------------- */

const LEGEND6 = [
  'Codes: C - Connected, L - Local, S - Static, U - Per-user Static route',
  '       B - BGP, R - RIP, H - NHRP, I1 - ISIS L1',
  '       I2 - ISIS L2, IA - ISIS interarea, IS - ISIS summary, D - EIGRP',
  '       EX - EIGRP external, ND - ND Default, NDp - ND Prefix, DCE - Destination',
  '       NDr - Redirect, O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1',
  '       OE2 - OSPF ext 2, ON1 - OSPF NSSA ext 1, ON2 - OSPF NSSA ext 2',
  '       a - Application',
];

export function showIpv6Route(c: Ctx): void {
  const all = c.net.d.rib6.get(c.dev.id) ?? [];
  let list: Route6[] = all;
  const filt = Object.keys(c.a).find((x) => x.startsWith('rf='))?.split('=')[1];
  if (filt === 'static') list = all.filter((r) => r.proto === 'static');
  else if (filt === 'connected') list = all.filter((r) => r.proto === 'connected');
  else if (filt === 'ospf') list = all.filter((r) => r.proto === 'ospf');
  else if (filt === 'local') list = all.filter((r) => r.proto === 'local');
  const count = all.length + 1;
  c.out.push(`IPv6 Routing Table - default - ${count} entries`, ...LEGEND6);
  for (const r of list) {
    c.out.push(`${pad(r.code, 4)}${v6Disp(r.net)}/${r.len} [${r.ad}/${r.metric}]`);
    for (const h of r.hops) {
      if (r.proto === 'connected') c.out.push(`     via ${h.ifName}, directly connected`);
      else if (r.proto === 'local') c.out.push(`     via ${h.ifName}, receive`);
      else if (h.nh && h.ifName) c.out.push(`     via ${v6Disp(h.nh)}, ${h.ifName}`);
      else if (h.nh) c.out.push(`     via ${v6Disp(h.nh)}`);
      else c.out.push(`     via ${h.ifName}, directly connected`);
    }
  }
  if (!filt || filt === 'local') c.out.push('L   FF00::/8 [0/0]', '     via Null0, receive');
}

export function showIpv6IntBrief(c: Ctx): void {
  const dev = c.dev;
  for (const n of ifNames(dev)) {
    const cfg = dev.st.cfg.ifaces[n];
    if (cfg.sw) continue;
    const { status, proto } = statusWords(c.net, dev, n);
    c.out.push(`${pad(n, 23)}[${status}/${proto}]`);
    const list = c.net.d.addrs6.get(ek(dev.id, n));
    if (!list?.length) c.out.push('    unassigned');
    else for (const a of list) c.out.push(`    ${v6Disp(a.addr)}`);
  }
}

export function showIpv6Interface(c: Ctx): void {
  const dev = c.dev;
  const names = c.a.ifn ? [c.a.ifn as string] : ifNames(dev).filter((n) => c.net.d.addrs6.has(ek(dev.id, n)));
  for (const n of names) {
    const { status, proto } = statusWords(c.net, dev, n);
    const list = c.net.d.addrs6.get(ek(dev.id, n)) ?? [];
    c.out.push(`${n} is ${status}, line protocol is ${proto}`);
    if (!list.length) {
      c.out.push('  IPv6 is disabled');
      continue;
    }
    const ll = list.find((x) => x.linkLocal)!;
    c.out.push('  IPv6 is enabled, link-local address is ' + v6Disp(ll.addr), '  No Virtual link-local address(es):', '  Global unicast address(es):');
    for (const a of list.filter((x) => !x.linkLocal)) {
      const v = parseV6(a.addr)!;
      const netS = v6Ios(v & (((1n << 128n) - 1n) << BigInt(128 - a.len)) & ((1n << 128n) - 1n));
      c.out.push(`    ${v6Disp(a.addr)}, subnet is ${netS}/${a.len}${a.eui64 ? ' [EUI]' : ''}`);
    }
    c.out.push('  Joined group address(es):', '    FF02::1', ...(dev.st.cfg.v6Routing ? ['    FF02::2'] : []), `    FF02::1:FF${ll.addr.split(':').pop()!.padStart(4, '0').slice(-4).toUpperCase().replace(/^(..)(..)$/, '$1:$2').replace(':', '')}`);
    c.out.push(`  MTU is 1500 bytes`, '  ICMP error messages limited to one every 100 milliseconds', '  ICMP redirects are enabled', '  ICMP unreachables are sent', '  ND DAD is enabled, number of DAD attempts: 1', '  ND reachable time is 30000 milliseconds (using 30000)');
    if (dev.st.cfg.v6Routing) c.out.push('  ND advertised reachable time is 0 (unspecified)', '  ND advertised retransmit interval is 0 (unspecified)', '  ND router advertisements are sent every 200 seconds', '  ND router advertisements live for 1800 seconds', '  ND advertised default router preference is Medium', '  Hosts use stateless autoconfig for addresses.');
    else c.out.push('  ND RAs are suppressed (periodic)', '  Hosts use stateless autoconfig for addresses.');
  }
}

/* ------------------------------------------------------------------ */
/* OSPF                                                                */
/* ------------------------------------------------------------------ */

function procsOf(c: Ctx, v6: boolean): OProc[] {
  const res = v6 ? c.net.d.ospf6 : c.net.d.ospf;
  return [...res.procs.values()].filter((p) => p.dev === c.dev.id).sort((a, b) => a.pid - b.pid);
}

function deadTime(c: Ctx, i: OIf | undefined, seed: number): string {
  const dead = i?.dead ?? 40;
  const s = dead - ((Math.floor(c.net.clock / 1000) + seed) % Math.max(1, i?.hello ?? 10));
  return hms(s);
}

export function showOspfNeighbor(c: Ctx, v6 = false): void {
  const procs = procsOf(c, v6);
  if (!procs.length) return;
  if (v6) {
    for (const p of procs) {
      c.out.push('', `            OSPFv3 Router with ID (${ipStr(p.rid ?? 0)}) (Process ID ${p.pid})`, '', 'Neighbor ID     Pri   State           Dead Time   Interface ID    Interface');
      for (const n of p.nbrs) {
        const i = p.ifs.find((x) => x.ifName === n.ifName);
        c.out.push(`${pad(ipStr(n.rid), 16)}${padL(n.prio, 3)}   ${pad(`${n.state}/${n.role === '-' ? '  -' : n.role}`, 16)}${pad(deadTime(c, i, n.rid % 7), 12)}${pad(6 + (n.rid % 5), 16)}${n.ifName}`);
      }
    }
    return;
  }
  if (c.a.detail) {
    for (const p of procs) {
      for (const n of p.nbrs) {
        const i = p.ifs.find((x) => x.ifName === n.ifName);
        const seg = p.segs.get(n.ifName);
        c.out.push(
          ` Neighbor ${ipStr(n.rid)}, interface address ${n.addr}`,
          `    In the area ${i?.area ?? '0'} via interface ${n.ifName}`,
          `    Neighbor priority is ${n.prio}, State is ${n.state}, 6 state changes`,
          `    DR is ${seg?.dr?.addr ?? '0.0.0.0'} BDR is ${seg?.bdr?.addr ?? '0.0.0.0'}`,
          '    Options is 0x12 in Hello (E-bit, L-bit)',
          '    Options is 0x52 in DBD (E-bit, L-bit, O-bit)',
          '    LLS Options is 0x1 (LR)',
          `    Dead timer due in ${deadTime(c, i, n.rid % 7)}`,
          `    Neighbor is up for ${hms((c.net.clock - (c.dev.st.dyn.nbrSince[`${c.dev.id}|4|${p.pid}|${n.ifName}|${n.rid}`] ?? 0)) / 1000)}`,
          '    Index 1/1/1, retransmission queue length 0, number of retransmission 0',
          '    First 0x0(0)/0x0(0)/0x0(0) Next 0x0(0)/0x0(0)/0x0(0)',
          '    Last retransmission scan length is 0, maximum is 0',
          '    Last retransmission scan time is 0 msec, maximum is 0 msec',
        );
      }
    }
    return;
  }
  c.out.push('', 'Neighbor ID     Pri   State           Dead Time   Address         Interface');
  for (const p of procs) {
    for (const n of p.nbrs) {
      if (c.a.ifn && n.ifName !== c.a.ifn) continue;
      const i = p.ifs.find((x) => x.ifName === n.ifName);
      c.out.push(`${pad(ipStr(n.rid), 16)}${padL(n.prio, 3)}   ${pad(`${n.state}/${n.role === '-' ? '  -' : n.role}`, 16)}${pad(deadTime(c, i, n.rid % 7), 12)}${pad(n.addr, 16)}${n.ifName}`);
    }
  }
}

function ifState(p: OProc, i: OIf): string {
  const seg = p.segs.get(i.ifName);
  if (!seg || seg.role === 'DOWN') return 'DOWN';
  if (seg.role === 'LOOP') return 'LOOP';
  if (seg.role === 'P2P') return 'P2P';
  if (seg.role === 'DROTHER') return 'DROTH';
  return seg.role;
}

export function showOspfIntBrief(c: Ctx, v6 = false): void {
  const procs = procsOf(c, v6);
  if (v6) c.out.push('Interface    PID   Area            Intf ID    Cost  State Nbrs F/C');
  else c.out.push('Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C');
  for (const p of procs) {
    for (const i of p.ifs) {
      const nb = p.nbrs.filter((n) => n.ifName === i.ifName);
      const full = nb.filter((n) => n.state === 'FULL').length;
      if (v6) c.out.push(`${pad(shortIf(i.ifName), 13)}${pad(p.pid, 6)}${pad(i.area, 16)}${pad(6 + (i.ifName.length % 9), 11)}${pad(i.cost, 6)}${pad(ifState(p, i), 6)}${full}/${nb.length}`);
      else c.out.push(`${pad(shortIf(i.ifName), 13)}${pad(p.pid, 6)}${pad(i.area, 16)}${pad(`${i.addr}/${maskLen(i.mask ?? 0)}`, 19)}${pad(i.cost, 6)}${pad(ifState(p, i), 6)}${full}/${nb.length}`);
    }
  }
}

export function showOspfInterface(c: Ctx, v6 = false): void {
  const procs = procsOf(c, v6);
  const want = c.a.ifn as string | undefined;
  let any = false;
  for (const p of procs) {
    for (const i of p.ifs) {
      if (want && i.ifName !== want) continue;
      any = true;
      const { status, proto } = statusWords(c.net, c.dev, i.ifName);
      const seg = p.segs.get(i.ifName)!;
      const typ = i.type === 'loopback' ? 'LOOPBACK' : i.type === 'point-to-point' ? 'POINT_TO_POINT' : i.type === 'non-broadcast' ? 'NON_BROADCAST' : i.type === 'point-to-multipoint' ? 'POINT_TO_MULTIPOINT' : 'BROADCAST';
      c.out.push(`${i.ifName} is ${status}, line protocol is ${proto} `);
      if (!v6) c.out.push(`  Internet Address ${i.addr}/${maskLen(i.mask ?? 0)}, Area ${i.area}, Attached via ${i.via === 'network' ? 'Network Statement' : 'Interface Enable'}`);
      else c.out.push(`  Link Local Address ${v6Disp(i.addr)}, Interface ID ${6 + (i.ifName.length % 9)}`, `  Area ${i.area}, Process ID ${p.pid}, Instance ID 0, Router ID ${ipStr(p.rid ?? 0)}`);
      if (!v6) c.out.push(`  Process ID ${p.pid}, Router ID ${ipStr(p.rid ?? 0)}, Network Type ${typ}, Cost: ${i.cost}`, '  Topology-MTID    Cost    Disabled    Shutdown      Topology Name', `        0           ${pad(i.cost, 8)}  no          no            Base`);
      else c.out.push(`  Network Type ${typ}, Cost: ${i.cost}`);
      if (i.type === 'loopback') {
        c.out.push('  Loopback interface is treated as a stub Host');
        continue;
      }
      const stateWord = seg.role === 'P2P' ? 'POINT_TO_POINT' : seg.role;
      c.out.push(`  Transmit Delay is 1 sec, State ${stateWord}${i.type === 'broadcast' ? `, Priority ${i.prio}` : ''}`);
      if (i.type === 'broadcast' || i.type === 'non-broadcast') {
        c.out.push(seg.dr ? `  Designated Router (ID) ${ipStr(seg.dr.rid)}, Interface address ${v6 ? v6Disp(seg.dr.addr) : seg.dr.addr}` : '  No designated router on this network');
        c.out.push(seg.bdr ? `  Backup Designated router (ID) ${ipStr(seg.bdr.rid)}, Interface address ${v6 ? v6Disp(seg.bdr.addr) : seg.bdr.addr}` : '  No backup designated router on this network');
      }
      c.out.push(`  Timer intervals configured, Hello ${i.hello}, Dead ${i.dead}, Wait ${i.dead}, Retransmit 5`, '    oob-resync timeout 40');
      if (i.passive) c.out.push('    No Hellos (Passive interface) ');
      else c.out.push(`    Hello due in ${hms(i.hello - (Math.floor(c.net.clock / 1000) % i.hello))}`);
      c.out.push('  Supports Link-local Signaling (LLS)', '  Cisco NSF helper support enabled', '  IETF NSF helper support enabled', '  Index 1/1/1, flood queue length 0', '  Next 0x0(0)/0x0(0)/0x0(0)', '  Last flood scan length is 1, maximum is 1', '  Last flood scan time is 0 msec, maximum is 0 msec');
      const nb = p.nbrs.filter((n) => n.ifName === i.ifName);
      const adj = nb.filter((n) => n.state === 'FULL');
      c.out.push(`  Neighbor Count is ${nb.length}, Adjacent neighbor count is ${adj.length} `);
      for (const n of adj) c.out.push(`    Adjacent with neighbor ${ipStr(n.rid)}${n.role === 'DR' ? '  (Designated Router)' : n.role === 'BDR' ? '  (Backup Designated Router)' : ''}`);
      c.out.push('  Suppress hello for 0 neighbor(s)');
    }
  }
  if (want && !any) c.out.push(`%OSPF: OSPF not enabled on ${want}`);
}

export function showIpOspf(c: Ctx, v6 = false): void {
  for (const p of procsOf(c, v6)) {
    const dyn = c.dev.st.dyn;
    const spf = dyn.ospfSpf[String(p.pid)] ?? 3;
    c.out.push(` Routing Process "${v6 ? 'ospfv3' : 'ospf'} ${p.pid}" with ID ${ipStr(p.rid ?? 0)}`, ` Start time: 00:00:${String(10 + (p.pid % 40)).padStart(2, '0')}.123, Time elapsed: ${hms(c.net.clock / 1000)}.456`);
    c.out.push(' Supports only single TOS(TOS0) routes', ' Supports opaque LSA', ' Supports Link-local Signaling (LLS)', ' Supports area transit capability', ' Supports NSSA (compatible with RFC 3101)', ' Event-log enabled, Maximum number of events: 1000, Mode: cyclic');
    if (p.abr) c.out.push(' It is an area border router');
    if (p.asbr) c.out.push(' It is an autonomous system boundary router', ' Redistributing External Routes from,');
    c.out.push(' Router is not originating router-LSAs with maximum metric', ' Initial SPF schedule delay 5000 msecs', ' Minimum hold time between two consecutive SPFs 10000 msecs', ' Maximum wait time between two consecutive SPFs 10000 msecs', ' Incremental-SPF disabled', ' Minimum LSA interval 5 secs', ' Minimum LSA arrival 1000 msecs', ' LSA group pacing timer 240 secs', ' Interface flood pacing timer 33 msecs', ' Retransmission pacing timer 66 msecs');
    const ext = p.lsdb.filter((l) => l.kind === 'external').length;
    c.out.push(` Number of external LSA ${ext}. Checksum Sum 0x${(ext * 0x1a2b3).toString(16).toUpperCase().padStart(6, '0')}`, ' Number of opaque AS LSA 0. Checksum Sum 0x000000', ' Number of DCbitless external and opaque AS LSA 0', ' Number of DoNotAge external and opaque AS LSA 0');
    c.out.push(` Number of areas in this router is ${p.areas.length}. ${p.areas.length} normal 0 stub 0 nssa`, ' Number of areas transit capable is 0', ' External flood list length 0', ' IETF NSF helper support enabled', ' Cisco NSF helper support enabled', ` Reference bandwidth unit is ${p.cfg.refBw ?? 100} mbps`);
    for (const a of p.areas) {
      const ifs = p.ifs.filter((i) => i.area === a || areaNum(i.area) === areaNum(a));
      const loops = ifs.filter((i) => i.type === 'loopback').length;
      const lsas = p.lsdb.filter((l) => l.area === a).length;
      c.out.push(`    Area ${areaNum(a) === 0 ? 'BACKBONE(0)' : a}`, `        Number of interfaces in this area is ${ifs.length}${loops ? ` (${loops} loopback)` : ''}`, '        Area has no authentication', `        SPF algorithm last executed ${hms(10 + (c.net.clock / 1000) % 50)}.123 ago`, `        SPF algorithm executed ${spf} times`, '        Area ranges are', `        Number of LSA ${lsas}. Checksum Sum 0x${(lsas * 0x2f3a1).toString(16).toUpperCase().padStart(6, '0')}`, '        Number of opaque link LSA 0. Checksum Sum 0x000000', '        Number of DCbitless LSA 0', '        Number of indication LSA 0', '        Number of DoNotAge LSA 0', '        Flood list length 0');
    }
    c.out.push('');
  }
}

export function showOspfDatabase(c: Ctx): void {
  for (const p of procsOf(c, false)) {
    c.out.push('', `            OSPF Router with ID (${ipStr(p.rid ?? 0)}) (Process ID ${p.pid})`);
    // LSAs are refreshed every 30 minutes; ages stay below the router uptime
    const up = Math.floor(c.net.uptimeSec(c.dev));
    const ageOf = (id: string) => Math.max(1, up - 15 - ([...id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 40)) % 1800;
    for (const a of p.areas) {
      const routers = p.lsdb.filter((l) => l.kind === 'router' && l.area === a);
      c.out.push('', `\t\tRouter Link States (Area ${a})`, '', 'Link ID         ADV Router      Age         Seq#       Checksum Link count');
      for (const l of routers.sort((x, y) => x.adv - y.adv)) c.out.push(`${pad(l.id, 16)}${pad(ipStr(l.adv), 16)}${pad(ageOf(l.id), 12)}0x80000${String(3 + (l.adv % 6)).padStart(3, '0')} 0x00${(l.adv % 65535).toString(16).toUpperCase().padStart(4, '0')} ${l.links}`);
      const nets = p.lsdb.filter((l) => l.kind === 'network' && l.area === a);
      if (nets.length) {
        c.out.push('', `\t\tNet Link States (Area ${a})`, '', 'Link ID         ADV Router      Age         Seq#       Checksum');
        for (const l of nets) c.out.push(`${pad(l.id, 16)}${pad(ipStr(l.adv), 16)}${pad(ageOf(l.id), 12)}0x80000001 0x00${(l.adv % 65521).toString(16).toUpperCase().padStart(4, '0')}`);
      }
      const sums = p.lsdb.filter((l) => l.kind === 'summary' && l.area === a);
      if (sums.length) {
        c.out.push('', `\t\tSummary Net Link States (Area ${a})`, '', 'Link ID         ADV Router      Age         Seq#       Checksum');
        for (const l of sums) c.out.push(`${pad(l.id, 16)}${pad(ipStr(l.adv), 16)}${pad(ageOf(l.id), 12)}0x80000001 0x00${(l.adv % 65519).toString(16).toUpperCase().padStart(4, '0')}`);
      }
    }
    const ext = p.lsdb.filter((l) => l.kind === 'external');
    if (ext.length) {
      c.out.push('', '\t\tType-5 AS External Link States', '', 'Link ID         ADV Router      Age         Seq#       Checksum Tag');
      for (const l of ext) c.out.push(`${pad(l.id, 16)}${pad(ipStr(l.adv), 16)}${pad(ageOf(l.id), 12)}0x80000001 0x00${(l.adv % 65513).toString(16).toUpperCase().padStart(4, '0')} 1`);
    }
  }
}

export function showIpProtocols(c: Ctx): void {
  const dev = c.dev;
  const procs = procsOf(c, false);
  if (!procs.length && !dev.st.cfg.ipRouting) return;
  c.out.push('*** IP Routing is NSF aware ***', '');
  for (const p of procs) {
    c.out.push(
      `Routing Protocol is "ospf ${p.pid}"`,
      '  Outgoing update filter list for all interfaces is not set',
      '  Incoming update filter list for all interfaces is not set',
      `  Router ID ${ipStr(p.rid ?? 0)}`,
    );
    if (p.asbr) c.out.push('  It is an autonomous system boundary router', '  Redistributing External Routes from,');
    c.out.push(`  Number of areas in this router is ${p.areas.length}. ${p.areas.length} normal 0 stub 0 nssa`, `  Maximum path: ${p.cfg.maxPaths ?? 4}`);
    if (p.cfg.networks.length) {
      c.out.push('  Routing for Networks:');
      for (const n of p.cfg.networks) c.out.push(`    ${ipStr(n.addr)} ${ipStr(n.wc)} area ${n.area}`);
    }
    const byIf = p.ifs.filter((i) => i.via === 'interface');
    const areas = [...new Set(byIf.map((i) => i.area))];
    for (const a of areas) {
      c.out.push(`  Routing on Interfaces Configured Explicitly (Area ${a}):`);
      for (const i of byIf.filter((x) => x.area === a)) c.out.push(`    ${i.ifName}`);
    }
    const passive = p.ifs.filter((i) => i.passive);
    if (passive.length) {
      c.out.push('  Passive Interface(s):');
      for (const i of passive) c.out.push(`    ${i.ifName}`);
    }
    c.out.push('  Routing Information Sources:', '    Gateway         Distance      Last Update');
    const srcs = new Set<number>();
    for (const r of c.net.d.rib.get(dev.id) ?? []) if (r.proto === 'ospf' && r.pid === p.pid) for (const h of r.hops) if (h.from !== undefined) srcs.add(h.from);
    for (const s of [...srcs].sort((a, b) => b - a)) c.out.push(`    ${pad(ipStr(s), 16)}${padL(110, 8)}      ${hms((c.net.clock - 0) / 1000)}`);
    c.out.push('  Distance: (default is 110)', '');
  }
}

/* ------------------------------------------------------------------ */
/* HSRP                                                                */
/* ------------------------------------------------------------------ */

export function showStandby(c: Ctx): void {
  const dev = c.dev;
  const d = c.net.d;
  const mine = [...d.hsrp.byIf.entries()].filter(([k2]) => k2.startsWith(dev.id + '|')).flatMap(([, list]) => list);
  if (c.a.brief) {
    c.out.push('                     P indicates configured to preempt.', '                     |', 'Interface   Grp  Pri P State   Active          Standby         Virtual IP');
    for (const m of mine) {
      const g = d.hsrp.groups.find((x) => x.members.includes(m));
      const active = g?.active ? (g.active === m ? 'local' : ipStr(g.active.ip)) : 'unknown';
      const standby = g?.standby ? (g.standby === m ? 'local' : ipStr(g.standby.ip)) : 'unknown';
      const vip = g?.vip ?? m.vip;
      c.out.push(`${pad(shortIf(m.ifName), 12)}${pad(m.group, 5)}${padL(m.prio, 3)} ${m.preempt ? 'P' : ' '} ${pad(m.state, 8)}${pad(active, 16)}${pad(standby, 16)}${vip !== undefined ? ipStr(vip) : 'unknown'}`);
    }
    return;
  }
  for (const m of mine) {
    const g = d.hsrp.groups.find((x) => x.members.includes(m));
    const vip = g?.vip ?? m.vip;
    const vmac = g?.vmac ?? '';
    const changes = dev.st.dyn.hsrpChanges[`${m.ifName}|${m.group}`] ?? 1;
    c.out.push(`${m.ifName} - Group ${m.group}${m.version === 2 ? ' (version 2)' : ''}`, `  State is ${m.state}`, `    ${changes} state change${changes === 1 ? '' : 's'}, last state change ${hms((c.net.clock % 600000) / 1000)}`);
    c.out.push(`  Virtual IP address is ${vip !== undefined ? ipStr(vip) : 'unknown'}`, `  Active virtual MAC address is ${vmac ? macDotted(vmac) : 'unknown'}${m.state === 'Active' ? ' (MAC In Use)' : ''}`, `    Local virtual MAC address is ${macDotted(vmac)} (v${m.version} default)`);
    c.out.push('  Hello time 3 sec, hold time 10 sec', `    Next hello sent in ${(1 + (c.net.clock % 2000) / 1000).toFixed(3)} secs`, `  Preemption ${m.preempt ? 'enabled' : 'disabled'}`);
    const act = g?.active;
    const sb = g?.standby;
    c.out.push(`  Active router is ${act ? (act === m ? 'local' : `${ipStr(act.ip)}, priority ${act.prio} (expires in 9.${String(c.net.clock % 1000).padStart(3, '0')} sec)`) : 'unknown'}`);
    c.out.push(`  Standby router is ${sb ? (sb === m ? 'local' : `${ipStr(sb.ip)}, priority ${sb.prio} (expires in 8.${String((c.net.clock + 311) % 1000).padStart(3, '0')} sec)`) : 'unknown'}`);
    c.out.push(`  Priority ${m.prio} (${m.prio === 100 ? 'default 100' : `configured ${m.prio}`})`, `  Group name is "hsrp-${shortIf(m.ifName)}-${m.group}" (default)`);
  }
}

/* ------------------------------------------------------------------ */
/* ACLs                                                                */
/* ------------------------------------------------------------------ */

export function showAccessLists(c: Ctx): void {
  const acls = Object.values(c.dev.st.cfg.acls);
  const want = c.a.aname !== undefined ? String(c.a.aname) : undefined;
  const sorted = [...acls.filter((a) => a.numbered).sort((x, y) => Number(x.name) - Number(y.name)), ...acls.filter((a) => !a.numbered)];
  for (const acl of sorted) {
    if (want && acl.name !== want) continue;
    const kind = acl.kind === 'standard' ? 'Standard' : 'Extended';
    c.out.push(`${kind} IP access list ${acl.name}`);
    for (const e of acl.entries) {
      if (e.action === 'remark') continue;
      c.out.push(`    ${e.seq} ${aclShowText(acl, e)}${e.matches ? ` (${e.matches} match${e.matches === 1 ? '' : 'es'})` : ''}`);
    }
  }
  if (!c.a.iponly) {
    for (const acl of Object.values(c.dev.st.cfg.v6acls)) {
      if (want && acl.name !== want) continue;
      c.out.push(`IPv6 access list ${acl.name}`);
      for (const e of acl.entries) c.out.push(`    ${e.action} ${e.remark ?? ''} sequence ${e.seq}`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* NAT                                                                 */
/* ------------------------------------------------------------------ */

export function showNatTranslations(c: Ctx): void {
  const dev = c.dev;
  const rows: string[] = [];
  const fmt = (ip: number | undefined, port?: number) => (ip === undefined ? '---' : port === undefined ? ipStr(ip) : `${ipStr(ip)}:${port}`);
  for (const t of dev.st.dyn.nat) {
    if (!t.proto) continue;
    rows.push(`${pad(t.proto, 4)} ${pad(fmt(t.ig, t.igp), 22)}${pad(fmt(t.il, t.ilp), 22)}${pad(fmt(t.ol, t.olp), 22)}${fmt(t.og, t.ogp)}`);
  }
  for (const t of dev.st.dyn.nat) if (!t.proto) rows.push(`${pad('---', 4)} ${pad(ipStr(t.ig), 22)}${pad(ipStr(t.il), 22)}${pad('---', 22)}---`);
  for (const s of dev.st.cfg.nat.statics) {
    if (s.outside) continue;
    const g = s.gIf ? c.net.d.addrs.get(ek(dev.id, s.gIf))?.[0]?.ip ?? 0 : s.global;
    if (s.proto) rows.push(`${pad(s.proto, 4)} ${pad(fmt(g, s.gport), 22)}${pad(fmt(s.local, s.lport), 22)}${pad('---', 22)}---`);
    else rows.push(`${pad('---', 4)} ${pad(ipStr(g), 22)}${pad(ipStr(s.local), 22)}${pad('---', 22)}---`);
  }
  if (!rows.length) return;
  c.out.push(`Pro  Inside global         Inside local          Outside local         Outside global`);
  c.out.push(...rows);
  if (c.a.total) c.out.push(`Total number of translations: ${rows.length}`);
}

export function showNatStatistics(c: Ctx): void {
  const dev = c.dev;
  const cfg = dev.st.cfg;
  const dyn = dev.st.dyn;
  const statics = cfg.nat.statics.length;
  const dynCount = dyn.nat.length;
  const ext = dyn.nat.filter((t) => t.proto).length;
  c.out.push(`Total active translations: ${statics + dynCount} (${statics} static, ${dynCount} dynamic; ${ext} extended)`);
  c.out.push(`Peak translations: ${Math.max(dyn.natPeak, statics + dynCount)}${dyn.natPeak ? `, occurred ${hms((c.net.clock % 3600000) / 1000)} ago` : ''}`);
  c.out.push('Outside interfaces:');
  for (const n of ifNames(dev)) if (cfg.ifaces[n].nat === 'outside') c.out.push(`  ${n}`);
  c.out.push('Inside interfaces: ');
  for (const n of ifNames(dev)) if (cfg.ifaces[n].nat === 'inside') c.out.push(`  ${n}`);
  c.out.push(`Hits: ${dyn.natHits}  Misses: ${dyn.natMisses}`, `CEF Translated packets: ${dyn.natHits + dyn.natMisses}, CEF Punted packets: 0`, 'Expired translations: 0', 'Dynamic mappings:');
  if (cfg.nat.dyn.length) c.out.push('-- Inside Source');
  cfg.nat.dyn.forEach((m, i) => {
    const refs = dyn.nat.filter((t) => t.kind === 'dynamic').length;
    if (m.iface) c.out.push(`[Id: ${i + 1}] access-list ${m.acl} interface ${m.iface} refcount ${refs}`);
    else {
      const p = cfg.nat.pools[m.pool ?? ''];
      c.out.push(`[Id: ${i + 1}] access-list ${m.acl} pool ${m.pool}${m.overload ? ' overload' : ''} refcount ${refs}`);
      if (p) {
        const total = p.end - p.start + 1;
        const used = new Set(dyn.nat.filter((t) => t.kind === 'dynamic').map((t) => t.ig)).size;
        c.out.push(` pool ${p.name}: netmask ${ipStr(p.mask)}`, `\tstart ${ipStr(p.start)} end ${ipStr(p.end)}`, `\ttype generic, total addresses ${total}, allocated ${used} (${Math.floor((used * 100) / total)}%), misses 0`);
      }
    }
  });
  c.out.push('', 'Total doors: 0', 'Appl doors: 0', 'Normal doors: 0', 'Queued Packets: 0');
}

/* ------------------------------------------------------------------ */
/* DHCP                                                                */
/* ------------------------------------------------------------------ */

function clientIdFmt(id: string): string {
  const groups = id.match(/.{1,4}/g) ?? [];
  return groups.join('.');
}

export function showDhcpBinding(c: Ctx): void {
  const binds = Object.values(c.dev.st.dyn.dhcpBind).sort((a, b) => a.ip - b.ip);
  c.out.push('Bindings from all pools not associated with VRF:', 'IP address      Client-ID/              Lease expiration        Type       State      Interface', '                Hardware address/', '                User name');
  for (const b of binds) {
    const pool = c.dev.st.cfg.dhcpPools[b.pool];
    let ifn = '';
    for (const [n] of Object.entries(c.dev.st.cfg.ifaces)) {
      const a = c.net.d.addrs.get(ek(c.dev.id, n))?.[0];
      if (a && pool?.net !== undefined && inNet(a.ip, pool.net, pool.mask!)) ifn = n;
    }
    c.out.push(`${pad(ipStr(b.ip), 16)}${pad(clientIdFmt(b.clientId), 24)}${pad(b.expires === null ? 'Infinite' : leaseStamp(b.expires), 24)}${pad('Automatic', 11)}${pad('Active', 11)}${ifn || 'Unknown'}`);
  }
}

export function showDhcpPool(c: Ctx): void {
  const dyn = c.dev.st.dyn;
  for (const p of Object.values(c.dev.st.cfg.dhcpPools)) {
    const leased = Object.values(dyn.dhcpBind).filter((b) => b.pool === p.name);
    const size = p.mask !== undefined ? Math.max(0, 2 ** (32 - maskLen(p.mask)) - 2) : 0;
    c.out.push('', `Pool ${p.name} :`, ' Utilization mark (high/low)    : 100 / 0', ' Subnet size (first/next)       : 0 / 0 ', ` Total addresses                : ${size}`, ` Leased addresses               : ${leased.length}`, ` Excluded addresses             : ${c.dev.st.cfg.dhcpExcl.reduce((s, [a, b]) => s + (b - a + 1), 0)}`, ' Pending event                  : none');
    if (p.net !== undefined && p.mask !== undefined) {
      const first = p.net + 1;
      const last = p.net + size;
      const next = leased.length ? Math.max(...leased.map((b) => b.ip)) + 1 : first;
      c.out.push(' 1 subnet is currently in the pool :', ' Current index        IP address range                    Leased/Excluded/Total', ` ${pad(ipStr(next >>> 0), 21)}${pad(ipStr(first >>> 0), 17)}- ${pad(ipStr(last >>> 0), 18)}${leased.length}    / ${c.dev.st.cfg.dhcpExcl.reduce((s, [a, b]) => s + (b - a + 1), 0)}     / ${size}`);
    }
  }
}

export function showDhcpConflict(c: Ctx): void {
  c.out.push('IP address        Detection method   Detection time          VRF');
  for (const [ip, v] of Object.entries(c.dev.st.dyn.dhcpConflicts)) c.out.push(`${pad(ipStr(Number(ip)), 18)}${pad('Ping', 19)}${pad(leaseStamp(c.net.now() - c.net.clock + v.t), 24)}`);
}

/* ------------------------------------------------------------------ */
/* NTP, SSH                                                            */
/* ------------------------------------------------------------------ */

export function showNtpStatus(c: Ctx): void {
  const s = c.net.dryRun(() => ntpState(c.net, c.dev));
  const tz = c.dev.st.cfg.tz;
  if (!s.synced) {
    c.out.push('Clock is unsynchronized, stratum 16, no reference clock', 'nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**24', 'ntp uptime is 0 (1/100 of seconds), resolution is 4000', 'reference time is 00000000.00000000 (00:00:00.000 UTC Mon Jan 1 1900)', 'clock offset is 0.0000 msec, root delay is 0.00 msec', 'root dispersion is 0.00 msec, peer dispersion is 0.00 msec', "loopfilter state is 'FSET' (Drift set from file), drift is 0.000000000 s/s", 'system poll interval is 8, never updated.');
    return;
  }
  const ref = s.refIsLocal ? '127.127.1.1' : ipStr(s.ref ?? 0);
  c.out.push(`Clock is synchronized, stratum ${s.stratum}, reference is ${ref}`, 'nominal freq is 250.0000 Hz, actual freq is 250.0000 Hz, precision is 2**24', `ntp uptime is ${Math.floor(c.net.clock / 10)} (1/100 of seconds), resolution is 4000`, `reference time is E0C4A5B2.5E353F7C (${iosClock(c.net.devClock(c.dev), tz?.name ?? 'UTC')})`, 'clock offset is 0.0000 msec, root delay is 0.00 msec', 'root dispersion is 7.63 msec, peer dispersion is 0.12 msec', "loopfilter state is 'CTRL' (Normal Controlled Loop), drift is 0.000000000 s/s", 'system poll interval is 64, last update was 12 sec ago.');
}

export function showNtpAssociations(c: Ctx): void {
  const cfg = c.dev.st.cfg.ntp;
  const s = c.net.dryRun(() => ntpState(c.net, c.dev));
  c.out.push('', '  address         ref clock       st   when   poll reach  delay  offset   disp');
  if (cfg.master !== undefined) c.out.push(`${s.refIsLocal ? '*~' : ' ~'}${pad('127.127.1.1', 16)}${pad('.LOCL.', 16)}${padL(cfg.master - 1, 2)}${padL(12, 7)}${padL(16, 7)}${padL(377, 6)}${padL('0.000', 7)}${padL('0.000', 8)}${padL('0.232', 7)}`);
  for (const srv of cfg.servers) {
    const sel = s.synced && s.server === srv.ip;
    const refc = sel ? (s.stratum - 1 === 1 ? '.GPS.' : '127.127.1.1') : '.INIT.';
    c.out.push(`${sel ? '*~' : ' ~'}${pad(ipStr(srv.ip), 16)}${pad(refc, 16)}${padL(sel ? s.stratum - 1 : 16, 2)}${padL(sel ? 12 : '-', 7)}${padL(64, 7)}${padL(sel ? 377 : 0, 6)}${padL(sel ? '1.000' : '0.000', 7)}${padL('0.000', 8)}${padL(sel ? '0.123' : '15937.', 7)}`);
  }
  c.out.push(' * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured');
}

export function showIpSsh(c: Ctx): void {
  const dev = c.dev;
  const rsa = dev.st.dyn.rsa;
  const v = dev.st.cfg.ssh.version;
  if (!rsa) {
    c.out.push('SSH Disabled - version 1.99', '%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).');
  } else c.out.push(`SSH Enabled - version ${v === 2 ? '2.0' : v === 1 ? '1.5' : '1.99'}`);
  c.out.push('Authentication methods:publickey,keyboard-interactive,password', 'Authentication Publickey Algorithms:x509v3-ssh-rsa,ssh-rsa', 'Hostkey Algorithms:x509v3-ssh-rsa,ssh-rsa', 'Encryption Algorithms:aes128-ctr,aes192-ctr,aes256-ctr', 'MAC Algorithms:hmac-sha2-256,hmac-sha2-512,hmac-sha1,hmac-sha1-96', 'KEX Algorithms:diffie-hellman-group-exchange-sha1,diffie-hellman-group14-sha1', `Authentication timeout: ${dev.st.cfg.ssh.timeout ?? 120} secs; Authentication retries: ${dev.st.cfg.ssh.retries ?? 3}`, 'Minimum expected Diffie Hellman key size : 2048 bits', `IOS Keys in SECSH format(ssh-rsa, base64 encoded): ${rsa ? rsa.label : 'NONE'}`);
}

export function showCryptoKey(c: Ctx): void {
  const rsa = c.dev.st.dyn.rsa;
  if (!rsa) return;
  c.out.push(`% Key pair was generated at: ${iosClock(c.net.now() - c.net.clock + rsa.t)}`, `Key name: ${rsa.label}`, `Key type: RSA KEYS`, ` Storage Device: private-config`, ` Usage: General Purpose Key`, ` Key is not exportable.`, ` Key Data:`, `  30820122 300D0609 2A864886 F70D0101 01050003 82010F00 3082010A 02820101`, `  00${rsa.modulus.toString(16).toUpperCase().padStart(6, '0')}A1 B2C3D4E5 F6071829 3A4B5C6D 7E8F9011 2233445566 778899AA`);
}

export function hostSummary(c: Ctx): string {
  const e = hostEffective(c.dev as never);
  return e.ip !== undefined ? ipStr(e.ip) : '';
}

export { lookup };
