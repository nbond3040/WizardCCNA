/**
 * Commit pipeline pieces: persisting sticky protocol decisions (err-disable, OSPF router IDs and DR roles,
 * HSRP active router, DHCP leases) and logging observable transitions like IOS does on the console.
 */
import { parentOf, shortIf } from '../model/ifname';
import { ipStr } from '../util/ip';
import { ek, type Net } from './net';
import type { Derived } from './derived';
import { retryDhcpClients } from './dhcp';
import { errDisable } from './errdisable';

export interface Summary {
  ifs: Map<string, { line: string; proto: string }>;
  nbrs: Map<string, { state: string; pid: number; ifName: string; rid: number; v6: boolean }>;
  hsrp: Map<string, string>;
  native: Set<string>;
  dup: Set<string>;
  rootInc: Set<string>;
  duplex: Set<string>;
  dupRid: Set<string>;
}

export function applySticky(net: Net, d: Derived): boolean {
  let changed = false;
  for (const e of d.l2.errEvents) {
    const dev = net.ios(e.dev);
    if (!dev) continue;
    if (!errDisable(net, dev, e.ifName, e.reason)) continue;
    net.log(dev.id, `%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port ${e.ifName} with BPDU Guard enabled. Disabling port.`);
    net.log(dev.id, `%PM-4-ERR_DISABLE: bpduguard error detected on ${shortIf(e.ifName)}, putting ${shortIf(e.ifName)} in err-disable state`);
    changed = true;
  }
  for (const [res, v6] of [
    [d.ospf, false],
    [d.ospf6, true],
  ] as const) {
    for (const p of res.procs.values()) {
      const dev = net.ios(p.dev)!;
      const ridMap = v6 ? dev.st.dyn.ospf6Rid : dev.st.dyn.ospfRid;
      if (p.rid !== null && ridMap[String(p.pid)] === undefined) ridMap[String(p.pid)] = p.rid;
      const roles = v6 ? dev.st.dyn.ospf6Role : dev.st.dyn.ospfRole;
      for (const [ifName, seg] of p.segs) {
        const key = `${p.pid}|${ifName}`;
        if (seg.role === 'DR' || seg.role === 'BDR' || seg.role === 'DROTHER') roles[key] = seg.role;
        else delete roles[key];
      }
    }
  }
  for (const g of d.hsrp.groups) {
    for (const m of g.members) {
      const dev = net.ios(m.dev)!;
      dev.st.dyn.hsrp[`${m.ifName}|${m.group}`] = m.state;
    }
  }
  for (const [key, list] of d.hsrp.byIf) {
    for (const m of list) {
      if (m.state === 'Init') {
        const dev = net.ios(key.split('|')[0])!;
        dev.st.dyn.hsrp[`${m.ifName}|${m.group}`] = 'Init';
      }
    }
  }
  if (!net.dry && retryDhcpClients(net)) changed = true;
  return changed;
}

export function summarize(net: Net): Summary {
  const d = net.d;
  const s: Summary = {
    ifs: new Map(),
    nbrs: new Map(),
    hsrp: new Map(),
    native: new Set(),
    dup: new Set(),
    rootInc: new Set(),
    duplex: new Set(),
    dupRid: new Set(),
  };
  for (const dev of net.iosDevices()) {
    for (const name of Object.keys(dev.st.cfg.ifaces)) {
      const st = d.l2.ifs.get(ek(dev.id, name));
      if (st) s.ifs.set(ek(dev.id, name), { line: st.line, proto: st.proto });
    }
  }
  for (const [res, v6] of [
    [d.ospf, false],
    [d.ospf6, true],
  ] as const) {
    for (const p of res.procs.values()) {
      for (const n of p.nbrs) s.nbrs.set(`${p.dev}|${v6 ? 6 : 4}|${p.pid}|${n.ifName}|${n.rid}`, { state: n.state, pid: p.pid, ifName: n.ifName, rid: n.rid, v6 });
      for (const x of p.dupRid) s.dupRid.add(`${p.dev}|${x.ifName}|${x.rid}|${x.from}`);
    }
  }
  for (const g of d.hsrp.groups) for (const m of g.members) s.hsrp.set(`${m.dev}|${m.ifName}|${m.group}`, m.state);
  for (const list of d.hsrp.byIf.values()) for (const m of list) if (!s.hsrp.has(`${m.dev}|${m.ifName}|${m.group}`)) s.hsrp.set(`${m.dev}|${m.ifName}|${m.group}`, m.state);
  for (const m of d.l2.nativeMismatch) s.native.add(`${m.dev}|${m.port}|${m.native}|${m.peerDev}|${m.peerPort}|${m.peerNative}`);
  for (const r of d.l2.rootInconsistent) s.rootInc.add(`${r.dev}|${r.port}|${r.vlan}`);
  for (const [key, l1] of d.l2.l1) if (l1.carrier && l1.duplexMismatch) s.duplex.add(key);
  return s;
}

function hostOf(net: Net, id: string): string {
  const d = net.ios(id);
  return d ? d.st.cfg.hostname : id;
}

function logNativeMismatch(net: Net, key: string): void {
  const [devId, port, native, peerDev, peerPort, peerNative] = key.split('|');
  net.log(devId, `%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on ${port} (${native}), with ${hostOf(net, peerDev)} ${peerPort} (${peerNative}).`);
}

function logDuplexMismatch(net: Net, key: string): void {
  const [devId, port] = key.split('|');
  const l1 = net.d.l2.l1.get(key);
  if (!l1?.peer) return;
  const peer = net.d.l2.l1.get(ek(l1.peer.dev, l1.peer.ifName));
  const a = net.ios(devId);
  const b = net.ios(l1.peer.dev);
  if (!a || !b || !a.st.cfg.cdp || !b.st.cfg.cdp) return; // CDP frames carry the duplex
  net.log(devId, `%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on ${port} (${l1.duplex === 'full' ? 'not half duplex' : 'half duplex'}), with ${hostOf(net, l1.peer.dev)} ${l1.peer.ifName} (${peer?.duplex === 'full' ? 'not half duplex' : 'half duplex'}).`);
}

/** Mismatches that already exist when the baseline is taken (lab load): CDP has long since reported them. */
export function emitDiscoveryLogs(net: Net, cur: Summary): void {
  for (const k of cur.native) logNativeMismatch(net, k);
  for (const k of cur.duplex) logDuplexMismatch(net, k);
}

export function emitTransitionLogs(net: Net, prev: Summary, cur: Summary): void {
  // interfaces
  for (const [key, st] of cur.ifs) {
    const [devId, name] = [key.slice(0, key.indexOf('|')), key.slice(key.indexOf('|') + 1)];
    if (parentOf(name)) continue;
    const p = prev.ifs.get(key);
    const pl = p?.line ?? (name.startsWith('Vlan') || name.startsWith('Loopback') || name.startsWith('Port-channel') || name.startsWith('Tunnel') ? 'none' : 'down');
    const pp = p?.proto ?? 'down';
    if (pl !== st.line) {
      if (st.line === 'admin-down') {
        if (pl !== 'none') net.log(devId, `%LINK-5-CHANGED: Interface ${name}, changed state to administratively down`);
      } else if (st.line === 'up') net.log(devId, `%LINK-3-UPDOWN: Interface ${name}, changed state to up`);
      else if (pl !== 'none' || st.line === 'down') {
        if (!(pl === 'none' && st.line === 'down')) net.log(devId, `%LINK-3-UPDOWN: Interface ${name}, changed state to down`);
      }
    }
    if (pp !== st.proto && !(pl === 'none' && st.proto === 'down')) {
      net.log(devId, `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${name}, changed state to ${st.proto}`);
    }
  }
  // OSPF adjacencies
  for (const [key, n] of cur.nbrs) {
    const p = prev.nbrs.get(key);
    const devId = key.slice(0, key.indexOf('|'));
    const dev = net.ios(devId);
    if (!dev) continue;
    const tag = n.v6 ? 'OSPFv3' : 'OSPF';
    const cfgMap = n.v6 ? dev.st.cfg.ospf6 : dev.st.cfg.ospf;
    if (cfgMap[String(n.pid)]?.logAdj === false) continue;
    if (n.state === 'FULL' && p?.state !== 'FULL') {
      dev.st.dyn.nbrSince[key] = net.clock;
      net.log(devId, `%${tag}-5-ADJCHG: Process ${n.pid}, Nbr ${ipStr(n.rid)} on ${n.ifName} from LOADING to FULL, Loading Done`);
    } else if (!p) dev.st.dyn.nbrSince[key] = net.clock;
  }
  for (const [key, n] of prev.nbrs) {
    if (cur.nbrs.has(key)) continue;
    const devId = key.slice(0, key.indexOf('|'));
    const dev = net.ios(devId);
    if (!dev) continue;
    if (n.state !== 'FULL' && n.state !== '2WAY') continue;
    const tag = n.v6 ? 'OSPFv3' : 'OSPF';
    const st = cur.ifs.get(ek(devId, n.ifName));
    const reason = !st || st.line !== 'up' || st.proto !== 'up' ? 'Interface down or detached' : 'Dead timer expired';
    net.log(devId, `%${tag}-5-ADJCHG: Process ${n.pid}, Nbr ${ipStr(n.rid)} on ${n.ifName} from ${n.state} to DOWN, Neighbor Down: ${reason}`);
    delete dev.st.dyn.nbrSince[key];
  }
  for (const k of cur.dupRid) {
    if (prev.dupRid.has(k)) continue;
    const [devId, ifName, rid, from] = k.split('|');
    net.log(devId, `%OSPF-4-DUP_RTRID_NBR: OSPF detected duplicate router-id ${ipStr(Number(rid))} from ${from} on interface ${ifName}`);
  }
  // HSRP
  for (const [key, state] of cur.hsrp) {
    const p = prev.hsrp.get(key);
    if (p === state) continue;
    const [devId, ifName, grp] = key.split('|');
    if (state === 'Init' && !p) continue;
    const from = p ?? 'Init';
    if (state === 'Active' || state === 'Standby' || (state === 'Init' && p)) {
      const dev = net.ios(devId)!;
      dev.st.dyn.hsrpChanges[`${ifName}|${grp}`] = (dev.st.dyn.hsrpChanges[`${ifName}|${grp}`] ?? 0) + 1;
      net.log(devId, `%HSRP-5-STATECHANGE: ${ifName} Grp ${grp} state ${from === 'Listen' && state === 'Active' ? 'Standby' : from} -> ${state}`);
    }
  }
  // CDP native VLAN / duplex mismatches
  for (const k of cur.native) if (!prev.native.has(k)) logNativeMismatch(net, k);
  for (const k of cur.duplex) if (!prev.duplex.has(k)) logDuplexMismatch(net, k);
  for (const k of cur.rootInc) {
    if (prev.rootInc.has(k)) continue;
    const [devId, port, vlan] = k.split('|');
    net.log(devId, `%SPANTREE-2-ROOTGUARD_BLOCK: Root guard blocking port ${port} on VLAN${vlan.padStart(4, '0')}.`);
  }
  // route install times for OSPF age display
  for (const dev of net.iosDevices()) {
    const rs = net.d.rib.get(dev.id) ?? [];
    const seen = new Set<string>();
    for (const r of rs) {
      if (r.proto !== 'ospf') continue;
      const k = `${ipStr(r.net)}/${r.len}`;
      seen.add(k);
      if (dev.st.dyn.routeSince[k] === undefined) dev.st.dyn.routeSince[k] = net.clock;
    }
    for (const k of Object.keys(dev.st.dyn.routeSince)) if (!seen.has(k)) delete dev.st.dyn.routeSince[k];
  }
}
