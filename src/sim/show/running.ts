/** `show running-config` generator: IOS ordering, defaults omitted, password encodings. */
import type { Net } from '../engine/net';
import { ifConfigOrder, isPhysical } from '../engine/topo';
import type { Acl, AclAddr, AclEntry, IfCfg, IosDevice, LineCfg, PortMatch, Pw } from '../model/state';
import { typeOfName } from '../model/ifname';
import { iosClock, rangesStr, rangesEqual } from '../util/format';
import { ipStr, maskLen } from '../util/ip';
import { parseV6, v6Ios } from '../util/ipv6';
import { macDotted } from '../util/mac';
import { type7Encode } from '../util/crypto';
import { portName } from '../engine/acl';

function pw(p: Pw): string {
  return p.enc ? `7 ${type7Encode(p.plain)}` : p.plain;
}

function secretType(hash: string): string {
  if (hash.startsWith('$1$')) return '5';
  if (hash.startsWith('$8$')) return '8';
  return '9';
}

export function v6Disp(addr: string): string {
  const v = parseV6(addr);
  return v === null ? addr.toUpperCase() : v6Ios(v);
}

/* ---------------- ACL text ---------------- */

function addrText(a: AclAddr | undefined, std: boolean): string {
  if (!a || a.any) return 'any';
  if (a.wc === 0) return std ? ipStr(a.addr) : `host ${ipStr(a.addr)}`;
  return `${ipStr(a.addr)} ${ipStr(a.wc)}`;
}

function portText(proto: string, m: PortMatch | undefined): string {
  if (!m) return '';
  const names = m.ports.map((p) => portName(proto, p));
  return ` ${m.op} ${names.join(' ')}`;
}

/** Entry text as shown in running-config (after "permit"/"deny"). */
export function aclEntryText(acl: Acl, e: AclEntry): string {
  if (e.action === 'remark') return `remark ${e.remark ?? ''}`;
  if (acl.kind === 'standard') return `${e.action} ${addrText(e.src, true)}${e.log ? ' log' : ''}`;
  const proto = e.proto ?? 'ip';
  let s = `${e.action} ${proto} ${addrText(e.src, false)}${portText(proto, e.sport)} ${addrText(e.dst, false)}${portText(proto, e.dport)}`;
  if (e.icmp) s += ` ${e.icmp}`;
  if (e.established) s += ' established';
  if (e.log) s += ' log';
  return s;
}

/** Entry text as shown by `show access-lists`. */
export function aclShowText(acl: Acl, e: AclEntry): string {
  if (acl.kind === 'standard') {
    let t: string;
    if (!e.src || e.src.any) t = 'any';
    else if (e.src.wc === 0) t = ipStr(e.src.addr);
    else t = `${ipStr(e.src.addr)}, wildcard bits ${ipStr(e.src.wc)}`;
    const act = e.action === 'deny' ? 'deny  ' : 'permit';
    return `${act} ${t}${e.log ? ' log' : ''}`;
  }
  return aclEntryText(acl, e);
}

function numberedAclLines(acl: Acl): string[] {
  return acl.entries.map((e) => `access-list ${acl.name} ${aclEntryText(acl, e)}`);
}

/* ---------------- interfaces ---------------- */

function ospfIfLines(c: IfCfg, v6: boolean): string[] {
  const o = v6 ? c.ospf6 : c.ospf;
  const pre = v6 ? 'ipv6 ospf' : 'ip ospf';
  const out: string[] = [];
  if (o.net) out.push(` ${pre} network ${o.net}`);
  if (o.cost !== undefined) out.push(` ${pre} cost ${o.cost}`);
  if (o.priority !== undefined) out.push(` ${pre} priority ${o.priority}`);
  if (o.hello !== undefined) out.push(` ${pre} hello-interval ${o.hello}`);
  if (o.dead !== undefined) out.push(` ${pre} dead-interval ${o.dead}`);
  if (o.mtuIgnore) out.push(` ${pre} mtu-ignore`);
  for (const x of o.extra ?? []) out.push(` ${x}`);
  if (o.pid !== undefined && o.area !== undefined) out.push(` ${pre} ${o.pid} area ${o.area}`);
  return out;
}

function switchportLines(dev: IosDevice, c: IfCfg): string[] {
  const out: string[] = [];
  if (!c.sw) return out;
  if (dev.model === 'c3650' && c.trunkEncap === 'dot1q') out.push(' switchport trunk encapsulation dot1q');
  if (c.trunkEncap === 'isl') out.push(' switchport trunk encapsulation isl');
  if (c.nativeVlan !== 1) out.push(` switchport trunk native vlan ${c.nativeVlan}`);
  if (!rangesEqual(c.allowed, [[1, 4094]])) out.push(` switchport trunk allowed vlan ${c.allowed.length ? rangesStr(c.allowed) : 'none'}`);
  if (c.accessVlan !== 1) out.push(` switchport access vlan ${c.accessVlan}`);
  if (c.mode !== 'dynamic auto') out.push(` switchport mode ${c.mode}`);
  if (c.nonegotiate) out.push(' switchport nonegotiate');
  if (c.voiceVlan !== undefined) out.push(` switchport voice vlan ${c.voiceVlan}`);
  const ps = c.ps;
  if (ps.max !== undefined) out.push(` switchport port-security maximum ${ps.max}`);
  if (ps.violation && ps.violation !== 'shutdown') out.push(` switchport port-security violation ${ps.violation}`);
  if (ps.aging !== undefined) out.push(` switchport port-security aging time ${ps.aging}`);
  if (ps.sticky) out.push(' switchport port-security mac-address sticky');
  for (const m of ps.macs) out.push(` switchport port-security mac-address ${m.sticky ? 'sticky ' : ''}${macDotted(m.mac)}${m.vlan !== undefined && m.sticky && c.mode === 'trunk' ? ` vlan ${m.vlan}` : ''}`);
  if (ps.enabled) out.push(' switchport port-security');
  return out;
}

function stpLines(c: IfCfg): string[] {
  const out: string[] = [];
  const s = c.stp;
  if (s.link) out.push(` spanning-tree link-type ${s.link}`);
  if (s.portfast === 'edge') out.push(' spanning-tree portfast');
  if (s.portfast === 'trunk') out.push(' spanning-tree portfast trunk');
  if (s.portfast === 'disable') out.push(' spanning-tree portfast disable');
  if (s.bpdufilter) out.push(` spanning-tree bpdufilter ${s.bpdufilter}`);
  if (s.bpduguard) out.push(` spanning-tree bpduguard ${s.bpduguard}`);
  if (s.guard) out.push(` spanning-tree guard ${s.guard}`);
  if (s.cost !== undefined) out.push(` spanning-tree cost ${s.cost}`);
  if (s.prio !== undefined) out.push(` spanning-tree port-priority ${s.prio}`);
  for (const [v, cost] of Object.entries(s.vlanCost)) out.push(` spanning-tree vlan ${v} cost ${cost}`);
  for (const [v, p] of Object.entries(s.vlanPrio)) out.push(` spanning-tree vlan ${v} port-priority ${p}`);
  return out;
}

export function interfaceLines(dev: IosDevice, name: string): string[] {
  const c = dev.st.cfg.ifaces[name];
  const out = [`interface ${name}`];
  if (!c) return out;
  const t = typeOfName(name)?.name;
  const phys = isPhysical(dev, name);
  const router = dev.kind === 'router';
  const l2 = c.sw;
  if (c.description) out.push(` description ${c.description}`);
  if (c.bandwidth !== undefined) out.push(` bandwidth ${c.bandwidth}`);
  if (c.delay !== undefined) out.push(` delay ${c.delay}`);
  if (c.dot1q) out.push(` encapsulation dot1Q ${c.dot1q.vlan}${c.dot1q.native ? ' native' : ''}`);
  if (l2) out.push(...switchportLines(dev, c));
  if (!l2 && !router && (phys || t === 'Port-channel')) out.push(' no switchport');
  if (!l2) {
    if (c.ip) {
      out.push(` ip address ${ipStr(c.ip.ip)} ${ipStr(c.ip.mask)}`);
      for (const sec of c.secondary) out.push(` ip address ${ipStr(sec.ip)} ${ipStr(sec.mask)} secondary`);
    } else if (c.dhcp) out.push(' ip address dhcp');
    else if (c.unnumbered) out.push(` ip unnumbered ${c.unnumbered}`);
    else out.push(' no ip address');
    for (const h of c.helpers) out.push(` ip helper-address ${ipStr(h)}`);
    if (!c.redirects) out.push(' no ip redirects');
    if (!c.proxyArp) out.push(' no ip proxy-arp');
    if (c.ipMtu !== undefined) out.push(` ip mtu ${c.ipMtu}`);
    if (c.aclIn) out.push(` ip access-group ${c.aclIn} in`);
    if (c.aclOut) out.push(` ip access-group ${c.aclOut} out`);
    if (c.nat) out.push(` ip nat ${c.nat}`);
    out.push(...ospfIfLines(c, false));
    if (c.hsrpVer === 2) out.push(' standby version 2');
    for (const [g, h] of Object.entries(c.hsrp)) {
      const gp = g === '0' ? '' : `${g} `;
      if (h.ip !== undefined) out.push(` standby ${gp}ip ${ipStr(h.ip)}`);
      else out.push(` standby ${gp}ip`);
      if (h.priority !== undefined) out.push(` standby ${gp}priority ${h.priority}`);
      if (h.preempt) out.push(` standby ${gp}preempt`);
      if (h.name) out.push(` standby ${gp}name ${h.name}`);
    }
  }
  if (c.snoopRate !== undefined) out.push(` ip dhcp snooping limit rate ${c.snoopRate}`);
  for (const x of c.extra) out.push(` ${x}`);
  if (c.shutdown) out.push(' shutdown');
  if (c.mtu !== undefined) out.push(` mtu ${c.mtu}`);
  if (t === 'Serial') {
    if (c.serialEncap === 'ppp') out.push(' encapsulation ppp');
    if (c.clockRate !== undefined) out.push(` clock rate ${c.clockRate}`);
  }
  if (phys && t !== 'Serial') {
    if (dev.model === 'isr4321' && !c.sw) {
      if (c.speed !== 'auto') out.push(` speed ${c.speed}`);
      if (c.duplex !== 'auto') out.push(` duplex ${c.duplex}`);
      if (c.speed === 'auto' && c.duplex === 'auto') out.push(' negotiation auto');
    } else if (dev.model === 'isr2911') {
      out.push(` duplex ${c.duplex}`);
      out.push(` speed ${c.speed}`);
    } else {
      if (c.speed !== 'auto') out.push(` speed ${c.speed}`);
      if (c.duplex !== 'auto') out.push(` duplex ${c.duplex}`);
    }
  }
  if (c.storm.broadcast) out.push(` storm-control broadcast level ${c.storm.broadcast}`);
  if (c.storm.multicast) out.push(` storm-control multicast level ${c.storm.multicast}`);
  if (c.storm.unicast) out.push(` storm-control unicast level ${c.storm.unicast}`);
  if (c.storm.action) out.push(` storm-control action ${c.storm.action}`);
  if (c.poe !== 'auto') out.push(` power inline ${c.poe}`);
  if (!l2) {
    for (const a of c.v6) out.push(` ipv6 address ${v6Disp(a.addr)}${a.linkLocal ? ' link-local' : `/${a.len}${a.eui64 ? ' eui-64' : ''}${a.anycast ? ' anycast' : ''}`}`);
    if (c.v6Auto) out.push(' ipv6 address autoconfig');
    if (c.v6Enabled) out.push(' ipv6 enable');
    if (c.v6AclIn) out.push(` ipv6 traffic-filter ${c.v6AclIn} in`);
    if (c.v6AclOut) out.push(` ipv6 traffic-filter ${c.v6AclOut} out`);
    out.push(...ospfIfLines(c, true));
  }
  if (!c.cdp) out.push(' no cdp enable');
  if (!c.lldpTx) out.push(' no lldp transmit');
  if (!c.lldpRx) out.push(' no lldp receive');
  if (c.channel) out.push(` channel-group ${c.channel.group} mode ${c.channel.mode}`);
  if (c.lacpRate) out.push(` lacp rate ${c.lacpRate}`);
  out.push(...stpLines(c));
  if (c.snoopTrust) out.push(' ip dhcp snooping trust');
  if (c.arpTrust) out.push(' ip arp inspection trust');
  return out;
}

/* ---------------- lines ---------------- */

function lineBody(l: LineCfg, kind: 'con' | 'aux' | 'vty'): string[] {
  const out: string[] = [];
  if (l.accessIn) out.push(` access-class ${l.accessIn} in`);
  if (l.accessOut) out.push(` access-class ${l.accessOut} out`);
  if (l.execTimeout) out.push(` exec-timeout ${l.execTimeout[0]} ${l.execTimeout[1]}`);
  if (l.privilege !== undefined) out.push(` privilege level ${l.privilege}`);
  if (l.password) out.push(` password ${pw(l.password)}`);
  if (l.logSync) out.push(' logging synchronous');
  if (kind === 'vty') {
    if (l.login === 'local') out.push(' login local');
    else if (l.login === 'line') out.push(' login');
    else out.push(' no login');
  } else if (l.login === 'local') out.push(' login local');
  else if (l.login === 'line') out.push(' login');
  if (l.history !== undefined) out.push(` history size ${l.history}`);
  for (const x of l.extra) out.push(` ${x}`);
  if (l.transport) out.push(` transport input ${l.transport.join(' ')}`);
  if (l.transportOut) out.push(` transport output ${l.transportOut.join(' ')}`);
  return out;
}

function vtyGroups(dev: IosDevice): string[] {
  const out: string[] = [];
  const vty = dev.st.cfg.lines.vty;
  const bounds = [0, 5, vty.length];
  let i = 0;
  while (i < vty.length) {
    const nextBound = bounds.find((b) => b > i) ?? vty.length;
    let j = i;
    const body = JSON.stringify(lineBody(vty[i], 'vty'));
    while (j + 1 < nextBound && JSON.stringify(lineBody(vty[j + 1], 'vty')) === body) j++;
    out.push(j === i ? `line vty ${i}` : `line vty ${i} ${j}`);
    out.push(...lineBody(vty[i], 'vty'));
    i = j + 1;
  }
  return out;
}

/* ---------------- whole config ---------------- */

function banner(kind: string, text: string): string[] {
  return `banner ${kind} ^C${text}^C`.split('\n');
}

export function configBody(net: Net, dev: IosDevice): string[] {
  const c = dev.st.cfg;
  const L: string[] = [];
  const xe = dev.hw.iosXe;
  const sw = dev.kind !== 'router';
  const ios15Switch = dev.model === 'c2960';
  L.push(`version ${dev.hw.shortVersion}`);
  if (ios15Switch) L.push('no service pad');
  if (c.tsDebug) L.push('service timestamps debug datetime msec');
  if (c.tsLog) L.push('service timestamps log datetime msec');
  L.push(c.pwEnc ? 'service password-encryption' : 'no service password-encryption');
  for (const x of c.extra.filter((l) => l.startsWith('service '))) L.push(x);
  L.push('!', `hostname ${c.hostname}`, '!', 'boot-start-marker', 'boot-end-marker', '!');
  if (c.enableSecret) L.push(`enable secret ${secretType(c.enableSecret)} ${c.enableSecret}`);
  if (c.enablePassword) L.push(`enable password ${pw(c.enablePassword)}`);
  if (c.enableSecret || c.enablePassword) L.push('!');
  if (c.aaa) {
    L.push('aaa new-model');
    for (const a of c.aaaLines) L.push(`aaa ${a}`);
    L.push('!', 'aaa session-id common');
  } else L.push('no aaa new-model');
  if (c.tz) L.push(`clock timezone ${c.tz.name} ${c.tz.h} ${c.tz.m}`);
  if (sw) L.push('system mtu routing 1500');
  L.push('!');
  for (const s of c.nameServers) L.push(`ip name-server ${ipStr(s)}`);
  if (c.domainName) L.push(ios15Switch ? `ip domain-name ${c.domainName}` : `ip domain name ${c.domainName}`);
  if (!c.domainLookup) L.push(ios15Switch ? 'no ip domain-lookup' : 'no ip domain lookup');
  for (const [h, ip] of Object.entries(c.hosts)) L.push(`ip host ${h} ${ipStr(ip)}`);
  if (dev.kind !== 'router' && c.ipRouting) L.push('ip routing');
  if (dev.kind === 'router' && !c.ipRouting) L.push('no ip routing');
  for (const [lo, hi] of c.dhcpExcl) L.push(`ip dhcp excluded-address ${ipStr(lo)}${hi !== lo ? ` ${ipStr(hi)}` : ''}`);
  if (c.noServiceDhcp) L.push('no service dhcp');
  for (const p of Object.values(c.dhcpPools)) {
    L.push('!', `ip dhcp pool ${p.name}`);
    if (p.net !== undefined && p.mask !== undefined) L.push(` network ${ipStr(p.net)} ${ipStr(p.mask)}`);
    if (p.gw.length) L.push(` default-router ${p.gw.map(ipStr).join(' ')}`);
    if (p.dns.length) L.push(` dns-server ${p.dns.map(ipStr).join(' ')}`);
    if (p.domain) L.push(` domain-name ${p.domain}`);
    if (p.lease) {
      if (p.lease === 'infinite') L.push(' lease infinite');
      else {
        const [dd, hh, mm] = p.lease;
        L.push(` lease ${dd}${hh || mm ? ` ${hh}` : ''}${mm ? ` ${mm}` : ''}`);
      }
    }
    for (const x of p.extra) L.push(` ${x}`);
  }
  if (Object.keys(c.dhcpPools).length) L.push('!');
  if (c.relayTrustAll) L.push('ip dhcp relay information trust-all');
  if (c.snoop || c.snoopVlans.length || !c.snoopOpt82) {
    if (c.snoopVlans.length) L.push(`ip dhcp snooping vlan ${rangesStr(c.snoopVlans)}`);
    if (!c.snoopOpt82) L.push('no ip dhcp snooping information option');
    if (c.snoop) L.push('ip dhcp snooping');
  }
  if (c.daiVlans.length) L.push(`ip arp inspection vlan ${rangesStr(c.daiVlans)}`);
  for (const x of c.extra.filter((l) => l.startsWith('login ') || l.startsWith('security '))) L.push(x);
  if (c.v6Routing) L.push('ipv6 unicast-routing');
  if (!sw) L.push('!', 'multilink bundle-name authenticated');
  L.push('!');
  if (xe && dev.kind === 'router') L.push(`license udi pid ${dev.hw.platform} sn ${dev.hw.serial}`, 'diagnostic bootup level minimal', '!');
  if (sw || xe) {
    L.push(`spanning-tree mode ${c.stpMode}`);
    if (c.stpPortfastDefault) L.push('spanning-tree portfast default');
    if (c.stpBpduguardDefault) L.push('spanning-tree portfast bpduguard default');
    if (c.stpBpdufilterDefault) L.push('spanning-tree portfast bpdufilter default');
    if (c.stpLoopguardDefault) L.push('spanning-tree loopguard default');
    L.push('spanning-tree extend system-id');
    if (c.stpOff.length) L.push(`no spanning-tree vlan ${rangesStr(c.stpOff)}`);
    const byPrio = new Map<number, number[]>();
    for (const [v, p] of Object.entries(c.stpPrio)) {
      const arr = byPrio.get(p) ?? [];
      arr.push(Number(v));
      byPrio.set(p, arr);
    }
    for (const [p, vs] of byPrio) L.push(`spanning-tree vlan ${rangesStr(vs.sort((a, b) => a - b).map((v) => [v, v] as [number, number]).reduce<[number, number][]>((acc, r) => {
      const last = acc[acc.length - 1];
      if (last && last[1] === r[0] - 1) last[1] = r[1];
      else acc.push([...r]);
      return acc;
    }, []))} priority ${p}`);
  }
  for (const cause of c.errRecovery) L.push(`errdisable recovery cause ${cause}`);
  if (c.errInterval !== undefined) L.push(`errdisable recovery interval ${c.errInterval}`);
  if (c.lb) L.push(`port-channel load-balance ${c.lb}`);
  if (sw && (c.vtp.mode === 'transparent' || c.vtp.mode === 'off')) {
    if (c.vtp.domain) L.push(`vtp domain ${c.vtp.domain}`);
    L.push(`vtp mode ${c.vtp.mode}`);
  }
  L.push('!');
  for (const [name, u] of Object.entries(c.users)) {
    let s = `username ${name}`;
    if (u.privilege !== undefined) s += ` privilege ${u.privilege}`;
    if (u.secret) s += ` secret ${secretType(u.secret)} ${u.secret}`;
    else if (u.password) s += ` password ${u.password.enc ? `7 ${type7Encode(u.password.plain)}` : `0 ${u.password.plain}`}`;
    L.push(s);
  }
  if (Object.keys(c.users).length) L.push('!');
  if (sw) L.push('vlan internal allocation policy ascending', '!');
  if (sw && (c.vtp.mode === 'transparent' || c.vtp.mode === 'off')) {
    for (const v of Object.keys(dev.st.vlans).map(Number).sort((a, b) => a - b)) {
      if (v === 1 || (v >= 1002 && v <= 1005)) continue;
      const rec = dev.st.vlans[String(v)];
      L.push(`vlan ${v}`);
      if (rec.name !== `VLAN${String(v).padStart(4, '0')}`) L.push(` name ${rec.name}`);
      if (rec.shut) L.push(' shutdown');
      L.push('!');
    }
  }
  for (const b of c.blocks) {
    L.push(b.header, ...b.lines.map((x) => ` ${x}`), '!');
  }
  if (c.ssh.version || c.ssh.timeout !== undefined || c.ssh.retries !== undefined) {
    /* printed later with ip lines */
  }
  L.push('!');
  for (const name of ifConfigOrder(dev)) {
    L.push(...interfaceLines(dev, name), '!');
  }
  for (const o of Object.values(c.ospf)) {
    L.push(`router ospf ${o.pid}`);
    if (o.rid !== undefined) L.push(` router-id ${ipStr(o.rid)}`);
    if (o.refBw !== undefined) L.push(` auto-cost reference-bandwidth ${o.refBw}`);
    for (const x of o.extra) L.push(` ${x}`);
    for (const r of o.redistribute) L.push(` redistribute ${r}`);
    if (o.passiveDefault) L.push(' passive-interface default');
    for (const p of o.noPassive) L.push(` no passive-interface ${p}`);
    for (const p of o.passive) L.push(` passive-interface ${p}`);
    for (const n of o.networks) L.push(` network ${ipStr(n.addr)} ${ipStr(n.wc)} area ${n.area}`);
    if (o.defOrig) L.push(` default-information originate${o.defOrig.always ? ' always' : ''}${o.defOrig.metric !== undefined ? ` metric ${o.defOrig.metric}` : ''}${o.defOrig.type !== undefined ? ` metric-type ${o.defOrig.type}` : ''}`);
    if (o.maxPaths !== undefined) L.push(` maximum-paths ${o.maxPaths}`);
    if (!o.logAdj) L.push(' no log-adjacency-changes');
    L.push('!');
  }
  for (const o of Object.values(c.ospf6)) {
    L.push(`ipv6 router ospf ${o.pid}`);
    if (o.rid !== undefined) L.push(` router-id ${ipStr(o.rid)}`);
    if (o.refBw !== undefined) L.push(` auto-cost reference-bandwidth ${o.refBw}`);
    if (o.passiveDefault) L.push(' passive-interface default');
    for (const p of o.noPassive) L.push(` no passive-interface ${p}`);
    for (const p of o.passive) L.push(` passive-interface ${p}`);
    if (o.defOrig) L.push(` default-information originate${o.defOrig.always ? ' always' : ''}`);
    for (const x of o.extra) L.push(` ${x}`);
    L.push('!');
  }
  if (!sw || c.defaultGw !== undefined) {
    /* ip forward-protocol */
  }
  if (c.defaultGw !== undefined) L.push(`ip default-gateway ${ipStr(c.defaultGw)}`);
  L.push('ip forward-protocol nd');
  L.push(c.http ? 'ip http server' : 'no ip http server');
  L.push(c.https ? 'ip http secure-server' : 'no ip http secure-server');
  for (const p of Object.values(c.nat.pools)) L.push(`ip nat pool ${p.name} ${ipStr(p.start)} ${ipStr(p.end)} ${p.byPrefix ? `prefix-length ${maskLen(p.mask)}` : `netmask ${ipStr(p.mask)}`}`);
  for (const d of c.nat.dyn) L.push(`ip nat inside source list ${d.acl} ${d.iface ? `interface ${d.iface}` : `pool ${d.pool}`}${d.overload ? ' overload' : ''}`);
  for (const s of c.nat.statics) {
    const side = s.outside ? 'outside' : 'inside';
    if (s.proto) L.push(`ip nat ${side} source static ${s.proto} ${ipStr(s.local)} ${s.lport} ${s.gIf ? `interface ${s.gIf}` : ipStr(s.global)} ${s.gport}`);
    else L.push(`ip nat ${side} source static ${ipStr(s.local)} ${ipStr(s.global)}`);
  }
  for (const r of c.routes) {
    let s = `ip route ${ipStr(r.net)} ${ipStr(r.mask)}`;
    if (r.ifName) s += ` ${r.ifName}`;
    if (r.nh !== undefined) s += ` ${ipStr(r.nh)}`;
    if (r.ad !== 1) s += ` ${r.ad}`;
    if (r.tag !== undefined) s += ` tag ${r.tag}`;
    if (r.name) s += ` name ${r.name}`;
    if (r.permanent) s += ' permanent';
    L.push(s);
  }
  if (c.ssh.timeout !== undefined) L.push(`ip ssh time-out ${c.ssh.timeout}`);
  if (c.ssh.retries !== undefined) L.push(`ip ssh authentication-retries ${c.ssh.retries}`);
  if (c.ssh.version) L.push(`ip ssh version ${c.ssh.version}`);
  L.push('!');
  const acls = Object.values(c.acls);
  for (const acl of acls.filter((a) => !a.numbered)) {
    L.push(`ip access-list ${acl.kind} ${acl.name}`);
    for (const e of acl.entries) L.push(` ${aclEntryText(acl, e)}`);
  }
  const numbered = acls.filter((a) => a.numbered).sort((a, b) => Number(a.name) - Number(b.name));
  if (numbered.length) L.push('!');
  for (const acl of numbered) L.push(...numberedAclLines(acl));
  if (c.log.trap) L.push(`logging trap ${c.log.trap}`);
  if (c.log.source) L.push(`logging source-interface ${c.log.source}`);
  for (const h of c.log.hosts) L.push(`logging host ${ipStr(h)}`);
  for (const r of c.routes6) L.push(`ipv6 route ${v6Disp(r.net)}/${r.len}${r.ifName ? ` ${r.ifName}` : ''}${r.nh ? ` ${v6Disp(r.nh)}` : ''}${r.ad !== 1 ? ` ${r.ad}` : ''}`);
  for (const acl of Object.values(c.v6acls)) {
    L.push(`ipv6 access-list ${acl.name}`);
    for (const e of acl.entries) L.push(` ${e.action} ${e.remark ?? ''}`.trimEnd());
  }
  for (const s of c.snmp) L.push(`snmp-server ${s}`);
  if (!c.cdp) L.push('no cdp run');
  if (c.cdpTimer !== 60) L.push(`cdp timer ${c.cdpTimer}`);
  if (c.cdpHold !== 180) L.push(`cdp holdtime ${c.cdpHold}`);
  if (c.lldp) L.push('lldp run');
  if (c.lldpTimer !== 30) L.push(`lldp timer ${c.lldpTimer}`);
  if (c.lldpHold !== 120) L.push(`lldp holdtime ${c.lldpHold}`);
  for (const x of c.extra.filter((l) => !l.startsWith('service ') && !l.startsWith('login ') && !l.startsWith('security '))) L.push(x);
  L.push('!', 'control-plane', '!');
  if (c.bannerExec !== undefined) L.push(...banner('exec', c.bannerExec));
  if (c.bannerLogin !== undefined) L.push(...banner('login', c.bannerLogin));
  if (c.bannerMotd !== undefined) L.push(...banner('motd', c.bannerMotd));
  if (c.bannerExec !== undefined || c.bannerLogin !== undefined || c.bannerMotd !== undefined) L.push('!');
  L.push('line con 0', ...lineBody(c.lines.con, 'con'));
  if (dev.kind === 'router') L.push('line aux 0', ...lineBody(c.lines.aux, 'aux'));
  L.push(...vtyGroups(dev));
  L.push('!');
  if (c.ntp.master !== undefined) L.push(c.ntp.master === 8 ? 'ntp master' : `ntp master ${c.ntp.master}`);
  if (c.ntp.source) L.push(`ntp source ${c.ntp.source}`);
  for (const x of c.ntp.extra) L.push(x);
  for (const s of c.ntp.servers) L.push(`ntp server ${ipStr(s.ip)}${s.prefer ? ' prefer' : ''}`);
  if (c.ntp.servers.length || c.ntp.master !== undefined) L.push('!');
  L.push('end');
  void net;
  return L.filter((x, i, arr) => !(x === '!' && arr[i - 1] === '!' && arr[i - 2] === '!'));
}

export function lastChangeComments(net: Net, dev: IosDevice): string[] {
  const out: string[] = [];
  const dyn = dev.st.dyn;
  const tz = dev.st.cfg.tz?.name ?? 'UTC';
  const off = dev.st.cfg.tz ? dev.st.cfg.tz.h * 60 + dev.st.cfg.tz.m : 0;
  if (dyn.cfgChanged !== null) out.push(`! Last configuration change at ${iosClock(net.now() - net.clock + dyn.cfgChanged + dyn.clockOffset, tz, off).replace(/\.\d{3}/, '')}${dyn.cfgChangedBy && dyn.cfgChangedBy !== 'console' ? ` by ${dyn.cfgChangedBy}` : ''}`);
  if (dyn.savedAt !== null) out.push(`! NVRAM config last updated at ${iosClock(net.now() - net.clock + dyn.savedAt + dyn.clockOffset, tz, off).replace(/\.\d{3}/, '')}`);
  return out;
}

export function runningConfig(net: Net, dev: IosDevice): string {
  const body = configBody(net, dev);
  const comments = lastChangeComments(net, dev);
  const head = comments.length ? ['!', ...comments, '!'] : ['!'];
  const text = [...head, ...body].join('\n');
  return ['Building configuration...', '', `Current configuration : ${text.length + 1} bytes`, text].join('\n');
}

/** Configuration text without volatile headers (used for startup-config and comparisons). */
export function savedConfigText(net: Net, dev: IosDevice): string {
  return ['!', ...configBody(net, dev)].join('\n');
}

/** Strip headers/comments for running vs startup comparisons. */
export function normalizeConfig(text: string): string {
  return text
    .split('\n')
    .filter((l) => !/^(Building configuration|Current configuration|Using \d+ out of)/.test(l))
    .filter((l) => !/^! (Last configuration change|NVRAM config last updated|No configuration change)/.test(l))
    .filter((l) => l.trim() !== '' && l.trim() !== '!')
    .join('\n');
}
