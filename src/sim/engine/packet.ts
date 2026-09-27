/**
 * Packet engine: walks IPv4/IPv6 packets hop by hop through the real forwarding state
 * (ARP/ND, L2 switching, ACLs, NAT, TTL) and produces per-hop traces.
 */
import type { PacketHop } from '../api';
import type { Device, HostDevice, IosDevice } from '../model/state';
import { ifDyn } from '../model/state';
import { shortIf, typeOfName } from '../model/ifname';
import { inNet, ipStr, maskLen, netOf } from '../util/ip';
import { parseV6, v6InNet, v6Str } from '../util/ipv6';
import { macDotted } from '../util/mac';
import { rangesHas } from '../util/format';
import { ifMac } from './topo';
import { ek, type Net } from './net';
import type { Derived } from './derived';
import { flood, type L2Endpoint, type L2Hop } from './l2';
import { hostEffective, hostEffective6, lookup, lookup6, type V6Addr } from './l3';
import { evalAcl } from './acl';
import { isInsideAddr, natIn, natOut } from './nat';

export interface Pkt {
  src: number;
  dst: number;
  proto: 'icmp' | 'tcp' | 'udp';
  icmp?: 'echo' | 'echo-reply' | 'unreach' | 'ttl';
  code?: number;
  sport?: number;
  dport?: number;
  ttl: number;
  est?: boolean;
  size: number;
  inner?: { src: number; dst: number; sport?: number; dport?: number; proto: string };
}

export interface Walk {
  ok: boolean;
  to?: { dev: string; ifName: string };
  pkt: Pkt;
  hops: PacketHop[];
  arpDrop: boolean;
  fail?: { dev: string; kind: string; text: string };
  icmp?: { dev: string; src: number; type: 'unreach' | 'ttl'; code: number; pkt: Pkt };
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

export function routingOn(dev: Device): boolean {
  return dev.t === 'ios' && dev.st.cfg.ipRouting && dev.kind !== 'switch';
}

function ifUp(d: Derived, dev: string, ifName: string): boolean {
  const s = d.l2.ifs.get(ek(dev, ifName));
  return !!s && s.line === 'up' && s.proto === 'up';
}

/** Interface on which the device owns `ip` (interface must be up/up), or HSRP VIP when active. */
export function ownerIf(net: Net, d: Derived, dev: Device, ip: number): string | null {
  if (dev.t === 'host') {
    const e = hostEffective(dev);
    const nic = dev.hw.ifaces[0].name;
    return e.ip === ip && ifUp(d, dev.id, nic) ? nic : null;
  }
  for (const name of Object.keys(dev.st.cfg.ifaces)) {
    const list = d.addrs.get(ek(dev.id, name));
    if (list?.some((a) => a.ip === ip) && ifUp(d, dev.id, name)) return name;
  }
  for (const g of d.hsrp.groups) {
    if (g.vip === ip && g.active?.dev === dev.id) return g.active.ifName;
  }
  void net;
  return null;
}

function primaryIp(d: Derived, dev: Device, ifName: string): number | undefined {
  if (dev.t === 'host') return hostEffective(dev).ip;
  return d.addrs.get(ek(dev.id, ifName))?.[0]?.ip;
}

function devName(dev: Device): string {
  return dev.t === 'ios' ? dev.st.cfg.hostname : dev.id;
}

function arpTable(dev: Device): Record<string, { mac: string; ifName?: string; t: number }> {
  return dev.t === 'ios' ? dev.st.dyn.arp : dev.st.arp;
}

function learnMac(net: Net, sw: IosDevice, vlan: number, mac: string, port: string): void {
  sw.st.dyn.mac[`${vlan}|${mac}`] = { port, t: net.clock };
}

/** Port security at a switch ingress port. Returns false when the frame is dropped. */
export function psIngress(net: Net, sw: IosDevice, port: string, vlan: number, mac: string): boolean {
  const c = sw.st.cfg.ifaces[port];
  if (!c?.ps.enabled) return true;
  const dyn = ifDyn(sw, port);
  const secure = [...c.ps.macs.map((m) => m.mac), ...dyn.psLearned.map((m) => m.mac)];
  if (secure.includes(mac)) {
    dyn.psLast = `${macDotted(mac)}:${vlan}`;
    return true;
  }
  const max = c.ps.max ?? 1;
  if (secure.length < max) {
    if (c.ps.sticky) {
      c.ps.macs.push({ mac, vlan, sticky: true });
      sw.st.dyn.cfgChanged = net.clock;
    } else dyn.psLearned.push({ mac, vlan });
    dyn.psLast = `${macDotted(mac)}:${vlan}`;
    net.touch();
    return true;
  }
  const mode = c.ps.violation ?? 'shutdown';
  dyn.psViolations++;
  dyn.psLast = `${macDotted(mac)}:${vlan}`;
  if (mode === 'shutdown') {
    if (!dyn.errDisabled) {
      dyn.errDisabled = 'psecure-violation';
      net.log(sw.id, `%PM-4-ERR_DISABLE: psecure-violation error detected on ${shortIf(port)}, putting ${shortIf(port)} in err-disable state`);
      net.log(sw.id, `%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address ${macDotted(mac)} on port ${port}.`);
      net.touch();
    }
  } else if (mode === 'restrict') {
    net.log(sw.id, `%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address ${macDotted(mac)} on port ${port}.`);
  }
  return false;
}

function countIf(dev: Device, ifName: string, dir: 'in' | 'out', size: number): void {
  if (dev.t === 'host') {
    if (dir === 'in') dev.st.counters.inPkts++;
    else dev.st.counters.outPkts++;
    return;
  }
  const dd = ifDyn(dev, ifName);
  if (dir === 'in') {
    dd.inPkts++;
    dd.inBytes += size;
  } else {
    dd.outPkts++;
    dd.outBytes += size;
  }
}

/* ------------------------------------------------------------------ */
/* ARP + L2 delivery                                                   */
/* ------------------------------------------------------------------ */

interface Resolved {
  ep: { dev: string; ifName: string };
  mac: string;
  hops: L2Hop[];
  miss: boolean;
}

function switchText(hops: L2Hop[], dir: 'fwd' | 'rev'): PacketHop[] {
  return hops.map((h) => ({
    device: h.dev,
    iface: dir === 'fwd' ? h.outPort : h.inPort ?? undefined,
    action: `Switched in VLAN ${h.vlan}: ${h.inPort ? shortIf(dir === 'fwd' ? h.inPort : h.outPort ?? '') || 'SVI' : 'SVI'} → ${dir === 'fwd' ? (h.outPort ? shortIf(h.outPort) : 'SVI') : h.inPort ? shortIf(h.inPort) : 'SVI'}`,
    ok: true,
  }));
}

/** Resolve next hop `nh` out of (dev, ifName) with ARP, returning the receiving endpoint. */
function resolve4(net: Net, d: Derived, dev: Device, ifName: string, nh: number, w: Walk): Resolved | null {
  const t = typeOfName(ifName)?.name;
  if (t === 'Serial') {
    const peer = net.peerOf(dev.id, ifName);
    if (!peer || !ifUp(d, dev.id, ifName) || !ifUp(d, peer.dev, peer.ifName)) return null;
    return { ep: peer, mac: '', hops: [], miss: false };
  }
  const myMac = ifMac(dev, ifName);
  const myIp = primaryIp(d, dev, ifName);
  const fl = flood(net, d.l2, dev, ifName, {
    srcMac: myMac,
    onIngress: (sw, port, vlan) => {
      if (!psIngress(net, sw, port, vlan, myMac)) return false;
      learnMac(net, sw, vlan, myMac, port);
      return true;
    },
  });
  let found: { ep: L2Endpoint; mac: string; proxy?: boolean } | undefined;
  for (const ep of fl.eps) {
    const edev = net.dev(ep.dev)!;
    if (edev.id === dev.id && ep.ifName === ifName) continue;
    if (edev.t === 'host') {
      if (hostEffective(edev).ip === nh) {
        found = { ep, mac: ifMac(edev, ep.ifName) };
        break;
      }
      continue;
    }
    const list = d.addrs.get(ek(edev.id, ep.ifName));
    if (list?.some((a) => a.ip === nh)) {
      found = { ep, mac: ifMac(edev, ep.ifName) };
      break;
    }
    const g = d.hsrp.groups.find((x) => x.vip === nh && x.active?.dev === edev.id && x.active.ifName === ep.ifName);
    if (g) {
      found = { ep, mac: g.vmac };
      break;
    }
  }
  if (!found) {
    for (const ep of fl.eps) {
      const edev = net.dev(ep.dev)!;
      if (edev.t === 'host') {
        // the cloud answers for its address regardless of subnet
        if (edev.kind === 'cloud' && edev.cloudIp === nh) {
          found = { ep, mac: ifMac(edev, ep.ifName) };
          break;
        }
        continue;
      }
      const c = edev.st.cfg.ifaces[ep.ifName];
      if (!c?.proxyArp || !routingOn(edev)) continue;
      const a = d.addrs.get(ek(edev.id, ep.ifName))?.[0];
      if (!a || inNet(nh, a.ip, a.mask)) continue;
      const r = lookup(d.rib.get(edev.id) ?? [], nh);
      if (r && r.ifName !== ep.ifName) {
        found = { ep, mac: ifMac(edev, ep.ifName), proxy: true };
        break;
      }
    }
  }
  if (!found) return null;
  const table = arpTable(dev);
  const ent = table[String(nh)];
  const hit = !!ent && ent.mac === found.mac && (dev.t === 'host' || ent.ifName === ifName);
  if (!hit) {
    if (dev.t === 'ios') table[String(nh)] = { mac: found.mac, ifName, t: net.clock };
    else table[String(nh)] = { mac: found.mac, t: net.clock };
    const target = net.dev(found.ep.dev)!;
    if (myIp !== undefined && !found.proxy) {
      const tt = arpTable(target);
      if (target.t === 'ios') tt[String(myIp)] = { mac: myMac, ifName: found.ep.ifName, t: net.clock };
      else tt[String(myIp)] = { mac: myMac, t: net.clock };
    }
    w.hops.push({ device: dev.id, iface: shortIf(ifName), action: `ARP for ${ipStr(nh)}: reply from ${devName(target)} ${shortIf(found.ep.ifName)} (${macDotted(found.mac)})${found.proxy ? ' [proxy ARP]' : ''}`, ok: true });
  }
  // reply direction MAC learning + port security on the target side
  for (const h of found.ep.hops) {
    const sw = net.ios(h.dev)!;
    if (h.outPort) {
      learnMac(net, sw, h.vlan, found.mac, h.outPort);
    }
  }
  if (!hit) {
    for (const h of found.ep.hops) {
      if (h.outPort) {
        const sw = net.ios(h.dev)!;
        const tdev = net.dev(found.ep.dev)!;
        if (tdev.t === 'host' && !psIngress(net, sw, h.outPort, h.vlan, found.mac)) return null;
      }
    }
  }
  return { ep: { dev: found.ep.dev, ifName: found.ep.ifName }, mac: found.mac, hops: found.ep.hops, miss: !hit };
}

/* ------------------------------------------------------------------ */
/* IPv4 forwarding                                                     */
/* ------------------------------------------------------------------ */

function mkIcmpErr(d: Derived, dev: Device, inIf: string | null, type: 'unreach' | 'ttl', code: number, pkt: Pkt): Walk['icmp'] | undefined {
  if (pkt.proto === 'icmp' && (pkt.icmp === 'unreach' || pkt.icmp === 'ttl')) return undefined;
  const src = inIf ? primaryIp(d, dev, inIf) : undefined;
  if (src === undefined) return undefined;
  return {
    dev: dev.id,
    src,
    type,
    code,
    pkt: { src, dst: pkt.src, proto: 'icmp', icmp: type, code, ttl: 255, size: 56, inner: { src: pkt.src, dst: pkt.dst, sport: pkt.sport, dport: pkt.dport, proto: pkt.proto } },
  };
}

export interface FwdOpts {
  /** source interface for router-originated packets */
  srcIf?: string;
}

export function forward4(net: Net, origin: Device, pkt0: Pkt, opts: FwdOpts = {}): Walk {
  const d = net.d;
  const w: Walk = { ok: false, pkt: { ...pkt0 }, hops: [], arpDrop: false };
  let cur: Device = origin;
  let inIf: string | null = null;
  for (let step = 0; step < 48; step++) {
    const pkt = w.pkt;
    // local delivery
    if (inIf !== null || step === 0) {
      const own = ownerIf(net, d, cur, pkt.dst);
      if (own) {
        w.ok = true;
        w.to = { dev: cur.id, ifName: inIf ?? own };
        w.hops.push({ device: cur.id, iface: inIf ? shortIf(inIf) : undefined, action: `Delivered to ${devName(cur)} (${ipStr(pkt.dst)})`, ok: true });
        if (inIf) countIf(cur, inIf, 'in', pkt.size);
        return w;
      }
    }
    let egress: string;
    let nh: number;
    if (cur.t === 'host') {
      if (inIf !== null) {
        w.fail = { dev: cur.id, kind: 'host', text: `${devName(cur)} is not the destination and does not route` };
        w.hops.push({ device: cur.id, action: 'Dropped: host does not forward packets', ok: false });
        return w;
      }
      const e = hostEffective(cur);
      const nic = cur.hw.ifaces[0].name;
      if (e.ip === undefined || e.mask === undefined) {
        w.fail = { dev: cur.id, kind: 'noip', text: `${devName(cur)} has no IP address` };
        w.hops.push({ device: cur.id, action: 'No IPv4 address configured', ok: false });
        return w;
      }
      if (pkt.src === 0) pkt.src = e.ip;
      if (inNet(pkt.dst, e.ip, e.mask)) nh = pkt.dst;
      else if (e.gw !== undefined) {
        nh = e.gw;
        w.hops.push({ device: cur.id, iface: shortIf(nic), action: `${ipStr(pkt.dst)} is remote: send to default gateway ${ipStr(e.gw)}`, ok: true });
      } else {
        w.fail = { dev: cur.id, kind: 'nogw', text: `${devName(cur)} has no default gateway for remote destination ${ipStr(pkt.dst)}` };
        w.hops.push({ device: cur.id, action: 'No default gateway configured', ok: false });
        return w;
      }
      if (!ifUp(d, cur.id, nic)) {
        w.fail = { dev: cur.id, kind: 'down', text: `${devName(cur)} network adapter is disconnected` };
        w.hops.push({ device: cur.id, action: 'Media disconnected', ok: false });
        return w;
      }
      egress = nic;
    } else {
      const dev = cur;
      if (inIf !== null) {
        // inbound ACL
        const aclIn = dev.st.cfg.ifaces[inIf]?.aclIn;
        if (aclIn) {
          const v = evalAcl(dev, aclIn, pkt);
          if (!v.permit) {
            w.fail = { dev: dev.id, kind: 'acl', text: `denied by ACL ${aclIn} inbound on ${devName(dev)} ${shortIf(inIf)}` };
            w.hops.push({ device: dev.id, iface: shortIf(inIf), action: `Denied by ACL ${aclIn} in${v.implicit ? ' (implicit deny)' : ''}`, ok: false });
            w.icmp = mkIcmpErr(d, dev, inIf, 'unreach', 13, pkt);
            return w;
          }
        }
        // NAT outside → inside
        if (dev.st.cfg.ifaces[inIf]?.nat === 'outside') {
          const r = natIn(net, dev, pkt);
          if (r.text) {
            w.pkt = r.pkt as Pkt;
            w.hops.push({ device: dev.id, iface: shortIf(inIf), action: r.text, ok: true });
            const own = ownerIf(net, d, dev, w.pkt.dst);
            if (own) {
              w.ok = true;
              w.to = { dev: dev.id, ifName: inIf };
              return w;
            }
          }
        }
        if (!routingOn(dev)) {
          w.fail = { dev: dev.id, kind: 'norouting', text: `${devName(dev)} is not routing (no ip routing)` };
          w.hops.push({ device: dev.id, iface: shortIf(inIf), action: 'Dropped: IP routing is disabled', ok: false });
          return w;
        }
        if (w.pkt.ttl <= 1) {
          w.fail = { dev: dev.id, kind: 'ttl', text: `TTL expired at ${devName(dev)}` };
          w.hops.push({ device: dev.id, iface: shortIf(inIf), action: 'TTL expired', ok: false });
          w.icmp = mkIcmpErr(d, dev, inIf, 'ttl', 0, w.pkt);
          return w;
        }
        w.pkt.ttl--;
      }
      const p = w.pkt;
      const rib = d.rib.get(dev.id) ?? [];
      if (routingOn(dev)) {
        const r = lookup(rib, p.dst);
        if (!r) {
          w.fail = { dev: dev.id, kind: 'noroute', text: `${devName(dev)} has no route to ${ipStr(p.dst)}` };
          w.hops.push({ device: dev.id, action: `No route to ${ipStr(p.dst)}`, ok: false });
          if (inIf !== null) w.icmp = mkIcmpErr(d, dev, inIf, 'unreach', 0, p);
          return w;
        }
        egress = r.ifName;
        nh = r.nh;
        const how = r.route.proto === 'connected' ? 'directly connected' : `via ${ipStr(r.nh)} (${r.route.code.trim()})`;
        w.hops.push({ device: dev.id, iface: shortIf(egress), action: `Routed ${how} out ${shortIf(egress)}`, ok: true });
      } else {
        if (inIf !== null) return w;
        let found: string | undefined;
        for (const [name] of Object.entries(dev.st.cfg.ifaces)) {
          const a = d.addrs.get(ek(dev.id, name))?.[0];
          if (a && ifUp(d, dev.id, name) && inNet(p.dst, a.ip, a.mask)) {
            found = name;
            break;
          }
        }
        if (found) {
          egress = found;
          nh = p.dst;
        } else {
          const gw = dev.st.cfg.defaultGw;
          let gwIf: string | undefined;
          if (gw !== undefined) {
            for (const [name] of Object.entries(dev.st.cfg.ifaces)) {
              const a = d.addrs.get(ek(dev.id, name))?.[0];
              if (a && ifUp(d, dev.id, name) && inNet(gw, a.ip, a.mask)) {
                gwIf = name;
                break;
              }
            }
          }
          if (gw === undefined || !gwIf) {
            w.fail = { dev: dev.id, kind: 'nogw', text: `${devName(dev)} has no default gateway (ip default-gateway) for ${ipStr(p.dst)}` };
            w.hops.push({ device: dev.id, action: 'No default gateway', ok: false });
            return w;
          }
          egress = gwIf;
          nh = gw;
          w.hops.push({ device: dev.id, iface: shortIf(egress), action: `Sent to default gateway ${ipStr(gw)}`, ok: true });
        }
      }
      if (egress === 'Null0') {
        w.fail = { dev: dev.id, kind: 'null', text: `${devName(dev)} routes ${ipStr(p.dst)} to Null0` };
        w.hops.push({ device: dev.id, action: 'Discarded (Null0)', ok: false });
        return w;
      }
      if (step === 0 && p.src === 0) {
        const src = opts.srcIf ? primaryIp(d, dev, opts.srcIf) : primaryIp(d, dev, egress);
        p.src = src ?? 0;
      }
      // NAT inside → outside
      const egCfg = dev.st.cfg.ifaces[egress];
      const inRole = inIf !== null ? dev.st.cfg.ifaces[inIf]?.nat : isInsideAddr(dev, d.addrs, p.src) ? 'inside' : undefined;
      if (egCfg?.nat === 'outside' && inRole === 'inside') {
        const r = natOut(net, dev, p, egress, (n) => d.addrs.get(ek(dev.id, n))?.[0]);
        if (!r) {
          w.fail = { dev: dev.id, kind: 'nat', text: `NAT on ${devName(dev)} could not translate ${ipStr(p.src)} (pool exhausted or no address)` };
          w.hops.push({ device: dev.id, action: 'NAT translation failed (pool exhausted)', ok: false });
          return w;
        }
        if (r.text) {
          w.pkt = r.pkt as Pkt;
          w.hops.push({ device: dev.id, iface: shortIf(egress), action: r.text, ok: true });
        }
      }
      // outbound ACL (not applied to router-originated traffic)
      if (inIf !== null && egCfg?.aclOut) {
        const v = evalAcl(dev, egCfg.aclOut, w.pkt);
        if (!v.permit) {
          w.fail = { dev: dev.id, kind: 'acl', text: `denied by ACL ${egCfg.aclOut} outbound on ${devName(dev)} ${shortIf(egress)}` };
          w.hops.push({ device: dev.id, iface: shortIf(egress), action: `Denied by ACL ${egCfg.aclOut} out${v.implicit ? ' (implicit deny)' : ''}`, ok: false });
          w.icmp = mkIcmpErr(d, dev, inIf, 'unreach', 13, w.pkt);
          return w;
        }
      }
    }
    // transmit
    if (!ifUp(d, cur.id, egress)) {
      w.fail = { dev: cur.id, kind: 'down', text: `${devName(cur)} ${shortIf(egress)} is down` };
      w.hops.push({ device: cur.id, iface: shortIf(egress), action: 'Egress interface down', ok: false });
      return w;
    }
    const res = resolve4(net, d, cur, egress, nh, w);
    if (!res) {
      w.fail = { dev: cur.id, kind: 'arp', text: `${devName(cur)} cannot resolve ${ipStr(nh)} (no ARP reply on ${shortIf(egress)})` };
      w.hops.push({ device: cur.id, iface: shortIf(egress), action: `ARP for ${ipStr(nh)} failed: no reply`, ok: false });
      return w;
    }
    if (res.miss && cur.t === 'ios') w.arpDrop = true;
    countIf(cur, egress, 'out', w.pkt.size);
    w.hops.push(...switchText(res.hops, 'fwd'));
    const next = net.dev(res.ep.dev)!;
    // unicast MAC learning for the data frame
    const smac = ifMac(cur, egress);
    for (const h of res.hops) learnMac(net, net.ios(h.dev)!, h.vlan, smac, h.inPort ?? '');
    cur = next;
    inIf = res.ep.ifName;
  }
  w.fail = { dev: cur.id, kind: 'loop', text: 'routing loop (TTL exceeded)' };
  return w;
}

/* ------------------------------------------------------------------ */
/* round trips                                                         */
/* ------------------------------------------------------------------ */

export interface RoundTrip {
  ok: boolean;
  symbol: '!' | '.' | 'U';
  fwd: Walk;
  rep?: Walk;
  err?: Walk;
  replyTtl?: number;
  arpDrop: boolean;
  refused?: boolean;
  detail: string;
  unreachFrom?: number;
  unreachCode?: number;
}

/** Does the destination listen on this port? */
export function serviceListening(_net: Net, dev: Device, proto: 'tcp' | 'udp', port: number): boolean {
  if (dev.t === 'host') {
    if (dev.kind === 'cloud') return true;
    return true;
  }
  const cfg = dev.st.cfg;
  if (proto === 'tcp') {
    const vtyAllows = (p: string) => cfg.lines.vty.some((l) => !l.transport || l.transport.includes('all') || l.transport.includes(p));
    if (port === 22) return !!dev.st.dyn.rsa && vtyAllows('ssh');
    if (port === 23) return vtyAllows('telnet');
    if (port === 80) return cfg.http;
    if (port === 443) return cfg.https;
    return false;
  }
  if (port === 123) return cfg.ntp.master !== undefined || !!dev.st.dyn.ntpSync;
  if (port === 161) return cfg.snmp.some((l) => l.startsWith('community'));
  if (port === 67) return Object.keys(cfg.dhcpPools).length > 0;
  return false;
}

export function roundTrip4(net: Net, origin: Device, pkt: Pkt, opts: FwdOpts = {}): RoundTrip {
  const fwd = forward4(net, origin, pkt, opts);
  if (!fwd.ok) {
    if (fwd.icmp) {
      const errDev = net.dev(fwd.icmp.dev)!;
      const err = forward4(net, errDev, fwd.icmp.pkt);
      if (err.ok && err.to?.dev === origin.id) {
        return { ok: false, symbol: 'U', fwd, err, arpDrop: fwd.arpDrop, detail: fwd.fail?.text ?? 'unreachable', unreachFrom: fwd.icmp.src, unreachCode: fwd.icmp.code };
      }
    }
    return { ok: false, symbol: '.', fwd, arpDrop: fwd.arpDrop, detail: fwd.fail?.text ?? 'no response' };
  }
  const dst = net.dev(fwd.to!.dev)!;
  const at = fwd.pkt;
  let refused = false;
  if (at.proto === 'tcp' || at.proto === 'udp') {
    if (!serviceListening(net, dst, at.proto, at.dport ?? 0)) refused = true;
  }
  const reply: Pkt = {
    src: at.dst,
    dst: at.src,
    proto: at.proto,
    icmp: at.proto === 'icmp' ? 'echo-reply' : undefined,
    sport: at.dport,
    dport: at.sport,
    ttl: dst.t === 'ios' ? 255 : 128,
    est: at.proto === 'tcp',
    size: at.size,
  };
  const rep = forward4(net, dst, reply);
  if (!rep.ok || rep.to?.dev !== origin.id) {
    let detail = rep.fail?.text ?? 'reply did not return';
    if (rep.ok && rep.to?.dev !== origin.id) detail = `reply delivered to ${rep.to?.dev} instead of ${origin.id}`;
    return { ok: false, symbol: '.', fwd, rep, arpDrop: fwd.arpDrop || rep.arpDrop, detail: `reply from ${ipStr(at.dst)} lost: ${detail}` };
  }
  return { ok: !refused, symbol: '!', fwd, rep, replyTtl: rep.pkt.ttl, arpDrop: fwd.arpDrop || rep.arpDrop, refused, detail: refused ? `${ipStr(at.dst)} refused ${at.proto.toUpperCase()} port ${at.dport}` : `Reply from ${ipStr(at.dst)}` };
}

/** ICMP echo series. Each result carries the IOS symbol; hosts ignore ARP-drop semantics. */
export function pingSeries(net: Net, origin: Device, dst: number, count: number, opts: FwdOpts & { size?: number; src?: number; ttl?: number } = {}): RoundTrip[] {
  const out: RoundTrip[] = [];
  const isIos = origin.t === 'ios';
  let id = 1;
  if (origin.t === 'ios') {
    id = origin.st.dyn.icmpId;
    origin.st.dyn.icmpId = (origin.st.dyn.icmpId % 65000) + 1;
  }
  for (let i = 0; i < count; i++) {
    const pkt: Pkt = { src: opts.src ?? 0, dst, proto: 'icmp', icmp: 'echo', ttl: opts.ttl ?? (isIos ? 255 : 128), size: opts.size ?? (isIos ? 100 : 32), sport: id, dport: id };
    const rt = roundTrip4(net, origin, pkt, opts);
    if (rt.ok && rt.arpDrop) {
      out.push({ ...rt, symbol: '.', ok: false, detail: 'first packet dropped while ARP resolved' });
      continue;
    }
    if (rt.symbol === 'U' && isIos && i % 2 === 1) {
      out.push({ ...rt, symbol: '.' });
      continue;
    }
    out.push(rt);
  }
  return out;
}

/** Traceroute: returns per-TTL probe results. */
export function traceroute4(net: Net, origin: Device, dst: number, maxTtl = 30, icmpProbe = false): { ttl: number; from?: number; dev?: string; done: boolean; unreach?: boolean }[] {
  const out: { ttl: number; from?: number; dev?: string; done: boolean; unreach?: boolean }[] = [];
  for (let ttl = 1; ttl <= maxTtl; ttl++) {
    const pkt: Pkt = icmpProbe
      ? { src: 0, dst, proto: 'icmp', icmp: 'echo', ttl, size: 32, sport: 1, dport: 1 }
      : { src: 0, dst, proto: 'udp', sport: 49152 + ttl, dport: 33434 + ttl, ttl, size: 28 };
    let fwd = forward4(net, origin, pkt);
    if (!fwd.ok && fwd.fail?.kind === 'arp') fwd = forward4(net, origin, pkt);
    if (fwd.ok) {
      const dstDev = net.dev(fwd.to!.dev)!;
      // destination answers (echo reply or port unreachable)
      const back = forward4(net, dstDev, { src: fwd.pkt.dst, dst: fwd.pkt.src, proto: 'icmp', icmp: icmpProbe ? 'echo-reply' : 'unreach', code: 3, ttl: 255, size: 56, sport: 1, dport: 1 });
      if (back.ok && back.to?.dev === origin.id) out.push({ ttl, from: fwd.pkt.dst, dev: dstDev.id, done: true });
      else out.push({ ttl, done: true });
      break;
    }
    if (fwd.icmp) {
      const errDev = net.dev(fwd.icmp.dev)!;
      const err = forward4(net, errDev, fwd.icmp.pkt);
      if (err.ok && err.to?.dev === origin.id) {
        out.push({ ttl, from: fwd.icmp.src, dev: errDev.id, done: fwd.icmp.type === 'unreach', unreach: fwd.icmp.type === 'unreach' });
        if (fwd.icmp.type === 'unreach') break;
        continue;
      }
    }
    out.push({ ttl, done: false });
    // stop early when the path is dead (no further progress possible)
    if (fwd.fail && fwd.fail.kind !== 'ttl' && out.slice(-3).every((x) => x.from === undefined) && ttl >= 3) {
      // keep printing timeouts up to a few lines, like IOS until aborted
      if (out.length >= maxTtl) break;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* IPv6                                                                */
/* ------------------------------------------------------------------ */

export interface Pkt6 {
  src: string;
  dst: string;
  hop: number;
  kind: 'echo' | 'echo-reply';
}

export interface Walk6 {
  ok: boolean;
  to?: { dev: string; ifName: string };
  pkt: Pkt6;
  hops: PacketHop[];
  fail?: { dev: string; kind: string; text: string };
  unreach?: boolean;
}

function v6addrsOf(net: Net, d: Derived, dev: Device, ifName: string): V6Addr[] {
  if (dev.t === 'host') return hostEffective6(net, d.l2, dev).addrs;
  return d.addrs6.get(ek(dev.id, ifName)) ?? [];
}

function owner6(net: Net, d: Derived, dev: Device, ip: bigint): string | null {
  const names = dev.t === 'host' ? [dev.hw.ifaces[0].name] : Object.keys(dev.st.cfg.ifaces);
  for (const n of names) {
    if (!ifUp(d, dev.id, n)) continue;
    if (v6addrsOf(net, d, dev, n).some((a) => parseV6(a.addr) === ip)) return n;
  }
  return null;
}

function resolve6(net: Net, d: Derived, dev: Device, ifName: string, nh: bigint): { dev: string; ifName: string } | null {
  if (typeOfName(ifName)?.name === 'Serial') {
    const peer = net.peerOf(dev.id, ifName);
    return peer && ifUp(d, peer.dev, peer.ifName) ? peer : null;
  }
  const fl = flood(net, d.l2, dev, ifName);
  for (const ep of fl.eps) {
    const edev = net.dev(ep.dev)!;
    if (edev.id === dev.id) continue;
    if (v6addrsOf(net, d, edev, ep.ifName).some((a) => parseV6(a.addr) === nh)) return { dev: ep.dev, ifName: ep.ifName };
  }
  return null;
}

export function forward6(net: Net, origin: Device, pkt0: Pkt6): Walk6 {
  const d = net.d;
  const w: Walk6 = { ok: false, pkt: { ...pkt0 }, hops: [] };
  let cur: Device = origin;
  let inIf: string | null = null;
  for (let step = 0; step < 40; step++) {
    const dst = parseV6(w.pkt.dst)!;
    const own = owner6(net, d, cur, dst);
    if (own) {
      w.ok = true;
      w.to = { dev: cur.id, ifName: inIf ?? own };
      w.hops.push({ device: cur.id, action: `Delivered to ${devName(cur)}`, ok: true });
      return w;
    }
    let egress: string;
    let nh: bigint;
    if (cur.t === 'host') {
      if (inIf !== null) return w;
      const e = hostEffective6(net, d.l2, cur);
      const nic = cur.hw.ifaces[0].name;
      const onLink = e.addrs.some((a) => v6InNet(dst, parseV6(a.addr)!, a.len));
      if (!w.pkt.src) w.pkt.src = e.addrs.find((a) => !a.linkLocal)?.addr ?? e.addrs[0]?.addr ?? '';
      if (onLink) nh = dst;
      else if (e.gw) nh = parseV6(e.gw)!;
      else {
        w.fail = { dev: cur.id, kind: 'nogw', text: `${devName(cur)} has no IPv6 default gateway` };
        return w;
      }
      egress = nic;
    } else {
      const dev = cur;
      if (inIf !== null) {
        if (!dev.st.cfg.v6Routing) {
          w.fail = { dev: dev.id, kind: 'norouting', text: `${devName(dev)} is not routing IPv6 (no ipv6 unicast-routing)` };
          w.hops.push({ device: dev.id, action: 'Dropped: IPv6 routing disabled', ok: false });
          return w;
        }
        if (w.pkt.hop <= 1) {
          w.fail = { dev: dev.id, kind: 'ttl', text: `hop limit expired at ${devName(dev)}` };
          return w;
        }
        w.pkt.hop--;
      }
      const r = lookup6(d.rib6.get(dev.id) ?? [], dst);
      if (!r) {
        w.fail = { dev: dev.id, kind: 'noroute', text: `${devName(dev)} has no IPv6 route to ${v6Str(dst).toUpperCase()}` };
        w.hops.push({ device: dev.id, action: `No IPv6 route to ${v6Str(dst).toUpperCase()}`, ok: false });
        w.unreach = inIf !== null;
        return w;
      }
      egress = r.ifName;
      nh = parseV6(r.nh)!;
      if (!w.pkt.src) {
        const src = (d.addrs6.get(ek(dev.id, egress)) ?? []).find((a) => !a.linkLocal);
        w.pkt.src = src?.addr ?? '';
      }
      w.hops.push({ device: dev.id, iface: shortIf(egress), action: `Routed (${r.route.code}) out ${shortIf(egress)}`, ok: true });
    }
    if (!ifUp(d, cur.id, egress)) {
      w.fail = { dev: cur.id, kind: 'down', text: `${devName(cur)} ${shortIf(egress)} is down` };
      return w;
    }
    const res = resolve6(net, d, cur, egress, nh);
    if (!res) {
      w.fail = { dev: cur.id, kind: 'nd', text: `${devName(cur)} cannot resolve ${v6Str(nh).toUpperCase()} (no neighbor advertisement)` };
      w.hops.push({ device: cur.id, action: `ND for ${v6Str(nh).toUpperCase()} failed`, ok: false });
      return w;
    }
    cur = net.dev(res.dev)!;
    inIf = res.ifName;
  }
  return w;
}

export function roundTrip6(net: Net, origin: Device, dst: string): { ok: boolean; symbol: '!' | '.' | 'U'; detail: string; fwd: Walk6; rep?: Walk6 } {
  const fwd = forward6(net, origin, { src: '', dst, hop: origin.t === 'ios' ? 64 : 128, kind: 'echo' });
  if (!fwd.ok) return { ok: false, symbol: fwd.unreach ? 'U' : '.', detail: fwd.fail?.text ?? 'no response', fwd };
  const dstDev = net.dev(fwd.to!.dev)!;
  const rep = forward6(net, dstDev, { src: fwd.pkt.dst, dst: fwd.pkt.src, hop: 64, kind: 'echo-reply' });
  if (!rep.ok || rep.to?.dev !== origin.id) return { ok: false, symbol: '.', detail: rep.fail?.text ?? 'reply lost', fwd, rep };
  return { ok: true, symbol: '!', detail: `Reply from ${dst}`, fwd, rep };
}

/* ------------------------------------------------------------------ */
/* misc                                                                */
/* ------------------------------------------------------------------ */

export function hostIp(d: Derived, dev: HostDevice): number | undefined {
  void d;
  return hostEffective(dev).ip;
}

export function sameSubnet(a: number, b: number, mask: number): boolean {
  return netOf(a, mask) === netOf(b, mask);
}

export function maskBits(mask: number): number {
  return maskLen(mask);
}

export { rangesHas };
