/**
 * Layer 1 / Layer 2: carrier, speed/duplex, EtherChannel, DTP, VLAN membership, per-VLAN spanning tree,
 * interface status and L2 flooding along the loop-free topology.
 */
import type { ChMode, Device, IfCfg, IosDevice } from '../model/state';
import { parentOf, typeOfName } from '../model/ifname';
import { rangesHas, rangesIntersect, type Ranges } from '../util/format';
import { ifMac, isPhysical, physInfo } from './topo';
import { ek, type Net } from './net';

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */

export interface L1 {
  admin: boolean;
  errdis?: string;
  carrier: boolean;
  speed: number;
  duplex: 'full' | 'half';
  duplexMismatch: boolean;
  speedMismatch: boolean;
  /** peer end (if cabled) */
  peer?: { dev: string; ifName: string };
}

export interface IfSt {
  line: 'up' | 'down' | 'admin-down';
  proto: 'up' | 'down';
  errdis?: string;
  /** switchport status text: connected / notconnect / disabled / err-disabled / suspended */
  status: string;
}

export type ChFlag = 'P' | 'I' | 's' | 'D' | 'H' | 'w';

export interface Bundle {
  dev: string;
  po: string;
  group: number;
  proto: 'LACP' | 'PAgP' | '-';
  members: { ifName: string; flag: ChFlag; mode: ChMode }[];
  up: boolean;
  partnerDev?: string;
}

export interface SwOper {
  port: string;
  /** physical ports forming this logical port */
  phys: string[];
  up: boolean;
  mode: 'access' | 'trunk' | 'down';
  adminMode: string;
  negotiated: boolean;
  accessVlan: number;
  voiceVlan?: number;
  native: number;
  allowed: Ranges;
  /** allowed ∩ existing VLANs */
  active: Ranges;
  partner?: { dev: string; port: string };
  partnerIsSwitch: boolean;
  encap: string;
}

export type StpRole = 'root' | 'designated' | 'alternate' | 'backup' | 'disabled';

export interface StpPort {
  port: string;
  role: StpRole;
  state: 'forwarding' | 'blocking';
  cost: number;
  prio: number;
  num: number;
  edge: boolean;
  shared: boolean;
  inconsistent?: string;
  /** designated bridge for the segment (neighbor if it wins) */
  desBid?: string;
}

export interface StpVlan {
  vlan: number;
  bridgePrio: number;
  bridgeMac: string;
  rootPrio: number;
  rootMac: string;
  rootCost: number;
  rootPort?: string;
  isRoot: boolean;
  ports: Map<string, StpPort>;
}

export interface L2State {
  l1: Map<string, L1>;
  bundles: Map<string, Bundle>;
  memberPo: Map<string, string>;
  memberFlag: Map<string, ChFlag>;
  oper: Map<string, SwOper>;
  stp: Map<string, Map<number, StpVlan>>;
  stpEnabled: Map<string, Set<number>>;
  ifs: Map<string, IfSt>;
  /** BPDU guard / other err-disable events detected in this pass */
  errEvents: { dev: string; ifName: string; reason: string }[];
  rootInconsistent: { dev: string; port: string; vlan: number }[];
  nativeMismatch: { dev: string; port: string; native: number; peerDev: string; peerPort: string; peerNative: number }[];
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

export function isSwitch(dev: Device): dev is IosDevice {
  return dev.t === 'ios' && dev.kind !== 'router';
}

export function vlanExists(dev: IosDevice, v: number): boolean {
  const rec = dev.st.vlans[String(v)];
  return !!rec && !rec.shut && !rec.suspend && !(v >= 1002 && v <= 1005);
}

export function existingVlanRanges(dev: IosDevice): Ranges {
  const list = Object.keys(dev.st.vlans)
    .map(Number)
    .filter((v) => vlanExists(dev, v))
    .sort((a, b) => a - b);
  const out: Ranges = [];
  for (const v of list) {
    const last = out[out.length - 1];
    if (last && last[1] === v - 1) last[1] = v;
    else out.push([v, v]);
  }
  return out;
}

function cfgSpeed(c: IfCfg | undefined): number | null {
  if (!c || c.speed === 'auto') return null;
  return Number(c.speed);
}

function cfgDuplex(c: IfCfg | undefined): 'full' | 'half' | null {
  if (!c || c.duplex === 'auto') return null;
  return c.duplex as 'full' | 'half';
}

/* ------------------------------------------------------------------ */
/* L1                                                                  */
/* ------------------------------------------------------------------ */

function computeL1(net: Net, dev: Device, ifName: string): L1 {
  const phys = physInfo(dev, ifName)!;
  const cfg = dev.t === 'ios' ? dev.st.cfg.ifaces[ifName] : undefined;
  const admin = dev.t === 'ios' ? !cfg?.shutdown : true;
  const errdis = dev.t === 'ios' ? dev.st.dyn.ifd[ifName]?.errDisabled : undefined;
  const peer = net.peerOf(dev.id, ifName);
  const base: L1 = { admin, errdis, carrier: false, speed: phys.speed, duplex: 'full', duplexMismatch: false, speedMismatch: false, peer };
  if (!admin || errdis || !peer) return base;
  const pdev = net.dev(peer.dev)!;
  const pphys = physInfo(pdev, peer.ifName)!;
  const pcfg = pdev.t === 'ios' ? pdev.st.cfg.ifaces[peer.ifName] : undefined;
  const padmin = pdev.t === 'ios' ? !pcfg?.shutdown : true;
  const perr = pdev.t === 'ios' ? pdev.st.dyn.ifd[peer.ifName]?.errDisabled : undefined;
  if (!padmin || perr) return base;
  if (phys.type === 'Serial' || pphys.type === 'Serial') {
    return { ...base, carrier: phys.type === pphys.type, speed: 1.544 };
  }
  const s1 = cfgSpeed(cfg);
  const s2 = cfgSpeed(pcfg);
  let speed: number;
  if (s1 !== null && s2 !== null) {
    // two different hard-coded speeds never link; neither may exceed what the hardware can do
    if (s1 !== s2 || s1 > phys.speed || s1 > pphys.speed) return { ...base, speedMismatch: true };
    speed = s1;
  } else if (s1 !== null) {
    if (s1 > pphys.speed) return { ...base, speedMismatch: true };
    speed = s1;
  } else if (s2 !== null) {
    if (s2 > phys.speed) return { ...base, speedMismatch: true };
    speed = s2;
  } else speed = Math.min(phys.speed, pphys.speed);
  // Gigabit always autonegotiates (1000BASE-T requires it) and runs full duplex: no duplex mismatch is possible.
  if (speed >= 1000) return { ...base, carrier: true, speed, duplex: 'full' };
  // Duplex is only negotiated while it is `auto` (a hard-coded `speed` merely limits what the port advertises).
  // An auto end facing a hard-coded (silent) partner cannot learn the duplex: parallel detection finds the
  // speed, but the duplex falls back to half. A hard-coded end uses its configured duplex.
  const d1 = cfgDuplex(cfg);
  const d2 = cfgDuplex(pcfg);
  const eff1: 'full' | 'half' = d1 === null && d2 === null ? 'full' : (d1 ?? 'half');
  const eff2: 'full' | 'half' = d1 === null && d2 === null ? 'full' : (d2 ?? 'half');
  return { ...base, carrier: true, speed, duplex: eff1, duplexMismatch: eff1 !== eff2 };
}

/* ------------------------------------------------------------------ */
/* EtherChannel                                                        */
/* ------------------------------------------------------------------ */

function chProto(m: ChMode): 'LACP' | 'PAgP' | '-' {
  if (m === 'active' || m === 'passive') return 'LACP';
  if (m === 'desirable' || m === 'auto') return 'PAgP';
  return '-';
}

const SW_KEYS: (keyof IfCfg)[] = ['sw', 'mode', 'accessVlan', 'nativeVlan', 'trunkEncap', 'nonegotiate'];

function swCompatible(a: IfCfg, b: IfCfg): boolean {
  for (const k of SW_KEYS) if (a[k] !== b[k]) return false;
  if (JSON.stringify(a.allowed) !== JSON.stringify(b.allowed)) return false;
  if (a.sw === false && (a.ip?.ip !== undefined || b.ip?.ip !== undefined)) {
    // routed members must not carry their own IP
    if (a.ip) return false;
  }
  return true;
}

function computeBundles(net: Net, l1: Map<string, L1>, st: L2State): void {
  for (const dev of net.iosDevices()) {
    const groups = new Map<number, string[]>();
    for (const [name, c] of Object.entries(dev.st.cfg.ifaces)) {
      if (c.channel && isPhysical(dev, name)) {
        const arr = groups.get(c.channel.group) ?? [];
        arr.push(name);
        groups.set(c.channel.group, arr);
      }
    }
    for (const [group, members] of groups) {
      const po = `Port-channel${group}`;
      const pocfg = dev.st.cfg.ifaces[po];
      const b: Bundle = { dev: dev.id, po, group, proto: '-', members: [], up: false };
      let partnerDev: string | undefined;
      let speed: number | undefined;
      for (const m of members.sort()) {
        const c = dev.st.cfg.ifaces[m];
        const mode = c.channel!.mode;
        b.proto = chProto(mode);
        const s = l1.get(ek(dev.id, m))!;
        let flag: ChFlag;
        if (!s.carrier) flag = 'D';
        else if (pocfg && !swCompatible(c, pocfg)) flag = 's';
        else if (speed !== undefined && s.speed !== speed) flag = 's';
        else {
          const peer = s.peer!;
          const pdev = net.dev(peer.dev)!;
          const pc = pdev.t === 'ios' ? pdev.st.cfg.ifaces[peer.ifName]?.channel : undefined;
          if (mode === 'on') flag = 'P';
          else if (!pc || chProto(pc.mode) !== chProto(mode)) flag = 'I';
          else if (mode === 'passive' && pc.mode === 'passive') flag = 'I';
          else if (mode === 'auto' && pc.mode === 'auto') flag = 'I';
          else flag = 'P';
          if (flag === 'P') {
            if (partnerDev === undefined) partnerDev = peer.dev;
            else if (partnerDev !== peer.dev) flag = 's';
          }
          if (flag === 'P' && speed === undefined) speed = s.speed;
        }
        b.members.push({ ifName: m, flag, mode });
        st.memberFlag.set(ek(dev.id, m), flag);
        if (flag === 'P') st.memberPo.set(ek(dev.id, m), po);
      }
      b.partnerDev = partnerDev;
      b.up = !!pocfg && !pocfg.shutdown && b.members.some((m) => m.flag === 'P');
      st.bundles.set(ek(dev.id, po), b);
    }
  }
}

/* ------------------------------------------------------------------ */
/* DTP / operational switchport                                        */
/* ------------------------------------------------------------------ */

/** Logical L2 port a physical port belongs to (itself, or its Port-channel when bundled). */
export function logicalOf(st: L2State, dev: string, phys: string): string {
  return st.memberPo.get(ek(dev, phys)) ?? phys;
}

function partnerOf(net: Net, st: L2State, dev: IosDevice, port: string): { dev: Device; phys: string; logical: string } | null {
  let phys: string | undefined;
  if (port.startsWith('Port-channel')) {
    const b = st.bundles.get(ek(dev.id, port));
    phys = b?.members.find((m) => m.flag === 'P')?.ifName;
  } else phys = port;
  if (!phys) return null;
  const s = st.l1.get(ek(dev.id, phys));
  if (!s?.carrier || !s.peer) return null;
  const pdev = net.dev(s.peer.dev)!;
  return { dev: pdev, phys: s.peer.ifName, logical: logicalOf(st, pdev.id, s.peer.ifName) };
}

function dtpResult(mode: string, peer: { mode: string; noneg: boolean } | null): 'access' | 'trunk' {
  if (mode === 'access') return 'access';
  if (mode === 'trunk') return 'trunk';
  if (!peer || peer.noneg) return 'access';
  if (peer.mode === 'trunk' || peer.mode === 'dynamic desirable') return 'trunk';
  if (peer.mode === 'dynamic auto') return mode === 'dynamic desirable' ? 'trunk' : 'access';
  return 'access';
}

function computeOper(net: Net, st: L2State): void {
  for (const dev of net.iosDevices()) {
    if (dev.kind === 'router') continue;
    const existing = existingVlanRanges(dev);
    for (const [name, c] of Object.entries(dev.st.cfg.ifaces)) {
      if (!c.sw) continue;
      const isPo = name.startsWith('Port-channel');
      const phys = isPhysical(dev, name);
      if (!isPo && !phys) continue;
      if (phys) {
        const flag = st.memberFlag.get(ek(dev.id, name));
        if (flag === 'P') continue; // represented by the Port-channel
      }
      let up: boolean;
      let physList: string[];
      if (isPo) {
        const b = st.bundles.get(ek(dev.id, name));
        physList = b ? b.members.filter((m) => m.flag === 'P').map((m) => m.ifName) : [];
        up = !!b?.up;
      } else {
        physList = [name];
        const flag = st.memberFlag.get(ek(dev.id, name));
        up = !!st.l1.get(ek(dev.id, name))?.carrier && flag !== 's' && flag !== 'D';
      }
      const partner = up ? partnerOf(net, st, dev, name) : null;
      let peerInfo: { mode: string; noneg: boolean } | null = null;
      let partnerIsSwitch = false;
      if (partner && partner.dev.t === 'ios' && partner.dev.kind !== 'router') {
        const pc = partner.dev.st.cfg.ifaces[partner.logical];
        if (pc?.sw) {
          peerInfo = { mode: pc.mode, noneg: pc.nonegotiate };
          partnerIsSwitch = true;
        }
      }
      const res = dtpResult(c.mode, peerInfo);
      const encap = c.trunkEncap === 'negotiate' ? (res === 'trunk' ? 'n-802.1q' : '802.1q') : c.trunkEncap === 'isl' ? 'isl' : '802.1q';
      st.oper.set(ek(dev.id, name), {
        port: name,
        phys: physList,
        up,
        mode: up ? res : 'down',
        adminMode: c.mode,
        negotiated: c.mode.startsWith('dynamic'),
        accessVlan: c.accessVlan,
        voiceVlan: c.voiceVlan,
        native: c.nativeVlan,
        allowed: c.allowed,
        active: rangesIntersect(c.allowed, existing),
        partner: partner ? { dev: partner.dev.id, port: partner.logical } : undefined,
        partnerIsSwitch,
        encap,
      });
    }
  }
}

/** VLANs a logical port carries (operationally). */
export function portVlans(dev: IosDevice, o: SwOper): number[] {
  if (!o.up) return [];
  if (o.mode === 'access') {
    const out: number[] = [];
    if (vlanExists(dev, o.accessVlan)) out.push(o.accessVlan);
    if (o.voiceVlan !== undefined && vlanExists(dev, o.voiceVlan) && o.voiceVlan !== o.accessVlan) out.push(o.voiceVlan);
    return out;
  }
  if (o.mode === 'trunk') {
    const out: number[] = [];
    for (const [a, b] of o.active) for (let v = a; v <= b; v++) out.push(v);
    return out;
  }
  return [];
}

export function portCarries(dev: IosDevice, o: SwOper, v: number): boolean {
  if (!o.up) return false;
  if (o.mode === 'access') return (o.accessVlan === v || o.voiceVlan === v) && vlanExists(dev, v);
  if (o.mode === 'trunk') return rangesHas(o.active, v);
  return false;
}

/* ------------------------------------------------------------------ */
/* STP                                                                 */
/* ------------------------------------------------------------------ */

function shortCost(mbps: number): number {
  if (mbps >= 10000) return 2;
  if (mbps >= 1000) return 4;
  if (mbps >= 100) return 19;
  return 100;
}

function poCost(total: number, memberSpeed: number): number {
  if (memberSpeed >= 1000) return total >= 4000 ? 2 : 3;
  if (memberSpeed >= 100) {
    if (total >= 800) return 5;
    if (total >= 400) return 8;
    if (total >= 300) return 9;
    return 12;
  }
  return 50;
}

function portCostFor(dev: IosDevice, st: L2State, port: string, v: number): number {
  const c = dev.st.cfg.ifaces[port];
  if (c?.stp.vlanCost[String(v)] !== undefined) return c.stp.vlanCost[String(v)];
  if (c?.stp.cost !== undefined) return c.stp.cost;
  if (port.startsWith('Port-channel')) {
    const b = st.bundles.get(ek(dev.id, port));
    const mem = b?.members.filter((m) => m.flag === 'P') ?? [];
    if (!mem.length) return 19;
    const sp = st.l1.get(ek(dev.id, mem[0].ifName))!.speed;
    return mem.length === 1 ? shortCost(sp) : poCost(sp * mem.length, sp);
  }
  const s = st.l1.get(ek(dev.id, port));
  return shortCost(s?.speed ?? 100);
}

function portNum(dev: IosDevice, port: string): number {
  if (port.startsWith('Port-channel')) return 64 + Number(port.slice(12));
  return physInfo(dev, port)?.port ?? 0;
}

function portPrio(dev: IosDevice, port: string, v: number): number {
  const c = dev.st.cfg.ifaces[port];
  return c?.stp.vlanPrio[String(v)] ?? c?.stp.prio ?? 128;
}

export function bridgePrio(dev: IosDevice, v: number): number {
  return dev.st.cfg.stpPrio[String(v)] ?? 32768;
}

function bidKey(prio: number, v: number, mac: string): string {
  return (prio + v).toString(16).padStart(4, '0') + mac;
}

function portfastOper(dev: IosDevice, c: IfCfg, o: SwOper): boolean {
  if (c.stp.portfast === 'disable') return false;
  if (c.stp.portfast === 'trunk') return true;
  if (c.stp.portfast === 'edge') return o.mode === 'access';
  return dev.st.cfg.stpPortfastDefault && o.mode === 'access';
}

function bpduGuardOn(dev: IosDevice, c: IfCfg, edgeCfg: boolean): boolean {
  if (c.stp.bpduguard === 'enable') return true;
  if (c.stp.bpduguard === 'disable') return false;
  return dev.st.cfg.stpBpduguardDefault && edgeCfg;
}

function bpduFilterOn(dev: IosDevice, c: IfCfg, edgeCfg: boolean): boolean {
  if (c.stp.bpdufilter === 'enable') return true;
  if (c.stp.bpdufilter === 'disable') return false;
  return dev.st.cfg.stpBpdufilterDefault && edgeCfg;
}

interface StpNode {
  dev: IosDevice;
  bid: string;
  prio: number;
  ports: { port: string; cost: number; prio: number; num: number; pid: number; peer?: { dev: string; port: string }; edge: boolean; shared: boolean }[];
}

function computeStp(net: Net, st: L2State): void {
  // which vlans have active ports on each switch
  const switches = net.iosDevices().filter((d) => d.kind !== 'router');
  const vlanSet = new Set<number>();
  const portsBy = new Map<string, SwOper[]>();
  for (const dev of switches) {
    const opers: SwOper[] = [];
    for (const [key, o] of st.oper) if (key.startsWith(dev.id + '|')) opers.push(o);
    portsBy.set(dev.id, opers);
    const enabled = new Set<number>();
    for (const o of opers) for (const v of portVlans(dev, o)) if (!rangesHas(dev.st.cfg.stpOff, v)) {
      vlanSet.add(v);
      enabled.add(v);
    }
    st.stpEnabled.set(dev.id, enabled);
    st.stp.set(dev.id, new Map());
  }
  // BPDU guard: an operational edge port with bpduguard that hears a switch → err-disable
  for (const dev of switches) {
    for (const o of portsBy.get(dev.id)!) {
      if (!o.up) continue;
      const c = dev.st.cfg.ifaces[o.port];
      const edgeCfg = portfastOper(dev, c, o);
      if (!bpduGuardOn(dev, c, edgeCfg)) continue;
      if (bpduFilterOn(dev, c, edgeCfg) && c.stp.bpduguard !== 'enable') continue;
      if (o.partnerIsSwitch && o.partner) {
        const pdev = net.ios(o.partner.dev)!;
        const pc = pdev.st.cfg.ifaces[o.partner.port];
        const po = st.oper.get(ek(pdev.id, o.partner.port));
        const pEdge = pc && po ? portfastOper(pdev, pc, po) : false;
        if (pc && !bpduFilterOn(pdev, pc, pEdge)) {
          for (const p of o.phys) st.errEvents.push({ dev: dev.id, ifName: p, reason: 'bpduguard' });
        }
      }
    }
  }
  for (const v of [...vlanSet].sort((a, b) => a - b)) {
    const nodes = new Map<string, StpNode>();
    for (const dev of switches) {
      if (!st.stpEnabled.get(dev.id)!.has(v)) continue;
      const prio = bridgePrio(dev, v);
      const node: StpNode = { dev, bid: bidKey(prio, v, dev.mac), prio, ports: [] };
      for (const o of portsBy.get(dev.id)!) {
        if (!portCarries(dev, o, v)) continue;
        const c = dev.st.cfg.ifaces[o.port];
        const edgeCfg = portfastOper(dev, c, o);
        const filter = bpduFilterOn(dev, c, edgeCfg);
        let peer: { dev: string; port: string } | undefined;
        if (o.partnerIsSwitch && o.partner && !filter) {
          const pdev = net.ios(o.partner.dev)!;
          const po = st.oper.get(ek(pdev.id, o.partner.port));
          const pc = pdev.st.cfg.ifaces[o.partner.port];
          const pEdge = pc && po ? portfastOper(pdev, pc, po) : false;
          if (po && portCarries(pdev, po, v) && st.stpEnabled.get(pdev.id)?.has(v) && pc && !bpduFilterOn(pdev, pc, pEdge)) peer = o.partner;
        }
        const num = portNum(dev, o.port);
        const pr = portPrio(dev, o.port, v);
        const l1 = o.phys.length ? st.l1.get(ek(dev.id, o.phys[0])) : undefined;
        node.ports.push({
          port: o.port,
          cost: portCostFor(dev, st, o.port, v),
          prio: pr,
          num,
          pid: pr * 4096 + num,
          peer,
          edge: !peer && edgeCfg,
          shared: l1?.duplex === 'half' || c.stp.link === 'shared',
        });
      }
      nodes.set(dev.id, node);
    }
    // root guard handling: iteratively remove root-inconsistent links
    const excluded = new Set<string>();
    for (let iter = 0; iter < 6; iter++) {
      const res = runStp(nodes, v, excluded);
      let changed = false;
      for (const node of nodes.values()) {
        const r = res.get(node.dev.id)!;
        for (const p of node.ports) {
          const c = node.dev.st.cfg.ifaces[p.port];
          if (c?.stp.guard !== 'root' || !p.peer || excluded.has(ek(node.dev.id, p.port))) continue;
          const pr = r.ports.get(p.port)!;
          if (pr.role === 'root' || pr.role === 'alternate') {
            excluded.add(ek(node.dev.id, p.port));
            st.rootInconsistent.push({ dev: node.dev.id, port: p.port, vlan: v });
            changed = true;
          }
        }
      }
      if (!changed) {
        for (const [id, r] of res) st.stp.get(id)!.set(v, r);
        break;
      }
    }
  }
}

function runStp(nodes: Map<string, StpNode>, v: number, excluded: Set<string>): Map<string, StpVlan> {
  const out = new Map<string, StpVlan>();
  const peerOk = (dev: string, p: StpNode['ports'][number]) =>
    p.peer && !excluded.has(ek(dev, p.port)) && !excluded.has(ek(p.peer.dev, p.peer.port)) && nodes.has(p.peer.dev);
  // components
  const comp = new Map<string, string>();
  for (const id of nodes.keys()) {
    if (comp.has(id)) continue;
    const stack = [id];
    const members: string[] = [];
    comp.set(id, id);
    while (stack.length) {
      const x = stack.pop()!;
      members.push(x);
      for (const p of nodes.get(x)!.ports) {
        if (!peerOk(x, p)) continue;
        if (!comp.has(p.peer!.dev)) {
          comp.set(p.peer!.dev, id);
          stack.push(p.peer!.dev);
        }
      }
    }
    // root = lowest bid
    let root = members[0];
    for (const m of members) if (nodes.get(m)!.bid < nodes.get(root)!.bid) root = m;
    for (const m of members) comp.set(m, root);
  }
  // Dijkstra per root: rpc(B) = min over ports p on B with peer N: rpc(N) + cost(p)
  const rpc = new Map<string, number>();
  const roots = new Set(comp.values());
  for (const r of roots) rpc.set(r, 0);
  const done = new Set<string>();
  for (;;) {
    let best: string | undefined;
    for (const [id, c] of rpc) if (!done.has(id) && (best === undefined || c < rpc.get(best)! || (c === rpc.get(best)! && nodes.get(id)!.bid < nodes.get(best)!.bid))) best = id;
    if (best === undefined) break;
    done.add(best);
    // relax neighbors: neighbor B receiving from best on B's port q costs cost(q)
    for (const p of nodes.get(best)!.ports) {
      if (!peerOk(best, p)) continue;
      const nb = nodes.get(p.peer!.dev)!;
      const q = nb.ports.find((x) => x.port === p.peer!.port);
      if (!q) continue;
      const c = rpc.get(best)! + q.cost;
      if (!rpc.has(nb.dev.id) || c < rpc.get(nb.dev.id)!) rpc.set(nb.dev.id, c);
    }
  }
  for (const [id, node] of nodes) {
    const rootId = comp.get(id)!;
    const rootNode = nodes.get(rootId)!;
    const myRpc = rpc.get(id) ?? 0;
    const isRoot = rootId === id;
    // root port selection
    let rootPort: string | undefined;
    let bestKey: [number, string, number, number] | undefined;
    if (!isRoot) {
      for (const p of node.ports) {
        if (!peerOk(id, p)) continue;
        const nb = nodes.get(p.peer!.dev)!;
        const q = nb.ports.find((x) => x.port === p.peer!.port)!;
        const key: [number, string, number, number] = [(rpc.get(nb.dev.id) ?? 0) + p.cost, nb.bid, q.pid, p.pid];
        if (!bestKey || cmpKey(key, bestKey) < 0) {
          bestKey = key;
          rootPort = p.port;
        }
      }
    }
    const ports = new Map<string, StpPort>();
    for (const p of node.ports) {
      let role: StpRole;
      let desBid: string | undefined;
      if (p.port === rootPort) role = 'root';
      else if (!peerOk(id, p)) role = 'designated';
      else {
        const nb = nodes.get(p.peer!.dev)!;
        const q = nb.ports.find((x) => x.port === p.peer!.port)!;
        const mine: [number, string, number] = [myRpc, node.bid, p.pid];
        const theirs: [number, string, number] = [rpc.get(nb.dev.id) ?? 0, nb.bid, q.pid];
        const cmp = cmpKey3(mine, theirs);
        // a port cannot be designated when the neighbour's root port faces us... designated = better tuple
        if (cmp < 0) role = 'designated';
        else {
          role = nb.dev.id === id ? 'backup' : 'alternate';
          desBid = nb.bid;
        }
      }
      ports.set(p.port, {
        port: p.port,
        role,
        state: role === 'root' || role === 'designated' ? 'forwarding' : 'blocking',
        cost: p.cost,
        prio: p.prio,
        num: p.num,
        edge: p.edge,
        shared: p.shared,
        desBid,
      });
    }
    for (const x of excluded) {
      const [d, port] = x.split('|');
      if (d !== id) continue;
      const sp = ports.get(port);
      if (sp) {
        sp.role = 'designated';
        sp.state = 'blocking';
        sp.inconsistent = 'ROOT_Inc';
      }
    }
    out.set(id, {
      vlan: v,
      bridgePrio: node.prio,
      bridgeMac: node.dev.mac,
      rootPrio: rootNode.prio,
      rootMac: rootNode.dev.mac,
      rootCost: myRpc,
      rootPort,
      isRoot,
      ports,
    });
  }
  return out;
}

function cmpKey(a: [number, string, number, number], b: [number, string, number, number]): number {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1;
  if (a[2] !== b[2]) return a[2] - b[2];
  return a[3] - b[3];
}

function cmpKey3(a: [number, string, number], b: [number, string, number]): number {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1;
  return a[2] - b[2];
}

/** STP state of a logical port for a VLAN (forwarding when STP is off for the VLAN). */
export function stpForwarding(st: L2State, dev: IosDevice, port: string, v: number): boolean {
  if (rangesHas(dev.st.cfg.stpOff, v)) return true;
  const inst = st.stp.get(dev.id)?.get(v);
  if (!inst) return true;
  const p = inst.ports.get(port);
  if (!p) return true;
  return p.state === 'forwarding';
}

/* ------------------------------------------------------------------ */
/* interface status                                                    */
/* ------------------------------------------------------------------ */

function computeIfStatus(net: Net, st: L2State): void {
  for (const dev of net.allDevices()) {
    if (dev.t === 'host') {
      for (const p of dev.hw.ifaces) {
        const s = st.l1.get(ek(dev.id, p.name))!;
        st.ifs.set(ek(dev.id, p.name), { line: s.carrier ? 'up' : 'down', proto: s.carrier ? 'up' : 'down', status: s.carrier ? 'connected' : 'notconnect' });
      }
      continue;
    }
    const cfg = dev.st.cfg;
    // physical first
    for (const [name, c] of Object.entries(cfg.ifaces)) {
      if (!isPhysical(dev, name)) continue;
      const s = st.l1.get(ek(dev.id, name))!;
      const flag = st.memberFlag.get(ek(dev.id, name));
      if (c.shutdown) st.ifs.set(ek(dev.id, name), { line: 'admin-down', proto: 'down', status: 'disabled' });
      else if (s.errdis) st.ifs.set(ek(dev.id, name), { line: 'down', proto: 'down', errdis: s.errdis, status: 'err-disabled' });
      else if (!s.carrier) st.ifs.set(ek(dev.id, name), { line: 'down', proto: 'down', status: 'notconnect' });
      else {
        let proto: 'up' | 'down' = 'up';
        const t = typeOfName(name)?.name;
        if (t === 'Serial') {
          const peer = s.peer!;
          const pdev = net.dev(peer.dev)!;
          const pc = pdev.t === 'ios' ? pdev.st.cfg.ifaces[peer.ifName] : undefined;
          if (!pc || pc.serialEncap !== c.serialEncap) proto = 'down';
        }
        let status = 'connected';
        if (flag === 's') status = 'suspended';
        st.ifs.set(ek(dev.id, name), { line: 'up', proto, status });
      }
    }
    // logical
    for (const [name, c] of Object.entries(cfg.ifaces)) {
      if (isPhysical(dev, name)) continue;
      const key = ek(dev.id, name);
      const t = typeOfName(name)?.name;
      const parent = parentOf(name);
      if (parent) {
        const ps = st.ifs.get(ek(dev.id, parent));
        if (c.shutdown) st.ifs.set(key, { line: 'admin-down', proto: 'down', status: 'disabled' });
        else if (!ps || ps.line === 'admin-down') st.ifs.set(key, { line: 'down', proto: 'down', status: 'notconnect' });
        else st.ifs.set(key, { line: ps.line, proto: ps.proto, status: ps.status });
        continue;
      }
      if (c.shutdown) {
        st.ifs.set(key, { line: 'admin-down', proto: 'down', status: 'disabled' });
        continue;
      }
      if (t === 'Loopback' || t === 'Null' || t === 'Tunnel') {
        st.ifs.set(key, { line: 'up', proto: t === 'Tunnel' ? 'down' : 'up', status: 'connected' });
        continue;
      }
      if (t === 'Port-channel') {
        const b = st.bundles.get(key);
        const up = !!b?.members.some((m) => m.flag === 'P');
        st.ifs.set(key, { line: up ? 'up' : 'down', proto: up ? 'up' : 'down', status: up ? 'connected' : 'notconnect' });
        continue;
      }
      if (t === 'Vlan') {
        const v = Number(name.slice(4));
        if (dev.kind === 'router' || !vlanExists(dev, v)) {
          st.ifs.set(key, { line: 'down', proto: 'down', status: 'notconnect' });
          continue;
        }
        let active = false;
        for (const [k2, o] of st.oper) {
          if (!k2.startsWith(dev.id + '|')) continue;
          if (portCarries(dev, o, v) && stpForwarding(st, dev, o.port, v)) {
            active = true;
            break;
          }
        }
        st.ifs.set(key, { line: 'up', proto: active ? 'up' : 'down', status: active ? 'connected' : 'notconnect' });
        continue;
      }
      st.ifs.set(key, { line: 'down', proto: 'down', status: 'notconnect' });
    }
  }
}

/* ------------------------------------------------------------------ */
/* native VLAN mismatch detection (CDP)                               */
/* ------------------------------------------------------------------ */

function detectNativeMismatch(net: Net, st: L2State): void {
  for (const [key, o] of st.oper) {
    if (o.mode !== 'trunk' || !o.partner || !o.partnerIsSwitch) continue;
    const dev = key.slice(0, key.indexOf('|'));
    const po = st.oper.get(ek(o.partner.dev, o.partner.port));
    if (!po || po.mode !== 'trunk') continue;
    if (po.native !== o.native) {
      const pdev = net.ios(o.partner.dev)!;
      const mydev = net.ios(dev)!;
      if (!mydev.st.cfg.cdp || !pdev.st.cfg.cdp) continue;
      st.nativeMismatch.push({ dev, port: o.phys[0] ?? o.port, native: o.native, peerDev: o.partner.dev, peerPort: po.phys[0] ?? po.port, peerNative: po.native });
    }
  }
}

/* ------------------------------------------------------------------ */
/* entry point                                                         */
/* ------------------------------------------------------------------ */

export function computeL2(net: Net): L2State {
  const st: L2State = {
    l1: new Map(),
    bundles: new Map(),
    memberPo: new Map(),
    memberFlag: new Map(),
    oper: new Map(),
    stp: new Map(),
    stpEnabled: new Map(),
    ifs: new Map(),
    errEvents: [],
    rootInconsistent: [],
    nativeMismatch: [],
  };
  for (const dev of net.allDevices()) for (const p of dev.hw.ifaces) st.l1.set(ek(dev.id, p.name), computeL1(net, dev, p.name));
  computeBundles(net, st.l1, st);
  computeOper(net, st);
  computeStp(net, st);
  computeIfStatus(net, st);
  detectNativeMismatch(net, st);
  return st;
}

/* ------------------------------------------------------------------ */
/* L2 flooding                                                         */
/* ------------------------------------------------------------------ */

/** Transmitting end of a physical wire a frame crosses. */
export interface L2Wire {
  dev: string;
  ifName: string;
}

export interface L2Endpoint {
  dev: string;
  ifName: string;
  /** chain of switch hops from the source (for MAC learning / tracing) */
  hops: L2Hop[];
  /** physical wires crossed from the source to this endpoint, in order */
  wires: L2Wire[];
}

export interface L2Hop {
  dev: string;
  vlan: number;
  inPort: string | null;
  outPort?: string;
}

export interface FrameOpts {
  srcMac?: string;
  /** DHCP server → client messages are dropped on untrusted snooping ports */
  dhcpServer?: boolean;
  dhcpClient?: boolean;
  /** collect per-switch ingress info */
  onIngress?: (dev: IosDevice, port: string, vlan: number, physPort: string) => boolean;
}

export interface FloodResult {
  eps: L2Endpoint[];
  opt82: boolean;
  drops: string[];
  /** every physical wire the flooded frame crosses (transmitting ends) */
  wires: L2Wire[];
}

/** The physical port and 802.1Q tag an L3 interface transmits on. */
export function txPoint(_net: Net, dev: Device, ifName: string): { phys: string; tag: number | null } | { vlan: number } | null {
  if (dev.t === 'host') return { phys: dev.hw.ifaces[0].name, tag: null };
  const parent = parentOf(ifName);
  if (parent) {
    const c = dev.st.cfg.ifaces[ifName];
    if (!c?.dot1q) return null;
    return { phys: parent, tag: c.dot1q.native ? null : c.dot1q.vlan };
  }
  if (ifName.startsWith('Vlan') && dev.kind !== 'router') return { vlan: Number(ifName.slice(4)) };
  if (isPhysical(dev, ifName)) return { phys: ifName, tag: null };
  if (ifName.startsWith('Port-channel')) {
    return { phys: ifName, tag: null };
  }
  return null;
}

/** Flood a broadcast frame from an L3 interface and return every L3 endpoint that receives it. */
export function flood(net: Net, st: L2State, fromDev: Device, fromIf: string, opts: FrameOpts = {}): FloodResult {
  const res: FloodResult = { eps: [], opt82: false, drops: [], wires: [] };
  const seenWire = new Set<string>();
  const tp = txPoint(net, fromDev, fromIf);
  if (!tp) return res;
  const visitedBridge = new Set<string>();
  const visitedWire = new Set<string>();
  type Item = { kind: 'wire'; dev: string; phys: string; tag: number | null; hops: L2Hop[]; wires: L2Wire[] } | { kind: 'bridge'; dev: string; vlan: number; inPort: string | null; hops: L2Hop[]; wires: L2Wire[] };
  const queue: Item[] = [];
  const sendOut = (dev: Device, phys: string, tag: number | null, hops: L2Hop[], wires: L2Wire[]) => {
    // logical Port-channel on a router/L3: pick a bundled member
    let p = phys;
    if (phys.startsWith('Port-channel') && dev.t === 'ios') {
      const b = st.bundles.get(ek(dev.id, phys));
      const m = b?.members.find((x) => x.flag === 'P');
      if (!m) return;
      p = m.ifName;
    }
    const s = st.l1.get(ek(dev.id, p));
    if (!s?.carrier || !s.peer) return;
    const wire: L2Wire = { dev: dev.id, ifName: p };
    if (!seenWire.has(ek(wire.dev, wire.ifName))) {
      seenWire.add(ek(wire.dev, wire.ifName));
      res.wires.push(wire);
    }
    queue.push({ kind: 'wire', dev: s.peer.dev, phys: s.peer.ifName, tag, hops, wires: [...wires, wire] });
  };
  if ('vlan' in tp) queue.push({ kind: 'bridge', dev: fromDev.id, vlan: tp.vlan, inPort: null, hops: [], wires: [] });
  else sendOut(fromDev, tp.phys, tp.tag, [], []);
  let guard = 0;
  while (queue.length && guard++ < 5000) {
    const it = queue.shift()!;
    const dev = net.dev(it.dev)!;
    if (it.kind === 'wire') {
      const wk = `${it.dev}|${it.phys}|${it.tag}`;
      if (visitedWire.has(wk)) continue;
      visitedWire.add(wk);
      if (dev.t === 'host') {
        if (it.tag === null) res.eps.push({ dev: dev.id, ifName: it.phys, hops: it.hops, wires: it.wires });
        continue;
      }
      const ifst = st.ifs.get(ek(dev.id, it.phys));
      if (!ifst || ifst.line !== 'up') continue;
      const c = dev.st.cfg.ifaces[it.phys];
      if (c?.sw && dev.kind !== 'router') {
        const flag = st.memberFlag.get(ek(dev.id, it.phys));
        if (flag === 's' || flag === 'D') continue;
        const logical = logicalOf(st, dev.id, it.phys);
        const o = st.oper.get(ek(dev.id, logical));
        if (!o || !o.up) continue;
        let vlan: number;
        if (o.mode === 'access') {
          if (it.tag === null) vlan = o.accessVlan;
          else if (o.voiceVlan !== undefined && it.tag === o.voiceVlan) vlan = o.voiceVlan;
          else {
            res.drops.push(`${dev.id} ${logical}: tagged frame (VLAN ${it.tag}) on access port`);
            continue;
          }
        } else if (o.mode === 'trunk') {
          vlan = it.tag ?? o.native;
          if (!rangesHas(o.allowed, vlan)) {
            res.drops.push(`${dev.id} ${logical}: VLAN ${vlan} not allowed on trunk`);
            continue;
          }
        } else continue;
        if (!vlanExists(dev, vlan)) {
          res.drops.push(`${dev.id}: VLAN ${vlan} does not exist`);
          continue;
        }
        if (!stpForwarding(st, dev, logical, vlan)) {
          res.drops.push(`${dev.id} ${logical}: STP blocking for VLAN ${vlan}`);
          continue;
        }
        const lc = dev.st.cfg.ifaces[logical] ?? c;
        if (opts.dhcpServer && dev.st.cfg.snoop && rangesHas(dev.st.cfg.snoopVlans, vlan) && !lc.snoopTrust) {
          res.drops.push(`${dev.id} ${logical}: DHCP snooping dropped server message on untrusted port`);
          continue;
        }
        if (opts.dhcpClient && dev.st.cfg.snoop && rangesHas(dev.st.cfg.snoopVlans, vlan) && dev.st.cfg.snoopOpt82 && !lc.snoopTrust) res.opt82 = true;
        if (opts.onIngress && !opts.onIngress(dev, logical, vlan, it.phys)) continue;
        queue.push({ kind: 'bridge', dev: dev.id, vlan, inPort: logical, hops: it.hops, wires: it.wires });
        continue;
      }
      // router / routed port / L3 endpoint
      if (it.tag === null) {
        const nat = Object.values(dev.st.cfg.ifaces).find((x) => parentOf(x.name) === it.phys && x.dot1q?.native);
        const target = nat ? nat.name : it.phys;
        const ts = st.ifs.get(ek(dev.id, target));
        if (ts && ts.line === 'up') res.eps.push({ dev: dev.id, ifName: target, hops: it.hops, wires: it.wires });
      } else {
        const sub = Object.values(dev.st.cfg.ifaces).find((x) => parentOf(x.name) === it.phys && x.dot1q?.vlan === it.tag && !x.dot1q.native);
        if (sub) {
          const ts = st.ifs.get(ek(dev.id, sub.name));
          if (ts && ts.line === 'up') res.eps.push({ dev: dev.id, ifName: sub.name, hops: it.hops, wires: it.wires });
        }
      }
      continue;
    }
    // bridge
    const bk = `${it.dev}|${it.vlan}`;
    if (visitedBridge.has(bk)) continue;
    visitedBridge.add(bk);
    if (dev.t !== 'ios') continue;
    const hop: L2Hop = { dev: dev.id, vlan: it.vlan, inPort: it.inPort };
    const hops = [...it.hops, hop];
    const svi = `Vlan${it.vlan}`;
    if (it.inPort !== null && dev.st.cfg.ifaces[svi]) {
      const ss = st.ifs.get(ek(dev.id, svi));
      if (ss && ss.line === 'up') res.eps.push({ dev: dev.id, ifName: svi, hops, wires: it.wires });
    }
    for (const [key, o] of st.oper) {
      if (!key.startsWith(dev.id + '|')) continue;
      if (o.port === it.inPort) continue;
      if (!portCarries(dev, o, it.vlan)) continue;
      if (!stpForwarding(st, dev, o.port, it.vlan)) continue;
      let tag: number | null;
      if (o.mode === 'access') tag = it.vlan === o.accessVlan ? null : it.vlan;
      else tag = it.vlan === o.native ? null : it.vlan;
      const outHops = [...it.hops, { ...hop, outPort: o.port }];
      if (o.port.startsWith('Port-channel')) {
        const b = st.bundles.get(ek(dev.id, o.port));
        const m = b?.members.find((x) => x.flag === 'P');
        if (m) sendOut(dev, m.ifName, tag, outHops, it.wires);
      } else sendOut(dev, o.port, tag, outHops, it.wires);
    }
  }
  return res;
}

/** MAC used by an L3 interface when transmitting. */
export function l3Mac(dev: Device, ifName: string): string {
  return ifMac(dev, ifName);
}
