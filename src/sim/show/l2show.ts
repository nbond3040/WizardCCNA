/** Layer 2 show commands. */
import type { Ctx } from '../cli/session';
import { ek } from '../engine/net';
import { ifNames, isPhysical, ifMac } from '../engine/topo';
import { vlanExists, portCarries, stpForwarding, type StpPort, type StpVlan } from '../engine/l2';
import type { IosDevice } from '../model/state';
import { cdpIf, shortIf } from '../model/ifname';
import { chunk, pad, padL, rangesStr, rangesHas, type Ranges } from '../util/format';
import { ipStr } from '../util/ip';
import { macDotted, macColon } from '../util/mac';
import { hms } from '../util/format';

function noSwitch(c: Ctx): boolean {
  if (c.dev.kind === 'router') {
    c.out.push("% Invalid input detected at '^' marker.");
    return true;
  }
  return false;
}

/* ---------------- VLANs ---------------- */

function vlanPorts(c: Ctx, v: number): string[] {
  const dev = c.dev;
  const d = c.net.d;
  const out: string[] = [];
  for (const n of ifNames(dev)) {
    const cfg = dev.st.cfg.ifaces[n];
    if (!cfg.sw) continue;
    if (!isPhysical(dev, n) && !n.startsWith('Port-channel')) continue;
    if (isPhysical(dev, n) && d.l2.memberPo.has(ek(dev.id, n))) continue;
    const o = d.l2.oper.get(ek(dev.id, n));
    if (o?.mode === 'trunk') continue;
    if (!o && cfg.mode === 'trunk') continue;
    if (cfg.accessVlan === v || cfg.voiceVlan === v) out.push(shortIf(n));
  }
  return out;
}

function vlanStatus(dev: IosDevice, v: number): string {
  if (v >= 1002 && v <= 1005) return 'act/unsup';
  const r = dev.st.vlans[String(v)];
  if (r.suspend) return 'suspended';
  if (r.shut) return 'act/lshut';
  return 'active';
}

function sortedVlans(dev: IosDevice): number[] {
  return Object.keys(dev.st.vlans)
    .map(Number)
    .sort((a, b) => a - b);
}

function vlanTable(c: Ctx, vlans: number[]): void {
  const dev = c.dev;
  c.out.push('', 'VLAN Name                             Status    Ports', '---- -------------------------------- --------- -------------------------------');
  for (const v of vlans) {
    const rec = dev.st.vlans[String(v)];
    const ports = v >= 1002 ? [] : vlanPorts(c, v);
    const groups = chunk(ports, 4).map((g) => g.join(', '));
    c.out.push(`${pad(v, 5)}${pad(rec.name.slice(0, 32), 33)}${pad(vlanStatus(dev, v), 10)}${groups[0] ?? ''}`.replace(/\s+$/, (m) => (groups[0] ? '' : m.length ? ' ' : '')));
    for (const g of groups.slice(1)) c.out.push(`${' '.repeat(48)}${g}`);
  }
}

export function showVlan(c: Ctx): void {
  if (noSwitch(c)) return;
  const dev = c.dev;
  let vlans = sortedVlans(dev);
  if (c.a.vid !== undefined) {
    const v = c.a.vid as number;
    if (!dev.st.vlans[String(v)]) {
      c.out.push(`VLAN id ${v} not found in current VLAN database`);
      return;
    }
    vlans = [v];
  } else if (c.a.vname !== undefined) {
    vlans = vlans.filter((v) => dev.st.vlans[String(v)].name === c.a.vname);
    if (!vlans.length) {
      c.out.push(`VLAN ${c.a.vname} not found in current VLAN database`);
      return;
    }
  }
  vlanTable(c, vlans);
  if (c.a.brief) return;
  c.out.push('', 'VLAN Type  SAID       MTU   Parent RingNo BridgeNo Stp  BrdgMode Trans1 Trans2', '---- ----- ---------- ----- ------ ------ -------- ---- -------- ------ ------');
  for (const v of vlans) {
    const type = v === 1002 ? 'fddi ' : v === 1003 ? 'tr   ' : v === 1004 ? 'fdnet' : v === 1005 ? 'trnet' : 'enet ';
    const stp = v === 1004 ? 'ieee' : v === 1005 ? 'ibm ' : '-   ';
    c.out.push(`${pad(v, 5)}${type} ${pad(100000 + v, 11)}${pad(1500, 6)}-      -      -        ${stp} -        0      0   `);
  }
  if (c.a.vid === undefined && c.a.vname === undefined) {
    c.out.push('', 'Remote SPAN VLANs', '------------------------------------------------------------------------------', '', '', 'Primary Secondary Type              Ports', '------- --------- ----------------- ------------------------------------------', '');
  }
}

/* ---------------- trunks & switchport ---------------- */

export function showIntTrunk(c: Ctx): void {
  if (noSwitch(c)) return;
  const dev = c.dev;
  const d = c.net.d;
  const trunks = [...d.l2.oper.values()].filter((o) => o.mode === 'trunk' && d.l2.oper.get(ek(dev.id, o.port)) === o && (!c.a.ifn || c.a.ifn === o.port));
  if (!trunks.length) return;
  trunks.sort((a, b) => (a.port.startsWith('Port') ? 1 : 0) - (b.port.startsWith('Port') ? 1 : 0) || a.port.localeCompare(b.port, undefined, { numeric: true }));
  const modeWord = (m: string) => (m === 'trunk' ? 'on' : m === 'dynamic desirable' ? 'desirable' : m === 'dynamic auto' ? 'auto' : m);
  c.out.push('', 'Port        Mode             Encapsulation  Status        Native vlan');
  for (const o of trunks) c.out.push(`${pad(shortIf(o.port), 12)}${pad(modeWord(o.adminMode), 17)}${pad(o.encap, 15)}${pad('trunking', 14)}${o.native}`);
  c.out.push('', 'Port        Vlans allowed on trunk');
  for (const o of trunks) c.out.push(`${pad(shortIf(o.port), 12)}${o.allowed.length ? rangesStr(o.allowed) : 'none'}`);
  c.out.push('', 'Port        Vlans allowed and active in management domain');
  for (const o of trunks) c.out.push(`${pad(shortIf(o.port), 12)}${o.active.length ? rangesStr(o.active) : 'none'}`);
  c.out.push('', 'Port        Vlans in spanning tree forwarding state and not pruned');
  for (const o of trunks) {
    const fwd: number[] = [];
    for (const [a, b] of o.active) for (let v = a; v <= b; v++) if (stpForwarding(d.l2, dev, o.port, v)) fwd.push(v);
    const r: Ranges = [];
    for (const v of fwd) {
      const last = r[r.length - 1];
      if (last && last[1] === v - 1) last[1] = v;
      else r.push([v, v]);
    }
    c.out.push(`${pad(shortIf(o.port), 12)}${r.length ? rangesStr(r) : 'none'}`);
  }
}

function vlanLabel(dev: IosDevice, v: number): string {
  const rec = dev.st.vlans[String(v)];
  return rec ? `${v} (${rec.name})` : `${v} (Inactive)`;
}

export function switchportBlock(c: Ctx, n: string): string[] {
  const dev = c.dev;
  const cfg = dev.st.cfg.ifaces[n];
  const out: string[] = [`Name: ${shortIf(n)}`];
  if (!cfg.sw) {
    out.push('Switchport: Disabled');
    return out;
  }
  const o = c.net.d.l2.oper.get(ek(dev.id, dev.st.cfg.ifaces[n] && c.net.d.l2.memberPo.get(ek(dev.id, n)) ? c.net.d.l2.memberPo.get(ek(dev.id, n))! : n));
  const admin = cfg.mode === 'access' ? 'static access' : cfg.mode;
  const oper = !o || o.mode === 'down' ? 'down' : o.mode === 'access' ? 'static access' : 'trunk';
  const adminEnc = cfg.trunkEncap === 'negotiate' ? 'negotiate' : cfg.trunkEncap;
  const operEnc = oper === 'trunk' ? 'dot1q' : 'native';
  out.push(
    'Switchport: Enabled',
    `Administrative Mode: ${admin}`,
    `Operational Mode: ${oper}`,
    `Administrative Trunking Encapsulation: ${adminEnc}`,
    `Operational Trunking Encapsulation: ${operEnc}`,
    `Negotiation of Trunking: ${cfg.mode === 'access' || cfg.nonegotiate ? 'Off' : 'On'}`,
    `Access Mode VLAN: ${vlanLabel(dev, cfg.accessVlan)}`,
    `Trunking Native Mode VLAN: ${vlanLabel(dev, cfg.nativeVlan)}`,
    'Administrative Native VLAN tagging: enabled',
    `Voice VLAN: ${cfg.voiceVlan !== undefined ? vlanLabel(dev, cfg.voiceVlan) : 'none'}`,
    'Administrative private-vlan host-association: none ',
    'Administrative private-vlan mapping: none ',
    'Administrative private-vlan trunk native VLAN: none',
    'Administrative private-vlan trunk Native VLAN tagging: enabled',
    'Administrative private-vlan trunk encapsulation: dot1q',
    'Administrative private-vlan trunk normal VLANs: none',
    'Administrative private-vlan trunk associations: none',
    'Administrative private-vlan trunk mappings: none',
    'Operational private-vlan: none',
    `Trunking VLANs Enabled: ${cfg.allowed.length === 1 && cfg.allowed[0][0] === 1 && cfg.allowed[0][1] === 4094 ? 'ALL' : cfg.allowed.length ? rangesStr(cfg.allowed) : 'NONE'}`,
    'Pruning VLANs Enabled: 2-1001',
    'Capture Mode Disabled',
    'Capture VLANs Allowed: ALL',
    '',
    'Protected: false',
    'Unknown unicast blocked: disabled',
    'Unknown multicast blocked: disabled',
    'Appliance trust: none',
  );
  return out;
}

export function showIntSwitchport(c: Ctx): void {
  if (noSwitch(c)) return;
  const names = c.a.ifn ? [c.a.ifn as string] : ifNames(c.dev).filter((n) => isPhysical(c.dev, n) || n.startsWith('Port-channel'));
  names.forEach((n, i) => {
    if (i) c.out.push('');
    c.out.push(...switchportBlock(c, n));
  });
}

/* ---------------- MAC address table ---------------- */

const CPU_MACS = ['0100.0ccc.cccc', '0100.0ccc.cccd', '0180.c200.0000', '0180.c200.0001', '0180.c200.0002', '0180.c200.0003', '0180.c200.0004', '0180.c200.0005', '0180.c200.0006', '0180.c200.0007', '0180.c200.0008', '0180.c200.0009', '0180.c200.000a', '0180.c200.000b', '0180.c200.000c', '0180.c200.000d', '0180.c200.000e', '0180.c200.000f', '0180.c200.0010', 'ffff.ffff.ffff'];

export function showMacTable(c: Ctx): void {
  if (noSwitch(c)) return;
  const dev = c.dev;
  const rows: { vlan: number; mac: string; type: string; port: string }[] = [];
  for (const [key, e] of Object.entries(dev.st.dyn.mac)) {
    const [v, mac] = key.split('|');
    const cfg = dev.st.cfg.ifaces[e.port];
    const secure = cfg?.ps.enabled && (cfg.ps.macs.some((m) => m.mac === mac) || (dev.st.dyn.ifd[e.port]?.psLearned ?? []).some((m) => m.mac === mac));
    rows.push({ vlan: Number(v), mac, type: secure ? 'STATIC' : 'DYNAMIC', port: e.port });
  }
  // static secure addresses configured but not yet seen
  for (const [n, cfg] of Object.entries(dev.st.cfg.ifaces)) {
    if (!cfg.ps.enabled) continue;
    for (const m of cfg.ps.macs) if (!rows.some((r) => r.mac === m.mac)) rows.push({ vlan: m.vlan ?? cfg.accessVlan, mac: m.mac, type: 'STATIC', port: n });
  }
  let list = rows;
  if (c.a.dynamic) list = list.filter((r) => r.type === 'DYNAMIC');
  if (c.a.static) list = list.filter((r) => r.type === 'STATIC');
  if (c.a.mif !== undefined) list = list.filter((r) => r.port === c.a.mif);
  if (c.a.mvlan !== undefined) list = list.filter((r) => r.vlan === c.a.mvlan);
  if (c.a.maddr !== undefined) list = list.filter((r) => r.mac === c.a.maddr);
  list.sort((a, b) => a.vlan - b.vlan || a.port.localeCompare(b.port, undefined, { numeric: true }) || a.mac.localeCompare(b.mac));
  c.out.push('          Mac Address Table', '-------------------------------------------', '', 'Vlan    Mac Address       Type        Ports', '----    -----------       --------    -----');
  let count = list.length;
  if (!c.a.dynamic && c.a.mif === undefined && c.a.mvlan === undefined && c.a.maddr === undefined && !dev.hw.iosXe) {
    for (const m of CPU_MACS) c.out.push(` All    ${m}    STATIC      CPU`);
    count += CPU_MACS.length;
  }
  for (const r of list) c.out.push(`${padL(r.vlan, 4)}    ${macDotted(r.mac)}    ${pad(r.type, 12)}${shortIf(r.port)}`);
  c.out.push(`Total Mac Addresses for this criterion: ${count}`);
}

/* ---------------- spanning tree ---------------- */

function roleCode(p: StpPort): string {
  return p.role === 'root' ? 'Root' : p.role === 'designated' ? 'Desg' : p.role === 'alternate' ? 'Altn' : p.role === 'backup' ? 'Back' : 'Disb';
}

function stsCode(p: StpPort): string {
  if (p.inconsistent) return 'BKN*';
  return p.state === 'forwarding' ? 'FWD' : 'BLK';
}

function typeCode(p: StpPort): string {
  let t = p.shared ? 'Shr' : 'P2p';
  if (p.edge) t += ' Edge';
  if (p.inconsistent) t += ` *${p.inconsistent}`;
  return t;
}

function stpInstanceLines(c: Ctx, inst: StpVlan, portFilter?: string): string[] {
  const dev = c.dev;
  const out: string[] = [];
  const proto = dev.st.cfg.stpMode === 'rapid-pvst' ? 'rstp' : dev.st.cfg.stpMode === 'mst' ? 'mstp' : 'ieee';
  out.push(`VLAN${String(inst.vlan).padStart(4, '0')}`, `  Spanning tree enabled protocol ${proto}`);
  out.push(`  Root ID    Priority    ${inst.rootPrio + inst.vlan}`, `             Address     ${macDotted(inst.rootMac)}`);
  if (inst.isRoot) out.push('             This bridge is the root');
  else {
    const num = inst.rootPort ? inst.ports.get(inst.rootPort)!.num : 0;
    out.push(`             Cost        ${inst.rootCost}`, `             Port        ${num} (${inst.rootPort})`);
  }
  out.push('             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec', '');
  out.push(`  Bridge ID  Priority    ${inst.bridgePrio + inst.vlan}  (priority ${inst.bridgePrio} sys-id-ext ${inst.vlan})`, `             Address     ${macDotted(inst.bridgeMac)}`);
  out.push('             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec', '             Aging Time  300 sec', '');
  out.push('Interface           Role Sts Cost      Prio.Nbr Type', '------------------- ---- --- --------- -------- --------------------------------');
  const ports = [...inst.ports.values()].filter((p) => !portFilter || p.port === portFilter).sort((a, b) => a.num - b.num);
  for (const p of ports) out.push(`${pad(shortIf(p.port), 20)}${pad(roleCode(p), 5)}${pad(stsCode(p), 4)}${pad(p.cost, 10)}${pad(`${p.prio}.${p.num}`, 9)}${typeCode(p)}`);
  out.push('');
  return out;
}

function instancesFor(c: Ctx): StpVlan[] {
  const m = c.net.d.l2.stp.get(c.dev.id);
  if (!m) return [];
  return [...m.values()].sort((a, b) => a.vlan - b.vlan);
}

export function showSpanningTree(c: Ctx): void {
  if (c.dev.kind === 'router' && !c.dev.hw.iosXe) {
    c.out.push('No spanning tree instance exists.');
    return;
  }
  let list = instancesFor(c);
  if (c.a.svlan !== undefined) {
    const vl = c.a.svlan as Ranges;
    list = list.filter((i) => rangesHas(vl, i.vlan));
    if (!list.length) {
      c.out.push(`Spanning tree instance(s) for vlan ${rangesStr(vl)} does not exist.`);
      return;
    }
  }
  if (!list.length) {
    c.out.push('No spanning tree instance exists.');
    return;
  }
  if (c.a.root) {
    c.out.push('                                        Root    Hello Max Fwd', 'Vlan                   Root ID          Cost    Time  Age Dly  Root Port', '---------------- -------------------- --------- ----- --- ---  ------------');
    for (const i of list) c.out.push(`${pad(`VLAN${String(i.vlan).padStart(4, '0')}`, 17)}${pad(`${i.rootPrio + i.vlan} ${macDotted(i.rootMac)}`, 21)}${padL(i.rootCost, 9)}${padL(2, 6)}${padL(20, 4)}${padL(15, 4)}  ${i.rootPort ? shortIf(i.rootPort) : ''}`);
    return;
  }
  if (c.a.blocked) {
    c.out.push('', 'Name                 Blocked Interfaces List', '-------------------- ------------------------------------');
    let total = 0;
    for (const i of list) {
      const b = [...i.ports.values()].filter((p) => p.state === 'blocking').map((p) => shortIf(p.port));
      if (b.length) {
        total += b.length;
        c.out.push(`${pad(`VLAN${String(i.vlan).padStart(4, '0')}`, 21)}${b.join(', ')}`);
      }
    }
    c.out.push('', `Number of blocked ports (segments) in the system : ${total}`);
    return;
  }
  for (const i of list) c.out.push('', ...stpInstanceLines(c, i));
}

export function showStpSummary(c: Ctx): void {
  const dev = c.dev;
  const cfg = dev.st.cfg;
  const list = instancesFor(c);
  const rootFor = list.filter((i) => i.isRoot).map((i) => `VLAN${String(i.vlan).padStart(4, '0')}`);
  c.out.push(
    `Switch is in ${cfg.stpMode} mode`,
    `Root bridge for: ${rootFor.length ? rootFor.join(', ') : 'none'}`,
    'Extended system ID                      is enabled',
    `Portfast Default                        is ${cfg.stpPortfastDefault ? 'enabled' : 'disabled'}`,
    `PortFast BPDU Guard Default             is ${cfg.stpBpduguardDefault ? 'enabled' : 'disabled'}`,
    `Portfast BPDU Filter Default            is ${cfg.stpBpdufilterDefault ? 'enabled' : 'disabled'}`,
    `Loopguard Default                       is ${cfg.stpLoopguardDefault ? 'enabled' : 'disabled'}`,
    'EtherChannel misconfig guard            is enabled',
    'UplinkFast                              is disabled',
    'BackboneFast                            is disabled',
    'Configured Pathcost method used is short',
    '',
    'Name                   Blocking Listening Learning Forwarding STP Active',
    '---------------------- -------- --------- -------- ---------- ----------',
  );
  let tb = 0;
  let tf = 0;
  for (const i of list) {
    const b = [...i.ports.values()].filter((p) => p.state === 'blocking').length;
    const f = i.ports.size - b;
    tb += b;
    tf += f;
    c.out.push(`${pad(`VLAN${String(i.vlan).padStart(4, '0')}`, 23)}${padL(b, 8)}${padL(0, 10)}${padL(0, 9)}${padL(f, 11)}${padL(b + f, 11)}`);
  }
  c.out.push('---------------------- -------- --------- -------- ---------- ----------', `${pad(`${list.length} vlan${list.length === 1 ? '' : 's'}`, 23)}${padL(tb, 8)}${padL(0, 10)}${padL(0, 9)}${padL(tf, 11)}${padL(tb + tf, 11)}`);
}

export function showStpInterface(c: Ctx): void {
  const n = c.a.ifn as string;
  const list = instancesFor(c).filter((i) => i.ports.has(n));
  if (!list.length) {
    c.out.push(`no spanning tree info available for ${n}`);
    return;
  }
  if (c.a.detail) {
    for (const i of list) {
      const p = i.ports.get(n)!;
      const stateWord = p.state === 'forwarding' ? 'forwarding' : 'blocking';
      const roleWord = p.role === 'root' ? 'root' : p.role === 'designated' ? 'designated' : p.role === 'alternate' ? 'alternate' : 'backup';
      const cfg = c.dev.st.cfg.ifaces[n];
      c.out.push(
        ` Port ${p.num} (${n}) of VLAN${String(i.vlan).padStart(4, '0')} is ${roleWord} ${stateWord} `,
        `   Port path cost ${p.cost}, Port priority ${p.prio}, Port Identifier ${p.prio}.${p.num}.`,
        `   Designated root has priority ${i.rootPrio + i.vlan}, address ${macDotted(i.rootMac)}`,
        `   Designated bridge has priority ${p.role === 'designated' ? i.bridgePrio + i.vlan : i.rootPrio + i.vlan}, address ${macDotted(p.role === 'designated' ? i.bridgeMac : i.rootMac)}`,
        `   Designated port id is ${p.prio}.${p.num}, designated path cost ${p.role === 'designated' ? i.rootCost : Math.max(0, i.rootCost - p.cost)}`,
        '   Timers: message age 0, forward delay 0, hold 0',
        `   Number of transitions to forwarding state: ${p.state === 'forwarding' ? 1 : 0}`,
        ...(p.edge ? ['   The port is in the portfast mode'] : []),
        `   Link type is ${p.shared ? 'shared' : 'point-to-point'} by default`,
        ...(cfg?.stp.bpduguard === 'enable' ? ['   Bpdu guard is enabled'] : []),
        ...(cfg?.stp.guard === 'root' ? ['   Root guard is enabled on the port'] : []),
        `   BPDU: sent ${p.role === 'designated' ? 212 : 3}, received ${p.role === 'designated' ? 0 : 211}`,
        '',
      );
    }
    return;
  }
  c.out.push('Vlan                Role Sts Cost      Prio.Nbr Type', '------------------- ---- --- --------- -------- --------------------------------');
  for (const i of list) {
    const p = i.ports.get(n)!;
    c.out.push(`${pad(`VLAN${String(i.vlan).padStart(4, '0')}`, 20)}${pad(roleCode(p), 5)}${pad(stsCode(p), 4)}${pad(p.cost, 10)}${pad(`${p.prio}.${p.num}`, 9)}${typeCode(p)}`);
  }
}

/* ---------------- EtherChannel ---------------- */

export function showEtherSummary(c: Ctx): void {
  const dev = c.dev;
  const d = c.net.d;
  const bundles = [...d.l2.bundles.values()].filter((b) => b.dev === dev.id).sort((a, b) => a.group - b.group);
  c.out.push(
    'Flags:  D - down        P - bundled in port-channel',
    '        I - stand-alone s - suspended',
    '        H - Hot-standby (LACP only)',
    '        R - Layer3      S - Layer2',
    '        U - in use      f - failed to allocate aggregator',
    '',
    '        M - not in use, minimum links not met',
    '        u - unsuitable for bundling',
    '        w - waiting to be aggregated',
    '        d - default port',
    '',
    '',
    `Number of channel-groups in use: ${bundles.length}`,
    `Number of aggregators:           ${bundles.length}`,
    '',
    'Group  Port-channel  Protocol    Ports',
    '------+-------------+-----------+-----------------------------------------------',
  );
  for (const b of bundles) {
    const pocfg = dev.st.cfg.ifaces[b.po];
    const flags = `${pocfg && !pocfg.sw ? 'R' : 'S'}${b.up ? 'U' : 'D'}`;
    const ports = b.members.map((m) => `${shortIf(m.ifName)}(${m.flag})`);
    c.out.push(`${pad(b.group, 7)}${pad(`Po${b.group}(${flags})`, 16)}${pad(b.proto, 10)}${ports.map((p) => pad(p, 12)).join('')}`);
  }
}

export function showEtherPortChannel(c: Ctx): void {
  const dev = c.dev;
  const d = c.net.d;
  const bundles = [...d.l2.bundles.values()].filter((b) => b.dev === dev.id).sort((a, b) => a.group - b.group);
  c.out.push('\t\tChannel-group listing: ', '\t\t----------------------', '');
  for (const b of bundles) {
    const members = b.members.filter((m) => m.flag === 'P');
    c.out.push(
      `Group: ${b.group} `,
      '----------',
      '\t\t\t\tPort-channels in the group: ',
      '\t\t\t\t---------------------------',
      '',
      `Port-channel: Po${b.group}${b.proto === 'LACP' ? '    (Primary Aggregator)' : ''}`,
      '',
      '------------',
      '',
      `Age of the Port-channel   = 0d:${hms(c.net.clock / 1000).replace(/:/, 'h:').replace(/:/, 'm:')}s`,
      `Logical slot/port   = 2/${b.group}          Number of ports = ${members.length}`,
      'HotStandBy port = null ',
      `Port state          = Port-channel ${b.up ? 'Ag-Inuse' : 'Ag-Not-Inuse'} `,
      `Protocol            =   ${b.proto}`,
      'Port security       = Disabled',
      '',
      'Ports in the Port-channel: ',
      '',
      'Index   Load   Port     EC state        No of bits',
      '------+------+------+------------------+-----------',
    );
    members.forEach((m, i) => {
      const st = m.mode === 'active' ? 'Active' : m.mode === 'passive' ? 'Passive' : m.mode === 'desirable' ? 'Desirable-Sl' : m.mode === 'auto' ? 'Automatic-Sl' : 'On';
      c.out.push(`  ${pad(i, 6)}${pad('00', 7)}${pad(shortIf(m.ifName), 9)}${pad(st, 19)}0`);
    });
    c.out.push('');
  }
}

/* ---------------- CDP / LLDP ---------------- */

interface Nbr {
  local: string;
  dev: IosDevice;
  port: string;
}

function neighbors(c: Ctx, proto: 'cdp' | 'lldp'): Nbr[] {
  const dev = c.dev;
  const d = c.net.d;
  const out: Nbr[] = [];
  for (const p of dev.hw.ifaces) {
    const st = d.l2.ifs.get(ek(dev.id, p.name));
    if (!st || st.line !== 'up') continue;
    const cfg = dev.st.cfg.ifaces[p.name];
    if (proto === 'cdp' && !cfg.cdp) continue;
    if (proto === 'lldp' && !cfg.lldpRx) continue;
    const peer = c.net.peerOf(dev.id, p.name);
    if (!peer) continue;
    const pdev = c.net.ios(peer.dev);
    if (!pdev) continue;
    const pc = pdev.st.cfg.ifaces[peer.ifName];
    if (proto === 'cdp' && (!pdev.st.cfg.cdp || !pc?.cdp)) continue;
    if (proto === 'lldp' && (!pdev.st.cfg.lldp || !pc?.lldpTx)) continue;
    out.push({ local: p.name, dev: pdev, port: peer.ifName });
  }
  return out;
}

function devId(n: IosDevice): string {
  return n.st.cfg.domainName ? `${n.st.cfg.hostname}.${n.st.cfg.domainName}` : n.st.cfg.hostname;
}

export function showCdp(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  if (!cfg.cdp) {
    c.out.push('% CDP is not enabled');
    return;
  }
  c.out.push('Global CDP information:', `\tSending CDP packets every ${cfg.cdpTimer} seconds`, `\tSending a holdtime value of ${cfg.cdpHold} seconds`, '\tSending CDPv2 advertisements is  enabled');
}

export function showCdpNeighbors(c: Ctx): void {
  if (!c.dev.st.cfg.cdp) {
    c.out.push('% CDP is not enabled');
    return;
  }
  const nbrs = neighbors(c, 'cdp').filter((n) => !c.a.ifn || n.local === c.a.ifn);
  if (c.a.detail) {
    for (const n of nbrs) {
      const a4 = [...c.net.d.addrs.entries()].find(([k2]) => k2.startsWith(n.dev.id + '|') && k2.endsWith(n.port))?.[1]?.[0] ?? [...c.net.d.addrs.entries()].find(([k2]) => k2.startsWith(n.dev.id + '|'))?.[1]?.[0];
      const hold = n.dev.st.cfg.cdpHold - (Math.floor(c.net.clock / 1000) % 60);
      const pc = n.dev.st.cfg.ifaces[n.port];
      c.out.push('-------------------------', `Device ID: ${devId(n.dev)}`, 'Entry address(es): ');
      if (a4) c.out.push(`  IP address: ${ipStr(a4.ip)}`);
      c.out.push(`Platform: cisco ${n.dev.hw.platform},  Capabilities: ${n.dev.hw.cdpCapsLong} `, `Interface: ${n.local},  Port ID (outgoing port): ${n.port}`, `Holdtime : ${hold} sec`, '', 'Version :');
      const s: string[] = [];
      const fake = { ...c, out: s, dev: n.dev } as Ctx;
      void fake;
      c.out.push(n.dev.hw.iosXe ? `Cisco IOS Software [${n.dev.model === 'isr4321' ? 'Fuji' : 'Denali'}], ${n.dev.model === 'isr4321' ? 'ISR Software (X86_64_LINUX_IOSD-UNIVERSALK9-M)' : 'Catalyst L3 Switch Software (CAT3K_CAA-UNIVERSALK9-M)'}, Version ${n.dev.hw.version}, RELEASE SOFTWARE (fc2)` : `Cisco IOS Software, ${n.dev.model === 'c2960' ? 'C2960 Software (C2960-LANBASEK9-M)' : 'C2900 Software (C2900-UNIVERSALK9-M)'}, Version ${n.dev.hw.version}, RELEASE SOFTWARE (fc1)`);
      c.out.push('Technical Support: http://www.cisco.com/techsupport', 'Copyright (c) 1986-2019 by Cisco Systems, Inc.', '', 'advertisement version: 2');
      if (n.dev.kind !== 'router') c.out.push(`VTP Management Domain: '${n.dev.st.cfg.vtp.domain ?? ''}'`, `Native VLAN: ${pc?.nativeVlan ?? 1}`);
      c.out.push(`Duplex: ${c.net.d.l2.l1.get(ek(n.dev.id, n.port))?.duplex ?? 'full'}`, 'Management address(es): ');
      if (a4) c.out.push(`  IP address: ${ipStr(a4.ip)}`);
      c.out.push('');
    }
    c.out.push(`Total cdp entries displayed : ${nbrs.length}`);
    return;
  }
  c.out.push(
    'Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge',
    '                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone, ',
    '                  D - Remote, C - CVTA, M - Two-port Mac Relay ',
    '',
    'Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID',
  );
  for (const n of nbrs) {
    const id = devId(n.dev);
    const hold = String(n.dev.st.cfg.cdpHold - (Math.floor(c.net.clock / 1000) % 60));
    const rest = `${pad(cdpIf(n.local), 18)}${pad(hold, 3)}${padL(n.dev.hw.cdpCaps, 19)} ${pad(n.dev.hw.cdpPlatform.slice(0, 9), 9)} ${cdpIf(n.port)}`;
    if (id.length > 16) c.out.push(id, `${' '.repeat(17)}${rest}`);
    else c.out.push(`${pad(id, 17)}${rest}`);
  }
  c.out.push('', `Total cdp entries displayed : ${nbrs.length}`);
}

export function showCdpInterface(c: Ctx): void {
  if (!c.dev.st.cfg.cdp) {
    c.out.push('% CDP is not enabled');
    return;
  }
  for (const p of c.dev.hw.ifaces) {
    const cfg = c.dev.st.cfg.ifaces[p.name];
    if (!cfg.cdp) continue;
    const st = c.net.d.l2.ifs.get(ek(c.dev.id, p.name));
    c.out.push(`${p.name} is ${st?.line === 'admin-down' ? 'administratively down' : st?.line ?? 'down'}, line protocol is ${st?.proto ?? 'down'}`, '  Encapsulation ARPA', `  Sending CDP packets every ${c.dev.st.cfg.cdpTimer} seconds`, `  Holdtime is ${c.dev.st.cfg.cdpHold} seconds`);
  }
}

export function showLldp(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  if (!cfg.lldp) {
    c.out.push('% LLDP is not enabled');
    return;
  }
  c.out.push('', 'Global LLDP Information:', '    Status: ACTIVE', `    LLDP advertisements are sent every ${cfg.lldpTimer} seconds`, `    LLDP hold time advertised is ${cfg.lldpHold} seconds`, '    LLDP interface reinitialisation delay is 2 seconds');
}

export function showLldpNeighbors(c: Ctx): void {
  if (!c.dev.st.cfg.lldp) {
    c.out.push('% LLDP is not enabled');
    return;
  }
  const nbrs = neighbors(c, 'lldp');
  if (c.a.detail) {
    for (const n of nbrs) {
      const a4 = [...c.net.d.addrs.entries()].find(([k2]) => k2.startsWith(n.dev.id + '|'))?.[1]?.[0];
      c.out.push('------------------------------------------------', `Local Intf: ${shortIf(n.local)}`, `Chassis id: ${macDotted(n.dev.mac)}`, `Port id: ${shortIf(n.port)}`, `Port Description: ${n.dev.st.cfg.ifaces[n.port]?.description ?? n.port}`, `System Name: ${devId(n.dev)}`, '', 'System Description: ', `Cisco IOS Software, Version ${n.dev.hw.version}`, '', `Time remaining: ${n.dev.st.cfg.lldpHold - 10} seconds`, `System Capabilities: ${n.dev.kind === 'router' ? 'B,R' : n.dev.kind === 'l3switch' ? 'B,R' : 'B'}`, `Enabled Capabilities: ${n.dev.hw.lldpCaps}`, 'Management Addresses:', `    IP: ${a4 ? ipStr(a4.ip) : 'not advertised'}`, 'Auto Negotiation - supported, enabled', '', '');
    }
    c.out.push(`Total entries displayed: ${nbrs.length}`);
    return;
  }
  c.out.push('Capability codes:', '    (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device', '    (W) WLAN Access Point, (P) Repeater, (S) Station, (O) Other', '', 'Device ID           Local Intf     Hold-time  Capability      Port ID');
  for (const n of nbrs) c.out.push(`${pad(devId(n.dev).slice(0, 20), 20)}${pad(shortIf(n.local), 15)}${pad(n.dev.st.cfg.lldpHold, 11)}${pad(n.dev.hw.lldpCaps, 16)}${shortIf(n.port)}`);
  c.out.push('', `Total entries displayed: ${nbrs.length}`);
}

/* ---------------- port security ---------------- */

export function showPortSecurity(c: Ctx): void {
  if (noSwitch(c)) return;
  const dev = c.dev;
  if (c.a.ifn) {
    const n = c.a.ifn as string;
    const cfg = dev.st.cfg.ifaces[n];
    const dd = dev.st.dyn.ifd[n];
    const st = c.net.d.l2.ifs.get(ek(dev.id, n));
    const total = cfg.ps.macs.length + (dd?.psLearned.length ?? 0);
    const status = !cfg.ps.enabled ? 'Secure-down' : st?.errdis ? 'Secure-shutdown' : st?.line === 'up' ? 'Secure-up' : 'Secure-down';
    const mode = cfg.ps.violation ?? 'shutdown';
    c.out.push(
      `Port Security              : ${cfg.ps.enabled ? 'Enabled' : 'Disabled'}`,
      `Port Status                : ${status}`,
      `Violation Mode             : ${mode[0].toUpperCase()}${mode.slice(1)}`,
      `Aging Time                 : ${cfg.ps.aging ?? 0} mins`,
      'Aging Type                 : Absolute',
      'SecureStatic Address Aging : Disabled',
      `Maximum MAC Addresses      : ${cfg.ps.max ?? 1}`,
      `Total MAC Addresses        : ${total}`,
      `Configured MAC Addresses   : ${cfg.ps.macs.filter((m) => !m.sticky).length}`,
      `Sticky MAC Addresses       : ${cfg.ps.macs.filter((m) => m.sticky).length}`,
      `Last Source Address:Vlan   : ${dd?.psLast ?? '0000.0000.0000:0'}`,
      `Security Violation Count   : ${dd?.psViolations ?? 0}`,
    );
    return;
  }
  if (c.a.address) {
    c.out.push('               Secure Mac Address Table', '-----------------------------------------------------------------------------', 'Vlan    Mac Address       Type                          Ports   Remaining Age', '                                                                   (mins)', '----    -----------       ----                          -----   -------------');
    let n = 0;
    for (const [name, cfg] of Object.entries(dev.st.cfg.ifaces)) {
      if (!cfg.ps.enabled) continue;
      for (const m of cfg.ps.macs) {
        n++;
        c.out.push(`${padL(m.vlan ?? cfg.accessVlan, 4)}    ${macDotted(m.mac)}    ${pad(m.sticky ? 'SecureSticky' : 'SecureConfigured', 30)}${pad(shortIf(name), 8)}    -`);
      }
      for (const m of dev.st.dyn.ifd[name]?.psLearned ?? []) {
        n++;
        c.out.push(`${padL(m.vlan, 4)}    ${macDotted(m.mac)}    ${pad('SecureDynamic', 30)}${pad(shortIf(name), 8)}    -`);
      }
    }
    c.out.push('-----------------------------------------------------------------------------', `Total Addresses in System (excluding one mac per port)     : ${Math.max(0, n - 1)}`, 'Max Addresses limit in System (excluding one mac per port) : 8192');
    return;
  }
  c.out.push('Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action', '                (Count)       (Count)          (Count)', '---------------------------------------------------------------------------');
  let extra = 0;
  for (const n of ifNames(dev)) {
    const cfg = dev.st.cfg.ifaces[n];
    if (!cfg.ps.enabled) continue;
    const dd = dev.st.dyn.ifd[n];
    const cur = cfg.ps.macs.length + (dd?.psLearned.length ?? 0);
    extra += Math.max(0, cur - 1);
    const mode = cfg.ps.violation ?? 'shutdown';
    c.out.push(`${padL(shortIf(n), 11)}${padL(cfg.ps.max ?? 1, 15)}${padL(cur, 13)}${padL(dd?.psViolations ?? 0, 19)}${padL(mode[0].toUpperCase() + mode.slice(1), 17)}`);
  }
  c.out.push('---------------------------------------------------------------------------', `Total Addresses in System (excluding one mac per port)     : ${extra}`, 'Max Addresses limit in System (excluding one mac per port) : 8192');
}

/* ---------------- DHCP snooping, VTP, errdisable, PoE ---------------- */

export function showDhcpSnooping(c: Ctx): void {
  if (noSwitch(c)) return;
  const cfg = c.dev.st.cfg;
  if (c.a.binding) {
    c.out.push('MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface', '------------------  ---------------  ----------  -------------  ----  --------------------');
    for (const b of c.dev.st.dyn.snoopBind) c.out.push(`${pad(macColon(b.mac), 20)}${pad(ipStr(b.ip), 17)}${pad(b.lease, 12)}${pad('dhcp-snooping', 15)}${pad(b.vlan, 6)}${b.ifName}`);
    c.out.push(`Total number of bindings: ${c.dev.st.dyn.snoopBind.length}`, '');
    return;
  }
  const oper = cfg.snoop ? cfg.snoopVlans.filter(([a, b]) => { for (let v = a; v <= b; v++) if (vlanExists(c.dev, v)) return true; return false; }) : [];
  c.out.push(
    `Switch DHCP snooping is ${cfg.snoop ? 'enabled' : 'disabled'}`,
    'Switch DHCP gleaning is disabled',
    'DHCP snooping is configured on following VLANs:',
    cfg.snoopVlans.length ? rangesStr(cfg.snoopVlans) : 'none',
    'DHCP snooping is operational on following VLANs:',
    oper.length ? rangesStr(oper) : 'none',
    'DHCP snooping is configured on the following L3 Interfaces:',
    '',
    `Insertion of option 82 is ${cfg.snoopOpt82 ? 'enabled' : 'disabled'}`,
    '   circuit-id default format: vlan-mod-port',
    `   remote-id: ${macDotted(c.dev.mac)} (MAC)`,
    'Option 82 on untrusted port is not allowed',
    'Verification of hwaddr field is enabled',
    'Verification of giaddr field is enabled',
    'DHCP snooping trust/rate is configured on the following Interfaces:',
    '',
    'Interface                  Trusted    Allow option    Rate limit (pps)',
    '-----------------------    -------    ------------    ----------------   ',
  );
  for (const n of ifNames(c.dev)) {
    const ic = cfg.ifaces[n];
    if (!ic.snoopTrust && ic.snoopRate === undefined) continue;
    c.out.push(`${pad(n, 27)}${pad(ic.snoopTrust ? 'yes' : 'no', 11)}${pad(ic.snoopTrust ? 'yes' : 'no', 16)}${ic.snoopRate ?? 'unlimited'}`, '  Custom circuit-ids:');
  }
}

export function showVtpStatus(c: Ctx): void {
  if (noSwitch(c)) return;
  const v = c.dev.st.cfg.vtp;
  const n = Object.keys(c.dev.st.vlans).length;
  c.out.push(
    'VTP Version capable             : 1 to 3',
    `VTP version running             : ${v.version}`,
    `VTP Domain Name                 : ${v.domain ?? ''}`,
    'VTP Pruning Mode                : Disabled',
    'VTP Traps Generation            : Disabled',
    `Device ID                       : ${macDotted(c.dev.mac)}`,
    'Configuration last modified by 0.0.0.0 at 3-1-93 00:00:00',
    v.mode === 'server' ? 'Local updater ID is 0.0.0.0 (no valid interface found)' : '',
    '',
    'Feature VLAN:',
    '--------------',
    `VTP Operating Mode                : ${v.mode[0].toUpperCase()}${v.mode.slice(1)}`,
    'Maximum VLANs supported locally   : 255',
    `Number of existing VLANs          : ${n}`,
    `Configuration Revision            : ${v.mode === 'transparent' || v.mode === 'off' ? 0 : Math.max(0, n - 5)}`,
    'MD5 digest                        : 0x57 0xCD 0x40 0x65 0x63 0x59 0x47 0xBD ',
    '                                    0x56 0x9D 0x4A 0x3E 0xA5 0x69 0x35 0xBC ',
  );
}

export function showErrdisableRecovery(c: Ctx): void {
  const cfg = c.dev.st.cfg;
  const causes = ['arp-inspection', 'bpduguard', 'channel-misconfig (STP)', 'dhcp-rate-limit', 'link-flap', 'loopback', 'psecure-violation', 'security-violation', 'storm-control', 'udld'];
  c.out.push('ErrDisable Reason            Timer Status', '-----------------            --------------');
  for (const x of causes) {
    const on = cfg.errRecovery.includes('all') || cfg.errRecovery.includes(x.split(' ')[0]);
    c.out.push(`${pad(x, 29)}${on ? 'Enabled' : 'Disabled'}`);
  }
  c.out.push('', `Timer interval: ${cfg.errInterval ?? 300} seconds`, '', 'Interfaces that will be enabled at the next timeout:', '');
  const rows: string[] = [];
  for (const [n, dd] of Object.entries(c.dev.st.dyn.ifd)) {
    if (!dd.errDisabled) continue;
    const on = cfg.errRecovery.includes('all') || cfg.errRecovery.includes(dd.errDisabled);
    if (on) rows.push(`${pad(shortIf(n), 16)}${padL(dd.errDisabled, 20)}${padL(cfg.errInterval ?? 300, 13)}`);
  }
  if (rows.length) c.out.push('Interface       Errdisable reason       Time left(sec)', '---------       -----------------       --------------', ...rows);
}

export function showPowerInline(c: Ctx): void {
  if (noSwitch(c)) return;
  const poe = c.dev.model === 'c3650';
  c.out.push('Module   Available     Used     Remaining', '          (Watts)     (Watts)    (Watts) ', '------   ---------   --------   ---------', `1        ${padL(poe ? '390.0' : '0.0', 9)}   ${padL('0.0', 8)}   ${padL(poe ? '390.0' : '0.0', 9)}`);
  c.out.push('Interface Admin  Oper       Power   Device              Class Max', '                            (Watts)                            ', '--------- ------ ---------- ------- ------------------- ----- ----');
  for (const p of c.dev.hw.ifaces) {
    const cfg = c.dev.st.cfg.ifaces[p.name];
    c.out.push(`${pad(shortIf(p.name), 10)}${pad(cfg.poe, 7)}${pad(poe && cfg.poe !== 'never' ? 'off' : 'off', 11)}${pad('0.0', 8)}${pad('n/a', 20)}${pad('n/a', 6)}${poe ? '30.0' : '15.4'} `);
  }
}

export { portCarries, ifMac };
