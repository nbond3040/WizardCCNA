/** DHCP: IOS server pools, relay (ip helper-address + giaddr), host/router clients, snooping. */
import type { Device, DhcpPool, IosDevice } from '../model/state';
import { ifDyn } from '../model/state';
import { inNet, ipStr, netOf, bcastOf, maskLen } from '../util/ip';
import { parseIp } from '../util/ip';
import { hash32 } from '../util/mac';
import { rangesHas } from '../util/format';
import { ifMac } from './topo';
import { ek, type Net } from './net';
import { flood } from './l2';
import { hostEffective } from './l3';
import { forward4 } from './packet';

export interface Lease {
  ip: number;
  mask: number;
  gw?: number;
  dns?: number;
  server: number;
  domain?: string;
  leaseSec: number;
}

export type DhcpResult = { ok: true; lease: Lease; via: string } | { ok: false; reason: string };

function leaseSeconds(p: DhcpPool): number {
  if (p.lease === 'infinite') return 0;
  const [dd, hh, mm] = p.lease ?? [1, 0, 0];
  return dd * 86400 + hh * 3600 + mm * 60;
}

/** Addresses currently configured anywhere in the network (for conflict detection). */
function addressesInUse(net: Net): Set<number> {
  const used = new Set<number>();
  const d = net.d;
  for (const list of d.addrs.values()) for (const a of list) used.add(a.ip);
  for (const dev of net.allDevices()) {
    if (dev.t !== 'host') continue;
    if (!dev.st.cfg.dhcp && dev.st.cfg.ip) {
      const ip = parseIp(dev.st.cfg.ip);
      if (ip !== null) used.add(ip);
    }
    if (dev.kind === 'cloud' && dev.cloudIp !== undefined) used.add(dev.cloudIp);
  }
  return used;
}

function allocate(net: Net, server: IosDevice, pool: DhcpPool, mac: string): number | null {
  if (pool.net === undefined || pool.mask === undefined) return null;
  const dyn = server.st.dyn;
  const existing = Object.values(dyn.dhcpBind).find((b) => b.mac === mac && b.pool === pool.name);
  if (existing) return existing.ip;
  const used = addressesInUse(net);
  const first = netOf(pool.net, pool.mask) + 1;
  const last = bcastOf(pool.net, pool.mask) - 1;
  for (let ip = first; ip <= last; ip++) {
    const a = ip >>> 0;
    if (server.st.cfg.dhcpExcl.some(([lo, hi]) => a >= lo && a <= hi)) continue;
    if (dyn.dhcpBind[String(a)]) continue;
    if (dyn.dhcpConflicts[String(a)]) continue;
    if (used.has(a)) {
      dyn.dhcpConflicts[String(a)] = { t: net.clock };
      continue;
    }
    return a;
  }
  return null;
}

function poolFor(server: IosDevice, addr: number): DhcpPool | undefined {
  return Object.values(server.st.cfg.dhcpPools).find((p) => p.net !== undefined && p.mask !== undefined && inNet(addr, p.net, p.mask));
}

function bind(net: Net, server: IosDevice, pool: DhcpPool, ip: number, mac: string): Lease {
  const secs = leaseSeconds(pool);
  server.st.dyn.dhcpBind[String(ip)] = {
    ip,
    mac,
    clientId: '01' + mac,
    expires: secs ? net.now() + secs * 1000 : null,
    pool: pool.name,
  };
  return { ip, mask: pool.mask!, gw: pool.gw[0], dns: pool.dns[0], server: 0, domain: pool.domain, leaseSec: secs || 86400 * 365 };
}

/** Host-based DHCP server (ServerServices.dhcp). */
function hostServer(net: Net, dev: Device, giaddr: number | null, mac: string): Lease | null {
  if (dev.t !== 'host' || !dev.services?.dhcp) return null;
  const s = dev.services.dhcp;
  const netAddr = parseIp(s.network);
  const mask = parseIp(s.mask);
  const start = parseIp(s.start);
  if (netAddr === null || mask === null || start === null) return null;
  const scopeAddr = giaddr ?? hostEffective(dev).ip;
  if (scopeAddr === undefined || !inNet(scopeAddr, netAddr, mask)) return null;
  const used = addressesInUse(net);
  const leases = (dev.st as { dhcpLeases?: Record<string, string> }).dhcpLeases ?? {};
  (dev.st as { dhcpLeases?: Record<string, string> }).dhcpLeases = leases;
  const mine = Object.entries(leases).find(([, m]) => m === mac);
  let ip: number | undefined = mine ? Number(mine[0]) : undefined;
  if (ip === undefined) {
    for (let i = 0; i < s.max; i++) {
      const a = (start + i) >>> 0;
      if (leases[String(a)] || used.has(a)) continue;
      ip = a;
      break;
    }
  }
  if (ip === undefined) return null;
  leases[String(ip)] = mac;
  return { ip, mask, gw: parseIp(s.gateway) ?? undefined, dns: s.dns ? parseIp(s.dns) ?? undefined : undefined, server: hostEffective(dev).ip ?? 0, leaseSec: 86400 };
}

/**
 * Run a DORA exchange for a client interface. Returns the lease or the reason it failed.
 */
export function dhcpExchange(net: Net, client: Device, clientIf: string): DhcpResult {
  const d = net.d;
  const mac = ifMac(client, clientIf);
  const st = d.l2.ifs.get(ek(client.id, clientIf));
  if (!st || st.line !== 'up' || st.proto !== 'up') return { ok: false, reason: 'interface is down' };
  const disc = flood(net, d.l2, client, clientIf, {
    srcMac: mac,
    dhcpClient: true,
    onIngress: (sw, port, vlan) => {
      sw.st.dyn.mac[`${vlan}|${mac}`] = { port, t: net.clock };
      return true;
    },
  });
  const reasons: string[] = [...disc.drops.filter((x) => x.includes('snooping'))];
  for (const ep of disc.eps) {
    const sdev = net.dev(ep.dev)!;
    if (sdev.id === client.id) continue;
    if (sdev.t === 'host') {
      const l = hostServer(net, sdev, null, mac);
      if (l) {
        const back = flood(net, d.l2, sdev, ep.ifName, { dhcpServer: true });
        if (back.eps.some((e) => e.dev === client.id)) return { ok: true, lease: l, via: sdev.id };
        reasons.push(...back.drops);
      }
      continue;
    }
    const cfg = sdev.st.cfg;
    const ifc = cfg.ifaces[ep.ifName];
    const a = d.addrs.get(ek(sdev.id, ep.ifName))?.[0];
    if (!a || !ifc) continue;
    const trusted = cfg.relayTrustAll || ifc.extra.includes('ip dhcp relay information trusted');
    // local server
    const pool = !cfg.noServiceDhcp ? poolFor(sdev, a.ip) : undefined;
    if (pool) {
      if (disc.opt82 && !trusted) {
        reasons.push(`${cfg.hostname} dropped DISCOVER with option 82 and giaddr 0.0.0.0 (untrusted relay information)`);
        continue;
      }
      const ip = allocate(net, sdev, pool, mac);
      if (ip === null) {
        reasons.push(`pool ${pool.name} on ${cfg.hostname} has no free addresses`);
        continue;
      }
      const back = flood(net, d.l2, sdev, ep.ifName, { dhcpServer: true });
      if (!back.eps.some((e) => e.dev === client.id)) {
        reasons.push(...(back.drops.length ? back.drops : [`OFFER from ${cfg.hostname} did not reach the client`]));
        continue;
      }
      const lease = bind(net, sdev, pool, ip, mac);
      lease.server = a.ip;
      recordSnoop(net, disc.eps.find((e) => e.dev === sdev.id)?.hops ?? [], mac, lease);
      return { ok: true, lease, via: `${cfg.hostname} pool ${pool.name}` };
    }
    // relay
    if (ifc.helpers.length) {
      if (disc.opt82 && !trusted) {
        reasons.push(`relay ${cfg.hostname} dropped DISCOVER with option 82 (untrusted)`);
        continue;
      }
      for (const helper of ifc.helpers) {
        const req = forward4(net, sdev, { src: a.ip, dst: helper, proto: 'udp', sport: 67, dport: 67, ttl: 255, size: 300 });
        if (!req.ok) {
          reasons.push(`relay ${cfg.hostname} → ${ipStr(helper)}: ${req.fail?.text ?? 'unreachable'}`);
          continue;
        }
        const server = net.dev(req.to!.dev)!;
        let lease: Lease | null = null;
        if (server.t === 'ios') {
          if (server.st.cfg.noServiceDhcp) continue;
          const p2 = poolFor(server, a.ip);
          if (!p2) {
            reasons.push(`${server.st.cfg.hostname} has no DHCP pool for giaddr ${ipStr(a.ip)}`);
            continue;
          }
          const ip = allocate(net, server, p2, mac);
          if (ip === null) {
            reasons.push(`pool ${p2.name} exhausted`);
            continue;
          }
          lease = bind(net, server, p2, ip, mac);
          lease.server = helper;
        } else lease = hostServer(net, server, a.ip, mac);
        if (!lease) {
          reasons.push(`${server.id} did not offer an address`);
          continue;
        }
        const rep = forward4(net, server, { src: req.pkt.dst, dst: a.ip, proto: 'udp', sport: 67, dport: 67, ttl: 255, size: 300 });
        if (!rep.ok || rep.to?.dev !== sdev.id) {
          reasons.push(`reply from DHCP server ${ipStr(helper)} to relay ${ipStr(a.ip)} failed: ${rep.fail?.text ?? 'lost'}`);
          if (server.t === 'ios') delete server.st.dyn.dhcpBind[String(lease.ip)];
          continue;
        }
        const back = flood(net, d.l2, sdev, ep.ifName, { dhcpServer: true });
        if (!back.eps.some((e) => e.dev === client.id)) {
          reasons.push(...(back.drops.length ? back.drops : ['OFFER did not reach the client']));
          continue;
        }
        recordSnoop(net, disc.eps.find((e) => e.dev === sdev.id)?.hops ?? [], mac, lease);
        return { ok: true, lease, via: `relay ${cfg.hostname} → ${ipStr(helper)}` };
      }
    }
  }
  return { ok: false, reason: reasons.length ? reasons.join('; ') : 'no DHCP server answered' };
}

function recordSnoop(net: Net, hops: { dev: string; vlan: number; inPort: string | null }[], mac: string, lease: Lease): void {
  for (const h of hops) {
    const sw = net.ios(h.dev);
    if (!sw || !sw.st.cfg.snoop || !rangesHas(sw.st.cfg.snoopVlans, h.vlan) || !h.inPort) continue;
    const c = sw.st.cfg.ifaces[h.inPort];
    if (c?.snoopTrust) continue;
    sw.st.dyn.snoopBind = sw.st.dyn.snoopBind.filter((b) => b.mac !== mac);
    sw.st.dyn.snoopBind.push({ mac, ip: lease.ip, lease: lease.leaseSec, vlan: h.vlan, ifName: h.inPort });
  }
}

/** Try to obtain leases for all DHCP clients that have none. Returns true when anything changed. */
export function retryDhcpClients(net: Net): boolean {
  let changed = false;
  for (const dev of net.allDevices()) {
    if (dev.t === 'host') {
      if (dev.kind !== 'host' || !dev.st.cfg.dhcp || dev.st.lease || dev.st.dhcpReleased) continue;
      const r = dhcpExchange(net, dev, dev.hw.ifaces[0].name);
      if (r.ok) {
        dev.st.lease = { ip: r.lease.ip, mask: r.lease.mask, gw: r.lease.gw, dns: r.lease.dns, server: r.lease.server, t: net.now(), expires: net.now() + r.lease.leaseSec * 1000 };
        dev.st.apipa = undefined;
        changed = true;
      } else if (!dev.st.apipa) {
        const h = hash32(dev.id + dev.mac);
        dev.st.apipa = ((169 << 24) | (254 << 16) | ((1 + (h % 254)) << 8) | (1 + ((h >>> 8) % 254))) >>> 0;
        changed = true;
      }
      continue;
    }
    for (const [name, c] of Object.entries(dev.st.cfg.ifaces)) {
      if (!c.dhcp || c.shutdown) continue;
      const dd = ifDyn(dev, name);
      if (dd.lease) continue;
      const r = dhcpExchange(net, dev, name);
      if (r.ok) {
        dd.lease = { ip: r.lease.ip, mask: r.lease.mask, gw: r.lease.gw, dns: r.lease.dns, server: r.lease.server, t: net.now() };
        net.log(dev.id, `%DHCP-6-ADDRESS_ASSIGN: Interface ${name} assigned DHCP address ${ipStr(r.lease.ip)}, mask ${ipStr(r.lease.mask)}, hostname ${dev.st.cfg.hostname}`);
        changed = true;
      }
    }
  }
  return changed;
}

export function releaseHost(net: Net, dev: Device): void {
  if (dev.t !== 'host' || !dev.st.lease) return;
  const ip = dev.st.lease.ip;
  for (const s of net.iosDevices()) {
    const b = s.st.dyn.dhcpBind[String(ip)];
    if (b && b.mac === ifMac(dev, dev.hw.ifaces[0].name)) delete s.st.dyn.dhcpBind[String(ip)];
  }
  dev.st.lease = null;
}

export function maskOk(mask: number): boolean {
  return maskLen(mask) >= 0;
}
